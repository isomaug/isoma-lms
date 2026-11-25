from django.contrib.auth import get_user_model
from django.db import models

from .models import Notification, NotificationDelivery, NotificationPreference

User = get_user_model()


def notify_user(
    recipient,
    *,
    event_type,
    title,
    message,
    category=Notification.Category.SYSTEM,
    priority=Notification.Priority.INFO,
    action_url="",
    metadata=None,
    dedupe_key="",
    queue_email=True,
):
    if not recipient or not recipient.is_active:
        return None

    preference, _ = NotificationPreference.objects.get_or_create(user=recipient)
    in_app_enabled = preference.channel_enabled(category, "in_app")
    email_enabled = (
        queue_email
        and bool(recipient.email)
        and preference.email_digest != NotificationPreference.Digest.OFF
        and preference.channel_enabled(category, "email")
    )
    if not in_app_enabled and not email_enabled:
        return None

    defaults = {
        "event_type": event_type,
        "category": category,
        "priority": priority,
        "title": title,
        "message": message,
        "action_url": action_url,
        "metadata": metadata or {},
        "in_app_visible": in_app_enabled,
    }
    if dedupe_key:
        notification, _ = Notification.objects.get_or_create(
            recipient=recipient,
            dedupe_key=dedupe_key,
            defaults=defaults,
        )
    else:
        notification = Notification.objects.create(recipient=recipient, **defaults)

    if email_enabled:
        NotificationDelivery.objects.get_or_create(
            notification=notification,
            channel=NotificationDelivery.Channel.EMAIL,
        )
    return notification


def notify_staff(**kwargs):
    recipients = User.objects.filter(is_active=True).filter(
        models.Q(is_staff=True)
        | models.Q(is_superuser=True)
        | models.Q(groups__name="Instructors")
    ).distinct()
    return [notify_user(user, **kwargs) for user in recipients]
