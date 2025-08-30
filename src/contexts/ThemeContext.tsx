"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Theme } from '@/lib/theme/colors';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  // Initialize with safe defaults that match the script
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    // On server, default to dark to match the script fallback
    if (typeof window === 'undefined') return 'dark';
    
    try {
      const storedTheme = localStorage.getItem('surbee-theme') || 'system';
      if (storedTheme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return storedTheme as 'light' | 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve theme based on current setting
  const resolveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    return currentTheme === 'system' ? getSystemTheme() : currentTheme;
  };

  // Apply theme to DOM
  const applyTheme = (resolvedTheme: 'light' | 'dark') => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
    
    // Apply theme-specific styles to body
    document.body.style.backgroundColor = resolvedTheme === 'dark' ? '#1C1C1C' : '#FCFBF8';
    document.body.style.color = resolvedTheme === 'dark' ? '#fafafa' : '#0a0a0a';
  };

  // Set theme with persistence
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('surbee-theme', newTheme);
    
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  };

  // Initialize theme on mount
  useEffect(() => {
    // Get stored theme or default to system
    const storedTheme = localStorage.getItem('surbee-theme') as Theme;
    const initialTheme: Theme = storedTheme || 'system';
    
    // Only update state if different from current (prevents flash)
    if (initialTheme !== theme) {
      setThemeState(initialTheme);
    }
    
    const resolved = resolveTheme(initialTheme);
    if (resolved !== resolvedTheme) {
      setResolvedTheme(resolved);
    }
    
    // Apply theme (this will ensure consistency with the script)
    applyTheme(resolved);

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Update resolved theme when theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, [theme]);

  const value: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}