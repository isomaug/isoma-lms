from django.core.management.base import BaseCommand, CommandError

from courses.models import InstructorSolution
from courses.pastpapers.validators import validate_solution


class Command(BaseCommand):
    help = "Validates instructor solutions against numbering, marks, and completion rules."

    def add_arguments(self, parser):
        parser.add_argument("--code")
        parser.add_argument("--year", type=int)
        parser.add_argument("--series", choices=["march", "june", "november"])
        parser.add_argument("--paper", type=int, choices=range(1, 5))
        parser.add_argument("--variant", type=int, choices=range(1, 5))

    def handle(self, *args, **options):
        solutions = InstructorSolution.objects.select_related("past_paper")
        mappings = {
            "past_paper__syllabus_code": options["code"],
            "past_paper__exam_year": options["year"],
            "past_paper__exam_series": options["series"],
            "past_paper__paper_number": options["paper"],
            "past_paper__variant": options["variant"],
        }
        for field, value in mappings.items():
            if value is not None:
                solutions = solutions.filter(**{field: value})
        if not solutions.exists():
            raise CommandError("No instructor solutions matched those filters.")

        failed = 0
        for solution in solutions:
            errors = validate_solution(solution)
            if errors:
                failed += 1
                self.stdout.write(self.style.ERROR(str(solution)))
                for error in errors:
                    self.stdout.write(f"  - {error}")
            else:
                self.stdout.write(self.style.SUCCESS(f"{solution}: valid"))
        if failed:
            raise CommandError(f"{failed} solution workspace(s) need attention.")
        self.stdout.write(self.style.SUCCESS("All selected solutions are valid."))
