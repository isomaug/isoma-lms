"""Ingest licensed Cambridge IT textbooks into searchable topic chunks + images.

Source PDFs stay under ``backend/private_textbook_imports/`` (gitignored).
Derived page text, topic chunks, embeddings, and figures live under
``backend/private_textbook_extracts/`` and in the Django DB.
"""

from __future__ import annotations

import hashlib
import json
import math
import re
from dataclasses import dataclass
from pathlib import Path

try:
    import fitz  # PyMuPDF
except ImportError:  # pragma: no cover
    fitz = None

from django.conf import settings
from django.db import transaction
from django.utils import timezone


EMBED_DIM = 384
MIN_IMAGE_BYTES = 4_000
MIN_IMAGE_SIDE = 64
MAX_IMAGES_PER_PAGE = 8

TOPIC_CODE_RE = re.compile(
    r"^(?P<code>\d+(?:\.\d+)*)\s+(?P<title>.+?)\s*$"
)
CHAPTER_RE = re.compile(
    r"^(?P<code>\d+)\s+(?P<title>[A-Za-z].+?)\s*$"
)


@dataclass(frozen=True)
class BookSpec:
    key: str
    filename: str
    title: str
    edition: str
    authors: str
    publisher: str
    year: int
    level: str  # as | a | as_a
    syllabus_code: str = "9626"


BOOK_SPECS = (
    BookSpec(
        key="hodder_as_student",
        filename="Cambridge-International-As-Level-Information-Technology-Students_Hodder.pdf",
        title="Cambridge International AS Level Information Technology Student's Book",
        edition="Hodder Education Student's Book",
        authors="Graham Brown; Brian Sargent",
        publisher="Hodder Education",
        year=2021,
        level="as",
    ),
    BookSpec(
        key="cup_as_a_coursebook_2e",
        filename=(
            "Cambridge-International-A-Level-IT-Textbook-Second-Edition-2021_"
            "Paul Long_Sarah Lawrey & Victoria Ellis.pdf"
        ),
        title="IT for Cambridge International AS & A Level Coursebook",
        edition="Second edition (2021)",
        authors="Paul Long; Sarah Lawrey; Victoria Ellis",
        publisher="Cambridge University Press",
        year=2021,
        level="as_a",
    ),
)


def imports_dir() -> Path:
    path = Path(settings.BASE_DIR) / "private_textbook_imports"
    path.mkdir(parents=True, exist_ok=True)
    return path


def extracts_dir() -> Path:
    path = Path(settings.BASE_DIR) / "private_textbook_extracts"
    path.mkdir(parents=True, exist_ok=True)
    return path


def repo_root() -> Path:
    return Path(settings.BASE_DIR).parent


def ensure_source_pdf(spec: BookSpec) -> Path:
    """Copy the root-folder PDF into the private imports directory if needed."""
    dest = imports_dir() / spec.filename
    if dest.exists() and dest.stat().st_size > 1_000_000:
        return dest
    source = repo_root() / spec.filename
    if not source.exists():
        raise FileNotFoundError(
            f"Missing textbook PDF: {source}. Place the licensed file in the "
            "repo root or under backend/private_textbook_imports/."
        )
    dest.write_bytes(source.read_bytes())
    return dest


def tokenize(text: str) -> list[str]:
    return re.findall(r"[a-z0-9]{2,}", text.lower())


def hash_embed(text: str, dim: int = EMBED_DIM) -> list[float]:
    """Lightweight local embedding (hashed n-grams). No external model required."""
    vec = [0.0] * dim
    tokens = tokenize(text)
    if not tokens:
        return vec
    grams = tokens + [f"{a}_{b}" for a, b in zip(tokens, tokens[1:])]
    for token in grams:
        digest = hashlib.sha1(token.encode("utf-8")).digest()
        idx = int.from_bytes(digest[:4], "little") % dim
        sign = 1.0 if digest[4] % 2 == 0 else -1.0
        vec[idx] += sign
    norm = math.sqrt(sum(v * v for v in vec))
    if norm:
        vec = [v / norm for v in vec]
    return vec


