/**
 * Cipher Tier Configuration
 *
 * Defines the 5-tier accuracy system for fraud detection.
 * Each tier adds progressively more checks and AI analysis.
 */

export type CipherTier = 1 | 2 | 3 | 4 | 5;

export interface TierConfig {
  name: string;
  description: string;
  checks: {
    behavioral: string[];
    timing: string[];
    device: string[];
    content: string[];
    network: string[];
    ai: string[];
  };
  aiModel: 'gpt-4o-mini' | 'gpt-4o' | null;
  periodicAnalysis: boolean;
  periodicInterval: number; // questions between periodic checks
  estimatedCostPerResponse: number; // in USD
}

/**
 * Check definitions with descriptions
 */
export const CIPHER_CHECKS = {
  // Behavioral checks
  rapid_completion: {
    name: 'Rapid Completion',
    description: 'Detects impossibly fast survey completion',
    tier: 1
  },
  uniform_timing: {
    name: 'Uniform Timing',
    description: 'Detects robotic consistent response times',
    tier: 1
  },
  low_interaction: {
    name: 'Low Interaction',
    description: 'Detects minimal mouse/keyboard activity',
    tier: 1
  },
  straight_line_answers: {
    name: 'Straight-Lining',
    description: 'Detects selecting same option repeatedly',
    tier: 1
  },
  impossibly_fast: {
    name: 'Speed Reading',
    description: 'Detects reading faster than humanly possible',
    tier: 1
  },
  minimal_effort: {
    name: 'Minimal Effort',
    description: 'Detects very short or low-quality responses',
    tier: 1
  },

  // Device/Automation checks (Tier 2)
  excessive_paste: {
    name: 'Excessive Paste',
    description: 'Detects heavy copy-paste behavior',
    tier: 2
  },
  pointer_spikes: {
    name: 'Pointer Velocity Spikes',
    description: 'Detects unnatural mouse movement patterns',
    tier: 2
  },
  webdriver_detected: {
    name: 'WebDriver Detection',
    description: 'Detects Selenium/automation tools',
    tier: 2
  },
  automation_detected: {
    name: 'Automation Detection',
    description: 'Detects headless browsers and bots',
    tier: 2
  },
  no_plugins: {
    name: 'Missing Plugins',
    description: 'Detects suspicious browser configurations',
    tier: 2
  },
  suspicious_user_agent: {
    name: 'Suspicious User Agent',
    description: 'Detects bot-like user agent strings',
    tier: 2
  },
  device_fingerprint_mismatch: {
    name: 'Device Mismatch',
    description: 'Detects inconsistent device characteristics',
    tier: 2
  },
  screen_anomaly: {
    name: 'Screen Anomaly',
    description: 'Detects impossible screen dimensions',
    tier: 2
  },
  suspicious_pauses: {
    name: 'Suspicious Pauses',
    description: 'Detects unusual gaps in activity',
    tier: 2
  },

  // Enhanced behavioral (Tier 3)
  robotic_typing: {
    name: 'Robotic Typing',
    description: 'Detects uniform keystroke timing',
    tier: 3
  },
  mouse_teleporting: {
    name: 'Mouse Teleporting',
    description: 'Detects large instant mouse jumps',
    tier: 3
  },
  no_corrections: {
    name: 'No Corrections',
    description: 'Detects perfect typing with no backspaces',
    tier: 3
  },
  excessive_tab_switching: {
    name: 'Tab Switching',
    description: 'Detects frequent tab/window changes',
    tier: 3
  },
  window_focus_loss: {
    name: 'Focus Loss',
    description: 'Detects extended periods away from survey',
    tier: 3
  },
  ai_content_basic: {
    name: 'AI Content (Basic)',
    description: 'Light AI-generated text detection',
    tier: 3
  },
  contradiction_basic: {
    name: 'Contradiction (Basic)',
    description: 'Basic response consistency check',
    tier: 3
  },

  // Advanced behavioral (Tier 4)
  hover_behavior: {
    name: 'Hover Patterns',
    description: 'Analyzes mouse hover behavior before clicks',
    tier: 4
  },
  scroll_patterns: {
    name: 'Scroll Patterns',
    description: 'Analyzes reading/scrolling behavior',
    tier: 4
  },
  mouse_acceleration: {
    name: 'Mouse Acceleration',
    description: 'Analyzes natural mouse acceleration',
    tier: 4
  },
  vpn_detection: {
    name: 'VPN Detection',
    description: 'Detects VPN/proxy usage',
    tier: 4
  },
  datacenter_ip: {
    name: 'Datacenter IP',
    description: 'Detects cloud/datacenter IPs',
    tier: 4
  },
  plagiarism_basic: {
    name: 'Plagiarism (Basic)',
    description: 'Quick web search for copied content',
    tier: 4
  },
  quality_assessment: {
    name: 'Quality Assessment',
    description: 'AI assessment of response quality',
    tier: 4
  },
  semantic_analysis: {
    name: 'Semantic Analysis',
    description: 'AI analysis of response meaning',
    tier: 4
  },

  // Maximum checks (Tier 5)
  ai_content_full: {
    name: 'AI Content (Full)',
    description: 'Comprehensive AI-generated text detection',
    tier: 5
  },
  contradiction_full: {
    name: 'Contradiction (Full)',
    description: 'Deep semantic contradiction analysis',
    tier: 5
  },
  plagiarism_full: {
    name: 'Plagiarism (Full)',
    description: 'Comprehensive plagiarism detection',
    tier: 5
  },
  fraud_ring_detection: {
    name: 'Fraud Ring',
    description: 'Detects coordinated fraud attempts',
    tier: 5
  },
  answer_sharing: {
    name: 'Answer Sharing',
    description: 'Detects identical answers across respondents',
    tier: 5
  },
  coordinated_timing: {
    name: 'Coordinated Timing',
    description: 'Detects synchronized submissions',
    tier: 5
  },
  device_sharing: {
    name: 'Device Sharing',
    description: 'Detects same device across respondents',
    tier: 5
  },
  tor_detection: {
    name: 'Tor Detection',
    description: 'Detects Tor exit node IPs',
    tier: 5
  },
  proxy_detection: {
    name: 'Proxy Detection',
    description: 'Detects proxy server usage',
    tier: 5
  },
  timezone_validation: {
    name: 'Timezone Validation',
    description: 'Validates timezone consistency',
    tier: 5
  },
  baseline_deviation: {
    name: 'Baseline Deviation',
    description: 'Compares against established behavioral baseline',
    tier: 5
  },
  perplexity_analysis: {
    name: 'Perplexity Analysis',
    description: 'Statistical text predictability analysis',
    tier: 5
  },
  burstiness_analysis: {
    name: 'Burstiness Analysis',
    description: 'Sentence length variation analysis',
    tier: 5
  },
} as const;

