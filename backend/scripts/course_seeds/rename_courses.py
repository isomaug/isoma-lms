import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from courses.models import Course

def rename_courses():
    mapping = {
        'AI, Coding and Robotics - Stage 1': 'AI Explorers (Ages 6-8) - Stage 1',
        'AI, Coding and Robotics - Stage 2': 'AI Explorers (Ages 6-8) - Stage 2',
        'AI, Coding and Robotics - Stage 3': 'RoboCreators (Ages 8-10) - Stage 3',
        'AI, Coding and Robotics - Stage 4': 'RoboCreators (Ages 8-10) - Stage 4',
        'AI, Coding and Robotics - Stage 5': 'AI Engineers (Ages 10-12) - Stage 5',
        'AI, Coding and Robotics - Stage 6': 'AI Engineers (Ages 10-12) - Stage 6',
    }
    
    for old_title, new_title in mapping.items():
        try:
            course = Course.objects.get(title=old_title)
            course.title = new_title
            course.save()
            print(f"Renamed: {old_title} -> {new_title}")
        except Course.DoesNotExist:
            print(f"Course not found: {old_title}")

if __name__ == "__main__":
    rename_courses()
