from datetime import datetime, time
from zoneinfo import ZoneInfo

from django.core.management.base import BaseCommand
from django.utils import timezone

from programs.models import ProgramPerson, ProgramSeason, ProgramSession


SEASON1_WEEKS = [
    {
        "week": 1,
        "date": "2026-09-12",
        "topic": "Program launch: tech and young people",
        "guest_name": "Sedrick Otolo",
        "status": ProgramSession.Status.DONE,
    },
    {
        "week": 2,
        "date": "2026-09-19",
        "topic": "Learning, work, or career: how to choose a next step",
    },
    {
        "week": 3,
        "date": "2026-09-26",
        "topic": "Technology in everyday life: a useful tool, not the hype",
    },
    {
        "week": 4,
        "date": "2026-10-03",
        "topic": "Building confidence and skills: one practice to start this week",
    },
    {
        "week": 5,
        "date": "2026-10-10",
        "topic": "A community problem, and what we can actually do",
    },
    {
        "week": 6,
        "date": "2026-10-17",
        "topic": "Student or professional spotlight: a real journey",
    },
    {
        "week": 7,
        "date": "2026-10-24",
        "topic": "Ask the expert: audience questions lead",
    },
    {
        "week": 8,
        "date": "2026-10-31",
        "topic": "Season review and open forum",
    },
]


class Command(BaseCommand):
    help = "Seed EkebuLive Information Sessions Season 1 roster (weeks 1–8)."

    def handle(self, *args, **options):
        tz = ZoneInfo("Africa/Nairobi")
        season, _ = ProgramSeason.objects.get_or_create(
            slug="information-sessions-s1",
            defaults={
                "name": "Information Sessions Season 1",
                "timezone": "Africa/Nairobi",
                "default_start_time": time(17, 0),
                "default_duration_minutes": 60,
                "is_active": True,
            },
        )

        host, _ = ProgramPerson.objects.get_or_create(
            email="hello@petergordonekebu.com",
            defaults={
                "display_name": "Peter Gordon Ekebu",
                "bio": "Founder, EkebuLive",
                "is_host": True,
                "is_speaker": False,
            },
        )
        if not host.is_host:
            host.is_host = True
            host.save(update_fields=["is_host"])

        moses, _ = ProgramPerson.objects.get_or_create(
            display_name="Moses",
            defaults={
                "email": "",
                "bio": "Session host",
                "is_host": True,
                "is_speaker": False,
            },
        )

        sedrick, _ = ProgramPerson.objects.get_or_create(
            display_name="Sedrick Otolo",
            defaults={
                "bio": "Co-founder of KaKebe Technologies (Lira, Northern Uganda)",
                "is_host": False,
                "is_speaker": True,
            },
        )

        created = 0
        for row in SEASON1_WEEKS:
            starts = timezone.make_aware(
                datetime.strptime(f"{row['date']} 17:00", "%Y-%m-%d %H:%M"),
                timezone=tz,
            )
            session, was_created = ProgramSession.objects.get_or_create(
                season=season,
                week_number=row["week"],
                defaults={
                    "topic": row["topic"],
                    "title": row["topic"],
                    "starts_at": starts,
                    "host": moses if row["week"] == 1 else host,
                    "status": row.get("status", ProgramSession.Status.PLANNED),
                    "promise": "",
                },
            )
            if was_created:
                created += 1
            if row["week"] == 1:
                session.guests.add(sedrick)
                if session.host_id is None:
                    session.host = moses
                    session.status = ProgramSession.Status.DONE
                    session.save(update_fields=["host", "status", "updated_at"])

        self.stdout.write(
            self.style.SUCCESS(
                f"Season '{season.slug}' ready. New sessions created: {created}."
            )
        )
