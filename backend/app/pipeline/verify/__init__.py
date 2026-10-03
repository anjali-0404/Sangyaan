"""Verification stages. Each takes Claims plus a data source and returns Evidence; no hidden I/O."""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date
from typing import Protocol


@dataclass
class IntermediaryRow:
    reg_no: str
    category: str
    name: str
    name_norm: str
    status: str | None
    valid_till: date | None
    city: str | None
    snapshot_date: date


@dataclass
class KnownEntityRow:
    name: str
    domains: list[str] = field(default_factory=list)
    upi_handles: list[str] = field(default_factory=list)
    sebi_reg_no: str | None = None


class Registry(Protocol):
    def get_by_reg_no(self, reg_no: str) -> IntermediaryRow | None: ...
    def known_entity_by_sebi(self, reg_no: str) -> KnownEntityRow | None: ...
    def known_entities(self) -> list[KnownEntityRow]: ...
    def snapshot_date(self) -> date | None: ...
