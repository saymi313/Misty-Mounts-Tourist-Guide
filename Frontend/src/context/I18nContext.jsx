import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { translations } from "../data/translations";
import { enableUrdu, disableUrdu } from "../utils/autoTranslate";

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem("mm-lang") || "en"; } catch { return "en"; }
  });
  const langRef = useRef(lang);
  langRef.current = lang;

  // On first load, if Urdu was previously selected, start the runtime translator
  // once the app has painted its initial DOM.
  useEffect(() => {
    if (langRef.current === "ur") enableUrdu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setLang = useCallback((l) => {
    try { localStorage.setItem("mm-lang", l); } catch { /* ignore */ }
    if (l === "ur") {
      setLangState("ur");
      enableUrdu();
    } else {
      // Reload to cleanly restore the original English strings (they were
      // replaced in-place). No reload needed if we were already English.
      if (langRef.current === "ur") { disableUrdu(); window.location.reload(); return; }
      setLangState("en");
    }
  }, []);

  // Keyed strings (navbar/CTAs) still resolve from the dictionary; everything
  // else on the page is handled by the runtime translator.
  const t = useCallback(
    (key, fallback) => translations[lang]?.[key] ?? translations.en[key] ?? fallback ?? key,
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

/** Safe even outside a provider (returns identity translations). */
export const useI18n = () => useContext(I18nContext) || { lang: "en", setLang: () => {}, t: (k, f) => f ?? k };
