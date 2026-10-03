from __future__ import annotations

import csv
from datetime import date
from pathlib import Path

import yaml

from app.config import DATA_DIR, Settings
from app.pipeline.normalize import norm_name
from app.pipeline.verify import IntermediaryRow, KnownEntityRow
from app.pipeline.verify.url_intel import UrlIntel
from app.replay import SourceUnavailable

SNAP = date(2026, 10, 1)

YOUNG = {
    "gold-profit-invest.xyz": 5, "zerodha-kyc-update.com": 3, "exampleadvisory-offers.com": 10,
    "wealth-crypto-hub.top": 7, "sebi-kyc-update.xyz": 4, "groww-support-login.in": 2,
    "sebi-invest-portal.top": 6, "illustrative-securities.xyz": 8, "samplewealth-premium.top": 1,
}


class MemRegistry:
    """Registry over the synthetic sample data; no database."""

    def __init__(self, snapshot: date | None = SNAP, with_data: bool = True):
        self._snap = snapshot
        self.rows: dict[str, IntermediaryRow] = {}
        self.known: list[KnownEntityRow] = []
        if not with_data:
            return
        with open(DATA_DIR / "sample" / "sebi_sample.csv", encoding="utf-8") as f:
            for r in csv.DictReader(f):
                self.rows[r["reg_no"]] = IntermediaryRow(
                    r["reg_no"], r["category"], r["name"], norm_name(r["name"]), r["status"],
                    date.fromisoformat(r["valid_till"]) if r["valid_till"] else None, r["city"], SNAP)
        for it in yaml.safe_load((DATA_DIR / "sample" / "known_entities.yaml").read_text()):
            self.known.append(KnownEntityRow(it["name"], it.get("domains", []), it.get("upi_handles", []),
                                             it.get("sebi_reg_no")))

    def get_by_reg_no(self, reg_no):
        return self.rows.get(reg_no)

    def known_entities(self):
        return self.known

    def known_entity_by_sebi(self, reg_no):
        return next((k for k in self.known if k.sebi_reg_no == reg_no), None)

    def snapshot_date(self):
        return self._snap


class FakeIntel(UrlIntel):
    """No network: phishing set and domain ages are injected."""

    def __init__(self, settings: Settings, phishing=(), ages=None, down=()):
        super().__init__(settings, client=None)  # type: ignore[arg-type]
        self.phishing, self.ages, self.down = set(phishing), ages if ages is not None else YOUNG, set(down)

    async def openphish(self, urls, domain):
        if "openphish" in self.down:
            raise SourceUnavailable("down")
        return domain in self.phishing

    async def urlhaus(self, domain, urls=None):
        return None

    async def safe_browsing(self, urls):
        return None

    async def domain_age_days(self, domain):
        if "rdap" in self.down:
            raise SourceUnavailable("down")
        return self.ages.get(domain, 3000)


def load_fixtures() -> list[dict]:
    with open(Path(__file__).parent / "fixtures" / "messages.csv", encoding="utf-8") as f:
        return list(csv.DictReader(f))
