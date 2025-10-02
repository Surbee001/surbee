"use client";

import React, { useState } from 'react';
import { 
  Sparkles, 
  Zap, 
  Grid3X3, 
  List, 
  Square, 
  Plus, 
  Trash2, 
  Edit3,
  Save,
  X,
  Keyboard,
  FileText,
  LayoutGrid
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { formatShortcut, isShortcutConflict } from '@/lib/settings-manager';

const PersonalizationSettings: React.FC = () => {
  const { 
    settings, 
    updatePersonalization,
    showToast
  } = useSettings();

  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [newShortcutValue, setNewShortcutValue] = useState('');
  const [newShortcutName, setNewShortcutName] = useState('');
  const [isAddingShortcut, setIsAddingShortcut] = useState(false);

  const handleAIStyleChange = (style: 'professional' | 'casual' | 'creative') => {
    updatePersonalization({ aiStyle: style });
    showToast(`AI style changed to ${style}`);
  };

  const handleResponseLengthChange = (length: 'brief' | 'detailed' | 'comprehensive') => {
    updatePersonalization({ responseLength: length });
    showToast(`Response length changed to ${length}`);
  };

  const handleAutoSuggestionsToggle = () => {
    const newValue = !settings.personalization.autoSuggestions;
    updatePersonalization({ autoSuggestions: newValue });
    showToast(`Auto-suggestions ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleDashboardLayoutChange = (layout: 'grid' | 'list' | 'card') => {
    updatePersonalization({ dashboardLayout: layout });
    showToast(`Dashboard layout changed to ${layout}`);
  };

  const handleDefaultTemplateChange = (template: string) => {
    updatePersonalization({ defaultTemplate: template });
    showToast(`Default template changed to ${template}`);
  };

  const handleShortcutEdit = (key: string) => {
    setEditingShortcut(key);
    setNewShortcutValue(settings.personalization.shortcuts[key] || '');
  };

  const handleShortcutSave = (key: string) => {
    if (!newShortcutValue.trim()) {
      showToast('Shortcut cannot be empty', 'error');
      return;
    }

    const existingShortcuts = { ...settings.personalization.shortcuts };
    delete existingShortcuts[key];

    if (isShortcutConflict(newShortcutValue, existingShortcuts)) {
      showToast('This shortcut is already in use', 'error');
      return;
    }

    const updatedShortcuts = {
      ...settings.personalization.shortcuts,
      [key]: newShortcutValue,
    };

    updatePersonalization({ shortcuts: updatedShortcuts });
    setEditingShortcut(null);
    setNewShortcutValue('');
    showToast('Shortcut updated successfully');
  };

  const handleShortcutCancel = () => {
    setEditingShortcut(null);
    setNewShortcutValue('');
  };

  const handleShortcutDelete = (key: string) => {
    const updatedShortcuts = { ...settings.personalization.shortcuts };
    delete updatedShortcuts[key];
    updatePersonalization({ shortcuts: updatedShortcuts });
    showToast('Shortcut deleted successfully');
  };

  const handleAddNewShortcut = () => {
    if (!newShortcutName.trim() || !newShortcutValue.trim()) {
      showToast('Please fill in both name and shortcut', 'error');
      return;
    }

    const key = newShortcutName.toLowerCase().replace(/\s+/g, '-');
    
    if (settings.personalization.shortcuts[key]) {
      showToast('A shortcut with this name already exists', 'error');
      return;
    }

    if (isShortcutConflict(newShortcutValue, settings.personalization.shortcuts)) {
      showToast('This shortcut is already in use', 'error');
      return;
    }

    const updatedShortcuts = {
      ...settings.personalization.shortcuts,
      [key]: newShortcutValue,
    };

    updatePersonalization({ shortcuts: updatedShortcuts });
    setIsAddingShortcut(false);
    setNewShortcutName('');
    setNewShortcutValue('');
    showToast('Shortcut added successfully');
  };

  const templates = [
    { id: 'blank', name: 'Blank Project' },
    { id: 'survey', name: 'Survey Template' },
    { id: 'landing', name: 'Landing Page' },
    { id: 'dashboard', name: 'Analytics Dashboard' },
    { id: 'blog', name: 'Blog Template' },
    { id: 'portfolio', name: 'Portfolio Site' },
  ];

  const getLayoutIcon = (layout: string) => {
    switch (layout) {
      case 'grid': return <Grid3X3 className="w-4 h-4" />;
      case 'list': return <List className="w-4 h-4" />;
      case 'card': return <Square className="w-4 h-4" />;
      default: return <Grid3X3 className="w-4 h-4" />;
    }
  };

  return (
    <div className="settings-main">
      {/* AI Assistant Preferences */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">AI Assistant</div>
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Response Style</div>
              <div className="settings-field-value">How the AI responds to your requests</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className="flex gap-2">
                {(['professional', 'casual', 'creative'] as const).map((style) => (
                  <button
                    key={style}
                    className={`settings-button ${settings.personalization.aiStyle === style ? 'active' : ''}`}
                    onClick={() => handleAIStyleChange(style)}
                    style={{
                      backgroundColor: settings.personalization.aiStyle === style 
                        ? 'var(--surbee-accent-muted)' 
                        : 'var(--surbee-sidebar-bg)',
                      color: settings.personalization.aiStyle === style 
                        ? 'var(--surbee-fg-primary)' 
                        : 'var(--surbee-fg-secondary)',
                      borderColor: settings.personalization.aiStyle === style 
                        ? 'var(--surbee-border-primary)' 
                        : 'var(--surbee-border-secondary)',
                    }}
                  >
                    <div className="settings-button-content">
                      <Sparkles className="w-4 h-4" />
                      <div className="settings-button-text">
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Response Length</div>
              <div className="settings-field-value">Preferred length of AI responses</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className="flex gap-2">
                {(['brief', 'detailed', 'comprehensive'] as const).map((length) => (
                  <button
                    key={length}
                    className={`settings-button ${settings.personalization.responseLength === length ? 'active' : ''}`}
                    onClick={() => handleResponseLengthChange(length)}
                    style={{
                      backgroundColor: settings.personalization.responseLength === length 
                        ? 'var(--surbee-accent-muted)' 
                        : 'var(--surbee-sidebar-bg)',
                      color: settings.personalization.responseLength === length 
                        ? 'var(--surbee-fg-primary)' 
                        : 'var(--surbee-fg-secondary)',
                      borderColor: settings.personalization.responseLength === length 
                        ? 'var(--surbee-border-primary)' 
                        : 'var(--surbee-border-secondary)',
                    }}
                  >
                    <div className="settings-button-content">
                      <div className="settings-button-text">
                        {length.charAt(0).toUpperCase() + length.slice(1)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Auto-suggestions</div>
              <div className="settings-field-value">Show contextual suggestions while working</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                onClick={handleAutoSuggestionsToggle}
                style={{
                  backgroundColor: settings.personalization.autoSuggestions 
                    ? 'var(--surbee-accent-muted)' 
                    : 'var(--surbee-sidebar-bg)',
                  color: settings.personalization.autoSuggestions 
                    ? 'var(--surbee-fg-primary)' 
                    : 'var(--surbee-fg-secondary)',
                  borderColor: settings.personalization.autoSuggestions 
                    ? 'var(--surbee-border-primary)' 
                    : 'var(--surbee-border-secondary)',
                }}
              >
                <div className="settings-button-content">
                  <Zap className="w-4 h-4" />
                  <div className="settings-button-text">
                    {settings.personalization.autoSuggestions ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace Preferences */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Workspace</div>
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Dashboard Layout</div>
              <div className="settings-field-value">How projects are displayed on your dashboard</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className="flex gap-2">
                {(['grid', 'list', 'card'] as const).map((layout) => (
                  <button
                    key={layout}
                    className={`settings-button ${settings.personalization.dashboardLayout === layout ? 'active' : ''}`}
                    onClick={() => handleDashboardLayoutChange(layout)}
                    style={{
                      backgroundColor: settings.personalization.dashboardLayout === layout 
                        ? 'var(--surbee-accent-muted)' 
                        : 'var(--surbee-sidebar-bg)',
                      color: settings.personalization.dashboardLayout === layout 
                        ? 'var(--surbee-fg-primary)' 
                        : 'var(--surbee-fg-secondary)',
                      borderColor: settings.personalization.dashboardLayout === layout 
                        ? 'var(--surbee-border-primary)' 
                        : 'var(--surbee-border-secondary)',
                    }}
                  >
                    <div className="settings-button-content">
                      {getLayoutIcon(layout)}
                      <div className="settings-button-text">
                        {layout.charAt(0).toUpperCase() + layout.slice(1)}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Default Project Template</div>
              <div className="settings-field-value">Template to use when creating new projects</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <select
                value={settings.personalization.defaultTemplate}
                onChange={(e) => handleDefaultTemplateChange(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
                style={{
                  backgroundColor: 'var(--surbee-sidebar-bg)',
                  borderColor: 'var(--surbee-border-secondary)',
                  color: 'var(--surbee-fg-primary)',
                }}
              >
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Keyboard Shortcuts</div>
            </div>
            <button
              className="settings-button"
              onClick={() => setIsAddingShortcut(true)}
              disabled={isAddingShortcut}
            >
              <div className="settings-button-content">
                <Plus className="w-4 h-4" />
                <div className="settings-button-text">Add Shortcut</div>
              </div>
            </button>
          </div>
        </div>
        <div className="settings-content">
          {/* Add new shortcut form */}
          {isAddingShortcut && (
            <div className="settings-row" style={{ padding: '16px', backgroundColor: 'var(--surbee-bg-secondary)', borderRadius: '8px' }}>
              <div className="flex gap-3 items-center w-full">
                <input
                  type="text"
                  placeholder="Shortcut name"
                  value={newShortcutName}
                  onChange={(e) => setNewShortcutName(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm flex-1"
                  style={{
                    backgroundColor: 'var(--surbee-sidebar-bg)',
                    borderColor: 'var(--surbee-border-secondary)',
                    color: 'var(--surbee-fg-primary)',
                  }}
                />
                <input
                  type="text"
                  placeholder="e.g., Ctrl+K"
                  value={newShortcutValue}
                  onChange={(e) => setNewShortcutValue(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm flex-1"
                  style={{
                    backgroundColor: 'var(--surbee-sidebar-bg)',
                    borderColor: 'var(--surbee-border-secondary)',
                    color: 'var(--surbee-fg-primary)',
                  }}
                />
                <div className="flex gap-2">
                  <button
                    className="settings-button"
                    onClick={handleAddNewShortcut}
                    style={{
                      backgroundColor: 'var(--surbee-accent-muted)',
                      borderColor: 'var(--surbee-border-primary)',
                      color: 'var(--surbee-fg-primary)',
                    }}
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    className="settings-button"
                    onClick={() => {
                      setIsAddingShortcut(false);
                      setNewShortcutName('');
                      setNewShortcutValue('');
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Existing shortcuts */}
          {Object.entries(settings.personalization.shortcuts).map(([key, shortcut]) => (
            <div key={key} className="settings-row">
              <div className="settings-field-info">
                <div className="settings-field-label">
                  {key.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </div>
                <div className="settings-field-value">
                  {editingShortcut === key ? (
                    <input
                      type="text"
                      value={newShortcutValue}
                      onChange={(e) => setNewShortcutValue(e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                      style={{
                        backgroundColor: 'var(--surbee-sidebar-bg)',
                        borderColor: 'var(--surbee-border-secondary)',
                        color: 'var(--surbee-fg-primary)',
                      }}
                      autoFocus
                    />
                  ) : (
                    <span className="font-mono text-sm px-2 py-1 rounded" 
                          style={{ backgroundColor: 'var(--surbee-bg-secondary)' }}>
                      {formatShortcut(shortcut)}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div className="flex gap-2">
                  {editingShortcut === key ? (
                    <>
                      <button
                        className="settings-button"
                        onClick={() => handleShortcutSave(key)}
                        style={{
                          backgroundColor: 'var(--surbee-accent-muted)',
                          borderColor: 'var(--surbee-border-primary)',
                          color: 'var(--surbee-fg-primary)',
                        }}
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        className="settings-button"
                        onClick={handleShortcutCancel}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="settings-button"
                        onClick={() => handleShortcutEdit(key)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        className="settings-button"
                        onClick={() => handleShortcutDelete(key)}
                        style={{
                          borderColor: 'rgb(239 68 68)',
                          color: 'rgb(239 68 68)',
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalizationSettings;