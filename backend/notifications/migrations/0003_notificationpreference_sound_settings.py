from datetime import time

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("notifications", "0002_notification_in_app_visible"),
    ]

    operations = [
        migrations.AddField(
            model_name="notificationpreference",
            name="quiet_hours_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="notificationpreference",
            name="quiet_hours_end",
            field=models.TimeField(default=time(7, 0)),
        ),
        migrations.AddField(
            model_name="notificationpreference",
            name="quiet_hours_start",
            field=models.TimeField(default=time(22, 0)),
        ),
        migrations.AddField(
            model_name="notificationpreference",
            name="sound_enabled",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="notificationpreference",
            name="sound_volume",
            field=models.PositiveSmallIntegerField(default=35),
        ),
    ]
