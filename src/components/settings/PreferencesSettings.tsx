"use client";

import React, { useState } from 'react';
import { Monitor, Sun, Moon, Globe, Type, Zap, Layout, Download, Upload, RotateCcw } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { languages, getLanguageName, getLanguageNativeName } from '@/lib/settings-manager';

const PreferencesSettings: React.FC = () => {
  const { 
    settings, 
    updatePreferences, 
    updateTheme, 
    updateLanguage, 
    exportSettings, 
    importSettings,
    resetAllSettings,
    showToast
  } = useSettings();

  const [isImporting, setIsImporting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateTheme(theme);
  };

  const handleLanguageChange = (language: 'en' | 'es' | 'fr' | 'de' | 'ja') => {
    updateLanguage(language);
  };

  const handleFontSizeChange = (fontSize: 'small' | 'medium' | 'large') => {
    updatePreferences({ fontSize });
    showToast(`Font size changed to ${fontSize}`);
  };

  const handleAnimationsToggle = () => {
    const newValue = !settings.preferences.animations;
    updatePreferences({ animations: newValue });
    showToast(`Animations ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleCompactModeToggle = () => {
    const newValue = !settings.preferences.compactMode;
    updatePreferences({ compactMode: newValue });
    showToast(`Compact mode ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      await importSettings(file);
      setFileInputKey(prev => prev + 1); // Reset file input
    } catch (error) {
      // Error handling is done in useSettings hook
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
      resetAllSettings();
    }
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'system': return <Monitor className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="settings-main">
      {/* Theme Section */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Appearance</div>
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Theme</div>
              <div className="settings-field-value">Choose how Surbee looks to you</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className="flex gap-2">
                {(['light', 'dark', 'system'] as const).map((theme) => (
                  <button
                    key={theme}
                    className={`settings-button ${settings.preferences.theme === theme ? 'active' : ''}`}
                    onClick={() => handleThemeChange(theme)}
                    style={{
                      backgroundColor: settings.preferences.theme === theme 
                        ? 'var(--surbee-accent-muted)' 
                        : 'var(--surbee-sidebar-bg)',
                      color: settings.preferences.theme === theme 
                        ? 'var(--surbee-fg-primary)' 
                        : 'var(--surbee-fg-secondary)',
                      borderColor: settings.preferences.theme === theme 
                        ? 'var(--surbee-border-primary)' 
                        : 'var(--surbee-border-secondary)',
                    }}
                  >
                    <div className="settings-button-content">
                      {getThemeIcon(theme)}
                      <div className="settings-button-text">
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </div>
                    </div>
                  </button>
                ))}\n              </div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Font Size</div>
              <div className="settings-field-value">Adjust the UI text size</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className="flex gap-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    className={`settings-button ${settings.preferences.fontSize === size ? 'active' : ''}`}
                    onClick={() => handleFontSizeChange(size)}
                    style={{
                      backgroundColor: settings.preferences.fontSize === size 
                        ? 'var(--surbee-accent-muted)' 
                        : 'var(--surbee-sidebar-bg)',
                      color: settings.preferences.fontSize === size 
                        ? 'var(--surbee-fg-primary)' 
                        : 'var(--surbee-fg-secondary)',
                      borderColor: settings.preferences.fontSize === size 
                        ? 'var(--surbee-border-primary)' 
                        : 'var(--surbee-border-secondary)',
                    }}
                  >
                    <div className="settings-button-content">
                      <Type className="w-4 h-4" />
                      <div className="settings-button-text">
                        {size.charAt(0).toUpperCase() + size.slice(1)}
                      </div>
                    </div>
                  </button>
                ))}\n              </div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Animations</div>
              <div className="settings-field-value">Enable smooth transitions and effects</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                onClick={handleAnimationsToggle}
                style={{
                  backgroundColor: settings.preferences.animations 
                    ? 'var(--surbee-accent-muted)' 
                    : 'var(--surbee-sidebar-bg)',
                  color: settings.preferences.animations 
                    ? 'var(--surbee-fg-primary)' 
                    : 'var(--surbee-fg-secondary)',
                  borderColor: settings.preferences.animations 
                    ? 'var(--surbee-border-primary)' 
                    : 'var(--surbee-border-secondary)',
                }}
              >
                <div className="settings-button-content">
                  <Zap className="w-4 h-4" />
                  <div className="settings-button-text">
                    {settings.preferences.animations ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Compact Mode</div>
              <div className="settings-field-value">Use less spacing for a denser interface</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                onClick={handleCompactModeToggle}
                style={{
                  backgroundColor: settings.preferences.compactMode 
                    ? 'var(--surbee-accent-muted)' 
                    : 'var(--surbee-sidebar-bg)',
                  color: settings.preferences.compactMode 
                    ? 'var(--surbee-fg-primary)' 
                    : 'var(--surbee-fg-secondary)',
                  borderColor: settings.preferences.compactMode 
                    ? 'var(--surbee-border-primary)' 
                    : 'var(--surbee-border-secondary)',
                }}
              >
                <div className="settings-button-content">
                  <Layout className="w-4 h-4" />
                  <div className="settings-button-text">
                    {settings.preferences.compactMode ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Language Section */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Language & Region</div>
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Display Language</div>
              <div className="settings-field-value">
                Currently: {getLanguageName(settings.preferences.language)} ({getLanguageNativeName(settings.preferences.language)})
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <select
                value={settings.preferences.language}
                onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'es' | 'fr' | 'de' | 'ja')}
                className="px-3 py-2 border rounded-md text-sm"
                style={{
                  backgroundColor: 'var(--surbee-sidebar-bg)',
                  borderColor: 'var(--surbee-border-secondary)',
                  color: 'var(--surbee-fg-primary)',
                }}
              >
                {Object.entries(languages).map(([code, info]) => (
                  <option key={code} value={code}>
                    {info.name} ({info.nativeName})
                  </option>
                ))}\n              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Management */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Settings Management</div>
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Export Settings</div>
              <div className="settings-field-value">Download your current settings as a backup file</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                onClick={exportSettings}
              >
                <div className="settings-button-content">
                  <Download className="w-4 h-4" />
                  <div className="settings-button-text">Export</div>
                </div>
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Import Settings</div>
              <div className="settings-field-value">Restore settings from a backup file</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <label className="settings-button cursor-pointer">
                <div className="settings-button-content">
                  <Upload className="w-4 h-4" />
                  <div className="settings-button-text">
                    {isImporting ? 'Importing...' : 'Import'}
                  </div>
                </div>
                <input
                  key={fileInputKey}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                  disabled={isImporting}
                />
              </label>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Reset All Settings</div>
              <div className="settings-field-value">Restore all settings to their default values</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                onClick={handleReset}
                style={{
                  backgroundColor: 'var(--surbee-sidebar-bg)',
                  borderColor: 'rgb(239 68 68)',
                  color: 'rgb(239 68 68)',
                }}
              >
                <div className="settings-button-content">
                  <RotateCcw className="w-4 h-4" />
                  <div className="settings-button-text">Reset</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSettings;