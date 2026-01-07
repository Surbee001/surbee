/**
 * Behavioral checks
 *
 * Analyzes mouse, keyboard, and interaction patterns to detect bots.
 * All checks in this file are offline (no API required).
 */

import type { CheckResult, BehavioralMetrics } from '../types';

/**
 * Check: Low Interaction
 *
 * Detects minimal mouse/keyboard activity relative to survey duration.
 * Bots often have very few interaction events.
 */
export function checkLowInteraction(metrics?: BehavioralMetrics): CheckResult {
  if (!metrics) {
    return {
      checkId: 'low_interaction',
      passed: true,
      score: 0,
      details: 'No behavioral data available',
    };
  }

  const durationSeconds = (metrics.duration || 1) / 1000;
  const totalInteractions =
    metrics.mouseMovementCount +
    metrics.keypressCount +
    metrics.scrollEventCount;

  // Expect at least 1 interaction per second on average
  const interactionsPerSecond = totalInteractions / durationSeconds;

  if (interactionsPerSecond < 0.1) {
    return {
      checkId: 'low_interaction',
      passed: false,
      score: 1.0,
      details: 'Almost no user interaction detected',
      data: { interactionsPerSecond, totalInteractions, durationSeconds },
    };
  }

  if (interactionsPerSecond < 0.5) {
    return {
      checkId: 'low_interaction',
      passed: true,
      score: 0.6,
      details: 'Below average interaction rate',
      data: { interactionsPerSecond },
    };
  }

  return {
    checkId: 'low_interaction',
    passed: true,
    score: 0,
    data: { interactionsPerSecond },
  };
}

/**
 * Check: Excessive Paste
 *
 * Detects heavy copy-paste behavior which might indicate:
 * - AI-generated content being pasted
 * - Copying from other sources
 * - Bot automation
 */
export function checkExcessivePaste(metrics?: BehavioralMetrics): CheckResult {
  if (!metrics) {
    return {
      checkId: 'excessive_paste',
      passed: true,
      score: 0,
      details: 'No behavioral data available',
    };
  }

  const { pasteEvents, keypressCount } = metrics;

  // If more pastes than manual keypresses, very suspicious
  if (pasteEvents > 0 && keypressCount === 0) {
    return {
      checkId: 'excessive_paste',
      passed: false,
      score: 1.0,
      details: 'All content was pasted, no typing detected',
      data: { pasteEvents, keypressCount },
    };
  }

  // Ratio of paste events to keypresses
  const pasteRatio = keypressCount > 0 ? pasteEvents / keypressCount : 0;

  if (pasteRatio > 0.5) {
    return {
      checkId: 'excessive_paste',
      passed: false,
      score: 0.8,
      details: 'High paste-to-typing ratio',
      data: { pasteRatio, pasteEvents },
    };
  }

  if (pasteRatio > 0.2) {
    return {
      checkId: 'excessive_paste',
      passed: true,
      score: 0.4,
      details: 'Some paste events detected',
      data: { pasteRatio },
    };
  }

  return {
    checkId: 'excessive_paste',
    passed: true,
    score: 0,
    data: { pasteEvents },
  };
}

/**
 * Check: Pointer Velocity Spikes
 *
 * Detects unnatural mouse movement patterns:
 * - Teleporting (instant jumps)
 * - Perfectly linear movement
 * - Inhuman speeds
 */
export function checkPointerSpikes(metrics?: BehavioralMetrics): CheckResult {
  if (!metrics?.mouseMovements || metrics.mouseMovements.length < 10) {
    return {
      checkId: 'pointer_spikes',
      passed: true,
      score: 0,
      details: 'Insufficient mouse data',
    };
  }

  const velocities = metrics.mouseMovements
    .map(m => m.velocity)
    .filter(v => v > 0);

  if (velocities.length === 0) {
    return {
      checkId: 'pointer_spikes',
      passed: true,
      score: 0,
      details: 'No velocity data',
    };
  }

  // Check for velocity spikes (inhuman speeds > 50 pixels/ms)
  const spikeThreshold = 50;
  const spikes = velocities.filter(v => v > spikeThreshold);
  const spikeRatio = spikes.length / velocities.length;

  if (spikeRatio > 0.3) {
    return {
      checkId: 'pointer_spikes',
      passed: false,
      score: 0.9,
      details: 'Many unnatural mouse speed spikes detected',
      data: { spikeRatio, spikeCount: spikes.length },
    };
  }

  if (spikeRatio > 0.1) {
    return {
      checkId: 'pointer_spikes',
      passed: true,
      score: 0.4,
      details: 'Some unusual mouse movements',
      data: { spikeRatio },
    };
  }

  return {
    checkId: 'pointer_spikes',
    passed: true,
    score: 0,
    data: { spikeRatio },
  };
}

