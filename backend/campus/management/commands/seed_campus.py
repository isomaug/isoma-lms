from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from academics.models import StudentProfile
from campus.models import (
    AttendanceRecord,
    BedAllocation,
    BookLoan,
    BusRouteAssignment,
    CanteenTransaction,
    CanteenWallet,
    ClinicVisit,
    ClubMembership,
    ConductRecord,
    FeeInvoice,
    GatePassExeat,
    LibraryBook,
    MedicalProfile,
)
from tenants.models import Institution


class Command(BaseCommand):
    help = "Idempotently seed all 8 campus ERP department tables linked to every StudentProfile."

    def handle(self, *args, **options):
        today = timezone.localdate()
        books_catalog = [
            ("978-9970-01-101", "New General Mathematics for Uganda", "J.B. Channon", "Mathematics"),
            ("978-9970-01-202", "Comprehensive Secondary Physics", "Abbott & Nelkon", "Sciences"),
            ("978-9970-01-303", "Integrated English & Literature", "NCDC Press", "Languages"),
            ("978-1108-43-404", "Cambridge IGCSE Computer Science", "Sarah Lawrey", "Computing"),
            ("978-9970-01-505", "East African History & Civics", "Fountain Publishers", "Humanities"),
        ]
        houses = ["Nile House", "Victoria House", "Rwenzori House", "Elgon House"]
        routes = [
            ("Entebbe Highway Express", "Kajjansi Stage", "UBF 412K", "Mr. Joseph Ssemakula"),
            ("Kampala Central Loop", "Najjanankumbi", "UBG 889M", "Mr. Patrick Okello"),
            ("Wakiso - Gayaza Route", "Kasangati", "UBE 205D", "Mr. Samuel Mugisha"),
        ]
        clubs = ["Robotics & Coding Club", "Debate Society", "Red Cross", "MDD & Choir", "Football XI"]
        blood_groups = ["O+", "A+", "B+", "AB+", "O-"]

        totals = {
            "books": 0,
            "loans": 0,
            "invoices": 0,
            "wallets": 0,
            "beds": 0,
            "medical": 0,
            "visits": 0,
            "attendance": 0,
            "gate_passes": 0,
            "bus": 0,
            "clubs": 0,
            "conduct": 0,
        }

        for inst in Institution.objects.all():
            students = list(StudentProfile.objects.filter(institution=inst).select_related("class_stream"))
            if not students:
                continue

            inst_books = []
            for isbn, title, author, cat in books_catalog:
                bk, _ = LibraryBook.objects.get_or_create(
                    institution=inst,
                    title=title,
                    defaults={"isbn": isbn, "author": author, "category": cat, "total_copies": 10, "available_copies": 8},
                )
                inst_books.append(bk)
            totals["books"] += len(inst_books)

            for idx, st in enumerate(students):
                # 1. Library Book Loan
                bk = inst_books[idx % len(inst_books)]
                loan, _ = BookLoan.objects.get_or_create(
                    institution=inst,
                    student=st,
                    book=bk,
                    defaults={
                        "borrowed_at": today - timedelta(days=5 + (idx % 6)),
                        "due_date": today + timedelta(days=9 - (idx % 5)),
                        "status": "BORROWED" if idx % 3 != 0 else "RETURNED",
                        "returned_at": today - timedelta(days=1) if idx % 3 == 0 else None,
                    },
                )
                totals["loans"] += 1

                # 2. Bursar / Fee Invoice
                billed = 1650000 if inst.tier == "SECONDARY" else 1200000
                paid = billed if idx % 4 != 3 else int(billed * 0.7)
                FeeInvoice.objects.get_or_create(
                    institution=inst,
                    student=st,
                    term_label="2026 - Term 1",
                    defaults={
                        "amount_billed_ugx": billed,
                        "amount_paid_ugx": paid,
                        "payment_method": "MTN MoMo" if idx % 2 == 0 else "Airtel Money",
                        "receipt_number": f"RCP-{inst.subdomain.upper()[:3]}-{202600 + st.id}",
                        "status": "PAID" if paid >= billed else "PARTIAL",
                    },
                )
                totals["invoices"] += 1

                # 3. Cashless Canteen Wallet + Transactions
                wallet, w_created = CanteenWallet.objects.get_or_create(
                    institution=inst,
                    student=st,
                    defaults={"balance_ugx": 45000 + (idx % 5) * 10000, "daily_limit_ugx": 10000},
                )
                if w_created or wallet.transactions.count() == 0:
                    CanteenTransaction.objects.create(
                        wallet=wallet,
                        tx_type="TOPUP",
                        item_description="Parent Mobile Money Top-Up",
                        amount_ugx=50000,
                    )
                    CanteenTransaction.objects.create(
                        wallet=wallet,
                        tx_type="PURCHASE",
                        item_description="Breaktime Juice & Samosa",
                        amount_ugx=4500,
                    )
                totals["wallets"] += 1

                # 4. Boarding / Dormitory Bed Allocation (Secondary boarders)
                if inst.tier == "SECONDARY" or idx % 2 == 0:
                    BedAllocation.objects.get_or_create(
                        institution=inst,
                        student=st,
                        defaults={
                            "house_name": houses[idx % len(houses)],
                            "dormitory_room": f"Wing {(idx % 3) + 1} - Room {101 + (idx % 8)}",
                            "bed_number": f"B-{(idx % 12) + 1:02d}",
                            "housemaster_name": "Mr. Godfrey Mukasa",
                        },
                    )
                    totals["beds"] += 1

                # 5. Nurse / Sickbay Medical Profile & Visit
                MedicalProfile.objects.get_or_create(
                    institution=inst,
                    student=st,
                    defaults={
                        "blood_group": blood_groups[idx % len(blood_groups)],
                        "allergies": "None reported" if idx % 5 != 0 else "Mild dust sensitivity",
                        "emergency_contact": st.parent_phone or "+256772000111",
                    },
                )
                totals["medical"] += 1
                if idx % 3 == 0:
                    ClinicVisit.objects.get_or_create(
                        institution=inst,
                        student=st,
                        visit_date=today - timedelta(days=3 + (idx % 10)),
                        defaults={
                            "complaint": "Routine fever check / headache",
                            "treatment": "Paracetamol & 2-hour sickbay rest; cleared for class",
                            "nurse_name": "Sr. Florence Namono",
                            "parent_notified": True,
                        },
                    )
                    totals["visits"] += 1

                # 6. Attendance & Gate Pass Exeat
                for day_offset in range(3):
                    AttendanceRecord.objects.get_or_create(
                        institution=inst,
                        student=st,
                        date=today - timedelta(days=day_offset),
                        defaults={
                            "status": "LATE" if (day_offset == 1 and idx % 7 == 0) else "PRESENT",
                            "recorded_by": "Smart QR Gate",
                        },
                    )
                    totals["attendance"] += 1

                if idx % 4 == 0:
                    GatePassExeat.objects.get_or_create(
                        institution=inst,
                        student=st,
                        reason="Parent weekend visitation / medical review",
                        defaults={"approved_by": "Housemaster & DOS", "status": "RETURNED"},
                    )
                    totals["gate_passes"] += 1

                # 7. Transport / Fleet Route Assignment
                route_name, stop, plate, driver = routes[idx % len(routes)]
                BusRouteAssignment.objects.get_or_create(
                    institution=inst,
                    student=st,
                    defaults={
                        "route_name": route_name,
                        "pickup_stop": stop,
                        "vehicle_plate": plate,
                        "driver_name": driver,
                    },
                )
                totals["bus"] += 1

                # 8. Games & Clubs + Conduct Merits
                ClubMembership.objects.get_or_create(
                    institution=inst,
                    student=st,
                    club_name=clubs[idx % len(clubs)],
                    defaults={
                        "role_in_club": "Captain" if idx % 5 == 0 else "Member",
                        "sports_house": houses[idx % len(houses)],
                    },
                )
                totals["clubs"] += 1

                ConductRecord.objects.get_or_create(
                    institution=inst,
                    student=st,
                    reason="Exemplary teamwork & leadership in house activities",
                    defaults={
                        "record_type": "MERIT",
                        "points": 10,
                        "recorded_by": "Games Master",
                    },
                )
                totals["conduct"] += 1

        self.stdout.write(self.style.SUCCESS(f"Seeded campus 360 links: {totals}"))
