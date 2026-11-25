from django.contrib import admin
from .models import Course, Module, Lesson, Enrollment, Review, CoursePayment, Coupon, Certificate, VideoProgress, Currency, Quiz, Question, Choice, QuizAttempt, UserXP, UserMemory, CorporateSponsor, CourseScholarship, Cohort, Organization, UserSubscription, DailyAIUsage, ChatLog, StudentProject, PastPaper, PastPaperMaterial, InstructorSolution, InstructorSolutionSection, LessonPairing, LessonPairRequest
from .pdf_generator import generate_certificate_pdf
from django.template.response import TemplateResponse
from django.db.models import Sum, Count, F
from django.contrib.admin.views.decorators import staff_member_required


class ModuleInline(admin.TabularInline):
    model = Module
    extra = 1
    ordering = ["order"]


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 1
    ordering = ["order"]
    fields = ["title", "video_url", "duration_minutes", "order", "is_preview"]

class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4

class QuestionInline(admin.StackedInline):
    model = Question
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["title", "category", "price_ugx", "level", "is_published", "is_bestseller", "enrollment_count", "avg_rating"]
    list_filter = ["is_published", "is_bestseller", "level", "category"]
    search_fields = ["title", "subtitle", "description"]
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ModuleInline]
    fieldsets = (
        ("Basic Info", {
            "fields": ("title", "slug", "subtitle", "category", "level", "language")
        }),
        ("Pricing", {
            "fields": ("price_ugx", "original_price_ugx")
        }),
        ("Content", {
            "fields": ("description", "what_you_learn", "requirements", "who_is_for")
        }),
        ("Media", {
            "fields": ("thumbnail", "thumbnail_upload", "preview_video_url", "preview_video_upload")
        }),
        ("Instructor", {
            "fields": ("assigned_instructor", "instructor_name", "instructor_bio", "instructor_avatar")
        }),
        ("Publishing", {
            "fields": ("is_published", "is_bestseller")
        }),
    )

    def enrollment_count(self, obj):
        return obj.enrollment_count
    enrollment_count.short_description = "Students"

    def avg_rating(self, obj):
        return obj.avg_rating
    avg_rating.short_description = "Rating"


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ["title", "course", "order"]
    list_filter = ["course"]
    ordering = ["course", "order"]
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ["title", "module", "duration_minutes", "order", "is_preview", "playground_type"]
    list_filter = ["is_preview", "module__course", "playground_type"]
    ordering = ["module__course", "module__order", "order"]
    fieldsets = (
        (None, {
            "fields": ("module", "title", "order", "is_preview", "is_visible")
        }),
        ("Video", {
            "fields": ("video_url", "offline_video", "duration_minutes")
        }),
        ("Content", {
            "fields": ("overview", "lesson_text", "video_script", "content")
        }),
        ("Coding Playground", {
            "fields": ("playground_type", "playground_custom_url", "playground_starter_file"),
            "description": "Select a coding editor for this lesson. Students will see a Playground tab."
        }),
    )


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ["user", "course", "enrolled_at", "progress_percent"]
    list_filter = ["course"]
    search_fields = ["user__username", "course__title"]
    readonly_fields = ["enrolled_at"]

    def progress_percent(self, obj):
        return f"{obj.progress_percent}%"
    progress_percent.short_description = "Progress"


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ["user", "course", "rating", "created_at"]
    list_filter = ["rating", "course"]
    search_fields = ["user__username", "comment"]
    readonly_fields = ["created_at"]


@admin.register(CoursePayment)
class CoursePaymentAdmin(admin.ModelAdmin):
    list_display = ["user", "course", "amount", "status", "created_at"]
    list_filter = ["status", "course"]
    search_fields = ["user__username", "merchant_reference"]
    readonly_fields = ["created_at"]

@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ["code", "discount_percent", "is_active", "current_uses", "max_uses", "valid_until"]
    list_filter = ["is_active"]
    search_fields = ["code"]
    readonly_fields = ["current_uses", "valid_from"]
    filter_horizontal = ["applicable_courses", "used_by"]

