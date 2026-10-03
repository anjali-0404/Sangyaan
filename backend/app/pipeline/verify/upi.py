"""UPI handle rule.

Since October 2025 SEBI-registered intermediaries must collect investor payments on a validated UPI handle
(ending in @valid...). A personal-looking VPA in an investment context is therefore an indicator.

TODO(before demo): confirm the exact handle format against the SEBI circular; it is configurable via
`validated_upi_handle_pattern`. Wording must stay "not a SEBI validated handle", never "fraud".
"""
from __future__ import annotations

import re

from app.pipeline.evidence import make
from app.schemas import Claims, Evidence

SOURCE = "Local UPI handle rule (SEBI validated handle circular)"


def verify_upi(claims: Claims, pattern: str, official_handles: set[str] | None = None) -> list[Evidence]:
    if not claims.upi_ids:
        return []
    # Only meaningful when the message is about investing; shop/utility payments are out of scope.
    if not (claims.investment_context or claims.mentions_sebi or claims.return_claims):
        return []
    rx = re.compile(pattern, re.I)
    official = {h.lower() for h in (official_handles or set())}
    bad = [v for v in claims.upi_ids
           if not rx.match(v) and v.split("@", 1)[1] not in official and v not in official]
    if not bad:
        return []
    return [make(
        "UPI_NOT_VALIDATED_HANDLE", "medium",
        f"Payment is requested to {', '.join(bad)}, which is not a SEBI validated handle (@valid).", SOURCE,
    )]
