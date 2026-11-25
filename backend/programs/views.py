from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import ProgramInvite, ProgramPerson, ProgramSeason, ProgramSession
from .permissions import IsSuperUser
from .serializers import (
    ProgramInviteSerializer,
    ProgramPersonSerializer,
    ProgramSeasonSerializer,
    ProgramSessionSerializer,
    PublicProgramSessionSerializer,
)
from .services import render_guest_invite, send_guest_invite


class ProgramPersonViewSet(viewsets.ModelViewSet):
    queryset = ProgramPerson.objects.all()
    serializer_class = ProgramPersonSerializer
    permission_classes = [IsSuperUser]
    pagination_class = None

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        if request.data.get("remove_portrait") in ["true", "True", True, "1"]:
            if instance.portrait:
                try:
                    instance.portrait.delete(save=False)
                except Exception:
                    pass
                instance.portrait = None
                instance.save(update_fields=["portrait", "updated_at"])
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response(serializer.data)


class ProgramSeasonViewSet(viewsets.ModelViewSet):
    queryset = ProgramSeason.objects.all()
    serializer_class = ProgramSeasonSerializer
    permission_classes = [IsSuperUser]
    pagination_class = None
    lookup_field = "slug"


class ProgramSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ProgramSessionSerializer
    permission_classes = [IsSuperUser]
    pagination_class = None

    def get_queryset(self):
        qs = ProgramSession.objects.select_related(
            "season", "host", "moderator", "live_room"
        ).prefetch_related("guests", "invites")
        season = self.request.query_params.get("season")
        if season:
            if season.isdigit():
                qs = qs.filter(season_id=int(season))
            else:
                qs = qs.filter(season__slug=season)
        return qs

    def _resolve_guest(self, session, request):
        guest_id = request.data.get("guest_id")
        if guest_id:
            return session.guests.filter(id=guest_id).first() or ProgramPerson.objects.filter(
                id=guest_id
            ).first()
        return session.guests.first()

    @action(detail=True, methods=["post"], url_path="generate-join-link")
    def generate_join_link(self, request, pk=None):
        """Generate (or reuse) an EkebuLive join link for this session."""
        from django.utils.text import slugify

        session = self.get_object()
        if not session.live_room_slug:
            session.live_room_slug = slugify(
                f"{session.season.slug}-w{session.week_number}-{session.topic}"
            )[:110]

        join_url = f"https://www.ekebulive.com/live/{session.live_room_slug}"
        session.join_url = join_url
        session.is_published = True
        session.save(update_fields=["live_room_slug", "join_url", "is_published", "updated_at"])
        serializer = self.get_serializer(session)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="preview-guest-invite")
    def preview_guest_invite(self, request, pk=None):
        session = self.get_object()
        guest = self._resolve_guest(session, request)
        if not guest:
            return Response(
                {"error": "Add a guest speaker to this session first."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(render_guest_invite(session, guest))

    @action(detail=True, methods=["post"], url_path="send-guest-invite")
    def send_guest_invite_action(self, request, pk=None):
        session = self.get_object()
        guest = self._resolve_guest(session, request)
        if not guest:
            return Response(
                {"error": "Add a guest speaker to this session first."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        to_email = (request.data.get("to_email") or guest.email or "").strip()
        cc = request.data.get("cc")
        subject = request.data.get("subject")
        body_text = request.data.get("body_text")
        body_html = request.data.get("body_html")
        try:
            invite = send_guest_invite(
                session=session,
                guest=guest,
                sent_by=request.user,
                to_email=to_email,
                cc=cc,
                subject=subject,
                body_text=body_text,
                body_html=body_html,
            )
        except ValueError as exc:
            return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as exc:
            return Response(
                {"error": f"Failed to send email: {exc}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        return Response(ProgramInviteSerializer(invite).data)


class PublicProgramSessionViewSet(viewsets.ReadOnlyModelViewSet):
    """Published programme sessions for the Community page. No emails or notes."""

    serializer_class = PublicProgramSessionSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def get_queryset(self):
        return (
            ProgramSession.objects.filter(is_published=True, season__is_active=True)
            .exclude(status=ProgramSession.Status.CANCELLED)
            .select_related("season", "host", "moderator", "live_room")
            .prefetch_related("guests", "live_room__recordings")
            .order_by("starts_at")
        )

    def update(self, request, *args, **kwargs):
        if not (request.user and request.user.is_authenticated and (request.user.is_superuser or request.user.is_staff)):
            return Response(
                {"error": "Admin permission required to edit session name."},
                status=status.HTTP_403_FORBIDDEN,
            )
        instance = self.get_object()
        title = request.data.get("title")
        topic = request.data.get("topic")
        update_fields = ["updated_at"]
        if title is not None:
            instance.title = title.strip()
            update_fields.append("title")
        if topic is not None:
            instance.topic = topic.strip()
            update_fields.append("topic")
        instance.save(update_fields=update_fields)
        return Response(self.get_serializer(instance).data)

    def partial_update(self, request, *args, **kwargs):
        return self.update(request, *args, **kwargs)


class ProgramInviteViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProgramInviteSerializer
    permission_classes = [IsSuperUser]
    pagination_class = None

    def get_queryset(self):
        qs = ProgramInvite.objects.select_related("session", "person", "sent_by")
        session_id = self.request.query_params.get("session")
        if session_id:
            qs = qs.filter(session_id=session_id)
        return qs
