from rest_framework import serializers
from django.contrib.auth.models import User
from django.db.models import Q
import re
from .models import Course, Module, Lesson, Enrollment, Review, CoursePayment, Quiz, Question, Choice, QuizAttempt, UserXP, LessonMaterial, StudentProject
from .visibility import lesson_week_number


_LESSON_NUM_RE = re.compile(r"Lesson\s+(\d+)", re.I)


def _lesson_sort_key(lesson):
    week = lesson_week_number(lesson.title)
    title = lesson.title or ""
    match = _LESSON_NUM_RE.search(title)
    lesson_num = int(match.group(1)) if match else 1
    return (week if week is not None else 999, lesson_num, lesson.order, lesson.id)


def request_is_instructor_or_admin(request):
    user = getattr(request, "user", None) if request else None
    if not user or not user.is_authenticated:
        return False
    return bool(
        user.is_staff
        or user.is_superuser
        or getattr(user, "is_instructor", False)
        or user.groups.filter(name="Instructors").exists()
    )


def is_instructor_plan_material(material):
    title = (getattr(material, "title", None) or "").lower()
    file_name = ""
    try:
        file_name = (getattr(getattr(material, "file", None), "name", None) or "").lower()
    except Exception:
        file_name = ""
    blob = f"{title} {file_name}"
    return bool(
        getattr(material, "is_instructor_only", False)
        or "lesson plan" in blob
        or "scheme of work" in blob
        or re.search(r"lesson\s*\d+\s*stage", blob)
        or re.search(r"stage\s*\d+.*lesson\s*\d+", blob)
        or re.search(r"lesson\d+stage\d+", blob)
        or re.search(r"stage\d+_?lesson\d+", blob)
    )


class LessonListSerializer(serializers.ModelSerializer):
    """Public lesson info. Video URL is only exposed if is_preview=True."""

    video_url = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    quiz_id = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ["id", "title", "duration_minutes", "order", "is_preview", "video_url", "is_visible", "has_quiz", "quiz_id", "playground_type"]

    def get_video_url(self, obj):
        if obj.is_preview:
            return obj.video_url
        return None

    def get_has_quiz(self, obj):
        return obj.quizzes.exists()

    def get_quiz_id(self, obj):
        quiz = obj.quizzes.first()
        return quiz.id if quiz else None


class LessonMaterialSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = LessonMaterial
        fields = ["id", "title", "file", "download_url", "is_instructor_only"]

    def get_download_url(self, obj):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(f"/api/courses/materials/{obj.id}/download/")
        return f"/api/courses/materials/{obj.id}/download/"

class LessonDetailSerializer(serializers.ModelSerializer):
    """Full lesson with video URL (only for enrolled students)."""
    materials = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    quiz_id = serializers.SerializerMethodField()
    quiz = serializers.SerializerMethodField()

    is_locked = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = [
            "id", "title", "video_url", "offline_video", "duration_minutes", 
            "content", "overview", "lesson_text", "video_script",
            "order", "is_preview", "is_visible", "materials", "has_quiz", "quiz_id", "quiz",
            "playground_type", "playground_custom_url", "playground_starter_file", "is_locked",
            "google_doc_url"
        ]

    def get_is_locked(self, obj):
        if self.context.get('is_partial_enrollment'):
            allowed = self.context.get('allowed_module_ids', [])
            return obj.module.id not in allowed
        return False

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        
        is_instructor_or_admin = request_is_instructor_or_admin(request)
                
        # If they are a student/visitor, do not expose the lesson plan (content)
        if not is_instructor_or_admin:
            data.pop("content", None)
            
        is_hidden = not is_instructor_or_admin and (not instance.is_visible or not instance.module.is_visible)
            
        if data.get('is_locked') or is_hidden:
            data.pop("video_url", None)
            data.pop("offline_video", None)
            data.pop("content", None)
            data.pop("lesson_text", None)
            data.pop("video_script", None)
            data.pop("overview", None)
            data.pop("materials", None)
            data.pop("playground_starter_file", None)
            data.pop("playground_type", None)
            data.pop("playground_custom_url", None)
            data.pop("google_doc_url", None)
            data.pop("quiz", None)
            data.pop("quiz_id", None)
            
        return data

    def get_materials(self, obj):
        request = self.context.get("request")
        materials = obj.materials.all()
        if not request_is_instructor_or_admin(request):
            materials = [
                material
                for material in materials
                if not is_instructor_plan_material(material)
            ]
        return LessonMaterialSerializer(materials, many=True, context=self.context).data

    def get_has_quiz(self, obj):
        return obj.quizzes.exists()

    def get_quiz_id(self, obj):
        quiz = obj.quizzes.first()
        return quiz.id if quiz else None

    def get_quiz(self, obj):
        quiz = obj.quizzes.first()
        return QuizSerializer(quiz).data if quiz else None


