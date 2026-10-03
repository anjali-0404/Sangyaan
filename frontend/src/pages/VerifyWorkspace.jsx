import { useState, useRef, useCallback, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ShieldCheck, Lock, ScanSearch, Link2, MessageSquare, Mic,
  Upload, CloudUpload, CheckCircle, ArrowRight, Search, QrCode,
  Landmark, Phone, AlertTriangle, X, Image, FileWarning,
  Clipboard, Square, CircleStop, TrendingUp
} from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { useLanguage } from '../context/LanguageContext'
import { health } from '../lib/api'

const SAMPLE_SCREENSHOTS = [
  { id: 'telegram', label: 'Telegram VIP Tip Group', desc: '"Daily 500% profit guaranteed in Nifty 50"', tag: 'High Risk', file: 'Sample: Telegram VIP tip group',
    text: 'VIP Nifty 50 option calls. Daily 500% profit guaranteed, risk free. Limited slots, join now. Pay 4999 joining fee to vipcalls.nifty@okaxis' },
  { id: 'sebi', label: 'Fake SEBI Advisor', desc: 'WhatsApp chat quoting a SEBI number', tag: 'Forged Doc', file: 'Sample: WhatsApp SEBI adviser chat',
    text: 'I am Rahul Mehta, SEBI registered investment adviser INA000012345. Join my premium stock tips group, assured returns 30% monthly. Send fee to my account 9876543210' },
  { id: 'apk', label: 'Suspicious Trading APK', desc: 'Sideload installer link', tag: 'Malicious APK', file: 'Sample: trading app APK message',
    text: 'Download this APK to get premium SEBI registered trading signals http://bharat-pro-trader.xyz/app.apk 20% weekly returns. Act now, limited seats' },
]

const LINK_SAMPLES = [
  { domain: 'xyztrading-india.com', type: 'Phishing', safe: false },
  { domain: 'sebi-india-verify.com', type: 'Impersonation', safe: false },
  { domain: 'groww.in', type: 'SEBI Regulated', safe: true },
  { domain: 'fake-broker.in/login', type: 'Credential Harvester', safe: false },
]

