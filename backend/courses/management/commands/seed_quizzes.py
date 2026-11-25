"""
Management command to seed quiz data for the AI Tools for Teachers course.
Creates quizzes with real, curriculum-aligned questions for each module.
"""
from django.core.management.base import BaseCommand
from courses.models import Module, Quiz, Question, Choice


QUIZ_DATA = {
    # Module 1: AI Literacy & Your First Prompt
    1: {
        "title": "Module 1 Checkpoint: AI Literacy",
        "description": "Test your understanding of AI fundamentals, prompt engineering, and data safety for educators.",
        "passing_score": 80,
        "points_reward": 50,
        "questions": [
            {
                "text": "Which of the following best describes what a large language model (LLM) like ChatGPT actually does?",
                "explanation": "LLMs predict the most likely next word in a sequence based on patterns learned from vast amounts of text. They do not store a searchable database, nor do they truly 'understand' content the way humans do.",
                "points": 1,
                "choices": [
                    {"text": "It searches the internet in real time and returns the top result.", "is_correct": False},
                    {"text": "It predicts the most probable next word in a sequence based on patterns in training data.", "is_correct": True},
                    {"text": "It copies and pastes text directly from websites and textbooks.", "is_correct": False},
                    {"text": "It stores every fact in a structured database and retrieves them on demand.", "is_correct": False},
                ],
            },
            {
                "text": "A teacher writes the prompt: 'Give me a lesson plan.' What is the main problem with this prompt?",
                "explanation": "Effective prompts need context: the subject, grade level, duration, learning objectives, and any constraints. Without these details, the AI output will be generic and unlikely to be classroom-ready.",
                "points": 1,
                "choices": [
                    {"text": "It is too short to be processed by an AI chatbot.", "is_correct": False},
                    {"text": "It lacks context such as subject, grade level, and learning objectives.", "is_correct": True},
                    {"text": "It uses the wrong language for AI tools.", "is_correct": False},
                    {"text": "AI chatbots cannot generate lesson plans at all.", "is_correct": False},
                ],
            },
            {
                "text": "Which prompting technique involves assigning the AI a specific role before giving instructions?",
                "explanation": "Role prompting (e.g., 'You are an experienced P5 science teacher in Uganda...') helps the AI generate responses that are more tailored, contextually appropriate, and professionally framed.",
                "points": 1,
                "choices": [
                    {"text": "Chain-of-thought prompting", "is_correct": False},
                    {"text": "Zero-shot prompting", "is_correct": False},
                    {"text": "Role prompting", "is_correct": True},
                    {"text": "Temperature adjustment", "is_correct": False},
                ],
            },
            {
                "text": "Under Uganda's Data Protection and Privacy Act (2019), which of the following is a teacher's obligation when using AI tools?",
                "explanation": "The Act requires that personally identifiable information (PII) of minors is protected. Teachers should never input student names, ID numbers, or performance data into public AI tools without proper safeguards.",
                "points": 1,
                "choices": [
                    {"text": "Teachers must purchase a premium AI subscription to comply.", "is_correct": False},
                    {"text": "Teachers must never use any AI tool in the classroom.", "is_correct": False},
                    {"text": "Teachers must avoid entering students' personal identifiable information into public AI tools.", "is_correct": True},
                    {"text": "Teachers are exempt from data protection rules if using AI for education.", "is_correct": False},
                ],
            },
            {
                "text": "What is a 'hallucination' in the context of AI-generated content?",
                "explanation": "AI hallucinations are outputs that sound plausible and confident but are factually incorrect. This is why teachers must always verify AI-generated content before using it in class.",
                "points": 1,
                "choices": [
                    {"text": "When the AI produces content that is factually incorrect but presented confidently.", "is_correct": True},
                    {"text": "When the AI refuses to answer a question due to safety filters.", "is_correct": False},
                    {"text": "When the AI generates content in the wrong language.", "is_correct": False},
                    {"text": "When the AI takes too long to respond to a prompt.", "is_correct": False},
                ],
            },
        ],
    },

    # Module 2: Planning: Schemes & Lesson Plans
    2: {
        "title": "Module 2 Checkpoint: Planning with AI",
        "description": "Assess your ability to use AI for curriculum-aligned lesson planning and scheme of work development.",
        "passing_score": 80,
        "points_reward": 50,
        "questions": [
            {
                "text": "When using AI to generate a lesson plan aligned with the NCDC curriculum, which detail is MOST critical to include in your prompt?",
                "explanation": "The specific competencies, learning outcomes, or syllabus references from the NCDC curriculum are essential for ensuring the AI output is aligned with what students need to learn. Without these, the plan may be topically correct but not curriculum-compliant.",
                "points": 1,
                "choices": [
                    {"text": "The name of the school and the headteacher.", "is_correct": False},
                    {"text": "The specific learning competencies or outcomes from the NCDC syllabus.", "is_correct": True},
                    {"text": "The number of textbooks available in the school library.", "is_correct": False},
                    {"text": "The AI tool's subscription tier.", "is_correct": False},
                ],
            },
            {
                "text": "A teacher asks AI to create a termly scheme of work. The output covers 14 weeks, but the term is only 12 weeks. What should the teacher do?",
                "explanation": "AI outputs are starting points, not finished products. Teachers must always adapt the generated content to match their actual school calendar, available resources, and student needs.",
                "points": 1,
                "choices": [
                    {"text": "Use it as-is and skip the last two weeks of content.", "is_correct": False},
                    {"text": "Report the AI tool as broken.", "is_correct": False},
                    {"text": "Edit the scheme to fit 12 weeks, redistributing or merging topics as appropriate.", "is_correct": True},
                    {"text": "Extend the term to 14 weeks.", "is_correct": False},
                ],
            },
            {
                "text": "Which of the following is the best prompt structure for generating a lesson plan for a resource-constrained classroom?",
                "explanation": "Specifying constraints like class size, lack of projectors, and the need for low-cost materials ensures the AI generates a practical, usable lesson plan rather than one that assumes ideal conditions.",
                "points": 1,
                "choices": [
                    {"text": "'Write a lesson plan for P6 Science.'", "is_correct": False},
                    {"text": "'You are a P6 Science teacher in a rural Ugandan school with 80 students. Create a 40-minute lesson on photosynthesis using only a chalkboard and locally available materials.'", "is_correct": True},
                    {"text": "'Generate a modern, tech-integrated STEM lesson with interactive simulations.'", "is_correct": False},
                    {"text": "'Give me a lesson plan. Make it good.'", "is_correct": False},
                ],
            },
            {
                "text": "What is the primary risk of using an AI-generated lesson plan without reviewing it?",
                "explanation": "AI can produce content with factual errors, culturally inappropriate examples, or activities that do not match the learners' context. Professional review ensures accuracy and relevance.",
                "points": 1,
                "choices": [
                    {"text": "The plan will always be too long for the lesson period.", "is_correct": False},
                    {"text": "It may contain inaccurate information or culturally inappropriate content.", "is_correct": True},
                    {"text": "The school administration will not accept AI-generated plans.", "is_correct": False},
                    {"text": "Students will immediately know it was AI-generated.", "is_correct": False},
                ],
            },
            {
                "text": "When building a scheme of work with AI, what is the benefit of providing the AI with the full list of topics from your syllabus?",
                "explanation": "Providing the complete topic list allows the AI to distribute content logically across weeks, ensure no topics are missed, and create a coherent progression that builds on prior knowledge.",
                "points": 1,
                "choices": [
                    {"text": "It makes the AI respond faster.", "is_correct": False},
                    {"text": "It ensures comprehensive coverage and logical sequencing of topics across the term.", "is_correct": True},
                    {"text": "It reduces the cost of using the AI tool.", "is_correct": False},
                    {"text": "It prevents the AI from generating any errors.", "is_correct": False},
                ],
            },
        ],
    },

    # Module 3: Materials: Worksheets & Visuals
    3: {
        "title": "Module 3 Checkpoint: Creating Materials",
        "description": "Evaluate your skills in generating differentiated worksheets, visual aids, and locally translated materials using AI.",
        "passing_score": 80,
        "points_reward": 50,
        "questions": [
            {
                "text": "When using AI to create differentiated worksheets for a mixed-ability class, what is the most effective approach?",
                "explanation": "Requesting multiple difficulty tiers in a single prompt (e.g., 'Create three versions: foundational, intermediate, and advanced') lets you serve all learners from one generation session while maintaining topic consistency.",
                "points": 1,
                "choices": [
                    {"text": "Generate one worksheet and let students choose which questions to answer.", "is_correct": False},
                    {"text": "Ask the AI to create separate versions at different difficulty levels (e.g., foundational, intermediate, advanced).", "is_correct": True},
                    {"text": "Only create worksheets for the strongest students and let others copy.", "is_correct": False},
                    {"text": "Use the same worksheet for everyone and grade on a curve.", "is_correct": False},
                ],
            },
            {
                "text": "A teacher wants to create a labelled diagram of the human digestive system using AI. Which tool category is most appropriate?",
                "explanation": "AI image generators (like DALL-E or Canva's AI) can create visual diagrams, but for labelled educational diagrams, using AI text tools to generate SVG code or detailed descriptions for diagram-making tools tends to produce more accurate, editable results.",
                "points": 1,
                "choices": [
                    {"text": "A text-based chatbot like ChatGPT, asking it to describe the diagram in words only.", "is_correct": False},
                    {"text": "An AI image generator combined with a text tool for accurate labels and annotations.", "is_correct": True},
                    {"text": "A spreadsheet application like Excel.", "is_correct": False},
                    {"text": "A video conferencing tool like Zoom.", "is_correct": False},
                ],
            },
            {
                "text": "When translating educational content from English to a local East African language (e.g., Luganda) using AI, what critical step must a teacher take?",
                "explanation": "AI translations of local languages can contain errors in grammar, tone, or cultural nuance. A native speaker review is essential to catch mistakes that could confuse learners or convey incorrect information.",
                "points": 1,
                "choices": [
                    {"text": "Accept the translation as-is since AI is always accurate with African languages.", "is_correct": False},
                    {"text": "Have a native speaker review and correct the translation before classroom use.", "is_correct": True},
                    {"text": "Only translate the title and leave the body in English.", "is_correct": False},
                    {"text": "Use Google Translate instead, which is always more accurate.", "is_correct": False},
                ],
            },
            {
                "text": "What is the main advantage of using AI to generate visual aids for teaching abstract concepts like fractions or the water cycle?",
                "explanation": "Visual representations help make abstract concepts concrete. AI can quickly generate multiple visual approaches (diagrams, analogies, step-by-step illustrations) that would take teachers hours to create manually.",
                "points": 1,
                "choices": [
                    {"text": "It eliminates the need for teachers to understand the concepts themselves.", "is_correct": False},
                    {"text": "It can rapidly produce multiple visual representations that make abstract ideas concrete and accessible.", "is_correct": True},
                    {"text": "It guarantees that every student will understand the concept immediately.", "is_correct": False},
                    {"text": "It replaces the need for any hands-on activities.", "is_correct": False},
                ],
            },
            {
                "text": "A teacher generated a worksheet using AI but notices it references examples from American culture. What should the teacher do?",
                "explanation": "Localising content is essential for learner engagement. Replacing foreign examples with culturally relevant ones (e.g., using matoke instead of pizza, or Lake Victoria instead of the Mississippi) makes the material more meaningful.",
                "points": 1,
                "choices": [
                    {"text": "Use it anyway since the academic content is still correct.", "is_correct": False},
                    {"text": "Discard the entire worksheet and start from scratch.", "is_correct": False},
                    {"text": "Replace the cultural references with locally relevant East African examples before printing.", "is_correct": True},
                    {"text": "Ask students to research the American references on their own.", "is_correct": False},
                ],
            },
        ],
    },

    # Module 4: Engagement: Slides, Video & Quizzes
    4: {
        "title": "Module 4 Checkpoint: Engagement Tools",
        "description": "Check your proficiency in using AI to build slide decks, explainer videos, and auto-graded assessments.",
        "passing_score": 80,
        "points_reward": 50,
        "questions": [
            {
                "text": "When using AI to generate a slide deck, what is the recommended best practice for slide content?",
                "explanation": "Effective slides follow the 'less is more' principle. AI often generates text-heavy slides by default, so teachers should prompt for concise bullet points and specify a maximum number of words per slide.",
                "points": 1,
                "choices": [
                    {"text": "Copy the full lesson plan text onto each slide for completeness.", "is_correct": False},
                    {"text": "Keep each slide to 3-5 concise bullet points with a clear heading.", "is_correct": True},
                    {"text": "Use as many slides as possible to cover every detail.", "is_correct": False},
                    {"text": "Only use images with no text at all.", "is_correct": False},
                ],
            },
            {
                "text": "A teacher wants to create a 3-minute narrated explainer video on cell division. Which AI-assisted workflow is most practical in a low-resource setting?",
                "explanation": "This workflow uses free or low-cost tools: AI generates the script and visual descriptions, the teacher records narration on a phone, and simple tools combine them. This is far more practical than expensive video production software.",
                "points": 1,
                "choices": [
                    {"text": "Hire a professional video production company.", "is_correct": False},
                    {"text": "Use AI to write the script, generate simple visuals, then record narration using a smartphone.", "is_correct": True},
                    {"text": "Record a full lecture on a whiteboard without any preparation.", "is_correct": False},
                    {"text": "Download a video from YouTube and present it as original work.", "is_correct": False},
                ],
            },
            {
                "text": "When using AI to create multiple-choice quiz questions, how should a teacher ensure the questions assess higher-order thinking?",
                "explanation": "Prompting with Bloom's taxonomy levels (analyse, evaluate, create) pushes the AI beyond simple recall questions. For example, asking for questions that require students to 'apply' a concept to a new scenario tests deeper understanding.",
                "points": 1,
                "choices": [
                    {"text": "Ask the AI to only generate 'True or False' questions.", "is_correct": False},
                    {"text": "Specify Bloom's taxonomy levels in the prompt (e.g., 'Create questions at the application and analysis levels').", "is_correct": True},
                    {"text": "Use only the questions the AI generates without any modification.", "is_correct": False},
                    {"text": "Make all questions as difficult as possible regardless of the learning objectives.", "is_correct": False},
                ],
            },
            {
                "text": "What is the key benefit of using AI to generate instant feedback for student quiz responses?",
                "explanation": "Immediate, personalised feedback helps students understand their mistakes while the content is still fresh. This is especially valuable in large classes where a teacher cannot provide individual feedback to every student quickly.",
                "points": 1,
                "choices": [
                    {"text": "It completely replaces the need for teacher feedback.", "is_correct": False},
                    {"text": "It provides immediate, personalised explanations that support learning while the content is still fresh.", "is_correct": True},
                    {"text": "It ensures every student gets a perfect score.", "is_correct": False},
                    {"text": "It saves the school money on printing answer sheets.", "is_correct": False},
                ],
            },
            {
                "text": "A teacher notices that AI-generated quiz distractors (wrong answers) are obviously incorrect. What should the teacher do?",
                "explanation": "Effective distractors should represent common misconceptions or plausible errors. If the wrong answers are too obvious, students can guess correctly without actually understanding the material, defeating the purpose of assessment.",
                "points": 1,
                "choices": [
                    {"text": "Use them as-is since students will get higher scores.", "is_correct": False},
                    {"text": "Replace them with plausible distractors based on common student misconceptions.", "is_correct": True},
                    {"text": "Remove all wrong answers and make every option correct.", "is_correct": False},
                    {"text": "Add more wrong answers to make the quiz longer.", "is_correct": False},
                ],
            },
        ],
    },

    # Module 5: Research, Records & Pulling It Together
    5: {
        "title": "Module 5 Checkpoint: Research & Records",
        "description": "Final assessment on fact-checking AI content, querying syllabus documents, and drafting professional communications.",
        "passing_score": 80,
        "points_reward": 75,
        "questions": [
            {
                "text": "What is the FIRST thing a teacher should do after AI generates a set of facts for a science lesson?",
                "explanation": "Cross-referencing with authoritative sources (NCDC syllabus, approved textbooks, peer-reviewed sources) is the essential first step. AI can hallucinate facts that sound correct but are not, and teaching incorrect information is harmful.",
                "points": 1,
                "choices": [
                    {"text": "Print the content immediately to save time.", "is_correct": False},
                    {"text": "Cross-reference the facts against the approved syllabus and reliable sources.", "is_correct": True},
                    {"text": "Share it directly with students via WhatsApp.", "is_correct": False},
                    {"text": "Ask the AI if the facts are correct (self-verification).", "is_correct": False},
                ],
            },
            {
                "text": "A teacher uploads their school's syllabus PDF to an AI tool and asks it questions about the content. This technique is known as:",
                "explanation": "Retrieval-Augmented Generation (RAG) or document-grounded querying allows the AI to answer questions based specifically on the uploaded document rather than its general training data, making responses more accurate and relevant.",
                "points": 1,
                "choices": [
                    {"text": "Prompt chaining", "is_correct": False},
                    {"text": "Document-grounded querying (RAG)", "is_correct": True},
                    {"text": "Fine-tuning the AI model", "is_correct": False},
                    {"text": "Data mining", "is_correct": False},
                ],
            },
            {
                "text": "When using AI to draft end-of-term report comments for students, which approach is most professional and ethical?",
                "explanation": "AI can generate comment templates, but each student is unique. Teachers must personalise the comments with specific observations about the individual student's strengths, areas for improvement, and behaviour that only the teacher would know.",
                "points": 1,
                "choices": [
                    {"text": "Generate one generic comment and paste it for every student.", "is_correct": False},
                    {"text": "Use AI to draft personalised templates, then review and customise each comment with specific student observations.", "is_correct": True},
                    {"text": "Let students write their own report comments using AI.", "is_correct": False},
                    {"text": "Skip report comments entirely since AI cannot handle them.", "is_correct": False},
                ],
            },
            {
                "text": "A teacher wants to send a professional message to parents about upcoming exams. What is the best way to use AI for this?",
                "explanation": "AI excels at drafting professional, well-structured communications. By providing the key details and desired tone, teachers get a polished draft that they can then personalise for their specific school context.",
                "points": 1,
                "choices": [
                    {"text": "Let AI compose and send the message directly to parents without review.", "is_correct": False},
                    {"text": "Provide AI with key details (dates, subjects, expectations) and ask it to draft a professional, warm message for review.", "is_correct": True},
                    {"text": "Copy a message template from the internet without modification.", "is_correct": False},
                    {"text": "Avoid digital communication and only send handwritten notes.", "is_correct": False},
                ],
            },
            {
                "text": "Reflecting on the entire course, which statement best captures the role of AI in an East African teacher's practice?",
                "explanation": "AI is a powerful assistant that can save teachers significant time on administrative and content-creation tasks. However, the teacher's professional judgement, cultural knowledge, and relationship with students remain irreplaceable.",
                "points": 1,
                "choices": [
                    {"text": "AI should eventually replace teachers entirely to reduce education costs.", "is_correct": False},
                    {"text": "AI is a time-saving assistant that enhances a teacher's capabilities, but professional judgement and cultural context remain irreplaceable.", "is_correct": True},
                    {"text": "AI is too unreliable to be used in any educational setting.", "is_correct": False},
                    {"text": "AI tools are only useful for teachers in wealthy, well-resourced schools.", "is_correct": False},
                ],
            },
        ],
    },
}


