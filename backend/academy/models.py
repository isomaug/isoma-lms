from django.db import models

from tenants.models import Institution


class Course(models.Model):
    CATEGORY_CHOICES = [
        ("AI_ROBOTICS", "AI & Robotics"),
        ("PROGRAMMING", "Software Engineering"),
        ("CAMBRIDGE_IT", "Cambridge IT / CS"),
        ("UNEB_STEM", "UNEB STEM"),
        ("CREATIVE", "Creative & Digital Media"),
    ]

    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, related_name="courses"
    )
    slug = models.SlugField(max_length=120, unique=True)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=280, blank=True, default="")
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default="AI_ROBOTICS")
    level = models.CharField(max_length=60, default="Intermediate")
    lessons_count = models.PositiveIntegerField(default=12)
    duration_weeks = models.PositiveIntegerField(default=8)
    price_ugx = models.PositiveIntegerField(default=0)
    is_public_course = models.BooleanField(default=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return self.title
