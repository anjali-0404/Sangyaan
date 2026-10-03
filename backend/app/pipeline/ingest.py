"""Stage 1: any input -> one normalised text string plus the original URL, if any."""
from __future__ import annotations

import asyncio
import io
import re
import unicodedata
from dataclasses import dataclass

from app.budget import consume
from app.schemas import InputType


class IngestError(Exception):
    """User-visible problem with the input (maps to HTTP 4xx/5xx in the API layer)."""

    def __init__(self, message: str, status: int = 422):
        super().__init__(message)
        self.status = status


@dataclass
class Ingested:
    text: str
    url: str | None = None


def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"[\u200b-\u200d\ufeff]", "", text)  # zero-width characters used to dodge keyword rules
    return re.sub(r"[ \t]+", " ", text).strip()


def ocr_image(data: bytes) -> str:
    """Tesseract (eng+hin) offline OCR. Sarvam document digitization can replace this behind the same call."""
    try:
        import pytesseract
        from PIL import Image
    except ImportError as e:  # pragma: no cover
        raise IngestError("OCR is not installed on this server", 503) from e
    try:
        from PIL import ImageOps, ImageStat

        Image.MAX_IMAGE_PIXELS = 40_000_000  # decompression-bomb guard
        img = Image.open(io.BytesIO(data))
        img.load()
        img = ImageOps.exif_transpose(img)  # phone photos carry rotation in EXIF
        if img.mode in ("RGBA", "LA", "P"):
            bg = Image.new("RGB", img.size, "white")
            bg.paste(img.convert("RGBA"), mask=img.convert("RGBA").split()[-1])
            img = bg
        gray = ImageOps.grayscale(img)
        # Chat apps in dark mode: Tesseract wants dark text on a light background.
        if ImageStat.Stat(gray).mean[0] < 110:
            gray = ImageOps.invert(gray)
        longest = max(gray.size)
        if longest > 2600:  # huge phone screenshots: shrink, OCR does not need more
            gray.thumbnail((2600, 2600))
        elif gray.size[0] < 1000:  # small crops: upscale so characters are ~20px tall
            gray = gray.resize((gray.size[0] * 2, gray.size[1] * 2), Image.LANCZOS)
        gray = ImageOps.autocontrast(gray)
        text = pytesseract.image_to_string(gray, lang="eng+hin", timeout=25)
        # The Hindi model garbles Latin text inside mixed lines (UPI IDs, URLs, SEBI numbers). If the image has
        # Devanagari, run an English-only pass and add back just the lines that carry identifiers.
        if re.search(r"[\u0900-\u097F]", text):
            try:
                eng = pytesseract.image_to_string(gray, lang="eng", timeout=25)
                ident = re.compile(r"@|https?://|www\.|\.(?:com|in|xyz|top|apk)\b|\bIN[ZAHP]\d{9}\b|\b[6-9]\d{9}\b", re.I)
                extra = [ln for ln in eng.splitlines() if ident.search(ln)]
                if extra:
                    text += "\n" + "\n".join(extra)
            except Exception:
                pass
        if len(text.strip()) < 5:  # preprocessing can hurt unusual images: retry on the original
            text = pytesseract.image_to_string(img, lang="eng+hin", timeout=25)
        return text
    except pytesseract.TesseractNotFoundError as e:
        raise IngestError("OCR engine is not available on this server", 503) from e
    except Exception as e:
        raise IngestError("Could not read text from that image") from e


async def ingest(
    input_type: InputType,
    *,
    text: str | None = None,
    url: str | None = None,
    image: bytes | None = None,
    transcript: str | None = None,
    fetch=None,
) -> Ingested:
    if input_type == "text":
        if not text or not text.strip():
            raise IngestError("text is required")
        return Ingested(normalize_text(text))
    if input_type == "url":
        if not url:
            raise IngestError("url is required")
        body = ""
        if fetch:
            body = await fetch(url)  # SSRF-guarded; failures are the caller's partial result
        return Ingested(normalize_text(f"{url}\n{body}"), url=url)
    if input_type == "image":
        if not image:
            raise IngestError("image file is required")
        consume("ocr")
        out = await asyncio.to_thread(ocr_image, image)
        # Payment QR codes hold the real payee; hand them on as marker lines for the payment check.
        from app.pipeline.qr import decode_qr
        from app.pipeline.verify.payment import QR_MARK

        for payload in await asyncio.to_thread(decode_qr, image):
            out += f"\n{QR_MARK} {payload}"
        return Ingested(normalize_text(out), url=url)
    if input_type == "audio":
        if transcript is None:
            raise IngestError("audio file is required")
        return Ingested(normalize_text(transcript), url=url)
    raise IngestError("unsupported input_type")
