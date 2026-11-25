from django.core.management.base import BaseCommand
from notifications.models import NotificationDelivery


class Command(BaseCommand):
    help = "Clear backlogged pending and failed notification emails so they are not sent."

    def add_arguments(self, parser):
        parser.add_argument(
            "--delete",
            action="store_true",
            help="Permanently delete backlogged delivery records instead of marking them skipped",
        )

    def handle(self, *args, **options):
        qs = NotificationDelivery.objects.filter(status__in=["pending", "failed"])
        count = qs.count()
        if count == 0:
            self.stdout.write(self.style.SUCCESS("[OK] No backlogged emails found."))
            return

        if options["delete"]:
            deleted, _ = qs.delete()
            self.stdout.write(self.style.SUCCESS(f"[OK] Successfully deleted {deleted} backlogged email delivery records."))
        else:
            updated = qs.update(status=NotificationDelivery.Status.SKIPPED)
            self.stdout.write(
                self.style.SUCCESS(
                    f"[OK] Successfully cleared {updated} backlogged email delivery records (status set to 'skipped')."
                )
            )
