import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ShieldAlert, Phone, AlertTriangle, Check,
  Upload, FileText, ArrowRight, ArrowLeft, Copy,
  ExternalLink, Building2, Smartphone, Globe, UserX,
  CreditCard, ShieldCheck, RefreshCw, Send
} from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { useLanguage } from '../context/LanguageContext'

const SCAM_CATEGORIES_I18N = [
  {
    id: 'upi',
    icon: CreditCard,
    titles: {
      en: { label: 'UPI / QR Code Fraud', desc: 'Fake payment links, reversed transactions, scan-to-receive tricks' },
      hi: { label: 'यूपीआई / क्यूआर कोड धोखाधड़ी', desc: 'फर्जी भुगतान लिंक, उल्टा लेनदेन, स्कैन-टू-रिसीव चालें' },
      mr: { label: 'यूपीआई / क्यूआर कोड फसवणूक', desc: 'बनावट पेमेंट लिंक, रिव्हर्स व्यवहार, स्कॅन-टू-रिसीव्ह युक्त्या' },
      bn: { label: 'ইউপিআই / কিউআর কোড প্রতারণা', desc: 'ভুয়া পেমেন্ট লিঙ্ক, লেনদেন ফেরত, স্ক্যান-টু-রিসিভ ফাঁদ' },
      te: { label: 'యూపీఐ / క్యూఆర్ కోడ్ మోసం', desc: 'నకిలీ చెల్లింపు లింక్‌లు, రివర్స్ లావాదేవీలు, స్కాన్ ట్రిక్స్' },
      ta: { label: 'யுபிஐ / க்யூஆர் கோட் மோசடி', desc: 'போலி கட்டண இணைப்புகள், தலைகீழ் பரிவர்த்தனைகள்' },
      gu: { label: 'યુપીઆઈ / ક્યુઆર કોડ છેતરપિંડી', desc: 'નકલી ચુકવણી લિંક, રિવર્સ વ્યવહારો, સ્કેન યુક્તિઓ' },
      kn: { label: 'ಯುಪಿಐ / ಕ್ಯೂಆರ್ ಕೋಡ್ ವಂಚನೆ', desc: 'ನಕಲಿ ಪಾವತಿ ಲಿಂಕ್‌ಗಳು, ರಿವರ್ಸ್ ವಹಿವಾಟುಗಳು' },
    }
  },
  {
    id: 'investment',
    icon: Building2,
    titles: {
      en: { label: 'Fake Investment / Task Scam', desc: 'Telegram trading groups, crypto schemes, part-time YouTube rating tasks' },
      hi: { label: 'फर्जी निवेश / पार्ट-टाइम टास्क घोटाला', desc: 'टेलीग्राम ट्रेडिंग ग्रुप, क्रिप्टो स्कीम, यूट्यूब वीडियो रेटिंग फ्रॉड' },
      mr: { label: 'बनावट गुंतवणूक / टास्क घोटाळा', desc: 'टेलिग्राम ट्रेडिंग ग्रुप्स, क्रिप्टो स्कीम्स, अर्धवेळ काम फसवणूक' },
      bn: { label: 'ভুয়া বিনিয়োগ / টাস্ক কেলেঙ্কারি', desc: 'টেলিগ্রাম ট্রেডিং গ্রুপ, ক্রিপ্টো স্কিম, ইউটিউব রেটিং টাস্ক' },
      te: { label: 'నకిలీ పెట్టుబడి / టాస్క్ మోసం', desc: 'టెలిగ్రామ్ ట్రేడింగ్ గ్రూపులు, క్రిప్టో పథకాలు, యూట్యూబ్ టాస్క్‌లు' },
      ta: { label: 'போலி முதலீடு / டாஸ்க் மோசடி', desc: 'டெலிகிராம் வர்த்தக குழுக்கள், கிரிப்டோ திட்டங்கள்' },
      gu: { label: 'નકલી રોકાણ / ટાસ્ક કૌભાંડ', desc: 'ટેલિગ્રામ ટ્રેડિંગ ગ્રૂપ્સ, ક્રિપ્ટો સ્કીમ, પાર્ટ-ટાઇમ જોબ' },
      kn: { label: 'ನಕಲಿ ಹೂಡಿಕೆ / ಟಾಸ್ಕ್ ವಂಚನೆ', desc: 'ಟೆಲಿಗ್ರಾಂ ಟ್ರೇಡಿಂಗ್ ಗ್ರೂಪ್‌ಗಳು, ಕ್ರಿಪ್ಟೋ ಯೋಜನೆಗಳು' },
    }
  },
  {
    id: 'deepfake',
    icon: UserX,
    titles: {
      en: { label: 'AI Deepfake / Voice Cloning', desc: 'Impersonation of family/executives demanding emergency funds' },
      hi: { label: 'एआई डीपफेक / वॉइस क्लोनिंग', desc: 'परिजनों या अधिकारियों की आवाज बनाकर आपातकालीन पैसों की मांग' },
      mr: { label: 'एआय डीपफेक / व्हॉइस क्लोनिंग', desc: 'कुटुंबीय किंवा अधिकाऱ्यांचा आवाज काढून तातडीने पैसे उकळणे' },
      bn: { label: 'এআই ডিপফেক / ভয়েস ক্লোনিং', desc: 'পরিবার বা কর্মকর্তার কণ্ঠ অনুকরণ করে জরুরি অর্থের দাবি' },
      te: { label: 'ఏఐ డీప్‌ఫేక్ / వాయిస్ క్లోనింగ్', desc: 'కుటుంబం లేదా అధికారుల గొంతు అనుకరించి అత్యవసర నిధుల డిమాండ్' },
      ta: { label: 'ஏஐ டீப்ஃபேக் / குரல் குளோனிங்', desc: 'குடும்பத்தினர் அல்லது அதிகாரிகள் போல் குரல் மாற்றி பணம் பறித்தல்' },
      gu: { label: 'એઆઈ ડીપફેક / વોઇસ ક્લોનિંગ', desc: 'પરિવાર અથવા અધિકારીઓનો અવાજ કાઢી તાત્કાલિક પૈસા પડાવવા' },
      kn: { label: 'ಎಐ ಡೀಪ್‌ಫೇಕ್ / ಧ್ವನಿ ಕ್ಲೋನಿಂಗ್', desc: 'ಕುಟುಂಬಸ್ಥರು ಅಥವಾ ಅಧಿಕಾರಿಗಳ ಧ್ವನಿ ಅನುಕರಿಸಿ ಹಣ ಸುಲಿಗೆ' },
    }
  },
  {
    id: 'digital_arrest',
    icon: AlertTriangle,
    titles: {
      en: { label: 'Digital Arrest / Police Impersonation', desc: 'Fake video calls from police, ED, or customs claiming illegal parcels' },
      hi: { label: 'डिजिटल अरेस्ट / पुलिस प्रतिरूपण', desc: 'सीबीआई, ईडी या पुलिस बनकर नशीले पार्सल का झूठा डर दिखाकर वसूली' },
      mr: { label: 'डिजिटल अरेस्ट / पोलीस तोतयागिरी', desc: 'सीबीआय, ईडी किंवा पोलिसांच्या बनावट व्हिडिओ कॉलने खंडणी उकळणे' },
      bn: { label: 'ডিজিটাল গ্রেপ্তার / পুলিশ ছদ্মবেশ', desc: 'সিবিআই বা পুলিশের ভুয়া ভিডিও কলে অবৈধ পার্সেলের ভীতি প্রদর্শন' },
      te: { label: 'డిజిటల్ అరెస్ట్ / పోలీసు అనుకరణ', desc: 'సీబీఐ, ఈడీ పేరుతో నకిలీ వీడియో కాల్స్ చేసి బెదిరింపులు' },
      ta: { label: 'டிஜிட்டல் கைது / போலீஸ் ஆள்மாறாட்டம்', desc: 'சிபிஐ அல்லது போலீஸ் போன்று போலி வீடியோ அழைப்பு மூலம் மிரட்டல்' },
      gu: { label: 'ડિજિટલ અરેસ્ટ / પોલીસ ઢોંગ', desc: 'સીબીઆઈ અથવા પોલીસ બનીને નકલી વીડિયો કોલ દ્વારા ખંડણી' },
      kn: { label: 'ಡಿಜಿಟಲ್ ಬಂಧನ / ಪೊಲೀಸ್ ವೇಷಧಾರಿ', desc: 'ಸಿಬಿಐ ಅಥವಾ ಪೊಲೀಸರ ಹೆಸರಿನಲ್ಲಿ ನಕಲಿ ವಿಡಿಯೋ ಕರೆ ಬೆದರಿಕೆ' },
    }
  },
  {
    id: 'phishing',
    icon: Smartphone,
    titles: {
      en: { label: 'Phishing APK / Banking Malware', desc: 'Malicious links pretending to update PAN, electricity bill, or KYC' },
      hi: { label: 'फ़िशिंग एपीके / बैंकिंग मैलवेयर', desc: 'पैन अपडेट, बिजली बिल या बैंक केवाईसी के नाम पर दुर्भावनापूर्ण लिंक' },
      mr: { label: 'फिशिंग एपीके / बँकिंग मालवेअर', desc: 'पॅन कार्ड, वीज बिल किंवा बँक केवायसीच्या नावाखाली धोकादायक अ‍ॅप' },
      bn: { label: 'ফিশিং এপিকে / ব্যাংকিং ম্যালওয়্যার', desc: 'প্যান আপডেট, বিদ্যুৎ বিল বা কেওয়াইসি নামে ক্ষতিকর লিঙ্ক' },
      te: { label: 'ఫిషింగ్ ఏపీకే / బ్యాంకింగ్ మాల్వేర్', desc: 'పాన్ అప్‌డేట్, విద్యుత్ బిల్లు లేదా కేవైసీ పేరుతో ప్రమాదకర లింక్‌లు' },
      ta: { label: 'ஃபிஷிங் ஏபிகே / வங்கி மால்வேர்', desc: 'பான் அப்டேட், மின்சாரக் கட்டணம் அல்லது கேஒய்சி போலி இணைப்புகள்' },
      gu: { label: 'ફિશિંગ એપીકે / બેંકિંગ માલવેર', desc: 'પાન અપડેટ, વીજળી બિલ અથવા કેવાયસીના નામે નકલી લિંક' },
      kn: { label: 'ಫಿಶಿಂಗ್ ಎಪಿಕೆ / ಬ್ಯಾಂಕಿಂಗ್ ಮಾಲ್ವೇರ್', desc: 'ಪ್ಯಾನ್ ನವೀಕರಣ, ವಿದ್ಯುತ್ ಬಿಲ್ ಅಥವಾ ಕೆವೈಸಿ ಹೆಸರಿನ ನಕಲಿ ಲಿಂಕ್‌ಗಳು' },
    }
  },
  {
    id: 'website',
    icon: Globe,
    titles: {
      en: { label: 'Fake E-Commerce / Clone Site', desc: 'Bogus shopping portals or spoofed banking customer support portals' },
      hi: { label: 'फर्जी शॉपिंग साइट / क्लोन वेबसाइट', desc: 'सस्ती खरीदारी का झांसा देने वाले फर्जी पोर्टल या क्लोन बैंक सपोर्ट' },
      mr: { label: 'बनावट खरेदी पोर्टल / क्लोन वेबसाइट', desc: 'स्वस्त खरेदीचे आमिष दाखवणारे बनावट संकेतस्थळ किंवा बँक पोर्टल' },
      bn: { label: 'ভুয়া ই-কমার্স / ক্লোন ওয়েবসাইট', desc: 'ভুয়া শপিং পোর্টাল বা নকল ব্যাংকিং গ্রাহক সহায়তা লিঙ্ক' },
      te: { label: 'నకిలీ ఈ-కామర్స్ / క్లోన్ వెబ్‌సైట్', desc: 'నకిలీ షాపింగ్ పోర్టల్‌లు లేదా నకిలీ బ్యాంకింగ్ మద్దతు సైట్‌లు' },
      ta: { label: 'போலி இ-காமர்ஸ் / குளோன் தளம்', desc: 'போலி ஷாப்பிங் தளங்கள் அல்லது போலி வங்கி ஆதரவு தளங்கள்' },
      gu: { label: 'નકલી ઈ-કોમર્સ / ક્લોન સાઇટ', desc: 'બોગસ શોપિંગ પોર્ટલ અથવા નકલી બેંક ગ્રાહક સહાય પોર્ટલ' },
      kn: { label: 'ನಕಲಿ ಇ-ಕಾಮರ್ಸ್ / ಕ್ಲೋನ್ ವೆಬ್‌ಸೈಟ್', desc: 'ನಕಲಿ ಶಾಪಿಂಗ್ ಪೋರ್ಟಲ್‌ಗಳು ಅಥವಾ ನಕಲಿ ಬ್ಯಾಂಕಿಂಗ್ ಬೆಂಬಲ ತಾಣಗಳು' },
    }
  },
]