class ModuleSerializer(serializers.ModelSerializer):
    """Module with nested public lesson list."""

    lessons = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()
    module_duration = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    quiz_id = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = ["id", "title", "order", "week", "lessons", "lesson_count", "module_duration", "has_quiz", "quiz_id"]

    def get_lessons(self, obj):
        lessons = list(obj.lessons.all())
        lessons.sort(key=_lesson_sort_key)
        if not request_is_instructor_or_admin(self.context.get("request")):
            lessons = [lesson for lesson in lessons if lesson.is_visible]
        return LessonListSerializer(lessons, many=True, context=self.context).data

    def get_lesson_count(self, obj):
        lessons = obj.lessons.all()
        if not request_is_instructor_or_admin(self.context.get("request")):
            lessons = lessons.filter(is_visible=True)
        return lessons.count()

    def get_module_duration(self, obj):
        lessons = obj.lessons.all()
        if not request_is_instructor_or_admin(self.context.get("request")):
            lessons = lessons.filter(is_visible=True)
        return sum(l.duration_minutes or 0 for l in lessons)

    def get_has_quiz(self, obj):
        return hasattr(obj, 'quiz')

    def get_quiz_id(self, obj):
        if hasattr(obj, 'quiz'):
            return obj.quiz.id
        return None


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ["id", "text"]

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = ["id", "text", "points", "order", "choices"]

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    question_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Quiz
        fields = ["id", "title", "description", "passing_score", "points_reward", "time_limit_minutes", "question_count", "questions"]


