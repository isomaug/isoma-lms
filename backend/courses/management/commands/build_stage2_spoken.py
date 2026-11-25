"""Build formatted spoken lesson_text for Stage 2 from stored plans."""

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


def studentize(line: str) -> str:
    line = line.replace("Facilitator", "Your teacher")
    line = line.replace("facilitator", "your teacher")
    line = line.replace("Learners", "You")
    line = line.replace("learners", "you")
    return line.strip()


def bullets(text: str) -> list[str]:
    lines = []
    for raw in (text or "").splitlines():
        line = raw.strip()
        if not line:
            continue
        if line.startswith("#"):
            line = re.sub(r"^#+\s*", "", line)
        line = re.sub(r"^[\*\-]\s*", "", line)
        line = re.sub(r"^\d+\.\s*", "", line)
        line = studentize(line)
        if line:
            lines.append(line)
    return lines


def to_md_bullets(items: list[str]) -> str:
    return "\n".join(f"* {item}" for item in items if item)


def to_md_steps(items: list[str]) -> str:
    if len(items) == 1 and len(items[0]) > 200:
        parts = re.split(r"(?<=[.!?])\s+(?=[A-Z\"“])", items[0])
        items = [p.strip() for p in parts if p.strip()]
    return "\n".join(f"{i}. {item}" for i, item in enumerate(items, start=1) if item)


def build_spoken(plan: str, week: int, part: int, duration: int = 60) -> tuple[str, str]:
    objectives = extract_section(plan, "Learning Objectives")
    structure = extract_section(plan, "Lesson Structure") or extract_section(plan, "Lesson Steps")
    assessment = extract_section(plan, "Assessment")
    vocabulary = extract_section(plan, "Key Vocabulary")

    obj_items = bullets(objectives) or ["Complete today's ScratchJr activities with your partner."]
    overview = to_md_bullets(obj_items)
    struct_items = bullets(structure)
    structure_md = to_md_steps(struct_items) if struct_items else "1. Follow your teacher's live demo on ScratchJr."

    title = f"# Week {week} - Lesson {part}\n"
    if part == 1:
        sections = [
            title,
            f"## Session length\n**{duration} minutes**\n",
            "## Today you will\n" + overview + "\n",
            "## Let's begin\n" + structure_md + "\n",
        ]
    else:
        sections = [
            title,
            f"## Session length\n**{duration} minutes**\n",
            "## Finish the week\n" + overview + "\n",
            "## Continue\n" + structure_md + "\n",
        ]
    if assessment:
        sections.append("## Check your understanding\n" + to_md_bullets(bullets(assessment)) + "\n")
    if vocabulary:
        sections.append("## Key words\n" + to_md_bullets(bullets(vocabulary)) + "\n")
    return overview, "\n".join(sections).strip() + "\n"


class Command(BaseCommand):
    help = "Generate formatted Stage 2 spoken lesson_text from stored lesson plans."

    def add_arguments(self, parser):
        parser.add_argument("--term", type=int, help="Only one term order (1/2/3)")
        parser.add_argument("--execute", action="store_true")

    def handle(self, *args, **options):
        course = Course.objects.filter(slug="ai-robotics-stage-2").first()
        if not course:
            self.stderr.write("Stage 2 course not found")
            return
        modules = course.modules.all().order_by("order")
        if options.get("term"):
            modules = modules.filter(order=options["term"])

        updates = []
        for module in modules:
            for lesson in module.lessons.all():
                week = lesson_week_number(lesson.title)
                part = lesson_num(lesson.title)
                if week is None:
                    continue
                plan = (lesson.content or lesson.lesson_text or "").strip()
                duration = lesson.duration_minutes or 60
                overview, spoken = build_spoken(plan, week, part, duration)
                updates.append((lesson.id, lesson.title, overview, spoken))
                self.stdout.write(f"{module.title} / {lesson.title}: {len(spoken)} chars")

        if options["execute"]:
            with transaction.atomic():
                for lid, _title, overview, spoken in updates:
                    Lesson.objects.filter(id=lid).update(overview=overview, lesson_text=spoken)
            self.stdout.write(self.style.SUCCESS(f"Updated {len(updates)} lessons"))
        else:
            self.stdout.write(self.style.WARNING("Dry-run. Re-run with --execute to save."))
