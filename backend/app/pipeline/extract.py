"""Stage 2: claim extraction. Regex first (free, instant, testable); the LLM only adds what regex cannot."""
from __future__ import annotations

import re
import unicodedata

from app.pipeline.normalize import (
    norm_phone,
    norm_sebi,
    norm_vpa,
    registrable_domain,
)
from app.schemas import Claims, ReturnClaim

SEBI_NO = re.compile(r"\b(IN[AHZ]|INP|INM|INB)\s?-?\s?(\d{6,10})\b", re.I)
# Handle must not be followed by ".tld": that would be an email address.
UPI_ID = re.compile(r"\b[a-z0-9._-]{2,}@[a-z]{2,}\b(?!\.[a-z])", re.I)
PHONE = re.compile(r"(?<![\w@.])(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b")
URL = re.compile(
    r"https?://[^\s]+|\b[a-z0-9-]+\.(?:com|co\.in|in|net|org|app|io|xyz|top|site|online|club|vip|info|biz|ly|gd|cc|link|click|live|shop|store|icu|cfd|buzz|rest|work|support)\b[^\s]*",
    re.I,
)
RETURN = re.compile(
    r"(\d{1,3}(?:\.\d+)?)\s?%\s*(?:\w+\s){0,3}?"
    r"(daily|weekly|monthly|per month|a month|yearly|annual|returns?|per day|a day|"
    r"प्रति\s?माह|महीने|मासिक|रोज़?|हर\s?महीने)",
    re.I,
)
RETURN_PRE = re.compile(
    r"(?<!\w)(daily|weekly|monthly|yearly|रोज़?|मासिक|हर\s?महीने)\s+(?:\w+\s){0,2}?(\d{1,3}(?:\.\d+)?)\s?%", re.I)
SEBI_CLAIM = re.compile(
    r"sebi[\s-]*(?:registered|regd|approved|certified|authori[sz]ed|licen[cs]ed)"
    r"|registered\s+(?:with\s+)?sebi|sebi\s+(?:reg|registration|license|licence)"
    r"|सेबी\s*(?:पंजीकृत|रजिस्टर्ड|रजिस्टर)",
    re.I,
)
INVEST_WORDS = re.compile(
    r"invest|stock|share market|trading|trader|demat|ipo|nifty|sensex|mutual fund|portfolio|"
    r"crypto|forex|intraday|banknifty|returns?\b|profit|sebi|advis|निवेश|शेयर|ट्रेडिंग|मुनाफा|मुनाफ़ा|रिटर्न|सेबी",
    re.I,
)

MAIL_DOMAINS = {
    "gmail", "yahoo", "outlook", "hotmail", "rediffmail", "icloud", "proton",
    "protonmail", "live", "ymail", "aol",
}

_PERIOD = {
    "daily": "day", "per day": "day", "a day": "day", "रोज": "day", "रोज़": "day",
    "weekly": "week",
    "monthly": "month", "per month": "month", "a month": "month", "मासिक": "month",
    "महीने": "month", "हर महीने": "month", "हरमहीने": "month", "प्रति माह": "month", "प्रतिमाह": "month",
    "yearly": "year", "annual": "year",
}

_NAME_AFTER_INTRO = re.compile(
    r"(?:\bI am|\bI'm|\bThis is|\bMy name is|\bMr\.?|\bMrs\.?|\bMs\.?|\bDr\.?|\bShri|\bSmt\.?)\s+"
    r"([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})"
)
_COMPANY = re.compile(
    r"((?:[A-Z][\w&]+\s){1,4}(?:Pvt\.?\s?Ltd\.?|Private Limited|Limited|Ltd\.?|Securities|Capital|Advisors|Advisory|Wealth))"
)
_NAME_STOP = {
    "sebi", "registered", "research", "analyst", "join", "our", "the", "your", "this", "team",
    "group", "whatsapp", "telegram", "invest", "investment", "dear", "customer", "sir", "madam",
    "market", "stock", "trading", "india", "indian", "bank", "hello", "hi", "from", "with", "at",
    "just", "here", "calling", "now", "please", "alert", "update",
}


