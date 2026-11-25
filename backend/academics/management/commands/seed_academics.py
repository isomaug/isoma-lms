from django.core.management.base import BaseCommand

from academics.models import (
    AcademicYear,
    ClassStream,
    CurriculumDefinition,
    CurriculumSubjectCatalog,
    CustomDomainConfig,
    ReportCardSnapshot,
    StudentMark,
    StudentProfile,
    Subject,
    Term,
)

CURRICULUM_SUBJECTS_CATALOG = {
    "MONTESSORI_ECD": [
        {"code": "ECD-PL", "name": "Practical Life", "level": "Baby, Middle, Top Class / Reception"},
        {"code": "ECD-SENS", "name": "Sensorial Education", "level": "Baby, Middle, Top Class / Reception"},
        {"code": "ECD-LANG", "name": "Language and Literacy", "level": "Baby, Middle, Top Class / Reception"},
        {"code": "ECD-MATH", "name": "Mathematics", "level": "Baby, Middle, Top Class / Reception"},
        {"code": "ECD-CULT", "name": "Cultural Studies (Geography, Science and History)", "level": "Baby, Middle, Top Class / Reception"},
        {"code": "ECD-ARTS", "name": "Creative Arts, Music and Movement", "level": "Baby, Middle, Top Class / Reception"},
        {"code": "ECD-NCDC-REL", "name": "Relating with Others in an Acceptable Way", "level": "Baby, Middle, Top Class"},
        {"code": "ECD-NCDC-ENV", "name": "Interacting, Exploring, Knowing and Using My Environment", "level": "Baby, Middle, Top Class"},
        {"code": "ECD-NCDC-HLTH", "name": "Taking Care of Oneself for Proper Growth", "level": "Baby, Middle, Top Class"},
        {"code": "ECD-NCDC-NUM", "name": "Developing and Using Mathematical Concepts", "level": "Baby, Middle, Top Class"},
        {"code": "ECD-NCDC-COMM", "name": "Developing and Using My Language Appropriately", "level": "Baby, Middle, Top Class"},
        {"code": "ECD-PHON", "name": "Phonics and Reading Readiness", "level": "Middle, Top Class / Reception"},
    ],
    "UNEB_PRIMARY": [
        {"code": "LP-LIT1", "name": "Literacy I (Local Language Reading and Writing)", "level": "P.1-P.3 Lower Primary"},
        {"code": "LP-LIT2", "name": "Literacy II (Local Language Oral and Comprehension)", "level": "P.1-P.3 Lower Primary"},
        {"code": "LP-ENG", "name": "English Language", "level": "P.1-P.3 Lower Primary"},
        {"code": "LP-MATH", "name": "Mathematics", "level": "P.1-P.3 Lower Primary"},
        {"code": "LP-RE", "name": "Religious Education (CRE/IRE)", "level": "P.1-P.3 Lower Primary"},
        {"code": "LP-CAPE", "name": "Creative Arts and Physical Education (CAPE)", "level": "P.1-P.3 Lower Primary"},
        {"code": "UP-ENG", "name": "English Language", "level": "P.4-P.7 Upper Primary (PLE)"},
        {"code": "UP-MATH", "name": "Mathematics", "level": "P.4-P.7 Upper Primary (PLE)"},
        {"code": "UP-SCI", "name": "Integrated Science", "level": "P.4-P.7 Upper Primary (PLE)"},
        {"code": "UP-SST", "name": "Social Studies with Religious Education (SST)", "level": "P.4-P.7 Upper Primary (PLE)"},
        {"code": "UP-CRE", "name": "Christian Religious Education (CRE)", "level": "P.4-P.7 Upper Primary"},
        {"code": "UP-IRE", "name": "Islamic Religious Education (IRE)", "level": "P.4-P.7 Upper Primary"},
        {"code": "UP-LOC", "name": "Local Language", "level": "P.4-P.7 Upper Primary"},
        {"code": "UP-CAPE", "name": "Creative Arts and Physical Education (CAPE)", "level": "P.4-P.7 Upper Primary"},
    ],
    "UNEB_LOWER_SECONDARY": [
        {"code": "CBC-ENG", "name": "English Language", "level": "S.1-S.4 Compulsory (UCE)"},
        {"code": "CBC-MATH", "name": "Mathematics", "level": "S.1-S.4 Compulsory (UCE)"},
        {"code": "CBC-BIO", "name": "Biology", "level": "S.1-S.4 Compulsory (UCE)"},
        {"code": "CBC-CHEM", "name": "Chemistry", "level": "S.1-S.4 Compulsory (UCE)"},
        {"code": "CBC-PHYS", "name": "Physics", "level": "S.1-S.4 Compulsory (UCE)"},
        {"code": "CBC-GEOG", "name": "Geography", "level": "S.1-S.4 Compulsory (UCE)"},
        {"code": "CBC-HIST", "name": "History and Political Education", "level": "S.1-S.4 Compulsory (UCE)"},
        {"code": "CBC-ENT", "name": "Entrepreneurship Education", "level": "S.1-S.2 Compulsory / S.3-S.4 Elective"},
        {"code": "CBC-KISW", "name": "Kiswahili", "level": "S.1-S.2 Compulsory / S.3-S.4 Elective"},
        {"code": "CBC-RE", "name": "Religious Education (CRE/IRE)", "level": "S.1-S.2 Compulsory / S.3-S.4 Elective"},
        {"code": "CBC-ICT", "name": "Information and Communications Technology (ICT)", "level": "S.1-S.4 Elective"},
        {"code": "CBC-AGRI", "name": "Agriculture", "level": "S.1-S.4 Elective"},
        {"code": "CBC-TD", "name": "Technology and Design", "level": "S.1-S.4 Elective"},
        {"code": "CBC-NFT", "name": "Nutrition and Food Technology", "level": "S.1-S.4 Elective"},
        {"code": "UACE-GP", "name": "General Paper", "level": "S.5-S.6 UACE Compulsory Subsidiary"},
        {"code": "UACE-SUBMATH", "name": "Subsidiary Mathematics", "level": "S.5-S.6 UACE Subsidiary"},
        {"code": "UACE-SUBICT", "name": "Subsidiary ICT", "level": "S.5-S.6 UACE Subsidiary"},
        {"code": "UACE-ECON", "name": "Economics", "level": "S.5-S.6 UACE Principal"},
    ],
    "CAMBRIDGE_IGCSE": [
        {"code": "0058", "name": "Cambridge Primary English", "level": "Primary Stages 1-6"},
        {"code": "0096", "name": "Cambridge Primary Mathematics", "level": "Primary Stages 1-6"},
        {"code": "0097", "name": "Cambridge Primary Science", "level": "Primary Stages 1-6"},
        {"code": "1111", "name": "Cambridge Lower Secondary English", "level": "Lower Secondary Stages 7-9"},
        {"code": "1112", "name": "Cambridge Lower Secondary Mathematics", "level": "Lower Secondary Stages 7-9"},
        {"code": "1113", "name": "Cambridge Lower Secondary Science", "level": "Lower Secondary Stages 7-9"},
        {"code": "1129", "name": "Cambridge Lower Secondary Global Perspectives", "level": "Lower Secondary Stages 7-9"},
        {"code": "0500", "name": "First Language English", "level": "IGCSE O-Level"},
        {"code": "0580", "name": "Mathematics", "level": "IGCSE O-Level"},
        {"code": "0610", "name": "Biology", "level": "IGCSE O-Level"},
        {"code": "0620", "name": "Chemistry", "level": "IGCSE O-Level"},
        {"code": "0625", "name": "Physics", "level": "IGCSE O-Level"},
        {"code": "0417", "name": "Information and Communication Technology (ICT)", "level": "IGCSE O-Level"},
        {"code": "9709", "name": "Mathematics", "level": "AS & A-Level"},
        {"code": "9700", "name": "Biology", "level": "AS & A-Level"},
        {"code": "9701", "name": "Chemistry", "level": "AS & A-Level"},
        {"code": "9702", "name": "Physics", "level": "AS & A-Level"},
        {"code": "9626", "name": "Information Technology", "level": "AS & A-Level"},
    ],
    "ACE_PACE": [
        {"code": "ACE-MATH-PRI", "name": "Mathematics", "level": "Primary (Levels 1-8)"},
        {"code": "ACE-ENG-PRI", "name": "English", "level": "Primary (Levels 1-8)"},
        {"code": "ACE-LCW-PRI", "name": "Literature and Creative Writing", "level": "Primary (Levels 2-8)"},
        {"code": "ACE-SCI-PRI", "name": "Science", "level": "Primary (Levels 1-8)"},
        {"code": "ACE-SS-PRI", "name": "Social Studies", "level": "Primary (Levels 1-8)"},
        {"code": "ACE-WB", "name": "Word Building", "level": "Primary & Junior High (Levels 1-9)"},
        {"code": "ACE-BIBLE-PRI", "name": "Bible Reading", "level": "Primary (Levels 1-6)"},
        {"code": "ACE-ALG1", "name": "Algebra I", "level": "High School (Level 9)"},
        {"code": "ACE-GEOM", "name": "Geometry", "level": "High School (Level 10)"},
        {"code": "ACE-ALG2", "name": "Algebra II", "level": "High School (Level 11)"},
        {"code": "ACE-ENG-HS", "name": "English I-IV", "level": "High School (Levels 9-12)"},
        {"code": "ACE-BIO", "name": "Biology", "level": "High School (Level 10)"},
        {"code": "ACE-CHEM", "name": "Chemistry", "level": "High School (Level 11)"},
        {"code": "ACE-PHYS", "name": "Physics", "level": "High School (Level 12)"},
        {"code": "ACE-WGEOG", "name": "World Geography", "level": "High School (Level 9)"},
        {"code": "ACE-WHIST", "name": "World History", "level": "High School (Level 10)"},
    ],
    "IB_DP": [
        {"code": "PYP-LANG", "name": "Language", "level": "IB PYP"},
        {"code": "PYP-MATH", "name": "Mathematics", "level": "IB PYP"},
        {"code": "PYP-SCI", "name": "Science", "level": "IB PYP"},
        {"code": "PYP-SS", "name": "Social Studies", "level": "IB PYP"},
        {"code": "PYP-ARTS", "name": "The Arts", "level": "IB PYP"},
        {"code": "PYP-PSPE", "name": "Personal, Social and Physical Education (PSPE)", "level": "IB PYP"},
        {"code": "MYP-LL", "name": "Language and Literature", "level": "IB MYP"},
        {"code": "MYP-LA", "name": "Language Acquisition", "level": "IB MYP"},
        {"code": "MYP-IS", "name": "Individuals and Societies", "level": "IB MYP"},
        {"code": "MYP-SCI", "name": "Sciences", "level": "IB MYP"},
        {"code": "MYP-MATH", "name": "Mathematics", "level": "IB MYP"},
        {"code": "MYP-ARTS", "name": "Arts", "level": "IB MYP"},
        {"code": "MYP-PHE", "name": "Physical and Health Education", "level": "IB MYP"},
        {"code": "MYP-DES", "name": "Design", "level": "IB MYP"},
        {"code": "DP-G1", "name": "Studies in Language and Literature (Group 1)", "level": "IB DP"},
        {"code": "DP-G2", "name": "Language Acquisition (Group 2)", "level": "IB DP"},
        {"code": "DP-G3", "name": "Individuals and Societies (Group 3)", "level": "IB DP"},
        {"code": "DP-G4", "name": "Sciences (Group 4)", "level": "IB DP"},
        {"code": "DP-G5", "name": "Mathematics (Group 5)", "level": "IB DP"},
        {"code": "DP-G6", "name": "The Arts (Group 6)", "level": "IB DP"},
    ],
}
from tenants.models import Institution