export type CipherCheckId = keyof typeof CIPHER_CHECKS;

/**
 * Tier configurations
 */
export const CIPHER_TIERS: Record<CipherTier, TierConfig> = {
  1: {
    name: 'Basic',
    description: 'Essential fraud detection with behavioral heuristics. Free, no AI costs.',
    checks: {
      behavioral: ['rapid_completion', 'uniform_timing', 'low_interaction'],
      timing: ['impossibly_fast'],
      device: [],
      content: ['straight_line_answers', 'minimal_effort'],
      network: [],
      ai: [],
    },
    aiModel: null,
    periodicAnalysis: false,
    periodicInterval: 0,
    estimatedCostPerResponse: 0,
  },
  2: {
    name: 'Standard',
    description: 'Adds device fingerprinting and automation detection. Still free.',
    checks: {
      behavioral: ['rapid_completion', 'uniform_timing', 'low_interaction', 'excessive_paste', 'pointer_spikes'],
      timing: ['impossibly_fast', 'suspicious_pauses'],
      device: ['webdriver_detected', 'automation_detected', 'no_plugins', 'suspicious_user_agent', 'device_fingerprint_mismatch', 'screen_anomaly'],
      content: ['straight_line_answers', 'minimal_effort'],
      network: [],
      ai: [],
    },
    aiModel: null,
    periodicAnalysis: false,
    periodicInterval: 0,
    estimatedCostPerResponse: 0,
  },
  3: {
    name: 'Enhanced',
    description: 'Adds light AI analysis for content quality. ~$0.002 per response.',
    checks: {
      behavioral: ['rapid_completion', 'uniform_timing', 'low_interaction', 'excessive_paste', 'pointer_spikes', 'robotic_typing', 'mouse_teleporting', 'no_corrections'],
      timing: ['impossibly_fast', 'suspicious_pauses'],
      device: ['webdriver_detected', 'automation_detected', 'no_plugins', 'suspicious_user_agent', 'device_fingerprint_mismatch', 'screen_anomaly'],
      content: ['straight_line_answers', 'minimal_effort', 'excessive_tab_switching', 'window_focus_loss'],
      network: [],
      ai: ['ai_content_basic', 'contradiction_basic'],
    },
    aiModel: 'gpt-4o-mini',
    periodicAnalysis: false,
    periodicInterval: 0,
    estimatedCostPerResponse: 0.002,
  },
  4: {
    name: 'Advanced',
    description: 'Full behavioral analysis + IP reputation. ~$0.01 per response.',
    checks: {
      behavioral: ['rapid_completion', 'uniform_timing', 'low_interaction', 'excessive_paste', 'pointer_spikes', 'robotic_typing', 'mouse_teleporting', 'no_corrections', 'hover_behavior', 'scroll_patterns', 'mouse_acceleration'],
      timing: ['impossibly_fast', 'suspicious_pauses'],
      device: ['webdriver_detected', 'automation_detected', 'no_plugins', 'suspicious_user_agent', 'device_fingerprint_mismatch', 'screen_anomaly'],
      content: ['straight_line_answers', 'minimal_effort', 'excessive_tab_switching', 'window_focus_loss'],
      network: ['vpn_detection', 'datacenter_ip'],
      ai: ['ai_content_basic', 'contradiction_basic', 'plagiarism_basic', 'quality_assessment', 'semantic_analysis'],
    },
    aiModel: 'gpt-4o-mini',
    periodicAnalysis: true,
    periodicInterval: 5, // Every 5 questions
    estimatedCostPerResponse: 0.01,
  },
  5: {
    name: 'Maximum',
    description: 'All 60+ checks with full AI analysis. ~$0.05 per response.',
    checks: {
      behavioral: ['rapid_completion', 'uniform_timing', 'low_interaction', 'excessive_paste', 'pointer_spikes', 'robotic_typing', 'mouse_teleporting', 'no_corrections', 'hover_behavior', 'scroll_patterns', 'mouse_acceleration'],
      timing: ['impossibly_fast', 'suspicious_pauses'],
      device: ['webdriver_detected', 'automation_detected', 'no_plugins', 'suspicious_user_agent', 'device_fingerprint_mismatch', 'screen_anomaly'],
      content: ['straight_line_answers', 'minimal_effort', 'excessive_tab_switching', 'window_focus_loss'],
      network: ['vpn_detection', 'datacenter_ip', 'tor_detection', 'proxy_detection', 'timezone_validation'],
      ai: ['ai_content_full', 'contradiction_full', 'plagiarism_full', 'quality_assessment', 'semantic_analysis', 'fraud_ring_detection', 'answer_sharing', 'coordinated_timing', 'device_sharing', 'baseline_deviation', 'perplexity_analysis', 'burstiness_analysis'],
    },
    aiModel: 'gpt-4o',
    periodicAnalysis: true,
    periodicInterval: 3, // Every 3 questions
    estimatedCostPerResponse: 0.05,
  },
};

