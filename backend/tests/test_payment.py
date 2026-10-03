"""Payment QR / payee checks. Found by a user: a fake NETFLIX UPI QR poster scored 0/100."""
import io
from pathlib import Path

import pytest

from app.pipeline.ingest import ingest
from app.pipeline.qr import decode_qr, parse_upi
from app.pipeline.run import analyze_text
from tests.helpers import FakeIntel

FIXTURE = Path(__file__).parent / "fixtures" / "fake_netflix_upi_qr.png"
cv2 = pytest.importorskip("cv2")


async def run(text, settings, registry):
    return await analyze_text(text, source_url=None, registry=registry, intel=FakeIntel(settings), settings=settings, use_llm=False)


def codes(res):
    return {e.code for e in res.evidence if e.status == "ok"}


def poster(brand: str, payload: str) -> bytes:
    """A QR poster like the ones scammers (and shops) print: brand name text + a QR code."""
    import numpy as np
    from PIL import Image, ImageDraw, ImageFont

    qr = cv2.QRCodeEncoder.create().encode(payload)
    qr = cv2.resize(qr, (340, 340), interpolation=cv2.INTER_NEAREST)
    img = Image.new("RGB", (560, 700), "white")
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 46)
    g = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
    d.text((40, 40), brand, fill="black", font=f)
    img.paste(Image.fromarray(np.array(qr)).convert("RGB"), (110, 150))
    d.text((60, 540), "Scan and pay with any UPI app", fill="black", font=g)
    b = io.BytesIO()
    img.save(b, "PNG")
    return b.getvalue()


def test_parse_upi():
    assert parse_upi("upi://pay?pa=a@b&pn=Some%20Name&am=5") == {"pa": "a@b", "pn": "Some Name", "am": "5"}
    assert parse_upi("https://example.com") is None


def test_decodes_a_generated_qr():
    got = decode_qr(poster("SHOP", "upi://pay?pa=shop@okaxis&pn=Shop&am=10"))
    assert got and got[0].startswith("upi://pay?pa=shop@okaxis")


async def test_fake_brand_poster_with_email_payee_is_high(settings, registry):
    img = poster("NETFLIX", "upi://pay?pa=hakua@gmail.com&pn=hakuaaaa&am=2342&cu=INR")
    ing = await ingest("image", image=img)
    assert "QR CODE PAYLOAD: upi://pay?pa=hakua@gmail.com" in ing.text
    res = await run(ing.text, settings, registry)
    assert {"PAYEE_NOT_UPI_HANDLE", "QR_PAYEE_MISMATCH"} <= codes(res)
    assert res.band in ("HIGH", "CRITICAL")
    assert "SEBI" not in res.safe_action  # wrong advice for a Netflix bill
    assert sum(e.weight for e in res.evidence if e.status == "ok") == res.score


@pytest.mark.skipif(not FIXTURE.exists(), reason="fixture image missing")
async def test_the_original_user_screenshot(settings, registry):
    ing = await ingest("image", image=FIXTURE.read_bytes())
    res = await run(ing.text, settings, registry)
    assert res.band in ("HIGH", "CRITICAL"), (res.score, codes(res))
    assert "PAYEE_NOT_UPI_HANDLE" in codes(res)


async def test_genuine_looking_shop_poster_is_not_flagged(settings, registry):
    img = poster("Sharma Sweets", "upi://pay?pa=sharmasweets@okaxis&pn=Sharma%20Sweets")
    ing = await ingest("image", image=img)
    res = await run(ing.text, settings, registry)
    assert not ({"PAYEE_NOT_UPI_HANDLE", "QR_PAYEE_MISMATCH"} & codes(res)), codes(res)
    assert res.band == "LOW"


async def test_email_without_payment_context_is_ignored(settings, registry):
    res = await run("Questions about the newsletter? Write to support@gmail.com anytime.", settings, registry)
    assert "PAYEE_NOT_UPI_HANDLE" not in codes(res)


async def test_pasted_message_asking_to_pay_an_email(settings, registry):
    res = await run("Your electricity will be cut tonight. Pay the bill now to bescom-help@gmail.com", settings, registry)
    assert "PAYEE_NOT_UPI_HANDLE" in codes(res)
    assert res.band != "LOW"


async def test_image_without_qr_still_works(settings, registry):
    from PIL import Image, ImageDraw
    img = Image.new("RGB", (600, 120), "white")
    ImageDraw.Draw(img).text((10, 40), "Hello this is plain text only", fill="black")
    b = io.BytesIO(); img.save(b, "PNG")
    assert decode_qr(b.getvalue()) == []


async def test_non_investment_scam_does_not_get_sebi_advice(settings, registry):
    res = await run("Your Netflix payment failed. Update now: https://netflix-login.top/login", settings, registry)
    assert res.band in ("HIGH", "CRITICAL")
    assert "SEBI" not in res.safe_action and "SEBI" not in res.safe_action_hi


async def test_investment_scam_keeps_sebi_advice(settings, registry):
    res = await run("Guaranteed 40% monthly returns on stocks, pay to rahul@okaxis, limited slots", settings, registry)
    assert "SEBI" in res.safe_action


# ---- regressions found by users / audits ------------------------------------------------------------
QR_HAKUA = Path(__file__).parent / "fixtures" / "qr_hakua_labnol.png"


@pytest.mark.skipif(not QR_HAKUA.exists(), reason="fixture missing")
async def test_payment_app_logo_row_is_not_a_brand_claim(settings, registry):
    """The sticker's 'G Pay / PhonePe / Paytm / amazon pay' logo row must not read as 'the poster is Amazon'."""
    ing = await ingest("image", image=QR_HAKUA.read_bytes())
    res = await run(ing.text, settings, registry)
    got = codes(res)
    assert "QR_PAYEE_MISMATCH" not in got, [e.detail for e in res.evidence]
    assert "PAYEE_NOT_UPI_HANDLE" in got  # the gmail payee is still the real problem


async def test_genuine_sticker_with_logo_row_stays_low(settings, registry):
    text = ("Sharma Sweets\nScan and pay with any BHIM UPI app\nG Pay PhonePe Paytm amazon pay\n"
            "QR CODE PAYLOAD: upi://pay?pa=sharmasweets@okaxis&pn=Sharma%20Sweets")
    res = await run(text, settings, registry)
    assert res.band == "LOW", [(e.code, e.detail) for e in res.evidence]


async def test_brand_in_the_headline_is_still_caught_despite_logo_row(settings, registry):
    text = ("AMAZON\nScan and pay with any UPI app\nG Pay PhonePe Paytm\n"
            "QR CODE PAYLOAD: upi://pay?pa=raju1234@okaxis&pn=Raju")
    assert "QR_PAYEE_MISMATCH" in codes(await run(text, settings, registry))


async def test_news_about_scams_is_not_flagged(settings, registry):
    res = await run("News: Police arrested a gang running a digital arrest racket that duped a retired professor of Rs 2 crore.", settings, registry)
    assert res.band == "LOW"


async def test_shop_name_vs_owner_name_is_only_a_mild_note(settings, registry):
    text = ("Jai Mata Di Sweets\nScan and pay with any UPI app\nG Pay PhonePe Paytm\n"
            "QR CODE PAYLOAD: upi://pay?pa=sunil.sweets@okaxis&pn=Sunil%20Kumar")
    res = await run(text, settings, registry)
    assert res.band == "LOW"
