from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Course


@api_view(["GET"])
@permission_classes([AllowAny])
def course_list_view(request):
    qs = Course.objects.filter(is_published=True)
    if request.query_params.get("public") == "true":
        qs = qs.filter(is_public_course=True)
    data = [
        {
            "id": c.id,
            "slug": c.slug,
            "title": c.title,
            "subtitle": c.subtitle,
            "category": c.get_category_display(),
            "level": c.level,
            "lessons_count": c.lessons_count,
            "duration_weeks": c.duration_weeks,
            "price_ugx": c.price_ugx,
            "is_public_course": c.is_public_course,
        }
        for c in qs
    ]
    return Response({"count": len(data), "results": data})


@api_view(["GET"])
@permission_classes([AllowAny])
def summary_view(request):
    public_count = Course.objects.filter(is_published=True, is_public_course=True).count()
    return Response(
        {
            "public_courses": public_count,
            "curriculum_frameworks": 6,
            "erp_modules_planned": 18,
            "domain": "learn.isomaug.com",
        }
    )


urlpatterns = [
    path("courses/", course_list_view, name="academy-courses"),
    path("summary/", summary_view, name="academy-summary"),
]
