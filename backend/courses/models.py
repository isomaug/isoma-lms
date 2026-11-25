from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.utils import timezone
from datetime import timedelta
from django.db.models.signals import post_save
from django.dispatch import receiver
import uuid
from api.utils import compress_image

class Course(models.Model):
    """Represents a complete learning curriculum."""

    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
        ("all", "All Levels"),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True, max_length=255)
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="owned_courses",
        help_text="The creator and owner of this course."
    )
    assigned_instructor = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name="assigned_courses",
        help_text="The instructor assigned to manage this course."
    )
    subtitle = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True, help_text="Full course description (supports markdown)")
    what_you_learn = models.JSONField(
        default=list, blank=True, help_text="List of learning outcome strings"
    )
    requirements = models.JSONField(
        default=list, blank=True, help_text="List of prerequisite strings"
    )
    who_is_for = models.JSONField(
        default=list, blank=True, help_text="List of target audience strings"
    )
    price_ugx = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    original_price_ugx = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Original price for discount display (crossed-out)"
    )
    thumbnail = models.URLField(blank=True, help_text="Course card thumbnail URL (Paste link here)")
    thumbnail_upload = models.ImageField(
        upload_to="course_thumbnails/", 
        blank=True, 
        null=True,
        help_text="OR upload a thumbnail file. If uploaded, this will override the pasted link above."
    )
    preview_video_url = models.URLField(
        blank=True, help_text="Free preview video URL for landing page (Paste link here)"
    )
    preview_video_upload = models.FileField(
        upload_to="course_videos/", 
        blank=True, 
        null=True,
        help_text="OR upload a video file. If uploaded, this will override the pasted link above."
    )
    language = models.CharField(max_length=50, default="English")
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="all")
    category = models.CharField(max_length=100, blank=True, help_text="e.g. Web Development, Data Science")
    is_published = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False, help_text="Soft deletion flag")
    deleted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="deleted_courses")
    deleted_at = models.DateTimeField(null=True, blank=True)
    offline_archive = models.FileField(
        upload_to="course_archives/", 
        blank=True, 
        help_text="Upload a .zip of all course materials for the 'Download Full Course' button."
    )
    certificate_signature = models.ImageField(
        upload_to="course_signatures/",
        blank=True,
        null=True,
        help_text="Upload instructor signature image (PNG with transparent background recommended)"
    )
    certificate_seal = models.ImageField(
        upload_to="course_seals/",
        blank=True,
        null=True,
        help_text="Upload certificate seal/badge image"
    )
    instructor_name = models.CharField(max_length=200, default="Peter Gordon Ekebu")
    instructor_bio = models.TextField(blank=True)
    instructor_avatar = models.URLField(blank=True)
    allow_self_pairing = models.BooleanField(default=False, help_text="Allow students to invite partners themselves. If false, instructors must assign pairs.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    @property
    def enrollment_count(self):
        return self.enrollments.count()

    @property
    def total_lessons(self):
        return sum(m.lessons.count() for m in self.modules.all())

    @property
    def total_duration_minutes(self):
        total = 0
        for module in self.modules.all():
            for lesson in module.lessons.all():
                total += lesson.duration_minutes or 0
        return total

    @property
    def avg_rating(self):
        reviews = self.reviews.all()
        if not reviews.exists():
            return 0
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)

    @property
    def total_reviews(self):
        return self.reviews.count()

    @property
    def discount_percent(self):
        if self.original_price_ugx and self.original_price_ugx > 0:
            return round(
                (1 - float(self.price_ugx) / float(self.original_price_ugx)) * 100
            )
        return 0

    def save(self, *args, **kwargs):
        if self.thumbnail_upload and not getattr(self.thumbnail_upload, '_committed', False):
            self.thumbnail_upload = compress_image(self.thumbnail_upload, max_width=1200)
        super().save(*args, **kwargs)


class Module(models.Model):
    """Groups related lessons (Udemy calls these Sections)."""

    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=200)
    order = models.PositiveIntegerField(default=0)
    week = models.PositiveIntegerField(null=True, blank=True, help_text="The week number this module belongs to")
    is_visible = models.BooleanField(
        default=False, help_text="Show this module/week to students"
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    """Individual lecture within a module."""

    PLAYGROUND_CHOICES = [
        ("", "None"),
        ("scratchjr", "Stack KIDI"),
        ("scratch", "Scratch"),
        ("makecode_microbit", "MakeCode micro:bit"),
        ("makecode_arcade", "MakeCode Arcade"),
        ("wokwi_arduino", "Wokwi Arduino"),
        ("wokwi_esp32", "Wokwi ESP32"),
        ("tinkercad", "TinkerCAD Circuits"),
        ("custom", "Custom URL"),
    ]

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    video_url = models.URLField(blank=True, help_text="YouTube Unlisted or Vimeo private embed URL")
    offline_video = models.FileField(
        upload_to="course_videos/", 
        blank=True, 
        help_text="Upload the .mp4 file. It will automatically save to S3."
    )
    duration_minutes = models.PositiveIntegerField(
        default=0, help_text="Length in minutes"
    )
    content = models.TextField(blank=True, help_text="Lesson plan (visible only to Instructors/Admins)")
    overview = models.TextField(blank=True, help_text="Objectives and high-level brief details (visible to students)")
    lesson_text = models.TextField(blank=True, help_text="Detailed text version of the lesson with images (visible to students)")
    video_script = models.TextField(blank=True, help_text="Narration script for the video (visible to students and instructors)")
    order = models.PositiveIntegerField(default=0)
    is_preview = models.BooleanField(
        default=False, help_text="If true, viewable without purchase"
    )
    is_visible = models.BooleanField(
        default=False, help_text="Show this lesson/week to students"
    )
    # Playground / Coding Editor fields
    playground_type = models.CharField(
        max_length=30, blank=True, choices=PLAYGROUND_CHOICES, default="",
        help_text="Select a coding editor for this lesson"
    )
    playground_custom_url = models.URLField(
        blank=True, help_text="Only used when playground type is 'Custom URL'"
    )
    playground_starter_file = models.FileField(
        upload_to="playground_starters/", blank=True,
        help_text="Upload a starter project file (.sb3, .hex, etc.) for students to download and load"
    )
    google_doc_url = models.URLField(
        blank=True, 
        help_text="Link to the Master Google Doc for generating customized lesson plans"
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.module.title} - {self.title}"


class LessonMaterial(models.Model):
    """Downloadable files attached to a lesson (e.g., PDFs, Word docs)"""
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="materials")
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to="lesson_materials/")
    is_instructor_only = models.BooleanField(default=False, help_text="Hide from students, show only to instructors")
    
    def __str__(self):
        return f"{self.lesson.title} - {self.title}"


