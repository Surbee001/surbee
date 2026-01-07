/**
 * Device-based checks
 *
 * Analyzes device fingerprint and browser characteristics to detect bots.
 * All checks in this file are offline (no API required).
 */

import type { CheckResult, DeviceInfo } from '../types';

/**
 * Known bot user agent patterns
 */
const BOT_USER_AGENTS = [
  /headless/i,
  /phantom/i,
  /selenium/i,
  /webdriver/i,
  /puppeteer/i,
  /playwright/i,
  /crawl/i,
  /spider/i,
  /bot/i,
  /scrape/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /axios/i,
  /node-fetch/i,
  /go-http-client/i,
];

/**
 * Suspicious screen dimensions (commonly used by bots)
 */
const SUSPICIOUS_SCREENS = [
  { width: 800, height: 600 },
  { width: 1024, height: 768 },
  { width: 1, height: 1 },
  { width: 0, height: 0 },
];

/**
 * Check: WebDriver Detection
 *
 * Detects Selenium/automation tools via navigator.webdriver flag.
 */
export function checkWebDriverDetected(device?: DeviceInfo): CheckResult {
  if (!device) {
    return {
      checkId: 'webdriver_detected',
      passed: true,
      score: 0,
      details: 'No device info available',
    };
  }

  if (device.webDriver === true) {
    return {
      checkId: 'webdriver_detected',
      passed: false,
      score: 1.0,
      details: 'WebDriver automation detected',
      data: { webDriver: true },
    };
  }

  return {
    checkId: 'webdriver_detected',
    passed: true,
    score: 0,
    data: { webDriver: false },
  };
}

/**
 * Check: Automation Detection
 *
 * Detects headless browsers and automation frameworks.
 */
export function checkAutomationDetected(device?: DeviceInfo): CheckResult {
  if (!device) {
    return {
      checkId: 'automation_detected',
      passed: true,
      score: 0,
      details: 'No device info available',
    };
  }

  if (device.automationDetected === true) {
    return {
      checkId: 'automation_detected',
      passed: false,
      score: 1.0,
      details: 'Browser automation framework detected',
      data: { automationDetected: true },
    };
  }

  return {
    checkId: 'automation_detected',
    passed: true,
    score: 0,
    data: { automationDetected: false },
  };
}

/**
 * Check: Missing Plugins
 *
 * Bots often have zero browser plugins, which is unusual for real browsers.
 */
export function checkNoPlugins(device?: DeviceInfo): CheckResult {
  if (!device) {
    return {
      checkId: 'no_plugins',
      passed: true,
      score: 0,
      details: 'No device info available',
    };
  }

  const { pluginCount } = device;

  if (pluginCount === 0) {
    // Could be a legitimate mobile browser or privacy-focused setup
    // Check if it's mobile
    const isMobile = device.touchSupport || device.maxTouchPoints > 0;

    if (!isMobile) {
      return {
        checkId: 'no_plugins',
        passed: true,
        score: 0.5,
        details: 'No browser plugins (common in automation)',
        data: { pluginCount },
      };
    }
  }

  return {
    checkId: 'no_plugins',
    passed: true,
    score: 0,
    data: { pluginCount },
  };
}

/**
 * Check: Suspicious User Agent
 *
 * Detects bot-like user agent strings.
 */
export function checkSuspiciousUserAgent(device?: DeviceInfo): CheckResult {
  if (!device?.userAgent) {
    return {
      checkId: 'suspicious_user_agent',
      passed: true,
      score: 0,
      details: 'No user agent available',
    };
  }

  const { userAgent } = device;

  // Check against known bot patterns
  for (const pattern of BOT_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      return {
        checkId: 'suspicious_user_agent',
        passed: false,
        score: 1.0,
        details: 'Bot-like user agent detected',
        data: { pattern: pattern.source },
      };
    }
  }

  // Check for empty or very short user agent
  if (userAgent.length < 20) {
    return {
      checkId: 'suspicious_user_agent',
      passed: true,
      score: 0.5,
      details: 'Unusually short user agent',
      data: { length: userAgent.length },
    };
  }

  return {
    checkId: 'suspicious_user_agent',
    passed: true,
    score: 0,
  };
}

/**
 * Check: Device Fingerprint Mismatch
 *
 * Detects inconsistent device characteristics that suggest spoofing.
 */
