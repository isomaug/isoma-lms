# Courses App (`backend/courses`)

> **README Overview**: Architectural blueprint for curriculum courses, syllabus stages, interactive lessons, past papers, assignments, certificates, and student XP gamification.

---

## Architecture: Root Files ("Out") vs Subdirectories ("In Folders")

### 📂 Subdirectories ("In Folders")

* **`tests/`**:
  * `tests.py` - Core course model and enrollment tests.
  * `test_ai_features.py` - AI worksheet and lesson plan generation tests.
  * `test_pastpapers.py` - Past paper ingest and search endpoint tests.
  * `test_pairing_and_xp.py` - Student gamification XP points and streak tests.
  * `test_social_preview.py` - OpenGraph and social share preview tests.
  * `test_visibility.py` - Course draft vs published visibility tests.
* **`pastpapers/`**:
  * `seed_engine.py` - Past paper manifest ingestion and PDF parser.
  * `README.md` - Ingest guide for private textbook extracts and past exam papers.
* **`ai_tools/`**:
  * AI curriculum drafting tools and prompt templates.
* **`data/`**:
  * Lesson schema definitions and fallback course structures.
* **`management/`**:
  * Custom commands (`smart_sync`, `seed_quizzes`, `ensure_superuser`).
* **`migrations/`**:
  * Database schema migrations.
* **`templates/`**:
  * Completion certificates and printable syllabus layouts.

### 📄 Root Files ("Out" - Django Standard Conventions)

* [`admin.py`](file:///f:/Master%20Mind/personal-website/backend/courses/admin.py) - Django admin registrations for `Course`, `Lesson`, `Cohort`, `Enrollment`, `PastPaper`.
* [`apps.py`](file:///f:/Master%20Mind/personal-website/backend/courses/apps.py) - `CoursesConfig` AppConfig definition loaded by Django.
* [`models.py`](file:///f:/Master%20Mind/personal-website/backend/courses/models.py) - Database models for courses, modules, lessons, cohorts, quizzes, and certificates.
* [`serializers.py`](file:///f:/Master%20Mind/personal-website/backend/courses/serializers.py) - DRF serializers for course listings, modules, and progress tracking.
* [`urls.py`](file:///f:/Master%20Mind/personal-website/backend/courses/urls.py) - API route declarations for courses, lessons, and assignments.
* [`assignment_service.py`](file:///f:/Master%20Mind/personal-website/backend/courses/assignment_service.py) - Structured interactive worksheet and assignment generation service.
* [`entitlements.py`](file:///f:/Master%20Mind/personal-website/backend/courses/entitlements.py) - User enrollment checks, trial logic, and lesson access permissions.
* [`pastpaper_serializers.py`](file:///f:/Master%20Mind/personal-website/backend/courses/pastpaper_serializers.py) - Dedicated serializers for past exam papers and answer keys.
* [`pastpaper_views.py`](file:///f:/Master%20Mind/personal-website/backend/courses/pastpaper_views.py) - Endpoints for browsing, searching, and reading past papers.
* [`textbook_views.py`](file:///f:/Master%20Mind/personal-website/backend/courses/textbook_views.py) - Endpoints for reading curriculum textbook extracts.
* [`rlhf_views.py`](file:///f:/Master%20Mind/personal-website/backend/courses/rlhf_views.py) - AI lesson feedback and reinforcement learning collection endpoints.
* [`pdf_generator.py`](file:///f:/Master%20Mind/personal-website/backend/courses/pdf_generator.py) - Course syllabus and certificate PDF generation service.
* [`utils.py`](file:///f:/Master%20Mind/personal-website/backend/courses/utils.py) - Google avatar sync and course helper functions.
* [`visibility.py`](file:///f:/Master%20Mind/personal-website/backend/courses/visibility.py) - Course publishing status and cohort visibility rules.
* [`xp_rules.py`](file:///f:/Master%20Mind/personal-website/backend/courses/xp_rules.py) & [`xp_utils.py`](file:///f:/Master%20Mind/personal-website/backend/courses/xp_utils.py) - XP reward rules, leveling thresholds, and streak calculations.
