"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Shield, Zap, Eye, Globe, Brain, Settings2 } from 'lucide-react';
import { TierSlider } from './TierSlider';
import { CipherTier, CIPHER_CHECKS, CipherCheckId, getChecksForTier } from '@/lib/cipher/tier-config';

interface CipherSettings {
  enabled: boolean;
  tier: CipherTier;
  advancedMode: boolean;
  advancedChecks: Record<string, boolean>;
  sessionResume: boolean;
  resumeWindowHours: number;
  flagThreshold: number;
  blockThreshold: number;
}

interface CipherSettingsPanelProps {
  projectId: string;
  userId: string;
  onSettingsChange?: (settings: CipherSettings) => void;
}

const CHECK_CATEGORIES = {
  behavioral: {
    icon: Zap,
    label: 'Behavioral Analysis',
    description: 'Mouse, keyboard, and timing patterns',
  },
  device: {
    icon: Shield,
    label: 'Device & Automation',
    description: 'Bot and automation detection',
  },
  content: {
    icon: Eye,
    label: 'Content Analysis',
    description: 'Response quality and patterns',
  },
  network: {
    icon: Globe,
    label: 'Network & IP',
    description: 'VPN, proxy, and location checks',
  },
  ai: {
    icon: Brain,
    label: 'AI Detection',
    description: 'AI-generated content detection',
  },
};

