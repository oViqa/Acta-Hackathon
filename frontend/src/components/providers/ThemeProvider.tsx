'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { isDark } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove('light', 'dark');
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }
  }, [isDark]);

  return <>{children}</>;
}
