"""Payment-request checks for anything that asks you to pay: a pasted message, an OCR'd poster, a UPI QR code.

Two mechanical, hedged statements:
  * PAYEE_NOT_UPI_HANDLE - the payee is an email address (name@gmail.com). UPI handles end in a bank/app
    suffix (@okaxis, @ybl, @paytm ...), never in an email provider.
  * QR_PAYEE_MISMATCH - the QR code pays a different name than the one the image shows (a known brand, or
    simply a name that appears nowhere in the picture).
We never say "fraud"; we say what does not line up and what to do.
"""
from __future__ import annotations

import re

from rapidfuzz import fuzz

from app.pipeline.evidence import make
from app.pipeline.qr import parse_upi
from app.schemas import Evidence

QR_MARK = "QR CODE PAYLOAD:"  # ingest writes one such line per decoded QR code
SOURCE_QR = "QR code contents"
SOURCE_TEXT = "Payment ID format check"

EMAIL_PROVIDERS = (
    "gmail.com", "googlemail.com", "yahoo.com", "yahoo.in", "yahoo.co.in", "outlook.com", "hotmail.com",
    "live.com", "rediffmail.com", "icloud.com", "proton.me", "protonmail.com", "aol.com",
)
EMAIL = re.compile(r"\b([a-z0-9][a-z0-9._+-]{1,40})@(" + "|".join(re.escape(d) for d in EMAIL_PROVIDERS) + r")\b", re.I)
PAY_CTX = re.compile(
    r"\b(pay|payment|upi|scan|qr|bhim|gpay|google\s*pay|phonepe|paytm|transfer|send|collect|fee|deposit|recharge|bill)\b",
    re.I,
)

# Well-known consumer brands that do not collect bills through a stranger's QR code. Used only to say
# "the image shows <brand> but the QR pays someone else"; we make no claim about the brand itself.
BRANDS = (
    "netflix", "amazon", "flipkart", "myntra", "swiggy", "zomato", "jio", "airtel", "vodafone", "bsnl",
    "irctc", "paytm", "phonepe", "google", "apple", "microsoft", "hotstar", "spotify", "uber", "ola",
    "sbi", "hdfc", "icici", "axis", "kotak", "lic", "bescom", "tata", "zerodha", "groww", "upstox",
)


# UPI stickers (genuine ones too) carry a row of payment-app logos: "Scan and pay with any UPI app" + G Pay,
# PhonePe, Paytm, Amazon Pay. OCR reads those logos as words, which says nothing about who the poster claims to be.
PAYMENT_APP_BRANDS = {"paytm", "phonepe", "google", "amazon", "bhim", "whatsapp", "cred", "mobikwik", "freecharge"}
_APP_WORDS = re.compile(r"\b(paytm|phonepe|g\s?pay|gpay|google\s*pay|amazon\s*pay|amazon|bhim|upi|whatsapp\s*pay|cred|mobikwik|freecharge)\b", re.I)
_LOGO_CTX = re.compile(r"\b(any|all)\s+(bhim\s+)?(upi\s+)?(payment\s+)?apps?\b|\baccepted\s+here\b|\bscan\s*(and|&)\s*pay\b", re.I)


def _logo_row(visible: str) -> bool:
    return bool(_LOGO_CTX.search(visible)) or len({m.group(1).lower().replace(" ", "") for m in _APP_WORDS.finditer(visible)}) >= 3


def _headline(visible: str) -> str:
    return next((ln.strip().lower() for ln in visible.splitlines() if ln.strip()), "")


def split_text(text: str) -> tuple[str, list[str]]:
    """(visible text, [QR payloads])."""
    visible, payloads = [], []
    for line in text.splitlines():
        if line.startswith(QR_MARK):
            payloads.append(line[len(QR_MARK):].strip())
        else:
            visible.append(line)
    return "\n".join(visible), payloads


def _tokens(s: str) -> set[str]:
    return {t for t in re.split(r"[^a-z0-9]+", s.lower()) if len(t) >= 3}


def verify_payment(text: str) -> list[Evidence]:
    visible, payloads = split_text(text)
    upis = [u for u in (parse_upi(p) for p in payloads) if u]
    ctx = bool(upis) or bool(PAY_CTX.search(visible))
    out: list[Evidence] = []

    # 1. payee that is an email address, not a UPI handle
    bad: list[tuple[str, str]] = []  # (id, where)
    for u in upis:
        pa = u["pa"]
        if EMAIL.fullmatch(pa):
            bad.append((pa, "the QR code"))
    if ctx:
        for m in EMAIL.finditer(visible):
            addr = m.group(0)
            if all(addr.lower() != b[0].lower() for b in bad):
                bad.append((addr, "the text"))
    if bad:
        parts = [f"{a} ({'in the QR code' if w == 'the QR code' else 'shown as text'})" for a, w in bad[:2]]
        out.append(make(
            "PAYEE_NOT_UPI_HANDLE", "high",
            f"Payment is requested to {' and '.join(parts)}. That is an email address; real UPI IDs end in a bank "
            f"or app handle such as @okaxis or @ybl.",
            SOURCE_QR if any(w == "the QR code" for _, w in bad) else SOURCE_TEXT,
        ))

    # 2. QR pays someone other than the name shown
    vis_low = visible.lower()
    for u in upis:
        pa, pn = u["pa"], u.get("pn", "")
        payee = f"{pn} {pa}".lower()
        logo_ctx, head = _logo_row(visible), _headline(visible)

        def named(b: str) -> bool:
            if not re.search(rf"\b{b}\b", vis_low) or b in payee:
                return False
            # a payment app's name inside a logo row is not a claim about who is being paid
            return not (logo_ctx and b in PAYMENT_APP_BRANDS and not re.search(rf"\b{b}\b", head))

        brand = next((b for b in BRANDS if named(b)), None)
        if brand:
            who = f'"{pn}" ({pa})' if pn else pa
            out.append(make(
                "QR_PAYEE_MISMATCH", "high",
                f'The image shows "{brand.title()}" but the QR code pays {who}, which does not match that name.',
                SOURCE_QR,
            ))
            break
        words = len(re.findall(r"\w+", visible))
        if pn and words >= 3 and not (_tokens(pn) & _tokens(visible)) and fuzz.partial_ratio(pn.lower(), vis_low) < 70:
            out.append(make(
                "QR_PAYEE_MISMATCH", "medium",
                f'The QR code pays "{pn}" ({pa}), a name that does not appear anywhere in the image.',
                SOURCE_QR,
            ))
            break
    return out
