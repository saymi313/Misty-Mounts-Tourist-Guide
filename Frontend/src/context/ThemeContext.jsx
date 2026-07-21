import React, { createContext, useContext, useState, useLayoutEffect } from 'react';

const ThemeContext = createContext(null);

/**
 * Landing theme: 'dark' (default) or 'light'. Adds/removes the `dark` class on
 * <html> so Tailwind's class-based dark variants apply. Persisted to
 * localStorage. Interior pages carry no `dark:` variants, so the class is inert
 * there.
 */
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('mm-theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('mm-theme', theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Safe fallback if used outside a provider.
export const useTheme = () =>
  useContext(ThemeContext) || { theme: 'dark', toggleTheme() {}, setTheme() {} };