@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ["user", "course", "uuid", "issued_at", "is_approved"]
    list_filter = ["course", "is_approved"]
    search_fields = ["user__username", "course__title", "uuid"]
    readonly_fields = ["uuid", "issued_at"]
    actions = ["approve_certificates"]

    @admin.action(description="Approve selected certificates and generate PDFs")
    def approve_certificates(self, request, queryset):
        approved_count = 0
        for cert in queryset:
            if not cert.is_approved:
                pdf_file = generate_certificate_pdf(
                    cert.user, 
                    cert.course, 
                    cert.uuid, 
                    cert.name_on_certificate, 
                    module=cert.module
                )
                cert.pdf_file.save(pdf_file.name, pdf_file)
                cert.is_approved = True
                cert.save()
                approved_count += 1
        
        self.message_user(request, f"{approved_count} certificates were successfully approved and generated.")

@admin.register(VideoProgress)
class VideoProgressAdmin(admin.ModelAdmin):
    list_display = ["user", "lesson", "timestamp_seconds", "last_watched_at"]
    list_filter = ["lesson__module__course"]
    search_fields = ["user__username", "lesson__title"]
    readonly_fields = ["last_watched_at"]

@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ["code", "symbol", "exchange_rate_to_ugx", "is_active", "created_at"]
    list_filter = ["is_active"]
    search_fields = ["code"]
    readonly_fields = ["created_at"]

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ["title", "module", "passing_score", "points_reward"]
    list_filter = ["module__course"]
    inlines = [QuestionInline]

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ["text", "quiz", "points", "order"]
    list_filter = ["quiz"]
    inlines = [ChoiceInline]

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ["user", "quiz", "score", "passed", "xp_awarded", "completed_at"]
    list_filter = ["passed", "quiz"]
    search_fields = ["user__username"]
    readonly_fields = ["started_at", "completed_at"]

@admin.register(UserXP)
class UserXPAdmin(admin.ModelAdmin):
    list_display = ["user", "course", "cohort", "total_xp", "level", "level_title"]
    search_fields = ["user__username", "user__first_name", "user__last_name"]
    list_filter = ["course", "cohort"]

@admin.register(UserMemory)
class UserMemoryAdmin(admin.ModelAdmin):
    list_display = ('user', 'short_fact', 'category', 'course', 'created_at')
    search_fields = ('user__username', 'fact')
    list_filter = ('category', 'course', 'created_at')
    readonly_fields = ('created_at',)

    def short_fact(self, obj):
        return obj.fact[:80] + ('...' if len(obj.fact) > 80 else '')
    short_fact.short_description = 'Fact'


@admin.register(CorporateSponsor)
class CorporateSponsorAdmin(admin.ModelAdmin):
    list_display = ["name", "contact_email", "total_budget"]
    search_fields = ["name"]

@admin.register(CourseScholarship)
class CourseScholarshipAdmin(admin.ModelAdmin):
    list_display = ["student", "sponsor", "cohort", "amount_subsidized", "date_awarded"]
    list_filter = ["sponsor", "cohort"]
    search_fields = ["student__username", "sponsor__name"]

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ["name", "org_type", "contact_email", "created_at"]
    list_filter = ["org_type"]
    search_fields = ["name", "contact_email"]

@admin.register(Cohort)
class CohortAdmin(admin.ModelAdmin):
    list_display = ["name", "course", "organization", "start_date", "capacity_limit", "fixed_costs", "variable_cost_per_learner"]
    list_filter = ["course", "start_date", "organization"]
    search_fields = ["name"]

@staff_member_required
def finances_dashboard(request):
    cohorts = Cohort.objects.prefetch_related('students', 'scholarships').all()
    cohort_data = []
    
    total_revenue = 0
    total_cost = 0
    
    for c in cohorts:
        enrolled_count = c.students.count()
        retail_count = enrolled_count - c.scholarships.count()
        
        # Calculate revenue (simplified: assuming retail paid price_override or course price)
        price = c.price_override if c.price_override else c.course.price_ugx
        retail_revenue = retail_count * price
        
        # Sponsored revenue
        sponsored_revenue = c.scholarships.aggregate(Sum('amount_subsidized'))['amount_subsidized__sum'] or 0
        
        revenue = retail_revenue + sponsored_revenue
        costs = c.fixed_costs + (enrolled_count * c.variable_cost_per_learner)
        profit = revenue - costs
        
        contribution_margin = price - c.variable_cost_per_learner
        break_even_point = c.fixed_costs / contribution_margin if contribution_margin > 0 else 0
        
        cohort_data.append({
            'name': c.name,
            'enrolled': enrolled_count,
            'retail_count': retail_count,
            'sponsored_count': c.scholarships.count(),
            'revenue': revenue,
            'costs': costs,
            'profit': profit,
            'break_even_point': round(break_even_point, 1),
            'is_profitable': profit > 0
        })
        
        total_revenue += revenue
        total_cost += costs
        
    sponsors = CorporateSponsor.objects.annotate(
        total_given=Sum('scholarships__amount_subsidized'),
        students_supported=Count('scholarships')
    )

    context = dict(
        admin.site.each_context(request),
        title="Financial Dashboard",
        cohort_data=cohort_data,
        total_revenue=total_revenue,
        total_profit=total_revenue - total_cost,
        sponsors=sponsors,
    )
    return TemplateResponse(request, "admin/finances_dashboard.html", context)


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["user", "plan", "is_active", "expires_at", "start_date"]
    list_filter = ["plan", "is_active"]
    search_fields = ["user__username", "user__email", "merchant_reference"]


