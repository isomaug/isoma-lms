from datetime import timedelta
from unittest.mock import patch

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .ai_tools.groq_chat import complete_chat, groq_api_key, to_gemini_payload
from .ai_tools.images import improve_image_prompt
from .entitlements import get_ai_entitlement
from .models import AIImageArtifact, Course, Enrollment, UserSubscription


class AIEntitlementTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("learner", password="password")

    def test_active_subscription_enables_all_pro_capabilities(self):
        UserSubscription.objects.create(
            user=self.user,
            expires_at=timezone.now() + timedelta(days=3),
        )
        entitlement = get_ai_entitlement(self.user)
        self.assertTrue(entitlement["is_pro"])
        self.assertTrue(entitlement["capabilities"]["image_generate"])
        self.assertTrue(entitlement["capabilities"]["image_edit"])

    def test_expired_subscription_is_not_pro(self):
        UserSubscription.objects.create(
            user=self.user,
            expires_at=timezone.now() - timedelta(minutes=1),
        )
        entitlement = get_ai_entitlement(self.user)
        self.assertFalse(entitlement["is_pro"])
        self.assertFalse(entitlement["capabilities"]["image_generate"])


class AIImageFeatureTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("artist", password="password")
        self.other = User.objects.create_user("other", password="password")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def test_image_prompts_explicitly_exclude_frames_and_unrequested_text(self):
        prompt = improve_image_prompt("a robotics class in Kampala")
        self.assertIn("Do not add a border, frame", prompt)
        self.assertIn("unexplained text", prompt)

    def test_user_cannot_edit_another_users_image(self):
        UserSubscription.objects.create(
            user=self.user,
            expires_at=timezone.now() + timedelta(days=3),
        )
        artifact = AIImageArtifact.objects.create(
            user=self.other,
            prompt="private image",
            status=AIImageArtifact.Status.READY,
        )
        with patch("courses.ai_tools.images.create_image_artifact") as generator:
            response = self.client.post(
                f"/api/courses/ekebu-ai/images/{artifact.pk}/edit/",
                {"instruction": "change the background"},
                format="json",
            )
        self.assertEqual(response.status_code, 404)
        generator.assert_not_called()


class GroqChatTests(TestCase):
    def test_to_gemini_payload_maps_text_and_tool_calls(self):
        payload = to_gemini_payload(
            {
                "content": "Saved.",
                "tool_calls": [
                    {
                        "function": {
                            "name": "remember_fact",
                            "arguments": '{"fact":"struggles with loops","category":"struggle"}',
                        }
                    }
                ],
            }
        )
        parts = payload["candidates"][0]["content"]["parts"]
        self.assertEqual(parts[0]["text"], "Saved.")
        self.assertEqual(parts[1]["functionCall"]["name"], "remember_fact")
        self.assertEqual(parts[1]["functionCall"]["args"]["fact"], "struggles with loops")

    @patch("courses.ai_tools.groq_chat.requests.post")
    def test_complete_chat_uses_current_groq_model(self, post):
        response = post.return_value
        response.status_code = 200
        response.json.return_value = {
            "choices": [{"message": {"content": "A loop repeats a block of instructions."}}]
        }
        data, model = complete_chat(
            api_key="gsk_test",
            system_prompt="You are EkebuAI.",
            history=[],
            query="What is a loop?",
        )
        self.assertEqual(model, "openai/gpt-oss-120b")
        self.assertEqual(
            data["candidates"][0]["content"]["parts"][0]["text"],
            "A loop repeats a block of instructions.",
        )
        self.assertEqual(
            post.call_args.kwargs["json"]["model"], "openai/gpt-oss-120b"
        )
        self.assertEqual(post.call_args.kwargs["json"]["reasoning_effort"], "low")


class GroqAssistantFallbackTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user("learner", password="password")
        self.course = Course.objects.create(
            title="AI Explorers",
            slug="ai-explorers-groq",
            is_published=True,
        )
        Enrollment.objects.create(user=self.user, course=self.course)
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    @patch.dict(
        "os.environ",
        {
            "GROQ_API_KEY": "gsk_test",
            "GEMINI_API_KEY": "",
            "GEMINI_API_KEY_LOCAL": "",
            "GOOGLE_API_KEY": "",
            "GEMINI_KEY": "",
        },
        clear=False,
    )
    @patch("courses.ai_tools.groq_chat.complete_chat")
    def test_assistant_falls_back_to_groq(self, groq_complete):
        groq_complete.return_value = (
            {
                "candidates": [
                    {
                        "content": {
                            "parts": [{"text": "A loop repeats a block of instructions."}]
                        }
                    }
                ]
            },
            "openai/gpt-oss-120b",
        )
        response = self.client.post(
            f"/api/courses/{self.course.slug}/assistant/",
            {"query": "What is a loop?"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["type"], "text")
        self.assertIn("loop", response.data["reply"].lower())
        self.assertEqual(response.data["model_used"], "openai/gpt-oss-120b")
        groq_complete.assert_called_once()


class LiveGroqChatTests(TestCase):
    def test_live_groq_returns_a_reply(self):
        key = groq_api_key()
        if not key:
            self.skipTest("GROQ_API_KEY is not configured")
        data, model = complete_chat(
            api_key=key,
            system_prompt="You are EkebuAI. Answer in one short sentence.",
            history=[],
            query="In one sentence, what is a loop in programming?",
        )
        self.assertIsNotNone(data, msg=model)
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        self.assertTrue(text.strip())
        self.assertNotEqual(model, "ai-error")
