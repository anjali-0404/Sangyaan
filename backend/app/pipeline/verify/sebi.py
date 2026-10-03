"""Stage 3: registry lookup plus claim consistency.

A lookup answers "does INA000012345 exist". Consistency answers "does it belong to the person or site
making the claim", which catches scammers who quote a real number.
"""
from __future__ import annotations

from datetime import date

from rapidfuzz import fuzz

from app.pipeline.evidence import make, unavailable
from app.pipeline.normalize import norm_name
from app.pipeline.verify import Registry
from app.schemas import Claims, Evidence

NAME_MATCH_THRESHOLD = 70
ACTIVE_STATUSES = {"active", "valid", "live", "registered"}


def verify_sebi(claims: Claims, registry: Registry, today: date | None = None) -> list[Evidence]:
    if not claims.sebi_numbers and not claims.mentions_sebi:
        return []

    snap = registry.snapshot_date()
    source = f"SEBI registry snapshot ({snap})" if snap else "SEBI registry snapshot"
    if snap is None:  # no data loaded: say so rather than call every number fake
        return [unavailable("SEBI_NOT_FOUND", "SEBI registry check", source)]

    today = today or date.today()
    out: list[Evidence] = []
    for reg in claims.sebi_numbers:
        row = registry.get_by_reg_no(reg)
        if row is None:
            out.append(make(
                "SEBI_NOT_FOUND", "high",
                f"No intermediary with {reg} in our registry snapshot (dated {snap}).", source,
            ))
            continue

        status = (row.status or "").strip().lower()
        if status and status not in ACTIVE_STATUSES:
            out.append(make(
                "SEBI_NOT_ACTIVE", "high",
                f"{reg} is listed as '{row.status}' in the registry snapshot (dated {snap}).", source,
            ))
        elif row.valid_till and row.valid_till < today:
            out.append(make(
                "SEBI_NOT_ACTIVE", "high",
                f"{reg} was valid until {row.valid_till}, per the registry snapshot (dated {snap}).", source,
            ))

        # Consistency: the claimed identity should resemble the registered holder.
        # Flag only when NO claimed name matches, so one stray name does not trigger a false alarm.
        if claims.names:
            best = max(fuzz.token_set_ratio(norm_name(n), row.name_norm) for n in claims.names)
            if best < NAME_MATCH_THRESHOLD:
                out.append(make(
                    "ENTITY_NAME_MISMATCH", "high",
                    f"Message names {', '.join(claims.names)}; {reg} is registered to {row.name}.", source,
                ))

        known = registry.known_entity_by_sebi(reg)  # official domains we maintain
        if known and known.domains:
            for dom in claims.domains:
                if dom not in known.domains:
                    out.append(make(
                        "DOMAIN_NOT_OFFICIAL", "high",
                        f"{dom} is not among the official domains we hold for {known.name} "
                        f"({', '.join(known.domains)}).", source,
                    ))

    if not claims.sebi_numbers and claims.mentions_sebi:  # says "SEBI registered", gives no number
        out.append(make(
            "SEBI_CLAIM_NO_NUMBER", "medium",
            "The message says it is SEBI registered but does not give a registration number.", source,
        ))
    return out
