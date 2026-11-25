import os
import re
from django.core.management.base import BaseCommand
from django.core.files import File
from courses.models import Course, Module, Lesson, LessonMaterial

class Command(BaseCommand):
    help = "Scans backend/media/lesson_materials/ and links downloadable materials to Stage 1-6 and CapCut course lessons."

    def handle(self, *args, **options):
        self.stdout.write("Starting Stage Materials Synchronization...")

        materials_dir = os.path.join("media", "lesson_materials")
        if not os.path.exists(materials_dir):
            self.stderr.write(f"Materials directory '{materials_dir}' not found.")
            return

        files = os.listdir(materials_dir)
        self.stdout.write(f"Found {len(files)} files in {materials_dir}.")

        created_count = 0

        # Pattern matching e.g. Stage1_Lesson3_Week3.docx or Stage2_Lesson10_... or Week_8_materials.txt
        stage_pattern = re.compile(r"Stage(\d+)_Lesson(\d+)", re.IGNORECASE)

        for filename in files:
            filepath = os.path.join(materials_dir, filename)
            if not os.path.isfile(filepath):
                continue

            match = stage_pattern.search(filename)
            if match:
                stage_num = match.group(1)
                lesson_num = int(match.group(2))

                # Find corresponding course
                course = Course.objects.filter(title__icontains=f"Stage {stage_num}").first()
                if not course:
                    course = Course.objects.filter(title__icontains=f"Stage{stage_num}").first()

                if course:
                    # Find lesson by order or title match
                    lesson = Lesson.objects.filter(module__course=course, order=lesson_num).first()
                    if not lesson:
                        lesson = Lesson.objects.filter(module__course=course, title__icontains=f"Lesson {lesson_num}").first()

                    if lesson:
                        # Create LessonMaterial if not existing
                        clean_title = filename.replace("_", " ").split(".")[0]
                        mat, created = LessonMaterial.objects.get_or_create(
                            lesson=lesson,
                            title=clean_title,
                            defaults={"file": f"lesson_materials/{filename}"}
                        )
                        if created:
                            created_count += 1
                            self.stdout.write(f"Linked '{filename}' to Course Stage {stage_num} Lesson {lesson_num}.")

        self.stdout.write(self.style.SUCCESS(f"Successfully synchronized materials! ({created_count} new materials attached)"))
