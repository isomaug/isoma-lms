import re
from django.core.management.base import BaseCommand
from courses.models import Course, Module, Lesson, Cohort, CohortLessonSchedule

CAPSTONE_SESSIONS = [
    {
        "session_num": 1,
        "week_num": 9,
        "lesson_num": 1,
        "order": 90,
        "title": "Week 9 - Lesson 1",
        "overview": "Introduction to the Capstone challenge. Students select their domain: Smart City, Rescue Bot, or Space Explorer, defining core problem statements and mission goals.",
    },
    {
        "session_num": 2,
        "week_num": 9,
        "lesson_num": 2,
        "order": 91,
        "title": "Week 9 - Lesson 2",
        "overview": "Drafting mechanical blueprints and structural diagrams. Deciding sensor placements, gear ratios, and motor drive layouts.",
    },
    {
        "session_num": 3,
        "week_num": 10,
        "lesson_num": 1,
        "order": 100,
        "title": "Week 10 - Lesson 1",
        "overview": "Assembling the mobile robotic base using robotics hardware. Constructing rigid frames, differentials, and wheel alignments.",
    },
    {
        "session_num": 4,
        "week_num": 10,
        "lesson_num": 2,
        "order": 101,
        "title": "Week 10 - Lesson 2",
        "overview": "Programming baseline movement routines. Calibrating encoder rotations for straight-line accuracy and 90-degree turns.",
    },
    {
        "session_num": 5,
        "week_num": 11,
        "lesson_num": 1,
        "order": 110,
        "title": "Week 11 - Lesson 1",
        "overview": "Mounting Ultrasonic distance sensors and Color/Light sensors onto the chassis with vibration damping.",
    },
    {
        "session_num": 6,
        "week_num": 11,
        "lesson_num": 2,
        "order": 111,
        "title": "Week 11 - Lesson 2",
        "overview": "Coding closed-loop sensor feedback loops. Implementing autonomous obstacle detection and reactive steering algorithms.",
    },
    {
        "session_num": 7,
        "week_num": 12,
        "lesson_num": 1,
        "order": 120,
        "title": "Week 12 - Lesson 1",
        "overview": "Designing active manipulators: robotic claws, motorized lifting arms, or sweepers to interact with mission objects.",
    },
    {
        "session_num": 8,
        "week_num": 12,
        "lesson_num": 2,
        "order": 121,
        "title": "Week 12 - Lesson 2",
        "overview": "Programming multi-step motor sequences for grasping, lifting, and sorting mission payload items safely.",
    },
    {
        "session_num": 9,
        "week_num": 13,
        "lesson_num": 1,
        "order": 130,
        "title": "Week 13 - Lesson 1",
        "overview": "Merging locomotion, perception, and manipulation routines into a cohesive master mission script.",
    },
    {
        "session_num": 10,
        "week_num": 13,
        "lesson_num": 2,
        "order": 131,
        "title": "Week 13 - Lesson 2",
        "overview": "Simulating arena competition rounds. Identifying mechanical stress points, battery voltage drops, and software edge cases.",
    },
    {
        "session_num": 11,
        "week_num": 14,
        "lesson_num": 1,
        "order": 140,
        "title": "Week 14 - Lesson 1",
        "overview": "Iterating on code efficiency and mechanical tolerances. Optimizing autonomous mission cycle times.",
    },
    {
        "session_num": 12,
        "week_num": 14,
        "lesson_num": 2,
        "order": 141,
        "title": "Week 14 - Lesson 2",
        "overview": "Compiling the Engineering Design Log, system architecture diagrams, and preparing team presentation slides.",
    },
    {
        "session_num": 13,
        "week_num": 15,
        "lesson_num": 1,
        "order": 150,
        "title": "Week 15 - Lesson 1",
        "overview": "Dry-run live field demonstrations. Conducting peer code reviews and stress-testing under simulated spectator conditions.",
    },
    {
        "session_num": 14,
        "week_num": 15,
        "lesson_num": 2,
        "order": 151,
        "title": "Week 15 - Lesson 2",
        "overview": "Rigorous timed runs in the obstacle arena. Validating autonomous scores and driver assist routines.",
    },
    {
        "session_num": 15,
        "week_num": 16,
        "lesson_num": 1,
        "order": 160,
        "title": "Week 16 - Lesson 1",
        "overview": "Final capstone project presentation and live obstacle arena demonstration for school faculty, parents, and peers.",
    },
    {
        "session_num": 16,
        "week_num": 16,
        "lesson_num": 2,
        "order": 161,
        "title": "Week 16 - Lesson 2",
        "overview": "Team debriefing, evaluation rubric reviews, awards ceremony, and archival of engineering logs and code repositories.",
    },
]

