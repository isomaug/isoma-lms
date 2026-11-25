from django.contrib.auth import get_user_model
from django.core import mail
from django.core.management import call_command
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Notification, NotificationDelivery
from .services import notify_user

User = get_user_model()


class NotificationServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="learner",
            email="learner@example.com",
            password="test-password",
        )

    def test_deduplicates_and_queues_email(self):
        first = notify_user(
            self.user,
            event_type="course.enrolled",
            category=Notification.Category.COURSE,
            title="Course access activated",
            message="Welcome",
            dedupe_key="enrollment:1",
        )
        second = notify_user(
            self.user,
            event_type="course.enrolled",
            category=Notification.Category.COURSE,
            title="Course access activated",
            message="Welcome",
            dedupe_key="enrollment:1",
        )

        self.assertEqual(first.pk, second.pk)
        self.assertEqual(Notification.objects.count(), 1)
        self.assertEqual(NotificationDelivery.objects.count(), 1)

    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
        FRONTEND_URL="https://example.com",
        EKEBULIVE_URL="https://example.com",
        PERSONAL_SITE_URL="",
        EKEBULIVE_FROM_EMAIL="no-reply@petergordonekebu.com",
        EKEBULIVE_FROM_NAME="EkebuLive",
        EKEBULIVE_REPLY_TO_EMAIL="support@petergordonekebu.com",
    )
    def test_processes_email_delivery(self):
        notification = notify_user(
            self.user,
            event_type="payment.completed",
            category=Notification.Category.PAYMENT,
            title="Payment completed",
            message="Your access is ready.",
            action_url="/my-learning",
            metadata={"site": "ekebulive"},
        )

        call_command("process_notification_deliveries")

        delivery = notification.deliveries.get()
        self.assertEqual(delivery.status, NotificationDelivery.Status.SENT)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("https://example.com/my-learning", mail.outbox[0].body)
        self.assertEqual(
            mail.outbox[0].from_email,
            "EkebuLive <no-reply@petergordonekebu.com>",
        )
        self.assertEqual(mail.outbox[0].reply_to, ["support@petergordonekebu.com"])
        self.assertIn("Ekebu", mail.outbox[0].alternatives[0][0])
        self.assertIn("#aa3bff", mail.outbox[0].alternatives[0][0])

    @override_settings(
        EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend",
        EKEBULIVE_URL="https://petergordonekebu.com",
        PERSONAL_SITE_URL="https://petergordonekebu.com",
    )
    def test_uses_product_domain_for_notification_links(self):
        notification = notify_user(
            self.user,
            event_type="meeting.created",
            category=Notification.Category.SYSTEM,
            title="Meeting ready",
            message="Your meeting is ready.",
            action_url="/live/test-room",
            metadata={"site": "ekebulive"},
            dedupe_key="meeting-domain-test",
        )

        call_command("process_notification_deliveries")

        self.assertIn(
            "https://petergordonekebu.com/live/test-room",
            mail.outbox[0].body,
        )


class NotificationApiTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user-one", password="test-password"
        )
        self.other = User.objects.create_user(
            username="user-two", password="test-password"
        )
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.notification = Notification.objects.create(
            recipient=self.user,
            event_type="system.update",
            title="Update available",
            message="A new update is ready.",
        )
        Notification.objects.create(
            recipient=self.other,
            event_type="system.private",
            title="Private",
            message="Not visible to user one.",
        )

    def test_list_is_scoped_to_authenticated_user(self):
        response = self.client.get("/api/notifications/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["id"], self.notification.pk)

    def test_read_all_updates_unread_count(self):
        response = self.client.get("/api/notifications/unread-count/")
        self.assertEqual(response.data["unread_count"], 1)

        response = self.client.post("/api/notifications/read-all/")
        self.assertEqual(response.status_code, 200)
        self.notification.refresh_from_db()
        self.assertIsNotNone(self.notification.read_at)

    def test_cannot_read_another_users_notification(self):
        other_notification = Notification.objects.get(recipient=self.other)
        response = self.client.post(
            f"/api/notifications/{other_notification.pk}/read/"
        )
        self.assertEqual(response.status_code, 404)

    def test_updates_preferences(self):
        response = self.client.patch(
            "/api/notifications/preferences/",
            {
                "email_enabled": False,
                "email_digest": "off",
                "sound_enabled": True,
                "sound_volume": 45,
                "quiet_hours_enabled": True,
                "quiet_hours_start": "21:30",
                "quiet_hours_end": "06:30",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["email_enabled"])
        self.assertEqual(response.data["email_digest"], "off")
        self.assertTrue(response.data["sound_enabled"])
        self.assertEqual(response.data["sound_volume"], 45)

    def test_rejects_sound_volume_above_one_hundred(self):
        response = self.client.patch(
            "/api/notifications/preferences/",
            {"sound_volume": 101},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
