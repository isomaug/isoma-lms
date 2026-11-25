from django.urls import path

from .views import (
    NotificationArchiveView,
    NotificationListView,
    NotificationMarkSeenView,
    NotificationPreferenceView,
    NotificationReadAllView,
    NotificationReadView,
    NotificationUnreadCountView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path("unread-count/", NotificationUnreadCountView.as_view(), name="notification-count"),
    path("mark-seen/", NotificationMarkSeenView.as_view(), name="notification-seen"),
    path("read-all/", NotificationReadAllView.as_view(), name="notification-read-all"),
    path("<int:pk>/read/", NotificationReadView.as_view(), name="notification-read"),
    path("<int:pk>/archive/", NotificationArchiveView.as_view(), name="notification-archive"),
    path("preferences/", NotificationPreferenceView.as_view(), name="notification-preferences"),
]

