import os
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from django.core.files.base import ContentFile
from django.utils import timezone
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from django.conf import settings
from PIL import Image
from reportlab.graphics.barcode import qr
from reportlab.graphics import renderPDF
from reportlab.graphics.shapes import Drawing

def register_fonts():
    fonts_dir = os.path.join(settings.BASE_DIR, "static", "fonts")
    
    # Try to register custom fonts, fallback to Helvetica if files are missing
    try:
        pdfmetrics.registerFont(TTFont('Lexend', os.path.join(fonts_dir, 'Lexend.ttf')))
        pdfmetrics.registerFont(TTFont('Poppins', os.path.join(fonts_dir, 'Poppins-Regular.ttf')))
        pdfmetrics.registerFont(TTFont('Poppins-Bold', os.path.join(fonts_dir, 'Poppins-Bold.ttf')))
        return True
    except Exception as e:
        print(f"Warning: Could not load custom fonts: {e}")
        return False

def draw_image(c, image_field, x, y, max_width, max_height, preserve_aspect=True):
    """Helper to draw an ImageField onto the canvas, respecting aspect ratio"""
    if not image_field or not image_field.name:
        return
    try:
        path = image_field.path
        if os.path.exists(path):
            if preserve_aspect:
                img = Image.open(path)
                iw, ih = img.size
                aspect = iw / ih
                
                # Fit within max_width/max_height
                if max_width / aspect <= max_height:
                    w = max_width
                    h = w / aspect
                else:
                    h = max_height
                    w = h * aspect
                    
                # Center horizontally around x
                c.drawImage(path, x - w/2.0, y, width=w, height=h, mask='auto')
            else:
                c.drawImage(path, x - max_width/2.0, y, width=max_width, height=max_height, mask='auto')
    except Exception as e:
        print(f"Warning: Could not draw image {image_field}: {e}")

