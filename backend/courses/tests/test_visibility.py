from django.contrib.auth.models import Group, User
from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Certificate, Course, Enrollment, Lesson, Module, Quiz, QuizAttempt, UserXP
from .visibility import lesson_week_number, same_week_lessons


class WeekVisibilityTests(TestCase):
    def setUp(self):
        instructors = Group.objects.create(name="Instructors")
        self.instructor = User.objects.create_user("teacher", password="password")
        self.instructor.groups.add(instructors)
        self.student = User.objects.create_user("student", password="password")
        self.course = Course.objects.create(
            title="AI Explorers Stage Test",
            slug="ai-robotics-stage-test",
            is_published=True,
        )
        self.term1 = Module.objects.create(
            course=self.course, title="Term 1", order=1, is_visible=True
        )
        self.week1a = Lesson.objects.create(
            module=self.term1, title="Week 1 - Lesson 1", order=10, is_visible=True
        )
        self.week1b = Lesson.objects.create(
            module=self.term1, title="Week 1 - Lesson 2", order=11, is_visible=True
        )
        self.week2a = Lesson.objects.create(
            module=self.term1, title="Week 2 - Lesson 1", order=20, is_visible=False
        )
        self.week2b = Lesson.objects.create(
            module=self.term1, title="Week 2 - Lesson 2", order=21, is_visible=False
        )
        self.week2_quiz = Quiz.objects.create(
            lesson=self.week2a, title="Week 2 - Lesson 1 Quiz", points_reward=50
        )
        self.enrollment = Enrollment.objects.create(user=self.student, course=self.course)
        self.client = APIClient()

    def test_student_cannot_claim_term_certificate_after_week_1_only(self):
        self.enrollment.completed_lessons.add(self.week1a, self.week1b)
        self.client.force_authenticate(self.student)
        response = self.client.post(
            f"/api/courses/{self.course.slug}/claim-certificate/?module_id={self.term1.id}",
            {"name_on_certificate": "Student"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("not finished", response.data["error"].lower())

    def test_module_serializer_reports_full_term_counts(self):
        from rest_framework.test import APIRequestFactory
        from courses.serializers import ModuleDetailSerializer

        factory = APIRequestFactory()
        request = factory.get("/")
        request.user = self.student
        self.enrollment.completed_lessons.add(self.week1a)
        data = ModuleDetailSerializer(self.term1, context={"request": request}).data
        self.assertEqual(data["total_lesson_count"], 4)
        self.assertEqual(data["completed_lesson_count"], 1)
        self.assertFalse(data["all_lessons_completed"])
        # Students only receive currently visible lessons
        self.assertEqual(len(data["lessons"]), 2)
        self.assertEqual(data["lessons"][0]["title"], "Week 1 - Lesson 1")

    def test_same_week_lessons_groups_both_lessons(self):
        ids = set(same_week_lessons(self.week2a).values_list("id", flat=True))
        self.assertEqual(ids, {self.week2a.id, self.week2b.id})

    def test_student_cannot_complete_hidden_lesson(self):
        self.week2a.is_visible = False
        self.week2a.save(update_fields=["is_visible"])
        self.client.force_authenticate(self.student)
        response = self.client.post(
            f"/api/courses/{self.course.slug}/lessons/{self.week2a.id}/complete/"
        )
        self.assertEqual(response.status_code, 403)
        self.assertFalse(self.enrollment.completed_lessons.filter(id=self.week2a.id).exists())

    def test_student_can_complete_visible_lesson(self):
        self.client.force_authenticate(self.student)
        response = self.client.post(
            f"/api/courses/{self.course.slug}/lessons/{self.week1a.id}/complete/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["completed"])
        self.assertTrue(self.enrollment.completed_lessons.filter(id=self.week1a.id).exists())

    def test_instructor_without_enrollment_can_complete_visible_lesson(self):
        self.assertFalse(
            Enrollment.objects.filter(user=self.instructor, course=self.course).exists()
        )
        self.client.force_authenticate(self.instructor)
        response = self.client.post(
            f"/api/courses/{self.course.slug}/lessons/{self.week1a.id}/complete/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["completed"])
        self.assertTrue(
            Enrollment.objects.filter(user=self.instructor, course=self.course).exists()
        )

    def test_staff_without_enrollment_can_complete_visible_lesson(self):
        staff = User.objects.create_user("admin", password="password", is_staff=True)
        self.client.force_authenticate(staff)
        response = self.client.post(
            f"/api/courses/{self.course.slug}/lessons/{self.week1a.id}/complete/"
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["completed"])
        self.assertTrue(Enrollment.objects.filter(user=staff, course=self.course).exists())

    def test_instructor_hide_toggles_whole_week(self):
        self.week2a.is_visible = True
        self.week2a.save(update_fields=["is_visible"])
        self.week2b.is_visible = True
        self.week2b.save(update_fields=["is_visible"])
        self.client.force_authenticate(self.instructor)
        response = self.client.patch(
            f"/api/courses/lessons/{self.week2a.id}/toggle-visibility/"
        )
        self.assertEqual(response.status_code, 200)
        self.week2a.refresh_from_db()
        self.week2b.refresh_from_db()
        self.week1a.refresh_from_db()
        self.assertFalse(self.week2a.is_visible)
        self.assertFalse(self.week2b.is_visible)
        self.assertTrue(self.week1a.is_visible)
        updated_ids = {item["id"] for item in response.data["updated_lessons"]}
        self.assertEqual(updated_ids, {self.week2a.id, self.week2b.id})

    def test_student_cannot_open_hidden_quiz(self):
        self.week2a.is_visible = False
        self.week2a.save(update_fields=["is_visible"])
        self.client.force_authenticate(self.student)
        response = self.client.get(
            f"/api/courses/{self.course.slug}/quizzes/{self.week2_quiz.id}/"
        )
        self.assertEqual(response.status_code, 403)

    def test_reset_week2_command_hides_and_clears(self):
        self.enrollment.completed_lessons.add(self.week1a, self.week2a)
        UserXP.objects.create(user=self.student, course=self.course, total_xp=80)
        QuizAttempt.objects.create(
            user=self.student, quiz=self.week2_quiz, score=100, passed=True, xp_awarded=50
        )
        Certificate.objects.create(
            user=self.student, course=self.course, module=self.term1, is_approved=True
        )

        call_command("reset_week2_farming", execute=True, keep_week=1)

        self.week1a.refresh_from_db()
        self.week2a.refresh_from_db()
        self.week2b.refresh_from_db()
        self.assertTrue(self.week1a.is_visible)
        self.assertFalse(self.week2a.is_visible)
        self.assertFalse(self.week2b.is_visible)
        self.assertTrue(self.enrollment.completed_lessons.filter(id=self.week1a.id).exists())
        self.assertFalse(self.enrollment.completed_lessons.filter(id=self.week2a.id).exists())
        self.assertEqual(UserXP.objects.get(user=self.student, course=self.course).total_xp, 0)
        self.assertFalse(QuizAttempt.objects.filter(quiz=self.week2_quiz).exists())
        self.assertFalse(Certificate.objects.filter(course=self.course).exists())
