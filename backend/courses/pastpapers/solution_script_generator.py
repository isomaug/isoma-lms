"""Layout-conscious extraction and Cambridge-grounded text solutions.

The generator produces instructor-review drafts for the learner Text Version.
Explanations are grounded in Cambridge 9626 syllabus/book teaching notes plus
the authorised question paper and mark scheme. Sections are never auto-marked
complete or verified.
"""

from __future__ import annotations

import io
import re
from dataclasses import dataclass
from datetime import timedelta

try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

from courses.pastpapers.cambridge_9626_book import format_book_section, match_book_topics
from courses.pastpapers.textbook_ingest import retrieve_textbook_passages


class PaperExtractionError(ValueError):
    pass


@dataclass(frozen=True)
class ExtractedDocument:
    text: str
    pages: int
    readable_pages: int


@dataclass(frozen=True)
class ScriptSection:
    question_path: str
    question_excerpt: str
    mark_scheme_excerpt: str
    markdown: str
    start_seconds: int
    end_seconds: int


def extract_pdf(file_field) -> ExtractedDocument:
    """Extract page-labelled text from local or remote Django storage."""
    if PdfReader is None:
        raise PaperExtractionError(
            "pypdf is not installed. Install it with: pip install pypdf"
        )
    file_field.open("rb")
    try:
        payload = file_field.read()
    finally:
        file_field.close()
    reader = PdfReader(io.BytesIO(payload))
    pages = []
    readable_pages = 0
    for page_number, page in enumerate(reader.pages, start=1):
        page_text = (page.extract_text() or "").strip()
        if len(page_text) >= 20:
            readable_pages += 1
        pages.append(f"\n[PAGE {page_number}]\n{page_text}")
    if not pages or readable_pages == 0:
        raise PaperExtractionError(
            "The PDF has no extractable text. Run OCR on the scanned document "
            "before generating an instructor script."
        )
    return ExtractedDocument(
        text="\n".join(pages),
        pages=len(pages),
        readable_pages=readable_pages,
    )


def _path_tokens(question_path: str) -> list[str]:
    tokens = re.findall(r"\d+|[A-Za-z]+", question_path)
    if not tokens:
        raise PaperExtractionError(f"Invalid question path: {question_path!r}")
    return tokens


def _path_pattern(question_path: str) -> re.Pattern:
    tokens = _path_tokens(question_path)
    expression = rf"(?<!\d){re.escape(tokens[0])}"
    for token in tokens[1:]:
        expression += rf"\s*\(\s*{re.escape(token)}\s*\)"
    return re.compile(expression, re.IGNORECASE)


def _ms_path_pattern(question_path: str) -> re.Pattern:
    """Prefer Cambridge mark-scheme rows like ``7(a) One mark`` / ``1 One mark``."""
    tokens = _path_tokens(question_path)
    expression = rf"(?m)^(?:Question\s+Answer\s+Marks\s*)?{re.escape(tokens[0])}"
    for token in tokens[1:]:
        expression += rf"\s*\(\s*{re.escape(token)}\s*\)"
    expression += r"(?!\d)\s+"
    return re.compile(expression, re.IGNORECASE)


def _qp_question_start(number: str) -> re.Pattern:
    """Cambridge theory papers glue the question number after the copyright year."""
    return re.compile(
        rf"UCLES\s*20\d{{2}}\s*(?:\[Turn over\s*)?{re.escape(number)}(?!\d)",
        re.IGNORECASE,
    )


def _qp_part_pattern(part: str) -> re.Pattern:
    return re.compile(rf"\(\s*{re.escape(part)}\s*\)", re.IGNORECASE)


def _stem_number(path: str) -> str:
    return _path_tokens(path)[0]


def _next_stem_start(text: str, after: int, stem: str, all_paths: list[str]) -> int:
    end = len(text)
    sibling_stems = sorted(
        {
            int(_stem_number(candidate))
            for candidate in all_paths
            if _stem_number(candidate).isdigit()
        }
    )
    try:
        current = int(stem)
        next_stems = [value for value in sibling_stems if value > current]
    except ValueError:
        next_stems = []
    for next_stem in next_stems:
        match = _qp_question_start(str(next_stem)).search(text, after)
        if match and match.start() < end:
            end = match.start()
            break
    return end


def _ms_section_excerpt(text: str, path: str, all_paths: list[str]) -> str:
    ms_match = _ms_path_pattern(path).search(text)
    if not ms_match:
        match = _path_pattern(path).search(text)
        if not match:
            return ""
        start = match.start()
        search_from = match.end()
    else:
        start = ms_match.start()
        search_from = ms_match.end()
    end = len(text)
    for candidate in all_paths:
        if candidate == path:
            continue
        next_match = _ms_path_pattern(candidate).search(text, search_from)
        if not next_match:
            next_match = _path_pattern(candidate).search(text, search_from)
        if next_match and next_match.start() < end:
            end = next_match.start()
    excerpt = text[start:end]
    excerpt = re.sub(r"\n{3,}", "\n\n", excerpt).strip()
    return excerpt[:6000]


