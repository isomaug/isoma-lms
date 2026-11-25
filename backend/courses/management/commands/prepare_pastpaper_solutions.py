from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

from courses.models import PastPaper
from courses.pastpapers.seed_engine import prepare_solution


class Command(BaseCommand):
    help = "Creates non-destructive instructor solution workspaces from paper metadata."

    def add_arguments(self, parser):
        parser.add_argument("--seed-key")
        parser.add_argument("--code")
        parser.add_argument("--year", type=int)
        parser.add_argument("--series", choices=["march", "june", "november"])
        parser.add_argument("--paper", type=int, choices=range(1, 5))
        parser.add_argument("--variant", type=int, choices=range(1, 5))
        parser.add_argument("--instructor")
        parser.add_argument("--replace-empty", action="store_true")
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        papers = PastPaper.objects.all()
        mappings = {
            "seed_key": options["seed_key"],
            "syllabus_code": options["code"],
            "exam_year": options["year"],
            "exam_series": options["series"],
            "paper_number": options["paper"],
            "variant": options["variant"],
        }
        for field, value in mappings.items():
            if value is not None:
                papers = papers.filter(**{field: value})
        if not papers.exists():
            raise CommandError("No seeded past papers matched those filters.")

        instructor = None
        if options["instructor"]:
            instructor = get_user_model().objects.filter(
                username=options["instructor"]
            ).first()
            if instructor is None:
                raise CommandError("Instructor username was not found.")

        if options["dry_run"]:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Would prepare {papers.count()} instructor workspace(s)."
                )
            )
            return

        for paper in papers:
            prepare_solution(
                paper,
                user=instructor,
                replace_empty=options["replace_empty"],
            )
        self.stdout.write(
            self.style.SUCCESS(
                f"Prepared {papers.count()} instructor solution workspace(s)."
            )
        )
