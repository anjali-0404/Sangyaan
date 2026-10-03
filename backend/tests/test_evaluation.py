"""Runs the labelled fixtures through the real pipeline (no network) and records the two headline numbers."""
import json
from pathlib import Path

import pytest

from app.pipeline.run import analyze_text
from tests.helpers import load_fixtures

ROWS = load_fixtures()
HIGH = {"HIGH", "CRITICAL"}


async def _run(text, settings, registry, intel):
    return await analyze_text(text, source_url=None, registry=registry, intel=intel, settings=settings, use_llm=False)


@pytest.mark.parametrize("row", ROWS, ids=[f"{i:02d}" for i in range(len(ROWS))])
async def test_expected_codes_present(row, settings, registry, intel):
    """Every expected code must fire; band expectations are judged in aggregate below."""
    res = await _run(row["text"], settings, registry, intel)
    got = {e.code for e in res.evidence}
    want = {c for c in row["expected_codes"].split("|") if c}
    assert want <= got, f"missing {want - got}; got {sorted(got)} score={res.score}"


async def test_evaluation_numbers(settings, registry, intel):
    scams = [r for r in ROWS if r["expected_band"] == "HIGH"]
    legit = [r for r in ROWS if r["expected_band"] == "LOW"]
    scam_hit, false_alarm, misses, alarms = 0, 0, [], []
    for r in scams:
        res = await _run(r["text"], settings, registry, intel)
        if res.band in HIGH:
            scam_hit += 1
        else:
            misses.append((res.score, r["text"][:70]))
    for r in legit:
        res = await _run(r["text"], settings, registry, intel)
        if res.band in HIGH:
            false_alarm += 1
            alarms.append((res.score, r["text"][:70], [e.code for e in res.evidence]))
    out = {
        "scams": len(scams), "scams_high_or_critical": scam_hit,
        "detection_rate": round(scam_hit / len(scams), 3),
        "legit": len(legit), "legit_high_or_critical": false_alarm,
        "false_alarm_rate": round(false_alarm / len(legit), 3),
        "missed_scams": misses, "false_alarms": alarms,
    }
    Path(__file__).parent.joinpath("evaluation.json").write_text(json.dumps(out, indent=2, ensure_ascii=False))
    print(json.dumps(out, indent=2, ensure_ascii=False))
    assert out["detection_rate"] >= 0.85
    assert out["false_alarm_rate"] <= 0.05
