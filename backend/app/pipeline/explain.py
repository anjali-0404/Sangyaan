"""Stage 6b: wording. The LLM may rephrase evidence; it never sees the message and never changes the score.

Always falls back to per-code templates, so the demo never shows a blank explanation.
NOTE: have a native Hindi speaker review the HI strings before any public demo.
"""
from __future__ import annotations

import asyncio
import logging

from app import llm
from app.schemas import Band, Evidence, Explanation

log = logging.getLogger(__name__)

EN = {
    "SEBI_NOT_FOUND": "The SEBI registration number given could not be found in our registry data.",
    "SEBI_NOT_ACTIVE": "The SEBI registration number given does not appear to be active.",
    "SEBI_CLAIM_NO_NUMBER": "It claims SEBI registration but gives no registration number to check.",
    "ENTITY_NAME_MISMATCH": "The name given does not match the holder registered for that number.",
    "DOMAIN_NOT_OFFICIAL": "The website is not among the official domains we know for this registered entity.",
    "GUARANTEED_RETURN": "It mentions guaranteed or risk-free returns. No genuine adviser can guarantee returns.",
    "UNREALISTIC_RETURN": "The return stated is far higher than regulated products typically offer.",
    "UPI_NOT_VALIDATED_HANDLE": "The UPI ID given for payment is not a SEBI validated handle.",
    "OFF_PLATFORM_PAYMENT": "It asks for payment to a personal account or number.",
    "PAYEE_NOT_UPI_HANDLE": "The payment ID is an email address, not a UPI ID, so it does not look like a genuine merchant payment.",
    "QR_PAYEE_MISMATCH": "The QR code pays a different name than the one shown, so you may not be paying who you think.",
    "PHISHING_FEED_HIT": "A link matches a page reported as phishing or malware and may be unsafe.",
    "DOMAIN_NEW": "The website was registered only recently.",
    "DOMAIN_NOT_REGISTERED": "The website address does not currently exist, so it may be a scam page that was already taken down.",
    "LOOKALIKE_DOMAIN": "The website name closely resembles a well-known brand's or broker's.",
    "RISKY_TLD": "The website address type is often used by short-lived sites.",
    "SHORT_LINK": "The link is shortened, so you cannot see where it really goes before opening it.",
    "URGENCY": "It uses urgency or pressure wording.",
    "LOGIN_PAGE_ON_LOOKALIKE": "The link leads to a login or verification page on an address that imitates a well-known brand.",
    "OTP_REQUEST": "It asks you to share an OTP, PIN or card code. Banks and genuine companies never ask for these.",
    "AUTHORITY_IMPERSONATION": "It invokes police, customs or another authority to scare you. Real agencies do not demand money or OTPs over chat or calls.",
    "PRIZE_LOTTERY": "It says you have won a prize or lottery you did not enter.",
    "ACCOUNT_THREAT": "It threatens to block or cut off an account, SIM or service unless you act.",
    "ADVANCE_FEE": "It asks for a fee up front before something is released to you.",
    "PRETEXT_PAYMENT": "It asks you to send money for a reason that cannot be checked (a wrong transfer, a lost phone, a refund).",
    "TASK_JOB": "It offers money for simple online tasks, a common pattern in job scams.",
    "REMOTE_ACCESS": "It asks you to install a remote-access tool, which can give others control of your device.",
    "APK_DOWNLOAD": "It asks you to install an app from outside the official app stores.",
}

