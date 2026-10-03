"""Daily cap on paid calls (OCR, STT, TTS, LLM) so a script cannot burn credits."""
from __future__ import annotations

import threading
from datetime import datetime, timezone

from app.config import get_settings


class BudgetExceeded(Exception):
    pass


_lock = threading.Lock()
_day = ""
_count = 0


def consume(kind: str, n: int = 1) -> None:
    global _day, _count
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    with _lock:
        if today != _day:
            _day, _count = today, 0
        if _count + n > get_settings().daily_paid_call_cap:
            raise BudgetExceeded(f"daily cap reached for {kind}")
        _count += n


def reset() -> None:
    global _day, _count
    with _lock:
        _day, _count = "", 0
