/**
 * Cipher Tier Configuration
 *
 * Defines the 5-tier accuracy system for fraud detection.
 * Tiers 1-2: Fully offline, no AI cost
 * Tiers 3-4: Claude Sonnet 4.5 for AI analysis
 * Tier 5: Claude Opus 4.5 for maximum accuracy
 */

import type { CipherTier, TierConfig, CheckId, CheckDefinition } from './types';

/**
 * All available checks with their definitions
 */
export const CHECKS: Record<CheckId, CheckDefinition> = {
  // ============================================
  // TIER 1 - Basic Behavioral (Offline)
  // ============================================
  rapid_completion: {
    id: 'rapid_completion',
    name: 'Rapid Completion',
    description: 'Detects impossibly fast survey completion',
    tier: 1,
    category: 'behavioral',
    offline: true,
  },
  uniform_timing: {
    id: 'uniform_timing',
    name: 'Uniform Timing',
    description: 'Detects robotic consistent response times',
    tier: 1,
    category: 'behavioral',
    offline: true,
  },
  low_interaction: {
    id: 'low_interaction',
    name: 'Low Interaction',
    description: 'Detects minimal mouse/keyboard activity',
    tier: 1,
    category: 'behavioral',
    offline: true,
  },
  straight_line_answers: {
    id: 'straight_line_answers',
    name: 'Straight-Lining',
    description: 'Detects selecting same option repeatedly',
    tier: 1,
    category: 'content',
    offline: true,
  },
  impossibly_fast: {
    id: 'impossibly_fast',
    name: 'Speed Reading',
    description: 'Detects reading faster than humanly possible',
    tier: 1,
    category: 'timing',
    offline: true,
  },
  minimal_effort: {
    id: 'minimal_effort',
    name: 'Minimal Effort',
    description: 'Detects very short or low-quality text responses',
    tier: 1,
    category: 'content',
    offline: true,
  },

  // ============================================
  // TIER 2 - Device/Automation (Offline)
  // ============================================
  excessive_paste: {
    id: 'excessive_paste',
    name: 'Excessive Paste',
    description: 'Detects heavy copy-paste behavior',
    tier: 2,
    category: 'behavioral',
    offline: true,
  },
  pointer_spikes: {
    id: 'pointer_spikes',
    name: 'Pointer Velocity Spikes',
    description: 'Detects unnatural mouse movement patterns',
    tier: 2,
    category: 'behavioral',
    offline: true,
  },
  webdriver_detected: {
    id: 'webdriver_detected',
    name: 'WebDriver Detection',
    description: 'Detects Selenium/automation tools',
    tier: 2,
    category: 'device',
    offline: true,
  },
  automation_detected: {
    id: 'automation_detected',
    name: 'Automation Detection',
    description: 'Detects headless browsers and bots',
    tier: 2,
    category: 'device',
    offline: true,
  },
  no_plugins: {
    id: 'no_plugins',
    name: 'Missing Plugins',
    description: 'Detects suspicious browser configurations',
    tier: 2,
    category: 'device',
    offline: true,
  },
  suspicious_user_agent: {
    id: 'suspicious_user_agent',
    name: 'Suspicious User Agent',
    description: 'Detects bot-like user agent strings',
    tier: 2,
    category: 'device',
    offline: true,
  },
  device_fingerprint_mismatch: {
    id: 'device_fingerprint_mismatch',
    name: 'Device Mismatch',
    description: 'Detects inconsistent device characteristics',
    tier: 2,
    category: 'device',
    offline: true,
  },
  screen_anomaly: {
    id: 'screen_anomaly',
    name: 'Screen Anomaly',
    description: 'Detects impossible screen dimensions',
    tier: 2,
    category: 'device',
    offline: true,
  },
  suspicious_pauses: {
    id: 'suspicious_pauses',
    name: 'Suspicious Pauses',
    description: 'Detects unusual gaps in activity',
    tier: 2,
    category: 'timing',
    offline: true,
  },

  // ============================================
  // TIER 3 - Enhanced Behavioral + Light AI
  // ============================================
  robotic_typing: {
    id: 'robotic_typing',
    name: 'Robotic Typing',
    description: 'Detects uniform keystroke timing',
    tier: 3,
    category: 'behavioral',
    offline: true,
  },
  mouse_teleporting: {
    id: 'mouse_teleporting',
    name: 'Mouse Teleporting',
    description: 'Detects large instant mouse jumps',
    tier: 3,
    category: 'behavioral',
    offline: true,
  },
  no_corrections: {
    id: 'no_corrections',
    name: 'No Corrections',
    description: 'Detects perfect typing with no backspaces',
    tier: 3,
    category: 'behavioral',
    offline: true,
  },
  excessive_tab_switching: {
    id: 'excessive_tab_switching',
    name: 'Tab Switching',
    description: 'Detects frequent tab/window changes',
    tier: 3,
    category: 'content',
    offline: true,
  },
  window_focus_loss: {
    id: 'window_focus_loss',
    name: 'Focus Loss',
    description: 'Detects extended periods away from survey',
    tier: 3,
    category: 'content',
    offline: true,
  },
  ai_content_basic: {
    id: 'ai_content_basic',
    name: 'AI Content (Basic)',
    description: 'Light AI-generated text detection',
    tier: 3,
    category: 'ai',
    offline: false,
  },
  contradiction_basic: {
    id: 'contradiction_basic',
    name: 'Contradiction (Basic)',
    description: 'Basic response consistency check',
    tier: 3,
    category: 'ai',
    offline: false,
  },

  // ============================================
  // TIER 4 - Advanced Analysis
  // ============================================
  hover_behavior: {
    id: 'hover_behavior',
    name: 'Hover Patterns',
    description: 'Analyzes mouse hover behavior before clicks',
    tier: 4,
    category: 'behavioral',
    offline: true,
  },
  scroll_patterns: {
    id: 'scroll_patterns',
    name: 'Scroll Patterns',
    description: 'Analyzes reading/scrolling behavior',
    tier: 4,
    category: 'behavioral',
    offline: true,
  },
  mouse_acceleration: {
    id: 'mouse_acceleration',
    name: 'Mouse Acceleration',
    description: 'Analyzes natural mouse acceleration',
    tier: 4,
    category: 'behavioral',
    offline: true,
  },
  vpn_detection: {
    id: 'vpn_detection',
    name: 'VPN Detection',
    description: 'Detects VPN/proxy usage',
    tier: 4,
    category: 'network',
    offline: false,
  },
  datacenter_ip: {
    id: 'datacenter_ip',
    name: 'Datacenter IP',
    description: 'Detects cloud/datacenter IPs',
    tier: 4,
    category: 'network',
    offline: false,
  },
  plagiarism_basic: {
    id: 'plagiarism_basic',
    name: 'Plagiarism (Basic)',
    description: 'Quick check for copied content',
    tier: 4,
    category: 'ai',
    offline: false,
  },
  quality_assessment: {
    id: 'quality_assessment',
    name: 'Quality Assessment',
    description: 'AI assessment of response quality',
    tier: 4,
    category: 'ai',
    offline: false,
  },
  semantic_analysis: {
    id: 'semantic_analysis',
    name: 'Semantic Analysis',
    description: 'AI analysis of response meaning',
    tier: 4,
    category: 'ai',
    offline: false,
  },

  // ============================================
  // TIER 5 - Maximum (Opus 4.5)
  // ============================================
  ai_content_full: {
    id: 'ai_content_full',
    name: 'AI Content (Full)',
    description: 'Comprehensive AI-generated text detection',
    tier: 5,
    category: 'ai',
    offline: false,
  },
  contradiction_full: {
    id: 'contradiction_full',
    name: 'Contradiction (Full)',
    description: 'Deep semantic contradiction analysis',
    tier: 5,
    category: 'ai',
    offline: false,
  },
  plagiarism_full: {
    id: 'plagiarism_full',
    name: 'Plagiarism (Full)',
    description: 'Comprehensive plagiarism detection',
    tier: 5,
    category: 'ai',
    offline: false,
  },
  fraud_ring_detection: {
    id: 'fraud_ring_detection',
    name: 'Fraud Ring',
    description: 'Detects coordinated fraud attempts',
    tier: 5,
    category: 'ai',
    offline: false,
  },
  answer_sharing: {
    id: 'answer_sharing',
    name: 'Answer Sharing',
    description: 'Detects identical answers across respondents',
    tier: 5,
    category: 'ai',
    offline: false,
  },
  coordinated_timing: {
    id: 'coordinated_timing',
    name: 'Coordinated Timing',
    description: 'Detects synchronized submissions',
    tier: 5,
    category: 'ai',
    offline: false,
  },
  device_sharing: {
    id: 'device_sharing',
    name: 'Device Sharing',
    description: 'Detects same device across respondents',
    tier: 5,
    category: 'ai',
    offline: false,
  },
  tor_detection: {
    id: 'tor_detection',
    name: 'Tor Detection',
    description: 'Detects Tor exit node IPs',
    tier: 5,
    category: 'network',
    offline: false,
  },
  proxy_detection: {
    id: 'proxy_detection',
    name: 'Proxy Detection',
    description: 'Detects proxy server usage',
    tier: 5,
    category: 'network',
    offline: false,
  },
  timezone_validation: {
    id: 'timezone_validation',
    name: 'Timezone Validation',
    description: 'Validates timezone consistency',
    tier: 5,
    category: 'network',
    offline: true,
  },
  baseline_deviation: {
    id: 'baseline_deviation',
    name: 'Baseline Deviation',
    description: 'Compares against established behavioral baseline',
    tier: 5,
    category: 'ai',
    offline: false,
  },
  perplexity_analysis: {
    id: 'perplexity_analysis',
    name: 'Perplexity Analysis',
    description: 'Statistical text predictability analysis',
    tier: 5,
    category: 'ai',
    offline: false,
  },
  burstiness_analysis: {
    id: 'burstiness_analysis',
    name: 'Burstiness Analysis',
    description: 'Sentence length variation analysis',
    tier: 5,
    category: 'ai',
    offline: false,
  },
};