HI = {
    "SEBI_NOT_FOUND": "बताया गया SEBI रजिस्ट्रेशन नंबर हमारे रजिस्ट्री डेटा में नहीं मिला।",
    "SEBI_NOT_ACTIVE": "बताया गया SEBI रजिस्ट्रेशन नंबर सक्रिय नहीं दिखता।",
    "SEBI_CLAIM_NO_NUMBER": "SEBI रजिस्ट्रेशन का दावा है, लेकिन जाँचने के लिए नंबर नहीं दिया गया।",
    "ENTITY_NAME_MISMATCH": "दिया गया नाम उस नंबर के पंजीकृत धारक से मेल नहीं खाता।",
    "DOMAIN_NOT_OFFICIAL": "यह वेबसाइट इस पंजीकृत संस्था के हमारे ज्ञात आधिकारिक डोमेन में नहीं है।",
    "GUARANTEED_RETURN": "गारंटीड रिटर्न का दावा किया गया है। कोई भी वैध सलाहकार रिटर्न की गारंटी नहीं दे सकता।",
    "UNREALISTIC_RETURN": "बताया गया रिटर्न नियमित उत्पादों की तुलना में बहुत ज़्यादा है।",
    "UPI_NOT_VALIDATED_HANDLE": "भुगतान के लिए दिया गया UPI ID SEBI का वैलिडेटेड हैंडल नहीं है।",
    "OFF_PLATFORM_PAYMENT": "व्यक्तिगत खाते या नंबर पर भुगतान करने को कहा गया है।",
    "PAYEE_NOT_UPI_HANDLE": "भुगतान ID एक ईमेल पता है, UPI ID नहीं, इसलिए यह किसी असली दुकानदार का भुगतान नहीं लगता।",
    "QR_PAYEE_MISMATCH": "QR कोड दिखाए गए नाम से अलग नाम को भुगतान करता है, इसलिए हो सकता है आप उसे भुगतान न कर रहे हों जिसे सोच रहे हैं।",
    "PHISHING_FEED_HIT": "एक लिंक रिपोर्ट किए गए फ़िशिंग या मैलवेयर पेज से मेल खाता है और असुरक्षित हो सकता है।",
    "DOMAIN_NEW": "यह वेबसाइट हाल ही में बनी है।",
    "DOMAIN_NOT_REGISTERED": "यह वेबसाइट पता अभी मौजूद नहीं है, हो सकता है यह कोई स्कैम पेज था जिसे हटा दिया गया।",
    "LOOKALIKE_DOMAIN": "वेबसाइट का नाम किसी जाने-माने ब्रांड या ब्रोकर से मिलता-जुलता है।",
    "SHORT_LINK": "लिंक छोटा किया गया है, इसलिए खोलने से पहले पता नहीं चलता कि वह असल में कहाँ ले जाएगा।",
    "RISKY_TLD": "इस वेबसाइट का पता अक्सर कम समय चलने वाली साइटों में दिखता है।",
    "URGENCY": "जल्दबाज़ी या दबाव वाली भाषा इस्तेमाल की गई है।",
    "LOGIN_PAGE_ON_LOOKALIKE": "लिंक एक जाने-माने ब्रांड की नकल करने वाले पते पर लॉगिन या वेरिफिकेशन पेज खोलता है।",
    "OTP_REQUEST": "OTP, PIN या कार्ड कोड शेयर करने को कहा गया है। बैंक या असली कंपनियाँ ये कभी नहीं माँगतीं।",
    "AUTHORITY_IMPERSONATION": "डराने के लिए पुलिस, कस्टम या किसी अधिकारी का नाम लिया गया है। असली एजेंसियाँ चैट या कॉल पर पैसे या OTP नहीं माँगतीं।",
    "PRIZE_LOTTERY": "आपको ऐसा इनाम या लॉटरी जीतने की बात कही गई है जिसमें आपने हिस्सा नहीं लिया।",
    "ACCOUNT_THREAT": "कार्रवाई न करने पर अकाउंट, SIM या सेवा बंद करने की धमकी दी गई है।",
    "ADVANCE_FEE": "कुछ मिलने से पहले ही पहले से फीस माँगी गई है।",
    "PRETEXT_PAYMENT": "किसी ऐसे कारण से पैसे भेजने को कहा गया है जिसकी जाँच नहीं हो सकती (ग़लत ट्रांसफ़र, खोया फ़ोन, रिफ़ंड)।",
    "TASK_JOB": "आसान ऑनलाइन टास्क के बदले पैसे का ऑफ़र है, जो जॉब स्कैम में आम है।",
    "REMOTE_ACCESS": "रिमोट-एक्सेस ऐप इंस्टॉल करने को कहा गया है, जिससे आपके डिवाइस पर दूसरों का नियंत्रण हो सकता है।",
    "APK_DOWNLOAD": "आधिकारिक ऐप स्टोर के बाहर से ऐप इंस्टॉल करने को कहा गया है।",
}

