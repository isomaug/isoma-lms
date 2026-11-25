from django.conf import settings
from django.db import models


class ProgramPerson(models.Model):
    display_name = models.CharField(max_length=200)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=64, blank=True)
    bio = models.TextField(blank=True, help_text="One-line or short bio for invites and promos.")
    headshot_url = models.URLField(blank=True)
    portrait = models.ImageField(upload_to="program_portraits/", blank=True, null=True)
    links = models.JSONField(default=dict, blank=True)
    pronunciation = models.CharField(max_length=200, blank=True)
    notes = models.TextField(blank=True)
    is_host = models.BooleanField(default=False)
    is_speaker = models.BooleanField(default=True)
    is_moderator = models.BooleanField(default=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="program_people",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["display_name"]

    def __str__(self):
        return self.display_name

    @property
    def portrait_display_url(self):
        if self.portrait:
            try:
                return self.portrait.url
            except Exception:
                pass
        return self.headshot_url or ""


class ProgramSeason(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    timezone = models.CharField(max_length=64, default="Africa/Nairobi")
    default_start_time = models.TimeField(null=True, blank=True)
    default_duration_minutes = models.PositiveIntegerField(default=60)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class ProgramSession(models.Model):
    class Status(models.TextChoices):
        PLANNED = "planned", "Planned"
        INVITED = "invited", "Invited"
        CONFIRMED = "confirmed", "Confirmed"
        DONE = "done", "Done"
        CANCELLED = "cancelled", "Cancelled"

    season = models.ForeignKey(
        ProgramSeason, on_delete=models.CASCADE, related_name="sessions"
    )
    week_number = models.PositiveIntegerField()
    topic = models.CharField(max_length=300)
    title = models.CharField(max_length=300, blank=True)
    starts_at = models.DateTimeField()
    host = models.ForeignKey(
        ProgramPerson,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="hosted_sessions",
    )
    moderator = models.ForeignKey(
        ProgramPerson,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="moderated_sessions",
    )
    guests = models.ManyToManyField(
        ProgramPerson, blank=True, related_name="guest_sessions"
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PLANNED
    )
    promise = models.TextField(
        blank=True, help_text="One-sentence audience outcome."
    )
    recording_consent = models.BooleanField(null=True, blank=True)
    live_room_slug = models.SlugField(
        max_length=120,
        blank=True,
        default="",
        help_text="EkebuLive room slug linked to this session.",
    )
    join_url = models.URLField(
        blank=True,
        help_text="Canonical public join link for social posts and posters.",
    )
    social_plan = models.JSONField(
        default=dict,
        blank=True,
        help_text="Editable weekly posts, extracts, and posted flags keyed by slot id.",
    )
    is_published = models.BooleanField(
        default=False,
        help_text="When true, this session appears on the public Community page.",
    )
    internal_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["season_id", "week_number", "starts_at"]
        unique_together = [("season", "week_number")]

    def __str__(self):
        return f"{self.season.slug} W{self.week_number}: {self.topic}"

    @property
    def display_title(self):
        return self.title or self.topic


class ProgramInvite(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SENT = "sent", "Sent"
        CONFIRMED = "confirmed", "Confirmed"
        DECLINED = "declined", "Declined"

    session = models.ForeignKey(
        ProgramSession, on_delete=models.CASCADE, related_name="invites"
    )
    person = models.ForeignKey(
        ProgramPerson,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="invites",
    )
    to_email = models.EmailField()
    cc_email = models.CharField(max_length=500, blank=True, default="")
    subject = models.CharField(max_length=300)
    body_text = models.TextField()
    body_html = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    sent_at = models.DateTimeField(null=True, blank=True)
    sent_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="program_invites_sent",
    )
    response_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invite to {self.to_email} for {self.session}"
