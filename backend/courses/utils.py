import requests
import os
import re
import logging

logger = logging.getLogger(__name__)

def notify_discord(message):
    webhook_url = os.environ.get("DISCORD_WEBHOOK_URL")
    if not webhook_url:
        return
    
    try:
        requests.post(webhook_url, json={"content": message}, timeout=5)
    except Exception as e:
        logger.error(f"Failed to send discord webhook: {e}")


def name_from_email(email):
    """Derive a readable display name from an email local-part."""
    if not email or "@" not in str(email):
        return ""
    local = str(email).split("@", 1)[0]
    cleaned = re.sub(r"[._+\-]+", " ", local)
    cleaned = re.sub(r"\d+", " ", cleaned)
    parts = [p for p in cleaned.split() if p]
    return " ".join(p[:1].upper() + p[1:].lower() for p in parts)


def user_display_name(user):
    """Prefer real name, else email-derived name, else username."""
    middle = ""
    try:
        middle = (user.profile.middle_name or "").strip()
    except Exception:
        middle = ""
    parts = [
        p.strip()
        for p in [getattr(user, "first_name", ""), middle, getattr(user, "last_name", "")]
        if p and str(p).strip()
    ]
    if parts:
        return " ".join(parts)
    email_name = name_from_email(getattr(user, "email", "") or "")
    if email_name:
        return email_name
    return getattr(user, "username", "") or "User"


def parse_gender(value):
    """Normalize gender to M or F (Male/Female only)."""
    if value is None:
        return None
    raw = str(value).strip().lower()
    if not raw:
        return None
    if raw in ("m", "male", "boy", "man"):
        return "M"
    if raw in ("f", "female", "girl", "woman"):
        return "F"
    if raw.startswith("m"):
        return "M"
    if raw.startswith("f"):
        return "F"
    return None


def google_picture_url(user):
    """Return Google profile picture URL from linked social account, if any."""
    try:
        from allauth.socialaccount.models import SocialAccount
        acct = SocialAccount.objects.filter(user=user, provider="google").first()
        if not acct:
            return None
        picture = (acct.extra_data or {}).get("picture")
        if not picture or not isinstance(picture, str):
            return None
        import re
        hd_picture = re.sub(r'=s\d+(-c)?', '=s512-c', picture.strip()) if '=s' in picture else picture.strip()
        return hd_picture
    except Exception:
        return None


def resolve_user_avatar_url(user, request=None):
    """
    Prefer uploaded profile avatar; otherwise use Google social picture.
    """
    try:
        profile = getattr(user, "profile", None)
        if profile and getattr(profile, "avatar", None):
            try:
                url = profile.avatar.url
                if request:
                    return request.build_absolute_uri(url)
                return url
            except Exception:
                pass
    except Exception:
        pass

    picture = google_picture_url(user)
    if picture:
        return picture
    return None


def sync_google_avatar_to_profile(user, picture_url=None, force=True):
    """
    Download Google profile picture and store it on UserProfile.avatar.
    force=True overwrites existing avatar so Google pic always wins for Google users.
    """
    from .models import UserProfile

    url = picture_url or google_picture_url(user)
    if not url:
        return False

    profile, _ = UserProfile.objects.get_or_create(user=user)
    if profile.avatar and not force:
        return False

    try:
        resp = requests.get(url, timeout=12)
        resp.raise_for_status()
        content_type = (resp.headers.get("Content-Type") or "").split(";")[0].strip().lower()
        ext = ".jpg"
        if "png" in content_type:
            ext = ".png"
        elif "webp" in content_type:
            ext = ".webp"
        elif "gif" in content_type:
            ext = ".gif"
        from django.core.files.base import ContentFile
        filename = f"google_{user.id}{ext}"
        if profile.avatar:
            try:
                profile.avatar.delete(save=False)
            except Exception:
                pass
        profile.avatar.save(filename, ContentFile(resp.content), save=True)
        return True
    except Exception as e:
        logger.warning("Failed to sync Google avatar for user %s: %s", getattr(user, "id", "?"), e)
        return False
