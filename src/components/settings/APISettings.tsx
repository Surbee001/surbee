"use client";

import React, { useState } from 'react';
import { 
  Key, 
  Copy, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  BarChart3,
  Webhook,
  Calendar,
  Activity,
  Bell,
  ExternalLink
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { formatDate, formatUsagePercentage, getUsageColor } from '@/lib/settings-manager';

const APISettings: React.FC = () => {
  const { 
    settings, 
    updateAPI,
    generateNewAPIKey,
    copyAPIKey,
    revokeAPIKey,
    getAPIUsagePercentage,
    isAPIUsageHigh,
    showToast
  } = useSettings();

  const [newKeyName, setNewKeyName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [webhookUrl, setWebhookUrl] = useState(settings.api.webhookUrl);

  const handleGenerateKey = async () => {
    if (!newKeyName.trim()) {
      showToast('Please enter a name for the API key', 'error');
      return;
    }

    setIsGenerating(true);
    try {
      generateNewAPIKey(newKeyName);
      setNewKeyName('');
    } catch (error) {
      // Error handling is done in useSettings hook
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyKey = async (key: string) => {
    await copyAPIKey(key);
  };

  const handleRevokeKey = (keyId: string, keyName: string) => {
    if (window.confirm(`Are you sure you want to revoke the API key "${keyName}"? This action cannot be undone.`)) {
      revokeAPIKey(keyId);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(keyId)) {
      newVisibleKeys.delete(keyId);
    } else {
      newVisibleKeys.add(keyId);
    }
    setVisibleKeys(newVisibleKeys);
  };

  const handleWebhookUrlUpdate = () => {
    updateAPI({ webhookUrl });
    showToast('Webhook URL updated successfully');
  };

  const handleRateLimitNotificationsToggle = () => {
    const newValue = !settings.api.rateLimitNotifications;
    updateAPI({ rateLimitNotifications: newValue });
    showToast(`Rate limit notifications ${newValue ? 'enabled' : 'disabled'}`);
  };

  const maskAPIKey = (key: string): string => {
    if (key.length <= 8) return key;
    const prefix = key.substring(0, 8);
    const suffix = key.substring(key.length - 4);
    return `${prefix}${'*'.repeat(Math.min(20, key.length - 12))}${suffix}`;
  };

  const usagePercentage = getAPIUsagePercentage();
  const usageColor = getUsageColor(
    settings.api.usageStatistics.currentMonth, 
    settings.api.usageStatistics.limit
  );

  return (
    <div className="settings-main">
      {/* API Keys Management */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">API Keys</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Key name (e.g., Production App)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
                style={{
                  backgroundColor: 'var(--surbee-sidebar-bg)',
                  borderColor: 'var(--surbee-border-secondary)',
                  color: 'var(--surbee-fg-primary)',
                  minWidth: '200px',
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerateKey()}
              />
              <button
                className="settings-button"
                onClick={handleGenerateKey}
                disabled={isGenerating || !newKeyName.trim()}
                style={{
                  backgroundColor: 'var(--surbee-accent-muted)',
                  borderColor: 'var(--surbee-border-primary)',
                  color: 'var(--surbee-fg-primary)',
                  opacity: isGenerating || !newKeyName.trim() ? 0.6 : 1,
                }}
              >
                <div className="settings-button-content">
                  <Plus className="w-4 h-4" />
                  <div className="settings-button-text">
                    {isGenerating ? 'Generating...' : 'Generate Key'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="settings-content">
          {settings.api.keys.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--surbee-fg-muted)' }}>
              <Key className="w-8 h-8 mx-auto mb-2" />
              <div className="settings-field-label">No API keys yet</div>
              <div className="settings-field-value">Generate your first API key to get started</div>
            </div>
          ) : (
            settings.api.keys.map((apiKey) => (
              <div key={apiKey.id} className="settings-row" style={{ padding: '16px', backgroundColor: 'var(--surbee-bg-secondary)', borderRadius: '8px', marginBottom: '12px' }}>
                <div className="settings-field-info flex-1">
                  <div className="flex items-center gap-2">
                    <div className="settings-field-label">{apiKey.name}</div>
                    {!apiKey.isActive && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-600">
                        Revoked
                      </span>
                    )}
                  </div>
                  <div className="settings-field-value">
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm font-mono px-2 py-1 rounded" 
                            style={{ backgroundColor: 'var(--surbee-bg-tertiary)' }}>
                        {visibleKeys.has(apiKey.id) ? apiKey.key : maskAPIKey(apiKey.key)}
                      </code>
                    </div>
                    <div className="mt-2 text-xs">
                      Created: {formatDate(apiKey.createdAt)}
                      {apiKey.lastUsed && ` • Last used: ${formatDate(apiKey.lastUsed)}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" style={{ marginLeft: 'auto' }}>
                  <button
                    className="settings-button"
                    onClick={() => toggleKeyVisibility(apiKey.id)}
                    title={visibleKeys.has(apiKey.id) ? 'Hide key' : 'Show key'}
                  >
                    {visibleKeys.has(apiKey.id) ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    className="settings-button"
                    onClick={() => handleCopyKey(apiKey.key)}
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    className="settings-button"
                    onClick={() => handleRevokeKey(apiKey.id, apiKey.name)}
                    title="Revoke key"
                    style={{
                      borderColor: 'rgb(239 68 68)',
                      color: 'rgb(239 68 68)',
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Usage Statistics</div>
              {isAPIUsageHigh() && (
                <AlertTriangle className="w-4 h-4 text-yellow-500" title="High usage warning" />
              )}
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">API Calls This Month</div>
              <div className="settings-field-value">
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span>{settings.api.usageStatistics.currentMonth.toLocaleString()}</span>
                      <span>{settings.api.usageStatistics.limit.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${Math.min(100, usagePercentage)}%`,
                          backgroundColor: usagePercentage >= 90 ? '#ef4444' : usagePercentage >= 75 ? '#f59e0b' : '#10b981'
                        }}
                      />
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${usageColor}`}>
                    {usagePercentage}%
                  </span>
                </div>
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="settings-button">
                <div className="settings-button-content">
                  <BarChart3 className="w-4 h-4" />
                  <div className="settings-button-text">View Details</div>
                </div>
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Rate Limit Notifications</div>
              <div className="settings-field-value">Get notified when approaching API limits</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                onClick={handleRateLimitNotificationsToggle}
                style={{
                  backgroundColor: settings.api.rateLimitNotifications 
                    ? 'var(--surbee-accent-muted)' 
                    : 'var(--surbee-sidebar-bg)',
                  color: settings.api.rateLimitNotifications 
                    ? 'var(--surbee-fg-primary)' 
                    : 'var(--surbee-fg-secondary)',
                  borderColor: settings.api.rateLimitNotifications 
                    ? 'var(--surbee-border-primary)' 
                    : 'var(--surbee-border-secondary)',
                }}
              >
                <div className="settings-button-content">
                  <Bell className="w-4 h-4" />
                  <div className="settings-button-text">
                    {settings.api.rateLimitNotifications ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Webhooks</div>
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Webhook URL</div>
              <div className="settings-field-value">
                Receive real-time notifications about API events
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className="flex items-center gap-3">
                <input
                  type="url"
                  placeholder="https://your-app.com/webhook"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm"
                  style={{
                    backgroundColor: 'var(--surbee-sidebar-bg)',
                    borderColor: 'var(--surbee-border-secondary)',
                    color: 'var(--surbee-fg-primary)',
                    minWidth: '250px',
                  }}
                />
                {webhookUrl !== settings.api.webhookUrl && (
                  <button
                    className="settings-button"
                    onClick={handleWebhookUrlUpdate}
                    style={{
                      backgroundColor: 'var(--surbee-accent-muted)',
                      borderColor: 'var(--surbee-border-primary)',
                      color: 'var(--surbee-fg-primary)',
                    }}
                  >
                    <div className="settings-button-content">
                      <div className="settings-button-text">Update</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Webhook Events</div>
              <div className="settings-field-value">Configure which events trigger webhook calls</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button className="settings-button">
                <div className="settings-button-content">
                  <Webhook className="w-4 h-4" />
                  <div className="settings-button-text">Configure Events</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Documentation */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Documentation & Support</div>
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">API Documentation</div>
              <div className="settings-field-value">Complete guide to using the Surbee API</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <a 
                href="https://docs.surbee.com/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="settings-button"
                style={{ textDecoration: 'none', display: 'inline-flex' }}
              >
                <div className="settings-button-content">
                  <ExternalLink className="w-4 h-4" />
                  <div className="settings-button-text">View Docs</div>
                </div>
              </a>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Status Page</div>
              <div className="settings-field-value">Check API status and recent incidents</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <a 
                href="https://status.surbee.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="settings-button"
                style={{ textDecoration: 'none', display: 'inline-flex' }}
              >
                <div className="settings-button-content">
                  <Activity className="w-4 h-4" />
                  <div className="settings-button-text">View Status</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APISettings;