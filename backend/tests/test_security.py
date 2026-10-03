import pytest

from app.security import UnsafeURL, ip_is_public, resolve_public, safe_fetch_text, sniff_audio, sniff_image


@pytest.mark.parametrize("ip", ["127.0.0.1", "10.0.0.5", "192.168.1.1", "169.254.169.254", "::1", "0.0.0.0",
                                "::ffff:127.0.0.1", "fe80::1"])
def test_private_addresses_refused(ip):
    assert not ip_is_public(ip)


def test_public_ok():
    assert ip_is_public("8.8.8.8")


@pytest.mark.parametrize("url", ["http://169.254.169.254/latest/meta-data", "http://127.0.0.1:80/", "http://localhost/",
                                 "ftp://example.com/", "http://example.com:8080/"])
async def test_fetch_blocks_internal_targets(url):
    with pytest.raises(Exception) as ei:
        await safe_fetch_text(url)
    assert isinstance(ei.value, UnsafeURL) or "resolve" in str(ei.value)


async def test_resolve_literal_private():
    with pytest.raises(UnsafeURL):
        await resolve_public("10.1.2.3", 80)


def test_sniffing_uses_bytes_not_extension():
    assert sniff_image(b"\x89PNG\r\n\x1a\n....") == "image/png"
    assert sniff_image(b"<?php echo 1;") is None
    assert sniff_audio(b"RIFF\x00\x00\x00\x00WAVE") == "audio/wav"
    assert sniff_audio(b"MZ\x90\x00") is None
