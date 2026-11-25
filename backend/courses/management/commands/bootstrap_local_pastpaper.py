"""Attach Cambridge past papers from S3 and generate textbook-grounded solutions."""

from __future__ import annotations

import re
from collections import defaultdict

import boto3
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils.text import slugify

from courses.models import (
    Course,
    InstructorSolution,
    InstructorSolutionSection,
    PastPaper,
    PastPaperMaterial,
)
from courses.pastpapers.seed_engine import prepare_solution
from courses.pastpapers.solution_script_generator import (
    PaperExtractionError,
    build_script_sections,
    extract_pdf,
)


SERIES_MAP = {
    "s": ("june", "May/June"),
    "m": ("march", "February/March"),
    "w": ("november", "October/November"),
}

FILENAME_RE = re.compile(
    r"(?i)9626_(?P<series>[smw])(?P<yy>\d{2})_(?P<kind>qp|ms)_0?(?P<comp>\d+)\.pdf$"
)

# Cambridge mark schemes: "1 One mark...", "1(a) One from:", "2 Four from:", "9 Max six..."
MS_QUESTION_RE = re.compile(
    r"(?m)^(?:Question\s+Answer\s+Marks\s*)?(\d+(?:\([a-z]\))?)\s+"
    r"(One mark|Two marks|Three marks|Four marks|Five marks|Six marks|"
    r"Max\s+\d+\s+marks|Max\s+\w+|MUST|Error|"
    r"(?:One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)\s+from)",
    re.IGNORECASE,
)
MARKS_PHRASE_RE = re.compile(
    r"(?:maximum of|max(?:imum)?)\s+(\d+)\s+marks?|\[(\d{1,2})\]",
    re.IGNORECASE,
)
TRAILING_MARKS_RE = re.compile(r"(?m)\s(\d{1,2})\s*$")


def _normalize_path(raw: str) -> str:
    parts = re.findall(r"\d+|[a-z]+", raw.lower())
    if not parts:
        return raw.strip()
    path = parts[0]
    for token in parts[1:]:
        path += f"({token})"
    return path


def _marks_from_window(window: str) -> int:
    phrase = MARKS_PHRASE_RE.search(window)
    if phrase:
        return int(phrase.group(1) or phrase.group(2))
    trailing = TRAILING_MARKS_RE.search(window[:400])
    if trailing:
        value = int(trailing.group(1))
        if 1 <= value <= 20:
            return value
    return 1


def infer_question_structure(question_text: str, mark_scheme_text: str) -> list[dict]:
    """Build numbered question paths primarily from the official mark scheme."""
    found = []
    seen = set()
    matches = list(MS_QUESTION_RE.finditer(mark_scheme_text))
    for index, match in enumerate(matches):
        path = _normalize_path(match.group(1))
        if path in seen:
            continue
        if path.isdigit() and int(path) > 40:
            continue
        seen.add(path)
        end = matches[index + 1].start() if index + 1 < len(matches) else match.end() + 500
        window = mark_scheme_text[match.start() : end]
        marks = _marks_from_window(window)
        summary = re.sub(r"\s+", " ", window).strip()[:140]
        found.append({"path": path, "marks": marks, "summary": summary})

    def sort_key(item):
        tokens = re.findall(r"\d+|[a-z]+", item["path"])
        key = []
        for token in tokens:
            key.append((0, int(token)) if token.isdigit() else (1, token))
        return key

    found.sort(key=sort_key)
    return found[:40]


def _attach_existing_s3_file(material: PastPaperMaterial, key: str, filename: str):
    """Point FileField at an object that already exists in the media bucket."""
    material.file.name = key
    material.original_filename = filename
    material.is_authorised = True
    material.instructor_only = True
    material.save(
        update_fields=[
            "file",
            "original_filename",
            "is_authorised",
            "instructor_only",
            "title",
        ]
    )


