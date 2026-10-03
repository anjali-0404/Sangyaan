"""Speech services behind a small interface so the rest of the code never imports the vendor.

Verified against the live Sarvam API on 2026-10-04 (STT saarika:v2.5, TTS bulbul:v3).
"""
from __future__ import annotations

import base64
import hashlib
from dataclasses import dataclass
from typing import Protocol

import httpx

from app.budget import consume
from app.config import get_settings


class SpeechUnavailable(Exception):
    pass


@dataclass
class Transcript:
    text: str
    language: str | None = None


class Speech(Protocol):
    async def transcribe(self, audio: bytes, lang_hint: str | None, content_type: str = "audio/wav") -> Transcript: ...
    async def speak(self, text: str, lang: str) -> bytes: ...


_LANG = {"hi": "hi-IN", "en": "en-IN"}


class SarvamSpeech:
    def __init__(self, client: httpx.AsyncClient):
        self.client = client
        self.s = get_settings()

    def _headers(self) -> dict[str, str]:
        if not self.s.sarvam_api_key:
            raise SpeechUnavailable("SARVAM_API_KEY not set")
        return {"api-subscription-key": self.s.sarvam_api_key}

    async def transcribe(self, audio: bytes, lang_hint: str | None, content_type: str = "audio/wav") -> Transcript:
        headers = self._headers()
        consume("stt")
        try:
            r = await self.client.post(
                f"{self.s.sarvam_base_url}/speech-to-text",
                headers=headers,
                files={"file": ("audio", audio, content_type)},
                data={"model": self.s.sarvam_stt_model, "language_code": _LANG.get(lang_hint or "", "unknown")},
                timeout=15,
            )
            r.raise_for_status()
            j = r.json()
        except (httpx.HTTPError, ValueError) as e:
            raise SpeechUnavailable(type(e).__name__) from e
        return Transcript(text=j.get("transcript", ""), language=j.get("language_code"))

    async def speak(self, text: str, lang: str) -> bytes:
        headers = self._headers()
        consume("tts")
        try:
            r = await self.client.post(
                f"{self.s.sarvam_base_url}/text-to-speech",
                headers=headers,
                json={"text": text, "target_language_code": _LANG.get(lang, "hi-IN"),
                      "speaker": self.s.sarvam_tts_speaker, "model": self.s.sarvam_tts_model},
                timeout=15,
            )
            r.raise_for_status()
            return base64.b64decode(r.json()["audios"][0])
        except (httpx.HTTPError, ValueError, KeyError, IndexError) as e:
            raise SpeechUnavailable(type(e).__name__) from e


def demo_audio_for(text: str, lang: str) -> bytes | None:
    """Pre-generated audio for the demo scenarios, served from disk when the input hash matches."""
    h = hashlib.sha256(f"{lang}:{text.strip()}".encode()).hexdigest()[:24]
    p = get_settings().demo_audio_dir / f"{h}.wav"
    return p.read_bytes() if p.exists() else None
