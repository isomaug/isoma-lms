import os
import django

# Provide the direct (non-pooler) Neon connection URL
os.environ.setdefault('DATABASE_URL', 'postgresql://neondb_owner:npg_I5BVyTn7OiQb@ep-blue-cloud-a6gp6rpf.us-west-2.aws.neon.tech/neondb?sslmode=require')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django.setup()

from finance_tracker.models import Category

quadrants = [
    "Employment (E Quadrant)",
    "Self-Employment (S Quadrant)",
    "Business (B Quadrant)",
    "Investment ( I Quadrant)"
]

for name in quadrants:
    cat, created = Category.objects.get_or_create(
        name=name,
        defaults={'is_income': True, 'is_expense': False}
    )
    if created:
        print(f"Created category: {name}")
    else:
        # Update existing to be income
        cat.is_income = True
        cat.is_expense = False
        cat.save()
        print(f"Updated category: {name}")

print("Seeding complete!")
