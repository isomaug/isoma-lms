from datetime import timedelta

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.management.base import BaseCommand
from django.db import models
from django.template.loader import render_to_string
from django.utils import timezone
from django.core.mail.message import formataddr
from config.email import get_ekebulive_connection, get_personal_connection

from notifications.models import Notification, NotificationDelivery, NotificationPreference


def is_ekebulive_notification(notification):
    """Determine if a notification belongs to EkebuLive or the personal Peter Gordon Ekebu platform."""
    requested_site = notification.metadata.get("site")
    if requested_site == "ekebulive":
        return True
    if requested_site == "personal":
        return False

    # Educational / LMS / Portfolio / Payments / Certificates belong to Peter Gordon Ekebu
    if notification.category in {
        Notification.Category.COURSE,
        Notification.Category.CERTIFICATE,
        Notification.Category.ACHIEVEMENT,
        Notification.Category.PAYMENT,
    }:
        return False

    if notification.event_type.startswith(("meeting.", "liveroom.", "ekebulive.")):
        return True

    return False


def get_notification_site_url(notification):
    """Select the product domain without duplicating the shared URL setting."""
    personal_site_url = (
        getattr(settings, "PERSONAL_SITE_URL", "").strip()
        or getattr(settings, "FRONTEND_URL", "").strip()
        or "https://petergordonekebu.com"
    )
    ekebulive_url = (
        getattr(settings, "EKEBULIVE_URL", "").strip()
        or getattr(settings, "FRONTEND_URL", "").strip()
        or "https://www.ekebulive.com"
    )

    if is_ekebulive_notification(notification):
        return ekebulive_url.rstrip("/")
    return personal_site_url.rstrip("/")


class Command(BaseCommand):
    help = "Send queued notification emails and retry temporary failures with multi-brand routing."

    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=100)
        parser.add_argument(
            "--digest",
            choices=["immediate", "daily", "weekly", "all"],
            default="immediate",
        )

    def handle(self, *args, **options):
        now = timezone.now()
        deliveries = (
            NotificationDelivery.objects.select_related(
                "notification", "notification__recipient"
            )
            .filter(
                channel=NotificationDelivery.Channel.EMAIL,
                status__in=[
                    NotificationDelivery.Status.PENDING,
                    NotificationDelivery.Status.FAILED,
                ],
            )
            .filter(
                models.Q(next_attempt_at__isnull=True)
                | models.Q(next_attempt_at__lte=now)
            )[: options["limit"]]
        )
        sent = failed = skipped = 0

        for delivery in deliveries:
            notification = delivery.notification
            recipient = notification.recipient
            preference, _ = NotificationPreference.objects.get_or_create(
                user=recipient
            )
            requested_digest = options["digest"]
            if (
                requested_digest != "all"
                and preference.email_digest != requested_digest
            ):
                continue
            if (
                not recipient.email
                or not preference.email_enabled
                or preference.email_digest == NotificationPreference.Digest.OFF
                or not preference.channel_enabled(notification.category, "email")
            ):
                delivery.status = NotificationDelivery.Status.SKIPPED
                delivery.save(update_fields=["status", "updated_at"])
                skipped += 1
                continue

            delivery.attempts += 1
            try:
                is_ekebu = is_ekebulive_notification(notification)
                site_url = get_notification_site_url(notification)

                if is_ekebu:
                    from_name = getattr(settings, "EKEBULIVE_FROM_NAME", "EkebuLive")
                    from_email = getattr(settings, "EKEBULIVE_FROM_EMAIL", "support@petergordonekebu.com")
                    reply_to = [getattr(settings, "EKEBULIVE_REPLY_TO_EMAIL", "support@petergordonekebu.com")]
                    connection = get_ekebulive_connection()
                    brand = "ekebulive"
                else:
                    from_name = getattr(settings, "DEFAULT_FROM_NAME", "Peter Gordon Ekebu")
                    from_email = getattr(settings, "DEFAULT_FROM_EMAIL_RAW", "hello@petergordonekebu.com")
                    reply_to = [getattr(settings, "DEFAULT_REPLY_TO_EMAIL", "hello@petergordonekebu.com")]
                    connection = get_personal_connection()
                    brand = "personal"

                from_sender = formataddr((from_name, from_email))

                context = {
                    "notification": notification,
                    "recipient": recipient,
                    "action_url": (
                        f"{site_url}{notification.action_url}"
                        if notification.action_url.startswith("/")
                        else notification.action_url
                    ),
                    "site_url": site_url,
                    "meeting": notification.metadata.get("meeting", {}),
                    "is_ekebulive": is_ekebu,
                    "brand": brand,
                    "brand_name": from_name,
                    "from_email": from_email,
                }
                text_body = render_to_string(
                    "notifications/email/notification.txt", context
                )
                html_body = render_to_string(
                    "notifications/email/notification.html", context
                )
                email = EmailMultiAlternatives(
                    subject=notification.title,
                    body=text_body,
                    from_email=from_sender,
                    to=[recipient.email],
                    reply_to=reply_to,
                    connection=connection,
                )
                email.attach_alternative(html_body, "text/html")
                email.send(fail_silently=False)
                delivery.status = NotificationDelivery.Status.SENT
                delivery.sent_at = timezone.now()
                delivery.last_error = ""
                delivery.next_attempt_at = None
                sent += 1
            except Exception as exc:
                delivery.status = NotificationDelivery.Status.FAILED
                delivery.last_error = str(exc)[:2000]
                delay_minutes = min(60, 2 ** min(delivery.attempts, 5))
                delivery.next_attempt_at = timezone.now() + timedelta(
                    minutes=delay_minutes
                )
                failed += 1
            delivery.save(
                update_fields=[
                    "status",
                    "attempts",
                    "last_error",
                    "next_attempt_at",
                    "sent_at",
                    "updated_at",
                ]
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Notification delivery complete: {sent} sent, "
                f"{failed} failed, {skipped} skipped."
            )
        )