def cosine(a: list[float], b: list[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(y * y for y in b))
    denom = norm_a * norm_b
    if not denom:
        return 0.0
    return float(dot / denom)


def _clean_page_text(raw: str) -> str:
    text = raw.replace("\x00", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def _normalize_topic_code(raw: str) -> str:
    return re.sub(r"\s+", "", raw.strip())


def _topic_from_toc_title(title: str) -> tuple[str, str] | None:
    cleaned = re.sub(r"\s+", " ", title).strip()
    match = TOPIC_CODE_RE.match(cleaned) or CHAPTER_RE.match(cleaned)
    if not match:
        return None
    return _normalize_topic_code(match.group("code")), match.group("title").strip()


def build_page_topic_map(toc: list[list], page_count: int) -> dict[int, dict]:
    """Map 1-based page numbers to the nearest TOC topic."""
    entries = []
    for level, title, page in toc:
        parsed = _topic_from_toc_title(title)
        if not parsed:
            continue
        code, topic_title = parsed
        entries.append(
            {
                "level": level,
                "code": code,
                "title": topic_title,
                "page": max(1, int(page)),
            }
        )
    entries.sort(key=lambda item: item["page"])
    mapping: dict[int, dict] = {}
    if not entries:
        return mapping
    for index, entry in enumerate(entries):
        start = entry["page"]
        end = entries[index + 1]["page"] - 1 if index + 1 < len(entries) else page_count
        for page_number in range(start, end + 1):
            mapping[page_number] = entry
    return mapping


def _image_ext(xref_info: dict) -> str:
    ext = (xref_info.get("ext") or "png").lower()
    if ext in {"jpg", "jpeg", "png", "webp", "tif", "tiff"}:
        return "jpg" if ext == "jpeg" else ext
    return "png"


@transaction.atomic
def ingest_book(
    spec: BookSpec,
    *,
    skip_images: bool = False,
    limit_pages: int | None = None,
    replace: bool = False,
    progress=None,
):
    if fitz is None:
        raise RuntimeError("PyMuPDF is required. Install with: pip install pymupdf")

    from courses.models import (
        CambridgeTextbook,
        CambridgeTextbookChunk,
        CambridgeTextbookImage,
        CambridgeTextbookPage,
    )

    pdf_path = ensure_source_pdf(spec)
    book_extract = extracts_dir() / spec.key
    pages_dir = book_extract / "pages"
    images_dir = book_extract / "images"
    pages_dir.mkdir(parents=True, exist_ok=True)
    images_dir.mkdir(parents=True, exist_ok=True)

    textbook, created = CambridgeTextbook.objects.update_or_create(
        key=spec.key,
        defaults={
            "title": spec.title,
            "edition": spec.edition,
            "authors": spec.authors,
            "publisher": spec.publisher,
            "year": spec.year,
            "level": spec.level,
            "syllabus_code": spec.syllabus_code,
            "source_filename": spec.filename,
            "source_sha256": hashlib.sha256(pdf_path.read_bytes()).hexdigest(),
            "status": CambridgeTextbook.Status.INGESTING,
        },
    )
    if replace and not created:
        textbook.pages.all().delete()
        textbook.chunks.all().delete()
        textbook.images.all().delete()

    doc = fitz.open(pdf_path)
    try:
        page_count = doc.page_count
        textbook.page_count = page_count
        textbook.save(update_fields=["page_count", "status", "updated_at"])
        toc = doc.get_toc() or []
        topic_map = build_page_topic_map(toc, page_count)
        (book_extract / "toc.json").write_text(
            json.dumps(toc, ensure_ascii=False, indent=2), encoding="utf-8"
        )

        max_page = page_count if limit_pages is None else min(page_count, limit_pages)
        chunk_buffers: dict[str, dict] = {}
        image_count = 0

        for page_index in range(max_page):
            page_number = page_index + 1
            page = doc[page_index]
            text = _clean_page_text(page.get_text("text") or "")
            topic = topic_map.get(page_number) or {}
            topic_code = topic.get("code", "")
            topic_title = topic.get("title", "")

            page_payload = {
                "page_number": page_number,
                "topic_code": topic_code,
                "topic_title": topic_title,
                "text": text,
                "char_count": len(text),
            }
            (pages_dir / f"page_{page_number:04d}.json").write_text(
                json.dumps(page_payload, ensure_ascii=False), encoding="utf-8"
            )

            CambridgeTextbookPage.objects.update_or_create(
                textbook=textbook,
                page_number=page_number,
                defaults={
                    "topic_code": topic_code,
                    "topic_title": topic_title,
                    "text": text,
                    "char_count": len(text),
                },
            )

            if topic_code and text:
                bucket = chunk_buffers.setdefault(
                    topic_code,
                    {
                        "title": topic_title,
                        "page_start": page_number,
                        "page_end": page_number,
                        "parts": [],
                    },
                )
                bucket["page_end"] = page_number
                bucket["title"] = topic_title or bucket["title"]
                bucket["parts"].append(text)

            if not skip_images:
                for image_index, img in enumerate(page.get_images(full=True)):
                    if image_index >= MAX_IMAGES_PER_PAGE:
                        break
                    xref = img[0]
                    try:
                        extracted = doc.extract_image(xref)
                    except Exception:
                        continue
                    payload = extracted.get("image") or b""
                    width = int(extracted.get("width") or 0)
                    height = int(extracted.get("height") or 0)
                    if (
                        len(payload) < MIN_IMAGE_BYTES
                        or width < MIN_IMAGE_SIDE
                        or height < MIN_IMAGE_SIDE
                    ):
                        continue
                    digest = hashlib.sha256(payload).hexdigest()
                    ext = _image_ext(extracted)
                    rel_name = f"{page_number:04d}_{image_index:02d}_{digest[:10]}.{ext}"
                    abs_path = images_dir / rel_name
                    if not abs_path.exists():
                        abs_path.write_bytes(payload)
                    CambridgeTextbookImage.objects.update_or_create(
                        textbook=textbook,
                        sha256=digest,
                        defaults={
                            "page_number": page_number,
                            "image_index": image_index,
                            "width": width,
                            "height": height,
                            "byte_size": len(payload),
                            "relative_path": f"{spec.key}/images/{rel_name}",
                            "caption": "",
                        },
                    )
                    image_count += 1

            if progress and page_number % 25 == 0:
                progress(f"{spec.key}: page {page_number}/{max_page}")

        # Build topic chunks (split long topics into ~1800-char windows).
        CambridgeTextbookChunk.objects.filter(textbook=textbook).delete()
        chunk_total = 0
        for topic_code, bucket in sorted(
            chunk_buffers.items(), key=lambda item: item[0]
        ):
            joined = "\n\n".join(bucket["parts"]).strip()
            if len(joined) < 80:
                continue
            windows = _split_windows(joined, size=1800, overlap=220)
            for order, window in enumerate(windows):
                embedding = hash_embed(
                    f"{topic_code} {bucket['title']}\n{window}"
                )
                CambridgeTextbookChunk.objects.create(
                    textbook=textbook,
                    topic_code=topic_code,
                    topic_title=bucket["title"],
                    order=order,
                    page_start=bucket["page_start"],
                    page_end=bucket["page_end"],
                    text=window,
                    char_count=len(window),
                    embedding=embedding,
                    search_blob=" ".join(tokenize(f"{topic_code} {bucket['title']} {window}")[:400]),
                )
                chunk_total += 1

        textbook.status = CambridgeTextbook.Status.READY
        textbook.chunk_count = chunk_total
        textbook.image_count = image_count
        textbook.ingested_at = timezone.now()
        textbook.save()
        return {
            "key": spec.key,
            "pages": max_page,
            "chunks": chunk_total,
            "images": image_count,
            "toc_topics": len(topic_map),
        }
    except Exception:
        textbook.status = CambridgeTextbook.Status.FAILED
        textbook.save(update_fields=["status", "updated_at"])
        raise
    finally:
        doc.close()


def _split_windows(text: str, *, size: int, overlap: int) -> list[str]:
    if len(text) <= size:
        return [text]
    windows = []
    start = 0
    while start < len(text):
        end = min(len(text), start + size)
        windows.append(text[start:end].strip())
        if end >= len(text):
            break
        start = max(end - overlap, start + 1)
    return [window for window in windows if window]


def retrieve_textbook_passages(
    query: str,
    *,
    limit: int = 4,
    level: str | None = None,
) -> list[dict]:
    """Rank stored textbook chunks for a question/mark-scheme query."""
    from courses.models import CambridgeTextbookChunk

    qs = CambridgeTextbookChunk.objects.select_related("textbook").filter(
        textbook__status="ready"
    )
    if level in {"as", "a", "as_a"}:
        qs = qs.filter(textbook__level__in=[level, "as_a"])

    query_tokens = set(tokenize(query))
    query_vec = hash_embed(query)
    scored = []
    for chunk in qs.iterator(chunk_size=200):
        blob_tokens = set((chunk.search_blob or "").split())
        overlap = len(query_tokens & blob_tokens)
        semantic = cosine(query_vec, chunk.embedding or [])
        score = (0.55 * semantic) + (0.45 * min(1.0, overlap / max(4, len(query_tokens) or 1)))
        if chunk.topic_code and chunk.topic_code in query:
            score += 0.08
        if score < 0.08:
            continue
        scored.append((score, chunk))
    scored.sort(key=lambda item: item[0], reverse=True)
    results = []
    for score, chunk in scored[:limit]:
        results.append(
            {
                "score": round(score, 4),
                "textbook_key": chunk.textbook.key,
                "textbook": chunk.textbook.title,
                "edition": chunk.textbook.edition,
                "authors": chunk.textbook.authors,
                "topic_code": chunk.topic_code,
                "topic_title": chunk.topic_title,
                "page_start": chunk.page_start,
                "page_end": chunk.page_end,
                "text": chunk.text[:1600],
            }
        )
    return results


_TEXTBOOK_REF_RE = re.compile(
    r"\*\*(?P<title>.+?)\*\*\s*\((?P<edition>.+?)\),\s*"
    r"Topic\s+(?P<code>[0-9.]+)\s+(?P<topic>.+?),\s*"
    r"pp\.\s*(?P<start>\d+)\s*-\s*(?P<end>\d+):",
    re.IGNORECASE,
)


def parse_textbook_refs_from_markdown(markdown: str) -> list[dict]:
    """Extract textbook citations embedded in generated worked solutions."""
    from courses.models import CambridgeTextbook

    text = str(markdown or "")
    marker = "### From your licensed Cambridge textbooks"
    if marker in text:
        text = text.split(marker, 1)[1]
    books = {
        book.title.strip().lower(): book
        for book in CambridgeTextbook.objects.filter(status="ready")
    }
    refs = []
    seen = set()
    for match in _TEXTBOOK_REF_RE.finditer(text):
        title = match.group("title").strip()
        book = books.get(title.lower())
        key = (
            book.key
            if book
            else re.sub(r"[^a-z0-9]+", "_", title.lower()).strip("_")[:80]
        )
        start = int(match.group("start"))
        end = int(match.group("end"))
        code = match.group("code").strip()
        topic = match.group("topic").strip()
        identity = (key, code, start, end)
        if identity in seen:
            continue
        seen.add(identity)
        refs.append(
            {
                "textbook_key": key,
                "textbook": book.title if book else title,
                "edition": (book.edition if book else match.group("edition")).strip(),
                "topic_code": code,
                "topic_title": topic,
                "page_start": start,
                "page_end": end,
            }
        )
    return refs


def list_ready_textbooks(*, include_topics: bool = False) -> list[dict]:
    from courses.models import CambridgeTextbook, CambridgeTextbookPage
    from django.db.models import Min, Max

    payload = []
    books = list(CambridgeTextbook.objects.filter(status="ready"))
    topic_map: dict[int, list[dict]] = {}
    if include_topics and books:
        rows = (
            CambridgeTextbookPage.objects.filter(textbook_id__in=[b.id for b in books])
            .exclude(topic_code="")
            .values("textbook_id", "topic_code")
            .annotate(
                topic_title=Min("topic_title"),
                page_start=Min("page_number"),
                page_end=Max("page_number"),
            )
        )
        for row in rows:
            topic_map.setdefault(row["textbook_id"], []).append(
                {
                    "topic_code": row["topic_code"],
                    "topic_title": row["topic_title"] or "",
                    "page_start": row["page_start"],
                    "page_end": row["page_end"],
                }
            )
        for book_id, topics in topic_map.items():
            topics.sort(key=lambda item: _topic_sort_key(item["topic_code"]))

    for book in books:
        payload.append(
            {
                "key": book.key,
                "title": book.title,
                "edition": book.edition,
                "authors": book.authors,
                "publisher": book.publisher,
                "year": book.year,
                "level": book.level,
                "page_count": book.page_count,
                "topics": topic_map.get(book.id, []) if include_topics else [],
            }
        )
    return payload


def _topic_sort_key(code: str):
    parts = []
    for part in re.split(r"[.]", str(code or "")):
        if part.isdigit():
            parts.append((0, int(part)))
        else:
            parts.append((1, part.lower()))
    return parts


def get_textbook_topics(textbook_key: str) -> dict | None:
    from courses.models import CambridgeTextbook, CambridgeTextbookPage
    from django.db.models import Min, Max

    book = CambridgeTextbook.objects.filter(key=textbook_key, status="ready").first()
    if not book:
        return None
    rows = (
        CambridgeTextbookPage.objects.filter(textbook=book)
        .exclude(topic_code="")
        .values("topic_code")
        .annotate(
            topic_title=Min("topic_title"),
            page_start=Min("page_number"),
            page_end=Max("page_number"),
        )
    )
    topics = [
        {
            "topic_code": row["topic_code"],
            "topic_title": row["topic_title"] or "",
            "page_start": row["page_start"],
            "page_end": row["page_end"],
        }
        for row in rows
    ]
    topics.sort(key=lambda item: _topic_sort_key(item["topic_code"]))
    return {
        "key": book.key,
        "title": book.title,
        "edition": book.edition,
        "authors": book.authors,
        "page_count": book.page_count,
        "topics": topics,
    }


def get_textbook_pages(
    textbook_key: str,
    *,
    page_start: int = 1,
    page_end: int | None = None,
    topic_code: str | None = None,
) -> dict | None:
    from courses.models import CambridgeTextbook, CambridgeTextbookPage

    book = CambridgeTextbook.objects.filter(key=textbook_key, status="ready").first()
    if not book:
        return None
    qs = CambridgeTextbookPage.objects.filter(textbook=book).order_by("page_number")
    if topic_code:
        topic_match = qs.filter(topic_code=topic_code)
        if not topic_match.exists():
            # If topic_code has sub-topic decimal (e.g. '1.4'), fallback to main chapter ('1')
            if "." in topic_code:
                main_chapter = topic_code.split(".")[0].strip()
                topic_match = qs.filter(topic_code=main_chapter)
            # If topic_code is a main chapter (e.g. '1'), match all sub-topics ('1.1', '1.2', etc.)
            elif topic_code.isdigit():
                topic_match = qs.filter(topic_code__startswith=f"{topic_code}.")

        if not topic_match.exists():
            return {
                "textbook": {
                    "key": book.key,
                    "title": book.title,
                    "edition": book.edition,
                    "authors": book.authors,
                },
                "page_start": 1,
                "page_end": 0,
                "pages": [],
            }
        qs = topic_match
        page_start = qs.first().page_number
        page_end = qs.last().page_number
    end = page_end or page_start
    start = max(1, int(page_start))
    end = min(book.page_count or end, max(start, int(end)))
    # Cap a single request to keep payloads reasonable.
    if end - start > 40:
        end = start + 40
    from courses.models import CambridgeTextbookImage

    pages = list(
        CambridgeTextbookPage.objects.filter(
            textbook=book,
            page_number__gte=start,
            page_number__lte=end,
        )
        .order_by("page_number")
        .values(
            "page_number",
            "topic_code",
            "topic_title",
            "text",
            "char_count",
        )
    )

    images = list(
        CambridgeTextbookImage.objects.filter(
            textbook=book,
            page_number__gte=start,
            page_number__lte=end,
        )
        .order_by("page_number", "image_index")
        .values(
            "id",
            "page_number",
            "image_index",
            "relative_path",
            "caption",
            "width",
            "height",
        )
    )

    image_map: dict[int, list[dict]] = {}
    for img in images:
        image_map.setdefault(img["page_number"], []).append(
            {
                "id": img["id"],
                "image_index": img["image_index"],
                "url": f"/api/courses/textbooks/images/{img['relative_path']}",
                "caption": img["caption"] or "",
                "width": img["width"],
                "height": img["height"],
            }
        )

    for p in pages:
        p["images"] = image_map.get(p["page_number"], [])

    return {
        "textbook": {
            "key": book.key,
            "title": book.title,
            "edition": book.edition,
            "authors": book.authors,
            "publisher": book.publisher,
            "year": book.year,
            "page_count": book.page_count,
        },
        "page_start": start,
        "page_end": end,
        "pages": pages,
    }
