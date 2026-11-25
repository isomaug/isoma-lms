import os
import re
import json
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)


def _get_gemini_api_key():
    return (
        os.environ.get("GEMINI_API_KEY")
        or os.environ.get("GEMINI_API_KEY_LOCAL")
        or os.environ.get("GOOGLE_API_KEY")
        or getattr(settings, "GEMINI_API_KEY", "")
        or ""
    ).strip()


def generate_assignment_with_ai(lesson, course):
    """
    EkebuAI: Analyzes the lesson content, duration, overview, and course level
    to generate a comprehensive assignment & worksheet featuring design brief
    sections and multiple-choice questions (MCQs).
    """
    course_title = course.title if course else "STEM Course"
    lesson_title = lesson.title if lesson else "Lesson"
    duration = getattr(lesson, "duration_minutes", 60) or 60
    overview = getattr(lesson, "overview", "") or ""
    lesson_text = (getattr(lesson, "lesson_text", "") or "")[:4000]
    lesson_plan = (getattr(lesson, "content", "") or "")[:2500]

    prompt = f"""You are EkebuAI, an expert STEM, ICT, and Robotics instructional designer.
Analyze the following lesson and generate a complete, authentic, age-appropriate assignment worksheet.

COURSE: {course_title}
LESSON: {lesson_title} (Duration: {duration} minutes)
OVERVIEW: {overview}

CURRICULUM CONTENT & NOTES:
{lesson_text or lesson_plan or overview or 'Hands-on practical exploration and design brief.'}

TASK:
Create a high-quality assignment worksheet tailored specifically to the learners in '{course_title}'.
It must include:
1. Title: A formal document title (e.g. "{lesson_title} — Lesson Worksheet & Assignment")
2. Description: 1-2 sentences summarizing the goals and deliverable.
3. Instructions: Clear guidelines on completing, testing, and submitting the work.
4. Questions: A list of 5 to 7 structured question sections containing:
   - 3 to 4 Open-ended Design Brief / Reflective Sections (type: "text")
   - 2 to 3 Multiple Choice Questions (type: "multiple_choice") testing critical concepts from the lesson text.

Each Multiple Choice Question MUST have:
- "type": "multiple_choice"
- "title": e.g. "Section Title / Concept Check"
- "prompt": The specific question
- "options": An array of 4 choices, each with "id" ("a", "b", "c", "d") and "text"
- "correct_option": The key ("a", "b", "c", or "d")
- "explanation": A concise sentence explaining why the correct choice is right

Each Open Text Question MUST have:
- "type": "text"
- "title": e.g. "1. Problem Statement & Real-World Goal"
- "prompt": Clear guidelines for what the student must write or explain
- "placeholder": A helpful example or starting sentence for the student

OUTPUT REQUIREMENT:
Return ONLY a valid JSON object without markdown fences, in this exact format:
{{
  "title": "{lesson_title} — Lesson Worksheet & Assignment",
  "description": "...",
  "instructions": "...",
  "max_score": 100,
  "questions": [
    {{
      "id": "q1",
      "type": "text",
      "title": "1. Problem & Real-World Context",
      "prompt": "...",
      "placeholder": "..."
    }},
    {{
      "id": "q2",
      "type": "multiple_choice",
      "title": "2. Concept Check: Core Component",
      "prompt": "...",
      "options": [
        {{"id": "a", "text": "..."}},
        {{"id": "b", "text": "..."}},
        {{"id": "c", "text": "..."}},
        {{"id": "d", "text": "..."}}
      ],
      "correct_option": "a",
      "explanation": "..."
    }}
  ]
}}
"""

    api_key = _get_gemini_api_key()
    if api_key:
        models_to_try = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-flash-latest"]
        for model in models_to_try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            try:
                resp = requests.post(
                    url,
                    headers={"Content-Type": "application/json"},
                    json={
                        "contents": [{"parts": [{"text": prompt}]}],
                        "generationConfig": {
                            "responseMimeType": "application/json",
                            "temperature": 0.3,
                            "maxOutputTokens": 4096
                        }
                    },
                    timeout=14
                )
                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates") or []
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        # Strip potential markdown formatting
                        cleaned = text.strip()
                        if cleaned.startswith("```"):
                            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
                            cleaned = re.sub(r"\s*```$", "", cleaned)
                        parsed = json.loads(cleaned)
                        if isinstance(parsed, dict) and isinstance(parsed.get("questions"), list) and len(parsed["questions"]) > 0:
                            # Normalize IDs and ensure types
                            for idx, q in enumerate(parsed["questions"], 1):
                                if not q.get("id"):
                                    q["id"] = f"q_{idx}_{int(os.times().elapsed * 1000)}"
                                if q.get("type") not in ["text", "multiple_choice"]:
                                    q["type"] = "multiple_choice" if q.get("options") else "text"
                            return parsed
            except Exception as e:
                logger.warning(f"EkebuAI Gemini call failed ({model}): {e}")

    # Fallback curriculum generator if API is unavailable or parsing fails
    return _generate_fallback_assignment(lesson, course)


