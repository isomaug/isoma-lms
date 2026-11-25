from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("courses", "0031_aiimageartifact"),
    ]

    operations = [
        migrations.AlterField(
            model_name="coursepayment",
            name="course",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="payments",
                to="courses.course",
            ),
        ),
    ]
