"""Load the SEBI registry snapshot (and curated known entities) into the database.

    python -m app.data.sebi_snapshot --csv registry.csv --snapshot-date 2026-10-01
    python -m app.data.sebi_snapshot --sample            # synthetic demo data

CSV columns: reg_no, category, name, status, valid_till, city. Idempotent: upserts by reg_no and removes
rows missing from the new snapshot. Works whether you obtain the registry as a bulk table or scrape
per-number: just produce a CSV.
"""
from __future__ import annotations

import argparse
import csv
from datetime import date, datetime
from pathlib import Path

import yaml
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app import db
from app.config import DATA_DIR
from app.models import KnownEntity, SebiIntermediary
from app.pipeline.normalize import norm_name, norm_sebi

SAMPLE = DATA_DIR / "sample"


def _date(s: str | None) -> date | None:
    s = (s or "").strip()
    return datetime.strptime(s, "%Y-%m-%d").date() if s else None


def load_snapshot(session: Session, csv_path: Path, snapshot_date: date) -> int:
    rows: dict[str, dict] = {}
    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            reg = norm_sebi(r["reg_no"])
            if not reg:
                continue
            rows[reg] = dict(
                reg_no=reg,
                category=(r.get("category") or reg[:3]).strip().upper(),
                name=r["name"].strip(),
                name_norm=norm_name(r["name"]),
                status=(r.get("status") or "").strip().lower() or None,
                valid_till=_date(r.get("valid_till")),
                city=(r.get("city") or "").strip() or None,
                snapshot_date=snapshot_date,
            )
    existing = {x.reg_no: x for x in session.scalars(select(SebiIntermediary))}
    for reg, data in rows.items():
        if reg in existing:
            for k, v in data.items():
                setattr(existing[reg], k, v)
        else:
            session.add(SebiIntermediary(**data))
    stale = [r for r in existing if r not in rows]
    if stale:
        session.execute(delete(SebiIntermediary).where(SebiIntermediary.reg_no.in_(stale)))
    session.commit()
    return len(rows)


def load_known_entities(session: Session, yaml_path: Path) -> int:
    items = yaml.safe_load(yaml_path.read_text(encoding="utf-8")) or []
    existing = {k.name: k for k in session.scalars(select(KnownEntity))}
    for it in items:
        vals = dict(domains=[d.lower() for d in it.get("domains", [])],
                    upi_handles=[h.lower() for h in it.get("upi_handles", [])],
                    sebi_reg_no=norm_sebi(it["sebi_reg_no"]) if it.get("sebi_reg_no") else None)
        if it["name"] in existing:
            for k, v in vals.items():
                setattr(existing[it["name"]], k, v)
        else:
            session.add(KnownEntity(name=it["name"], **vals))
    session.commit()
    return len(items)


_IDENTITY_ORDER = ("INZ", "INA", "INH", "INP")


def link_known_entities(session: Session, yaml_path: Path) -> list[tuple[str, list[str]]]:
    """Fill known_entity.sebi_reg_no from the registry, only on an exact registered-name match.

    Uses `registered_name` from the YAML (falls back to `name`). Identity number is the first of INZ, INA,
    INH, INP for which exactly one active row has that exact normalised name. Never guesses: anything else is
    returned as (entity, candidates) for a human to resolve by setting `sebi_reg_no` in the YAML.
    """
    items = {it["name"]: it for it in (yaml.safe_load(yaml_path.read_text(encoding="utf-8")) or [])}
    rows = [r for r in session.scalars(select(SebiIntermediary)) if (r.status or "active") == "active"]
    unresolved: list[tuple[str, list[str]]] = []
    for ke in session.scalars(select(KnownEntity)):
        if ke.sebi_reg_no or ke.name in ("SEBI", "NSE", "BSE"):
            continue
        target = norm_name(items.get(ke.name, {}).get("registered_name") or ke.name)
        exact = [r for r in rows if r.name_norm == target]
        for cat in _IDENTITY_ORDER:
            hit = [r for r in exact if r.category == cat]
            if len(hit) == 1:
                ke.sebi_reg_no = hit[0].reg_no
                break
        else:
            unresolved.append((ke.name, [f"{r.reg_no} {r.name}" for r in exact][:5]))
    session.commit()
    return unresolved


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", type=Path)
    ap.add_argument("--snapshot-date", type=date.fromisoformat, default=date.today())
    ap.add_argument("--known", type=Path)
    ap.add_argument("--sample", action="store_true", help="load synthetic demo data")
    a = ap.parse_args()
    csv_path = SAMPLE / "sebi_sample.csv" if a.sample else a.csv
    known = SAMPLE / "known_entities.yaml" if a.sample else a.known
    db.create_all_dev() if str(db.get_engine().url).startswith("sqlite") else None
    with db.session_factory()() as s:
        if csv_path:
            print(f"loaded {load_snapshot(s, csv_path, a.snapshot_date)} intermediaries (snapshot {a.snapshot_date})")
        if known:
            print(f"loaded {load_known_entities(s, known)} known entities")
        if csv_path and known:
            for name, cands in link_known_entities(s, known):
                print(f"  needs manual sebi_reg_no: {name}  candidates: {cands or 'none'}")


if __name__ == "__main__":
    main()
