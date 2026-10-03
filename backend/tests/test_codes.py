"""One test per evidence code, so a weight or rule change cannot silently break a rule."""
import pytest

from app.pipeline.run import analyze_text
from tests.helpers import YOUNG, FakeIntel


async def codes(text, settings, registry, intel, url=None):
    res = await analyze_text(text, source_url=url, registry=registry, intel=intel, settings=settings, use_llm=False)
    return {e.code for e in res.evidence if e.status == "ok"}, res


CASES = {
    "SEBI_NOT_FOUND": "Advisor INA000099999 offers stock tips",
    "SEBI_NOT_ACTIVE": "Research analyst INH000000004 stock tips",
    "SEBI_CLAIM_NO_NUMBER": "We are SEBI registered investment advisers",
    "ENTITY_NAME_MISMATCH": "I am Rahul Mehta, INA000000001 investment adviser",
    "DOMAIN_NOT_OFFICIAL": "INA000000001 invest at https://exampleadvisory-offers.com",
    "GUARANTEED_RETURN": "Guaranteed return on every stock investment",
    "UNREALISTIC_RETURN": "Invest with us and get 30% monthly",
    "UPI_NOT_VALIDATED_HANDLE": "Invest in stocks, pay the fee to rahul@okaxis",
    "OFF_PLATFORM_PAYMENT": "Invest now, send to my account today",
    "PAYEE_NOT_UPI_HANDLE": "Scan and pay your bill to billing-desk@gmail.com today",
    "QR_PAYEE_MISMATCH": "NETFLIX\nScan and pay with UPI\nQR CODE PAYLOAD: upi://pay?pa=hakua@okaxis&pn=hakuaaaa&am=100",
    "LOGIN_PAGE_ON_LOOKALIKE": "Your Netflix payment failed. Update your card: https://netflix-login.top/login",
    "OTP_REQUEST": "Madam please share your OTP to receive the refund",
    "AUTHORITY_IMPERSONATION": "This is the CBI officer, you are under digital arrest",
    "PRIZE_LOTTERY": "You have won a car in our lucky draw",
    "ACCOUNT_THREAT": "Your account will be blocked today unless you act",
    "ADVANCE_FEE": "Pay a refundable deposit of 3500 to release your loan",
    "PRETEXT_PAYMENT": "Sorry I accidentally sent Rs 20,000 to your account, please return it",
    "SHORT_LINK": "Your account will be blocked, update now: bit.ly/kyc-update-now",
    "TASK_JOB": "Part time job: complete simple tasks and earn daily",
    "PHISHING_FEED_HIT": "Open your demat at https://phish-broker.com now",
    "DOMAIN_NEW": "Invest at https://gold-profit-invest.xyz",
    "LOOKALIKE_DOMAIN": "Trade at https://zerodha-login.com",
    "DOMAIN_NOT_REGISTERED": "Invest at https://gone-fake-broker.com",
    "RISKY_TLD": "Invest at https://calm-brokers.top",
    "URGENCY": "Invest in stocks, act now",
    "REMOTE_ACCESS": "Install AnyDesk to open your demat",
    "APK_DOWNLOAD": "Download this APK to trade stocks",
}


@pytest.mark.parametrize("code", sorted(CASES))
async def test_code_fires(code, settings, registry):
    intel = FakeIntel(settings, phishing={"phish-broker.com"}, ages={**YOUNG, "gone-fake-broker.com": -1})
    got, _ = await codes(CASES[code], settings, registry, intel)
    assert code in got, got


async def test_every_code_is_covered():
    from app.pipeline.risk import CATEGORY
    assert set(CATEGORY) == set(CASES)


async def test_registered_adviser_with_matching_name_is_clean(settings, registry, intel):
    got, res = await codes(
        "Example Advisory Private Limited, SEBI Reg INA000000001, https://exampleadvisory.in", settings, registry, intel)
    assert got == set() and res.band == "LOW"


async def test_negation_suppresses_signal(settings, registry, intel):
    got, _ = await codes("Returns are not guaranteed. Never install AnyDesk for anyone.", settings, registry, intel)
    assert not got


async def test_unavailable_source_is_partial_not_failure(settings, registry):
    intel = FakeIntel(settings, down={"openphish", "rdap"})
    res = await analyze_text("Invest at https://some-broker.in", source_url=None, registry=registry,
                             intel=intel, settings=settings, use_llm=False)
    assert res.coverage.limited and res.band == "LOW"
    assert any(e.status == "unavailable" for e in res.evidence)
    assert "not reassurance" in res.summary_note
    assert all(e.weight == 0 for e in res.evidence if e.status == "unavailable")


async def test_empty_registry_is_unavailable_not_not_found(settings, intel):
    from tests.helpers import MemRegistry
    res = await analyze_text("INA000099999 stock adviser", source_url=None,
                             registry=MemRegistry(snapshot=None, with_data=False), intel=intel,
                             settings=settings, use_llm=False)
    assert "SEBI_NOT_FOUND" not in {e.code for e in res.evidence if e.status == "ok"}
    assert res.coverage.limited
