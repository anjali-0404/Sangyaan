"""QR codes in uploaded images. A payment QR carries the real payee (`upi://pay?pa=<vpa>&pn=<name>`), which is
exactly the thing a fake poster tries to hide behind a trusted brand name. OpenCV is optional: without it we
simply decode nothing and the rest of the pipeline works as before."""
from __future__ import annotations

import re
from urllib.parse import parse_qs, unquote, urlparse

MAX_PAYLOADS = 3
MAX_SIDE = 4200  # never upscale beyond this


def decode_qr(data: bytes) -> list[str]:
    try:
        import cv2
        import numpy as np
    except ImportError:  # pragma: no cover
        return []
    try:
        img = cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_GRAYSCALE)
        if img is None:
            return []
        found: list[str] = []
        det = cv2.QRCodeDetector()
        # Small QR codes inside a poster often only decode once enlarged and given a white quiet zone.
        for scale in (1, 2, 3, 4):
            if max(img.shape) * scale > MAX_SIDE:
                break
            x = cv2.resize(img, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC) if scale > 1 else img
            x = cv2.copyMakeBorder(x, 40, 40, 40, 40, cv2.BORDER_CONSTANT, value=255)
            for fn in (_multi, _single):
                for v in fn(det, x):
                    if v and v not in found:
                        found.append(v)
            if found:
                break
        return found[:MAX_PAYLOADS]
    except Exception:  # noqa: BLE001 - a QR failure must never fail the whole analysis
        return []


def _multi(det, x) -> list[str]:
    try:
        ok, decoded, _pts, _ = det.detectAndDecodeMulti(x)
        return [d for d in decoded if d] if ok else []
    except Exception:  # noqa: BLE001
        return []


def _single(det, x) -> list[str]:
    try:
        v, _pts, _ = det.detectAndDecode(x)
        return [v] if v else []
    except Exception:  # noqa: BLE001
        return []


def parse_upi(payload: str) -> dict[str, str] | None:
    """upi://pay?pa=name@handle&pn=Payee&am=100  ->  {"pa":..., "pn":..., "am":...} (lower-cased keys)."""
    if not re.match(r"^upi://", payload.strip(), re.I):
        return None
    q = parse_qs(urlparse(payload.strip()).query)
    out = {k.lower(): unquote(v[0]).strip() for k, v in q.items() if v}
    return out if out.get("pa") else None
