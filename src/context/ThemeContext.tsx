import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeColor = 
  | 'orange' | 'green' | 'blue' | 'purple' | 'red' 
  | 'gold' | 'gray' | 'teal' | 'dark-green' | 'navy';

interface ThemeContextType {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  accentColor: ThemeColor;
  setAccentColor: (color: ThemeColor) => void;
  autoNext: boolean;
  setAutoNext: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [accentColor, setAccentColor] = useState<ThemeColor>(() => (localStorage.getItem('accentColor') as ThemeColor) || 'orange');
  const [autoNext, setAutoNext] = useState(() => localStorage.getItem('autoNext') !== 'false');

  useEffect(() => {
    localStorage.setItem('darkMode', String(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('autoNext', String(autoNext));
  }, [autoNext]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, accentColor, setAccentColor, autoNext, setAutoNext }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const getAccentHex = (color: ThemeColor) => {
  const colors = {
    orange: '#F27D26',
    green: '#2E7D32',
    blue: '#0288D1',
    purple: '#7B1FA2',
    red: '#C62828',
    gold: '#D4AF37',
    gray: '#616161',
    teal: '#00897B',
    'dark-green': '#1B5E20',
    navy: '#1A237E'
  };
  return colors[color];
};

export const getAccentClass = (color: ThemeColor) => {
  const classes = {
    orange: 'bg-islamic-orange',
    green: 'bg-islamic-green',
    blue: 'bg-islamic-blue',
    purple: 'bg-islamic-purple',
    red: 'bg-islamic-red',
    gold: 'bg-islamic-gold',
    gray: 'bg-islamic-gray',
    teal: 'bg-islamic-teal',
    'dark-green': 'bg-islamic-dark-green',
    navy: 'bg-islamic-navy'
  };
  return classes[color];
};

export const getAccentTextClass = (color: ThemeColor) => {
  const classes = {
    orange: 'text-islamic-orange',
    green: 'text-islamic-green',
    blue: 'text-islamic-blue',
    purple: 'text-islamic-purple',
    red: 'text-islamic-red',
    gold: 'text-islamic-gold',
    gray: 'text-islamic-gray',
    teal: 'text-islamic-teal',
    'dark-green': 'text-islamic-dark-green',
    navy: 'text-islamic-navy'
  };
  return classes[color];
};
    