def _generate_fallback_assignment(lesson, course):
    """Generates an intelligent curriculum-based default assignment structure."""
    lesson_title = lesson.title if lesson else "Lesson"
    course_title = course.title if course else "STEM Course"
    overview = getattr(lesson, "overview", "") or "Apply and document your technical skills."

    questions = [
        {
            "id": "q1",
            "type": "text",
            "title": "1. Problem Statement & Real-World Goal",
            "prompt": f"Based on {lesson_title}, what real-world problem or challenge does your solution address? Explain the context and why this design matters.",
            "placeholder": f"e.g. In this session on {lesson_title}, we addressed the challenge of..."
        },
        {
            "id": "q2",
            "type": "text",
            "title": "2. Circuit & Hardware Implementation Plan",
            "prompt": "Detail the components, wiring pinouts, or construction steps you used. Explain how each part connects and functions together.",
            "placeholder": "e.g. Pin 9 connected to the control signal, GND connected to ground rail..."
        },
        {
            "id": "q3",
            "type": "multiple_choice",
            "title": "3. Concept Check: Technical Principles",
            "prompt": f"Which principle is central to the setup and operation demonstrated in {lesson_title}?",
            "options": [
                {"id": "a", "text": "Continuous input polling and threshold verification"},
                {"id": "b", "text": "Disconnecting power before verifying logic levels"},
                {"id": "c", "text": "Bypassing the ground connection for higher current"},
                {"id": "d", "text": "Randomized delay intervals without sensor feedback"}
            ],
            "correct_option": "a",
            "explanation": "Reliable automation requires systematic input monitoring and defined threshold checks."
        },
        {
            "id": "q4",
            "type": "text",
            "title": "4. Testing, Edge Cases & Data Observations",
            "prompt": "Record at least 3 systematic test runs. What happened during each test? Did you encounter any bugs or unexpected behavior?",
            "placeholder": "Test 1: Normal range verification. Test 2: Threshold trigger test. Test 3: Edge case reflection..."
        },
        {
            "id": "q5",
            "type": "multiple_choice",
            "title": "5. Evaluation & Verification",
            "prompt": "When troubleshooting an unexpected circuit or logic state, what is the best initial diagnostic step?",
            "options": [
                {"id": "a", "text": "Inspect physical wiring against the schematic and test with serial logging"},
                {"id": "b", "text": "Immediately replace the micro-controller with a new unit"},
                {"id": "c", "text": "Increase operating voltage beyond the component rating"},
                {"id": "d", "text": "Remove all pull-down resistors from the circuit"}
            ],
            "correct_option": "a",
            "explanation": "Diagnostic best practice begins with visual pinout inspection and structured serial monitoring."
        },
        {
            "id": "q6",
            "type": "text",
            "title": "6. Conclusion & Future Enhancements",
            "prompt": "How would you iterate and scale this project in future lessons? What features or sensors would make it even more capable?",
            "placeholder": "In future iterations, we could integrate wireless reporting or automated fail-safes..."
        }
    ]

    return {
        "title": f"{lesson_title} — Lesson Worksheet & Assignment",
        "description": f"Complete your lesson writeup, circuit & code documentation, and reflections for {course_title}.",
        "instructions": "Answer the design brief questions and concept check questions below. Work is autosaved automatically.",
        "max_score": 100,
        "questions": questions
    }


