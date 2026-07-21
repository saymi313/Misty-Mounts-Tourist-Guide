import React, { createContext, useContext, useLayoutEffect } from 'react';

const ThemeContext = createContext(null);

/**
 * App theme. The product now commits to a single dark (vibrant-night) canvas
 * to match the bento landing, so `dark` is always applied and there is no
 * toggle. Kept as a provider so `useTheme()` callers keep working.
 */
export const ThemeProvider = ({ children }) => {
  useLayoutEffect(() => {
    document.documentElement.classList.add('dark');
    try { localStorage.setItem('mm-theme', 'dark'); } catch { /* ignore */ }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', toggleTheme() {}, setTheme() {} }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () =>
  useContext(ThemeContext) || { theme: 'dark', toggleTheme() {}, setTheme() {} };