@admin.register(DailyAIUsage)
class DailyAIUsageAdmin(admin.ModelAdmin):
    list_display = ["user", "date", "query_count"]
    list_filter = ["date"]
    search_fields = ["user__username", "user__email"]


@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    list_display = ["user", "course", "model_used", "created_at", "short_query"]
    list_filter = ["course", "model_used", "created_at"]
    search_fields = ["user__username", "query", "response"]
    readonly_fields = ["created_at"]
    actions = ["export_to_s3_action"]

    def short_query(self, obj):
        return obj.query[:60] + ("..." if len(obj.query) > 60 else "")
    short_query.short_description = "User Question"

    @admin.action(description="📦 Export Selected ChatLogs to S3 Fine-Tuning Dataset (.jsonl)")
    def export_to_s3_action(self, request, queryset):
        from .ai_tools.s3_dataset_exporter import export_chat_logs_to_s3
        res = export_chat_logs_to_s3(queryset)
        if res.get("success"):
            self.message_user(request, f"✅ {res.get('message')}")
        else:
            self.message_user(request, f"❌ Export failed: {res.get('error')}", level="ERROR")


@admin.register(StudentProject)
class StudentProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "lesson", "created_at"]
    list_filter = ["lesson__module__course"]
    search_fields = ["name", "user__username"]
    readonly_fields = ["created_at", "updated_at"]


class PastPaperMaterialInline(admin.TabularInline):
    model = PastPaperMaterial
    extra = 0
    fields = [
        "material_type",
        "title",
        "file",
        "is_authorised",
        "instructor_only",
    ]


@admin.register(PastPaper)
class PastPaperAdmin(admin.ModelAdmin):
    list_display = [
        "syllabus_code",
        "component_code",
        "exam_year",
        "exam_series",
        "subject",
        "status",
        "source_verified",
    ]
    list_filter = [
        "board",
        "qualification",
        "subject",
        "exam_year",
        "exam_series",
        "paper_number",
        "status",
        "source_verified",
    ]
    search_fields = ["subject", "syllabus_code", "seed_key", "course__title"]
    readonly_fields = ["seed_key", "last_seeded_at", "created_at", "updated_at"]
    inlines = [PastPaperMaterialInline]


class InstructorSolutionSectionInline(admin.StackedInline):
    model = InstructorSolutionSection
    extra = 0
    ordering = ["order"]


@admin.register(InstructorSolution)
class InstructorSolutionAdmin(admin.ModelAdmin):
    list_display = ["title", "status", "total_marks", "version", "updated_at"]
    list_filter = ["status", "past_paper__syllabus_code", "past_paper__exam_year"]
    search_fields = ["title", "past_paper__seed_key"]
    readonly_fields = ["created_at", "updated_at", "reviewed_at"]
    inlines = [InstructorSolutionSectionInline]


@admin.register(LessonPairing)
class LessonPairingAdmin(admin.ModelAdmin):
    list_display = ["lesson", "host_student", "partner_student", "instructor_assigned", "pair_code", "change_status", "is_active", "created_at"]
    list_filter = ["instructor_assigned", "is_active", "change_status", "lesson__module__course"]
    search_fields = ["host_student__username", "partner_student__username", "lesson__title", "pair_code"]
    readonly_fields = ["created_at", "ended_at"]


@admin.register(LessonPairRequest)
class LessonPairRequestAdmin(admin.ModelAdmin):
    list_display = ["lesson", "sender", "recipient", "pair_code", "is_open_match", "status", "created_at"]
    list_filter = ["status", "is_open_match", "lesson__module__course"]
    search_fields = ["sender__username", "recipient__username", "lesson__title", "pair_code"]
    readonly_fields = ["created_at"]

