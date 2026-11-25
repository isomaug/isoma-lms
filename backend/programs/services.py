from django.utils import timezone
from zoneinfo import ZoneInfo

from django.template.loader import render_to_string

from .models import ProgramInvite, ProgramPerson, ProgramSession


def _session_local_dt(session: ProgramSession):
    tz_name = session.season.timezone or "Africa/Nairobi"
    try:
        tz = ZoneInfo(tz_name)
    except Exception:
        tz = ZoneInfo("Africa/Nairobi")
    dt = session.starts_at
    if timezone.is_naive(dt):
        dt = timezone.make_aware(dt, timezone=tz)
    return timezone.localtime(dt, timezone=tz), tz_name


def _extract_first_name(full_name: str) -> str:
    if not full_name:
        return "Guest"
    parts = full_name.strip().split()
    if not parts:
        return "Guest"
    salutations = {
        "dr", "dr.", "prof", "prof.", "mr", "mr.", "mrs", "mrs.", "ms", "ms.", "rev", "rev.", "hon", "hon."
    }
    if len(parts) > 1 and parts[0].lower() in salutations:
        return parts[1]
    return parts[0]


def build_guest_invite_context(session: ProgramSession, guest: ProgramPerson | None = None):
    local_dt, tz_name = _session_local_dt(session)
    host = session.host
    guest = guest or session.guests.first()
    date_label = local_dt.strftime("%A, %d %B %Y")
    time_label = local_dt.strftime("%I:%M %p").lstrip("0")
    host_name = host.display_name if host else "Peter Gordon Ekebu"
    host_email = (host.email if host and host.email else "") or "support@petergordonekebu.com"
    guest_name = guest.display_name if guest else "[Guest name]"
    guest_first_name = _extract_first_name(guest.display_name if guest else "")

    return {
        "guest_name": guest_name,
        "guest_first_name": guest_first_name,
        "week_number": session.week_number,
        "topic": session.topic,
        "date_label": date_label,
        "time_label": f"{time_label} {tz_name.replace('_', ' ')}",
        "time_range": f"{time_label} East Africa Time",
        "host_name": host_name,
        "host_email": host_email,
        "host_bio": (host.bio if host else "") or "",
        "site_url": "https://www.ekebulive.com",
        "session_title": session.display_title,
    }


def render_guest_invite(session: ProgramSession, guest: ProgramPerson | None = None):
    ctx = build_guest_invite_context(session, guest)
    subject = (
        f"Invitation: EkebuLive Information Sessions — Week {ctx['week_number']}"
    )
    body_text = render_to_string(
        "programs/email/guest_speaker_invite.txt", ctx
    ).strip()
    body_html = render_to_string(
        "programs/email/guest_speaker_invite.html", ctx
    ).strip()
    return {
        "subject": subject,
        "body_text": body_text,
        "body_html": body_html,
        "context": ctx,
        "to_email": (guest.email if guest and guest.email else ""),
        "guest_id": guest.id if guest else None,
    }


def send_guest_invite(
    *,
    session: ProgramSession,
    guest: ProgramPerson,
    sent_by,
    to_email: str | None = None,
    cc: str | list | None = None,
    subject: str | None = None,
    body_text: str | None = None,
    body_html: str | None = None,
):
    import re
    from django.core.mail import EmailMultiAlternatives
    from django.core.mail.message import formataddr
    from django.conf import settings
    from config.email import get_ekebulive_connection

    rendered = render_guest_invite(session, guest)
    email_addr = (to_email or guest.email or "").strip().lower()
    if not email_addr:
        raise ValueError("Guest email is required to send an invite.")

    final_subject = (subject or rendered["subject"]).strip()
    final_body_text = (body_text or rendered["body_text"]).strip()
    final_body_html = (body_html or rendered["body_html"] or "").strip()

    cc_list = []
    if isinstance(cc, str):
        for raw in re.split(r"[,;]", cc):
            item = raw.strip().lower()
            if item and "@" in item and item != email_addr and item not in cc_list:
                cc_list.append(item)
    elif isinstance(cc, (list, tuple)):
        for raw in cc:
            if isinstance(raw, str):
                item = raw.strip().lower()
                if item and "@" in item and item != email_addr and item not in cc_list:
                    cc_list.append(item)

    cc_str = ", ".join(cc_list)

    invite = ProgramInvite.objects.create(
        session=session,
        person=guest,
        to_email=email_addr,
        cc_email=cc_str,
        subject=final_subject,
        body_text=final_body_text,
        body_html=final_body_html,
        status=ProgramInvite.Status.DRAFT,
        sent_by=sent_by,
    )

    message = EmailMultiAlternatives(
        subject=final_subject,
        body=final_body_text,
        from_email=formataddr(
            (settings.EKEBULIVE_FROM_NAME, settings.EKEBULIVE_FROM_EMAIL)
        ),
        to=[email_addr],
        cc=cc_list if cc_list else None,
        reply_to=[settings.EKEBULIVE_REPLY_TO_EMAIL],
        connection=get_ekebulive_connection(),
    )
    if final_body_html:
        message.attach_alternative(final_body_html, "text/html")
    message.send(fail_silently=False)

    invite.status = ProgramInvite.Status.SENT
    invite.sent_at = timezone.now()
    invite.save(update_fields=["status", "sent_at", "updated_at"])

    if session.status == ProgramSession.Status.PLANNED:
        session.status = ProgramSession.Status.INVITED
        session.save(update_fields=["status", "updated_at"])

    return invite
