"""Ingest licensed Cambridge IT textbooks into topic chunks, pages, and images."""

from django.core.management.base import BaseCommand, CommandError

from courses.pastpapers.textbook_ingest import BOOK_SPECS, ingest_book


class Command(BaseCommand):
    help = (
        "Extract Cambridge AS/A Level IT textbooks page-by-page, split by topic, "
        "store images, and build local embeddings for solution RAG."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--book",
            choices=["all", *[spec.key for spec in BOOK_SPECS]],
            default="all",
        )
        parser.add_argument("--replace", action="store_true")
        parser.add_argument("--skip-images", action="store_true")
        parser.add_argument("--limit-pages", type=int, default=None)

    def handle(self, *args, **options):
        selected = [
            spec
            for spec in BOOK_SPECS
            if options["book"] == "all" or spec.key == options["book"]
        ]
        if not selected:
            raise CommandError("No matching textbook specification.")

        for spec in selected:
            self.stdout.write(self.style.NOTICE(f"Ingesting {spec.key}…"))
            try:
                result = ingest_book(
                    spec,
                    skip_images=options["skip_images"],
                    limit_pages=options["limit_pages"],
                    replace=options["replace"],
                    progress=self.stdout.write,
                )
            except FileNotFoundError as error:
                raise CommandError(str(error)) from error
            except Exception as error:
                raise CommandError(f"{spec.key} failed: {error}") from error
            self.stdout.write(
                self.style.SUCCESS(
                    f"  {result['key']}: pages={result['pages']} "
                    f"chunks={result['chunks']} images={result['images']} "
                    f"toc_pages_mapped={result['toc_topics']}"
                )
            )
            self.stdout.write(
                f"  edition: {spec.edition} | {spec.authors} | {spec.publisher} {spec.year}"
            )
