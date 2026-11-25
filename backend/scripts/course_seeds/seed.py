import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Skill, PersonalityTrait

def seed():
    # Seed Personality Traits
    personality_data = [
        {
            "icon": "Brain",
            "title": "Analytical Thinker",
            "description": "I break down complex problems into manageable logic, ensuring scalable architecture.",
            "color": "#3B82F6"
        },
        {
            "icon": "Zap",
            "title": "Fast Learner",
            "description": "Adaptability is my core. I quickly grasp new frameworks and paradigms to stay ahead.",
            "color": "#EAB308"
        },
        {
            "icon": "Users",
            "title": "Collaborative Spirit",
            "description": "I thrive in team environments, believing that great software is built through clear communication.",
            "color": "#10B981"
        }
    ]
    
    PersonalityTrait.objects.all().delete()
    for idx, item in enumerate(personality_data):
        PersonalityTrait.objects.create(
            title=item['title'],
            description=item['description'],
            icon_name=item['icon'],
            hex_color=item['color'],
            order=idx
        )
    print("Seeded Personality Traits.")

    # Seed Skills
    skills_data = [
        { "name": "React",       "icon": "SiReact",       "color": "#61DAFB" },
        { "name": "Python",      "icon": "SiPython",       "color": "#3776AB" },
        { "name": "Django",      "icon": "SiDjango",       "color": "#092E20" },
        { "name": "Node.js",     "icon": "SiNodedotjs",    "color": "#339933" },
        { "name": "PostgreSQL",  "icon": "SiPostgresql",   "color": "#336791" },
        { "name": "Tailwind CSS","icon": "SiTailwindcss",  "color": "#06B6D4" },
        { "name": "Git",         "icon": "SiGit",          "color": "#F05032" },
        { "name": "Docker",      "icon": "SiDocker",       "color": "#2496ED" }
    ]
    
    Skill.objects.all().delete()
    for idx, item in enumerate(skills_data):
        Skill.objects.create(
            name=item['name'],
            icon_name=item['icon'],
            hex_color=item['color'],
            order=idx
        )
    print("Seeded Skills.")

if __name__ == "__main__":
    seed()