class ModuleDetailSerializer(serializers.ModelSerializer):
    """Module with full lesson details (for enrolled students)."""

    lessons = serializers.SerializerMethodField()
    quiz = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    quiz_id = serializers.SerializerMethodField()
    certificate_url = serializers.SerializerMethodField()
    is_locked = serializers.SerializerMethodField()
    all_lessons_completed = serializers.SerializerMethodField()
    total_lesson_count = serializers.SerializerMethodField()
    completed_lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Module
        fields = [
            "id", "title", "order", "week", "is_visible", "lessons",
            "has_quiz", "quiz_id", "quiz", "certificate_url", "is_locked",
            "all_lessons_completed", "total_lesson_count", "completed_lesson_count",
        ]

    def get_is_locked(self, obj):
        if self.context.get('is_partial_enrollment'):
            allowed = self.context.get('allowed_module_ids', [])
            return obj.id not in allowed
        return False

    def get_total_lesson_count(self, obj):
        """Full term size — used so students do not see 2/2 after Week 1 alone."""
        return obj.lessons.count()

    def get_completed_lesson_count(self, obj):
        request = self.context.get("request")
        if not request or not getattr(request.user, "is_authenticated", False):
            return 0
        enrollment = Enrollment.objects.filter(user=request.user, course=obj.course).first()
        if not enrollment:
            return 0
        return enrollment.completed_lessons.filter(module=obj).count()

    def get_all_lessons_completed(self, obj):
        """True only when every lesson in the term is done — including still-hidden weeks."""
        request = self.context.get("request")
        if not request or not getattr(request.user, "is_authenticated", False):
            return False
        enrollment = Enrollment.objects.filter(user=request.user, course=obj.course).first()
        if not enrollment:
            return False
        lesson_ids = set(obj.lessons.values_list("id", flat=True))
        if not lesson_ids:
            return False
        completed = set(
            enrollment.completed_lessons.filter(id__in=lesson_ids).values_list("id", flat=True)
        )
        return lesson_ids.issubset(completed)

    def get_lessons(self, obj):
        lessons = list(obj.lessons.all())
        lessons.sort(key=_lesson_sort_key)
        if not request_is_instructor_or_admin(self.context.get("request")):
            lessons = [lesson for lesson in lessons if lesson.is_visible]
        return LessonDetailSerializer(lessons, many=True, context=self.context).data

    def get_quiz(self, obj):
        quiz = obj.quizzes.first()
        if quiz:
            return QuizSerializer(quiz, context=self.context).data
        return None

    def get_has_quiz(self, obj):
        return obj.quizzes.exists()

    def get_quiz_id(self, obj):
        quiz = obj.quizzes.first()
        return quiz.id if quiz else None

    def get_certificate_url(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            from .models import Certificate
            cert = Certificate.objects.filter(user=request.user, course=obj.course, module=obj).first()
            if cert and cert.pdf_file:
                return f"/api/courses/certificates/download/{cert.uuid}/"
        return None


class ReviewSerializer(serializers.ModelSerializer):
    """Student review with user details."""

    username = serializers.CharField(source="user.username", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    full_name = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ["id", "username", "first_name", "last_name", "full_name", "avatar", "rating", "comment", "is_approved", "created_at"]
        read_only_fields = ["id", "username", "first_name", "last_name", "full_name", "avatar", "is_approved", "created_at"]

    def get_full_name(self, obj):
        from .utils import user_display_name
        return user_display_name(obj.user)

    def get_avatar(self, obj):
        from .utils import resolve_user_avatar_url
        return resolve_user_avatar_url(obj.user, request=self.context.get("request"))


class CourseListSerializer(serializers.ModelSerializer):
    """Compact course card data for listing pages."""

    enrollment_count = serializers.IntegerField(read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)
    total_duration_minutes = serializers.IntegerField(read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    instructor_name = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    is_past_paper = serializers.SerializerMethodField()
    past_paper_component = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "subtitle", "thumbnail",
            "price_ugx", "original_price_ugx", "discount_percent",
            "level", "category", "language",
            "instructor_name",
            "enrollment_count", "total_lessons", "total_duration_minutes",
            "avg_rating", "total_reviews",
            "is_bestseller", "updated_at", "is_enrolled",
            "is_past_paper", "past_paper_component",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from django.core.cache import cache
        from api.models import Profile
        self._cached_profile = cache.get('site_profile')
        if not self._cached_profile:
            self._cached_profile = Profile.objects.order_by("-updated_at").first()
            if self._cached_profile:
                cache.set('site_profile', self._cached_profile, 3600)

    def get_instructor_name(self, obj):
        if obj.instructor_name and obj.instructor_name != "Peter Gordon Ekebu":
            return obj.instructor_name
        return self._cached_profile.full_name if self._cached_profile else obj.instructor_name

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            if request.user.is_staff:
                return True
            return Enrollment.objects.filter(user=request.user, course=obj).exists()
        return False

    def get_thumbnail(self, obj):
        if obj.thumbnail_upload:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail_upload.url)
            return obj.thumbnail_upload.url
        return obj.thumbnail

    def get_is_past_paper(self, obj):
        return hasattr(obj, "past_paper")

    def get_past_paper_component(self, obj):
        paper = getattr(obj, "past_paper", None)
        return paper.component_code if paper else None



class CourseDetailSerializer(serializers.ModelSerializer):
    """Full course detail for the landing page."""

    modules = serializers.SerializerMethodField()
    enrollment_count = serializers.IntegerField(read_only=True)
    total_lessons = serializers.IntegerField(read_only=True)
    total_duration_minutes = serializers.IntegerField(read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    total_reviews = serializers.IntegerField(read_only=True)
    discount_percent = serializers.IntegerField(read_only=True)
    is_enrolled = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()
    rating_distribution = serializers.SerializerMethodField()
    instructor_name = serializers.SerializerMethodField()
    instructor_bio = serializers.SerializerMethodField()
    instructor_avatar = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    preview_video_url = serializers.SerializerMethodField()
    is_past_paper = serializers.SerializerMethodField()
    past_paper_summary = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "subtitle", "description",
            "what_you_learn", "requirements", "who_is_for",
            "price_ugx", "original_price_ugx", "discount_percent",
            "thumbnail", "preview_video_url",
            "language", "level", "category",
            "instructor_name", "instructor_bio", "instructor_avatar",
            "is_published", "is_bestseller",
            "enrollment_count", "total_lessons", "total_duration_minutes",
            "avg_rating", "total_reviews", "rating_distribution",
            "is_enrolled", "progress_percent",
            "modules",
            "created_at", "updated_at",
            "is_past_paper", "past_paper_summary",
        ]

    def get_modules(self, obj):
        modules = obj.modules.all()
        if not request_is_instructor_or_admin(self.context.get("request")):
            modules = modules.filter(is_visible=True)
        return ModuleSerializer(modules, many=True, context=self.context).data

    def get_is_past_paper(self, obj):
        return hasattr(obj, "past_paper")

    def get_past_paper_summary(self, obj):
        paper = getattr(obj, "past_paper", None)
        if not paper:
            return None
        solution = getattr(paper, "instructor_solution", None)
        authorised_materials = paper.materials.filter(
            is_authorised=True,
            material_type__in=["question_paper", "mark_scheme"],
        ).count()
        question_count = len(paper.question_structure or [])
        return {
            "year": paper.exam_year,
            "series": paper.get_exam_series_display(),
            "component_code": paper.component_code,
            "paper_number": paper.paper_number,
            "variant": paper.variant or None,
            "level": paper.level,
            "question_count": question_count,
            "materials_ready": authorised_materials >= 2,
            "solution_status": getattr(solution, "status", None) or "not_started",
            "solution_ready": bool(
                solution and solution.status == "approved"
            ),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        from django.core.cache import cache
        from api.models import Profile
        self._cached_profile = cache.get('site_profile')
        if not self._cached_profile:
            self._cached_profile = Profile.objects.order_by("-updated_at").first()
            if self._cached_profile:
                cache.set('site_profile', self._cached_profile, 3600)

    def get_instructor_name(self, obj):
        if obj.instructor_name and obj.instructor_name != "Peter Gordon Ekebu":
            return obj.instructor_name
        return self._cached_profile.full_name if self._cached_profile else obj.instructor_name

    def get_instructor_bio(self, obj):
        if obj.instructor_bio:
            return obj.instructor_bio
        return self._cached_profile.leadership_philosophy if self._cached_profile else ""

    def get_instructor_avatar(self, obj):
        if obj.instructor_avatar:
            return obj.instructor_avatar
        if self._cached_profile and self._cached_profile.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(self._cached_profile.avatar.url)
            return self._cached_profile.avatar.url
        return None

    def get_is_enrolled(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            if request.user.is_staff:
                return True
            return Enrollment.objects.filter(user=request.user, course=obj).exists()
        return False

    def get_progress_percent(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(user=request.user, course=obj).first()
            if enrollment:
                return enrollment.progress_percent
        return 0

    def get_rating_distribution(self, obj):
        """Returns count of approved reviews for each star rating (1-5)."""
        distribution = {}
        for i in range(1, 6):
            distribution[str(i)] = obj.reviews.filter(rating=i).count()
        return distribution

    def get_thumbnail(self, obj):
        if obj.thumbnail_upload:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.thumbnail_upload.url)
            return obj.thumbnail_upload.url
        return obj.thumbnail

    def get_preview_video_url(self, obj):
        if obj.preview_video_upload:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.preview_video_upload.url)
            return obj.preview_video_upload.url
        return getattr(obj, 'preview_video_url', None)

class CourseLearnSerializer(serializers.ModelSerializer):
    """Full course content for enrolled students (includes video URLs)."""

    def get_user_cohorts(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            from django.db.models import Q

            user = request.user
            # Staff / course instructor see every cohort; others see allocated ones only
            is_staff_or_inst = bool(
                user.is_superuser
                or user.is_staff
                or obj.assigned_instructor_id == user.id
                or getattr(user, "is_instructor", False)
                or user.groups.filter(name="Instructors").exists()
                or obj.cohorts.filter(instructors=user).exists()
            )
            if is_staff_or_inst:
                cohorts = obj.cohorts.all()
            else:
                cohorts = obj.cohorts.filter(
                    Q(students=user) | Q(instructors=user)
                ).distinct()
                if not cohorts.exists() and obj.cohorts.exists():
                    cohorts = obj.cohorts.all()[:1]

            result = []
            for cohort in cohorts:
                schedules = []
                is_cohort_instructor = (
                    is_staff_or_inst
                    or cohort.instructors.filter(id=user.id).exists()
                )
                for s in cohort.schedules.all().order_by('date', 'start_time'):
                    schedules.append({
                        "id": s.id,
                        "lesson_id": s.lesson_id,
                        "lesson_title": s.lesson.title if s.lesson else (s.custom_title or ("Half Term Break" if s.activity_type == 'half_term_break' else "Holiday / Event")),
                        "lesson_order": s.lesson.order if s.lesson else None,
                        "date": s.date.isoformat() if s.date else None,
                        "start_time": s.start_time.strftime("%H:%M") if s.start_time else None,
                        "end_time": s.end_time.strftime("%H:%M") if s.end_time else None,
                        "live_class_url": s.live_class_url,
                        "status": s.status,
                        "activity_type": getattr(s, 'activity_type', 'core_lesson'),
                        "custom_title": getattr(s, 'custom_title', '') or "",
                        "term": getattr(s, 'term', 'term_1'),
                        "instructor_notes": s.instructor_notes if is_cohort_instructor else ""
                    })
                instructors = [{"name": f"{i.first_name} {i.last_name}".strip() or i.username} for i in cohort.instructors.all()]
                t_roster = getattr(cohort, 'tinkercad_roster', {}) or {}
                my_nick = ""
                if isinstance(t_roster, dict) and "students" in t_roster:
                    for s_item in t_roster.get("students", []):
                        if s_item.get("user_id") == user.id or (user.username and str(s_item.get("username", "")).lower() == user.username.lower()):
                            my_nick = s_item.get("nickname", "")
                            break
                        if user.first_name and s_item.get("name", "").lower() == f"{user.first_name} {user.last_name}".strip().lower():
                            my_nick = s_item.get("nickname", "")
                            break
                result.append({
                    "id": cohort.id,
                    "name": cohort.name,
                    "start_date": cohort.start_date.isoformat() if cohort.start_date else None,
                    "end_date": cohort.end_date.isoformat() if cohort.end_date else None,
                    "schedule_days": cohort.schedule_days or [],
                    "schedule_time": cohort.schedule_time.strftime("%H:%M") if cohort.schedule_time else None,
                    "schedule_end_time": cohort.schedule_end_time.strftime("%H:%M") if cohort.schedule_end_time else None,
                    "lessons_per_session": cohort.lessons_per_session or 1,
                    "holidays": cohort.holidays or [],
                    "tinkercad_class_code": getattr(cohort, 'tinkercad_class_code', "") or "",
                    "tinkercad_roster": t_roster,
                    "my_tinkercad_nickname": my_nick,
                    "current_term": getattr(cohort, 'current_term', "term_1"),
                    "terms_config": getattr(cohort, 'terms_config', {}),
                    "schedules": schedules,
                    "instructors": instructors
                })
            return result
        return []

    modules = serializers.SerializerMethodField()
    completed_lesson_ids = serializers.SerializerMethodField()
    progress_percent = serializers.SerializerMethodField()
    video_progress = serializers.SerializerMethodField()
    total_lessons = serializers.IntegerField(read_only=True)
    certificate_url = serializers.SerializerMethodField()
    quiz_attempts = serializers.SerializerMethodField()
    user_xp = serializers.SerializerMethodField()
    user_cohorts = serializers.SerializerMethodField()

    has_textbooks = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = [
            "id", "title", "slug", "offline_archive", "allow_self_pairing",
            "modules", "completed_lesson_ids", "progress_percent", "video_progress", "total_lessons", "certificate_url",
            "quiz_attempts", "user_xp", "user_cohorts", "has_textbooks"
        ]

    def get_has_textbooks(self, obj):
        slug = (obj.slug or "").lower()
        title = (obj.title or "").lower()
        if "9626" in slug or "9626" in title or "cambridge" in slug or "cambridge" in title or "information-technology" in slug:
            return True
        return False

    def get_modules(self, obj):
        request = self.context.get("request")
        modules = obj.modules.all()
        if not request_is_instructor_or_admin(request):
            modules = modules.filter(is_visible=True)
        enrollment = None
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(user=request.user, course=obj).first()
            
        if enrollment and enrollment.max_modules is not None:
            allowed_modules = list(modules[:enrollment.max_modules])
            self.context['allowed_module_ids'] = [m.id for m in allowed_modules]
            self.context['is_partial_enrollment'] = True
            
        return ModuleDetailSerializer(modules, many=True, context=self.context).data

    def get_completed_lesson_ids(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(user=request.user, course=obj).first()
            if enrollment:
                return list(enrollment.completed_lessons.values_list("id", flat=True))
        return []

    def get_certificate_url(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            from .models import Certificate
            cert = Certificate.objects.filter(user=request.user, course=obj, module__isnull=True).first()
            if cert and cert.pdf_file:
                return f"/api/courses/certificates/download/{cert.uuid}/"
        return None

    def get_progress_percent(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            enrollment = Enrollment.objects.filter(user=request.user, course=obj).first()
            if enrollment:
                return enrollment.progress_percent
        return 0

    def get_video_progress(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            from .models import VideoProgress
            progresses = VideoProgress.objects.filter(user=request.user, lesson__module__course=obj)
            return {p.lesson_id: p.timestamp_seconds for p in progresses}
        return {}

    def get_quiz_attempts(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            from .models import QuizAttempt
            from django.db.models import Q
            attempts = QuizAttempt.objects.filter(
                Q(user=request.user) & 
                (Q(quiz__module__course=obj) | Q(quiz__lesson__module__course=obj))
            )
            result = {}
            for attempt in attempts:
                qid = attempt.quiz_id
                if qid not in result:
                    result[qid] = {"best_score": attempt.score, "passed": attempt.passed, "attempts_count": 1}
                else:
                    result[qid]["attempts_count"] += 1
                    if attempt.score > result[qid]["best_score"]:
                        result[qid]["best_score"] = attempt.score
                    if attempt.passed:
                        result[qid]["passed"] = True
            return result
        return {}

    def get_user_xp(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            try:
                from .xp_utils import get_or_create_course_xp, serialize_xp_total, sum_course_xp
                from django.db.models import Q
                cohort_id = request.query_params.get("cohort_id") if hasattr(request, "query_params") else None
                cohort = None
                if cohort_id:
                    if request.user.is_staff or request.user.is_superuser:
                        cohort = obj.cohorts.filter(id=cohort_id).first()
                    else:
                        cohort = obj.cohorts.filter(id=cohort_id).filter(Q(students=request.user) | Q(instructors=request.user)).first()
                if not cohort:
                    cohort = request.user.enrolled_cohorts.filter(course=obj).first()
                get_or_create_course_xp(request.user, obj, cohort=cohort)
                return serialize_xp_total(sum_course_xp(request.user.id, obj.id, cohort=cohort))
            except Exception:
                pass
        return None

class EnrollmentSerializer(serializers.ModelSerializer):
    """Enrollment record with progress info."""

    course_title = serializers.CharField(source="course.title", read_only=True)
    course_slug = serializers.CharField(source="course.slug", read_only=True)
    course_thumbnail = serializers.URLField(source="course.thumbnail", read_only=True)
    progress_percent = serializers.IntegerField(read_only=True)

    class Meta:
        model = Enrollment
        fields = [
            "id", "course_title", "course_slug", "course_thumbnail",
            "enrolled_at", "progress_percent",
        ]

class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        from .models import Currency
        model = Currency
        fields = ["code", "symbol", "exchange_rate_to_ugx"]

class UserXPSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserXP
        fields = ["total_xp", "level", "level_title"]

class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import StudySession
        model = StudySession
        fields = ['id', 'elapsed_seconds', 'is_active', 'target_minutes', 'last_ping']


class StudentProjectSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source="lesson.title", read_only=True)
    course_title = serializers.CharField(source="lesson.module.course.title", read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = StudentProject
        fields = ["id", "name", "file", "file_url", "lesson", "lesson_title", "course_title", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "lesson_title", "course_title", "file_url"]

    def get_file_url(self, obj):
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None

class CourseEnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.SerializerMethodField()
    student_avatar = serializers.SerializerMethodField()
    method = serializers.SerializerMethodField()
    progress_percent = serializers.ReadOnlyField()
    cohort_name = serializers.SerializerMethodField()
    cohort_names = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "student_name",
            "student_email",
            "student_avatar",
            "enrolled_at",
            "method",
            "progress_percent",
            "cohort_name",
            "cohort_names",
            "user", # added user ID for actions
        ]

    def get_cohort_name(self, obj):
        try:
            cohorts = [c.name for c in obj.user.enrolled_cohorts.all() if c.course_id == obj.course_id]
            return ", ".join(cohorts) if cohorts else None
        except Exception:
            return None

    def get_cohort_names(self, obj):
        try:
            return [c.name for c in obj.user.enrolled_cohorts.all() if c.course_id == obj.course_id]
        except Exception:
            return []

    def get_student_name(self, obj):
        try:
            middle = obj.user.profile.middle_name
        except Exception:
            middle = ""
        parts = [obj.user.first_name, middle, obj.user.last_name]
        return " ".join([p.strip() for p in parts if p and p.strip()]) or obj.user.username

    def get_student_email(self, obj):
        return obj.user.email
        
    def get_student_avatar(self, obj):
        from .utils import resolve_user_avatar_url
        return resolve_user_avatar_url(obj.user, request=self.context.get("request")) or ""

    def get_method(self, obj):
        from .models import CoursePayment, Coupon
        from django.db.models import Q
        payment = CoursePayment.objects.filter(user=obj.user, course=obj.course).first()
        if payment:
            if payment.coupon:
                return f"Coupon ({payment.coupon.code})"
            return "Purchase (Pesapal)"
            
        coupon = Coupon.objects.filter(used_by=obj.user).filter(
            Q(applicable_courses=obj.course) | Q(applicable_courses__isnull=True)
        ).first()
        if coupon:
            return f"Coupon ({coupon.code})"
            
        return "Manual/Admin Assigned"