class StudentProject(models.Model):
    """Student-uploaded project files from coding playgrounds, saved to S3."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="playground_projects")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="student_projects")
    name = models.CharField(max_length=200)
    file = models.FileField(upload_to="student_projects/")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class LessonAssignment(models.Model):
    """Assignment, worksheet, or design brief attached to a lesson."""
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="assignments")
    title = models.CharField(max_length=255, default="Lesson Assignment & Design Brief")
    description = models.TextField(blank=True)
    instructions = models.TextField(blank=True)
    questions = models.JSONField(
        default=list,
        blank=True,
        help_text="Structured question sections: [{'id': 'q1', 'title': '1. Problem Statement', 'prompt': '...'}]"
    )
    max_score = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.lesson.title} - {self.title}"


class LessonAssignmentSubmission(models.Model):
    """Student submission for a lesson assignment, viewable and markable by teachers."""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
    ]
    assignment = models.ForeignKey(LessonAssignment, on_delete=models.CASCADE, related_name="submissions")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="lesson_submissions")
    cohort = models.ForeignKey('Cohort', on_delete=models.SET_NULL, null=True, blank=True, related_name="assignment_submissions")
    paired_student = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="paired_lesson_submissions",
        help_text="Partner student if worked in pairs"
    )
    content = models.TextField(blank=True, help_text="Full compiled Word-style document writeup")
    answers = models.JSONField(default=dict, blank=True, help_text="Dictionary of answers keyed by question ID")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    score = models.PositiveIntegerField(null=True, blank=True)
    feedback = models.TextField(blank=True)
    graded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="graded_assignments")
    graded_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['assignment', 'student']
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.student.username} - {self.assignment.title} ({self.status})"


class Enrollment(models.Model):
    """Tracks user access and course completion progress."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    enrolled_at = models.DateTimeField(auto_now_add=True)
    last_reminded_at = models.DateTimeField(null=True, blank=True)
    completed_lessons = models.ManyToManyField(Lesson, blank=True)
    max_modules = models.PositiveIntegerField(null=True, blank=True, help_text="Limits access to the first N modules. If null, access is unrestricted.")
    is_active = models.BooleanField(default=True, help_text="If false, the student has unenrolled, but data is preserved.")

    class Meta:
        unique_together = ["user", "course"]
        ordering = ["-enrolled_at"]

    def __str__(self):
        return f"{self.user.username} enrolled in {self.course.title}"

    @property
    def progress_percent(self):
        total = self.course.total_lessons
        if total == 0:
            return 0
        return round(self.completed_lessons.count() / total * 100)


