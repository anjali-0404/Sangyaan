from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse, Response

from app import speech as speech_mod
from app.budget import BudgetExceeded
from app.config import get_settings
from app.deps import limiter, rate
from app.schemas import SpeakRequest, TranscribeResponse
from app.security import sniff_audio, wav_seconds

router = APIRouter(prefix="/v1/voice", tags=["voice"])


@router.post("/transcribe", response_model=TranscribeResponse)
@limiter.limit(rate)
async def transcribe(request: Request, file: UploadFile = File(...), lang: str | None = Form(None)):
    s = get_settings()
    data = await file.read(s.max_audio_bytes + 1)
    if len(data) > s.max_audio_bytes:
        raise HTTPException(413, "Audio too large (30 seconds maximum)")
    mime = sniff_audio(data)
    if mime is None:
        raise HTTPException(415, "Unsupported audio type")
    if mime == "audio/wav" and (wav_seconds(data) or 0) > s.max_audio_seconds:
        raise HTTPException(413, "Audio longer than 30 seconds")
    try:
        tr = await request.app.state.speech.transcribe(data, lang, mime)
    except BudgetExceeded as e:
        raise HTTPException(429, "Daily capacity reached for speech. Try again tomorrow.") from e
    except speech_mod.SpeechUnavailable as e:
        raise HTTPException(503, "Speech recognition is unavailable right now") from e
    return TranscribeResponse(transcript=tr.text, language=tr.language)


@router.post("/speak")
@limiter.limit(rate)
async def speak(request: Request, body: SpeakRequest):
    # 1) pre-generated demo audio by input hash, 2) live TTS, 3) text-only fallback for browser TTS.
    audio = speech_mod.demo_audio_for(body.text, body.lang)
    if audio is None:
        try:
            audio = await request.app.state.speech.speak(body.text, body.lang)
        except (speech_mod.SpeechUnavailable, BudgetExceeded):
            return JSONResponse({"fallback": "browser_speech_synthesis", "text": body.text, "lang": body.lang})
    return Response(audio, media_type="audio/wav")
