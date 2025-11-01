'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import translations, { Language, TranslationKeys } from './index';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof TranslationKeys) => string;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useTranslation() {
  const context = useContext(I18nContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within an I18nProvider');
  }
  
  return context;
}

// Hook for creating the I18n context value
export function useI18n() {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage for saved language preference
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      if (saved && ['en', 'hi', 'or'].includes(saved)) {
        return saved;
      }
    }
    return 'en';
  });
  
  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  }, []);
  
  const t = useCallback((key: keyof TranslationKeys): string => {
    return translations[language][key] || key;
  }, [language]);
  
  return { language, setLanguage, t };
}