class LessonPairing(models.Model):
    """Tracks temporary pair programming sessions (Driver & Navigator) for a single computer."""
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="pairings")
    host_student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="hosted_sessions")
    partner_student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="partnered_sessions")
    current_driver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="driving_sessions")
    instructor_assigned = models.BooleanField(default=True)
    pair_code = models.CharField(max_length=6, blank=True, null=True, db_index=True)
    change_requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="pair_change_requests")
    change_status = models.CharField(max_length=20, default="none", choices=[
        ("none", "None"),
        ("pending", "Pending Teacher Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ])
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ["lesson", "host_student", "partner_student"]

    def __str__(self):
        return f"{self.host_student.username} & {self.partner_student.username} in {self.lesson.title}"


class LessonPairRequest(models.Model):
    """Pending partner invitation or matchmaking queue request."""
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="pair_requests")
    cohort = models.ForeignKey('Cohort', on_delete=models.CASCADE, null=True, blank=True, related_name="pair_requests")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_pair_requests")
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name="received_pair_requests")
    pair_code = models.CharField(max_length=6, blank=True, null=True, db_index=True)
    is_open_match = models.BooleanField(default=False, help_text="True if waiting for any available classmate on this lesson.")
    status = models.CharField(max_length=20, default="pending", choices=[
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
        ("expired", "Expired"),
    ])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        target = self.recipient.username if self.recipient else (f"Code {self.pair_code}" if self.pair_code else "Open Match")
        return f"{self.sender.username} -> {target} ({self.lesson.title}) [{self.status}]"



class Review(models.Model):
    """Student review and rating for a course."""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_reviews")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="reviews")
    rating = models.IntegerField(choices=[(i, str(i)) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["user", "course"]
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.course.title} ({self.rating} stars)"


class CoursePayment(models.Model):
    """Tracks Pesapal payment transactions for course purchases."""

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("COMPLETED", "Completed"),
        ("FAILED", "Failed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_payments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name="payments")
    merchant_reference = models.CharField(max_length=100)
    order_tracking_id = models.CharField(max_length=200, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    coupon = models.ForeignKey('Coupon', null=True, blank=True, on_delete=models.SET_NULL, related_name="payments", help_text="The coupon used for this payment, if any.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.course.title} ({self.status})"

class Coupon(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.PositiveIntegerField(default=100, help_text="Percentage off (1-100)")
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateTimeField(null=True, blank=True)
    max_uses = models.PositiveIntegerField(null=True, blank=True)
    current_uses = models.PositiveIntegerField(default=0)
    max_modules = models.PositiveIntegerField(null=True, blank=True, help_text="Limits access to the first N modules when used.")
    applicable_courses = models.ManyToManyField(Course, blank=True)
    used_by = models.ManyToManyField(User, blank=True, related_name="used_coupons")
    allowed_users = models.ManyToManyField(User, blank=True, related_name="allowed_coupons", help_text="If populated, ONLY these specific users can use this coupon. If empty, anyone can use it.")

    def __str__(self):
        return f"{self.code} - {self.discount_percent}% off"

class Certificate(models.Model):
    """Digital certificate awarded upon completion."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="certificates")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="certificates")
    module = models.ForeignKey(Module, on_delete=models.CASCADE, null=True, blank=True, related_name="certificates")
    name_on_certificate = models.CharField(max_length=255, blank=True, help_text="The exact name the student requested to be printed")
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    pdf_file = models.FileField(upload_to="certificates/", null=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    is_approved = models.BooleanField(default=False, help_text="Instructor approval required to issue the certificate.")

    class Meta:
        unique_together = ["user", "course"]

    def __str__(self):
        return f"Certificate: {self.user.username} - {self.course.title}"
        
    def save(self, *args, **kwargs):
        if not self.uuid:
            self.uuid = str(uuid.uuid4())
        super().save(*args, **kwargs)

class VideoProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="video_progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="progress")
    timestamp_seconds = models.PositiveIntegerField(default=0)
    last_watched_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["user", "lesson"]

    def __str__(self):
        return f"{self.user.username} - {self.lesson.title} ({self.timestamp_seconds}s)"

class Currency(models.Model):
    code = models.CharField(max_length=10, unique=True, help_text="e.g. KES, TZS, RWF, USD")
    symbol = models.CharField(max_length=10, help_text="e.g. Ksh, Tsh, RWF, $")
    exchange_rate_to_ugx = models.DecimalField(
        max_digits=10, 
        decimal_places=6, 
        help_text="Multiplier. E.g. if 1 UGX = 0.035 KES, set 0.035. (Price * Rate = Local Amount)"
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Currencies"
        ordering = ["code"]

    def __str__(self):
        return f"{self.code} ({self.symbol}) - Rate: {self.exchange_rate_to_ugx}"

class Quiz(models.Model):
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="quizzes", null=True, blank=True)
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="quizzes", null=True, blank=True)
    title = models.CharField(max_length=200, default="Module Checkpoint")
    description = models.TextField(blank=True, help_text="Brief instructions or intro text")
    passing_score = models.PositiveIntegerField(default=80, help_text="Minimum percentage required to pass")
    points_reward = models.PositiveIntegerField(
        default=50,
        help_text="XP on first-attempt pass. 2nd attempt pass = half, 3rd = 10%, later = 0.",
    )
    time_limit_minutes = models.PositiveIntegerField(null=True, blank=True, help_text="Optional time limit")
    
    def __str__(self):
        course_title = "Unknown"
        if self.module:
            course_title = self.module.course.title
        elif self.lesson and self.lesson.module:
            course_title = self.lesson.module.course.title
        return f"Quiz: {self.title} ({course_title})"

    @property
    def question_count(self):
        return self.questions.count()

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    text = models.TextField(help_text="The question text (supports markdown)")
    explanation = models.TextField(blank=True, help_text="Explanation shown after answering")
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        ordering = ["order"]
        
    def __str__(self):
        return f"{self.quiz.title} - Q{self.order}: {self.text[:30]}..."

class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="choices")
    text = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)
    
    def __str__(self):
        return self.text

class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quiz_attempts")
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="attempts")
    score = models.PositiveIntegerField(default=0, help_text="Percentage score")
    passed = models.BooleanField(default=False)
    answers = models.JSONField(default=dict, help_text="Dictionary of question_id: chosen_choice_id")
    xp_awarded = models.PositiveIntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ["-completed_at"]
        
    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} ({self.score}%)"

class UserXP(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="xp_profiles")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="xps")
    cohort = models.ForeignKey('Cohort', on_delete=models.CASCADE, null=True, blank=True, related_name="xps")
    total_xp = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ["user", "course", "cohort"]
        
    @property
    def level(self):
        xp = self.total_xp
        if xp < 100: return 1
        if xp < 300: return 2
        if xp < 600: return 3
        if xp < 1000: return 4
        return 5
        
    @property
    def level_title(self):
        levels = {
            1: "Getting Started", 
            2: "Making Progress", 
            3: "Good Work", 
            4: "Meets Expectations", 
            5: "Exceeded Expectations"
        }
        return levels.get(self.level, "Exceeded Expectations")
        
    def __str__(self):
        return f"{self.user.username} - Level {self.level} ({self.total_xp} XP)"

class StudySession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="study_sessions")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="study_sessions")
    start_time = models.DateTimeField(auto_now_add=True)
    last_ping = models.DateTimeField(auto_now_add=True)
    elapsed_seconds = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=False)
    target_minutes = models.PositiveIntegerField(default=60)

    class Meta:
        unique_together = ["user", "course"]
        
    def __str__(self):
        return f"{self.user.username} - {self.course.title} - {self.elapsed_seconds}s"

class UserMemory(models.Model):
    CATEGORY_CHOICES = [
        ('preference', 'Preference'),
        ('personal', 'Personal Info'),
        ('academic', 'Academic'),
        ('goal', 'Goal'),
        ('struggle', 'Struggle Area'),
        ('general', 'General'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_memories')
    fact = models.TextField(help_text='A fact or preference the AI learned about the user.')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='general')
    course = models.ForeignKey('Course', on_delete=models.SET_NULL, null=True, blank=True,
                               help_text='The course context in which this was learned.')
    created_at = models.DateTimeField(auto_now_add=True)

    MAX_MEMORIES_PER_USER = 50

    class Meta:
        verbose_name_plural = 'User Memories'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} [{self.category}]: {self.fact[:50]}'

    @classmethod
    def add_memory(cls, user, fact, category='general', course=None):
        """Add a memory, enforcing a per-user cap by evicting the oldest entry."""
        # Prevent near-duplicate facts (case-insensitive substring match)
        existing = cls.objects.filter(user=user)
        for mem in existing:
            if fact.lower().strip() in mem.fact.lower() or mem.fact.lower() in fact.lower().strip():
                # Update the existing fact with the newer, potentially more detailed version
                if len(fact) > len(mem.fact):
                    mem.fact = fact
                    mem.category = category
                    mem.save()
                return mem

        # Enforce memory cap – delete oldest if at limit
        count = existing.count()
        if count >= cls.MAX_MEMORIES_PER_USER:
            oldest = existing.order_by('created_at').first()
            if oldest:
                oldest.delete()

        return cls.objects.create(user=user, fact=fact, category=category, course=course)

class ChatLog(models.Model):
    """Stores all conversations between students and EkebuAI for future fine-tuning."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="chat_logs")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="chat_logs")
    lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True)
    query = models.TextField(help_text="The message sent by the user")
    response = models.TextField(help_text="The response from EkebuAI")
    model_used = models.CharField(max_length=50, default="unknown", help_text="e.g. gemini-2.5-flash or llama-3.3")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} in {self.course.title} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"


class AIConversation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="ai_conversations"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="ai_conversations"
    )
    title = models.CharField(max_length=160, default="New conversation")
    is_archived = models.BooleanField(default=False)
    is_deleted_by_user = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return f"{self.user} - {self.title}"


class AIMessage(models.Model):
    class Role(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"

    conversation = models.ForeignKey(
        AIConversation, on_delete=models.CASCADE, related_name="messages"
    )
    role = models.CharField(max_length=12, choices=Role.choices)
    text = models.TextField()
    response_type = models.CharField(max_length=30, default="text")
    artifact = models.JSONField(default=dict, blank=True)
    model_used = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at", "id"]


class Organization(models.Model):
    ORG_TYPE_CHOICES = [
        ('SCHOOL', 'School'),
        ('NGO', 'NGO'),
        ('GOVERNMENT', 'Government Project'),
        ('CORPORATE', 'Corporate'),
        ('OTHER', 'Other'),
    ]
    name = models.CharField(max_length=255)
    org_type = models.CharField(max_length=20, choices=ORG_TYPE_CHOICES, default='SCHOOL')
    logo = models.ImageField(upload_to='organizations/logos/', blank=True, null=True, help_text="Organization logo")
    contact_email = models.EmailField(blank=True)
    template_doc = models.FileField(upload_to='organizations/templates/', blank=True, null=True, help_text="Upload a .docx template for lesson plans")
    members = models.ManyToManyField('auth.User', blank=True, related_name='organizations')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_org_type_display()})"

class InvoiceTemplate(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to="invoice_logos/", blank=True, null=True)
    primary_color = models.CharField(max_length=20, default="#000000", help_text="Hex color code")
    header_text = models.TextField(blank=True, default="INVOICE")
    footer_text = models.TextField(blank=True, default="Thank you for your business!")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Invoice(models.Model):
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('SENT', 'Sent'),
        ('PAID', 'Paid'),
        ('OVERDUE', 'Overdue'),
        ('CANCELLED', 'Cancelled'),
    ]
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="invoices")
    invoice_number = models.CharField(max_length=50, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField(blank=True, null=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, help_text="Tax rate as a percentage")
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    template = models.ForeignKey(InvoiceTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Optional link to cohort if this invoice is purely for a specific cohort
    cohort = models.ForeignKey('Cohort', on_delete=models.SET_NULL, null=True, blank=True, related_name="invoices")

    def __str__(self):
        return f"{self.invoice_number or 'Draft'} - {self.organization.name}"

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            import uuid
            self.invoice_number = f"INV-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

class InvoiceLineItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    
    @property
    def total_price(self):
        return self.quantity * self.unit_price

    def __str__(self):
        return f"{self.description} ({self.quantity} x {self.unit_price})"

class Cohort(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="cohorts")
    name = models.CharField(max_length=200) # e.g., "Stage 1 - Holiday Batch"
    start_date = models.DateField()
    end_date = models.DateField()
    capacity_limit = models.PositiveIntegerField(null=True, blank=True)
    location = models.CharField(max_length=255, blank=True)
    price_override = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    instructors = models.ManyToManyField(User, related_name="instructed_cohorts")
    students = models.ManyToManyField(User, related_name="enrolled_cohorts", blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name="cohorts")
    academic_year = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., 2026/2027")
    stream = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., S, U")
    grade = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., 1, 2")
    year_of_course = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., Year 1, Year 2")
    fixed_costs = models.DecimalField(max_digits=12, decimal_places=2, default=6431350, help_text="Total fixed costs for this cohort in UGX")
    variable_cost_per_learner = models.DecimalField(max_digits=10, decimal_places=2, default=28000, help_text="Variable cost per learner in UGX")
    allow_students_to_see_classmates = models.BooleanField(default=False, help_text="Allow students in this cohort to see each other.")
    show_classmate_xps = models.BooleanField(default=False, help_text="Allow students in this cohort to see each other's XP.")
    is_pairing_active = models.BooleanField(default=False, help_text="Is a pair programming session currently active for this cohort?")
    is_closed = models.BooleanField(default=False, help_text="Indicates if the cohort has graduated/closed.")
    schedule_days = models.JSONField(default=list, blank=True, help_text="Weekday numbers when lessons happen (0=Mon, 6=Sun). E.g. [0,2,4] = Mon/Wed/Fri")
    schedule_time = models.TimeField(null=True, blank=True, help_text="Optional lesson start time. Leave blank if class may start any time.")
    schedule_end_time = models.TimeField(null=True, blank=True, help_text="Class must finish by this time, e.g. 10:00")
    lessons_per_session = models.PositiveIntegerField(default=1, help_text="How many lessons are covered per class session")
    holidays = models.JSONField(
        default=list,
        blank=True,
        help_text='Skip days for timetable generation. Items: {"date": "YYYY-MM-DD", "label": "Sports Day"} (legacy plain date strings still accepted).',
    )
    terms_config = models.JSONField(
        default=dict,
        blank=True,
        help_text="Per-term configuration for term_1, term_2, term_3 (dates, half_term_break, holidays, schedule_days).",
    )
    current_term = models.CharField(
        max_length=20,
        default="term_1",
        help_text="The currently active term for this cohort (e.g. term_1, term_2, term_3).",
    )
    tinkercad_class_code = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Autodesk Tinkercad Classroom code or join URL for this cohort (e.g. 3K9W-8M7P-2Q4Z or https://www.tinkercad.com/joinclass/...).",
    )
    tinkercad_roster = models.JSONField(
        default=dict,
        blank=True,
        help_text="Extracted Tinkercad roster map (students, nicknames, join codes).",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.course.title})"

class DeviceAssignment(models.Model):
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name="device_assignments")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="device_assignments")
    device_name = models.CharField(max_length=100, help_text="Name or ID of the assigned device/computer (e.g., PC-01)")
    assigned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["cohort", "student"]

    def __str__(self):
        return f"{self.student.username} on {self.device_name} ({self.cohort.name})"

