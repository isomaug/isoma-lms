"""
Build student-facing spoken lesson_text for one calendar week from one lesson plan.

Mapping (confirmed):
  Curriculum lesson plan N  ->  Week N Lesson 1 (start) + Week N Lesson 2 (finish)

Does NOT invent a second pedagogy week. Assessment / vocabulary stay in the same week.
"""

from __future__ import annotations

import re

from django.core.management.base import BaseCommand
from django.db import transaction

from courses.models import Choice, Course, Lesson, LessonMaterial, Question, Quiz
from courses.serializers import is_instructor_plan_material
from courses.visibility import lesson_week_number


LESSON_NUM_RE = re.compile(r"Lesson\s+(\d+)", re.I)


def _lesson_num(title: str) -> int:
    match = LESSON_NUM_RE.search(title or "")
    return int(match.group(1)) if match else 1


def _extract_section(plan: str, heading: str) -> str:
    pattern = re.compile(
        rf"^##\s*{re.escape(heading)}\s*\n(.*?)(?=^##\s|\Z)",
        re.I | re.M | re.S,
    )
    match = pattern.search(plan or "")
    return (match.group(1).strip() if match else "").strip()


def _structure_blocks(structure: str) -> list[str]:
    if not structure.strip():
        return []
    parts = re.split(r"(?=^\d+\.\s|^###\s)", structure.strip(), flags=re.M)
    return [part.strip() for part in parts if part.strip()]


def _bullets_to_spoken(text: str) -> str:
    lines = []
    for raw in text.splitlines():
        line = raw.strip()
        if not line:
            continue
        line = re.sub(r"^[\*\-]\s*", "", line)
        line = re.sub(r"^\d+\.\s*", "", line)
        line = re.sub(r"^###\s*", "", line)
        # Convert teacher/class voice into solo student voice
        line = line.replace("Facilitator", "You")
        line = line.replace("facilitator", "you")
        line = line.replace("Each learner", "You")
        line = line.replace("each learner", "you")
        line = line.replace("Learners", "You")
        line = line.replace("learners", "you")
        line = line.replace("Pairs", "You")
        line = line.replace("pairs", "you")
        line = line.replace("Distribute", "You will use")
        line = line.replace("Give each learner", "You get")
        line = line.replace("Your teacher will", "You will")
        line = line.replace("your teacher will", "you will")
        line = line.replace("Ask the class", "Ask yourself")
        line = line.replace(" → ", " -> ")
        line = line.replace("→", "->")
        lines.append(f"- {line}")
    return "\n".join(lines)


