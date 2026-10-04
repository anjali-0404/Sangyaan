// Seeded Educational Modules and Quizzes for Sangyan Shield
// Covers 12 modules across 4 categories: UPI Safety, Investment Scams, Digital Identity & Privacy, Phishing & Malware Defense

export const MODULE_LESSONS = {
  'upi-1': {
    id: 'upi-1',
    categoryId: 'upi',
    duration: '3 min',
    difficulty: 'Beginner',
    readTime: '3 min read',
    title: {
      en: 'How to Spot Fake UPI Payment Requests',
      hi: 'फर्जी यूपीआई भुगतान अनुरोध कैसे पहचानें',
    },
    subtitle: {
      en: 'Learn how fraudsters disguise debit requests as refunds or cash rewards in Google Pay, PhonePe, and Paytm.',
      hi: 'जानें कि कैसे जालसाज गूगल पे, फोनपे और पेटीएम में पैसे काटने वाले अनुरोधों को रिफंड या इनाम का रूप देते हैं।',
    },
    sections: [
      {
        title: { en: 'The Scam Anatomy', hi: 'धोखाधड़ी का तरीका' },
        content: {
          en: 'Fraudsters send a UPI "Collect / Pay Request" with deceptive remark notes such as "Refund of ₹2,500 Approved" or "KBC Cash Prize". They call or text you claiming: "We have sent your refund, just enter your 4 or 6 digit UPI PIN to receive money into your bank account."',
          hi: 'धोखाधड़ी करने वाले भ्रामक रिमार्क जैसे "₹2,500 का रिफंड स्वीकृत" या "केबीसी नकद इनाम" के साथ एक यूपीआई "कलेक्ट / पे अनुरोध" भेजते हैं। वे आपको कॉल करके कहते हैं: "हमने आपका रिफंड भेज दिया है, अपने बैंक खाते में पैसे प्राप्त करने के लिए बस अपना 4 या 6 अंकों का यूपीआई पिन दर्ज करें।"'
        }
      },
      {
        title: { en: '🚨 Critical Red Flags', hi: '🚨 मुख्य खतरे के संकेत' },
        points: {
          en: [
            'Any request or person asking you to enter your UPI PIN to RECEIVE or CLAIM money.',
            'Notification showing a "Pay" button with a green "+ ₹2,000" typed manually in the comments note.',
            'Unsolicited calls from fake customer care (Flipkart, Amazon, Swiggy) asking you to approve a pending refund.'
          ],
          hi: [
            'पैसे प्राप्त करने या क्लेम करने के लिए कोई भी यूपीआई पिन दर्ज करने को कहे।',
            'कमेंट्स नोट में हाथ से लिखा हुआ "+ ₹2,000" दिखे लेकिन बटन "Pay" (भुगतान) का हो।',
            'फर्जी कस्टमर केयर (फ्लिपकार्ट, अमेज़न) से अनचाहे कॉल जो लंबित रिफंड को स्वीकार करने का दबाव बनाएं।'
          ]
        }
      },
      {
        title: { en: '🛡️ Sangyan Golden Shield Rule', hi: '🛡️ संज्ञान शील्ड का स्वर्णिम नियम' },
        highlight: {
          en: 'UPI PIN is ONLY entered to SEND money or check your balance. You NEVER need to enter your UPI PIN to receive money or get a refund!',
          hi: 'यूपीआई पिन केवल पैसे भेजने या बैलेंस चेक करने के लिए डाला जाता है। पैसे प्राप्त करने या रिफंड पाने के लिए कभी भी यूपीआई पिन की आवश्यकता नहीं होती!'
        }
      },
      {
        title: { en: 'Immediate Action Protocol', hi: 'तत्काल कार्रवाई' },
        content: {
          en: 'If you ever encounter a suspicious collect request, tap "Decline" or "Block & Report as Spam" in your UPI app immediately. If funds were accidentally debited, dial 1930 within 2 hours to trigger the National Cyber Financial Lien protocol.',
          hi: 'यदि आपको ऐसा कोई संदिग्ध कलेक्ट अनुरोध मिलता है, तो तुरंत अपने यूपीआई ऐप में "Decline" या "Block & Report" पर टैप करें। यदि गलती से पैसे कट गए हैं, तो 2 घंटे के भीतर 1930 डायल करें।'
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'You receive a notification on PhonePe: "Amazon Refund of ₹2,500. Enter 6-digit UPI PIN to claim reward." What should you do?',
          hi: 'आपको फोनपे पर नोटिफिकेशन मिलता है: "अमेज़न रिफंड ₹2,500। इनाम पाने के लिए 6 अंकों का यूपीआई पिन डालें।" आपको क्या करना चाहिए?'
        },
        options: [
          {
            text: { en: 'Enter your PIN quickly before the offer expires', hi: 'ऑफर समाप्त होने से पहले तुरंत पिन दर्ज करें' },
            correct: false
          },
          {
            text: { en: 'Decline and block immediately — UPI PIN is NEVER required to receive money!', hi: 'तुरंत अस्वीकार और ब्लॉक करें — पैसे प्राप्त करने के लिए कभी भी यूपीआई पिन की आवश्यकता नहीं होती!' },
            correct: true
          },
          {
            text: { en: 'Call the mobile number written in the payment note', hi: 'पेमेंट नोट में लिखे मोबाइल नंबर पर कॉल करें' },
            correct: false
          },
          {
            text: { en: 'Forward the notification to your family members', hi: 'यह नोटिफिकेशन अपने परिवार के सदस्यों को भेजें' },
            correct: false
          }
        ],
        explanation: {
          en: 'Entering your UPI PIN authorizes an outgoing debit from your bank account. No legitimate bank or retailer ever asks for your PIN to send you money.',
          hi: 'अपना यूपीआई पिन दर्ज करने से आपके बैंक खाते से पैसे कटते हैं। कोई भी वैध बैंक या कंपनी पैसे भेजने के लिए आपसे पिन नहीं मांगती।'
        }
      },
      {
        id: 'q2',
        question: {
          en: 'Which button in a UPI app means money will LEAVE your bank account?',
          hi: 'यूपीआई ऐप में किस बटन का मतलब है कि आपके बैंक खाते से पैसे कटेंगे?'
        },
        options: [
          {
            text: { en: '"Pay" or "Authorize Debit" with UPI PIN screen', hi: 'यूपीआई पिन स्क्रीन के साथ "Pay" या "Authorize Debit"' },
            correct: true
          },
          {
            text: { en: '"Receive Money"', hi: '"Receive Money"' },
            correct: false
          },
          {
            text: { en: '"Claim Voucher Cashback"', hi: '"Claim Voucher Cashback"' },
            correct: false
          },
          {
            text: { en: '"View Bank Statement"', hi: '"View Bank Statement"' },
            correct: false
          }
        ],
        explanation: {
          en: 'Whenever the screen asks for "Pay" and your UPI PIN, funds will be deducted from your account and transferred immediately.',
          hi: 'जब भी स्क्रीन "Pay" और आपका यूपीआई पिन मांगती है, तो आपके खाते से पैसे कटकर तुरंत ट्रांसफर हो जाते हैं।'
        }
      }
    ]
  },

  'upi-2': {
    id: 'upi-2',
    categoryId: 'upi',
    duration: '4 min',
    difficulty: 'Beginner',
    readTime: '4 min read',
    title: {
      en: 'Understanding UPI Collect vs Pay Requests',
      hi: 'यूपीआई कलेक्ट और पे अनुरोधों का अंतर समझें',
    },
    subtitle: {
      en: 'The mechanics of PUSH vs PULL transactions and how OLX / marketplace scammers abuse collect requests.',
      hi: 'पुश और पुल लेनदेन की कार्यप्रणाली और ओएलएक्स पर जालसाज कलेक्ट रिक्वेस्ट का कैसे दुरुपयोग करते हैं।',
    },
    sections: [
      {
        title: { en: 'Push vs. Pull Transactions', hi: 'पुश बनाम पुल लेनदेन' },
        content: {
          en: 'UPI supports two core transactions: 1) PUSH (You send money by entering the recipient VPA), and 2) PULL / COLLECT (A merchant or individual sends a bill request asking you to approve a payment). Scammers pose as buyers on OLX, Quikr, or Facebook Marketplace and send a collect request claiming it will credit advance payment to your account.',
          hi: 'यूपीआई में दो मुख्य लेनदेन होते हैं: 1) पुश (आप प्राप्तकर्ता की वीपीए दर्ज करके पैसे भेजते हैं), और 2) पुल/कलेक्ट (एक मर्चेंट या व्यक्ति बिल भेजकर आपसे भुगतान स्वीकृत करने को कहता है)। ओएलएक्स पर जालसाज खरीदार बनकर कलेक्ट रिक्वेस्ट भेजते हैं और दावा करते हैं कि इससे आपके खाते में एडवांस आ जाएगा।'
        }
      },
      {
        title: { en: '🚨 The Marketplace Trap', hi: '🚨 ऑनलाइन मार्केटप्लेस का जाल' },
        points: {
          en: [
            'Buyer agrees to purchase your product immediately without bargaining or meeting in person.',
            'Claims they are an army officer or posted far away, sending payment via Google Pay army merchant account.',
            'Sends a UPI Collect request for the item price and insists: "Click accept and enter PIN to receive money in your account."'
          ],
          hi: [
            'खरीदार बिना मोलभाव किए या बिना मिले तुरंत सामान खरीदने को तैयार हो जाता है।',
            'दावा करता है कि वह सेना का अधिकारी है और आर्मी मर्चेंट अकाउंट से पैसे भेज रहा है।',
            'सामान की कीमत का कलेक्ट रिक्वेस्ट भेजता है और कहता है: "एक्सेप्ट करें और पिन डालें ताकि पैसे आपके खाते में आएं।"'
          ]
        }
      },
      {
        title: { en: '🛡️ Sangyan Shield Golden Rule', hi: '🛡️ संज्ञान शील्ड का स्वर्णिम नियम' },
        highlight: {
          en: 'When someone owes you money, they ONLY need your UPI ID or phone number. They NEVER need you to accept a collect request or enter a PIN.',
          hi: 'जब किसी को आपको पैसे देने होते हैं, तो उन्हें केवल आपकी यूपीआई आईडी या मोबाइल नंबर चाहिए होता है। उन्हें कभी भी कलेक्ट रिक्वेस्ट या पिन की आवश्यकता नहीं होती।'
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'You are selling an old phone on OLX. A buyer says: "I sent you a ₹5,000 collect request on Google Pay. Just approve it to receive your cash." What should you do?',
          hi: 'आप ओएलएक्स पर पुराना फोन बेच रहे हैं। खरीदार कहता है: "मैंने गूगल पे पर ₹5,000 का कलेक्ट रिक्वेस्ट भेजा है। नकद पाने के लिए बस इसे स्वीकार करें।" आपको क्या करना चाहिए?'
        },
        options: [
          {
            text: { en: 'Approve it immediately so you get the advance', hi: 'तुरंत स्वीकार करें ताकि आपको एडवांस मिल जाए' },
            correct: false
          },
          {
            text: { en: 'Reject and block the buyer immediately — approving a collect request debits ₹5,000 from you!', hi: 'तुरंत अस्वीकार और ब्लॉक करें — कलेक्ट रिक्वेस्ट स्वीकार करने से आपके ₹5,000 कट जाएंगे!' },
            correct: true
          },
          {
            text: { en: 'Ask them to send half the money first', hi: 'उनसे पहले आधा पैसा भेजने को कहें' },
            correct: false
          }
        ],
        explanation: {
          en: 'A UPI Collect request is an invoice asking you to pay. Approving it transfers money FROM your account TO the scammer.',
          hi: 'यूपीआई कलेक्ट रिक्वेस्ट भुगतान मांगने का इनवॉइस है। इसे स्वीकार करने से आपके खाते से पैसे कटकर जालसाज के पास चले जाते हैं।'
        }
      }
    ]
  },

  'upi-3': {
    id: 'upi-3',
    categoryId: 'upi',
    duration: '5 min',
    difficulty: 'Intermediate',
    readTime: '5 min read',
    title: {
      en: 'QR Code Scams: What to Watch For',
      hi: 'क्यूआर कोड घोटाले: किन बातों का ध्यान रखें',
    },
    subtitle: {
      en: 'Physical standee tampering at shops, fake refund QR codes sent via WhatsApp, and dynamic payment traps.',
      hi: 'दुकानों पर क्यूआर स्टैंडी से छेड़छाड़, व्हाट्सएप पर भेजे गए फर्जी रिफंड क्यूआर कोड और भुगतान के जाल।',
    },
    sections: [
      {
        title: { en: 'How QR Codes Actually Work', hi: 'क्यूआर कोड वास्तव में कैसे काम करते हैं' },
        content: {
          en: 'A Quick Response (QR) code is nothing more than encoded text — specifically a UPI link like "upi://pay?pa=merchant@bank&pn=ShopName". When scanned by your camera inside a payment app, it always sets up an OUTGOING payment. It can NEVER act as a funnel to pour money into your account.',
          hi: 'क्यूआर कोड केवल एन्कोडेड टेक्स्ट होता है — विशेष रूप से एक यूपीआई लिंक जैसे "upi://pay?pa=merchant@bank". जब आप इसे किसी पेमेंट ऐप से स्कैन करते हैं, तो यह हमेशा पैसे भेजने का काम करता है। यह आपके खाते में पैसे नहीं डाल सकता।'
        }
      },
      {
        title: { en: 'Physical QR Sticker Swap at Retail Outlets', hi: 'दुकानों पर क्यूआर स्टीकर बदलना' },
        content: {
          en: 'Fraudsters visit busy retail shops, tea stalls, and petrol pumps, sneakily pasting their personal QR code sticker over the shopkeeper genuine standee. Customers scan and pay, but money goes directly to the criminal bank account.',
          hi: 'जालसाज व्यस्त दुकानों, चाय की दुकानों और पेट्रोल पंपों पर दुकानदार के असली स्टैंडी पर अपना व्यक्तिगत क्यूआर कोड स्टीकर चिपका देते हैं। ग्राहक स्कैन करके भुगतान करते हैं, लेकिन पैसा सीधे अपराधी के खाते में चला जाता है।'
        }
      },
      {
        title: { en: '🛡️ Safety Checklist', hi: '🛡️ सुरक्षा चेकलिस्ट' },
        points: {
          en: [
            'Always verify the shop name displayed on your phone screen with the shop board before pressing Pay.',
            'Wait for the merchant soundbox ("Paytm par ₹100 prapt hue") to announce payment confirmation.',
            'Never scan a QR code sent to you on WhatsApp to "receive a lucky draw prize or electricity cashback".'
          ],
          hi: [
            'भुगतान करने से पहले हमेशा अपने फोन की स्क्रीन पर दिखने वाले नाम का मिलान दुकान के बोर्ड से करें।',
            'दुकानदार के साउंडबॉक्स से आवाज आने का इंतजार करें।',
            'लकी ड्रॉ इनाम या बिजली बिल कैशबैक पाने के लिए व्हाट्सएप पर आया क्यूआर कभी स्कैन न करें।'
          ]
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'A caller claiming to be from customer service sends a QR code on WhatsApp and tells you: "Scan this in PhonePe to receive your ₹1,200 Flipkart refund." What will happen if you scan and enter your PIN?',
          hi: 'कस्टमर सर्विस से होने का दावा करने वाला एक कॉलर व्हाट्सएप पर क्यूआर कोड भेजता है: "अपना ₹1,200 का फ्लिपकार्ट रिफंड पाने के लिए इसे फोनपे में स्कैन करें।" यदि आप स्कैन करके पिन डालते हैं तो क्या होगा?'
        },
        options: [
          {
            text: { en: '₹1,200 will be credited to your bank account', hi: 'आपके बैंक खाते में ₹1,200 जमा हो जाएंगे' },
            correct: false
          },
          {
            text: { en: 'Money will be DEBITED from your account and sent to the scammer!', hi: 'आपके खाते से पैसे कट जाएंगे और जालसाज के खाते में चले जाएंगे!' },
            correct: true
          },
          {
            text: { en: 'PhonePe will cancel the scan automatically', hi: 'फोनपे स्कैन को अपने आप रद्द कर देगा' },
            correct: false
          }
        ],
        explanation: {
          en: 'Scanning any QR code in a UPI app always sets up a payment debit. Entering your PIN transfers your money away.',
          hi: 'यूपीआई ऐप में किसी भी क्यूआर कोड को स्कैन करने पर हमेशा पैसे कटते हैं। पिन डालने से आपके पैसे चले जाते हैं।'
        }
      }
    ]
  },

  'inv-1': {
    id: 'inv-1',
    categoryId: 'investment',
    duration: '4 min',
    difficulty: 'Beginner',
    readTime: '4 min read',
    title: {
      en: 'Guaranteed Returns: The Biggest Red Flag',
      hi: 'गारंटीड रिटर्न: धोखाधड़ी का सबसे बड़ा संकेत',
    },
    subtitle: {
      en: 'Why no legitimate financial entity in India can guarantee market profits under SEBI regulations.',
      hi: 'सेबी के नियमों के तहत भारत में कोई भी वैध संस्था बाजार में गारंटीड रिटर्न क्यों नहीं दे सकती।',
    },
    sections: [
      {
        title: { en: 'The Myth of Guaranteed Market Profits', hi: 'गारंटीड मुनाफे का भ्रम' },
        content: {
          en: 'Under SEBI (Investment Advisers) Regulations, no registered entity is legally permitted to assure or guarantee returns on equity, futures, crypto, or forex investments. Any platform offering "2% daily profit", "Double in 30 days", or "Risk-free algo trading" is operating an illegal Ponzi scheme.',
          hi: 'सेबी नियमों के तहत किसी भी पंजीकृत संस्था को शेयर बाजार, वायदा, क्रिप्टो या फॉरेक्स में रिटर्न की गारंटी देने की अनुमति नहीं है। कोई भी प्लेटफॉर्म जो "2% दैनिक लाभ" या "30 दिनों में दोगुना" का वादा करता है, वह अवैध पोंजी स्कीम है।'
        }
      },
      {
        title: { en: '🚨 The Ponzi Bait Trap', hi: '🚨 पोंजी स्कीम का चारा' },
        points: {
          en: [
            'Small initial deposits (₹2,000) show instant 50% "profit" on their fake dashboard and allow a small withdrawal to build trust.',
            'Victims get convinced and deposit life savings (₹5 to ₹50 Lakhs).',
            'When attempting withdrawal, the platform demands extra "Security Deposit", "TDS Tax", and "Forex Conversion Fees", eventually freezing everything.'
          ],
          hi: [
            'शुरुआती छोटे निवेश (₹2,000) पर फर्जी डैशबोर्ड पर 50% का मुनाफा दिखाया जाता है और भरोसा जीतने के लिए निकासी की अनुमति दी जाती है।',
            'पीड़ित आश्वस्त होकर अपनी पूरी जमा-पूंजी (₹5 से ₹50 लाख) लगा देते हैं।',
            'पैसे निकालने के समय टीडीएस और टैक्स के नाम पर और पैसों की मांग की जाती है और सब फ्रीज कर दिया जाता है।'
          ]
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'An online ad claims: "Invest ₹10,000 today and receive guaranteed ₹500 every day with zero risk through AI algorithm." What is the reality?',
          hi: 'एक ऑनलाइन विज्ञापन का दावा है: "आज ₹10,000 लगाएं और एआई द्वारा बिना किसी जोखिम के प्रतिदिन ₹500 का पक्का मुनाफा पाएं।" वास्तविकता क्या है?'
        },
        options: [
          {
            text: { en: '100% Scam / Illegal Ponzi scheme. Markets carry risk; guaranteed daily returns are impossible and illegal in India.', hi: '100% घोटाला / अवैध पोंजी स्कीम। बाजार में जोखिम होता है; दैनिक गारंटीड रिटर्न असंभव और अवैध है।' },
            correct: true
          },
          {
            text: { en: 'A revolutionary fintech product you should join immediately', hi: 'एक क्रांतिकारी फिनटेक उत्पाद जिसमें तुरंत जुड़ना चाहिए' },
            correct: false
          },
          {
            text: { en: 'Safe as long as they show a GST certificate', hi: 'सुरक्षित है यदि वे जीएसटी प्रमाणपत्र दिखाते हैं' },
            correct: false
          }
        ],
        explanation: {
          en: 'No SEBI-registered advisor can promise fixed market returns. 5% daily return is mathematically unsustainable and guaranteed fraud.',
          hi: 'कोई भी सेबी-पंजीकृत सलाहकार निश्चित रिटर्न का वादा नहीं कर सकता। ऐसा वादा शत-प्रतिशत धोखाधड़ी है।'
        }
      }
    ]
  },

  'inv-2': {
    id: 'inv-2',
    categoryId: 'investment',
    duration: '6 min',
    difficulty: 'Intermediate',
    readTime: '6 min read',
    title: {
      en: 'How to Verify SEBI Registration Numbers',
      hi: 'सेबी पंजीकरण संख्या की वैधता कैसे जांचें',
    },
    subtitle: {
      en: 'Validating Research Analysts (INH) and Investment Advisers (INA) on the official sebi.gov.in portal.',
      hi: 'आधिकारिक sebi.gov.in पोर्टल पर रिसर्च एनालिस्ट और एडवाइजर्स का सत्यापन कैसे करें।',
    },
    sections: [
      {
        title: { en: 'The Identity Impersonation Problem', hi: 'पहचान चोरी की समस्या' },
        content: {
          en: 'Scammers copy the genuine name and registration number (e.g. INH000001234) of a legitimate SEBI registered Research Analyst from the public SEBI website. They forge a fake certificate using Photoshop, put the official SEBI logo, and run fake WhatsApp/Telegram channels claiming to be that analyst.',
          hi: 'जालसाज सेबी की वेबसाइट से किसी असली रिसर्च एनालिस्ट का नाम और रजिस्ट्रेशन नंबर चुरा लेते हैं। वे फोटोशॉप से फर्जी सर्टिफिकेट बनाते हैं और खुद को असली विश्लेषक बताकर टेलीग्राम चैनल चलाते हैं।'
        }
      },
      {
        title: { en: '🛡️ The Three-Step Cross Verification', hi: '🛡️ तीन-चरणीय सत्यापन प्रक्रिया' },
        points: {
          en: [
            'Step 1: Go directly to official sebi.gov.in -> "Intermediaries" -> "Recognized Intermediaries".',
            'Step 2: Check the registered official email domain and phone number listed on SEBI site.',
            'Step 3: NEVER pay advisory fees into a personal individual savings account (e.g. "Ramesh Kumar"). Regulated entities must collect fees into a dedicated corporate account matching their registered firm name.'
          ],
          hi: [
            'चरण 1: सीधे आधिकारिक sebi.gov.in पर जाएं -> "Intermediaries" चेक करें।',
            'चरण 2: सेबी साइट पर दर्ज आधिकारिक ईमेल और फोन नंबर का मिलान करें।',
            'चरण 3: किसी भी व्यक्तिगत बचत खाते में कभी फीस न दें। केवल फर्म के नाम वाले करंट अकाउंट में ही भुगतान करें।'
          ]
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'A stock advisor asks you to transfer subscription fees to a personal savings account in the name of "Suresh Sharma". What does this indicate?',
          hi: 'एक स्टॉक सलाहकार आपसे "सुरेश शर्मा" नाम के व्यक्तिगत बचत खाते में फीस ट्रांसफर करने को कहता है। यह क्या दर्शाता है?'
        },
        options: [
          {
            text: { en: 'Severe Fraud Signal! Regulated SEBI entities must use official corporate bank accounts matching their registration.', hi: 'गंभीर धोखाधड़ी का संकेत! सेबी संस्थाओं को अपने पंजीकृत नाम वाले आधिकारिक बैंक खाते का उपयोग करना अनिवार्य है।' },
            correct: true
          },
          {
            text: { en: 'Normal practice for saving taxes', hi: 'टैक्स बचाने का सामान्य तरीका' },
            correct: false
          },
          {
            text: { en: 'Safe if they give a discount', hi: 'सुरक्षित है यदि वे छूट दे रहे हैं' },
            correct: false
          }
        ],
        explanation: {
          en: 'SEBI strictly prohibits collecting advisory fees in personal third-party accounts. This is a classic indicator of mule account usage in financial scams.',
          hi: 'सेबी तीसरे पक्ष के व्यक्तिगत खातों में फीस लेने पर सख्त प्रतिबंध लगाता है। यह वित्तीय घोटालों में म्यूल खातों के उपयोग का स्पष्ट संकेत है।'
        }
      }
    ]
  },

  'inv-3': {
    id: 'inv-3',
    categoryId: 'investment',
    duration: '5 min',
    difficulty: 'Beginner',
    readTime: '5 min read',
    title: {
      en: 'Telegram & WhatsApp Trading Group Red Flags',
      hi: 'टेलीग्राम व व्हाट्सएप ट्रेडिंग ग्रुप के खतरे',
    },
    subtitle: {
      en: 'Doctored Zerodha P&L screenshots, fake VIP signals, and institutional IPO allotment traps.',
      hi: 'फोटोशॉप किए गए पीएंडएल स्क्रीनशॉट, वीआईपी सिग्नल और संस्थागत आईपीओ आवंटन के जाल।',
    },
    sections: [
      {
        title: { en: 'Anatomy of a Telegram Pump & Dump Trap', hi: 'टेलीग्राम पंप और डंप का तरीका' },
        content: {
          en: 'Victims are added without permission to groups with names like "NSE Premium Wealth VIP". The group consists of 50-100 accounts run by bot networks and accomplices sharing screenshots showing ₹2,00,000 profits every morning. They pressure you to install custom "Institutional Trading APKs" promising pre-market access to oversubscribed IPOs.',
          hi: 'पीड़ितों को उनकी अनुमति के बिना "एनएसई वेल्थ वीआईपी" जैसे ग्रुप्स में जोड़ा जाता है। इन ग्रुप्स में नकली बॉट और साथी हर सुबह लाखों के मुनाफे के स्क्रीनशॉट डालते हैं। फिर वे आपको आईपीओ में विशेष कोटे का लालच देकर फर्जी ऐप डाउनलोड करने को कहते हैं।'
        }
      },
      {
        title: { en: '🚨 The Trap Execution', hi: '🚨 जाल का फंदा' },
        points: {
          en: [
            'All members praising the "Sir / Madam" admin are puppet accounts controlled by the fraud syndicate.',
            'Screenshots of Zerodha/Groww profits are doctored using browser "Inspect Element" or Android mockup generators.',
            'Once you transfer money into their mule accounts, your balance in their fake app cannot be withdrawn without paying 30% "Tax Penalties".'
          ],
          hi: [
            'एडमिन की तारीफ करने वाले सभी सदस्य एक ही सिंडिकेट द्वारा चलाए जा रहे फर्जी अकाउंट होते हैं।',
            'प्रॉफिट के स्क्रीनशॉट ब्राउज़र के "Inspect Element" से एडिट किए जाते हैं।',
            'पैसा ट्रांसफर करने के बाद फर्जी ऐप में दिख रहा बैलेंस कभी नहीं निकाला जा सकता।'
          ]
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'You are added without consent to a WhatsApp group where members celebrate huge daily stock market profits. What is the smartest move?',
          hi: 'आपको बिना पूछे एक व्हाट्सएप ग्रुप में जोड़ा जाता है जहां सदस्य भारी मुनाफे का जश्न मना रहे हैं। सबसे समझदारी भरा कदम क्या है?'
        },
        options: [
          {
            text: { en: 'Exit the group immediately, report as spam, and adjust WhatsApp privacy settings to prevent unknown adds.', hi: 'तुरंत ग्रुप से बाहर निकलें, स्पैम रिपोर्ट करें और अनचाहे ग्रुप में जुड़ने से बचने के लिए व्हाट्सएप प्राइवेसी सेटिंग्स बदलें।' },
            correct: true
          },
          {
            text: { en: 'Invest ₹1,000 to test if their tips work', hi: 'जांचने के लिए ₹1,000 लगाकर देखें' },
            correct: false
          },
          {
            text: { en: 'Ask other members privately if the admin is genuine', hi: 'अन्य सदस्यों से प्राइवेट में पूछें कि क्या एडमिन असली है' },
            correct: false
          }
        ],
        explanation: {
          en: 'Other members in scam groups are syndicate accomplices designed to create fake social proof. Always exit and report.',
          hi: 'ग्रुप के अन्य सदस्य सिंडिकेट के ही साथी होते हैं जो नकली भरोसा बनाने के लिए पोस्ट करते हैं। तुरंत बाहर निकलें और रिपोर्ट करें।'
        }
      }
    ]
  },

  'id-1': {
    id: 'id-1',
    categoryId: 'identity',
    duration: '4 min',
    difficulty: 'Beginner',
    readTime: '4 min read',
    title: {
      en: 'Protecting Your Aadhaar & PAN Details',
      hi: 'अपने आधार और पैन विवरण की सुरक्षा',
    },
    subtitle: {
      en: 'Using Masked Aadhaar, biometric locks via mAadhaar, and preventing mule loan registrations.',
      hi: 'मास्क्ड आधार का उपयोग, एम-आधार से बायोमेट्रिक लॉक और फर्जी लोन से बचाव।',
    },
    sections: [
      {
        title: { en: 'Why Full Aadhaar Photocopies are Dangerous', hi: 'पूरा आधार देना क्यों खतरनाक है' },
        content: {
          en: 'Handing over unmasked photocopies of your Aadhaar card allows shady agents to procure unauthorized SIM cards in your name or apply for instant personal loans on dubious NBFC apps. UIDAI officially recommends using "Masked Aadhaar" where only the last 4 digits (e.g. XXXX-XXXX-1234) are visible.',
          hi: 'आधार कार्ड की पूरी फोटोकॉपी देने से जालसाज आपके नाम पर अनधिकृत सिम कार्ड निकाल सकते हैं या फर्जी लोन ले सकते हैं। यूआईडीएआई मास्क्ड आधार का उपयोग करने की सलाह देता है जहां केवल अंतिम 4 अंक दिखाई देते हैं।'
        }
      },
      {
        title: { en: '🛡️ Best Defensive Practices', hi: '🛡️ सर्वोत्तम सुरक्षा उपाय' },
        points: {
          en: [
            'Download Masked Aadhaar from the official myaadhaar.uidai.gov.in portal.',
            'Cross-sign any physical copy with date and specific purpose (e.g. "Shared only for hotel check-in at Grand Hotel on 15 Oct 2026").',
            'Use the mAadhaar app to lock your biometrics. Once locked, nobody can perform fingerprint/iris authentication using your identity.'
          ],
          hi: [
            'आधिकारिक myaadhaar.uidai.gov.in पोर्टल से मास्क्ड आधार डाउनलोड करें।',
            'किसी भी भौतिक कॉपी पर उद्देश्य और तारीख लिखकर क्रॉस-साइन करें (उदा. "केवल 15 अक्टूबर 2026 को होटल चेक-इन हेतु")।',
            'mAadhaar ऐप से अपना बायोमेट्रिक लॉक करें ताकि कोई आपके फिंगरप्रिंट का दुरुपयोग न कर सके।'
          ]
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'What is the safest way to provide identity proof to a hotel or courier service in India?',
          hi: 'भारत में किसी होटल या कूरियर सेवा को पहचान प्रमाण देने का सबसे सुरक्षित तरीका क्या है?'
        },
        options: [
          {
            text: { en: 'Share a Masked Aadhaar with the purpose and date clearly written across the copy.', hi: 'कॉपी पर उद्देश्य और तारीख लिखकर मास्क्ड आधार शेयर करें।' },
            correct: true
          },
          {
            text: { en: 'Give your original Aadhaar card and let them keep it overnight', hi: 'अपना असली आधार कार्ड दें और रात भर उनके पास रहने दें' },
            correct: false
          },
          {
            text: { en: 'Tell them your Aadhaar OTP over the counter', hi: 'काउंटर पर अपना आधार ओटीपी बता दें' },
            correct: false
          }
        ],
        explanation: {
          en: 'Masked Aadhaar hides the first 8 digits and satisfies KYC requirements while preventing identity cloning.',
          hi: 'मास्क्ड आधार पहले 8 अंकों को छुपाता है और केवाईसी के लिए मान्य रहते हुए पहचान चोरी को रोकता है।'
        }
      }
    ]
  },

  'id-2': {
    id: 'id-2',
    categoryId: 'identity',
    duration: '7 min',
    difficulty: 'Advanced',
    readTime: '7 min read',
    title: {
      en: 'SIM Swap Fraud: Prevention & Recovery',
      hi: 'सिम स्वैप धोखाधड़ी: रोकथाम व त्वरित उपाय',
    },
    subtitle: {
      en: 'How criminals clone your mobile connection to intercept banking OTPs and drain life savings.',
      hi: 'अपराधी बैंक ओटीपी चुराने और खाता खाली करने के लिए आपके मोबाइल सिम को कैसे क्लोन करते हैं।',
    },
    sections: [
      {
        title: { en: 'What is a SIM Swap Attack?', hi: 'सिम स्वैप हमला क्या है?' },
        content: {
          en: 'A fraudster obtains a forged duplicate SIM card or requests an eSIM transfer for your phone number from telecom retail operators using forged KYC documents. Once the new SIM activates, your original SIM immediately loses network signal ("No Service"). The scammer then intercepts all incoming bank OTPs.',
          hi: 'जालसाज फर्जी दस्तावेजों के जरिए टेलीकॉम ऑपरेटर से आपके नंबर का डुप्लीकेट सिम या ई-सिम निकलवा लेते हैं। नया सिम चालू होते ही आपके फोन का नेटवर्क बंद हो जाता है और अपराधी को आपके सभी बैंक ओटीपी मिलने लगते हैं।'
        }
      },
      {
        title: { en: '🚨 Critical Warning Signal', hi: '🚨 सबसे बड़ा चेतावनी संकेत' },
        points: {
          en: [
            'Sudden and unexplained "No Service" or "Emergency Calls Only" in an area where network is usually strong.',
            'You receive an SMS from your telecom operator confirming an eSIM transfer or SIM swap request that you did NOT initiate.',
            'Calls from unknown numbers continuously ringing and hanging up to encourage you to switch off your phone.'
          ],
          hi: [
            'अच्छे नेटवर्क वाले क्षेत्र में अचानक फोन में "No Service" या "Emergency Calls Only" दिखना।',
            'टेलीकॉम ऑपरेटर से ई-सिम या सिम अपग्रेड का मैसेज आना जो आपने नहीं मांगा था।',
            'अनजान नंबरों से लगातार मिस्ड कॉल आना ताकि आप तंग आकर फोन बंद कर दें।'
          ]
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'Your phone suddenly shows "No Service" for over 30 minutes, after receiving an unrequested eSIM activation message. What must you do immediately?',
          hi: 'अवांछित ई-सिम एक्टिवेशन मैसेज आने के बाद आपके फोन में 30 मिनट से "No Service" आ रहा है। तुरंत क्या करना चाहिए?'
        },
        options: [
          {
            text: { en: 'Immediately call your telecom operator from another phone to block the SIM, and inform your bank to freeze net banking!', hi: 'तुरंत किसी अन्य फोन से टेलीकॉम ऑपरेटर को कॉल करके सिम ब्लॉक करवाएं और बैंक को नेट बैंकिंग फ्रीज करने को कहें!' },
            correct: true
          },
          {
            text: { en: 'Wait until tomorrow morning to see if network returns', hi: 'कल सुबह तक इंतजार करें कि नेटवर्क आता है या नहीं' },
            correct: false
          },
          {
            text: { en: 'Put the phone on charging and restart twice', hi: 'फोन को चार्जिंग पर लगाएं और दो बार रीस्टार्ट करें' },
            correct: false
          }
        ],
        explanation: {
          en: 'Loss of service following an eSIM/SIM swap SMS indicates active takeover. Every minute counts before funds are siphoned.',
          hi: 'ई-सिम मैसेज के बाद नेटवर्क जाना सिम हैक होने का स्पष्ट संकेत है। पैसे कटने से पहले तुरंत सिम और बैंक खाते ब्लॉक करवाएं।'
        }
      }
    ]
  },

  'id-3': {
    id: 'id-3',
    categoryId: 'identity',
    duration: '5 min',
    difficulty: 'Intermediate',
    readTime: '5 min read',
    title: {
      en: 'Social Engineering: Voice Call Tactics',
      hi: 'वॉयस कॉल धोखाधड़ी और सामाजिक इंजीनियरिंग',
    },
    subtitle: {
      en: 'Digital Arrest scams, fake police/CBI Skype interrogations, and AI cloned distress calls.',
      hi: 'डिजिटल अरेस्ट, फर्जी पुलिस/सीबीआई स्काइप पूछताछ और एआई क्लोन वॉइस कॉल से सुरक्षा।',
    },
    sections: [
      {
        title: { en: 'The "Digital Arrest" Hoax', hi: 'डिजिटल अरेस्ट का फर्जीवाड़ा' },
        content: {
          en: 'Criminals masquerade as Mumbai Police, CBI, ED, or FedEx customs officials. They place video calls over Skype wearing fake police uniforms with official-looking backdrops, claiming an international parcel containing narcotics was intercepted in your name. They threaten you with immediate arrest unless you transfer your money to an "RBI Verification Account".',
          hi: 'अपराधी मुंबई पुलिस, सीबीआई या नारकोटिक्स अधिकारी बनकर वर्दी पहनकर स्काइप या व्हाट्सएप वीडियो कॉल करते हैं। वे दावा करते हैं कि आपके नाम से नशीले पदार्थों का पार्सल पकड़ा गया है। वे डरा-धमकाकर पैसों को "आरबीआई जांच खाते" में भेजने को कहते हैं।'
        }
      },
      {
        title: { en: '🛡️ The Sovereign Truth', hi: '🛡️ कानूनी सच्चाई' },
        highlight: {
          en: 'There is NO SUCH THING as "Digital Arrest" under Indian law. Indian police or central agencies NEVER interrogate or demand funds over Skype, WhatsApp, or video calls!',
          hi: 'भारतीय कानून में "डिजिटल अरेस्ट" नाम की कोई चीज नहीं होती। भारत की पुलिस या एजेंसियां कभी भी वीडियो कॉल पर पूछताछ या पैसों की मांग नहीं करतीं!'
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'You receive a Skype video call from someone in a police uniform claiming you are under "Digital Arrest" for a courier package containing drugs, demanding money to clear your name. What should you do?',
          hi: 'आपको पुलिस की वर्दी में किसी व्यक्ति का स्काइप वीडियो कॉल आता है जो कहता है कि आप ड्रग्स पार्सल मामले में "डिजिटल अरेस्ट" हैं और नाम हटाने के लिए पैसे मांगता है। आपको क्या करना चाहिए?'
        },
        options: [
          {
            text: { en: 'Hang up immediately, do not send any money, and report the caller to 1930 or cybercrime.gov.in.', hi: 'तुरंत कॉल काटें, कोई पैसा न भेजें और 1930 या cybercrime.gov.in पर रिपोर्ट करें।' },
            correct: true
          },
          {
            text: { en: 'Transfer money to their "RBI Security" account to avoid going to jail', hi: 'जेल जाने से बचने के लिए उनके "आरबीआई सुरक्षा" खाते में पैसे भेजें' },
            correct: false
          },
          {
            text: { en: 'Apologize and promise not to order parcels again', hi: 'माफी मांगें और दोबारा पार्सल न मंगाने का वादा करें' },
            correct: false
          }
        ],
        explanation: {
          en: 'Digital Arrest is 100% scam fabricated by transnational cyber syndicates. Genuine police send formal physical summons.',
          hi: 'डिजिटल अरेस्ट पूरी तरह से फर्जी है। असली पुलिस कभी भी वीडियो कॉल पर पैसे नहीं मांगती, वे विधिवत समन भेजते हैं।'
        }
      }
    ]
  },

  'ph-1': {
    id: 'ph-1',
    categoryId: 'phishing',
    duration: '3 min',
    difficulty: 'Beginner',
    readTime: '3 min read',
    title: {
      en: 'Identifying Fake Government Websites',
      hi: 'फर्जी सरकारी वेबसाइटों की पहचान कैसे करें',
    },
    subtitle: {
      en: 'Spotting rogue domains (.top, .xyz, .in.net) pretending to be Parivahan, e-Challan, and PM Kisan.',
      hi: 'परिवहन, ई-चालान और पीएम किसान की नकल करने वाले फर्जी डोमेन की पहचान करना।',
    },
    sections: [
      {
        title: { en: 'The Domain Suffix Rule', hi: 'डोमेन एक्सटेंशन का नियम' },
        content: {
          en: 'Authentic Indian central and state government portals exclusively reside on .gov.in or .nic.in domain names. Phishing operators create lookalike websites on cheap domains like "echallan-parivahan.top" or "pmkisan-yojana.xyz" to harvest net-banking passwords and credit card credentials.',
          hi: 'भारत सरकार और राज्य सरकारों के असली पोर्टल केवल .gov.in या .nic.in डोमेन पर होते हैं। जालसाज कार्ड विवरण और पासवर्ड चुराने के लिए "echallan.top" जैसे फर्जी डोमेन बनाते हैं।'
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'You receive an SMS: "Traffic Challan of ₹1,000 pending. Pay within 24 hours to avoid court summons: https://echallan-parivahan.top/pay". Is this genuine?',
          hi: 'आपको एसएमएस मिलता है: "₹1,000 का ट्रैफिक चालान लंबित है। कोर्ट समन से बचने के लिए 24 घंटे में भुगतान करें: https://echallan-parivahan.top/pay"। क्या यह असली है?'
        },
        options: [
          {
            text: { en: 'No! Official Indian government portals strictly end in ".gov.in" or ".nic.in". ".top" is a phishing trap.', hi: 'नहीं! आधिकारिक सरकारी वेबसाइटें अनिवार्य रूप से ".gov.in" या ".nic.in" पर समाप्त होती हैं। ".top" एक फर्जी ट्रैप है।' },
            correct: true
          },
          {
            text: { en: 'Yes, because the link contains the word "parivahan"', hi: 'हां, क्योंकि लिंक में "parivahan" शब्द लिखा है' },
            correct: false
          },
          {
            text: { en: 'Yes, pay immediately before penalty doubles', hi: 'हां, जुर्माना दोगुना होने से पहले तुरंत भुगतान करें' },
            correct: false
          }
        ],
        explanation: {
          en: 'Any portal asking for fine payments ending in .top, .xyz, or .org is a phishing attempt. Only pay on echallan.parivahan.gov.in.',
          hi: 'सरकारी चालान के नाम पर .top या .xyz वाली साइटें फर्जी हैं। केवल आधिकारिक .gov.in पोर्टल पर ही जाएं।'
        }
      }
    ]
  },

  'ph-2': {
    id: 'ph-2',
    categoryId: 'phishing',
    duration: '5 min',
    difficulty: 'Intermediate',
    readTime: '5 min read',
    title: {
      en: 'APK Sideloading Dangers on Android',
      hi: 'एंड्रॉइड पर अज्ञात एपीके डाउनलोड के खतरे',
    },
    subtitle: {
      en: 'Malicious APKs disguised as "SBI Rewards", "Electricity Bill Update", and how they silently read OTPs.',
      hi: '"एसबीआई रिवॉर्ड" या "बिजली बिल" के नाम पर भेजी जाने वाली घातक एपीके फाइलें और ओटीपी चोरी।',
    },
    sections: [
      {
        title: { en: 'Why Sideloading is Extremely Dangerous', hi: 'अज्ञात एपीके इंस्टॉल करना क्यों खतरनाक है' },
        content: {
          en: 'Fraudsters send Android APK installation packages via WhatsApp or SMS under names like "SBI_Rewards.apk" or "Bijli_Bill_Update.apk". Once installed, the app requests "Accessibility Services" and "SMS Notification" permissions. This gives the attackers full remote control to read incoming bank OTPs and drain accounts without your knowledge.',
          hi: 'जालसाज व्हाट्सएप पर "SBI_Rewards.apk" या "Bijli_Bill.apk" जैसी फाइलें भेजते हैं। इंस्टॉल होने के बाद ये ऐप्स "Accessibility" और "SMS" की अनुमति लेकर चुपके से बैंक ओटीपी पढ़ लेते हैं और खाता खाली कर देते हैं।'
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'A WhatsApp message warns your power will be cut tonight at 9:30 PM unless you install "Electricity_Bill_Update.apk". What must you do?',
          hi: 'व्हाट्सएप पर संदेश आता है कि आज रात 9:30 बजे बिजली काट दी जाएगी जब तक कि आप "Electricity_Bill_Update.apk" इंस्टॉल न करें। आपको क्या करना चाहिए?'
        },
        options: [
          {
            text: { en: 'Never install the APK! Delete it immediately. Power discoms never distribute APKs over WhatsApp to update bills.', hi: 'एपीके कभी इंस्टॉल न करें! तुरंत डिलीट करें। बिजली विभाग बिल के लिए कभी व्हाट्सएप पर ऐप फाइल नहीं भेजता।' },
            correct: true
          },
          {
            text: { en: 'Install it quickly and grant all permissions', hi: 'जल्दी से इंस्टॉल करें और सभी परमिशन दे दें' },
            correct: false
          },
          {
            text: { en: 'Forward the APK to your neighbors', hi: 'यह एपीके अपने पड़ोसियों को भेजें' },
            correct: false
          }
        ],
        explanation: {
          en: 'Utility bill APK scams are widespread banking trojans. Official utility payments should only be verified through authorized apps or official web portals.',
          hi: 'बिजली बिल के नाम पर भेजी गई एपीके एक बैंकिंग वायरस होती है। हमेशा आधिकारिक ऐप या पोर्टल पर ही बिल चेक करें।'
        }
      }
    ]
  },

  'ph-3': {
    id: 'ph-3',
    categoryId: 'phishing',
    duration: '8 min',
    difficulty: 'Advanced',
    readTime: '8 min read',
    title: {
      en: 'Banking Trojan Defense for Indian Users',
      hi: 'भारतीय उपयोगकर्ताओं के लिए बैंकिंग ट्रोजन सुरक्षा',
    },
    subtitle: {
      en: 'Overlay malware, credential stealers, and emergency steps to take if your smartphone is infected.',
      hi: 'स्क्रीन ओवरले मालवेअर, क्रेडेंशियल चोरी और फोन इन्फेक्ट होने पर तत्काल उठाए जाने वाले कदम।',
    },
    sections: [
      {
        title: { en: 'Understanding Overlay Malware Attacks', hi: 'स्क्रीन ओवरले हमलों को समझें' },
        content: {
          en: 'Modern banking trojans (such as Godfather or SharkBot) run invisibly in your phone background. When you open a genuine app like YONO SBI, HDFC Mobile, or Zerodha, the trojan instantly draws an identical fake login window OVER the real app, capturing your NetBanking credentials and mPIN.',
          hi: 'आधुनिक बैंकिंग वायरस फोन के बैकग्राउंड में छिपे रहते हैं। जैसे ही आप असली बैंक ऐप खोलते हैं, वे उसके ऊपर हूबहू नकली लॉगिन विंडो दिखा देते हैं और आपका पासवर्ड चुरा लेते हैं।'
        }
      },
      {
        title: { en: '🚨 Emergency Protocol if Infected', hi: '🚨 इन्फेक्ट होने पर आपातकालीन कदम' },
        points: {
          en: [
            'Immediately turn on Airplane Mode and disconnect from Wi-Fi to cut off the criminal command & control server.',
            'Remove physical SIM cards from the device.',
            'Call your bank from another family member phone to freeze your net banking, cards, and UPI VPAs.',
            'Perform a complete Factory Data Reset of the infected device.'
          ],
          hi: [
            'अपराधी का रिमोट कनेक्शन काटने के लिए तुरंत फोन को एयरप्लेन मोड पर डालें और वाई-फाई बंद करें।',
            'फोन से सिम कार्ड निकाल लें।',
            'दूसरे फोन से बैंक को कॉल करके तुरंत नेट बैंकिंग और यूपीआई ब्लॉक करवाएं।',
            'इन्फेक्टेड फोन का पूरा फैक्ट्री डेटा रीसेट करें।'
          ]
        }
      }
    ],
    quiz: [
      {
        id: 'q1',
        question: {
          en: 'What is the very first step you should take if you suspect your smartphone is compromised by a banking trojan?',
          hi: 'यदि आपको संदेह है कि आपका फोन किसी बैंकिंग वायरस से इन्फेक्ट हो गया है, तो सबसे पहला कदम क्या होना चाहिए?'
        },
        options: [
          {
            text: { en: 'Turn on Airplane Mode immediately to terminate malicious internet communication with the attacker!', hi: 'हमलावर से इंटरनेट संपर्क तुरंत काटने के लिए फोन को तुरंत एयरप्लेन मोड पर डालें!' },
            correct: true
          },
          {
            text: { en: 'Open all banking apps to check your balance', hi: 'बैलेंस चेक करने के लिए सभी बैंक ऐप खोलें' },
            correct: false
          },
          {
            text: { en: 'Wait for the virus to show a notification', hi: 'वायरस का कोई मैसेज आने का इंतजार करें' },
            correct: false
          }
        ],
        explanation: {
          en: 'Activating Airplane Mode stops live data transmission, preventing the malware from exfiltrating OTPs or accepting remote debit commands.',
          hi: 'एयरप्लेन मोड ऑन करने से इंटरनेट कट जाता है, जिससे वायरस बैंक ओटीपी बाहर नहीं भेज पाता।'
        }
      }
    ]
  }
}
