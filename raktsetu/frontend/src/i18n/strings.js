// Translation dictionary. Each key maps to { en, hi }.
// Add new keys here as more pages get translated.
const strings = {
  // Navbar
  nav_home: { en: "Home", hi: "होम" },
  nav_dashboard: { en: "Dashboard", hi: "डैशबोर्ड" },
  nav_request: { en: "Request Blood", hi: "रक्त का अनुरोध करें" },
  nav_logout: { en: "Log out", hi: "लॉग आउट" },
  nav_login: { en: "Log in", hi: "लॉग इन" },
  nav_become_donor: { en: "Become a donor", hi: "दाता बनें" },

  // Home — hero
  home_eyebrow: { en: "Emergency blood donor network", hi: "आपातकालीन रक्तदाता नेटवर्क" },
  home_headline_1: { en: "A pulse, when someone", hi: "एक धड़कन, जब किसी को" },
  home_headline_2: { en: "needs one most.", hi: "इसकी सबसे ज़्यादा ज़रूरत हो।" },
  home_subtext: {
    en: "RaktSetu finds compatible, nearby blood donors the moment an emergency request comes in — and notifies them before it's too late to matter.",
    hi: "रक्तसेतु आपातकालीन अनुरोध आते ही अनुकूल, नज़दीकी रक्तदाताओं को ढूंढता है — और समय रहते उन्हें सूचित करता है।",
  },
  home_cta_raise: { en: "Raise an emergency request", hi: "आपातकालीन अनुरोध भेजें" },
  home_cta_register: { en: "Register as a donor", hi: "दाता के रूप में पंजीकरण करें" },
  home_cta_dashboard: { en: "Go to dashboard", hi: "डैशबोर्ड पर जाएं" },
  home_cta_see_matching: { en: "See how matching works", hi: "मिलान कैसे काम करता है देखें" },

  // Home — vitals strip
  vital_blood_types: { en: "Blood types tracked", hi: "रक्त समूह कवर किए गए" },
  vital_radius: { en: "Match radius", hi: "मिलान दायरा" },
  vital_alert_time: { en: "Avg. alert time", hi: "औसत सूचना समय" },

  // Home — how it works
  home_how_it_works: { en: "How it works", hi: "यह कैसे काम करता है" },
  home_how_it_works_sub: {
    en: "From request to responder, in three steps",
    hi: "अनुरोध से सहायता तक, तीन चरणों में",
  },
  step1_title: { en: "Register your blood type & location", hi: "अपना रक्त समूह और स्थान दर्ज करें" },
  step1_body: {
    en: "Sign up once with your blood type and city. We store only a location point — enough to calculate distance, never to track you.",
    hi: "एक बार अपने रक्त समूह और शहर के साथ साइन अप करें। हम केवल दूरी नापने लायक स्थान संग्रहीत करते हैं — कभी भी आपकी निगरानी के लिए नहीं।",
  },
  step2_title: { en: "A request comes in nearby", hi: "पास में एक अनुरोध आता है" },
  step2_body: {
    en: "When someone urgently needs blood, RaktSetu checks the request's type against the medical compatibility rules — not just an exact match.",
    hi: "जब किसी को तत्काल रक्त की आवश्यकता होती है, तो रक्तसेतु अनुरोध के प्रकार की जांच चिकित्सा अनुकूलता नियमों से करता है — केवल सटीक मिलान से नहीं।",
  },
  step3_title: { en: "You get an alert, if you're eligible", hi: "यदि आप पात्र हैं, तो आपको सूचना मिलती है" },
  step3_body: {
    en: "Only compatible, available donors within the search radius are emailed — sorted by distance, so the closest donor hears first.",
    hi: "खोज दायरे में केवल अनुकूल, उपलब्ध दाताओं को ईमेल भेजा जाता है — दूरी के अनुसार क्रमबद्ध, ताकि निकटतम दाता को पहले पता चले।",
  },

  // Home — CTA
  home_cta_heading: {
    en: "Someone nearby might need your type today.",
    hi: "आज पास में किसी को आपके रक्त समूह की ज़रूरत हो सकती है।",
  },
  home_cta_body: {
    en: "Registration takes under two minutes. You choose when you're available — toggle it off anytime.",
    hi: "पंजीकरण में दो मिनट से भी कम समय लगता है। आप तय करते हैं कि कब उपलब्ध रहना है — कभी भी इसे बंद करें।",
  },
    home_cta_join: { en: "Join as a donor", hi: "दाता के रूप में जुड़ें" },

  // Shared field labels
  field_email: { en: "Email", hi: "ईमेल" },
  field_password: { en: "Password", hi: "पासवर्ड" },
  field_select: { en: "Select", hi: "चुनें" },

  // Login page
  login_eyebrow: { en: "Welcome back", hi: "वापसी पर स्वागत है" },
  login_title: { en: "Log in", hi: "लॉग इन करें" },
  login_forgot: { en: "Forgot password?", hi: "पासवर्ड भूल गए?" },
  login_submitting: { en: "Logging in…", hi: "लॉग इन हो रहा है…" },
  login_new_here: { en: "New here?", hi: "नए हैं?" },
  register_as_donor: { en: "Register as a donor", hi: "दाता के रूप में पंजीकरण करें" },

  // Register page
  register_eyebrow: { en: "Join the network", hi: "नेटवर्क से जुड़ें" },
  field_full_name: { en: "Full name", hi: "पूरा नाम" },
  field_phone: { en: "Phone number", hi: "फ़ोन नंबर" },
  field_blood_type: { en: "Blood type", hi: "रक्त समूह" },
  field_city: { en: "City", hi: "शहर" },
  field_location: { en: "Location", hi: "स्थान" },
  loc_getting_your: { en: "Getting your location…", hi: "आपका स्थान प्राप्त किया जा रहा है…" },
  loc_captured: { en: "✓ Location captured", hi: "✓ स्थान दर्ज किया गया" },
  loc_share_mine: { en: "Share my current location", hi: "मेरा वर्तमान स्थान साझा करें" },
  loc_help_text: {
    en: "Used only to calculate distance to emergency requests near you.",
    hi: "केवल आपके पास के आपातकालीन अनुरोधों की दूरी नापने के लिए उपयोग किया जाता है।",
  },
  register_submit: { en: "Create account", hi: "खाता बनाएं" },
  register_submitting: { en: "Creating account…", hi: "खाता बनाया जा रहा है…" },
  register_already: { en: "Already registered?", hi: "पहले से पंजीकृत हैं?" },

  // CreateRequest page
  request_eyebrow: { en: "Emergency request", hi: "आपातकालीन अनुरोध" },
  request_title: { en: "Request blood urgently", hi: "तुरंत रक्त का अनुरोध करें" },
  request_subtitle: {
    en: "We'll instantly find compatible, available donors within 10 km and email them.",
    hi: "हम 10 किमी के भीतर अनुकूल, उपलब्ध दाताओं को तुरंत ढूंढेंगे और उन्हें ईमेल करेंगे।",
  },
  field_patient_name: { en: "Patient name", hi: "मरीज़ का नाम" },
  field_blood_type_needed: { en: "Blood type needed", hi: "आवश्यक रक्त समूह" },
  field_units_needed: { en: "Units needed", hi: "आवश्यक यूनिट" },
  field_hospital_name: { en: "Hospital name", hi: "अस्पताल का नाम" },
  field_contact_phone: { en: "Contact phone", hi: "संपर्क फ़ोन" },
  field_urgency: { en: "Urgency", hi: "तात्कालिकता" },
  urgency_critical: { en: "Critical — needed now", hi: "गंभीर — अभी आवश्यक" },
  urgency_urgent: { en: "Urgent — within hours", hi: "अत्यावश्यक — कुछ घंटों में" },
  urgency_scheduled: { en: "Scheduled — planned procedure", hi: "निर्धारित — योजनाबद्ध प्रक्रिया" },
  field_notes: { en: "Notes (optional)", hi: "टिप्पणी (वैकल्पिक)" },
  field_hospital_location: { en: "Hospital location", hi: "अस्पताल का स्थान" },
  loc_getting_short: { en: "Getting location…", hi: "स्थान प्राप्त हो रहा है…" },
  loc_share_hospital: { en: "Share hospital's current location", hi: "अस्पताल का वर्तमान स्थान साझा करें" },
  demo_loc_using: {
    en: "✓ Using demo location (New Delhi)",
    hi: "✓ डेमो स्थान का उपयोग हो रहा है (नई दिल्ली)",
  },
  demo_loc_link: {
    en: "No GPS handy? Use a demo location instead",
    hi: "जीपीएस उपलब्ध नहीं? इसके बजाय डेमो स्थान का उपयोग करें",
  },
  request_submit: { en: "Send emergency request", hi: "आपातकालीन अनुरोध भेजें" },
  request_submitting: { en: "Finding donors…", hi: "दाता खोजे जा रहे हैं…" },
  result_sent_title: { en: "Request sent", hi: "अनुरोध भेज दिया गया" },
  result_no_email_text: {
    en: "Don't wait on email — call directly if this is urgent.",
    hi: "ईमेल का इंतज़ार न करें — अगर यह अत्यावश्यक है तो सीधे कॉल करें।",
  },
  result_demo_note: {
    en: "📧 Demo note: on this deployment, donor email alerts only deliver to the project's own inbox (a Resend free-tier limit, not a bug). The call list above works for every donor, so it's the reliable way to try the full flow.",
    hi: "📧 डेमो नोट: इस डिप्लॉयमेंट पर, दाता ईमेल सूचनाएं केवल प्रोजेक्ट के अपने इनबॉक्स में पहुंचती हैं (यह Resend की मुफ़्त सीमा है, कोई बग नहीं)। ऊपर दी गई कॉल सूची हर दाता के लिए काम करती है, इसलिए यह पूरी प्रक्रिया आज़माने का भरोसेमंद तरीका है।",
  },
  result_view_request: { en: "View request", hi: "अनुरोध देखें" },
  helped_before: { en: "Helped", hi: "मदद की" },
  times_before: { en: "time(s) before", hi: "बार पहले" },
  call_word: { en: "Call", hi: "कॉल करें" },
  km_away: { en: "km away", hi: "किमी दूर" },

  // Dashboard page
  dashboard_eyebrow: { en: "Your dashboard", hi: "आपका डैशबोर्ड" },
  dashboard_hi: { en: "Hi", hi: "नमस्ते" },
  raise_request_short: { en: "Raise emergency request", hi: "आपातकालीन अनुरोध भेजें" },
  status_available: { en: "Available to donate", hi: "दान के लिए उपलब्ध" },
  status_not_available: { en: "Not available", hi: "उपलब्ध नहीं" },
  resting_until: { en: "Resting until", hi: "तक विश्राम पर" },
  btn_turn_off: { en: "Turn off", hi: "बंद करें" },
  btn_turn_on: { en: "Turn on", hi: "चालू करें" },
  btn_updating: { en: "Updating…", hi: "अपडेट हो रहा है…" },
  btn_update_location: { en: "Update my location", hi: "अपना स्थान अपडेट करें" },
  cooldown_note_prefix: {
    en: "Whole-blood donors need about 90 days between donations. You'll automatically start receiving alerts again on",
    hi: "पूर्ण-रक्त दाताओं को दान के बीच लगभग 90 दिन चाहिए। आपको फिर से सूचनाएं मिलनी शुरू होंगी",
  },
  cooldown_note_suffix: {
    en: "— thank you for recently donating.",
    hi: "— हाल ही में रक्तदान करने के लिए धन्यवाद।",
  },
  history_heading: { en: "Requests you've been notified about", hi: "जिन अनुरोधों की आपको सूचना मिली है" },
  history_loading: { en: "Loading…", hi: "लोड हो रहा है…" },
  history_empty: {
    en: "No alerts yet. When a compatible request appears near you, it'll show up here.",
    hi: "अभी तक कोई सूचना नहीं। जब आपके पास कोई अनुकूल अनुरोध आएगा, तो वह यहाँ दिखाई देगा।",
  },
  status_pending: { en: "Pending", hi: "लंबित" },
  status_donors_notified: { en: "Donors notified", hi: "दाताओं को सूचित किया गया" },
  status_fulfilled: { en: "Fulfilled", hi: "पूरा हुआ" },
  status_expired: { en: "Expired", hi: "समाप्त" },
};

export default strings;