_PERIOD = {unicodedata.normalize("NFKC", k): v for k, v in _PERIOD.items()}


def _period(raw: str) -> str | None:
    key = re.sub(r"\s+", " ", unicodedata.normalize("NFKC", raw).lower().strip())
    return _PERIOD.get(key) or _PERIOD.get(key.replace(" ", ""))


def _clean_url(u: str) -> str:
    return u.rstrip(".,;:!?)]}>\"'")


def _plausible_name(n: str) -> bool:
    toks = [t.lower().strip(".") for t in n.split()]
    return bool(toks) and not any(t in _NAME_STOP for t in toks) and len(n) >= 4


def extract_regex(text: str, source_url: str | None = None) -> Claims:
    """Pure function: text (+ optional original URL) -> Claims. No network."""
    sebi = []
    for m in SEBI_NO.finditer(text):
        reg = norm_sebi(m.group(1) + m.group(2))
        if reg not in sebi:
            sebi.append(reg)
    scrubbed = SEBI_NO.sub(" ", text)

    upis: list[str] = []
    for m in UPI_ID.finditer(scrubbed):
        vpa = norm_vpa(m.group(0))
        handle = vpa.split("@", 1)[1]
        if handle in MAIL_DOMAINS or vpa in upis:
            continue
        upis.append(vpa)
    # Remove UPI ids so a numeric VPA (9876543210@paytm) is not double counted as a phone.
    scrubbed = UPI_ID.sub(" ", scrubbed)

    phones: list[str] = []
    for m in PHONE.finditer(scrubbed):
        p = norm_phone(m.group(0))
        if len(p) == 10 and p not in phones:
            phones.append(p)

    urls: list[str] = []
    domains: list[str] = []
    candidates = [source_url] if source_url else []
    for m in URL.finditer(scrubbed):
        start = m.start()
        if start > 0 and scrubbed[start - 1] in "@.":  # inside an email / subdomain remnant
            continue
        candidates.append(_clean_url(m.group(0)))
    for u in candidates:
        if not u:
            continue
        dom = registrable_domain(u)
        if not dom:
            continue
        if dom.split(".")[0] in MAIL_DOMAINS:
            continue
        if u not in urls:
            urls.append(u)
        if dom not in domains:
            domains.append(dom)

    returns: list[ReturnClaim] = []
    for m in RETURN.finditer(text):
        pct = float(m.group(1))
        period = _period(m.group(2))
        rc = ReturnClaim(pct=int(pct) if pct.is_integer() else pct, period=period)
        if rc not in returns:
            returns.append(rc)

    for m in RETURN_PRE.finditer(text):
        pct = float(m.group(2))
        rc = ReturnClaim(pct=int(pct) if pct.is_integer() else pct, period=_period(m.group(1)))
        if rc not in returns:
            returns.append(rc)

    names: list[str] = []
    for rx in (_NAME_AFTER_INTRO, _COMPANY):
        for m in rx.finditer(text):
            n = m.group(1).strip()
            if _plausible_name(n) and n not in names:
                names.append(n)

    return Claims(
        sebi_numbers=sebi,
        names=names,
        upi_ids=upis,
        phones=phones,
        domains=domains,
        return_claims=returns,
        mentions_sebi=bool(SEBI_CLAIM.search(text)),
        promises_returns=bool(returns),
        investment_context=bool(INVEST_WORDS.search(text)),
        urls=urls,
    )


def merge_llm(claims: Claims, names: list[str], mentions_sebi: bool, promises_returns: bool) -> Claims:
    """Fold LLM-found facts into regex claims. The LLM can add names/flags, never remove anything."""
    merged = list(claims.names)
    for n in names:
        n = n.strip()
        if n and n.lower() not in {x.lower() for x in merged}:
            merged.append(n)
    return claims.model_copy(
        update={
            "names": merged,
            "mentions_sebi": claims.mentions_sebi or mentions_sebi,
            "promises_returns": claims.promises_returns or promises_returns,
        }
    )
