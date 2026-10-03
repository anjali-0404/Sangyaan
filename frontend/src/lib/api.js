// Thin client for the Sangyan Shield backend (see backend/app/api).
// In dev, Vite proxies /api -> http://localhost:8000. In production set VITE_API_URL to the backend origin.
const BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const FRIENDLY = {
  413: 'That file is too large. Images up to 5 MB and audio up to 30 seconds are supported.',
  415: 'That file type is not supported. Use a PNG, JPEG or WebP image, or a common audio format.',
  429: 'Too many checks right now, or the daily capacity was reached. Please try again in a little while.',
  503: 'That part of the service (OCR or speech) is not available on the server right now. Try pasting the text instead.',
}

async function request(path, { timeout = 45000, ...init } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  let res
  try {
    res = await fetch(`${BASE}${path}`, { ...init, signal: ctrl.signal })
  } catch (e) {
    throw new ApiError(0, e.name === 'AbortError'
      ? 'The check took too long. Please try again.'
      : 'Could not reach the Sangyan Shield server. Check your connection and try again.')
  } finally {
    clearTimeout(timer)
  }
  if (!res.ok) {
    let detail = ''
    try {
      const body = await res.json()
      detail = typeof body.detail === 'string' ? body.detail : ''
    } catch { /* non-JSON error body */ }
    throw new ApiError(res.status, detail || FRIENDLY[res.status] || `Request failed (${res.status}).`)
  }
  return res
}

/**
 * job: { inputType: 'text'|'url'|'image'|'audio', text?, url?, file? }
 * lang: backend supports 'en' | 'hi' for explanations (other UI languages get English).
 */
// Phone screenshots are often 3-10 MB. Text stays readable at ~2200px JPEG, so shrink in the browser first.
async function shrinkImage(file, maxSide = 2200, quality = 0.9) {
  if (!file.type?.startsWith('image/') || file.size < 1.2 * 1024 * 1024) return file
  try {
    const bmp = await createImageBitmap(file)
    const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bmp.width * scale)
    canvas.height = Math.round(bmp.height * scale)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality))
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file
  } catch {
    return file // e.g. HEIC the browser cannot decode: send as is, the server will explain
  }
}

export async function analyze(job, uiLang = 'en') {
  const lang = uiLang === 'hi' ? 'hi' : 'en'
  const common = { input_type: job.inputType, lang, client: 'web' }
  if (job.file) {
    if (job.inputType === 'image') job = { ...job, file: await shrinkImage(job.file) }
    // Fail fast instead of uploading megabytes the server will reject (limits mirror the backend).
    const limit = job.inputType === 'audio' ? 2 * 1024 * 1024 : 5 * 1024 * 1024
    if (job.file.size > limit) {
      throw new ApiError(
        413,
        uiLang === 'hi'
          ? `फ़ाइल बहुत बड़ी है (अधिकतम ${limit / 1024 / 1024} MB)।`
          : `That file is too large (max ${limit / 1024 / 1024} MB).`,
      )
    }
    const fd = new FormData()
    Object.entries(common).forEach(([k, v]) => fd.append(k, v))
    fd.append('file', job.file, job.file.name || 'upload')
    return (await request('/v1/analyze', { method: 'POST', body: fd, timeout: 90000 })).json()
  }
  const body = { ...common, text: job.text ?? null, url: job.url ?? null }
  return (await request('/v1/analyze', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })).json()
}

export async function getScan(id) {
  return (await request(`/v1/scan/${encodeURIComponent(id)}`)).json()
}

export async function sendReport(scanId, verdict) {
  return (await request('/v1/report', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scan_id: scanId, verdict }),
  })).json()
}

export async function health() {
  return (await request('/healthz', { timeout: 6000 })).json()
}

/** Returns { audio: Blob } or { fallback: true, text, lang } when server-side TTS is unavailable. */
export async function speak(text, lang) {
  const res = await request('/v1/voice/speak', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang }), timeout: 30000,
  })
  if ((res.headers.get('content-type') || '').includes('audio')) return { audio: await res.blob() }
  const j = await res.json()
  return { fallback: true, text: j.text, lang: j.lang }
}