def _paper_meta_from_component(series_code: str, yy: str, component: str) -> dict:
    series_key, series_label = SERIES_MAP[series_code.lower()]
    year = 2000 + int(yy)
    comp = int(component)
    if comp < 10:
        paper_number = comp
        variant = 1
        component_code = str(comp)
    else:
        paper_number = comp // 10
        variant = comp % 10 or 1
        component_code = f"{comp:02d}" if comp < 100 else str(comp)
    seed_key = (
        f"cambridge:as_a_level:9626:{year}:{series_key}:{paper_number}:{variant}"
    )
    level = "A Level" if paper_number >= 3 else "AS Level"
    title = (
        f"Information Technology 9626 - {series_label} {year} "
        f"Paper {paper_number} Variant {variant} Solutions"
    )
    return {
        "seed_key": seed_key,
        "title": title,
        "year": year,
        "series": series_key,
        "series_label": series_label,
        "paper": paper_number,
        "variant": variant,
        "component_code": component_code,
        "level": level,
    }


def discover_s3_paper_pairs(prefix: str = "past_papers/") -> list[dict]:
    """Find complete QP+MS pairs already uploaded to the media bucket."""
    bucket = getattr(settings, "AWS_STORAGE_BUCKET_NAME", None)
    if not bucket or bucket == "your-bucket-name":
        raise CommandError("AWS_STORAGE_BUCKET_NAME is not configured.")

    client_kwargs = {
        "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
        "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
        "region_name": settings.AWS_S3_REGION_NAME,
    }
    endpoint = getattr(settings, "AWS_S3_ENDPOINT_URL", None)
    if endpoint:
        client_kwargs["endpoint_url"] = endpoint
    s3 = boto3.client("s3", **client_kwargs)

    grouped = defaultdict(dict)
    paginator = s3.get_paginator("list_objects_v2")
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        for obj in page.get("Contents") or []:
            key = obj["Key"]
            filename = key.rsplit("/", 1)[-1]
            match = FILENAME_RE.search(filename)
            if not match:
                continue
            identity = (
                match.group("series").lower(),
                match.group("yy"),
                str(int(match.group("comp"))),
            )
            grouped[identity][match.group("kind").lower()] = {
                "key": key,
                "filename": filename,
            }

    papers = []
    for (series_code, yy, comp), files in sorted(grouped.items()):
        if "qp" not in files or "ms" not in files:
            continue
        meta = _paper_meta_from_component(series_code, yy, comp)
        meta["question_paper"] = files["qp"]["key"]
        meta["mark_scheme"] = files["ms"]["key"]
        meta["qp_filename"] = files["qp"]["filename"]
        meta["ms_filename"] = files["ms"]["filename"]
        papers.append(meta)
    return papers


def _ensure_instructor():
    user_model = get_user_model()
    instructor, _ = user_model.objects.get_or_create(
        username="local-instructor",
        defaults={"email": "instructor@localhost", "is_staff": True},
    )
    if not instructor.has_usable_password():
        instructor.set_password("instructor")
        instructor.save(update_fields=["password"])
    group, _ = Group.objects.get_or_create(name="Instructors")
    instructor.groups.add(group)
    return instructor


def bootstrap_one_paper(meta: dict, *, replace: bool, approve: bool, stdout, style):
    instructor = _ensure_instructor()
    slug = slugify(meta["title"])[:200]
    course, _ = Course.objects.update_or_create(
        slug=slug,
        defaults={
            "title": meta["title"],
            "subtitle": (
                f"Carefully worked solutions for component "
                f"9626/{meta['component_code']}."
            ),
            "description": (
                "Question-by-question instructor solutions, mark-scheme alignment, "
                "examiner guidance, and Cambridge textbook references."
            ),
            "category": "Cambridge Past Papers",
            "level": "intermediate",
            "language": "English",
            "price_ugx": 0,
            "is_published": True,
            "assigned_instructor": instructor,
            "what_you_learn": [
                "Open the official question paper and mark scheme",
                "Follow mark-scheme aligned step-by-step worked solutions",
                "Use licensed Cambridge textbook extracts linked to each question",
            ],
        },
    )

    paper, _ = PastPaper.objects.update_or_create(
        seed_key=meta["seed_key"],
        defaults={
            "course": course,
            "board": "cambridge",
            "qualification": "as_a_level",
            "subject": "Information Technology",
            "syllabus_code": "9626",
            "syllabus_era": "2025-2027" if meta["year"] >= 2025 else "2022-2024",
            "exam_year": meta["year"],
            "exam_series": meta["series"],
            "paper_number": meta["paper"],
            "variant": meta["variant"],
            "component_code": meta["component_code"],
            "level": meta["level"],
            "status": "ready",
            "source_verified": True,
            "question_structure": [],
        },
    )

    for material_type, key, filename, title in (
        (
            "question_paper",
            meta["question_paper"],
            meta["qp_filename"],
            "Question paper",
        ),
        (
            "mark_scheme",
            meta["mark_scheme"],
            meta["ms_filename"],
            "Mark scheme",
        ),
    ):
        material, _ = PastPaperMaterial.objects.get_or_create(
            past_paper=paper,
            material_type=material_type,
            defaults={"title": title},
        )
        material.title = title
        _attach_existing_s3_file(material, key, filename)

    materials = {
        item.material_type: item
        for item in paper.materials.filter(
            material_type__in=["question_paper", "mark_scheme"],
            is_authorised=True,
        )
        if item.file
    }
    if "question_paper" not in materials or "mark_scheme" not in materials:
        raise CommandError("Could not attach both QP and mark scheme from S3.")

    question_document = extract_pdf(materials["question_paper"].file)
    mark_document = extract_pdf(materials["mark_scheme"].file)

    structure = [] if replace else (paper.question_structure or [])
    if len(structure) < 2:
        structure = infer_question_structure(
            question_document.text, mark_document.text
        )
        if len(structure) < 2:
            raise CommandError(
                "Could not infer enough numbered questions from the real PDFs."
            )
        paper.question_structure = structure
        paper.save(update_fields=["question_structure"])

    solution = prepare_solution(paper, user=instructor, replace_empty=True)
    valid_paths = {str(item["path"]) for item in paper.question_structure}
    solution.sections.exclude(question_path__in=valid_paths).delete()

    scripts, issues = build_script_sections(
        question_document.text,
        mark_document.text,
        paper.question_structure,
    )
    generated = {item.question_path: item for item in scripts}
    for section in solution.sections.all():
        draft = generated.get(section.question_path)
        if not draft:
            continue
        if section.worked_solution_markdown.strip() and not replace:
            continue
        section.question_summary = draft.question_excerpt[:2000]
        section.mark_scheme_reference = draft.mark_scheme_excerpt
        section.worked_solution_markdown = draft.markdown
        section.confidence = InstructorSolutionSection.Confidence.NEEDS_REVIEW
        section.is_complete = False
        section.save()

    solution.status = InstructorSolution.Status.UNDER_REVIEW
    solution.overview_markdown = (
        "# Cambridge text solutions\n\n"
        "Each question below combines the official mark scheme with Cambridge "
        "AS & A Level Information Technology (9626) syllabus/book explanations "
        "so learners can see *why* each point scores. Review before publishing."
    )
    solution.created_by = instructor
    solution.total_marks = sum(
        int(item.get("marks", 0) or 0) for item in paper.question_structure
    )
    solution.save()

    if approve:
        for section in solution.sections.all():
            if not section.worked_solution_markdown.strip():
                continue
            section.is_complete = True
            section.confidence = InstructorSolutionSection.Confidence.VERIFIED
            section.save(update_fields=["is_complete", "confidence", "updated_at"])
        solution.status = InstructorSolution.Status.APPROVED
        solution.reviewed_by = instructor
        solution.save(update_fields=["status", "reviewed_by", "updated_at"])

    stdout.write(style.SUCCESS(f"Ready: {paper.seed_key}"))
    stdout.write(f"  course: /courses/{course.slug}/paper")
    stdout.write(
        f"  pages qp/ms: {question_document.readable_pages}/{question_document.pages}"
        f" · {mark_document.readable_pages}/{mark_document.pages}"
    )
    stdout.write(
        f"  questions: {len(paper.question_structure)} · aligned: {len(scripts)}"
        f" · issues: {len(issues)} · status: {solution.status}"
    )
    return {
        "seed_key": paper.seed_key,
        "slug": course.slug,
        "aligned": len(scripts),
        "issues": len(issues),
        "status": solution.status,
    }


