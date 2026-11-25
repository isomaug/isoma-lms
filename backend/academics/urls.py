from django.http import HttpResponse
from django.urls import path
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from courses.models import Course
from tenants.models import Institution
from .models import (
    AcademicYear,
    ClassStream,
    CurriculumDefinition,
    CurriculumSubjectCatalog,
    CustomDomainConfig,
    MarkAuditLog,
    ReportCardSnapshot,
    StudentMark,
    StudentProfile,
    Subject,
    Term,
)
from .pdf_report import render_report_card_pdf


def _actor_role(request):
    user = getattr(request, "user", None)
    if user and getattr(user, "is_authenticated", False):
        prof = getattr(user, "lms_profile", None)
        if prof:
            return prof.role
    return (
        request.headers.get("X-Isoma-Role")
        or request.data.get("actor_role")
        or request.GET.get("role")
        or "PRINCIPAL"
    ).upper()


def _actor_name(request):
    user = getattr(request, "user", None)
    if user and getattr(user, "is_authenticated", False):
        full = user.get_full_name()
        return f"{full} ({user.email})" if full and user.email else (user.email or user.username)
    return (request.data.get("recorded_by") or "Teacher").strip()


def _resolve_inst(request):
    tenant = getattr(request, "tenant", None)
    if tenant:
        return tenant
    slug = (request.GET.get("tenant") or request.data.get("tenant") or "stmarys").strip().lower()
    return Institution.objects.filter(subdomain=slug).first() or Institution.objects.first()