/**
 * Get all checks enabled for a given tier
 */
export function getChecksForTier(tier: CipherTier): string[] {
  const config = CIPHER_TIERS[tier];
  return [
    ...config.checks.behavioral,
    ...config.checks.timing,
    ...config.checks.device,
    ...config.checks.content,
    ...config.checks.network,
    ...config.checks.ai,
  ];
}

/**
 * Get checks by category for a tier
 */
export function getChecksByCategory(tier: CipherTier): Record<string, string[]> {
  return CIPHER_TIERS[tier].checks;
}

/**
 * Check if a specific check is enabled for a tier
 */
export function isCheckEnabled(tier: CipherTier, checkId: CipherCheckId): boolean {
  const allChecks = getChecksForTier(tier);
  return allChecks.includes(checkId);
}

/**
 * Get the minimum tier required for a check
 */
export function getMinTierForCheck(checkId: CipherCheckId): CipherTier {
  return CIPHER_CHECKS[checkId]?.tier as CipherTier || 5;
}

/**
 * Calculate estimated cost for expected responses
 */
export function estimateCost(tier: CipherTier, expectedResponses: number): number {
  return CIPHER_TIERS[tier].estimatedCostPerResponse * expectedResponses;
}

/**
 * Default cipher settings for new projects
 */
export const DEFAULT_CIPHER_SETTINGS = {
  enabled: true,
  tier: 3 as CipherTier,
  advancedMode: false,
  advancedChecks: {} as Record<CipherCheckId, boolean>,
  sessionResume: true,
  resumeWindowHours: 48,
  flagThreshold: 0.6,
  blockThreshold: 0.85,
  minResponseTimeMs: 30000,
};

export type CipherSettings = typeof DEFAULT_CIPHER_SETTINGS;
