'use client';

import React, { useEffect, useState } from 'react';

type ThemeMode = 'midnight' | 'light' | 'gold' | 'oled';

export const ThemeSwitcher: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>('midnight');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = (localStorage.getItem('satco_theme') as ThemeMode) || 'midnight';
    setCurrentTheme(saved);
    applyTheme(saved);
  }, []);

  const applyTheme = (theme: ThemeMode) => {
    setCurrentTheme(theme);
    if (typeof document !== 'undefined') {
      if (theme === 'midnight') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      localStorage.setItem('satco_theme', theme);
    }
  };

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
        <span className="px-2 py-1">🎨 Theme</span>
      </div>
    );
  }

  const themes: { id: ThemeMode; label: string; icon: string; bg: string }[] = [
    { id: 'midnight', label: 'Dark', icon: '🌙', bg: 'bg-slate-900 text-orange-400' },
    { id: 'light', label: 'Light', icon: '☀️', bg: 'bg-white text-slate-900' },
    { id: 'gold', label: 'Gold', icon: '👑', bg: 'bg-blue-950 text-amber-300' },
    { id: 'oled', label: 'OLED', icon: '⚫', bg: 'bg-black text-blue-400' },
  ];

  return (
    <div className="flex items-center gap-1 bg-surface-card p-1 rounded-xl border border-surface-border shadow-md">
      {themes.map((t) => {
        const isActive = currentTheme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => applyTheme(t.id)}
            title={`Switch to ${t.label} Theme`}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition duration-200 ${
              isActive
                ? 'bg-brand-primary text-white shadow-sm ring-1 ring-white/20'
                : 'text-theme-muted hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
