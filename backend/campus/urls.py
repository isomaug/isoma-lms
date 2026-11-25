from django.urls import path
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from academics.models import ReportCardSnapshot, StudentMark, StudentProfile
from tenants.models import Institution
from .models import (
    AttendanceRecord,
    BedAllocation,
    BookLoan,
    BusRouteAssignment,
    CanteenWallet,
    ClinicVisit,
    ClubMembership,
    ConductRecord,
    FeeInvoice,
    GatePassExeat,
    LibraryBook,
    MedicalProfile,
)


def _resolve_inst(request):
    tenant = getattr(request, "tenant", None)
    if tenant:
        return tenant
    slug = (request.GET.get("tenant") or "stmarys").strip().lower()
    return Institution.objects.filter(subdomain=slug).first() or Institution.objects.first()


@api_view(["GET"])
@permission_classes([AllowAny])
def student_360_view(request, student_id):
    """Returns a unified 360-degree view of a student linked across all school departments."""
    student = (
        StudentProfile.objects.filter(id=student_id)
        .select_related("institution", "class_stream")
        .first()
    )
    if not student:
        return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

    marks = StudentMark.objects.filter(student=student).select_related("subject")
    report_card = ReportCardSnapshot.objects.filter(student=student).first()
    book_loans = BookLoan.objects.filter(student=student).select_related("book")
    invoices = FeeInvoice.objects.filter(student=student)
    wallet = getattr(student, "canteen_wallet", None)
    bed = getattr(student, "bed_allocation", None)
    med = getattr(student, "medical_profile", None)
    visits = ClinicVisit.objects.filter(student=student)[:5]
    attendance = AttendanceRecord.objects.filter(student=student)[:10]
    gate_passes = GatePassExeat.objects.filter(student=student)[:5]
    bus = getattr(student, "bus_assignment", None)
    clubs = ClubMembership.objects.filter(student=student)
    conduct = ConductRecord.objects.filter(student=student)[:5]

    total_billed = sum(inv.amount_billed_ugx for inv in invoices)
    total_paid = sum(inv.amount_paid_ugx for inv in invoices)
    total_balance = max(0, total_billed - total_paid)

    return Response(
        {
            "student": {
                "id": student.id,
                "full_name": student.full_name,
                "registration_number": student.registration_number,
                "gender": student.gender,
                "status": student.status,
                "class_stream": student.class_stream.name if student.class_stream else "Unassigned",
                "curriculum": (
                    student.class_stream.curriculum_code.replace("_", " ")
                    if student.class_stream
                    else ""
                ),
                "parent_name": student.parent_name,
                "parent_phone": student.parent_phone,
                "parent_email": student.parent_email,
            },
            "academics": {
                "average_score": report_card.average_score if report_card else None,
                "class_position": (
                    f"{report_card.class_position} / {report_card.class_size}"
                    if report_card
                    else "-"
                ),
                "verification_code": report_card.verification_code if report_card else "",
                "pdf_url": (
                    f"/api/academics/report-cards/{report_card.verification_code}/pdf/"
                    if report_card
                    else ""
                ),
                "marks": [
                    {
                        "subject": m.subject.name,
                        "ca": m.ca_score,
                        "exam": m.exam_score,
                        "total": m.total_score,
                        "grade": m.grade,
                    }
                    for m in marks
                ],
            },
            "library": {
                "active_loans": sum(1 for l in book_loans if l.status != "RETURNED"),
                "loans": [
                    {
                        "id": l.id,
                        "book_title": l.book.title,
                        "isbn": l.book.isbn,
                        "borrowed_at": l.borrowed_at,
                        "due_date": l.due_date,
                        "status": l.status,
                        "fine_ugx": l.fine_ugx,
                    }
                    for l in book_loans
                ],
            },
            "finance": {
                "total_billed_ugx": total_billed,
                "total_paid_ugx": total_paid,
                "balance_ugx": total_balance,
                "cleared": total_balance == 0,
                "invoices": [
                    {
                        "id": inv.id,
                        "term": inv.term_label,
                        "billed_ugx": inv.amount_billed_ugx,
                        "paid_ugx": inv.amount_paid_ugx,
                        "balance_ugx": inv.balance_ugx,
                        "status": inv.status,
                        "receipt": inv.receipt_number,
                    }
                    for inv in invoices
                ],
            },
            "canteen": (
                {
                    "balance_ugx": wallet.balance_ugx,
                    "daily_limit_ugx": wallet.daily_limit_ugx,
                    "transactions": [
                        {
                            "id": tx.id,
                            "type": tx.tx_type,
                            "item": tx.item_description,
                            "amount_ugx": tx.amount_ugx,
                        }
                        for tx in wallet.transactions.all()[:5]
                    ],
                }
                if wallet
                else None
            ),
            "boarding": (
                {
                    "house_name": bed.house_name,
                    "dormitory_room": bed.dormitory_room,
                    "bed_number": bed.bed_number,
                    "housemaster": bed.housemaster_name,
                }
                if bed
                else None
            ),
            "sickbay": {
                "blood_group": med.blood_group if med else "O+",
                "allergies": med.allergies if med else "None reported",
                "emergency_contact": med.emergency_contact if med else student.parent_phone,
                "visits": [
                    {
                        "id": v.id,
                        "date": v.visit_date,
                        "complaint": v.complaint,
                        "treatment": v.treatment,
                        "nurse": v.nurse_name,
                    }
                    for v in visits
                ],
            },
            "attendance_and_gate": {
                "present_count": sum(1 for a in attendance if a.status == "PRESENT"),
                "total_days": len(attendance),
                "recent": [
                    {"id": a.id, "date": a.date, "status": a.status, "recorded_by": a.recorded_by}
                    for a in attendance[:5]
                ],
                "gate_passes": [
                    {
                        "id": g.id,
                        "reason": g.reason,
                        "approved_by": g.approved_by,
                        "status": g.status,
                    }
                    for g in gate_passes
                ],
            },
            "transport": (
                {
                    "route_name": bus.route_name,
                    "pickup_stop": bus.pickup_stop,
                    "vehicle_plate": bus.vehicle_plate,
                    "driver_name": bus.driver_name,
                }
                if bus
                else None
            ),
            "co_curricular": {
                "clubs": [
                    {
                        "id": c.id,
                        "club_name": c.club_name,
                        "role": c.role_in_club,
                        "sports_house": c.sports_house,
                    }
                    for c in clubs
                ],
                "conduct": [
                    {
                        "id": r.id,
                        "type": r.record_type,
                        "points": r.points,
                        "reason": r.reason,
                        "recorded_by": r.recorded_by,
                    }
                    for r in conduct
                ],
            },
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def campus_summary_view(request):
    inst = _resolve_inst(request)
    if not inst:
        return Response({})
    return Response(
        {
            "library_books": LibraryBook.objects.filter(institution=inst).count(),
            "active_book_loans": BookLoan.objects.filter(institution=inst, status="BORROWED").count(),
            "fee_invoices": FeeInvoice.objects.filter(institution=inst).count(),
            "canteen_wallets": CanteenWallet.objects.filter(institution=inst).count(),
            "bed_allocations": BedAllocation.objects.filter(institution=inst).count(),
            "medical_profiles": MedicalProfile.objects.filter(institution=inst).count(),
            "clinic_visits": ClinicVisit.objects.filter(institution=inst).count(),
            "attendance_records": AttendanceRecord.objects.filter(institution=inst).count(),
            "gate_passes": GatePassExeat.objects.filter(institution=inst).count(),
            "bus_assignments": BusRouteAssignment.objects.filter(institution=inst).count(),
            "club_memberships": ClubMembership.objects.filter(institution=inst).count(),
            "conduct_records": ConductRecord.objects.filter(institution=inst).count(),
        }
    )


urlpatterns = [
    path("students/<int:student_id>/360/", student_360_view, name="campus-student-360"),
    path("summary/", campus_summary_view, name="campus-summary"),
]