class Command(BaseCommand):
    help = (
        "Discover authorised Cambridge QP/MS PDFs in S3, attach them locally, "
        "and generate textbook-grounded instructor text solutions."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--seed-key",
            help="Process one known seed key (must match a discovered S3 pair).",
        )
        parser.add_argument(
            "--all",
            action="store_true",
            help="Process every complete QP+MS pair found under past_papers/ in S3.",
        )
        parser.add_argument(
            "--paper",
            type=int,
            help="Only process this paper number (e.g. 1 for theory).",
        )
        parser.add_argument(
            "--year",
            type=int,
            help="Only process this exam year.",
        )
        parser.add_argument(
            "--series",
            choices=["june", "march", "november"],
            help="Only process this exam series.",
        )
        parser.add_argument("--replace", action="store_true")
        parser.add_argument(
            "--approve",
            action="store_true",
            help="Mark generated sections verified/complete and approve for learner view.",
        )
        parser.add_argument(
            "--remove-demo",
            action="store_true",
            help="Delete the synthetic local-demo past paper course if present.",
        )
        parser.add_argument(
            "--list-only",
            action="store_true",
            help="List discoverable S3 QP/MS pairs without generating solutions.",
        )

    def handle(self, *args, **options):
        if options["remove_demo"]:
            deleted, _ = Course.objects.filter(
                slug__startswith="local-demo-information-technology-9626"
            ).delete()
            self.stdout.write(f"Removed synthetic demo course rows: {deleted}")

        try:
            discovered = discover_s3_paper_pairs()
        except Exception as error:
            raise CommandError(
                f"Unable to list S3 past papers ({type(error).__name__}: {error})."
            ) from error

        if not discovered:
            raise CommandError("No complete 9626 QP/MS pairs were found in S3.")

        selected = discovered
        if options["seed_key"]:
            selected = [item for item in discovered if item["seed_key"] == options["seed_key"]]
            if not selected:
                known = ", ".join(item["seed_key"] for item in discovered[:12])
                raise CommandError(
                    f"Seed key not found among S3 pairs. Examples: {known}"
                )
        if options["paper"]:
            selected = [item for item in selected if item["paper"] == options["paper"]]
        if options["year"]:
            selected = [item for item in selected if item["year"] == options["year"]]
        if options["series"]:
            selected = [item for item in selected if item["series"] == options["series"]]

        if not options["all"] and not options["seed_key"] and not options["list_only"]:
            # Default to the latest June Paper 1 Variant 1 if present.
            preferred = [
                item
                for item in selected
                if item["series"] == "june"
                and item["paper"] == 1
                and item["variant"] == 1
            ]
            preferred.sort(key=lambda item: item["year"], reverse=True)
            selected = preferred[:1] or selected[:1]

        if options["list_only"]:
            self.stdout.write(f"Discoverable S3 pairs: {len(selected)}")
            for item in selected:
                self.stdout.write(
                    f"  {item['seed_key']}  qp={item['qp_filename']}  ms={item['ms_filename']}"
                )
            return

        if not selected:
            raise CommandError("No S3 pairs matched the selected filters.")

        ok = 0
        failed = []
        for meta in selected:
            try:
                with transaction.atomic():
                    bootstrap_one_paper(
                        meta,
                        replace=options["replace"],
                        approve=options["approve"],
                        stdout=self.stdout,
                        style=self.style,
                    )
                ok += 1
            except Exception as error:
                failed.append((meta["seed_key"], str(error)))
                self.stdout.write(
                    self.style.ERROR(f"Failed: {meta['seed_key']} ({error})")
                )

        self.stdout.write(self.style.SUCCESS(f"Completed {ok}/{len(selected)} papers."))
        if failed:
            self.stdout.write(self.style.WARNING(f"{len(failed)} failed:"))
            for seed_key, error in failed[:30]:
                self.stdout.write(f"  - {seed_key}: {error}")
        self.stdout.write("Instructor login: local-instructor / instructor")