class Command(BaseCommand):
    help = "Seed CurriculumDefinitions, demo classes, students, marks, and live PDF + QR report cards."

    def handle(self, *args, **options):
        curricula = [
            {
                "code": "UNEB_LOWER_SECONDARY",
                "name": "Uganda UNEB / NCDC Lower Secondary CBC",
                "country_origin": "Uganda",
                "unit_label": "Subject",
                "ca_label": "AOI (20%)",
                "ca_weight": 20,
                "exam_label": "EOT (80%)",
                "exam_weight": 80,
                "grading_scale": [
                    {"min": 80, "max": 100, "grade": "A", "remark": "Exceptional"},
                    {"min": 70, "max": 79.9, "grade": "B", "remark": "Outstanding"},
                    {"min": 60, "max": 69.9, "grade": "C", "remark": "Satisfactory"},
                    {"min": 50, "max": 59.9, "grade": "D", "remark": "Basic"},
                    {"min": 0, "max": 49.9, "grade": "E", "remark": "Elementary"},
                ],
            },
            {
                "code": "CAMBRIDGE_IGCSE",
                "name": "Cambridge International IGCSE / A-Level",
                "country_origin": "International",
                "unit_label": "Subject",
                "ca_label": "Coursework (30%)",
                "ca_weight": 30,
                "exam_label": "Cambridge Exam (70%)",
                "exam_weight": 70,
                "grading_scale": [
                    {"min": 90, "max": 100, "grade": "A*", "remark": "Distinction"},
                    {"min": 80, "max": 89.9, "grade": "A", "remark": "Excellent"},
                    {"min": 70, "max": 79.9, "grade": "B", "remark": "Very Good"},
                    {"min": 60, "max": 69.9, "grade": "C", "remark": "Credit"},
                    {"min": 50, "max": 59.9, "grade": "D", "remark": "Pass"},
                    {"min": 0, "max": 49.9, "grade": "U", "remark": "Ungraded"},
                ],
            },
            {
                "code": "UNEB_PRIMARY",
                "name": "Uganda UNEB Primary (PLE)",
                "country_origin": "Uganda",
                "unit_label": "Subject",
                "ca_label": "BOT/MOT (30%)",
                "ca_weight": 30,
                "exam_label": "EOT (70%)",
                "exam_weight": 70,
                "grading_scale": [
                    {"min": 80, "max": 100, "grade": "D1", "remark": "Distinction 1"},
                    {"min": 70, "max": 79.9, "grade": "D2", "remark": "Distinction 2"},
                    {"min": 60, "max": 69.9, "grade": "C3", "remark": "Credit 3"},
                    {"min": 50, "max": 59.9, "grade": "P7", "remark": "Pass"},
                    {"min": 0, "max": 49.9, "grade": "F9", "remark": "Fail"},
                ],
            },
            {
                "code": "MONTESSORI_ECD",
                "name": "Montessori / Nursery ECD",
                "country_origin": "Global",
                "unit_label": "Learning Area",
                "ca_label": "Observations (100%)",
                "ca_weight": 100,
                "exam_label": "Milestone Check (0%)",
                "exam_weight": 0,
                "grading_scale": [
                    {"min": 80, "max": 100, "grade": "Secure", "remark": "Mastered"},
                    {"min": 60, "max": 79.9, "grade": "Consolidating", "remark": "Good Progress"},
                    {"min": 40, "max": 59.9, "grade": "Developing", "remark": "Improving"},
                    {"min": 0, "max": 39.9, "grade": "Emerging", "remark": "Needs Support"},
                ],
            },
            {
                "code": "ACE_PACE",
                "name": "Accelerated Christian Education (ACE PACEs)",
                "country_origin": "International",
                "unit_label": "PACE Subject",
                "ca_label": "Checkups (20%)",
                "ca_weight": 20,
                "exam_label": "PACE Test (80%)",
                "exam_weight": 80,
                "grading_scale": [
                    {"min": 90, "max": 100, "grade": "Mastery+", "remark": "Honor Roll"},
                    {"min": 80, "max": 89.9, "grade": "Mastery", "remark": "Advance PACE"},
                    {"min": 0, "max": 79.9, "grade": "Repeat", "remark": "Review Required"},
                ],
            },
            {
                "code": "IB_DP",
                "name": "International Baccalaureate (PYP / MYP / DP)",
                "country_origin": "International",
                "unit_label": "Subject Group",
                "ca_label": "Internal Assessment (25%)",
                "ca_weight": 25,
                "exam_label": "External Exam (75%)",
                "exam_weight": 75,
                "grading_scale": [
                    {"min": 85, "max": 100, "grade": "7", "remark": "Excellent"},
                    {"min": 75, "max": 84.9, "grade": "6", "remark": "Very Good"},
                    {"min": 65, "max": 74.9, "grade": "5", "remark": "Good"},
                    {"min": 50, "max": 64.9, "grade": "4", "remark": "Satisfactory"},
                    {"min": 0, "max": 49.9, "grade": "3", "remark": "Developing"},
                ],
            },
        ]
        for item in curricula:
            CurriculumDefinition.objects.update_or_create(code=item["code"], defaults=item)

        cat_count = 0
        for curr_code, subjects_list in CURRICULUM_SUBJECTS_CATALOG.items():
            for subj in subjects_list:
                CurriculumSubjectCatalog.objects.update_or_create(
                    curriculum_code=curr_code,
                    level=subj["level"],
                    name=subj["name"],
                    defaults={"code": subj["code"]},
                )
                cat_count += 1

        school = Institution.objects.filter(subdomain="stmarys").first()
        if not school:
            self.stdout.write("Demo school stmarys not found; seeded curricula only.")
            return

        CustomDomainConfig.objects.get_or_create(
            institution=school,
            defaults={"custom_domain": school.custom_domain or "portal.stmarys.ac.ug", "status": "PENDING_DNS"},
        )

        year, _ = AcademicYear.objects.get_or_create(institution=school, name="2026", defaults={"is_current": True})
        term, _ = Term.objects.get_or_create(academic_year=year, name="Term 1", defaults={"is_current": True})

        s1_blue, _ = ClassStream.objects.get_or_create(
            institution=school,
            name="S.1 Blue",
            defaults={"code": "S1B", "curriculum_code": "UNEB_LOWER_SECONDARY", "class_teacher_name": "Mr. Patrick Okello"},
        )
        yr7_cam, _ = ClassStream.objects.get_or_create(
            institution=school,
            name="Year 7 Cambridge",
            defaults={"code": "Y7C", "curriculum_code": "CAMBRIDGE_IGCSE", "class_teacher_name": "Mr. Emmanuel Kigozi"},
        )

        uneb_subjects = [
            Subject.objects.get_or_create(institution=school, class_stream=s1_blue, name="Mathematics", defaults={"code": "MTC", "teacher_name": "Mr. Patrick Okello"})[0],
            Subject.objects.get_or_create(institution=school, class_stream=s1_blue, name="Physics", defaults={"code": "PHY", "teacher_name": "Mr. Patrick Okello"})[0],
            Subject.objects.get_or_create(institution=school, class_stream=s1_blue, name="ICT & Digital Literacy", defaults={"code": "ICT", "teacher_name": "Mr. Patrick Okello", "source_course_slug": "uneb-lower-secondary-ict-cbc"})[0],
        ]
        cam_subjects = [
            Subject.objects.get_or_create(institution=school, class_stream=yr7_cam, name="Cambridge IT (9626)", defaults={"code": "9626", "teacher_name": "Mr. Emmanuel Kigozi", "source_course_slug": "cambridge-as-a-level-it"})[0],
            Subject.objects.get_or_create(institution=school, class_stream=yr7_cam, name="Cambridge Mathematics", defaults={"code": "0580", "teacher_name": "Mr. Emmanuel Kigozi"})[0],
        ]

        demo_students = [
            ("Grace Namukasa", "Female", s1_blue, "Mrs. Sarah Namukasa", "+256772100004", [(uneb_subjects[0], 86, 84), (uneb_subjects[1], 78, 80), (uneb_subjects[2], 92, 88)]),
            ("David Mukasa", "Male", s1_blue, "Mr. Paul Mukasa", "+256772100021", [(uneb_subjects[0], 74, 72), (uneb_subjects[1], 68, 75), (uneb_subjects[2], 82, 79)]),
            ("Amina Nakato", "Female", yr7_cam, "Mrs. Fatuma Nakato", "+256772100022", [(cam_subjects[0], 91, 89), (cam_subjects[1], 85, 87)]),
        ]

        for full_name, gender, stream, p_name, p_phone, scores in demo_students:
            st, _ = StudentProfile.objects.get_or_create(
                institution=school,
                full_name=full_name,
                defaults={"gender": gender, "class_stream": stream, "parent_name": p_name, "parent_phone": p_phone},
            )
            totals = []
            for subj, ca, exam in scores:
                m, _ = StudentMark.objects.update_or_create(
                    institution=school, student=st, subject=subj, term=term,
                    defaults={"ca_score": ca, "exam_score": exam},
                )
                totals.append(m.total_score)
            avg = round(sum(totals) / len(totals), 1)
            ReportCardSnapshot.objects.update_or_create(
                institution=school, student=st, term=term,
                defaults={"average_score": avg, "class_position": 1, "class_size": 2},
            )

        self.stdout.write(self.style.SUCCESS("Seeded 6 CurriculumDefinitions, demo classes, students, marks, and live PDF+QR report cards."))
