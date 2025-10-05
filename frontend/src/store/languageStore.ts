'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'en' | 'de';

interface LanguageState {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language: Language) => set({ language }),
      toggleLanguage: () => set((state) => ({ 
        language: state.language === 'en' ? 'de' : 'en' 
      })),
    }),
    {
      name: 'pudding-language-storage',
    }
  )
);
