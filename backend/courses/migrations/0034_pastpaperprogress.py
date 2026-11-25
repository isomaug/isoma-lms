from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("courses", "0033_pastpaper_instructorsolution_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="PastPaperProgress",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("is_completed", models.BooleanField(default=False)),
                (
                    "active_view",
                    models.CharField(default="question_paper", max_length=30),
                ),
                (
                    "video_position_seconds",
                    models.PositiveIntegerField(default=0),
                ),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "past_paper",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="learner_progress",
                        to="courses.pastpaper",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="past_paper_progress",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
        ),
        migrations.AddConstraint(
            model_name="pastpaperprogress",
            constraint=models.UniqueConstraint(
                fields=("user", "past_paper"),
                name="unique_user_past_paper_progress",
            ),
        ),
    ]
