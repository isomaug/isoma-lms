from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date

from courses.models import (
    Course,
    Module,
    Lesson,
    Quiz,
    Question,
    Choice,
    Cohort,
    Enrollment,
    UserXP,
    LessonPairing,
    LessonPairRequest,
    CohortTeam,
)

User = get_user_model()


class LessonPairingAndXPSystemTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Users
        self.instructor = User.objects.create_superuser(
            username="instructor", email="inst@example.com", password="password123"
        )
        self.student_a = User.objects.create_user(
            username="student_a", email="a@example.com", password="password123", first_name="Alice"
        )
        self.student_b = User.objects.create_user(
            username="student_b", email="b@example.com", password="password123", first_name="Bob"
        )

        # Course & Structure
        self.course = Course.objects.create(
            title="Robotics 101",
            slug="robotics-101",
            assigned_instructor=self.instructor,
            allow_self_pairing=True,
            is_published=True,
        )
        self.module = Module.objects.create(course=self.course, title="Module 1", order=1, is_visible=True)
        self.lesson = Lesson.objects.create(
            module=self.module, title="Lesson 1: Intro", order=1, is_visible=True
        )

        # Quiz
        self.quiz = Quiz.objects.create(
            lesson=self.lesson,
            title="Lesson 1 Quiz",
            points_reward=100,
            passing_score=50,
        )
        self.question = Question.objects.create(
            quiz=self.quiz, text="What is a robot?", order=1
        )
        self.correct_choice = Choice.objects.create(
            question=self.question, text="A machine", is_correct=True
        )

        # Cohort 1 & Cohort 2
        self.cohort_1 = Cohort.objects.create(
            course=self.course,
            name="Cohort Alpha",
            start_date=date(2026, 1, 1),
            end_date=date(2026, 6, 1),
            allow_students_to_see_classmates=True,
            show_classmate_xps=False,
        )
        self.cohort_1.students.add(self.student_a, self.student_b)

        self.cohort_2 = Cohort.objects.create(
            course=self.course,
            name="Cohort Beta",
            start_date=date(2026, 7, 1),
            end_date=date(2026, 12, 1),
            allow_students_to_see_classmates=True,
            show_classmate_xps=False,
        )
        self.cohort_2.students.add(self.student_a)

        # Enrollments
        self.enr_a = Enrollment.objects.create(user=self.student_a, course=self.course)
        self.enr_b = Enrollment.objects.create(user=self.student_b, course=self.course)

    def test_multi_cohort_xp_isolation(self):
        """When a student is in two cohorts, their XPs are kept different/separate."""
        # Create XP for student_a in cohort_1
        xp_c1 = UserXP.objects.create(
            user=self.student_a,
            course=self.course,
            cohort=self.cohort_1,
            total_xp=250,
        )
        # Create XP for student_a in cohort_2
        xp_c2 = UserXP.objects.create(
            user=self.student_a,
            course=self.course,
            cohort=self.cohort_2,
            total_xp=50,
        )

        self.assertEqual(xp_c1.total_xp, 250)
        self.assertEqual(xp_c2.total_xp, 50)
        self.assertNotEqual(xp_c1.id, xp_c2.id)

        # Fetching for cohort_1 gives 250
        fetched_c1 = UserXP.objects.get(user=self.student_a, course=self.course, cohort=self.cohort_1)
        self.assertEqual(fetched_c1.total_xp, 250)

        # Fetching for cohort_2 gives 50
        fetched_c2 = UserXP.objects.get(user=self.student_a, course=self.course, cohort=self.cohort_2)
        self.assertEqual(fetched_c2.total_xp, 50)

    def test_xp_privacy_in_course_classmates(self):
        """Students only see their own XP unless instructor enables show_classmate_xps."""
        # Set up XP
        UserXP.objects.create(
            user=self.student_a, course=self.course, cohort=self.cohort_1, total_xp=150
        )
        UserXP.objects.create(
            user=self.student_b, course=self.course, cohort=self.cohort_1, total_xp=300
        )

        # Student A calls classmates endpoint with show_classmate_xps=False
        self.client.force_authenticate(user=self.student_a)
        res = self.client.get(f"/api/courses/{self.course.slug}/classmates/?cohort_id={self.cohort_1.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        classmates = res.data.get("classmates", [])
        
        # Student B's XP should be hidden (None)
        b_entry = next((s for s in classmates if s["id"] == self.student_b.id), None)
        self.assertIsNotNone(b_entry)
        self.assertIsNone(b_entry["total_xp"])
        self.assertIsNone(b_entry["xp_level"])

        # Instructor calls classmates endpoint
        self.client.force_authenticate(user=self.instructor)
        res_inst = self.client.get(f"/api/courses/{self.course.slug}/classmates/?cohort_id={self.cohort_1.id}")
        self.assertEqual(res_inst.status_code, status.HTTP_200_OK)
        inst_classmates = res_inst.data.get("classmates", [])
        inst_b_entry = next((s for s in inst_classmates if s["id"] == self.student_b.id), None)
        self.assertEqual(inst_b_entry["total_xp"], 300)

        # Instructor enables show_classmate_xps via PATCH
        patch_res = self.client.patch(
            f"/api/courses/{self.course.slug}/classmates/",
            {"cohort_id": self.cohort_1.id, "show_classmate_xps": True},
            format="json",
        )
        self.assertEqual(patch_res.status_code, status.HTTP_200_OK)
        self.assertTrue(patch_res.data["show_classmate_xps"])

        # Student A calls again, now sees Student B's XP
        self.client.force_authenticate(user=self.student_a)
        res_after = self.client.get(f"/api/courses/{self.course.slug}/classmates/?cohort_id={self.cohort_1.id}")
        after_classmates = res_after.data.get("classmates", [])
        after_b_entry = next((s for s in after_classmates if s["id"] == self.student_b.id), None)
        self.assertEqual(after_b_entry["total_xp"], 300)

    def test_lesson_pairing_collaboration_xp_and_completion_sync(self):
        """Paired students get +20% collaboration XP and synchronized lesson completion."""
        # Create active pairing
        pairing = LessonPairing.objects.create(
            lesson=self.lesson,
            host_student=self.student_a,
            partner_student=self.student_b,
            current_driver=self.student_a,
            is_active=True,
        )

        # Student A submits quiz and passes (points_reward = 100, 1st attempt base = 100, +20% = 120)
        self.client.force_authenticate(user=self.student_a)
        quiz_res = self.client.post(
            f"/api/courses/{self.course.slug}/quizzes/{self.quiz.id}/submit/",
            {
                "cohort_id": self.cohort_1.id,
                "answers": {str(self.question.id): self.correct_choice.id},
            },
            format="json",
        )
        self.assertEqual(quiz_res.status_code, status.HTTP_200_OK)
        self.assertTrue(quiz_res.data["passed"])
        self.assertTrue(quiz_res.data["collaboration_bonus"])
        self.assertEqual(quiz_res.data["xp_awarded"], 120)

        # Check that both student A and partner student B received 120 XP
        xp_a = UserXP.objects.get(user=self.student_a, course=self.course, cohort=self.cohort_1)
        xp_b = UserXP.objects.get(user=self.student_b, course=self.course, cohort=self.cohort_1)
        self.assertEqual(xp_a.total_xp, 120)
        self.assertEqual(xp_b.total_xp, 120)

        # Test lesson completion sync: Student A marks lesson completed
        comp_res = self.client.post(f"/api/courses/{self.course.slug}/lessons/{self.lesson.id}/complete/")
        self.assertEqual(comp_res.status_code, status.HTTP_200_OK)
        self.assertTrue(comp_res.data["completed"])

        # Check that Student B's enrollment is also marked completed
        self.enr_b.refresh_from_db()
        self.assertTrue(self.enr_b.completed_lessons.filter(id=self.lesson.id).exists())

    def test_partner_change_request_and_teacher_approval(self):
        """Student requests partner change, teacher approves it, deactivating pairing."""
        pairing = LessonPairing.objects.create(
            lesson=self.lesson,
            host_student=self.student_a,
            partner_student=self.student_b,
            current_driver=self.student_a,
            is_active=True,
        )

        # Student A requests partner change
        self.client.force_authenticate(user=self.student_a)
        req_res = self.client.post(f"/api/courses/lessons/{self.lesson.id}/request-change-partner/")
        self.assertEqual(req_res.status_code, status.HTTP_200_OK)
        self.assertEqual(req_res.data["change_status"], "pending")

        pairing.refresh_from_db()
        self.assertEqual(pairing.change_status, "pending")
        self.assertEqual(pairing.change_requested_by, self.student_a)

        # Partner checks status via get_lesson_partner
        self.client.force_authenticate(user=self.student_b)
        partner_check = self.client.get(f"/api/courses/lessons/{self.lesson.id}/partner/")
        self.assertEqual(partner_check.status_code, status.HTTP_200_OK)
        self.assertEqual(partner_check.data["change_status"], "pending")
        self.assertFalse(partner_check.data["change_requested_by_me"])

        # Instructor approves the partner change
        self.client.force_authenticate(user=self.instructor)
        app_res = self.client.post(f"/api/admin/lesson-pairings/{pairing.id}/approve-change/")
        self.assertEqual(app_res.status_code, status.HTTP_200_OK)
        self.assertEqual(app_res.data["status"], "success")

        pairing.refresh_from_db()
        self.assertEqual(pairing.change_status, "approved")
        self.assertFalse(pairing.is_active)

        # Now Student A checks partner and has_partner is False
        self.client.force_authenticate(user=self.student_a)
        partner_check_after = self.client.get(f"/api/courses/lessons/{self.lesson.id}/partner/")
        self.assertEqual(partner_check_after.status_code, status.HTTP_200_OK)
        self.assertFalse(partner_check_after.data["has_partner"])

    def test_cohort_pairing_permissions(self):
        """Staff, superusers, and course instructors can toggle pairing and view pairing_status even if not in cohort.instructors explicitly."""
        # Unrelated user
        unrelated = User.objects.create_user(username="unrelated", password="password123")

        # 1. Unrelated user gets 403
        self.client.force_authenticate(user=unrelated)
        res = self.client.get(f"/api/cohort-teams/pairing_status/?cohort_id={self.cohort_1.id}")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        res = self.client.post("/api/cohort-teams/toggle_pairing/", {"cohort_id": self.cohort_1.id, "active": True})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Student in cohort can view pairing_status but cannot toggle
        self.client.force_authenticate(user=self.student_a)
        res = self.client.get(f"/api/cohort-teams/pairing_status/?cohort_id={self.cohort_1.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["is_pairing_active"])
        res = self.client.post("/api/cohort-teams/toggle_pairing/", {"cohort_id": self.cohort_1.id, "active": True})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Staff / Superuser / Course instructor (self.instructor is not in cohort_1.instructors M2M)
        self.assertFalse(self.cohort_1.instructors.filter(id=self.instructor.id).exists())
        self.client.force_authenticate(user=self.instructor)
        res = self.client.get(f"/api/cohort-teams/pairing_status/?cohort_id={self.cohort_1.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["is_pairing_active"])

        # Instructor toggles pairing ON
        toggle_res = self.client.post("/api/cohort-teams/toggle_pairing/", {"cohort_id": self.cohort_1.id, "active": True})
        self.assertEqual(toggle_res.status_code, status.HTTP_200_OK)
        self.cohort_1.refresh_from_db()
        self.assertTrue(self.cohort_1.is_pairing_active)

        # Student checks pairing_status again and sees is_pairing_active True
        self.client.force_authenticate(user=self.student_a)
        res = self.client.get(f"/api/cohort-teams/pairing_status/?cohort_id={self.cohort_1.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["is_pairing_active"])

    def test_dissolve_cohort_team(self):
        """Instructor can dissolve a CohortTeam via DELETE /api/cohort-teams/<id>/; unauthorized user gets 403."""
        team = CohortTeam.objects.create(
            cohort=self.cohort_1,
            name="Alpha Dragons",
            team_leader=self.student_a,
            created_by=self.instructor,
        )
        team.students.add(self.student_a, self.student_b)
        team.change_requests.add(self.student_b)

        # Student cannot dissolve
        self.client.force_authenticate(user=self.student_a)
        res = self.client.delete(f"/api/cohort-teams/{team.id}/")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        # Instructor dissolves
        self.client.force_authenticate(user=self.instructor)
        del_res = self.client.delete(f"/api/cohort-teams/{team.id}/")
        self.assertEqual(del_res.status_code, status.HTTP_200_OK)
        self.assertFalse(CohortTeam.objects.filter(id=team.id).exists())

    def test_cohort_team_xp_and_completion_sync(self):
        """When students work in a CohortTeam, quiz submissions award +20% collaboration XP to all teammates and lesson completion is synced."""
        team = CohortTeam.objects.create(
            cohort=self.cohort_1,
            name="Mighty Eagles",
            team_leader=self.student_a,
            created_by=self.instructor,
        )
        team.students.add(self.student_a, self.student_b)

        # Student A submits quiz on behalf of the team in cohort_1
        self.client.force_authenticate(user=self.student_a)
        quiz_res = self.client.post(
            f"/api/courses/{self.course.slug}/quizzes/{self.quiz.id}/submit/",
            {
                "cohort_id": self.cohort_1.id,
                "answers": {str(self.question.id): self.correct_choice.id},
            },
            format="json",
        )
        self.assertEqual(quiz_res.status_code, status.HTTP_200_OK)
        self.assertTrue(quiz_res.data["passed"])
        self.assertTrue(quiz_res.data["collaboration_bonus"])
        self.assertEqual(quiz_res.data["xp_awarded"], 120)

        # Both student A and student B get 120 XP in cohort_1
        xp_a = UserXP.objects.get(user=self.student_a, course=self.course, cohort=self.cohort_1)
        xp_b = UserXP.objects.get(user=self.student_b, course=self.course, cohort=self.cohort_1)
        self.assertEqual(xp_a.total_xp, 120)
        self.assertEqual(xp_b.total_xp, 120)

        # Test lesson completion sync via CohortTeam
        comp_res = self.client.post(
            f"/api/courses/{self.course.slug}/lessons/{self.lesson.id}/complete/",
            {"cohort_id": self.cohort_1.id},
            format="json",
        )
        self.assertEqual(comp_res.status_code, status.HTTP_200_OK)
        self.assertTrue(comp_res.data["completed"])

        self.enr_b.refresh_from_db()
        self.assertTrue(self.enr_b.completed_lessons.filter(id=self.lesson.id).exists())

    def test_bulk_reset_progress_single_student(self):
        """Instructors can reset progress for a single student in a cohort using student_ids."""
        # Set up XP for both students in cohort_1
        UserXP.objects.create(user=self.student_a, course=self.course, cohort=self.cohort_1, total_xp=150)
        UserXP.objects.create(user=self.student_b, course=self.course, cohort=self.cohort_1, total_xp=200)

        self.client.force_authenticate(user=self.instructor)
        res = self.client.post(
            f"/api/admin/cohorts/{self.cohort_1.id}/bulk-reset-progress/",
            {
                "student_ids": [self.student_a.id],
                "reset_xp": True,
            },
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # Student A's XP was deleted/reset for cohort_1
        self.assertFalse(UserXP.objects.filter(user=self.student_a, course=self.course, cohort=self.cohort_1).exists())

        # Student B's XP remains untouched (200)
        xp_b = UserXP.objects.get(user=self.student_b, course=self.course, cohort=self.cohort_1)
        self.assertEqual(xp_b.total_xp, 200)

    def test_user_heartbeat_and_presence(self):
        """Heartbeat endpoint updates last_seen and surfaces is_online in me, classmates, and pairing status."""
        self.client.force_authenticate(user=self.student_a)
        hb_res = self.client.post("/api/users/heartbeat/")
        self.assertEqual(hb_res.status_code, status.HTTP_200_OK)
        self.assertTrue(hb_res.data["is_online"])
        self.assertIsNotNone(hb_res.data["last_seen"])

        # Check me endpoint
        me_res = self.client.get("/api/me/")
        self.assertEqual(me_res.status_code, status.HTTP_200_OK)
        self.assertTrue(me_res.data["is_online"])
        self.assertIsNotNone(me_res.data["last_seen"])

        # Check classmates endpoint as instructor to view both students
        self.client.force_authenticate(user=self.instructor)
        classmates_res = self.client.get(f"/api/courses/{self.course.slug}/classmates/?cohort_id={self.cohort_1.id}")
        self.assertEqual(classmates_res.status_code, status.HTTP_200_OK)
        mates = classmates_res.data.get("classmates", [])
        a_mate = next((s for s in mates if s["id"] == self.student_a.id), None)
        self.assertIsNotNone(a_mate)
        self.assertTrue(a_mate["is_online"])
        self.assertIsNotNone(a_mate["last_seen"])

        # Student B has not pinged heartbeat recently
        b_mate = next((s for s in mates if s["id"] == self.student_b.id), None)
        self.assertIsNotNone(b_mate)
        self.assertFalse(b_mate["is_online"])



