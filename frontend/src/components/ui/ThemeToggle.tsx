'use client';

import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors hover:scale-105 active:scale-95"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-yellow-500" />
      ) : (
        <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      )}
    </button>
  );
}
