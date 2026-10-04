from fastapi import APIRouter, Depends, Request

from app.config import Settings
from app.db import SqlRegistry
from app.deps import intel_dep, limiter, registry_dep, settings_dep
from app.pipeline.run import page_check
from app.schemas import PageCheckRequest, PageCheckResponse

router = APIRouter(prefix="/v1", tags=["extension"])


@router.post("/page-check", response_model=PageCheckResponse)
@limiter.limit("60/minute")
async def page_check_endpoint(
    request: Request,
    body: PageCheckRequest,
    registry: SqlRegistry = Depends(registry_dep),
    intel=Depends(intel_dep),
    settings: Settings = Depends(settings_dep),
):
    """Visible page facts in, short result out. No OCR, ASR or LLM; target < 1.5 s."""
    return await page_check(body.url, body.text, registry=registry, intel=intel, settings=settings)
