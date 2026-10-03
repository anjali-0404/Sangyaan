import pytest

from app.pipeline.extract import extract_regex
from app.pipeline.normalize import norm_name, norm_phone, registrable_domain
from app.pipeline.risk import band, score, score_and_weight
from app.schemas import Evidence


def ev(code, sev="high", status="ok"):
    return Evidence(code=code, severity=sev, title="t", detail="d", source="s", status=status)


def test_extract_guide_example():
    c = extract_regex("Join our SEBI registered group INA000012345, 40% monthly returns, pay to rahul@okaxis")
    assert c.sebi_numbers == ["INA000012345"]
    assert c.upi_ids == ["rahul@okaxis"]
    assert c.return_claims[0].pct == 40 and c.return_claims[0].period == "month"
    assert c.mentions_sebi


def test_emails_are_not_upi_and_mail_domains_dropped():
    c = extract_regex("write to me at john@gmail.com or john@company.in, site gmail.com")
    assert c.upi_ids == [] and "gmail.com" not in c.domains


def test_phone_not_double_counted_as_upi():
    c = extract_regex("pay 9876543210@paytm or call +91 98765 43211")
    assert c.upi_ids == ["9876543210@paytm"] and c.phones == ["9876543211"]


def test_normalisation():
    assert norm_phone("+91 98765-43210") == "9876543210"
    assert registrable_domain("https://www.example.co.in/join?x=1") == "example.co.in"
    assert norm_name("Mr. Rahul  Mehta, Pvt. Ltd.") == "rahul mehta"


def test_each_category_counts_once():
    many = [ev("TASK_JOB"), ev("UNREALISTIC_RETURN")]
    assert score(many) == 15


def test_hard_floor_and_weights_sum_to_score():
    s, out = score_and_weight([ev("PHISHING_FEED_HIT"), ev("URGENCY", "medium")])
    assert s == 85 and sum(e.weight for e in out) == s


def test_unavailable_never_scores():
    assert score([ev("SEBI_NOT_FOUND", "low", "unavailable")]) == 0


@pytest.mark.parametrize("s,b", [(0, "LOW"), (30, "LOW"), (31, "MEDIUM"), (60, "MEDIUM"),
                                 (61, "HIGH"), (80, "HIGH"), (81, "CRITICAL")])
def test_bands(s, b):
    assert band(s) == b


def test_combo_floor_weights_still_sum_and_are_spread():
    s, out = score_and_weight([ev("GUARANTEED_RETURN"), ev("UPI_NOT_VALIDATED_HANDLE", "medium")])
    assert s == 65 and sum(e.weight for e in out) == 65
    assert max(e.weight for e in out) < 65  # not all dumped on one item
    assert all(e.weight >= 9 for e in out)  # nobody shows fewer points than their own category earned


def test_shared_host_is_not_a_registrable_site():
    from app.pipeline.normalize import is_shared_host
    assert registrable_domain("https://a.pages.dev/x") == "a.pages.dev"
    assert is_shared_host("a.pages.dev") and not is_shared_host("example.co.in")


async def test_one_listed_page_does_not_taint_whole_shared_host(settings):
    from app.pipeline.verify.url_intel import UrlIntel
    intel = UrlIntel(settings, client=None)
    feed = intel._openphish
    feed.urls = {"http://bad.pages.dev/login"}
    feed.hosts = {"bad.pages.dev"}
    feed.loaded_at = 10**12
    assert await intel.openphish(["http://bad.pages.dev/login"], "bad.pages.dev")
    assert not await intel.openphish(["http://good.pages.dev/"], "good.pages.dev")


async def test_real_number_on_lookalike_domain_is_high(settings, registry, intel):
    from app.pipeline.run import analyze_text
    r = await analyze_text("Example Advisory Private Limited INA000000001 invest at https://exampleadvisory-pro.com",
                           source_url=None, registry=registry, intel=intel, settings=settings, use_llm=False)
    assert r.band in ("HIGH", "CRITICAL")


# ---- RDAP 404 handling: "not registered" only when DNS agrees ----------------------------------------
import httpx
import pytest as _pytest

from app.pipeline.verify import url_intel as _ui
from app.replay import SourceUnavailable as _SU


def _intel_with_status(settings, status, monkeypatch, resolves):
    async def fake_resolves(domain):
        return resolves
    monkeypatch.setattr(_ui, "_resolves", fake_resolves)
    client = httpx.AsyncClient(transport=httpx.MockTransport(lambda req: httpx.Response(status, json={})))
    return _ui.UrlIntel(settings, client)


async def test_rdap_404_and_no_dns_means_not_registered(settings, monkeypatch):
    intel = _intel_with_status(settings, 404, monkeypatch, resolves=False)
    assert await intel.domain_age_days("netflxxxix.com") == _ui.NOT_REGISTERED


async def test_rdap_404_but_domain_resolves_is_just_unavailable(settings, monkeypatch):
    intel = _intel_with_status(settings, 404, monkeypatch, resolves=True)
    with _pytest.raises(_SU):
        await intel.domain_age_days("somewhere.example")


async def test_rdap_server_error_is_unavailable(settings, monkeypatch):
    intel = _intel_with_status(settings, 503, monkeypatch, resolves=False)
    with _pytest.raises(_SU):
        await intel.domain_age_days("netflxxxix.com")


# ---- brand look-alike: real sites must not be flagged, impersonations must -----------------------------
from app.pipeline.verify.url_intel import brand_lookalike_of as _bl

REAL = ("amazonpay.in amazon.jobs amazon.com.au amazon.de netflix.net icicibank.co.in sbi.bank.in lic.in amazonia.com "
        "hdfclife.com jiomart.com paytmmall.com help.netflix.com aws.amazon.com pay.google.com primevideo.com "
        "kotaksecurities.com sbicard.com onlinesbi.sbi myaadhaar.uidai.gov.in").split()
FAKE = ("netflxxxix.com netflixx.com netfl1x.com netflix.xyz netflix-login.in amazon.top amaz0n-offers.com "
        "sbi-kyc-update.xyz sbi.click hdfcbank-secure.com paytm-kyc-verify.in jio-recharge-offer.top "
        "uidai-verify.top indiapost-tracking.top amazonpay-refund.com").split()


@_pytest.mark.parametrize("d", REAL)
def test_real_brand_sites_are_not_flagged(d):
    assert _bl(d) is None, _bl(d)


@_pytest.mark.parametrize("d", FAKE)
def test_impersonating_sites_are_flagged(d):
    assert _bl(d) is not None