export default function VerifyWorkspace() {
  const { t } = useLanguage()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'screenshot')
  const [selectedFile, setSelectedFile] = useState(null) // { name, size, file? , text? }
  const [audioClip, setAudioClip] = useState(null) // { file, name, seconds }
  const [micError, setMicError] = useState('')
  const [backend, setBackend] = useState({ state: 'checking' })
  const recorderRef = useRef(null)
  const chunksRef = useRef([])
  const audioInputRef = useRef(null)
  const [linkValue, setLinkValue] = useState('')
  const [messageValue, setMessageValue] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordTime, setRecordTime] = useState(0)
  const navigate = useNavigate()
  const timerRef = useRef(null)
  const fileInputRef = useRef(null)

  const tabs = [
    { id: 'screenshot', label: t.verifyWorkspace?.tabScreenshot || 'Screenshot', icon: ScanSearch },
    { id: 'link', label: t.verifyWorkspace?.tabLink || 'Link / Domain', icon: Link2 },
    { id: 'message', label: t.verifyWorkspace?.tabMessage || 'Message', icon: MessageSquare },
    { id: 'voice', label: t.verifyWorkspace?.tabVoice || 'Voice / Audio', icon: Mic },
  ]

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['screenshot', 'link', 'message', 'voice'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    let alive = true
    health().then(h => alive && setBackend({ state: 'ok', snapshot: h.sebi_snapshot }))
      .catch(() => alive && setBackend({ state: 'down' }))
    return () => { alive = false }
  }, [])

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) setSelectedFile({ name: file.name, size: (file.size / 1024 / 1024).toFixed(1) + ' MB', file })
    e.target.value = ''
  }, [])

  // Samples are message texts (there is no real image behind them), so they are analysed as text.
  const selectSample = useCallback((sample) => {
    setSelectedFile({ name: sample.file, size: 'sample text', text: sample.text })
  }, [])

  const go = useCallback((job) => navigate('/analysis', { state: { job } }), [navigate])

  const clearFile = useCallback(() => setSelectedFile(null), [])

  const startAnalysis = useCallback(() => {
    if (!selectedFile) return
    if (selectedFile.file) go({ inputType: 'image', file: selectedFile.file })
    else go({ inputType: 'text', text: selectedFile.text })
  }, [selectedFile, go])

  const runLink = useCallback(() => {
    const v = linkValue.trim()
    if (!v) return
    go({ inputType: 'url', url: /^[a-z][a-z0-9+.-]*:\/\//i.test(v) ? v : `https://${v}` })
  }, [linkValue, go])

  const runMessage = useCallback(() => {
    if (messageValue.trim()) go({ inputType: 'text', text: messageValue })
  }, [messageValue, go])

  const stopRecording = useCallback(() => {
    clearInterval(timerRef.current)
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') rec.stop()
    setIsRecording(false)
  }, [])

  const startRecording = useCallback(async () => {
    setMicError('')
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setMicError('Recording is not supported in this browser. Upload an audio clip instead.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = e => e.data.size && chunksRef.current.push(e.data)
      rec.onstop = () => {
        stream.getTracks().forEach(tr => tr.stop())
        const type = rec.mimeType || 'audio/webm'
        const ext = type.includes('mp4') ? 'm4a' : type.includes('ogg') ? 'ogg' : 'webm'
        const blob = new Blob(chunksRef.current, { type })
        setAudioClip(prev => ({ file: new File([blob], `recording.${ext}`, { type }), name: `recording.${ext}`, seconds: prev?.seconds ?? 0 }))
      }
      recorderRef.current = rec
      rec.start()
      setAudioClip(null)
      setIsRecording(true)
      setRecordTime(0)
      timerRef.current = setInterval(() => setRecordTime(t => {
        if (t + 1 >= 30) { stopRecording(); return 30 } // backend accepts at most 30 seconds
        return t + 1
      }), 1000)
    } catch {
      setMicError('Microphone access was blocked. Allow it in your browser, or upload an audio clip instead.')
    }
  }, [stopRecording])

  const toggleRecording = useCallback(() => {
    if (isRecording) stopRecording()
    else startRecording()
  }, [isRecording, startRecording, stopRecording])

  const handleAudioUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) setAudioClip({ file, name: file.name, seconds: 0 })
    e.target.value = ''
  }, [])

  useEffect(() => () => {
    clearInterval(timerRef.current)
    const rec = recorderRef.current
    if (rec && rec.state !== 'inactive') rec.stop()
  }, [])

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <PageTransition>
      <div className="container-max" style={{ padding: 'var(--space-lg) var(--margin)' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--color-on-surface-variant)' }} className="text-label-md">
            <span>{t.verifyWorkspace?.breadcrumbHome || 'Home'}</span>
            <ArrowRight size={14} />
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{t.verifyWorkspace?.breadcrumbWorkspace || 'Civic Verification Workspace'}</span>
            <span className="text-label-sm" style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-container-high)', color: 'var(--color-primary)', marginLeft: 4 }}>
              {t.verifyWorkspace?.engineVersion || 'AI Shield Engine v4.2'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface-container-lowest)', boxShadow: 'var(--shadow-card)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: backend.state === 'down' ? 'var(--color-error)' : backend.state === 'ok' ? 'var(--color-tertiary)' : 'var(--color-outline)', animation: 'pulse-ring 2s infinite' }} />
              <span className="text-label-sm" style={{ color: 'var(--color-on-surface)' }}>
                {backend.state === 'ok'
                  ? `SEBI registry snapshot: ${backend.snapshot || 'not loaded'}`
                  : backend.state === 'down' ? 'Verification server unreachable' : 'Connecting to verification server…'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--gutter)', alignItems: 'start' }} className="workspace-grid">
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }} className="workspace-main">
            <div style={{
              background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-card)', padding: 'var(--space-xl)', position: 'relative', overflow: 'hidden',
            }}>
              {/* Ambient glow */}
              <div style={{ position: 'absolute', right: -80, top: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(0,55,177,0.04)', filter: 'blur(60px)', pointerEvents: 'none' }} />

              {/* Header */}
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)', position: 'relative', zIndex: 10 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 4 }}>
                    <span style={{ display: 'inline-flex', padding: 6, borderRadius: 'var(--radius-default)', background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>
                      <Shield size={18} />
                    </span>
                    <span className="text-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 700 }}>
                      Bharat Anti-Scam Shield
                    </span>
                  </div>
                  <h1 className="text-headline-lg" style={{ color: 'var(--color-on-surface)' }}>{t.verifyWorkspace?.title || 'Verify Before You Pay'}</h1>
                  <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
                    {t.verifyWorkspace?.subtitle || 'Paste, upload, or speak the details of any investment advice, telegram tip, or payment request.'}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', background: 'var(--color-surface-container-low)', padding: '6px 12px', borderRadius: 'var(--radius-lg)', alignSelf: 'flex-start' }}>
                  <Lock size={16} style={{ color: 'var(--color-secondary)' }} />
                  <span className="text-label-sm" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>{t.verifyWorkspace?.ramProcessed || '100% RAM Processed'}</span>
                </div>
              </div>

              {/* Tab Buttons */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-xs)',
                padding: 6, background: 'var(--color-surface-container-low)', borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--space-lg)', position: 'relative', zIndex: 10,
              }} className="tab-bar">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="text-label-lg"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-xs)',
                      padding: '10px 12px', borderRadius: 'var(--radius-default)',
                      background: activeTab === tab.id ? 'var(--color-surface-container-lowest)' : 'transparent',
                      color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                      fontWeight: activeTab === tab.id ? 700 : 600,
                      boxShadow: activeTab === tab.id ? 'var(--shadow-card)' : 'none',
                      transition: 'all 0.2s',
                    }}
                  >
                    <tab.icon size={18} />
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* SCREENSHOT TAB */}
                  {activeTab === 'screenshot' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                      {/* Dropzone */}
                      <div
                        style={{
                          position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)',
                          background: 'var(--color-surface-container-low)', cursor: 'pointer',
                          transition: 'background 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
                        }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                        <div style={{
                          width: 64, height: 64, borderRadius: '50%', background: 'var(--color-primary-fixed)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)',
                          marginBottom: 'var(--space-sm)', transition: 'transform 0.2s',
                        }}>
                          <CloudUpload size={30} />
                        </div>
                        <p className="text-headline-sm" style={{ color: 'var(--color-on-surface)', textAlign: 'center' }}>
                          {t.verifyWorkspace?.dropzoneTitle || 'Drag and drop your screenshot here, or'}{' '}
                          <span style={{ color: 'var(--color-primary)', textDecoration: 'underline', fontWeight: 700 }}>{t.verifyWorkspace?.browseFiles || 'Browse Files'}</span>
                        </p>
                        <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 4, textAlign: 'center' }}>
                          {t.verifyWorkspace?.dropzoneHint || '(JPG, PNG, WhatsApp chats, Telegram channels, SMS captures up to 10MB)'}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-xs)', marginTop: 'var(--space-md)', justifyContent: 'center' }}>
                          {[
                            t.verifyWorkspace?.ocrTag || 'OCR Text Extraction',
                            t.verifyWorkspace?.qrTag || 'UPI QR / ID Parsing',
                            t.verifyWorkspace?.sealTag || 'Forged Seal Detection'
                          ].map(feat => (
                            <span key={feat} className="text-label-sm" style={{
                              display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px',
                              borderRadius: 'var(--radius-full)', background: 'var(--color-surface-container-lowest)',
                              boxShadow: 'var(--shadow-card)',
                            }}>
                              <CheckCircle size={12} style={{ color: 'var(--color-tertiary)' }} /> {feat}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Selected File State */}
                      {selectedFile && (
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary-fixed)',
                          border: '1px solid var(--color-primary)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Image size={20} color="var(--color-primary)" />
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--color-on-primary-fixed)' }}>{selectedFile.name}</div>
                              <div style={{ fontSize: 11, color: 'var(--color-primary)' }}>{selectedFile.size} • {selectedFile.file ? 'Ready for OCR' : 'Analysed as message text'}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <button
                              onClick={startAnalysis}
                              className="btn btn-primary"
                              style={{ padding: '8px 16px', fontSize: 13, borderRadius: 'var(--radius-md)', fontWeight: 700 }}
                            >
                              {selectedFile?.file ? 'Run OCR Scan' : 'Run Scan'}
                            </button>
                            <button
                              onClick={clearFile}
                              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-on-primary-fixed)' }}
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Quick Samples */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', paddingTop: 'var(--space-xs)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span className="text-label-lg" style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>
                            {t.verifyWorkspace?.sampleHeading || 'Or Quick Test with Preloaded Indian Scam Samples:'}
                          </span>
                          <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                            {t.verifyWorkspace?.clickToTest || 'Click any to test engine'}
                          </span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-sm)' }}>
                          {SAMPLE_SCREENSHOTS.map(s => (
                            <button
                              key={s.id}
                              onClick={() => selectSample(s)}
                              style={{
                                textAlign: 'left', padding: 'var(--space-sm)', borderRadius: 'var(--radius-md)',
                                background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)',
                                cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 4
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-outline-variant)'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span className="text-label-sm" style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{s.label}</span>
                                <span style={{
                                  fontSize: 10, padding: '2px 6px', borderRadius: 4,
                                  background: s.tag === 'High Risk' ? 'var(--risk-danger-bg)' : 'var(--risk-caution-bg)',
                                  color: s.tag === 'High Risk' ? 'var(--risk-danger-text)' : 'var(--risk-caution-text)',
                                  fontWeight: 700
                                }}>
                                  {s.tag}
                                </span>
                              </div>
                              <p style={{ margin: 0, fontSize: 11, color: 'var(--color-on-surface-variant)' }}>{s.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* LINK / DOMAIN TAB */}
                  {activeTab === 'link' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label className="text-label-lg" style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>
                          {t.verifyWorkspace?.linkLabel || 'Enter Website Link or Domain to inspect:'}
                        </label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="link-input-row">
                          <div style={{
                            flex: 1, display: 'flex', alignItems: 'center', background: 'var(--color-surface-container-low)',
                            borderRadius: 'var(--radius-lg)', padding: '0 12px', border: '1px solid var(--color-outline-variant)'
                          }}>
                            <Link2 size={18} color="var(--color-outline)" style={{ marginRight: 8 }} />
                            <input
                              type="text"
                              value={linkValue}
                              onChange={e => setLinkValue(e.target.value)}
                              placeholder={t.verifyWorkspace?.linkPlaceholder || 'e.g. https://fake-investment-fund.in or telegram.me/vip_calls'}
                              style={{ width: '100%', padding: '12px 0', border: 'none', background: 'transparent', outline: 'none', fontSize: 14 }}
                            />
                          </div>
                          <button
                            onClick={runLink}
                            disabled={!linkValue.trim()}
                            style={{
                              opacity: linkValue.trim() ? 1 : 0.5,
                              padding: '12px 24px', borderRadius: 'var(--radius-lg)',
                              background: 'var(--color-primary)', color: 'var(--color-on-primary)',
                              fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
                              boxShadow: '0 2px 8px rgba(0,55,177,0.25)', whiteSpace: 'nowrap'
                            }}
                          >
                            {t.verifyWorkspace?.inspectUrlBtn || 'Inspect Domain & SSL'}
                          </button>
                        </div>
                      </div>

                      {/* Quick link samples */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>Quick Test:</span>
                        {LINK_SAMPLES.map(ls => (
                          <button
                            key={ls.domain}
                            onClick={() => setLinkValue(ls.domain)}
                            style={{
                              padding: '4px 10px', borderRadius: 'var(--radius-full)',
                              background: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)',
                              fontSize: 12, cursor: 'pointer', color: 'var(--color-on-surface)'
                            }}
                          >
                            {ls.domain}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MESSAGE TAB */}
                  {activeTab === 'message' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <label className="text-label-lg" style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>
                          {t.verifyWorkspace?.messageLabel || 'Paste suspicious message, SMS or WhatsApp text:'}
                        </label>
                        <textarea
                          rows={4}
                          value={messageValue}
                          onChange={e => setMessageValue(e.target.value)}
                          placeholder={t.verifyWorkspace?.messagePlaceholder || 'Electricity bill warning, lottery win message, work-from-home job offer...'}
                          style={{
                            width: '100%', padding: '12px', borderRadius: 'var(--radius-lg)',
                            background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)',
                            outline: 'none', fontSize: 14, resize: 'vertical', fontFamily: 'inherit'
                          }}
                        />
                      </div>
                      <button
                        onClick={runMessage}
                        disabled={!messageValue.trim()}
                        style={{
                          opacity: messageValue.trim() ? 1 : 0.5,
                          alignSelf: 'flex-end', padding: '12px 28px', borderRadius: 'var(--radius-lg)',
                          background: 'var(--color-primary)', color: 'var(--color-on-primary)',
                          fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(0,55,177,0.25)', display: 'flex', alignItems: 'center', gap: 8
                        }}
                      >
                        <Search size={18} />
                        <span>{t.verifyWorkspace?.inspectMsgBtn || 'Run AI Text Forensics'}</span>
                      </button>
                    </div>
                  )}

                  {/* VOICE TAB */}
                  {activeTab === 'voice' && (
                    <div style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      padding: 'var(--space-xl)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-low)',
                      textAlign: 'center',
                    }}>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 'var(--space-md) 0' }}>
                        {isRecording && (
                          <>
                            <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(220,38,38,0.1)', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                            <div style={{ position: 'absolute', width: 96, height: 96, borderRadius: '50%', background: 'rgba(220,38,38,0.2)' }} />
                          </>
                        )}
                        <button
                          onClick={toggleRecording}
                          style={{
                            position: 'relative', zIndex: 10, width: 76, height: 76, borderRadius: '50%',
                            background: isRecording ? '#dc2626' : 'var(--color-primary)',
                            color: '#ffffff', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,55,177,0.3)',
                            transition: 'all 0.2s', border: 'none', cursor: 'pointer'
                          }}
                        >
                          {isRecording ? <Square size={28} fill="white" /> : <Mic size={32} />}
                        </button>
                      </div>

                      <span style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: 20, fontVariantNumeric: 'tabular-nums' }}>
                        {formatTime(recordTime)}
                      </span>
                      <p className="text-label-lg" style={{ fontWeight: 700, color: 'var(--color-on-surface)', marginTop: 6 }}>
                        {t.verifyWorkspace?.voiceTitle || 'Speak in Hindi or English (बोलें या कॉल सुनाएं)'}
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', maxWidth: 440, marginTop: 4, lineHeight: 1.5 }}>
                        {t.verifyWorkspace?.voiceDesc || 'Describe the call you received or place the phone near speaker to transcribe high-pressure coercion.'}
                      </p>

                      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                        <button
                          onClick={toggleRecording}
                          style={{
                            padding: '8px 18px', borderRadius: 'var(--radius-md)',
                            background: isRecording ? '#dc2626' : 'var(--color-primary)',
                            color: '#ffffff', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer'
                          }}
                        >
                          {isRecording ? (t.verifyWorkspace?.stopRecord || 'Stop Recording') : (t.verifyWorkspace?.startRecord || 'Start Recording')}
                        </button>
                        <input ref={audioInputRef} type="file" accept="audio/*" onChange={handleAudioUpload} style={{ display: 'none' }} />
                        <button
                          onClick={() => audioInputRef.current?.click()}
                          disabled={isRecording}
                          style={{
                            padding: '8px 18px', borderRadius: 'var(--radius-md)',
                            background: '#ffffff', border: '1px solid var(--color-outline-variant)',
                            color: 'var(--color-on-surface)', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                          }}
                        >
                          {t.verifyWorkspace?.uploadAudio || 'Upload Audio Clip'}
                        </button>
                      </div>

                      {micError && (
                        <p role="alert" className="text-body-sm" style={{ color: 'var(--color-error)', marginTop: 12, maxWidth: 440 }}>{micError}</p>
                      )}
                      {audioClip && !isRecording && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                          <span className="text-label-md" style={{ color: 'var(--color-on-surface)' }}>{audioClip.name}</span>
                          <button
                            onClick={() => go({ inputType: 'audio', file: audioClip.file })}
                            className="btn btn-primary"
                            style={{ padding: '8px 16px', fontSize: 13, borderRadius: 'var(--radius-md)', fontWeight: 700 }}
                          >
                            Analyse this audio
                          </button>
                          <button onClick={() => setAudioClip(null)} aria-label="Remove audio"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Feature cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
              {[
                { icon: QrCode, title: 'UPI Handle & VPA Check', desc: 'Paste a message containing a payment ID. We flag investment payments requested on a personal handle instead of a SEBI validated one.', status: 'Checks the SEBI validated-handle rule', color: 'var(--color-primary)' },
                { icon: Landmark, title: 'SEBI Registration Lookup', desc: 'Paste a message with a SEBI registration number. We check it against the registry snapshot and whether the name and website match the registered holder.', status: backend.state === 'ok' ? `Registry snapshot: ${backend.snapshot || 'n/a'}` : 'Registry snapshot: unavailable', color: 'var(--color-secondary)' },
              ].map(card => (
                <div key={card.title} style={{
                  padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)',
                  background: 'var(--color-surface-container-lowest)', boxShadow: 'var(--shadow-card)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                  border: '1px solid rgba(196,197,215,0.4)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: card.color, fontWeight: 700, marginBottom: 8 }}>
                      <card.icon size={18} />
                      <span className="text-label-lg">{card.title}</span>
                    </div>
                    <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{card.desc}</p>
                  </div>
                  <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-sm)', borderTop: '1px solid var(--color-surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{card.status}</span>
                    <button onClick={() => setActiveTab('message')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: card.color, fontWeight: 700, fontSize: 13 }}>
                      Check a message →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }} className="workspace-sidebar">
            {/* Tips Card */}
            <div style={{ background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', boxShadow: 'var(--shadow-card)', border: '1px solid rgba(196,197,215,0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-md)', paddingBottom: 'var(--space-xs)', borderBottom: '1px solid var(--color-surface-container-high)' }}>
                <span style={{ padding: 8, borderRadius: 'var(--radius-default)', background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}>
                  <CheckCircle size={18} />
                </span>
                <div>
                  <h2 className="text-headline-sm" style={{ color: 'var(--color-on-surface)', margin: 0 }}>Tips for a Good Check</h2>
                  <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Maximizing AI Confidence Score</span>
                </div>
              </div>
              {[
                { num: 1, title: 'Include Sender Phone / UPI ID', desc: 'Ensure the sender\'s full mobile number or VPA is clearly uncropped.' },
                { num: 2, title: 'Capture Full Promises & Returns', desc: 'Highlight "double your money" or "risk-free daily compound interest" statements.' },
                { num: 3, title: 'Never Crop Registration Claims', desc: 'Keep any SEBI seals, RBI logos, or corporate certificates in frame.' },
              ].map(tip => (
                <div key={tip.num} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', background: 'var(--color-surface-container)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    fontWeight: 600, fontSize: 16, color: 'var(--color-primary)',
                  }}>{tip.num}</div>
                  <div>
                    <span className="text-label-lg" style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{tip.title}</span>
                    <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 2 }}>{tip.desc}</p>
                  </div>
                </div>
              ))}
              <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container-low)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-xs)', marginTop: 'var(--space-xs)' }}>
                <Lock size={18} style={{ color: 'var(--color-tertiary)', marginTop: 2 }} />
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', margin: 0 }}>
                  <strong style={{ color: 'var(--color-on-surface)' }}>Data Sovereignty:</strong> Your uploaded images are processed in volatile memory (RAM) and permanently wiped post-verification.
                </p>
              </div>
            </div>

            {/* Emergency Card */}
            <div style={{
              background: 'linear-gradient(135deg, #0b132b 0%, #1f4fd8 100%)', color: '#ffffff',
              borderRadius: 'var(--radius-xl)', padding: 'var(--space-lg)', boxShadow: 'var(--shadow-elevated)',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 'var(--space-sm)' }}>
                <span style={{ padding: 6, borderRadius: 'var(--radius-default)', background: '#dc2626', color: '#ffffff' }}>
                  <AlertTriangle size={18} />
                </span>
                <span className="text-label-sm" style={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#fca5a5' }}>
                  Critical Intervention
                </span>
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: '0 0 6px', color: '#ffffff' }}>
                Suspicious of an ongoing transaction right now?
              </h3>
              <p style={{ fontSize: 13, color: '#dbeafe', margin: '0 0 16px', lineHeight: 1.5 }}>
                If you authorized an unauthorized transfer or were coerced into sharing an OTP, act immediately:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <a href="tel:1930" style={{
                  width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                  background: '#dc2626', color: '#ffffff',
                  fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 8, textDecoration: 'none'
                }}>
                  <Phone size={18} />
                  <span>Call 1930 Cyber Helpline</span>
                </a>
                <button
                  style={{
                    width: '100%', padding: '10px', borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.15)', color: '#ffffff',
                    fontWeight: 600, fontSize: 13, border: '1px solid rgba(255,255,255,0.25)',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate('/report')}
                >
                  Generate FIR Evidence Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .workspace-grid { grid-template-columns: 8fr 4fr; }
        .link-input-row { flex-direction: row; }
        @media (max-width: 1199px) {
          .workspace-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .tab-bar { grid-template-columns: repeat(2, 1fr) !important; gap: 6px !important; }
          .tab-label { display: inline-block; font-size: 11px; }
          .link-input-row { flex-direction: column; gap: 8px; }
          .link-input-row button { width: 100%; justify-content: center; }
        }
      `}</style>
    </PageTransition>
  )
}
