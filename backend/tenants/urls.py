from django.contrib.auth.models import User
from django.urls import path
from django.utils.text import slugify
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from accounts.models import UserProfile
from .models import DEFAULT_PORTALS, Institution, InstitutionAuditLog


def _actor_label(request):
    user = getattr(request, "user", None)
    if user and getattr(user, "is_authenticated", False):
        full = user.get_full_name()
        return f"{full} ({user.email})" if full and user.email else (user.email or user.username)
    return (request.data.get("edited_by") or "ERP Super Admin").strip()


def serialize_institution(inst):
    domain = inst.custom_domain if inst.custom_domain else f"{inst.subdomain}.isomaug.com"
    staff_count = inst.members.count()
    return {
        "id": inst.id,
        "name": inst.name,
        "initials": inst.initials,
        "subdomain": inst.subdomain,
        "custom_domain": inst.custom_domain,
        "primary_domain": domain,
        "tier": inst.tier,
        "tier_label": inst.get_tier_display(),
        "curriculum": inst.curriculum,
        "curricula": inst.curricula or [inst.curriculum],
        "country": inst.country,
        "currency": inst.currency,
        "phone": inst.phone,
        "email": inst.email,
        "is_public_academy": inst.is_public_academy,
        "onboarding_status": inst.onboarding_status,
        "enabled_portals": inst.enabled_portals or list(DEFAULT_PORTALS),
        "members_count": staff_count,
        "created_at": inst.created_at,
        "updated_at": inst.updated_at,
        "updated_by": inst.updated_by or "System Seed",
    }


def serialize_member(profile):
    u = profile.user
    return {
        "id": u.id,
        "username": u.username,
        "full_name": u.get_full_name() or u.username,
        "email": u.email,
        "role": profile.role,
        "role_label": profile.get_role_display(),
        "phone": profile.phone,
        "institution": profile.institution.name if profile.institution else "",
        "subdomain": profile.institution.subdomain if profile.institution else "",
        "assigned_curricula": profile.assigned_curricula or [],
        "assigned_class_ids": profile.assigned_class_ids or [],
        "assigned_subject_ids": profile.assigned_subject_ids or [],
        "hr_stage": profile.hr_stage,
        "hr_stage_label": profile.get_hr_stage_display(),
        "contract_type": profile.contract_type,
        "department": profile.department,
        "applied_at": profile.applied_at,
        "onboarded_at": profile.onboarded_at,
        "updated_at": profile.updated_at,
        "updated_by": profile.updated_by,
        "is_active": u.is_active,
    }


