'use client';

import { useLanguageStore } from '@/store/languageStore';
import { translations, TranslationKey } from '@/lib/translations';

export function useTranslation() {
  const { language } = useLanguageStore();
  
  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };
  
  return { t, language };
}