class CohortTeam(models.Model):
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name="teams")
    name = models.CharField(max_length=200)
    team_leader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="led_teams")
    students = models.ManyToManyField(User, related_name="cohort_teams", blank=True)
    change_requests = models.ManyToManyField(User, related_name="cohort_team_change_requests", blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="created_teams")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.cohort.name} - {self.name}"

class StudentAttendance(models.Model):
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name="attendance_records")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendance_records")
    date = models.DateField()
    is_present = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['cohort', 'student', 'date']

    def __str__(self):
        status = "Present" if self.is_present else "Absent"
        return f"{self.student.username} - {self.cohort.name} - {self.date} ({status})"

class CohortLessonSchedule(models.Model):
    SCHEDULE_STATUS_CHOICES = [
        ('scheduled', 'Scheduled'),
        ('taught', 'Taught'),
        ('missed', 'Missed'),
        ('postponed', 'Postponed'),
        ('covered', 'Covered After Postponement'),
    ]
    ACTIVITY_TYPE_CHOICES = [
        ('core_lesson', 'Core Lesson'),
        ('capstone', 'Capstone Project'),
        ('half_term_break', 'Half Term Break'),
        ('holiday', 'Holiday / Event'),
    ]

    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name="schedules")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, null=True, blank=True)
    custom_title = models.CharField(max_length=255, blank=True, help_text="Custom title if not mapped to a standard lesson")
    term = models.CharField(max_length=20, default="term_1", db_index=True)
    activity_type = models.CharField(max_length=30, choices=ACTIVITY_TYPE_CHOICES, default='core_lesson')
    date = models.DateField()
    start_time = models.TimeField(null=True, blank=True, help_text="Optional start time. Blank means class may start any time.")
    end_time = models.TimeField(null=True, blank=True, help_text="Class ends by this time, e.g. 10:00")
    live_class_url = models.URLField(blank=True, null=True)
    instructor_notes = models.TextField(blank=True, help_text="Private notes for the instructor about this lesson session")
    status = models.CharField(max_length=20, choices=SCHEDULE_STATUS_CHOICES, default='scheduled')

    class Meta:
        ordering = ["date", "start_time", "end_time"]

    def __str__(self):
        if self.start_time and self.end_time:
            time_str = f" {self.start_time.strftime('%H:%M')}–{self.end_time.strftime('%H:%M')}"
        elif self.end_time:
            time_str = f" ends {self.end_time.strftime('%H:%M')}"
        elif self.start_time:
            time_str = f" at {self.start_time.strftime('%H:%M')}"
        else:
            time_str = ""
        lesson_label = self.lesson.title if self.lesson else (self.custom_title or "No Lessons")
        return f"{self.cohort.name} - {lesson_label} on {self.date}{time_str}"

