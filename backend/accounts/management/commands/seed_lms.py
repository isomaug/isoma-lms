from decimal import Decimal
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from academy.models import Course as AcademyCourse
from accounts.models import UserProfile as LmsUserProfile
from courses.models import Course, Enrollment, Lesson, Module
from tenants.models import Institution


class Command(BaseCommand):
    help = "Seed default Isoma Edutech tenant, demo admin account, and real courses with modules & lessons."

    def handle(self, *args, **options):
        inst, _ = Institution.objects.update_or_create(
            subdomain="learn",
            defaults={
                "name": "ISOMA EDUTECH LIMITED",
                "initials": "IE",
                "tier": "OPEN_ACADEMY",
                "curriculum": "UNEB_LOWER_SECONDARY",
                "country": "Uganda",
                "currency": "UGX",
                "phone": "+256778261026",
                "email": "isomaug@gmail.com",
                "is_public_academy": True,
                "onboarding_status": "COMPLETED",
            },
        )

        # Seed a realistic demo School tenant (stmarys.isomaug.com) with dual curricula + all 16 role accounts
        school, _ = Institution.objects.update_or_create(
            subdomain="stmarys",
            defaults={
                "name": "ST. MARY'S COLLEGE KISUBI",
                "initials": "SM",
                "custom_domain": "portal.stmarys.ac.ug",
                "tier": "SECONDARY",
                "curriculum": "UNEB_LOWER_SECONDARY",
                "curricula": ["UNEB_LOWER_SECONDARY", "CAMBRIDGE_IGCSE"],
                "country": "Uganda",
                "currency": "UGX",
                "phone": "+256414320120",
                "email": "admin@stmarys.ac.ug",
                "is_public_academy": False,
                "onboarding_status": "COMPLETED",
            },
        )

        demo_school_staff = [
            ("stmarys_principal", "Bro. Deodati Aganyira", "principal@stmarys.ac.ug", "PRINCIPAL", "+256772100001"),
            ("stmarys_dos", "Mr. Emmanuel Kigozi", "dos@stmarys.ac.ug", "DOS", "+256772100009"),
            ("stmarys_admissions", "Ms. Harriet Nankya", "admissions@stmarys.ac.ug", "ADMISSIONS", "+256772100010"),
            ("stmarys_teacher", "Mr. Patrick Okello", "teacher@stmarys.ac.ug", "TEACHER", "+256772100002"),
            ("stmarys_student", "Grace Namukasa", "student@stmarys.ac.ug", "STUDENT", "+256772100003"),
            ("stmarys_parent", "Mrs. Sarah Namukasa", "parent@stmarys.ac.ug", "PARENT", "+256772100004"),
            ("stmarys_bursar", "Mr. Robert Ssemwogerere", "bursar@stmarys.ac.ug", "BURSAR", "+256772100005"),
            ("stmarys_hr", "Ms. Joanita Akello", "hr@stmarys.ac.ug", "HR_PAYROLL", "+256772100011"),
            ("stmarys_canteen", "Mr. Musa Lubega", "canteen@stmarys.ac.ug", "CANTEEN", "+256772100012"),
            ("stmarys_housemaster", "Mr. Charles Ochieng", "housemaster@stmarys.ac.ug", "HOUSEMASTER", "+256772100013"),
            ("stmarys_nurse", "Sr. Florence Achen", "nurse@stmarys.ac.ug", "NURSE", "+256772100006"),
            ("stmarys_security", "Sgt. John Bosco Otim", "security@stmarys.ac.ug", "GUARD", "+256772100007"),
            ("stmarys_librarian", "Ms. Brenda Nabirye", "librarian@stmarys.ac.ug", "LIBRARIAN", "+256772100008"),
            ("stmarys_procurement", "Mr. Denis Kato", "procurement@stmarys.ac.ug", "PROCUREMENT", "+256772100014"),
            ("stmarys_transport", "Mr. Samuel Wasswa", "transport@stmarys.ac.ug", "TRANSPORT", "+256772100015"),
            ("stmarys_games", "Coach Isaac Odongo", "games@stmarys.ac.ug", "GAMES", "+256772100016"),
        ]
        for uname, full, mail, role, ph in demo_school_staff:
            parts = full.split()
            u, u_created = User.objects.get_or_create(
                username=uname,
                defaults={"email": mail, "first_name": parts[0], "last_name": " ".join(parts[1:])},
            )
            if u_created:
                u.set_password("Isoma2026!")
                u.save()
            LmsUserProfile.objects.update_or_create(
                user=u,
                defaults={"institution": school, "role": role, "phone": ph},
            )

        user, created = User.objects.get_or_create(
            username="isoma_admin",
            defaults={
                "email": "isomaug@gmail.com",
                "first_name": "Isoma",
                "last_name": "Admin",
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            user.set_password("Isoma2026!")
            user.save()

        LmsUserProfile.objects.update_or_create(
            user=user,
            defaults={
                "institution": inst,
                "role": "SUPER_ADMIN",
                "phone": "+256778261026",
            },
        )

        starter_courses = [
            {
                "slug": "ai-coding-robotics-stage-2",
                "title": "AI, Coding & Robotics - Stage 2",
                "subtitle": "Hands-on microcontroller algorithms, sensors, and adaptive AI prototypes.",
                "category": "AI_ROBOTICS",
                "level": "Intermediate",
                "price": Decimal("40.00"),
                "price_ugx": 150000,
                "duration": "8 Weeks",
            },
            {
                "slug": "cambridge-as-a-level-it",
                "title": "Cambridge International AS & A-Level IT (9626)",
                "subtitle": "Complete syllabus coverage, practical lab walkthroughs, and past paper mastery.",
                "category": "CAMBRIDGE_IT",
                "level": "Advanced",
                "price": Decimal("65.00"),
                "price_ugx": 250000,
                "duration": "12 Weeks",
            },
            {
                "slug": "uneb-lower-secondary-ict-cbc",
                "title": "UNEB Competency-Based ICT & Digital Literacy",
                "subtitle": "Activities of Integration (AOI), practical projects, and assessment rubrics.",
                "category": "UNEB_STEM",
                "level": "Beginner",
                "price": Decimal("25.00"),
                "price_ugx": 100000,
                "duration": "10 Weeks",
            },
            {
                "slug": "fullstack-web-engineering-uganda",
                "title": "Full-Stack Web Engineering with Django & React",
                "subtitle": "Build production SaaS platforms, REST APIs, and Mobile Money integrations.",
                "category": "PROGRAMMING",
                "level": "Intermediate",
                "price": Decimal("90.00"),
                "price_ugx": 350000,
                "duration": "10 Weeks",
            },
        ]

        for item in starter_courses:
            AcademyCourse.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "institution": inst,
                    "title": item["title"],
                    "subtitle": item["subtitle"],
                    "category": item["category"],
                    "level": item["level"],
                    "price_ugx": item["price_ugx"],
                    "is_public_course": True,
                    "is_published": True,
                },
            )

            course, _ = Course.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "title": item["title"],
                    "subtitle": item["subtitle"],
                    "description": item["subtitle"],
                    "price_ugx": Decimal(str(item["price_ugx"])),
                    "level": item["level"].lower(),
                    "category": item["category"].replace("_", " ").title(),
                    "is_published": True,
                    "owner": user,
                    "assigned_instructor": user,
                },
            )
            mod, _ = Module.objects.get_or_create(
                course=course,
                order=1,
                defaults={"title": "Module 1: Foundations & Core Lab", "is_visible": True},
            )
            Lesson.objects.get_or_create(
                module=mod,
                order=1,
                defaults={
                    "title": f"Welcome to {item['title']}",
                    "overview": item["subtitle"],
                    "lesson_text": f"# {item['title']}\n\n{item['subtitle']}\n\n## Learning Outcomes\n- Understand core concepts and workflow.\n- Complete the hands-on guided lab.\n- Verify mastery with the end-of-week check.",
                    "is_preview": True,
                    "is_visible": True,
                },
            )
            Enrollment.objects.get_or_create(user=user, course=course, defaults={"is_active": True})

        self.stdout.write(self.style.SUCCESS("Seeded Isoma LMS tenant, admin user, and 4 full courses with modules & lessons."))