BAND_EN = {"LOW": "low", "MEDIUM": "medium", "HIGH": "high", "CRITICAL": "very high"}
BAND_HI = {"LOW": "कम", "MEDIUM": "मध्यम", "HIGH": "उच्च", "CRITICAL": "बहुत उच्च"}

SAFE_ACTION = {
    "CRITICAL": "Do not transfer money. Verify the registration on SEBI Check.",
    "HIGH": "Do not transfer money. Verify the registration on SEBI Check.",
    "MEDIUM": "Pause before paying anyone. Verify the registration on SEBI Check.",
    "LOW": "Before investing, still verify any registration on SEBI Check.",
}
SAFE_ACTION_HI = {
    "CRITICAL": "पैसे ट्रांसफर न करें। पहले SEBI Check पर जाँच करें।",
    "HIGH": "पैसे ट्रांसफर न करें। पहले SEBI Check पर जाँच करें।",
    "MEDIUM": "किसी को भुगतान करने से पहले रुकें। SEBI Check पर जाँच करें।",
    "LOW": "निवेश से पहले किसी भी रजिस्ट्रेशन की SEBI Check पर जाँच ज़रूर करें।",
}

_NONE_EN = "No risk indicators were found in the checks we ran. This does not mean it is safe."
_NONE_HI = "हमारी की गई जाँचों में कोई जोखिम संकेत नहीं मिला। इसका मतलब यह नहीं कि यह सुरक्षित है।"


_PAYMENT_CODES = {"PAYEE_NOT_UPI_HANDLE", "QR_PAYEE_MISMATCH"}
_INVEST_CODES = {"SEBI_NOT_FOUND", "SEBI_NOT_ACTIVE", "SEBI_CLAIM_NO_NUMBER", "ENTITY_NAME_MISMATCH",
                 "GUARANTEED_RETURN", "UNREALISTIC_RETURN", "UPI_NOT_VALIDATED_HANDLE"}


def safe_action(band: Band, codes: list[str] | None = None) -> tuple[str, str]:
    # A payment-QR problem with no investment angle: SEBI Check is the wrong advice.
    if codes and band != "LOW" and _PAYMENT_CODES & set(codes) and not _INVEST_CODES & set(codes):
        return (
            "Do not scan or pay. Confirm the payee inside the company's own official app or website.",
            "स्कैन या भुगतान न करें। कंपनी के अपने आधिकारिक ऐप या वेबसाइट में भुगतान पाने वाले की पुष्टि करें।",
        )
    # Not an investment matter (a fake Netflix link, an OTP request, a fake officer...): SEBI Check is the wrong advice.
    if codes and band != "LOW" and not _INVEST_CODES & set(codes):
        return (
            "Do not click, share any code or pay. Contact the company or bank only through its official app, "
            "website or the number printed on your card.",
            "लिंक पर क्लिक, कोई कोड शेयर या भुगतान न करें। कंपनी या बैंक से सिर्फ़ उसके आधिकारिक ऐप, वेबसाइट या कार्ड पर छपे नंबर से संपर्क करें।",
        )
    return SAFE_ACTION[band], SAFE_ACTION_HI[band]


def template_explanation(evidence: list[Evidence], band: Band) -> Explanation:
    ok = [e for e in evidence if e.status == "ok"][:3]  # evidence is already ordered by weight
    if not ok:
        return Explanation(en=_NONE_EN, hi=_NONE_HI)
    en = f"Risk level: {BAND_EN[band]}. " + " ".join(EN.get(e.code, e.title + ".") for e in ok)
    hi = f"जोखिम स्तर: {BAND_HI[band]}। " + " ".join(HI.get(e.code, e.title + "।") for e in ok)
    return Explanation(en=en, hi=hi)


async def explain(evidence: list[Evidence], band: Band, *, use_llm: bool, timeout: float) -> Explanation:
    fallback = template_explanation(evidence, band)
    if not use_llm or not any(e.status == "ok" for e in evidence):
        return fallback
    try:
        got = await asyncio.wait_for(llm.explain(evidence, band), timeout)
    except Exception as e:  # LLM is optional: any failure => templates
        log.info("llm explain failed, using templates: %s", type(e).__name__)
        return fallback
    return got or fallback
