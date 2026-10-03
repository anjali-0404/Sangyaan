from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Severity = Literal["high", "medium", "low"]
Band = Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
InputType = Literal["text", "image", "url", "audio"]
Client = Literal["web", "pwa", "extension"]

DISCLAIMER = "This score shows observed risk indicators, not proof of fraud."


class ReturnClaim(BaseModel):
    pct: float
    period: str | None = None  # day | week | month | year | None (unstated)


class Claims(BaseModel):
    sebi_numbers: list[str] = []
    names: list[str] = []
    upi_ids: list[str] = []
    phones: list[str] = []
    domains: list[str] = []
    return_claims: list[ReturnClaim] = []
    # Internal flags; not part of the public contract.
    mentions_sebi: bool = Field(default=False, exclude=True)
    promises_returns: bool = Field(default=False, exclude=True)
    investment_context: bool = Field(default=False, exclude=True)
    urls: list[str] = Field(default=[], exclude=True)


class Signal(BaseModel):
    code: str
    matched_text: str


class Evidence(BaseModel):
    code: str  # stable, e.g. SEBI_NOT_FOUND
    severity: Severity
    title: str  # short, hedged wording shown to the user
    detail: str  # what was compared, with values
    source: str  # "SEBI registry snapshot (2026-10-01)"
    weight: int = 0  # points it contributed to the score
    status: Literal["ok", "unavailable"] = "ok"


class Explanation(BaseModel):
    en: str
    hi: str


class CheckStatus(BaseModel):
    name: str
    status: Literal["ran", "unavailable", "skipped"]


class Coverage(BaseModel):
    planned: int
    ran: int
    checks: list[CheckStatus]
    limited: bool


class AnalyzeRequest(BaseModel):
    input_type: InputType = "text"
    text: str | None = Field(default=None, max_length=20000)
    url: str | None = Field(default=None, max_length=2048)
    lang: Literal["en", "hi"] = "en"
    client: Client = "web"


class AnalyzeResponse(BaseModel):
    scan_id: str
    score: int
    band: Band
    claims: Claims
    evidence: list[Evidence]
    explanation: Explanation
    safe_action: str
    safe_action_hi: str
    summary_note: str
    coverage: Coverage
    data_freshness: dict[str, str | None]
    disclaimer: str = DISCLAIMER


class PageCheckRequest(BaseModel):
    url: str = Field(max_length=2048)
    # Visible text that matched investment context. Never form fields, cookies, OTPs.
    text: str | None = Field(default=None, max_length=5000)
    lang: Literal["en", "hi"] = "en"


class PageCheckResponse(BaseModel):
    domain: str | None
    score: int
    band: Band
    evidence: list[Evidence]
    safe_action: str
    summary_note: str
    coverage: Coverage
    cached: bool = False
    disclaimer: str = DISCLAIMER


class ReportRequest(BaseModel):
    scan_id: str
    verdict: Literal["confirm", "dispute"]
    # Raw content is stored ONLY when the user explicitly consents (UI shows a notice).
    consent_store_raw: bool = False
    raw_text: str | None = Field(default=None, max_length=20000)
    note: str | None = Field(default=None, max_length=1000)


class ReportResponse(BaseModel):
    report_id: int
    stored_raw: bool
    message: str = "Thanks. Reports do not change any score."


class SpeakRequest(BaseModel):
    text: str = Field(max_length=1500)
    lang: Literal["en", "hi"] = "hi"


class TranscribeResponse(BaseModel):
    transcript: str
    language: str | None = None
