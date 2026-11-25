from django.db import models

DEFAULT_PORTALS = [
    "principal",
    "dos",
    "admissions",
    "teacher",
    "student",
    "parent",
    "bursar",
    "hr_payroll",
    "canteen",
    "housemaster",
    "nurse",
    "security",
    "librarian",
    "procurement",
    "transport",
    "games",
]


def default_portals():
    return list(DEFAULT_PORTALS)


def default_curricula():
    return ["UNEB_LOWER_SECONDARY"]


class Institution(models.Model):
    TIER_CHOICES = [
        ("OPEN_ACADEMY", "Public Open Academy"),
        ("NURSERY", "Nursery / ECD"),
        ("PRIMARY", "Primary"),
        ("SECONDARY", "Secondary"),
        ("HIGHER_ED", "Higher Education / TVET"),
        ("COMPREHENSIVE_K12", "Comprehensive K-12"),
    ]

    ONBOARDING_CHOICES = [
        ("PENDING", "Pending Onboarding"),
        ("IN_PROGRESS", "Onboarding In Progress"),
        ("COMPLETED", "Active / Onboarded"),
    ]

    name = models.CharField(max_length=180)
    initials = models.CharField(max_length=4, default="IE")
    subdomain = models.SlugField(max_length=80, unique=True)
    custom_domain = models.CharField(max_length=255, blank=True, default="")
    tier = models.CharField(max_length=32, choices=TIER_CHOICES, default="OPEN_ACADEMY")
    curriculum = models.CharField(max_length=80, default="UNEB_LOWER_SECONDARY")
    curricula = models.JSONField(default=default_curricula, blank=True)
    country = models.CharField(max_length=80, default="Uganda")
    currency = models.CharField(max_length=8, default="UGX")
    phone = models.CharField(max_length=32, blank=True, default="")
    email = models.EmailField(blank=True, default="")
    is_public_academy = models.BooleanField(default=False)
    onboarding_status = models.CharField(
        max_length=20, choices=ONBOARDING_CHOICES, default="PENDING"
    )
    enabled_portals = models.JSONField(default=default_portals, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.CharField(max_length=150, blank=True, default="")

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.name} ({self.subdomain})"


class InstitutionAuditLog(models.Model):
    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, related_name="audit_logs"
    )
    edited_by = models.CharField(max_length=150)
    action = models.CharField(max_length=60, default="UPDATED")
    changes_summary = models.TextField(blank=True, default="")
    edited_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-edited_at"]

    def __str__(self):
        return f"{self.institution.subdomain} edited by {self.edited_by} at {self.edited_at}"
