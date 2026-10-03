"""Persist scans, evidence and the entity graph. Raw text is never stored here (hash only)."""
from __future__ import annotations

import hashlib
import itertools
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import Entity, EntityLink, Scan, ScanEvidence
from app.schemas import AnalyzeResponse


def text_hash(text: str) -> str:
    return hashlib.sha256(text.strip().lower().encode()).hexdigest()


def _entities(resp: AnalyzeResponse) -> list[tuple[str, str]]:
    c = resp.claims
    out = [("sebi_no", v) for v in c.sebi_numbers] + [("upi", v) for v in c.upi_ids] \
        + [("phone", v) for v in c.phones] + [("domain", v) for v in c.domains]
    return out[:20]


def save_scan(db: Session, resp: AnalyzeResponse, *, input_type: str, client: str, lang: str, thash: str) -> str:
    scan_id = str(uuid.uuid4())
    resp.scan_id = scan_id
    db.add(Scan(id=scan_id, input_type=input_type, client=client, score=resp.score, band=resp.band,
                text_hash=thash, lang=lang, result_json=resp.model_dump(mode="json")))
    for e in resp.evidence:
        db.add(ScanEvidence(scan_id=scan_id, code=e.code, severity=e.severity, weight=e.weight,
                            detail=e.detail, source=e.source, status=e.status))
    now = datetime.now(timezone.utc)
    ids: list[int] = []
    for kind, value in _entities(resp):
        ent = db.scalar(select(Entity).where(Entity.kind == kind, Entity.value_norm == value))
        if ent:
            ent.seen_count += 1
            ent.last_seen = now
        else:
            ent = Entity(kind=kind, value_norm=value, first_seen=now, last_seen=now)
            db.add(ent)
            db.flush()
        ids.append(ent.id)
    for a, b in itertools.combinations(sorted(set(ids)), 2):
        db.add(EntityLink(entity_a=a, entity_b=b, scan_id=scan_id))
    db.commit()
    return scan_id
