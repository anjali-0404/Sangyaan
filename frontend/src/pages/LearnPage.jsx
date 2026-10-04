import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Shield, AlertTriangle, Link2,
  Eye, Clock, ArrowRight, CheckCircle, Award,
  GraduationCap, PlayCircle, ChevronDown, ChevronUp, Zap,
  X, HelpCircle, Check, AlertCircle, RotateCcw, ExternalLink,
  Printer, Sparkles
} from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { useLanguage } from '../context/LanguageContext'
import { MODULE_LESSONS } from '../data/learningModules'

const LESSON_CATEGORIES = [
  {
    id: 'upi',
    icon: Shield,
    color: 'var(--color-primary)',
    titles: {
      en: 'UPI Safety',
      hi: 'यूपीआई सुरक्षा',
      mr: 'यूपीआई सुरक्षितता',
      bn: 'ইউপিআই সুরক্ষা',
      te: 'యూపీఐ భద్రత',
      ta: 'யுபிஐ பாதுகாப்பு',
      gu: 'યુપીઆઈ સુરક્ષા',
      kn: 'ಯುಪಿಐ ಭದ್ರತೆ',
    },
    modules: [
      {
        id: 'upi-1',
        duration: '3 min',
        difficulty: 'Beginner',
        completed: true,
        titles: {
          en: 'How to Spot Fake UPI Payment Requests',
          hi: 'फर्जी यूपीआई भुगतान अनुरोध कैसे पहचानें',
          mr: 'बनावट यूपीआई पेमेंट विनंती कशी ओळखावी',
          bn: 'ভুয়া ইউপিআই পেমেন্ট অনুরোধ কীভাবে চিহ্নিত করবেন',
          te: 'నకిలీ యూపీఐ చెల్లింపు అభ్యర్థనలను ఎలా గుర్తించాలి',
          ta: 'போலி யுபிஐ கட்டணக் கோரிக்கைகளை எவ்வாறு கண்டறிவது',
          gu: 'નકલી યુપીઆઈ ચુકવણી વિનંતીઓ કેવી રીતે ઓળખવી',
          kn: 'ನಕಲಿ ಯುಪಿಐ ಪಾವತಿ ವಿನಂತಿಗಳನ್ನು ಹೇಗೆ ಗುರುತಿಸುವುದು',
        }
      },
      {
        id: 'upi-2',
        duration: '4 min',
        difficulty: 'Beginner',
        completed: true,
        titles: {
          en: 'Understanding UPI Collect vs Pay Requests',
          hi: 'यूपीआई कलेक्ट और पे अनुरोधों का अंतर समझें',
          mr: 'यूपीआई कलेक्ट आणि पे मधील फरक समजून घ्या',
          bn: 'ইউপিআই কালেক্ট বনাম পে অনুরোধের পার্থক্য বুঝুন',
          te: 'యూపీఐ కలెక్ట్ వర్సెస్ పే అభ్యర్థనలను అర్థం చేసుకోవడం',
          ta: 'யுபிஐ கலெக்ட் மற்றும் பே கோரிக்கைகளைப் புரிந்துகொள்வது',
          gu: 'યુપીઆઈ કલેક્ટ વિરુદ્ધ પે વિનંતીઓ સમજો',
          kn: 'ಯುಪಿಐ ಕಲೆಕ್ಟ್ ಮತ್ತು ಪೇ ವಿನಂತಿಗಳ ವ್ಯತ್ಯಾಸ ತಿಳಿಯಿರಿ',
        }
      },
      {
        id: 'upi-3',
        duration: '5 min',
        difficulty: 'Intermediate',
        completed: false,
        titles: {
          en: 'QR Code Scams: What to Watch For',
          hi: 'क्यूआर कोड घोटाले: किन बातों का ध्यान रखें',
          mr: 'क्युआर कोड घोटाळे: कशाकडे लक्ष द्यावे',
          bn: 'কিউআর কোড স্ক্যাম: কী লক্ষ্য রাখতে হবে',
          te: 'క్యూఆర్ కోడ్ మోసాలు: ఏమి గమనించాలి',
          ta: 'க்யூஆர் கோட் மோசடிகள்: கவனிக்க வேண்டியவை',
          gu: 'ક્યુઆર કોડ કૌભાંડો: શું ધ્યાનમાં રાખવું',
          kn: 'ಕ್ಯೂಆರ್ ಕೋಡ್ ವಂಚನೆಗಳು: ಏನು ಗಮನಿಸಬೇಕು',
        }
      },
    ]
  },
  {
    id: 'investment',
    icon: AlertTriangle,
    color: 'var(--color-error)',
    titles: {
      en: 'Investment Scams',
      hi: 'निवेश घोटाले व पोंजी स्कीमें',
      mr: 'गुंतवणूक घोटाळे व पोंझी योजना',
      bn: 'বিনিয়োগ কেলেঙ্কারি ও পনজি স্কিম',
      te: 'పెట్టుబడి మోసాలు & పోంజీ పథకాలు',
      ta: 'முதலீட்டு மோசடிகள் & பொன்சி திட்டங்கள்',
      gu: 'રોકાણ કૌભાંડો અને પોન્ઝી સ્કીમ',
      kn: 'ಹೂಡಿಕೆ ವಂಚನೆಗಳು ಮತ್ತು ಪೊಂಜಿ ಯೋಜನೆಗಳು',
    },
    modules: [
      {
        id: 'inv-1',
        duration: '4 min',
        difficulty: 'Beginner',
        completed: false,
        titles: {
          en: 'Guaranteed Returns: The Biggest Red Flag',
          hi: 'गारंटीड रिटर्न: धोखाधड़ी का सबसे बड़ा संकेत',
          mr: 'खात्रीशीर परतावा: सर्वात मोठा धोक्याचा इशारा',
          bn: 'নিশ্চিত রিটার্ন: প্রতারণার সবচেয়ে বড় সতর্কতা',
          te: 'హామీ ఇచ్చిన రాబడి: అతిపెద్ద ప్రమాద సంకేతం',
          ta: 'உத்தரவாத வருமானம்: மிகப்பெரிய எச்சரிக்கை அடையாளம்',
          gu: 'ગેરંટીડ રિટર્ન: છેતરપિંડીનો સૌથી મોટો સંકેત',
          kn: 'ಖಾತರಿಯ ಆದಾಯ: ಅತ್ಯಂತ ದೊಡ್ಡ ಎಚ್ಚರಿಕೆಯ ಸಂಕೇತ',
        }
      },
      {
        id: 'inv-2',
        duration: '6 min',
        difficulty: 'Intermediate',
        completed: false,
        titles: {
          en: 'How to Verify SEBI Registration Numbers',
          hi: 'सेबी पंजीकरण संख्या की वैधता कैसे जांचें',
          mr: 'सेबी नोंदणी क्रमांक कसा तपासावा',
          bn: 'সেবি নিবন্ধন নম্বর কীভাবে যাচাই করবেন',
          te: 'సెబీ రిజిస్ట్రేషన్ నంబర్లను ఎలా ధృవీకరించాలి',
          ta: 'செபி பதிவு எண்களை எவ்வாறு சரிபார்ப்பது',
          gu: 'સેબી નોંધણી નંબર કેવી રીતે ચકાસવો',
          kn: 'ಸೆಬಿ ನೋಂದಣಿ ಸಂಖ್ಯೆಯನ್ನು ಹೇಗೆ ಪರಿಶೀಲಿಸುವುದು',
        }
      },
      {
        id: 'inv-3',
        duration: '5 min',
        difficulty: 'Beginner',
        completed: false,
        titles: {
          en: 'Telegram & WhatsApp Trading Group Red Flags',
          hi: 'टेलीग्राम व व्हाट्सएप ट्रेडिंग ग्रुप के खतरे',
          mr: 'टेलिग्राम आणि व्हॉट्सअ‍ॅप ट्रेडिंग ग्रुप्समधील धोके',
          bn: 'টেলিগ্রাম ও হোয়াটসঅ্যাপ ট্রেডিং গ্রুপের ঝুঁকি',
          te: 'టెలిగ్రామ్ & వాట్సాప్ ట్రేడింగ్ గ్రూపుల ప్రమాదాలు',
          ta: 'டெலிகிராம் & வாட்ஸ்அப் டிரேடிங் குழு ஆபத்துகள்',
          gu: 'ટેલિગ્રામ અને વોટ્સએપ ટ્રેડિંગ ગ્રૂપના જોખમો',
          kn: 'ಟೆಲಿಗ್ರಾಂ ಮತ್ತು ವಾಟ್ಸಾಪ್ ಟ್ರೇಡಿಂಗ್ ಗ್ರೂಪ್ ಅಪಾಯಗಳು',
        }
      },
    ]
  },
  {
    id: 'identity',
    icon: Eye,
    color: 'var(--color-secondary)',
    titles: {
      en: 'Digital Identity & Privacy',
      hi: 'डिजिटल पहचान व आधार सुरक्षा',
      mr: 'डिजिटल ओळख व आधार सुरक्षितता',
      bn: 'ডিজিটাল পরিচয় ও গোপনীয়তা',
      te: 'డిజిటల్ గుర్తింపు & గోప్యత',
      ta: 'டிஜிட்டல் அடையாளம் & தனியுரிமை',
      gu: 'ડિજિટલ ઓળખ અને ગોપનીયતા',
      kn: 'ಡಿಜಿಟಲ್ ಗುರುತು ಮತ್ತು ಗೌಪ್ಯತೆ',
    },
    modules: [
      {
        id: 'id-1',
        duration: '4 min',
        difficulty: 'Beginner',
        completed: true,
        titles: {
          en: 'Protecting Your Aadhaar & PAN Details',
          hi: 'अपने आधार और पैन विवरण की सुरक्षा',
          mr: 'आधार आणि पॅन तपशील सुरक्षित ठेवणे',
          bn: 'আপনার আধার ও প্যান বিবরণ সুরক্ষিত রাখা',
          te: 'మీ ఆధార్ మరియు పాన్ వివరాలను రక్షించడం',
          ta: 'உங்கள் ஆதார் & பான் விவரங்களைப் பாதுகாத்தல்',
          gu: 'તમારી આધાર અને પાન વિગતો સુરક્ષિત રાખવી',
          kn: 'ನಿಮ್ಮ ಆಧಾರ್ ಮತ್ತು ಪ್ಯಾನ್ ವಿವರಗಳನ್ನು ರಕ್ಷಿಸುವುದು',
        }
      },
      {
        id: 'id-2',
        duration: '7 min',
        difficulty: 'Advanced',
        completed: false,
        titles: {
          en: 'SIM Swap Fraud: Prevention & Recovery',
          hi: 'सिम स्वैप धोखाधड़ी: रोकथाम व त्वरित उपाय',
          mr: 'सिम स्वॅप फसवणूक: प्रतिबंध आणि उपाय',
          bn: 'সিম সোয়াপ প্রতারণা: প্রতিরোধ ও প্রতিকার',
          te: 'సిమ్ స్వాప్ మోసం: నివారణ & రికవరీ',
          ta: 'சிம் ஸ்வாப் மோசடி: தடுப்பு & மீட்பு',
          gu: 'સિમ સ્વેપ ફ્રોડ: નિવારણ અને પુનઃપ્રાપ્તિ',
          kn: 'ಸಿಮ್ ಸ್ವಾಪ್ ವಂಚನೆ: ತಡೆಗಟ್ಟುವಿಕೆ ಮತ್ತು ಪರಿಹಾರ',
        }
      },
      {
        id: 'id-3',
        duration: '5 min',
        difficulty: 'Intermediate',
        completed: false,
        titles: {
          en: 'Social Engineering: Voice Call Tactics',
          hi: 'वॉयस कॉल धोखाधड़ी और सामाजिक इंजीनियरिंग',
          mr: 'व्हॉइस कॉलद्वारे फसवणुकीचे तंत्र',
          bn: 'ভয়েস কল ও সোশাল ইঞ্জিনিয়ারিং কৌশল',
          te: 'వాయిస్ కాల్ వ్యూహాలు & సోషల్ ఇంజనీరింగ్',
          ta: 'வாய்ஸ் கால் உத்திகள் & சமூக பொறியியல்',
          gu: 'વોઇસ કોલ યુક્તિઓ અને સામાજિક છેતરપિંડી',
          kn: 'ವಾಯ್ಸ್ ಕಾಲ್ ತಂತ್ರಗಳು ಮತ್ತು ಸಾಮಾಜಿಕ ಇಂಜಿನಿಯರಿಂಗ್',
        }
      },
    ]
  },
  {
    id: 'phishing',
    icon: Link2,
    color: 'var(--color-tertiary)',
    titles: {
      en: 'Phishing & Malware Defense',
      hi: 'फ़िशिंग व बैंकिंग मैलवेयर सुरक्षा',
      mr: 'फिशिंग व बँकिंग मालवेअर संरक्षण',
      bn: 'ফিশিং ও ম্যালওয়্যার প্রতিরক্ষা',
      te: 'ఫిషింగ్ & మాల్వేర్ రక్షణ',
      ta: 'ஃபிஷிங் & மால்வேர் பாதுகாப்பு',
      gu: 'ફિશિંગ અને માલવેર સંરક્ષણ',
      kn: 'ಫಿಶಿಂಗ್ ಮತ್ತು ಮಾಲ್ವೇರ್ ರಕ್ಷಣೆ',
    },
    modules: [
      {
        id: 'ph-1',
        duration: '3 min',
        difficulty: 'Beginner',
        completed: false,
        titles: {
          en: 'Identifying Fake Government Websites',
          hi: 'फर्जी सरकारी वेबसाइटों की पहचान कैसे करें',
          mr: 'बनावट सरकारी वेबसाइट्स कशा ओळखाव्या',
          bn: 'ভুয়া সরকারি ওয়েবসাইট কীভাবে শনাক্ত করবেন',
          te: 'నకిలీ ప్రభుత్వ వెబ్‌సైట్‌లను ఎలా గుర్తించాలి',
          ta: 'போலி அரசு இணையதளங்களை எவ்வாறு கண்டறிவது',
          gu: 'નકલી સરકારી વેબસાઇટ્સ કેવી રીતે ઓળખવી',
          kn: 'ನಕಲಿ ಸರ್ಕಾರಿ ವೆಬ್‌ಸೈಟ್‌ಗಳನ್ನು ಹೇಗೆ ಗುರುತಿಸುವುದು',
        }
      },
      {
        id: 'ph-2',
        duration: '5 min',
        difficulty: 'Intermediate',
        completed: false,
        titles: {
          en: 'APK Sideloading Dangers on Android',
          hi: 'एंड्रॉइड पर अज्ञात एपीके डाउनलोड के खतरे',
          mr: 'अँड्रॉइडवर अनोळखी एपीके इन्स्टॉल करण्याचे धोके',
          bn: 'অ্যান্ড্রয়েডে ক্ষতিকর এপিকে ডাউনলোডের বিপদ',
          te: 'ఆండ్రాయిడ్‌లో ప్రమాదకర ఏపీకే డౌన్‌లోడ్ ప్రమాదాలు',
          ta: 'ஆண்ட்ராய்டில் ஏபிகே பதிவிறக்க ஆபத்துகள்',
          gu: 'એન્ડ્રોઇડ પર અજાણી એપીકે ડાઉનલોડના જોખમો',
          kn: 'ಆಂಡ್ರಾಯ್ಡ್‌ನಲ್ಲಿ ಅಪಾಯಕಾರಿ ಎಪಿಕೆ ಡೌನ್‌ಲೋಡ್ ತೊಂದರೆಗಳು',
        }
      },
      {
        id: 'ph-3',
        duration: '8 min',
        difficulty: 'Advanced',
        completed: false,
        titles: {
          en: 'Banking Trojan Defense for Indian Users',
          hi: 'भारतीय उपयोगकर्ताओं के लिए बैंकिंग ट्रोजन सुरक्षा',
          mr: 'भारतीय युजर्ससाठी बँकिंग ट्रोजनपासून बचाव',
          bn: 'ভারতীয় ব্যবহারকারীদের জন্য ব্যাংকিং ট্রোজান প্রতিরোধ',
          te: 'భారతీయ వినియోగదారులకు బ్యాంకింగ్ ట్రోజన్ రక్షణ',
          ta: 'இந்திய பயனர்களுக்கான வங்கி ட்ரோஜன் பாதுகாப்பு',
          gu: 'ભારતીય વપરાશકર્તાઓ માટે બેંકિંગ ટ્રોજન સંરક્ષણ',
          kn: 'ಭಾರತೀಯ ಬಳಕೆದಾರರಿಗೆ ಬ್ಯಾಂಕಿಂಗ್ ಟ್ರೋಜನ್ ರಕ್ಷಣೆ',
        }
      },
    ]
  },
]

