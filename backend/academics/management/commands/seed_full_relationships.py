from datetime import timedelta

from django.contrib.auth.models import User
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from academics.models import (
    AcademicYear,
    ClassStream,
    CurriculumDefinition,
    CurriculumSubjectCatalog,
    CustomDomainConfig,
    MarkAuditLog,
    ReportCardSnapshot,
    StudentMark,
    StudentProfile,
    Subject,
    Term,
)
from accounts.models import UserProfile
from tenants.models import DEFAULT_PORTALS, Institution, InstitutionAuditLog


def deterministic_scores(student_idx, subject_idx, is_ecd=False):
    """Generate realistic, varied, deterministic CA and Exam scores."""
    base = 64 + ((student_idx * 7 + subject_idx * 5) % 29)
    ca = min(98.0, float(base + ((student_idx + subject_idx) % 7) - 2))
    if is_ecd:
        return round(ca, 1), 0.0
    exam = min(97.0, float(base + ((student_idx * 3 + subject_idx) % 9) - 4))
    return round(ca, 1), round(exam, 1)


def teacher_comment_for_score(score):
    if score >= 85:
        return "Outstanding mastery of concepts and strong analytical work."
    if score >= 75:
        return "Very good progress with consistent class participation."
    if score >= 65:
        return "Solid understanding; continue practicing structured questions."
    return "Steady effort shown; targeted revision will lift performance."


def report_remarks_for_average(avg):
    if avg >= 85:
        return (
            "Exemplary academic discipline and leadership in class.",
            "Distinguished term result. Keep setting the pace for your peers.",
        )
    if avg >= 75:
        return (
            "Very strong term performance across core learning areas.",
            "Commendable effort and focus. Push for top distinction next term.",
        )
    if avg >= 65:
        return (
            "Consistent academic progress. Keep up the focused effort.",
            "Promising term performance. Aim even higher next term.",
        )
    return (
        "Encouraging improvement in classwork; extra revision is advised.",
        "Good potential shown. Maintain regular study routines next term.",
    )


