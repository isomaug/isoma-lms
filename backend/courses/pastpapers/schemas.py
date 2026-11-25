from dataclasses import dataclass, field


@dataclass(frozen=True)
class PaperManifest:
    board: str
    qualification: str
    subject: str
    syllabus_code: str
    syllabus_era: str
    year: int
    series: str
    paper: int
    variant: int
    level: str
    status: str = "source_required"
    source_verified: bool = False
    questions: list[dict] = field(default_factory=list)
    materials: dict[str, str | None] = field(default_factory=dict)

    @property
    def component_code(self):
        return f"{self.paper}{self.variant}"

    @property
    def seed_key(self):
        return (
            f"{self.board}:{self.qualification}:{self.syllabus_code}:"
            f"{self.year}:{self.series}:{self.paper}:{self.variant}"
        )

    @property
    def course_title(self):
        series_names = {
            "march": "February/March",
            "june": "May/June",
            "november": "October/November",
        }
        return (
            f"{self.subject} {self.syllabus_code} - "
            f"{series_names[self.series]} {self.year} "
            f"Paper {self.paper} Variant {self.variant} Solutions"
        )
