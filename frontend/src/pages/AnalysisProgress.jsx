import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, ShieldX, ShieldCheck, ShieldAlert, Lock, Wallet, Check, Clock, X,
  RefreshCw, Phone, Cpu, Database, Network, Volume2, ThumbsUp, ThumbsDown, Link2, Landmark, TrendingUp, User
} from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { useLanguage } from '../context/LanguageContext'
import { analyze, getScan, sendReport, speak } from '../lib/api'
import { addToHistory, loadHistory, previewOf } from '../lib/history'

const FORENSIC_STEPS = [
  {
    id: 1,
    titles: {
      en: { label: 'Extracting text from image', detail: 'OCR complete: 247 words identified' },
      hi: { label: 'छवि से टेक्स्ट निष्कर्षण', detail: 'ओसीआर संपन्न: 247 शब्द विश्लेषित' },
      mr: { label: 'प्रतिमेतून मजकूर काढणे', detail: 'ओसीआर पूर्ण: २४७ शब्द तपासले' },
      bn: { label: 'ছবি থেকে টেক্সট নিষ্কাশন', detail: 'ওসিআর সম্পূর্ণ: ২৪৭ শব্দ শনাক্ত' },
      te: { label: 'చిత్రం నుండి వచనాన్ని సంగ్రహించడం', detail: 'ఓసీఆర్ పూర్తి: 247 పదాలు గుర్తించబడ్డాయి' },
      ta: { label: 'படத்திலிருந்து உரையைப் பிரித்தெடுத்தல்', detail: 'ஓசிஆர் முடிந்தது: 247 வார்த்தைகள்' },
      gu: { label: 'છબીમાંથી લખાણ મેળવવું', detail: 'ઓસીઆર પૂર્ણ: 247 શબ્દો ઓળખાયા' },
      kn: { label: 'ಚಿತ್ರದಿಂದ ಪಠ್ಯವನ್ನು ಹೊರತೆಗೆಯಲಾಗುತ್ತಿದೆ', detail: 'ಒಸಿಆರ್ ಪೂರ್ಣ: 247 ಪದಗಳು ಪತ್ತೆಯಾಗಿವೆ' },
    }
  },
  {
    id: 2,
    titles: {
      en: { label: 'Identifying key entities', detail: "Found: Claimed SEBI Advisor, UPI ID 'abc@upi', Telegram handle" },
      hi: { label: 'संस्थाओं व पहचानकर्ताओं की पहचान', detail: "पाया गया: कथित सेबी सलाहकार, यूपीआई आईडी 'abc@upi', टेलीग्राम चैनल" },
      mr: { label: 'महत्त्वाचे घटक ओळखणे', detail: "आढळले: कथित सेबी सल्लागार, यूपीआई आयडी 'abc@upi', टेलिग्राम हँडल" },
      bn: { label: 'মূল সত্ত্বা চিহ্নিতকরণ', detail: "পাওয়া গেছে: দাবিকৃত সেবি উপদেষ্টা, ইউপিআই আইডি 'abc@upi', টেলিগ্রাম হ্যান্ডেল" },
      te: { label: 'కీలక గుర్తింపులను కనుగొనడం', detail: "లభించినవి: సెబీ సలహాదారు క్లెయిమ్, యూపీఐ ఐడీ 'abc@upi', టెలిగ్రామ్" },
      ta: { label: 'முக்கிய கூறுகளைக் கண்டறிதல்', detail: "செபி ஆலோசகர் கோரிக்கை, யுபிஐ ஐடி 'abc@upi', டெலிகிராம் கண்டறியப்பட்டது" },
      gu: { label: 'મહત્વપૂર્ણ ઓળખકર્તા ચકાસવા', detail: "મળ્યું: કથિત સેબી સલાહકાર, યુપીઆઈ આઈડી 'abc@upi', ટેલિગ્રામ" },
      kn: { label: 'ಪ್ರಮುಖ ಗುರುತುಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ', detail: "ಕಂಡುಬಂದಿದೆ: ಸೆಬಿ ಸಲಹೆಗಾರ ಕ್ಲೈಮ್, ಯುಪಿಐ ಐಡಿ 'abc@upi', ಟೆಲಿಗ್ರಾಂ" },
    }
  },
  {
    id: 3,
    titles: {
      en: { label: 'Checking SEBI registration', detail: 'Querying official SEBI intermediary database...' },
      hi: { label: 'सेबी मध्यस्थ पंजीकरण सत्यापन', detail: 'आधिकारिक सेबी डेटाबेस में लाइव क्वेरी जारी...' },
      mr: { label: 'सेबी नोंदणी तपासत आहे', detail: 'अधिकृत सेबी डेटाबेसमध्ये थेट पडताळणी सुरू...' },
      bn: { label: 'সেবি নিবন্ধন পরীক্ষা করা হচ্ছে', detail: 'অফিসিয়াল সেবি ডাটাবেসে তথ্য অনুসন্ধান চলছে...' },
      te: { label: 'సెబీ రిజిస్ట్రేషన్ తనిఖీ చేస్తోంది', detail: 'అధికారిక సెబీ డేటాబేస్‌లో ప్రత్యక్ష శోధన...' },
      ta: { label: 'செபி பதிவைச் சரிபார்க்கிறது', detail: 'அதிகாரப்பூர்வ செபி தரவுத்தளத்தில் நேரடி தேடல்...' },
      gu: { label: 'સેબી નોંધણી તપાસી રહ્યું છે', detail: 'સત્તાવાર સેબી ડેટાબેઝમાં લાઈવ ચકાસણી...' },
      kn: { label: 'ಸೆಬಿ ನೋಂದಣಿಯನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ', detail: 'ಅಧಿಕೃತ ಸೆಬಿ ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ನೇರ ಪರಿಶೀಲನೆ...' },
    }
  },
  {
    id: 4,
    titles: {
      en: { label: 'Analyzing domain information', detail: 'Checking WHOIS age, registrar, and phishing reports' },
      hi: { label: 'डोमेन व सर्वर सुरक्षा विश्लेषण', detail: 'WHOIS आयु, रजिस्ट्रार और फ़िशिंग डेटाबेस की जांच' },
      mr: { label: 'डोमेन माहितीचे विश्लेषण', detail: 'WHOIS वय, नोंदणीकर्ता व फिशिंग तक्रारींची तपासणी' },
      bn: { label: 'ডোমেন তথ্য বিশ্লেষণ করা হচ্ছে', detail: 'WHOIS বয়স, রেজিস্ট্রার এবং ফিশিং রিপোর্ট পরীক্ষা' },
      te: { label: 'డొమైన్ సమాచారాన్ని విశ్లేషిస్తోంది', detail: 'WHOIS వయస్సు, రిజిస్ట్రార్ మరియు ఫిషింగ్ నివేదికల తనిఖీ' },
      ta: { label: 'டொமைன் தகவலை ஆய்வு செய்கிறது', detail: 'WHOIS வயது, பதிவாளர் மற்றும் ஃபிஷிங் அறிக்கைகள்' },
      gu: { label: 'ડોમેન માહિતીનું વિશ્લેષણ', detail: 'WHOIS આયુષ્ય, રજિસ્ટ્રાર અને ફિશિંગ રિપોર્ટ્સની ચકાસણી' },
      kn: { label: 'ಡೊಮೇನ್ ಮಾಹಿತಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ', detail: 'WHOIS ವಯಸ್ಸು, ರಿಜಿಸ್ಟ್ರಾರ್ ಮತ್ತು ಫಿಶಿಂಗ್ ವರದಿಗಳ ಪರಿಶೀಲನೆ' },
    }
  },
  {
    id: 5,
    titles: {
      en: { label: 'Detecting scam indicators', detail: 'Matching NLP against known 14,000+ Ponzi scripts' },
      hi: { label: 'घोटाला पैटर्न व एनएलपी जांच', detail: '14,000+ ज्ञात पोंजी और साइबर फ्रॉड स्क्रिप्ट से मिलान' },
      mr: { label: 'घोटाळ्याचे संकेत शोधत आहे', detail: '१४,०००+ ज्ञात पोंझी व आर्थिक फसवणूक नमुन्यांशी जुळवणी' },
      bn: { label: 'প্রতারণার লক্ষণ শনাক্তকরণ', detail: '১৪,০০০+ পরিচিত পনজি স্ক্রিপ্টের সাথে এনএলপি মিলানো হচ্ছে' },
      te: { label: 'మోసపూరిత సంకేతాలను గుర్తించడం', detail: '14,000+ తెలిసిన పోంజీ స్క్రిప్ట్‌లతో ఎన్‌ఎల్‌పీ పోలిక' },
      ta: { label: 'மோசடி அறிகுறிகளைக் கண்டறிதல்', detail: '14,000+ பொன்சி ஸ்கிரிப்ட்களுடன் என்எல்பீ ஒப்பீடு' },
      gu: { label: 'કૌભાંડના સંકેતો શોધવા', detail: '14,000+ જાણીતા પોન્ઝી સ્ક્રિપ્ટ્સ સામે એનએલપી સરખામણી' },
      kn: { label: 'ವಂಚನೆಯ ಲಕ್ಷಣಗಳನ್ನು ಪತ್ತೆಹಚ್ಚಲಾಗುತ್ತಿದೆ', detail: '14,000+ ಪರಿಚಿತ ಪೊಂಜಿ ಸ್ಕ್ರಿಪ್ಟ್‌ಗಳೊಂದಿಗೆ ಎನ್‌ಎಲ್‌ಪಿ ಹೋಲಿಕೆ' },
    }
  },
  {
    id: 6,
    titles: {
      en: { label: 'Generating risk assessment & safe advisory', detail: 'Synthesizing civic mitigation playbook & telemetry flags' },
      hi: { label: 'जोखिम आकलन व सुरक्षा सलाह तैयार करना', detail: 'नागरिक सुरक्षा प्लेबुक और टेलीमेट्री अलर्ट का संकलन' },
      mr: { label: 'जोखीम मूल्यांकन व सुरक्षा सल्ला तयार करणे', detail: 'नागरिक सुरक्षा मार्गदर्शन व इशारा अहवाल संकलन' },
      bn: { label: 'ঝুঁকি মূল্যায়ন ও সুরক্ষা পরামর্শ তৈরি', detail: 'নাগরিক সুরক্ষা গাইডলাইন ও সতর্কতা প্রতিবেদন তৈরি' },
      te: { label: 'రిస్క్ అసెస్‌మెంట్ & సేఫ్టీ అడ్వైజరీ', detail: 'పౌర భద్రతా ప్లేబుక్ మరియు టెలిమెట్రీ హెచ్చరికల సంకలనం' },
      ta: { label: 'ஆபத்து மதிப்பீடு & பாதுகாப்பு ஆலோசனைகள்', detail: 'குடிமக்கள் பாதுகாப்பு வழிகாட்டுதல் தயாரிப்பு' },
      gu: { label: 'જોખમ મૂલ્યાંકન અને સલાહ તૈયાર કરવી', detail: 'નાગરિક સુરક્ષા માર્ગદર્શિકા અને ચેતવણી અહેવાલ' },
      kn: { label: 'ಅಪಾಯದ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ಸುರಕ್ಷತಾ ಸಲಹೆ', detail: 'ನಾಗರಿಕ ಸುರಕ್ಷತಾ ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ಎಚ್ಚರಿಕೆಯ ವರದಿ' },
    }
  },
]


