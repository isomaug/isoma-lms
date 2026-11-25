from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from courses.models import (
    InstructorSolution,
    PastPaper,
    PastPaperMaterial,
)
from courses.pastpapers.seed_engine import prepare_solution
from courses.pastpapers.solution_script_generator import (
    PaperExtractionError,
    build_script_sections,
    extract_pdf,
)


class Command(BaseCommand):
    help = (
        "Creates an instructor-review video script by aligning a question paper "
        "with its official mark scheme."
    )

    def add_arguments(self, parser):
        parser.add_argument("--seed-key", required=True)
        parser.add_argument("--instructor")
        parser.add_argument("--replace", action="store_true")
        parser.add_argument("--allow-partial", action="store_true")
        parser.add_argument("--dry-run", action="store_true")
        parser.add_argument("--output")

    def handle(self, *args, **options):
        paper = (
            PastPaper.objects.select_related("course")
            .prefetch_related("materials")
            .filter(seed_key=options["seed_key"], source_verified=True)
            .first()
        )
        if not paper:
            raise CommandError("A verified past paper with that seed key was not found.")

        materials = {
            item.material_type: item
            for item in paper.materials.filter(
                material_type__in=[
                    PastPaperMaterial.MaterialType.QUESTION_PAPER,
                    PastPaperMaterial.MaterialType.MARK_SCHEME,
                ],
                is_authorised=True,
            )
            if item.file
        }
        missing = [
            label
            for label in ("question_paper", "mark_scheme")
            if label not in materials
        ]
        if missing:
            raise CommandError(
                "Required authorised material is missing: " + ", ".join(missing)
            )

        instructor = None
        if options["instructor"]:
            instructor = get_user_model().objects.filter(
                username=options["instructor"]
            ).first()
            if not instructor:
                raise CommandError("Instructor username was not found.")

        try:
            question_document = extract_pdf(materials["question_paper"].file)
            mark_document = extract_pdf(materials["mark_scheme"].file)
            scripts, issues = build_script_sections(
                question_document.text,
                mark_document.text,
                paper.question_structure,
            )
        except PaperExtractionError as error:
            raise CommandError(str(error)) from error

        if issues and not options["allow_partial"]:
            detail = "\n".join(f"- {issue}" for issue in issues)
            raise CommandError(
                "Generation stopped because alignment needs attention:\n" + detail
            )
        if not scripts:
            raise CommandError("No question/mark-scheme sections could be aligned.")

        combined = "\n\n".join(section.markdown for section in scripts)
        report = (
            f"Question paper: {question_document.readable_pages}/"
            f"{question_document.pages} readable pages\n"
            f"Mark scheme: {mark_document.readable_pages}/"
            f"{mark_document.pages} readable pages\n"
            f"Aligned sections: {len(scripts)}\n"
            f"Issues: {len(issues)}"
        )
        if options["dry_run"]:
            self.stdout.write(report)
            for issue in issues:
                self.stdout.write(self.style.WARNING(issue))
            return

        with transaction.atomic():
            solution = prepare_solution(paper, user=instructor)
            by_path = {section.question_path: section for section in scripts}
            for section in solution.sections.all():
                generated = by_path.get(section.question_path)
                if not generated:
                    continue
                if section.worked_solution_markdown.strip() and not options["replace"]:
                    continue
                section.question_summary = generated.question_excerpt[:2000]
                section.mark_scheme_reference = generated.mark_scheme_excerpt
                section.worked_solution_markdown = generated.markdown
                section.confidence = section.Confidence.NEEDS_REVIEW
                section.is_complete = False
                section.save(
                    update_fields=[
                        "question_summary",
                        "mark_scheme_reference",
                        "worked_solution_markdown",
                        "confidence",
                        "is_complete",
                        "updated_at",
                    ]
                )
            solution.status = InstructorSolution.Status.UNDER_REVIEW
            solution.overview_markdown = (
                "# Instructor video script\n\n"
                "Generated from the paired question paper and mark scheme. "
                "Every section requires instructor verification before approval.\n\n"
                f"```\n{report}\n```"
            )
            solution.save(update_fields=["status", "overview_markdown", "updated_at"])

        if options["output"]:
            output_path = Path(options["output"]).resolve()
            output_path.parent.mkdir(parents=True, exist_ok=True)
            output_path.write_text(combined, encoding="utf-8")

        self.stdout.write(self.style.SUCCESS(report))
        for issue in issues:
            self.stdout.write(self.style.WARNING(issue))
