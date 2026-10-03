from __future__ import annotations

from collections.abc import Iterator
from datetime import date

from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import get_settings
from app.models import Base, KnownEntity, SebiIntermediary
from app.pipeline.verify import IntermediaryRow, KnownEntityRow

_engine = None
_Session: sessionmaker[Session] | None = None


def init_engine(url: str | None = None):
    global _engine, _Session
    url = url or get_settings().database_url
    kwargs = {}
    if url.startswith("sqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
        if ":memory:" in url:
            kwargs["poolclass"] = StaticPool
    _engine = create_engine(url, pool_pre_ping=True, **kwargs)
    _Session = sessionmaker(_engine, expire_on_commit=False)
    return _engine


def create_all_dev() -> None:
    """Dev/test convenience. Production uses `alembic upgrade head`."""
    Base.metadata.create_all(get_engine())


def get_engine():
    return _engine or init_engine()


def session_factory() -> sessionmaker[Session]:
    get_engine()
    assert _Session is not None
    return _Session


def get_db() -> Iterator[Session]:
    with session_factory()() as s:
        yield s


class SqlRegistry:
    """Registry implementation over SQLAlchemy (satisfies pipeline.verify.Registry)."""

    def __init__(self, db: Session):
        self.db = db
        self._known: list[KnownEntityRow] | None = None

    def get_by_reg_no(self, reg_no: str) -> IntermediaryRow | None:
        r = self.db.scalar(select(SebiIntermediary).where(SebiIntermediary.reg_no == reg_no))
        return None if r is None else IntermediaryRow(
            r.reg_no, r.category, r.name, r.name_norm, r.status, r.valid_till, r.city, r.snapshot_date)

    def known_entities(self) -> list[KnownEntityRow]:
        if self._known is None:
            self._known = [
                KnownEntityRow(k.name, list(k.domains or []), list(k.upi_handles or []), k.sebi_reg_no)
                for k in self.db.scalars(select(KnownEntity))
            ]
        return self._known

    def known_entity_by_sebi(self, reg_no: str) -> KnownEntityRow | None:
        return next((k for k in self.known_entities() if k.sebi_reg_no == reg_no), None)

    def snapshot_date(self) -> date | None:
        return self.db.scalar(select(func.max(SebiIntermediary.snapshot_date)))
