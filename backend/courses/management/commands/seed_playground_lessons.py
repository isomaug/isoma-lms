from django.core.management.base import BaseCommand
from courses.models import Course, Lesson

class Command(BaseCommand):
    help = "Seeds playground_type for Stage 1 to 6 course lessons (Scratch, MakeCode, Tinkercad Arduino)."

    def handle(self, *args, **options):
        self.stdout.write("Seeding Playground types for Stage 1 to 6 lessons...")

        # Mapping stage keywords to default playground types
        stage_mappings = [
            ("Stage 1", "scratchjr"),
            ("Stage 2", "scratchjr"),
            ("Stage 3", "makecode_microbit"),
            ("Stage 4", "makecode_microbit"),
            ("Stage 5", "tinkercad"),
            ("Stage 6", "tinkercad"),
        ]

        updated_count = 0

        for stage_name, default_type in stage_mappings:
            courses = Course.objects.filter(title__icontains=stage_name)
            for course in courses:
                lessons = Lesson.objects.filter(module__course=course)
                for lesson in lessons:
                    # Determine type based on lesson title keywords if present, else stage default
                    title_lower = lesson.title.lower()
                    if "scratchjr" in title_lower or "scratch jr" in title_lower:
                        ptype = "scratchjr"
                    elif "scratch" in title_lower:
                        ptype = "scratch"
                    elif "arcade" in title_lower:
                        ptype = "makecode_arcade"
                    elif "microbit" in title_lower or "micro:bit" in title_lower:
                        ptype = "makecode_microbit"
                    elif "esp32" in title_lower:
                        ptype = "wokwi_arduino"
                    elif "arduino" in title_lower:
                        ptype = "tinkercad"
                    elif "tinkercad" in title_lower or "circuit" in title_lower:
                        ptype = "tinkercad"
                    else:
                        ptype = default_type

                    if lesson.playground_type != ptype:
                        lesson.playground_type = ptype
                        lesson.save(update_fields=["playground_type"])
                        updated_count += 1
                        self.stdout.write(f"  - [{stage_name}] Updated '{lesson.title}' -> {ptype}")

        self.stdout.write(self.style.SUCCESS(f"Done! Updated {updated_count} lessons with coding playgrounds."))
