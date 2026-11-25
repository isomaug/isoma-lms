from django.core.management.base import BaseCommand
from courses.models import Course, Module, Lesson

CAPSTONE_MILESTONES = [
    (90, "Capstone Milestone 1A: Project Kickoff & Theme Selection",
     "Introduction to the Capstone challenge. Students select their domain: Smart City, Rescue Bot, or Space Explorer, defining core problem statements and mission goals."),
    (91, "Capstone Milestone 1B: System Architecture & Engineering Sketching",
     "Drafting mechanical blueprints and structural diagrams. Deciding sensor placements, gear ratios, and motor drive layouts."),
    (100, "Capstone Milestone 2A: Chassis & Drivetrain Prototyping",
     "Assembling the mobile robotic base using LEGO Spike Prime. Constructing rigid frames, differentials, and wheel alignments."),
    (101, "Capstone Milestone 2B: Baseline Motor Calibration & Movement Testing",
     "Programming baseline movement routines in Python / Word Blocks. Calibrating encoder rotations for straight-line accuracy and 90-degree turns."),
    (110, "Capstone Milestone 3A: Sensor Integration & Mechanical Mounts",
     "Mounting Ultrasonic distance sensors and Color/Light sensors onto the chassis with vibration damping."),
    (111, "Capstone Milestone 3B: Perception Code & Collision Avoidance",
     "Coding closed-loop sensor feedback loops. Implementing autonomous obstacle detection and reactive steering algorithms."),
    (120, "Capstone Milestone 4A: Manipulator & Attachment Engineering",
     "Designing active manipulators: robotic claws, motorized lifting arms, or sweepers to interact with mission objects."),
    (121, "Capstone Milestone 4B: Actuation Control & Task Sequencing",
     "Programming multi-step motor sequences for grasping, lifting, and sorting mission payload items safely."),
    (130, "Capstone Milestone 5A: End-to-End System Integration",
     "Merging locomotion, perception, and manipulation routines into a cohesive master mission script."),
    (131, "Capstone Milestone 5B: Stress Testing & Mission Simulation",
     "Simulating arena competition rounds. Identifying mechanical stress points, battery voltage drops, and software edge cases."),
    (140, "Capstone Milestone 6A: Refinement & Performance Tuning",
     "Iterating on code efficiency and mechanical tolerances. Optimizing autonomous mission cycle times."),
    (141, "Capstone Milestone 6B: Pitch Deck & Engineering Log Documentation",
     "Compiling the Engineering Design Log, system architecture diagrams, and preparing team presentation slides."),
    (150, "Capstone Milestone 7A: Demo Rehearsal & Peer Critique",
     "Dry-run live field demonstrations. Conducting peer code reviews and stress-testing under simulated spectator conditions."),
    (151, "Capstone Milestone 7B: Grand Showcase & Exhibition",
     "Final capstone project presentation and live obstacle arena demonstration for school faculty, parents, and peers."),
]

class Command(BaseCommand):
    help = "Seeds 14 guided Capstone Project milestone lessons into Stage 1 Term 1 (ai-robotics-stage-1)"

    def handle(self, *args, **options):
        course = Course.objects.filter(slug__icontains="stage-1").first()
        if not course:
            self.stdout.write(self.style.ERROR("Stage 1 course not found."))
            return

        term1_module = course.modules.filter(order=1).first() or course.modules.filter(title__icontains="Term 1").first()
        if not term1_module:
            self.stdout.write(self.style.ERROR("Term 1 module not found in Stage 1."))
            return

        self.stdout.write(f"Seeding Capstone lessons into '{course.title}' -> '{term1_module.title}'...")

        created_count = 0
        updated_count = 0

        for order, title, overview in CAPSTONE_MILESTONES:
            lesson, created = Lesson.objects.update_or_create(
                module=term1_module,
                order=order,
                defaults={
                    "title": title,
                    "overview": overview,
                    "content": f"# {title}\n\n## Overview\n{overview}\n\n## Objectives\n- Hands-on engineering design process.\n- Collaborative robotics implementation.\n- Document findings in Engineering Log.\n",
                    "duration_minutes": 60,
                    "is_preview": False,
                    "is_visible": True,
                }
            )
            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(self.style.SUCCESS(
            f"Successfully synced Capstone lessons! Created: {created_count}, Updated: {updated_count}. Total in module: {term1_module.lessons.count()}."
        ))
