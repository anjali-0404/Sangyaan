from __future__ import annotations

from datetime import date, datetime, timezone

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Index, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

Json = JSON().with_variant(JSONB(), "postgresql")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


class SebiIntermediary(Base):
    __tablename__ = "sebi_intermediary"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    reg_no: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    category: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    name_norm: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str | None] = mapped_column(Text)
    valid_till: Mapped[date | None] = mapped_column(Date)
    city: Mapped[str | None] = mapped_column(Text)
    snapshot_date: Mapped[date] = mapped_column(Date, nullable=False)
    # Postgres also gets a pg_trgm GIN index on name_norm via the Alembic migration.


class KnownEntity(Base):
    """Hand-curated legitimate brands and their official domains / UPI handles."""
    __tablename__ = "known_entity"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(Text, nullable=False, unique=True)
    domains: Mapped[list] = mapped_column(Json, default=list)
    upi_handles: Mapped[list] = mapped_column(Json, default=list)
    sebi_reg_no: Mapped[str | None] = mapped_column(Text, index=True)


class Scan(Base):
    __tablename__ = "scan"
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    input_type: Mapped[str] = mapped_column(String(10))
    client: Mapped[str] = mapped_column(String(10))
    score: Mapped[int] = mapped_column(Integer)
    band: Mapped[str] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    text_hash: Mapped[str] = mapped_column(String(64), index=True)  # hash only; raw text is NOT stored
    lang: Mapped[str] = mapped_column(String(5))
    result_json: Mapped[dict] = mapped_column(Json)  # full response, so GET /v1/scan/{id} is exact


class ScanEvidence(Base):
    __tablename__ = "scan_evidence"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scan_id: Mapped[str] = mapped_column(ForeignKey("scan.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(48))
    severity: Mapped[str] = mapped_column(String(8))
    weight: Mapped[int] = mapped_column(Integer)
    detail: Mapped[str] = mapped_column(Text)
    source: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(12), default="ok")


class Entity(Base):
    __tablename__ = "entity"
    __table_args__ = (UniqueConstraint("kind", "value_norm"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kind: Mapped[str] = mapped_column(String(12))  # domain | upi | phone | sebi_no | apk_hash
    value_norm: Mapped[str] = mapped_column(Text)
    first_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    last_seen: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    seen_count: Mapped[int] = mapped_column(Integer, default=1)


class EntityLink(Base):
    """Identifiers that appeared in the same scan."""
    __tablename__ = "entity_link"
    __table_args__ = (Index("ix_entity_link_a", "entity_a"), Index("ix_entity_link_b", "entity_b"))
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    entity_a: Mapped[int] = mapped_column(ForeignKey("entity.id", ondelete="CASCADE"))
    entity_b: Mapped[int] = mapped_column(ForeignKey("entity.id", ondelete="CASCADE"))
    scan_id: Mapped[str] = mapped_column(ForeignKey("scan.id", ondelete="CASCADE"))


class Report(Base):
    """User confirm/dispute. Stored but does NOT affect any score (poisoned-report guard)."""
    __tablename__ = "report"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    scan_id: Mapped[str] = mapped_column(ForeignKey("scan.id", ondelete="CASCADE"), index=True)
    verdict: Mapped[str] = mapped_column(String(10))
    note: Mapped[str | None] = mapped_column(Text)
    raw_text: Mapped[str | None] = mapped_column(Text)  # only with explicit consent
    raw_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))  # now + 30 days
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