class Command(BaseCommand):
    help = (
        "Idempotently seed interconnected relational data across Landlord ERP, HR pipeline, "
        "class streams, official curriculum subjects, students, marks, audit logs, and report cards."
    )

    @transaction.atomic
    def handle(self, *args, **options):
        now = timezone.now()

        # 1. Ensure curriculum definitions and official subject catalog are present
        if CurriculumDefinition.objects.count() < 6 or CurriculumSubjectCatalog.objects.count() < 50:
            call_command("seed_academics")

        # 2. Ensure Institutions (stmarys + greenhill) and Custom Domains + Landlord Audit Logs
        stmarys, _ = Institution.objects.update_or_create(
            subdomain="stmarys",
            defaults={
                "name": "ST. MARY'S COLLEGE KISUBI",
                "initials": "SMC",
                "custom_domain": "portal.smack.ac.ug",
                "tier": "SECONDARY",
                "curriculum": "UNEB_LOWER_SECONDARY",
                "curricula": ["UNEB_LOWER_SECONDARY", "CAMBRIDGE_IGCSE"],
                "country": "Uganda",
                "currency": "UGX",
                "phone": "+256414320705",
                "email": "registrar@stmarys.ac.ug",
                "is_public_academy": False,
                "onboarding_status": "COMPLETED",
                "enabled_portals": list(DEFAULT_PORTALS),
                "updated_by": "isomaug@gmail.com",
            },
        )

        greenhill, _ = Institution.objects.update_or_create(
            subdomain="greenhill",
            defaults={
                "name": "GREENHILL ACADEMY KAMPALA",
                "initials": "GHA",
                "custom_domain": "portal.greenhillacademy.ac.ug",
                "tier": "PRIMARY",
                "curriculum": "UNEB_PRIMARY",
                "curricula": ["UNEB_PRIMARY", "MONTESSORI_ECD"],
                "country": "Uganda",
                "currency": "UGX",
                "phone": "+256414348651",
                "email": "admin@greenhillacademy.ac.ug",
                "is_public_academy": False,
                "onboarding_status": "COMPLETED",
                "enabled_portals": list(DEFAULT_PORTALS),
                "updated_by": "isomaug@gmail.com",
            },
        )

        CustomDomainConfig.objects.update_or_create(
            institution=stmarys,
            defaults={
                "custom_domain": "portal.smack.ac.ug",
                "cname_target": "cname.isomaug.com",
                "status": "ACTIVE",
                "ssl_status": "ISSUED",
                "last_verified_at": now - timedelta(days=3),
            },
        )

        CustomDomainConfig.objects.update_or_create(
            institution=greenhill,
            defaults={
                "custom_domain": "portal.greenhillacademy.ac.ug",
                "cname_target": "cname.isomaug.com",
                "status": "PENDING_DNS",
                "ssl_status": "PENDING",
            },
        )

        audit_entries = [
            (
                stmarys,
                "isomaug@gmail.com",
                "PROVISIONED",
                "Provisioned St. Mary's College Kisubi with dual curricula (UNEB_LOWER_SECONDARY, CAMBRIDGE_IGCSE) and 16 school portals.",
            ),
            (
                stmarys,
                "isomaug@gmail.com",
                "DOMAIN_VERIFIED",
                "Verified custom domain portal.smack.ac.ug via CNAME cname.isomaug.com and issued TLS certificate.",
            ),
            (
                stmarys,
                "principal@stmarys.ac.ug",
                "CURRICULA_SYNCED",
                "Activated UNEB Lower Secondary CBC and Cambridge IGCSE official subject catalogs for 2026 Term 1.",
            ),
            (
                greenhill,
                "isomaug@gmail.com",
                "PROVISIONED",
                "Provisioned Greenhill Academy Kampala (PRIMARY tier) with UNEB_PRIMARY and MONTESSORI_ECD curricula.",
            ),
            (
                greenhill,
                "isomaug@gmail.com",
                "ONBOARDING_COMPLETED",
                "Completed tenant onboarding and enabled all Primary and Montessori ECD academic portals.",
            ),
        ]
        for inst, actor, action, summary in audit_entries:
            InstitutionAuditLog.objects.get_or_create(
                institution=inst,
                action=action,
                changes_summary=summary,
                defaults={"edited_by": actor},
            )

        # 3. Academic Years & Terms
        stmarys_year, _ = AcademicYear.objects.get_or_create(
            institution=stmarys, name="2026", defaults={"is_current": True}
        )
        stmarys_term, _ = Term.objects.get_or_create(
            academic_year=stmarys_year, name="Term 1", defaults={"is_current": True}
        )

        greenhill_year, _ = AcademicYear.objects.get_or_create(
            institution=greenhill, name="2026", defaults={"is_current": True}
        )
        greenhill_term, _ = Term.objects.get_or_create(
            academic_year=greenhill_year, name="Term 1", defaults={"is_current": True}
        )

        # 4. Class Streams on stmarys (4 streams across both curricula)
        stmarys_streams_spec = [
            ("S.1 Blue", "S1B", "UNEB_LOWER_SECONDARY", "Mr. Patrick Okello"),
            ("S.2 Green", "S2G", "UNEB_LOWER_SECONDARY", "Ms. Beatrice Nabukenya"),
            ("Year 7 Cambridge", "Y7C", "CAMBRIDGE_IGCSE", "Mr. Emmanuel Kigozi"),
            ("Year 9 IGCSE", "Y9I", "CAMBRIDGE_IGCSE", "Dr. Kenneth Mugisha"),
        ]
        stmarys_streams = {}
        for name, code, curr_code, class_teacher in stmarys_streams_spec:
            stream, _ = ClassStream.objects.update_or_create(
                institution=stmarys,
                name=name,
                defaults={
                    "code": code,
                    "curriculum_code": curr_code,
                    "class_teacher_name": class_teacher,
                },
            )
            stmarys_streams[name] = stream

        # Normalize any legacy demo subject names on S.1 Blue / Year 7 Cambridge to official catalog names
        legacy_renames = [
            (
                stmarys_streams["S.1 Blue"],
                "ICT & Digital Literacy",
                "Information and Communications Technology (ICT)",
                "CBC-ICT",
            ),
            (
                stmarys_streams["Year 7 Cambridge"],
                "Cambridge IT (9626)",
                "Information and Communication Technology (ICT)",
                "0417",
            ),
            (
                stmarys_streams["Year 7 Cambridge"],
                "Cambridge Mathematics",
                "Cambridge Lower Secondary Mathematics",
                "1112",
            ),
        ]
        for stream, old_name, new_name, new_code in legacy_renames:
            old_subj = Subject.objects.filter(
                institution=stmarys, class_stream=stream, name=old_name
            ).first()
            if old_subj and not Subject.objects.filter(
                institution=stmarys, class_stream=stream, name=new_name
            ).exists():
                old_subj.name = new_name
                old_subj.code = new_code
                old_subj.save(update_fields=["name", "code"])

        # 5. Official Subjects per Stream from CurriculumSubjectCatalog
        stmarys_subjects_plan = {
            "S.1 Blue": [
                ("UNEB_LOWER_SECONDARY", "CBC-MATH", "Mr. Patrick Okello", ""),
                ("UNEB_LOWER_SECONDARY", "CBC-PHYS", "Mr. Patrick Okello", ""),
                ("UNEB_LOWER_SECONDARY", "CBC-ENG", "Ms. Beatrice Nabukenya", ""),
                ("UNEB_LOWER_SECONDARY", "CBC-BIO", "Ms. Christine Namazzi", ""),
                ("UNEB_LOWER_SECONDARY", "CBC-CHEM", "Mr. Ronald Tumusiime", ""),
                (
                    "UNEB_LOWER_SECONDARY",
                    "CBC-ICT",
                    "Mr. Patrick Okello",
                    "uneb-lower-secondary-ict-cbc",
                ),
            ],
            "S.2 Green": [
                ("UNEB_LOWER_SECONDARY", "CBC-MATH", "Mr. Ronald Tumusiime", ""),
                ("UNEB_LOWER_SECONDARY", "CBC-ENG", "Ms. Beatrice Nabukenya", ""),
                ("UNEB_LOWER_SECONDARY", "CBC-BIO", "Ms. Christine Namazzi", ""),
                ("UNEB_LOWER_SECONDARY", "CBC-CHEM", "Mr. Ronald Tumusiime", ""),
                ("UNEB_LOWER_SECONDARY", "CBC-GEOG", "Mr. Geoffrey Ssekitoleko", ""),
                ("UNEB_LOWER_SECONDARY", "CBC-HIST", "Ms. Beatrice Nabukenya", ""),
            ],
            "Year 7 Cambridge": [
                ("CAMBRIDGE_IGCSE", "1111", "Ms. Diana Nalwoga", ""),
                ("CAMBRIDGE_IGCSE", "1112", "Mr. Emmanuel Kigozi", ""),
                ("CAMBRIDGE_IGCSE", "1113", "Dr. Kenneth Mugisha", ""),
                ("CAMBRIDGE_IGCSE", "1129", "Ms. Diana Nalwoga", ""),
                ("CAMBRIDGE_IGCSE", "0417", "Mr. Emmanuel Kigozi", "cambridge-as-a-level-it"),
            ],
            "Year 9 IGCSE": [
                ("CAMBRIDGE_IGCSE", "0500", "Ms. Diana Nalwoga", ""),
                ("CAMBRIDGE_IGCSE", "0580", "Mr. Emmanuel Kigozi", ""),
                ("CAMBRIDGE_IGCSE", "0610", "Ms. Christine Namazzi", ""),
                ("CAMBRIDGE_IGCSE", "0620", "Dr. Kenneth Mugisha", ""),
                ("CAMBRIDGE_IGCSE", "0625", "Dr. Kenneth Mugisha", ""),
                ("CAMBRIDGE_IGCSE", "0417", "Mr. Patrick Okello", ""),
            ],
        }

        stmarys_stream_subjects = {}
        for stream_name, entries in stmarys_subjects_plan.items():
            stream = stmarys_streams[stream_name]
            subj_list = []
            for curr_code, catalog_code, teacher_name, slug in entries:
                cat = CurriculumSubjectCatalog.objects.filter(
                    curriculum_code=curr_code, code=catalog_code
                ).first()
                if not cat:
                    raise ValueError(
                        f"Catalog entry not found for curriculum={curr_code}, code={catalog_code}"
                    )
                subj, _ = Subject.objects.update_or_create(
                    institution=stmarys,
                    class_stream=stream,
                    name=cat.name,
                    defaults={
                        "code": cat.code,
                        "teacher_name": teacher_name,
                        "source_course_slug": slug,
                    },
                )
                subj_list.append(subj)
            stmarys_stream_subjects[stream_name] = subj_list

        # 6. Enrich existing 16 stmarys role portal accounts + seed additional ACTIVE teachers & HR pipeline
        existing_dept_map = {
            "stmarys_principal": ("Executive Administration", "FULL_TIME", "+256772100001"),
            "stmarys_dos": ("Academic Affairs & Cambridge", "FULL_TIME", "+256772100002"),
            "stmarys_teacher": ("STEM & ICT Department", "FULL_TIME", "+256772100003"),
            "stmarys_admissions": ("Admissions & Registry", "FULL_TIME", "+256772100005"),
            "stmarys_bursar": ("Finance & Bursary", "FULL_TIME", "+256772100006"),
            "stmarys_hr": ("Human Resources & Payroll", "FULL_TIME", "+256772100007"),
            "stmarys_canteen": ("Catering & Canteen Services", "FIXED_TERM", "+256772100008"),
            "stmarys_housemaster": ("Boarding & Student Welfare", "FULL_TIME", "+256772100009"),
            "stmarys_nurse": ("Health & Sickbay", "FULL_TIME", "+256772100010"),
            "stmarys_security": ("Campus Security", "FIXED_TERM", "+256772100011"),
            "stmarys_librarian": ("Library & Resource Center", "FULL_TIME", "+256772100012"),
            "stmarys_procurement": ("Stores & Procurement", "FULL_TIME", "+256772100013"),
            "stmarys_transport": ("Transport & Fleet", "FIXED_TERM", "+256772100014"),
            "stmarys_games": ("Sports & Co-Curricular", "FULL_TIME", "+256772100015"),
            "stmarys_student": ("Student Body", "FULL_TIME", "+256772100016"),
            "stmarys_parent": ("Parent Community", "FULL_TIME", "+256772100004"),
        }
        for username, (dept, contract, phone) in existing_dept_map.items():
            profile = UserProfile.objects.filter(user__username=username).first()
            if profile:
                profile.department = dept
                profile.contract_type = contract
                if not profile.phone:
                    profile.phone = phone
                if not profile.onboarded_at:
                    profile.onboarded_at = now - timedelta(days=90)
                profile.updated_by = "hr@stmarys.ac.ug"
                profile.save()

        # Additional ACTIVE subject teachers + 11 HR pipeline records across all 5 pre-active stages
        hr_staff_spec = [
            # ACTIVE subject teachers
            (
                "stmarys_teacher_beatrice",
                "b.nabukenya@stmarys.ac.ug",
                "Ms.",
                "Beatrice Nabukenya",
                "TEACHER",
                "ACTIVE",
                "Humanities & Languages",
                "FULL_TIME",
                "+256772201001",
                120,
                95,
            ),
            (
                "stmarys_teacher_christine",
                "c.namazzi@stmarys.ac.ug",
                "Ms.",
                "Christine Namazzi",
                "TEACHER",
                "ACTIVE",
                "Natural Sciences",
                "FULL_TIME",
                "+256772201002",
                110,
                85,
            ),
            (
                "stmarys_teacher_ronald",
                "r.tumusiime@stmarys.ac.ug",
                "Mr.",
                "Ronald Tumusiime",
                "TEACHER",
                "ACTIVE",
                "Mathematics & Chemistry",
                "FULL_TIME",
                "+256772201003",
                105,
                80,
            ),
            (
                "stmarys_teacher_kenneth",
                "k.mugisha@stmarys.ac.ug",
                "Dr.",
                "Kenneth Mugisha",
                "TEACHER",
                "ACTIVE",
                "Cambridge International Sciences",
                "FULL_TIME",
                "+256772201004",
                130,
                100,
            ),
            (
                "stmarys_teacher_diana",
                "d.nalwoga@stmarys.ac.ug",
                "Ms.",
                "Diana Nalwoga",
                "TEACHER",
                "ACTIVE",
                "Cambridge Humanities",
                "FULL_TIME",
                "+256772201005",
                98,
                72,
            ),
            (
                "stmarys_teacher_geoffrey",
                "g.ssekitoleko@stmarys.ac.ug",
                "Mr.",
                "Geoffrey Ssekitoleko",
                "TEACHER",
                "ACTIVE",
                "Geography & Social Sciences",
                "PART_TIME",
                "+256772201006",
                90,
                65,
            ),
            # APPLIED (2)
            (
                "stmarys_hr_applied_1",
                "allan.mugabe@applicants.smack.ac.ug",
                "Mr.",
                "Allan Mugabe",
                "TEACHER",
                "APPLIED",
                "Mathematics & Physics",
                "FULL_TIME",
                "+256782301001",
                4,
                None,
            ),
            (
                "stmarys_hr_applied_2",
                "sheila.auma@applicants.smack.ac.ug",
                "Ms.",
                "Sheila Auma",
                "NURSE",
                "APPLIED",
                "Health & Sickbay",
                "FIXED_TERM",
                "+256782301002",
                3,
                None,
            ),
            # SHORTLISTED (2)
            (
                "stmarys_hr_shortlisted_1",
                "brian.ssekandi@applicants.smack.ac.ug",
                "Mr.",
                "Brian Ssekandi",
                "TEACHER",
                "SHORTLISTED",
                "ICT & Computer Science",
                "FULL_TIME",
                "+256782301003",
                10,
                None,
            ),
            (
                "stmarys_hr_shortlisted_2",
                "esther.kyomuhendo@applicants.smack.ac.ug",
                "Ms.",
                "Esther Kyomuhendo",
                "LIBRARIAN",
                "SHORTLISTED",
                "Library & Resource Center",
                "FULL_TIME",
                "+256782301004",
                9,
                None,
            ),
            # INTERVIEWED (2)
            (
                "stmarys_hr_interviewed_1",
                "peter.odong@applicants.smack.ac.ug",
                "Mr.",
                "Peter Odong",
                "TEACHER",
                "INTERVIEWED",
                "Biology & Chemistry",
                "FULL_TIME",
                "+256782301005",
                16,
                None,
            ),
            (
                "stmarys_hr_interviewed_2",
                "rachael.nambi@applicants.smack.ac.ug",
                "Ms.",
                "Rachael Nambi",
                "BURSAR",
                "INTERVIEWED",
                "Finance & Bursary",
                "FIXED_TERM",
                "+256782301006",
                15,
                None,
            ),
            # OFFERED (2)
            (
                "stmarys_hr_offered_1",
                "sharon.atim@applicants.smack.ac.ug",
                "Ms.",
                "Sharon Atim",
                "TEACHER",
                "OFFERED",
                "Cambridge English",
                "FULL_TIME",
                "+256782301007",
                22,
                None,
            ),
            (
                "stmarys_hr_offered_2",
                "joseph.walusimbi@applicants.smack.ac.ug",
                "Mr.",
                "Joseph Walusimbi",
                "TRANSPORT",
                "OFFERED",
                "Transport & Fleet",
                "FIXED_TERM",
                "+256782301008",
                20,
                None,
            ),
            # ONBOARDED (3)
            (
                "stmarys_hr_onboarded_1",
                "moses.kiggundu@stmarys.ac.ug",
                "Mr.",
                "Moses Kiggundu",
                "TEACHER",
                "ONBOARDED",
                "Agriculture & Entrepreneurship",
                "PROBATION",
                "+256782301009",
                35,
                5,
            ),
            (
                "stmarys_hr_onboarded_2",
                "winnie.nakimuli@stmarys.ac.ug",
                "Ms.",
                "Winnie Nakimuli",
                "ADMISSIONS",
                "ONBOARDED",
                "Admissions & Registry",
                "PROBATION",
                "+256782301010",
                32,
                4,
            ),
            (
                "stmarys_hr_onboarded_3",
                "alex.opolot@stmarys.ac.ug",
                "Mr.",
                "Alex Opolot",
                "GAMES",
                "ONBOARDED",
                "Sports & Co-Curricular",
                "PROBATION",
                "+256782301011",
                30,
                2,
            ),
        ]

        for (
            username,
            email,
            first_name,
            last_name,
            role,
            hr_stage,
            dept,
            contract,
            phone,
            applied_days,
            onboarded_days,
        ) in hr_staff_spec:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_active": True,
                },
            )
            if created:
                user.set_password("Isoma2026!")
                user.save()
            else:
                changed = False
                if user.email != email:
                    user.email = email
                    changed = True
                if user.first_name != first_name:
                    user.first_name = first_name
                    changed = True
                if user.last_name != last_name:
                    user.last_name = last_name
                    changed = True
                if changed:
                    user.save()

            UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    "institution": stmarys,
                    "role": role,
                    "phone": phone,
                    "hr_stage": hr_stage,
                    "contract_type": contract,
                    "department": dept,
                    "applied_at": now - timedelta(days=applied_days),
                    "onboarded_at": (
                        now - timedelta(days=onboarded_days) if onboarded_days is not None else None
                    ),
                    "updated_by": "hr@stmarys.ac.ug",
                },
            )

        # Link teachers' assigned_curricula, assigned_class_ids, and assigned_subject_ids dynamically
        self._sync_teacher_assignments(stmarys)

        # 7. Seed 24 Students on stmarys (6 per stream across all 4 streams)
        stmarys_students_plan = {
            "S.1 Blue": [
                ("Grace Namukasa", "Female", "Mrs. Sarah Namukasa", "+256772100004", "sarah.namukasa@parents.ug"),
                ("David Mukasa", "Male", "Mr. Paul Mukasa", "+256772100021", "paul.mukasa@parents.ug"),
                ("Samuel Okot", "Male", "Mr. Francis Okot", "+256772410101", "francis.okot@parents.ug"),
                ("Esther Nabwire", "Female", "Mrs. Joyce Nabwire", "+256772410102", "joyce.nabwire@parents.ug"),
                ("Brian Wasswa", "Male", "Mr. Henry Wasswa", "+256772410103", "henry.wasswa@parents.ug"),
                ("Miriam Akello", "Female", "Mrs. Beatrice Akello", "+256772410104", "beatrice.akello@parents.ug"),
            ],
            "S.2 Green": [
                ("Joshua Kintu", "Male", "Mr. Godfrey Kintu", "+256772420101", "godfrey.kintu@parents.ug"),
                ("Faith Nansubuga", "Female", "Mrs. Agnes Nansubuga", "+256772420102", "agnes.nansubuga@parents.ug"),
                ("Daniel Mugerwa", "Male", "Mr. Moses Mugerwa", "+256772420103", "moses.mugerwa@parents.ug"),
                ("Rebecca Atwine", "Female", "Dr. Irene Atwine", "+256772420104", "irene.atwine@parents.ug"),
                ("Timothy Ouma", "Male", "Mr. George Ouma", "+256772420105", "george.ouma@parents.ug"),
                ("Lydia Nambooze", "Female", "Mrs. Edith Nambooze", "+256772420106", "edith.nambooze@parents.ug"),
            ],
            "Year 7 Cambridge": [
                ("Amina Nakato", "Female", "Mrs. Fatuma Nakato", "+256772100022", "fatuma.nakato@parents.ug"),
                ("Ethan Ssempijja", "Male", "Eng. Richard Ssempijja", "+256772430101", "richard.ssempijja@parents.ug"),
                ("Chloe Karungi", "Female", "Mrs. Diana Karungi", "+256772430102", "diana.karungi@parents.ug"),
                ("Nathan Byaruhanga", "Male", "Mr. Herbert Byaruhanga", "+256772430103", "herbert.byaruhanga@parents.ug"),
                ("Zara Kyagulanyi", "Female", "Mrs. Mariam Kyagulanyi", "+256772430104", "mariam.kyagulanyi@parents.ug"),
                ("Liam Opio", "Male", "Dr. Martin Opio", "+256772430105", "martin.opio@parents.ug"),
            ],
            "Year 9 IGCSE": [
                ("Caleb Lubwama", "Male", "Mr. Stephen Lubwama", "+256772440101", "stephen.lubwama@parents.ug"),
                ("Hannah Birungi", "Female", "Mrs. Evelyn Birungi", "+256772440102", "evelyn.birungi@parents.ug"),
                ("Aaron Kasozi", "Male", "Mr. Fredrick Kasozi", "+256772440103", "fredrick.kasozi@parents.ug"),
                ("Naomi Asiimwe", "Female", "Dr. Christine Asiimwe", "+256772440104", "christine.asiimwe@parents.ug"),
                ("Joel Mwesigwa", "Male", "Mr. Lawrence Mwesigwa", "+256772440105", "lawrence.mwesigwa@parents.ug"),
                ("Abigail Nakigozi", "Female", "Mrs. Prossy Nakigozi", "+256772440106", "prossy.nakigozi@parents.ug"),
            ],
        }

        self._seed_students_marks_and_reports(
            institution=stmarys,
            term=stmarys_term,
            streams_map=stmarys_streams,
            stream_subjects_map=stmarys_stream_subjects,
            students_plan=stmarys_students_plan,
        )

        # 8. Seed Multi-Tenant Second School: Greenhill Academy Kampala (UNEB_PRIMARY + MONTESSORI_ECD)
        greenhill_staff_spec = [
            (
                "greenhill_principal",
                "principal@greenhillacademy.ac.ug",
                "Mrs.",
                "Joy Veronica Maraka",
                "PRINCIPAL",
                "Executive Administration",
                "+256772500001",
            ),
            (
                "greenhill_teacher_uneb",
                "m.nassali@greenhillacademy.ac.ug",
                "Ms.",
                "Margaret Nassali",
                "TEACHER",
                "Upper Primary (PLE)",
                "+256772500002",
            ),
            (
                "greenhill_teacher_ecd",
                "s.kyeyune@greenhillacademy.ac.ug",
                "Ms.",
                "Sylvia Kyeyune",
                "TEACHER",
                "Montessori Early Years",
                "+256772500003",
            ),
        ]
        for username, email, first_name, last_name, role, dept, phone in greenhill_staff_spec:
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "first_name": first_name,
                    "last_name": last_name,
                    "is_active": True,
                },
            )
            if created:
                user.set_password("Isoma2026!")
                user.save()
            UserProfile.objects.update_or_create(
                user=user,
                defaults={
                    "institution": greenhill,
                    "role": role,
                    "phone": phone,
                    "hr_stage": "ACTIVE",
                    "contract_type": "FULL_TIME",
                    "department": dept,
                    "applied_at": now - timedelta(days=140),
                    "onboarded_at": now - timedelta(days=120),
                    "updated_by": "isomaug@gmail.com",
                },
            )

        greenhill_streams_spec = [
            ("P.7 Eagles", "P7E", "UNEB_PRIMARY", "Ms. Margaret Nassali"),
            ("Top Class Montessori", "TCM", "MONTESSORI_ECD", "Ms. Sylvia Kyeyune"),
        ]
        greenhill_streams = {}
        for name, code, curr_code, class_teacher in greenhill_streams_spec:
            stream, _ = ClassStream.objects.update_or_create(
                institution=greenhill,
                name=name,
                defaults={
                    "code": code,
                    "curriculum_code": curr_code,
                    "class_teacher_name": class_teacher,
                },
            )
            greenhill_streams[name] = stream

        greenhill_subjects_plan = {
            "P.7 Eagles": [
                ("UNEB_PRIMARY", "UP-ENG", "Ms. Margaret Nassali"),
                ("UNEB_PRIMARY", "UP-MATH", "Ms. Margaret Nassali"),
                ("UNEB_PRIMARY", "UP-SCI", "Ms. Margaret Nassali"),
                ("UNEB_PRIMARY", "UP-SST", "Ms. Margaret Nassali"),
                ("UNEB_PRIMARY", "UP-CRE", "Ms. Margaret Nassali"),
            ],
            "Top Class Montessori": [
                ("MONTESSORI_ECD", "ECD-PL", "Ms. Sylvia Kyeyune"),
                ("MONTESSORI_ECD", "ECD-SENS", "Ms. Sylvia Kyeyune"),
                ("MONTESSORI_ECD", "ECD-LANG", "Ms. Sylvia Kyeyune"),
                ("MONTESSORI_ECD", "ECD-MATH", "Ms. Sylvia Kyeyune"),
                ("MONTESSORI_ECD", "ECD-PHON", "Ms. Sylvia Kyeyune"),
            ],
        }
        greenhill_stream_subjects = {}
        for stream_name, entries in greenhill_subjects_plan.items():
            stream = greenhill_streams[stream_name]
            subj_list = []
            for curr_code, catalog_code, teacher_name in entries:
                cat = CurriculumSubjectCatalog.objects.filter(
                    curriculum_code=curr_code, code=catalog_code
                ).first()
                if not cat:
                    raise ValueError(
                        f"Catalog entry not found for curriculum={curr_code}, code={catalog_code}"
                    )
                subj, _ = Subject.objects.update_or_create(
                    institution=greenhill,
                    class_stream=stream,
                    name=cat.name,
                    defaults={
                        "code": cat.code,
                        "teacher_name": teacher_name,
                    },
                )
                subj_list.append(subj)
            greenhill_stream_subjects[stream_name] = subj_list

        self._sync_teacher_assignments(greenhill)

        greenhill_students_plan = {
            "P.7 Eagles": [
                ("Kieran Ssemwogerere", "Male", "Mr. Andrew Ssemwogerere", "+256772510101", "andrew.ssemwogerere@parents.ug"),
                ("Tasha Namono", "Female", "Mrs. Gloria Namono", "+256772510102", "gloria.namono@parents.ug"),
                ("Elijah Kakooza", "Male", "Mr. Simon Kakooza", "+256772510103", "simon.kakooza@parents.ug"),
            ],
            "Top Class Montessori": [
                ("Maya Nakalema", "Female", "Mrs. Sheila Nakalema", "+256772520101", "sheila.nakalema@parents.ug"),
                ("Leo Mutebi", "Male", "Mr. Ivan Mutebi", "+256772520102", "ivan.mutebi@parents.ug"),
                ("Zuri Achieng", "Female", "Mrs. Caroline Achieng", "+256772520103", "caroline.achieng@parents.ug"),
            ],
        }

        self._seed_students_marks_and_reports(
            institution=greenhill,
            term=greenhill_term,
            streams_map=greenhill_streams,
            stream_subjects_map=greenhill_stream_subjects,
            students_plan=greenhill_students_plan,
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Successfully seeded full relational Isoma LMS dataset across stmarys and greenhill."
            )
        )

    def _sync_teacher_assignments(self, institution):
        subjects = list(
            Subject.objects.filter(institution=institution).select_related("class_stream")
        )
        profiles = UserProfile.objects.filter(
            institution=institution, role__in=["TEACHER", "DOS"]
        ).select_related("user")

        for profile in profiles:
            display_name = f"{profile.user.first_name} {profile.user.last_name}".strip()
            matched_subjects = [
                s for s in subjects if s.teacher_name.strip().lower() == display_name.lower()
            ]
            if matched_subjects:
                profile.assigned_subject_ids = sorted({s.id for s in matched_subjects})
                profile.assigned_class_ids = sorted({s.class_stream_id for s in matched_subjects})
                profile.assigned_curricula = sorted(
                    {s.class_stream.curriculum_code for s in matched_subjects}
                )
                profile.save(
                    update_fields=[
                        "assigned_subject_ids",
                        "assigned_class_ids",
                        "assigned_curricula",
                        "updated_at",
                    ]
                )

    def _seed_students_marks_and_reports(
        self, institution, term, streams_map, stream_subjects_map, students_plan
    ):
        for stream_idx, (stream_name, student_rows) in enumerate(students_plan.items()):
            stream = streams_map[stream_name]
            subjects = stream_subjects_map[stream_name]
            is_ecd = stream.curriculum_code == "MONTESSORI_ECD"

            stream_results = []
            for st_idx, (full_name, gender, p_name, p_phone, p_email) in enumerate(student_rows):
                student, created = StudentProfile.objects.get_or_create(
                    institution=institution,
                    full_name=full_name,
                    defaults={
                        "class_stream": stream,
                        "gender": gender,
                        "parent_name": p_name,
                        "parent_phone": p_phone,
                        "parent_email": p_email,
                        "status": "ACTIVE",
                    },
                )
                if not created:
                    student.class_stream = stream
                    student.gender = gender
                    student.parent_name = p_name
                    student.parent_phone = p_phone
                    student.parent_email = p_email
                    student.status = "ACTIVE"
                    student.save(
                        update_fields=[
                            "class_stream",
                            "gender",
                            "parent_name",
                            "parent_phone",
                            "parent_email",
                            "status",
                        ]
                    )

                totals = []
                for subj_idx, subj in enumerate(subjects):
                    ca, exam = deterministic_scores(
                        stream_idx * 10 + st_idx + 1, subj_idx + 1, is_ecd=is_ecd
                    )
                    mark, _ = StudentMark.objects.update_or_create(
                        institution=institution,
                        student=student,
                        subject=subj,
                        term=term,
                        defaults={
                            "ca_score": ca,
                            "exam_score": exam,
                            "recorded_by": subj.teacher_name or stream.class_teacher_name,
                            "teacher_comment": teacher_comment_for_score(ca if is_ecd else (ca * 0.25 + exam * 0.75)),
                        },
                    )
                    # Re-apply teacher_comment using exact computed total_score
                    exact_comment = teacher_comment_for_score(mark.total_score)
                    if mark.teacher_comment != exact_comment:
                        mark.teacher_comment = exact_comment
                        mark.save(update_fields=["teacher_comment"])

                    totals.append(mark.total_score)

                    if not MarkAuditLog.objects.filter(
                        institution=institution,
                        student=student,
                        subject=subj,
                        term=term,
                    ).exists():
                        MarkAuditLog.objects.create(
                            institution=institution,
                            student=student,
                            subject=subj,
                            term=term,
                            ca_score=mark.ca_score,
                            exam_score=mark.exam_score,
                            total_score=mark.total_score,
                            grade=mark.grade,
                            recorded_by=mark.recorded_by or stream.class_teacher_name,
                        )

                avg = round(sum(totals) / len(totals), 1) if totals else 0.0
                stream_results.append((student, avg))

            # Sort descending by average_score and assign accurate class_position + class_size
            stream_results.sort(key=lambda item: (-item[1], item[0].full_name))
            class_size = len(stream_results)
            last_avg = None
            last_pos = 0
            for idx, (student, avg) in enumerate(stream_results, start=1):
                if avg == last_avg:
                    pos = last_pos
                else:
                    pos = idx
                    last_avg = avg
                    last_pos = pos

                ct_remark, ht_remark = report_remarks_for_average(avg)
                ReportCardSnapshot.objects.update_or_create(
                    institution=institution,
                    student=student,
                    term=term,
                    defaults={
                        "average_score": avg,
                        "class_position": pos,
                        "class_size": class_size,
                        "class_teacher_remark": ct_remark,
                        "headteacher_remark": ht_remark,
                    },
                )
