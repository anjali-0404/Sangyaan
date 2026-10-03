"""Normalisation applied before anything is stored or compared."""
from __future__ import annotations

import re
import unicodedata
from urllib.parse import urlparse

import tldextract

# Offline: use the suffix list bundled with the package, never fetch it at runtime.
# include_psl_private_domains: user.pages.dev / x.blogspot.com are separate "registrable" sites, so one
# phishing page on a shared host never taints the whole host.
_tld = tldextract.TLDExtract(suffix_list_urls=(), cache_dir=None, include_psl_private_domains=True)

_PUNCT = re.compile(r"[^\w\s]", re.UNICODE)
_WS = re.compile(r"\s+")
_HONORIFICS = {"mr", "mrs", "ms", "dr", "shri", "smt", "sri", "shree", "sh"}
_COMPANY_SUFFIX = {"pvt", "private", "ltd", "limited", "llp", "inc"}


_icann = tldextract.TLDExtract(suffix_list_urls=(), cache_dir=None)


def is_shared_host(domain: str) -> bool:
    """True for sites on shared hosting (x.pages.dev, x.blogspot.com): the parent's age says nothing about them."""
    e = _icann(domain)
    return bool(e.domain and e.suffix) and f"{e.domain}.{e.suffix}" != domain


def norm_name(name: str) -> str:
    """Lowercase, strip punctuation, honorifics and company suffixes."""
    s = unicodedata.normalize("NFKC", name).lower()
    s = _PUNCT.sub(" ", s)
    tokens = [t for t in _WS.split(s.strip()) if t and t not in _HONORIFICS]
    tokens = [t for t in tokens if t not in _COMPANY_SUFFIX]
    return " ".join(tokens)


def norm_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 12 and digits.startswith("91"):
        digits = digits[2:]
    return digits


def norm_vpa(vpa: str) -> str:
    return vpa.strip().lower()


def norm_sebi(reg: str) -> str:
    return re.sub(r"[\s-]", "", reg).upper()


def registrable_domain(value: str) -> str | None:
    """'https://www.example.co.in/join?x=1' -> 'example.co.in'."""
    value = value.strip().lower()
    if "://" not in value:
        value = "http://" + value
    try:
        host = urlparse(value).hostname
    except ValueError:
        return None
    if not host:
        return None
    ext = _tld(host)
    if ext.domain and ext.suffix:
        return f"{ext.domain}.{ext.suffix}"
    return host  # IPs, unknown suffixes: keep as-is


def host_of(value: str) -> str | None:
    value = value.strip()
    if "://" not in value:
        value = "http://" + value
    try:
        return urlparse(value).hostname
    except ValueError:
        return None
