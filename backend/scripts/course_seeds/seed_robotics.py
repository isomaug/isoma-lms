import os
from pathlib import Path
from django.core.files import File

from courses.models import Course, Module, Lesson, LessonMaterial, Quiz, Question, Choice

REPO_ROOT = Path(__file__).resolve().parent.parent
BASE_DIR = REPO_ROOT / "resources" / "course-materials" / "ai-coding-robotics"

def seed_curriculum():
    print("Starting curriculum seeding...")
    
    for stage_num in range(1, 7):
        stage_dir_name = f"Stage {stage_num}"
        stage_path = os.path.join(BASE_DIR, stage_dir_name)
        
        if not os.path.exists(stage_path):
            print(f"Skipping {stage_dir_name} - folder not found.")
            continue
            
        course_title = f"AI, Coding and Robotics - Stage {stage_num}"
        course_slug = f"ai-robotics-stage-{stage_num}"
        
        course, created = Course.objects.get_or_create(
            slug=course_slug,
            defaults={
                'title': course_title,
                'description': f"Comprehensive AI, Coding and Robotics curriculum for Stage {stage_num}.",
                'price_ugx': 150000.00,
                'level': 'Beginner' if stage_num <= 2 else 'Intermediate',
                'is_published': True
            }
        )
        print(f"[{'CREATED' if created else 'EXISTS'}] Course: {course.title}")
        
        for term_num in range(1, 4):
            term_dir_name = f"Term {term_num}"
            term_path = os.path.join(stage_path, term_dir_name)
            
            if not os.path.exists(term_path):
                continue
                
            module, m_created = Module.objects.get_or_create(
                course=course,
                title=f"Term {term_num}",
                defaults={'order': term_num}
            )
            print(f"  [{'CREATED' if m_created else 'EXISTS'}] Module: {module.title}")
            
            # Term-level docs will be attached in Week 1 loop
            
            for week_num in range(1, 9):
                week_dir_name = f"Week{week_num}"
                week_path = os.path.join(term_path, week_dir_name)
                
                lesson_content = f"# Week {week_num}\n\n## Day 1\n\n## Day 2\n\n## Day 3"
                
                lesson, l_created = Lesson.objects.get_or_create(
                    module=module,
                    title=f"Week {week_num}",
                    defaults={
                        'order': week_num,
                        'content': lesson_content,
                        'duration_minutes': 180
                    }
                )
                print(f"    [{'CREATED' if l_created else 'EXISTS'}] Lesson: {lesson.title}")
                
                # Attach Gamification Quiz
                quiz_title = f"Week {week_num} Challenge" if week_num < 8 else f"Term {term_num} Exam"
                xp_reward = 5 if week_num < 8 else 20
                
                quiz, q_created = Quiz.objects.get_or_create(
                    lesson=lesson,
                    title=quiz_title,
                    defaults={
                        'description': f"Test your knowledge for {lesson.title}",
                        'points_reward': xp_reward,
                        'passing_score': 80
                    }
                )
                if q_created:
                    question = Question.objects.create(
                        quiz=quiz,
                        text="What did we learn this week?",
                        points=10
                    )
                    Choice.objects.create(question=question, text="Everything!", is_correct=True)
                    Choice.objects.create(question=question, text="Nothing", is_correct=False)
                
                # Attach materials inside Week folder
                if os.path.exists(week_path):
                    for file_name in os.listdir(week_path):
                        file_path = os.path.join(week_path, file_name)
                        if os.path.isfile(file_path):
                            # Check if material already exists
                            if not LessonMaterial.objects.filter(lesson=lesson, title=file_name).exists():
                                with open(file_path, 'rb') as f:
                                    material = LessonMaterial(
                                        lesson=lesson,
                                        title=file_name
                                    )
                                    material.file.save(file_name, File(f), save=True)
                                print(f"      [ATTACHED] File: {file_name.encode('ascii', 'replace').decode('ascii')}")
                
                # Attach term-level docs to Week 1
                if week_num == 1:
                    for item in os.listdir(term_path):
                        item_path = os.path.join(term_path, item)
                        if os.path.isfile(item_path):
                            if not LessonMaterial.objects.filter(lesson=lesson, title=item).exists():
                                with open(item_path, 'rb') as f:
                                    material = LessonMaterial(
                                        lesson=lesson,
                                        title=item
                                    )
                                    material.file.save(item, File(f), save=True)
                                print(f"      [ATTACHED TERM DOC] File: {item.encode('ascii', 'replace').decode('ascii')}")

    print("Curriculum seeding complete!")

if __name__ == "__main__":
    seed_curriculum()
