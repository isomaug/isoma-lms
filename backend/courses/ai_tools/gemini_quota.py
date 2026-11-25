import threading
import time

QUOTA_COOLDOWN_SECONDS = 600
MAX_HTTP_CALLS = 3
QUOTA_USER_MESSAGE = (
    "The AI quota is currently exhausted. Please try again in a few minutes."
)

_lock = threading.Lock()
_quota_tripped_until = 0.0

QUOTA_MARKERS = (
    "resource_exhausted",
    "resourceexhausted",
    "quota",
    "rate limit",
    "ratelimit",
    "too many requests",
    "exceeded your current quota",
    "limit: 0",
)


def is_quota_tripped():
    with _lock:
        return time.monotonic() < _quota_tripped_until


def trip_quota(seconds=QUOTA_COOLDOWN_SECONDS):
    global _quota_tripped_until
    with _lock:
        _quota_tripped_until = max(_quota_tripped_until, time.monotonic() + seconds)


def is_quota_error(status_code=None, body=""):
    if status_code == 429:
        return True
    text = (body or "").lower()
    return any(marker in text for marker in QUOTA_MARKERS)


def is_quota_exception(exc):
    text = str(exc or "").lower()
    return any(marker in text for marker in QUOTA_MARKERS)
