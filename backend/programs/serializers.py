from rest_framework import serializers

from .models import ProgramInvite, ProgramPerson, ProgramSeason, ProgramSession


class ProgramPersonSerializer(serializers.ModelSerializer):
    portrait_url = serializers.SerializerMethodField()
    headshot_url = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = ProgramPerson
        fields = [
            "id",
            "display_name",
            "email",
            "phone",
            "bio",
            "headshot_url",
            "portrait",
            "portrait_url",
            "links",
            "pronunciation",
            "notes",
            "is_host",
            "is_speaker",
            "is_moderator",
            "user",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "portrait_url"]
        extra_kwargs = {
            "user": {"required": False, "allow_null": True},
            "headshot_url": {"required": False, "allow_blank": True},
            "email": {"required": False, "allow_blank": True},
            "portrait": {"required": False, "allow_null": True},
        }

    def get_portrait_url(self, obj):
        url = obj.portrait_display_url
        if not url:
            return ""
        request = self.context.get("request")
        if request and url.startswith("/"):
            return request.build_absolute_uri(url)
        return url

    def validate_headshot_url(self, value):
        value = (value or "").strip()
        if not value:
            return ""
        # Accept only absolute http(s) URLs; ignore pasted paths instead of 400.
        if value.startswith("http://") or value.startswith("https://"):
            return value
        return ""

    def validate_user(self, value):
        return value or None

    def to_internal_value(self, data):
        # Multipart forms send strings; normalize empty user / blank URL.
        if hasattr(data, "copy"):
            data = data.copy()
            if data.get("user") in ("", "null", "undefined"):
                data["user"] = None
            if data.get("headshot_url") in ("", "null", "undefined"):
                data["headshot_url"] = ""
            for flag in ("is_host", "is_speaker", "is_moderator"):
                if flag in data and isinstance(data.get(flag), str):
                    data[flag] = data.get(flag).lower() in ("1", "true", "yes", "on")
            if "links" in data and isinstance(data.get("links"), str):
                raw = data.get("links").strip()
                if not raw:
                    data["links"] = {}
        return super().to_internal_value(data)


class ProgramSeasonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProgramSeason
        fields = [
            "id",
            "name",
            "slug",
            "timezone",
            "default_start_time",
            "default_duration_minutes",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ProgramInviteSerializer(serializers.ModelSerializer):
    person_name = serializers.CharField(
        source="person.display_name", read_only=True, default=""
    )

    class Meta:
        model = ProgramInvite
        fields = [
            "id",
            "session",
            "person",
            "person_name",
            "to_email",
            "cc_email",
            "subject",
            "body_text",
            "body_html",
            "status",
            "sent_at",
            "sent_by",
            "response_notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "cc_email",
            "subject",
            "body_text",
            "body_html",
            "sent_at",
            "sent_by",
            "created_at",
            "updated_at",
        ]


class ProgramSessionSerializer(serializers.ModelSerializer):
    host_detail = ProgramPersonSerializer(source="host", read_only=True)
    moderator_detail = ProgramPersonSerializer(source="moderator", read_only=True)
    guests_detail = ProgramPersonSerializer(source="guests", many=True, read_only=True)
    latest_invite = serializers.SerializerMethodField()
    guest_ids = serializers.PrimaryKeyRelatedField(
        source="guests",
        many=True,
        queryset=ProgramPerson.objects.all(),
        required=False,
    )

    class Meta:
        model = ProgramSession
        fields = [
            "id",
            "season",
            "week_number",
            "topic",
            "title",
            "starts_at",
            "host",
            "host_detail",
            "moderator",
            "moderator_detail",
            "guest_ids",
            "guests_detail",
            "status",
            "promise",
            "recording_consent",
            "live_room_slug",
            "join_url",
            "social_plan",
            "is_published",
            "internal_notes",
            "latest_invite",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at", "latest_invite"]

    def get_latest_invite(self, obj):
        invite = obj.invites.order_by("-created_at").first()
        if not invite:
            return None
        return ProgramInviteSerializer(invite).data

    def create(self, validated_data):
        guests = validated_data.pop("guests", [])
        session = ProgramSession.objects.create(**validated_data)
        if guests:
            session.guests.set(guests)
        return session

    def update(self, instance, validated_data):
        guests = validated_data.pop("guests", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if guests is not None:
            instance.guests.set(guests)
        return instance

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if not ret.get("join_url") and instance.live_room_slug:
            ret["join_url"] = f"https://www.ekebulive.com/live/{instance.live_room_slug}"
        return ret


class PublicProgramPersonSerializer(serializers.ModelSerializer):
    portrait_url = serializers.SerializerMethodField()

    class Meta:
        model = ProgramPerson
        fields = ["id", "display_name", "bio", "portrait_url"]

    def get_portrait_url(self, obj):
        url = obj.portrait_display_url
        if not url:
            return ""
        request = self.context.get("request")
        if request and url.startswith("/"):
            return request.build_absolute_uri(url)
        return url


class PublicProgramSessionSerializer(serializers.ModelSerializer):
    title = serializers.CharField(source="display_title", read_only=True)
    season_name = serializers.CharField(source="season.name", read_only=True)
    season_slug = serializers.CharField(source="season.slug", read_only=True)
    timezone = serializers.CharField(source="season.timezone", read_only=True)
    duration_minutes = serializers.IntegerField(
        source="season.default_duration_minutes", read_only=True
    )
    host = PublicProgramPersonSerializer(read_only=True)
    guests = PublicProgramPersonSerializer(many=True, read_only=True)
    join_url = serializers.SerializerMethodField()
    room_slug = serializers.SerializerMethodField()
    registration_required = serializers.SerializerMethodField()
    is_live = serializers.SerializerMethodField()
    has_recording = serializers.SerializerMethodField()
    preview_video_url = serializers.SerializerMethodField()
    poster_url = serializers.SerializerMethodField()
    join_path = serializers.SerializerMethodField()
    watch_path = serializers.SerializerMethodField()

    class Meta:
        model = ProgramSession
        fields = [
            "id",
            "week_number",
            "topic",
            "title",
            "starts_at",
            "status",
            "promise",
            "season_name",
            "season_slug",
            "timezone",
            "duration_minutes",
            "host",
            "guests",
            "join_url",
            "room_slug",
            "registration_required",
            "is_live",
            "has_recording",
            "preview_video_url",
            "poster_url",
            "join_path",
            "watch_path",
        ]

    def _room(self, obj):
        return None

    def get_room_slug(self, obj):
        if obj.live_room_slug:
            return obj.live_room_slug
        url = obj.join_url or ""
        for marker in ("/live/", "/s/"):
            if marker in url:
                return url.split(marker, 1)[-1].split("?")[0].strip("/")
        return ""

    def get_registration_required(self, obj):
        room = self._room(obj)
        return bool(room and room.registration_required)

    def get_is_live(self, obj):
        room = self._room(obj)
        return bool(room and room.status == "LIVE")

    def _preview_recording_url(self, obj):
        room = self._room(obj)
        if not room or room.recording_passcode:
            return ""
        recordings = getattr(room, "recordings", None)
        if recordings is not None:
            latest = (
                recordings.exclude(recording_url="")
                .exclude(recording_url__isnull=True)
                .order_by("-created_at")
                .first()
            )
            if latest and latest.recording_url:
                return latest.recording_url
        return room.recording_url or ""

    def get_has_recording(self, obj):
        room = self._room(obj)
        if not room:
            return False
        if room.recording_url:
            return True
        return room.recordings.exclude(recording_url="").exclude(recording_url__isnull=True).exists()

    def get_preview_video_url(self, obj):
        return self._preview_recording_url(obj)

    def get_poster_url(self, obj):
        guests = list(obj.guests.all())
        person = guests[0] if guests else obj.host
        if not person:
            return ""
        return PublicProgramPersonSerializer(
            person, context=self.context
        ).data.get("portrait_url") or ""

    def get_join_path(self, obj):
        slug = self.get_room_slug(obj)
        if not slug:
            return ""
        if self.get_registration_required(obj):
            return f"/s/{slug}"
        return f"/live/{slug}"

    def get_join_url(self, obj):
        if obj.join_url:
            return obj.join_url
        slug = self.get_room_slug(obj)
        if slug:
            return f"https://petergordonekebu.com/live/{slug}"
        return ""

    def get_watch_path(self, obj):
        slug = self.get_room_slug(obj)
        if not slug:
            return ""
        return f"/live/{slug}/recording"
