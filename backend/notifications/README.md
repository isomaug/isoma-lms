# Notifications App (`backend/notifications`)

> **README Overview**: In-app notifications, digest emails, background delivery queues, and user alert preferences.

---

## Architecture: Root Files ("Out") vs Subdirectories ("In Folders")

### 📂 Subdirectories ("In Folders")
* **`management/`**:
  * `commands/process_notification_deliveries.py` — Cron/worker task that digests and batches pending notification deliveries.
* **`templates/`**:
  * HTML email templates for digests, session reminders, and security alerts.
* **`tests/`**:
  * `test_notifications.py` — Automated tests for dispatching notifications, delivery state transitions, and preference enforcement.
* **`migrations/`**:
  * Database schema migrations for notifications, delivery records, and user preferences.

### 📄 Root Files ("Out" — Django Standard Conventions)
* [`admin.py`](file:///f:/Master%20Mind/personal-website/backend/notifications/admin.py) — Django admin registrations for `Notification`, `NotificationDelivery`, and `NotificationPreference`.
* [`apps.py`](file:///f:/Master%20Mind/personal-website/backend/notifications/apps.py) — `NotificationsConfig` AppConfig definition loaded by `INSTALLED_APPS`.
* [`models.py`](file:///f:/Master%20Mind/personal-website/backend/notifications/models.py) — ORM models (`Notification`, `NotificationDelivery`, `NotificationPreference`).
* [`serializers.py`](file:///f:/Master%20Mind/personal-website/backend/notifications/serializers.py) — Serializers for in-app alert lists and preference toggle mutations.
* [`services.py`](file:///f:/Master%20Mind/personal-website/backend/notifications/services.py) — Core `notify_user` engine and email queue dispatch service.
* [`signals.py`](file:///f:/Master%20Mind/personal-website/backend/notifications/signals.py) — Model event listeners triggering automated notifications.
* [`urls.py`](file:///f:/Master%20Mind/personal-website/backend/notifications/urls.py) — REST endpoints for the in-app notification center and read receipts.
* [`views.py`](file:///f:/Master%20Mind/personal-website/backend/notifications/views.py) — ViewSets for fetching user notifications, marking them read, and managing settings.

---

## Key Features
- **Multi-Channel**: In-app popups and background SMTP email deliveries.
- **Batched Delivery**: Background command digests and delivers immediate and scheduled notification batches reliably.
