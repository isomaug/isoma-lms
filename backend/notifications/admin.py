from django.contrib import admin

from .models import Notification, NotificationDelivery, NotificationPreference


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "recipient",
        "category",
        "priority",
        "created_at",
        "read_at",
    )
    list_filter = ("category", "priority", "created_at", "read_at")
    search_fields = ("title", "message", "recipient__username", "recipient__email")
    readonly_fields = ("created_at", "seen_at", "read_at", "archived_at")


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "in_app_enabled", "email_enabled", "email_digest")
    search_fields = ("user__username", "user__email")


@admin.register(NotificationDelivery)
class NotificationDeliveryAdmin(admin.ModelAdmin):
    list_display = ("notification", "channel", "status", "attempts", "sent_at")
    list_filter = ("channel", "status")
    search_fields = ("notification__title", "notification__recipient__email")

