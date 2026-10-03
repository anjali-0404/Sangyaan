"""Build the registry CSV from SEBI's public "Recognised Intermediaries" pages.

    python -m app.data.sebi_scrape --out app/data/sebi_full.csv
    python -m app.data.sebi_snapshot --csv app/data/sebi_full.csv --known app/data/sample/known_entities.yaml

Reads the same AJAX endpoints the SEBI website uses (active lists, plus the cancelled / surrendered /
expired / suspended list), a few requests at a time with a delay. Please keep it that way: this is a public
regulator site. Run it daily or weekly, not per user request. Check SEBI's terms of use for your use case.

Parsing is deliberately strict: if a page has no records the category stops; if the structure changes the
script fails loudly instead of loading half a registry.
"""
from __future__ import annotations

import argparse
import asyncio
import csv
import html
import re
import sys
from datetime import date, datetime
from pathlib import Path

import httpx

BASE = "https://www.sebi.gov.in/sebiweb/ajax/other"
UA = "SangyanShield-registry-sync/0.1 (public-interest research; contact: set-your-email)"

# intmId -> label. Active lists (getintmfpiinfo.jsp)
ACTIVE = {13: "Investment Advisers", 14: "Research Analysts", 2: "Stock Brokers", 30: "Stock Brokers (cash)",
          31: "Stock Brokers (F&O)", 33: "Portfolio Managers", 9: "Merchant Bankers"}
# Cancelled / surrendered / expired / suspended (getintmfpiinfo2.jsp). SEBI only offers these three here.
INACTIVE = {13: "Investment Advisers", 14: "Research Analysts", 33: "Portfolio Managers"}

_FIELD = re.compile(
    r"""<div class=["']title["']><span>\s*(.*?)\s*</span></div><div class=["']value[^"']*["']><span>(.*?)</span></div>""",
    re.S)
_REG = re.compile(r"^IN[A-Z]\d{9}$")


def parse_records(page: str) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    cur: dict[str, str] | None = None
    for k, v in _FIELD.findall(page):
        k, v = html.unescape(k).strip(), re.sub(r"\s+", " ", html.unescape(v)).strip()
        if k == "Name":
            cur = {"Name": v}
            records.append(cur)
        elif cur is not None:
            cur[k] = v
    return records


def parse_end_date(validity: str | None) -> str:
    """'Dec 22, 2022 - Perpetual' -> '' ; 'Jan 1, 2020 - Dec 31, 2025' -> '2025-12-31'."""
    if not validity or "-" not in validity:
        return ""
    end = validity.rsplit(" - ", 1)[-1].strip()
    for fmt in ("%b %d, %Y", "%B %d, %Y"):
        try:
            return datetime.strptime(end, fmt).date().isoformat()
        except ValueError:
            pass
    return ""


async def _post(client: httpx.AsyncClient, endpoint: str, data: dict[str, str]) -> str:
    for attempt in range(4):
        try:
            r = await client.post(f"{BASE}/{endpoint}", data=data, timeout=30)
            r.raise_for_status()
            return r.text
        except httpx.HTTPError:
            if attempt == 3:
                raise
            await asyncio.sleep(2 * (attempt + 1))
    raise AssertionError


async def crawl(client: httpx.AsyncClient, sem: asyncio.Semaphore, intm: int, inactive: bool,
                delay: float, max_pages: int = 600) -> list[dict[str, str]]:
    endpoint = "getintmfpiinfo2.jsp" if inactive else "getintmfpiinfo.jsp"
    out: list[dict[str, str]] = []
    for page in range(max_pages):
        data = {"nextValue": "1", "next": "n", "intmId": str(intm), "contPer": "", "name": "", "regNo": "",
                "email": "", "location": "", "exchange": "", "affiliate": "", "alp": "", "doDirect": str(page),
                "intmIds": ""}
        if inactive:
            data.update({"regStatus": "", "language": "", "model": "", "esgCategory": ""})
        async with sem:
            text = await _post(client, endpoint, data)
            await asyncio.sleep(delay)
        recs = parse_records(text)
        if not recs:
            if page == 0:
                raise RuntimeError(f"no records for intmId={intm} inactive={inactive}: SEBI page format changed?")
            break
        out.extend(recs)
    return out


def _status(raw: str | None) -> str:
    st = (raw or "").strip().lower()
    # The inactive list also shows "Registered" for a few re-registered entities. Never call those inactive.
    return "active" if st in ("registered", "") else st


def to_rows(records: list[dict[str, str]], inactive: bool) -> list[dict[str, str]]:
    rows = []
    for r in records:
        reg = (r.get("Registration No.") or "").replace(" ", "").upper()
        if not _REG.match(reg):
            continue  # skip anything that is not a standard SEBI registration number
        rows.append({
            "reg_no": reg,
            "category": reg[:3],
            "name": r["Name"],
            "status": _status(r.get("Status")) if inactive else "active",
            "valid_till": "" if inactive else parse_end_date(r.get("Validity")),
            "city": "",  # SEBI addresses are free text; not reliably parseable, and unused by the checks
        })
    return rows


async def run(out: Path, delay: float, concurrency: int) -> int:
    sem = asyncio.Semaphore(concurrency)
    async with httpx.AsyncClient(headers={"User-Agent": UA, "Referer": "https://www.sebi.gov.in/"},
                                 follow_redirects=True) as client:
        jobs = [(i, False) for i in ACTIVE] + [(i, True) for i in INACTIVE]
        results = await asyncio.gather(*(crawl(client, sem, i, inact, delay) for i, inact in jobs))
    merged: dict[str, dict[str, str]] = {}
    for (intm, inact), recs in zip(jobs, results):
        rows = to_rows(recs, inact)
        print(f"intmId={intm:>2} {'inactive' if inact else 'active  '} {len(rows):>6} rows", file=sys.stderr)
        for row in rows:
            # an active listing wins over a stale inactive one with the same number
            if row["reg_no"] not in merged or merged[row["reg_no"]]["status"] != "active":
                merged[row["reg_no"]] = row
    if not merged:
        raise RuntimeError("scraped nothing")
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["reg_no", "category", "name", "status", "valid_till", "city"])
        w.writeheader()
        w.writerows(sorted(merged.values(), key=lambda r: r["reg_no"]))
    return len(merged)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", type=Path, default=Path("app/data/sebi_full.csv"))
    ap.add_argument("--delay", type=float, default=0.5, help="seconds between requests per worker")
    ap.add_argument("--concurrency", type=int, default=3)
    a = ap.parse_args()
    n = asyncio.run(run(a.out, a.delay, a.concurrency))
    print(f"wrote {n} intermediaries to {a.out} (scraped {date.today()})", file=sys.stderr)


if __name__ == "__main__":
    main()
