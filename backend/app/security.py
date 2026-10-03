"""SSRF-safe URL fetch and upload type checks.

The backend fetches user-supplied URLs, so: resolve first and refuse private/loopback/link-local/metadata
addresses, connect to the vetted IP (defeats DNS rebinding), <= 3 redirects, 5 s timeout, 1 MB body cap,
HTML/text only, never run JavaScript or download files.
"""
from __future__ import annotations

import asyncio
import io
import ipaddress
import wave
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse

import httpx

from app.config import get_settings


class UnsafeURL(Exception):
    pass


class FetchFailed(Exception):
    pass


def ip_is_public(ip: str) -> bool:
    a = ipaddress.ip_address(ip)
    return not (a.is_private or a.is_loopback or a.is_link_local or a.is_multicast
                or a.is_reserved or a.is_unspecified or (a.version == 6 and a.ipv4_mapped is not None
                                                       and not ip_is_public(str(a.ipv4_mapped))))


async def resolve_public(host: str, port: int) -> str:
    try:
        literal = ipaddress.ip_address(host)
        infos = [(None, None, None, None, (str(literal), port))]
    except ValueError:
        try:
            infos = await asyncio.get_running_loop().getaddrinfo(host, port, type=1)
        except OSError as e:
            raise FetchFailed(f"cannot resolve {host}") from e
    ips = [i[4][0] for i in infos]
    if not ips or not all(ip_is_public(ip) for ip in ips):
        raise UnsafeURL("address is not publicly routable")
    return ips[0]


class _Text(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = ""
        self.parts: list[str] = []
        self._skip = 0
        self._in_title = False

    def handle_starttag(self, tag, attrs):
        if tag in ("script", "style", "noscript", "template"):
            self._skip += 1
        elif tag == "title":
            self._in_title = True

    def handle_endtag(self, tag):
        if tag in ("script", "style", "noscript", "template"):
            self._skip = max(0, self._skip - 1)
        elif tag == "title":
            self._in_title = False

    def handle_data(self, data):
        if self._skip:
            return
        if self._in_title:
            self.title += data
        elif data.strip():
            self.parts.append(data.strip())


def visible_text(html: str) -> str:
    p = _Text()
    p.feed(html)
    return (p.title.strip() + "\n" + " ".join(p.parts))[:20000]


async def safe_fetch_text(url: str, client: httpx.AsyncClient | None = None) -> str:
    """Fetch title + visible text. Raises UnsafeURL / FetchFailed."""
    s = get_settings()
    own = client is None
    client = client or httpx.AsyncClient()
    try:
        current = url
        for _ in range(s.fetch_max_redirects + 1):
            u = urlparse(current)
            if u.scheme not in ("http", "https") or not u.hostname:
                raise UnsafeURL("only http(s) URLs are allowed")
            port = u.port or (443 if u.scheme == "https" else 80)
            if port not in (80, 443):
                raise UnsafeURL("unusual port")
            ip = await resolve_public(u.hostname, port)
            netloc_ip = f"[{ip}]" if ":" in ip else ip
            target = u._replace(netloc=f"{netloc_ip}:{port}").geturl()
            try:
                async with client.stream(
                    "GET", target, timeout=s.fetch_timeout, follow_redirects=False,
                    headers={"Host": u.hostname, "User-Agent": "SangyanShield/0.1", "Accept": "text/html,text/plain"},
                    extensions={"sni_hostname": u.hostname},
                ) as r:
                    if r.is_redirect:
                        loc = r.headers.get("location")
                        if not loc:
                            raise FetchFailed("redirect without location")
                        current = urljoin(current, loc)
                        continue
                    ctype = r.headers.get("content-type", "")
                    if "html" not in ctype and "text/plain" not in ctype:
                        raise FetchFailed("not an HTML/text page")
                    buf = bytearray()
                    async for chunk in r.aiter_bytes():
                        buf += chunk
                        if len(buf) > s.fetch_max_bytes:
                            break
                    return visible_text(bytes(buf[: s.fetch_max_bytes]).decode(r.encoding or "utf-8", "replace"))
            except httpx.HTTPError as e:
                raise FetchFailed(type(e).__name__) from e
        raise FetchFailed("too many redirects")
    finally:
        if own:
            await client.aclose()


# ---- upload sniffing: trust bytes, not file extensions ---------------------------------------------
def sniff_image(b: bytes) -> str | None:
    if b.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if b.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if b[:4] == b"RIFF" and b[8:12] == b"WEBP":
        return "image/webp"
    return None


def sniff_audio(b: bytes) -> str | None:
    if b[:4] == b"RIFF" and b[8:12] == b"WAVE":
        return "audio/wav"
    if b.startswith(b"ID3") or (len(b) > 1 and b[0] == 0xFF and (b[1] & 0xE0) == 0xE0):
        return "audio/mpeg"
    if b.startswith(b"OggS"):
        return "audio/ogg"
    if b.startswith(b"\x1a\x45\xdf\xa3"):
        return "audio/webm"
    if b[4:8] == b"ftyp":
        return "audio/mp4"
    return None


def wav_seconds(b: bytes) -> float | None:
    try:
        with wave.open(io.BytesIO(b)) as w:
            return w.getnframes() / float(w.getframerate())
    except (wave.Error, EOFError):
        return None
