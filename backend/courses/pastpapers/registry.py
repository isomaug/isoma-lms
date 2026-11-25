from .cambridge.as_a_level.subjects.information_technology.syllabus_9626.manifest import (
    PAPERS_9626,
)


def all_manifests():
    return [*PAPERS_9626]


def select_manifests(
    *,
    syllabus_code=None,
    year=None,
    series=None,
    paper=None,
    variant=None,
):
    selected = all_manifests()
    filters = {
        "syllabus_code": str(syllabus_code) if syllabus_code else None,
        "year": int(year) if year else None,
        "series": series,
        "paper": int(paper) if paper else None,
        "variant": int(variant) if variant else None,
    }
    for attribute, expected in filters.items():
        if expected is not None:
            selected = [
                manifest
                for manifest in selected
                if getattr(manifest, attribute) == expected
            ]
    return selected
