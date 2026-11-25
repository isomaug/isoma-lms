from django.core.management.base import BaseCommand
from courses.models import Certificate
from courses.pdf_generator import generate_certificate_pdf

class Command(BaseCommand):
    help = 'Regenerate all certificates with the new PDF format'

    def handle(self, *args, **options):
        certs = Certificate.objects.select_related("course", "module", "user").all()
        self.stdout.write(f"Found {certs.count()} certificates. Regenerating...")
        
        for c in certs:
            try:
                pdf_content_file = generate_certificate_pdf(
                    user=c.user,
                    course=c.course,
                    uuid_str=str(c.uuid),
                    name_on_certificate=c.name_on_certificate,
                    module=c.module
                )
                if pdf_content_file:
                    filename = f"certificate_{c.uuid}.pdf"
                    
                    if c.pdf_file:
                        c.pdf_file.delete(save=False)
                    
                    c.pdf_file.save(filename, pdf_content_file, save=True)
                    self.stdout.write(self.style.SUCCESS(f"Successfully regenerated {filename} for {c.user.username}"))
                else:
                    self.stdout.write(self.style.ERROR(f"Failed to generate PDF for Certificate {c.uuid}"))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error regenerating Certificate {c.uuid}: {e}"))
                
        self.stdout.write(self.style.SUCCESS("Finished regenerating certificates."))