/**
 * Check: Robotic Typing
 *
 * Detects uniform keystroke timing that suggests automation.
 * Humans have natural variation in typing rhythm.
 */
export function checkRoboticTyping(metrics?: BehavioralMetrics): CheckResult {
  if (!metrics?.keystrokeDynamics || metrics.keystrokeDynamics.length < 10) {
    return {
      checkId: 'robotic_typing',
      passed: true,
      score: 0,
      details: 'Insufficient keystroke data',
    };
  }

  const dwellTimes = metrics.keystrokeDynamics.map(k => k.dwell).filter(d => d > 0 && d < 1000);

  if (dwellTimes.length < 5) {
    return {
      checkId: 'robotic_typing',
      passed: true,
      score: 0,
      details: 'Not enough valid keystroke data',
    };
  }

  // Calculate coefficient of variation
  const mean = dwellTimes.reduce((a, b) => a + b, 0) / dwellTimes.length;
  const variance = dwellTimes.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / dwellTimes.length;
  const stddev = Math.sqrt(variance);
  const cv = stddev / mean;

  // Humans typically have CV > 0.25 for keystroke timing
  if (cv < 0.08) {
    return {
      checkId: 'robotic_typing',
      passed: false,
      score: 1.0,
      details: 'Keystroke timing is machine-like uniform',
      data: { cv, mean, stddev },
    };
  }

  if (cv < 0.15) {
    return {
      checkId: 'robotic_typing',
      passed: true,
      score: 0.5,
      details: 'Lower than typical keystroke variation',
      data: { cv },
    };
  }

  return {
    checkId: 'robotic_typing',
    passed: true,
    score: 0,
    data: { cv },
  };
}

/**
 * Check: Mouse Teleporting
 *
 * Detects large instant mouse jumps that are physically impossible.
 */
export function checkMouseTeleporting(metrics?: BehavioralMetrics): CheckResult {
  if (!metrics?.mouseMovements || metrics.mouseMovements.length < 5) {
    return {
      checkId: 'mouse_teleporting',
      passed: true,
      score: 0,
      details: 'Insufficient mouse data',
    };
  }

  let teleportCount = 0;
  const movements = metrics.mouseMovements;

  for (let i = 1; i < movements.length; i++) {
    const prev = movements[i - 1];
    const curr = movements[i];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const dt = curr.t - prev.t;

    // If moved > 500px in < 10ms, it's a teleport
    if (distance > 500 && dt < 10) {
      teleportCount++;
    }
  }

  const teleportRatio = teleportCount / movements.length;

  if (teleportRatio > 0.2) {
    return {
      checkId: 'mouse_teleporting',
      passed: false,
      score: 0.9,
      details: 'Frequent mouse teleportation detected',
      data: { teleportCount, teleportRatio },
    };
  }

  if (teleportRatio > 0.05) {
    return {
      checkId: 'mouse_teleporting',
      passed: true,
      score: 0.4,
      details: 'Some mouse teleportation detected',
      data: { teleportCount },
    };
  }

  return {
    checkId: 'mouse_teleporting',
    passed: true,
    score: 0,
    data: { teleportCount },
  };
}

/**
 * Check: No Corrections
 *
 * Detects perfect typing with no backspaces or corrections.
 * Humans naturally make typos and correct them.
 */
export function checkNoCorrections(metrics?: BehavioralMetrics): CheckResult {
  if (!metrics || metrics.keypressCount < 20) {
    return {
      checkId: 'no_corrections',
      passed: true,
      score: 0,
      details: 'Insufficient typing data',
    };
  }

  const { backspaceCount, keypressCount } = metrics;
  const correctionRatio = backspaceCount / keypressCount;

  // Typical humans have ~5-15% backspace rate
  if (backspaceCount === 0 && keypressCount > 50) {
    return {
      checkId: 'no_corrections',
      passed: false,
      score: 0.8,
      details: 'No typing corrections despite significant text entry',
      data: { backspaceCount, keypressCount },
    };
  }

  if (correctionRatio < 0.01 && keypressCount > 30) {
    return {
      checkId: 'no_corrections',
      passed: true,
      score: 0.5,
      details: 'Very few typing corrections',
      data: { correctionRatio },
    };
  }

  return {
    checkId: 'no_corrections',
    passed: true,
    score: 0,
    data: { correctionRatio },
  };
}

/**
 * Check: Hover Behavior
 *
 * Analyzes mouse hover patterns before clicks.
 * Humans typically hover before clicking; bots often don't.
 */
