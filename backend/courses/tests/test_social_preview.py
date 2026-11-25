from unittest.mock import patch

from django.test import TestCase, override_settings

from .models import Course


@override_settings(PUBLIC_SITE_URL="https://petergordonekebu.com")
class CourseSocialPreviewTests(TestCase):
    social_user_agents = (
        "facebookexternalhit/1.1",
        "Twitterbot/1.0",
        "WhatsApp/2.0",
        "LinkedInBot/1.0",
        "Slackbot-LinkExpanding 1.0",
        "Discordbot/2.0",
        "TelegramBot (like TwitterBot)",
    )

    def setUp(self):
        self.course = Course.objects.create(
            title='Data & AI <Foundations> "Safety"',
            slug="data-ai-foundations",
            subtitle='Learn <strong>secure</strong> systems & "responsible AI".',
            description="A longer description that should not override the subtitle.",
            thumbnail="https://cdn.example.com/course-thumbnail.jpg",
            instructor_name="Peter Gordon Ekebu",
            is_published=True,
        )

    def test_common_social_crawlers_receive_course_metadata(self):
        for user_agent in self.social_user_agents:
            with self.subTest(user_agent=user_agent):
                response = self.client.get(
                    f"/courses/{self.course.slug}",
                    HTTP_USER_AGENT=user_agent,
                )

                self.assertEqual(response.status_code, 200)
                html = response.content.decode()
                self.assertIn(
                    'content="Data &amp; AI &lt;Foundations&gt; &quot;Safety&quot; | Online Course"',
                    html,
                )
                self.assertIn(
                    'content="https://cdn.example.com/course-thumbnail.jpg"',
                    html,
                )
                self.assertIn(
                    'content="https://petergordonekebu.com/courses/data-ai-foundations"',
                    html,
                )
                self.assertIn('name="twitter:card" content="summary_large_image"', html)
                self.assertNotIn("<strong>secure</strong>", html)
                self.assertIn("User-Agent", response.headers.get("Vary", ""))
                self.assertIn("no-store", response.headers.get("Cache-Control", ""))

    def test_normal_browser_receives_spa_without_redirect(self):
        response = self.client.get(
            f"/courses/{self.course.slug}",
            HTTP_USER_AGENT="Mozilla/5.0",
        )

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("Location", response.headers)
        self.assertContains(response, 'id="root"')

    def test_slash_variants_use_the_same_canonical_url(self):
        for path in (
            f"/courses/{self.course.slug}",
            f"/courses/{self.course.slug}/",
        ):
            with self.subTest(path=path):
                response = self.client.get(path, HTTP_USER_AGENT="WhatsApp/2.0")
                self.assertContains(
                    response,
                    'content="https://petergordonekebu.com/courses/data-ai-foundations"',
                )

    def test_uploaded_thumbnail_takes_priority_and_becomes_absolute(self):
        self.course.thumbnail_upload = "course_thumbnails/uploaded-course.png"
        self.course.save(update_fields=["thumbnail_upload"])

        with (
            patch.object(self.course.thumbnail_upload.storage, "exists", return_value=True),
            patch.object(self.course.thumbnail_upload.storage, "url", return_value="/media/course_thumbnails/uploaded-course.png"),
        ):
            response = self.client.get(
                f"/courses/{self.course.slug}",
                HTTP_USER_AGENT="facebookexternalhit/1.1",
            )

        self.assertContains(
            response,
            'content="https://petergordonekebu.com/media/course_thumbnails/uploaded-course.png"',
        )
        self.assertNotContains(response, "https://cdn.example.com/course-thumbnail.jpg")

    def test_missing_uploaded_file_uses_external_thumbnail(self):
        self.course.thumbnail_upload = "course_thumbnails/missing-course.png"
        self.course.save(update_fields=["thumbnail_upload"])

        response = self.client.get(
            f"/courses/{self.course.slug}",
            HTTP_USER_AGENT="facebookexternalhit/1.1",
        )

        self.assertContains(
            response,
            'content="https://cdn.example.com/course-thumbnail.jpg"',
        )

    def test_storage_url_error_uses_external_thumbnail(self):
        self.course.thumbnail_upload = "course_thumbnails/unavailable-course.png"
        self.course.save(update_fields=["thumbnail_upload"])

        storage = self.course.thumbnail_upload.storage
        with (
            patch.object(storage, "exists", return_value=True),
            patch.object(storage, "url", side_effect=RuntimeError("storage unavailable")),
            patch("courses.views.logger.warning") as warning,
        ):
            response = self.client.get(
                f"/courses/{self.course.slug}",
                HTTP_USER_AGENT="facebookexternalhit/1.1",
            )

        self.assertContains(
            response,
            'content="https://cdn.example.com/course-thumbnail.jpg"',
        )
        warning.assert_called_once()

    def test_missing_thumbnail_uses_branded_fallback(self):
        self.course.thumbnail = ""
        self.course.save(update_fields=["thumbnail"])

        response = self.client.get(
            f"/courses/{self.course.slug}",
            HTTP_USER_AGENT="Twitterbot/1.0",
        )

        self.assertContains(
            response,
            'content="https://petergordonekebu.com/icon-512.png"',
        )

    def test_unpublished_course_is_not_exposed_to_social_crawlers(self):
        self.course.is_published = False
        self.course.save(update_fields=["is_published"])

        response = self.client.get(
            f"/courses/{self.course.slug}",
            HTTP_USER_AGENT="LinkedInBot/1.0",
        )

        self.assertEqual(response.status_code, 404)

    def test_preview_route_does_not_shadow_learning_or_api_routes(self):
        learning_response = self.client.get(
            f"/courses/{self.course.slug}/learn",
            HTTP_USER_AGENT="facebookexternalhit/1.1",
        )
        api_response = self.client.get(
            f"/api/courses/{self.course.slug}/",
            HTTP_USER_AGENT="facebookexternalhit/1.1",
        )

        self.assertEqual(learning_response.status_code, 200)
        self.assertContains(learning_response, 'id="root"')
        self.assertEqual(api_response.status_code, 200)
        self.assertEqual(api_response.json()["slug"], self.course.slug)
