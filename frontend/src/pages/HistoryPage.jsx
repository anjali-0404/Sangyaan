import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, ShieldCheck, ShieldX, ShieldAlert, Search,
  CheckCircle, AlertTriangle,
  CircleAlert, Download, Clock
} from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { useLanguage } from '../context/LanguageContext'
import { loadHistory, clearHistory } from '../lib/history'

// History is this device's own checks (localStorage), not a public list of accused parties.
const BAND_META = {
  LOW: { riskLevel: 'safe', statusKey: 'noIndicators' },
  MEDIUM: { riskLevel: 'medium', statusKey: 'mediumRisk' },
  HIGH: { riskLevel: 'high', statusKey: 'highRisk' },
  CRITICAL: { riskLevel: 'critical', statusKey: 'criticalRisk' },
}

const toItem = (h) => ({
  id: h.id, typeKey: h.inputType, type: ({ text: 'Message', url: 'Link', image: 'Screenshot', audio: 'Voice' })[h.inputType] || 'Check',
  target: h.preview || h.id.slice(0, 8), risk: h.score, ...BAND_META[h.band] || BAND_META.MEDIUM,
  status: '', date: new Date(h.ts).toLocaleString(), ts: h.ts, band: h.band,
})

const TYPE_TRANSLATIONS = {
  text: { en: 'Message', hi: 'संदेश' },
  url: { en: 'Link', hi: 'लिंक' },
  image: { en: 'Screenshot', hi: 'स्क्रीनशॉट' },
  audio: { en: 'Voice', hi: 'आवाज़' },
  upi: { en: 'UPI Handle', hi: 'यूपीआई हैंडल', mr: 'यूपीआई हँडल', bn: 'ইউপিআই হ্যান্ডেল', te: 'యూపీఐ హ్యాండిల్', ta: 'யுபிஐ கைப்பிடி', gu: 'યુપીઆઈ હેન્ડલ', kn: 'ಯುಪಿಐ ಹ್ಯಾಂಡಲ್' },
  telegram: { en: 'Telegram Channel', hi: 'टेलीग्राम चैनल', mr: 'टेलिग्राम चॅनेल', bn: 'টেলিগ্রাম চ্যানেল', te: 'టెలిగ్రామ్ ఛానల్', ta: 'டெலிகிராம் சேனல்', gu: 'ટેલિગ્રામ ચેનલ', kn: 'ಟೆಲಿಗ್ರಾಂ ಚಾನಲ್' },
  phishing: { en: 'Phishing Link', hi: 'फ़िशिंग लिंक', mr: 'फिशिंग लिंक', bn: 'ফিশিং লিঙ্ক', te: 'ఫిషింగ్ లింక్', ta: 'ஃபிஷிங் இணைப்பு', gu: 'ફિશિંગ લિંક', kn: 'ಫಿಶಿಂಗ್ ಲಿಂಕ್' },
  amfi: { en: 'AMFI Distributor', hi: 'एएमएफआई वितरक', mr: 'एएमएफआय वितरक', bn: 'এএমএফআই পরিবেশক', te: 'ఏఎంఎఫ్ఐ పంపిణీదారు', ta: 'ஏஎம்எஃப்ஐ விநியோகஸ்தர்', gu: 'એએમએફઆઈ ડિસ્ટ્રિબ્યુટર', kn: 'ಎಎಂಎಫ್‌ಐ ವಿತರಕರು' },
  whatsapp: { en: 'WhatsApp Forward', hi: 'व्हाट्सएप फॉरवर्ड', mr: 'व्हॉट्सअ‍ॅप फॉरवर्ड', bn: 'হোয়াটসঅ্যাপ ফরোয়ার্ড', te: 'వాట్సాప్ ఫార్వర్డ్', ta: 'வாட்ஸ்அப் பகிர்தல்', gu: 'વોટ્સએપ ફોરવર્ડ', kn: 'ವಾಟ್ಸಾಪ್ ಫಾರ್ವರ್ಡ್' },
  sms: { en: 'SMS Sender', hi: 'एसएमएस प्रेषक', mr: 'एसएमएस प्रेषक', bn: 'এসএমএস প্রেরক', te: 'ఎస్ఎంఎస్ పంపినవారు', ta: 'எஸ்எம்எஸ் அனுப்புநர்', gu: 'એસએમએસ મોકલનાર', kn: 'ಎಸ್ಎಂಎಸ್ ಕಳುಹಿಸುವವರು' },
  apk: { en: 'APK Download', hi: 'एपीके डाउनलोड', mr: 'एपीके डाऊनलोड', bn: 'এপিকে ডাউনলোড', te: 'ఏపీకే డౌన్‌లోడ్', ta: 'ஏபிகே பதிவிறக்கம்', gu: 'એપીકે ડાઉનલોડ', kn: 'ಎಪಿಕೆ ಡೌನ್‌ಲೋಡ್' },
  sebi: { en: 'SEBI Registration', hi: 'सेबी पंजीकरण', mr: 'सेबी नोंदणी', bn: 'সেবি নিবন্ধন', te: 'సెబీ నమోదు', ta: 'செபி பதிவு', gu: 'સેબી નોંધણી', kn: 'ಸೆಬಿ ನೋಂದಣಿ' },
}

