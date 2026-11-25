"""Helpers for resolving and consolidating course XP across cohort / null rows."""

from django.db.models import Q, Sum


def course_xp_queryset(user_id, course_id, cohort=None):
    """
    XP rows that count for a student in a course.

    When a cohort is provided, include that cohort's row plus legacy null-cohort
    rows (pre-cohort isolation awards). Never mix other cohorts.
    """
    from .models import UserXP

    qs = UserXP.objects.filter(user_id=user_id, course_id=course_id)
    if cohort is not None:
        cohort_id = getattr(cohort, "id", cohort)
        qs = qs.filter(Q(cohort_id=cohort_id) | Q(cohort_id__isnull=True))
    return qs


def sum_course_xp(user_id, course_id, cohort=None):
    total = course_xp_queryset(user_id, course_id, cohort=cohort).aggregate(
        s=Sum("total_xp")
    )["s"]
    return int(total or 0)


def get_or_create_course_xp(user, course, cohort=None):
    """
    Return the canonical UserXP row for (user, course, cohort).

    If a legacy null-cohort balance exists and the cohort row is empty/new,
    fold that balance into the cohort row so XP continues to show.
    """
    from .models import UserXP

    xp_profile, created = UserXP.objects.get_or_create(
        user=user, course=course, cohort=cohort
    )
    if cohort is None:
        return xp_profile

    null_row = (
        UserXP.objects.filter(user=user, course=course, cohort__isnull=True)
        .exclude(pk=xp_profile.pk)
        .first()
    )
    if null_row and null_row.total_xp:
        if created or xp_profile.total_xp == 0:
            xp_profile.total_xp = (xp_profile.total_xp or 0) + null_row.total_xp
            xp_profile.save(update_fields=["total_xp"])
            null_row.total_xp = 0
            null_row.save(update_fields=["total_xp"])
        elif null_row.total_xp and xp_profile.total_xp:
            # Split history: keep both until an explicit sync consolidates.
            pass
    return xp_profile


def xp_level_from_total(total_xp):
    xp = int(total_xp or 0)
    if xp < 100:
        return 1
    if xp < 300:
        return 2
    if xp < 600:
        return 3
    if xp < 1000:
        return 4
    return 5


def xp_level_title(level):
    return {
        1: "Getting Started",
        2: "Making Progress",
        3: "Good Work",
        4: "Meets Expectations",
        5: "Exceeded Expectations",
    }.get(int(level or 1), "Exceeded Expectations")


def serialize_xp_total(total_xp):
    total = int(total_xp or 0)
    level = xp_level_from_total(total)
    return {
        "total_xp": total,
        "level": level,
        "level_title": xp_level_title(level),
    }
