from io import BytesIO
from reportlab.graphics import renderPDF
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def render_report_card_pdf(snapshot, marks, verify_base_url="http://127.0.0.1:5177"):
    """
    Generates a standard A4 (210mm x 297mm) report card PDF with exact 20mm margins on all four sides,
    school crest/logo header, weighted curriculum marks table, remarks, signature lines, and QR code.
    """
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    # Standard 20mm margins on all 4 sides
    margin = 20 * mm
    content_left = margin
    content_right = width - margin
    content_width = content_right - content_left

    royal_blue = colors.HexColor("#004880")
    slate = colors.HexColor("#1f2937")
    muted = colors.HexColor("#6b7280")
    light_bg = colors.HexColor("#f8fafc")
    border_col = colors.HexColor("#d1d5db")

    # Outer subtle A4 margin frame border
    c.setStrokeColor(royal_blue)
    c.setLineWidth(1.5)
    c.rect(margin - 4, margin - 4, content_width + 8, height - 2 * margin + 8, fill=0, stroke=1)

    # Top Royal Blue accent bar inside the 20mm margin
    top_y = height - margin
    c.setFillColor(royal_blue)
    c.rect(content_left, top_y - 4, content_width, 4, fill=1, stroke=0)

    # School Logo / Monogram Crest + Header Block
    crest_size = 44
    crest_y = top_y - 12 - crest_size
    c.setFillColor(royal_blue)
    c.roundRect(content_left + 8, crest_y, crest_size, crest_size, 8, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(
        content_left + 8 + crest_size / 2,
        crest_y + 16,
        (snapshot.institution.initials or "IS").upper()[:3],
    )

    text_x = content_left + 8 + crest_size + 14
    c.setFillColor(royal_blue)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(text_x, top_y - 26, snapshot.institution.name.upper())

    c.setFillColor(slate)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawString(
        text_x,
        top_y - 40,
        f"OFFICIAL ACADEMIC REPORT CARD  |  {snapshot.term.academic_year.name} - {snapshot.term.name}",
    )

    c.setFillColor(muted)
    c.setFont("Helvetica", 8.5)
    c.drawString(
        text_x,
        top_y - 53,
        f"{snapshot.institution.email or 'support@isomaug.com'}  |  {snapshot.institution.phone or '+256778261026'}  |  {snapshot.institution.custom_domain or snapshot.institution.subdomain + '.isomaug.com'}",
    )

    # Divider line below header
    y = crest_y - 12
    c.setStrokeColor(border_col)
    c.setLineWidth(0.75)
    c.line(content_left, y, content_right, y)

    # Student Information Box
    y -= 10
    box_h = 56
    c.setFillColor(light_bg)
    c.setStrokeColor(border_col)
    c.roundRect(content_left, y - box_h, content_width, box_h, 5, fill=1, stroke=1)

    student = snapshot.student
    stream_name = student.class_stream.name if student.class_stream else "General"
    curr_code = (
        student.class_stream.curriculum_code.replace("_", " ")
        if student.class_stream
        else "UNEB LOWER SECONDARY"
    )

    c.setFillColor(slate)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(content_left + 12, y - 16, f"Student Name: {student.full_name}")
    c.setFont("Helvetica", 9)
    c.drawString(content_left + 12, y - 31, f"Registration No: {student.registration_number}")
    c.drawString(content_left + 12, y - 45, f"Class / Stream: {stream_name}")

    c.drawRightString(content_right - 12, y - 16, f"Curriculum: {curr_code}")
    c.drawRightString(
        content_right - 12,
        y - 31,
        f"Term Average: {snapshot.average_score:.1f}%  |  Position: {snapshot.class_position} of {snapshot.class_size}",
    )
    c.drawRightString(content_right - 12, y - 45, f"Verification ID: {snapshot.verification_code}")

    # Marks Table Header
    y -= box_h + 16
    c.setFillColor(royal_blue)
    c.rect(content_left, y - 22, content_width, 22, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(content_left + 10, y - 15, "Subject / Learning Area")
    c.drawRightString(content_left + 255, y - 15, "CA / AOI")
    c.drawRightString(content_left + 310, y - 15, "Exam")
    c.drawRightString(content_left + 365, y - 15, "Total %")
    c.drawCentredString(content_left + 408, y - 15, "Grade")
    c.drawString(content_left + 436, y - 15, "Remark")

    y -= 22
    c.setFont("Helvetica", 8.5)
    for idx, m in enumerate(marks):
        row_h = 22
        if idx % 2 == 1:
            c.setFillColor(light_bg)
            c.rect(content_left, y - row_h, content_width, row_h, fill=1, stroke=0)
        c.setStrokeColor(border_col)
        c.line(content_left, y - row_h, content_right, y - row_h)

        c.setFillColor(slate)
        c.drawString(content_left + 10, y - 15, m.subject.name[:34])
        c.drawRightString(content_left + 255, y - 15, f"{m.ca_score:.0f}")
        c.drawRightString(content_left + 310, y - 15, f"{m.exam_score:.0f}")
        c.setFont("Helvetica-Bold", 8.5)
        c.drawRightString(content_left + 365, y - 15, f"{m.total_score:.1f}")
        c.setFillColor(royal_blue)
        c.drawCentredString(content_left + 408, y - 15, m.grade)
        c.setFont("Helvetica", 8.5)
        c.setFillColor(muted)
        c.drawString(content_left + 436, y - 15, (m.remark or "Pass")[:16])
        y -= row_h

    # Remarks & Signatures
    y -= 24
    c.setFillColor(slate)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(content_left, y, "Class Teacher's Remark:")
    c.setFont("Helvetica", 8.5)
    c.drawString(content_left + 115, y, snapshot.class_teacher_remark[:76])

    y -= 18
    c.setFont("Helvetica-Bold", 9)
    c.drawString(content_left, y, "Headteacher's Remark:")
    c.setFont("Helvetica", 8.5)
    c.drawString(content_left + 115, y, snapshot.headteacher_remark[:76])

    y -= 34
    c.setStrokeColor(border_col)
    c.line(content_left, y, content_left + 150, y)
    c.line(content_left + 190, y, content_left + 340, y)
    c.setFillColor(muted)
    c.setFont("Helvetica", 8)
    c.drawString(content_left, y - 12, "Class Teacher Signature")
    c.drawString(content_left + 190, y - 12, "Headteacher / DOS Signature & Stamp")

    # Footer QR Verification Block anchored neatly inside 20mm bottom margin
    qr_size = 70
    verify_url = f"{verify_base_url.rstrip('/')}/verify/{snapshot.verification_code}"
    qr_widget = qr.QrCodeWidget(verify_url)
    bounds = qr_widget.getBounds()
    w = bounds[2] - bounds[0]
    h = bounds[3] - bounds[1]
    d = Drawing(qr_size, qr_size, transform=[qr_size / w, 0, 0, qr_size / h, 0, 0])
    d.add(qr_widget)
    renderPDF.draw(d, c, content_right - qr_size - 4, margin + 8)

    c.setFillColor(muted)
    c.setFont("Helvetica", 8)
    c.drawString(content_left + 4, margin + 38, "Scan QR code or visit the verification link to confirm authenticity.")
    c.drawString(content_left + 4, margin + 25, f"Verify: {verify_url}")
    c.setFillColor(royal_blue)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(content_left + 4, margin + 12, f"Official Electronic Report Card  |  {snapshot.verification_code}")

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer
