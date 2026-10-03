"""Runs only when the real registry has been scraped (app/data/sebi_full.csv, gitignored)."""
import csv
from datetime import date

import pytest

from app.config import DATA_DIR
from app.pipeline.normalize import norm_name
from app.pipeline.run import analyze_text
from app.pipeline.verify import IntermediaryRow, KnownEntityRow
from tests.helpers import FakeIntel, MemRegistry

CSV = DATA_DIR / "sebi_full.csv"
pytestmark = pytest.mark.skipif(not CSV.exists(), reason="run `python -m app.data.sebi_scrape` first")


@pytest.fixture
def real_registry():
    reg = MemRegistry(snapshot=date(2026, 10, 3), with_data=False)
    with open(CSV, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            reg.rows[r["reg_no"]] = IntermediaryRow(r["reg_no"], r["category"], r["name"], norm_name(r["name"]),
                                                   r["status"], None, None, date(2026, 10, 3))
    reg.known = [KnownEntityRow("Zerodha", ["zerodha.com"], [], "INZ000031633")]
    return reg


async def run(text, settings, reg):
    return await analyze_text(text, source_url=None, registry=reg, intel=FakeIntel(settings, ages={}),
                              settings=settings, use_llm=False)


async def test_registry_is_realistic_size(real_registry):
    assert len(real_registry.rows) > 5000


async def test_genuine_broker_is_clean(settings, real_registry):
    r = await run("Zerodha Broking Limited SEBI Reg INZ000031633, https://zerodha.com", settings, real_registry)
    assert r.band == "LOW" and not r.evidence


async def test_real_number_wrong_name_and_domain(settings, real_registry):
    r = await run("I am Rahul Mehta, Zerodha INZ000031633, see https://zerodha-pro.in", settings, real_registry)
    assert {"ENTITY_NAME_MISMATCH", "DOMAIN_NOT_OFFICIAL"} <= {e.code for e in r.evidence}
    assert r.band in ("HIGH", "CRITICAL")


async def test_fake_number_not_found(settings, real_registry):
    r = await run("SEBI registered INA000099999 stock adviser", settings, real_registry)
    assert "SEBI_NOT_FOUND" in {e.code for e in r.evidence}


async def test_expired_registration_flagged(settings, real_registry):
    r = await run("5paisa Capital Limited INA000014252 advisory", settings, real_registry)
    assert "SEBI_NOT_ACTIVE" in {e.code for e in r.evidence}


async def test_real_number_wrong_name_plus_high_return_is_high(settings, real_registry):
    # Found by the end-to-end smoke test: this used to stop at MEDIUM (35).
    r = await run("I am Rahul Mehta, SEBI registered adviser INA000021094, join for 30% monthly returns", settings, real_registry)
    assert {"ENTITY_NAME_MISMATCH", "UNREALISTIC_RETURN"} <= {e.code for e in r.evidence}
    assert r.band in ("HIGH", "CRITICAL")
    assert sum(e.weight for e in r.evidence if e.status == "ok") == r.score