def _qp_section_excerpt(text: str, path: str, all_paths: list[str]) -> str:
    tokens = _path_tokens(path)
    stem = tokens[0]
    parts = tokens[1:]
    stem_match = _qp_question_start(stem).search(text)
    if not stem_match:
        return ""
    question_end = _next_stem_start(text, stem_match.end(), stem, all_paths)
    region_start = stem_match.start()
    region_end = question_end
    search_from = stem_match.end()
    for part in parts:
        part_match = _qp_part_pattern(part).search(text, search_from, question_end)
        if not part_match:
            return ""
        region_start = part_match.start()
        search_from = part_match.end()
    if parts:
        end = question_end
        for candidate in all_paths:
            if candidate == path or _stem_number(candidate) != stem:
                continue
            candidate_parts = _path_tokens(candidate)[1:]
            if not candidate_parts:
                continue
            sibling = _qp_part_pattern(candidate_parts[0]).search(
                text, search_from, question_end
            )
            if sibling and sibling.start() < end:
                end = sibling.start()
        region_end = end
    excerpt = text[region_start:region_end]
    excerpt = re.sub(r"\n{3,}", "\n\n", excerpt).strip()
    return excerpt[:6000]


def _section_excerpt(text: str, path: str, all_paths: list[str]) -> str:
    """Backward-compatible helper; prefer ``_qp_section_excerpt`` / ``_ms_section_excerpt``."""
    return _ms_section_excerpt(text, path, all_paths) or _qp_section_excerpt(
        text, path, all_paths
    )


def _mark_points(mark_scheme_excerpt: str) -> list[str]:
    cleaned = re.sub(r"\[PAGE \d+\]", " ", mark_scheme_excerpt)
    cleaned = re.sub(
        r"(?i)^(?:question\s+answer\s+marks\s*)?\d+(?:\([a-z]\))?\s+",
        "",
        cleaned.strip(),
        count=1,
    )
    candidates = re.split(r"(?:\r?\n|[•])+", cleaned)
    points = []
    skip_prefixes = (
        "page ",
        "cambridge",
        "one mark",
        "two marks",
        "six marks",
        "max ",
        "maximum",
        "must be",
        "published",
        "question ",
        "answer ",
        "marks",
        "error (",
    )
    for candidate in candidates:
        point = re.sub(r"\s+", " ", candidate).strip(" ---\t")
        point = re.sub(r"\s*\(\d+(?:st)?\)\s*$", "", point).strip()
        lowered = point.lower()
        if len(point) < 8 or any(lowered.startswith(prefix) for prefix in skip_prefixes):
            continue
        if re.fullmatch(r"\d{1,2}", point):
            continue
        if point not in points:
            points.append(point)
    return points[:12]


