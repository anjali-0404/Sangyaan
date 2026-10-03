// Per-device scan history. Stays in this browser's localStorage; the server stores no raw text.
const KEY = 'sangyan.history.v1'
const MAX = 100

export function loadHistory() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]')
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function addToHistory(entry) {
  const list = loadHistory().filter(e => e.id !== entry.id)
  list.unshift(entry)
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch { /* storage full or blocked: history is best-effort */ }
}

export function clearHistory() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}

/** Short, non-sensitive label for a job (never the whole message). */
export function previewOf(job) {
  if (!job) return ''
  if (job.inputType === 'url') return job.url
  if (job.file) return job.file.name || (job.inputType === 'audio' ? 'Voice recording' : 'Screenshot')
  return (job.text || '').replace(/\s+/g, ' ').slice(0, 70)
}
