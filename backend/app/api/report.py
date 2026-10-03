from __future__ import annotations

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import limiter
from app.models import Report, Scan, utcnow
from app.schemas import ReportRequest, ReportResponse

router = APIRouter(prefix="/v1", tags=["report"])
RAW_RETENTION = timedelta(days=30)


def purge_expired_raw(db: Session) -> int:
    """Delete raw submissions older than 30 days. Run at startup and daily."""
    res = db.execute(update(Report).where(Report.raw_expires_at < utcnow())
                     .values(raw_text=None, raw_expires_at=None))
    db.commit()
    return res.rowcount or 0


@router.post("/report", response_model=ReportResponse)
@limiter.limit("10/minute")
def report(request: Request, body: ReportRequest, db: Session = Depends(get_db)):
    """Stores the user's confirm/dispute. Deliberately does NOT change any score (poisoned-report guard)."""
    if db.get(Scan, body.scan_id) is None:
        raise HTTPException(404, "Scan not found")
    store_raw = body.consent_store_raw and bool(body.raw_text)
    row = Report(
        scan_id=body.scan_id, verdict=body.verdict, note=body.note,
        raw_text=body.raw_text if store_raw else None,
        raw_expires_at=utcnow() + RAW_RETENTION if store_raw else None,
    )
    db.add(row)
    db.commit()
    return ReportResponse(report_id=row.id, stored_raw=store_raw)
