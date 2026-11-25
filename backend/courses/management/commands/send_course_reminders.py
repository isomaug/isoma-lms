from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from courses.models import Enrollment, StudySession
from notifications.models import Notification
from notifications.services import notify_user
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sends email reminders to students who have been inactive for 7 days.'

    def handle(self, *args, **kwargs):
        now = timezone.now()
        threshold_date = now - timedelta(days=7)
        
        # Get enrollments that have never been reminded OR were reminded > 7 days ago
        enrollments = Enrollment.objects.filter(
            last_reminded_at__isnull=True
        ) | Enrollment.objects.filter(
            last_reminded_at__lte=threshold_date
        )

        sent_count = 0

        for enrollment in enrollments:
            user = enrollment.user
            course = enrollment.course
            
            # Check the user's latest StudySession for this course
            latest_session = StudySession.objects.filter(user=user, course=course).order_by('-start_time').first()
            
            last_active_date = None
            if latest_session:
                last_active_date = latest_session.last_ping or latest_session.start_time
            else:
                # If no study sessions exist, fall back to the enrollment date
                last_active_date = enrollment.enrolled_at
                
            if last_active_date and last_active_date <= threshold_date:
                # User has been inactive for > 7 days. Send reminder.
                try:
                    notify_user(
                        user,
                        event_type="course.inactivity_reminder",
                        category=Notification.Category.COURSE,
                        priority=Notification.Priority.INFO,
                        title=f"Continue learning {course.title}",
                        message=(
                            "It has been a while since your last study session. "
                            "A short lesson today can keep your momentum going."
                        ),
                        action_url=f"/courses/{course.slug}/learn",
                        metadata={"course_id": course.pk},
                        dedupe_key=f"inactivity:{enrollment.pk}:{now.date().isoformat()}",
                    )
                    enrollment.last_reminded_at = now
                    enrollment.save(update_fields=['last_reminded_at'])
                    sent_count += 1
                    self.stdout.write(self.style.SUCCESS(f"Queued reminder for {user.email} and {course.title}"))
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Failed to queue reminder for {user.email}: {e}"))
                    logger.error(f"Reminder notification failed for {user.email}: {e}")

        self.stdout.write(self.style.SUCCESS(f"Finished queueing reminders. Total: {sent_count}"))