def parse_assignment_file(uploaded_file, filename):
    """
    Parses a Word (.docx) or Excel (.xlsx/.csv) file into a structured assignment
    with both text and multiple-choice questions.
    """
    fn_lower = filename.lower()

    if fn_lower.endswith(".docx"):
        return _parse_docx(uploaded_file, filename)
    elif fn_lower.endswith((".xlsx", ".xls")):
        return _parse_xlsx(uploaded_file, filename)
    elif fn_lower.endswith(".csv"):
        return _parse_csv(uploaded_file, filename)
    else:
        raise ValueError("Unsupported file format. Please upload a .docx, .xlsx, or .csv file.")


def _parse_docx(file_obj, filename):
    import docx

    doc = docx.Document(file_obj)
    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

    if not paragraphs:
        raise ValueError("The uploaded Word document appears to be empty.")

    # Determine Title
    title = paragraphs[0] if len(paragraphs) > 0 else os.path.splitext(filename)[0]
    description = ""
    start_idx = 1
    if len(paragraphs) > 1 and len(paragraphs[1]) > 10 and not re.match(r"^(?:\d+[\.\)]|question|section|q\d)", paragraphs[1], re.I):
        description = paragraphs[1]
        start_idx = 2

    questions = []
    current_q = None

    mcq_opt_regex = re.compile(r"^(?:[\(\[]?([A-Da-d])[\)\]\.\:]\s*)(.*)$")
    q_header_regex = re.compile(r"^(?:(\d+)[\.\)]|question\s*(\d+)[\:\.]?|section\s*(\d+)[\:\.]?|part\s*([A-Za-z\d]+)[\:\.]?)\s*(.*)$", re.I)

    for p in paragraphs[start_idx:]:
        q_match = q_header_regex.match(p)
        mcq_match = mcq_opt_regex.match(p)

        if q_match:
            # New Question Section
            if current_q:
                questions.append(current_q)
            q_num = len(questions) + 1
            remainder = q_match.group(5) or f"Section {q_num}"
            current_q = {
                "id": f"q_{q_num}_{int(os.times().elapsed * 1000)}",
                "type": "text",
                "title": f"{q_num}. {remainder}" if not remainder.startswith(str(q_num)) else remainder,
                "prompt": "",
                "placeholder": "Type your response here..."
            }
        elif mcq_match and current_q:
            # Multiple Choice Option
            opt_letter = mcq_match.group(1).lower()
            opt_text = mcq_match.group(2).strip()
            is_correct = False
            if "*" in opt_text or "(correct)" in opt_text.lower() or "[correct]" in opt_text.lower():
                is_correct = True
                opt_text = re.sub(r"\*|\((?:correct|answer)\)|\[(?:correct|answer)\]", "", opt_text, flags=re.I).strip()

            if current_q["type"] != "multiple_choice":
                current_q["type"] = "multiple_choice"
                current_q["options"] = []
                current_q["correct_option"] = opt_letter

            current_q["options"].append({
                "id": opt_letter,
                "text": opt_text
            })
            if is_correct:
                current_q["correct_option"] = opt_letter
        else:
            if current_q:
                if not current_q["prompt"]:
                    current_q["prompt"] = p
                else:
                    current_q["prompt"] += f"\n\n{p}"
            else:
                # First content before any numbered heading
                q_num = len(questions) + 1
                current_q = {
                    "id": f"q_{q_num}_{int(os.times().elapsed * 1000)}",
                    "type": "text",
                    "title": f"{q_num}. Question",
                    "prompt": p,
                    "placeholder": "Type your response here..."
                }

    if current_q:
        questions.append(current_q)

    if not questions:
        # Fallback if no numbered headings matched: treat each paragraph as a question
        for idx, p in enumerate(paragraphs[start_idx:], 1):
            questions.append({
                "id": f"q_{idx}_{int(os.times().elapsed * 1000)}",
                "type": "text",
                "title": f"{idx}. Question",
                "prompt": p,
                "placeholder": "Type your response here..."
            })

    return {
        "title": title[:250],
        "description": description[:500],
        "instructions": "Complete your writeup and submit for review.",
        "max_score": 100,
        "questions": questions
    }


def _parse_xlsx(file_obj, filename):
    import openpyxl

    wb = openpyxl.load_workbook(file_obj, data_only=True)
    sheet = wb.active

    rows = list(sheet.iter_rows(values_only=True))
    if not rows:
        raise ValueError("The Excel file has no rows.")

    return _parse_tabular_data(rows, filename)


