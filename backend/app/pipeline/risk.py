"""Stage 6: weights -> score + band. The LLM never touches this module.

Each category counts once, at its worst severity, so five similar phrases cannot add up to a fake 100.
"""
from __future__ import annotations

from collections import defaultdict

from app.schemas import Band, CheckStatus, Coverage, Evidence

WEIGHTS = {"sebi": 25, "entity": 20, "returns": 15, "payment": 15,
           "domain": 10, "urgency": 10, "technical": 5}

CATEGORY = {
    "SEBI_NOT_FOUND": "sebi", "SEBI_NOT_ACTIVE": "sebi", "SEBI_CLAIM_NO_NUMBER": "sebi",
    "ENTITY_NAME_MISMATCH": "entity", "DOMAIN_NOT_OFFICIAL": "entity",
    "GUARANTEED_RETURN": "returns", "UNREALISTIC_RETURN": "returns",
    "UPI_NOT_VALIDATED_HANDLE": "payment", "OFF_PLATFORM_PAYMENT": "payment", "PAYEE_NOT_UPI_HANDLE": "payment",
    "QR_PAYEE_MISMATCH": "entity",
    "PHISHING_FEED_HIT": "domain", "DOMAIN_NEW": "domain", "DOMAIN_NOT_REGISTERED": "domain", "LOOKALIKE_DOMAIN": "domain",
    "RISKY_TLD": "domain", "SHORT_LINK": "domain",
    "URGENCY": "urgency",
    "REMOTE_ACCESS": "technical", "APK_DOWNLOAD": "technical",
    "LOGIN_PAGE_ON_LOOKALIKE": "technical", "OTP_REQUEST": "technical",
    "AUTHORITY_IMPERSONATION": "entity", "PRIZE_LOTTERY": "returns", "ACCOUNT_THREAT": "urgency",
    "ADVANCE_FEE": "payment", "PRETEXT_PAYMENT": "payment", "TASK_JOB": "returns",
}
SEVERITY = {"high": 1.0, "medium": 0.6, "low": 0.3}

# One signal is enough.
HARD_FLOOR = {"PHISHING_FEED_HIT": 85, "REMOTE_ACCESS": 70, "LOOKALIKE_DOMAIN": 62, "GUARANTEED_RETURN": 62, "PRETEXT_PAYMENT": 62, "ADVANCE_FEE": 62,
              "PAYEE_NOT_UPI_HANDLE": 45,
              "OTP_REQUEST": 65, "AUTHORITY_IMPERSONATION": 65, "PRIZE_LOTTERY": 62}

# Independent indicator families that rarely co-occur in genuine messages.
# Found by running the labelled fixtures (see tests/test_evaluation.py); change with the numbers in hand.
COMBO_FLOORS: list[tuple[frozenset[str], int]] = [
    (frozenset({"returns", "payment"}), 65),
    (frozenset({"returns", "sebi"}), 65),
    (frozenset({"sebi", "entity"}), 75),
    (frozenset({"entity", "payment"}), 70),
    (frozenset({"entity", "returns"}), 65),  # a real registration number under another name, plus a too-good return
    (frozenset({"returns", "domain"}), 65),
    (frozenset({"entity", "domain"}), 70),  # real registration number quoted on a site that is not theirs
    (frozenset({"domain", "payment"}), 65),
    (frozenset({"technical", "domain"}), 65),
    (frozenset({"payment", "urgency"}), 62),
    (frozenset({"urgency", "domain"}), 65),  # a threat plus a suspicious link
    (frozenset({"returns", "urgency"}), 55),  # a prize / easy-money lure plus pressure
]


def band(s: int) -> Band:
    return "LOW" if s <= 30 else "MEDIUM" if s <= 60 else "HIGH" if s <= 80 else "CRITICAL"


def score_and_weight(evidence: list[Evidence]) -> tuple[int, list[Evidence]]:
    """Return (score, evidence with per-item `weight` filled so weights sum to the score)."""
    worst: dict[str, tuple[float, int]] = {}  # category -> (severity factor, index of evidence)
    for i, e in enumerate(evidence):
        if e.status == "unavailable":
            continue
        cat = CATEGORY.get(e.code, "technical")
        s = SEVERITY[e.severity]
        if cat not in worst or s > worst[cat][0]:
            worst[cat] = (s, i)

    weights = [0] * len(evidence)
    total = 0.0
    for cat, (sev, idx) in worst.items():
        pts = WEIGHTS[cat] * sev
        weights[idx] = round(pts)
        total += pts

    floor, floor_idx = 0, []  # floor_idx: evidence indexes that triggered the floor
    for i, e in enumerate(evidence):
        f_here = HARD_FLOOR.get(e.code, 0)
        if e.code == "QR_PAYEE_MISMATCH" and e.severity == "high":
            f_here = 45  # a named brand that the QR does not pay; the weaker "name not in the image" case gets no floor
        if e.status == "ok" and f_here > floor:
            floor, floor_idx = f_here, [i]
    present = set(worst)
    for cats, f in COMBO_FLOORS:
        if cats <= present and f > floor:
            floor, floor_idx = f, [worst[c][1] for c in sorted(cats)]

    final = round(min(max(total, floor), 100))
    # Attribute whatever a floor added across the evidence that triggered it (in proportion to what each
    # already contributes), so the weights still add up to the score.
    gap = final - sum(weights)
    if gap > 0 and floor_idx:
        base = sum(weights[i] for i in floor_idx) or len(floor_idx)
        shares = [round(gap * (weights[i] or 1) / base) for i in floor_idx]
        shares[max(range(len(shares)), key=lambda k: weights[floor_idx[k]])] += gap - sum(shares)
        for i, add in zip(floor_idx, shares):
            weights[i] += add
    out = [e.model_copy(update={"weight": w}) for e, w in zip(evidence, weights)]
    return final, out


def score(evidence: list[Evidence]) -> int:
    return score_and_weight(evidence)[0]


def build_coverage(checks: list[CheckStatus]) -> Coverage:
    planned = [c for c in checks if c.status != "skipped"]
    ran = [c for c in planned if c.status == "ran"]
    return Coverage(planned=len(planned), ran=len(ran), checks=checks, limited=len(ran) < len(planned))


def summary_note(band_: Band, cov: Coverage) -> str:
    if band_ == "LOW":
        if cov.limited:
            return (f"Limited check: only {cov.ran} of {cov.planned} planned checks could run. "
                    "This is not reassurance; try again later.")
        return "No risk indicators found in the checks we ran. This does not mean it is safe."
    return "Risk indicators were found. Review the evidence below before acting."