const STATUS_TRANSLATIONS = {
  noIndicators: { en: 'No indicators found', hi: 'कोई संकेत नहीं मिला' },
  mediumRisk: { en: 'Medium risk', hi: 'मध्यम जोखिम' },
  highRisk: { en: 'High risk', hi: 'उच्च जोखिम' },
  criticalRisk: { en: 'Critical risk', hi: 'अत्यधिक जोखिम' },
  flagged: { en: 'Flagged', hi: 'चिह्नित', mr: 'फ्लॅग केलेले', bn: 'পতাকাকৃত', te: 'ఫ్లాగ్ చేయబడింది', ta: 'கொடியிடப்பட்டது', gu: 'ફ્લેગ કરેલ', kn: 'ಫ್ಲ್ಯಾಗ್ ಮಾಡಲಾಗಿದೆ' },
  flaggedScam: { en: 'Flagged Scam', hi: 'घोटाला चिह्नित', mr: 'घोटाळा घोषित', bn: 'প্রতারণা চিহ্নিত', te: 'మోసంగా గుర్తించబడింది', ta: 'மோசடி கொடியிடப்பட்டது', gu: 'કૌભાંડ ચિહ્નિત', kn: 'ವಂಚನೆ ಎಂದು ಗುರುತಿಸಲಾಗಿದೆ' },
  domainBlacklisted: { en: 'Domain Blacklisted', hi: 'डोमेन ब्लॉक', mr: 'डोमेन प्रतिबंधित', bn: 'ডোমেন নিষিদ্ধ', te: 'డొమైన్ బ్లాక్‌లిస్ట్ చేయబడింది', ta: 'டொமைன் தடைசெய்யப்பட்டது', gu: 'ડોમેન બ્લેકલિસ્ટ', kn: 'ಡೊಮೇನ್ ಕಪ್ಪುಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ' },
  identityConfirmed: { en: 'Identity Confirmed', hi: 'सत्यापित वैध', mr: 'ओळख सत्यापित', bn: 'পরিচয় নিশ্চিত', te: 'గుర్తింపు ధృవీకరించబడింది', ta: 'அடையாளம் உறுதிசெய்யப்பட்டது', gu: 'ઓળખ પુષ્ટિ થઈ', kn: 'ಗುರುತು ದೃಢಪಟ್ಟಿದೆ' },
  ponziPattern: { en: 'Ponzi Pattern', hi: 'पोंजी पैटर्न', mr: 'पोंझी नमुना', bn: 'পনজি প্যাটার্ন', te: 'పోంజీ నమూనా', ta: 'பொன்சி வடிவம்', gu: 'પોન્ઝી પેટર્ન', kn: 'ಪೊಂಜಿ ಮಾದರಿ' },
  legitimateBank: { en: 'Legitimate Bank', hi: 'वैध बैंक', mr: 'अधिकृत बँक', bn: 'বৈধ ব্যাংক', te: 'చట్టబద్ధమైన బ్యాంక్', ta: 'சட்டபூர்வமான வங்கி', gu: 'કાયદેસર બેંક', kn: 'ಅಧಿಕೃತ ಬ್ಯಾಂಕ್' },
  malwareDetected: { en: 'Malware Detected', hi: 'मैलवेयर मिला', mr: 'मालवेअर आढळले', bn: 'ম্যালওয়্যার সনাক্ত', te: 'మాల్వೇర్ గుర్తించబడింది', ta: 'மால்வேர் கண்டறியப்பட்டது', gu: 'માલવેર મળ્યું', kn: 'ಮಾಲ್ವೇರ್ ಪತ್ತೆಯಾಗಿದೆ' },
  barredEntity: { en: 'Barred Entity', hi: 'प्रतिबंधित संस्था', mr: 'प्रतिबंधित संस्था', bn: 'নিষিদ্ধ সত্ত্বা', te: 'నిషేధించబడిన సంస్థ', ta: 'தடைசெய்யப்பட்ட நிறுவனம்', gu: 'પ્રતિબંધિત એકમ', kn: 'ನಿಷೇಧಿತ ಘಟಕ' },
}