// UI strings for the result panel. English + Hindi; other UI languages fall back to English.
// NOTE: have a native Hindi speaker review these before any public demo.
const S = {
  en: {
    scanning: 'Forensic Scan Active', scanningSub: 'Running verification checks…',
    LOW: 'Low risk indicators', MEDIUM: 'Medium risk indicators', HIGH: 'High risk indicators', CRITICAL: 'Critical risk indicators',
    score: 'Risk score', evidence: 'What we found', noEvidence: 'No risk indicators were found in the checks we ran.',
    source: 'Source', points: 'pts', unavailable: 'Not checked', checks: 'Checks performed',
    ran: 'ran', failed: 'unavailable', skipped: 'not configured',
    listen: 'Listen', claims: 'Details we picked up', safeAction: 'What to do',
    feedback: 'Was this result right?', right: 'Looks right', wrong: 'Looks wrong',
    thanks: 'Thanks. Feedback does not change any score.', fbError: 'Could not send feedback.',
    reportEntity: 'Report This Entity', newScan: 'New Scan', cancel: 'Cancel Scan',
    errTitle: 'We could not complete this check', errBack: 'Back to Verify',
    target: 'Target Under Inspection', saved: 'Saved result', snapshot: 'SEBI registry snapshot',
    image: 'Screenshot', text: 'Message', url: 'Link', audio: 'Voice',
    progress: 'Verification Progress', wait: 'This may take a few seconds', privacy: 'Message text is not stored, only a hash',
    stepDone: 'Done', stepActive: 'In progress', stepPending: 'Queued',
  },
  hi: {
    scanning: 'जाँच जारी है', scanningSub: 'सत्यापन जाँच चल रही है…',
    LOW: 'कम जोखिम संकेत', MEDIUM: 'मध्यम जोखिम संकेत', HIGH: 'उच्च जोखिम संकेत', CRITICAL: 'अत्यधिक जोखिम संकेत',
    score: 'जोखिम स्कोर', evidence: 'हमें क्या मिला', noEvidence: 'हमारी की गई जाँचों में कोई जोखिम संकेत नहीं मिला।',
    source: 'स्रोत', points: 'अंक', unavailable: 'जाँच नहीं हो सकी', checks: 'की गई जाँचें',
    ran: 'पूरी', failed: 'उपलब्ध नहीं', skipped: 'चालू नहीं',
    listen: 'सुनें', claims: 'मिली जानकारी', safeAction: 'क्या करें',
    feedback: 'क्या यह नतीजा सही था?', right: 'सही लगता है', wrong: 'गलत लगता है',
    thanks: 'धन्यवाद। प्रतिक्रिया से कोई स्कोर नहीं बदलता।', fbError: 'प्रतिक्रिया नहीं भेजी जा सकी।',
    reportEntity: 'इसकी रिपोर्ट करें', newScan: 'नई जाँच', cancel: 'जाँच रद्द करें',
    errTitle: 'यह जाँच पूरी नहीं हो सकी', errBack: 'वापस जाएँ',
    target: 'जाँच का विषय', saved: 'सहेजा गया नतीजा', snapshot: 'SEBI रजिस्ट्री स्नैपशॉट',
    image: 'स्क्रीनशॉट', text: 'संदेश', url: 'लिंक', audio: 'आवाज़',
    progress: 'सत्यापन प्रगति', wait: 'इसमें कुछ सेकंड लग सकते हैं', privacy: 'संदेश का टेक्स्ट सहेजा नहीं जाता, केवल हैश',
    stepDone: 'पूर्ण', stepActive: 'जारी', stepPending: 'कतार में',
  },
}

