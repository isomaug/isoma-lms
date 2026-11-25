from django.core.management.base import BaseCommand, CommandError

from courses.pastpapers.registry import select_manifests
from courses.pastpapers.seed_engine import seed_manifest
from courses.pastpapers.validators import validate_manifest


class Command(BaseCommand):
    help = "Safely seeds subject-aware past-paper catalog records and course shells."

    def add_arguments(self, parser):
        parser.add_argument("--code")
        parser.add_argument("--year", type=int)
        parser.add_argument("--series", choices=["march", "june", "november"])
        parser.add_argument("--paper", type=int, choices=range(1, 5))
        parser.add_argument("--variant", type=int, choices=range(1, 5))
        parser.add_argument("--include-planned", action="store_true")
        parser.add_argument("--publish", action="store_true")
        parser.add_argument("--dry-run", action="store_true")

    def handle(self, *args, **options):
        manifests = select_manifests(
            syllabus_code=options["code"],
            year=options["year"],
            series=options["series"],
            paper=options["paper"],
            variant=options["variant"],
        )
        if not manifests:
            raise CommandError("No past-paper manifests matched those filters.")

        invalid = []
        for manifest in manifests:
            errors = validate_manifest(manifest)
            if errors:
                invalid.append(f"{manifest.seed_key}: {'; '.join(errors)}")
        if invalid:
            raise CommandError("\n".join(invalid))

        if options["dry_run"]:
            self.stdout.write(
                self.style.SUCCESS(
                    f"Dry run passed for {len(manifests)} manifest(s); no records changed."
                )
            )
            return

        seeded = skipped = created = 0
        for manifest in manifests:
            past_paper, was_created = seed_manifest(
                manifest,
                include_planned=options["include_planned"],
                publish=options["publish"],
            )
            if past_paper is None:
                skipped += 1
                continue
            seeded += 1
            created += int(was_created)
        self.stdout.write(
            self.style.SUCCESS(
                f"Seed complete: {seeded} processed, {created} created, "
                f"{skipped} safely skipped."
            )
        )