def split_plan_into_week(plan: str, week: int) -> dict:
    """Return overview + spoken L1/L2 text from one full plan."""
    objectives = _extract_section(plan, "Learning Objectives")
    structure = _extract_section(plan, "Lesson Structure")
    assessment = _extract_section(plan, "Assessment")
    vocabulary = _extract_section(plan, "Key Vocabulary")
    blocks = _structure_blocks(structure)
    if len(blocks) >= 2:
        mid = max(1, len(blocks) // 2)
        first, second = blocks[:mid], blocks[mid:]
    elif blocks:
        first, second = blocks, blocks
    else:
        first, second = [structure or plan], [assessment or vocabulary or "Finish today's activities with your partner."]

    overview = objectives or "Complete today's activities. You will learn by doing each step."
    lesson1 = (
        f"# Week {week} - Lesson 1\n\n"
        f"## Today you will learn\n{overview}\n\n"
        f"## Let's begin\n{_bullets_to_spoken(chr(10).join(first))}\n"
    )
    lesson2_parts = [
        f"# Week {week} - Lesson 2\n",
        "## Finish the week\n",
        _bullets_to_spoken(chr(10).join(second)),
    ]
    if assessment:
        lesson2_parts.extend(["\n## Check your understanding\n", _bullets_to_spoken(assessment)])
    if vocabulary:
        lesson2_parts.extend(["\n## Key words to remember\n", _bullets_to_spoken(vocabulary)])
    return {
        "overview": overview,
        "lesson1_text": lesson1.strip(),
        "lesson2_text": "\n".join(lesson2_parts).strip(),
        "objectives": objectives,
    }


def _replace_quiz(lesson: Lesson, title: str, questions: list[dict]):
    quiz, _ = Quiz.objects.get_or_create(
        lesson=lesson,
        defaults={"title": title, "points_reward": 50},
    )
    quiz.title = title
    quiz.save(update_fields=["title"])
    quiz.questions.all().delete()
    for order, item in enumerate(questions, start=1):
        question = Question.objects.create(quiz=quiz, text=item["text"], order=order)
        for choice in item["choices"]:
            Choice.objects.create(
                question=question,
                text=choice["text"],
                is_correct=choice.get("is_correct", False),
            )


STAGE1_WEEK1_QUIZ_L1 = [
    {
        "text": "Which three parts of the ScratchJr screen should you be able to name?",
        "choices": [
            {"text": "Stage, character, and blocks panel", "is_correct": True},
            {"text": "Keyboard, mouse, and printer", "is_correct": False},
            {"text": "Camera, microphone, and speaker", "is_correct": False},
            {"text": "Folder, email, and browser", "is_correct": False},
        ],
    },
    {
        "text": "What is the first step to start a new ScratchJr project?",
        "choices": [
            {"text": "Tap the yellow folder, then New Project", "is_correct": True},
            {"text": "Delete the Scratch Cat", "is_correct": False},
            {"text": "Close the tablet", "is_correct": False},
            {"text": "Open the paint editor first", "is_correct": False},
        ],
    },
    {
        "text": "Where do you rename the Scratch Cat?",
        "choices": [
            {"text": "In the character name field next to the stage", "is_correct": True},
            {"text": "In the blocks panel only", "is_correct": False},
            {"text": "By shaking the tablet", "is_correct": False},
            {"text": "In the yellow folder menu", "is_correct": False},
        ],
    },
]

STAGE1_WEEK1_QUIZ_L2 = [
    {
        "text": "What does the paint editor let you do?",
        "choices": [
            {"text": "Change the colour of a character body part", "is_correct": True},
            {"text": "Send an email", "is_correct": False},
            {"text": "Delete the whole project forever", "is_correct": False},
            {"text": "Turn off the tablet", "is_correct": False},
        ],
    },
    {
        "text": "In a pair, who touches the screen?",
        "choices": [
            {"text": "The driver", "is_correct": True},
            {"text": "Only the teacher", "is_correct": False},
            {"text": "Nobody", "is_correct": False},
            {"text": "The whole class at once", "is_correct": False},
        ],
    },
    {
        "text": "Which word means the place where your character appears and moves?",
        "choices": [
            {"text": "Stage", "is_correct": True},
            {"text": "Paintbrush only", "is_correct": False},
            {"text": "Sticky badge", "is_correct": False},
            {"text": "Prediction card", "is_correct": False},
        ],
    },
]


class Command(BaseCommand):
    help = (
        "Build spoken student lesson_text for robotics weeks. "
        "One curriculum plan fills one calendar week (Lesson 1 start + Lesson 2 finish). "
        "Also flags plan .docx materials as instructor-only."
    )

    def add_arguments(self, parser):
        parser.add_argument("--slug", default="ai-robotics-stage-1")
        parser.add_argument("--term", type=int, default=1)
        parser.add_argument("--week", type=int, help="Build a single week number")
        parser.add_argument(
            "--flag-plans-only",
            action="store_true",
            help="Only mark lesson-plan materials instructor-only across robotics courses.",
        )
        parser.add_argument(
            "--execute",
            action="store_true",
            help="Write changes. Default is dry-run.",
        )

    def handle(self, *args, **options):
        execute = options["execute"]
        if options["flag_plans_only"]:
            self._flag_plans(execute)
            return

        course = Course.objects.filter(slug=options["slug"]).first()
        if not course:
            self.stderr.write(self.style.ERROR(f"Course not found: {options['slug']}"))
            return

        module = course.modules.filter(order=options["term"]).first()
        if not module:
            module = course.modules.filter(title__icontains=f"Term {options['term']}").first()
        if not module:
            self.stderr.write(self.style.ERROR(f"Term {options['term']} not found on {course.slug}"))
            return

        lessons = list(module.lessons.all())
        by_week: dict[int, dict[int, Lesson]] = {}
        for lesson in lessons:
            week = lesson_week_number(lesson.title)
            if week is None:
                continue
            by_week.setdefault(week, {})[_lesson_num(lesson.title)] = lesson

        weeks = sorted(by_week)
        if options.get("week"):
            weeks = [w for w in weeks if w == options["week"]]

        for week in weeks:
            pair = by_week[week]
            lesson1 = pair.get(1)
            lesson2 = pair.get(2)
            if not lesson1 or not lesson2:
                self.stdout.write(self.style.WARNING(f"  Week {week}: missing Lesson 1 or 2 — skip"))
                continue

            # Source of truth: Lesson 1 stored plan (full curriculum plan for this week)
            plan = (lesson1.content or "").strip()
            if not plan:
                self.stdout.write(self.style.WARNING(f"  Week {week}: empty content on Lesson 1 — skip"))
                continue

            built = split_plan_into_week(plan, week)
            self.stdout.write(f"\n{course.slug} / {module.title} / Week {week}")
            self.stdout.write(f"  Plan chars: {len(plan)}")
            self.stdout.write(f"  L1 spoken chars: {len(built['lesson1_text'])}")
            self.stdout.write(f"  L2 spoken chars: {len(built['lesson2_text'])}")

            if not execute:
                continue

            with transaction.atomic():
                # Keep full plan on Lesson 1 content; Lesson 2 content mirrors same plan for instructors
                lesson1.overview = built["overview"]
                lesson1.lesson_text = built["lesson1_text"]
                lesson1.save(update_fields=["overview", "lesson_text"])

                lesson2.content = plan
                lesson2.overview = built["overview"]
                lesson2.lesson_text = built["lesson2_text"]
                lesson2.save(update_fields=["content", "overview", "lesson_text"])

                if course.slug == "ai-robotics-stage-1" and week == 1:
                    _replace_quiz(lesson1, "Week 1 - Lesson 1 Quiz", STAGE1_WEEK1_QUIZ_L1)
                    _replace_quiz(lesson2, "Week 1 - Lesson 2 Quiz", STAGE1_WEEK1_QUIZ_L2)

                for lesson in (lesson1, lesson2):
                    for material in lesson.materials.all():
                        if is_instructor_plan_material(material) and not material.is_instructor_only:
                            material.is_instructor_only = True
                            material.save(update_fields=["is_instructor_only"])

        self._flag_plans(execute, course_slug=options["slug"])

        if not execute:
            self.stdout.write(self.style.WARNING("\nDry-run only. Re-run with --execute to apply."))
        else:
            self.stdout.write(self.style.SUCCESS("\nDone."))

    def _flag_plans(self, execute: bool, course_slug: str | None = None):
        qs = LessonMaterial.objects.select_related("lesson__module__course")
        if course_slug:
            qs = qs.filter(lesson__module__course__slug=course_slug)
        else:
            qs = qs.filter(lesson__module__course__slug__startswith="ai-robotics-stage-")

        flagged = 0
        for material in qs:
            if material.is_instructor_only:
                continue
            if is_instructor_plan_material(material) or self._looks_like_plan_file(material):
                flagged += 1
                if execute:
                    material.is_instructor_only = True
                    material.save(update_fields=["is_instructor_only"])
        self.stdout.write(f"Plan materials to flag instructor-only: {flagged}")

    @staticmethod
    def _looks_like_plan_file(material: LessonMaterial) -> bool:
        blob = f"{material.title or ''} {getattr(material.file, 'name', '') or ''}".lower()
        return bool(
            re.search(r"lesson\d+stage\d+", blob)
            or re.search(r"stage\d+_?lesson\d+", blob)
            or ("lesson" in blob and "stage" in blob and blob.endswith(".docx"))
        )
