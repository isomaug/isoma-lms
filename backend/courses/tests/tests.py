from datetime import date, timedelta

from django.contrib.auth.models import Group, User
from django.test import TestCase
from rest_framework.test import APIClient

from .models import Cohort, Course


class ClassmatesVisibilityTests(TestCase):
    def setUp(self):
        instructors = Group.objects.create(name="Instructors")
        self.instructor = User.objects.create_user("teacher", password="password")
        self.instructor.groups.add(instructors)
        self.student = User.objects.create_user(
            "student", "student@example.com", "password", first_name="Sam", last_name="Student"
        )
        self.mate = User.objects.create_user(
            "mate", "mate@example.com", "password", first_name="Ada", last_name="Lovelace"
        )
        self.course = Course.objects.create(title="Robotics", slug="robotics", is_published=True)
        self.cohort = Cohort.objects.create(
            course=self.course,
            name="Stage 1",
            start_date=date.today(),
            end_date=date.today() + timedelta(days=30),
            allow_students_to_see_classmates=False,
        )
        self.cohort.instructors.add(self.instructor)
        self.cohort.students.add(self.student, self.mate)
        self.client = APIClient()

    def test_student_blocked_when_classmates_hidden(self):
        self.client.force_authenticate(self.student)
        response = self.client.get(
            f"/api/courses/{self.course.slug}/classmates/?cohort_id={self.cohort.id}"
        )
        self.assertEqual(response.status_code, 403)

    def test_instructor_can_toggle_classmates_visibility(self):
        self.client.force_authenticate(self.instructor)
        response = self.client.patch(
            f"/api/courses/{self.course.slug}/classmates/",
            {"cohort_id": self.cohort.id, "allow_students_to_see_classmates": True},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["allow_students_to_see_classmates"])
        self.cohort.refresh_from_db()
        self.assertTrue(self.cohort.allow_students_to_see_classmates)

        self.client.force_authenticate(self.student)
        response = self.client.get(
            f"/api/courses/{self.course.slug}/classmates/?cohort_id={self.cohort.id}"
        )
        self.assertEqual(response.status_code, 200)
        names = [row["full_name"] for row in response.data["classmates"]]
        self.assertTrue(any("Ada" in name for name in names))

    def test_student_cannot_toggle_classmates_visibility(self):
        self.client.force_authenticate(self.student)
        response = self.client.patch(
            f"/api/courses/{self.course.slug}/classmates/",
            {"cohort_id": self.cohort.id, "allow_students_to_see_classmates": True},
            format="json",
        )
        self.assertEqual(response.status_code, 403)
        self.cohort.refresh_from_db()
        self.assertFalse(self.cohort.allow_students_to_see_classmates)


class CourseReviewTests(TestCase):
    def setUp(self):
        from .models import Enrollment, Review
        self.course = Course.objects.create(title="Scratch Stage 1", slug="stage-1-course", is_published=True)
        self.student = User.objects.create_user("student_bob", "bob@example.com", "pass123", first_name="Bob", last_name="Builder")
        self.other_user = User.objects.create_user("stranger", "stranger@example.com", "pass123")
        self.admin = User.objects.create_superuser("super", "super@example.com", "pass123")
        Enrollment.objects.create(user=self.student, course=self.course)
        self.client = APIClient()

    def test_enrolled_student_can_submit_review(self):
        self.client.force_authenticate(self.student)
        response = self.client.post(
            f"/api/courses/{self.course.slug}/review/",
            {"rating": 5, "comment": "Excellent course!"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["rating"], 5)
        self.assertEqual(response.data["full_name"], "Bob Builder")
        self.assertTrue(response.data["is_approved"])

        # Check reviews list
        list_res = self.client.get(f"/api/courses/{self.course.slug}/reviews/")
        self.assertEqual(list_res.status_code, 200)
        results = list_res.data.get("results", list_res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["full_name"], "Bob Builder")

    def test_staff_can_review_without_enrollment(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            f"/api/courses/{self.course.slug}/review/",
            {"rating": 4, "comment": "Admin review"},
            format="json",
        )
        self.assertEqual(response.status_code, 201)

    def test_unenrolled_user_cannot_review(self):
        self.client.force_authenticate(self.other_user)
        response = self.client.post(
            f"/api/courses/{self.course.slug}/review/",
            {"rating": 5, "comment": "Spam"},
            format="json",
        )
        self.assertEqual(response.status_code, 403)

