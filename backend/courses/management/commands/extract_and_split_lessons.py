import os
import json
import logging
from io import BytesIO
from docx import Document
import requests
import time
from dotenv import load_dotenv
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.conf import settings
from courses.models import Course, Module, Lesson, LessonMaterial, Quiz, Question, Choice

load_dotenv()

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Extract sections from LessonMaterial .docx files, split into 2 lessons, and generate gamified quizzes."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Run without modifying the database.",
        )
        parser.add_argument(
            "--course-id",
            type=int,
            help="Process a specific course ID.",
        )
        parser.add_argument(
            "--lesson-id",
            type=int,
            help="Process a single specific lesson ID.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        course_id = options.get("course_id")
        lesson_id = options.get("lesson_id")

        groq_api_key = os.environ.get("GROQ_API_KEY_LOCAL") or os.environ.get("GROQ_API_KEY")
        if not groq_api_key:
            self.stderr.write(self.style.ERROR("GROQ_API_KEY is not set in environment or .env."))
            return
            
        # Build query
        lessons = Lesson.objects.all()
        if lesson_id:
            lessons = lessons.filter(id=lesson_id)
        elif course_id:
            lessons = lessons.filter(module__course_id=course_id)
            
        # We only want to process lessons that haven't been split yet
        # If it has " - Lesson 1" or " - Lesson 2", skip it
        lessons = lessons.exclude(title__contains=" - Lesson")
        
        total = lessons.count()
        self.stdout.write(f"Found {total} lessons to process.")

        for index, lesson in enumerate(lessons, 1):
            self.stdout.write(f"Processing {index}/{total}: {lesson.title} (Module: {lesson.module.title})")
            
            # Find materials ending in .docx
            materials = lesson.materials.filter(file__iendswith=".docx")
            if not materials.exists():
                self.stdout.write(self.style.WARNING(f"  No .docx materials found for {lesson.title}. Skipping."))
                continue
                
            # Read text from all attached .docx files
            combined_text = ""
            for mat in materials:
                try:
                    # In local dev, mat.file.path works. In production (S3), we need mat.file.read()
                    # We will read it as bytes to be safe
                    doc_bytes = mat.file.read()
                    doc = Document(BytesIO(doc_bytes))
                    combined_text += f"\n\n--- Document: {mat.title} ---\n\n"
                    combined_text += "\n".join([p.text for p in doc.paragraphs])
                except Exception as e:
                    self.stderr.write(f"  Error reading {mat.title}: {e}")
                    
            if not combined_text.strip():
                self.stdout.write(self.style.WARNING(f"  No readable text found for {lesson.title}. Skipping."))
                continue
                
            self.stdout.write(f"  Extracted {len(combined_text)} characters. Asking Groq to split and generate quizzes...")
            
            prompt = f"""
You are an expert curriculum designer. You have been given the raw text of a 2-hour weekly lesson plan.
Your task is to:
1. Extract the following sections: LEARNING OBJECTIVES, MATERIALS AND PREPARATION, LESSON STRUCTURE, ASSESSMENT, and KEY VOCABULARY.
2. Intelligently split the content into TWO 1-hour lessons.
   - Lesson 1 should start the topic.
   - Lesson 2 should finish the topic.
   - Distribute the learning objectives across both lessons.
3. For EACH of the two lessons, generate a 3-question multiple-choice quiz based on that lesson's content.
4. Extract the names of the materials and preparation items so they can be provided as downloads.

Output your response strictly as a JSON object with the following structure (NO markdown wrapping the JSON):
{{
  "lesson_1": {{
    "markdown_content": "# Lesson 1\\n\\n## Learning Objectives\\n...\\n## Lesson Structure\\n...",
    "quiz": [
      {{
        "question": "Question text here?",
        "explanation": "Why this is the correct answer.",
        "choices": [
          {{"text": "Option A", "is_correct": true}},
          {{"text": "Option B", "is_correct": false}},
          {{"text": "Option C", "is_correct": false}},
          {{"text": "Option D", "is_correct": false}}
        ]
      }}
    ]
  }},
  "lesson_2": {{
    "markdown_content": "# Lesson 2\\n\\n## Learning Objectives\\n...\\n## Lesson Structure\\n...",
    "quiz": [ ... ]
  }},
  "materials_names": ["Pencils", "Printable worksheet"]
}}

Here is the raw text of the lesson plan:
{combined_text[:20000]}
"""
            max_retries = 5
            for attempt in range(max_retries):
                try:
                    # Use a fast and smart model via requests
                    url = "https://api.groq.com/openai/v1/chat/completions"
                    headers = {
                        "Authorization": f"Bearer {groq_api_key}",
                        "Content-Type": "application/json"
                    }
                    payload = {
                        "model": "openai/gpt-oss-20b",
                        "response_format": {"type": "json_object"},
                        "temperature": 0.2,
                        "messages": [
                            {
                                "role": "system",
                                "content": "You are a helpful assistant that strictly outputs JSON.",
                            },
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ]
                    }
                    
                    response = requests.post(url, headers=headers, json=payload)
                    if response.status_code == 429:
                        try:
                            error_msg = response.json().get("error", {}).get("message", "")
                            # Parse "Please try again in X.Xs"
                            import re
                            match = re.search(r"try again in ([\d\.]+)s", error_msg)
                            wait_time = float(match.group(1)) + 1 if match else (2 ** attempt) * 5
                        except:
                            wait_time = (2 ** attempt) * 5
                        self.stdout.write(self.style.WARNING(f"  Rate limited. Waiting {wait_time}s before retry..."))
                        time.sleep(wait_time)
                        continue
                        
                    if response.status_code != 200:
                        self.stderr.write(self.style.ERROR(f"API Error: {response.status_code} - {response.text}"))
                    response.raise_for_status()
                    
                    result_json = response.json()["choices"][0]["message"]["content"]
                    data = json.loads(result_json)
                    break # Success!
                    
                except Exception as e:
                    if attempt == max_retries - 1:
                        self.stderr.write(self.style.ERROR(f"  Groq API error for {lesson.title} after {max_retries} attempts: {e}"))
                        data = None
                    else:
                        time.sleep(2)
            
            if not data:
                continue
                
            if dry_run:
                self.stdout.write(self.style.SUCCESS(f"  [DRY RUN] Success! Split into Lesson 1 ({len(data['lesson_1']['markdown_content'])} chars) and Lesson 2 ({len(data['lesson_2']['markdown_content'])} chars)."))
                continue
                
            # Perform the database split
            try:
                original_title = lesson.title
                lesson_1_title = f"{original_title} - Lesson 1"
                lesson_2_title = f"{original_title} - Lesson 2"
                
                # Create Lesson 2
                lesson_2 = Lesson.objects.create(
                    module=lesson.module,
                    title=lesson_2_title,
                    content=data['lesson_2']['markdown_content'],
                    order=lesson.order * 10 + 1,
                    is_visible=lesson.is_visible,
                    duration_minutes=60,
                )
                
                # Update Lesson 1
                lesson.title = lesson_1_title
                lesson.content = data['lesson_1']['markdown_content']
                lesson.duration_minutes = 60
                lesson.order = lesson.order * 10
                lesson.save()
                
                # Mark original .docx materials as instructor only
                for mat in lesson.materials.filter(file__iendswith=".docx"):
                    mat.is_instructor_only = True
                    mat.save()
                    
                # Create a downloadable material list for students
                materials_list = data.get('materials_names', [])
                if materials_list:
                    materials_text = "Required Materials and Preparation:\n\n" + "\n".join(f"- {m}" for m in materials_list)
                    txt_file = ContentFile(materials_text.encode('utf-8'), name=f"{original_title}_materials.txt")
                    LessonMaterial.objects.create(
                        lesson=lesson,
                        title="Materials & Preparation List",
                        file=txt_file,
                        is_instructor_only=False
                    )
                    LessonMaterial.objects.create(
                        lesson=lesson_2,
                        title="Materials & Preparation List",
                        file=txt_file,
                        is_instructor_only=False
                    )
                    
                # Create Quizzes
                self._create_quiz(lesson, f"{lesson_1_title} Quiz", data['lesson_1']['quiz'])
                self._create_quiz(lesson_2, f"{lesson_2_title} Quiz", data['lesson_2']['quiz'])
                
                self.stdout.write(self.style.SUCCESS(f"  Successfully split {original_title} into Lesson 1 and Lesson 2 with Gamified Quizzes!"))
                
                # Sleep to prevent rate limit
                time.sleep(1)
                
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"  Database update error for {lesson.title}: {e}"))
                
    def _create_quiz(self, lesson, title, quiz_data):
        # Delete any existing quiz for this lesson
        Quiz.objects.filter(lesson=lesson).delete()
        
        quiz = Quiz.objects.create(
            lesson=lesson,
            title=title,
            description="Test your understanding of this lesson to earn XP!",
            passing_score=80,
            points_reward=50,
        )
        
        for q_idx, q_data in enumerate(quiz_data, 1):
            question = Question.objects.create(
                quiz=quiz,
                text=q_data['question'],
                explanation=q_data.get('explanation', ''),
                points=1,
                order=q_idx
            )
            for c_data in q_data['choices']:
                Choice.objects.create(
                    question=question,
                    text=c_data['text'],
                    is_correct=c_data['is_correct']
                )
