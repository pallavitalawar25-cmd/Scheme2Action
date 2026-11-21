import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '../translations/en';
import kn from '../translations/kn';
import { readString, writeString } from '../utils/storage';

const dictionaries = { en, kn };
const STORAGE_KEY = 's2a.language';
const LanguageContext = createContext(null);

const interpolate = (str, vars) => (vars ? str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`)) : str);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => (readString(STORAGE_KEY) === 'kn' ? 'kn' : 'en'));

  useEffect(() => {
    document.documentElement.lang = language;
    writeString(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((lang) => setLanguageState(lang === 'kn' ? 'kn' : 'en'), []);

  const value = useMemo(() => {
    const english = (key, vars) => interpolate(en[key] ?? key, vars);

    // Plain string in the active language (for placeholders, aria-labels, attributes).
    const t = (key, vars) => {
      if (language === 'kn' && kn[key]) return interpolate(kn[key], vars);
      if (import.meta.env.DEV && en[key] === undefined) console.warn(`[i18n] Missing key: ${key}`);
      return english(key, vars);
    };

    // Rich result for visible text: Kannada on top, English beneath.
    const bilingual = (key, vars) => {
      if (language === 'kn') {
        if (kn[key]) return { primary: interpolate(kn[key], vars), secondary: english(key, vars), fallback: false };
        return { primary: english(key, vars), secondary: null, fallback: true };
      }
      return { primary: english(key, vars), secondary: null, fallback: false };
    };

    return { language, setLanguage, t, tEn: english, bilingual, isKannada: language === 'kn' };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
