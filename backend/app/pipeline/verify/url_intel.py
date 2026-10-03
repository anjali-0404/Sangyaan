"""Stage 4: URL reputation, domain age, lookalikes.

`UrlIntel` holds the network sources (each raises SourceUnavailable on failure). The orchestration in
`check_urls` is separate so tests can swap in a fake and run with no network.
"""
from __future__ import annotations

import asyncio
import ipaddress
import re
import time
from functools import lru_cache
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import httpx
import yaml
from rapidfuzz.distance import Levenshtein

from app.config import DATA_DIR, Settings
from app.pipeline.evidence import make, unavailable
from app.pipeline.normalize import host_of, is_shared_host, registrable_domain
from app.pipeline.verify import KnownEntityRow
from app.replay import SourceUnavailable, recorded
from app.schemas import CheckStatus, Claims, Evidence

RISKY_SUFFIXES = (".xyz", ".top", ".click", ".icu", ".buzz", ".pages.dev", ".workers.dev",
                  ".ngrok.io", ".ngrok-free.app", ".trycloudflare.com", ".loca.lt")

_MIN_BRAND_LEN = 5
NOT_REGISTERED = -1  # sentinel from domain_age_days: registry has no record and DNS does not resolve


async def _resolves(domain: str) -> bool:
    loop = asyncio.get_running_loop()
    for host in (domain, "www." + domain):
        try:
            await asyncio.wait_for(loop.getaddrinfo(host, None), timeout=2)
            return True
        except (OSError, asyncio.TimeoutError):
            continue
    return False


class _Feed:
    def __init__(self, name: str, url, local: str):
        self.name, self.url, self.local = name, url, local
        self.urls: set[str] = set()
        self.hosts: set[str] = set()
        self.loaded_at = 0.0
        self.lock = asyncio.Lock()


class UrlIntel:
    def __init__(self, settings: Settings, client: httpx.AsyncClient):
        self.s = settings
        self.client = client
        self._openphish = _Feed("openphish", lambda st: st.openphish_feed_url, "openphish.txt")
        self._urlhaus = _Feed("urlhaus", lambda st: st.urlhaus_feed_url, "urlhaus.txt")

    # ---- Bulk feeds: OpenPhish + URLhaus "online" list, in memory, refreshed hourly --------------------
    # Both are free and need no key. A copy is kept on disk so the app still has data with no network.
    async def _load_feed(self, feed: _Feed) -> None:
        async with feed.lock:
            if feed.loaded_at and time.time() - feed.loaded_at < self.s.openphish_refresh_seconds:
                return
            text: str | None = None
            local = Path(DATA_DIR / feed.local)
            if not self.s.demo_replay:
                try:
                    r = await self.client.get(feed.url(self.s), timeout=10, follow_redirects=True)
                    r.raise_for_status()
                    text = r.text
                    local.write_text(text, encoding="utf-8")
                except (httpx.HTTPError, OSError):
                    text = None
            if text is None:
                if not local.exists():
                    raise SourceUnavailable(f"{feed.name}: no feed and no local copy")
                text = local.read_text(encoding="utf-8")
            urls = {ln.strip().lower() for ln in text.splitlines() if ln.strip() and not ln.startswith("#")}
            feed.urls, feed.hosts = urls, {h for h in (host_of(u) for u in urls) if h}
            feed.loaded_at = time.time()

    async def _feed_hit(self, feed: _Feed, urls: list[str], domain: str) -> bool:
        await self._load_feed(feed)
        return any(u.lower() in feed.urls for u in urls) or any(
            h == domain or h.endswith("." + domain) for h in feed.hosts
        )

    async def openphish(self, urls: list[str], domain: str) -> bool:
        return await self._feed_hit(self._openphish, urls, domain)

    async def urlhaus(self, domain: str, urls: list[str] | None = None) -> bool:
        return await self._feed_hit(self._urlhaus, urls or [], domain)

    # ---- Google Safe Browsing (non-commercial use only; hedge wording and show attribution) -------
    async def safe_browsing(self, urls: list[str]) -> bool | None:
        if not self.s.safe_browsing_key:
            return None
        body = {
            "client": {"clientId": "sangyan-shield", "clientVersion": "0.1"},
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": u} for u in urls[:10]],
            },
        }

        async def call():
            try:
                r = await self.client.post(
                    "https://safebrowsing.googleapis.com/v4/threatMatches:find",
                    params={"key": self.s.safe_browsing_key}, json=body, timeout=3,
                )
                r.raise_for_status()
                return r.json()
            except (httpx.HTTPError, ValueError) as e:
                raise SourceUnavailable(f"safebrowsing: {e}") from e

        data = await recorded("safebrowsing", "|".join(sorted(urls)), call)
        return bool(data.get("matches"))

    # ---- RDAP domain age -------------------------------------------------------------------------
    async def domain_age_days(self, domain: str) -> int | None:
        if not self.s.enable_rdap:
            return None

        async def call():
            try:
                r = await self.client.get(self.s.rdap_base_url + domain, timeout=3, follow_redirects=True)
                if r.status_code == 404:
                    # The registry says "no such domain". Only believe that if DNS agrees; a 404 can also mean
                    # "no RDAP server for this TLD", which says nothing about the domain.
                    if not await _resolves(domain):
                        return {"not_registered": True}
                    raise SourceUnavailable("rdap: 404 but domain resolves")
                r.raise_for_status()
                return r.json()
            except (httpx.HTTPError, ValueError) as e:
                raise SourceUnavailable(f"rdap: {e}") from e

        data = await recorded("rdap", domain, call)
        if data.get("not_registered"):
            return NOT_REGISTERED
        for ev in data.get("events", []):
            if ev.get("eventAction") == "registration" and ev.get("eventDate"):
                dt = datetime.fromisoformat(ev["eventDate"].replace("Z", "+00:00"))
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return max((datetime.now(timezone.utc) - dt).days, 0)
        raise SourceUnavailable("rdap: no registration date")


