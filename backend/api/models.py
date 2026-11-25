from django.db import models


class Profile(models.Model):
    """Minimal site/brand profile shim for courses & certificate templates."""

    full_name = models.CharField(max_length=150, default="Isoma Edutech Limited")
    email = models.EmailField(default="support@isomaug.com")
    phone = models.CharField(max_length=32, default="+256778261026")
    website = models.URLField(default="https://learn.isomaug.com")

    def __str__(self):
        return self.full_name
