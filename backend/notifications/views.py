from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification, NotificationPreference
from .serializers import NotificationPreferenceSerializer, NotificationSerializer


class NotificationPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 50


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = NotificationPagination

    def get_queryset(self):
        queryset = Notification.objects.filter(
            recipient=self.request.user,
            archived_at__isnull=True,
            in_app_visible=True,
        )
        if self.request.query_params.get("unread") == "true":
            queryset = queryset.filter(read_at__isnull=True)
        category = self.request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
        return queryset


class NotificationUnreadCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        queryset = Notification.objects.filter(
            recipient=request.user,
            archived_at__isnull=True,
            in_app_visible=True,
        )
        category = request.query_params.get("category")
        if category:
            queryset = queryset.filter(category=category)
            
        return Response(
            {
                "unread_count": queryset.filter(read_at__isnull=True).count(),
                "unseen_count": queryset.filter(seen_at__isnull=True).count(),
            }
        )


class NotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(
            Notification, pk=pk, recipient=request.user
        )
        now = timezone.now()
        updates = []
        if notification.seen_at is None:
            notification.seen_at = now
            updates.append("seen_at")
        if notification.read_at is None:
            notification.read_at = now
            updates.append("read_at")
        if updates:
            notification.save(update_fields=updates)
        return Response(NotificationSerializer(notification).data)


class NotificationMarkSeenView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        updated = Notification.objects.filter(
            recipient=request.user,
            archived_at__isnull=True,
            in_app_visible=True,
            seen_at__isnull=True,
        ).update(seen_at=timezone.now())
        return Response({"updated": updated})


class NotificationReadAllView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        now = timezone.now()
        updated = Notification.objects.filter(
            recipient=request.user,
            archived_at__isnull=True,
            in_app_visible=True,
            read_at__isnull=True,
        ).update(read_at=now, seen_at=now)
        return Response({"updated": updated})


class NotificationArchiveView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        notification = get_object_or_404(
            Notification, pk=pk, recipient=request.user
        )
        notification.archived_at = timezone.now()
        notification.save(update_fields=["archived_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        preference, _ = NotificationPreference.objects.get_or_create(
            user=self.request.user
        )
        return preference