const DIFFICULTY_TRANSLATIONS = {
  Beginner: {
    en: 'Beginner',
    hi: 'प्रारंभिक',
    mr: 'सुरुवात',
    bn: 'প্রাথমিক',
    te: 'ప్రారంభ',
    ta: 'தொடக்க நிலை',
    gu: 'પ્રારંભિક',
    kn: 'ಆರಂಭಿಕ'
  },
  Intermediate: {
    en: 'Intermediate',
    hi: 'मध्यम',
    mr: 'मध्यम',
    bn: 'মধ্যবর্তী',
    te: 'మధ్యస్థ',
    ta: 'இடைநிலை',
    gu: 'મધ્યમ',
    kn: 'ಮಧ್ಯಂತರ'
  },
  Advanced: {
    en: 'Advanced',
    hi: 'उन्नत',
    mr: 'प्रगत',
    bn: 'উন্নত',
    te: 'ఉన్నత',
    ta: 'மேம்பட்ட',
    gu: 'ઉન્નત',
    kn: 'ಮುಂದುವರಿದ'
  }
}

const DIFFICULTY_COLORS = {
  Beginner: { bg: 'var(--color-tertiary-fixed)', color: 'var(--color-on-tertiary-fixed)' },
  Intermediate: { bg: 'var(--color-secondary-fixed)', color: 'var(--color-on-secondary-fixed)' },
  Advanced: { bg: 'var(--color-error-container)', color: 'var(--color-on-error-container)' },
}