class CorporateSponsor(models.Model):
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to="sponsors/logos/", blank=True, null=True)
    contact_email = models.EmailField(blank=True)
    total_budget = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Total sponsorship budget in UGX")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class CourseScholarship(models.Model):
    sponsor = models.ForeignKey(CorporateSponsor, on_delete=models.CASCADE, related_name="scholarships")
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="course_scholarships")
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name="scholarships")
    amount_subsidized = models.DecimalField(max_digits=10, decimal_places=2, help_text="Amount paid by the sponsor in UGX")
    date_awarded = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} sponsored by {self.sponsor.name}"


class UserSubscription(models.Model):
    """Tracks EkebuAI Pro subscriptions and duration passes."""
    PLAN_CHOICES = [
        ("MONTHLY", "1 Month Pass (15,000 UGX)"),
        ("QUARTERLY", "3 Month Pass (40,000 UGX)"),
        ("ANNUAL", "1 Year Pass (120,000 UGX)"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="ai_subscription")
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, default="MONTHLY")
    start_date = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    merchant_reference = models.CharField(max_length=100, blank=True)

    def is_valid(self):
        from django.utils import timezone
        return self.is_active and timezone.now() < self.expires_at

    def __str__(self):
        status_str = "Active" if self.is_valid() else "Expired"
        return f"{self.user.username} - EkebuAI Pro ({self.plan}) [{status_str}]"