TARGET_COURSES = [
    "ai-robotics-stage-1",
    "ai-robotics-stage-2",
    "ai-robotics-stage-3",
    "ai-robotics-stage-4",
    "ai-robotics-stage-5",
    "ai-robotics-stage-6",
]

class Command(BaseCommand):
    help = "Seeds 16 Capstone Project Studio milestone lessons into Term 1 across Stages 1-6 and connects them to timetable schedules."

    def handle(self, *args, **options):
        total_created = 0
        total_updated = 0
        total_schedules_linked = 0

        for slug in TARGET_COURSES:
            course = Course.objects.filter(slug=slug).first()
            if not course:
                self.stdout.write(self.style.WARNING(f"Course '{slug}' not found, skipping."))
                continue

            term1 = course.modules.filter(order=1).first() or course.modules.filter(title__icontains="Term 1").first()
            if not term1:
                self.stdout.write(self.style.WARNING(f"Term 1 module not found for '{slug}', skipping."))
                continue

            self.stdout.write(f"\nProcessing '{course.title}' (Module: '{term1.title}')...")
            session_lesson_map = {}

            for s_info in CAPSTONE_SESSIONS:
                content = (
                    f"# {s_info['title']}: Capstone Project Studio\n\n"
                    f"## Overview\n{s_info['overview']}\n\n"
                    f"## Objectives\n"
                    f"- Hands-on engineering design process.\n"
                    f"- Collaborative robotics implementation.\n"
                    f"- Document findings and design decisions in Engineering Log.\n"
                )
                lesson, created = Lesson.objects.update_or_create(
                    module=term1,
                    order=s_info["order"],
                    defaults={
                        "title": s_info["title"],
                        "overview": s_info["overview"],
                        "content": content,
                        "duration_minutes": 50,
                        "is_preview": False,
                        "is_visible": True,
                    }
                )
                session_lesson_map[s_info["session_num"]] = lesson
                if created:
                    total_created += 1
                else:
                    total_updated += 1

            self.stdout.write(f"  -> Lessons synced: {len(session_lesson_map)} Capstone lessons in Term 1.")

            # Link timetable schedules for each cohort attached to this course
            cohorts = Cohort.objects.filter(course=course)
            for cohort in cohorts:
                named_capstones = cohort.schedules.filter(custom_title__icontains="Capstone Project Studio - Session")
                if named_capstones.exists():
                    for sch in named_capstones:
                        m = re.search(r"Session\s*(\d+)", sch.custom_title, re.IGNORECASE)
                        if m:
                            s_num = int(m.group(1))
                            if s_num in session_lesson_map:
                                sch.lesson = session_lesson_map[s_num]
                                sch.save(update_fields=["lesson"])
                                total_schedules_linked += 1
                    self.stdout.write(f"  -> Linked {named_capstones.count()} named Capstone schedules for cohort '{cohort.name}'.")
                else:
                    later_schedules = list(cohort.schedules.filter(date__gte="2026-10-18").order_by("date"))
                    if later_schedules:
                        linked_count = 0
                        for idx, sch in enumerate(later_schedules):
                            s_num = idx + 1
                            if s_num in session_lesson_map:
                                sch.lesson = session_lesson_map[s_num]
                                sch.custom_title = f"Capstone Project Studio - Session {s_num}"
                                sch.save(update_fields=["lesson", "custom_title"])
                                linked_count += 1
                                total_schedules_linked += 1
                        self.stdout.write(f"  -> Linked {linked_count} Capstone schedules from date sequence for cohort '{cohort.name}'.")

        self.stdout.write(self.style.SUCCESS(
            f"\nDONE! Capstone Lessons created: {total_created}, updated: {total_updated}. Timetable schedules linked: {total_schedules_linked}."
        ))
