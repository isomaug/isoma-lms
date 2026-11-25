import os
import sys
import django
from decimal import Decimal
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Module, Lesson, Cohort, Quiz, Question
from django.contrib.auth.models import User

def reseed_cambridge_as_level():
    # 1. Delete existing AS Level course to prevent duplicates
    Course.objects.filter(title="Cambridge International AS Level Information Technology (9626)").delete()
    print("Deleted old AS Level course if it existed.")

    instructor, _ = User.objects.get_or_create(username='petergordonekebu', defaults={
        'first_name': 'Peter Gordon',
        'last_name': 'Ekebu',
        'email': 'peter@isoma.com'
    })

    title = "Cambridge International AS Level Information Technology (9626)"
    subtitle = "Granular, comprehensive coverage of the official syllabus."
    description = """
**Welcome to the highly structured Cambridge AS Level IT Course**

This comprehensive 9-month program breaks down the entire AS Level Information Technology (9626) syllabus into bite-sized, granular lessons. Every single syllabus requirement is covered in its own dedicated lesson to prevent overwhelm and ensure deep understanding.
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
            "title": "Topic 1: Data Processing and Information",
            "order": 1,
            "lessons": [
                {
                    "title": "1.1a Differences Between Data and Information",
                    "content": "### What is Data?\nData consists of raw facts, figures, or symbols that have no meaning on their own. For example, the number '42' is just data.\n\n### What is Information?\nInformation is data that has been processed, interpreted, or given context to make it meaningful. For example, if we say 'The temperature is 42 degrees Celsius', the number 42 is now information because it has context (temperature) and meaning (it is very hot).\n\n**Key Concept**: Data becomes information through context and meaning."
                },
                {
                    "title": "1.1b Uses of Direct and Indirect Data",
                    "content": "### Direct Data (Primary Data)\nDirect data is data collected specifically for the purpose of a current investigation or task. It is collected 'first-hand'.\n**Suitability**: It is highly suitable when you need specific, accurate, and up-to-date information tailored exactly to your needs.\n\n### Indirect Data (Secondary Data)\nIndirect data is data that was collected by someone else for a different purpose but is now being used for your current task. \n**Suitability**: It is highly suitable when time or budget is limited, as it is usually quicker and cheaper to obtain than collecting new direct data."
                },
                {
                    "title": "1.1c Sources of Direct Data",
                    "content": "Direct data can be gathered using several methods:\n\n1. **Questionnaires**: A set of written questions distributed to a target audience. Useful for gathering large amounts of data quickly.\n2. **Interviews**: Face-to-face or digital conversations. Useful for gathering in-depth, qualitative data where the interviewer can ask follow-up questions.\n3. **Data Logging**: Using computers and sensors to automatically record environmental data over time (e.g., temperature every hour).\n4. **Observation**: Watching and recording a process or behavior as it happens without interfering."
                },
                {
                    "title": "1.1d Sources of Indirect Data",
                    "content": "Indirect data is sourced from existing repositories:\n\n1. **Weather Data**: Historical climate records collected by meteorological departments.\n2. **Census Data**: Population statistics collected by governments every decade.\n3. **Electoral Register**: A list of people registered to vote in an area.\n4. **Businesses collecting personal information**: Data collected by companies (like social media usage or loyalty card data) that is later sold or used by third parties for marketing.\n5. **Research from textbooks, journals, and websites**: Academic or published data used for a literature review."
                },
                {
                    "title": "1.1e Advantages and Disadvantages of Direct and Indirect Data",
                    "content": "### Direct Data\n- **Advantages**: Exactly matches the user's needs; data is up-to-date; the collection method is known and trusted.\n- **Disadvantages**: Can be very expensive and time-consuming to collect; requires a large sample size to be statistically significant.\n\n### Indirect Data\n- **Advantages**: Often cheaper and faster to obtain; vast amounts of historical data are readily available.\n- **Disadvantages**: May be out-of-date; might not perfectly match the specific needs of the current task; the original collection method might have been flawed or biased."
                },
                {
                    "title": "1.2 Factors Affecting the Quality of Information",
                    "content": "High-quality information is essential for accurate decision making. The key factors include:\n\n1. **Accuracy**: The information must be correct and free from errors.\n2. **Relevance**: The information must directly apply to the problem being solved. Extra, unrelated information degrades quality.\n3. **Age**: Information must be up-to-date. Outdated information (e.g., last year's stock prices) is low quality.\n4. **Level of Detail**: It must be detailed enough to be useful, but not so detailed that it overwhelms the user.\n5. **Completeness**: All necessary parts of the information must be present. Missing data can lead to wrong conclusions."
                },
                {
                    "title": "1.3a The Need for Encryption",
                    "content": "### Why Encrypt Data?\nEncryption is the process of scrambling data into an unreadable format (ciphertext) using an algorithm and a key. We need encryption to ensure **Confidentiality** and **Security**. If a hacker intercepts data as it travels across the internet, or steals a hard drive, they will not be able to understand the data without the decryption key. This is critical for protecting passwords, bank details, and personal communications."
                },
                {
                    "title": "1.3b Methods of Encryption",
                    "content": "### Symmetric Encryption\nUses a **single private key** to both encrypt and decrypt the data. Both the sender and receiver must have the same key. \n*Advantage*: Very fast processing.\n*Disadvantage*: Securely sharing the key with the receiver is difficult (key distribution problem).\n\n### Asymmetric Encryption\nUses a mathematically linked pair of keys: a **Public Key** (shared with everyone) and a **Private Key** (kept secret). Data encrypted with the public key can *only* be decrypted by the matching private key.\n*Advantage*: Highly secure, solves the key distribution problem.\n*Disadvantage*: Slower and requires more processing power."
                },
                {
                    "title": "1.3c Encryption Protocols",
                    "content": "### TLS/SSL\nTransport Layer Security (and its predecessor, Secure Socket Layer) are protocols used to secure communication over a computer network, most commonly between a web browser (client) and a web server. It ensures that credit card details entered on a website are encrypted before being sent.\n\n### IPsec\nInternet Protocol Security is a suite of protocols used to secure IP communications by authenticating and encrypting each IP packet of a communication session. It is widely used to set up Virtual Private Networks (VPNs)."
                },
                {
                    "title": "1.4a Validation vs Verification",
                    "content": "Data must be checked when it enters a system to ensure it is correct.\n\n**Validation**: An automatic computer check to ensure that data entered is sensible and reasonable. It does *not* check if the data is correct. (e.g., checking that an age is between 0 and 120).\n\n**Verification**: A check to ensure that data entered exactly matches the original source document. It checks for correctness (e.g., ensuring you didn't mistype your password)."
                },
                {
                    "title": "1.4b Methods of Validation",
                    "content": "1. **Presence Check**: Ensures a required field is not left blank.\n2. **Range Check**: Ensures data falls between an upper and lower boundary (e.g., percentage between 0-100).\n3. **Type Check**: Ensures the data is the correct data type (e.g., letters are not entered in an age field).\n4. **Length Check**: Ensures data is exactly or up-to a specific number of characters (e.g., password must be at least 8 characters).\n5. **Format/Picture Check**: Ensures data follows a specific pattern (e.g., a postcode or email format).\n6. **Check Digit**: An extra digit added to the end of a number calculated from the other digits, used to detect transposition errors (e.g., in barcodes).\n7. **Lookup Check**: Checks if the entered value exists in a predefined list or table.\n8. **Consistency Check**: Compares two fields to ensure they logically make sense together (e.g., Date of Birth and Age).\n9. **Limit Check**: Similar to a range check, but only checks one boundary (e.g., greater than zero)."
                },
                {
                    "title": "1.4c Methods of Verification",
                    "content": "1. **Visual Checking**: The user manually reads the screen and compares it to the original paper document before submitting.\n2. **Double Data Entry**: The data is typed in twice (often by two different people). The computer compares the two inputs and flags any differences (e.g., 'Confirm Password' fields).\n3. **Parity Check**: A bit added to a byte to ensure the total number of 1s is either odd or even, checking for transmission errors.\n4. **Checksum**: A mathematical value calculated from the block of data before transmission and recalculated upon arrival to check for corruption.\n5. **Hash Total / Control Total**: Adding up values in a batch of records (like invoice totals) to ensure no records were lost during processing."
                },
                {
                    "title": "1.5 Data Processing Methods",
                    "content": "1. **Batch Processing**: Data is collected over time into a 'batch' and then processed all at once without human intervention. Used for tasks where immediate results aren't needed, like monthly payroll or utility billing.\n\n2. **Online Processing**: Data is processed immediately as it is entered by a user. Used for electronic funds transfers and online shopping, where the user needs immediate confirmation.\n\n3. **Real-time Processing**: Data is processed within a guaranteed, strict timeframe (usually milliseconds), and the output continuously affects the input. Crucial for life-or-death or safety systems, like aircraft guidance, smart motorways, and burglar alarms."
                }
            ]
        },
        {
            "title": "Topic 2: Hardware and Software",
            "order": 2,
            "lessons": [
                {
                    "title": "2.1a Mainframe Computers",
                    "content": "### Mainframes\nMainframes are massive, highly reliable computers designed to process vast amounts of input/output data simultaneously. \n\n**Characteristics**:\n- **Longevity and RAS**: Built for Reliability, Availability, and Serviceability. They can run for decades without downtime.\n- **Throughput**: Excellent at handling huge volumes of input/output and transactions.\n- **Fault Tolerance**: They feature redundant components so if a processor fails, another takes over instantly.\n\n**Uses**: Census data processing, airline booking systems, bank transaction processing, and large-scale consumer statistics."
                },
                {
                    "title": "2.1b Supercomputers",
                    "content": "### Supercomputers\nSupercomputers are the fastest computers in the world, designed to perform incredibly complex mathematical calculations very quickly.\n\n**Characteristics**:\n- **Performance Metrics**: Measured in FLOPS (Floating Point Operations Per Second) rather than MIPS (Millions of Instructions Per Second).\n- **Processors**: Contains thousands of parallel processors working on the same problem.\n- **Heat Maintenance**: Generates immense heat, requiring advanced liquid cooling systems.\n\n**Uses**: Weather forecasting, climate research, quantum mechanics, and simulating nuclear explosions."
                },
                {
                    "title": "2.2a System Software Overview",
                    "content": "System software is the software designed to run a computer's hardware and provide a platform for applications to run.\n\n1. **Operating Systems (OS)**: Manages hardware, memory, multitasking, and provides a user interface (e.g., Windows, Linux).\n2. **Device Drivers**: Small programs that tell the operating system how to communicate with a specific piece of hardware (e.g., a printer driver).\n3. **Utilities**: Maintenance programs that keep the system running smoothly (discussed in 2.3)."
                },
                {
                    "title": "2.2b Compilers, Interpreters, and Linkers",
                    "content": "To translate human-readable high-level code into machine code (0s and 1s), computers use translators:\n\n1. **Compiler**: Translates the entire source code into an executable file all at once. Fast execution, but debugging is harder because errors are shown at the end.\n2. **Interpreter**: Translates and executes the code line-by-line. Slower execution, but excellent for debugging because it stops exactly where the error occurs.\n3. **Linker**: A program that takes one or more object files generated by a compiler and combines them into a single executable program, linking necessary library files."
                },
                {
                    "title": "2.3 Utility Software",
                    "content": "Utility programs help maintain and secure the computer:\n\n1. **Anti-virus**: Scans for, isolates, and removes malicious software.\n2. **Back-up Utilities**: Automatically copies important files to a secondary storage device to prevent data loss.\n3. **Data Compression**: Reduces file sizes to save disk space and speed up network transmission.\n4. **Disk Defragmentation**: Reorganizes fragmented files on a magnetic hard drive so they are stored in contiguous blocks, speeding up read/write access.\n5. **Formatting**: Prepares a storage device for initial use, creating the file system structure."
                },
                {
                    "title": "2.4 Custom vs Off-the-Shelf Software",
                    "content": "### Off-the-Shelf Software\nPre-written, mass-market software (e.g., Microsoft Word).\n- **Advantages**: Available immediately; relatively cheap due to shared development costs; well-tested and bug-free; huge community support.\n- **Disadvantages**: May have unnecessary features; might not perfectly fit specific business workflows.\n\n### Custom-Written (Bespoke) Software\nSoftware built from scratch for a specific client.\n- **Advantages**: Exactly matches the business requirements; no unnecessary bloatware; can integrate seamlessly with existing legacy systems.\n- **Disadvantages**: Extremely expensive; takes months or years to develop; client relies entirely on the developer for support and bug fixes."
                },
                {
                    "title": "2.5 User Interfaces",
                    "content": "1. **Command Line Interface (CLI)**: Users type text commands. Requires learning syntax, but uses very little memory and is extremely fast for expert users.\n2. **Graphical User Interface (GUI)**: Uses Windows, Icons, Menus, and Pointers (WIMP). Intuitive, beginner-friendly, but requires more RAM and processing power.\n3. **Dialogue Interface**: Also known as conversational interfaces (e.g., Siri, Alexa). Users interact using natural spoken language.\n4. **Gesture-Based Interface**: Recognizes human physical movements (swipes, pinches, waves) to control the system (e.g., VR headsets, modern smartphones)."
                }
            ]
        },
        # Topics 3 through 11 will have the structure seeded, awaiting detailed content generation in the next phase
        {
            "title": "Topic 3: Monitoring and Control",
            "order": 3,
            "lessons": [
                {"title": "3.1 Sensors and Calibration", "content": "[Content to be detailed in next phase]"},
                {"title": "3.2 Actuators and Microprocessor Control", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 4: Algorithms and Flowcharts",
            "order": 4,
            "lessons": [
                {"title": "4.1 Pseudocode Constructs", "content": "[Content to be detailed in next phase]"},
                {"title": "4.2 Flowchart Design", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 5: eSecurity",
            "order": 5,
            "lessons": [
                {"title": "5.1 Keeping Personal Data Secure", "content": "[Content to be detailed in next phase]"},
                {"title": "5.2 Types and Consequences of Malware", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 6: The Digital Divide",
            "order": 6,
            "lessons": [
                {"title": "6.1 Causes and Effects of the Digital Divide", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 7: Expert Systems",
            "order": 7,
            "lessons": [
                {"title": "7.1 Components and Chaining", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 8: Spreadsheets",
            "order": 8,
            "lessons": [
                {"title": "8.1 Creating and Formatting", "content": "[Content to be detailed in next phase]"},
                {"title": "8.2 Formulas and Functions", "content": "[Content to be detailed in next phase]"},
                {"title": "8.3 Summarising and Extracting Data", "content": "[Content to be detailed in next phase]"},
                {"title": "8.4 Graphs and Charts", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 9: Modelling",
            "order": 9,
            "lessons": [
                {"title": "9.1 What-if Analysis and Simulations", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 10: Database and File Concepts",
            "order": 10,
            "lessons": [
                {"title": "10.1 Relational Database Creation", "content": "[Content to be detailed in next phase]"},
                {"title": "10.2 Normalisation (1NF, 2NF, 3NF)", "content": "[Content to be detailed in next phase]"},
                {"title": "10.3 Data Dictionary", "content": "[Content to be detailed in next phase]"},
                {"title": "10.4 File Management Systems", "content": "[Content to be detailed in next phase]"}
            ]
        },
        {
            "title": "Topic 11: Video and Audio Editing",
            "order": 11,
            "lessons": [
                {"title": "11.1 Video Editing Skills", "content": "[Content to be detailed in next phase]"},
                {"title": "11.2 Audio Editing Skills", "content": "[Content to be detailed in next phase]"}
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

    # Re-create Cohort
    start_dt = date(2025, 9, 1)
    end_dt = start_dt + timedelta(days=9*30)
    
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

    print("AS Level Detailed Reseeding complete!")

if __name__ == "__main__":
    reseed_cambridge_as_level()
