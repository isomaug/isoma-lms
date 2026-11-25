import secrets
import uuid
from django.db import models
from tenants.models import Institution


class CurriculumDefinition(models.Model):
    code = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=160)
    country_origin = models.CharField(max_length=80, default="Uganda")
    unit_label = models.CharField(max_length=40, default="Subject")
    ca_label = models.CharField(max_length=40, default="AOI / CA")
    ca_weight = models.PositiveIntegerField(default=20)
    exam_label = models.CharField(max_length=40, default="End of Term")
    exam_weight = models.PositiveIntegerField(default=80)
    grading_scale = models.JSONField(default=list, blank=True)

    class Meta:
        ordering = ["name"]

    def compute_grade(self, score):
        for band in self.grading_scale or []:
            if band.get("min", 0) <= score <= band.get("max", 100):
                return band.get("grade", "P"), band.get("remark", "Pass")
        if score >= 80:
            return "D1", "Distinction"
        if score >= 70:
            return "D2", "Very Good"
        if score >= 60:
            return "C3", "Credit"
        if score >= 50:
            return "P7", "Pass"
        return "F9", "Needs Support"

    def __str__(self):
        return f"{self.name} ({self.code})"


class CustomDomainConfig(models.Model):
    STATUS_CHOICES = [
        ("PENDING_DNS", "Pending DNS"),
        ("ACTIVE", "Active"),
        ("FAILED", "Verification Failed"),
    ]

    institution = models.OneToOneField(
        Institution, on_delete=models.CASCADE, related_name="domain_config"
    )
    custom_domain = models.CharField(max_length=255)
    cname_target = models.CharField(max_length=120, default="cname.isomaug.com")
    verification_token = models.CharField(max_length=80, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING_DNS")
    ssl_status = models.CharField(max_length=20, default="PENDING")
    last_verified_at = models.DateTimeField(null=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.verification_token:
            self.verification_token = f"isoma-token-{secrets.token_hex(6)}"
        super().save(*args, **kwargs)


class AcademicYear(models.Model):
    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, related_name="academic_years"
    )
    name = models.CharField(max_length=40)
    is_current = models.BooleanField(default=True)

    class Meta:
        ordering = ["-name"]
        unique_together = [("institution", "name")]

    def __str__(self):
        return f"{self.institution.initials} {self.name}"


class Term(models.Model):
    academic_year = models.ForeignKey(
        AcademicYear, on_delete=models.CASCADE, related_name="terms"
    )
    name = models.CharField(max_length=40)
    is_current = models.BooleanField(default=True)

    class Meta:
        ordering = ["id"]

    def __str__(self):
        return f"{self.academic_year.name} - {self.name}"


class ClassStream(models.Model):
    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, related_name="class_streams"
    )
    name = models.CharField(max_length=80)
    code = models.CharField(max_length=20, blank=True, default="")
    curriculum_code = models.CharField(max_length=64, default="UNEB_LOWER_SECONDARY")
    class_teacher_name = models.CharField(max_length=120, blank=True, default="")

    class Meta:
        ordering = ["name"]
        unique_together = [("institution", "name")]

    def __str__(self):
        return f"{self.name} ({self.curriculum_code})"


class Subject(models.Model):
    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, related_name="subjects"
    )
    class_stream = models.ForeignKey(
        ClassStream, on_delete=models.CASCADE, related_name="subjects"
    )
    name = models.CharField(max_length=140)
    code = models.CharField(max_length=24, blank=True, default="")
    teacher_name = models.CharField(max_length=120, blank=True, default="")
    source_course_slug = models.SlugField(max_length=140, blank=True, default="")
    cloned_lessons = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} - {self.class_stream.name}"


class StudentProfile(models.Model):
    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, related_name="students"
    )
    class_stream = models.ForeignKey(
        ClassStream, on_delete=models.SET_NULL, null=True, blank=True, related_name="students"
    )
    registration_number = models.CharField(max_length=64, unique=True, blank=True)
    full_name = models.CharField(max_length=150)
    gender = models.CharField(max_length=16, default="Female")
    parent_name = models.CharField(max_length=150, blank=True, default="")
    parent_phone = models.CharField(max_length=32, blank=True, default="")
    parent_email = models.EmailField(blank=True, default="")
    parent_relationship = models.CharField(max_length=40, blank=True, default="Parent / Guardian")
    date_of_birth = models.DateField(null=True, blank=True)
    nationality = models.CharField(max_length=60, blank=True, default="Ugandan")
    nin_or_lin = models.CharField(max_length=60, blank=True, default="")
    home_address = models.CharField(max_length=200, blank=True, default="")
    previous_school = models.CharField(max_length=160, blank=True, default="")
    boarding_status = models.CharField(max_length=20, blank=True, default="DAY")
    emergency_contact_name = models.CharField(max_length=120, blank=True, default="")
    emergency_contact_phone = models.CharField(max_length=32, blank=True, default="")
    qr_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    status = models.CharField(max_length=20, default="ACTIVE")
    admitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["full_name"]

    def save(self, *args, **kwargs):
        if not self.registration_number:
            prefix = (self.institution.initials or "IS").upper()
            stream_code = (
                (self.class_stream.code or self.class_stream.name[:3]).upper().replace(" ", "")
                if self.class_stream
                else "GEN"
            )
            seq = StudentProfile.objects.filter(institution=self.institution).count() + 1
            self.registration_number = f"{prefix}/2026/{stream_code}/{seq:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.registration_number} - {self.full_name}"


