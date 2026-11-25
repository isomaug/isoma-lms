from django.db import models
from django.utils import timezone


class LibraryBook(models.Model):
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="library_books"
    )
    isbn = models.CharField(max_length=40, blank=True, default="")
    title = models.CharField(max_length=220)
    author = models.CharField(max_length=160, blank=True, default="")
    category = models.CharField(max_length=80, blank=True, default="Textbook")
    total_copies = models.PositiveIntegerField(default=5)
    available_copies = models.PositiveIntegerField(default=5)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.title} ({self.institution.subdomain})"


class BookLoan(models.Model):
    STATUS_CHOICES = [
        ("BORROWED", "Borrowed"),
        ("RETURNED", "Returned"),
        ("OVERDUE", "Overdue"),
    ]
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="book_loans"
    )
    student = models.ForeignKey(
        "academics.StudentProfile", on_delete=models.CASCADE, related_name="book_loans"
    )
    book = models.ForeignKey(LibraryBook, on_delete=models.CASCADE, related_name="loans")
    borrowed_at = models.DateField(default=timezone.now)
    due_date = models.DateField()
    returned_at = models.DateField(null=True, blank=True)
    fine_ugx = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="BORROWED")

    class Meta:
        ordering = ["-borrowed_at", "-id"]


class FeeInvoice(models.Model):
    STATUS_CHOICES = [
        ("PAID", "Cleared / Paid"),
        ("PARTIAL", "Partial Balance"),
        ("UNPAID", "Unpaid"),
    ]
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="fee_invoices"
    )
    student = models.ForeignKey(
        "academics.StudentProfile", on_delete=models.CASCADE, related_name="fee_invoices"
    )
    term_label = models.CharField(max_length=80, default="2026 - Term 1")
    amount_billed_ugx = models.PositiveIntegerField(default=1500000)
    amount_paid_ugx = models.PositiveIntegerField(default=1500000)
    payment_method = models.CharField(max_length=40, default="MTN MoMo")
    receipt_number = models.CharField(max_length=40, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PAID")
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def balance_ugx(self):
        return max(0, self.amount_billed_ugx - self.amount_paid_ugx)

    class Meta:
        ordering = ["-updated_at"]


class CanteenWallet(models.Model):
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="canteen_wallets"
    )
    student = models.OneToOneField(
        "academics.StudentProfile", on_delete=models.CASCADE, related_name="canteen_wallet"
    )
    balance_ugx = models.PositiveIntegerField(default=50000)
    daily_limit_ugx = models.PositiveIntegerField(default=10000)
    updated_at = models.DateTimeField(auto_now=True)


class CanteenTransaction(models.Model):
    TX_TYPES = [("TOPUP", "Parent Top-Up"), ("PURCHASE", "POS Purchase")]
    wallet = models.ForeignKey(
        CanteenWallet, on_delete=models.CASCADE, related_name="transactions"
    )
    tx_type = models.CharField(max_length=20, choices=TX_TYPES, default="PURCHASE")
    item_description = models.CharField(max_length=160)
    amount_ugx = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]


class BedAllocation(models.Model):
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="bed_allocations"
    )
    student = models.OneToOneField(
        "academics.StudentProfile", on_delete=models.CASCADE, related_name="bed_allocation"
    )
    house_name = models.CharField(max_length=80)
    dormitory_room = models.CharField(max_length=60)
    bed_number = models.CharField(max_length=20)
    housemaster_name = models.CharField(max_length=120, blank=True, default="")


class MedicalProfile(models.Model):
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="medical_profiles"
    )
    student = models.OneToOneField(
        "academics.StudentProfile", on_delete=models.CASCADE, related_name="medical_profile"
    )
    blood_group = models.CharField(max_length=10, default="O+")
    allergies = models.CharField(max_length=220, default="None reported")
    emergency_contact = models.CharField(max_length=120, blank=True, default="")


class ClinicVisit(models.Model):
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="clinic_visits"
    )
    student = models.ForeignKey(
        "academics.StudentProfile", on_delete=models.CASCADE, related_name="clinic_visits"
    )
    visit_date = models.DateField(default=timezone.now)
    complaint = models.CharField(max_length=180)
    treatment = models.CharField(max_length=220)
    nurse_name = models.CharField(max_length=120, default="Sr. Florence Namono")
    parent_notified = models.BooleanField(default=True)

    class Meta:
        ordering = ["-visit_date", "-id"]


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ("PRESENT", "Present"),
        ("LATE", "Late"),
        ("ABSENT", "Absent"),
        ("EXCUSED", "Excused"),
    ]
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="attendance_records"
    )
    student = models.ForeignKey(
        "academics.StudentProfile", on_delete=models.CASCADE, related_name="attendance_records"
    )
    date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PRESENT")
    recorded_by = models.CharField(max_length=120, default="Smart QR Gate")

    class Meta:
        ordering = ["-date", "-id"]


class GatePassExeat(models.Model):
    STATUS_CHOICES = [
        ("APPROVED", "Approved"),
        ("CHECKED_OUT", "Checked Out at Gate"),
        ("RETURNED", "Returned to Campus"),
    ]
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="gate_passes"
    )
    student = models.ForeignKey(
        "academics.StudentProfile", on_delete=models.CASCADE, related_name="gate_passes"
    )
    reason = models.CharField(max_length=180)
    approved_by = models.CharField(max_length=120, default="Housemaster & DOS")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="RETURNED")
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-issued_at"]


class BusRouteAssignment(models.Model):
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="bus_assignments"
    )
    student = models.OneToOneField(
        "academics.StudentProfile", on_delete=models.CASCADE, related_name="bus_assignment"
    )
    route_name = models.CharField(max_length=120)
    pickup_stop = models.CharField(max_length=120)
    vehicle_plate = models.CharField(max_length=30, default="UBF 412K")
    driver_name = models.CharField(max_length=120, default="Mr. Joseph Ssemakula")


class ClubMembership(models.Model):
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="club_memberships"
    )
    student = models.ForeignKey(
        "academics.StudentProfile", on_delete=models.CASCADE, related_name="club_memberships"
    )
    club_name = models.CharField(max_length=100)
    role_in_club = models.CharField(max_length=60, default="Member")
    sports_house = models.CharField(max_length=60, default="Nile House")


class ConductRecord(models.Model):
    RECORD_TYPES = [("MERIT", "Merit"), ("DEMERIT", "Demerit")]
    institution = models.ForeignKey(
        "tenants.Institution", on_delete=models.CASCADE, related_name="conduct_records"
    )
    student = models.ForeignKey(
        "academics.StudentProfile", on_delete=models.CASCADE, related_name="conduct_records"
    )
    record_type = models.CharField(max_length=20, choices=RECORD_TYPES, default="MERIT")
    points = models.IntegerField(default=5)
    reason = models.CharField(max_length=200)
    recorded_by = models.CharField(max_length=120, default="Games Master")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
