import re

from .models import Lesson

WEEK_RE = re.compile(r"\bweek\s+(\d+)\b", re.I)


def lesson_week_number(title):
    if not title:
        return None
    match = WEEK_RE.search(title)
    return int(match.group(1)) if match else None


def user_bypasses_visibility(user):
    if not user or not getattr(user, "is_authenticated", False):
        return False
    return bool(
        user.is_staff
        or user.is_superuser
        or user.groups.filter(name="Instructors").exists()
    )


def user_can_manage_course(user, course):
    if user_bypasses_visibility(user):
        return True
    if not user or not getattr(user, "is_authenticated", False) or not course:
        return False
    if course.assigned_instructor_id == user.id:
        return True
    return course.cohorts.filter(instructors=user).exists()


def lesson_is_visible_to_user(lesson, user):
    if user_bypasses_visibility(user):
        return True
    return bool(lesson.is_visible and lesson.module.is_visible)


def quiz_is_visible_to_user(quiz, user):
    if user_bypasses_visibility(user):
        return True
    if quiz.lesson_id:
        return lesson_is_visible_to_user(quiz.lesson, user)
    if quiz.module_id:
        return bool(quiz.module.is_visible)
    return False


def same_week_lessons(lesson):
    """Lessons in the same module that share a Week N title, or just this lesson."""
    week = lesson_week_number(lesson.title)
    siblings = Lesson.objects.filter(module_id=lesson.module_id)
    if week is None:
        return siblings.filter(pk=lesson.pk)
    matching_ids = [
        sibling.pk
        for sibling in siblings.only("id", "title")
        if lesson_week_number(sibling.title) == week
    ]
    return Lesson.objects.filter(pk__in=matching_ids)


def is_robotics_stage_course(course):
    return (course.slug or "").startswith("ai-robotics-stage-")


def is_future_robotics_content(lesson=None, quiz=None, keep_week=1):
    """True for robotics content after the currently released week."""
    if quiz is not None and lesson is None:
        lesson = quiz.lesson
        module = quiz.module or (lesson.module if lesson else None)
        course = None
        if lesson:
            course = lesson.module.course
        elif module:
            course = module.course
        if not course or not is_robotics_stage_course(course):
            return False
        title = (lesson.title if lesson else None) or quiz.title
        week = lesson_week_number(title)
        module_title = (module.title if module else "") or ""
        if module_title.lower().startswith("term 2") or module_title.lower().startswith("term 3"):
            return True
        return week is not None and week > keep_week

    if lesson is None:
        return False
    course = lesson.module.course
    if not is_robotics_stage_course(course):
        return False
    module_title = (lesson.module.title or "").lower()
    if module_title.startswith("term 2") or module_title.startswith("term 3"):
        return True
    week = lesson_week_number(lesson.title)
    return week is not None and week > keep_week
