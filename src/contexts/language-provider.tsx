'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { Language } from '@/types';
import { translations } from '@/lib/translations';

const LANGUAGE_KEY = 'typingAppLanguage';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: typeof translations.en;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_KEY) as Language | null;
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    if (translations[lang]) {
        localStorage.setItem(LANGUAGE_KEY, lang);
        setLanguageState(lang);
    }
  };

  const t = useMemo(() => translations[language] || translations.en, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
