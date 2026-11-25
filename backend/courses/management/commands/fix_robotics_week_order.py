from django.core.management.base import BaseCommand

from courses.models import Course, Lesson
from courses.visibility import lesson_week_number
import re

LESSON_NUM_RE = re.compile(r"Lesson\s+(\d+)", re.I)


class Command(BaseCommand):
    help = (
        "Fix robotics lesson titles/order so weeks are chronological. "
        "Converts leftover 'Week N' stubs into Lesson 1 rows and sets order = week*10 + lesson."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--execute",
            action="store_true",
            help="Apply changes. Without this flag, only print what would change.",
        )

    def handle(self, *args, **options):
        execute = options["execute"]
        courses = Course.objects.filter(slug__startswith="ai-robotics-stage-")
        for course in courses:
            self.stdout.write(f"\n{course.slug}")
            for module in course.modules.all().order_by("order"):
                lessons = list(module.lessons.all())
                changed = 0
                for lesson in lessons:
                    week = lesson_week_number(lesson.title)
                    if week is None:
                        continue
                    match = LESSON_NUM_RE.search(lesson.title or "")
                    lesson_num = int(match.group(1)) if match else 1
                    # Bare "Week 3" -> "Week 3 - Lesson 1"
                    if not match:
                        new_title = f"Week {week} - Lesson 1"
                    else:
                        new_title = f"Week {week} - Lesson {lesson_num}"
                    new_order = week * 10 + (lesson_num - 1)
                    if lesson.title != new_title or lesson.order != new_order:
                        self.stdout.write(
                            f"  {module.title}: '{lesson.title}' (order {lesson.order}) "
                            f"-> '{new_title}' (order {new_order})"
                        )
                        if execute:
                            lesson.title = new_title
                            lesson.order = new_order
                            lesson.save(update_fields=["title", "order"])
                        changed += 1

                    # Ensure Lesson 2 exists when we only have Lesson 1 for that week
                    if lesson_num == 1:
                        has_l2 = any(
                            lesson_week_number(other.title) == week
                            and (LESSON_NUM_RE.search(other.title or "") and int(LESSON_NUM_RE.search(other.title).group(1)) == 2)
                            for other in lessons
                        )
                        if not has_l2 and week:
                            self.stdout.write(
                                f"  {module.title}: missing Week {week} - Lesson 2 "
                                f"(will clone from lesson {lesson.id})"
                            )
                            if execute:
                                clone = Lesson.objects.get(pk=lesson.pk)
                                clone.pk = None
                                clone.title = f"Week {week} - Lesson 2"
                                clone.order = week * 10 + 1
                                clone.is_visible = False
                                clone.save()
                                lessons.append(clone)
                                changed += 1

                if changed == 0:
                    self.stdout.write(f"  {module.title}: already chronological")

        if not execute:
            self.stdout.write(self.style.WARNING("\nDry-run only. Re-run with --execute to apply."))
        else:
            self.stdout.write(self.style.SUCCESS("\nDone."))
