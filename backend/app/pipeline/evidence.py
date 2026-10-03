"""Signals/verification results -> ordered Evidence list.

Titles are deliberately hedged: we are making statements about named people and sites.
"""
from __future__ import annotations

from app.schemas import Evidence, Severity, Signal

TITLES: dict[str, str] = {
    "SEBI_NOT_FOUND": "SEBI registration could not be verified",
    "SEBI_NOT_ACTIVE": "SEBI registration does not appear to be active",
    "SEBI_CLAIM_NO_NUMBER": "Claims SEBI registration but gives no number",
    "ENTITY_NAME_MISMATCH": "Name does not match the registered holder of this number",
    "DOMAIN_NOT_OFFICIAL": "Website is not a known official domain of this registered entity",
    "GUARANTEED_RETURN": "Mentions guaranteed or risk-free returns",
    "UNREALISTIC_RETURN": "States a return that is unusually high",
    "UPI_NOT_VALIDATED_HANDLE": "Payment ID is not a SEBI validated handle",
    "OFF_PLATFORM_PAYMENT": "Asks for payment to a personal account or number",
    "PAYEE_NOT_UPI_HANDLE": "Payment ID is an email address, not a UPI ID",
    "QR_PAYEE_MISMATCH": "QR code pays a different name than the one shown",
    "PHISHING_FEED_HIT": "Link matches a reported phishing or malware page",
    "DOMAIN_NEW": "Website appears to be newly registered",
    "DOMAIN_NOT_REGISTERED": "Website address does not currently exist",
    "LOOKALIKE_DOMAIN": "Website name closely resembles a well-known brand or broker",
    "SHORT_LINK": "Link is shortened, so the real destination is hidden",
    "RISKY_TLD": "Website uses an address type often seen in throwaway sites",
    "URGENCY": "Uses urgency or pressure wording",
    "LOGIN_PAGE_ON_LOOKALIKE": "Link leads to a login or verification page on a lookalike address",
    "OTP_REQUEST": "Asks you to share an OTP, PIN or card code",
    "AUTHORITY_IMPERSONATION": "Invokes police, customs or another authority to pressure you",
    "PRIZE_LOTTERY": "Says you have won a prize or lottery",
    "ACCOUNT_THREAT": "Threatens to block or cut off an account, SIM or service",
    "ADVANCE_FEE": "Asks for a fee up front before something is released",
    "PRETEXT_PAYMENT": "Asks you to send money on a made-up reason",
    "TASK_JOB": "Offers money for simple online tasks or a part-time job",
    "REMOTE_ACCESS": "Asks to install a remote-access tool",
    "APK_DOWNLOAD": "Asks to install an app outside the official app stores",
}

DEFAULT_SEVERITY: dict[str, Severity] = {
    "GUARANTEED_RETURN": "high",
    "UNREALISTIC_RETURN": "high",
    "OFF_PLATFORM_PAYMENT": "high",
    "REMOTE_ACCESS": "high",
    "APK_DOWNLOAD": "medium",
    "URGENCY": "medium",
    "OTP_REQUEST": "high",
    "AUTHORITY_IMPERSONATION": "high",
    "PRIZE_LOTTERY": "high",
    "ACCOUNT_THREAT": "medium",
    "ADVANCE_FEE": "high",
    "PRETEXT_PAYMENT": "high",
    "TASK_JOB": "medium",
}

SIGNAL_DETAIL = {
    "GUARANTEED_RETURN": 'Message contains the phrase "{m}".',
    "UNREALISTIC_RETURN": "Message states a return of {m}, far above what regulated products typically offer.",
    "OFF_PLATFORM_PAYMENT": 'Message contains the phrase "{m}".',
    "REMOTE_ACCESS": 'Message mentions "{m}".',
    "APK_DOWNLOAD": 'Message mentions "{m}".',
    "URGENCY": 'Message contains the phrase "{m}".',
    "OTP_REQUEST": 'Message contains the phrase "{m}". Banks and genuine companies never ask for these.',
    "AUTHORITY_IMPERSONATION": 'Message contains the phrase "{m}".',
    "PRIZE_LOTTERY": 'Message contains the phrase "{m}".',
    "ACCOUNT_THREAT": 'Message contains the phrase "{m}".',
    "ADVANCE_FEE": 'Message contains the phrase "{m}".',
    "PRETEXT_PAYMENT": 'Message contains the phrase "{m}".',
    "TASK_JOB": 'Message contains the phrase "{m}".',
}

SIGNAL_SOURCE = "Message text analysis"


def make(
    code: str,
    severity: Severity,
    detail: str,
    source: str,
    *,
    status: str = "ok",
    title: str | None = None,
) -> Evidence:
    return Evidence(
        code=code,
        severity=severity,
        title=title or TITLES[code],
        detail=detail,
        source=source,
        status=status,  # type: ignore[arg-type]
    )


def unavailable(code: str, what: str, source: str) -> Evidence:
    """Placeholder for a check that could not run. Never contributes to the score."""
    return make(
        code, "low", f"{what} could not be completed, so this check was not applied.", source,
        status="unavailable", title=f"{what} unavailable",
    )


def from_signals(signals: list[Signal]) -> list[Evidence]:
    seen: set[str] = set()
    out: list[Evidence] = []
    for s in signals:
        if s.code in seen:  # one evidence item per code; first match is shown
            continue
        seen.add(s.code)
        out.append(
            make(
                s.code,
                DEFAULT_SEVERITY[s.code],
                SIGNAL_DETAIL[s.code].format(m=s.matched_text.strip()),
                SIGNAL_SOURCE,
            )
        )
    return out


_SEV_ORDER = {"high": 0, "medium": 1, "low": 2}


def order(evidence: list[Evidence]) -> list[Evidence]:
    """Highest weight first; unavailable items last."""
    return sorted(
        evidence,
        key=lambda e: (e.status == "unavailable", -e.weight, _SEV_ORDER[e.severity], e.code),
    )
