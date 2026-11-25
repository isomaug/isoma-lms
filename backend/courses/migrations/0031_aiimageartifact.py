from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("courses", "0030_alter_lesson_playground_type_userprofile"),
    ]

    operations = [
        migrations.CreateModel(
            name="AIImageArtifact",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("prompt", models.TextField()),
                ("improved_prompt", models.TextField(blank=True)),
                ("edit_instruction", models.TextField(blank=True)),
                ("image", models.ImageField(blank=True, upload_to="ai_images/%Y/%m/")),
                ("mime_type", models.CharField(default="image/png", max_length=40)),
                ("provider_model", models.CharField(blank=True, max_length=80)),
                ("status", models.CharField(choices=[("processing", "Processing"), ("ready", "Ready"), ("failed", "Failed")], default="processing", max_length=16)),
                ("error_message", models.CharField(blank=True, max_length=240)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("course", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="ai_image_artifacts", to="courses.course")),
                ("parent", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="edits", to="courses.aiimageartifact")),
                ("user", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="ai_image_artifacts", to=settings.AUTH_USER_MODEL)),
            ],
            options={"ordering": ["-created_at"]},
        ),
    ]
