from courses.pastpapers.schemas import PaperManifest


def _status(year, series):
    if year == 2026 and series == "november":
        return "future"
    return "source_required"


PAPERS_9626 = tuple(
    PaperManifest(
        board="cambridge",
        qualification="as_a_level",
        subject="Information Technology",
        syllabus_code="9626",
        syllabus_era="2025-2027" if year >= 2025 else "2022-2024",
        year=year,
        series=series,
        paper=paper,
        variant=variant,
        level="A Level" if paper in {3, 4} else "AS Level",
        status=_status(year, series),
    )
    for year in range(2022, 2027)
    for series in ("march", "june", "november")
    for paper in range(1, 5)
    for variant in range(1, 5)
)
