from __future__ import annotations

from fastapi import Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.db import SqlRegistry, get_db
from app.pipeline.verify.url_intel import UrlIntel

# Behind a proxy, run uvicorn with --proxy-headers so the client IP is the real one.
limiter = Limiter(key_func=get_remote_address)


def rate() -> str:
    return get_settings().rate_limit


def settings_dep() -> Settings:
    return get_settings()


def registry_dep(db: Session = Depends(get_db)) -> SqlRegistry:
    return SqlRegistry(db)


def intel_dep(request: Request) -> UrlIntel:
    return request.app.state.intel