export function CipherSettingsPanel({
  projectId,
  userId,
  onSettingsChange,
}: CipherSettingsPanelProps) {
  const [settings, setSettings] = useState<CipherSettings>({
    enabled: true,
    tier: 3,
    advancedMode: false,
    advancedChecks: {},
    sessionResume: true,
    resumeWindowHours: 48,
    flagThreshold: 0.6,
    blockThreshold: 0.85,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`/api/projects/${projectId}/settings?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          const cipher = data.settings?.cipher || {};
          setSettings({
            enabled: cipher.enabled ?? true,
            tier: cipher.tier ?? 3,
            advancedMode: cipher.advancedMode ?? false,
            advancedChecks: cipher.advancedChecks ?? {},
            sessionResume: cipher.sessionResume ?? true,
            resumeWindowHours: cipher.resumeWindowHours ?? 48,
            flagThreshold: cipher.flagThreshold ?? 0.6,
            blockThreshold: cipher.blockThreshold ?? 0.85,
          });
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [projectId, userId]);

  // Save settings
  const saveSettings = async (newSettings: CipherSettings) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          settings: {
            cipher: newSettings,
          },
        }),
      });

      if (res.ok) {
        onSettingsChange?.(newSettings);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (updates: Partial<CipherSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const toggleCheck = (checkId: CipherCheckId) => {
    const newAdvancedChecks = {
      ...settings.advancedChecks,
      [checkId]: !settings.advancedChecks[checkId],
    };
    updateSettings({ advancedChecks: newAdvancedChecks });
  };

  const isCheckEnabled = (checkId: CipherCheckId): boolean => {
    // In advanced mode, use explicit settings
    if (settings.advancedMode && checkId in settings.advancedChecks) {
      return settings.advancedChecks[checkId];
    }
    // Otherwise, check if it's enabled by the tier
    return getChecksForTier(settings.tier).includes(checkId);
  };

  const getChecksByCategory = () => {
    const categories: Record<string, CipherCheckId[]> = {
      behavioral: [],
      device: [],
      content: [],
      network: [],
      ai: [],
    };

    Object.entries(CIPHER_CHECKS).forEach(([id, check]) => {
      const checkId = id as CipherCheckId;
      if (['rapid_completion', 'uniform_timing', 'low_interaction', 'excessive_paste', 'pointer_spikes', 'robotic_typing', 'mouse_teleporting', 'no_corrections', 'hover_behavior', 'scroll_patterns', 'mouse_acceleration'].includes(id)) {
        categories.behavioral.push(checkId);
      } else if (['webdriver_detected', 'automation_detected', 'no_plugins', 'suspicious_user_agent', 'device_fingerprint_mismatch', 'screen_anomaly'].includes(id)) {
        categories.device.push(checkId);
      } else if (['straight_line_answers', 'minimal_effort', 'excessive_tab_switching', 'window_focus_loss', 'impossibly_fast', 'suspicious_pauses'].includes(id)) {
        categories.content.push(checkId);
      } else if (['vpn_detection', 'datacenter_ip', 'tor_detection', 'proxy_detection', 'timezone_validation'].includes(id)) {
        categories.network.push(checkId);
      } else {
        categories.ai.push(checkId);
      }
    });

    return categories;
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-zinc-800 rounded w-1/3" />
        <div className="h-20 bg-zinc-800 rounded" />
        <div className="h-40 bg-zinc-800 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-400" />
            Cipher Settings
          </h3>
          <p className="text-sm text-zinc-400">
            Configure fraud detection for this survey
          </p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-zinc-400">
            {settings.enabled ? 'Enabled' : 'Disabled'}
          </span>
          <div className="relative">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings({ enabled: e.target.checked })}
              className="sr-only"
            />
            <div className={`w-10 h-6 rounded-full transition-colors ${settings.enabled ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
          </div>
        </label>
      </div>

      {settings.enabled && (
        <>
          {/* Tier Slider */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <h4 className="text-sm font-medium text-white mb-4">Detection Level</h4>
            <TierSlider
              value={settings.tier}
              onChange={(tier) => updateSettings({ tier })}
              disabled={saving}
            />
          </div>

          {/* Session Settings */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <h4 className="text-sm font-medium text-white mb-4">Session Persistence</h4>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm text-white">Allow session resume</span>
                  <p className="text-xs text-zinc-400">
                    Let users continue incomplete surveys
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.sessionResume}
                    onChange={(e) => updateSettings({ sessionResume: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${settings.sessionResume ? 'bg-indigo-500' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.sessionResume ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
              </label>

              {settings.sessionResume && (
                <div>
                  <label className="text-sm text-zinc-400 block mb-2">
                    Resume window (hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.resumeWindowHours}
                    onChange={(e) => updateSettings({ resumeWindowHours: parseInt(e.target.value) || 48 })}
                    className="w-24 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Thresholds */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <h4 className="text-sm font-medium text-white mb-4">Risk Thresholds</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-zinc-400 block mb-2">
                  Flag threshold
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.flagThreshold * 100}
                    onChange={(e) => updateSettings({ flagThreshold: parseInt(e.target.value) / 100 })}
                    className="flex-1 h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-white w-12 text-right">
                    {Math.round(settings.flagThreshold * 100)}%
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Responses above this are flagged for review
                </p>
              </div>
              <div>
                <label className="text-sm text-zinc-400 block mb-2">
                  Block threshold
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.blockThreshold * 100}
                    onChange={(e) => updateSettings({ blockThreshold: parseInt(e.target.value) / 100 })}
                    className="flex-1 h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-white w-12 text-right">
                    {Math.round(settings.blockThreshold * 100)}%
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Responses above this are blocked
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Mode Toggle */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <button
              onClick={() => updateSettings({ advancedMode: !settings.advancedMode })}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-zinc-400" />
                <span className="text-sm font-medium text-white">Advanced Settings</span>
              </div>
              {settings.advancedMode ? (
                <ChevronUp className="w-4 h-4 text-zinc-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            {settings.advancedMode && (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-zinc-400">
                  Override tier defaults with custom check selections
                </p>

                {Object.entries(CHECK_CATEGORIES).map(([category, { icon: Icon, label, description }]) => {
                  const checks = getChecksByCategory()[category as keyof typeof CHECK_CATEGORIES];
                  const enabledCount = checks.filter(c => isCheckEnabled(c)).length;

                  return (
                    <div key={category} className="border border-zinc-800 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 text-indigo-400" />
                          <div className="text-left">
                            <div className="text-sm font-medium text-white">{label}</div>
                            <div className="text-xs text-zinc-500">{description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400">
                            {enabledCount}/{checks.length}
                          </span>
                          {expandedCategory === category ? (
                            <ChevronUp className="w-4 h-4 text-zinc-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                      </button>

                      {expandedCategory === category && (
                        <div className="border-t border-zinc-800 p-3 space-y-2">
                          {checks.map((checkId) => {
                            const check = CIPHER_CHECKS[checkId];
                            const enabled = isCheckEnabled(checkId);

                            return (
                              <label
                                key={checkId}
                                className="flex items-center justify-between p-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer"
                              >
                                <div>
                                  <div className="text-sm text-white">{check.name}</div>
                                  <div className="text-xs text-zinc-500">{check.description}</div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={enabled}
                                  onChange={() => toggleCheck(checkId)}
                                  className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                                />
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* Saving indicator */}
      {saving && (
        <div className="text-center text-sm text-zinc-400">
          Saving...
        </div>
      )}
    </div>
  );
}
