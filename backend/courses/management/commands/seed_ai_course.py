import os
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from courses.models import Course, Module, Lesson

class Command(BaseCommand):
    help = 'Seeds the database with the AI Tools for Teachers course.'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding 'AI Tools for Teachers: East Africa Edition'...")

        # 1. Create Course
        course, created = Course.objects.update_or_create(
            title="AI Tools for Teachers: East Africa Edition",
            defaults={
                "slug": slugify("AI Tools for Teachers: East Africa Edition"),
                "subtitle": "Cut planning time in half using free AI tools designed for CBC, NCDC, and CBET classrooms.",
                "price_ugx": 35000,
                "original_price_ugx": 100000,
                "category": "Professional Development",
                "level": "all",
                "language": "English",
                "is_published": True,
                "thumbnail": "", # Can add an image URL later
                "preview_video_url": "",
                "instructor_name": "Peter Gordon Ekebu",
                "what_you_learn": [
                    "Generate curriculum-aligned lesson plans or schemes of work in minutes.",
                    "Produce differentiated worksheets for mixed-ability, large classes (40-80+ learners).",
                    "Build visual aids (slides, diagrams, images) where textbooks have none.",
                    "Create short explainer videos for difficult concepts.",
                    "Generate and auto-grade quizzes or formative assessments.",
                    "Translate and localize material into a learner's home language.",
                    "Apply Prompt Engineering (Role, Context, Content, Constraints, Format) to get perfect results.",
                    "Protect learner data and fact-check AI outputs."
                ],
                "requirements": [
                    "A smartphone or basic computer.",
                    "Basic internet connection (data bundles are sufficient; we cover offline tools).",
                    "No prior AI experience required.",
                    "Currently teaching in an East African school system (Kenya, Uganda, Tanzania, Rwanda)."
                ],
                "who_is_for": [
                    "Primary and secondary school teachers in East Africa.",
                    "Heads of Departments or ICT Champions looking to train their staff.",
                    "Teachers feeling overwhelmed by large class sizes and heavy marking loads."
                ],
                "description": """
## Welcome to the East Africa Edition

Are you facing large class sizes (40-80+ learners), limited resources, and the heavy demands of competency-based curriculums like **CBC (Kenya), NCDC (Uganda), CBET (Tanzania), or the REB curriculum (Rwanda)**?

This hands-on course is designed specifically for you.

AI cannot replace a teacher's judgement, but it can completely eliminate the busywork. We will show you how to cut your planning and prep time in half using 100% free AI tools—meaning more of your energy goes to actual teaching.

### What Makes This Course Different?
*   **Smartphone-First:** We assume your main device is an Android phone, not a laptop.
*   **Low Bandwidth:** We know data bundles are expensive and electricity is intermittent. We cover offline workflows and low-data tools.
*   **No Credit Cards Required:** We only teach tools with genuinely free tiers. No hidden paywalls.
*   **Curriculum Aligned:** We teach you how to adapt the AI to *your* exact national syllabus.
                """
            }
        )
        self.stdout.write(f"Course '{course.title}' created/updated.")

        # 2. Define Modules & Lessons
        modules_data = [
            {
                "title": "Module 1: AI Literacy & Your First Prompt",
                "order": 1,
                "lessons": [
                    {
                        "title": "What AI Chatbots Are (and Aren't)",
                        "duration": 15,
                        "content": """### What is an AI Chatbot?

An AI chatbot (like Google Gemini or Microsoft Copilot) is a tool that generates text, answers questions, and brainstorms ideas based on the instructions you give it.

**What it IS:**
*   A tireless assistant that can draft lesson plans, summarize texts, and generate quizzes in seconds.
*   A tool that predicts the most likely next word based on patterns it learned from reading the internet.

**What it is NOT:**
*   It is **not** a search engine (though some are connected to the web). It can confidently invent facts (called "hallucinations").
*   It does **not** "understand" the world the way humans do.

**Key Tools:**
*   [Google Gemini](https://gemini.google.com) - Free, phone-friendly, requires a Google account.
*   [Microsoft Copilot](https://copilot.microsoft.com) - Free, works in the browser without an account for basic chats."""
                    },
                    {
                        "title": "The Anatomy of a Perfect Prompt",
                        "duration": 30,
                        "content": """### What is a Prompt?

A "prompt" is simply the instruction you type into the AI tool. The quality of the output depends entirely on the quality of your prompt.

### The Best Practice Framework: RC3F

To get a perfect result on the first try, use the **RC3F** framework:

1.  **Role**: Tell the AI who it is acting as.
2.  **Context**: Provide background information.
3.  **Content**: State the exact task.
4.  **Constraints**: What are the limits? (e.g., word count, reading level, tone).
5.  **Format**: How should it output the answer? (e.g., a table, bullet points, a script).

#### The Ultimate Starter Prompt Template (Gemini / Copilot)
Copy and paste this structure:

> **Role:** You are an expert [Subject] teacher in [Country].
> **Context:** I am teaching a class of 60 [Grade Level] students. We are following the [National Curriculum Name] syllabus. The students have limited textbooks.
> **Content:** Write a 45-minute lesson plan introducing [Topic].
> **Constraints:** Keep the language simple (CEFR Level A2). Include one interactive activity that requires no digital devices, only chalkboard and paper.
> **Format:** Output the lesson plan with clear headings: Objectives, Introduction, Main Activity, Assessment, and Conclusion.

By providing the syllabus context and local constraints, you stop the AI from generating a generic, Western-centric lesson plan that won't work in your classroom."""
                    },
                    {
                        "title": "Two Golden Safety Rules for Learner Data",
                        "duration": 15,
                        "content": """### Safety Rule 1: Protect Learner Privacy
**Never upload student personal data** (full names, ID numbers, sensitive medical/behavioral notes) into a free AI tool. 
*Why?* Free AI tools often use the data you type in to train their future models. If you need the AI to write a report comment, use initials or generic placeholders (e.g., "Student A").

### Safety Rule 2: Always Fact-Check
**Never teach content directly generated by AI without verifying it first.**
*Why?* AI models can "hallucinate" (invent facts, dates, or historical events). You are the expert teacher—use the AI to draft the structure, but rely on your own knowledge and approved textbooks for the facts."""
                    }
                ]
            },
            {
                "title": "Module 2: Planning: Schemes & Lesson Plans",
                "order": 2,
                "lessons": [
                    {
                        "title": "Generating a Curriculum-Aligned Lesson Plan",
                        "duration": 25,
                        "content": """### Tools for Lesson Planning

While general chatbots (Gemini/Copilot) are great, dedicated EdTech tools have built-in workflows for lesson planning.

**Key Tools:**
*   [MagicSchool AI](https://magicschool.ai) - Has specific generators for 5E Lesson Plans, Rubrics, etc.
*   [Eduaide.ai](https://eduaide.ai) - Excellent for generating teaching resources.
*   [Lessonsquill](https://lessonsquill.com) - Has built-in alignment for regional exams like WAEC/CAPS.

#### Prompting Dedicated Tools
Even in these tools, use explicit constraints in the text boxes:
*   *Constraint Example:* "Must use local materials like bottle caps or locally available plants for the science experiment."
*   *Constraint Example:* "Include specific assessment questions aligned to the NCDC competency requirements."
"""
                    },
                    {
                        "title": "Building a Termly Scheme of Work",
                        "duration": 25,
                        "content": """### Schemes of Work

You can upload or paste your syllabus topics into Gemini or Copilot to generate a scheme of work for the term.

#### The Scheme of Work Prompt Template
> **Role:** You are a senior curriculum planner.
> **Context:** Here is the list of topics for Term 2 [Subject] for [Grade Level]: [Paste Topics]. The term is 12 weeks long, with week 11 and 12 reserved for revision and exams. I teach this class 3 times a week for 40 minutes.
> **Content:** Distribute these topics into a weekly Scheme of Work.
> **Constraints:** Ensure a logical progression. Do not overload any single week.
> **Format:** Output a table with columns: Week, Lesson 1, Lesson 2, Lesson 3, and Required Resources.
"""
                    },
                    {
                        "title": "Adapting AI Plans to Large, Resourced-Constrained Classes",
                        "duration": 25,
                        "content": """### Reality Checking the AI

AI often suggests activities requiring laptops, tablets, or abundant craft supplies. You must train it to understand your reality.

**Add these constraints to your prompts:**
*   "Assume I have a class of 80 students."
*   "Assume the only resources available are a chalkboard, chalk, and student exercise books."
*   "Suggest group work structures that prevent chaos in a cramped classroom."
"""
                    }
                ]
            },
            {
                "title": "Module 3: Materials: Worksheets & Visuals",
                "order": 3,
                "lessons": [
                    {
                        "title": "Differentiated Worksheets for Mixed-Ability Classes",
                        "duration": 30,
                        "content": """### The Challenge
In a class of 60, some learners read above grade level, while others struggle. Creating different worksheets manually takes hours.

### The Solution: Diffit
[Diffit](https://web.diffit.me) allows you to paste text, a URL, or even upload a photo of a textbook page, and it automatically generates a levelled reading passage with vocabulary words, multiple-choice questions, and short-answer prompts.

You can then adjust the reading level up or down with a single click to create version A (standard) and version B (simplified) of the same content."""
                    },
                    {
                        "title": "Creating Diagrams and Visual Aids",
                        "duration": 30,
                        "content": """### Creating Visuals with Canva
When the textbook lacks visuals, create your own.

**Tool:** [Canva for Education](https://canva.com/education) (100% free for verified teachers).

#### Using Canva's Magic Media (Text-to-Image)
Use the RC3F framework for images:
*   **Subject:** A Kenyan classroom.
*   **Action:** Students working together around a desk.
*   **Style:** Illustrated, flat design, colorful.
*   **Prompt:** "A colorful illustration of a Kenyan classroom where students in uniform are working together around a desk."
"""
                    },
                    {
                        "title": "Offline Translation to Local Languages",
                        "duration": 30,
                        "content": """### Google Translate (Offline Mode)

If you teach in lower primary where local languages are used, translation is crucial.

**How to save data:**
1.  Download the [Google Translate App](https://translate.google.com).
2.  While connected to Wi-Fi/Data, go to Settings > Offline translation.
3.  Download the language packs you need (e.g., Kiswahili, Kinyarwanda).
4.  You can now translate text and conversations entirely offline, saving your data bundles for other tasks!
"""
                    }
                ]
            },
            {
                "title": "Module 4: Engagement: Slides, Video & Quizzes",
                "order": 4,
                "lessons": [
                    {
                        "title": "Building Slide Decks Fast",
                        "duration": 30,
                        "content": """### AI Presentation Generators

If your school has a projector, you can generate slides instantly.

**Tools:**
*   **Canva's Magic Design:** Type a topic, and it generates a styled presentation.
*   **Curipod:** Interactive slides where students can use their phones to answer polls (if devices are available).

*Tip:* Always ask Gemini to "Write the content for a 5-slide presentation on [Topic]" first, then paste that text into your slide tool."""
                    },
                    {
                        "title": "Creating Short Narrated Explainer Videos",
                        "duration": 30,
                        "content": """### Explainer Videos

**Tool:** [Canva for Education](https://canva.com/education)

You can record yourself narrating a presentation directly in Canva. Alternatively, tools like Fliki or Lumen5 can turn text into narrated videos, though their free tiers are more restrictive.

*Data Warning:* Generating and downloading videos consumes a lot of data. Do this at a cyber café or when connected to school Wi-Fi."""
                    },
                    {
                        "title": "Auto-Graded Quizzes & Fast Feedback",
                        "duration": 30,
                        "content": """### Fast Assessment Generation

**Tool:** [Wayground](https://wayground.com) (Formerly Quizizz)

You can generate a quiz on any topic in seconds.

#### The Quiz Prompt Template (for Gemini to feed into Wayground)
> **Role:** You are an examiner setting questions for [Grade/Exam].
> **Context:** The students have just studied [Topic].
> **Content:** Write 5 multiple-choice questions assessing their understanding.
> **Constraints:** Ensure the distractors (wrong answers) are plausible common misconceptions. Include the correct answer key at the bottom.
> **Format:** Numbered list.
"""
                    }
                ]
            },
            {
                "title": "Module 5: Research, Records & Pulling It Together",
                "order": 5,
                "lessons": [
                    {
                        "title": "Fact-Checking Content Before Teaching",
                        "duration": 20,
                        "content": """### Research with Perplexity

General AI chatbots can hallucinate. For research, use a tool that cites its sources.

**Tool:** [Perplexity.ai](https://perplexity.ai)

Perplexity searches the live internet and provides footnote links to its sources.

*Classroom Example:* Before teaching a current-events-linked Geography topic, check the latest statistics on Perplexity and verify them against the cited source link."""
                    },
                    {
                        "title": "Querying Your Own Syllabus Documents",
                        "duration": 20,
                        "content": """### Google NotebookLM

If you have a massive PDF syllabus (like the NCDC or KICD framework), you can "talk" to it.

**Tool:** [Google NotebookLM](https://notebooklm.google.com)

Upload your PDF document. The AI will *only* answer questions based on the document you uploaded, eliminating the risk of it inventing facts.

*Prompt:* "List every learning outcome for Term 2 Science, with page references back to the original document."
"""
                    },
                    {
                        "title": "Drafting Report Comments & Parent Messages",
                        "duration": 20,
                        "content": """### Administrative Writing

**Tool:** [MagicSchool AI](https://magicschool.ai) (Report Card Comment Generator)

#### The Report Card Prompt (if using Gemini/Copilot)
> **Role:** You are a professional and encouraging teacher.
> **Context:** I am writing end-of-term report comments. 
> **Content:** Write a 3-sentence comment for a student.
> **Constraints:** The student's strength is [Strength]. The area of improvement is [Weakness]. Keep the tone warm but clear.
> **Format:** A short paragraph.

*Remember Safety Rule 1:* Do not use the student's real name or sensitive data in the prompt. Use "Student A" and insert the real name yourself later.
"""
                    }
                ]
            }
        ]

        # 3. Save Modules and Lessons
        for mod_data in modules_data:
            module, _ = Module.objects.update_or_create(
                course=course,
                title=mod_data["title"],
                defaults={"order": mod_data["order"]}
            )
            self.stdout.write(f"  - Created Module: {module.title}")

            for idx, less_data in enumerate(mod_data["lessons"]):
                lesson, _ = Lesson.objects.update_or_create(
                    module=module,
                    title=less_data["title"],
                    defaults={
                        "order": idx + 1,
                        "duration_minutes": less_data["duration"],
                        "lesson_text": less_data["content"],
                        "overview": f"### Objectives for: {less_data['title']}\n* Understand the core concept of this topic.\n* Learn to apply it in your daily teaching workflow.\n* Complete the module quiz at the end.",
                        "video_script": f"### Narration Script\n[Instructor Speaking]: Welcome back teachers! In this video lesson, we will walk through '{less_data['title']}'. Make sure to follow along with the reading text version below.",
                        "content": f"### Lesson Plan (Instructor Only)\n* **Hook (3 mins):** Ask teachers how much time they spent on this topic last week.\n* **Direct Instruction (7 mins):** Explain concepts and show live browser walkthrough.\n* **Guided Practice (5 mins):** Have teachers write down one prompt on their phones.\n* **Materials:** PDF Checklist and Worksheet samples.",
                        "is_preview": (module.order == 1) # Make Module 1 free to preview
                    }
                )
                self.stdout.write(f"    - Created Lesson: {lesson.title}")

        self.stdout.write(self.style.SUCCESS("Successfully seeded 'AI Tools for Teachers: East Africa Edition'!"))
