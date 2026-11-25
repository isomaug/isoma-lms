"""Apply Stage 1 Term 1 spoken texts to the database."""

from django.core.management.base import BaseCommand
from django.db import transaction

from courses.management.commands.stage1_term1_spoken import STAGE1_TERM1
from courses.models import Lesson, LessonMaterial
from courses.serializers import is_instructor_plan_material


class Command(BaseCommand):
    help = "Apply curated Stage 1 Term 1 spoken lesson_text + overview (weeks 1-8)."

    def add_arguments(self, parser):
        parser.add_argument("--execute", action="store_true")
        parser.add_argument(
            "--flag-all-robotics-plans",
            action="store_true",
            help="Also mark robotics lesson-plan materials instructor-only.",
        )

    def handle(self, *args, **options):
        execute = options["execute"]
        for lesson_id, (overview, lesson_text) in STAGE1_TERM1.items():
            lesson = Lesson.objects.filter(id=lesson_id).first()
            if not lesson:
                self.stdout.write(self.style.WARNING(f"Missing lesson {lesson_id}"))
                continue
            self.stdout.write(
                f"{lesson.id} {lesson.title}: overview={len(overview)} text={len(lesson_text)}"
            )
            if execute:
                lesson.overview = overview
                lesson.lesson_text = lesson_text
                # Keep Week 1 Lesson 2 content synced to Lesson 1 plan
                if lesson_id == 160:
                    source = Lesson.objects.filter(id=16).first()
                    if source:
                        lesson.content = source.content
                lesson.save(update_fields=["overview", "lesson_text", "content"] if lesson_id == 160 else ["overview", "lesson_text"])

        flagged = 0
        if options["flag_all_robotics_plans"]:
            qs = LessonMaterial.objects.filter(
                lesson__module__course__slug__startswith="ai-robotics-stage-"
            )
            for material in qs:
                if material.is_instructor_only:
                    continue
                if is_instructor_plan_material(material) or self._looks_like_plan(material):
                    flagged += 1
                    if execute:
                        material.is_instructor_only = True
                        material.save(update_fields=["is_instructor_only"])
            self.stdout.write(f"Plan materials to flag: {flagged}")

        if not execute:
            self.stdout.write(self.style.WARNING("Dry-run only. Re-run with --execute."))
        else:
            self.stdout.write(self.style.SUCCESS("Applied."))

    @staticmethod
    def _looks_like_plan(material):
        blob = f"{material.title or ''} {getattr(material.file, 'name', '') or ''}".lower()
        return bool(
            ("lesson" in blob and "stage" in blob)
            or "lesson plan" in blob
            or "scheme of work" in blob
        )
