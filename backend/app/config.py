from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # --- core ---
    # Postgres in production (postgresql+psycopg://...). SQLite keeps local dev and tests zero-setup.
    database_url: str = "sqlite:///./sangyan.db"
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173", "https://sangyaan.vercel.app"]
    # e.g. ["chrome-extension://abcdef..."] -- added to cors_origins
    extension_origins: list[str] = []
    rate_limit: str = "20/minute"
    daily_paid_call_cap: int = 500  # OCR + STT + TTS + LLM calls per UTC day, all clients

    # --- stage budgets (seconds) ---
    stage_timeout: float = 3.0
    llm_timeout: float = 4.0
    page_check_timeout: float = 1.2
    page_cache_ttl: int = 600

    # --- scoring knobs ---
    unrealistic_monthly_return_pct: float = 10.0
    domain_new_days: int = 30
    # SEBI validated UPI handle. VERIFY against the SEBI circular before relying on it.
    validated_upi_handle_pattern: str = r"^[a-z0-9._-]+@valid[a-z]*$"

    # --- uploads / fetch ---
    max_image_bytes: int = 5 * 1024 * 1024
    max_audio_bytes: int = 2 * 1024 * 1024  # ~30 s of compressed audio
    max_audio_seconds: int = 30
    fetch_timeout: float = 5.0
    fetch_max_bytes: int = 1024 * 1024
    fetch_max_redirects: int = 3

    # --- external sources (all optional; missing key => check is skipped, not faked) ---
    safe_browsing_key: str | None = None
    urlhaus_feed_url: str = "https://urlhaus.abuse.ch/downloads/text_online/"
    openphish_feed_url: str = "https://openphish.com/feed.txt"
    openphish_refresh_seconds: int = 3600
    enable_rdap: bool = True
    rdap_base_url: str = "https://rdap.org/domain/"

    # --- LLM (OpenAI-compatible chat endpoint; works with Sarvam, OpenAI, vLLM, ...) ---
    llm_base_url: str | None = None
    llm_api_key: str | None = None
    llm_model: str = "sarvam-m"
    llm_reasoning_effort: str | None = None  # e.g. "none" for Gemini 2.5 (hidden thinking eats max_tokens and adds seconds)

    # --- Sarvam speech ---
    sarvam_api_key: str | None = None
    sarvam_base_url: str = "https://api.sarvam.ai"
    sarvam_stt_model: str = "saarika:v2.5"
    sarvam_tts_model: str = "bulbul:v3"
    sarvam_tts_speaker: str = "priya"

    # --- demo / replay ---
    demo_replay: bool = False  # serve recorded source responses from disk
    demo_record: bool = False  # record live source responses to disk
    replay_dir: Path = DATA_DIR / "replay"
    demo_audio_dir: Path = DATA_DIR / "demo_audio"

    @property
    def allowed_origins(self) -> list[str]:
        return [*self.cors_origins, *self.extension_origins]


@lru_cache
def get_settings() -> Settings:
    return Settings()
