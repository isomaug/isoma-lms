import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Module, Lesson, Cohort, Quiz, Question
from django.contrib.auth.models import User

def seed_cambridge_as_level():
    instructor, _ = User.objects.get_or_create(username='petergordonekebu', defaults={
        'first_name': 'Peter Gordon',
        'last_name': 'Ekebu',
        'email': 'peter@isoma.com'
    })

    title = "Cambridge International AS Level Information Technology (9626)"
    subtitle = "Official syllabus coverage: Data, Hardware, Flowcharts, Spreadsheets, Databases & Video Editing."
    description = """
**Welcome to Cambridge AS Level IT**

This comprehensive 9-month program is designed to cover the entire AS Level Information Technology (9626) syllabus. It prepares students for Paper 1 (Theory) and Paper 2 (Practical).

**What You Will Learn:**
- Data processing, quality of information, encryption, and validation/verification.
- Hardware, software, and managing the digital divide.
- Monitoring, control, algorithms, and flowchart design.
- Expert systems and their real-world applications.
- Advanced Spreadsheet modeling and data extraction.
- Relational Database design, normalization to 3NF, and data dictionaries.
- Professional video and audio editing techniques.
"""

    course_price = Decimal('9000000.00') # 180 hours * 50,000 UGX

    course, created = Course.objects.update_or_create(
        title=title,
        defaults={
            'subtitle': subtitle,
            'description': description.strip(),
            'assigned_instructor': instructor,
            'instructor_name': 'Peter Gordon Ekebu',
            'price_ugx': course_price,
            'level': 'advanced',
            'category': 'Information Technology',
            'language': 'English',
            'is_published': True,
        }
    )

    print(f"Course '{course.title}' created/updated.")

    # Modules
    modules_data = [
        {
            "title": "Topic 1: Data Processing and Information",
            "order": 1,
            "lessons": [
                {"title": "1.1 Data and Information", "content": "Differences between data and information. Direct vs indirect data sources."},
                {"title": "1.2 Quality of Information", "content": "Accuracy, relevance, age, level of detail, completeness."},
                {"title": "1.3 Encryption", "content": "Symmetric, asymmetric, TLS/SSL, IPsec."},
                {"title": "1.4 Checking the Accuracy of Data", "content": "Validation vs verification techniques (check digits, parity checks, etc)."},
                {"title": "1.5 Data Processing", "content": "Batch, online, and real-time processing methods."}
            ]
        },
        {
            "title": "Topic 2: Hardware and Software",
            "order": 2,
            "lessons": [
                {"title": "2.1 Mainframe and Supercomputers", "content": "Characteristics and uses (weather forecasting, quantum mechanics, etc)."},
                {"title": "2.2 System Software", "content": "Compilers, interpreters, linkers, device drivers, operating systems."},
                {"title": "2.3 Utility Software", "content": "Anti-virus, back-up, defragmentation, file management."},
                {"title": "2.4 Custom vs Off-the-shelf Software", "content": "Advantages, disadvantages, proprietary vs open-source."},
                {"title": "2.5 User Interfaces", "content": "CLI, GUI, dialogue, gesture interfaces."}
            ]
        },
        {
            "title": "Topic 3 & 4: Monitoring, Control & Algorithms",
            "order": 3,
            "lessons": [
                {"title": "3.1 Monitoring and Measurement", "content": "Sensors (light, temp, pressure, gas) and calibration."},
                {"title": "3.2 Control Technologies", "content": "Actuators, microprocessor-controlled systems."},
                {"title": "4.1 Algorithms and Pseudocode", "content": "Conditional branching, loops, pseudocode commands."},
                {"title": "4.2 Flowcharts", "content": "Symbols, editing, and identifying errors."}
            ]
        },
        {
            "title": "Topic 5, 6 & 7: eSecurity, Digital Divide & Expert Systems",
            "order": 4,
            "lessons": [
                {"title": "5.1 eSecurity & Personal Data", "content": "Preventing misuse (phishing, pharming), Malware types."},
                {"title": "6.1 The Digital Divide", "content": "Causes, effects, and impacted groups globally."},
                {"title": "7.1 Expert Systems", "content": "Components, backward vs forward chaining, scenarios."}
            ]
        },
        {
            "title": "Topic 8 & 9: Spreadsheets & Modelling (Practical)",
            "order": 5,
            "lessons": [
                {"title": "8.1 Creating and Testing a Spreadsheet", "content": "Validation, functions (VLOOKUP, COUNTIFS, IF), formatting, testing data."},
                {"title": "8.3 Using a Spreadsheet", "content": "Extracting, sorting, pivot tables, grouping."},
                {"title": "8.4 Graphs and Charts", "content": "Bar, pie, line, comparative charts, secondary axes."},
                {"title": "9.1 Modelling and Simulations", "content": "What-if analysis, goal seek, computer models for simulations."}
            ]
        },
        {
            "title": "Topic 10: Database and File Concepts (Practical)",
            "order": 6,
            "lessons": [
                {"title": "10.1 Creating a Relational Database", "content": "Data types, keys, referential integrity, relationships (1:1, 1:M)."},
                {"title": "10.2 Normalisation (1NF, 2NF, 3NF)", "content": "Transforming unnormalised data into 3NF."},
                {"title": "10.3 Data Dictionary", "content": "Identifying data types, constructing data dictionaries."},
                {"title": "10.4 File and Data Management", "content": "File formats, hierarchical, network, relational DBMS, MIS."}
            ]
        },
        {
            "title": "Topic 11: Video and Audio Editing (Practical)",
            "order": 7,
            "lessons": [
                {"title": "11.1 Video Editing", "content": "Aspect ratio, trimming, splicing, transitions, PiP, exporting formats."},
                {"title": "11.2 Audio Editing", "content": "Normalising, ducking, filtering (high/low pass), sample rates, compression (lossy/lossless)."}
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
        
        # Add normal lessons
        last_idx = 0
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
            last_idx = idx

        # Add the Past Paper Practice at the end of each module
        past_paper_lesson, _ = Lesson.objects.update_or_create(
            module=module,
            title=f"Past Paper Practice: {m_data['title']}",
            defaults={
                'lesson_text': "Review and solve exact Cambridge exam questions from previous years relating to this topic.",
                'order': last_idx + 1,
                'is_visible': True
            }
        )
        print(f"    Lesson '{past_paper_lesson.title}' created/updated.")

        # Create a Quiz for the past paper practice
        quiz, _ = Quiz.objects.update_or_create(
            lesson=past_paper_lesson,
            title=f"Cambridge Past Paper Questions - {m_data['title']}",
            defaults={
                'description': "Attempt these past paper questions to test your understanding.",
                'passing_score': 60,
                'points_reward': 100
            }
        )
        
        # Add a placeholder question
        Question.objects.update_or_create(
            quiz=quiz,
            text="[Placeholder] Describe two differences between validation and verification (4 marks).",
            defaults={'order': 1, 'points': 4}
        )

    # Create Cohort
    start_dt = date(2025, 9, 1)
    end_dt = start_dt + timedelta(days=9*30) # Roughly 9 months
    
    cohort, _ = Cohort.objects.update_or_create(
        course=course,
        name="AS Level IT - 2025/2026 Academic Year",
        defaults={
            'start_date': start_dt,
            'end_date': end_dt,
            'capacity_limit': 100,
            'price_override': course_price,
            'fixed_costs': Decimal('1000000.00'),
            'variable_cost_per_learner': Decimal('50000.00')
        }
    )
    cohort.instructors.set([instructor])
    print(f"  Cohort '{cohort.name}' created.")

    print("AS Level Course Seeding complete!")

if __name__ == "__main__":
    seed_cambridge_as_level()
