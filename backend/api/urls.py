from django.contrib.auth.models import User
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from courses.models import Cohort
from tenants.models import Institution


@api_view(["GET"])
@permission_classes([AllowAny])
def admin_cohorts_view(request):
    cohorts = Cohort.objects.select_related("course").all().order_by("-id")
    results = [
        {
            "id": c.id,
            "name": c.name,
            "course": c.course_id,
            "organization": getattr(c, "organization_id", None),
            "start_date": c.start_date,
            "end_date": c.end_date,
            "is_closed": getattr(c, "is_closed", False),
            "current_term": getattr(c, "current_term", ""),
            "academic_year": getattr(c, "academic_year", ""),
            "stream": getattr(c, "stream", ""),
            "students": [],
        }
        for c in cohorts
    ]
    return Response({"count": len(results), "results": results})


@api_view(["GET"])
@permission_classes([AllowAny])
def admin_organizations_view(request):
    orgs = Institution.objects.all().order_by("name")
    return Response(
        {
            "count": orgs.count(),
            "results": [{"id": o.id, "name": o.name, "subdomain": o.subdomain} for o in orgs],
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def admin_users_view(request):
    users = User.objects.all().order_by("first_name", "username")[:200]
    return Response(
        {
            "count": users.count(),
            "results": [
                {
                    "id": u.id,
                    "username": u.username,
                    "email": u.email,
                    "first_name": u.first_name,
                    "last_name": u.last_name,
                    "full_name": u.get_full_name() or u.username,
                }
                for u in users
            ],
        }
    )


urlpatterns = [
    path("cohorts/", admin_cohorts_view, name="api-admin-cohorts"),
    path("organizations/", admin_organizations_view, name="api-admin-organizations"),
    path("users/", admin_users_view, name="api-admin-users"),
]
