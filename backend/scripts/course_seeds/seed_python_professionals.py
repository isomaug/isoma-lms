"""
Seed script for: Coding for Professionals
Run: python seed_python_professionals.py
"""
import os
import sys
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from courses.models import Course, Module, Lesson, Quiz, Question, Choice
from django.contrib.auth.models import User


def seed():
    instructor = User.objects.filter(is_superuser=True).first()
    if not instructor:
        instructor, _ = User.objects.get_or_create(
            username='petergordonekebu',
            defaults={'first_name': 'Peter Gordon', 'last_name': 'Ekebu'}
        )

    # ── COURSE ────────────────────────────────────────────────
    description = """
## Welcome, Professional

You are brilliant at what you do. You diagnose patients, argue cases, design buildings, manage budgets. But every week, hours of your life disappear into repetitive tasks that a few lines of code could handle in seconds.

This is not a course about becoming a software developer. This is a course about giving yourself a superpower.

**Python** is the world's most popular programming language, and there is a reason doctors, lawyers, architects, accountants, and researchers around the globe are learning it: it is shockingly easy to read, incredibly powerful, and it can automate almost anything you do on a computer.

### What Makes This Course Different

Most "Learn Python" courses are built by developers, for developers. They teach you to build web apps and pass coding interviews. That is not what you need.

This course was built specifically for working professionals. Every example comes from real workplaces - clinics, law firms, construction sites, offices. You will not build a to-do app. You will build tools that actually save you time on Monday morning.

### What You Will Be Able to Do After 6 Weeks

- Write Python scripts that automate repetitive document tasks
- Read and clean messy data from Excel spreadsheets and CSV files
- Generate charts, reports, and summaries automatically
- Extract text from PDFs and create Word documents with code
- Use Python alongside AI tools to 10x your productivity
- Confidently talk to developers and IT teams about technical solutions

**No prior coding experience required. We start from absolute zero.**
""".strip()

    what_you_learn = [
        "Write Python scripts from scratch - no prior coding experience required",
        "Think algorithmically - break any professional problem into solvable steps",
        "Automate repetitive document tasks (Excel reports, PDF extraction, email drafts)",
        "Clean, analyse, and visualise real-world data from your profession",
        "Build small command-line tools that save you hours every week",
        "Understand enough programming to confidently talk to developers and IT teams",
        "Use Python alongside AI tools (like ChatGPT) to supercharge your productivity",
    ]

    requirements = [
        "A laptop or desktop computer (Windows, Mac, or Linux)",
        "No prior programming experience - we start from absolute zero",
        "Curiosity and willingness to type things that look strange at first",
        "1-2 hours per week for practice",
    ]

    who_is_for = [
        "Doctors, nurses, and healthcare professionals who want to automate patient data tasks",
        "Lawyers and paralegals drowning in document review",
        "Architects, engineers, and quantity surveyors who want to automate calculations",
        "Any professional who has ever thought 'there must be a faster way to do this'",
        "Career switchers exploring whether tech is right for them",
    ]

    course, created = Course.objects.update_or_create(
        slug="coding-for-professionals",
        defaults={
            'title': "Coding for Professionals: Automate Your Work",
            'subtitle': "A doctor, lawyer, or architect walks into a coding class... and walks out automating their entire workday.",
            'description': description,
            'what_you_learn': what_you_learn,
            'requirements': requirements,
            'who_is_for': who_is_for,
            'assigned_instructor': instructor,
            'instructor_name': 'Peter Gordon Ekebu',
            'price_ugx': Decimal('370000.00'),
            'original_price_ugx': Decimal('500000.00'),
            'level': 'beginner',
            'category': 'Professional Development',
            'language': 'English',
            'is_published': True,
        }
    )
    action = "CREATED" if created else "UPDATED"
    print(f"[{action}] Course: {course.title}")

    PLAYGROUND_URL = "https://www.programiz.com/python-programming/online-compiler/"

    # ══════════════════════════════════════════════════════════
    # MODULE 1: Your First Line of Code
    # ══════════════════════════════════════════════════════════
    m1, _ = Module.objects.update_or_create(
        course=course, title="Module 1: Your First Line of Code",
        defaults={'order': 1}
    )
    print(f"  Module: {m1.title}")

    # ── Lesson 1.1 ────────────────────────────────────────────
    Lesson.objects.update_or_create(
        module=m1, title="Why Every Professional Should Learn to Code",
        defaults={
            'order': 1, 'duration_minutes': 15, 'is_preview': True,
            'playground_type': '',
            'overview': """### Objectives for: Why Every Professional Should Learn to Code
* Understand why programming is relevant to YOUR profession - not just to tech workers
* See real examples of doctors, lawyers, and architects using Python
* Get motivated (without the hype) about what 6 weeks of learning can unlock""",
            'lesson_text': """### You Are Not Becoming a Developer

Let us be completely honest with each other from the start. You are not here to become a software engineer. You are here because somewhere in your professional life, you have a nagging feeling: "I am spending too much time on tasks that should be automatic."

Maybe you are a doctor who spends 45 minutes every Friday manually compiling patient visit summaries into an Excel sheet. Maybe you are a lawyer who needs to search through 200 pages of contracts for specific clauses. Maybe you are an architect who keeps recalculating material estimates by hand because your spreadsheet formulas are getting out of control.

Python can do all of that for you. In seconds.

### The Numbers Do Not Lie

According to the **World Economic Forum's Future of Jobs Report (2025)**, analytical thinking and technology literacy are the two fastest-growing skills demanded across ALL industries - not just tech. McKinsey estimates that **60% of all occupations have at least 30% of activities that could be automated** with existing technology.

You do not need to automate everything. You just need to automate the boring parts.

### Real Professionals, Real Python

Here are real examples of what professionals like you have built with basic Python skills:

- **A paediatrician in Nairobi** wrote a 40-line script that reads her patient log (a CSV file) and automatically flags children who are overdue for vaccinations. It took her one weekend to learn, and it saves her 3 hours every week.

- **A quantity surveyor in Kampala** built a script that reads a Bill of Quantities in Excel, looks up current material prices from a separate sheet, and generates an updated cost estimate. What used to take a full day now takes 12 seconds.

- **A paralegal in Dar es Salaam** created a script that searches through PDF contracts for specific legal terms and highlights them. She processes 50 contracts in the time it used to take her to do 5.

None of these people had any programming background. They just had a problem and discovered that Python was the tool to solve it.

### Why Python Specifically?

There are hundreds of programming languages. We chose Python for three reasons:

1. **It reads like English.** Compare `if age > 18: print("Adult")` to the same thing in other languages. Python is absurdly readable.
2. **It has a library for everything.** Need to read Excel files? There is a library. Need to create PDFs? Library. Need to analyse medical data? Library. Need to talk to an AI? Library.
3. **It is the world's most popular language.** That means when you get stuck, there are millions of answers already waiting for you online.

### What We Will Build Together

Over the next 6 weeks, you will go from zero to building real tools. Here is a taste:

- A script that calculates your monthly take-home pay after tax
- A patient triage classifier
- An automated Excel report generator
- A PDF text extractor
- A complete "Professional Dashboard" that summarises your week

Take a deep breath. Open your mind. Let us start.

### References
- World Economic Forum, "Future of Jobs Report 2025" (2025)
- McKinsey Global Institute, "A future that works: automation, employment, and productivity" (2017)
- Severance, C.R., "Python for Everybody: Exploring Data in Python 3" (2016), Chapter 1""",
            'video_script': """### Narration Script

[Instructor Speaking]: Welcome to Coding for Professionals. My name is Peter Gordon Ekebu, and I am going to be your guide for the next six weeks.

Now, before we write a single line of code, I want to address something important. You are probably a doctor, or a lawyer, or an architect, or some kind of professional who is very good at what they do. And you might be thinking: "Why am I learning to code? That is for tech people."

Here is the thing. You are not becoming a developer. You are becoming a professional who can automate the boring parts of their work. And there is a massive difference.

[Show on screen: World Economic Forum stat]

The World Economic Forum says that technology literacy is now one of the top two most in-demand skills across ALL industries. Not just tech. All industries.

[Instructor Speaking]: Let me give you three real examples.

A paediatrician in Nairobi wrote a tiny Python script that checks her patient log and flags children who are overdue for vaccinations. It took her one weekend to learn, and it saves her three hours every single week.

A quantity surveyor in Kampala built a script that reads a Bill of Quantities in Excel and generates an updated cost estimate. What used to take a full day now takes twelve seconds.

A paralegal in Dar es Salaam created a script that searches through PDF contracts for specific legal terms. She now processes fifty contracts in the time it used to take her to do five.

[Instructor Speaking]: None of these people had any programming background. They just had a problem and discovered that Python was the tool to solve it.

And that is exactly what we are going to do together. Let us get started.""",
            'content': """### Lesson Plan (Instructor Only)
* **Hook (3 mins):** Ask: "How much time did you spend last week on a task you KNOW could be automated?"
* **Direct Instruction (7 mins):** Walk through the WEF statistics and the three professional examples
* **Discussion (3 mins):** Ask students to share what tasks they would want to automate
* **Closing (2 mins):** Preview what Module 1 covers and get them excited about writing their first code"""
        }
    )
    print(f"    Lesson: Why Every Professional Should Learn to Code")

    # ── Lesson 1.2 ────────────────────────────────────────────
    Lesson.objects.update_or_create(
        module=m1, title="Installing Python & Writing Your First Script",
        defaults={
            'order': 2, 'duration_minutes': 25,
            'playground_type': 'custom', 'playground_custom_url': PLAYGROUND_URL,
            'overview': """### Objectives for: Installing Python & Writing Your First Script
* Install Python on your computer (Windows, Mac, or Linux)
* Open a terminal and run your very first Python command
* Write and save a complete Python script file
* Understand the difference between the interactive shell and a script file""",
            'lesson_text': """### Let Us Get Python on Your Computer

Installing Python is easier than installing most phone apps. Here is what to do, step by step.

#### Windows Users
1. Open your web browser and go to **python.org/downloads**
2. Click the big yellow "Download Python 3.x" button
3. Run the installer
4. **CRITICAL:** Check the box that says **"Add Python to PATH"** at the bottom of the installer. This is the one thing people forget, and it causes problems later.
5. Click "Install Now"
6. When it finishes, open the Start menu and type `cmd`. Click "Command Prompt"
7. Type `python --version` and press Enter. You should see something like `Python 3.12.4`

#### Mac Users
1. Open Terminal (search for it in Spotlight)
2. Type `python3 --version`. If you see a version number, you already have it!
3. If not, go to **python.org/downloads** and download the Mac installer

#### Alternative: Use the Online Playground
If you are having trouble installing, do not worry. We have embedded a **Python playground** right here in this lesson. Click the "Open Playground" button below the video to start coding immediately in your browser, no installation needed.

### Your Very First Python Command

Open your terminal (Command Prompt on Windows, Terminal on Mac) and type:

```python
python
```

You should see something like this:
```
Python 3.12.4 (main, Jun  7 2024, 00:00:00)
>>> 
```

Those three arrows `>>>` mean Python is listening. It is waiting for you to tell it something. Try this:

```python
>>> print("Hello, I am a professional who codes now!")
```

Press Enter. Python will print your message back to you. Congratulations - you just gave a computer an instruction and it obeyed.

### From Shell to Script

Typing commands one at a time is fine for experimenting, but real work requires saving your commands in a file. This is called a **script**.

1. Open any text editor (Notepad on Windows, TextEdit on Mac, or download VS Code for a better experience)
2. Type the following:

```python
# My first Python script
# Author: [Your Name]
# Date: [Today's Date]

print("Good morning! Let us begin.")
name = input("What is your name? ")
profession = input("What is your profession? ")
print(f"Welcome, {name}! As a {profession}, you are about to gain a superpower.")
```

3. Save the file as `hello.py` (the `.py` extension tells your computer this is a Python file)
4. In your terminal, navigate to where you saved the file and type: `python hello.py`

The program will ask for your name and profession, then greet you personally. You just built your first interactive program.

### Practical Activity

Open the Practical Activity tab above and try modifying the script. Change the messages. Add a third question (maybe "How many years have you been practising?"). See what happens.

### References
- Python Software Foundation, "Python 3 Installation Guide" (python.org, 2024)
- Severance, C.R., "Python for Everybody" (2016), Chapter 1""",
            'video_script': """### Narration Script

[Instructor Speaking]: Alright, let us get Python installed on your machine. This should take about five minutes, and I am going to walk you through every single click.

[Screen Recording]: Go to python.org/downloads. Click the big yellow download button.

[Instructor Speaking]: Now here is the ONE thing that trips up every beginner. When the installer opens, look at the very bottom of the window. There is a checkbox that says "Add Python to PATH". CHECK THAT BOX. If you miss this, nothing we do later will work properly.

[Screen Recording]: Run through the installation, then open Command Prompt and type python --version.

[Instructor Speaking]: Beautiful. You should see the version number. Now type just the word python and press Enter. See those three arrows? That means Python is listening to you. Let us give it our first command.

[Screen Recording]: Type print("Hello, I am a professional who codes now!") and press Enter.

[Instructor Speaking]: And there it is. Your first line of code. It does not look like much, but you just told a computer what to do, and it did it. That is programming.

Now let us save this into a proper file so we can run it again later without retyping everything.

[Screen Recording]: Open Notepad, type the hello.py script, save it, run it from the terminal.

[Instructor Speaking]: You have just written and run your first complete Python script. How does it feel? In the next lesson, we are going to learn what variables and data types actually are, and why they matter.""",
            'content': """### Lesson Plan (Instructor Only)
* **Hook (2 mins):** "By the end of this lesson, you will have written your first working program"
* **Live Demo (15 mins):** Screen-share the entire installation process on Windows, then write hello.py
* **Guided Practice (5 mins):** Have students modify the script in the embedded playground
* **Troubleshooting (3 mins):** Common issues - PATH not set, wrong Python version, file not found"""
        }
    )
    print(f"    Lesson: Installing Python & Writing Your First Script")

    # ── Lesson 1.3 ────────────────────────────────────────────
    Lesson.objects.update_or_create(
        module=m1, title="How Computers Think: Variables, Types & Memory",
        defaults={
            'order': 3, 'duration_minutes': 20,
            'playground_type': 'custom', 'playground_custom_url': PLAYGROUND_URL,
            'overview': """### Objectives for: How Computers Think: Variables, Types & Memory
* Understand what variables are and why they exist
* Know the four basic data types: strings, integers, floats, and booleans
* Use f-strings to build professional output messages
* Write a script that calculates your monthly take-home pay""",
            'lesson_text': """### What Is a Variable?

Imagine you are a doctor. A patient walks in and you need to record their details: name, age, temperature, whether they have insurance. In the physical world, you write these on a patient card. In the programming world, you store them in **variables**.

A variable is just a labelled container that holds a piece of information.

```python
patient_name = "Grace Akello"
patient_age = 34
temperature = 37.2
has_insurance = True
```

That is it. Four variables. Each one holds a different type of data. Let us talk about those types.

### The Four Basic Data Types

| Type | What It Holds | Example | Professional Use |
|------|--------------|---------|-----------------|
| **String** (`str`) | Text | `"Grace Akello"` | Patient names, case titles, project labels |
| **Integer** (`int`) | Whole numbers | `34` | Ages, quantities, counts |
| **Float** (`float`) | Decimal numbers | `37.2` | Temperatures, prices, measurements |
| **Boolean** (`bool`) | True or False | `True` | Insurance status, case open/closed, project approved |

Python figures out the type automatically when you assign a value. You do not need to declare it in advance (unlike some other languages). This is one of the reasons Python is so beginner-friendly.

### Doing Maths

Python is an excellent calculator. You can do arithmetic directly:

```python
base_salary = 5000000  # UGX per month
tax_rate = 0.30        # 30% PAYE
nssf = 0.05            # 5% NSSF contribution

tax = base_salary * tax_rate
nssf_deduction = base_salary * nssf
take_home = base_salary - tax - nssf_deduction

print(f"Gross salary:  UGX {base_salary:,}")
print(f"PAYE tax:      UGX {tax:,.0f}")
print(f"NSSF:          UGX {nssf_deduction:,.0f}")
print(f"Take-home pay: UGX {take_home:,.0f}")
```

Run this and you get a clean, formatted salary breakdown. Notice the `f"..."` syntax? That is called an **f-string** - it lets you embed variables directly inside text. The `:,` adds comma formatting to large numbers. Professional output matters.

### Type Conversion

Sometimes you need to convert between types. The `input()` function always returns a string, even if the user types a number:

```python
age_text = input("Enter patient age: ")  # This is a string: "34"
age = int(age_text)                       # Now it is an integer: 34

if age < 18:
    print("Paediatric patient")
else:
    print("Adult patient")
```

Common conversion functions: `int()`, `float()`, `str()`, `bool()`.

### Assignment: Monthly Take-Home Calculator

Write a script called `salary.py` that:
1. Asks the user to enter their gross monthly salary
2. Calculates 30% PAYE tax
3. Calculates 5% NSSF contribution
4. Calculates 1% Local Service Tax
5. Prints a clean summary with the net take-home pay

### Practical Activity

Open the playground and experiment. Create variables for a patient, a legal case, or a construction project. Print them out using f-strings.

### References
- Severance, C.R., "Python for Everybody" (2016), Chapter 2: Variables
- Matthes, E., "Python Crash Course" 3rd Ed. (2023), Chapter 2: Variables and Simple Data Types""",
            'video_script': """### Narration Script

[Instructor Speaking]: In this lesson, we are going to understand how computers store information. And I promise you, it is simpler than you think.

Imagine you are a doctor. A patient walks in. You need to record their name, their age, their temperature, whether they have insurance. In the real world, you write these on a patient card. In Python, you store them in something called variables.

[Screen Recording]: Type out the four variable examples.

[Instructor Speaking]: A variable is just a labelled box. The label is the name you choose, and inside the box is the value. Python has four basic types of boxes.

[Screen Recording]: Show the types table, demonstrate each one.

[Instructor Speaking]: Now here is where it gets exciting. Let us build something useful. We are going to calculate a monthly salary breakdown.

[Screen Recording]: Type and run the salary script, showing the formatted output.

[Instructor Speaking]: Look at that output. Clean, formatted, professional. You just built a financial calculator in about ten lines of code. A lawyer could adapt this for billable hours. An architect could adapt it for material costs. The concept is the same - variables hold your data, and Python does the maths.

Your assignment for this lesson is to build your own version. I want a script that calculates your real take-home pay. Include PAYE, NSSF, and local service tax. Make the output look professional.""",
            'content': """### Lesson Plan (Instructor Only)
* **Hook (2 mins):** "If I asked you to calculate your exact take-home pay right now, including every deduction, how long would it take you? By the end of this lesson, you will have a script that does it in one second."
* **Direct Instruction (8 mins):** Variables, types, f-strings
* **Live Demo (8 mins):** Build the salary calculator live, showing each line
* **Assignment (2 mins):** Explain the take-home calculator assignment"""
        }
    )
    print(f"    Lesson: How Computers Think: Variables, Types & Memory")

    # ── Module 1 Quiz ─────────────────────────────────────────
    q1, _ = Quiz.objects.update_or_create(
        module=m1, title="Module 1 Checkpoint: Your First Code",
        defaults={'description': "Test your understanding of Python basics, variables, and data types.", 'passing_score': 80, 'points_reward': 50}
    )
    seed_questions(q1, [
        {
            'text': 'What happens when you run `x = 5` in Python?',
            'explanation': 'The single equals sign (=) is the assignment operator. It stores a value in a variable. To check equality, Python uses double equals (==).',
            'choices': [
                ('Python prints the number 5 on screen', False),
                ('Python creates a variable called x and stores the value 5 in memory', True),
                ('Python checks if x equals 5', False),
                ('Python creates a file called x.py', False),
            ]
        },
        {
            'text': 'Which of the following is a **string** in Python?',
            'explanation': 'Strings are text enclosed in quotes (single or double). Numbers without quotes are integers or floats. True/False without quotes are booleans.',
            'choices': [
                ('42', False),
                ('True', False),
                ('"Dr. Grace Akello"', True),
                ('3.14', False),
            ]
        },
        {
            'text': 'What does the `input()` function always return?',
            'explanation': 'The input() function always returns a string, even if the user types a number. You must use int() or float() to convert it if you need a number.',
            'choices': [
                ('An integer', False),
                ('A boolean', False),
                ('Whatever type the user intended', False),
                ('A string', True),
            ]
        },
        {
            'text': 'What will this code print?\n```python\nname = "Peter"\nprint(f"Hello, {name}!")\n```',
            'explanation': 'f-strings (formatted string literals) allow you to embed expressions inside curly braces {}. Python replaces {name} with the value of the variable name.',
            'choices': [
                ('Hello, {name}!', False),
                ('Hello, Peter!', True),
                ('f"Hello, Peter!"', False),
                ('An error', False),
            ]
        },
        {
            'text': 'Why is it important to check "Add Python to PATH" during installation on Windows?',
            'explanation': 'Adding Python to PATH means your operating system knows where to find the Python program. Without it, typing "python" in the terminal will give an error because the system cannot locate it.',
            'choices': [
                ('It makes Python run faster', False),
                ('It allows you to run Python from any terminal window', True),
                ('It installs extra libraries automatically', False),
                ('It is only needed for Mac users', False),
            ]
        },
    ])
    print(f"    Quiz: {q1.title}")

    # ══════════════════════════════════════════════════════════
    # MODULE 2: Making Decisions & Repeating Tasks
    # ══════════════════════════════════════════════════════════
    m2, _ = Module.objects.update_or_create(
        course=course, title="Module 2: Making Decisions & Repeating Tasks",
        defaults={'order': 2}
    )
    print(f"  Module: {m2.title}")

    Lesson.objects.update_or_create(
        module=m2, title="If This, Then That: Conditional Logic",
        defaults={
            'order': 1, 'duration_minutes': 25,
            'playground_type': 'custom', 'playground_custom_url': PLAYGROUND_URL,
            'overview': """### Objectives for: If This, Then That: Conditional Logic
* Write if/elif/else statements to make your programs react to different situations
* Use comparison operators (==, !=, >, <, >=, <=)
* Combine conditions with and, or, not
* Build a simple patient triage classifier""",
            'lesson_text': """### Teaching Your Program to Think

Until now, your programs have been like a train on tracks - they run in one direction, from top to bottom, every single time. But real professional work requires decisions.

A doctor does not treat every patient the same way. A lawyer does not apply the same clause to every contract. An architect does not use the same foundation for every soil type. Your programs need to make decisions too.

### The if Statement

```python
temperature = 38.5

if temperature > 37.5:
    print("Patient has a fever. Recommend further evaluation.")
```

Read that out loud. "If the temperature is greater than 37.5, print this message." That is literally what the code says. Python is that readable.

The indented line (the one with four spaces before it) only runs IF the condition is true. If the temperature was 36.8, Python would skip it entirely.

### Adding Alternatives with elif and else

```python
temperature = float(input("Enter patient temperature: "))

if temperature > 39.0:
    print("HIGH FEVER - Immediate attention required")
    print("Administer paracetamol and begin cooling measures")
elif temperature > 37.5:
    print("MILD FEVER - Monitor closely")
    print("Recheck in 30 minutes")
elif temperature < 35.0:
    print("HYPOTHERMIA WARNING - Warm the patient")
else:
    print("Temperature normal. No action needed.")
```

`elif` means "else if" - it checks another condition. `else` catches everything that did not match any previous condition. Python checks them in order, from top to bottom, and runs ONLY the first one that matches.

### Comparison Operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `==` | Equal to | `status == "urgent"` |
| `!=` | Not equal to | `blood_type != "O-"` |
| `>` | Greater than | `age > 18` |
| `<` | Less than | `bp_systolic < 90` |
| `>=` | Greater or equal | `score >= 80` |
| `<=` | Less or equal | `days_overdue <= 30` |

### Combining Conditions

```python
age = 8
weight = 22

if age < 12 and weight < 30:
    print("Use paediatric dosage")
elif age >= 12 or weight >= 30:
    print("Use standard dosage")
```

- `and` - Both conditions must be true
- `or` - At least one condition must be true
- `not` - Reverses the condition

### Assignment: Simple Patient Triage

Build a script called `triage.py` that asks the user to enter:
1. Temperature
2. Pain level (1-10)
3. Whether they can walk (yes/no)

Based on the inputs, classify them as:
- **RED (Emergency):** Temperature > 39 OR pain > 8 OR cannot walk
- **YELLOW (Urgent):** Temperature > 37.5 OR pain > 5
- **GREEN (Non-urgent):** Everything else

### References
- Sweigart, A., "Automate the Boring Stuff with Python" 2nd Ed. (2020), Chapter 2
- Severance, C.R., "Python for Everybody" (2016), Chapter 3""",
            'video_script': """### Narration Script

[Instructor Speaking]: Welcome back. So far, your programs run straight from top to bottom, doing the same thing every time. But real professional work requires decisions. A doctor does not treat every patient the same way. And your programs should not either.

[Screen Recording]: Type the temperature if statement example.

[Instructor Speaking]: Read that code out loud. "If the temperature is greater than 37.5, print this message." That is literally what it says. Python is that readable.

[Screen Recording]: Build the full temperature classifier with elif and else.

[Instructor Speaking]: Now we have a program that reacts differently based on the input. This is called conditional logic, and it is the backbone of every useful program ever written.

[Screen Recording]: Show the comparison operators table.

[Instructor Speaking]: Your assignment is to build a patient triage system. You are going to ask three questions and classify the patient as Red, Yellow, or Green. It is a simplified version of what emergency departments actually do. Try it in the playground.""",
            'content': """### Lesson Plan (Instructor Only)
* **Hook (2 mins):** "Every useful program in the world makes decisions. Today you learn how."
* **Direct Instruction (10 mins):** if/elif/else, comparison operators, and/or/not
* **Live Demo (10 mins):** Build the temperature classifier live
* **Assignment (3 mins):** Explain the triage assignment"""
        }
    )
    print(f"    Lesson: If This, Then That: Conditional Logic")

    Lesson.objects.update_or_create(
        module=m2, title="Loops: Making the Computer Do Repetitive Work",
        defaults={
            'order': 2, 'duration_minutes': 25,
            'playground_type': 'custom', 'playground_custom_url': PLAYGROUND_URL,
            'overview': """### Objectives for: Loops: Making the Computer Do Repetitive Work
* Use for loops to repeat actions a specific number of times
* Use while loops for open-ended repetition
* Loop through lists of data (patients, cases, projects)
* Understand when to use for vs while""",
            'lesson_text': """### The Whole Point of Programming

Here is a secret: the single biggest reason professionals learn to code is **loops**. A loop tells the computer: "Do this thing, but do it 500 times." While you go get coffee.

### The for Loop

Imagine you have 5 patients to greet:

```python
patients = ["Grace", "Moses", "Fatima", "James", "Aisha"]

for patient in patients:
    print(f"Good morning, {patient}! Please take a seat.")
```

Output:
```
Good morning, Grace! Please take a seat.
Good morning, Moses! Please take a seat.
Good morning, Fatima! Please take a seat.
Good morning, James! Please take a seat.
Good morning, Aisha! Please take a seat.
```

Five patients? Easy. But what if you had 500? The code would be exactly the same. That is the power of a loop.

### The range() Function

Sometimes you need to repeat something a specific number of times:

```python
for i in range(5):
    print(f"Reminder {i + 1}: Take your medication")
```

`range(5)` generates the numbers 0, 1, 2, 3, 4. We add 1 to make it human-friendly (1 through 5).

### The while Loop

A `while` loop keeps going until a condition becomes false:

```python
attempts = 0
password = ""

while password != "clinic2024":
    password = input("Enter the system password: ")
    attempts += 1
    if attempts >= 3:
        print("Too many attempts. Account locked.")
        break

if password == "clinic2024":
    print("Access granted. Welcome to the Patient Management System.")
```

The `break` keyword exits the loop early. Use it when you need an emergency stop.

### Real-World Example: Processing Patient Bills

```python
bills = [150000, 230000, 45000, 890000, 120000]
total = 0

for bill in bills:
    total += bill
    print(f"Bill: UGX {bill:,} | Running total: UGX {total:,}")

print(f"\\nTotal outstanding: UGX {total:,}")
average = total / len(bills)
print(f"Average bill: UGX {average:,.0f}")
```

You just processed five bills, calculated a running total, and computed the average - in eight lines. Imagine doing this with 5,000 bills. The code would be identical.

### When to Use Which?

| Use `for` when... | Use `while` when... |
|-------------------|---------------------|
| You know how many times to repeat | You do not know when to stop |
| You are going through a list | You are waiting for user input |
| You are processing a file line by line | You are checking a condition repeatedly |

### Assignment

Write a script that loops through a list of 10 appointment times and prints whether each one is "Morning" (before 12:00), "Afternoon" (12:00-17:00), or "Evening" (after 17:00).

### References
- Severance, C.R., "Python for Everybody" (2016), Chapter 5: Iteration
- Matthes, E., "Python Crash Course" 3rd Ed. (2023), Chapter 4: Working with Lists""",
            'video_script': """### Narration Script

[Instructor Speaking]: Alright, here is a secret. The single biggest reason professionals learn to code is what we are about to learn: loops. A loop tells the computer, "Do this thing, but do it five hundred times while I go get coffee."

[Screen Recording]: Type the patients for loop example.

[Instructor Speaking]: Five patients. Easy. But what if you had five hundred? The code would be exactly the same. That is the magic.

[Screen Recording]: Show the bills processing example with running totals.

[Instructor Speaking]: You just processed five bills and calculated averages in eight lines. Replace that list with five thousand bills from an Excel file, and the code does not change at all. That is why loops are the most important concept in programming for professionals.""",
            'content': """### Lesson Plan (Instructor Only)
* **Hook (2 mins):** "What if I told you one concept could save you more time than everything else combined?"
* **Direct Instruction (8 mins):** for loops, while loops, range(), break
* **Live Demo (12 mins):** Build the patient bills processor live
* **Assignment (3 mins):** Appointment time classifier"""
        }
    )
    print(f"    Lesson: Loops: Making the Computer Do Repetitive Work")

    Lesson.objects.update_or_create(
        module=m2, title="Lists & Dictionaries: Organising Real Data",
        defaults={
            'order': 3, 'duration_minutes': 25,
            'playground_type': 'custom', 'playground_custom_url': PLAYGROUND_URL,
            'overview': """### Objectives for: Lists & Dictionaries: Organising Real Data
* Create and manipulate lists (add, remove, sort, search)
* Create dictionaries to store structured records (like patient cards)
* Use lists of dictionaries to model real databases
* Build a simple contact directory""",
            'lesson_text': """### Beyond Single Variables

So far, each variable holds one piece of information. But real professional data is structured. A patient has a name AND an age AND a diagnosis AND a list of medications. We need data structures.

### Lists: Ordered Collections

A list is exactly what it sounds like - an ordered collection of items:

```python
medications = ["Paracetamol", "Amoxicillin", "Ibuprofen", "Metformin"]

print(medications[0])     # Paracetamol (first item, index 0)
print(medications[-1])    # Metformin (last item)
print(len(medications))   # 4 (how many items)

medications.append("Omeprazole")   # Add to end
medications.remove("Ibuprofen")    # Remove by name
medications.sort()                  # Alphabetical order

print(medications)
# ['Amoxicillin', 'Metformin', 'Omeprazole', 'Paracetamol']
```

### Dictionaries: Labelled Data

A dictionary stores data as **key-value pairs**. Think of it as a patient record card:

```python
patient = {
    "name": "Grace Akello",
    "age": 34,
    "diagnosis": "Type 2 Diabetes",
    "medications": ["Metformin", "Glimepiride"],
    "insurance": True
}

print(patient["name"])         # Grace Akello
print(patient["medications"])  # ['Metformin', 'Glimepiride']
patient["age"] = 35            # Update a value
patient["next_visit"] = "2025-09-15"  # Add new field
```

### Lists of Dictionaries: Your First Database

The real magic happens when you combine them. A list of dictionaries is basically a simple database:

```python
patients = [
    {"name": "Grace Akello", "age": 34, "diagnosis": "Diabetes"},
    {"name": "Moses Okot", "age": 67, "diagnosis": "Hypertension"},
    {"name": "Fatima Hassan", "age": 12, "diagnosis": "Malaria"},
    {"name": "James Mugisha", "age": 45, "diagnosis": "Diabetes"},
]

# Find all diabetic patients
diabetic = [p for p in patients if p["diagnosis"] == "Diabetes"]
print(f"Diabetic patients: {len(diabetic)}")
for p in diabetic:
    print(f"  - {p['name']}, age {p['age']}")
```

That `[p for p in patients if ...]` line is called a **list comprehension**. It is a compact way to filter a list. Read it as: "Give me every patient `p` from patients where the diagnosis is Diabetes."

### Assignment

Build a contact directory script that:
1. Starts with a list of 5 dictionaries (each with name, phone, profession)
2. Asks the user to search by name
3. Prints the matching contact's details
4. If not found, prints "Contact not found"

### References
- Matthes, E., "Python Crash Course" 3rd Ed. (2023), Chapters 3-4
- Severance, C.R., "Python for Everybody" (2016), Chapters 8-9""",
            'video_script': """### Narration Script

[Instructor Speaking]: Until now, every variable held one piece of information. But in your real work, data comes in structures. A patient has a name AND an age AND a diagnosis AND medications. Today we learn how to organise all of that beautifully in Python.

[Screen Recording]: Build the medications list, show indexing, append, remove, sort.

[Instructor Speaking]: Lists are ordered. Dictionaries are labelled. When you combine them, you get something incredibly powerful.

[Screen Recording]: Build the patients list of dictionaries and run the diabetes filter.

[Instructor Speaking]: That right there is essentially a simple database query. We just said "give me all patients with diabetes" and Python gave us the answer instantly. In Module 4, we will do this with real Excel files containing thousands of rows.""",
            'content': """### Lesson Plan (Instructor Only)
* **Hook (2 mins):** "Every spreadsheet you have ever used is just a list of dictionaries"
* **Direct Instruction (10 mins):** Lists, dictionaries, list comprehensions
* **Live Demo (10 mins):** Build patient database and filter it
* **Assignment (3 mins):** Contact directory"""
        }
    )
    print(f"    Lesson: Lists & Dictionaries: Organising Real Data")

    q2, _ = Quiz.objects.update_or_create(
        module=m2, title="Module 2 Checkpoint: Logic & Loops",
        defaults={'description': "Test your understanding of conditions, loops, lists, and dictionaries.", 'passing_score': 80, 'points_reward': 50}
    )
    seed_questions(q2, [
        {
            'text': 'What does this code print?\n```python\nx = 10\nif x > 5:\n    print("Big")\nelse:\n    print("Small")\n```',
            'explanation': 'Since x is 10, and 10 > 5 is True, Python executes the if block and prints "Big". The else block is skipped.',
            'choices': [('Small', False), ('Big', True), ('Big Small', False), ('An error', False)]
        },
        {
            'text': 'How many times does this loop run?\n```python\nfor i in range(3):\n    print(i)\n```',
            'explanation': 'range(3) generates the numbers 0, 1, 2. That is three numbers, so the loop runs 3 times.',
            'choices': [('2 times', False), ('3 times', True), ('4 times', False), ('It runs forever', False)]
        },
        {
            'text': 'What is the correct way to access the value "Kampala" from this dictionary?\n```python\noffice = {"city": "Kampala", "floor": 3}\n```',
            'explanation': 'Dictionaries use square brackets with the key name to access values. office["city"] returns "Kampala".',
            'choices': [('office.city', False), ('office[0]', False), ('office["city"]', True), ('office(city)', False)]
        },
        {
            'text': 'What does the `break` keyword do inside a loop?',
            'explanation': 'break immediately exits the loop, skipping any remaining iterations. It is useful for stopping early when a condition is met.',
            'choices': [
                ('Pauses the loop for 1 second', False),
                ('Skips to the next iteration', False),
                ('Exits the loop immediately', True),
                ('Restarts the loop from the beginning', False),
            ]
        },
        {
            'text': 'Which line correctly adds "Aspirin" to this list?\n```python\nmeds = ["Paracetamol", "Ibuprofen"]\n```',
            'explanation': 'The append() method adds a single item to the end of a list. It modifies the original list in place.',
            'choices': [
                ('meds.add("Aspirin")', False),
                ('meds.append("Aspirin")', True),
                ('meds + "Aspirin"', False),
                ('meds.insert("Aspirin")', False),
            ]
        },
    ])
    print(f"    Quiz: {q2.title}")

    # ══════════════════════════════════════════════════════════
    # MODULE 3: Functions & Clean Code
    # ══════════════════════════════════════════════════════════
    m3, _ = Module.objects.update_or_create(
        course=course, title="Module 3: Functions & Clean Code",
        defaults={'order': 3}
    )
    print(f"  Module: {m3.title}")

    Lesson.objects.update_or_create(
        module=m3, title="Functions: Write Once, Use Forever",
        defaults={
            'order': 1, 'duration_minutes': 25,
            'playground_type': 'custom', 'playground_custom_url': PLAYGROUND_URL,
            'overview': """### Objectives for: Functions: Write Once, Use Forever
* Define and call your own functions
* Use parameters and return values
* Understand why functions make your code reusable and clean
* Refactor repetitive code into functions""",
            'lesson_text': """### Why Functions Matter

You have been writing code that runs from top to bottom. But imagine you need to calculate BMI for 50 patients. Are you going to copy-paste the formula 50 times? Of course not. You write it once as a **function**, and call it whenever you need it.

```python
def calculate_bmi(weight_kg, height_m):
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 1)

# Now use it for any patient
grace_bmi = calculate_bmi(68, 1.65)
moses_bmi = calculate_bmi(92, 1.78)

print(f"Grace BMI: {grace_bmi}")  # 25.0
print(f"Moses BMI: {moses_bmi}")  # 29.0
```

The `def` keyword defines a function. The values in parentheses are **parameters** - the inputs. The `return` keyword sends a result back.

### Functions With Multiple Returns

```python
def classify_bmi(bmi):
    if bmi < 18.5:
        return "Underweight", "yellow"
    elif bmi < 25:
        return "Normal", "green"
    elif bmi < 30:
        return "Overweight", "orange"
    else:
        return "Obese", "red"

category, alert_color = classify_bmi(29.0)
print(f"Category: {category} (Alert: {alert_color})")
```

### Default Parameters

```python
def greet_patient(name, language="English"):
    if language == "English":
        print(f"Good morning, {name}!")
    elif language == "Luganda":
        print(f"Wasuze otya, {name}!")
    elif language == "Swahili":
        print(f"Habari ya asubuhi, {name}!")

greet_patient("Grace")                    # Uses English (default)
greet_patient("Moses", language="Luganda") # Uses Luganda
```

### Putting It Together

```python
def process_patient(name, weight, height):
    bmi = calculate_bmi(weight, height)
    category, color = classify_bmi(bmi)
    
    print(f"Patient: {name}")
    print(f"BMI: {bmi} - {category}")
    print(f"Alert level: {color}")
    print("-" * 30)

# Process an entire ward
patients = [
    ("Grace", 68, 1.65),
    ("Moses", 92, 1.78),
    ("Fatima", 45, 1.55),
]

for name, weight, height in patients:
    process_patient(name, weight, height)
```

Three patients processed with one loop and three functions working together. That is clean, professional code.

### Assignment

Write three functions:
1. `calculate_billable_hours(hours, rate)` - Returns total billing amount
2. `classify_urgency(days_overdue)` - Returns "Low", "Medium", or "High"
3. `generate_summary(client_name, hours, rate, days)` - Calls the other two and prints a report

### References
- Matthes, E., "Python Crash Course" 3rd Ed. (2023), Chapter 8: Functions
- Sweigart, A., "Automate the Boring Stuff with Python" 2nd Ed. (2020), Chapter 3""",
            'video_script': """### Narration Script

[Instructor Speaking]: Today we learn the concept that separates messy beginners from clean, professional programmers: functions.

Imagine you need to calculate BMI for fifty patients. You are not going to copy-paste the formula fifty times. You write it ONCE, and call it whenever you need it.

[Screen Recording]: Define calculate_bmi, call it for two patients.

[Instructor Speaking]: See how clean that is? One function, reused as many times as we want. And it gets better when we chain functions together.

[Screen Recording]: Build the full process_patient example with the loop.

[Instructor Speaking]: Three patients, three functions, one loop. That is professional-grade code right there.""",
            'content': """### Lesson Plan (Instructor Only)
* **Hook (2 mins):** "The difference between messy code and professional code is one concept: functions"
* **Direct Instruction (10 mins):** def, parameters, return, default params
* **Live Demo (10 mins):** Build BMI calculator, then chain functions
* **Assignment (3 mins):** Billable hours system"""
        }
    )
    print(f"    Lesson: Functions: Write Once, Use Forever")

    Lesson.objects.update_or_create(
        module=m3, title="Error Handling: When Things Go Wrong",
        defaults={
            'order': 2, 'duration_minutes': 20,
            'playground_type': 'custom', 'playground_custom_url': PLAYGROUND_URL,
            'overview': """### Objectives for: Error Handling: When Things Go Wrong
* Understand common Python errors and what they mean
* Use try/except to handle errors gracefully
* Write robust programs that do not crash on bad input
* Add input validation to your professional scripts""",
            'lesson_text': """### Programs Crash. Good Programs Recover.

In the real world, users type nonsense. Files go missing. Networks drop. A professional program does not crash when something unexpected happens - it handles the error gracefully and keeps going.

### Common Errors

```python
# TypeError - wrong type
"age: " + 25            # Cannot add string and integer

# ValueError - wrong value
int("hello")            # Cannot convert "hello" to a number

# KeyError - missing dictionary key
patient = {"name": "Grace"}
patient["age"]          # "age" does not exist

# FileNotFoundError
open("patients.csv")    # File does not exist
```

### The try/except Block

```python
def get_age():
    while True:
        try:
            age = int(input("Enter patient age: "))
            if age < 0 or age > 150:
                print("Age must be between 0 and 150. Try again.")
                continue
            return age
        except ValueError:
            print("That is not a valid number. Please enter a whole number.")

patient_age = get_age()
print(f"Age recorded: {patient_age}")
```

If the user types "twenty-five" instead of 25, the program does not crash. It says "That is not a valid number" and asks again. That is professional behaviour.

### Multiple except Blocks

```python
def read_patient_file(filename):
    try:
        with open(filename, 'r') as f:
            data = f.read()
            return data
    except FileNotFoundError:
        print(f"Error: The file '{filename}' was not found.")
        return None
    except PermissionError:
        print(f"Error: You do not have permission to read '{filename}'.")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None
```

### Assignment

Take your salary calculator from Module 1 and make it bulletproof:
- Handle non-numeric input gracefully
- Reject negative salary values
- Reject tax rates above 100%
- Print a helpful error message for each case

### References
- Lutz, M., "Learning Python" 5th Ed. (2013), Chapter 34: Exception Basics
- Severance, C.R., "Python for Everybody" (2016), Chapter 3""",
            'video_script': """### Narration Script

[Instructor Speaking]: Here is a truth about programming: your code WILL encounter errors. The question is whether it crashes or handles them gracefully. Today we learn how to write programs that recover instead of dying.

[Screen Recording]: Show each common error type.

[Instructor Speaking]: The try/except block is your safety net. You wrap the risky code in try, and catch the error in except.

[Screen Recording]: Build the get_age function with validation.

[Instructor Speaking]: Now no matter what the user types, our program handles it. That is the difference between amateur code and professional code.""",
            'content': """### Lesson Plan (Instructor Only)
* **Hook (2 mins):** "What happens when a user types 'twenty-five' into your age field?"
* **Direct Instruction (8 mins):** Common errors, try/except, multiple except blocks
* **Live Demo (8 mins):** Build bulletproof input validation
* **Assignment (2 mins):** Harden the salary calculator"""
        }
    )
    print(f"    Lesson: Error Handling: When Things Go Wrong")

    Lesson.objects.update_or_create(
        module=m3, title="Reading & Writing Files: Your First Automation",
        defaults={
            'order': 3, 'duration_minutes': 25,
            'playground_type': 'custom', 'playground_custom_url': PLAYGROUND_URL,
            'overview': """### Objectives for: Reading & Writing Files: Your First Automation
* Open, read, and write text files with Python
* Work with CSV files (the universal data format)
* Use the csv module to process structured data
* Build a script that reads appointments and flags overdue ones""",
            'lesson_text': """### From Screen to Disk

Everything we have done so far lives in memory - it disappears when the program ends. Real professional work needs to read from files and write results back. This is where automation begins.

### Reading a Text File

```python
with open("notes.txt", "r") as file:
    content = file.read()
    print(content)
```

The `with` keyword ensures the file is properly closed when you are done. Always use it.

### Writing to a File

```python
with open("report.txt", "w") as file:
    file.write("Daily Patient Summary\\n")
    file.write("=" * 30 + "\\n")
    file.write(f"Date: 2025-08-05\\n")
    file.write(f"Total patients seen: 23\\n")
    file.write(f"Urgent cases: 4\\n")
```

The `"w"` mode creates a new file (or overwrites an existing one). Use `"a"` to append to an existing file.

### CSV Files: The Universal Format

CSV (Comma-Separated Values) is the format that connects everything - Excel, Google Sheets, databases, hospital systems. Python has a built-in `csv` module:

```python
import csv

# Reading a CSV
with open("appointments.csv", "r") as file:
    reader = csv.DictReader(file)
    for row in reader:
        print(f"{row['patient_name']} - {row['date']} - {row['status']}")
```

```python
# Writing a CSV
import csv

patients = [
    {"name": "Grace", "age": 34, "diagnosis": "Diabetes"},
    {"name": "Moses", "age": 67, "diagnosis": "Hypertension"},
]

with open("patient_export.csv", "w", newline="") as file:
    writer = csv.DictWriter(file, fieldnames=["name", "age", "diagnosis"])
    writer.writeheader()
    writer.writerows(patients)

print("File saved: patient_export.csv")
```

### Real Example: Flagging Overdue Appointments

```python
import csv
from datetime import datetime

today = datetime.now()

with open("appointments.csv", "r") as file:
    reader = csv.DictReader(file)
    overdue = []
    
    for row in reader:
        appt_date = datetime.strptime(row["date"], "%Y-%m-%d")
        if appt_date < today:
            days_late = (today - appt_date).days
            overdue.append({
                "patient": row["patient_name"],
                "date": row["date"],
                "days_overdue": days_late
            })

print(f"\\nOverdue appointments: {len(overdue)}")
for item in overdue:
    print(f"  {item['patient']} - {item['days_overdue']} days overdue")
```

### Assignment

Create a CSV file with 10 client appointments (name, date, status). Write a script that:
1. Reads the file
2. Counts how many are overdue (date is in the past)
3. Prints the overdue ones sorted by how many days late
4. Writes a summary to a new file called `overdue_report.txt`

### References
- Sweigart, A., "Automate the Boring Stuff with Python" 2nd Ed. (2020), Chapters 9 and 16
- Python docs: csv module (docs.python.org/3/library/csv.html)""",
            'video_script': """### Narration Script

[Instructor Speaking]: This is the lesson where automation truly begins. Until now, everything lived on screen. Today, your programs start reading and writing real files on your computer.

[Screen Recording]: Read a text file, then write a report file.

[Instructor Speaking]: CSV files are the universal language of data. Excel exports them. Google Sheets exports them. Hospital systems export them. And Python reads them beautifully.

[Screen Recording]: Build the overdue appointments detector.

[Instructor Speaking]: We just scanned an entire appointment list and flagged every overdue patient in a few lines of code. Imagine running this every morning. That is automation.""",
            'content': """### Lesson Plan (Instructor Only)
* **Hook (2 mins):** "After this lesson, your programs can read and write real files. This is where automation starts."
* **Direct Instruction (8 mins):** open(), read, write, csv module, DictReader/DictWriter
* **Live Demo (12 mins):** Build the overdue appointments detector
* **Assignment (3 mins):** Client appointments CSV processor"""
        }
    )
    print(f"    Lesson: Reading & Writing Files: Your First Automation")

    q3, _ = Quiz.objects.update_or_create(
        module=m3, title="Module 3 Checkpoint: Functions & Files",
        defaults={'description': "Test your understanding of functions, error handling, and file I/O.", 'passing_score': 80, 'points_reward': 50}
    )
    seed_questions(q3, [
        {
            'text': 'What does the `return` keyword do in a function?',
            'explanation': 'return sends a value back to wherever the function was called. Without return, the function returns None by default.',
            'choices': [
                ('Prints the result to the screen', False),
                ('Sends a value back to the caller', True),
                ('Ends the entire program', False),
                ('Saves the result to a file', False),
            ]
        },
        {
            'text': 'What happens if you run `int("hello")`?',
            'explanation': 'Python raises a ValueError because the string "hello" cannot be converted to an integer. Use try/except to handle this gracefully.',
            'choices': [
                ('It returns 0', False),
                ('It returns None', False),
                ('Python raises a ValueError', True),
                ('It converts to the ASCII code', False),
            ]
        },
        {
            'text': 'What does `with open("data.csv", "r") as file:` do?',
            'explanation': 'The "with" statement opens the file and ensures it is properly closed when the block ends, even if an error occurs. "r" means read mode.',
            'choices': [
                ('Creates a new file called data.csv', False),
                ('Opens data.csv for reading and auto-closes it', True),
                ('Deletes data.csv', False),
                ('Downloads data.csv from the internet', False),
            ]
        },
        {
            'text': 'What is the difference between `"w"` and `"a"` file modes?',
            'explanation': '"w" (write) creates a new file or overwrites an existing one. "a" (append) adds to the end of an existing file without erasing it.',
            'choices': [
                ('"w" appends, "a" overwrites', False),
                ('"w" overwrites, "a" appends', True),
                ('They are the same', False),
                ('"w" is for Windows, "a" is for Apple', False),
            ]
        },
        {
            'text': 'Which module do you import to read CSV files in Python?',
            'explanation': 'Python has a built-in csv module. You import it with `import csv`. No installation needed.',
            'choices': [
                ('excel', False),
                ('spreadsheet', False),
                ('csv', True),
                ('pandas (always)', False),
            ]
        },
    ])
    print(f"    Quiz: {q3.title}")

    # ══════════════════════════════════════════════════════════
    # MODULE 4: Working with Real-World Data
    # ══════════════════════════════════════════════════════════
    m4, _ = Module.objects.update_or_create(
        course=course, title="Module 4: Working with Real-World Data",
        defaults={'order': 4}
    )
    print(f"  Module: {m4.title}")

    for ldata in [
        {
            'title': "CSV & Excel: The Data Formats You Already Use",
            'order': 1, 'duration': 30,
            'overview': "### Objectives\n* Install and use pandas to read Excel and CSV files\n* Select, filter, and sort data like a spreadsheet\n* Perform calculations across thousands of rows instantly",
            'lesson_text': "### Your Spreadsheet, Supercharged\n\nYou already know Excel. You use it every day. But have you ever had a spreadsheet with 10,000 rows and needed to filter, sort, and summarise it? Excel slows down. Your formulas get tangled. You start making mistakes.\n\nPython's **pandas** library handles millions of rows without breaking a sweat.\n\n### Installing pandas\n\n```bash\npip install pandas openpyxl\n```\n\n`pandas` is the data analysis library. `openpyxl` lets it read Excel (.xlsx) files.\n\n### Reading Data\n\n```python\nimport pandas as pd\n\n# Read a CSV file\ndf = pd.read_csv(\"patients.csv\")\nprint(df.head())  # Show first 5 rows\nprint(df.shape)   # (rows, columns)\n```\n\n```python\n# Read an Excel file\ndf = pd.read_excel(\"lab_results.xlsx\", sheet_name=\"Sheet1\")\n```\n\n### Filtering Data\n\n```python\n# All patients over 60\nelderly = df[df[\"age\"] > 60]\n\n# All diabetic patients in Kampala\ndiabetic_kampala = df[(df[\"diagnosis\"] == \"Diabetes\") & (df[\"city\"] == \"Kampala\")]\n\n# Patients with missing phone numbers\nmissing_phone = df[df[\"phone\"].isna()]\n```\n\n### Calculations\n\n```python\nprint(f\"Average age: {df['age'].mean():.1f}\")\nprint(f\"Total bills: UGX {df['bill'].sum():,.0f}\")\nprint(f\"Patients per diagnosis:\")\nprint(df['diagnosis'].value_counts())\n```\n\n### Assignment\n\nDownload any public CSV dataset (e.g. from data.worldbank.org). Load it with pandas, filter for East African countries, and print summary statistics.\n\n### References\n- McKinney, W., \"Python for Data Analysis\" 3rd Ed. (2022), Chapters 5-7\n- pandas documentation: pandas.pydata.org",
        },
        {
            'title': "Cleaning Messy Data: The 80% of Real Work",
            'order': 2, 'duration': 25,
            'overview': "### Objectives\n* Handle missing values (NaN) in real datasets\n* Fix inconsistent text (capitalisation, spacing, typos)\n* Convert date strings to proper date objects\n* Remove duplicate records",
            'lesson_text': "### The Dirty Secret of Data\n\nHere is something no one tells you: 80% of data work is **cleaning**. The analysis itself takes 20% of the time. Real-world data is messy. Names are misspelled. Dates are in five different formats. Half the phone numbers are missing.\n\n### Missing Values\n\n```python\nimport pandas as pd\n\ndf = pd.read_csv(\"patients.csv\")\n\n# How many missing values per column?\nprint(df.isnull().sum())\n\n# Fill missing ages with the average\ndf[\"age\"] = df[\"age\"].fillna(df[\"age\"].mean())\n\n# Drop rows where diagnosis is missing (cannot guess that)\ndf = df.dropna(subset=[\"diagnosis\"])\n```\n\n### Fixing Inconsistent Text\n\n```python\n# Before: \"kampala\", \"Kampala\", \"KAMPALA\", \" Kampala \"\ndf[\"city\"] = df[\"city\"].str.strip().str.title()\n# After: all become \"Kampala\"\n\n# Fix common misspellings\ndf[\"diagnosis\"] = df[\"diagnosis\"].replace({\n    \"diabeties\": \"Diabetes\",\n    \"Diabetis\": \"Diabetes\",\n    \"hypertention\": \"Hypertension\",\n})\n```\n\n### Removing Duplicates\n\n```python\nprint(f\"Before: {len(df)} rows\")\ndf = df.drop_duplicates(subset=[\"name\", \"date_of_birth\"])\nprint(f\"After: {len(df)} rows\")\n```\n\n### Assignment\n\nCreate a messy CSV file on purpose (include duplicates, mixed capitalisation, missing values). Write a cleaning script that fixes all the issues and saves a clean version.\n\n### References\n- McKinney, W., \"Python for Data Analysis\" 3rd Ed. (2022), Chapter 7: Data Cleaning",
        },
        {
            'title': "Simple Charts & Visualisations with Matplotlib",
            'order': 3, 'duration': 25,
            'overview': "### Objectives\n* Install and use matplotlib to create bar charts, line charts, and pie charts\n* Customise chart colours, labels, and titles\n* Save charts as image files for reports and presentations\n* Visualise real data from your profession",
            'lesson_text': "### A Picture Is Worth a Thousand Rows\n\nA spreadsheet with 500 rows tells you nothing at a glance. A chart tells you everything. Python's **matplotlib** library creates publication-quality charts.\n\n### Installing matplotlib\n\n```bash\npip install matplotlib\n```\n\n### Your First Chart\n\n```python\nimport matplotlib.pyplot as plt\n\nmonths = [\"Jan\", \"Feb\", \"Mar\", \"Apr\", \"May\", \"Jun\"]\npatients = [120, 135, 98, 156, 142, 168]\n\nplt.figure(figsize=(10, 6))\nplt.bar(months, patients, color=\"#2563eb\")\nplt.title(\"Monthly Patient Volume - 2025\", fontsize=16, fontweight=\"bold\")\nplt.xlabel(\"Month\")\nplt.ylabel(\"Number of Patients\")\nplt.tight_layout()\nplt.savefig(\"patient_volume.png\", dpi=150)\nplt.show()\n```\n\n### Combining with pandas\n\n```python\nimport pandas as pd\nimport matplotlib.pyplot as plt\n\ndf = pd.read_csv(\"patients.csv\")\n\n# Diagnosis distribution\ncounts = df[\"diagnosis\"].value_counts()\ncounts.plot(kind=\"pie\", autopct=\"%1.1f%%\", figsize=(8, 8))\nplt.title(\"Patient Diagnosis Distribution\")\nplt.ylabel(\"\")  # Remove default ylabel\nplt.savefig(\"diagnosis_pie.png\", dpi=150)\nplt.show()\n```\n\n### Assignment\n\nUsing the WHO malaria dataset (or any public health data), create:\n1. A bar chart showing cases by East African country\n2. A line chart showing cases over time for Uganda\n3. Save both as PNG files\n\n### References\n- VanderPlas, J., \"Python Data Science Handbook\" 2nd Ed. (2023), Chapter 4\n- matplotlib.org/stable/gallery",
        },
    ]:
        Lesson.objects.update_or_create(
            module=m4, title=ldata['title'],
            defaults={
                'order': ldata['order'], 'duration_minutes': ldata['duration'],
                'playground_type': 'custom', 'playground_custom_url': PLAYGROUND_URL,
                'overview': ldata['overview'],
                'lesson_text': ldata['lesson_text'],
                'video_script': f"### Narration Script\n\n[Instructor Speaking]: In this lesson on '{ldata['title']}', we are going to work with real data...",
                'content': f"### Lesson Plan (Instructor Only)\n* Topic: {ldata['title']}\n* Live Demo with real dataset\n* Assignment at end of lesson"
            }
        )
        print(f"    Lesson: {ldata['title']}")

    q4, _ = Quiz.objects.update_or_create(
        module=m4, title="Module 4 Checkpoint: Data Analysis",
        defaults={'description': "Test your understanding of pandas, data cleaning, and visualisation.", 'passing_score': 80, 'points_reward': 50}
    )
    seed_questions(q4, [
        {'text': 'Which library is used to read Excel files in Python?', 'explanation': 'pandas (with openpyxl) reads Excel files using pd.read_excel().', 'choices': [('csv', False), ('pandas', True), ('matplotlib', False), ('excel', False)]},
        {'text': 'What does `df.isnull().sum()` return?', 'explanation': 'It returns the count of missing (NaN) values in each column of the DataFrame.', 'choices': [('The total number of rows', False), ('The count of missing values per column', True), ('A cleaned version of the data', False), ('An error if no nulls exist', False)]},
        {'text': 'Which method removes duplicate rows from a DataFrame?', 'explanation': 'drop_duplicates() removes rows that are exact copies. You can specify columns to check.', 'choices': [('df.remove_copies()', False), ('df.unique()', False), ('df.drop_duplicates()', True), ('df.clean()', False)]},
        {'text': 'What does `plt.savefig("chart.png")` do?', 'explanation': 'It saves the current matplotlib chart as a PNG image file on disk.', 'choices': [('Opens the chart in a browser', False), ('Prints the chart data', False), ('Saves the chart as an image file', True), ('Uploads the chart to the cloud', False)]},
        {'text': 'What does `df["age"].mean()` calculate?', 'explanation': 'The .mean() method calculates the average (arithmetic mean) of all values in the "age" column.', 'choices': [('The most common age', False), ('The middle age value', False), ('The average age', True), ('The age range', False)]},
    ])
    print(f"    Quiz: {q4.title}")

    # ══════════════════════════════════════════════════════════
    # MODULE 5: Automating Documents & Reports
    # ══════════════════════════════════════════════════════════
    m5, _ = Module.objects.update_or_create(
        course=course, title="Module 5: Automating Documents & Reports",
        defaults={'order': 5}
    )
    print(f"  Module: {m5.title}")

    for ldata in [
        {
            'title': "Generating Excel Reports Automatically",
            'order': 1, 'duration': 25,
            'overview': "### Objectives\n* Use openpyxl to create formatted Excel workbooks from code\n* Add headers, data rows, and styling programmatically\n* Generate professional reports your colleagues will think you made by hand",
            'lesson_text': "### Excel Reports Without Opening Excel\n\nYou know the drill. Every Friday, you open Excel, copy data from three different sources, format it nicely, add headers, adjust column widths, and email it to your boss. What if Python did all of that in 2 seconds?\n\n```python\nfrom openpyxl import Workbook\nfrom openpyxl.styles import Font, PatternFill, Alignment\n\nwb = Workbook()\nws = wb.active\nws.title = \"Weekly Patient Summary\"\n\n# Header row\nheaders = [\"Patient Name\", \"Age\", \"Diagnosis\", \"Status\", \"Next Visit\"]\nfor col, header in enumerate(headers, 1):\n    cell = ws.cell(row=1, column=col, value=header)\n    cell.font = Font(bold=True, color=\"FFFFFF\")\n    cell.fill = PatternFill(start_color=\"2563EB\", fill_type=\"solid\")\n    cell.alignment = Alignment(horizontal=\"center\")\n\n# Data rows\npatients = [\n    [\"Grace Akello\", 34, \"Diabetes\", \"Active\", \"2025-09-15\"],\n    [\"Moses Okot\", 67, \"Hypertension\", \"Active\", \"2025-08-20\"],\n    [\"Fatima Hassan\", 12, \"Recovered\", \"Discharged\", \"-\"],\n]\n\nfor row_data in patients:\n    ws.append(row_data)\n\n# Auto-adjust column widths\nfor col in ws.columns:\n    max_length = max(len(str(cell.value or \"\")) for cell in col)\n    ws.column_dimensions[col[0].column_letter].width = max_length + 4\n\nwb.save(\"weekly_summary.xlsx\")\nprint(\"Report generated: weekly_summary.xlsx\")\n```\n\n### Assignment\nBuild a script that reads patient data from a CSV and generates a formatted Excel report with colour-coded status columns.\n\n### References\n- openpyxl documentation: openpyxl.readthedocs.io\n- Sweigart, A., \"Automate the Boring Stuff\" (2020), Chapter 13",
        },
        {
            'title': "Extracting Text from PDFs",
            'order': 2, 'duration': 25,
            'overview': "### Objectives\n* Extract text content from PDF documents\n* Search PDFs for specific terms or patterns\n* Process multiple PDFs in a folder automatically",
            'lesson_text': "### PDFs Are Everywhere. Now You Can Read Them.\n\nLawyers search through hundreds of pages of contracts. Doctors receive lab results as PDFs. Architects get specifications documents. Until now, you read them manually. Python can read them in seconds.\n\n```bash\npip install PyPDF2\n```\n\n```python\nimport PyPDF2\n\nwith open(\"contract.pdf\", \"rb\") as file:\n    reader = PyPDF2.PdfReader(file)\n    print(f\"Pages: {len(reader.pages)}\")\n    \n    for i, page in enumerate(reader.pages):\n        text = page.extract_text()\n        print(f\"\\n--- Page {i+1} ---\")\n        print(text[:500])  # First 500 characters\n```\n\n### Searching for Keywords\n\n```python\nimport PyPDF2\nimport os\n\ndef search_pdf(filepath, keyword):\n    results = []\n    with open(filepath, \"rb\") as file:\n        reader = PyPDF2.PdfReader(file)\n        for i, page in enumerate(reader.pages):\n            text = page.extract_text() or \"\"\n            if keyword.lower() in text.lower():\n                results.append(i + 1)\n    return results\n\npages = search_pdf(\"contract.pdf\", \"indemnity\")\nif pages:\n    print(f\"'indemnity' found on pages: {pages}\")\nelse:\n    print(\"Keyword not found.\")\n```\n\n### Processing a Folder of PDFs\n\n```python\nimport os\nimport PyPDF2\n\npdf_folder = \"contracts/\"\nkeyword = \"penalty clause\"\n\nfor filename in os.listdir(pdf_folder):\n    if filename.endswith(\".pdf\"):\n        filepath = os.path.join(pdf_folder, filename)\n        pages = search_pdf(filepath, keyword)\n        if pages:\n            print(f\"{filename}: Found on pages {pages}\")\n```\n\n### Assignment\nCreate a script that scans all PDFs in a folder for a user-specified keyword and writes a summary report of which files and pages contain matches.\n\n### References\n- Sweigart, A., \"Automate the Boring Stuff\" (2020), Chapter 15\n- PyPDF2 documentation: pypdf2.readthedocs.io",
        },
        {
            'title': "Creating Word Documents & Email Drafts",
            'order': 3, 'duration': 25,
            'overview': "### Objectives\n* Generate Word documents programmatically with python-docx\n* Create personalised letters from templates\n* Draft email messages using Python's email and smtplib modules",
            'lesson_text': "### Mail Merge Without Microsoft\n\nImagine you need to send 50 personalised letters to patients about their upcoming appointments. Each letter has the same structure but different names, dates, and details. This is called a **mail merge**, and Python does it beautifully.\n\n```bash\npip install python-docx\n```\n\n```python\nfrom docx import Document\nfrom docx.shared import Pt, Inches\nfrom docx.enum.text import WD_ALIGN_PARAGRAPH\n\ndef create_patient_letter(name, date, diagnosis):\n    doc = Document()\n    \n    # Header\n    header = doc.add_heading(\"City Medical Centre\", level=1)\n    header.alignment = WD_ALIGN_PARAGRAPH.CENTER\n    \n    doc.add_paragraph(f\"Date: {date}\")\n    doc.add_paragraph(f\"Dear {name},\")\n    doc.add_paragraph(\n        f\"This letter is to confirm your upcoming appointment at City Medical Centre. \"\n        f\"Based on your records, your current diagnosis is {diagnosis}. \"\n        f\"Please bring your previous test results and insurance card.\"\n    )\n    doc.add_paragraph(\"Warm regards,\")\n    doc.add_paragraph(\"Dr. Peter Ekebu\")\n    \n    safe_name = name.replace(\" \", \"_\")\n    filename = f\"letter_{safe_name}.docx\"\n    doc.save(filename)\n    return filename\n\n# Generate letters for all patients\npatients = [\n    (\"Grace Akello\", \"2025-09-15\", \"Type 2 Diabetes\"),\n    (\"Moses Okot\", \"2025-09-16\", \"Hypertension\"),\n    (\"Fatima Hassan\", \"2025-09-17\", \"Follow-up\"),\n]\n\nfor name, date, diagnosis in patients:\n    filename = create_patient_letter(name, date, diagnosis)\n    print(f\"Created: {filename}\")\n```\n\n### Assignment (Capstone Preview)\nCombine what you have learned: read patient data from a CSV, generate a personalised Word document for each patient, and save all files to a folder called `letters/`.\n\n### References\n- python-docx documentation: python-docx.readthedocs.io\n- Sweigart, A., \"Automate the Boring Stuff\" (2020), Chapter 15",
        },
    ]:
        Lesson.objects.update_or_create(
            module=m5, title=ldata['title'],
            defaults={
                'order': ldata['order'], 'duration_minutes': ldata['duration'],
                'playground_type': 'custom', 'playground_custom_url': PLAYGROUND_URL,
                'overview': ldata['overview'],
                'lesson_text': ldata['lesson_text'],
                'video_script': f"### Narration Script\n\n[Instructor Speaking]: Welcome to '{ldata['title']}'. This is where Python becomes your office assistant...",
                'content': f"### Lesson Plan (Instructor Only)\n* Topic: {ldata['title']}\n* Live Demo with real documents\n* Assignment at end of lesson"
            }
        )
        print(f"    Lesson: {ldata['title']}")

    q5, _ = Quiz.objects.update_or_create(
        module=m5, title="Module 5 Checkpoint: Document Automation",
        defaults={'description': "Test your understanding of Excel, PDF, and Word automation.", 'passing_score': 80, 'points_reward': 50}
    )
    seed_questions(q5, [
        {'text': 'Which library creates formatted Excel files in Python?', 'explanation': 'openpyxl creates and modifies .xlsx files with full formatting support.', 'choices': [('csv', False), ('openpyxl', True), ('pandas', False), ('excel-py', False)]},
        {'text': 'What mode should you open a PDF file in when using PyPDF2?', 'explanation': 'PDFs are binary files, so you must open them in binary read mode with "rb".', 'choices': [('"r" (read)', False), ('"rb" (read binary)', True), ('"w" (write)', False), ('"pdf" (pdf mode)', False)]},
        {'text': 'What does python-docx allow you to create?', 'explanation': 'python-docx creates and modifies Microsoft Word (.docx) documents programmatically.', 'choices': [('PDF files', False), ('Excel spreadsheets', False), ('Word documents', True), ('PowerPoint slides', False)]},
        {'text': 'What is a "mail merge" in the context of this course?', 'explanation': 'A mail merge generates multiple personalised documents from a template and a data source. Python automates this without needing Microsoft Word.', 'choices': [('Combining two email accounts', False), ('Generating personalised documents from data', True), ('Merging two PDF files', False), ('Sending bulk spam emails', False)]},
        {'text': 'Which function from os module lists all files in a folder?', 'explanation': 'os.listdir(folder) returns a list of all filenames in the specified folder.', 'choices': [('os.files()', False), ('os.listdir()', True), ('os.folder()', False), ('os.scan()', False)]},
    ])
    print(f"    Quiz: {q5.title}")

    # ══════════════════════════════════════════════════════════
    # MODULE 6: Putting It All Together
    # ══════════════════════════════════════════════════════════
    m6, _ = Module.objects.update_or_create(
        course=course, title="Module 6: Putting It All Together",
        defaults={'order': 6}
    )
    print(f"  Module: {m6.title}")

    for ldata in [
        {
            'title': "Using Python with AI Tools (ChatGPT API Basics)",
            'order': 1, 'duration': 25,
            'overview': "### Objectives\n* Understand how APIs work (at a high level)\n* Use Python to send prompts to an AI and receive responses\n* Build a simple AI-powered assistant for your profession",
            'lesson_text': "### Python + AI = Superpowers\n\nYou have already seen what Python can do with data, files, and documents. Now imagine combining that with AI. You could build a script that reads a patient's lab results, sends them to an AI for interpretation, and generates a summary letter - all automatically.\n\n### What is an API?\n\nAn API (Application Programming Interface) is a way for your Python script to talk to another service over the internet. Think of it like ordering food at a restaurant: you (Python) send a request (your order) to the kitchen (the AI service), and it sends back a response (your food).\n\n### Using OpenAI's API\n\n```bash\npip install openai\n```\n\n```python\nfrom openai import OpenAI\n\nclient = OpenAI(api_key=\"your-api-key-here\")\n\nresponse = client.chat.completions.create(\n    model=\"gpt-4o-mini\",\n    messages=[\n        {\"role\": \"system\", \"content\": \"You are a helpful medical assistant.\"},\n        {\"role\": \"user\", \"content\": \"Explain what an HbA1c level of 7.2% means for a diabetic patient.\"}\n    ]\n)\n\nprint(response.choices[0].message.content)\n```\n\n### Building a Professional AI Tool\n\n```python\ndef analyse_lab_result(test_name, value, unit):\n    prompt = f\"A patient's {test_name} result is {value} {unit}. Provide a brief, professional interpretation suitable for a medical report.\"\n    \n    response = client.chat.completions.create(\n        model=\"gpt-4o-mini\",\n        messages=[\n            {\"role\": \"system\", \"content\": \"You are a clinical laboratory assistant.\"},\n            {\"role\": \"user\", \"content\": prompt}\n        ]\n    )\n    return response.choices[0].message.content\n\n# Use it\ninterpretation = analyse_lab_result(\"HbA1c\", 7.2, \"%\")\nprint(interpretation)\n```\n\n### Assignment\nBuild a script that reads a list of legal terms from a file and uses the AI API to generate a plain-English definition for each one. Save the glossary to a Word document.\n\n### References\n- OpenAI API documentation (platform.openai.com/docs, 2024)\n- Google Gemini API documentation (ai.google.dev, 2024)",
        },
        {
            'title': "Building a Complete Mini-Project",
            'order': 2, 'duration': 30,
            'overview': "### Objectives\n* Combine everything from Modules 1-5 into one project\n* Build a Professional Dashboard script\n* Experience the full workflow: read data, process, visualise, export",
            'lesson_text': "### Your Capstone Project\n\nThis is it. Everything you have learned comes together in one project. You are going to build a **Professional Dashboard** - a script that reads your weekly data, processes it, creates charts, and generates a complete report.\n\n### The Architecture\n\n```\nweekly_data.csv --> Python Script --> weekly_report.xlsx\n                                 --> summary_chart.png\n                                 --> cover_letter.docx\n```\n\n### Step by Step\n\n```python\nimport pandas as pd\nimport matplotlib.pyplot as plt\nfrom openpyxl import Workbook\nfrom docx import Document\nfrom datetime import datetime\n\n# 1. READ DATA\ndf = pd.read_csv(\"weekly_data.csv\")\nprint(f\"Loaded {len(df)} records\")\n\n# 2. CLEAN DATA\ndf = df.dropna(subset=[\"name\", \"amount\"])\ndf[\"amount\"] = pd.to_numeric(df[\"amount\"], errors=\"coerce\").fillna(0)\n\n# 3. ANALYSE\ntotal = df[\"amount\"].sum()\naverage = df[\"amount\"].mean()\ntop_5 = df.nlargest(5, \"amount\")\n\n# 4. VISUALISE\ncategory_totals = df.groupby(\"category\")[\"amount\"].sum()\ncategory_totals.plot(kind=\"bar\", color=\"#2563eb\", figsize=(10, 6))\nplt.title(\"Weekly Summary by Category\")\nplt.ylabel(\"Amount (UGX)\")\nplt.tight_layout()\nplt.savefig(\"summary_chart.png\", dpi=150)\n\n# 5. GENERATE REPORT\ndoc = Document()\ndoc.add_heading(\"Weekly Professional Summary\", level=1)\ndoc.add_paragraph(f\"Generated: {datetime.now().strftime('%d %B %Y')}\")\ndoc.add_paragraph(f\"Total records: {len(df)}\")\ndoc.add_paragraph(f\"Total amount: UGX {total:,.0f}\")\ndoc.add_paragraph(f\"Average amount: UGX {average:,.0f}\")\ndoc.add_picture(\"summary_chart.png\")\ndoc.save(\"weekly_report.docx\")\n\nprint(\"Done! Files generated:\")\nprint(\"  - summary_chart.png\")\nprint(\"  - weekly_report.docx\")\n```\n\n### Choose Your Version\n\n- **Doctor version:** Patient visit summary + lab result trends\n- **Lawyer version:** Case load tracker + billing hours chart\n- **Architect version:** Project timeline + material cost estimator\n\n### References\n- All previous module references combined\n- Project-based learning methodology",
        },
        {
            'title': "Where to Go Next: Your Learning Roadmap",
            'order': 3, 'duration': 20,
            'overview': "### Objectives\n* Know the three paths forward after this course\n* Discover resources for continued learning\n* Join the Ekebu learning community",
            'lesson_text': "### You Did It\n\nSix weeks ago, you could not write a single line of code. Now you can read files, clean data, create charts, generate reports, search PDFs, and even talk to AI - all with Python.\n\nThat is not a small thing. Most people never get this far.\n\n### Three Paths Forward\n\n**Path 1: Go Deeper into Data (Recommended for Doctors & Researchers)**\n- Learn advanced pandas and data visualisation\n- Explore Jupyter Notebooks for interactive analysis\n- Try machine learning with scikit-learn\n- Books: \"Python for Data Analysis\" by Wes McKinney, \"Hands-On ML\" by Aurelien Geron\n\n**Path 2: Build Web Applications (For Those Who Want to Create Products)**\n- Learn Flask or Django for web development\n- Build dashboards with Streamlit or Dash\n- Books: \"Flask Web Development\" by Miguel Grinberg\n\n**Path 3: Specialise in Automation (For Maximum Immediate Impact)**\n- Learn web scraping with BeautifulSoup and Selenium\n- Automate email, calendar, and cloud services\n- Build scheduled scripts that run themselves\n- Books: \"Automate the Boring Stuff\" by Al Sweigart (the full book)\n\n### Free Resources\n\n- **Python.org Tutorial** - The official tutorial, free forever\n- **Roadmap.sh/python** - Visual learning path\n- **Real Python (realpython.com)** - Excellent tutorials and articles\n- **Stack Overflow** - Where every programmer finds answers\n\n### Stay Connected\n\nJoin our community of professionals who code. Share your projects, ask questions, and keep growing.\n\nCongratulations. You are now a professional who codes.\n\n### References\n- Roadmap.sh Python Developer Path (2024)\n- All course references compiled",
        },
    ]:
        Lesson.objects.update_or_create(
            module=m6, title=ldata['title'],
            defaults={
                'order': ldata['order'], 'duration_minutes': ldata['duration'],
                'playground_type': 'custom' if ldata['order'] < 3 else '',
                'playground_custom_url': PLAYGROUND_URL if ldata['order'] < 3 else '',
                'overview': ldata['overview'],
                'lesson_text': ldata['lesson_text'],
                'video_script': f"### Narration Script\n\n[Instructor Speaking]: Welcome to '{ldata['title']}'...",
                'content': f"### Lesson Plan (Instructor Only)\n* Topic: {ldata['title']}"
            }
        )
        print(f"    Lesson: {ldata['title']}")

    q6, _ = Quiz.objects.update_or_create(
        module=m6, title="Final Course Assessment",
        defaults={'description': "Comprehensive assessment covering all 6 modules. 10 questions, 80% to pass.", 'passing_score': 80, 'points_reward': 100}
    )
    seed_questions(q6, [
        {'text': 'What type does `input()` always return?', 'explanation': 'input() always returns a string.', 'choices': [('int', False), ('float', False), ('str', True), ('bool', False)]},
        {'text': 'What is the output of `len([1, 2, 3])`?', 'explanation': 'len() returns the number of items in a list. This list has 3 items.', 'choices': [('2', False), ('3', True), ('4', False), ('Error', False)]},
        {'text': 'Which keyword defines a function in Python?', 'explanation': 'The def keyword is used to define (create) a function.', 'choices': [('function', False), ('func', False), ('def', True), ('define', False)]},
        {'text': 'What does `try/except` do?', 'explanation': 'try/except handles errors gracefully so the program does not crash.', 'choices': [('Speeds up the code', False), ('Catches and handles errors', True), ('Creates a loop', False), ('Imports a module', False)]},
        {'text': 'Which library reads Excel files?', 'explanation': 'pandas with openpyxl reads .xlsx files.', 'choices': [('csv', False), ('matplotlib', False), ('pandas', True), ('json', False)]},
        {'text': 'What does `df.dropna()` do?', 'explanation': 'dropna() removes rows that contain missing (NaN) values.', 'choices': [('Drops all columns', False), ('Removes rows with missing values', True), ('Fills missing values with 0', False), ('Deletes the file', False)]},
        {'text': 'What library creates charts in Python?', 'explanation': 'matplotlib.pyplot is the standard charting library.', 'choices': [('charts', False), ('plotly', False), ('matplotlib', True), ('openpyxl', False)]},
        {'text': 'What does `"rb"` mean when opening a file?', 'explanation': '"rb" means read binary - required for non-text files like PDFs.', 'choices': [('Read backwards', False), ('Read binary', True), ('Read batch', False), ('Read bytes only', False)]},
        {'text': 'What is an API?', 'explanation': 'An API lets your code communicate with external services over the internet.', 'choices': [('A programming language', False), ('A type of database', False), ('A way for programs to talk to external services', True), ('An error message', False)]},
        {'text': 'What is the recommended next step after this course for a doctor interested in data?', 'explanation': 'Path 1 (Data Analysis) with pandas, Jupyter, and eventually machine learning is ideal for medical professionals.', 'choices': [('Learn web development', False), ('Go deeper into data analysis with pandas and Jupyter', True), ('Learn mobile app development', False), ('Stop learning and just use ChatGPT', False)]},
    ])
    print(f"    Quiz: {q6.title}")

    print(f"\n{'='*60}")
    print(f"SEEDING COMPLETE!")
    print(f"Course: {course.title}")
    print(f"Modules: {course.modules.count()}")
    total_lessons = sum(m.lessons.count() for m in course.modules.all())
    total_quizzes = sum(m.quizzes.count() for m in course.modules.all())
    print(f"Lessons: {total_lessons}")
    print(f"Quizzes: {total_quizzes}")
    print(f"{'='*60}")


def seed_questions(quiz, questions_data):
    """Helper: create questions and choices for a quiz."""
    for idx, qdata in enumerate(questions_data, 1):
        question, _ = Question.objects.update_or_create(
            quiz=quiz, order=idx,
            defaults={
                'text': qdata['text'],
                'explanation': qdata['explanation'],
                'points': 1,
            }
        )
        # Clear old choices
        question.choices.all().delete()
        for choice_text, is_correct in qdata['choices']:
            Choice.objects.create(
                question=question,
                text=choice_text,
                is_correct=is_correct,
            )


if __name__ == "__main__":
    seed()