def _parse_csv(file_obj, filename):
    import csv
    import io

    # Detect encoding
    raw_bytes = file_obj.read()
    try:
        text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text = raw_bytes.decode("latin-1")

    reader = csv.reader(io.StringIO(text))
    rows = list(reader)
    if not rows:
        raise ValueError("The CSV file is empty.")

    return _parse_tabular_data(rows, filename)


def _parse_tabular_data(rows, filename):
    # Filter empty rows
    valid_rows = [r for r in rows if any(cell is not None and str(cell).strip() for cell in r)]
    if not valid_rows:
        raise ValueError("No data found in spreadsheet.")

    header = [str(c).strip().lower() if c is not None else "" for c in valid_rows[0]]

    # Detect column indices
    col_map = {}
    for idx, h in enumerate(header):
        if any(kw in h for kw in ["title", "section", "topic"]):
            col_map.setdefault("title", idx)
        elif any(kw in h for kw in ["prompt", "question", "description", "details"]):
            col_map.setdefault("prompt", idx)
        elif "type" in h:
            col_map.setdefault("type", idx)
        elif any(kw in h for kw in ["option a", "choice a", "opt a", "a"]):
            col_map.setdefault("opt_a", idx)
        elif any(kw in h for kw in ["option b", "choice b", "opt b", "b"]):
            col_map.setdefault("opt_b", idx)
        elif any(kw in h for kw in ["option c", "choice c", "opt c", "c"]):
            col_map.setdefault("opt_c", idx)
        elif any(kw in h for kw in ["option d", "choice d", "opt d", "d"]):
            col_map.setdefault("opt_d", idx)
        elif any(kw in h for kw in ["answer", "correct", "key"]):
            col_map.setdefault("correct", idx)
        elif "placeholder" in h:
            col_map.setdefault("placeholder", idx)

    has_header = "title" in col_map or "prompt" in col_map
    data_rows = valid_rows[1:] if has_header else valid_rows

    questions = []
    for idx, row in enumerate(data_rows, 1):
        def get_val(key, default_col=None):
            col_idx = col_map.get(key, default_col)
            if col_idx is not None and col_idx < len(row) and row[col_idx] is not None:
                return str(row[col_idx]).strip()
            return ""

        title = get_val("title", 0) or f"{idx}. Question"
        prompt = get_val("prompt", 1 if len(row) > 1 else 0)
        q_type = get_val("type").lower()

        opt_a = get_val("opt_a", 2 if len(row) > 4 else None)
        opt_b = get_val("opt_b", 3 if len(row) > 4 else None)
        opt_c = get_val("opt_c", 4 if len(row) > 4 else None)
        opt_d = get_val("opt_d", 5 if len(row) > 4 else None)
        correct = get_val("correct", 6 if len(row) > 6 else None).lower()

        if opt_a or opt_b or "choice" in q_type or "mcq" in q_type:
            # MCQ Question
            options = []
            if opt_a: options.append({"id": "a", "text": opt_a})
            if opt_b: options.append({"id": "b", "text": opt_b})
            if opt_c: options.append({"id": "c", "text": opt_c})
            if opt_d: options.append({"id": "d", "text": opt_d})

            corr_id = "a"
            if correct in ["a", "b", "c", "d"]:
                corr_id = correct
            elif any(opt["text"].lower() == correct for opt in options):
                for opt in options:
                    if opt["text"].lower() == correct:
                        corr_id = opt["id"]
                        break

            questions.append({
                "id": f"q_{idx}_{int(os.times().elapsed * 1000)}",
                "type": "multiple_choice",
                "title": title,
                "prompt": prompt or "Select the correct option:",
                "options": options,
                "correct_option": corr_id,
                "explanation": ""
            })
        else:
            # Text Question
            questions.append({
                "id": f"q_{idx}_{int(os.times().elapsed * 1000)}",
                "type": "text",
                "title": title,
                "prompt": prompt,
                "placeholder": get_val("placeholder") or "Type your response here..."
            })

    doc_title = os.path.splitext(filename)[0].replace("_", " ").title()
    return {
        "title": doc_title,
        "description": f"Imported from {filename}.",
        "instructions": "Complete your responses and submit for review.",
        "max_score": 100,
        "questions": questions
    }
