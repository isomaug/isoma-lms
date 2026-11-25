import os
import sys
import django
from decimal import Decimal

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Module, Lesson
from django.contrib.auth.models import User

def seed_advanced_course():
    # Get instructor
    instructor, _ = User.objects.get_or_create(username='petergordonekebu', defaults={
        'first_name': 'Peter Gordon',
        'last_name': 'Ekebu',
        'email': 'peter@isoma.com'
    })

    title = "Advanced CapCut: Motion Graphics, Keyframes & AI Mastery"
    subtitle = "Take your editing to professional levels with advanced CapCut techniques."
    description = """
**Welcome to the Advanced Series**

This course is designed for students who have completed the beginner series and are looking to offer professional editing services to high-paying clients or create top-tier social content. 

In this 8-week intensive program, we move beyond basic cuts and trims to explore the most powerful tools available in CapCut Desktop. You will master motion graphics, complex visual effects, professional color grading, sound design, and time-saving AI workflows.

**What You Will Learn:**
- Master keyframing to create custom, smooth animations for any element.
- Execute flawless cinematic speed ramping and time remapping.
- Utilize advanced masking, object tracking, and green screen techniques.
- Color grade footage like a professional, matching shots and optimizing skin tones.
- Build custom kinetic typography and animate logos.
- Design immersive audio experiences using Foley, EQ, and ducking.
- Automate your workflow with CapCut's cutting-edge AI features.
- Package your skills to pitch brands and price your freelance services effectively.
"""

    course, created = Course.objects.update_or_create(
        title=title,
        defaults={
            'subtitle': subtitle,
            'description': description.strip(),
            'assigned_instructor': instructor,
            'instructor_name': 'Peter Gordon Ekebu',
            'price_ugx': Decimal('350000.00'),
            'original_price_ugx': Decimal('450000.00'),
            'level': 'advanced',
            'category': 'Video Editing',
            'language': 'English',
            'is_published': True,
        }
    )

    print(f"Course '{course.title}' created/updated.")

    modules_data = [
        {
            "title": "Module 1: The Editor's Eye - Beyond the Basics",
            "order": 1,
            "lessons": [
                {
                    "title": "Session 1: Deconstructing Viral Hooks & Editing Patterns", 
                    "content": "Analyzing why top-performing videos succeed. We will break down high-retention editing patterns, visual hooks, and the psychology behind fast-paced storytelling."
                },
                {
                    "title": "Session 2: Advanced Workflow & Timeline Management", 
                    "content": "Organizing large projects, using compound clips, managing complex timelines with multiple video and audio tracks, and optimizing CapCut's performance settings for 4K workflows."
                }
            ]
        },
        {
            "title": "Module 2: Advanced Speed & Motion (Keyframing)",
            "order": 2,
            "lessons": [
                {
                    "title": "Session 3: Mastering Keyframes for Custom Animations", 
                    "content": "Understanding the principles of animation. You will learn to use keyframes to smoothly animate position, scale, opacity, and rotation of any asset, bringing static images and text to life."
                },
                {
                    "title": "Session 4: Speed Ramping & Time Remapping", 
                    "content": "Creating cinematic slow-motion and dynamic speed curves. We will cover optical flow, easing in and out of speed changes, and syncing speed ramps to musical beats."
                }
            ]
        },
        {
            "title": "Module 3: Complex Visual Effects & Masking",
            "order": 3,
            "lessons": [
                {
                    "title": "Session 5: Object Tracking and Text-behind-subject Effects", 
                    "content": "Using CapCut's tracking tools to pin text or graphics to moving objects. We will also learn the popular 'text behind subject' technique using layers and auto-cutout."
                },
                {
                    "title": "Session 6: Advanced Masking, Clone Effects & Green Screen", 
                    "content": "Mastering linear, split, and circular masks to create seamless transitions and clone effects. Deep dive into Chroma Key (green screen) optimization for clean, professional composites."
                }
            ]
        },
        {
            "title": "Module 4: Professional Color Grading & Aesthetics",
            "order": 4,
            "lessons": [
                {
                    "title": "Session 7: Understanding Scopes, LUTs, and Custom Correction", 
                    "content": "Moving beyond basic filters. We will learn how to read visual scopes (if available), apply and adjust custom LUTs, and use the HSL panel for precise color correction."
                },
                {
                    "title": "Session 8: Matching Shots & Cinematic Skin Tones", 
                    "content": "Ensuring visual consistency across different cameras and lighting conditions. Techniques to isolate and perfect natural skin tones while applying stylistic cinematic grades."
                }
            ]
        },
        {
            "title": "Module 5: Kinetic Typography & Motion Graphics",
            "order": 5,
            "lessons": [
                {
                    "title": "Session 9: Creating Custom Text Animations", 
                    "content": "Designing high-retention, dynamic subtitles and lower thirds from scratch. We will combine keyframing and text effects to create kinetic typography that commands attention."
                },
                {
                    "title": "Session 10: Animating Logos and Intro/Outro Sequences", 
                    "content": "Building professional, reusable brand assets. You will learn how to animate static logos and design captivating intro/outro sequences that you can template for clients."
                }
            ]
        },
        {
            "title": "Module 6: Sound Design & Advanced Audio Mixing",
            "order": 6,
            "lessons": [
                {
                    "title": "Session 11: The Art of Foley, Layering Sound Effects, and Ambience", 
                    "content": "Video is 50% audio. Learn how to build immersive soundscapes by layering ambient noise, wooshes, risers, and Foley sound effects to enhance visual transitions."
                },
                {
                    "title": "Session 12: Professional EQing, Noise Reduction, and Audio Ducking", 
                    "content": "Cleaning up bad audio, removing background noise/echo, applying vocal EQ for a rich podcast sound, and setting up precise audio ducking to balance voiceovers against background tracks."
                }
            ]
        },
        {
            "title": "Module 7: AI Deep Dives & Workflow Automation",
            "order": 7,
            "lessons": [
                {
                    "title": "Session 13: Advanced AI: Auto-Reframing, AI Avatars, and Vocal Isolation", 
                    "content": "Leveraging CapCut's latest AI capabilities. Learn to instantly convert horizontal videos to vertical with auto-reframe, utilize AI avatars for faceless channels, and isolate vocals from noisy environments."
                },
                {
                    "title": "Session 14: Batch Content Creation & Templates", 
                    "content": "Scaling your output. We will learn how to build reusable project templates and automate repetitive editing tasks to produce 30 days of content in a single sitting."
                }
            ]
        },
        {
            "title": "Module 8: Freelancing & The Business of Editing",
            "order": 8,
            "lessons": [
                {
                    "title": "Session 15: Creating Client Portfolios and Pitching Brands", 
                    "content": "How to package your new advanced skills. We will cover building a high-converting video portfolio and strategies for pitching your services to local businesses and international creators."
                },
                {
                    "title": "Session 16: Pricing Your Editing Services & Client Handoff", 
                    "content": "Understanding the market rates for advanced editing. We will discuss project-based vs retainer pricing, managing client revisions, and exporting/delivering final 4K assets professionally."
                }
            ]
        }
    ]

    for m_data in modules_data:
        module, _ = Module.objects.update_or_create(
            course=course,
            title=m_data['title'],
            defaults={'order': m_data['order']}
        )
        print(f"  Module '{module.title}' created/updated.")
        
        for idx, l_data in enumerate(m_data['lessons'], 1):
            lesson, _ = Lesson.objects.update_or_create(
                module=module,
                title=l_data['title'],
                defaults={
                    'lesson_text': l_data['content'],
                    'order': idx,
                    'is_visible': True
                }
            )
            print(f"    Lesson '{lesson.title}' created/updated.")

    print("Advanced Course Seeding complete!")

if __name__ == "__main__":
    seed_advanced_course()
