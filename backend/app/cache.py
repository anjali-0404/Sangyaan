from __future__ import annotations

import time
from typing import Any


class TTLCache:
    """Small in-process TTL cache. Swap for Redis only if you run more than one instance and need sharing."""

    def __init__(self, ttl: float, max_items: int = 2048):
        self.ttl, self.max_items = ttl, max_items
        self._d: dict[Any, tuple[float, Any]] = {}

    def get(self, key):
        hit = self._d.get(key)
        if not hit:
            return None
        if hit[0] < time.monotonic():
            self._d.pop(key, None)
            return None
        return hit[1]

    def set(self, key, value) -> None:
        if len(self._d) >= self.max_items:
            self._d.pop(next(iter(self._d)))
        self._d[key] = (time.monotonic() + self.ttl, value)
