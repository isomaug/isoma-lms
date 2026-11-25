import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Module, Lesson, Cohort, Quiz, Question
from django.contrib.auth.models import User

def seed_cambridge_a_level():
    # Ensure no duplicates if re-run
    Course.objects.filter(title="Cambridge International A Level Information Technology (9626)").delete()

    instructor, _ = User.objects.get_or_create(username='petergordonekebu', defaults={
        'first_name': 'Peter Gordon',
        'last_name': 'Ekebu',
        'email': 'peter@isoma.com'
    })

    title = "Cambridge International A Level Information Technology (9626)"
    subtitle = "Granular coverage of the A-Level syllabus (Topics 12-21)."
    description = """
**Welcome to the Cambridge A Level IT Course**

This comprehensive 9-month program covers the second half of the Information Technology (9626) syllabus. It builds on the AS Level foundation to prepare students for Paper 3 (Advanced Theory) and Paper 4 (Advanced Practical).

**What You Will Learn:**
- IT in society, digital currencies, and data mining.
- New and emerging technologies (AI, VR, Blockchain).
- Communications technology, networking, and security.
- Project management and the System Life Cycle.
- Data analysis, visualization, and Mail Merge.
- Advanced graphics creation (Vector & Bitmap) and Animation.
- Programming for the web using JavaScript.
"""

    course_price = Decimal('9000000.00')

    course, _ = Course.objects.update_or_create(
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

    print(f"Created Course: '{course.title}'")

    modules_data = [
        {
            "title": "Topic 12: IT in Society",
            "order": 1,
            "lessons": [
                {
                    "title": "12.1a Types and Characteristics of Digital Currencies",
                    "content": "### What are Digital Currencies?\nDigital currencies exist only in electronic form. They are not tangible like paper bills or coins.\n\n**Types include:**\n1. **Digital/Electronic Currency**: Broad term for any money available in digital form.\n2. **Virtual Currency**: Issued by private developers or communities (e.g., in-game tokens).\n3. **Cryptocurrency**: Uses cryptography to secure transactions (e.g., Bitcoin).\n4. **Central Bank Digital Base Money (CBDC)**: Digital tokens issued by a nation's central bank.\n5. **Stored Value Cards**: Gift cards or prepaid transport cards.\n\n**Systems:**\n- **Centralised**: Controlled by a single entity (e.g., Debit/Credit cards, POS systems).\n- **Decentralised**: No central authority (e.g., Bitcoin, Litecoin, peer-to-peer networks)."
                },
                {
                    "title": "12.1b Blockchains and the Impact of Digital Currencies",
                    "content": "### Blockchains as Distributed Ledgers\nA blockchain is a decentralized, distributed database that maintains a continuously growing list of ordered records (blocks). Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data. This makes cryptocurrencies transparent and highly secure against tampering.\n\n### Impact and Risks\n- **Individuals**: Offers financial inclusion without a bank, but carries risks of extreme volatility and lost keys.\n- **Businesses**: Faster cross-border payments, but introduces regulatory uncertainty and cybersecurity threats.\n- **Governments**: Loss of control over monetary policy, challenges in collecting taxes, but potential for tracking illicit activities via public ledgers.\n- **Global Economy**: Can facilitate international trade but poses risks of systemic financial instability."
                },
                {
                    "title": "12.2a The Data Mining Process",
                    "content": "### What is Data Mining?\nData mining is the practice of analyzing large databases in order to generate new information, uncover hidden patterns, and discover relationships between variables.\n\n### Stages in the Data Mining Process (CRISP-DM Model)\n1. **Business Understanding**: Understanding the project objectives and requirements from a business perspective.\n2. **Data Understanding**: Initial data collection and familiarization to identify data quality problems or interesting subsets.\n3. **Data Preparation**: Constructing the final dataset (cleaning, formatting) from initial raw data.\n4. **Data Modelling**: Applying various modeling techniques (like decision trees or neural networks).\n5. **Evaluation**: Evaluating the model to ensure it achieves the business objectives.\n6. **Deployment**: Generating a report or implementing a repeatable data mining process across the enterprise."
                },
                {
                    "title": "12.2b Uses and Ethics of Data Mining",
                    "content": "### Uses of Data Mining\n- **National Security / Surveillance**: Identifying potential threats by analyzing communication patterns.\n- **Businesses**: Market basket analysis (e.g., finding that people who buy diapers also buy beer) to optimize store layouts and targeted ads.\n- **Healthcare**: Predicting patient outcomes, managing hospital resources, and discovering drug side-effects.\n- **Scientific Research**: Analyzing genomic data or climate patterns.\n\n### Advantages and Disadvantages\n- **Advantages**: Identifies highly profitable trends; keeps all information in one accessible place; improves efficiency.\n- **Disadvantages (Ethics)**: Severe privacy concerns (analyzing personal data without explicit consent); ethical issues regarding surveillance and profiling."
                },
                {
                    "title": "12.3 Social Networking Services",
                    "content": "### Types of Platforms\nChat rooms, Instant messaging (WhatsApp), Email, and Social media (forums, blogs, microblogs like X/Twitter).\n\n### Impacts\n- **On Individuals**: Keeping in contact with family, meeting new people. *Negatives*: Intellectual isolation (echo chambers), ideological polarization, stereotyping, cyberbullying, and negative mental health impacts.\n- **On Businesses**: Direct advertising and customer feedback. *Negatives*: Fake reviews or viral negative publicity.\n- **On Governments**: Distribution of useful information (weather warnings, regulations). *Negatives*: Spread of false/distorted information, requiring debate over censorship and free speech."
                },
                {
                    "title": "12.4 The Broad Impact of IT",
                    "content": "IT has revolutionized every sector of society:\n- **Manufacturing**: Automation, CAD/CAM, and supply chain tracking.\n- **Healthcare**: Electronic Health Records (EHR), telemedicine, and robotic surgery.\n- **Banking**: Online banking, instant loan approvals via algorithms.\n- **Entertainment**: Streaming services and interactive gaming.\n\n**Monitoring and Surveillance**: IT enables widespread monitoring of individuals (CCTV, web tracking) and organizations (employee monitoring), heavily impacting modern policing and security."
                },
                {
                    "title": "12.5 Technology Enhanced Learning",
                    "content": "### Delivery Methods\n- **Computer-Based Training (CBT)**: Interactive training software on local machines.\n- **Online Tutorials & Networked Courses**: Web-based learning.\n- **Massive Open Online Courses (MOOCs)**: Courses designed for unlimited participation (e.g., Coursera).\n- **Video-conferencing**: Live synchronous learning (e.g., Zoom classes).\n\n### Impacts\n- **Motivation**: Gamification and interactive multimedia can increase motivation.\n- **Autonomy**: Gives students control over their pace and location of learning.\n- **Disadvantages**: Requires self-discipline; lack of physical social interaction; reliance on internet infrastructure."
                }
            ]
        },
        {
            "title": "Topic 13: New and emerging technologies",
            "order": 2,
            "lessons": [
                {
                    "title": "13.1a AI, AR, and VR",
                    "content": "### Artificial Intelligence (AI)\nMachines programmed to mimic human cognitive functions like learning and problem-solving. Uses include natural language processing, predictive algorithms, and autonomous systems.\n\n### Augmented Reality (AR) vs Virtual Reality (VR)\n- **Virtual Reality (VR)**: A completely immersive, computer-generated environment (requiring a headset) that shuts out the real world.\n- **Augmented Reality (AR)**: Overlays digital information (images, text) onto the real-world view (e.g., smartphone apps, smart glasses)."
                },
                {
                    "title": "13.1b Robotics and Physical Tech",
                    "content": "### Robotics\nProgrammable machines capable of carrying out complex actions automatically. Used heavily in manufacturing, bomb disposal, and increasingly in domestic settings.\n\n### 3D Printing\nThe process of making a physical object from a three-dimensional digital model by laying down many successive thin layers of material. Revolutionizing rapid prototyping and custom manufacturing.\n\n### Wearable Computing\nSmartwatches, fitness trackers, and biometric sensors that connect to the Internet of Things (IoT)."
                },
                {
                    "title": "13.1c Emerging Data Storage and Infrastructure",
                    "content": "### Holographic and 4th Generation Optical Data Storage\nAdvanced optical storage using holographic techniques to store data in three dimensions, theoretically allowing terabytes of data on a single disc.\n\n### Molecular Data Storage\nUsing DNA molecules to store digital data. DNA is incredibly dense and can last thousands of years without degrading.\n\n### Internet of Things (IoT)\nA network of physical objects embedded with sensors, software, and network connectivity, allowing them to collect and exchange data (e.g., smart fridges, internet-connected thermostats)."
                },
                {
                    "title": "13.2 Impact of Emerging Technologies",
                    "content": "### Medicine and Healthcare\nEmerging tech is creating patient care monitoring systems, AI-driven diagnostics, advanced prosthetics, and tissue engineering (e.g., 3D printing artificial blood vessels).\n\n### The Environment\n- **Positives**: Smart grids optimize power consumption; wireless sensors track deforestation.\n- **Negatives**: The massive surge in e-waste (discarded electronics) containing toxic chemicals; the immense energy consumption of server farms powering AI and blockchain."
                }
            ]
        },
        {
            "title": "Topic 14: Communications technology",
            "order": 3,
            "lessons": [
                {"title": "14.1 Networks (LAN, WAN, VPN)", "content": "[Content to be detailed in next phase]"},
                {"title": "14.2 Network Components", "content": "[Content to be detailed in next phase]"},
                {"title": "14.3 Network Servers & 14.4 Cloud Computing", "content": "[Content to be detailed in next phase]"},
                {"title": "14.5 Data transmission & 14.6 Protocols", "content": "[Content to be detailed in next phase]"},
                {"title": "14.7 Wireless & 14.8 Mobile Systems", "content": "[Content to be detailed in next phase]"},
                {"title": "14.9 Network Security & 14.10 Disaster Recovery", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 15: Project management",
            "order": 4,
            "lessons": [
                {"title": "15.1 The Project Life Cycle", "content": "[Content to be detailed in next phase]"},
                {"title": "15.2 Project Management Software", "content": "[Content to be detailed in next phase]"},
                {"title": "15.3 Gantt, PERT and CPM", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 16: System life cycle",
            "order": 5,
            "lessons": [
                {"title": "16.1 Stages & 16.2 Analysis", "content": "[Content to be detailed in next phase]"},
                {"title": "16.3 Design (DFDs & Flowcharts)", "content": "[Content to be detailed in next phase]"},
                {"title": "16.4 Development and Testing", "content": "[Content to be detailed in next phase]"},
                {"title": "16.5 Implementation Methods", "content": "[Content to be detailed in next phase]"},
                {"title": "16.6 Documentation & 16.7 Evaluation", "content": "[Content to be detailed in next phase]"},
                {"title": "16.8 Software Dev Methods (Agile, RAD)", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 17: Data analysis and visualisation",
            "order": 6,
            "lessons": [
                {"title": "17.1 Cleaning and Consolidating Data", "content": "[Content to be detailed in next phase]"},
                {"title": "17.2 Pivot Tables and Charts", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 18: Mail merge",
            "order": 7,
            "lessons": [
                {"title": "18.1 Master Documents and Source Data", "content": "[Content to be detailed in next phase]"},
                {"title": "18.2 Conditional Rules (If, Then, Else)", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 19: Graphics creation",
            "order": 8,
            "lessons": [
                {"title": "19.1 Common Graphics Skills", "content": "[Content to be detailed in next phase]"},
                {"title": "19.2 Vector Graphics", "content": "[Content to be detailed in next phase]"},
                {"title": "19.3 Bitmap Images", "content": "[Content to be detailed in next phase]"},
                {"title": "19.4 Compression & 19.5 Text", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 20: Animation",
            "order": 9,
            "lessons": [
                {"title": "20.1 Animation Principles and Types", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 21: Programming for the web",
            "order": 10,
            "lessons": [
                {"title": "21.1 JavaScript Interactivity and DOM", "content": "[Content to be detailed in next phase]"},
                {"title": "21.2 Variables, Operators, and Expressions", "content": "[Content to be detailed in next phase]"},
                {"title": "21.3 Conditionals and Loops", "content": "[Content to be detailed in next phase]"}
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

        quiz, _ = Quiz.objects.update_or_create(
            lesson=past_paper_lesson,
            title=f"Cambridge Past Paper Questions - {m_data['title']}",
            defaults={
                'description': "Attempt these past paper questions to test your understanding.",
                'passing_score': 60,
                'points_reward': 100
            }
        )

    start_dt = date(2026, 9, 1)
    end_dt = start_dt + timedelta(days=9*30)
    
    cohort, _ = Cohort.objects.update_or_create(
        course=course,
        name="A Level IT - 2026/2027 Academic Year",
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

    print("A Level Course Seeding complete!")

if __name__ == "__main__":
    seed_cambridge_a_level()
