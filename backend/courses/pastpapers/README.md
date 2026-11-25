# Past-paper instructor workspace

This package stores code and original solution content only. Authorised question
papers, mark schemes, source archives, inserts, and examiner reports must be
placed under `backend/private_pastpaper_imports/`, which is excluded from Git.

## Subject naming

Python package directories use descriptive, import-safe names:

```text
cambridge/as_a_level/subjects/information_technology/syllabus_9626/
```

Future subjects should follow the same convention, for example:

```text
cambridge/as_a_level/subjects/computer_science/syllabus_9618/
cambridge/as_a_level/subjects/mathematics/syllabus_9709/
```

## Safe workflow

Validate the registry without changing the database:

```text
python manage.py seed_pastpapers --code 9626 --dry-run
```

Create planned, unpublished catalog workspaces only when the source inventory is
being audited:

```text
python manage.py seed_pastpapers --code 9626 --include-planned
```

Normal seeding skips unverified, unavailable, and future papers. After a
manifest has verified material references and question numbering, run:

```text
python manage.py seed_pastpapers --code 9626 --year 2025 --series june
python manage.py prepare_pastpaper_solutions --code 9626 --year 2025 --series june
python manage.py validate_pastpaper_solutions --code 9626 --year 2025 --series june
```

Preparation is non-destructive. It never overwrites an instructor's worked
solution. `--replace-empty` only refreshes metadata on sections whose worked
solution is still empty.

## Generate from S3 uploads

When authorised QP/MS PDFs are already in the media bucket under
`past_papers/`, discover and solve them (with Cambridge textbook grounding):

```text
python manage.py bootstrap_local_pastpaper --list-only
python manage.py bootstrap_local_pastpaper --all --paper 1 --approve --replace
python manage.py bootstrap_local_pastpaper --seed-key cambridge:as_a_level:9626:2025:june:1:1 --approve --replace
```

Filenames must follow Cambridge-style names such as `9626_s25_qp_11.pdf` and
`9626_s25_ms_11.pdf`.
