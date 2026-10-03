import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen, Shield, AlertTriangle, Link2,
  Eye, Clock, ArrowRight, CheckCircle, Award,
  GraduationCap, PlayCircle, ChevronDown, ChevronUp, Zap
} from 'lucide-react'
import PageTransition from '../components/PageTransition'
import { useLanguage } from '../context/LanguageContext'

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
  const [expandedCategory, setExpandedCategory] = useState(0)

  const lang = currentLang || 'en'

  const totalModules = LESSON_CATEGORIES.reduce((sum, cat) => sum + cat.modules.length, 0)
  const completedModules = LESSON_CATEGORIES.reduce((sum, cat) => sum + cat.modules.filter(m => m.completed).length, 0)
  const progressPercent = Math.round((completedModules / totalModules) * 100)

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
                {completedModules}/{totalModules} {t.learn?.modulesDone || 'modules done'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-lg)' }}>
          {[
            { icon: BookOpen, label: t.learn?.statModules || `${totalModules} Modules`, desc: t.learn?.statModulesDesc || 'Bite-sized 3-8 min lessons', color: 'var(--color-primary)' },
            { icon: Award, label: t.learn?.statCerts || 'Certificates', desc: t.learn?.statCertsDesc || 'Earn completion badges', color: 'var(--color-secondary)' },
            { icon: Zap, label: t.learn?.statBilingual || 'Bilingual Content', desc: t.learn?.statBilingualDesc || 'Fully local language content', color: 'var(--color-tertiary)' },
            { icon: PlayCircle, label: t.learn?.statInteractive || 'Interactive', desc: t.learn?.statInteractiveDesc || 'Quizzes & simulations', color: 'var(--color-error)' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
              background: 'var(--color-surface-container-lowest)', boxShadow: 'var(--shadow-card)',
              display: 'flex', alignItems: 'center', gap: 'var(--space-sm)',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-md)',
                background: `${stat.color}12`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: stat.color,
              }}>
                <stat.icon size={20} />
              </div>
              <div>
                <span className="text-label-lg" style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{stat.label}</span>
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
            const completedCount = category.modules.filter(m => m.completed).length

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
                        {completedCount}/{category.modules.length} {t.learn?.completedText || 'completed'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                    {/* Mini progress bar */}
                    <div style={{ width: 60, height: 6, borderRadius: 'var(--radius-full)', background: 'var(--color-surface-container-high)', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(completedCount / category.modules.length) * 100}%`,
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
                      const diffColors = DIFFICULTY_COLORS[mod.difficulty]
                      const diffLabel = (DIFFICULTY_TRANSLATIONS[mod.difficulty] && DIFFICULTY_TRANSLATIONS[mod.difficulty][lang]) || mod.difficulty
                      const modTitle = mod.titles[lang] || mod.titles.en

                      return (
                        <div
                          key={mod.id}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: 'var(--space-md)', borderRadius: 'var(--radius-lg)',
                            background: mod.completed ? 'rgba(127,252,151,0.06)' : 'transparent',
                            marginBottom: modIndex < category.modules.length - 1 ? 'var(--space-xs)' : 0,
                            transition: 'background 0.2s', cursor: 'pointer',
                            gap: 'var(--space-sm)',
                          }}
                          onMouseEnter={e => { if (!mod.completed) e.currentTarget.style.background = 'var(--color-surface-container-low)' }}
                          onMouseLeave={e => { if (!mod.completed) e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', flex: 1, minWidth: 0 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: mod.completed ? 'var(--color-tertiary-fixed)' : 'var(--color-surface-container)',
                              color: mod.completed ? 'var(--color-tertiary)' : 'var(--color-outline)',
                            }}>
                              {mod.completed ? <CheckCircle size={16} /> : <PlayCircle size={16} />}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <span className="text-label-lg" style={{
                                fontWeight: 600, color: 'var(--color-on-surface)',
                                textDecoration: mod.completed ? 'line-through' : 'none',
                                opacity: mod.completed ? 0.7 : 1,
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
                              </div>
                            </div>
                          </div>
                          <button style={{
                            padding: '6px 16px', borderRadius: 'var(--radius-default)',
                            background: mod.completed ? 'var(--color-surface-container)' : category.color,
                            color: mod.completed ? 'var(--color-on-surface-variant)' : 'white',
                            fontWeight: 600, fontSize: 12, flexShrink: 0, display: 'flex',
                            alignItems: 'center', gap: 4, border: 'none', cursor: 'pointer'
                          }}>
                            {mod.completed ? (t.learn?.reviewBtn || 'Review') : (t.learn?.startBtn || 'Start')}
                            <ArrowRight size={12} />
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
      </div>
    </PageTransition>
  )
}
