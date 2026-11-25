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

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="lms_profile")
    institution = models.ForeignKey(
        Institution, on_delete=models.SET_NULL, null=True, blank=True, related_name="members"
    )
    role = models.CharField(max_length=24, choices=ROLE_CHOICES, default="STUDENT")
    phone = models.CharField(max_length=32, blank=True, default="")

    def __str__(self):
        return f"{self.user.email or self.user.username} ({self.role})"
