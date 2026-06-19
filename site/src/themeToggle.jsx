import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const STORAGE_KEY = 'sf_theme';

export default function ThemeToggleButton() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;

    const nextTheme = stored === 'dark' || stored === 'light' ? stored : prefersDark ? 'dark' : 'light';

    // Avoid cascades by deferring state update to next tick
    queueMicrotask(() => setTheme(nextTheme));
  }, []);

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="p-2 rounded-lg transition bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900"
      aria-label="Toggle dark mode"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-slate-600" />}
    </button>
  );
}