# ---- pure local checks --------------------------------------------------------------------------
def lookalike_of(domain: str, known: list[KnownEntityRow]) -> tuple[str, str] | None:
    """(known_domain, why) if `domain` imitates a known official domain."""
    label = domain.split(".")[0]
    for k in known:
        for kd in k.domains:
            if kd == domain:
                return None  # it IS official
    for k in known:
        for kd in k.domains:
            klabel = kd.split(".")[0]
            if len(klabel) < _MIN_BRAND_LEN:
                continue
            limit = 1 if len(klabel) < 8 else 2
            if label == klabel:
                return kd, f"same name as {kd} under a different address ending"
            if Levenshtein.distance(label, klabel) <= limit:
                return kd, f"within {Levenshtein.distance(label, klabel)} character(s) of {kd}"
            if klabel in label:
                return kd, f"contains the brand name '{klabel}' ({kd})"
    return None


_BRAND_WORDS = ("login", "signin", "pay", "payment", "secure", "verify", "kyc", "support", "offer", "offers", "help",
                "care", "bill", "recharge", "reward", "rewards", "refund", "update", "account", "online", "app",
                "india", "official", "customer", "service", "web", "portal", "free", "gift", "bonus", "wallet")
SHORTENERS = {"bit.ly", "tinyurl.com", "cutt.ly", "rb.gy", "is.gd", "t.ly", "shorturl.at", "tiny.cc", "rebrand.ly", "ow.ly", "bitly.com"}
_LOGIN_PATH = re.compile(r"(log-?in|sign-?in|verify|verification|kyc|update|secure|account|password|otp|auth|confirm|wallet|billing|reset)", re.I)


@lru_cache
def load_brands() -> dict[str, list[str]]:
    with open(DATA_DIR / "brands.yaml", encoding="utf-8") as f:
        return {k: [d.lower() for d in v] for k, v in yaml.safe_load(f).items()}


