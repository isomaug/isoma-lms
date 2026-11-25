from datetime import time

from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Category(models.TextChoices):
        COURSE = "course", "Course"
        PAYMENT = "payment", "Payment"
        CERTIFICATE = "certificate", "Certificate"
        ACHIEVEMENT = "achievement", "Achievement"
        MESSAGE = "message", "Message"
        ACCOUNT = "account", "Account"
        ADMIN = "admin", "Administration"
        SYSTEM = "system", "System"

    class Priority(models.TextChoices):
        INFO = "info", "Information"
        SUCCESS = "success", "Success"
        WARNING = "warning", "Warning"
        URGENT = "urgent", "Urgent"

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    event_type = models.SlugField(max_length=80)
    category = models.CharField(
        max_length=20, choices=Category.choices, default=Category.SYSTEM
    )
    priority = models.CharField(
        max_length=12, choices=Priority.choices, default=Priority.INFO
    )
    title = models.CharField(max_length=180)
    message = models.TextField()
    action_url = models.CharField(max_length=500, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    dedupe_key = models.CharField(max_length=180, blank=True)
    in_app_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    seen_at = models.DateTimeField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    archived_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["recipient", "read_at", "-created_at"]),
            models.Index(fields=["recipient", "category", "-created_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["recipient", "dedupe_key"],
                condition=~models.Q(dedupe_key=""),
                name="unique_notification_dedupe_per_user",
            )
        ]

    def __str__(self):
        return f"{self.recipient}: {self.title}"


class NotificationPreference(models.Model):
    class Digest(models.TextChoices):
        IMMEDIATE = "immediate", "Immediate"
        DAILY = "daily", "Daily digest"
        WEEKLY = "weekly", "Weekly digest"
        OFF = "off", "Off"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_preferences",
    )
    in_app_enabled = models.BooleanField(default=True)
    email_enabled = models.BooleanField(default=True)
    email_digest = models.CharField(
        max_length=12, choices=Digest.choices, default=Digest.IMMEDIATE
    )
    sound_enabled = models.BooleanField(default=False)
    sound_volume = models.PositiveSmallIntegerField(default=35)
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(default=time(22, 0))
    quiet_hours_end = models.TimeField(default=time(7, 0))
    category_settings = models.JSONField(default=dict, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def channel_enabled(self, category, channel):
        if channel == "in_app" and category in {
            Notification.Category.PAYMENT,
            Notification.Category.ACCOUNT,
        }:
            return True
        category_config = self.category_settings.get(category, {})
        default = self.in_app_enabled if channel == "in_app" else self.email_enabled
        return category_config.get(channel, default)

    def __str__(self):
        return f"Notification preferences for {self.user}"


class NotificationDelivery(models.Model):
    class Channel(models.TextChoices):
        EMAIL = "email", "Email"
        BROWSER = "browser", "Browser push"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        SENT = "sent", "Sent"
        FAILED = "failed", "Failed"
        SKIPPED = "skipped", "Skipped"

    notification = models.ForeignKey(
        Notification, on_delete=models.CASCADE, related_name="deliveries"
    )
    channel = models.CharField(max_length=12, choices=Channel.choices)
    status = models.CharField(
        max_length=12, choices=Status.choices, default=Status.PENDING
    )
    attempts = models.PositiveSmallIntegerField(default=0)
    last_error = models.TextField(blank=True)
    next_attempt_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["notification", "channel"],
                name="unique_notification_delivery_channel",
            )
        ]

    def __str__(self):
        return f"{self.channel}: {self.notification} ({self.status})"