def generate_certificate_pdf(user, course, uuid_str, name_on_certificate=None, is_sample=False, module=None, total_xp=0):
    has_custom_fonts = register_fonts()
    
    font_bold = "Poppins-Bold" if has_custom_fonts else "Helvetica-Bold"
    font_regular = "Lexend" if has_custom_fonts else "Helvetica"
    font_poppins = "Poppins" if has_custom_fonts else "Helvetica"

    # If total_xp not passed, compute from UserXP
    if not total_xp and user and user.is_authenticated and course:
        from .models import UserXP
        user_xp_obj = UserXP.objects.filter(user=user, course=course).first()
        if user_xp_obj:
            total_xp = user_xp_obj.total_xp
    
    buffer = BytesIO()
    
    # A4 Landscape
    c = canvas.Canvas(buffer, pagesize=landscape(A4))
    width, height = landscape(A4)
    
    # Background (subtle premium off-white)
    c.setFillColor(colors.HexColor("#f8fafc"))
    c.rect(0, 0, width, height, fill=True, stroke=False)
    
    # Outer Border (Elegant Navy)
    c.setStrokeColor(colors.HexColor("#0f172a"))
    c.setLineWidth(5)
    c.rect(0.5 * inch, 0.5 * inch, width - 1 * inch, height - 1 * inch, fill=False, stroke=True)
    
    # Inner Border (Gold Accent)
    c.setStrokeColor(colors.HexColor("#ca8a04"))
    c.setLineWidth(1)
    c.rect(0.6 * inch, 0.6 * inch, width - 1.2 * inch, height - 1.2 * inch, fill=False, stroke=True)
    
    # Title
    c.setFillColor(colors.HexColor("#0f172a"))
    c.setFont(font_bold, 42)
    c.drawCentredString(width / 2.0, height - 2.2 * inch, "CERTIFICATE OF COMPLETION")
    
    # Subtitle
    c.setFont(font_regular, 16)
    c.setFillColor(colors.HexColor("#64748b"))
    c.drawCentredString(width / 2.0, height - 3.0 * inch, "This is to certify that")
    
    # Name
    c.setFont(font_bold, 36)
    c.setFillColor(colors.HexColor("#ca8a04")) # Gold name
    name = name_on_certificate or f"{user.first_name} {user.last_name}".strip() or user.username
    c.drawCentredString(width / 2.0, height - 4.0 * inch, name)
    
    # Body text
    c.setFont(font_regular, 16)
    c.setFillColor(colors.HexColor("#64748b"))
    completion_text = "has successfully completed the term" if module else "has successfully completed the course"
    c.drawCentredString(width / 2.0, height - 4.8 * inch, completion_text)
    
    # Course/Term Title
    title_text = f"{course.title} - {module.title}" if module else course.title
    title_font_size = 28
    c.setFont(font_bold, title_font_size)
    text_width = c.stringWidth(title_text, font_bold, title_font_size)
    max_width = width - 2.5 * inch
    while text_width > max_width and title_font_size > 12:
        title_font_size -= 2
        c.setFont(font_bold, title_font_size)
        text_width = c.stringWidth(title_text, font_bold, title_font_size)
        
    c.setFillColor(colors.HexColor("#0f172a"))
    c.drawCentredString(width / 2.0, height - 5.5 * inch, title_text)
    
    # Footer Left (Date)
    c.setFont(font_poppins, 12)
    c.setFillColor(colors.HexColor("#475569"))
    date_str = timezone.now().strftime("%B %d, %Y")
    
    # Draw Signature or Name
    signature_center_x = width - 2.5 * inch
    signature_y = 1.6 * inch
    
    if hasattr(course, 'certificate_signature') and course.certificate_signature:
        draw_image(c, course.certificate_signature, signature_center_x, signature_y, 2 * inch, 1 * inch)
    else:
        c.setFont(font_poppins, 14)
        c.drawCentredString(signature_center_x, signature_y + 0.3 * inch, course.instructor_name or "Peter Gordon Ekebu")
        
    c.line(width - 3.8 * inch, 1.5 * inch, width - 1.2 * inch, 1.5 * inch)
    c.setFont(font_regular, 10)
    c.drawCentredString(signature_center_x, 1.2 * inch, "Instructor")
    
    # Draw Date line
    date_center_x = 2.5 * inch
    c.setFont(font_poppins, 14)
    c.drawCentredString(date_center_x, signature_y + 0.3 * inch, date_str)
    c.line(1.2 * inch, 1.5 * inch, 3.8 * inch, 1.5 * inch)
    c.setFont(font_regular, 10)
    c.drawCentredString(date_center_x, 1.2 * inch, "Date Issued")
    
    # Draw Seal
    seal_center_x = width / 2.0
    seal_y = 1.2 * inch
    if hasattr(course, 'certificate_seal') and course.certificate_seal:
        draw_image(c, course.certificate_seal, seal_center_x, seal_y, 1.5 * inch, 1.5 * inch)
    else:
        # Fallback drawn badge
        c.setFillColor(colors.HexColor("#ca8a04"))
        c.circle(seal_center_x, seal_y + 0.7 * inch, 0.6 * inch, fill=True, stroke=False)
        c.setFillColor(colors.HexColor("#f8fafc"))
        c.setFont(font_bold, 20)
        c.drawCentredString(seal_center_x, seal_y + 0.6 * inch, "★")

    # Footer Center (Total XP)
    base_y = 1.35 * inch

    if total_xp > 0:
        c.setFont(font_bold, 11)
        c.setFillColor(colors.HexColor("#ca8a04"))
        c.drawCentredString(width / 2.0, base_y + 0.2 * inch, f"★ TOTAL TERM XP EARNED: {total_xp} XP ★")

    # Verification QR Code
    qr_code = qr.QrCodeWidget(f"https://petergordonekebu.com/verify?id={uuid_str}")
    bounds = qr_code.getBounds()
    qr_w = bounds[2] - bounds[0]
    qr_size = 45  # Slightly smaller to fit nicely below seal
    scale = qr_size / qr_w
    
    d = Drawing(qr_size, qr_size, transform=[scale, 0, 0, scale, 0, 0])
    d.add(qr_code)
    
    # Place it below the seal (seal starts at 1.2 inch)
    qr_y = 0.5 * inch 
    renderPDF.draw(d, c, width / 2.0 - qr_size / 2.0, qr_y)

    if is_sample:
        c.saveState()
        # Light grey/transparent color
        c.setFillColor(colors.Color(0.5, 0.5, 0.5, alpha=0.15))
        c.setFont(font_bold, 150)
        c.translate(width / 2.0, height / 2.0)
        c.rotate(30)
        c.drawCentredString(0, -50, "SAMPLE")
        c.restoreState()

    c.showPage()
    c.save()
    
    buffer.seek(0)
    return ContentFile(buffer.read(), name=f"certificate_{uuid_str}.pdf")
