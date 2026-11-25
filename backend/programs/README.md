# Programs App (`backend/programs`)

> **README Overview**: Institutional training programs, bootcamps, cohort schedules, internships, and scholarships.

---

## Architecture: Root Files ("Out") vs Subdirectories ("In Folders")

### 📂 Subdirectories ("In Folders")
* **`management/`**:
  * Commands for program cohort initialization and scholarship seeding.
* **`templates/`**:
  * HTML email certificates and cohort acceptance notifications.
* **`tests/`**:
  * `test_programs.py` — Test suite for cohort creation, schedule conflicts, and application processing.
* **`migrations/`**:
  * Database schema migrations for training programs, cohorts, and applications.

### 📄 Root Files ("Out" — Django Standard Conventions)
* [`admin.py`](file:///f:/Master%20Mind/personal-website/backend/programs/admin.py) — Django admin registrations for `Program`, `Cohort`, and `ScholarshipApplication`.
* [`apps.py`](file:///f:/Master%20Mind/personal-website/backend/programs/apps.py) — `ProgramsConfig` AppConfig definition loaded by `INSTALLED_APPS`.
* [`models.py`](file:///f:/Master%20Mind/personal-website/backend/programs/models.py) — ORM models (`Program`, `Cohort`, `CohortSchedule`, `ScholarshipApplication`).
* [`permissions.py`](file:///f:/Master%20Mind/personal-website/backend/programs/permissions.py) — Program coordinator and instructor permission policies.
* [`serializers.py`](file:///f:/Master%20Mind/personal-website/backend/programs/serializers.py) — DRF serializers for programs, cohorts, timetables, and scholarship forms.
* [`services.py`](file:///f:/Master%20Mind/personal-website/backend/programs/services.py) — Business logic services for cohort enrolment and status progression.
* [`urls.py`](file:///f:/Master%20Mind/personal-website/backend/programs/urls.py) — REST API routing for public programs and administrative cohort endpoints.
* [`views.py`](file:///f:/Master%20Mind/personal-website/backend/programs/views.py) — ViewSets handling program applications, schedules, and student rosters.
