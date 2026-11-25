import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from courses.models import Enrollment
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Sends reminder emails to students who enrolled >7 days ago but have 0% progress.'

    def handle(self, *args, **kwargs):
        seven_days_ago = timezone.now() - timedelta(days=7)
        
        # Find enrollments older than 7 days
        stagnant_enrollments = Enrollment.objects.filter(
            enrolled_at__lte=seven_days_ago
        )
        
        count = 0
        for enrollment in stagnant_enrollments:
            # Check if progress is 0%
            if enrollment.progress_percent == 0:
                user = enrollment.user
                course = enrollment.course
                
                # Check if we already sent a reminder recently
                # Do not send if reminded within the last 7 days
                if enrollment.last_reminded_at and enrollment.last_reminded_at > seven_days_ago:
                    continue
                
                
                from config.email import send_personal_mail, build_branded_email_html
                subject = f"We miss you in {course.title}!"
                learn_url = f"https://petergordonekebu.com/courses/{course.slug}/learn"
                message = f"Hi {user.first_name or user.username},\n\nYou enrolled in '{course.title}' a week ago but haven't started yet. Jump back in and start learning!\n\nAccess lessons: {learn_url}\n\nBest,\nPeter Gordon Ekebu"
                
                html_msg = build_branded_email_html(
                    title=f"Continue with {course.title}",
                    message_paragraphs=[
                        f"You enrolled in <strong>{course.title}</strong> recently. We noticed you haven't started your first lesson yet.",
                        "Consistency is the key to mastering new technical skills. Take 15 minutes today to explore the course material!",
                    ],
                    brand="personal",
                    recipient_name=user.first_name or user.username,
                    action_url=learn_url,
                    action_label="Start Learning Now",
                )
                
                try:
                    send_personal_mail(
                        subject,
                        message,
                        [user.email],
                        html_message=html_msg,
                        fail_silently=True,
                    )
                    enrollment.last_reminded_at = timezone.now()
                    enrollment.save(update_fields=['last_reminded_at'])
                    count += 1
                    self.stdout.write(self.style.SUCCESS(f"Sent reminder to {user.email} for {course.title}"))
                except Exception as e:
                    self.stderr.write(self.style.ERROR(f"Failed to send to {user.email}: {e}"))
                    
        self.stdout.write(self.style.SUCCESS(f"Finished checking stagnant students. Sent {count} emails."))
