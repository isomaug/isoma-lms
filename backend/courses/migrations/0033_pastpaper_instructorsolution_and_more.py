from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("courses", "0032_alter_coursepayment_course"),
    ]

    operations = [
        migrations.CreateModel(
            name="PastPaper",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("board", models.CharField(default="cambridge", max_length=50)),
                ("qualification", models.CharField(default="as_a_level", max_length=80)),
                ("subject", models.CharField(max_length=150)),
                ("syllabus_code", models.CharField(max_length=20)),
                ("syllabus_era", models.CharField(blank=True, max_length=30)),
                ("exam_year", models.PositiveSmallIntegerField()),
                ("exam_series", models.CharField(choices=[("march", "February/March"), ("june", "May/June"), ("november", "October/November")], max_length=12)),
                ("paper_number", models.PositiveSmallIntegerField()),
                ("variant", models.PositiveSmallIntegerField()),
                ("component_code", models.CharField(max_length=8)),
                ("level", models.CharField(max_length=30)),
                ("seed_key", models.CharField(max_length=180, unique=True)),
                ("status", models.CharField(choices=[("planned", "Planned"), ("source_required", "Source required"), ("drafting", "Drafting"), ("review_required", "Review required"), ("ready", "Ready"), ("published", "Published"), ("not_available", "Not available"), ("future", "Future")], default="planned", max_length=24)),
                ("source_verified", models.BooleanField(default=False)),
                ("question_structure", models.JSONField(blank=True, default=list)),
                ("last_seeded_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("course", models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="past_paper", to="courses.course")),
            ],
            options={"ordering": ["-exam_year", "exam_series", "paper_number", "variant"]},
        ),
        migrations.CreateModel(
            name="InstructorSolution",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=240)),
                ("status", models.CharField(choices=[("not_started", "Not started"), ("draft", "Draft"), ("solved", "Solved"), ("under_review", "Under review"), ("corrections_required", "Corrections required"), ("approved", "Approved")], default="not_started", max_length=24)),
                ("overview_markdown", models.TextField(blank=True)),
                ("total_marks", models.PositiveSmallIntegerField(default=0)),
                ("version", models.PositiveIntegerField(default=1)),
                ("reviewed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("created_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="created_past_paper_solutions", to=settings.AUTH_USER_MODEL)),
                ("past_paper", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="instructor_solution", to="courses.pastpaper")),
                ("reviewed_by", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="reviewed_past_paper_solutions", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="PastPaperMaterial",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("material_type", models.CharField(choices=[("question_paper", "Question paper"), ("mark_scheme", "Mark scheme"), ("examiner_report", "Examiner report"), ("insert", "Insert"), ("source_files", "Practical source files"), ("confidential", "Confidential instructions"), ("worked_output", "Worked output"), ("supporting", "Supporting material")], max_length=30)),
                ("title", models.CharField(max_length=200)),
                ("file", models.FileField(blank=True, upload_to="past_papers/%Y/%m/")),
                ("original_filename", models.CharField(blank=True, max_length=255)),
                ("checksum", models.CharField(blank=True, max_length=64)),
                ("source", models.CharField(default="Cambridge International", max_length=200)),
                ("is_authorised", models.BooleanField(default=False)),
                ("instructor_only", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("past_paper", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="materials", to="courses.pastpaper")),
            ],
            options={"ordering": ["material_type", "title"]},
        ),
        migrations.CreateModel(
            name="InstructorSolutionSection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("question_number", models.CharField(max_length=30)),
                ("question_path", models.CharField(max_length=40)),
                ("question_summary", models.TextField(blank=True)),
                ("maximum_marks", models.PositiveSmallIntegerField(default=0)),
                ("mark_scheme_reference", models.TextField(blank=True)),
                ("worked_solution_markdown", models.TextField(blank=True)),
                ("examiner_guidance", models.TextField(blank=True)),
                ("common_errors", models.TextField(blank=True)),
                ("alternative_answers", models.TextField(blank=True)),
                ("confidence", models.CharField(choices=[("unchecked", "Unchecked"), ("needs_review", "Needs review"), ("verified", "Verified")], default="unchecked", max_length=20)),
                ("order", models.PositiveIntegerField(default=0)),
                ("is_complete", models.BooleanField(default=False)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("solution", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="sections", to="courses.instructorsolution")),
            ],
            options={"ordering": ["order", "question_path"]},
        ),
        migrations.AddConstraint(
            model_name="pastpaper",
            constraint=models.UniqueConstraint(fields=("board", "qualification", "syllabus_code", "exam_year", "exam_series", "paper_number", "variant"), name="unique_past_paper_component"),
        ),
        migrations.AddConstraint(
            model_name="instructorsolutionsection",
            constraint=models.UniqueConstraint(fields=("solution", "question_path"), name="unique_solution_question_path"),
        ),
    ]
