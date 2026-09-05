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
};

export default strings;