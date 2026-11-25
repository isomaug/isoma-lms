from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q

from courses.models import (
    Certificate,
    Course,
    Enrollment,
    Lesson,
    Module,
    Quiz,
    QuizAttempt,
    UserXP,
)
from courses.visibility import is_future_robotics_content, lesson_week_number


class Command(BaseCommand):
    help = (
        "Hide unreleased robotics weeks, clear week-2+ progress, zero all XP, "
        "and revoke robotics certificates. Defaults to dry-run."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--execute",
            action="store_true",
            help="Apply changes. Without this flag, only print counts.",
        )
        parser.add_argument(
            "--keep-week",
            type=int,
            default=1,
            help="Keep this Term 1 week visible and keep its completions (default: 1).",
        )

    def handle(self, *args, **options):
        execute = options["execute"]
        keep_week = options["keep_week"]
        robotics = Course.objects.filter(slug__startswith="ai-robotics-stage-")
        robotics_ids = list(robotics.values_list("id", flat=True))
        lessons = Lesson.objects.filter(module__course_id__in=robotics_ids).select_related("module")

        hide_lesson_ids = []
        show_week1_ids = []
        for lesson in lessons:
            week = lesson_week_number(lesson.title)
            module_title = (lesson.module.title or "").lower()
            if is_future_robotics_content(lesson=lesson, keep_week=keep_week):
                hide_lesson_ids.append(lesson.id)
            elif module_title.startswith("term 1") and week == keep_week:
                show_week1_ids.append(lesson.id)

        term1_modules = Module.objects.filter(
            course_id__in=robotics_ids, title__istartswith="Term 1"
        )
        later_modules = Module.objects.filter(course_id__in=robotics_ids).filter(
            Q(title__istartswith="Term 2") | Q(title__istartswith="Term 3")
        )

        completion_lesson_ids = hide_lesson_ids
        enrollments = Enrollment.objects.filter(course_id__in=robotics_ids)
        completion_count = 0
        for enrollment in enrollments:
            completion_count += enrollment.completed_lessons.filter(
                id__in=completion_lesson_ids
            ).count()

        future_quizzes = Quiz.objects.filter(
            Q(lesson_id__in=hide_lesson_ids)
            | Q(module_id__in=later_modules.values_list("id", flat=True))
        )
        future_quiz_ids = list(future_quizzes.values_list("id", flat=True))
        extra_quiz_ids = []
        for quiz in Quiz.objects.filter(
            Q(module__course_id__in=robotics_ids) | Q(lesson__module__course_id__in=robotics_ids)
        ).exclude(id__in=future_quiz_ids):
            week = lesson_week_number(quiz.title)
            if week is not None and week > keep_week:
                extra_quiz_ids.append(quiz.id)
        future_quiz_ids = list(set(future_quiz_ids + extra_quiz_ids))

        attempt_count = QuizAttempt.objects.filter(quiz_id__in=future_quiz_ids).count()
        xp_rows = UserXP.objects.filter(total_xp__gt=0).count()
        xp_sum = sum(UserXP.objects.filter(total_xp__gt=0).values_list("total_xp", flat=True))
        xp_awarded_sum = sum(
            QuizAttempt.objects.filter(xp_awarded__gt=0).values_list("xp_awarded", flat=True)
        )
        cert_qs = Certificate.objects.filter(course_id__in=robotics_ids)
        cert_count = cert_qs.count()

        self.stdout.write(f"Robotics courses: {len(robotics_ids)}")
        self.stdout.write(f"Lessons to hide (week > {keep_week} or Term 2/3): {len(hide_lesson_ids)}")
        self.stdout.write(f"Term 1 week {keep_week} lessons to show: {len(show_week1_ids)}")
        self.stdout.write(f"Term 1 modules to show: {term1_modules.count()}")
        self.stdout.write(f"Term 2/3 modules to hide: {later_modules.count()}")
        self.stdout.write(f"Completions to clear: {completion_count}")
        self.stdout.write(f"Week-2+ quiz attempts to delete: {attempt_count}")
        self.stdout.write(f"UserXP rows to zero: {xp_rows} (sum {xp_sum})")
        self.stdout.write(f"QuizAttempt.xp_awarded to zero: {xp_awarded_sum}")
        self.stdout.write(f"Robotics certificates to revoke: {cert_count}")

        if not execute:
            self.stdout.write(self.style.WARNING("Dry-run only. Re-run with --execute to apply."))
            return

        with transaction.atomic():
            Lesson.objects.filter(id__in=hide_lesson_ids).update(is_visible=False)
            Lesson.objects.filter(id__in=show_week1_ids).update(is_visible=True)
            term1_modules.update(is_visible=True)
            later_modules.update(is_visible=False)

            through = Enrollment.completed_lessons.through
            deleted_completions, _ = through.objects.filter(
                lesson_id__in=completion_lesson_ids
            ).delete()
            deleted_attempts, _ = QuizAttempt.objects.filter(quiz_id__in=future_quiz_ids).delete()
            xp_updated = UserXP.objects.filter(total_xp__gt=0).update(total_xp=0)
            awarded_updated = QuizAttempt.objects.filter(xp_awarded__gt=0).update(xp_awarded=0)
            deleted_certs, _ = cert_qs.delete()

        self.stdout.write(self.style.SUCCESS(
            f"Applied: hidden lessons={len(hide_lesson_ids)}, "
            f"cleared completions={deleted_completions}, "
            f"deleted attempts={deleted_attempts}, "
            f"zeroed XP rows={xp_updated}, "
            f"zeroed attempt XP={awarded_updated}, "
            f"revoked certs={deleted_certs}."
        ))
