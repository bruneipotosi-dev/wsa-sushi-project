import { useState, useEffect, useCallback } from 'react';

const THEME_STORAGE_KEY = 'blueharbor-theme';

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

// Preferenza tema (light | dark | system) con persistenza in localStorage,
// stesso pattern di ROLE_STORAGE_KEY in App.jsx. Nessuna scelta salvata =
// segue prefers-color-scheme del sistema operativo.
export function useTheme() {
  const [preference, setPreference] = useState(
    () => localStorage.getItem(THEME_STORAGE_KEY) || 'system'
  );
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => setSystemTheme(getSystemTheme());
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  const theme = preference === 'system' ? systemTheme : preference;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (next === 'system') {
      localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    }
    setPreference(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return { theme, preference, setTheme, toggleTheme };
}
