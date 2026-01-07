/**
 * Cipher Checks - Individual importable check functions
 *
 * These can be imported individually for custom validation pipelines:
 *
 * ```typescript
 * import { checkMinimalEffort, checkStraightLining } from '@surbee/cipher/checks';
 *
 * const result1 = checkMinimalEffort(responses);
 * const result2 = checkStraightLining(responses);
 * ```
 */

// Timing checks
export {
  checkImpossiblyFast,
  checkRapidCompletion,
  checkUniformTiming,
  checkSuspiciousPauses,
  runTimingChecks,
} from './timing';

// Behavioral checks
export {
  checkLowInteraction,
  checkExcessivePaste,
  checkPointerSpikes,
  checkRoboticTyping,
  checkMouseTeleporting,
  checkNoCorrections,
  checkHoverBehavior,
  checkScrollPatterns,
  checkMouseAcceleration,
  runBehavioralChecks,
} from './behavioral';

// Content checks
export {
  checkMinimalEffort,
  checkStraightLining,
  checkExcessiveTabSwitching,
  checkWindowFocusLoss,
  runContentChecks,
} from './content';

// Device checks
export {
  checkWebDriverDetected,
  checkAutomationDetected,
  checkNoPlugins,
  checkSuspiciousUserAgent,
  checkDeviceFingerprintMismatch,
  checkScreenAnomaly,
  checkTimezoneValidation,
  runDeviceChecks,
} from './device';

// Re-export types
export type { CheckResult } from '../types';
