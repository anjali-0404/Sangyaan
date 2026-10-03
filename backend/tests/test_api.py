from datetime import date

import pytest
from fastapi.testclient import TestClient

from app import db
from app.config import DATA_DIR, get_settings
from app.data.sebi_snapshot import load_known_entities, load_snapshot
from app.main import app
from tests.helpers import FakeIntel


@pytest.fixture
def client():
    with TestClient(app) as c:
        with db.session_factory()() as s:
            load_snapshot(s, DATA_DIR / "sample" / "sebi_sample.csv", date(2026, 10, 1))
            load_known_entities(s, DATA_DIR / "sample" / "known_entities.yaml")
        app.state.intel = FakeIntel(get_settings())
        yield c


SCAM = "Join our SEBI registered group INA000012345, 40% monthly returns, pay to rahul@okaxis"


def test_healthz_reports_snapshot(client):
    r = client.get("/healthz")
    assert r.status_code == 200 and r.json()["sebi_snapshot"] == "2026-10-01"


def test_analyze_contract_shape(client):
    r = client.post("/v1/analyze", json={"input_type": "text", "text": SCAM, "lang": "hi", "client": "web"})
    assert r.status_code == 200, r.text
    j = r.json()
    assert {"scan_id", "score", "band", "claims", "evidence", "explanation", "safe_action",
            "data_freshness", "disclaimer"} <= set(j)
    assert j["band"] in ("HIGH", "CRITICAL")
    assert j["claims"]["sebi_numbers"] == ["INA000012345"]
    assert "mentions_sebi" not in j["claims"]  # internal flags stay internal
    assert j["data_freshness"]["sebi_snapshot"] == "2026-10-01"
    assert j["explanation"]["en"] and j["explanation"]["hi"]  # template fallback with no LLM configured
    codes = [e["code"] for e in j["evidence"]]
    assert "SEBI_NOT_FOUND" in codes
    weights = [e["weight"] for e in j["evidence"]]
    assert weights == sorted(weights, reverse=True)
    assert j["score"] == sum(weights)
    assert all(e["source"] and e["code"] for e in j["evidence"])


def test_get_scan_roundtrip_and_404(client):
    j = client.post("/v1/analyze", json={"input_type": "text", "text": SCAM}).json()
    assert client.get(f"/v1/scan/{j['scan_id']}").json()["score"] == j["score"]
    assert client.get("/v1/scan/nope").status_code == 404


def test_raw_text_not_stored(client):
    client.post("/v1/analyze", json={"input_type": "text", "text": SCAM})
    from sqlalchemy import select
    from app.models import Scan
    with db.session_factory()() as s:
        row = s.scalars(select(Scan)).first()
        assert SCAM not in str(row.result_json) and len(row.text_hash) == 64


def test_report_does_not_change_score(client):
    j = client.post("/v1/analyze", json={"input_type": "text", "text": SCAM}).json()
    r = client.post("/v1/report", json={"scan_id": j["scan_id"], "verdict": "dispute"})
    assert r.status_code == 200 and r.json()["stored_raw"] is False
    r2 = client.post("/v1/report", json={"scan_id": j["scan_id"], "verdict": "confirm",
                                         "consent_store_raw": True, "raw_text": SCAM})
    assert r2.json()["stored_raw"] is True
    assert client.get(f"/v1/scan/{j['scan_id']}").json()["score"] == j["score"]
    assert client.post("/v1/report", json={"scan_id": "x", "verdict": "confirm"}).status_code == 404


def test_validation_errors(client):
    assert client.post("/v1/analyze", json={"input_type": "text"}).status_code == 422
    assert client.post("/v1/analyze", json={"input_type": "bogus", "text": "x"}).status_code == 422
    assert client.post("/v1/analyze", json={"input_type": "url", "url": "http://169.254.169.254/"}).status_code == 400


def test_upload_guards(client):
    bad = {"input_type": "image", "client": "web"}
    r = client.post("/v1/analyze", data=bad, files={"file": ("x.png", b"<?php evil ?>", "image/png")})
    assert r.status_code == 415
    r = client.post("/v1/analyze", data={"input_type": "image", "client": "extension"},
                    files={"file": ("x.png", b"\x89PNG\r\n\x1a\n", "image/png")})
    assert r.status_code == 400
    r = client.post("/v1/voice/transcribe", files={"file": ("a.wav", b"nope", "audio/wav")})
    assert r.status_code == 415


def test_page_check_is_cached_and_llm_free(client):
    body = {"url": "https://gold-profit-invest.xyz/join", "text": "40% monthly returns guaranteed"}
    a = client.post("/v1/page-check", json=body).json()
    b = client.post("/v1/page-check", json=body).json()
    assert a["band"] in ("HIGH", "CRITICAL") and a["cached"] is False and b["cached"] is True
    assert a["domain"] == "gold-profit-invest.xyz"


def test_known_phishing_url_scores_high(client):
    app.state.intel = FakeIntel(get_settings(), phishing={"evil-broker.in"})
    j = client.post("/v1/analyze", json={"input_type": "text", "text": "Trade now at https://evil-broker.in/x"}).json()
    assert j["score"] >= 85 and j["evidence"][0]["code"] == "PHISHING_FEED_HIT"


def test_tts_falls_back_to_text(client):
    r = client.post("/v1/voice/speak", json={"text": "नमस्ते", "lang": "hi"})
    assert r.status_code == 200 and r.json()["fallback"] == "browser_speech_synthesis"


def test_llm_failure_still_returns_full_result(client, monkeypatch):
    from app import llm
    monkeypatch.setattr(llm, "enabled", lambda: True)

    async def boom(*a, **k):
        raise RuntimeError("llm down")
    monkeypatch.setattr(llm, "explain", boom)
    monkeypatch.setattr(llm, "extract_claims", boom)
    j = client.post("/v1/analyze", json={"input_type": "text", "text": SCAM}).json()
    assert j["explanation"]["en"] and j["explanation"]["hi"] and j["score"] > 60


def test_rate_limit_applies(client, monkeypatch):
    from app.deps import limiter
    monkeypatch.setenv("RATE_LIMIT", "2/minute")
    get_settings.cache_clear()
    try:
        limiter.reset()
        codes = [client.post("/v1/analyze", json={"input_type": "text", "text": "hello"}).status_code for _ in range(4)]
        assert 429 in codes
    finally:
        monkeypatch.delenv("RATE_LIMIT")
        get_settings.cache_clear()
        limiter.reset()