class StudentMark(models.Model):
    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, related_name="marks"
    )
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="marks"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="marks"
    )
    term = models.ForeignKey(
        Term, on_delete=models.CASCADE, related_name="marks"
    )
    ca_score = models.FloatField(default=0)
    exam_score = models.FloatField(default=0)
    total_score = models.FloatField(default=0)
    grade = models.CharField(max_length=16, blank=True, default="")
    remark = models.CharField(max_length=80, blank=True, default="")
    teacher_comment = models.CharField(max_length=200, blank=True, default="")
    recorded_by = models.CharField(max_length=150, blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [("student", "subject", "term")]

    def save(self, *args, **kwargs):
        curr = CurriculumDefinition.objects.filter(
            code=self.subject.class_stream.curriculum_code
        ).first()
        if curr:
            weighted = (self.ca_score * curr.ca_weight / 100.0) + (
                self.exam_score * curr.exam_weight / 100.0
            )
            self.total_score = round(weighted, 1)
            self.grade, self.remark = curr.compute_grade(self.total_score)
        else:
            self.total_score = round((self.ca_score * 0.2) + (self.exam_score * 0.8), 1)
            self.grade = "D1" if self.total_score >= 80 else "C3" if self.total_score >= 60 else "P7"
            self.remark = "Distinction" if self.total_score >= 80 else "Credit" if self.total_score >= 60 else "Pass"
        super().save(*args, **kwargs)


class MarkAuditLog(models.Model):
    """Immutable timestamped log sent to Admin/DOS whenever a teacher enters or updates a mark."""

    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, related_name="mark_audit_logs"
    )
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="mark_audit_logs"
    )
    subject = models.ForeignKey(
        Subject, on_delete=models.CASCADE, related_name="mark_audit_logs"
    )
    term = models.ForeignKey(
        Term, on_delete=models.CASCADE, related_name="mark_audit_logs"
    )
    ca_score = models.FloatField(default=0)
    exam_score = models.FloatField(default=0)
    total_score = models.FloatField(default=0)
    grade = models.CharField(max_length=16, blank=True, default="")
    recorded_by = models.CharField(max_length=150)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-recorded_at"]


class CurriculumSubjectCatalog(models.Model):
    """Master catalog of official subjects/learning areas per curriculum and education level."""

    curriculum_code = models.CharField(max_length=64, db_index=True)
    level = models.CharField(max_length=60)
    code = models.CharField(max_length=24)
    name = models.CharField(max_length=160)

    class Meta:
        ordering = ["curriculum_code", "level", "name"]
        unique_together = [("curriculum_code", "level", "name")]

    def __str__(self):
        return f"{self.curriculum_code} | {self.level} | {self.name}"


class ReportCardSnapshot(models.Model):
    institution = models.ForeignKey(
        Institution, on_delete=models.CASCADE, related_name="report_cards"
    )
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name="report_cards"
    )
    term = models.ForeignKey(
        Term, on_delete=models.CASCADE, related_name="report_cards"
    )
    average_score = models.FloatField(default=0)
    class_position = models.PositiveIntegerField(default=1)
    class_size = models.PositiveIntegerField(default=1)
    class_teacher_remark = models.CharField(
        max_length=240, default="Consistent academic progress. Keep up the focused effort."
    )
    headteacher_remark = models.CharField(
        max_length=240, default="Promising term performance. Aim even higher next term."
    )
    verification_code = models.CharField(max_length=64, unique=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [("student", "term")]
        ordering = ["-issued_at"]

    def save(self, *args, **kwargs):
        if not self.verification_code:
            prefix = (self.institution.initials or "IS").upper()
            self.verification_code = f"ISOMA-RC-{prefix}-{secrets.token_hex(4).upper()}"
        super().save(*args, **kwargs)
