from django.contrib.auth.models import Group, User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Course, InstructorSolutionSection, PastPaper
from .pastpapers.registry import select_manifests
from .pastpapers.seed_engine import prepare_solution, seed_manifest
from .pastpapers.solution_script_generator import build_script_sections
from .pastpapers.validators import validate_solution


class PastPaperManifestTests(TestCase):
    def test_9626_registry_contains_requested_inventory(self):
        manifests = select_manifests(syllabus_code="9626")
        self.assertEqual(len(manifests), 240)
        future = select_manifests(
            syllabus_code="9626", year=2026, series="november"
        )
        self.assertTrue(all(item.status == "future" for item in future))

    def test_unverified_manifest_is_skipped_by_default(self):
        manifest = select_manifests(
            syllabus_code="9626",
            year=2025,
            series="june",
            paper=1,
            variant=2,
        )[0]
        paper, created = seed_manifest(manifest)
        self.assertIsNone(paper)
        self.assertFalse(created)
        self.assertEqual(PastPaper.objects.count(), 0)

    def test_video_script_aligns_numbered_question_and_mark_scheme(self):
        question_text = """
        1(a) State two benefits of validation. [2]
        1(b) Explain one drawback of direct data entry. [2]
        """
        mark_scheme_text = """
        1(a) reduces invalid data; improves consistency
        1(b) human typing errors can still occur; suitable explanation
        """
        sections, issues = build_script_sections(
            question_text,
            mark_scheme_text,
            [
                {"path": "1(a)", "marks": 2, "summary": "Validation benefits"},
                {"path": "1(b)", "marks": 2, "summary": "Direct entry drawback"},
            ],
        )
        self.assertEqual(issues, [])
        self.assertEqual(len(sections), 2)
        self.assertIn("### Narration", sections[0].markdown)
        self.assertIn("Mark-scheme alignment", sections[1].markdown)
        self.assertGreater(sections[1].start_seconds, sections[0].end_seconds)


class InstructorPastPaperAccessTests(TestCase):
    def setUp(self):
        instructors = Group.objects.create(name="Instructors")
        self.instructor = User.objects.create_user("instructor", password="password")
        self.instructor.groups.add(instructors)
        self.other_instructor = User.objects.create_user(
            "other-instructor", password="password"
        )
        self.other_instructor.groups.add(instructors)
        self.student = User.objects.create_user("student", password="password")
        self.course = Course.objects.create(
            title="9626 Paper 12",
            slug="9626-paper-12",
            assigned_instructor=self.instructor,
        )
        self.paper = PastPaper.objects.create(
            course=self.course,
            subject="Information Technology",
            syllabus_code="9626",
            syllabus_era="2025-2027",
            exam_year=2025,
            exam_series="june",
            paper_number=1,
            variant=2,
            component_code="12",
            level="AS Level",
            seed_key="cambridge:as_a_level:9626:2025:june:1:2",
            source_verified=True,
            question_structure=[
                {"path": "1(a)", "marks": 2},
                {"path": "1(b)", "marks": 3},
            ],
        )
        self.client = APIClient()

    def test_student_cannot_open_instructor_workspace(self):
        self.client.force_authenticate(self.student)
        response = self.client.get("/api/courses/instructor/past-papers/")
        self.assertEqual(response.status_code, 403)

    def test_assigned_instructor_can_prepare_workspace(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.post(
            f"/api/courses/instructor/past-papers/{self.paper.pk}/prepare/"
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(len(response.data["sections"]), 2)
        self.assertEqual(response.data["total_marks"], 5)

    def test_unassigned_instructor_cannot_see_paper(self):
        self.client.force_authenticate(self.other_instructor)
        response = self.client.get(
            f"/api/courses/instructor/past-papers/{self.paper.pk}/"
        )
        self.assertEqual(response.status_code, 404)

    def test_validation_requires_mark_scheme_alignment_and_verification(self):
        solution = prepare_solution(self.paper, user=self.instructor)
        section = solution.sections.first()
        section.worked_solution_markdown = "# Solution\n\n1. First valid step."
        section.is_complete = True
        section.save()
        errors = validate_solution(solution)
        self.assertTrue(
            any("mark-scheme alignment is empty" in error for error in errors)
        )
        self.assertTrue(any("section is not verified" in error for error in errors))

    def test_section_update_rejects_undefined(self):
        solution = prepare_solution(self.paper, user=self.instructor)
        section = InstructorSolutionSection.objects.get(
            solution=solution, question_path="1(a)"
        )
        self.client.force_authenticate(self.instructor)
        response = self.client.patch(
            f"/api/courses/instructor/past-papers/sections/{section.pk}/",
            {"worked_solution_markdown": "undefined"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