def brand_lookalike_of(domain: str, brands: dict[str, list[str]] | None = None) -> tuple[str, str] | None:
    """(brand_domain, why) if `domain` imitates a well-known brand's address but is not one of its own.

    Deliberately stricter than the broker check: many brand names are ordinary words (apple, uber, google), so
    plain 'contains' is not enough. A hit needs the same name under another ending, a close typo, or the
    brand joined to a lure word (netflix-login, sbi-kyc, airtel.recharge...).
    """
    brands = brands or load_brands()
    if any(domain == d or domain.endswith("." + d) for ds in brands.values() for d in ds):
        return None  # it IS (a subdomain of) an official domain
    raw = domain.split(".")[0]
    ending = domain[len(raw) + 1:]
    # digit-for-letter swaps (amaz0n, paytm5, netfl1x) are a classic trick
    label = raw.translate(str.maketrans("0134578", "oleastb")) if re.search(r"[a-z]", raw) else raw
    tokens = [t for t in re.split(r"[-_]+|\d+", label) if t]
    for name, ds in brands.items():
        for klabel in {k for k in (name, ds[0].split(".")[0], name.removesuffix("bank")) if len(k) >= 3}:
            main = ds[0]
            if label == klabel:
                if ending not in _COMMON_ENDINGS:
                    return main, f"same name as {main} under an unusual address ending (.{ending})"
                continue
            if len(klabel) >= 6:
                dist = Levenshtein.distance(label, klabel)
                sim = Levenshtein.normalized_similarity(label, klabel)
                # 1 edit is a typo (netflixx). 2-3 edits only when the name was not simply extended by a real
                # word (amazonia, netflixstories), which are different businesses.
                if (dist == 1 or (sim >= 0.7 and not label.startswith(klabel))) and label[:2] == klabel[:2] \
                        and abs(len(label) - len(klabel)) <= 4:
                    return main, f"a close misspelling of {main}"
            if len(tokens) > 1 and any(t == klabel or (t.startswith(klabel) and t[len(klabel):] in _BRAND_WORDS) for t in tokens):
                return main, f"uses the brand name '{klabel}' with extra words ({main})"
            for w in _BRAND_WORDS:
                if label in (klabel + w, w + klabel):
                    return main, f"the brand name '{klabel}' joined with '{w}' ({main})"
    return None


# Endings brands genuinely use for regional / corporate sites. The same name under one of these is not, on its
# own, evidence of impersonation (amazon.de, icicibank.co.in, sbi.bank.in); under .xyz / .top / .click it is.
_COMMON_ENDINGS = {
    "com", "in", "co.in", "net", "org", "org.in", "net.in", "gov.in", "nic.in", "bank.in", "ac.in", "edu", "co", "io",
    "me", "app", "tv", "us", "eu", "uk", "co.uk", "ca", "au", "com.au", "de", "fr", "it", "es", "jp", "co.jp", "sg",
    "com.sg", "ae", "jobs", "bank", "sbi", "ltd", "company",
}


def has_login_path(url: str) -> bool:
    p = urlparse(url if "://" in url else "http://" + url)
    return bool(_LOGIN_PATH.search((p.path or "") + "?" + (p.query or "")))


def _is_ip(host: str) -> bool:
    try:
        ipaddress.ip_address(host)
        return True
    except ValueError:
        return False


def is_official(domain: str, known: list[KnownEntityRow]) -> bool:
    return any(domain in k.domains for k in known)


def risky_tld(host: str) -> str | None:
    return next((s for s in RISKY_SUFFIXES if host.endswith(s)), None)


# ---- orchestration ------------------------------------------------------------------------------
async def _guard(name: str, coro, checks: dict[str, str]):
    """Run one source; record whether it ran. Returns result or the sentinel `Ellipsis` on failure."""
    try:
        res = await coro
    except (SourceUnavailable, asyncio.TimeoutError, httpx.HTTPError, ValueError, OSError):
        checks[name] = "unavailable"
        return ...
    checks[name] = "skipped" if res is None else "ran"
    return res


