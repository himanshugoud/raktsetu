import { createContext, useContext, useState, useEffect } from "react";
import strings from "../i18n/strings.js";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("raktsetu_lang") || "en");

  useEffect(() => {
    localStorage.setItem("raktsetu_lang", lang);
  }, [lang]);

  function toggleLang() {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  }

  // Looks up a translation key for the current language.
  // Falls back to the key itself if a translation is missing, so an
  // untranslated page never renders blank text.
  function t(key) {
    return strings[key]?.[lang] ?? key;
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}