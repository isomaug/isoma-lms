VALID_SERIES = {"march", "june", "november"}
VALID_STATUSES = {
    "planned",
    "source_required",
    "drafting",
    "review_required",
    "ready",
    "published",
    "not_available",
    "future",
}


def validate_manifest(paper):
    errors = []
    if paper.series not in VALID_SERIES:
        errors.append(f"Unsupported series: {paper.series}")
    if paper.paper not in {1, 2, 3, 4}:
        errors.append(f"Paper must be 1-4, got {paper.paper}")
    if paper.variant not in {1, 2, 3, 4}:
        errors.append(f"Variant must be 1-4, got {paper.variant}")
    if paper.status not in VALID_STATUSES:
        errors.append(f"Unsupported status: {paper.status}")
    if paper.source_verified:
        required = {"question_paper", "mark_scheme"}
        missing = [key for key in required if not paper.materials.get(key)]
        if missing:
            errors.append(
                f"Verified paper is missing material references: {', '.join(missing)}"
            )
    seen = set()
    for question in paper.questions:
        path = str(question.get("path", "")).strip()
        if not path:
            errors.append("Question path cannot be empty")
        elif path in seen:
            errors.append(f"Duplicate question path: {path}")
        seen.add(path)
        if int(question.get("marks", 0)) <= 0:
            errors.append(f"Question {path or '?'} must have positive marks")
    return errors


def validate_solution(solution):
    errors = []
    sections = list(solution.sections.all())
    if not sections:
        errors.append("No question sections have been prepared.")
        return errors
    expected_total = solution.total_marks
    mapped_total = sum(section.maximum_marks for section in sections)
    if expected_total and expected_total != mapped_total:
        errors.append(
            f"Expected {expected_total} marks but sections map to {mapped_total}."
        )
    forbidden = ("undefined", "null", "todo", "[write")
    for section in sections:
        content = section.worked_solution_markdown.strip()
        if not content:
            errors.append(f"{section.question_path}: model solution is empty.")
        if any(token in content.lower() for token in forbidden):
            errors.append(f"{section.question_path}: contains placeholder content.")
        if not section.mark_scheme_reference.strip():
            errors.append(f"{section.question_path}: mark-scheme alignment is empty.")
        if not section.is_complete:
            errors.append(f"{section.question_path}: section is not marked complete.")
        if section.confidence != "verified":
            errors.append(f"{section.question_path}: section is not verified.")
    return errors
