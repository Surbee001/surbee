"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Shield, Zap, Eye, Globe, Brain, Settings2, Users, Clock } from 'lucide-react';
import { TierSlider } from './TierSlider';
import { CipherTier, CIPHER_CHECKS, CipherCheckId, getChecksForTier } from '@/lib/cipher/tier-config';
import { useCredits } from '@/hooks/useCredits';

interface CipherSettings {
  enabled: boolean;
  tier: CipherTier;
  advancedMode: boolean;
  advancedChecks: Record<string, boolean>;
  sessionResume: boolean;
  resumeWindowHours: number;
  flagThreshold: number;
  blockThreshold: number;
  mlEnabled: boolean; // XGBoost ML fraud detection
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
  timing: {
    icon: Clock,
    label: 'Timing Analysis',
    description: 'Response speed and suspicious pauses',
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
  fraudRing: {
    icon: Users,
    label: 'Fraud Ring Detection',
    description: 'Coordinated fraud and collusion',
  },
};

// Convert plan string to TierSlider format
function getPlanType(plan: string): 'free' | 'pro' | 'max' {
  if (plan === 'surbee_max' || plan === 'surbee_enterprise' || plan === 'max' || plan === 'enterprise') {
    return 'max';
  }
  if (plan === 'surbee_pro' || plan === 'pro') {
    return 'pro';
  }
  return 'free';
}

export function CipherSettingsPanel({
  projectId,
  userId,
  onSettingsChange,
}: CipherSettingsPanelProps) {
  const { credits } = useCredits();
  const userPlan = getPlanType(credits?.plan || 'free_user');

  const [settings, setSettings] = useState<CipherSettings>({
    enabled: true,
    tier: 3,
    advancedMode: false,
    advancedChecks: {},
    sessionResume: true,
    resumeWindowHours: 48,
    flagThreshold: 0.6,
    blockThreshold: 0.85,
    mlEnabled: true, // ML fraud detection on by default
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
            mlEnabled: cipher.mlEnabled ?? true,
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
      timing: [],
      device: [],
      content: [],
      network: [],
      ai: [],
      fraudRing: [],
    };

    // Map checks to their categories based on tier-config
    const categoryMap: Record<string, keyof typeof categories> = {
      // Behavioral checks - mouse, keyboard, interaction patterns
      rapid_completion: 'behavioral',
      uniform_timing: 'behavioral',
      low_interaction: 'behavioral',
      excessive_paste: 'behavioral',
      pointer_spikes: 'behavioral',
      robotic_typing: 'behavioral',
      mouse_teleporting: 'behavioral',
      no_corrections: 'behavioral',
      hover_behavior: 'behavioral',
      scroll_patterns: 'behavioral',
      mouse_acceleration: 'behavioral',

      // Timing checks
      impossibly_fast: 'timing',
      suspicious_pauses: 'timing',

      // Device & Automation checks
      webdriver_detected: 'device',
      automation_detected: 'device',
      no_plugins: 'device',
      suspicious_user_agent: 'device',
      device_fingerprint_mismatch: 'device',
      screen_anomaly: 'device',

      // Content Analysis
      straight_line_answers: 'content',
      minimal_effort: 'content',
      excessive_tab_switching: 'content',
      window_focus_loss: 'content',

      // Network checks
      vpn_detection: 'network',
      datacenter_ip: 'network',
      tor_detection: 'network',
      proxy_detection: 'network',
      timezone_validation: 'network',

      // AI Detection
      ai_content_basic: 'ai',
      ai_content_full: 'ai',
      contradiction_basic: 'ai',
      contradiction_full: 'ai',
      plagiarism_basic: 'ai',
      plagiarism_full: 'ai',
      quality_assessment: 'ai',
      semantic_analysis: 'ai',
      perplexity_analysis: 'ai',
      burstiness_analysis: 'ai',
      baseline_deviation: 'ai',

      // Fraud Ring Detection (Tier 5)
      fraud_ring_detection: 'fraudRing',
      answer_sharing: 'fraudRing',
      coordinated_timing: 'fraudRing',
      device_sharing: 'fraudRing',
    };

    Object.keys(CIPHER_CHECKS).forEach((id) => {
      const checkId = id as CipherCheckId;
      const category = categoryMap[id] || 'ai'; // Default to AI if not mapped
      categories[category].push(checkId);
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
              userPlan={userPlan}
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

          {/* ML Detection Toggle */}
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">ML Fraud Detection</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    XGBoost model trained on 1M responses. Analyzes 75 behavioral
                    signals in &lt;4ms per response.
                  </p>
                </div>
              </div>
              <label className="flex items-center cursor-pointer ml-4">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.mlEnabled}
                    onChange={(e) => updateSettings({ mlEnabled: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${settings.mlEnabled ? 'bg-emerald-500' : 'bg-zinc-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.mlEnabled ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </div>
              </label>
            </div>
            {settings.mlEnabled && (
              <div className="mt-3 ml-11 text-xs text-zinc-500">
                Combined with rule-based checks for maximum accuracy. Uses the higher risk score.
              </div>
            )}
          </div>

          {/* Explainability Info */}
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800/50">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-1">Explainability Engine</h4>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  For Tier 4+ assessments, Cipher provides human-readable explanations including
                  key risk factors, mitigating factors, and actionable recommendations.
                  These appear in your response analytics.
                </p>
              </div>
            </div>
          </div>

          {/* Check count summary */}
          <div className="text-center">
            <p className="text-xs text-zinc-500">
              {Object.values(CIPHER_CHECKS).length} fraud detection checks available across 7 categories
            </p>
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