const getRiskBadge = (level) => {
  const config = {
    critical: { bg: 'var(--color-error)', color: 'var(--color-on-error)', icon: CircleAlert },
    medium: { bg: 'var(--risk-caution-bg)', color: 'var(--risk-caution-text)', icon: AlertTriangle },
    high: { bg: 'var(--color-error-container)', color: 'var(--color-on-error-container)', icon: AlertTriangle },
    safe: { bg: 'var(--color-tertiary-fixed)', color: 'var(--color-on-tertiary-fixed)', icon: CheckCircle },
  }
  return config[level] || config.high
}

export default function HistoryPage() {
  const { t, currentLang } = useLanguage()
  const lang = currentLang || 'en'
  const [filter, setFilter] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const [items, setItems] = useState(() => loadHistory().map(toItem))
  const L = (en, hi, key) => (lang === 'en' ? en : lang === 'hi' ? hi : (t.history?.[key] || en))

  const filters = [
    { key: 'All', label: t.history?.filterAll || 'All' },
    { key: 'Critical', label: t.history?.filterCritical || 'Critical' },
    { key: 'High Risk', label: t.history?.filterHigh || 'High Risk' },
    { key: 'Medium', label: L('Medium', 'मध्यम', 'filterMedium') },
    { key: 'Safe', label: L('No indicators', 'कोई संकेत नहीं', 'filterSafe') },
  ]

  const filtered = items.filter(item => {
    if (filter === 'Medium') return item.riskLevel === 'medium'
    if (filter === 'Critical') return item.riskLevel === 'critical'
    if (filter === 'High Risk') return item.riskLevel === 'high'
    if (filter === 'Safe') return item.riskLevel === 'safe'
    return true
  }).filter(item => {
    const localizedType = (TYPE_TRANSLATIONS[item.typeKey] && TYPE_TRANSLATIONS[item.typeKey][lang]) || item.type
    return (
      searchQuery === '' ||
      item.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      localizedType.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Type,Target,Risk Score,Status,Date\n"
      + items.map(e => `${e.id},${e.type},"${e.target.replace(/"/g, '""')}",${e.risk},${e.band},"${e.date}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "sangyan_audit_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <PageTransition>
      <div className="container-max" style={{ padding: 'var(--space-xl) var(--margin)' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 4 }}>
              <Clock size={16} style={{ color: 'var(--color-primary)' }} />
              <span className="text-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 700 }}>
                {t.history?.tag || 'VERIFICATION AUDIT TRAIL'}
              </span>
            </div>
            <h1 className="text-headline-lg" style={{ color: 'var(--color-on-surface)', margin: 0 }}>
              {t.history?.title || 'Verification History'}
            </h1>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
              {lang === 'hi' ? 'इस डिवाइस पर की गई आपकी जाँचें। यह सूची केवल आपके ब्राउज़र में सहेजी जाती है।' : 'Your checks on this device. This list is stored only in your browser.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
          {items.length > 0 && (
            <button
              onClick={() => { clearHistory(); setItems([]) }}
              style={{ padding: '10px 16px', borderRadius: 'var(--radius-lg)', background: 'transparent', color: 'var(--color-on-surface-variant)', fontWeight: 600, fontSize: 13, border: '1px solid var(--color-outline-variant)', cursor: 'pointer' }}
            >
              {L('Clear history', 'इतिहास मिटाएँ', 'clear')}
            </button>
          )}
          <button
            onClick={handleExportCsv}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-xs)',
              padding: '10px 20px', borderRadius: 'var(--radius-lg)',
              background: 'var(--color-surface-container)', color: 'var(--color-on-surface)',
              fontWeight: 600, fontSize: 13, border: '1px solid var(--color-outline-variant)',
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            <span>{t.history?.exportCsv || 'Export CSV'}</span>
          </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          {[
            { label: L('Checks on this device', 'इस डिवाइस पर जाँचें', 'totalScans'), value: String(items.length), icon: Shield, color: 'var(--color-primary)' },
            { label: L('High / critical', 'उच्च / अत्यधिक', 'threatsBlocked'), value: String(items.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical').length), icon: ShieldX, color: 'var(--color-error)' },
            { label: L('No indicators found', 'कोई संकेत नहीं मिला', 'verifiedSafe'), value: String(items.filter(i => i.riskLevel === 'safe').length), icon: ShieldCheck, color: 'var(--color-tertiary)' },
            { label: t.history?.avgRiskScore || 'Avg Risk Score', value: items.length ? (items.reduce((a, i) => a + i.risk, 0) / items.length).toFixed(1) : '—', icon: ShieldAlert, color: 'var(--color-secondary)' },
          ].map(card => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                padding: 'var(--space-lg)', borderRadius: 'var(--radius-xl)',
                background: 'var(--color-surface-container-lowest)', boxShadow: 'var(--shadow-card)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                border: '1px solid rgba(196,197,215,0.4)'
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 'var(--radius-lg)',
                background: `${card.color}15`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: card.color,
              }}>
                <card.icon size={22} />
              </div>
              <div>
                <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{card.label}</span>
                <span className="text-headline-md" style={{ display: 'block', fontWeight: 700, color: 'var(--color-on-surface)', fontVariantNumeric: 'tabular-nums' }}>{card.value}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Filters & Search */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className="text-label-md"
                style={{
                  padding: '6px 16px', borderRadius: 'var(--radius-full)',
                  background: filter === f.key ? 'var(--color-primary)' : 'var(--color-surface-container)',
                  color: filter === f.key ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
                  fontWeight: filter === f.key ? 700 : 500, transition: 'all 0.2s',
                  border: 'none', cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', minWidth: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.history?.searchPlaceholder || 'Search verifications...'}
              className="text-body-sm"
              style={{
                width: '100%', paddingLeft: 36, padding: '8px 12px 8px 36px',
                borderRadius: 'var(--radius-full)', background: 'var(--color-surface-container-low)',
                color: 'var(--color-on-surface)', border: '1px solid var(--color-outline-variant)'
              }}
            />
          </div>
        </div>

        {/* Table Container */}
        <div style={{
          background: 'var(--color-surface-container-lowest)', borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-card)', overflow: 'hidden', border: '1px solid rgba(196,197,215,0.4)'
        }}>
          <div className="table-scroll-container" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <div className="table-inner" style={{ minWidth: 620 }}>
              {/* Header Row */}
              <div style={{
                display: 'grid', gridTemplateColumns: '130px 1fr 90px 140px 140px',
                gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)',
                borderBottom: '1px solid var(--color-surface-container)',
                background: 'var(--color-surface-container-low)',
              }} className="text-label-sm table-header">
                <span style={{ fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>
                  {t.history?.thType || 'Type'}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>
                  {t.history?.thTarget || 'Target'}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>
                  {t.history?.thRisk || 'Risk'}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>
                  {t.history?.thStatus || 'Status'}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase' }}>
                  {t.history?.thDate || 'Date'}
                </span>
              </div>

              {/* Rows */}
              {filtered.map((item, i) => {
                const badge = getRiskBadge(item.riskLevel)
                const BadgeIcon = badge.icon
                const localizedType = (TYPE_TRANSLATIONS[item.typeKey] && TYPE_TRANSLATIONS[item.typeKey][lang]) || item.type
                const localizedStatus = (STATUS_TRANSLATIONS[item.statusKey] && (STATUS_TRANSLATIONS[item.statusKey][lang] || STATUS_TRANSLATIONS[item.statusKey].en)) || item.status

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    style={{
                      display: 'grid', gridTemplateColumns: '130px 1fr 90px 140px 140px',
                      gap: 'var(--space-md)', padding: 'var(--space-md) var(--space-lg)',
                      borderBottom: '1px solid var(--color-surface-container-low)',
                      alignItems: 'center', transition: 'background 0.15s', cursor: 'pointer',
                    }}
                    className="table-row"
                    onClick={() => navigate(`/analysis?scan=${item.id}`)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-container-low)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span className="text-label-md" style={{ color: 'var(--color-on-surface-variant)', fontSize: 13 }}>
                      {localizedType}
                    </span>
                    <span className="text-body-sm" style={{ fontWeight: 600, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.target}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{
                        width: 28, height: 6, borderRadius: 'var(--radius-full)',
                        background: 'var(--color-surface-container-high)', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${item.risk}%`, height: '100%', borderRadius: 'var(--radius-full)',
                          background: item.riskLevel === 'safe' ? 'var(--color-tertiary)' : item.risk > 90 ? 'var(--color-error)' : 'var(--risk-caution-text)',
                        }} />
                      </div>
                      <span className="text-data-mono" style={{ fontWeight: 700, fontSize: 13, color: item.riskLevel === 'safe' ? 'var(--color-tertiary)' : 'var(--color-error)' }}>
                        {item.risk}
                      </span>
                    </div>
                    <span className="text-label-sm" style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '3px 8px', borderRadius: 'var(--radius-full)',
                      background: badge.bg, color: badge.color, fontWeight: 700,
                      fontSize: 11, whiteSpace: 'nowrap',
                    }}>
                      <BadgeIcon size={11} /> {localizedStatus}
                    </span>
                    <span className="text-label-sm" style={{ color: 'var(--color-outline)', fontSize: 12 }}>{item.date}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {filtered.length === 0 && (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
              <Search size={32} style={{ opacity: 0.3, margin: '0 auto 8px' }} />
              <p className="text-body-md">{items.length === 0
                ? L('No checks yet. Run one from the Verify page.', 'अभी कोई जाँच नहीं। सत्यापन पेज से जाँच करें।', 'noResults')
                : (t.history?.noResults || 'No results found for your search criteria.')}</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .table-scroll-container::-webkit-scrollbar {
          height: 6px;
        }
        .table-scroll-container::-webkit-scrollbar-thumb {
          background: var(--color-outline-variant);
          border-radius: 9999px;
        }
      `}</style>
    </PageTransition>
  )
}