async def check_urls(
    claims: Claims,
    known: list[KnownEntityRow],
    intel: UrlIntel,
    settings: Settings,
    timeout: float = 3.0,
) -> tuple[list[Evidence], list[CheckStatus]]:
    domains = claims.domains
    if not domains:
        return [], []
    evidence: list[Evidence] = []
    checks: dict[str, str] = {}
    urls = claims.urls or [f"http://{d}" for d in domains]

    # Local checks always run.
    for d in domains:
        if is_official(d, known):
            continue
        hit = lookalike_of(d, known)
        src = "Known broker domain list"
        if not hit:
            hit = brand_lookalike_of(d)
            src = "Known brand domain list"
        if hit:
            evidence.append(make("LOOKALIKE_DOMAIN", "high", f"{d} looks like {hit[0]}: {hit[1]}.", src))
            # a sign-in / verification page on a lookalike address is where passwords and OTPs get taken
            page = next((u for u in urls if (host_of(u) or "").endswith(d) and has_login_path(u)), None)
            if page:
                evidence.append(make(
                    "LOGIN_PAGE_ON_LOOKALIKE", "high",
                    f"The link on {d} points to a login or verification page.", "Link address pattern"))
    short = next((h for u in urls if (h := host_of(u) or "") in SHORTENERS or registrable_domain(u) in SHORTENERS), None)
    if short:
        evidence.append(make("SHORT_LINK", "medium",
                             f"{short} is a link shortener, so the real destination is hidden until you open it.",
                             "Local address list"))
    for u in urls:
        host = host_of(u) or ""
        sfx = risky_tld(host)
        if sfx:
            evidence.append(make("RISKY_TLD", "low",
                                 f"{host} uses '{sfx}', common among short-lived sites. Weak signal alone.",
                                 "Local address-type list"))
            break
    checks["lookalike_check"] = "ran"

    async def per_domain(d: str) -> list[Evidence]:
        local_checks: dict[str, str] = {}
        ev: list[Evidence] = []
        dom_urls = [u for u in urls if registrable_domain(u) == d] or [f"http://{d}"]

        async def with_timeout(c):
            return await asyncio.wait_for(c, timeout)

        r_op, r_uh, r_sb = await asyncio.gather(
            _guard("openphish", with_timeout(intel.openphish(dom_urls, d)), local_checks),
            _guard("urlhaus", with_timeout(intel.urlhaus(d, dom_urls)), local_checks),
            _guard("safe_browsing", with_timeout(intel.safe_browsing(dom_urls)), local_checks),
        )
        for name, res, label, src in (
            ("openphish", r_op, "OpenPhish feed", "OpenPhish public feed"),
            ("urlhaus", r_uh, "URLhaus (abuse.ch)", "abuse.ch URLhaus"),
            ("safe_browsing", r_sb, "Google Safe Browsing", "Google Safe Browsing (may be unsafe)"),
        ):
            if res is True:
                ev.append(make("PHISHING_FEED_HIT", "high",
                               f"{d} is listed by {label} as a reported phishing or malware address.", src))
            elif res is ...:
                ev.append(unavailable("PHISHING_FEED_HIT", f"{label} lookup", src))

        if not is_official(d, known) and not _is_ip(d) and not is_shared_host(d):
            age = await _guard("domain_age", with_timeout(intel.domain_age_days(d)), local_checks)
            if age == NOT_REGISTERED:
                ev.append(make(
                    "DOMAIN_NOT_REGISTERED", "low",
                    f"{d} has no registry record and does not resolve. It may be a page that was already taken "
                    f"down, or a mistyped address. That does not make the message that sent you here safe.",
                    "RDAP domain registry + DNS"))
            elif isinstance(age, int):
                if age < settings.domain_new_days:
                    ev.append(make("DOMAIN_NEW", "high", f"{d} was registered {age} day(s) ago.", "RDAP domain registry"))
                elif age < 90:
                    ev.append(make("DOMAIN_NEW", "medium", f"{d} was registered {age} days ago.", "RDAP domain registry"))
            elif age is ...:
                ev.append(unavailable("DOMAIN_NEW", "Domain age lookup", "RDAP domain registry"))
        for k, v in local_checks.items():
            # unavailable for any domain wins; otherwise ran beats skipped
            rank = {"skipped": 0, "ran": 1, "unavailable": 2}
            if k not in checks or rank[v] >= rank[checks[k]]:
                checks[k] = v
        return ev

    for evs in await asyncio.gather(*(per_domain(d) for d in domains[:3])):
        evidence.extend(evs)

    return evidence, [CheckStatus(name=k, status=v) for k, v in checks.items()]  # type: ignore[arg-type]