export default function LearnPage() {
  const { t, currentLang } = useLanguage()
  const lang = currentLang || 'en'
  const [expandedCategory, setExpandedCategory] = useState(0)

  // Local storage persisted completion state
  const STORAGE_KEY = 'sangyaan.completed.modules'
  const [completedModules, setCompletedModules] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved)
    } catch { /* ignore */ }
    return ['upi-1', 'upi-2', 'id-1'] // initial default completed modules
  })

  // Active module modal states
  const [activeModuleModal, setActiveModuleModal] = useState(null)
  const [modalTab, setModalTab] = useState('guide') // 'guide' | 'quiz'
  const [quizQuestionIndex, setQuizQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState({}) // { [qId]: optionIndex }
  const [revealedAnswers, setRevealedAnswers] = useState({}) // { [qId]: true }
  const [quizFinished, setQuizFinished] = useState(false)

  // Certificate Modal state
  const [showCertificateModal, setShowCertificateModal] = useState(false)

  const markModuleCompleted = (moduleId) => {
    setCompletedModules(prev => {
      if (prev.includes(moduleId)) return prev
      const updated = [...prev, moduleId]
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch { /* ignore */ }
      return updated
    })
  }

  const openModule = (mod, category, tab = 'guide') => {
    setActiveModuleModal({ mod, category })
    setModalTab(tab)
    setQuizQuestionIndex(0)
    setSelectedAnswers({})
    setRevealedAnswers({})
    setQuizFinished(false)
  }

  const closeModule = () => {
    setActiveModuleModal(null)
  }

  const totalModules = LESSON_CATEGORIES.reduce((sum, cat) => sum + cat.modules.length, 0)
  const completedCount = completedModules.length
  const progressPercent = Math.min(100, Math.round((completedCount / totalModules) * 100))

  // Retrieve active lesson data
  const activeLessonData = activeModuleModal ? MODULE_LESSONS[activeModuleModal.mod.id] : null
  const currentQuizQuestions = activeLessonData?.quiz || []
  const currentQuestion = currentQuizQuestions[quizQuestionIndex]

  // Calculate score if finished
  const correctCount = currentQuizQuestions.reduce((acc, q) => {
    const selected = selectedAnswers[q.id]
    if (selected !== undefined && q.options[selected]?.correct) {
      return acc + 1
    }
    return acc
  }, 0)

  // Badges status for Certificate modal
  const upiBadgeEarned = ['upi-1', 'upi-2', 'upi-3'].every(id => completedModules.includes(id))
  const invBadgeEarned = ['inv-1', 'inv-2', 'inv-3'].every(id => completedModules.includes(id))
  const idBadgeEarned = ['id-1', 'id-2', 'id-3'].every(id => completedModules.includes(id))
  const phBadgeEarned = ['ph-1', 'ph-2', 'ph-3'].every(id => completedModules.includes(id))

  return (
    <PageTransition>
      <div className="container-max" style={{ padding: 'var(--space-xl) var(--margin)' }}>
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-on-primary-fixed) 100%)',
            borderRadius: 'var(--radius-xl)', padding: 'var(--space-xl)', marginBottom: 'var(--space-lg)',
            color: 'var(--color-on-primary)', position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(183,196,255,0.1)', filter: 'blur(40px)' }} />
          <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-lg)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', marginBottom: 8 }}>
                <GraduationCap size={20} style={{ color: 'var(--color-tertiary-fixed)' }} />
                <span className="text-label-sm" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  {t.learn?.tag || 'Sangyan Micro-Lessons'}
                </span>
              </div>
              <h1 className="text-headline-lg" style={{ fontWeight: 700 }}>
                {t.learn?.title || 'Learn to Protect Yourself'}
              </h1>
              <p className="text-body-md" style={{ color: 'var(--color-primary-fixed)', marginTop: 4, maxWidth: 520 }}>
                {t.learn?.desc || "Bite-sized, bilingual lessons on identifying scams, protecting your digital identity, and staying safe in India's digital payment ecosystem."}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 100, height: 100, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                background: 'rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontSize: 28, fontWeight: 800 }}>{progressPercent}%</span>
                <span className="text-label-sm">{t.learn?.complete || 'Complete'}</span>
              </div>
              <p className="text-label-sm" style={{ marginTop: 8, color: 'var(--color-primary-fixed)' }}>
                {completedCount}/{totalModules} {t.learn?.modulesDone || 'modules done'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          {[
            {
              icon: BookOpen,
              label: t.learn?.statModules || `${totalModules} Modules`,
              desc: t.learn?.statModulesDesc || 'Bite-sized 3-8 min lessons',
              color: 'var(--color-primary)',
              clickable: false
            },
            {
              icon: Award,
              label: t.learn?.statCerts || 'Certificates',
              desc: `${completedCount >= 12 ? 'All Badges Unlocked!' : 'Click to view badges'}`,
              color: 'var(--color-secondary)',
              clickable: true,
              onClick: () => setShowCertificateModal(true)
            },
            {
              icon: Zap,
              label: t.learn?.statBilingual || 'Hindi + English',
              desc: t.learn?.statBilingualDesc || 'Fully bilingual content',
              color: 'var(--color-tertiary)',
              clickable: false
            },
            {
              icon: PlayCircle,
              label: t.learn?.statInteractive || 'Interactive',
              desc: t.learn?.statInteractiveDesc || 'Quizzes & simulations',
              color: 'var(--color-error)',
              clickable: false
            },
          ].map((stat, i) => (
            <div
              key={i}
              onClick={stat.clickable ? stat.onClick : undefined}
              style={{
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-surface-container-lowest)',
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-sm)',
                cursor: stat.clickable ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                border: stat.clickable ? '1px solid var(--color-secondary-fixed)' : 'none'
              }}
              onMouseEnter={e => {
                if (stat.clickable) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                }
              }}
              onMouseLeave={e => {
                if (stat.clickable) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)'
                }
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: `${stat.color}12`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: stat.color, flexShrink: 0
              }}>
                <stat.icon size={20} />
              </div>
              <div>
                <span className="text-label-lg" style={{ fontWeight: 700, color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {stat.label}
                  {stat.clickable && <ExternalLink size={12} color="var(--color-secondary)" />}
                </span>
                <span className="text-body-sm" style={{ display: 'block', color: 'var(--color-on-surface-variant)' }}>{stat.desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Lesson Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {LESSON_CATEGORIES.map((category, catIndex) => {
            const categoryTitle = category.titles[lang] || category.titles.en
            const isExpanded = expandedCategory === catIndex
            const categoryCompletedCount = category.modules.filter(m => completedModules.includes(m.id)).length

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: catIndex * 0.1, duration: 0.3 }}
                style={{
                  background: 'var(--color-surface-container-lowest)',
                  borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-card)', overflow: 'hidden',
                }}
              >
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => setExpandedCategory(isExpanded ? -1 : catIndex)}
                  style={{
                    width: '100%', padding: 'var(--space-lg)', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    background: isExpanded ? 'var(--color-surface-container-low)' : 'transparent',
                    transition: 'background 0.2s', border: 'none', cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                      background: `${category.color}15`, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: category.color,
                    }}>
                      <category.icon size={22} />
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <h3 className="text-headline-sm" style={{ color: 'var(--color-on-surface)', fontWeight: 700, margin: 0 }}>
                        {categoryTitle}
                      </h3>
                      <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 2, display: 'inline-block' }}>
                        {categoryCompletedCount}/{category.modules.length} {t.learn?.completedText || 'completed'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    {/* Mini progress bar */}
                    <div style={{ width: 60, height: 6, borderRadius: 'var(--radius-full)', background: 'var(--color-surface-container-high)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(categoryCompletedCount / category.modules.length) * 100}%`,
                        height: '100%', borderRadius: 'var(--radius-full)', background: category.color,
                        transition: 'width 0.3s',
                      }} />
                    </div>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {/* Modules */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.25 }}
                    style={{ padding: '0 var(--space-lg) var(--space-lg)' }}
                  >
                    {category.modules.map((mod, modIndex) => {
                      const isCompleted = completedModules.includes(mod.id)
                      const diffColors = DIFFICULTY_COLORS[mod.difficulty]
                      const diffLabel = (DIFFICULTY_TRANSLATIONS[mod.difficulty] && DIFFICULTY_TRANSLATIONS[mod.difficulty][lang]) || mod.difficulty
                      const modTitle = mod.titles[lang] || mod.titles.en

                      return (
                        <div
                          key={mod.id}
                          onClick={() => openModule(mod, category, 'guide')}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
                            background: isCompleted ? 'rgba(127,252,151,0.08)' : 'transparent',
                            marginBottom: modIndex < category.modules.length - 1 ? 'var(--space-xs)' : 0,
                            transition: 'all 0.2s', cursor: 'pointer',
                            gap: 'var(--space-sm)',
                            border: '1px solid transparent',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = isCompleted ? 'rgba(127,252,151,0.14)' : 'var(--color-surface-container-low)'
                            e.currentTarget.style.borderColor = category.color + '40'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = isCompleted ? 'rgba(127,252,151,0.08)' : 'transparent'
                            e.currentTarget.style.borderColor = 'transparent'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: isCompleted ? 'var(--color-tertiary-fixed)' : 'var(--color-surface-container)',
                              color: isCompleted ? 'var(--color-tertiary)' : 'var(--color-outline)',
                            }}>
                              {isCompleted ? <CheckCircle size={18} /> : <PlayCircle size={18} />}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <span className="text-label-lg" style={{
                                fontWeight: 600, color: 'var(--color-on-surface)',
                                textDecoration: isCompleted ? 'none' : 'none',
                              }}>{modTitle}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                <span className="text-label-sm" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-outline)' }}>
                                  <Clock size={11} /> {mod.duration}
                                </span>
                                <span className="text-label-sm" style={{
                                  padding: '1px 6px', borderRadius: 'var(--radius-full)',
                                  background: diffColors.bg, color: diffColors.color, fontWeight: 600,
                                }}>
                                  {diffLabel}
                                </span>
                                {isCompleted && (
                                  <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                                    <Check size={12} strokeWidth={3} /> {t.learn?.completedText || 'Completed'}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              openModule(mod, category, isCompleted ? 'guide' : 'guide')
                            }}
                            style={{
                              padding: '7px 18px', borderRadius: 'var(--radius-default)',
                              background: isCompleted ? 'var(--color-surface-container-high)' : category.color,
                              color: isCompleted ? 'var(--color-on-surface)' : 'white',
                              fontWeight: 600, fontSize: 12, flexShrink: 0, display: 'flex',
                              alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer',
                              boxShadow: isCompleted ? 'none' : '0 2px 6px rgba(0,0,0,0.1)'
                            }}
                          >
                            {isCompleted ? (t.learn?.reviewBtn || 'Review') : (t.learn?.startBtn || 'Start')}
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      )
                    })}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* ============================================================ */}
        {/* INTERACTIVE MODULE LESSON & QUIZ MODAL */}
        {/* ============================================================ */}
        <AnimatePresence>
          {activeModuleModal && activeLessonData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(11, 19, 43, 0.72)',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-md)'
              }}
              onClick={closeModule}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.25 }}
                onClick={e => e.stopPropagation()}
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-xl)',
                  maxWidth: 760,
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(11, 19, 43, 0.35)',
                  border: '1px solid var(--color-outline-variant)'
                }}
              >
                {/* Modal Header */}
                <div style={{
                  padding: 'var(--space-lg)',
                  borderBottom: '1px solid var(--color-surface-container)',
                  background: 'var(--color-surface)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 'var(--space-md)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-sm)',
                        background: `${activeModuleModal.category.color}18`,
                        color: activeModuleModal.category.color
                      }}>
                        {activeModuleModal.category.titles[lang] || activeModuleModal.category.titles.en}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--color-outline)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {activeLessonData.readTime}
                      </span>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)',
                        background: DIFFICULTY_COLORS[activeLessonData.difficulty].bg,
                        color: DIFFICULTY_COLORS[activeLessonData.difficulty].color
                      }}>
                        {activeLessonData.difficulty}
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-on-surface)', margin: 0, lineHeight: 1.3 }}>
                      {activeLessonData.title[lang] || activeLessonData.title.en}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={closeModule}
                    style={{
                      background: 'var(--color-surface-container-high)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'var(--color-on-surface-variant)'
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Tabs switcher */}
                <div style={{
                  display: 'flex',
                  borderBottom: '1px solid var(--color-surface-container)',
                  background: '#ffffff',
                  padding: '0 var(--space-lg)'
                }}>
                  <button
                    type="button"
                    onClick={() => setModalTab('guide')}
                    style={{
                      padding: '12px 18px',
                      background: 'none',
                      border: 'none',
                      borderBottom: modalTab === 'guide' ? '3px solid var(--color-primary)' : '3px solid transparent',
                      fontWeight: modalTab === 'guide' ? 700 : 500,
                      color: modalTab === 'guide' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 14
                    }}
                  >
                    <BookOpen size={16} />
                    {lang === 'hi' ? 'पाठ निर्देशिका' : 'Lesson Guide'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalTab('quiz')}
                    style={{
                      padding: '12px 18px',
                      background: 'none',
                      border: 'none',
                      borderBottom: modalTab === 'quiz' ? '3px solid var(--color-primary)' : '3px solid transparent',
                      fontWeight: modalTab === 'quiz' ? 700 : 500,
                      color: modalTab === 'quiz' ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 14
                    }}
                  >
                    <HelpCircle size={16} />
                    {lang === 'hi' ? 'इंटरैक्टिव क्विज़' : 'Interactive Quiz'} ({currentQuizQuestions.length})
                    {completedModules.includes(activeModuleModal.mod.id) && (
                      <span style={{ fontSize: 10, background: '#dcfce7', color: '#16a34a', padding: '1px 6px', borderRadius: 9999, fontWeight: 700 }}>
                        Passed
                      </span>
                    )}
                  </button>
                </div>

                {/* Modal Body */}
                <div style={{ padding: 'var(--space-lg)', overflowY: 'auto', flex: 1, lineHeight: 1.6 }}>
                  {/* TAB 1: LESSON GUIDE */}
                  {modalTab === 'guide' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {/* Subtitle Highlight */}
                      <div style={{
                        padding: 'var(--space-md)',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--color-primary-fixed)',
                        color: 'var(--color-on-primary-fixed)',
                        fontWeight: 500,
                        fontSize: 14,
                        marginBottom: 'var(--space-lg)'
                      }}>
                        {activeLessonData.subtitle[lang] || activeLessonData.subtitle.en}
                      </div>

                      {/* Sections */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                        {activeLessonData.sections.map((sec, sIdx) => {
                          const secTitle = sec.title[lang] || sec.title.en
                          const secContent = sec.content ? (sec.content[lang] || sec.content.en) : null
                          const secPoints = sec.points ? (sec.points[lang] || sec.points.en) : null
                          const secHighlight = sec.highlight ? (sec.highlight[lang] || sec.highlight.en) : null

                          return (
                            <div
                              key={sIdx}
                              style={{
                                padding: 'var(--space-md)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-surface-container-high)',
                                background: '#ffffff'
                              }}
                            >
                              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: 8 }}>
                                {secTitle}
                              </h3>
                              {secContent && (
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-on-surface-variant)' }}>
                                  {secContent}
                                </p>
                              )}
                              {secPoints && (
                                <ul style={{ margin: '8px 0 0 18px', padding: 0, fontSize: '0.9rem', color: 'var(--color-on-surface-variant)' }}>
                                  {secPoints.map((pt, pIdx) => (
                                    <li key={pIdx} style={{ marginBottom: 4 }}>
                                      {pt}
                                    </li>
                                  ))}
                                </ul>
                              )}
                              {secHighlight && (
                                <div style={{
                                  marginTop: 8,
                                  padding: '12px 16px',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'linear-gradient(135deg, rgba(0, 81, 32, 0.08) 0%, rgba(127, 252, 151, 0.15) 100%)',
                                  borderLeft: '4px solid #005120',
                                  fontWeight: 600,
                                  color: '#005120',
                                  fontSize: '0.92rem'
                                }}>
                                  {secHighlight}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* CTA to Quiz */}
                      <div style={{ marginTop: 'var(--space-xl)', textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setModalTab('quiz')}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 24px',
                            fontWeight: 700,
                            borderRadius: 'var(--radius-md)'
                          }}
                        >
                          <HelpCircle size={18} />
                          {lang === 'hi' ? 'क्विज़ दें और बैज प्राप्त करें' : 'Take Module Quiz & Test Knowledge'} <ArrowRight size={18} />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB 2: INTERACTIVE QUIZ */}
                  {modalTab === 'quiz' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {!quizFinished ? (
                        currentQuestion ? (
                          <div>
                            {/* Quiz Header & Progress */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
                              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)' }}>
                                {lang === 'hi' ? `प्रश्न ${quizQuestionIndex + 1} / ${currentQuizQuestions.length}` : `Question ${quizQuestionIndex + 1} of ${currentQuizQuestions.length}`}
                              </span>
                              <div style={{ display: 'flex', gap: 4 }}>
                                {currentQuizQuestions.map((_, dotIdx) => (
                                  <div
                                    key={dotIdx}
                                    style={{
                                      width: 18,
                                      height: 6,
                                      borderRadius: 4,
                                      background: dotIdx === quizQuestionIndex
                                        ? 'var(--color-primary)'
                                        : dotIdx < quizQuestionIndex
                                        ? 'var(--risk-safe-text)'
                                        : 'var(--color-surface-container-high)'
                                    }}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Question text */}
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-on-surface)', marginBottom: 'var(--space-md)', lineHeight: 1.4 }}>
                              {currentQuestion.question[lang] || currentQuestion.question.en}
                            </h3>

                            {/* Options List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', marginBottom: 'var(--space-lg)' }}>
                              {currentQuestion.options.map((opt, optIdx) => {
                                const optText = opt.text[lang] || opt.text.en
                                const isSelected = selectedAnswers[currentQuestion.id] === optIdx
                                const isRevealed = revealedAnswers[currentQuestion.id]

                                let optBorder = '1.5px solid var(--color-outline-variant)'
                                let optBg = '#ffffff'
                                let optColor = 'var(--color-on-surface)'

                                if (isRevealed) {
                                  if (opt.correct) {
                                    optBorder = '2px solid #16a34a'
                                    optBg = '#dcfce7'
                                    optColor = '#166534'
                                  } else if (isSelected && !opt.correct) {
                                    optBorder = '2px solid #dc2626'
                                    optBg = '#fee2e2'
                                    optColor = '#991b1b'
                                  }
                                } else if (isSelected) {
                                  optBorder = '2px solid var(--color-primary)'
                                  optBg = 'var(--color-primary-fixed)'
                                }

                                return (
                                  <div
                                    key={optIdx}
                                    onClick={() => {
                                      if (!isRevealed) {
                                        setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: optIdx }))
                                      }
                                    }}
                                    style={{
                                      padding: '12px 16px',
                                      borderRadius: 'var(--radius-md)',
                                      border: optBorder,
                                      background: optBg,
                                      color: optColor,
                                      cursor: isRevealed ? 'default' : 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 12,
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <div style={{
                                      width: 22,
                                      height: 22,
                                      borderRadius: '50%',
                                      border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-outline)'}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                      background: isRevealed && opt.correct ? '#16a34a' : (isRevealed && isSelected && !opt.correct ? '#dc2626' : (isSelected ? 'var(--color-primary)' : 'transparent')),
                                      color: '#ffffff'
                                    }}>
                                      {isRevealed && opt.correct ? (
                                        <Check size={14} strokeWidth={3} />
                                      ) : isRevealed && isSelected && !opt.correct ? (
                                        <X size={14} strokeWidth={3} />
                                      ) : isSelected ? (
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ffffff' }} />
                                      ) : null}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', fontWeight: isSelected ? 600 : 500, lineHeight: 1.4 }}>
                                      {optText}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>

                            {/* Explanation Card when answer is revealed */}
                            {revealedAnswers[currentQuestion.id] && (
                              <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                  padding: 'var(--space-md)',
                                  borderRadius: 'var(--radius-md)',
                                  background: currentQuestion.options[selectedAnswers[currentQuestion.id]]?.correct ? '#f0fdf4' : '#fff7ed',
                                  border: `1.5px solid ${currentQuestion.options[selectedAnswers[currentQuestion.id]]?.correct ? '#86efac' : '#fdba74'}`,
                                  marginBottom: 'var(--space-lg)'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 14, color: currentQuestion.options[selectedAnswers[currentQuestion.id]]?.correct ? '#166534' : '#9a3412', marginBottom: 4 }}>
                                  {currentQuestion.options[selectedAnswers[currentQuestion.id]]?.correct ? (
                                    <>
                                      <CheckCircle size={18} /> {lang === 'hi' ? 'बिल्कुल सही!' : 'Correct Answer!'}
                                    </>
                                  ) : (
                                    <>
                                      <AlertTriangle size={18} /> {lang === 'hi' ? 'गलत उत्तर' : 'Incorrect'}
                                    </>
                                  )}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-on-surface)' }}>
                                  {currentQuestion.explanation[lang] || currentQuestion.explanation.en}
                                </p>
                              </motion.div>
                            )}

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
                              {!revealedAnswers[currentQuestion.id] ? (
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  disabled={selectedAnswers[currentQuestion.id] === undefined}
                                  onClick={() => {
                                    setRevealedAnswers(prev => ({ ...prev, [currentQuestion.id]: true }))
                                  }}
                                  style={{
                                    opacity: selectedAnswers[currentQuestion.id] === undefined ? 0.5 : 1,
                                    cursor: selectedAnswers[currentQuestion.id] === undefined ? 'not-allowed' : 'pointer'
                                  }}
                                >
                                  {lang === 'hi' ? 'उत्तर जांचें' : 'Check Answer'}
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={() => {
                                    if (quizQuestionIndex < currentQuizQuestions.length - 1) {
                                      setQuizQuestionIndex(prev => prev + 1)
                                    } else {
                                      setQuizFinished(true)
                                      markModuleCompleted(activeModuleModal.mod.id)
                                    }
                                  }}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                                >
                                  {quizQuestionIndex < currentQuizQuestions.length - 1 ? (
                                    <>
                                      {lang === 'hi' ? 'अगला प्रश्न' : 'Next Question'} <ArrowRight size={16} />
                                    </>
                                  ) : (
                                    <>
                                      {lang === 'hi' ? 'क्विज़ पूरा करें व बैज प्राप्त करें' : 'Finish Quiz & Claim Badge'} <Award size={16} />
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        ) : null
                      ) : (
                        /* QUIZ COMPLETED CELEBRATION VIEW */
                        <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: '50%',
                              background: '#dcfce7',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 16px',
                              boxShadow: '0 0 0 10px rgba(22, 163, 74, 0.15)'
                            }}
                          >
                            <Award size={44} color="#16a34a" />
                          </motion.div>

                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#dcfce7', color: '#166534', borderRadius: 9999, fontWeight: 700, fontSize: 12, marginBottom: 8 }}>
                            <Sparkles size={14} /> +50 SANGYAN SHIELD XP
                          </div>

                          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-on-surface)', marginBottom: 6 }}>
                            {lang === 'hi' ? 'शाबाश! आपने मॉड्यूल पूरा कर लिया है' : 'Module Completed Successfully!'}
                          </h3>
                          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 14, maxWidth: 440, margin: '0 auto 20px' }}>
                            {lang === 'hi'
                              ? `आपका स्कोर: ${correctCount}/${currentQuizQuestions.length}। आपने इस विषय में महारत हासिल कर ली है।`
                              : `Your Score: ${correctCount}/${currentQuizQuestions.length}. You have reinforced your defense against this scam pattern.`}
                          </p>

                          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => {
                                setModalTab('guide')
                                setQuizQuestionIndex(0)
                                setQuizFinished(false)
                                setSelectedAnswers({})
                                setRevealedAnswers({})
                              }}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <RotateCcw size={16} /> {lang === 'hi' ? 'पाठ पुनः पढ़ें' : 'Review Lesson'}
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={closeModule}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                            >
                              <CheckCircle size={16} /> {lang === 'hi' ? 'संपन्न / वापस जाएं' : 'Done & Return to Modules'}
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* CERTIFICATES & ACHIEVEMENT BADGES MODAL */}
        {/* ============================================================ */}
        <AnimatePresence>
          {showCertificateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(11, 19, 43, 0.75)',
                backdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-md)'
              }}
              onClick={() => setShowCertificateModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                style={{
                  background: '#ffffff',
                  borderRadius: 'var(--radius-xl)',
                  maxWidth: 680,
                  width: '100%',
                  maxHeight: '92vh',
                  overflowY: 'auto',
                  padding: 'var(--space-xl)',
                  boxShadow: '0 25px 50px -12px rgba(11, 19, 43, 0.35)',
                  border: '1px solid var(--color-outline-variant)',
                  position: 'relative'
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCertificateModal(false)}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'var(--color-surface-container-high)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={18} />
                </button>

                {/* Certificate Frame */}
                <div style={{
                  border: '3px double #0037b1',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-lg)',
                  textAlign: 'center',
                  background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Shield size={28} color="#0037b1" />
                    <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.1em', color: '#0037b1' }}>
                      SANGYAN SHIELD CIVIC DEFENSE
                    </span>
                  </div>

                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0b132b', margin: '4px 0 12px' }}>
                    CERTIFICATE OF CYBER READINESS
                  </h2>

                  <p style={{ fontSize: 13, color: '#434655', margin: '0 0 16px' }}>
                    This certifies that the citizen holder has undertaken practical cyber fraud prevention training in UPI Safety, Investment Risk, and Identity Shielding.
                  </p>

                  <div style={{
                    padding: '8px 16px',
                    borderRadius: 9999,
                    background: 'var(--color-primary-fixed)',
                    display: 'inline-block',
                    fontWeight: 700,
                    fontSize: 14,
                    color: 'var(--color-primary)',
                    marginBottom: 20
                  }}>
                    {completedCount} of 12 Modules Mastered ({progressPercent}%)
                  </div>

                  {/* 4 Badges */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
                    {[
                      { title: 'UPI Sentinel', earned: upiBadgeEarned, icon: Shield, color: '#0037b1', req: '3/3 UPI' },
                      { title: 'SEBI Hunter', earned: invBadgeEarned, icon: AlertTriangle, color: '#ba1a1a', req: '3/3 Invest' },
                      { title: 'Identity Guard', earned: idBadgeEarned, icon: Eye, color: '#4e5b93', req: '3/3 Identity' },
                      { title: 'Malware Shield', earned: phBadgeEarned, icon: Link2, color: '#005120', req: '3/3 Malware' },
                    ].map((badge, bIdx) => (
                      <div
                        key={bIdx}
                        style={{
                          padding: 12,
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${badge.earned ? badge.color : 'var(--color-surface-container-high)'}`,
                          background: badge.earned ? `${badge.color}10` : 'var(--color-surface)',
                          opacity: badge.earned ? 1 : 0.6
                        }}
                      >
                        <badge.icon size={24} color={badge.earned ? badge.color : 'var(--color-outline)'} style={{ margin: '0 auto 6px' }} />
                        <div style={{ fontWeight: 700, fontSize: 12, color: badge.earned ? badge.color : 'var(--color-outline)' }}>
                          {badge.title}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
                          {badge.earned ? 'UNLOCKED ✅' : badge.req}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-surface-container-high)', paddingTop: 12, fontSize: 11, color: 'var(--color-outline)' }}>
                    <span>National Cyber Security Protocol</span>
                    <span>Ref: SS-CERT-{Math.floor(100000 + completedCount * 7391)}</span>
                  </div>
                </div>

                {/* Modal Actions */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => window.print()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Printer size={16} /> Print / Save PDF
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowCertificateModal(false)}
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}

