from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_view(request):
    return JsonResponse({"status": "ok", "service": "isoma-lms"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_view, name="health"),
    path("api/admin/", include("api.urls")),
    path("api/tenant/", include("tenants.urls")),
    path("api/auth/", include("accounts.urls")),
    path("api/academy/", include("academy.urls")),
    path("api/academics/", include("academics.urls")),
    path("api/campus/", include("campus.urls")),
    path("api/courses/", include("courses.urls")),
    path("api/programs/", include("programs.urls")),
    path("api/notifications/", include("notifications.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
