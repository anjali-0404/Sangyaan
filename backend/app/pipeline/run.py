"""Orchestrates the fixed pipeline: extract -> verify -> detect -> score -> explain.

The LLM is used for extraction and wording only. The score is computed in code from evidence.
"""
from __future__ import annotations

import asyncio
import logging

from app import llm
from app.cache import TTLCache
from app.config import Settings
from app.pipeline import evidence as ev_mod
from app.pipeline import explain as explain_mod
from app.pipeline import risk
from app.pipeline.detect import detect
from app.pipeline.extract import extract_regex, merge_llm
from app.pipeline.verify import Registry
from app.pipeline.verify.sebi import verify_sebi
from app.pipeline.verify.upi import verify_upi
from app.pipeline.verify.payment import verify_payment
from app.pipeline.verify.url_intel import UrlIntel, check_urls
from app.schemas import (
    AnalyzeResponse,
    Band,
    CheckStatus,
    Claims,
    Evidence,
    PageCheckResponse,
)

log = logging.getLogger(__name__)

_page_cache: TTLCache | None = None


def _cache(settings: Settings) -> TTLCache:
    global _page_cache
    if _page_cache is None:
        _page_cache = TTLCache(settings.page_cache_ttl)
    return _page_cache


def reset_caches() -> None:
    global _page_cache
    _page_cache = None


async def verify_all(
    claims: Claims,
    registry: Registry,
    intel: UrlIntel,
    settings: Settings,
    timeout: float,
) -> tuple[list[Evidence], list[CheckStatus]]:
    """Stages 3 and 4 in parallel, each with its own timeout; a failure becomes an unavailable item."""
    known = registry.known_entities()  # load once, before threads touch the session

    async def stage3() -> tuple[list[Evidence], list[CheckStatus]]:
        checks: list[CheckStatus] = []
        evs = await asyncio.wait_for(asyncio.to_thread(verify_sebi, claims, registry), timeout)
        if claims.sebi_numbers or claims.mentions_sebi:
            ran = not any(e.status == "unavailable" for e in evs)
            checks.append(CheckStatus(name="sebi_registry", status="ran" if ran else "unavailable"))
        upi = verify_upi(claims, settings.validated_upi_handle_pattern,
                         {h for k in known for h in k.upi_handles})
        if claims.upi_ids and (claims.investment_context or claims.mentions_sebi or claims.return_claims):
            checks.append(CheckStatus(name="upi_handle_rule", status="ran"))
        return evs + upi, checks

    async def stage4() -> tuple[list[Evidence], list[CheckStatus]]:
        return await check_urls(claims, known, intel, settings, timeout=timeout)

    r3, r4 = await asyncio.gather(
        _safe(stage3(), "sebi_registry", "SEBI registry check", "SEBI_NOT_FOUND", claims.sebi_numbers or claims.mentions_sebi),
        _safe(stage4(), "url_checks", "URL reputation checks", "PHISHING_FEED_HIT", bool(claims.domains)),
    )
    return r3[0] + r4[0], r3[1] + r4[1]


async def _safe(coro, name: str, what: str, code: str, planned) -> tuple[list[Evidence], list[CheckStatus]]:
    try:
        return await coro
    except Exception as e:  # noqa: BLE001 - any stage failure must become a partial result
        log.warning("stage %s failed: %s", name, type(e).__name__)
        if not planned:
            return [], []
        return [ev_mod.unavailable(code, what, name)], [CheckStatus(name=name, status="unavailable")]


def _finish(evidence: list[Evidence], checks: list[CheckStatus]):
    s, weighted = risk.score_and_weight(evidence)
    ordered = ev_mod.order(weighted)
    b: Band = risk.band(s)
    cov = risk.build_coverage(checks)
    return s, b, ordered, cov


