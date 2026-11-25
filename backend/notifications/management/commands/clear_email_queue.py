from django.core.management.base import BaseCommand

from notifications.models import NotificationDelivery


class Command(BaseCommand):
    help = "Skip all pending/failed email deliveries so they are never sent."

    def handle(self, *args, **options):
        qs = NotificationDelivery.objects.filter(
            channel=NotificationDelivery.Channel.EMAIL,
            status__in=[
                NotificationDelivery.Status.PENDING,
                NotificationDelivery.Status.FAILED,
            ],
        )
        count = qs.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS("No pending/failed email deliveries to clear."))
            return

        qs.update(status=NotificationDelivery.Status.SKIPPED)
        self.stdout.write(
            self.style.SUCCESS(f"Skipped {count} queued email deliveries.")
        )
