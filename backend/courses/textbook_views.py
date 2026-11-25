import mimetypes
from pathlib import Path

from django.conf import settings
from django.http import FileResponse, Http404, HttpResponseForbidden
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import CambridgeTextbook, CambridgeTextbookPage, Course, Enrollment
from .pastpapers.textbook_ingest import (
    get_textbook_pages,
    get_textbook_topics,
    list_ready_textbooks,
)


def _check_course_access(user, slug):
    """Verify user can access this course's learning materials."""
    course = Course.objects.filter(slug=slug, is_published=True).first()
    if not course:
        # Check if it's a past paper course or allow lookup
        return True, None
    if not user.is_authenticated:
        return False, Response(
            {"detail": "Authentication required."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    if user.is_superuser or user.is_staff or course.assigned_instructor_id == user.id:
        return True, course
    enrolled = Enrollment.objects.filter(user=user, course=course, is_active=True).exists()
    if enrolled:
        return True, course
    return False, Response(
        {"detail": "You are not enrolled in this course."},
        status=status.HTTP_403_FORBIDDEN,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def serve_textbook_image(request, image_path):
    """Securely serve extracted Cambridge textbook diagram/figure images."""
    base_dir = Path(settings.BASE_DIR) / "private_textbook_extracts"
    clean_path = (base_dir / image_path).resolve()

    # Prevent directory traversal attacks
    try:
        clean_path.relative_to(base_dir.resolve())
    except ValueError:
        raise Http404("Invalid image path.")

    if not clean_path.exists() or not clean_path.is_file():
        raise Http404("Image not found.")

    content_type, _ = mimetypes.guess_type(str(clean_path))
    if not content_type:
        content_type = "image/jpeg"

    response = FileResponse(open(clean_path, "rb"), content_type=content_type)
    response["Cache-Control"] = "public, max-age=604800, immutable"
    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_textbooks(request, slug):
    """List available Cambridge textbooks for this course."""
    allowed, err_resp = _check_course_access(request.user, slug)
    if not allowed:
        return err_resp

    include_topics = str(request.query_params.get("topics") or "").lower() in {
        "1",
        "true",
        "yes",
    }
    return Response({"textbooks": list_ready_textbooks(include_topics=include_topics)})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_textbook_topics(request, slug, textbook_key):
    """List syllabus topics and page ranges for a textbook."""
    allowed, err_resp = _check_course_access(request.user, slug)
    if not allowed:
        return err_resp

    payload = get_textbook_topics(textbook_key)
    if not payload:
        return Response(
            {"detail": "Textbook not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(payload)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def course_textbook_pages(request, slug, textbook_key):
    """Fetch paginated textbook pages with extracted diagram images."""
    allowed, err_resp = _check_course_access(request.user, slug)
    if not allowed:
        return err_resp

    topic_code = (request.query_params.get("topic") or "").strip() or None
    try:
        page_start = int(request.query_params.get("from") or 1)
    except (TypeError, ValueError):
        page_start = 1
    try:
        page_end = int(request.query_params.get("to") or page_start)
    except (TypeError, ValueError):
        page_end = page_start

    payload = get_textbook_pages(
        textbook_key,
        page_start=page_start,
        page_end=page_end,
        topic_code=topic_code,
    )
    if not payload:
        return Response(
            {"detail": "Textbook not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(payload)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_textbook_page(request, textbook_key, page_number):
    """Super Admin edit endpoint to update textbook page text and topics."""
    if not (request.user.is_superuser or request.user.is_staff):
        return Response(
            {"detail": "Only Super Admins or staff can edit textbook content."},
            status=status.HTTP_403_FORBIDDEN,
        )

    book = CambridgeTextbook.objects.filter(key=textbook_key).first()
    if not book:
        return Response(
            {"detail": "Textbook not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    page = CambridgeTextbookPage.objects.filter(
        textbook=book, page_number=page_number
    ).first()
    if not page:
        return Response(
            {"detail": f"Page {page_number} not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    data = request.data
    if "text" in data:
        page.text = str(data["text"])
        page.char_count = len(page.text)
    if "topic_code" in data:
        page.topic_code = str(data["topic_code"]).strip()
    if "topic_title" in data:
        page.topic_title = str(data["topic_title"]).strip()

    page.save()

    return Response(
        {
            "status": "ok",
            "page_number": page.page_number,
            "topic_code": page.topic_code,
            "topic_title": page.topic_title,
            "char_count": page.char_count,
            "text": page.text,
        }
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_textbook_image(request, image_id):
    """Super Admin / Staff endpoint to delete an unwanted extracted diagram image."""
    if not (request.user.is_superuser or request.user.is_staff):
        return Response(
            {"detail": "Only Super Admins or staff can delete textbook images."},
            status=status.HTTP_403_FORBIDDEN,
        )

    from .models import CambridgeTextbookImage
    img = CambridgeTextbookImage.objects.filter(id=image_id).first()
    if not img:
        return Response(
            {"detail": "Image not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    base_dir = Path(settings.BASE_DIR) / "private_textbook_extracts"
    if img.relative_path:
        file_path = base_dir / img.relative_path
        if file_path.exists() and file_path.is_file():
            try:
                file_path.unlink()
            except Exception:
                pass

    deleted_id = img.id
    page_num = img.page_number
    img.delete()
    return Response({"status": "ok", "deleted_id": deleted_id, "page_number": page_num})
