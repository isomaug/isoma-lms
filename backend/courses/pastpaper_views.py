from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    Enrollment,
    InstructorSolution,
    InstructorSolutionSection,
    PastPaper,
    PastPaperMaterial,
    PastPaperProgress,
)
from .pastpaper_serializers import (
    InstructorPastPaperDetailSerializer,
    InstructorPastPaperListSerializer,
    InstructorSolutionSectionSerializer,
    InstructorSolutionSerializer,
)
from .pastpapers.seed_engine import prepare_solution
from .pastpapers.solution_script_generator import (
    PaperExtractionError,
    build_script_sections,
    extract_pdf,
)
from .pastpapers.validators import validate_solution
from .pastpapers.textbook_ingest import (
    get_textbook_pages,
    get_textbook_topics,
    list_ready_textbooks,
    parse_textbook_refs_from_markdown,
)


def _is_instructor(user):
    return bool(
        user
        and user.is_authenticated
        and (
            user.is_staff
            or user.is_superuser
            or user.groups.filter(name="Instructors").exists()
        )
    )


def _paper_queryset(user):
    queryset = PastPaper.objects.select_related(
        "course", "instructor_solution"
    ).prefetch_related("materials", "instructor_solution__sections")
    if user.is_staff or user.is_superuser:
        return queryset
    return queryset.filter(course__assigned_instructor=user)


