import base64
import logging
import os

import requests
from django.core.files.base import ContentFile

from courses.models import AIImageArtifact
from courses.ai_tools.gemini_quota import (
    QUOTA_USER_MESSAGE,
    is_quota_error,
    is_quota_tripped,
    trip_quota,
)

logger = logging.getLogger(__name__)

IMAGE_MODELS = (
    "gemini-3.1-flash-lite-image",
    "gemini-2.5-flash-image",
)


def _api_key():
    return (
        os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GEMINI_API_KEY_LOCAL")
        or os.environ.get("GOOGLE_API_KEY")
        or os.environ.get("GEMINI_KEY")
        or ""
    ).strip()


def improve_image_prompt(prompt, edit_instruction=""):
    clean_prompt = " ".join(str(prompt or "").split()).strip()
    clean_edit = " ".join(str(edit_instruction or "").split()).strip()
    if clean_edit:
        return (
            "Edit the supplied image according to this instruction: "
            f"{clean_edit}. Preserve every subject, identity, object, colour, and "
            "composition detail that the instruction does not explicitly change. "
            "Return one polished, natural image only. Do not add a border, frame, "
            "mockup, caption, watermark, logo, or unexplained text."
        )
    return (
        f"Create one polished image of: {clean_prompt}. Use intentional composition, "
        "coherent lighting, refined colour harmony, crisp subject detail, and a clean "
        "premium finish. Preserve culturally accurate details. Do not add a border, "
        "frame, mockup, caption, watermark, logo, or unexplained text. Return only "
        "the finished image."
    )


def _extract_image(payload):
    candidates = payload.get("candidates") or []
    for candidate in candidates:
        parts = (candidate.get("content") or {}).get("parts") or []
        for part in parts:
            inline = part.get("inlineData") or part.get("inline_data")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"]), inline.get(
                    "mimeType", inline.get("mime_type", "image/png")
                )
    return None, None


def create_image_artifact(*, user, prompt, course=None, parent=None, instruction=""):
    artifact = AIImageArtifact.objects.create(
        user=user,
        course=course,
        parent=parent,
        prompt=prompt,
        edit_instruction=instruction,
        improved_prompt=improve_image_prompt(prompt, instruction),
        status=AIImageArtifact.Status.PROCESSING,
    )
    key = _api_key()
    if not key:
        artifact.status = AIImageArtifact.Status.FAILED
        artifact.error_message = "Image generation is not configured."
        artifact.save(update_fields=["status", "error_message"])
        return artifact
    if is_quota_tripped():
        artifact.status = AIImageArtifact.Status.FAILED
        artifact.error_message = QUOTA_USER_MESSAGE
        artifact.save(update_fields=["status", "error_message"])
        return artifact

    parts = []
    if parent and parent.image:
        try:
            with parent.image.open("rb") as source:
                source_data = base64.b64encode(source.read()).decode("ascii")
            parts.append(
                {
                    "inlineData": {
                        "mimeType": parent.mime_type or "image/png",
                        "data": source_data,
                    }
                }
            )
        except Exception:
            logger.exception("Unable to read source image artifact %s", parent.pk)
    parts.append({"text": artifact.improved_prompt})

    last_error = "The image service did not return an image."
    for model in IMAGE_MODELS:
        try:
            response = requests.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
                headers={"Content-Type": "application/json", "X-goog-api-key": key},
                json={
                    "contents": [{"role": "user", "parts": parts}],
                    "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]},
                },
                timeout=45,
            )
            body = response.text[:400] if response.text else ""
            if is_quota_error(response.status_code, body):
                trip_quota()
                last_error = QUOTA_USER_MESSAGE
                logger.warning("Image model %s hit Gemini quota; skipping remaining models.", model)
                break
            if response.status_code != 200:
                last_error = f"Image provider returned {response.status_code}."
                logger.warning("Image model %s failed: %s", model, response.text[:300])
                continue
            image_bytes, mime_type = _extract_image(response.json())
            if not image_bytes:
                continue
            extension = "jpg" if mime_type == "image/jpeg" else "png"
            artifact.image.save(
                f"ekebuai-{artifact.pk}.{extension}",
                ContentFile(image_bytes),
                save=False,
            )
            artifact.mime_type = mime_type
            artifact.provider_model = model
            artifact.status = AIImageArtifact.Status.READY
            artifact.error_message = ""
            artifact.save()
            return artifact
        except Exception as exc:
            last_error = "The image service timed out or could not be reached."
            logger.exception("Image generation failed with %s", model)

    artifact.status = AIImageArtifact.Status.FAILED
    artifact.error_message = last_error
    artifact.save(update_fields=["status", "error_message"])
    return artifact
