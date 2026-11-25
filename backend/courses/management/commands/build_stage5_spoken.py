"""Build formatted spoken lesson_text for Stage 5 from stored plans."""

from __future__ import annotations

import re

from django.core.management.base import BaseCommand
from django.db import transaction

from courses.models import Course, Lesson
from courses.visibility import lesson_week_number


LESSON_NUM_RE = re.compile(r"Lesson\s+(\d+)", re.I)


def lesson_num(title: str) -> int:
    match = LESSON_NUM_RE.search(title or "")
    return int(match.group(1)) if match else 1


def extract_section(plan: str, heading: str) -> str:
    pattern = re.compile(
        rf"^##\s*{re.escape(heading)}\s*\n(.*?)(?=^##\s|\Z)",
        re.I | re.M | re.S,
    )
    match = pattern.search(plan or "")
    return (match.group(1).strip() if match else "").strip()


def bullets(text: str) -> list[str]:
    lines = []
    for raw in (text or "").splitlines():
        line = raw.strip()
        if not line:
            continue
        line = re.sub(r"^[\*\-]\s*", "", line)
        line = re.sub(r"^\d+\.\s*", "", line)
        line = re.sub(r"^###\s*", "", line)
        line = line.replace("Facilitator", "Your teacher")
        line = line.replace("facilitator", "your teacher")
        line = line.replace("Learners", "You")
        line = line.replace("learners", "you")
        lines.append(line)
    return lines


def to_md_bullets(items: list[str]) -> str:
    return "\n".join(f"* {item}" for item in items if item)


def to_md_steps(items: list[str]) -> str:
    return "\n".join(f"{i}. {item}" for i, item in enumerate(items, start=1) if item)


def maybe_code_fence(text: str) -> str:
    """If text looks like Arduino/C++, wrap as a copyable code block."""
    if not text:
        return ""
    if re.search(r"\b(void\s+setup|void\s+loop|pinMode|digitalWrite|analogRead|Serial\.)\b", text):
        # Extract likely code-ish lines
        code_lines = []
        prose = []
        for line in text.splitlines():
            s = line.strip()
            if re.search(r"(void\s+setup|void\s+loop|pinMode|digitalWrite|digitalRead|analogRead|Serial\.|delay\(|int |float |String |const int|HIGH|LOW|OUTPUT|INPUT)", s):
                code_lines.append(s.rstrip(";").rstrip() + ("" if s.endswith("{") or s.endswith("}") or s.endswith(";") or s.endswith("(") else ""))
                # keep original-ish
                code_lines[-1] = s
            else:
                if s:
                    prose.append(s)
        if len(code_lines) >= 2:
            code = "\n".join(code_lines)
            prose_md = to_md_bullets(prose) if prose else ""
            return (prose_md + "\n\n" if prose_md else "") + f"```cpp\n{code}\n```"
    return to_md_steps(bullets(text)) if text else ""


def build_spoken(plan: str, week: int, part: int) -> tuple[str, str]:
    objectives = extract_section(plan, "Learning Objectives")
    structure = extract_section(plan, "Lesson Structure")
    assessment = extract_section(plan, "Assessment")
    vocabulary = extract_section(plan, "Key Vocabulary")
    if not objectives and not structure:
        # stub / empty
        overview = "* Complete today's Stage 5 Arduino activities with your partner."
        body = (
            f"# Week {week} - Lesson {part}\n\n"
            f"## Session length\n**60 minutes**\n\n"
            f"## Today you will\n{overview}\n\n"
            f"> Your teacher will open this week's lesson plan and guide the session.\n"
        )
        return overview, body

    obj_items = bullets(objectives) or [objectives]
    overview = to_md_bullets(obj_items)

    struct_items = bullets(structure)
    # Prefer numbered steps for structure
    structure_md = to_md_steps(struct_items) if struct_items else maybe_code_fence(structure)

    title = f"# Week {week} - Lesson {part}\n"
    if part == 1:
        sections = [
            title,
            "## Session length\n**60 minutes**\n",
            "## Today you will\n" + overview + "\n",
            "## Let's begin\n" + structure_md + "\n",
        ]
    else:
        sections = [
            title,
            "## Session length\n**60 minutes**\n",
            "## Finish the week\n" + overview + "\n",
            "## Continue\n" + structure_md + "\n",
        ]

    if assessment:
        sections.append("## Check your understanding\n" + to_md_bullets(bullets(assessment)) + "\n")
    if vocabulary:
        sections.append("## Key words\n" + to_md_bullets(bullets(vocabulary)) + "\n")

    # Inject common Stage 5 code examples when Blink / Serial / analogRead mentioned
    blob = (plan or "").lower()
    if "blink" in blob and "delay" in blob and part == 1:
        sections.insert(
            4,
            "## Blink sketch\n\n```cpp\nvoid setup() {\n  pinMode(13, OUTPUT);\n}\n\n"
            "void loop() {\n  digitalWrite(13, HIGH);\n  delay(1000);\n  digitalWrite(13, LOW);\n  delay(1000);\n}\n```\n",
        )
    if "serial" in blob and "string" in blob and part == 2:
        sections.append(
            "## Example serial print\n\n```cpp\nvoid setup() {\n  Serial.begin(9600);\n  Serial.println(\"Hello\");\n}\n\nvoid loop() {\n}\n```\n"
        )
    if "analogread" in blob or "ldr" in blob:
        sections.append(
            "## Example LDR read\n\n```cpp\nvoid setup() {\n  Serial.begin(9600);\n}\n\n"
            "void loop() {\n  int lightValue = analogRead(A0);\n  Serial.println(lightValue);\n  delay(500);\n}\n```\n"
        )

    return overview, "\n".join(sections).strip() + "\n"


class Command(BaseCommand):
    help = "Generate formatted Stage 5 spoken lesson_text from stored lesson plans."

    def add_arguments(self, parser):
        parser.add_argument("--term", type=int, help="Only one term order (1/2/3)")
        parser.add_argument("--execute", action="store_true")
        parser.add_argument("--dump-sql", action="store_true", help="Print SQL updates")

    def handle(self, *args, **options):
        course = Course.objects.filter(slug="ai-robotics-stage-5").first()
        if not course:
            self.stderr.write("Stage 5 course not found")
            return
        modules = course.modules.all().order_by("order")
        if options.get("term"):
            modules = modules.filter(order=options["term"])

        updates = []
        for module in modules:
            lessons = list(module.lessons.all())
            for lesson in lessons:
                week = lesson_week_number(lesson.title)
                part = lesson_num(lesson.title)
                if week is None:
                    continue
                plan = (lesson.content or "").strip()
                overview, spoken = build_spoken(plan, week, part)
                updates.append((lesson.id, lesson.title, overview, spoken))
                self.stdout.write(f"{module.title} / {lesson.title}: {len(spoken)} chars")

        if options.get("dump_sql"):
            for lid, title, overview, spoken in updates:
                tag = f"s5{lid}"
                print(
                    f"UPDATE courses_lesson SET overview = ${tag}o${overview}${tag}o$, "
                    f"lesson_text = ${tag}t${spoken}${tag}t$ WHERE id = {lid};"
                )

        if options["execute"]:
            with transaction.atomic():
                for lid, _title, overview, spoken in updates:
                    Lesson.objects.filter(id=lid).update(overview=overview, lesson_text=spoken)
            self.stdout.write(self.style.SUCCESS(f"Updated {len(updates)} lessons"))
        else:
            self.stdout.write(self.style.WARNING("Dry-run. Re-run with --execute to save."))
