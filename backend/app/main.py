from __future__ import annotations

import logging
from contextlib import asynccontextmanager

import httpx
from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy.orm import Session

from app import db as dbm
from app.api import analyze, extension, report, voice
from app.config import get_settings
from app.db import SqlRegistry, get_db
from app.deps import limiter
from app.pipeline.verify.url_intel import UrlIntel
from app.speech import SarvamSpeech

# Never log request bodies or message text anywhere in this app.
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
# httpx logs full request URLs at INFO, which would put API keys (e.g. Safe Browsing ?key=...) in the logs.
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

MAX_BODY = 6 * 1024 * 1024


@asynccontextmanager
async def lifespan(app: FastAPI):
    s = get_settings()
    dbm.init_engine()
    if s.database_url.startswith("sqlite"):
        dbm.create_all_dev()
    with dbm.session_factory()() as session:
        report.purge_expired_raw(session)
    app.state.client = httpx.AsyncClient()
    app.state.intel = UrlIntel(s, app.state.client)
    app.state.speech = SarvamSpeech(app.state.client)
    yield
    await app.state.client.aclose()


app = FastAPI(title="Sangyan Shield API", version="0.1.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().allowed_origins,  # frontend + chrome-extension://<id> only
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


@app.middleware("http")
async def limit_body(request: Request, call_next):
    cl = request.headers.get("content-length")
    if cl and cl.isdigit() and int(cl) > MAX_BODY:
        return JSONResponse({"detail": "Request too large"}, status_code=413)
    return await call_next(request)


app.include_router(analyze.router)
app.include_router(extension.router)
app.include_router(voice.router)
app.include_router(report.router)


@app.get("/healthz", tags=["ops"])
def healthz(db: Session = Depends(get_db)):
    reg = SqlRegistry(db)
    snap = reg.snapshot_date()
    return {"status": "ok", "sebi_snapshot": snap.isoformat() if snap else None,
            "demo_replay": get_settings().demo_replay}