export function checkHoverBehavior(metrics?: BehavioralMetrics): CheckResult {
  if (!metrics?.mouseClicks || metrics.mouseClicks.length < 3) {
    return {
      checkId: 'hover_behavior',
      passed: true,
      score: 0,
      details: 'Insufficient click data',
    };
  }

  const clicksWithHover = metrics.mouseClicks.filter(c => c.hadHover);
  const hoverRatio = clicksWithHover.length / metrics.mouseClicks.length;

  // Humans typically hover before ~70%+ of clicks
  if (hoverRatio < 0.2) {
    return {
      checkId: 'hover_behavior',
      passed: false,
      score: 0.8,
      details: 'Clicks without natural hover behavior',
      data: { hoverRatio, totalClicks: metrics.mouseClicks.length },
    };
  }

  if (hoverRatio < 0.4) {
    return {
      checkId: 'hover_behavior',
      passed: true,
      score: 0.4,
      details: 'Lower than typical hover-before-click rate',
      data: { hoverRatio },
    };
  }

  return {
    checkId: 'hover_behavior',
    passed: true,
    score: 0,
    data: { hoverRatio },
  };
}

/**
 * Check: Scroll Patterns
 *
 * Analyzes scrolling behavior for signs of automation.
 */
export function checkScrollPatterns(metrics?: BehavioralMetrics): CheckResult {
  if (!metrics?.scrollEvents || metrics.scrollEvents.length < 5) {
    return {
      checkId: 'scroll_patterns',
      passed: true,
      score: 0,
      details: 'Insufficient scroll data',
    };
  }

  const velocities = metrics.scrollEvents.map(s => Math.abs(s.velocity)).filter(v => v > 0);

  if (velocities.length < 3) {
    return {
      checkId: 'scroll_patterns',
      passed: true,
      score: 0,
    };
  }

  // Check for uniform scroll velocity (robotic)
  const mean = velocities.reduce((a, b) => a + b, 0) / velocities.length;
  const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length;
  const cv = Math.sqrt(variance) / mean;

  if (cv < 0.1) {
    return {
      checkId: 'scroll_patterns',
      passed: false,
      score: 0.7,
      details: 'Unnaturally uniform scroll pattern',
      data: { cv },
    };
  }

  return {
    checkId: 'scroll_patterns',
    passed: true,
    score: 0,
    data: { cv },
  };
}

/**
 * Check: Mouse Acceleration
 *
 * Analyzes natural mouse acceleration patterns.
 * Real mice have gradual acceleration/deceleration.
 */
export function checkMouseAcceleration(metrics?: BehavioralMetrics): CheckResult {
  if (!metrics?.mouseMovements || metrics.mouseMovements.length < 20) {
    return {
      checkId: 'mouse_acceleration',
      passed: true,
      score: 0,
      details: 'Insufficient mouse data',
    };
  }

  const velocities = metrics.mouseMovements.map(m => m.velocity).filter(v => v > 0);

  if (velocities.length < 10) {
    return {
      checkId: 'mouse_acceleration',
      passed: true,
      score: 0,
    };
  }

  // Calculate acceleration (change in velocity)
  const accelerations: number[] = [];
  for (let i = 1; i < velocities.length; i++) {
    accelerations.push(Math.abs(velocities[i] - velocities[i - 1]));
  }

  // Check if acceleration is too uniform
  const meanAcc = accelerations.reduce((a, b) => a + b, 0) / accelerations.length;
  const varianceAcc = accelerations.reduce((sum, a) => sum + Math.pow(a - meanAcc, 2), 0) / accelerations.length;
  const cvAcc = Math.sqrt(varianceAcc) / meanAcc;

  if (cvAcc < 0.2) {
    return {
      checkId: 'mouse_acceleration',
      passed: true,
      score: 0.5,
      details: 'Lower than typical acceleration variation',
      data: { cvAcc },
    };
  }

  return {
    checkId: 'mouse_acceleration',
    passed: true,
    score: 0,
    data: { cvAcc },
  };
}

/**
 * Run all behavioral checks
 */
export function runBehavioralChecks(metrics?: BehavioralMetrics): CheckResult[] {
  return [
    checkLowInteraction(metrics),
    checkExcessivePaste(metrics),
    checkPointerSpikes(metrics),
    checkRoboticTyping(metrics),
    checkMouseTeleporting(metrics),
    checkNoCorrections(metrics),
    checkHoverBehavior(metrics),
    checkScrollPatterns(metrics),
    checkMouseAcceleration(metrics),
  ];
}
