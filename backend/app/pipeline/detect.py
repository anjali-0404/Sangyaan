"""Stage 5: rule-based language signals. Pure functions, no network."""
from __future__ import annotations

import re
from functools import lru_cache

import yaml

from app.config import DATA_DIR, get_settings
from app.schemas import Claims, Signal

# pattern-list name -> evidence code
LIST_TO_CODE = {
    "guaranteed_return": "GUARANTEED_RETURN",
    "urgency": "URGENCY",
    "off_platform_payment": "OFF_PLATFORM_PAYMENT",
    "remote_access": "REMOTE_ACCESS",
    "apk_download": "APK_DOWNLOAD",
    "otp_request": "OTP_REQUEST",
    "authority_impersonation": "AUTHORITY_IMPERSONATION",
    "prize_lottery": "PRIZE_LOTTERY",
    "account_threat": "ACCOUNT_THREAT",
    "advance_fee": "ADVANCE_FEE",
    "task_job": "TASK_JOB",
    "pretext_payment": "PRETEXT_PAYMENT",
}

# "returns are NOT guaranteed", "no guaranteed return", "रिटर्न की गारंटी नहीं": a negation near the
# phrase means the message is warning about it, not making the claim.
_NEG_BEFORE = re.compile(r"(?:\bnot\b|\bno\b|\bnever\b|\bwithout\b|\bnahi\b|\bnahin\b|n't|नहीं)\W*(?:\w+\W+){0,5}$", re.I)
_NEG_AFTER = re.compile(r"^\W*(?:\w+\W+){0,2}?(?:\bnot\b|\bnahi\b|\bnahin\b|नहीं|n't)", re.I)

# Warnings *about* scams ("Beware of scammers posing as CBI officers...") quote the same phrases.
_AWARENESS = re.compile(
    r"\b(beware|be aware|be careful of|scammers?|fraudsters?|stay alert|stay safe|cyber ?awareness|public notice|"
    r"do not fall for|never (?:share|ask|click)|will never ask|does not ask|do(?:es)? not ask|"
    r"news|arrested|racket|gang|duped|busted|convicted|accused|court|reported by|according to)\b", re.I)
_GENERAL_CODES = {"OTP_REQUEST", "AUTHORITY_IMPERSONATION", "PRIZE_LOTTERY", "ACCOUNT_THREAT", "ADVANCE_FEE", "TASK_JOB", "PRETEXT_PAYMENT"}
# Delivery apps genuinely ask you to read an OTP to the rider at the door.
_FEE_LURE = re.compile(r"(loan|approved|release|receive|claim|prize|gift|parcel|customs|refund|winner|lottery|reward|voucher|"
                       r"job|selected|won\b|activation|unlock|first|before|तुरंत|पहले|लोन|इनाम|लॉटरी|जीते)", re.I)
_FEE_ORDINARY = re.compile(r"(counter|branch|office|portal|appointment|has been received|have received|payable at|college|school|"
                           r"university|on the day|vfs)", re.I)
_DELIVERY = re.compile(r"\b(deliver\w*|rider|courier|handed over|at the door|pickup|pick-up)\b", re.I)

PERIOD_TO_MONTH = {"day": 30.0, "week": 4.0, "month": 1.0, "year": 1 / 12}


@lru_cache
def load_patterns() -> dict[str, list[str]]:
    with open(DATA_DIR / "scam_patterns.yaml", encoding="utf-8") as f:
        raw = yaml.safe_load(f)
    return {k: [p.lower() for p in v] for k, v in raw.items()}


def _negated(text: str, start: int, end: int, *, look_after: bool = True) -> bool:
    # A negation only counts inside the same clause: "no documents! Pay a fee" / "if not you, install AnyDesk".
    before = re.split(r"[.!?;,:\n]", text[max(0, start - 40):start])[-1]
    after = re.split(r"[.!?;,:\n]", text[end:end + 30])[0]
    return bool(_NEG_BEFORE.search(before) or (look_after and _NEG_AFTER.search(after)))


def monthly_pct(pct: float, period: str | None) -> float | None:
    if period is None:
        return None
    return pct * PERIOD_TO_MONTH[period]


def detect(text: str, claims: Claims) -> list[Signal]:
    low = text.lower()
    settings = get_settings()
    out: list[Signal] = []
    aware = bool(_AWARENESS.search(text))
    for list_name, code in LIST_TO_CODE.items():
        for phrase in load_patterns().get(list_name, []):
            idx = low.find(phrase)
            while idx != -1:
                end = idx + len(phrase)
                # A nearby negation ("never install AnyDesk", "returns are not guaranteed") flips the meaning.
                # "...digital arrest, do not hang up" is the scam talking, so for the general-scam codes only a negation
                # BEFORE the phrase ("never share your OTP") counts.
                if code not in ("URGENCY", "ACCOUNT_THREAT") and _negated(low, idx, end, look_after=code not in _GENERAL_CODES):
                    idx = low.find(phrase, end)
                    continue
                if code in _GENERAL_CODES and aware:
                    break  # a warning about scams, not a scam
                if code == "ADVANCE_FEE":
                    near = low[max(0, idx - 100):end + 100]
                    if not _FEE_LURE.search(near) or _FEE_ORDINARY.search(near):
                        break
                if code == "OTP_REQUEST" and _DELIVERY.search(text[max(0, idx - 120):end + 120]):
                    break
                out.append(Signal(code=code, matched_text=text[idx:end]))
                break  # one hit per phrase is enough

    # Generic rule: a stated return above the threshold fires even with no keyword.
    for rc in claims.return_claims:
        m = monthly_pct(rc.pct, rc.period)
        if m is not None and m > settings.unrealistic_monthly_return_pct:
            out.append(Signal(code="UNREALISTIC_RETURN", matched_text=f"{rc.pct:g}% per {rc.period}"))
        elif m is None and rc.pct >= 50:
            out.append(Signal(code="UNREALISTIC_RETURN", matched_text=f"{rc.pct:g}% returns"))
    return out
