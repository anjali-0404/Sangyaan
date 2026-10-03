import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ShieldCheck, ShieldAlert, ShieldX, Verified,
  ScanSearch, Link2, MessageSquare, Mic, ArrowRight,
  PlayCircle, Wallet, Handshake, Lock, Search,
  ClipboardPaste, Ban, AlertTriangle, CircleAlert,
  CheckCircle, TrendingUp, Phone, Cpu, Radio, Zap,
  ExternalLink, FileCheck, Activity, Sparkles, HelpCircle,
  Clock, Award, ChevronRight, ChevronDown, Check,
  Layers, Database, FileSpreadsheet, Eye, AlertOctagon
} from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { useLanguage } from '../context/LanguageContext'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.45, delay, ease: 'easeOut' },
})

const SAMPLE_QUERIES = [
  { label: 'paytm-refund-support@ybl', value: 'paytm-refund-support@ybl', type: 'danger' },
  { label: 'sebi-online-kyc-verify.in', value: 'https://sebi-online-kyc-verify.in', type: 'danger' },
  { label: 'ARN-88321 (Mutual Fund)', value: 'ARN-88321', type: 'safe' },
]

// Interactive simulated scam scenarios for the live hero widget
const SIMULATED_SCENARIOS = [
  {
    id: 'qr',
    title: 'Fake WhatsApp Refund QR',
    titleHi: 'फर्जी व्हाट्सएप रिफंड क्यूआर',
    sender: 'paytm-care-refunds@okaxis',
    risk: 96,
    verdict: 'Malicious Reverse-Charge QR Trap',
    details: 'QR is programmed to debit ₹25,000 from user account instead of crediting refund. The VPA is linked to an unverified private savings account in Jamtara hub.',
    evidence: 'VPA Registry: Unregistered Individual • Previous 1930 Reports: 14',
    action: 'DO NOT SCAN OR PAY • Call 1930 to blacklist VPA'
  },
  {
    id: 'sebi',
    title: 'Forged SEBI VIP Tip Group',
    titleHi: 'फर्जी सेबी टेलीग्राम वीआईपी ग्रुप',
    sender: 't.me/sebi_approved_sure_profit',
    risk: 94,
    verdict: 'Cloned Regulatory Registration',
    details: 'Scammers using forged certificate of genuine entity "Motilal Oswal Financial Services" with altered PAN and fake stamp promising 500% weekly return.',
    evidence: 'SEBI SCORES Database: Certificate Number Forged • Barred Entity',
    action: 'Exit Group • Block Admin • Submit to I4C Cyber Portal'
  },
  {
    id: 'apk',
    title: 'Electricity Bill Cutoff APK',
    titleHi: 'बिजली बिल कटने का एपीके वायरस',
    sender: 'SMS from BP-SBIPAY: bit.ly/bijli-bill-pay',
    risk: 99,
    verdict: 'Critical Trojan Banking Sideload',
    details: 'Link installs a malicious APK file that secretly reads incoming SMS OTPs and gains remote screen access via accessibility permissions.',
    evidence: 'SHA256 Malware Signature Match • Domain registered 48 hrs ago',
    action: 'Do Not Install • Turn on Google Play Protect • Report URL'
  },
  {
    id: 'arrest',
    title: 'Digital Arrest CBI Threat',
    titleHi: 'डिजिटल अरेस्ट सीबीआई ब्लैकमेल',
    sender: 'WhatsApp Video Call: +91 98831 09211',
    risk: 98,
    verdict: 'Coercive Social Engineering Fraud',
    details: 'Fraudster impersonates Mumbai Police/CBI claiming passport caught with narcotics in courier. Pressures victim into transferring funds to "RBI Verification Account".',
    evidence: 'CBI Directive: No law agency conducts video call arrest or asks for money transfer',
    action: 'Disconnect Immediately • Do Not Transfer • Dial 1930'
  }
]

