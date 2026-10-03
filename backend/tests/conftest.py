import os

# Must be set before app modules read settings.
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["DEMO_REPLAY"] = "0"
os.environ["LLM_BASE_URL"] = ""
os.environ["LLM_API_KEY"] = ""
os.environ["SARVAM_API_KEY"] = ""
os.environ["SAFE_BROWSING_KEY"] = ""
os.environ["RATE_LIMIT"] = "1000/minute"

import pytest  # noqa: E402

from app import budget  # noqa: E402
from app.config import get_settings  # noqa: E402
from app.pipeline import run as run_mod  # noqa: E402
from tests.helpers import FakeIntel, MemRegistry  # noqa: E402


@pytest.fixture
def settings():
    return get_settings()


@pytest.fixture
def registry():
    return MemRegistry()


@pytest.fixture
def intel(settings):
    return FakeIntel(settings)


@pytest.fixture(autouse=True)
def _reset():
    budget.reset()
    run_mod.reset_caches()
    yield