/**
 * Tier configurations
 *
 * Tier 1-2: Fully offline, no API costs
 * Tier 3-4: Claude Sonnet 4.5
 * Tier 5: Claude Opus 4.5
 */
export const TIERS: Record<CipherTier, TierConfig> = {
  1: {
    name: 'Basic',
    description: 'Essential fraud detection with behavioral heuristics. Free, fully offline.',
    checks: {
      behavioral: ['rapid_completion', 'uniform_timing', 'low_interaction'],
      timing: ['impossibly_fast'],
      device: [],
      content: ['straight_line_answers', 'minimal_effort'],
      network: [],
      ai: [],
    },
    aiModel: null,
    offline: true,
    estimatedCostPerResponse: 0,
  },
  2: {
    name: 'Standard',
    description: 'Adds device fingerprinting and automation detection. Free, fully offline.',
    checks: {
      behavioral: ['rapid_completion', 'uniform_timing', 'low_interaction', 'excessive_paste', 'pointer_spikes'],
      timing: ['impossibly_fast', 'suspicious_pauses'],
      device: ['webdriver_detected', 'automation_detected', 'no_plugins', 'suspicious_user_agent', 'device_fingerprint_mismatch', 'screen_anomaly'],
      content: ['straight_line_answers', 'minimal_effort'],
      network: [],
      ai: [],
    },
    aiModel: null,
    offline: true,
    estimatedCostPerResponse: 0,
  },
  3: {
    name: 'Enhanced',
    description: 'Adds Claude Sonnet 4.5 for content quality analysis. ~$0.003 per response.',
    checks: {
      behavioral: ['rapid_completion', 'uniform_timing', 'low_interaction', 'excessive_paste', 'pointer_spikes', 'robotic_typing', 'mouse_teleporting', 'no_corrections'],
      timing: ['impossibly_fast', 'suspicious_pauses'],
      device: ['webdriver_detected', 'automation_detected', 'no_plugins', 'suspicious_user_agent', 'device_fingerprint_mismatch', 'screen_anomaly'],
      content: ['straight_line_answers', 'minimal_effort', 'excessive_tab_switching', 'window_focus_loss'],
      network: [],
      ai: ['ai_content_basic', 'contradiction_basic'],
    },
    aiModel: 'claude-sonnet-4-5-20250514',
    offline: false,
    estimatedCostPerResponse: 0.003,
  },
  4: {
    name: 'Advanced',
    description: 'Full behavioral analysis + semantic AI. ~$0.01 per response.',
    checks: {
      behavioral: ['rapid_completion', 'uniform_timing', 'low_interaction', 'excessive_paste', 'pointer_spikes', 'robotic_typing', 'mouse_teleporting', 'no_corrections', 'hover_behavior', 'scroll_patterns', 'mouse_acceleration'],
      timing: ['impossibly_fast', 'suspicious_pauses'],
      device: ['webdriver_detected', 'automation_detected', 'no_plugins', 'suspicious_user_agent', 'device_fingerprint_mismatch', 'screen_anomaly'],
      content: ['straight_line_answers', 'minimal_effort', 'excessive_tab_switching', 'window_focus_loss'],
      network: ['vpn_detection', 'datacenter_ip'],
      ai: ['ai_content_basic', 'contradiction_basic', 'plagiarism_basic', 'quality_assessment', 'semantic_analysis'],
    },
    aiModel: 'claude-sonnet-4-5-20250514',
    offline: false,
    estimatedCostPerResponse: 0.01,
  },
  5: {
    name: 'Maximum',
    description: 'All 40+ checks with Claude Opus 4.5. Maximum accuracy. ~$0.05 per response.',
    checks: {
      behavioral: ['rapid_completion', 'uniform_timing', 'low_interaction', 'excessive_paste', 'pointer_spikes', 'robotic_typing', 'mouse_teleporting', 'no_corrections', 'hover_behavior', 'scroll_patterns', 'mouse_acceleration'],
      timing: ['impossibly_fast', 'suspicious_pauses'],
      device: ['webdriver_detected', 'automation_detected', 'no_plugins', 'suspicious_user_agent', 'device_fingerprint_mismatch', 'screen_anomaly'],
      content: ['straight_line_answers', 'minimal_effort', 'excessive_tab_switching', 'window_focus_loss'],
      network: ['vpn_detection', 'datacenter_ip', 'tor_detection', 'proxy_detection', 'timezone_validation'],
      ai: ['ai_content_full', 'contradiction_full', 'plagiarism_full', 'quality_assessment', 'semantic_analysis', 'fraud_ring_detection', 'answer_sharing', 'coordinated_timing', 'device_sharing', 'baseline_deviation', 'perplexity_analysis', 'burstiness_analysis'],
    },
    aiModel: 'claude-opus-4-5-20250514',
    offline: false,
    estimatedCostPerResponse: 0.05,
  },
};

/**
 * Get all checks for a given tier (includes all lower tiers)
 */
export function getChecksForTier(tier: CipherTier): CheckId[] {
  const config = TIERS[tier];
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
 * Get only offline checks for a tier
 */
export function getOfflineChecksForTier(tier: CipherTier): CheckId[] {
  return getChecksForTier(tier).filter(id => CHECKS[id].offline);
}

/**
 * Get only AI checks for a tier
 */
export function getAIChecksForTier(tier: CipherTier): CheckId[] {
  return getChecksForTier(tier).filter(id => !CHECKS[id].offline);
}

/**
 * Check if a tier requires API access
 */
export function tierRequiresAPI(tier: CipherTier): boolean {
  return !TIERS[tier].offline;
}

/**
 * Estimate cost for a number of responses
 */
export function estimateCost(tier: CipherTier, responses: number): number {
  return TIERS[tier].estimatedCostPerResponse * responses;
}
