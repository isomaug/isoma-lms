from django.contrib import admin

from .models import ProgramInvite, ProgramPerson, ProgramSeason, ProgramSession


@admin.register(ProgramPerson)
class ProgramPersonAdmin(admin.ModelAdmin):
    list_display = ("display_name", "email", "is_host", "is_speaker", "phone")
    list_filter = ("is_host", "is_speaker")
    search_fields = ("display_name", "email", "phone")


@admin.register(ProgramSeason)
class ProgramSeasonAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "timezone", "is_active")
    prepopulated_fields = {"slug": ("name",)}


class ProgramInviteInline(admin.TabularInline):
    model = ProgramInvite
    extra = 0
    readonly_fields = ("sent_at", "sent_by", "created_at")


@admin.register(ProgramSession)
class ProgramSessionAdmin(admin.ModelAdmin):
    list_display = (
        "week_number",
        "topic",
        "starts_at",
        "host",
        "status",
        "is_published",
        "season",
    )
    list_filter = ("season", "status", "is_published")
    search_fields = ("topic", "title")
    filter_horizontal = ("guests",)
    inlines = [ProgramInviteInline]


@admin.register(ProgramInvite)
class ProgramInviteAdmin(admin.ModelAdmin):
    list_display = ("to_email", "session", "status", "sent_at")
    list_filter = ("status",)
    search_fields = ("to_email", "subject")
