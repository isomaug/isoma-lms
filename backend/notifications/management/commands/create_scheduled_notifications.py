from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from courses.models import UserSubscription
from notifications.models import Notification
from notifications.services import notify_user


class Command(BaseCommand):
    help = "Create time-based notifications such as Pro Pass expiry alerts."

    def handle(self, *args, **options):
        now = timezone.now()
        expiry_window = now + timedelta(days=3)
        created = 0

        for subscription in UserSubscription.objects.select_related("user").filter(
            is_active=True,
            expires_at__gt=now,
            expires_at__lte=expiry_window,
        ):
            notification = notify_user(
                subscription.user,
                event_type="pro.expiring",
                category=Notification.Category.ACCOUNT,
                priority=Notification.Priority.WARNING,
                title="Your Pro Pass expires soon",
                message=(
                    f"Your EkebuAI Pro Pass expires on "
                    f"{subscription.expires_at:%d %b %Y}."
                ),
                action_url="/my-learning",
                metadata={"subscription_id": subscription.pk},
                dedupe_key=(
                    f"pro-expiring:{subscription.pk}:"
                    f"{subscription.expires_at.date().isoformat()}"
                ),
            )
            created += int(notification is not None)

        for subscription in UserSubscription.objects.select_related("user").filter(
            is_active=True, expires_at__lte=now
        ):
            subscription.is_active = False
            subscription.save(update_fields=["is_active"])
            notification = notify_user(
                subscription.user,
                event_type="pro.expired",
                category=Notification.Category.ACCOUNT,
                priority=Notification.Priority.WARNING,
                title="Your Pro Pass has expired",
                message="Renew your EkebuAI Pro Pass to restore premium features.",
                action_url="/my-learning",
                metadata={"subscription_id": subscription.pk},
                dedupe_key=f"pro-expired:{subscription.pk}",
            )
            created += int(notification is not None)

        self.stdout.write(
            self.style.SUCCESS(f"Created or confirmed {created} scheduled notifications.")
        )