class Command(BaseCommand):
    help = "Seed quiz data for the AI Tools for Teachers course."

    def handle(self, *args, **options):
        for module_id, quiz_data in QUIZ_DATA.items():
            try:
                module = Module.objects.get(id=module_id)
            except Module.DoesNotExist:
                self.stderr.write(self.style.ERROR(f"Module id={module_id} not found, skipping."))
                continue

            # Delete existing quiz for this module (if re-running)
            Quiz.objects.filter(module=module).delete()

            quiz = Quiz.objects.create(
                module=module,
                title=quiz_data["title"],
                description=quiz_data["description"],
                passing_score=quiz_data["passing_score"],
                points_reward=quiz_data["points_reward"],
            )
            self.stdout.write(f"  Created quiz: {quiz.title}")

            for i, q_data in enumerate(quiz_data["questions"], start=1):
                question = Question.objects.create(
                    quiz=quiz,
                    text=q_data["text"],
                    explanation=q_data["explanation"],
                    points=q_data["points"],
                    order=i,
                )
                for choice_data in q_data["choices"]:
                    Choice.objects.create(
                        question=question,
                        text=choice_data["text"],
                        is_correct=choice_data["is_correct"],
                    )

            self.stdout.write(self.style.SUCCESS(
                f"  -> {len(quiz_data['questions'])} questions seeded for Module {module_id}"
            ))

        self.stdout.write(self.style.SUCCESS("\nAll quizzes seeded successfully."))
