from django.core.management.base import BaseCommand
from django.db import transaction

from courses.models import Quiz, QuizAttempt, UserXP
from courses.xp_rules import quiz_xp_for_pass_attempt


def _quiz_course_id(quiz):
    if quiz.lesson_id and quiz.lesson and quiz.lesson.module_id:
        return quiz.lesson.module.course_id
    if quiz.module_id and quiz.module:
        return quiz.module.course_id
    return None


class Command(BaseCommand):
    help = (
        "Clamp quiz XP to the 50/25/5 (1st/2nd/3rd pass attempt) tiers, "
        "zero awards after the 3rd attempt / non-first-pass rows, and rebuild "
        "UserXP totals from awards. Does not invent XP for historical 0 awards. "
        "Defaults to dry-run."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--execute",
            action="store_true",
            help="Apply recalculation. Without this flag, only report.",
        )

    def handle(self, *args, **options):
        execute = options["execute"]
        quizzes = {
            q.id: q
            for q in Quiz.objects.select_related("module", "lesson__module").all()
        }

        attempts = list(
            QuizAttempt.objects.select_related(
                "quiz", "quiz__module", "quiz__lesson__module"
            ).order_by("user_id", "quiz_id", "started_at", "id")
        )

        by_user_quiz = {}
        for attempt in attempts:
            key = (attempt.user_id, attempt.quiz_id)
            by_user_quiz.setdefault(key, []).append(attempt)

        attempt_updates = []
        xp_by_user_course = {}
        stripped_awards = 0
        groups_touched = 0
        xp_created = 0

        for (user_id, quiz_id), group in by_user_quiz.items():
            quiz = quizzes.get(quiz_id) or group[0].quiz
            course_id = _quiz_course_id(quiz)
            if not course_id:
                continue

            first_pass_idx = next((i for i, a in enumerate(group) if a.passed), None)
            desired = [0] * len(group)
            if first_pass_idx is not None:
                first_pass = group[first_pass_idx]
                # Keep only XP that already existed on the first pass, clamped
                # to the attempt tier (50 / 25 / 5 when points_reward=50).
                # Never invent XP for historical passes recorded as 0.
                if first_pass.xp_awarded > 0:
                    tier = quiz_xp_for_pass_attempt(quiz.points_reward, first_pass_idx)
                    desired[first_pass_idx] = min(int(first_pass.xp_awarded), tier)

            changed = False
            for i, attempt in enumerate(group):
                want = desired[i]
                if attempt.xp_awarded != want:
                    changed = True
                    if attempt.xp_awarded > want:
                        stripped_awards += attempt.xp_awarded - want
                    attempt.xp_awarded = want
                    attempt_updates.append(attempt)
                if want:
                    xp_by_user_course[(user_id, course_id)] = (
                        xp_by_user_course.get((user_id, course_id), 0) + want
                    )

            if changed:
                groups_touched += 1

        existing_xp = list(UserXP.objects.all())
        xp_row_updates = []
        for row in existing_xp:
            new_total = xp_by_user_course.get((row.user_id, row.course_id), 0)
            if row.total_xp != new_total:
                row.total_xp = new_total
                xp_row_updates.append(row)

        missing_keys = set(xp_by_user_course.keys()) - {
            (r.user_id, r.course_id) for r in existing_xp
        }

        self.stdout.write(f"User+quiz groups needing award fix: {groups_touched}")
        self.stdout.write(f"Attempt rows to update: {len(attempt_updates)}")
        self.stdout.write(f"XP to strip from attempts: {stripped_awards}")
        self.stdout.write(f"UserXP rows to update: {len(xp_row_updates)}")
        self.stdout.write(f"UserXP rows to create: {len(missing_keys)}")

        if not execute:
            self.stdout.write(self.style.WARNING("Dry-run only. Pass --execute to apply."))
            return

        with transaction.atomic():
            if attempt_updates:
                QuizAttempt.objects.bulk_update(attempt_updates, ["xp_awarded"], batch_size=500)
            if xp_row_updates:
                UserXP.objects.bulk_update(xp_row_updates, ["total_xp"], batch_size=500)
            for user_id, course_id in missing_keys:
                UserXP.objects.create(
                    user_id=user_id,
                    course_id=course_id,
                    total_xp=xp_by_user_course[(user_id, course_id)],
                )
                xp_created += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Recalculated XP. Updated {len(attempt_updates)} attempts, "
                f"{len(xp_row_updates)} UserXP rows, created {xp_created}."
            )
        )