export function checkDeviceFingerprintMismatch(device?: DeviceInfo): CheckResult {
  if (!device) {
    return {
      checkId: 'device_fingerprint_mismatch',
      passed: true,
      score: 0,
      details: 'No device info available',
    };
  }

  const issues: string[] = [];

  // Check for mismatched touch capabilities
  if (device.touchSupport && device.maxTouchPoints === 0) {
    issues.push('Touch support claimed but no touch points');
  }

  // Check for mismatched screen dimensions
  if (device.screenWidth < device.screenAvailWidth || device.screenHeight < device.screenAvailHeight) {
    issues.push('Available screen larger than total screen');
  }

  // Check for impossible hardware specs
  if (device.hardwareConcurrency > 128) {
    issues.push('Impossible CPU core count');
  }

  if (device.deviceMemory > 256) {
    issues.push('Impossible memory amount');
  }

  // Check for mismatched pixel ratio
  if (device.pixelRatio <= 0 || device.pixelRatio > 10) {
    issues.push('Invalid pixel ratio');
  }

  if (issues.length >= 2) {
    return {
      checkId: 'device_fingerprint_mismatch',
      passed: false,
      score: 0.8,
      details: 'Multiple device characteristic mismatches',
      data: { issues },
    };
  }

  if (issues.length === 1) {
    return {
      checkId: 'device_fingerprint_mismatch',
      passed: true,
      score: 0.4,
      details: issues[0],
      data: { issues },
    };
  }

  return {
    checkId: 'device_fingerprint_mismatch',
    passed: true,
    score: 0,
  };
}

/**
 * Check: Screen Anomaly
 *
 * Detects impossible or suspicious screen dimensions.
 */
export function checkScreenAnomaly(device?: DeviceInfo): CheckResult {
  if (!device) {
    return {
      checkId: 'screen_anomaly',
      passed: true,
      score: 0,
      details: 'No device info available',
    };
  }

  const { screenWidth, screenHeight } = device;

  // Check for impossible dimensions
  if (screenWidth <= 0 || screenHeight <= 0) {
    return {
      checkId: 'screen_anomaly',
      passed: false,
      score: 1.0,
      details: 'Invalid screen dimensions',
      data: { screenWidth, screenHeight },
    };
  }

  // Check for suspicious exact dimensions (common in bots)
  for (const suspicious of SUSPICIOUS_SCREENS) {
    if (screenWidth === suspicious.width && screenHeight === suspicious.height) {
      return {
        checkId: 'screen_anomaly',
        passed: true,
        score: 0.4,
        details: 'Common automation screen size',
        data: { screenWidth, screenHeight },
      };
    }
  }

  // Check for extremely unusual aspect ratios
  const aspectRatio = screenWidth / screenHeight;
  if (aspectRatio < 0.3 || aspectRatio > 5) {
    return {
      checkId: 'screen_anomaly',
      passed: true,
      score: 0.5,
      details: 'Unusual screen aspect ratio',
      data: { aspectRatio },
    };
  }

  return {
    checkId: 'screen_anomaly',
    passed: true,
    score: 0,
  };
}

/**
 * Check: Timezone Validation
 *
 * Validates timezone consistency between browser and behavior.
 */
export function checkTimezoneValidation(device?: DeviceInfo): CheckResult {
  if (!device) {
    return {
      checkId: 'timezone_validation',
      passed: true,
      score: 0,
      details: 'No device info available',
    };
  }

  const { timezone, timezoneOffset } = device;

  // Check for missing timezone data
  if (!timezone) {
    return {
      checkId: 'timezone_validation',
      passed: true,
      score: 0.3,
      details: 'No timezone information',
    };
  }

  // Validate offset is reasonable (-12 to +14 hours)
  if (timezoneOffset < -840 || timezoneOffset > 720) {
    return {
      checkId: 'timezone_validation',
      passed: false,
      score: 0.7,
      details: 'Invalid timezone offset',
      data: { timezoneOffset },
    };
  }

  return {
    checkId: 'timezone_validation',
    passed: true,
    score: 0,
    data: { timezone, timezoneOffset },
  };
}

/**
 * Run all device checks
 */
export function runDeviceChecks(device?: DeviceInfo): CheckResult[] {
  return [
    checkWebDriverDetected(device),
    checkAutomationDetected(device),
    checkNoPlugins(device),
    checkSuspiciousUserAgent(device),
    checkDeviceFingerprintMismatch(device),
    checkScreenAnomaly(device),
    checkTimezoneValidation(device),
  ];
}