export default function HomePage() {
  const { t, currentLang } = useLanguage()
  const [query, setQuery] = useState('')
  const [resultVisible, setResultVisible] = useState(false)
  const [resultType, setResultType] = useState('danger')
  const [activeScenario, setActiveScenario] = useState(SIMULATED_SCENARIOS[0])
  const [openFaq, setOpenFaq] = useState(null)
  const navigate = useNavigate()

  const runCheck = (val) => {
    const v = (val !== undefined ? val : query).trim().toLowerCase()
    if (!v) return
    setQuery(val !== undefined ? val : query)
    const isSafe = v.includes('arn') || v.includes('registered') || v.includes('agency') || v.includes('hdfc') || v.includes('sbi.co.in')
    setResultType(isSafe ? 'safe' : 'danger')
    setResultVisible(true)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text) {
        setQuery(text)
        runCheck(text)
      }
    } catch {
      const sample = 'paytm-refund-support@ybl'
      setQuery(sample)
      runCheck(sample)
    }
  }

  // 4 Primary Multi-Modal Action Cards using dynamic translations
  const actionCards = [
    {
      icon: ScanSearch,
      label: t.actions?.card1Title || 'Upload Screenshot',
      desc: t.actions?.card1Desc || 'Scan WhatsApp chats, Telegram groups, payment receipts & app mockups.',
      tag: t.actions?.card1Tag || 'Instant OCR',
      color: '#1f4fd8',
      bgColor: '#e8f0fe',
      action: t.actions?.card1Action || 'Scan Document',
      tab: 'screenshot',
    },
    {
      icon: Link2,
      label: t.actions?.card2Title || 'Check a Link',
      desc: t.actions?.card2Desc || 'Inspect suspicious investment portals, fake APK downloads & malicious URLs.',
      tag: t.actions?.card2Tag || 'Domain & SSL',
      color: '#0891b2',
      bgColor: '#cffafe',
      action: t.actions?.card2Action || 'Analyze URL',
      tab: 'link',
    },
    {
      icon: MessageSquare,
      label: t.actions?.card3Title || 'Paste Message',
      desc: t.actions?.card3Desc || 'Detect Ponzi patterns, fake job offers, and guaranteed return traps.',
      tag: t.actions?.card3Tag || 'NLP Fraud Model',
      color: '#d97706',
      bgColor: '#fef3c7',
      action: t.actions?.card3Action || 'Inspect Text',
      tab: 'message',
    },
    {
      icon: Mic,
      label: t.actions?.card4Title || 'Record Voice',
      desc: t.actions?.card4Desc || 'Analyze recorded calls, extortion audio notes, and fake police threats.',
      tag: t.actions?.card4Tag || 'Bilingual Audio',
      color: '#4f46e5',
      bgColor: '#e0e7ff',
      action: t.actions?.card4Action || 'Analyze Audio',
      tab: 'voice',
    },
  ]

  // How It Works Steps
  const howSteps = [
    {
      step: '01',
      icon: ScanSearch,
      title: t.howItWorks?.step1Title || '1. Submit Input',
      desc: t.howItWorks?.step1Desc || 'Paste suspect UPI ID, website link, phone number, chat screenshot, or audio clip.',
      badge: 'Zero-Storage Privacy',
    },
    {
      step: '02',
      icon: Cpu,
      title: t.howItWorks?.step2Title || '2. Multi-Registry AI Verification',
      desc: t.howItWorks?.step2Desc || 'Instant cross-match with SEBI broker databases, NPCI UPI registries, and I4C incident repository.',
      badge: '12+ Fraud Models',
    },
    {
      step: '03',
      icon: ShieldCheck,
      title: t.howItWorks?.step3Title || '3. Actionable Defense Verdict',
      desc: t.howItWorks?.step3Desc || 'Get instant risk score (0-100), 1930 fraud freeze guide, and downloadable FIR evidence dossier.',
      badge: 'Golden Hour Protocol',
    },
  ]

  // Threat Telemetry Alerts
  const alerts = [
    {
      type: 'Phishing APK Distribution',
      title: t.threatRadar?.alert1Title || 'Fake SBI Rewards APK Alert',
      desc: t.threatRadar?.alert1Desc || 'Malicious SMS posing as bank rewards app siphoning OTPs and credentials via overlay injection.',
      riskLevel: 'Critical 98/100',
      riskBg: '#fef2f2',
      riskColor: '#dc2626',
      status: 'Blocked by NPCI',
      time: 'Reported 12m ago',
      code: 'SHA256: 9f8a...3b21',
      icon: Ban,
    },
    {
      type: 'Telegram Investment Scam',
      title: t.threatRadar?.alert2Title || 'Telegram Part-Time Task Fraud',
      desc: t.threatRadar?.alert2Desc || 'Fraudsters promising ₹3,500 daily for liking YouTube videos, demanding prepaid task deposits.',
      riskLevel: 'High Risk 92/100',
      riskBg: '#fffbeb',
      riskColor: '#d97706',
      status: 'Scam Network Flagged',
      time: 'Reported 35m ago',
      code: 'UPI: parttimepay@icici',
      icon: AlertTriangle,
    },
    {
      type: 'Digital Arrest Cyber Extortion',
      title: t.threatRadar?.alert3Title || 'Digital Arrest CBI / Police Impersonation',
      desc: t.threatRadar?.alert3Desc || 'Video call extortion claiming suspicious courier with contraband; demanding settlement money transfer.',
      riskLevel: 'Critical 99/100',
      riskBg: '#fef2f2',
      riskColor: '#dc2626',
      status: 'I4C Urgent Notice',
      time: 'Active Pattern Alert',
      code: 'Helpline: 1930 Priority',
      icon: CircleAlert,
    },
  ]

  // Citizen FAQ items
  const faqs = [
    {
      q: 'Is my personal data or bank account number saved on Sangyan Shield?',
      a: 'Never. All uploaded screenshots, links, and messages are processed in volatile memory (RAM) and permanently discarded immediately after generating the cryptographic verification score.'
    },
    {
      q: 'How does Sangyan Shield verify SEBI licenses and UPI handles so fast?',
      a: 'We query real-time public telemetry feeds from NPCI VPA resolvers, SEBI SCORES directory of registered intermediaries, and the National Cyber Crime Reporting Portal repository in sub-second API pipelines.'
    },
    {
      q: 'What should I do if I already sent money to a fraudster?',
      a: 'Act within the "Golden Hour" (first 2 hours). Immediately call 1930 (National Cyber Helpline) or use our "Report Fraud" page to generate an official FIR Evidence Dossier so nodal banks can freeze the destination account.'
    },
    {
      q: 'Is Sangyan Shield free for all Indian citizens?',
      a: 'Yes. Sangyan Shield is 100% free of charge and built as an open civic resilience initiative for Digital India, supporting 8 Indian regional languages.'
    }
  ]

  return (
    <PageTransition>
      {/* ── Hero Section (Luminous Deep Navy Aurora) ──────── */}
      <section style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 15%, #183380 0%, #0b132b 85%)',
        color: '#ffffff',
        padding: 'clamp(44px, 8vw, 88px) 0 clamp(54px, 9vw, 96px)',
      }}>
        {/* Subtle Cyber Grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.07, pointerEvents: 'none' }}>
          <svg width="100%" height="100%">
            <defs>
              <pattern id="hero-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                <path d="M 44 0 L 0 0 0 44" fill="none" stroke="currentColor" strokeWidth="1" />
                <circle cx="22" cy="22" r="1.5" fill="currentColor" opacity="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        {/* Ambient Glow Orbs */}
        <div style={{
          position: 'absolute', top: '10%', left: '15%', width: 440, height: 440,
          background: 'rgba(31, 79, 216, 0.28)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '15%', width: 400, height: 400,
          background: 'rgba(16, 185, 129, 0.18)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none'
        }} />

        <div className="container-max" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{
            maxWidth: 900,
            margin: '0 auto',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-md)'
          }}>
            <motion.div {...fadeUp()} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-md)' }}>
              
              {/* Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
              }}>
                <span style={{ position: 'relative', display: 'flex', width: 9, height: 9 }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10b981', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.8 }} />
                  <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', width: 9, height: 9, background: '#10b981' }} />
                </span>
                <span className="text-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, color: '#dbeafe' }}>
                  {t.hero?.badge || 'AI-POWERED BHARAT CYBER DEFENSE'}
                </span>
              </div>

              {/* Title */}
              <h1 className="hero-title-responsive" style={{
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 'clamp(1.8rem, 4.5vw, 3.2rem)',
                lineHeight: 1.22,
                maxWidth: 840,
                letterSpacing: '-0.02em',
                textShadow: '0 2px 14px rgba(0,0,0,0.3)'
              }}>
                {t.hero?.title || 'संदेश, लिंक या निवेश सलाह की जांच करें धोखाधड़ी से पहले!'}
              </h1>

              {/* Subtitle */}
              <p style={{
                color: '#93c5fd',
                fontWeight: 600,
                fontSize: 'clamp(1.05rem, 2.5vw, 1.25rem)',
                margin: '2px 0 0',
                lineHeight: 1.4
              }}>
                {t.hero?.subtitle || 'सुरक्षित और सशक्त भारत के लिए एआई-संचालित संज्ञान प्रणाली'}
              </p>

              {/* Description */}
              <p style={{
                color: 'rgba(226, 232, 240, 0.92)',
                maxWidth: 700,
                fontSize: 'clamp(0.92rem, 2vw, 1.05rem)',
                lineHeight: 1.65,
                margin: 0
              }}>
                {t.hero?.desc || 'व्हाट्सएप फॉरवर्ड, टेलीग्राम ट्रेडिंग ग्रुप, सेबी पंजीकरण और यूपीआई हैंडल की तुरंत जांच करें। हर नागरिक के लिए निःशुल्क शून्य-ट्रस्ट सुरक्षा।'}
              </p>

              {/* CTA Buttons */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 'var(--space-md)',
                paddingTop: 'var(--space-xs)'
              }}>
                <Link
                  to="/verify"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 28px',
                    borderRadius: 'var(--radius-xl)',
                    background: '#ffffff',
                    color: '#0f1f54',
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.35)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)'
                  }}
                >
                  <ShieldCheck size={20} color="#1f4fd8" />
                  <span>{t.hero?.startBtn || 'सत्यापन शुरू करें'}</span>
                  <ArrowRight size={18} />
                </Link>

                <button
                  type="button"
                  onClick={() => navigate('/learn')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '14px 26px',
                    borderRadius: 'var(--radius-xl)',
                    background: 'rgba(255, 255, 255, 0.12)',
                    backdropFilter: 'blur(8px)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 15,
                    transition: 'background 0.2s, transform 0.2s',
                    border: '1px solid rgba(255, 255, 255, 0.28)',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <PlayCircle size={20} />
                  <span>{t.hero?.learnBtn || 'जागरूकता पाठ देखें'}</span>
                </button>
              </div>

              {/* Trust Metrics Pill Strip */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 16,
                paddingTop: 'var(--space-md)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e0e7ff', fontSize: 13, fontWeight: 600 }}>
                  <Verified size={16} color="#34d399" />
                  <span>{t.hero?.stat1 || '3.2 लाख+ फ्रॉड रोके गए'}</span>
                </div>
                <span style={{ opacity: 0.35, color: '#ffffff' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e0e7ff', fontSize: 13, fontWeight: 600 }}>
                  <Wallet size={16} color="#60a5fa" />
                  <span>{t.hero?.stat2 || '₹42 करोड़ की बचत'}</span>
                </div>
                <span style={{ opacity: 0.35, color: '#ffffff' }}>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#e0e7ff', fontSize: 13, fontWeight: 600 }}>
                  <Handshake size={16} color="#fbbf24" />
                  <span>{t.hero?.stat3 || 'नागरिकों के लिए 100% निःशुल्क'}</span>
                </div>
              </div>

            </motion.div>
          </div>
        </div>
      </section>

      {/* ── 4 Primary Multi-Modal Action Cards ────────────── */}
      <section className="container-max" style={{ marginTop: -38, position: 'relative', zIndex: 25 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--space-md)'
        }}>
          {actionCards.map((card, i) => (
            <motion.div key={card.tab} {...fadeUp(i * 0.08)}>
              <Link
                to={`/verify?tab=${card.tab}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '24px 22px',
                  borderRadius: 'var(--radius-xl)',
                  background: '#ffffff',
                  boxShadow: '0 8px 24px rgba(15, 31, 84, 0.08)',
                  border: '1px solid rgba(196, 197, 215, 0.45)',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  height: '100%',
                  textDecoration: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 16px 36px rgba(31, 79, 216, 0.14)'
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.borderColor = 'rgba(31, 79, 216, 0.35)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 31, 84, 0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.borderColor = 'rgba(196, 197, 215, 0.45)'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: 'var(--radius-lg)',
                      background: card.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color,
                    }}>
                      <card.icon size={24} />
                    </div>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: `${card.bgColor}`,
                      color: card.color,
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {card.tag}
                    </span>
                  </div>

                  <div>
                    <h3 style={{
                      color: 'var(--color-on-surface)',
                      fontWeight: 700,
                      fontSize: 17,
                      margin: '0 0 6px 0',
                      lineHeight: 1.3
                    }}>
                      {card.label}
                    </h3>
                    <p style={{
                      color: 'var(--color-on-surface-variant)',
                      fontSize: 13,
                      margin: 0,
                      lineHeight: 1.55
                    }}>
                      {card.desc}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 18,
                  color: card.color,
                  fontWeight: 700,
                  fontSize: 13
                }}>
                  <span>{card.action}</span>
                  <ArrowRight size={15} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Interactive Live Threat Simulator ("Beauty & Wow" Element) ── */}
      <section className="container-max" style={{ marginTop: 'clamp(48px, 8vw, 76px)' }}>
        <div style={{
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, #0b132b 0%, #15275e 100%)',
          color: '#ffffff',
          padding: 'clamp(24px, 5vw, 42px)',
          boxShadow: '0 16px 40px rgba(15, 31, 84, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Ambient circuit glow */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 280, height: 280, borderRadius: '50%', background: 'rgba(31, 79, 216, 0.25)', filter: 'blur(70px)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 24 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'rgba(56, 189, 248, 0.2)', borderRadius: 9999, color: '#38bdf8', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
                <Sparkles size={13} />
                INTERACTIVE SIMULATION LAB • लाइव सिमुलेशन
              </div>
              <h2 style={{ fontSize: 'clamp(1.35rem, 3.2vw, 1.9rem)', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Test How Sangyan Shield Decodes Scams
              </h2>
            </div>

            <div style={{ fontSize: 13, color: '#94a3b8' }}>
              Click any scenario to simulate real-time neural verification:
            </div>
          </div>

          {/* Scenario Selector Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
            {SIMULATED_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                type="button"
                onClick={() => setActiveScenario(scen)}
                style={{
                  padding: '9px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: activeScenario.id === scen.id ? '#ffffff' : 'rgba(255, 255, 255, 0.08)',
                  color: activeScenario.id === scen.id ? '#0b132b' : '#e2e8f0',
                  fontWeight: 700,
                  fontSize: 13,
                  border: activeScenario.id === scen.id ? 'none' : '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  transition: 'all 0.2s ease',
                  boxShadow: activeScenario.id === scen.id ? '0 4px 14px rgba(0,0,0,0.25)' : 'none'
                }}
              >
                <span>{scen.title}</span>
                <span style={{
                  padding: '2px 6px',
                  borderRadius: 999,
                  background: activeScenario.id === scen.id ? '#ef4444' : 'rgba(239, 68, 68, 0.3)',
                  color: '#ffffff',
                  fontSize: 10,
                  fontWeight: 800
                }}>
                  {scen.risk}%
                </span>
              </button>
            ))}
          </div>

          {/* Simulated Inspection Dashboard Screen */}
          <motion.div
            key={activeScenario.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'rgba(11, 19, 43, 0.75)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: 'clamp(18px, 4vw, 26px)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f87171', fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
                  <AlertOctagon size={16} />
                  <span>{activeScenario.verdict}</span>
                </div>

                <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                  Inspected Target:
                </div>
                <code style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: 6,
                  color: '#67e8f9',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  marginBottom: 12
                }}>
                  {activeScenario.sender}
                </code>

                <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 14px' }}>
                  {activeScenario.details}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  borderRadius: 8,
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  fontSize: 12.5,
                  fontWeight: 600
                }}>
                  <ShieldAlert size={16} style={{ flexShrink: 0 }} />
                  <span>{activeScenario.action}</span>
                </div>
              </div>

              {/* Forensic Telemetry Panel */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                    AI Threat Score
                  </span>
                  <span style={{ fontSize: 20, fontWeight: 800, color: '#f87171' }}>
                    {activeScenario.risk}/100
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${activeScenario.risk}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }}
                  />
                </div>

                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase' }}>
                  Registry Telemetry:
                </div>
                <div style={{ fontSize: 12, color: '#e2e8f0', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: 6, fontFamily: 'monospace' }}>
                  {activeScenario.evidence}
                </div>

                <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                  <Link
                    to="/verify"
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: 'var(--color-primary)',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    Run Live Custom Check
                  </Link>
                  <Link
                    to="/report"
                    style={{
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: 'rgba(239, 68, 68, 0.8)',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    1930 Report
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Fast Multi-Modal Verification Bar ──────────────── */}
      <motion.section {...fadeUp(0.1)} className="container-max" style={{ marginTop: 'clamp(48px, 8vw, 76px)' }}>
        <div style={{
          padding: 'clamp(20px, 4vw, 32px)',
          borderRadius: 'var(--radius-xl)',
          background: '#ffffff',
          boxShadow: '0 10px 30px rgba(15, 31, 84, 0.08)',
          border: '1px solid rgba(196, 197, 215, 0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)',
        }}>
          {/* Section Header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--space-sm)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Zap size={15} color="var(--color-primary)" />
                <span className="text-label-sm" style={{ fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-primary)', letterSpacing: '0.07em' }}>
                  {t.verifyBar?.tag || 'FAST MULTI-MODAL VERIFICATION BAR'}
                </span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 800, margin: 0, color: 'var(--color-on-surface)' }}>
                {t.verifyBar?.title || 'संदिग्ध अनुरोध की तुरंत जांच करें'}
              </h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-on-surface-variant)', fontSize: 12 }}>
              <Lock size={15} color="var(--color-tertiary)" />
              <span>{t.verifyBar?.privacy || 'शून्य सर्वर स्टोरेज • तत्काल क्रिप्टोग्राफ़िक हैश जांच'}</span>
            </div>
          </div>

          {/* Interactive Search Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 8,
            background: 'var(--color-surface-container-low)',
            padding: 8,
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-outline-variant)'
          }} className="verify-input-bar">
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
              <Search size={20} style={{ color: 'var(--color-outline)', marginRight: 10, flexShrink: 0 }} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && runCheck()}
                placeholder={t.verifyBar?.placeholder || 'यूपीआई आईडी, लिंक, फोन नंबर या संदेश यहाँ चिपकाएँ...'}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 14,
                  color: 'var(--color-on-surface)',
                  fontFamily: 'inherit'
                }}
              />
              <button
                type="button"
                onClick={handlePaste}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: '#ffffff',
                  border: '1px solid var(--color-outline-variant)',
                  color: 'var(--color-on-surface-variant)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 12,
                  flexShrink: 0,
                  marginRight: 6
                }}
              >
                <ClipboardPaste size={14} />
                <span className="paste-label">{t.verifyBar?.paste || 'पेस्ट करें'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => runCheck()}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 24px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--color-primary)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 14,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(31, 79, 216, 0.28)',
                whiteSpace: 'nowrap',
                transition: 'background 0.2s, transform 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Shield size={17} />
              <span>{t.verifyBar?.verifyBtn || 'सत्यापन जांचें'}</span>
            </button>
          </div>

          {/* Sample Query Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, paddingTop: 2 }}>
            <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
              {t.verifyBar?.samplePrompt || 'नमूना परीक्षण करें:'}
            </span>
            {SAMPLE_QUERIES.map(sq => (
              <button
                key={sq.value}
                type="button"
                onClick={() => { setQuery(sq.value); runCheck(sq.value) }}
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-surface-container)',
                  border: '1px solid var(--color-outline-variant)',
                  color: 'var(--color-on-surface)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-fixed)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--color-surface-container)'}
              >
                {sq.label}
              </button>
            ))}
          </div>

          {/* Instant Forensic Feedback Card */}
          <AnimatePresence>
            {resultVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -8 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  marginTop: 8,
                  padding: 18,
                  borderRadius: 'var(--radius-lg)',
                  background: resultType === 'safe' ? 'rgba(230, 249, 237, 0.7)' : 'rgba(254, 242, 242, 0.85)',
                  border: `1px solid ${resultType === 'safe' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: resultType === 'safe' ? '#10b981' : '#ef4444',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {resultType === 'safe' ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 800, fontSize: 16, color: resultType === 'safe' ? '#065f46' : '#991b1b' }}>
                          {resultType === 'safe' ? (t.verifyBar?.safeTitle || 'सत्यापित सुरक्षित संस्था') : (t.verifyBar?.dangerTitle || 'उच्च साइबर जोखिम अलर्ट')}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontWeight: 700,
                          fontSize: 11,
                          background: resultType === 'safe' ? '#d1fae5' : '#fee2e2',
                          color: resultType === 'safe' ? '#065f46' : '#b91c1c'
                        }}>
                          {resultType === 'safe' ? 'सुरक्षा स्कोर 96/100' : 'जोखिम स्कोर 94/100'}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-on-surface)', lineHeight: 1.5 }}>
                        {resultType === 'safe'
                          ? (t.verifyBar?.safeDesc || 'आधिकारिक सेबी/एनपीसीआई निर्देशिका में सत्यापित।')
                          : (t.verifyBar?.dangerDesc || 'चेतावनी: यह पहचान 1930 साइबर हेल्पलाइन पर पूर्व में दर्ज शिकायतों से मेल खाती है। कोई भुगतान न करें!')}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {resultType !== 'safe' && (
                      <Link
                        to="/report"
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-md)',
                          background: '#dc2626',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: 13,
                          textDecoration: 'none'
                        }}
                      >
                        {t.verifyBar?.reportBtn || 'शिकायत दर्ज करें'}
                      </Link>
                    )}
                    <Link
                      to="/verify"
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        background: '#ffffff',
                        border: '1px solid var(--color-outline-variant)',
                        color: 'var(--color-primary)',
                        fontWeight: 700,
                        fontSize: 13,
                        textDecoration: 'none'
                      }}
                    >
                      {t.verifyBar?.auditBtn || 'विस्तृत फॉरेंसिक विश्लेषण'}
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ── 3-Step Defensive Architecture ("How It Works") ── */}
      <section className="container-max" style={{ marginTop: 'clamp(48px, 8vw, 76px)' }}>
        <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto clamp(28px, 5vw, 44px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--color-primary-fixed)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <Activity size={14} />
            <span>{t.howItWorks?.tag || 'सुरक्षा प्रक्रिया'}</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.2rem)', fontWeight: 800, color: 'var(--color-on-surface)', margin: '4px 0 10px' }}>
            {t.howItWorks?.title || 'संज्ञान शील्ड 3 चरणों में कैसे रक्षा करता है'}
          </h2>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            {t.howItWorks?.subtitle || 'जटिल साइबर वित्तीय धोखाधड़ी को सेकंडों में पहचानने वाली तकनीक'}
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-lg)'
        }}>
          {howSteps.map((step, idx) => (
            <motion.div
              key={step.step}
              {...fadeUp(idx * 0.12)}
              style={{
                position: 'relative',
                padding: '28px 24px',
                borderRadius: 'var(--radius-xl)',
                background: '#ffffff',
                border: '1px solid rgba(196, 197, 215, 0.5)',
                boxShadow: '0 8px 24px rgba(15, 31, 84, 0.06)',
                transition: 'all 0.25s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 16px 32px rgba(31, 79, 216, 0.12)'
                e.currentTarget.style.borderColor = 'var(--color-primary)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 31, 84, 0.06)'
                e.currentTarget.style.borderColor = 'rgba(196, 197, 215, 0.5)'
              }}
            >
              {/* Step number watermark */}
              <div style={{
                position: 'absolute',
                top: 14,
                right: 18,
                fontSize: 38,
                fontWeight: 900,
                color: 'var(--color-surface-container-high)',
                lineHeight: 1,
                userSelect: 'none'
              }}>
                {step.step}
              </div>

              <div style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #1f4fd8, #0f1f54)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                boxShadow: '0 4px 12px rgba(31, 79, 216, 0.25)'
              }}>
                <step.icon size={22} />
              </div>

              <div style={{
                display: 'inline-block',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary-fixed)',
                color: 'var(--color-primary)',
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 10
              }}>
                {step.badge}
              </div>

              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 8px' }}>
                {step.title}
              </h3>

              <p style={{ fontSize: 13.5, color: 'var(--color-on-surface-variant)', lineHeight: 1.6, margin: 0 }}>
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Live Bharat Cyber Threat Telemetry Radar ─────── */}
      <section className="container-max" style={{ marginTop: 'clamp(48px, 8vw, 76px)' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 'var(--space-sm)',
          marginBottom: 'var(--space-md)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ position: 'relative', display: 'flex', width: 10, height: 10 }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#dc2626', animation: 'ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.8 }} />
                <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', width: 10, height: 10, background: '#dc2626' }} />
              </span>
              <span className="text-label-sm" style={{ fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {t.threatRadar?.tag || 'लाइव थ्रेट टेलीमेट्री'}
              </span>
            </div>
            <h2 style={{ fontSize: 'clamp(1.4rem, 3.2vw, 2rem)', fontWeight: 800, color: 'var(--color-on-surface)', margin: 0 }}>
              {t.threatRadar?.title || 'सक्रिय भारत साइबर फ्रॉड अलर्ट'}
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
              {t.threatRadar?.subtitle || 'भारतीय साइबर अपराध समन्वय केंद्र (I4C) के सहयोग से रीयल-टाइम अपडेट'}
            </p>
          </div>

          <Link
            to="/history"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--color-primary)',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none'
            }}
          >
            <span>संपूर्ण डेटाबेस देखें (Full Audit History)</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-md)'
        }}>
          {alerts.map((alert, i) => (
            <motion.div
              key={i}
              {...fadeUp(i * 0.1)}
              style={{
                padding: '22px 20px',
                borderRadius: 'var(--radius-xl)',
                background: '#ffffff',
                border: '1px solid rgba(196, 197, 215, 0.5)',
                boxShadow: '0 6px 20px rgba(15, 31, 84, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'box-shadow 0.2s, transform 0.2s'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.boxShadow = '0 12px 28px rgba(15, 31, 84, 0.1)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(15, 31, 84, 0.05)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-outline)', textTransform: 'uppercase' }}>
                    {alert.type}
                  </span>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: alert.riskBg,
                    color: alert.riskColor,
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <alert.icon size={13} />
                    {alert.riskLevel}
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 6px' }}>
                  {alert.title}
                </h3>

                <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.55, margin: '0 0 10px' }}>
                  {alert.desc}
                </p>

                {alert.code && (
                  <code style={{
                    display: 'inline-block',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-surface-container)',
                    color: 'var(--color-on-surface)',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    fontWeight: 600
                  }}>
                    {alert.code}
                  </code>
                )}
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 12,
                marginTop: 14,
                borderTop: '1px solid var(--color-surface-container)',
                fontSize: 12
              }}>
                <span style={{ color: 'var(--color-outline)' }}>{alert.time}</span>
                <span style={{ color: alert.riskColor, fontWeight: 700 }}>{alert.status}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Emergency 1930 Golden Hour Callout Banner ────── */}
      <motion.section {...fadeUp(0.1)} className="container-max" style={{ marginTop: 'clamp(48px, 8vw, 76px)' }}>
        <div style={{
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, #0b132b 0%, #1f4fd8 100%)',
          color: '#ffffff',
          padding: 'clamp(24px, 5vw, 40px)',
          boxShadow: '0 16px 40px rgba(15, 31, 84, 0.22)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle glow circle */}
          <div style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.2)',
            filter: 'blur(50px)',
            pointerEvents: 'none'
          }} />

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-lg)',
            position: 'relative',
            zIndex: 5
          }}>
            <div style={{ maxWidth: 620 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(239, 68, 68, 0.85)',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 700,
                marginBottom: 10
              }}>
                <Clock size={13} />
                <span>{t.helplineBanner?.goldenHour || 'गोल्डन ऑवर प्रोटोकॉल: 2 घंटे के भीतर कार्रवाई'}</span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.35rem, 3vw, 1.85rem)', fontWeight: 800, margin: '0 0 8px', color: '#ffffff', lineHeight: 1.3 }}>
                {t.helplineBanner?.title || 'ऑनलाइन धोखाधड़ी में पैसे गंवाए? तुरंत 1930 डायल करें'}
              </h2>

              <p style={{ margin: 0, fontSize: 14, color: '#dbeafe', lineHeight: 1.6 }}>
                {t.helplineBanner?.desc || 'राष्ट्रीय साइबर अपराध रिपोर्टिंग पोर्टल (I4C) लाभार्थी बैंक खातों को तत्काल फ्रीज कर सकता है।'}
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <a
                href="tel:1930"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 24px',
                  borderRadius: 'var(--radius-lg)',
                  background: '#ef4444',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: 15,
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.4)',
                  textDecoration: 'none',
                  transition: 'transform 0.15s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Phone size={18} />
                <span>{t.helplineBanner?.callBtn || '1930 पर कॉल करें'}</span>
              </a>

              <Link
                to="/report"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 22px',
                  borderRadius: 'var(--radius-lg)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 14,
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  textDecoration: 'none',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              >
                <FileCheck size={16} />
                <span>{t.helplineBanner?.dossierBtn || 'एफआईआर डोजियर बनाएं'}</span>
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Citizen FAQ Accordion ──────────────────────────── */}
      <section className="container-max" style={{ marginTop: 'clamp(48px, 8vw, 76px)' }}>
        <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto clamp(24px, 4vw, 36px)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--color-surface-container-high)', borderRadius: 'var(--radius-full)', color: 'var(--color-primary)', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <HelpCircle size={14} />
            <span>CITIZEN KNOWLEDGE BASE • अक्सर पूछे जाने वाले प्रश्न</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.85rem)', fontWeight: 800, color: 'var(--color-on-surface)', margin: 0 }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i
            return (
              <div
                key={i}
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid rgba(196, 197, 215, 0.5)',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(15, 31, 84, 0.04)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-on-surface)' }}>
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      color: 'var(--color-primary)',
                      flexShrink: 0
                    }}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div style={{ padding: '0 20px 16px', fontSize: 13.5, color: 'var(--color-on-surface-variant)', lineHeight: 1.6, borderTop: '1px solid var(--color-surface-container)' }}>
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Institutional Trust & Security Alignment Strip ── */}
      <motion.section {...fadeUp(0.1)} className="container-max" style={{ marginTop: 'clamp(44px, 6vw, 68px)', marginBottom: 'clamp(48px, 8vw, 80px)' }}>
        <div style={{
          padding: '20px 24px',
          borderRadius: 'var(--radius-xl)',
          background: 'rgba(241, 245, 249, 0.8)',
          border: '1px solid rgba(203, 213, 225, 0.7)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--color-on-surface)' }}>
              <CheckCircle size={16} color="#10b981" />
              <span>I4C (MHA) Standard Alignment</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--color-on-surface)' }}>
              <CheckCircle size={16} color="#10b981" />
              <span>NPCI UPI Safety Directive</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--color-on-surface)' }}>
              <CheckCircle size={16} color="#10b981" />
              <span>Zero-Storage End-to-End Privacy</span>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
            सशक्त भारत, सुरक्षित डिजिटल नागरिक • Sangyan Shield
          </div>
        </div>
      </motion.section>

      <style>{`
        .verify-input-bar {
          flex-direction: row;
        }
        @media (max-width: 640px) {
          .verify-input-bar {
            flex-direction: column;
            gap: 8px;
            padding: 8px;
          }
          .verify-input-bar button {
            width: 100%;
            justify-content: center;
          }
          .paste-label {
            display: none;
          }
        }
      `}</style>
    </PageTransition>
  )
}