class DailyAIUsage(models.Model):
    """Tracks daily AI query count per user."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="daily_ai_usage")
    date = models.DateField(default=timezone.now)
    query_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ["user", "date"]

    def __str__(self):
        return f"{self.user.username} - {self.query_count} queries on {self.date}"


class AIImageArtifact(models.Model):
    class Status(models.TextChoices):
        PROCESSING = "processing", "Processing"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="ai_image_artifacts"
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_image_artifacts",
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="edits",
    )
    prompt = models.TextField()
    improved_prompt = models.TextField(blank=True)
    edit_instruction = models.TextField(blank=True)
    image = models.ImageField(upload_to="ai_images/%Y/%m/", blank=True)
    mime_type = models.CharField(max_length=40, default="image/png")
    provider_model = models.CharField(max_length=80, blank=True)
    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.PROCESSING
    )
    error_message = models.CharField(max_length=240, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"EkebuAI image {self.pk} for {self.user}"


class PastPaper(models.Model):
    class Series(models.TextChoices):
        MARCH = "march", "February/March"
        JUNE = "june", "May/June"
        NOVEMBER = "november", "October/November"

    class Status(models.TextChoices):
        PLANNED = "planned", "Planned"
        SOURCE_REQUIRED = "source_required", "Source required"
        DRAFTING = "drafting", "Drafting"
        REVIEW_REQUIRED = "review_required", "Review required"
        READY = "ready", "Ready"
        PUBLISHED = "published", "Published"
        NOT_AVAILABLE = "not_available", "Not available"
        FUTURE = "future", "Future"

    course = models.OneToOneField(
        Course,
        on_delete=models.CASCADE,
        related_name="past_paper",
        null=True,
        blank=True,
    )
    board = models.CharField(max_length=50, default="cambridge")
    qualification = models.CharField(max_length=80, default="as_a_level")
    subject = models.CharField(max_length=150)
    syllabus_code = models.CharField(max_length=20)
    syllabus_era = models.CharField(max_length=30, blank=True)
    exam_year = models.PositiveSmallIntegerField()
    exam_series = models.CharField(max_length=12, choices=Series.choices)
    paper_number = models.PositiveSmallIntegerField()
    variant = models.PositiveSmallIntegerField()
    component_code = models.CharField(max_length=8)
    level = models.CharField(max_length=30)
    seed_key = models.CharField(max_length=180, unique=True)
    status = models.CharField(
        max_length=24, choices=Status.choices, default=Status.PLANNED
    )
    source_verified = models.BooleanField(default=False)
    question_structure = models.JSONField(default=list, blank=True)
    last_seeded_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = [
            "-exam_year",
            "exam_series",
            "paper_number",
            "variant",
        ]
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "board",
                    "qualification",
                    "syllabus_code",
                    "exam_year",
                    "exam_series",
                    "paper_number",
                    "variant",
                ],
                name="unique_past_paper_component",
            )
        ]

    def __str__(self):
        return (
            f"{self.syllabus_code}/{self.component_code} "
            f"{self.get_exam_series_display()} {self.exam_year}"
        )


class PastPaperMaterial(models.Model):
    class MaterialType(models.TextChoices):
        QUESTION_PAPER = "question_paper", "Question paper"
        MARK_SCHEME = "mark_scheme", "Mark scheme"
        EXAMINER_REPORT = "examiner_report", "Examiner report"
        INSERT = "insert", "Insert"
        SOURCE_FILES = "source_files", "Practical source files"
        CONFIDENTIAL = "confidential", "Confidential instructions"
        WORKED_OUTPUT = "worked_output", "Worked output"
        SUPPORTING = "supporting", "Supporting material"

    past_paper = models.ForeignKey(
        PastPaper, on_delete=models.CASCADE, related_name="materials"
    )
    material_type = models.CharField(max_length=30, choices=MaterialType.choices)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to="past_papers/%Y/%m/", blank=True)
    original_filename = models.CharField(max_length=255, blank=True)
    checksum = models.CharField(max_length=64, blank=True)
    source = models.CharField(max_length=200, default="Cambridge International")
    is_authorised = models.BooleanField(default=False)
    instructor_only = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["material_type", "title"]

    def __str__(self):
        return f"{self.past_paper} - {self.title}"


class PastPaperProgress(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="past_paper_progress"
    )
    past_paper = models.ForeignKey(
        PastPaper, on_delete=models.CASCADE, related_name="learner_progress"
    )
    is_completed = models.BooleanField(default=False)
    active_view = models.CharField(max_length=30, default="question_paper")
    video_position_seconds = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "past_paper"],
                name="unique_user_past_paper_progress",
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.past_paper}"


class InstructorSolution(models.Model):
    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not started"
        DRAFT = "draft", "Draft"
        SOLVED = "solved", "Solved"
        UNDER_REVIEW = "under_review", "Under review"
        CORRECTIONS_REQUIRED = "corrections_required", "Corrections required"
        APPROVED = "approved", "Approved"

    past_paper = models.OneToOneField(
        PastPaper, on_delete=models.CASCADE, related_name="instructor_solution"
    )
    title = models.CharField(max_length=240)
    status = models.CharField(
        max_length=24, choices=Status.choices, default=Status.NOT_STARTED
    )
    overview_markdown = models.TextField(blank=True)
    total_marks = models.PositiveSmallIntegerField(default=0)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_past_paper_solutions",
    )
    reviewed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_past_paper_solutions",
    )
    version = models.PositiveIntegerField(default=1)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class InstructorSolutionSection(models.Model):
    class Confidence(models.TextChoices):
        UNCHECKED = "unchecked", "Unchecked"
        NEEDS_REVIEW = "needs_review", "Needs review"
        VERIFIED = "verified", "Verified"

    solution = models.ForeignKey(
        InstructorSolution, on_delete=models.CASCADE, related_name="sections"
    )
    question_number = models.CharField(max_length=30)
    question_path = models.CharField(max_length=40)
    question_summary = models.TextField(blank=True)
    maximum_marks = models.PositiveSmallIntegerField(default=0)
    mark_scheme_reference = models.TextField(blank=True)
    worked_solution_markdown = models.TextField(blank=True)
    examiner_guidance = models.TextField(blank=True)
    common_errors = models.TextField(blank=True)
    alternative_answers = models.TextField(blank=True)
    confidence = models.CharField(
        max_length=20,
        choices=Confidence.choices,
        default=Confidence.UNCHECKED,
    )
    order = models.PositiveIntegerField(default=0)
    is_complete = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "question_path"]
        constraints = [
            models.UniqueConstraint(
                fields=["solution", "question_path"],
                name="unique_solution_question_path",
            )
        ]

    def __str__(self):
        return f"{self.solution} - {self.question_path}"


class UserProfile(models.Model):
    """Extended profile for students and instructors (Udemy/Alison style)."""
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(upload_to="user_avatars/", null=True, blank=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True, null=True)
    middle_name = models.CharField(max_length=150, blank=True)
    class_stream = models.CharField(max_length=100, blank=True, help_text="e.g. Y1s")
    phone_number = models.CharField(max_length=30, blank=True)
    organization = models.CharField(max_length=150, blank=True, help_text="Company or School name")
    headline = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    interests = models.JSONField(default=list, blank=True)
    github_profile = models.URLField(blank=True)
    linkedin_profile = models.URLField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    force_password_reset = models.BooleanField(
        default=False,
        help_text="If true, user is forced to change their password on next login."
    )
    last_seen = models.DateTimeField(null=True, blank=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_online(self):
        if not self.last_seen:
            return False
        return self.last_seen >= timezone.now() - timedelta(seconds=120)

    def __str__(self):
        return f"Profile of {self.user.username}"

class DataCollectionItem(models.Model):
    """Stores interactions for world-class RLHF LLM training data."""

    class DataSource(models.TextChoices):
        EKEBU_LIVE = "ekebu_live", "EkebuLive"
        ASSISTANT_CHAT = "assistant_chat", "Assistant Chat"
        ASSIGNMENT = "assignment_submission", "Assignment Submission"

    class DataType(models.TextChoices):
        TEXT_ONLY = "text_only", "Text Only"
        AUDIO_TO_TEXT = "audio_to_text", "Audio to Text"
        VIDEO_TO_TEXT = "video_to_text", "Video to Text"

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    data_source = models.CharField(max_length=50, choices=DataSource.choices, default=DataSource.ASSISTANT_CHAT)
    data_type = models.CharField(max_length=50, choices=DataType.choices, default=DataType.TEXT_ONLY)
    
    source_language = models.CharField(max_length=50, default="eng")
    
    original_text = models.TextField(blank=True, help_text="The transcribed local text or typed prompt.")
    translated_prompt = models.TextField(blank=True, help_text="The English translation fed to the AI.")
    ai_response_candidate_1 = models.TextField(blank=True, help_text="The final response generated by the primary model.")
    ai_response_candidate_2 = models.TextField(blank=True, help_text="A secondary response for comparison.")
    
    media_file = models.FileField(upload_to="training_media/", null=True, blank=True)
    
    context_metadata = models.JSONField(default=dict, blank=True)
    
    human_edited_text = models.TextField(blank=True, help_text="Corrected transcription/translation.")
    preference_score = models.IntegerField(null=True, blank=True, help_text="1-5 rating on the AI's response.")
    quality_tags = models.JSONField(default=list, blank=True, help_text="Array of tag strings.")
    is_gold_standard = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.data_source} - {self.source_language} - {self.created_at.date()}"


class CourseEditLog(models.Model):
    """Tracks granular changes made to a course by any user."""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="edit_logs")
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="course_edit_logs")
    action = models.CharField(max_length=50, help_text="e.g., CREATED, UPDATED, SOFT_DELETED")
    details = models.JSONField(default=dict, blank=True, help_text="Granular field changes")
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        actor = self.user.username if self.user else "Unknown"
        return f"{self.course.title} - {self.action} by {actor}"


class CambridgeTextbook(models.Model):
    """Licensed Cambridge IT textbook registered for local RAG ingestion."""

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        INGESTING = "ingesting", "Ingesting"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"

    class Level(models.TextChoices):
        AS = "as", "AS Level"
        A = "a", "A Level"
        AS_A = "as_a", "AS & A Level"

    key = models.SlugField(max_length=80, unique=True)
    title = models.CharField(max_length=240)
    edition = models.CharField(max_length=120, blank=True)
    authors = models.CharField(max_length=240, blank=True)
    publisher = models.CharField(max_length=120, blank=True)
    year = models.PositiveSmallIntegerField(null=True, blank=True)
    level = models.CharField(max_length=10, choices=Level.choices, default=Level.AS_A)
    syllabus_code = models.CharField(max_length=20, default="9626")
    source_filename = models.CharField(max_length=255)
    source_sha256 = models.CharField(max_length=64, blank=True)
    page_count = models.PositiveIntegerField(default=0)
    chunk_count = models.PositiveIntegerField(default=0)
    image_count = models.PositiveIntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    ingested_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["level", "year", "title"]

    def __str__(self):
        return f"{self.title} ({self.edition})"


class CambridgeTextbookPage(models.Model):
    textbook = models.ForeignKey(
        CambridgeTextbook, on_delete=models.CASCADE, related_name="pages"
    )
    page_number = models.PositiveIntegerField()
    topic_code = models.CharField(max_length=20, blank=True, db_index=True)
    topic_title = models.CharField(max_length=200, blank=True)
    text = models.TextField(blank=True)
    char_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["page_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["textbook", "page_number"],
                name="unique_textbook_page_number",
            )
        ]

    def __str__(self):
        return f"{self.textbook.key} p{self.page_number}"


class CambridgeTextbookChunk(models.Model):
    textbook = models.ForeignKey(
        CambridgeTextbook, on_delete=models.CASCADE, related_name="chunks"
    )
    topic_code = models.CharField(max_length=20, blank=True, db_index=True)
    topic_title = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)
    page_start = models.PositiveIntegerField(default=1)
    page_end = models.PositiveIntegerField(default=1)
    text = models.TextField()
    char_count = models.PositiveIntegerField(default=0)
    embedding = models.JSONField(default=list, blank=True)
    search_blob = models.TextField(blank=True)

    class Meta:
        ordering = ["topic_code", "order", "page_start"]
        indexes = [
            models.Index(fields=["topic_code", "order"]),
        ]

    def __str__(self):
        return f"{self.textbook.key} {self.topic_code}#{self.order}"


class CambridgeTextbookImage(models.Model):
    textbook = models.ForeignKey(
        CambridgeTextbook, on_delete=models.CASCADE, related_name="images"
    )
    page_number = models.PositiveIntegerField(db_index=True)
    image_index = models.PositiveSmallIntegerField(default=0)
    sha256 = models.CharField(max_length=64)
    width = models.PositiveIntegerField(default=0)
    height = models.PositiveIntegerField(default=0)
    byte_size = models.PositiveIntegerField(default=0)
    relative_path = models.CharField(max_length=400)
    caption = models.CharField(max_length=300, blank=True)

    class Meta:
        ordering = ["page_number", "image_index"]
        constraints = [
            models.UniqueConstraint(
                fields=["textbook", "sha256"],
                name="unique_textbook_image_sha",
            )
        ]

    def __str__(self):
        return f"{self.textbook.key} img p{self.page_number}/{self.image_index}"


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if kwargs.get('raw', False):
        return
    if created:
        UserProfile.objects.get_or_create(user=instance)