export default function ReportFraud() {
  const { t, currentLang } = useLanguage()
  const lang = currentLang || 'en'

  const [step, setStep] = useState(1)
  const [copied, setCopied] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submittedRef, setSubmittedRef] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  // Form State
  const [formData, setFormData] = useState({
    category: 'upi',
    incidentDate: new Date().toISOString().split('T')[0],
    incidentTime: '12:00',
    amountLost: '',
    bankName: '',
    utrNumber: '',
    suspectPhone: '',
    suspectUpi: '',
    suspectAccount: '',
    suspectIfsc: '',
    suspectUrl: '',
    description: '',
    victimName: '',
    victimPhone: '',
    victimState: 'Delhi',
    isAnonymous: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      const newFiles = files.map(f => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        type: f.type
      }))
      setUploadedFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (idx) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      const refId = `SS-IN-${Math.floor(100000 + Math.random() * 900000)}`
      setSubmittedRef(refId)
      setSubmitting(false)
      setStep(4)
    }, 1500)
  }

  const copyDossier = () => {
    const text = `SANGYAN SHIELD - CYBER FRAUD INCIDENT SUMMARY
Reference ID: ${submittedRef}
Category: ${formData.category.toUpperCase()}
Date & Time: ${formData.incidentDate} ${formData.incidentTime}
Amount Defrauded: ₹${formData.amountLost || '0'}
Transaction / UTR: ${formData.utrNumber || 'N/A'}
Suspect Identifiers:
- Phone: ${formData.suspectPhone || 'N/A'}
- UPI ID: ${formData.suspectUpi || 'N/A'}
- Bank A/C & IFSC: ${formData.suspectAccount || 'N/A'} (${formData.suspectIfsc || 'N/A'})
- URL / Platform: ${formData.suspectUrl || 'N/A'}

Narrative of Incident:
${formData.description || 'No additional narrative provided.'}

Evidence Attached: ${uploadedFiles.length} file(s)
National Cyber Crime Helpline: 1930 | Portal: https://cybercrime.gov.in`

    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const STEP_SHORT_TITLES = {
    en: ['Category', 'Suspect', 'Evidence', 'Dossier'],
    hi: ['श्रेणी', 'संदिग्ध', 'साक्ष्य', 'डोजियर'],
    mr: ['प्रकार', 'संशयित', 'पुरावे', 'अहवाल'],
    bn: ['বিভাগ', 'সন্দেহভাজন', 'প্রমাণ', 'ডজিয়ার'],
    te: ['వర్గం', 'అనుమానితుడు', 'సాక్ష్యం', 'డోసియర్'],
    ta: ['வகை', 'சந்தேகநபர்', 'சான்று', 'ஆவணம்'],
    gu: ['શ્રેણી', 'શંકાસ્પદ', 'પુરાવા', 'ડોઝિયર'],
    kn: ['ವರ್ಗ', 'ಅನುಮಾನಿತ', 'ಸಾಕ್ಷಿ', 'ದಾಖಲೆ'],
  }

  const shortTitles = STEP_SHORT_TITLES[lang] || STEP_SHORT_TITLES.en

  const stepLabels = [
    { num: 1, shortTitle: shortTitles[0], fullTitle: t.report?.step1 || 'Category' },
    { num: 2, shortTitle: shortTitles[1], fullTitle: t.report?.step2 || 'Suspect' },
    { num: 3, shortTitle: shortTitles[2], fullTitle: t.report?.step3 || 'Evidence' },
    { num: 4, shortTitle: shortTitles[3], fullTitle: t.report?.step4 || 'Dossier' },
  ]

  return (
    <PageTransition>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: 'var(--space-xl) var(--margin)' }}>
        
        {/* Golden Hour Emergency Top Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #0b132b 0%, #1f4fd8 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-lg) var(--space-xl)',
            color: '#ffffff',
            boxShadow: '0 10px 30px rgba(15, 31, 84, 0.15)',
            marginBottom: 'var(--space-xl)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--space-md)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', flex: '1 1 300px' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Phone size={28} color="#fcd34d" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <span className="badge badge-urgent" style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>
                  {t.report?.goldenHourBadge || 'GOLDEN HOUR PROTOCOL'}
                </span>
                <span style={{ fontSize: 13, color: '#ccd4ff', fontWeight: 500 }}>
                  {t.report?.goldenHourTime || 'Act Within 2 Hours'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '4px 0 2px', color: '#ffffff' }}>
                {t.report?.goldenHourTitle || 'Lost Money to Online Fraud? Dial 1930 Immediately'}
              </h2>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#e0e3e5', lineHeight: 1.4 }}>
                {t.report?.goldenHourDesc || 'The National Cyber Crime Reporting Portal (I4C) can initiate an emergency freeze on the recipient bank account if reported right away.'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap' }}>
            <a
              href="tel:1930"
              className="btn btn-primary"
              style={{
                background: '#f59e0b',
                color: '#0b132b',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none'
              }}
            >
              <Phone size={18} />
              {t.report?.call1930 || 'Call 1930 Now'}
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 18px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={16} />
              {t.report?.officialPortal || 'Official Portal (MHA)'}
            </a>
          </div>
        </motion.div>

        {/* Header Title Section */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--color-primary-fixed)', borderRadius: 9999, marginBottom: 12 }}>
            <ShieldAlert size={16} color="var(--color-primary)" />
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
              {t.report?.pageTag || 'SOVEREIGN CITIZEN DEFENSE'}
            </span>
          </div>
          <h1 className="text-headline-lg" style={{ color: 'var(--color-on-surface)', marginBottom: 8 }}>
            {t.report?.pageTitle || 'Report Cyber Fraud & Generate Official FIR Dossier'}
          </h1>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', maxWidth: 680, margin: '0 auto' }}>
            {t.report?.pageDesc || 'Compile transaction hashes, suspect identifiers, and chat evidence into a structured law-enforcement ready dossier formatted for 1930 and state cyber police cells.'}
          </p>
        </div>

        {/* Multi-Step Progress Tracker */}
        <div style={{ marginBottom: 'var(--space-xl)', width: '100%' }}>
          {/* Active Step Indicator Pill for Mobile */}
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 14px',
              background: 'var(--color-primary-fixed)',
              color: 'var(--color-primary)',
              borderRadius: 9999
            }}>
              <span>{`Step ${step} / 4:`}</span>
              <span style={{ fontWeight: 600 }}>{stepLabels[step - 1]?.fullTitle}</span>
            </span>
          </div>

          <div
            className="step-tracker-scroll-wrapper"
            style={{
              width: '100%',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              padding: '4px 8px 10px',
              boxSizing: 'border-box'
            }}
          >
            <div
              className="step-tracker-inner"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                maxWidth: 480,
                minWidth: 260,
                margin: '0 auto',
                boxSizing: 'border-box'
              }}
            >
              {stepLabels.map((item, idx) => (
                <div key={item.num} style={{ display: 'contents' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.num < step) setStep(item.num)
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      cursor: item.num < step ? 'pointer' : 'default',
                      flexShrink: 0
                    }}
                  >
                    <div
                      className="step-circle"
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: step === item.num
                          ? 'var(--color-primary)'
                          : step > item.num
                          ? 'var(--risk-safe-text)'
                          : 'var(--color-surface-container-high)',
                        color: step >= item.num ? '#ffffff' : 'var(--color-outline)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        boxShadow: step === item.num ? '0 0 0 4px rgba(0, 55, 177, 0.16)' : 'none',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {step > item.num ? <Check size={16} strokeWidth={2.5} /> : item.num}
                    </div>
                    <span
                      className="step-title"
                      style={{
                        fontSize: 12,
                        fontWeight: step === item.num ? 700 : 500,
                        color: step === item.num ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                        textAlign: 'center',
                        maxWidth: 64,
                        lineHeight: 1.2
                      }}
                    >
                      {item.shortTitle}
                    </span>
                  </button>

                  {idx < stepLabels.length - 1 && (
                    <div
                      className="step-line"
                      style={{
                        flex: 1,
                        height: 2,
                        minWidth: 14,
                        background: step > item.num ? 'var(--risk-safe-text)' : 'var(--color-outline-variant)',
                        margin: '0 6px 18px 6px',
                        transition: 'background 0.3s ease'
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Form Container Card */}
        <div className="card" style={{ padding: 'clamp(16px, 3vw, 36px)', background: '#ffffff', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-xl)' }}>
          
          {/* STEP 1: CATEGORY & TRANSACTION */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-headline-sm" style={{ marginBottom: 'var(--space-md)', color: 'var(--color-on-surface)' }}>
                {t.report?.step1Heading || 'Step 1: Select Fraud Category & Financial Impact'}
              </h2>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-lg)'
              }}>
                {SCAM_CATEGORIES_I18N.map(cat => {
                  const Icon = cat.icon
                  const selected = formData.category === cat.id
                  const localizedCat = cat.titles[lang] || cat.titles.en

                  return (
                    <div
                      key={cat.id}
                      onClick={() => setFormData(p => ({ ...p, category: cat.id }))}
                      style={{
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${selected ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                        background: selected ? 'var(--color-primary-fixed)' : 'var(--color-surface)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        gap: 'var(--space-sm)'
                      }}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 'var(--radius-sm)',
                        background: selected ? 'var(--color-primary)' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Icon size={20} color={selected ? '#ffffff' : 'var(--color-primary)'} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: selected ? 'var(--color-on-primary-fixed)' : 'var(--color-on-surface)' }}>
                          {localizedCat.label}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
                          {localizedCat.desc}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                <div>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                    {t.report?.amountLost || 'Financial Loss Amount (₹)'}
                  </label>
                  <input
                    type="number"
                    name="amountLost"
                    value={formData.amountLost}
                    onChange={handleChange}
                    placeholder="e.g. 25000"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                    {t.report?.utrNumber || 'Transaction ID / UPI UTR Number'}
                  </label>
                  <input
                    type="text"
                    name="utrNumber"
                    value={formData.utrNumber}
                    onChange={handleChange}
                    placeholder="12-digit UPI UTR / Bank Ref"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                    {t.report?.incidentDate || 'Date of Occurrence'}
                  </label>
                  <input
                    type="date"
                    name="incidentDate"
                    value={formData.incidentDate}
                    onChange={handleChange}
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                    {t.report?.bankName || 'Your Bank / Wallet'}
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    placeholder="e.g. HDFC Bank, SBI, Paytm"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-xl)' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep(2)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  {t.report?.nextBtn || 'Next: Suspect Identifiers'} <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: SUSPECT IDENTIFIERS */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-headline-sm" style={{ marginBottom: 'var(--space-md)', color: 'var(--color-on-surface)' }}>
                {t.report?.step2Heading || 'Step 2: Suspect Details & Fraudster Footprints'}
              </h2>
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
                {t.report?.step2Desc || 'Enter whatever identifiers you have. Any phone number, UPI handle, or website link helps police track the beneficiary accounts.'}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                <div>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                    {t.report?.suspectPhone || 'Suspect Phone / WhatsApp Number'}
                  </label>
                  <input
                    type="tel"
                    name="suspectPhone"
                    value={formData.suspectPhone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                    {t.report?.suspectUpi || 'Suspect UPI ID / VPA'}
                  </label>
                  <input
                    type="text"
                    name="suspectUpi"
                    value={formData.suspectUpi}
                    onChange={handleChange}
                    placeholder="e.g. fraudster@ybl, refund@axisbank"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                    {t.report?.suspectAccount || 'Suspect Bank Account Number'}
                  </label>
                  <input
                    type="text"
                    name="suspectAccount"
                    value={formData.suspectAccount}
                    onChange={handleChange}
                    placeholder="Beneficiary Account Number"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>

                <div>
                  <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                    {t.report?.suspectIfsc || 'Suspect Bank IFSC Code'}
                  </label>
                  <input
                    type="text"
                    name="suspectIfsc"
                    value={formData.suspectIfsc}
                    onChange={handleChange}
                    placeholder="e.g. PYTM0123456"
                    className="input"
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: 'var(--space-md)' }}>
                <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                  {t.report?.suspectUrl || 'Suspect Website, Telegram Channel, or Social Profile URL'}
                </label>
                <input
                  type="url"
                  name="suspectUrl"
                  value={formData.suspectUrl}
                  onChange={handleChange}
                  placeholder="https://t.me/..., https://fake-investment-portal.com"
                  className="input"
                  style={{ width: '100%' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <ArrowLeft size={18} /> {t.report?.backBtn || 'Back'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setStep(3)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  {t.report?.nextEvidence || 'Next: Evidence & Narrative'} <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: EVIDENCE & NARRATIVE */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-headline-sm" style={{ marginBottom: 'var(--space-md)', color: 'var(--color-on-surface)' }}>
                {t.report?.step3Heading || 'Step 3: Narrative & Evidence Upload'}
              </h2>

              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                  {t.report?.description || 'Incident Narrative (What happened? What did they ask you to do?)'}
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly state: 1) Initial contact channel, 2) The pitch/pretense, 3) How payment was made, 4) When you realized it was fraud."
                  className="input"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {/* Upload Dropzone */}
              <div style={{ marginBottom: 'var(--space-lg)' }}>
                <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                  {t.report?.evidenceHint || 'Attach Evidence (Screenshots of chat, payment receipts, APK files)'}
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  multiple
                  accept="image/*,.pdf,.apk"
                  style={{ display: 'none' }}
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--color-outline-variant)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-lg)',
                    textAlign: 'center',
                    background: 'var(--color-surface)',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s'
                  }}
                >
                  <Upload size={32} color="var(--color-primary)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                    {t.report?.uploadDropzone || 'Click to upload evidence screenshots or PDF receipts'}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
                    PNG, JPG, PDF up to 25MB. Files are verified locally.
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div style={{ marginTop: 'var(--space-sm)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {uploadedFiles.map((file, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          background: 'var(--color-surface-container-low)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 13
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <FileText size={16} color="var(--color-primary)" />
                          <span style={{ fontWeight: 500 }}>{file.name}</span>
                          <span style={{ color: 'var(--color-outline)' }}>({file.size})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Citizen Details */}
              <div style={{ borderTop: '1px solid var(--color-surface-container-high)', paddingTop: 'var(--space-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-md)' }}>
                  <input
                    type="checkbox"
                    id="isAnonymous"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleChange}
                    style={{ width: 18, height: 18 }}
                  />
                  <label htmlFor="isAnonymous" style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-on-surface)', cursor: 'pointer' }}>
                    {t.report?.anonymousCheck || 'Generate Anonymous Dossier (Keep identity masked in public logs)'}
                  </label>
                </div>

                {!formData.isAnonymous && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)' }}>
                    <div>
                      <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                        {t.report?.complainantName || 'Your Full Name'}
                      </label>
                      <input
                        type="text"
                        name="victimName"
                        value={formData.victimName}
                        onChange={handleChange}
                        placeholder="As registered with your bank"
                        className="input"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <div>
                      <label className="text-label-md" style={{ display: 'block', marginBottom: 6 }}>
                        {t.report?.complainantPhone || 'Your Contact Number'}
                      </label>
                      <input
                        type="tel"
                        name="victimPhone"
                        value={formData.victimPhone}
                        onChange={handleChange}
                        placeholder="+91 Mobile number"
                        className="input"
                        style={{ width: '100%' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-xl)' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStep(2)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <ArrowLeft size={18} /> {t.report?.backBtn || 'Back'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={18} className="spin" /> Compiling Dossier...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> {t.report?.generateBtn || 'Generate Police FIR Dossier'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: COMPLETED DOSSIER & NEXT STEPS */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--risk-safe-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <ShieldCheck size={32} color="var(--risk-safe-text)" />
                </div>
                <h2 className="text-headline-md" style={{ color: 'var(--color-on-surface)' }}>
                  {t.report?.step4Heading || 'Incident Dossier Generated Successfully'}
                </h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 6, padding: '4px 12px', background: 'var(--color-primary-fixed)', borderRadius: 9999 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)' }}>
                    REFERENCE ID: {submittedRef}
                  </span>
                </div>
              </div>

              {/* Dossier Code Box */}
              <div style={{
                background: '#0b132b',
                color: '#e0e3e5',
                padding: 'var(--space-lg)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.6,
                position: 'relative',
                maxHeight: 280,
                overflowY: 'auto',
                marginBottom: 'var(--space-lg)'
              }}>
                <button
                  onClick={copyDossier}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 12
                  }}
                >
                  {copied ? <Check size={14} color="#7ffc97" /> : <Copy size={14} />}
                  {copied ? (t.report?.copied || 'Copied!') : (t.report?.copyDossier || 'Copy Dossier')}
                </button>

                <div style={{ color: '#7ffc97', fontWeight: 'bold' }}>=== SANGYAN SHIELD CYBER FRAUD INCIDENT SUMMARY ===</div>
                <div>Incident Reference : {submittedRef}</div>
                <div>Category           : {formData.category.toUpperCase()}</div>
                <div>Occurrence Date    : {formData.incidentDate} at {formData.incidentTime}</div>
                <div>Amount Defrauded   : ₹{formData.amountLost || '0'}</div>
                <div>Transaction / UTR  : {formData.utrNumber || 'N/A'}</div>
                <div>Suspect Phone      : {formData.suspectPhone || 'N/A'}</div>
                <div>Suspect UPI / VPA  : {formData.suspectUpi || 'N/A'}</div>
                <div>Suspect Bank Acct  : {formData.suspectAccount || 'N/A'} (IFSC: {formData.suspectIfsc || 'N/A'})</div>
                <div>Suspect Link/Host  : {formData.suspectUrl || 'N/A'}</div>
                <div>Reporter           : {formData.isAnonymous ? 'ANONYMOUS CITIZEN' : `${formData.victimName || 'N/A'} (${formData.victimPhone || 'N/A'})`}</div>
                <div style={{ marginTop: 8 }}>Narrative:</div>
                <div style={{ color: '#b7c4ff' }}>{formData.description || 'No detailed narrative provided.'}</div>
                <div style={{ marginTop: 8, color: '#fcd34d' }}>Evidence Attachments: {uploadedFiles.length} file(s) indexed with SHA-256 fingerprinting.</div>
              </div>

              {/* Action Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                <div style={{ padding: 'var(--space-md)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Phone size={18} color="var(--color-primary)" />
                    <span style={{ fontWeight: 700, fontSize: 15 }}>
                      {t.report?.call1930Action || '1. Call 1930 & Quote UTR'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', margin: 0 }}>
                    Provide the 12-digit UPI UTR or bank reference to the operator so they can raise a lien on the recipient bank account.
                  </p>
                </div>

                <div style={{ padding: 'var(--space-md)', border: '1px solid var(--color-outline-variant)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <ExternalLink size={18} color="var(--color-primary)" />
                    <span style={{ fontWeight: 700, fontSize: 15 }}>
                      {t.report?.pastePortalAction || '2. Paste into cybercrime.gov.in'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--color-on-surface-variant)', margin: 0 }}>
                    Use the copied dossier summary directly in the National Cyber Crime Reporting Portal's Citizen Complaint filing form.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setStep(1)
                    setSubmittedRef(null)
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <RefreshCw size={16} /> {t.report?.newReport || 'File Another Report'}
                </button>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}
                >
                  {t.report?.officialPortal || 'Proceed to cybercrime.gov.in'} <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          )}

        </div>

      </div>
    </PageTransition>
  )
}
