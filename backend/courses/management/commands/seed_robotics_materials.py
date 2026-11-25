import os
from pathlib import Path
from django.conf import settings
from django.core.management.base import BaseCommand
from django.core.files import File
from courses.models import Course, Module, Lesson, LessonMaterial

class Command(BaseCommand):
    help = 'Seeds the database with materials for AI, Coding and Robotics courses from local folders.'

    def handle(self, *args, **kwargs):
        base_dir = Path(settings.BASE_DIR).parent / "resources" / "course-materials" / "ai-coding-robotics"
        
        if not os.path.exists(base_dir):
            self.stderr.write(f"Directory not found: {base_dir}")
            return
            
        # Loop through Stages
        for stage_folder in os.listdir(base_dir):
            stage_path = os.path.join(base_dir, stage_folder)
            if not os.path.isdir(stage_path) or not stage_folder.startswith("Stage"):
                continue
                
            try:
                stage_num = int(stage_folder.replace("Stage", "").strip())
            except ValueError:
                continue
                
            course = Course.objects.filter(title__icontains=f"Stage {stage_num}").first()
            if not course:
                self.stderr.write(f"Course not found for {stage_folder}")
                continue
                
            # Loop through Terms
            for term_folder in os.listdir(stage_path):
                term_path = os.path.join(stage_path, term_folder)
                if not os.path.isdir(term_path) or not term_folder.startswith("Term"):
                    continue
                    
                try:
                    term_num = int(term_folder.replace("Term", "").strip())
                except ValueError:
                    continue
                    
                module_title = f"Term {term_num}"
                try:
                    module = Module.objects.get(course=course, title=module_title)
                except Module.DoesNotExist:
                    self.stderr.write(f"Module not found for {term_folder} in {course_title}")
                    continue
                    
                # Loop through Weeks
                for week_folder in os.listdir(term_path):
                    week_path = os.path.join(term_path, week_folder)
                    if not os.path.isdir(week_path) or not week_folder.startswith("Week"):
                        continue
                        
                    try:
                        week_num = int(week_folder.replace("Week", "").strip())
                    except ValueError:
                        continue
                        
                    lesson_title = f"Week {week_num}"
                    lesson = Lesson.objects.filter(module=module, order=week_num).first() or \
                             Lesson.objects.filter(module=module, title__icontains=f"Week {week_num}").first() or \
                             Lesson.objects.filter(module=module, title=lesson_title).first()
                    
                    if not lesson:
                        self.stderr.write(f"Lesson not found for {week_folder} in {module_title}")
                        continue
                        
                    # Find all files in week_path recursively (including Materials/ subfolders)
                    for root, dirs, files in os.walk(week_path):
                        for filename in files:
                            if filename.startswith(".") or filename.endswith(".pyc"):
                                continue
                            file_path = os.path.join(root, filename)
                            display_title = filename.replace("_", " ").rsplit(".", 1)[0]
                            
                            # Check if material already exists for this lesson to avoid duplicates
                            if not LessonMaterial.objects.filter(lesson=lesson, title=display_title).exists():
                                log_msg = f"Uploading {filename} to {course.title} >> {module_title} >> {lesson.title}..."
                                self.stdout.write(log_msg.encode('ascii', 'ignore').decode('ascii'))
                                with open(file_path, 'rb') as f:
                                    material = LessonMaterial(
                                        lesson=lesson,
                                        title=display_title,
                                        is_instructor_only=filename.endswith(".docx") and "Lesson" in filename
                                    )
                                    material.file.save(filename, File(f))
                                    material.save()
                                self.stdout.write(self.style.SUCCESS("Successfully saved material"))
                                
        self.stdout.write(self.style.SUCCESS('Finished seeding robotics materials from Stage 1 to 6, Term 1 to 3, Week 1 to 12!'))
