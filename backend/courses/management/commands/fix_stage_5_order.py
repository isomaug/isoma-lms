from django.core.management.base import BaseCommand
from courses.models import Course, Lesson
import re

class Command(BaseCommand):
    help = "Fixes the chronological order of Stage 5 lessons and adds missing Lesson 2s."

    def get_week_and_lesson(self, title):
        match = re.search(r'Week\s*(\d+)(?:\s*-\s*Lesson\s*(\d+))?', title, re.IGNORECASE)
        if match:
            week = int(match.group(1))
            lesson = int(match.group(2)) if match.group(2) else 1
            return week, lesson
        return None, None

    def handle(self, *args, **options):
        self.stdout.write("Fixing chronological order and missing lessons for Stage 5...")
        c = Course.objects.filter(title__icontains='Stage 5').first()
        if not c:
            self.stdout.write(self.style.ERROR("Could not find Stage 5 course!"))
            return

        for m in c.modules.all():
            self.stdout.write(f"Processing Module: {m.title}")
            
            lessons = list(m.lessons.all())
            weeks = {}
            for l in lessons:
                w, ls = self.get_week_and_lesson(l.title)
                if w:
                    if w not in weeks:
                        weeks[w] = []
                    weeks[w].append((ls, l))
                    
            for w in range(1, 9):
                existing = weeks.get(w, [])
                l1 = next((l for ls, l in existing if ls == 1), None)
                l2 = next((l for ls, l in existing if ls == 2), None)
                
                if l1:
                    l1.title = f"Week {w} - Lesson 1"
                    l1.order = w * 10
                    l1.save(update_fields=['title', 'order'])
                
                if l2:
                    l2.title = f"Week {w} - Lesson 2"
                    l2.order = w * 10 + 1
                    l2.save(update_fields=['title', 'order'])
                elif l1:
                    # Clone l1 to make l2
                    new_l = Lesson.objects.get(id=l1.id)
                    new_l.pk = None
                    new_l.title = f"Week {w} - Lesson 2"
                    new_l.order = w * 10 + 1
                    new_l.save()
                    self.stdout.write(self.style.SUCCESS(f"Created {new_l.title} by cloning Lesson 1"))

            # Final pass to ensure order
            for l in m.lessons.all():
                w, ls = self.get_week_and_lesson(l.title)
                if w:
                    l.order = w * 10 + (ls - 1)
                    l.save(update_fields=['order'])
                    
        self.stdout.write(self.style.SUCCESS("Done fixing chronological order and missing lessons for Stage 5!"))
