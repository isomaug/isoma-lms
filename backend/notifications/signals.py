from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver

from courses.models import Certificate, CoursePayment, Enrollment, QuizAttempt

from .models import Notification
from .services import notify_staff, notify_user

User = get_user_model()


@receiver(post_save, sender=Enrollment)
def enrollment_notifications(sender, instance, created, **kwargs):
    if kwargs.get('raw', False):
        return
    if not created:
        return
    notify_user(
        instance.user,
        event_type="course.enrolled",
        category=Notification.Category.COURSE,
        priority=Notification.Priority.SUCCESS,
        title="Course access activated",
        message=f"You are enrolled in {instance.course.title}.",
        action_url=f"/courses/{instance.course.slug}/learn",
        metadata={"course_id": instance.course_id},
        dedupe_key=f"enrollment:{instance.pk}:learner",
    )
    notify_staff(
        event_type="course.new_enrollment",
        category=Notification.Category.ADMIN,
        title="New course enrollment",
        message=f"{instance.user.email or instance.user.username} enrolled in {instance.course.title}.",
        action_url="/dashboard/courses",
        metadata={"course_id": instance.course_id, "user_id": instance.user_id},
        dedupe_key=f"enrollment:{instance.pk}:staff",
        queue_email=False,
    )


@receiver(post_save, sender=CoursePayment)
def payment_notifications(sender, instance, **kwargs):
    if kwargs.get('raw', False):
        return
    course_name = instance.course.title if instance.course else "EkebuAI Pro Pass"
    status_label = instance.status.lower()
    priority = {
        "COMPLETED": Notification.Priority.SUCCESS,
        "FAILED": Notification.Priority.URGENT,
    }.get(instance.status, Notification.Priority.INFO)
    notify_user(
        instance.user,
        event_type=f"payment.{status_label}",
        category=Notification.Category.PAYMENT,
        priority=priority,
        title=f"Payment {status_label}",
        message=f"Your payment for {course_name} is {status_label}.",
        action_url="/my-learning" if instance.status == "COMPLETED" else "/cart",
        metadata={"payment_id": instance.pk, "status": instance.status},
        dedupe_key=f"payment:{instance.pk}:{instance.status}",
    )


@receiver(post_save, sender=Certificate)
def certificate_notifications(sender, instance, created, **kwargs):
    if kwargs.get('raw', False):
        return
    event = "certificate.available" if instance.is_approved else "certificate.requested"
    notify_user(
        instance.user,
        event_type=event,
        category=Notification.Category.CERTIFICATE,
        priority=(
            Notification.Priority.SUCCESS
            if instance.is_approved
            else Notification.Priority.INFO
        ),
        title="Certificate available" if instance.is_approved else "Certificate requested",
        message=(
            f"Your certificate for {instance.course.title} is ready."
            if instance.is_approved
            else f"Your certificate request for {instance.course.title} was received."
        ),
        action_url="/dashboard/certificates",
        metadata={"certificate_id": instance.pk},
        dedupe_key=f"certificate:{instance.pk}:{instance.is_approved}",
    )


@receiver(post_save, sender=QuizAttempt)
def quiz_notifications(sender, instance, created, **kwargs):
    if kwargs.get('raw', False):
        return
    if not created or not instance.passed:
        return
    if instance.quiz.module:
        course = instance.quiz.module.course
    elif instance.quiz.lesson and instance.quiz.lesson.module:
        course = instance.quiz.lesson.module.course
    else:
        return # Skip notification if course cannot be determined
    notify_user(
        instance.user,
        event_type="quiz.passed",
        category=Notification.Category.ACHIEVEMENT,
        priority=Notification.Priority.SUCCESS,
        title="Quiz passed",
        message=f"You passed {instance.quiz.title} with {instance.score}%.",
        action_url=f"/courses/{course.slug}/learn",
        metadata={"quiz_id": instance.quiz_id, "score": instance.score},
        dedupe_key=f"quiz-pass:{instance.quiz_id}:{instance.user_id}",
        queue_email=False,
    )

