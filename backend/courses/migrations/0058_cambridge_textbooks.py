from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("courses", "0057_organization_members_organization_template_doc"),
    ]

    operations = [
        migrations.CreateModel(
            name="CambridgeTextbook",
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
                ("key", models.SlugField(max_length=80, unique=True)),
                ("title", models.CharField(max_length=240)),
                ("edition", models.CharField(blank=True, max_length=120)),
                ("authors", models.CharField(blank=True, max_length=240)),
                ("publisher", models.CharField(blank=True, max_length=120)),
                ("year", models.PositiveSmallIntegerField(blank=True, null=True)),
                (
                    "level",
                    models.CharField(
                        choices=[
                            ("as", "AS Level"),
                            ("a", "A Level"),
                            ("as_a", "AS & A Level"),
                        ],
                        default="as_a",
                        max_length=10,
                    ),
                ),
                ("syllabus_code", models.CharField(default="9626", max_length=20)),
                ("source_filename", models.CharField(max_length=255)),
                ("source_sha256", models.CharField(blank=True, max_length=64)),
                ("page_count", models.PositiveIntegerField(default=0)),
                ("chunk_count", models.PositiveIntegerField(default=0)),
                ("image_count", models.PositiveIntegerField(default=0)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("ingesting", "Ingesting"),
                            ("ready", "Ready"),
                            ("failed", "Failed"),
                        ],
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("ingested_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["level", "year", "title"],
            },
        ),
        migrations.CreateModel(
            name="CambridgeTextbookPage",
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
                ("page_number", models.PositiveIntegerField()),
                (
                    "topic_code",
                    models.CharField(blank=True, db_index=True, max_length=20),
                ),
                ("topic_title", models.CharField(blank=True, max_length=200)),
                ("text", models.TextField(blank=True)),
                ("char_count", models.PositiveIntegerField(default=0)),
                (
                    "textbook",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="pages",
                        to="courses.cambridgetextbook",
                    ),
                ),
            ],
            options={
                "ordering": ["page_number"],
            },
        ),
        migrations.CreateModel(
            name="CambridgeTextbookChunk",
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
                (
                    "topic_code",
                    models.CharField(blank=True, db_index=True, max_length=20),
                ),
                ("topic_title", models.CharField(blank=True, max_length=200)),
                ("order", models.PositiveIntegerField(default=0)),
                ("page_start", models.PositiveIntegerField(default=1)),
                ("page_end", models.PositiveIntegerField(default=1)),
                ("text", models.TextField()),
                ("char_count", models.PositiveIntegerField(default=0)),
                ("embedding", models.JSONField(blank=True, default=list)),
                ("search_blob", models.TextField(blank=True)),
                (
                    "textbook",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="chunks",
                        to="courses.cambridgetextbook",
                    ),
                ),
            ],
            options={
                "ordering": ["topic_code", "order", "page_start"],
            },
        ),
        migrations.CreateModel(
            name="CambridgeTextbookImage",
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
                ("page_number", models.PositiveIntegerField(db_index=True)),
                ("image_index", models.PositiveSmallIntegerField(default=0)),
                ("sha256", models.CharField(max_length=64)),
                ("width", models.PositiveIntegerField(default=0)),
                ("height", models.PositiveIntegerField(default=0)),
                ("byte_size", models.PositiveIntegerField(default=0)),
                ("relative_path", models.CharField(max_length=400)),
                ("caption", models.CharField(blank=True, max_length=300)),
                (
                    "textbook",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="images",
                        to="courses.cambridgetextbook",
                    ),
                ),
            ],
            options={
                "ordering": ["page_number", "image_index"],
            },
        ),
        migrations.AddIndex(
            model_name="cambridgetextbookchunk",
            index=models.Index(
                fields=["topic_code", "order"],
                name="courses_cam_topic_c_7f1a2b_idx",
            ),
        ),
        migrations.AddConstraint(
            model_name="cambridgetextbookpage",
            constraint=models.UniqueConstraint(
                fields=("textbook", "page_number"),
                name="unique_textbook_page_number",
            ),
        ),
        migrations.AddConstraint(
            model_name="cambridgetextbookimage",
            constraint=models.UniqueConstraint(
                fields=("textbook", "sha256"),
                name="unique_textbook_image_sha",
            ),
        ),
    ]
