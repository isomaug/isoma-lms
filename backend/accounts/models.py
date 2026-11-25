from django.contrib.auth.models import User
from django.db import models

from tenants.models import Institution


class UserProfile(models.Model):
    ROLE_CHOICES = [
        ("SUPER_ADMIN", "Super Admin"),
        ("PRINCIPAL", "Principal / Admin"),
        ("DOS", "Director of Studies / Registrar"),
        ("ADMISSIONS", "Admissions / Front Desk"),
        ("TEACHER", "Teacher / Instructor"),
        ("STUDENT", "Student / Learner"),
        ("PARENT", "Parent / Guardian"),
        ("BURSAR", "Bursar / Finance"),
        ("HR_PAYROLL", "HR & Payroll Officer"),
        ("CANTEEN", "Canteen Manager / POS"),
        ("HOUSEMASTER", "Housemaster / Matron"),
        ("NURSE", "Nurse / Sickbay"),
        ("GUARD", "Security Guard / Gate"),
        ("LIBRARIAN", "Librarian"),
        ("PROCUREMENT", "Storekeeper / Procurement"),
        ("TRANSPORT", "Transport / Fleet Officer"),
        ("GAMES", "Games Master / Co-Curricular"),
    ]

    HR_STAGE_CHOICES = [
        ("APPLIED", "Applied"),
        ("SHORTLISTED", "Shortlisted"),
        ("INTERVIEWED", "Interviewed"),
        ("OFFERED", "Offer Issued"),
        ("ONBOARDED", "Onboarded"),
        ("ACTIVE", "Active Staff"),
    ]

    CONTRACT_CHOICES = [
        ("FULL_TIME", "Full Time"),
        ("PART_TIME", "Part Time"),
        ("FIXED_TERM", "Fixed Term"),
        ("PROBATION", "Probationary"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="lms_profile")
    institution = models.ForeignKey(
        Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name="members"
    )
    role = models.CharField(max_length=24, choices=ROLE_CHOICES, default="STUDENT")
    phone = models.CharField(max_length=32, blank=True, default="")
    assigned_curricula = models.JSONField(default=list, blank=True)
    assigned_class_ids = models.JSONField(default=list, blank=True)
    assigned_subject_ids = models.JSONField(default=list, blank=True)
    hr_stage = models.CharField(max_length=20, choices=HR_STAGE_CHOICES, default="ACTIVE")
    contract_type = models.CharField(max_length=20, choices=CONTRACT_CHOICES, default="FULL_TIME")
    department = models.CharField(max_length=80, blank=True, default="")
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=20, blank=True, default="")
    nationality = models.CharField(max_length=60, blank=True, default="Ugandan")
    national_id = models.CharField(max_length=60, blank=True, default="")
    home_address = models.CharField(max_length=200, blank=True, default="")
    qualification = models.CharField(max_length=160, blank=True, default="")
    years_experience = models.PositiveIntegerField(default=0)
    salary_ugx = models.PositiveIntegerField(default=0)
    next_of_kin_name = models.CharField(max_length=120, blank=True, default="")
    next_of_kin_phone = models.CharField(max_length=32, blank=True, default="")
    bank_or_momo_account = models.CharField(max_length=120, blank=True, default="")
    applied_at = models.DateTimeField(null=True, blank=True)
    onboarded_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.CharField(max_length=150, blank=True, default="")

    def __str__(self):
        return f"{self.user.email or self.user.username} ({self.role})"