@api_view(["GET"])
@permission_classes([AllowAny])
def tenant_context_view(request):
    tenant = getattr(request, "tenant", None)
    is_root = getattr(request, "is_root_platform", False)
    if tenant:
        payload = serialize_institution(tenant)
        payload["is_root_platform"] = is_root
        return Response(payload)
    return Response(
        {
            "name": "ISOMA UG",
            "initials": "IU",
            "subdomain": "root",
            "primary_domain": "isomaug.com",
            "tier": "OPEN_ACADEMY",
            "curriculum": "UNEB_LOWER_SECONDARY",
            "country": "Uganda",
            "currency": "UGX",
            "phone": "+256778261026",
            "email": "isomaug@gmail.com",
            "is_public_academy": False,
            "is_root_platform": True,
            "onboarding_status": "COMPLETED",
            "enabled_portals": list(DEFAULT_PORTALS),
        }
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def institutions_view(request):
    if request.method == "GET":
        items = [serialize_institution(i) for i in Institution.objects.all()]
        return Response({"count": len(items), "results": items})

    name = (request.data.get("name") or "").strip()
    if not name:
        return Response({"detail": "School / institution name is required."}, status=status.HTTP_400_BAD_REQUEST)

    raw_sub = (request.data.get("subdomain") or name).strip()
    subdomain = slugify(raw_sub)[:60]
    if not subdomain or Institution.objects.filter(subdomain=subdomain).exists():
        return Response(
            {"detail": f"Subdomain '{subdomain}' is invalid or already taken."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    initials = (
        request.data.get("initials")
        or "".join(w[0].upper() for w in name.split()[:2])
        or "IS"
    )[:4]

    curricula = request.data.get("curricula")
    primary_curriculum = request.data.get("curriculum") or (
        curricula[0] if isinstance(curricula, list) and curricula else "UNEB_LOWER_SECONDARY"
    )
    if not isinstance(curricula, list) or not curricula:
        curricula = [primary_curriculum]

    inst = Institution.objects.create(
        name=name,
        initials=initials,
        subdomain=subdomain,
        custom_domain=(request.data.get("custom_domain") or "").strip(),
        tier=request.data.get("tier") or "SECONDARY",
        curriculum=primary_curriculum,
        curricula=curricula,
        country=request.data.get("country") or "Uganda",
        currency=request.data.get("currency") or "UGX",
        phone=(request.data.get("phone") or "").strip(),
        email=(request.data.get("email") or "").strip(),
        is_public_academy=bool(request.data.get("is_public_academy", False)),
        onboarding_status=request.data.get("onboarding_status") or "PENDING",
        enabled_portals=request.data.get("enabled_portals") or list(DEFAULT_PORTALS),
    )

    # Optionally create initial Principal / Admin user for the school
    principal_email = (request.data.get("principal_email") or inst.email or "").strip()
    principal_name = (request.data.get("principal_name") or f"{name} Principal").strip()
    principal_password = (request.data.get("principal_password") or "Isoma2026!").strip()
    if principal_email:
        username = slugify(f"{subdomain}-{principal_email.split('@')[0]}")[:40]
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": principal_email,
                "first_name": principal_name.split()[0],
                "last_name": " ".join(principal_name.split()[1:]),
            },
        )
        if created:
            user.set_password(principal_password)
            user.save()
        UserProfile.objects.update_or_create(
            user=user,
            defaults={"institution": inst, "role": "PRINCIPAL", "phone": inst.phone},
        )

    return Response(serialize_institution(inst), status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([AllowAny])
def tenant_onboarding_view(request, subdomain):
    """Tenant self-onboarding: branding, custom domain, contact, status (curricula are Landlord-only)."""
    inst = Institution.objects.filter(subdomain=subdomain).first()
    if not inst:
        return Response({"detail": "School not found."}, status=status.HTTP_404_NOT_FOUND)

    for field in (
        "name",
        "country",
        "currency",
        "phone",
        "email",
        "custom_domain",
        "onboarding_status",
        "enabled_portals",
    ):
        if field in request.data:
            setattr(inst, field, request.data[field])
    inst.save()
    return Response(serialize_institution(inst))


@api_view(["PATCH"])
@permission_classes([AllowAny])
def landlord_edit_institution_view(request, subdomain):
    """Landlord ERP Super Admin endpoint to edit any registered school and log who/when/what changed."""
    inst = Institution.objects.filter(subdomain=subdomain).first()
    if not inst:
        return Response({"detail": "School not found."}, status=status.HTTP_404_NOT_FOUND)

    editable = (
        "name",
        "tier",
        "curricula",
        "custom_domain",
        "country",
        "currency",
        "phone",
        "email",
        "onboarding_status",
    )
    changed_fields = []
    for field in editable:
        if field in request.data:
            old_val = getattr(inst, field)
            new_val = request.data[field]
            if old_val != new_val:
                setattr(inst, field, new_val)
                changed_fields.append(field)

    if "curricula" in changed_fields and isinstance(inst.curricula, list) and inst.curricula:
        inst.curriculum = inst.curricula[0]

    if "name" in changed_fields and inst.name:
        inst.initials = ("".join(w[0].upper() for w in inst.name.split()[:2]) or inst.initials)[:4]

    actor = _actor_label(request)
    inst.updated_by = actor
    inst.save()

    summary = (
        f"Updated {', '.join(changed_fields)}"
        if changed_fields
        else "Saved school record (no field values changed)"
    )
    InstitutionAuditLog.objects.create(
        institution=inst,
        edited_by=actor,
        action="SCHOOL_UPDATED",
        changes_summary=summary,
    )
    return Response(serialize_institution(inst))


@api_view(["GET"])
@permission_classes([AllowAny])
def landlord_audit_logs_view(request):
    """Returns recent school edit audit logs (who, when, what) for the ERP Super Admin."""
    logs = InstitutionAuditLog.objects.select_related("institution")[:50]
    results = [
        {
            "id": log.id,
            "institution_name": log.institution.name,
            "subdomain": log.institution.subdomain,
            "edited_by": log.edited_by,
            "action": log.action,
            "changes_summary": log.changes_summary,
            "edited_at": log.edited_at,
        }
        for log in logs
    ]
    return Response({"count": len(results), "results": results})


@api_view(["PATCH"])
@permission_classes([AllowAny])
def landlord_curricula_view(request, subdomain):
    """Landlord-only endpoint to assign or update a school's allowed curricula."""
    inst = Institution.objects.filter(subdomain=subdomain).first()
    if not inst:
        return Response({"detail": "School not found."}, status=status.HTTP_404_NOT_FOUND)

    curricula = request.data.get("curricula")
    if not isinstance(curricula, list) or not curricula:
        return Response(
            {"detail": "Provide a non-empty list of curricula."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    actor = _actor_label(request)
    inst.curricula = curricula
    inst.curriculum = curricula[0]
    inst.updated_by = actor
    inst.save(update_fields=["curricula", "curriculum", "updated_by", "updated_at"])
    InstitutionAuditLog.objects.create(
        institution=inst,
        edited_by=actor,
        action="CURRICULA_UPDATED",
        changes_summary=f"Set curricula to {', '.join(curricula)}",
    )
    return Response(serialize_institution(inst))


def _infer_curriculum_code(course):
    text = f"{course.slug} {course.title} {course.category}".lower()
    if "cambridge" in text or "igcse" in text or "9626" in text or "a-level" in text:
        return "CAMBRIDGE_IGCSE"
    if "ace" in text or "pace" in text:
        return "ACE_PACE"
    if "ib " in text or "baccalaureate" in text:
        return "IB_DP"
    if "montessori" in text or "nursery" in text or "ecd" in text:
        return "MONTESSORI_ECD"
    if "primary" in text or "ple" in text:
        return "UNEB_PRIMARY"
    return "UNEB_LOWER_SECONDARY"


@api_view(["GET"])
@permission_classes([AllowAny])
def curriculum_templates_view(request):
    """
    Strictly server-filtered curriculum templates for the active tenant.
    Staff on a tenant NEVER receive or load templates outside their Landlord-assigned curricula.
    """
    from courses.models import Course

    tenant = getattr(request, "tenant", None)
    allowed = (
        (tenant.curricula or [tenant.curriculum])
        if tenant
        else ["UNEB_LOWER_SECONDARY"]
    )

    qs = Course.objects.filter(is_published=True, is_deleted=False).prefetch_related("modules__lessons")
    items = []
    for c in qs:
        curr_code = _infer_curriculum_code(c)
        if not (tenant and tenant.is_public_academy):
            if curr_code not in allowed:
                continue
        modules_count = c.modules.count()
        lessons_count = sum(m.lessons.count() for m in c.modules.all())
        items.append(
            {
                "id": c.id,
                "slug": c.slug,
                "title": c.title,
                "subtitle": c.subtitle or c.description[:140],
                "category": c.category or "General",
                "level": c.get_level_display() if hasattr(c, "get_level_display") else c.level,
                "curriculum": curr_code,
                "curriculum_label": curr_code.replace("_", " "),
                "modules_count": modules_count,
                "lessons_count": lessons_count,
                "price_ugx": float(c.price_ugx or 0),
            }
        )

    return Response(
        {
            "tenant": tenant.subdomain if tenant else "root",
            "allowed_curricula": allowed,
            "count": len(items),
            "results": items,
        }
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def tenant_staff_view(request, subdomain):
    inst = Institution.objects.filter(subdomain=subdomain).first()
    if not inst:
        return Response({"detail": "School not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        members = [
            serialize_member(p)
            for p in UserProfile.objects.filter(institution=inst).select_related("user", "institution")
        ]
        return Response({"count": len(members), "results": members})

    full_name = (request.data.get("full_name") or "").strip()
    email = (request.data.get("email") or "").strip().lower()
    role = (request.data.get("role") or "TEACHER").upper()
    phone = (request.data.get("phone") or "").strip()
    password = (request.data.get("password") or "Isoma2026!").strip()

    if not full_name or not email:
        return Response(
            {"detail": "Full name and email are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    username = slugify(f"{subdomain}-{email.split('@')[0]}")[:40]
    if User.objects.filter(username=username).exists():
        username = f"{username}-{User.objects.count() + 1}"[:40]

    from django.utils import timezone

    allowed_curr = inst.curricula or [inst.curriculum]
    req_curr = request.data.get("assigned_curricula")
    if isinstance(req_curr, list) and req_curr:
        assigned_curricula = [c for c in req_curr if c in allowed_curr] or [allowed_curr[0]]
    else:
        assigned_curricula = [allowed_curr[0]]

    hr_stage = (request.data.get("hr_stage") or "ONBOARDED").upper()
    now = timezone.now()

    parts = full_name.split()
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=parts[0],
        last_name=" ".join(parts[1:]),
    )
    dob_raw = (request.data.get("date_of_birth") or "").strip() or None
    profile = UserProfile.objects.create(
        user=user,
        institution=inst,
        role=role,
        phone=phone,
        assigned_curricula=assigned_curricula,
        assigned_class_ids=[int(x) for x in (request.data.get("assigned_class_ids") or []) if str(x).isdigit()],
        assigned_subject_ids=[int(x) for x in (request.data.get("assigned_subject_ids") or []) if str(x).isdigit()],
        hr_stage=hr_stage,
        contract_type=(request.data.get("contract_type") or "FULL_TIME").upper(),
        department=(request.data.get("department") or "").strip(),
        date_of_birth=dob_raw,
        gender=(request.data.get("gender") or "").strip(),
        nationality=(request.data.get("nationality") or "Ugandan").strip(),
        national_id=(request.data.get("national_id") or "").strip(),
        home_address=(request.data.get("home_address") or "").strip(),
        qualification=(request.data.get("qualification") or "").strip(),
        years_experience=int(request.data.get("years_experience") or 0),
        salary_ugx=int(request.data.get("salary_ugx") or 0),
        next_of_kin_name=(request.data.get("next_of_kin_name") or "").strip(),
        next_of_kin_phone=(request.data.get("next_of_kin_phone") or "").strip(),
        bank_or_momo_account=(request.data.get("bank_or_momo_account") or "").strip(),
        applied_at=now,
        onboarded_at=now if hr_stage in ("ONBOARDED", "ACTIVE") else None,
        updated_by=_actor_label(request),
    )
    return Response(serialize_member(profile), status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([AllowAny])
def tenant_staff_detail_view(request, subdomain, user_id):
    """Edit an existing staff member: role, curricula, assigned classes/subjects, HR stage, contact."""
    from django.utils import timezone

    inst = Institution.objects.filter(subdomain=subdomain).first()
    if not inst:
        return Response({"detail": "School not found."}, status=status.HTTP_404_NOT_FOUND)

    profile = UserProfile.objects.filter(institution=inst, user_id=user_id).select_related("user", "institution").first()
    if not profile:
        return Response({"detail": "Staff member not found."}, status=status.HTTP_404_NOT_FOUND)

    user = profile.user
    if "full_name" in request.data and (request.data.get("full_name") or "").strip():
        parts = request.data["full_name"].strip().split()
        user.first_name = parts[0]
        user.last_name = " ".join(parts[1:])
    if "email" in request.data and (request.data.get("email") or "").strip():
        user.email = request.data["email"].strip().lower()
    user.save()

    allowed_curr = inst.curricula or [inst.curriculum]
    if "assigned_curricula" in request.data and isinstance(request.data["assigned_curricula"], list):
        filtered = [c for c in request.data["assigned_curricula"] if c in allowed_curr]
        profile.assigned_curricula = filtered or [allowed_curr[0]]
    if "assigned_class_ids" in request.data and isinstance(request.data["assigned_class_ids"], list):
        profile.assigned_class_ids = [int(x) for x in request.data["assigned_class_ids"] if str(x).isdigit()]
    if "assigned_subject_ids" in request.data and isinstance(request.data["assigned_subject_ids"], list):
        profile.assigned_subject_ids = [int(x) for x in request.data["assigned_subject_ids"] if str(x).isdigit()]
    for field in ("role", "phone", "hr_stage", "contract_type", "department"):
        if field in request.data:
            setattr(profile, field, request.data[field])

    if profile.hr_stage in ("ONBOARDED", "ACTIVE") and not profile.onboarded_at:
        profile.onboarded_at = timezone.now()
    profile.updated_by = _actor_label(request)
    profile.save()
    return Response(serialize_member(profile))


@api_view(["GET"])
@permission_classes([AllowAny])
def tenant_hr_metrics_view(request, subdomain):
    """HR recruitment-to-onboarding funnel metrics for a school."""
    inst = Institution.objects.filter(subdomain=subdomain).first()
    if not inst:
        return Response({"detail": "School not found."}, status=status.HTTP_404_NOT_FOUND)

    profiles = UserProfile.objects.filter(institution=inst)
    stages = ["APPLIED", "SHORTLISTED", "INTERVIEWED", "OFFERED", "ONBOARDED", "ACTIVE"]
    counts = {s: profiles.filter(hr_stage=s).count() for s in stages}
    total = profiles.count()
    onboarded_total = counts["ONBOARDED"] + counts["ACTIVE"]
    return Response(
        {
            "total_staff": total,
            "onboarded_rate": round((onboarded_total / total) * 100, 1) if total else 0,
            "stages": counts,
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def landlord_users_view(request):
    profiles = UserProfile.objects.select_related("user", "institution").order_by("-id")
    items = [serialize_member(p) for p in profiles]
    return Response({"count": len(items), "results": items})


urlpatterns = [
    path("context/", tenant_context_view, name="tenant-context"),
    path("institutions/", institutions_view, name="tenant-institutions"),
    path("institutions/<slug:subdomain>/", landlord_edit_institution_view, name="landlord-edit-institution"),
    path("institutions/<slug:subdomain>/onboarding/", tenant_onboarding_view, name="tenant-onboarding"),
    path("institutions/<slug:subdomain>/curricula/", landlord_curricula_view, name="landlord-curricula"),
    path("institutions/<slug:subdomain>/staff/", tenant_staff_view, name="tenant-staff"),
    path("institutions/<slug:subdomain>/staff/<int:user_id>/", tenant_staff_detail_view, name="tenant-staff-detail"),
    path("institutions/<slug:subdomain>/hr-metrics/", tenant_hr_metrics_view, name="tenant-hr-metrics"),
    path("audit-logs/", landlord_audit_logs_view, name="landlord-audit-logs"),
    path("curriculum-templates/", curriculum_templates_view, name="curriculum-templates"),
    path("users/", landlord_users_view, name="landlord-users"),
]