@api_view(["GET"])
@permission_classes([AllowAny])
def curriculum_definitions_view(request):
    inst = _resolve_inst(request)
    allowed = (inst.curricula or [inst.curriculum]) if inst else []
    qs = CurriculumDefinition.objects.all()
    if request.GET.get("scoped") == "true" and allowed:
        qs = qs.filter(code__in=allowed)
    return Response(
        {
            "count": qs.count(),
            "results": [
                {
                    "id": c.id,
                    "code": c.code,
                    "name": c.name,
                    "country_origin": c.country_origin,
                    "unit_label": c.unit_label,
                    "ca_label": c.ca_label,
                    "ca_weight": c.ca_weight,
                    "exam_label": c.exam_label,
                    "exam_weight": c.exam_weight,
                    "grading_scale": c.grading_scale,
                }
                for c in qs
            ],
        }
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def custom_domain_view(request):
    inst = _resolve_inst(request)
    if not inst:
        return Response({"detail": "School not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        cfg = CustomDomainConfig.objects.filter(institution=inst).first()
        if not cfg:
            return Response(
                {
                    "custom_domain": inst.custom_domain or "",
                    "cname_target": "cname.isomaug.com",
                    "verification_token": "",
                    "status": "PENDING_DNS",
                    "ssl_status": "PENDING",
                }
            )
        return Response(
            {
                "custom_domain": cfg.custom_domain,
                "cname_target": cfg.cname_target,
                "verification_token": cfg.verification_token,
                "txt_host": f"_isoma-verify.{cfg.custom_domain}",
                "status": cfg.status,
                "ssl_status": cfg.ssl_status,
                "last_verified_at": cfg.last_verified_at,
            }
        )

    domain = (request.data.get("custom_domain") or "").strip().lower()
    if not domain:
        return Response({"detail": "Custom domain is required."}, status=status.HTTP_400_BAD_REQUEST)

    cfg, _ = CustomDomainConfig.objects.update_or_create(
        institution=inst,
        defaults={"custom_domain": domain, "status": "PENDING_DNS", "ssl_status": "PENDING"},
    )
    inst.custom_domain = domain
    inst.save(update_fields=["custom_domain"])

    if request.data.get("verify_now"):
        cfg.status = "ACTIVE"
        cfg.ssl_status = "ACTIVE"
        cfg.last_verified_at = timezone.now()
        cfg.save()

    return Response(
        {
            "custom_domain": cfg.custom_domain,
            "cname_target": cfg.cname_target,
            "verification_token": cfg.verification_token,
            "txt_host": f"_isoma-verify.{cfg.custom_domain}",
            "status": cfg.status,
            "ssl_status": cfg.ssl_status,
            "last_verified_at": cfg.last_verified_at,
        }
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def class_streams_view(request):
    inst = _resolve_inst(request)
    if not inst:
        return Response({"results": []})
    allowed = inst.curricula or [inst.curriculum]

    if request.method == "GET":
        streams = ClassStream.objects.filter(institution=inst, curriculum_code__in=allowed)
        return Response(
            {
                "count": streams.count(),
                "results": [
                    {
                        "id": s.id,
                        "name": s.name,
                        "code": s.code,
                        "curriculum_code": s.curriculum_code,
                        "curriculum_label": s.curriculum_code.replace("_", " "),
                        "class_teacher_name": s.class_teacher_name,
                        "students_count": s.students.count(),
                        "subjects_count": s.subjects.count(),
                    }
                    for s in streams
                ],
            }
        )

    if _actor_role(request) == "TEACHER":
        return Response(
            {"detail": "Teachers cannot create classes. Ask your School Admin or DOS."},
            status=status.HTTP_403_FORBIDDEN,
        )

    name = (request.data.get("name") or "").strip()
    curr_code = (request.data.get("curriculum_code") or allowed[0]).strip()
    if curr_code not in allowed:
        return Response(
            {"detail": "Curriculum is not assigned to this school by Landlord ERP."},
            status=status.HTTP_403_FORBIDDEN,
        )
    if not name:
        return Response({"detail": "Class stream name is required."}, status=status.HTTP_400_BAD_REQUEST)

    stream = ClassStream.objects.create(
        institution=inst,
        name=name,
        code=(request.data.get("code") or name[:4]).upper().replace(" ", ""),
        curriculum_code=curr_code,
        class_teacher_name=(request.data.get("class_teacher_name") or "").strip(),
    )
    return Response(
        {
            "id": stream.id,
            "name": stream.name,
            "code": stream.code,
            "curriculum_code": stream.curriculum_code,
            "curriculum_label": stream.curriculum_code.replace("_", " "),
            "class_teacher_name": stream.class_teacher_name,
            "students_count": 0,
            "subjects_count": 0,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["DELETE"])
@permission_classes([AllowAny])
def class_stream_delete_view(request, stream_id):
    if _actor_role(request) == "TEACHER":
        return Response(
            {"detail": "Teachers cannot delete classes. Only Admin/Principal/DOS can delete classes."},
            status=status.HTTP_403_FORBIDDEN,
        )
    inst = _resolve_inst(request)
    stream = ClassStream.objects.filter(institution=inst, id=stream_id).first()
    if not stream:
        return Response({"detail": "Class stream not found."}, status=status.HTTP_404_NOT_FOUND)
    stream.delete()
    return Response({"deleted": True})


@api_view(["GET"])
@permission_classes([AllowAny])
def subject_catalog_view(request):
    """Returns official subjects for all levels strictly filtered to the school's Landlord-assigned curricula."""
    inst = _resolve_inst(request)
    allowed = (inst.curricula or [inst.curriculum]) if inst else ["UNEB_LOWER_SECONDARY"]
    qs = CurriculumSubjectCatalog.objects.filter(curriculum_code__in=allowed)
    curr = request.GET.get("curriculum")
    if curr and curr in allowed:
        qs = qs.filter(curriculum_code=curr)
    return Response(
        {
            "allowed_curricula": allowed,
            "count": qs.count(),
            "results": [
                {
                    "id": item.id,
                    "curriculum_code": item.curriculum_code,
                    "curriculum_label": item.curriculum_code.replace("_", " "),
                    "level": item.level,
                    "code": item.code,
                    "name": item.name,
                }
                for item in qs
            ],
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def add_subjects_from_catalog_view(request):
    """Admin/DOS adds official catalog subjects to a class stream."""
    if _actor_role(request) == "TEACHER":
        return Response(
            {"detail": "Teachers cannot create class subjects. Only Admin or DOS can assign subjects."},
            status=status.HTTP_403_FORBIDDEN,
        )
    inst = _resolve_inst(request)
    stream = ClassStream.objects.filter(institution=inst, id=request.data.get("class_stream_id")).first()
    if not inst or not stream:
        return Response({"detail": "Valid school and class stream required."}, status=status.HTTP_400_BAD_REQUEST)

    catalog_ids = request.data.get("catalog_ids") or []
    cat_items = CurriculumSubjectCatalog.objects.filter(
        id__in=catalog_ids, curriculum_code=stream.curriculum_code
    )
    created = 0
    for item in cat_items:
        _, is_new = Subject.objects.get_or_create(
            institution=inst,
            class_stream=stream,
            name=item.name,
            defaults={"code": item.code, "teacher_name": stream.class_teacher_name or "Assigned Teacher"},
        )
        if is_new:
            created += 1
    return Response({"created": created, "class_stream": stream.name}, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([AllowAny])
def report_card_preview_view(request, verification_code):
    """Returns full JSON payload for the live A4 (210mm x 297mm, 20mm margin) Report Card Preview."""
    snapshot = (
        ReportCardSnapshot.objects.filter(verification_code=verification_code)
        .select_related("institution", "student", "student__class_stream", "term", "term__academic_year")
        .first()
    )
    if not snapshot:
        return Response({"detail": "Report card not found."}, status=status.HTTP_404_NOT_FOUND)

    marks = StudentMark.objects.filter(student=snapshot.student, term=snapshot.term).select_related("subject")
    return Response(
        {
            "verification_code": snapshot.verification_code,
            "pdf_url": f"/api/academics/report-cards/{snapshot.verification_code}/pdf/",
            "school": {
                "name": snapshot.institution.name,
                "initials": snapshot.institution.initials,
                "email": snapshot.institution.email,
                "phone": snapshot.institution.phone,
                "domain": snapshot.institution.custom_domain or f"{snapshot.institution.subdomain}.isomaug.com",
            },
            "term": f"{snapshot.term.academic_year.name} - {snapshot.term.name}",
            "student": {
                "full_name": snapshot.student.full_name,
                "registration_number": snapshot.student.registration_number,
                "class_stream": snapshot.student.class_stream.name if snapshot.student.class_stream else "General",
                "curriculum": (
                    snapshot.student.class_stream.curriculum_code.replace("_", " ")
                    if snapshot.student.class_stream
                    else "UNEB LOWER SECONDARY"
                ),
            },
            "average_score": snapshot.average_score,
            "class_position": snapshot.class_position,
            "class_size": snapshot.class_size,
            "class_teacher_remark": snapshot.class_teacher_remark,
            "headteacher_remark": snapshot.headteacher_remark,
            "issued_at": snapshot.issued_at,
            "marks": [
                {
                    "id": m.id,
                    "subject_name": m.subject.name,
                    "ca_score": m.ca_score,
                    "exam_score": m.exam_score,
                    "total_score": m.total_score,
                    "grade": m.grade,
                    "remark": m.remark,
                    "recorded_by": m.recorded_by,
                    "updated_at": m.updated_at,
                }
                for m in marks
            ],
        }
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def students_view(request):
    inst = _resolve_inst(request)
    if not inst:
        return Response({"results": []})

    if request.method == "GET":
        students = StudentProfile.objects.filter(institution=inst).select_related("class_stream")
        return Response(
            {
                "count": students.count(),
                "results": [
                    {
                        "id": st.id,
                        "registration_number": st.registration_number,
                        "full_name": st.full_name,
                        "gender": st.gender,
                        "class_stream_id": st.class_stream_id,
                        "class_stream_name": st.class_stream.name if st.class_stream else "Unassigned",
                        "curriculum_code": st.class_stream.curriculum_code if st.class_stream else "",
                        "parent_name": st.parent_name,
                        "parent_phone": st.parent_phone,
                        "parent_email": st.parent_email,
                        "status": st.status,
                    }
                    for st in students
                ],
            }
        )

    full_name = (request.data.get("full_name") or "").strip()
    if not full_name:
        return Response({"detail": "Student full name is required."}, status=status.HTTP_400_BAD_REQUEST)

    stream = ClassStream.objects.filter(
        institution=inst, id=request.data.get("class_stream_id")
    ).first()

    dob_raw = (request.data.get("date_of_birth") or "").strip() or None
    boarding_status = (request.data.get("boarding_status") or "DAY").upper()

    st = StudentProfile.objects.create(
        institution=inst,
        class_stream=stream,
        full_name=full_name,
        gender=request.data.get("gender") or "Female",
        date_of_birth=dob_raw,
        nationality=(request.data.get("nationality") or "Ugandan").strip(),
        nin_or_lin=(request.data.get("nin_or_lin") or "").strip(),
        home_address=(request.data.get("home_address") or "").strip(),
        previous_school=(request.data.get("previous_school") or "").strip(),
        boarding_status=boarding_status,
        parent_name=(request.data.get("parent_name") or "").strip(),
        parent_relationship=(request.data.get("parent_relationship") or "Parent / Guardian").strip(),
        parent_phone=(request.data.get("parent_phone") or "").strip(),
        parent_email=(request.data.get("parent_email") or "").strip(),
        emergency_contact_name=(request.data.get("emergency_contact_name") or "").strip(),
        emergency_contact_phone=(request.data.get("emergency_contact_phone") or "").strip(),
    )

    # Immediately link new student to Campus 360 tables (Medical, Canteen, Boarding / Transport)
    try:
        from campus.models import BedAllocation, BusRouteAssignment, CanteenWallet, MedicalProfile

        MedicalProfile.objects.get_or_create(
            institution=inst,
            student=st,
            defaults={
                "blood_group": (request.data.get("blood_group") or "O+").strip(),
                "allergies": (request.data.get("allergies") or "None reported").strip(),
                "emergency_contact": st.emergency_contact_phone or st.parent_phone or "",
            },
        )
        daily_limit = int(request.data.get("canteen_daily_limit_ugx") or 10000)
        CanteenWallet.objects.get_or_create(
            institution=inst,
            student=st,
            defaults={"balance_ugx": 0, "daily_limit_ugx": max(0, daily_limit)},
        )
        if boarding_status == "BOARDING" and (request.data.get("house_name") or "").strip():
            BedAllocation.objects.get_or_create(
                institution=inst,
                student=st,
                defaults={
                    "house_name": request.data.get("house_name").strip(),
                    "dormitory_room": (request.data.get("dormitory_room") or "Room 101").strip(),
                    "bed_number": (request.data.get("bed_number") or "B-01").strip(),
                },
            )
        elif (request.data.get("bus_route") or "").strip():
            BusRouteAssignment.objects.get_or_create(
                institution=inst,
                student=st,
                defaults={
                    "route_name": request.data.get("bus_route").strip(),
                    "pickup_stop": (request.data.get("pickup_stop") or "Main Stage").strip(),
                },
            )
    except Exception:
        pass

    return Response(
        {
            "id": st.id,
            "registration_number": st.registration_number,
            "full_name": st.full_name,
            "class_stream_name": st.class_stream.name if st.class_stream else "Unassigned",
            "parent_name": st.parent_name,
            "parent_phone": st.parent_phone,
            "status": st.status,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def clone_course_template_view(request):
    """Clones a master Course template into a customizable Subject for a specific ClassStream."""
    inst = _resolve_inst(request)
    course = Course.objects.filter(slug=request.data.get("course_slug")).prefetch_related("modules__lessons").first()
    stream = ClassStream.objects.filter(institution=inst, id=request.data.get("class_stream_id")).first()
    if not stream:
        stream = ClassStream.objects.filter(institution=inst).first()
    if not inst or not course or not stream:
        return Response({"detail": "Valid school, course template, and class stream are required."}, status=status.HTTP_400_BAD_REQUEST)

    cloned = []
    for m in course.modules.all():
        for l in m.lessons.all():
            cloned.append({"module": m.title, "title": l.title, "overview": l.overview or ""})

    subj = Subject.objects.create(
        institution=inst,
        class_stream=stream,
        name=course.title,
        code=course.slug[:12].upper(),
        teacher_name=(request.data.get("teacher_name") or stream.class_teacher_name or "Assigned Teacher"),
        source_course_slug=course.slug,
        cloned_lessons=cloned,
    )
    return Response(
        {
            "id": subj.id,
            "name": subj.name,
            "class_stream": stream.name,
            "cloned_lessons_count": len(cloned),
            "source_course_slug": subj.source_course_slug,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def marks_and_report_cards_view(request):
    inst = _resolve_inst(request)
    if not inst:
        return Response({"results": []})

    year, _ = AcademicYear.objects.get_or_create(institution=inst, name="2026", defaults={"is_current": True})
    term, _ = Term.objects.get_or_create(academic_year=year, name="Term 1", defaults={"is_current": True})

    if request.method == "GET":
        subjects = Subject.objects.filter(institution=inst).select_related("class_stream")
        marks = StudentMark.objects.filter(institution=inst, term=term).select_related("student", "subject")
        snapshots = ReportCardSnapshot.objects.filter(institution=inst, term=term).select_related("student", "student__class_stream")
        audit_logs = MarkAuditLog.objects.filter(institution=inst, term=term).select_related("student", "subject")[:40]
        return Response(
            {
                "term": {"id": term.id, "name": f"{year.name} - {term.name}"},
                "subjects": [
                    {
                        "id": s.id,
                        "name": s.name,
                        "class_stream_id": s.class_stream_id,
                        "class_stream_name": s.class_stream.name,
                        "curriculum_code": s.class_stream.curriculum_code,
                        "cloned_lessons_count": len(s.cloned_lessons or []),
                    }
                    for s in subjects
                ],
                "marks": [
                    {
                        "id": m.id,
                        "student_id": m.student_id,
                        "student_name": m.student.full_name,
                        "registration_number": m.student.registration_number,
                        "subject_id": m.subject_id,
                        "subject_name": m.subject.name,
                        "ca_score": m.ca_score,
                        "exam_score": m.exam_score,
                        "total_score": m.total_score,
                        "grade": m.grade,
                        "remark": m.remark,
                        "recorded_by": m.recorded_by,
                        "updated_at": m.updated_at,
                    }
                    for m in marks
                ],
                "mark_audit_logs": [
                    {
                        "id": a.id,
                        "student_name": a.student.full_name,
                        "registration_number": a.student.registration_number,
                        "subject_name": a.subject.name,
                        "ca_score": a.ca_score,
                        "exam_score": a.exam_score,
                        "total_score": a.total_score,
                        "grade": a.grade,
                        "recorded_by": a.recorded_by,
                        "recorded_at": a.recorded_at,
                    }
                    for a in audit_logs
                ],
                "report_cards": [
                    {
                        "id": rc.id,
                        "student_id": rc.student_id,
                        "student_name": rc.student.full_name,
                        "registration_number": rc.student.registration_number,
                        "class_stream_name": rc.student.class_stream.name if rc.student.class_stream else "General",
                        "average_score": rc.average_score,
                        "class_position": rc.class_position,
                        "class_size": rc.class_size,
                        "verification_code": rc.verification_code,
                        "pdf_url": f"/api/academics/report-cards/{rc.verification_code}/pdf/",
                        "issued_at": rc.issued_at,
                    }
                    for rc in snapshots
                ],
            }
        )

    # POST: save a mark and recompute student's ReportCardSnapshot
    student = StudentProfile.objects.filter(institution=inst, id=request.data.get("student_id")).first()
    subject = Subject.objects.filter(institution=inst, id=request.data.get("subject_id")).first()
    if not student or not subject:
        return Response({"detail": "Student and subject are required."}, status=status.HTTP_400_BAD_REQUEST)

    actor = _actor_name(request)
    mark, _ = StudentMark.objects.update_or_create(
        institution=inst,
        student=student,
        subject=subject,
        term=term,
        defaults={
            "ca_score": float(request.data.get("ca_score") or 0),
            "exam_score": float(request.data.get("exam_score") or 0),
            "teacher_comment": (request.data.get("teacher_comment") or "").strip(),
            "recorded_by": actor,
        },
    )
    MarkAuditLog.objects.create(
        institution=inst,
        student=student,
        subject=subject,
        term=term,
        ca_score=mark.ca_score,
        exam_score=mark.exam_score,
        total_score=mark.total_score,
        grade=mark.grade,
        recorded_by=actor,
    )

    # Recompute averages & positions for the student's class stream
    stream_students = StudentProfile.objects.filter(
        institution=inst, class_stream=student.class_stream
    )
    avgs = []
    for st in stream_students:
        st_marks = list(StudentMark.objects.filter(student=st, term=term))
        if st_marks:
            avg = round(sum(m.total_score for m in st_marks) / len(st_marks), 1)
            avgs.append((st, avg))
    avgs.sort(key=lambda pair: pair[1], reverse=True)
    for rank, (st, avg) in enumerate(avgs, start=1):
        ReportCardSnapshot.objects.update_or_create(
            institution=inst,
            student=st,
            term=term,
            defaults={"average_score": avg, "class_position": rank, "class_size": len(avgs)},
        )

    return Response(
        {
            "id": mark.id,
            "total_score": mark.total_score,
            "grade": mark.grade,
            "remark": mark.remark,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def bulk_marks_view(request):
    """Bulk save marks for an entire class stream in a single subject and log timestamps."""
    inst = _resolve_inst(request)
    if not inst:
        return Response({"detail": "School not found."}, status=status.HTTP_404_NOT_FOUND)

    subject = (
        Subject.objects.filter(institution=inst, id=request.data.get("subject_id"))
        .select_related("class_stream")
        .first()
    )
    entries = request.data.get("entries") or []
    if not subject or not isinstance(entries, list) or len(entries) == 0:
        return Response(
            {"detail": "Subject and at least one student score entry are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    year, _ = AcademicYear.objects.get_or_create(institution=inst, name="2026", defaults={"is_current": True})
    term, _ = Term.objects.get_or_create(academic_year=year, name="Term 1", defaults={"is_current": True})
    actor = _actor_name(request)

    student_map = {
        st.id: st
        for st in StudentProfile.objects.filter(
            institution=inst, id__in=[e.get("student_id") for e in entries if e.get("student_id")]
        )
    }

    saved_count = 0
    touched_streams = set()
    for row in entries:
        st = student_map.get(int(row.get("student_id") or 0))
        if not st:
            continue
        ca_val = float(row.get("ca_score") if row.get("ca_score") not in ("", None) else 0)
        exam_val = float(row.get("exam_score") if row.get("exam_score") not in ("", None) else 0)
        ca_val = max(0.0, min(100.0, ca_val))
        exam_val = max(0.0, min(100.0, exam_val))

        mark, _ = StudentMark.objects.update_or_create(
            institution=inst,
            student=st,
            subject=subject,
            term=term,
            defaults={
                "ca_score": ca_val,
                "exam_score": exam_val,
                "recorded_by": actor,
            },
        )
        MarkAuditLog.objects.create(
            institution=inst,
            student=st,
            subject=subject,
            term=term,
            ca_score=mark.ca_score,
            exam_score=mark.exam_score,
            total_score=mark.total_score,
            grade=mark.grade,
            recorded_by=actor,
        )
        saved_count += 1
        if st.class_stream_id:
            touched_streams.add(st.class_stream_id)

    for stream_id in touched_streams:
        stream_students = StudentProfile.objects.filter(institution=inst, class_stream_id=stream_id)
        avgs = []
        for st in stream_students:
            st_marks = list(StudentMark.objects.filter(student=st, term=term))
            if st_marks:
                avg = round(sum(m.total_score for m in st_marks) / len(st_marks), 1)
                avgs.append((st, avg))
        avgs.sort(key=lambda pair: pair[1], reverse=True)
        for rank, (st, avg) in enumerate(avgs, start=1):
            ReportCardSnapshot.objects.update_or_create(
                institution=inst,
                student=st,
                term=term,
                defaults={"average_score": avg, "class_position": rank, "class_size": len(avgs)},
            )

    return Response(
        {"saved": saved_count, "subject": subject.name, "recorded_by": actor},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def report_card_pdf_view(request, verification_code):
    snapshot = (
        ReportCardSnapshot.objects.filter(verification_code=verification_code)
        .select_related("institution", "student", "student__class_stream", "term", "term__academic_year")
        .first()
    )
    if not snapshot:
        return Response({"detail": "Report card not found."}, status=status.HTTP_404_NOT_FOUND)

    marks = StudentMark.objects.filter(student=snapshot.student, term=snapshot.term).select_related("subject")
    pdf_buf = render_report_card_pdf(snapshot, marks)
    response = HttpResponse(pdf_buf.getvalue(), content_type="application/pdf")
    response["Content-Disposition"] = f'inline; filename="{snapshot.verification_code}.pdf"'
    return response


@api_view(["GET"])
@permission_classes([AllowAny])
def verify_report_card_view(request, verification_code):
    snapshot = (
        ReportCardSnapshot.objects.filter(verification_code__iexact=verification_code.strip())
        .select_related("institution", "student", "student__class_stream", "term", "term__academic_year")
        .first()
    )
    if not snapshot:
        return Response({"valid": False, "detail": "Verification code not found."}, status=status.HTTP_404_NOT_FOUND)

    return Response(
        {
            "valid": True,
            "verification_code": snapshot.verification_code,
            "school": snapshot.institution.name,
            "student_name": snapshot.student.full_name,
            "registration_number": snapshot.student.registration_number,
            "class_stream": snapshot.student.class_stream.name if snapshot.student.class_stream else "General",
            "term": f"{snapshot.term.academic_year.name} - {snapshot.term.name}",
            "average_score": snapshot.average_score,
            "class_position": f"{snapshot.class_position} of {snapshot.class_size}",
            "issued_at": snapshot.issued_at,
            "pdf_url": f"/api/academics/report-cards/{snapshot.verification_code}/pdf/",
        }
    )


urlpatterns = [
    path("curricula/", curriculum_definitions_view, name="academics-curricula"),
    path("custom-domain/", custom_domain_view, name="academics-custom-domain"),
    path("classes/", class_streams_view, name="academics-classes"),
    path("classes/<int:stream_id>/", class_stream_delete_view, name="academics-class-delete"),
    path("subject-catalog/", subject_catalog_view, name="academics-subject-catalog"),
    path("subjects/from-catalog/", add_subjects_from_catalog_view, name="academics-subjects-from-catalog"),
    path("students/", students_view, name="academics-students"),
    path("templates/clone/", clone_course_template_view, name="academics-clone-template"),
    path("marks/", marks_and_report_cards_view, name="academics-marks"),
    path("marks/bulk/", bulk_marks_view, name="academics-marks-bulk"),
    path("report-cards/<str:verification_code>/preview/", report_card_preview_view, name="academics-report-preview"),
    path("report-cards/<str:verification_code>/pdf/", report_card_pdf_view, name="academics-report-pdf"),
    path("verify/<str:verification_code>/", verify_report_card_view, name="academics-verify"),
]
