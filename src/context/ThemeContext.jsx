import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('consorcio_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [brandTheme, setBrandTheme] = useState(() => {
    try {
      const savedBrand = localStorage.getItem('consorcio_brand');
      return ['amber', 'ocean', 'emerald'].includes(savedBrand) ? savedBrand : 'amber';
    } catch {
      return 'amber';
    }
  });

  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Set brand theme as a data attribute on root
    root.setAttribute('data-theme', brandTheme);

    try {
      localStorage.setItem('consorcio_theme', theme);
      localStorage.setItem('consorcio_brand', brandTheme);
    } catch (e) {
      console.warn('Storage write blocked:', e);
    }
  }, [theme, isDark, brandTheme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const changeBrandTheme = useCallback((newBrand) => {
    setBrandTheme(newBrand);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, brandTheme, changeBrandTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