const CHECK_LABELS = {
  sebi_registry: { en: 'SEBI registry', hi: 'SEBI रजिस्ट्री' },
  upi_handle_rule: { en: 'UPI handle rule', hi: 'UPI हैंडल नियम' },
  url_checks: { en: 'Link checks', hi: 'लिंक जाँच' },
  lookalike_check: { en: 'Lookalike websites', hi: 'मिलते-जुलते वेबसाइट नाम' },
  openphish: { en: 'OpenPhish feed', hi: 'OpenPhish सूची' },
  urlhaus: { en: 'URLhaus feed', hi: 'URLhaus सूची' },
  safe_browsing: { en: 'Google Safe Browsing', hi: 'Google Safe Browsing' },
  domain_age: { en: 'Website age', hi: 'वेबसाइट की उम्र' },
  language_signals: { en: 'Message wording', hi: 'संदेश की भाषा' },
  page_fetch: { en: 'Page fetch', hi: 'पेज लाना' },
}

const BAND_STYLE = {
  LOW: { color: 'var(--risk-safe-text)', bg: 'var(--risk-safe-bg)', icon: ShieldCheck },
  MEDIUM: { color: 'var(--risk-caution-text)', bg: 'var(--risk-caution-bg)', icon: ShieldAlert },
  HIGH: { color: 'var(--risk-danger-text)', bg: 'var(--risk-danger-bg)', icon: ShieldX },
  CRITICAL: { color: 'var(--risk-critical-text)', bg: 'var(--risk-critical-bg)', icon: ShieldX },
}
const SEVERITY_STYLE = {
  high: { color: 'var(--risk-danger-text)', bg: 'var(--risk-danger-bg)' },
  medium: { color: 'var(--risk-caution-text)', bg: 'var(--risk-caution-bg)' },
  low: { color: 'var(--color-on-surface-variant)', bg: 'var(--color-surface-container)' },
}