def _clean_question_prompt(question_excerpt: str) -> str:
    text = re.sub(r"\[PAGE \d+\]", " ", question_excerpt)
    text = re.sub(r"DO NOT WRITE IN THIS MARGIN", " ", text, flags=re.I)
    text = re.sub(r"\*?\s*0000\d+\s*\*?", " ", text)
    text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", " ", text)
    # Drop private-use / dingbat noise common in Cambridge PDF extracts.
    text = re.sub(r"[\u0080-\u009f\u0100-\u024f\u1e00-\u1eff\ue000-\uf8ff\ufffd]", " ", text)
    text = re.sub(r"[\,\.\u00b7\u25cf\u00a0]{3,}", " ", text)
    text = re.sub(r"[^\S\n]+", " ", text)
    text = re.sub(
        r"(?i)(?:\d+\s+)?9626\s*/?\s*1\s*1\s*/?\s*M\s*/?\s*J\s*/?\s*25\s*"
        r"(?:©\s*)?UCLES\s*20\d{2}\s*(?:\[Turn over\s*)?",
        " ",
        text,
    )
    text = re.sub(r"(?i)UCLES\s*20\d{2}\s*(?:\[Turn over\s*)?", " ", text)
    text = re.sub(r"_{3,}|\.{5,}|…+|\.{2,}", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    # Keep the stem; cut answer scaffolds and mark brackets.
    text = re.split(
        r"\b(?:Factor\s*1|Way\s*1|Error\s*\(|Start\b)\b|\[\d{1,2}\]",
        text,
        maxsplit=1,
    )[0].strip(" ---,.")
    match = re.search(
        r"(?i)(?:^\d+\s+)?(?:\([a-z]\)\s+)?("
        r"A\s+[A-Z]|Describe|Discuss|Explain|Identify|State|Evaluate|"
        r"Sensors|The\s+|An?\s+[a-z]|Customer|Manager|program flowchart|"
        r"summary|complex|nested"
        r").*",
        text,
    )
    if match:
        text = match.group(0).strip()
    return text[:700]


def _command_word(prompt: str) -> str:
    match = re.search(
        r"\b(describe|discuss|explain|identify|state|evaluate|compare|outline)\b",
        prompt,
        re.I,
    )
    return match.group(1).lower() if match else "answer"


def _explain_mark_point(point: str, command: str, topics: list) -> str:
    compact = re.sub(r"\s*//\s*", " - ", point)
    compact = re.sub(r"\s+", " ", compact).strip(" ---")
    # Expand "Term - reason" mark-scheme shorthand into a learner sentence.
    if " - " in compact:
        term, reason = compact.split(" - ", 1)
        body = (
            f"**{term.strip()}** - {reason.strip().rstrip('.')}. "
            f"In Cambridge coursebook terms, show the examiner how this applies "
            f"to the scenario given in the question."
        )
    else:
        body = (
            f"**{compact}** - Write this as a complete sentence using the "
            f"syllabus wording for "
            f"{topics[0].title if topics else 'this topic'}."
        )
    if command == "discuss":
        body += " Make clear whether the point is a benefit or a drawback."
    elif command == "explain":
        body += " Add a short because/so that clause if the mark scheme reason is brief."
    return body


def _clock(seconds: int) -> str:
    return str(timedelta(seconds=max(0, seconds)))[2:7]


def build_script_sections(
    question_text: str,
    mark_scheme_text: str,
    question_structure: list[dict],
) -> tuple[list[ScriptSection], list[str]]:
    numbered_items = [
        item for item in question_structure if str(item.get("path", "")).strip()
    ]
    paths = [str(item["path"]).strip() for item in numbered_items]
    if not paths:
        raise PaperExtractionError(
            "The paper has no question structure. Seed its numbered questions "
            "before generating a script."
        )

    sections = []
    issues = []
    cursor_seconds = 0
    for item, path in zip(numbered_items, paths):
        question_excerpt = _qp_section_excerpt(question_text, path, paths)
        mark_excerpt = _ms_section_excerpt(mark_scheme_text, path, paths)
        if not question_excerpt:
            issues.append(f"{path}: question text was not located.")
        if not mark_excerpt:
            issues.append(f"{path}: mark-scheme entry was not located.")
        if not question_excerpt or not mark_excerpt:
            continue

        points = _mark_points(mark_excerpt)
        if not points:
            issues.append(f"{path}: no usable marking points were extracted.")
            continue
        marks = int(item.get("marks", 0) or 0)
        prompt = _clean_question_prompt(question_excerpt)
        command = _command_word(prompt)
        topics = match_book_topics(prompt, mark_excerpt, limit=2)
        book_block = format_book_section(topics)
        passages = []
        try:
            passages = retrieve_textbook_passages(
                f"{prompt}\n{mark_excerpt}",
                limit=3,
                level="as",
            )
        except Exception:
            passages = []
        if passages:
            passage_md = []
            for passage in passages:
                passage_md.append(
                    f"**{passage['textbook']}** ({passage['edition']}), "
                    f"Topic {passage['topic_code']} {passage['topic_title']}, "
                    f"pp. {passage['page_start']}-{passage['page_end']}:\n\n"
                    f"{passage['text']}"
                )
            book_block = (
                book_block
                + "\n\n### From your licensed Cambridge textbooks\n\n"
                + "\n\n".join(passage_md)
            )
        topic_labels = ", ".join(
            f"{topic.code} {topic.title}" for topic in topics
        ) or "Cambridge 9626 Paper 1 Theory"
        worked = "\n".join(
            f"{index}. {_explain_mark_point(point, command, topics)}"
            for index, point in enumerate(points, start=1)
        )
        alignment = "\n".join(f"- {point}" for point in points)
        tip_lines = []
        for topic in topics:
            tip_lines.extend(f"- {tip}" for tip in topic.exam_tips)
        if not tip_lines:
            tip_lines = [
                "- Use the command word exactly as asked.",
                "- Keep every sentence tied to the scenario in the question paper.",
            ]
        tips = "\n".join(dict.fromkeys(tip_lines))
        cleaned_points = [re.sub(r"\s+", " ", point) for point in points[:6]]
        reading = " ".join(
            f"Point {index}: {pt}."
            for index, pt in enumerate(cleaned_points, start=1)
        )
        word_count = len(re.findall(r"\b[\w'-]+\b", reading))
        duration = max(40, round(word_count / 2.0) + 20)
        start = cursor_seconds
        end = start + duration
        markdown = f"""## Question {path} ({marks} mark{"s" if marks != 1 else ""})

### What the question is asking

{prompt or f"Open Question {path} on the question paper."}

The command word is **{command}**. Aim for about {marks} clear, mark-worthy points.

### Cambridge book explanation

{book_block}

### Worked text solution

Use the following accepted ideas from the official mark scheme, explained in Cambridge coursebook language for **{topic_labels}**:

{worked}

### Mark-scheme checklist

{alignment}

### How to write it in the exam

{tips}

### Timing guide for video rehearsal

Suggested spoken coverage: {_clock(start)}-{_clock(end)}.
"""
        sections.append(
            ScriptSection(
                question_path=path,
                question_excerpt=question_excerpt,
                mark_scheme_excerpt=mark_excerpt,
                markdown=markdown,
                start_seconds=start,
                end_seconds=end,
            )
        )
        cursor_seconds = end + 5
    return sections, issues
