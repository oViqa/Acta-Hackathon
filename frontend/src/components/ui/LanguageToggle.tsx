'use client';

import { Languages } from 'lucide-react';
import { useLanguageStore } from '@/store/languageStore';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguageStore();

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors hover:scale-105 active:scale-95"
      title={`Switch to ${language === 'en' ? 'German' : 'English'}`}
    >
      <div className="flex items-center gap-1">
        <Languages className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
          {language.toUpperCase()}
        </span>
      </div>
    </button>
  );
}
