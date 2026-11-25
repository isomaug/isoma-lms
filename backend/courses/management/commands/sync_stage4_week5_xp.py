from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Q

from courses.models import Course, Enrollment, Lesson, Quiz, QuizAttempt, UserXP
from courses.xp_rules import quiz_xp_for_pass_attempt


STAGE4_SLUG = "ai-robotics-stage-4"
TERM1_MODULE_ORDER = 1


class Command(BaseCommand):
    help = (
        "RoboCreators Stage 4: optionally backfill Term 1 week 1–N first-pass XP "
        "(50/25/5) when missing, then move each student's earned XP onto their "
        "enrolled cohort (legacy null-cohort rows are zeroed). Defaults to dry-run."
    )

    def add_arguments(self, parser):
        parser.add_argument("--execute", action="store_true")
        parser.add_argument("--course-slug", default=STAGE4_SLUG)
        parser.add_argument("--through-week", type=int, default=5)

    def handle(self, *args, **options):
        execute = options["execute"]
        slug = options["course_slug"]
        through_week = max(1, int(options["through_week"] or 5))
        max_lesson_order = through_week * 10 + 1

        try:
            course = Course.objects.get(slug=slug)
        except Course.DoesNotExist:
            self.stderr.write(self.style.ERROR(f"Course not found: {slug}"))
            return

        term1 = course.modules.filter(order=TERM1_MODULE_ORDER).first()
        if not term1:
            self.stderr.write(self.style.ERROR("Term 1 module not found."))
            return

        week_quiz_ids = list(
            Quiz.objects.filter(
                lesson__module=term1, lesson__order__lte=max_lesson_order
            ).values_list("id", flat=True)
        )
        all_course_quiz_ids = list(
            Quiz.objects.filter(
                Q(lesson__module__course=course) | Q(module__course=course)
            ).values_list("id", flat=True)
        )

        self.stdout.write(
            f"Course: {course.title}\n"
            f"Week 1–{through_week} quizzes: {len(week_quiz_ids)}"
        )

        # Backfill first-pass awards that are still 0 on tiers 0–2 only
        attempts = list(
            QuizAttempt.objects.filter(quiz_id__in=week_quiz_ids)
            .select_related("quiz")
            .order_by("user_id", "quiz_id", "started_at", "id")
        )
        by_user_quiz = {}
        for attempt in attempts:
            by_user_quiz.setdefault((attempt.user_id, attempt.quiz_id), []).append(attempt)

        attempt_updates = []
        invented = 0
        for (_uid, _qid), group in by_user_quiz.items():
            first_pass_idx = next((i for i, a in enumerate(group) if a.passed), None)
            if first_pass_idx is None:
                continue
            first_pass = group[first_pass_idx]
            if first_pass.xp_awarded > 0:
                continue
            want = quiz_xp_for_pass_attempt(first_pass.quiz.points_reward, first_pass_idx)
            if want <= 0:
                continue
            first_pass.xp_awarded = want
            attempt_updates.append(first_pass)
            invented += want

        pending = {a.id: a.xp_awarded for a in attempt_updates}
        award_by_user = {}
        for row in QuizAttempt.objects.filter(quiz_id__in=all_course_quiz_ids).values(
            "user_id", "id", "xp_awarded"
        ):
            awarded = int(pending.get(row["id"], row["xp_awarded"] or 0))
            if awarded:
                award_by_user[row["user_id"]] = award_by_user.get(row["user_id"], 0) + awarded

        existing = list(UserXP.objects.filter(course=course))
        by_user = {}
        for row in existing:
            by_user.setdefault(row.user_id, []).append(row)

        xp_updates = []
        null_zeroes = []
        to_create = []
        students_synced = 0

        enrollments = Enrollment.objects.filter(course=course).prefetch_related(
            "user__enrolled_cohorts"
        )
        for enr in enrollments:
            user = enr.user
            cohort = next(
                (c for c in user.enrolled_cohorts.all() if c.course_id == course.id),
                None,
            )
            earned = int(award_by_user.get(user.id, 0))
            rows = by_user.get(user.id, [])
            cohort_row = next((r for r in rows if r.cohort_id == (cohort.id if cohort else None)), None)
            null_rows = [r for r in rows if r.cohort_id is None]

            if cohort is None:
                target = null_rows[0] if null_rows else None
                if target is None:
                    if earned:
                        to_create.append(
                            UserXP(user=user, course=course, cohort=None, total_xp=earned)
                        )
                        students_synced += 1
                elif target.total_xp != earned:
                    target.total_xp = earned
                    xp_updates.append(target)
                    students_synced += 1
                continue

            if cohort_row is None:
                to_create.append(
                    UserXP(user=user, course=course, cohort=cohort, total_xp=earned)
                )
                students_synced += 1
            elif cohort_row.total_xp != earned:
                cohort_row.total_xp = earned
                xp_updates.append(cohort_row)
                students_synced += 1

            for null_row in null_rows:
                if null_row.total_xp != 0:
                    null_row.total_xp = 0
                    null_zeroes.append(null_row)

        self.stdout.write(f"First-pass awards to invent (tiers 0–2): {len(attempt_updates)} (+{invented} XP)")
        self.stdout.write(f"UserXP updates: {len(xp_updates)}")
        self.stdout.write(f"UserXP creates: {len(to_create)}")
        self.stdout.write(f"Null rows to zero: {len(null_zeroes)}")
        self.stdout.write(f"Students synced: {students_synced}")
        for uid, xp in sorted(award_by_user.items(), key=lambda x: -x[1])[:10]:
            self.stdout.write(f"  user_id={uid} earned={xp}")

        if not execute:
            self.stdout.write(self.style.WARNING("Dry-run only. Pass --execute to apply."))
            return

        with transaction.atomic():
            if attempt_updates:
                QuizAttempt.objects.bulk_update(attempt_updates, ["xp_awarded"], batch_size=500)
            if xp_updates:
                UserXP.objects.bulk_update(xp_updates, ["total_xp"], batch_size=500)
            if null_zeroes:
                UserXP.objects.bulk_update(null_zeroes, ["total_xp"], batch_size=500)
            if to_create:
                UserXP.objects.bulk_create(to_create, ignore_conflicts=True)

        self.stdout.write(self.style.SUCCESS("Stage 4 cohort XP consolidation applied."))
