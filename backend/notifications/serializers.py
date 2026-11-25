from rest_framework import serializers

from .models import Notification, NotificationPreference


class NotificationSerializer(serializers.ModelSerializer):
    is_read = serializers.SerializerMethodField()
    is_seen = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            "id",
            "event_type",
            "category",
            "priority",
            "title",
            "message",
            "action_url",
            "metadata",
            "created_at",
            "is_read",
            "is_seen",
        ]

    def get_is_read(self, obj):
        return obj.read_at is not None

    def get_is_seen(self, obj):
        return obj.seen_at is not None


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = [
            "in_app_enabled",
            "email_enabled",
            "email_digest",
            "sound_enabled",
            "sound_volume",
            "quiet_hours_enabled",
            "quiet_hours_start",
            "quiet_hours_end",
            "category_settings",
            "updated_at",
        ]
        read_only_fields = ["updated_at"]

    def validate_sound_volume(self, value):
        if value > 100:
            raise serializers.ValidationError("Volume must be between 0 and 100.")
        return value

    def validate_category_settings(self, value):
        valid_categories = {choice[0] for choice in Notification.Category.choices}
        for category, settings in value.items():
            if category not in valid_categories:
                raise serializers.ValidationError(f"Unknown category: {category}")
            if not isinstance(settings, dict):
                raise serializers.ValidationError(
                    f"Settings for {category} must be an object."
                )
            invalid = set(settings) - {"in_app", "email"}
            if invalid:
                raise serializers.ValidationError(
                    f"Unsupported settings for {category}: {', '.join(invalid)}"
                )
        return value
