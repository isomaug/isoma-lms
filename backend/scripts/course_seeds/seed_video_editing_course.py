import os
import sys
import django
from decimal import Decimal
from pathlib import Path

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Module, Lesson, LessonMaterial
from django.contrib.auth.models import User

def seed_course():
    # Get instructor
    instructor, _ = User.objects.get_or_create(username='petergordonekebu', defaults={
        'first_name': 'Peter Gordon',
        'last_name': 'Ekebu',
        'email': 'peter@isoma.com'
    })

    title = "The complete beginner's guide to video editing for marketing"
    subtitle = "Start Making Videos Today. 8 Weeks, 16 Sessions, CapCut Desktop."
    description = """
**Welcome to the Beginner Series**

You do not need experience. You do not need expensive equipment. You do not need to be technical. You need curiosity, one hour twice a week, and this guide.

Video is the most powerful communication tool available to any business or creator right now. A short, well-made video can introduce you to thousands of potential customers, build genuine trust with your audience, and drive real revenue - all from your laptop, using free software.

This curriculum was designed from scratch for people who have never touched video editing software before. Every instruction is written step by step. Every term is explained the first time it appears. Every session is capped at exactly one hour so that learning never becomes overwhelming.

**What You Will Be Able to Do After 8 Weeks**
- Edit video footage confidently - trim, cut, rearrange, and pace your clips
- Add professional captions, titles, and text overlays to every video
- Colour grade your footage so it looks warm, cinematic, and polished
- Record, clean, and balance voiceover audio like a professional
- Build a recognisable brand identity - logo, colours, fonts, intro - for all your videos
- Write and structure video scripts that keep viewers watching
- Create hooks powerful enough to stop people scrolling on social media
- Export your finished video in the correct format for YouTube, Instagram, TikTok, and Facebook
- Use CapCut's AI tools to speed up your workflow significantly
- Plan a consistent content calendar and publish videos on a regular schedule
"""

    course, created = Course.objects.update_or_create(
        title=title,
        defaults={
            'subtitle': subtitle,
            'description': description.strip(),
            'assigned_instructor': instructor,
            'instructor_name': 'Peter Gordon Ekebu',
            'price_ugx': Decimal('250000.00'),
            'original_price_ugx': Decimal('350000.00'),
            'level': 'beginner',
            'category': 'Video Editing',
            'language': 'English',
            'is_published': True,
        }
    )

    print(f"Course '{course.title}' created/updated.")

    modules_data = [
        {
            "title": "Module 1: The Big Picture - Video & Marketing",
            "order": 1,
            "lessons": [
                {"title": "Why Video Dominates Modern Marketing", "content": "If a picture is worth a thousand words, a video is worth 1.8 million - according to Forrester Research. But the real reason video matters is simpler: people trust what they can see and hear."},
                {"title": "The Three-Second Rule", "content": "On every social media platform, users scroll through their feed at an average speed of about one post per 1.7 seconds. Your video has approximately three seconds to give a reason to stop scrolling."},
                {"title": "Understanding Video Platforms - Where Your Audience Lives", "content": "YouTube, Instagram, TikTok, Facebook, LinkedIn platform specifics."},
                {"title": "Video Types Every Beginner Should Know", "content": "Tutorials, Reviews, Vlogs, Explainers, Shorts/Reels."}
            ]
        },
        {
            "title": "Module 2: Your Equipment - What You Need",
            "order": 2,
            "lessons": [
                {"title": "The Minimum Viable Setup & Your Camera", "content": "Modern smartphones produce excellent video quality. Shoot in the highest quality your phone supports - typically 4K at 30fps."},
                {"title": "Lighting - The Most Important Factor", "content": "Good lighting is crucial for high quality video."},
                {"title": "Microphone - The Most Important Audio Investment", "content": "Viewers will forgive imperfect video quality. They will not forgive audio that is difficult to hear."},
                {"title": "Setting Up CapCut Desktop - Step by Step", "content": "Downloading and installing CapCut."}
            ]
        },
        {
            "title": "Module 3: Phase 1 - Interface & Basic Edits (Week 1 & 2)",
            "order": 3,
            "lessons": [
                {"title": "Session 1: Navigating CapCut Like a Pro", "content": "The Six Areas You Need to Know in CapCut."},
                {"title": "Session 2: Your First Real Edit - Trim, Cut, Export", "content": "Creating a clean, trimmed, exported video file."},
                {"title": "Session 3: Titles, Text, and Auto-Captions", "content": "Adding text overlays and auto-captions."},
                {"title": "Session 4: Music, Sound, and Audio Basics", "content": "Adding background music and managing sound levels."}
            ]
        },
        {
            "title": "Module 4: Phase 2 - Advanced Editing Techniques (Week 3 & 4)",
            "order": 4,
            "lessons": [
                {"title": "Session 5: Colour Correction and Filters", "content": "Adjusting visual qualities to create a consistent, intentional visual style."},
                {"title": "Session 6: Transitions and Visual Flow", "content": "Using transitions to make smooth cuts."},
                {"title": "Session 7: Understanding and Sourcing B-Roll", "content": "Secondary footage that supports and illustrates your main content."},
                {"title": "Session 8: Pacing - The Invisible Editor", "content": "The rhythm of your cuts. Choosing the right pace for your content."}
            ]
        },
        {
            "title": "Module 5: Phase 3 - Audio & Storytelling (Week 5 & 6)",
            "order": 5,
            "lessons": [
                {"title": "Session 9: Recording Your Best Voiceover", "content": "A warm, clear, confident voiceover builds trust and engagement."},
                {"title": "Session 10: Advanced Audio - Mixing and Balance", "content": "Balancing voiceover, sound effects, and music."},
                {"title": "Session 11: Writing Scripts That Keep Viewers Watching", "content": "Writing scripts that hold attention. A well-written script ensures you never ramble."},
                {"title": "Session 12: On-Camera Presence and Confidence", "content": "Practice, repetition, and understanding what looks good on camera."}
            ]
        },
        {
            "title": "Module 6: Phase 4 - Putting it All Together (Week 7 & 8)",
            "order": 6,
            "lessons": [
                {"title": "Session 13: Building Your Brand Identity in Video", "content": "Integrating logos, fonts, and brand colors."},
                {"title": "Session 14: Hooks and Calls to Action - The Money Skills", "content": "Creating powerful hooks to stop scrolling and clear CTAs."},
                {"title": "Session 15: Planning and Production Day", "content": "Organizing your shooting schedule."},
                {"title": "Session 16: The Full Edit - Bringing It All Together", "content": "A complete, polished marketing video."}
            ]
        },
        {
            "title": "Module 7: CapCut's AI Tools & Content Calendar",
            "order": 7,
            "lessons": [
                {"title": "Work Smarter with AI Tools", "content": "AI Background Removal, AI Smart Cut, AI Text-to-Video, AI Copywriting."},
                {"title": "Your Content Calendar - Publishing Consistently", "content": "Publishing one video per week for 52 weeks will grow your audience more than publishing ten exceptional videos in one month."},
                {"title": "Platform Deep Dives - Optimising for Each Channel", "content": "YouTube, Instagram Reels, TikTok, LinkedIn optimization."},
                {"title": "Analytics - Understanding Your Results", "content": "Data tells you what is working and what is not."}
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

    # Premium Resources
    module_premium, _ = Module.objects.update_or_create(
        course=course,
        title="Premium Resources & Trainer Guides",
        defaults={'order': 8}
    )
    print(f"  Module '{module_premium.title}' created/updated.")
    
    lesson_premium, _ = Lesson.objects.update_or_create(
        module=module_premium,
        title="CapCut Training Pricing Guide Uganda",
        defaults={
            'lesson_text': "This document provides a comprehensive pricing and course structure guide for Ugandan online trainers who want to offer an 8-week CapCut Video Editing training program.",
            'order': 1,
            'is_visible': True,
            'is_preview': False
        }
    )
    print(f"    Lesson '{lesson_premium.title}' created/updated.")
    
    import shutil
    # Copy the docx to lesson materials
    repo_root = Path(__file__).resolve().parent.parent
    source_file = repo_root / "resources" / "local" / "video-editing-lessons" / "CapCut_Training_Pricing_Guide_Uganda.docx"
    dest_dir = repo_root / "backend" / "media" / "lesson_materials"
    os.makedirs(dest_dir, exist_ok=True)
    dest_file = os.path.join(dest_dir, "CapCut_Training_Pricing_Guide_Uganda.docx")
    
    try:
        shutil.copy2(source_file, dest_file)
        # Create LessonMaterial
        LessonMaterial.objects.update_or_create(
            lesson=lesson_premium,
            title="CapCut Training Pricing Guide Uganda (PDF/DOCX)",
            defaults={
                'file': "lesson_materials/CapCut_Training_Pricing_Guide_Uganda.docx",
                'is_instructor_only': False
            }
        )
        print(f"      Material attached: CapCut_Training_Pricing_Guide_Uganda.docx")
    except Exception as e:
        print(f"      Failed to attach material: {e}")

    print("Seeding complete!")

if __name__ == "__main__":
    seed_course()
