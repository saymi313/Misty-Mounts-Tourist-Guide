import React, { createContext, useContext, useState, useCallback } from "react";
import { translations } from "../data/translations";

const I18nContext = createContext(null);

export const I18nProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem("mm-lang") || "en"; } catch { return "en"; }
  });

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem("mm-lang", l); } catch { /* ignore */ }
  }, []);

  const t = useCallback(
    (key, fallback) => translations[lang]?.[key] ?? translations.en[key] ?? fallback ?? key,
    [lang]
  );

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
};

/** Safe even outside a provider (returns identity translations). */
export const useI18n = () => useContext(I18nContext) || { lang: "en", setLang: () => {}, t: (k, f) => f ?? k };
