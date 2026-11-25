import hashlib
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from courses.models import (
    Course,
    InstructorSolution,
    InstructorSolutionSection,
    PastPaper,
    PastPaperMaterial,
)

from .validators import validate_manifest

MATERIAL_LABELS = {
    "question_paper": "Question paper",
    "mark_scheme": "Mark scheme",
    "examiner_report": "Examiner report",
    "insert": "Insert",
    "source_files": "Practical source files",
    "confidential": "Confidential instructions",
    "worked_output": "Worked reference output",
    "supporting": "Supporting material",
}


def _file_checksum(path):
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _sync_materials(past_paper, manifest):
    if not manifest.source_verified:
        return
    import_root = (Path(settings.BASE_DIR) / "private_pastpaper_imports").resolve()
    for material_type, relative_path in manifest.materials.items():
        if not relative_path:
            continue
        if material_type not in MATERIAL_LABELS:
            raise ValueError(f"Unsupported material type: {material_type}")
        source_path = (import_root / relative_path).resolve()
        if import_root not in source_path.parents:
            raise ValueError("Material path must stay inside private_pastpaper_imports.")
        if not source_path.is_file():
            raise ValueError(f"Authorised material not found: {relative_path}")
        checksum = _file_checksum(source_path)
        material, _ = PastPaperMaterial.objects.get_or_create(
            past_paper=past_paper,
            material_type=material_type,
            defaults={"title": MATERIAL_LABELS[material_type]},
        )
        if material.checksum == checksum and material.file:
            continue
        if material.file:
            material.file.delete(save=False)
        with source_path.open("rb") as source_file:
            material.file.save(source_path.name, File(source_file), save=False)
        material.title = MATERIAL_LABELS[material_type]
        material.original_filename = source_path.name
        material.checksum = checksum
        material.is_authorised = True
        material.instructor_only = True
        material.save()


@transaction.atomic
def seed_manifest(manifest, *, include_planned=False, publish=False):
    errors = validate_manifest(manifest)
    if errors:
        raise ValueError("; ".join(errors))
    if (
        not include_planned
        and not manifest.source_verified
        and manifest.status in {"planned", "source_required", "future", "not_available"}
    ):
        return None, False

    course, _ = Course.objects.update_or_create(
        slug=slugify(manifest.course_title),
        defaults={
            "title": manifest.course_title,
            "subtitle": (
                f"Carefully worked solutions for component "
                f"{manifest.syllabus_code}/{manifest.component_code}."
            ),
            "description": (
                "Question-by-question instructor solutions, mark-scheme alignment, "
                "examiner guidance, and common-error analysis."
            ),
            "category": "Cambridge Past Papers",
            "level": "advanced" if manifest.paper in {3, 4} else "intermediate",
            "language": "English",
            "is_published": bool(
                publish
                and manifest.source_verified
                and manifest.status in {"ready", "published"}
            ),
        },
    )
    past_paper, created = PastPaper.objects.update_or_create(
        seed_key=manifest.seed_key,
        defaults={
            "course": course,
            "board": manifest.board,
            "qualification": manifest.qualification,
            "subject": manifest.subject,
            "syllabus_code": manifest.syllabus_code,
            "syllabus_era": manifest.syllabus_era,
            "exam_year": manifest.year,
            "exam_series": manifest.series,
            "paper_number": manifest.paper,
            "variant": manifest.variant,
            "component_code": manifest.component_code,
            "level": manifest.level,
            "status": manifest.status,
            "source_verified": manifest.source_verified,
            "question_structure": manifest.questions,
            "last_seeded_at": timezone.now(),
        },
    )
    _sync_materials(past_paper, manifest)
    return past_paper, created


@transaction.atomic
def prepare_solution(past_paper, *, user=None, replace_empty=False):
    title = f"Instructor solution - {past_paper}"
    solution, _ = InstructorSolution.objects.get_or_create(
        past_paper=past_paper,
        defaults={
            "title": title,
            "created_by": user,
            "total_marks": sum(
                int(question.get("marks", 0))
                for question in past_paper.question_structure
            ),
        },
    )
    for order, question in enumerate(past_paper.question_structure, start=1):
        path = str(question["path"])
        section, created = InstructorSolutionSection.objects.get_or_create(
            solution=solution,
            question_path=path,
            defaults={
                "question_number": path.split("(")[0],
                "question_summary": question.get("summary", ""),
                "maximum_marks": int(question.get("marks", 0)),
                "order": order,
            },
        )
        if replace_empty and not section.worked_solution_markdown.strip():
            section.question_summary = question.get("summary", "")
            section.maximum_marks = int(question.get("marks", 0))
            section.order = order
            section.save(
                update_fields=["question_summary", "maximum_marks", "order"]
            )
    return solution