function Chip({ icon: Icon, children, mono = true }) {
  return (
    <span className={mono ? 'text-data-mono' : 'text-label-sm'} style={{
      display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 'var(--radius-full)',
      background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)', fontSize: 12,
    }}>
      <Icon size={12} /> {children}
    </span>
  )
}

export default function AnalysisProgress() {
  const { t, currentLang } = useLanguage()
  const lang = currentLang || 'en'
  const s = (k) => (S[lang] && S[lang][k]) || S.en[k]
  const navigate = useNavigate()
  const location = useLocation()
  const [params] = useSearchParams()
  const scanId = params.get('scan')

  const jobRef = useRef(location.state?.job || null)
  const startedRef = useRef(false)
  const [result, setResult] = useState(location.state?.result || null)
  const [target, setTarget] = useState(location.state?.target || null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(6)
  const [feedback, setFeedback] = useState(null) // null | 'sending' | 'done' | 'error'
  const [speaking, setSpeaking] = useState(false)

  const run = useCallback(() => {
    const job = jobRef.current
    if (!job) return
    setError(null)
    setProgress(6)
    const tgt = { inputType: job.inputType, preview: previewOf(job) }
    setTarget(tgt)
    analyze(job, lang)
      .then(res => {
        addToHistory({ id: res.scan_id, inputType: job.inputType, preview: tgt.preview, score: res.score, band: res.band, ts: Date.now() })
        setResult(res)
        jobRef.current = null // do not re-run on refresh; the saved scan is re-fetched by id instead
        navigate(`/analysis?scan=${res.scan_id}`, { replace: true, state: { result: res, target: tgt } })
      })
      .catch(e => setError(e))
  }, [lang, navigate])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    if (result) return
    if (jobRef.current) { run(); return }
    if (scanId) {
      const known = loadHistory().find(h => h.id === scanId)
      if (known) setTarget({ inputType: known.inputType, preview: known.preview })
      getScan(scanId).then(setResult).catch(e => setError(e))
      return
    }
    navigate('/verify', { replace: true })
  }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // Progress is an honest "working" indicator: it creeps up while waiting and snaps to 100 on a real result.
  useEffect(() => {
    if (result || error) return
    const id = setInterval(() => setProgress(p => Math.min(p + (p < 60 ? 4 : p < 85 ? 2 : 0.4), 94)), 400)
    return () => clearInterval(id)
  }, [result, error])
  useEffect(() => { if (result) setProgress(100) }, [result])

  const complete = !!result
  const band = result?.band
  const bs = band ? BAND_STYLE[band] : null
  const circumference = 276.46
  const dashoffset = circumference - (circumference * Math.min(progress, 100) / 100)
  const BandIcon = bs?.icon || Shield
  const accent = bs ? bs.color : 'var(--color-primary)'
  const explanation = result ? (lang === 'hi' ? result.explanation.hi : result.explanation.en) : ''
  const safeAction = result ? (lang === 'hi' ? (result.safe_action_hi || result.safe_action) : result.safe_action) : ''

  const statusText = { done: s('stepDone'), active: s('stepActive'), pending: s('stepPending') }

  const onListen = async () => {
    if (!result || speaking) return
    setSpeaking(true)
    const text = `${explanation} ${safeAction}`.trim()
    const sl = lang === 'hi' ? 'hi' : 'en'
    try {
      const out = await speak(text, sl)
      if (out.audio) {
        const a = new Audio(URL.createObjectURL(out.audio))
        a.onended = () => setSpeaking(false)
        await a.play()
        return
      }
      // Server TTS unavailable: use the browser's voice (text only comes back from the server).
      const u = new SpeechSynthesisUtterance(out.text)
      u.lang = out.lang === 'hi' ? 'hi-IN' : 'en-IN'
      u.onend = () => setSpeaking(false)
      window.speechSynthesis.speak(u)
    } catch {
      setSpeaking(false)
    }
  }

  const onFeedback = async (verdict) => {
    if (!result?.scan_id) return
    setFeedback('sending')
    try { await sendReport(result.scan_id, verdict); setFeedback('done') } catch { setFeedback('error') }
  }

  const claims = result?.claims
  const typeLabel = target ? s(target.inputType) : s('saved')

  return (
    <PageTransition>
      <div className="container-max" style={{
        padding: 'var(--space-xl) var(--margin)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -120, left: -80, width: 380, height: 380, borderRadius: '50%', background: 'rgba(220,225,255,0.25)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '50%', right: -120, width: 300, height: 300, borderRadius: '50%', background: 'rgba(220,225,255,0.2)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            width: '100%', maxWidth: 680, background: 'var(--color-surface-container-lowest)',
            borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-hover)',
            padding: 'var(--space-xl)', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 10,
          }}
        >
          {error ? (
            <div role="alert" style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, margin: '0 auto var(--space-md)', borderRadius: '50%', background: 'var(--color-error-container)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={30} />
              </div>
              <h1 className="text-headline-md" style={{ margin: '0 0 8px' }}>{s('errTitle')}</h1>
              <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', margin: '0 auto', maxWidth: 460 }}>{error.message}</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 'var(--space-lg)' }}>
                {jobRef.current && (
                  <button onClick={run} className="btn btn-primary" style={{ padding: '10px 22px', borderRadius: 'var(--radius-lg)', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                    <RefreshCw size={16} style={{ marginRight: 6, verticalAlign: -3 }} />Retry
                  </button>
                )}
                <button onClick={() => navigate('/verify')} style={{ padding: '10px 22px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container)', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                  {s('errBack')}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Header: ring, badge, headline */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ position: 'relative', width: 112, height: 112, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-md)' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,55,177,0.08)', animation: complete ? 'none' : 'pulse-ring 2s ease-in-out infinite' }} />
                  <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="44" fill="none" stroke="var(--color-surface-container)" strokeWidth="4" />
                    <circle cx="50" cy="50" r="44" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={complete ? circumference - circumference * (result.score / 100) : dashoffset}
                      style={{ transition: 'stroke-dashoffset 0.6s ease-out, stroke 0.3s' }} />
                  </svg>
                  <div style={{
                    position: 'relative', width: 64, height: 64, borderRadius: '50%',
                    background: complete ? bs.bg : 'var(--color-primary-container)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: complete ? bs.color : 'var(--color-on-primary)', transition: 'all 0.3s',
                  }}>
                    <BandIcon size={28} style={complete ? undefined : { animation: 'pulse-ring 2s infinite' }} />
                  </div>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-xs)', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: complete ? bs.bg : 'rgba(220,225,255,0.5)', marginBottom: 'var(--space-xs)' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: accent, animation: complete ? 'none' : 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
                  <span className="text-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: complete ? bs.color : 'var(--color-on-primary-fixed)', fontWeight: 700 }}>
                    {complete ? s(band) : s('scanning')}
                  </span>
                </div>

                <h1 className="text-headline-md" style={{ color: 'var(--color-on-surface)', margin: '4px 0' }}>
                  {complete ? `${s('score')}: ${result.score}/100` : (t.analysis?.subtitle || s('scanningSub'))}
                </h1>
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 4, maxWidth: 520 }}>
                  {complete ? result.summary_note : s('wait')}
                </p>
              </div>

              {/* Target info */}
              <div style={{ marginTop: 'var(--space-lg)', borderRadius: 'var(--radius-default)', background: 'var(--color-surface-container-low)', padding: 'var(--space-md)', display: 'flex', alignItems: 'flex-start', gap: 'var(--space-sm)' }}>
                <div style={{ padding: 8, borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-container-highest)', color: 'var(--color-primary)', flexShrink: 0 }}>
                  <Cpu size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span className="text-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-on-surface-variant)' }}>{s('target')}</span>
                  <p className="text-body-md" style={{ fontWeight: 600, color: 'var(--color-on-surface)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {typeLabel}{target?.preview ? ` • ${target.preview}` : result ? ` • ${result.scan_id.slice(0, 8)}` : ''}
                  </p>
                  {claims && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                      {claims.sebi_numbers.map(v => <Chip key={v} icon={Landmark}>{v}</Chip>)}
                      {claims.names.map(v => <Chip key={v} icon={User} mono={false}>{v}</Chip>)}
                      {claims.upi_ids.map(v => <Chip key={v} icon={Wallet}>{v}</Chip>)}
                      {claims.phones.map(v => <Chip key={v} icon={Phone}>{v}</Chip>)}
                      {claims.domains.map(v => <Chip key={v} icon={Link2}>{v}</Chip>)}
                      {claims.return_claims.map((r, i) => <Chip key={i} icon={TrendingUp}>{r.pct}%{r.period ? ` / ${r.period}` : ''}</Chip>)}
                    </div>
                  )}
                </div>
              </div>

              {!complete ? (
                <>
                  {/* Steps while waiting (labels only; no invented details) */}
                  <div style={{ marginTop: 'var(--space-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                    {FORENSIC_STEPS.map((st, i) => {
                      const threshold = ((i + 1) / FORENSIC_STEPS.length) * 100
                      let status = 'pending'
                      if (progress >= threshold) status = 'done'
                      else if (progress >= threshold - (100 / FORENSIC_STEPS.length)) status = 'active'
                      const content = st.titles[lang] || st.titles.en
                      return (
                        <motion.div key={st.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08, duration: 0.3 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-default)', background: status === 'active' ? 'rgba(220,225,255,0.3)' : 'var(--color-surface-container-lowest)', opacity: status === 'pending' ? 0.6 : 1, transition: 'all 0.3s' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: status === 'done' ? 'var(--color-tertiary-fixed)' : status === 'active' ? 'var(--color-primary-container)' : 'var(--color-surface-container-high)', color: status === 'done' ? 'var(--color-on-tertiary-fixed)' : status === 'active' ? 'var(--color-on-primary)' : 'var(--color-outline)' }}>
                            {status === 'done' && <Check size={14} />}
                            {status === 'active' && <RefreshCw size={14} style={{ animation: 'rotate-slow 1s linear infinite' }} />}
                            {status === 'pending' && <Clock size={14} />}
                          </div>
                          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                            <span className="text-label-md" style={{ color: status === 'active' ? 'var(--color-primary)' : 'var(--color-on-surface)', fontWeight: status === 'active' ? 700 : 500 }}>{content.label}</span>
                            <span className="text-label-sm" style={{ fontWeight: 600, color: status === 'done' ? 'var(--color-tertiary)' : status === 'active' ? 'var(--color-primary)' : 'var(--color-outline)' }}>{statusText[status]}</span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: 'var(--space-lg)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                      <span className="text-label-md" style={{ fontWeight: 600 }}>{s('progress')}</span>
                      <span className="text-data-mono" style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{Math.round(progress)}%</span>
                    </div>
                    <div style={{ width: '100%', height: 12, background: 'var(--color-surface-container-high)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }}
                        style={{ height: '100%', borderRadius: 'var(--radius-full)', background: 'linear-gradient(90deg, var(--color-primary), var(--color-primary-container))' }} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Explanation + safe action */}
                  <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', borderRadius: 'var(--radius-default)', border: `1px solid ${accent}`, background: bs.bg }}>
                    <p className="text-body-md" style={{ margin: 0, color: 'var(--color-on-surface)' }}>{explanation}</p>
                    <p className="text-body-md" style={{ margin: '8px 0 0', fontWeight: 700, color: bs.color }}>
                      {s('safeAction')}: {safeAction}
                    </p>
                    <button onClick={onListen} disabled={speaking} style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container-lowest)', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                      <Volume2 size={14} /> {s('listen')}
                    </button>
                  </div>

                  {/* Evidence */}
                  <div style={{ marginTop: 'var(--space-lg)' }}>
                    <h2 className="text-headline-sm" style={{ margin: '0 0 var(--space-sm)' }}>{s('evidence')}</h2>
                    {result.evidence.length === 0 ? (
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{s('noEvidence')}</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {result.evidence.map((e, i) => {
                          const sev = SEVERITY_STYLE[e.severity] || SEVERITY_STYLE.low
                          const off = e.status === 'unavailable'
                          return (
                            <div key={`${e.code}-${i}`} style={{ padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-default)', background: 'var(--color-surface-container-low)', opacity: off ? 0.7 : 1, borderLeft: `4px solid ${off ? 'var(--color-outline-variant)' : sev.color}` }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                                <span className="text-label-lg" style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{e.title}</span>
                                <span className="text-label-sm" style={{ whiteSpace: 'nowrap', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: off ? 'var(--color-surface-container)' : sev.bg, color: off ? 'var(--color-on-surface-variant)' : sev.color, fontWeight: 700 }}>
                                  {off ? s('unavailable') : `+${e.weight} ${s('points')}`}
                                </span>
                              </div>
                              <p className="text-body-sm" style={{ margin: '4px 0 0', color: 'var(--color-on-surface-variant)' }}>{e.detail}</p>
                              <span className="text-label-sm" style={{ color: 'var(--color-outline)' }}>{s('source')}: {e.source}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Checks performed (coverage) */}
                  <div style={{ marginTop: 'var(--space-lg)' }}>
                    <span className="text-label-md" style={{ fontWeight: 700 }}>{s('checks')} ({result.coverage.ran}/{result.coverage.planned})</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {result.coverage.checks.map(c => {
                        const label = (CHECK_LABELS[c.name] || {})[lang] || (CHECK_LABELS[c.name] || {}).en || c.name
                        const ok = c.status === 'ran'
                        return (
                          <span key={c.name} className="text-label-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 'var(--radius-full)', background: ok ? 'var(--risk-safe-bg)' : 'var(--color-surface-container)', color: ok ? 'var(--risk-safe-text)' : 'var(--color-on-surface-variant)' }}>
                            {ok ? <Check size={11} /> : <Clock size={11} />} {label} · {s(c.status === 'ran' ? 'ran' : c.status === 'skipped' ? 'skipped' : 'failed')}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  {/* Feedback */}
                  <div style={{ marginTop: 'var(--space-lg)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
                    <span className="text-label-md" style={{ fontWeight: 600 }}>{s('feedback')}</span>
                    {feedback === 'done' ? (
                      <span className="text-label-sm" style={{ color: 'var(--color-tertiary)' }}>{s('thanks')}</span>
                    ) : (
                      <>
                        <button disabled={feedback === 'sending'} onClick={() => onFeedback('confirm')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container-lowest)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}><ThumbsUp size={14} /> {s('right')}</button>
                        <button disabled={feedback === 'sending'} onClick={() => onFeedback('dispute')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container-lowest)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}><ThumbsDown size={14} /> {s('wrong')}</button>
                        {feedback === 'error' && <span className="text-label-sm" style={{ color: 'var(--color-error)' }}>{s('fbError')}</span>}
                      </>
                    )}
                  </div>

                  <p className="text-label-sm" style={{ marginTop: 'var(--space-md)', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Lock size={12} /> {s('privacy')} • {s('snapshot')}: {result.data_freshness?.sebi_snapshot || '—'}
                  </p>
                  <p className="text-label-sm" style={{ margin: '4px 0 0', color: 'var(--color-on-surface-variant)' }}>{result.disclaimer}</p>
                </>
              )}

              {/* Actions */}
              <div style={{ marginTop: 'var(--space-lg)', paddingTop: 'var(--space-sm)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-md)' }}>
                {complete ? (
                  <>
                    {band !== 'LOW' && (
                      <button onClick={() => navigate('/report')} style={{ padding: '12px 24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-error)', color: 'var(--color-on-error)', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', boxShadow: '0 2px 8px rgba(186,26,26,0.3)', border: 'none', cursor: 'pointer' }}>
                        <ShieldX size={18} /><span>{s('reportEntity')}</span>
                      </button>
                    )}
                    <button onClick={() => navigate('/verify')} style={{ padding: '12px 24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container)', color: 'var(--color-on-surface)', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer' }}>
                      {s('newScan')}
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate('/verify')} style={{ padding: '10px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-container)', color: 'var(--color-on-surface-variant)', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                      {s('cancel')}
                    </button>
                    <a href="tel:1930" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', color: 'var(--color-error)', fontWeight: 600, fontSize: 13, textDecoration: 'none' }}>
                      <Phone size={16} /><span>{t.report?.call1930 || 'Need urgent assistance? Call 1930'}</span>
                    </a>
                  </>
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Info cards: only statements that are true of this backend */}
        <div style={{ marginTop: 'var(--space-lg)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', maxWidth: 680, width: '100%' }}>
          {[
            { icon: Cpu, label: s('snapshot'), value: result?.data_freshness?.sebi_snapshot || '—' },
            { icon: Database, label: 'Data Handling', value: lang === 'hi' ? 'केवल हैश सहेजा जाता है' : 'Hash only, no raw text stored' },
            { icon: Network, label: s('checks'), value: result ? `${result.coverage.ran}/${result.coverage.planned}` : '…' },
          ].map(card => (
            <div key={card.label} style={{ background: 'var(--color-surface-container-lowest)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-default)', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', boxShadow: 'var(--shadow-card)' }}>
              <card.icon size={18} style={{ color: 'var(--color-primary)' }} />
              <div>
                <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{card.label}</span>
                <span className="text-body-sm" style={{ display: 'block', fontWeight: 500, color: 'var(--color-on-surface)' }}>{card.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