async def analyze_text(
    text: str,
    *,
    source_url: str | None,
    registry: Registry,
    intel: UrlIntel,
    settings: Settings,
    use_llm: bool,
    pre_checks: list[CheckStatus] | None = None,
    pre_evidence: list[Evidence] | None = None,
) -> AnalyzeResponse:
    claims = extract_regex(text, source_url)
    if use_llm and llm.enabled():
        try:
            ext = await asyncio.wait_for(llm.extract_claims(text), settings.llm_timeout)
        except Exception:  # noqa: BLE001
            ext = None
        if ext:
            names = [*ext.names, *([ext.company] if ext.company else [])]
            claims = merge_llm(claims, names, ext.claims_sebi_registered, ext.promises_returns)

    verification, checks = await verify_all(claims, registry, intel, settings, settings.stage_timeout)
    verification = [*verification, *verify_payment(text)]
    signals = detect(text, claims)
    checks.append(CheckStatus(name="language_signals", status="ran"))
    checks = [*(pre_checks or []), *checks]
    evidence = [*(pre_evidence or []), *verification, *ev_mod.from_signals(signals)]

    s, b, ordered, cov = _finish(evidence, checks)
    explanation = await explain_mod.explain(ordered, b, use_llm=use_llm and llm.enabled(), timeout=settings.llm_timeout)
    action, action_hi = explain_mod.safe_action(b, [e.code for e in ordered])
    snap = registry.snapshot_date()
    return AnalyzeResponse(
        scan_id="",  # assigned by the API layer when persisted
        score=s,
        band=b,
        claims=claims,
        evidence=ordered,
        explanation=explanation,
        safe_action=action,
        safe_action_hi=action_hi,
        summary_note=risk.summary_note(b, cov),
        coverage=cov,
        data_freshness={"sebi_snapshot": snap.isoformat() if snap else None},
    )


async def page_check(
    url: str,
    text: str | None,
    *,
    registry: Registry,
    intel: UrlIntel,
    settings: Settings,
) -> PageCheckResponse:
    """Extension path: regex + registry + URL checks only. No OCR, ASR or LLM. Domain checks cached."""
    claims = extract_regex(text or "", url)
    domain = claims.domains[0] if claims.domains else None

    # Cache only the slow, text-independent part (URL intel) per domain.
    cache = _cache(settings)
    cached = cache.get(domain) if domain else None
    url_ev: list[Evidence] = []
    url_checks: list[CheckStatus] = []
    if cached is not None:
        url_ev, url_checks = cached
    elif claims.domains:
        known = registry.known_entities()
        try:
            url_ev, url_checks = await check_urls(claims.model_copy(update={"domains": claims.domains[:1]}),
                                                   known, intel, settings, timeout=settings.page_check_timeout)
        except Exception:  # noqa: BLE001
            url_ev = [ev_mod.unavailable("PHISHING_FEED_HIT", "URL reputation checks", "url_checks")]
            url_checks = [CheckStatus(name="url_checks", status="unavailable")]
        if not any(c.status == "unavailable" for c in url_checks) and domain:
            cache.set(domain, (url_ev, url_checks))  # never cache a degraded answer

    sebi_ev = await asyncio.to_thread(verify_sebi, claims, registry)
    checks = list(url_checks)
    if claims.sebi_numbers or claims.mentions_sebi:
        ok = not any(e.status == "unavailable" for e in sebi_ev)
        checks.append(CheckStatus(name="sebi_registry", status="ran" if ok else "unavailable"))
    upi_ev = verify_upi(claims, settings.validated_upi_handle_pattern)
    signals = detect(text or "", claims)
    checks.append(CheckStatus(name="language_signals", status="ran"))

    s, b, ordered, cov = _finish(url_ev + sebi_ev + upi_ev + ev_mod.from_signals(signals), checks)
    action, _ = explain_mod.safe_action(b)
    return PageCheckResponse(
        domain=domain, score=s, band=b, evidence=ordered[:5], safe_action=action,
        summary_note=risk.summary_note(b, cov), coverage=cov, cached=cached is not None,
    )
