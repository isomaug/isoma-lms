from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from datetime import timedelta

from programs.models import ProgramPerson, ProgramSeason, ProgramSession
from programs.services import render_guest_invite


User = get_user_model()


class ProgramInviteTests(TestCase):
    def setUp(self):
        self.superuser = User.objects.create_superuser(
            username="admin", email="admin@petergordonekebu.com", password="testpass123"
        )
        self.staff = User.objects.create_user(
            username="staff",
            email="staff@petergordonekebu.com",
            password="testpass123",
            is_staff=True,
        )
        self.season = ProgramSeason.objects.create(
            name="Test Season",
            slug="test-season",
            timezone="Africa/Nairobi",
        )
        self.host = ProgramPerson.objects.create(
            display_name="Peter Gordon Ekebu",
            email="hello@petergordonekebu.com",
            is_host=True,
            is_speaker=False,
        )
        self.guest = ProgramPerson.objects.create(
            display_name="Ada Guest",
            email="ada@example.com",
            bio="Builder",
            is_speaker=True,
        )
        self.session = ProgramSession.objects.create(
            season=self.season,
            week_number=2,
            topic="Learning, work, or career: how to choose a next step",
            starts_at=timezone.now() + timedelta(days=7),
            host=self.host,
        )
        self.session.guests.add(self.guest)
        self.client = APIClient()

    def test_render_includes_guest_and_topic(self):
        rendered = render_guest_invite(self.session, self.guest)
        self.assertIn("Ada", rendered["body_text"])
        self.assertEqual(rendered["context"]["guest_name"], "Ada Guest")
        self.assertIn("Week 2", rendered["body_text"])
        self.assertIn(self.session.topic, rendered["body_text"])
        self.assertIn("#AA3BFF", rendered["body_html"])

    def test_superuser_can_list_people(self):
        self.client.force_authenticate(self.superuser)
        res = self.client.get("/api/programs/people/")
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 2)

    def test_staff_non_superuser_forbidden(self):
        self.client.force_authenticate(self.staff)
        res = self.client.get("/api/programs/people/")
        self.assertEqual(res.status_code, 403)

    def test_invalid_headshot_url_is_blanked(self):
        self.client.force_authenticate(self.superuser)
        res = self.client.post(
            "/api/programs/people/",
            {
                "display_name": "Soft URL",
                "headshot_url": "not-a-url",
                "is_speaker": True,
            },
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data["headshot_url"], "")


class PublicProgramSessionTests(TestCase):
    def setUp(self):
        self.season = ProgramSeason.objects.create(
            name="Information Sessions Season 1",
            slug="information-sessions-s1",
            timezone="Africa/Nairobi",
        )
        self.host = ProgramPerson.objects.create(
            display_name="Peter Gordon Ekebu",
            email="secret-host@example.com",
            phone="0700000000",
            bio="Founder, EkebuLive",
            is_host=True,
        )
        self.published = ProgramSession.objects.create(
            season=self.season,
            week_number=2,
            topic="Learning, work, or career",
            title="Learning, work, or career",
            starts_at=timezone.now() + timedelta(days=7),
            host=self.host,
            status=ProgramSession.Status.CONFIRMED,
            promise="Leave with one next step you can take this week.",
            join_url="https://petergordonekebu.com/live/abc123xyz0",
            is_published=True,
        )
        self.hidden = ProgramSession.objects.create(
            season=self.season,
            week_number=3,
            topic="Draft only",
            starts_at=timezone.now() + timedelta(days=14),
            host=self.host,
            status=ProgramSession.Status.PLANNED,
            is_published=False,
        )
        self.cancelled = ProgramSession.objects.create(
            season=self.season,
            week_number=4,
            topic="Cancelled week",
            starts_at=timezone.now() + timedelta(days=21),
            host=self.host,
            status=ProgramSession.Status.CANCELLED,
            join_url="https://petergordonekebu.com/live/cancelled01",
            is_published=True,
        )
        self.client = APIClient()

    def test_anonymous_lists_published_sessions_only(self):
        res = self.client.get("/api/programs/public-sessions/")
        self.assertEqual(res.status_code, 200)
        ids = [row["id"] for row in res.data]
        self.assertEqual(ids, [self.published.id])
        row = res.data[0]
        self.assertEqual(row["join_path"], "/live/abc123xyz0")
        self.assertEqual(row["promise"], "Leave with one next step you can take this week.")
        self.assertEqual(row["host"]["display_name"], "Peter Gordon Ekebu")
        self.assertNotIn("email", row["host"])
        self.assertNotIn("phone", row["host"])
        self.assertNotIn("internal_notes", row)
        payload = str(res.data)
        self.assertNotIn("secret-host@example.com", payload)
        self.assertNotIn("0700000000", payload)

    def test_staff_cannot_use_csm_without_superuser(self):
        user = User.objects.create_user(username="staff2", password="x")
        self.client.force_authenticate(user)
        res = self.client.get("/api/programs/sessions/")
        self.assertEqual(res.status_code, 403)

