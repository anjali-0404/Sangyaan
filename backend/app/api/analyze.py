import asyncio

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import ValidationError
from sqlalchemy.orm import Session
from starlette.datastructures import UploadFile

from app import speech as speech_mod
from app.budget import BudgetExceeded
from app.config import Settings
from app.db import SqlRegistry, get_db
from app.deps import intel_dep, limiter, rate, registry_dep, settings_dep
from app.persist import save_scan, text_hash
from app.pipeline import evidence as ev_mod
from app.pipeline.ingest import IngestError, ingest
from app.pipeline.run import analyze_text
from app.schemas import AnalyzeRequest, AnalyzeResponse, CheckStatus
from app.security import (
    FetchFailed,
    UnsafeURL,
    safe_fetch_text,
    sniff_audio,
    sniff_image,
    wav_seconds,
)

router = APIRouter(prefix="/v1", tags=["analyze"])


async def _read_request(request: Request) -> tuple[AnalyzeRequest, UploadFile | None]:
    ctype = request.headers.get("content-type", "")
    file: UploadFile | None = None
    try:
        if ctype.startswith("multipart/form-data"):
            form = await request.form()
            fields = {k: v for k, v in form.items() if isinstance(v, str) and v != ""}
            up = form.get("file") or form.get("image") or form.get("audio")
            file = up if isinstance(up, UploadFile) else None
        else:
            fields = await request.json()
            if not isinstance(fields, dict):
                raise ValueError
        return AnalyzeRequest.model_validate(fields), file
    except (ValidationError, ValueError) as e:
        raise HTTPException(422, "Invalid request body") from e


@router.post("/analyze", response_model=AnalyzeResponse)
@limiter.limit(rate)
async def analyze(
    request: Request,
    db: Session = Depends(get_db),
    registry: SqlRegistry = Depends(registry_dep),
    intel=Depends(intel_dep),
    settings: Settings = Depends(settings_dep),
):
    """Text, image, URL or audio in; risk result out.

    JSON body for text/url; multipart/form-data (fields as in the contract + `file`) for image/audio.
    """
    req, file = await _read_request(request)
    is_ext = req.client == "extension"
    if is_ext and req.input_type in ("image", "audio"):
        raise HTTPException(400, "The extension endpoint does not accept image or audio; use /v1/page-check")

    pre_checks: list[CheckStatus] = []
    pre_evidence = []
    try:
        if req.input_type == "image":
            data = await _bounded(file, settings.max_image_bytes)
            if sniff_image(data) is None:
                raise IngestError("Unsupported image type (PNG, JPEG or WebP only)", 415)
            ing = await ingest("image", image=data, url=req.url)
        elif req.input_type == "audio":
            data = await _bounded(file, settings.max_audio_bytes)
            mime = sniff_audio(data)
            if mime is None:
                raise IngestError("Unsupported audio type", 415)
            if mime == "audio/wav" and (wav_seconds(data) or 0) > settings.max_audio_seconds:
                raise IngestError(f"Audio longer than {settings.max_audio_seconds} seconds", 413)
            tr = await request.app.state.speech.transcribe(data, req.lang, mime)
            ing = await ingest("audio", transcript=tr.text, url=req.url)
        elif req.input_type == "url":
            async def fetch(u: str) -> str:
                try:
                    return await safe_fetch_text(u, request.app.state.client)
                except UnsafeURL as e:
                    raise IngestError(f"That URL cannot be fetched: {e}", 400) from e
                except FetchFailed:
                    pre_checks.append(CheckStatus(name="page_fetch", status="unavailable"))
                    pre_evidence.append(ev_mod.unavailable("URL_FETCH", "Fetching the page", "Page fetch"))
                    return ""
            u = (req.url or "").strip()
            if u and "://" not in u:
                u = "https://" + u  # people paste bare domains like "fake-broker.in/login"
            ing = await ingest("url", url=u, fetch=fetch)
        else:
            ing = await ingest("text", text=req.text)
    except IngestError as e:
        raise HTTPException(e.status, str(e)) from e
    except speech_mod.SpeechUnavailable as e:
        raise HTTPException(503, "Speech recognition is unavailable right now") from e
    except BudgetExceeded as e:
        raise HTTPException(429, "Daily capacity reached for this service. Try again tomorrow.") from e

    resp = await analyze_text(
        ing.text, source_url=ing.url, registry=registry, intel=intel, settings=settings,
        use_llm=not is_ext, pre_checks=pre_checks, pre_evidence=pre_evidence,
    )
    await asyncio.to_thread(
        save_scan, db, resp, input_type=req.input_type, client=req.client, lang=req.lang,
        thash=text_hash(ing.text),
    )
    return resp


async def _bounded(file: UploadFile | None, limit: int) -> bytes:
    if file is None:
        raise IngestError("A file is required for this input_type")
    data = await file.read(limit + 1)
    if len(data) > limit:
        raise IngestError(f"File larger than {limit // (1024 * 1024) or 1} MB", 413)
    return data


@router.get("/scan/{scan_id}", response_model=AnalyzeResponse)
def get_scan(scan_id: str, db: Session = Depends(get_db)):
    from app.models import Scan

    row = db.get(Scan, scan_id)
    if row is None:
        raise HTTPException(404, "Scan not found")
    return row.result_json