def _require_instructor(request):
    if not _is_instructor(request.user):
        return Response(
            {"detail": "Instructor access is required."},
            status=status.HTTP_403_FORBIDDEN,
        )
    return None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def instructor_past_papers(request):
    denied = _require_instructor(request)
    if denied:
        return denied
    papers = _paper_queryset(request.user)
    for field, parameter in (
        ("syllabus_code", "code"),
        ("exam_year", "year"),
        ("exam_series", "series"),
        ("paper_number", "paper"),
        ("variant", "variant"),
    ):
        value = request.query_params.get(parameter)
        if value:
            papers = papers.filter(**{field: value})
    return Response(
        InstructorPastPaperListSerializer(
            papers, many=True, context={"request": request}
        ).data
    )


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def instructor_past_paper_detail(request, paper_id):
    denied = _require_instructor(request)
    if denied:
        return denied
    paper = get_object_or_404(_paper_queryset(request.user), pk=paper_id)
    if request.method == "PATCH":
        solution = getattr(paper, "instructor_solution", None)
        if solution is None:
            return Response(
                {"detail": "Prepare the solution workspace first."},
                status=status.HTTP_409_CONFLICT,
            )
        serializer = InstructorSolutionSerializer(
            solution, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        requested_status = serializer.validated_data.get("status")
        if requested_status == InstructorSolution.Status.APPROVED:
            return Response(
                {"detail": "Use the review process to approve a solution."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()
    paper = _paper_queryset(request.user).get(pk=paper.pk)
    return Response(
        InstructorPastPaperDetailSerializer(
            paper, context={"request": request}
        ).data
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def prepare_instructor_solution(request, paper_id):
    denied = _require_instructor(request)
    if denied:
        return denied
    paper = get_object_or_404(_paper_queryset(request.user), pk=paper_id)
    solution = prepare_solution(paper, user=request.user)
    return Response(
        InstructorSolutionSerializer(solution).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_instructor_video_script(request, paper_id):
    denied = _require_instructor(request)
    if denied:
        return denied
    paper = get_object_or_404(_paper_queryset(request.user), pk=paper_id)
    materials = {
        material.material_type: material
        for material in paper.materials.filter(
            material_type__in=["question_paper", "mark_scheme"],
            is_authorised=True,
        )
        if material.file
    }
    if "question_paper" not in materials or "mark_scheme" not in materials:
        return Response(
            {"detail": "Both the question paper and mark scheme are required."},
            status=status.HTTP_409_CONFLICT,
        )
    try:
        question_document = extract_pdf(materials["question_paper"].file)
        mark_document = extract_pdf(materials["mark_scheme"].file)
        scripts, issues = build_script_sections(
            question_document.text,
            mark_document.text,
            paper.question_structure,
        )
    except PaperExtractionError as error:
        return Response({"detail": str(error)}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
    # We now always allow partial generation, so we don't abort on issues.
    # The frontend is informed of the issues in the response.
    replace = bool(request.data.get("replace", False))
    with transaction.atomic():
        solution = prepare_solution(paper, user=request.user)
        generated_by_path = {item.question_path: item for item in scripts}
        for section in solution.sections.all():
            generated = generated_by_path.get(section.question_path)
            if not generated:
                continue
            if section.worked_solution_markdown.strip() and not replace:
                continue
            section.question_summary = generated.question_excerpt[:2000]
            section.mark_scheme_reference = generated.mark_scheme_excerpt
            section.worked_solution_markdown = generated.markdown
            section.confidence = InstructorSolutionSection.Confidence.NEEDS_REVIEW
            section.is_complete = False
            section.save()
        solution.status = InstructorSolution.Status.UNDER_REVIEW
        solution.overview_markdown = (
            "# Instructor video script\n\n"
            "Generated from the paired question paper and official mark scheme. "
            "Every section requires instructor verification before approval."
        )
        solution.save(update_fields=["status", "overview_markdown", "updated_at"])
    paper = _paper_queryset(request.user).get(pk=paper.pk)
    return Response(
        {
            "paper": InstructorPastPaperDetailSerializer(
                paper, context={"request": request}
            ).data,
            "issues": issues,
            "aligned_sections": len(scripts),
            "question_pages_read": question_document.readable_pages,
            "mark_scheme_pages_read": mark_document.readable_pages,
        }
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_instructor_solution_section(request, section_id):
    denied = _require_instructor(request)
    if denied:
        return denied
    section = get_object_or_404(
        InstructorSolutionSection.objects.select_related(
            "solution__past_paper__course"
        ),
        pk=section_id,
    )
    if (
        not request.user.is_staff
        and not request.user.is_superuser
        and section.solution.past_paper.course.assigned_instructor_id
        != request.user.id
    ):
        return Response(
            {"detail": "You are not assigned to this paper."},
            status=status.HTTP_403_FORBIDDEN,
        )
    serializer = InstructorSolutionSectionSerializer(
        section, data=request.data, partial=True
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def validate_instructor_solution(request, paper_id):
    denied = _require_instructor(request)
    if denied:
        return denied
    paper = get_object_or_404(_paper_queryset(request.user), pk=paper_id)
    solution = getattr(paper, "instructor_solution", None)
    if solution is None:
        return Response(
            {"valid": False, "errors": ["Solution workspace has not been prepared."]},
            status=status.HTTP_409_CONFLICT,
        )
    errors = validate_solution(solution)
    return Response({"valid": not errors, "errors": errors})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_instructor_solution(request, paper_id):
    if not (request.user.is_staff or request.user.is_superuser):
        return Response(
            {"detail": "Staff review is required for approval."},
            status=status.HTTP_403_FORBIDDEN,
        )
    paper = get_object_or_404(_paper_queryset(request.user), pk=paper_id)
    solution = get_object_or_404(InstructorSolution, past_paper=paper)
    errors = validate_solution(solution)
    if errors:
        return Response(
            {"valid": False, "errors": errors},
            status=status.HTTP_400_BAD_REQUEST,
        )
    solution.status = InstructorSolution.Status.APPROVED
    solution.reviewed_by = request.user
    solution.reviewed_at = timezone.now()
    solution.version += 1
    solution.save(
        update_fields=[
            "status",
            "reviewed_by",
            "reviewed_at",
            "version",
            "updated_at",
        ]
    )
    return Response(InstructorSolutionSerializer(solution).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def download_instructor_past_paper_material(request, material_id):
    denied = _require_instructor(request)
    if denied:
        return denied
    material = get_object_or_404(
        PastPaperMaterial.objects.select_related("past_paper__course"),
        pk=material_id,
        is_authorised=True,
    )
    if (
        not request.user.is_staff
        and not request.user.is_superuser
        and material.past_paper.course.assigned_instructor_id != request.user.id
    ):
        return Response(
            {"detail": "You are not assigned to this paper."},
            status=status.HTTP_403_FORBIDDEN,
        )
    if not material.file:
        return Response(
            {"detail": "The material file has not been uploaded."},
            status=status.HTTP_404_NOT_FOUND,
        )
    return FileResponse(
        material.file.open("rb"),
        as_attachment=True,
        filename=material.original_filename or material.file.name.rsplit("/", 1)[-1],
    )


def _learner_paper(request, slug):
    paper = get_object_or_404(
        PastPaper.objects.select_related("course").prefetch_related("materials"),
        course__slug=slug,
        course__is_published=True,
        source_verified=True,
    )
    allowed = (
        request.user.is_staff
        or request.user.is_superuser
        or Enrollment.objects.filter(user=request.user, course=paper.course).exists()
    )
    if not allowed:
        return None, Response(
            {"detail": "Enroll in this paper to open its documents."},
            status=status.HTTP_403_FORBIDDEN,
        )
    return paper, None


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def learner_past_paper_detail(request, slug):
    paper, denied = _learner_paper(request, slug)
    if denied:
        return denied
    materials = [
        {
            "id": material.id,
            "type": material.material_type,
            "title": material.title,
            "filename": material.original_filename,
            "view_url": (
                f"/api/courses/{slug}/past-paper/materials/{material.id}/"
            ),
        }
        for material in paper.materials.filter(
            is_authorised=True,
            material_type__in=[
                "question_paper",
                "mark_scheme",
                "source_files",
                "worked_output",
                "supporting",
            ],
        )
        if material.file
    ]
    solution = getattr(paper, "instructor_solution", None)
    approved_solution = None
    if solution and solution.status == InstructorSolution.Status.APPROVED:
        approved_solution = {
            "overview": solution.overview_markdown,
            "sections": [
                {
                    "question_path": section.question_path,
                    "worked_solution": section.worked_solution_markdown,
                    "examiner_guidance": section.examiner_guidance,
                    "common_errors": section.common_errors,
                    "textbook_refs": parse_textbook_refs_from_markdown(
                        section.worked_solution_markdown
                    ),
                }
                for section in solution.sections.filter(is_complete=True)
            ],
        }
    textbooks = []
    try:
        textbooks = list_ready_textbooks(include_topics=False)
    except Exception:
        textbooks = []
    progress, _ = PastPaperProgress.objects.get_or_create(
        user=request.user, past_paper=paper
    )
    available = (
        PastPaper.objects.filter(
            course__is_published=True,
            course__enrollments__user=request.user,
            syllabus_code=paper.syllabus_code,
        )
        .select_related("course")
        .order_by("exam_year", "exam_series", "paper_number", "variant")
    )
    papers = list(available)
    current_index = next(
        (index for index, item in enumerate(papers) if item.pk == paper.pk), None
    )
    previous_slug = (
        papers[current_index - 1].course.slug
        if current_index is not None and current_index > 0
        else None
    )
    next_slug = (
        papers[current_index + 1].course.slug
        if current_index is not None and current_index + 1 < len(papers)
        else None
    )
    return Response(
        {
            "title": paper.course.title,
            "subject": paper.subject,
            "syllabus_code": paper.syllabus_code,
            "year": paper.exam_year,
            "series": paper.get_exam_series_display(),
            "component_code": paper.component_code,
            "paper_number": paper.paper_number,
            "variant": paper.variant or None,
            "level": paper.level,
            "video_solution_url": paper.course.preview_video_url or "",
            "approved_solution": approved_solution,
            "textbooks": textbooks,
            "progress": {
                "is_completed": progress.is_completed,
                "active_view": progress.active_view,
                "video_position_seconds": progress.video_position_seconds,
            },
            "navigation": {
                "previous_slug": previous_slug,
                "next_slug": next_slug,
            },
            "materials": materials,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def learner_past_paper_textbooks(request, slug):
    paper, denied = _learner_paper(request, slug)
    if denied:
        return denied
    include_topics = str(request.query_params.get("topics") or "").lower() in {
        "1",
        "true",
        "yes",
    }
    return Response(
        {"textbooks": list_ready_textbooks(include_topics=include_topics)}
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def learner_past_paper_textbook_topics(request, slug, textbook_key):
    paper, denied = _learner_paper(request, slug)
    if denied:
        return denied
    payload = get_textbook_topics(textbook_key)
    if not payload:
        return Response(
            {"detail": "Textbook not found."},
            status=status.HTTP_404_NOT_FOUND,
        )
    return Response(payload)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def learner_past_paper_textbook_pages(request, slug, textbook_key):
    paper, denied = _learner_paper(request, slug)
    if denied:
        return denied
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
def update_learner_past_paper_progress(request, slug):
    paper, denied = _learner_paper(request, slug)
    if denied:
        return denied
    progress, _ = PastPaperProgress.objects.get_or_create(
        user=request.user, past_paper=paper
    )
    if "is_completed" in request.data:
        progress.is_completed = bool(request.data["is_completed"])
        progress.completed_at = timezone.now() if progress.is_completed else None
    active_view = request.data.get("active_view")
    if active_view in {
        "question_paper",
        "mark_scheme",
        "overview",
        "text",
        "playground",
        "downloads",
        "video",
    }:
        progress.active_view = active_view
    if "video_position_seconds" in request.data:
        progress.video_position_seconds = max(
            0, int(request.data["video_position_seconds"])
        )
    progress.save()
    return Response(
        {
            "is_completed": progress.is_completed,
            "active_view": progress.active_view,
            "video_position_seconds": progress.video_position_seconds,
            "completed_at": progress.completed_at,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def view_learner_past_paper_material(request, slug, material_id):
    paper, denied = _learner_paper(request, slug)
    if denied:
        return denied
    material = get_object_or_404(
        paper.materials,
        pk=material_id,
        is_authorised=True,
        material_type__in=[
            "question_paper",
            "mark_scheme",
            "source_files",
            "worked_output",
            "supporting",
        ],
    )
    if not material.file:
        return Response(
            {"detail": "This document is unavailable."},
            status=status.HTTP_404_NOT_FOUND,
        )
    is_pdf = material.original_filename.lower().endswith(".pdf")
    response = FileResponse(
        material.file.open("rb"),
        content_type="application/pdf" if is_pdf else "application/octet-stream",
        as_attachment=not is_pdf,
        filename=material.original_filename
        or material.file.name.rsplit("/", 1)[-1],
    )
    response["Content-Disposition"] = (
        f'inline; filename="{material.original_filename or "document.pdf"}"'
    )
    return response
