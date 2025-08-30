"use client";

import React from 'react';
import { useTheme } from '@/hooks/useTheme';
import { Theme } from '@/lib/theme/colors';
import { Monitor, Moon, Sun } from 'lucide-react';

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className = '' }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();

  const themes = [
    {
      key: 'system' as const,
      label: 'System',
      icon: Monitor,
      description: 'Use system preference',
    },
    {
      key: 'light' as const,
      label: 'Light',
      icon: Sun,
      description: 'Light mode',
    },
    {
      key: 'dark' as const,
      label: 'Dark',
      icon: Moon,
      description: 'Dark mode',
    },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <h3 className="text-[16px] font-medium text-theme-primary">Appearance</h3>
        <p className="text-[14px] text-theme-muted">
          Choose how Surbee looks to you. Select a single theme, or sync with your system.
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isSelected = theme === themeOption.key;
          
          return (
            <button
              key={themeOption.key}
              onClick={() => setTheme(themeOption.key)}
              className="relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all"
              style={{
                borderColor: isSelected ? 'var(--surbee-accent-primary)' : 'var(--surbee-border-primary)',
                backgroundColor: isSelected ? 'var(--surbee-accent-subtle)' : 'var(--surbee-card-bg)',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--surbee-card-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'var(--surbee-card-bg)';
                }
              }}
            >
              {/* Theme Preview */}
              <div className="w-full h-12 rounded-md border overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                {themeOption.key === 'light' && (
                  <div className="w-full h-full bg-gradient-to-br from-white to-gray-100 border border-gray-200">
                    <div className="h-3 bg-gray-50 border-b border-gray-200"></div>
                    <div className="p-2 space-y-1">
                      <div className="h-1.5 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                )}
                {themeOption.key === 'dark' && (
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black border border-gray-800">
                    <div className="h-3 bg-gray-800 border-b border-gray-700"></div>
                    <div className="p-2 space-y-1">
                      <div className="h-1.5 bg-gray-600 rounded w-3/4"></div>
                      <div className="h-1.5 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                )}
                {themeOption.key === 'system' && (
                  <div className="w-full h-full bg-gradient-to-r from-white via-gray-200 to-gray-900 border border-gray-300">
                    <div className="h-3 bg-gradient-to-r from-gray-50 to-gray-800 border-b border-gray-300"></div>
                    <div className="p-2 space-y-1">
                      <div className="h-1.5 bg-gradient-to-r from-gray-300 to-gray-600 rounded w-3/4"></div>
                      <div className="h-1.5 bg-gradient-to-r from-gray-200 to-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Icon */}
              <Icon className="w-4 h-4" style={{ color: 'var(--surbee-fg-secondary)' }} />
              
              {/* Label */}
              <span className="text-[12px] font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                {themeOption.label}
              </span>
              
              {/* Selection indicator */}
              {isSelected && (
                <div 
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--surbee-accent-primary)' }}
                ></div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="text-[12px] text-theme-muted">
        Changes will be saved automatically and applied across all your sessions.
      </div>
    </div>
  );
}