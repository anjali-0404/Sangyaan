"""Record/replay for external sources (DEMO_REPLAY=1).

Not fake results: real responses recorded once per demo input, replayed from disk so the full pipeline
still runs on every request. Say "recorded sources" if asked.
"""
from __future__ import annotations

import hashlib
import json
from collections.abc import Awaitable, Callable
from typing import Any

from app.config import get_settings


class SourceUnavailable(Exception):
    """An external source could not be reached or answered badly."""


def _path(source: str, key: str):
    h = hashlib.sha1(key.encode()).hexdigest()[:16]
    return get_settings().replay_dir / f"{source}-{h}.json"


async def recorded(source: str, key: str, fn: Callable[[], Awaitable[Any]]) -> Any:
    s = get_settings()
    p = _path(source, key)
    if s.demo_replay:
        if p.exists():
            return json.loads(p.read_text(encoding="utf-8"))["response"]
        raise SourceUnavailable(f"{source}: no recording for {key}")
    result = await fn()
    if s.demo_record:
        s.replay_dir.mkdir(parents=True, exist_ok=True)
        p.write_text(json.dumps({"source": source, "key": key, "response": result}, ensure_ascii=False, indent=1),
                     encoding="utf-8")
    return result
