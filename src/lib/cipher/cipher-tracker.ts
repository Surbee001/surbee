/**
 * CipherTracker Script Generator
 *
 * Generates a self-contained tracking script that gets injected into survey iframes.
 * The script tracks behavioral metrics, device fingerprint, and posts data to parent.
 */

import { CipherTier } from './tier-config';

export interface CipherTrackerConfig {
  projectId: string;
  tier: CipherTier;
  sessionId: string;
  resumeEnabled: boolean;
  resumeWindowHours: number;
  metricsInterval?: number; // ms between metrics posts (default 10000)
  saveInterval?: number; // ms between session saves (default 5000)
}

/**
 * Generates the CipherTracker script to inject into iframe HTML
 */
export function generateCipherTrackerScript(config: CipherTrackerConfig): string {
  const {
    projectId,
    tier,
    sessionId,
    resumeEnabled,
    resumeWindowHours,
    metricsInterval = 10000,
    saveInterval = 5000,
  } = config;

  return `
<script>
(function() {
  'use strict';

  // ============================================
  // CIPHER TRACKER - Self-contained Fraud Detection
  // ============================================

  const CIPHER_CONFIG = {
    projectId: "${projectId}",
    tier: ${tier},
    sessionId: "${sessionId}",
    resumeEnabled: ${resumeEnabled},
    resumeWindowHours: ${resumeWindowHours},
    metricsInterval: ${metricsInterval},
    saveInterval: ${saveInterval},
  };

  const STORAGE_KEY = 'cipher_session_' + CIPHER_CONFIG.projectId;
  const MAX_MOUSE_SAMPLES = 500;
  const MAX_KEYSTROKE_SAMPLES = 200;
  const MAX_SCROLL_SAMPLES = 100;

  // ============================================
  // METRICS STORAGE
  // ============================================

  let metrics = {
    // Session info
    sessionId: CIPHER_CONFIG.sessionId,
    startedAt: Date.now(),
    lastActiveAt: Date.now(),

    // Mouse tracking
    mouseMovements: [], // { x, y, t, velocity }
    mouseClicks: [], // { x, y, t, hadHover }
    lastMousePos: null,
    lastMouseTime: null,

    // Keyboard tracking
    keystrokeDynamics: [], // { key, downAt, upAt, dwell }
    keydownTimes: {},
    backspaceCount: 0,
    keypressCount: 0,
    lastKeyTime: null,

    // Scroll tracking
    scrollEvents: [], // { y, t, velocity }
    lastScrollY: 0,
    lastScrollTime: null,

    // Focus tracking
    focusEvents: [], // { type, t }
    tabSwitchCount: 0,
    totalBlurDuration: 0,
    blurStartTime: null,

    // Paste tracking
    pasteEvents: 0,
    copyEvents: 0,

    // Hover tracking (tier 3+)
    hoverEvents: [], // { element, duration, questionId }
    currentHover: null,

    // Question timing
    questionStartTimes: {},
    responseTime: [], // ms per question

    // Device fingerprint
    deviceFingerprint: null,
  };

  // ============================================
  // DEVICE FINGERPRINTING
  // ============================================

  function generateFingerprint() {
    const fp = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      languages: navigator.languages ? [...navigator.languages] : [],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      screenWidth: screen.width,
      screenHeight: screen.height,
      screenAvailWidth: screen.availWidth,
      screenAvailHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: navigator.deviceMemory || 0,
      cookiesEnabled: navigator.cookieEnabled,

      // Automation detection
      webDriver: navigator.webdriver === true,
      automationDetected: !!(
        window.callPhantom ||
        window._phantom ||
        window.phantom ||
        window.__nightmare ||
        window.domAutomation ||
        window.domAutomationController ||
        document.__selenium_unwrapped ||
        document.__webdriver_script_fn ||
        document.__driver_evaluate ||
        document.__webdriver_evaluate ||
        document.__fxdriver_evaluate ||
        document.__driver_unwrapped ||
        document.__webdriver_unwrapped ||
        document.__fxdriver_unwrapped ||
        document.__webdriver_script_func
      ),

      // Canvas fingerprint (simplified)
      canvasFingerprint: getCanvasFingerprint(),

      // WebGL info
      webglVendor: getWebGLInfo().vendor,
      webglRenderer: getWebGLInfo().renderer,

      // Plugin count (bots often have 0)
      pluginCount: navigator.plugins ? navigator.plugins.length : 0,

      // Timestamp
      collectedAt: Date.now(),
    };

    return fp;
  }

  function getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Cipher', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Tracker', 4, 17);

      return canvas.toDataURL().slice(-50); // Last 50 chars as hash
    } catch (e) {
      return null;
    }
  }

  function getWebGLInfo() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return { vendor: null, renderer: null };

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return { vendor: null, renderer: null };

      return {
        vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
        renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
      };
    } catch (e) {
      return { vendor: null, renderer: null };
    }
  }

  // ============================================
  // SESSION PERSISTENCE
  // ============================================

  function saveSession() {
    if (!CIPHER_CONFIG.resumeEnabled) return;

    try {
      const sessionData = {
        metrics: {
          ...metrics,
          // Trim arrays to prevent localStorage overflow
          mouseMovements: metrics.mouseMovements.slice(-MAX_MOUSE_SAMPLES),
          keystrokeDynamics: metrics.keystrokeDynamics.slice(-MAX_KEYSTROKE_SAMPLES),
          scrollEvents: metrics.scrollEvents.slice(-MAX_SCROLL_SAMPLES),
        },
        questionIndex: window.__cipherCurrentQuestionIndex || 0,
        savedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    } catch (e) {
      // localStorage might be full or disabled
      console.warn('Cipher: Failed to save session', e);
    }
  }

  function restoreSession() {
    if (!CIPHER_CONFIG.resumeEnabled) return null;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const data = JSON.parse(saved);
      const hoursAgo = (Date.now() - data.savedAt) / (1000 * 60 * 60);

      if (hoursAgo > CIPHER_CONFIG.resumeWindowHours) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return data;
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  // Mouse movement (all tiers)
  function onMouseMove(e) {
    const now = Date.now();
    const x = e.clientX;
    const y = e.clientY;

    let velocity = 0;
    if (metrics.lastMousePos && metrics.lastMouseTime) {
      const dx = x - metrics.lastMousePos.x;
      const dy = y - metrics.lastMousePos.y;
      const dt = now - metrics.lastMouseTime;
      if (dt > 0) {
        velocity = Math.sqrt(dx * dx + dy * dy) / dt;
      }
    }

    metrics.mouseMovements.push({ x, y, t: now, velocity });
    metrics.lastMousePos = { x, y };
    metrics.lastMouseTime = now;
    metrics.lastActiveAt = now;

    // Trim if too many
    if (metrics.mouseMovements.length > MAX_MOUSE_SAMPLES * 2) {
      metrics.mouseMovements = metrics.mouseMovements.slice(-MAX_MOUSE_SAMPLES);
    }
  }

  // Mouse click (all tiers)
  function onMouseClick(e) {
    const now = Date.now();
    const hadHover = metrics.currentHover && (now - metrics.currentHover.startTime) > 100;

    metrics.mouseClicks.push({
      x: e.clientX,
      y: e.clientY,
      t: now,
      hadHover,
    });
    metrics.lastActiveAt = now;
  }

  // Keyboard events (all tiers)
  function onKeyDown(e) {
    const now = Date.now();
    const key = e.key;

    if (!metrics.keydownTimes[key]) {
      metrics.keydownTimes[key] = now;
    }

    if (key === 'Backspace') {
      metrics.backspaceCount++;
    }

    metrics.keypressCount++;
    metrics.lastActiveAt = now;
  }

  function onKeyUp(e) {
    const now = Date.now();
    const key = e.key;
    const downTime = metrics.keydownTimes[key];

    if (downTime) {
      const dwell = now - downTime;
      let flightTime = 0;

      if (metrics.lastKeyTime) {
        flightTime = downTime - metrics.lastKeyTime;
      }

      metrics.keystrokeDynamics.push({
        key: key.length === 1 ? '*' : key, // Anonymize single chars
        downAt: downTime,
        upAt: now,
        dwell,
        flightTime,
      });

      delete metrics.keydownTimes[key];
      metrics.lastKeyTime = now;
    }

    // Trim if too many
    if (metrics.keystrokeDynamics.length > MAX_KEYSTROKE_SAMPLES * 2) {
      metrics.keystrokeDynamics = metrics.keystrokeDynamics.slice(-MAX_KEYSTROKE_SAMPLES);
    }
  }

  // Scroll events (tier 3+)
  function onScroll() {
    if (CIPHER_CONFIG.tier < 3) return;

    const now = Date.now();
    const y = window.scrollY;

    let velocity = 0;
    if (metrics.lastScrollTime) {
      const dy = y - metrics.lastScrollY;
      const dt = now - metrics.lastScrollTime;
      if (dt > 0) {
        velocity = dy / dt;
      }
    }

    metrics.scrollEvents.push({ y, t: now, velocity });
    metrics.lastScrollY = y;
    metrics.lastScrollTime = now;
    metrics.lastActiveAt = now;

    // Trim if too many
    if (metrics.scrollEvents.length > MAX_SCROLL_SAMPLES * 2) {
      metrics.scrollEvents = metrics.scrollEvents.slice(-MAX_SCROLL_SAMPLES);
    }
  }

  // Focus events (tier 2+)
  function onFocus() {
    if (CIPHER_CONFIG.tier < 2) return;

    const now = Date.now();
    metrics.focusEvents.push({ type: 'focus', t: now });

    if (metrics.blurStartTime) {
      metrics.totalBlurDuration += now - metrics.blurStartTime;
      metrics.blurStartTime = null;
    }

    metrics.lastActiveAt = now;
  }

  function onBlur() {
    if (CIPHER_CONFIG.tier < 2) return;

    const now = Date.now();
    metrics.focusEvents.push({ type: 'blur', t: now });
    metrics.blurStartTime = now;
    metrics.tabSwitchCount++;
  }

  function onVisibilityChange() {
    if (CIPHER_CONFIG.tier < 2) return;

    const now = Date.now();
    if (document.hidden) {
      metrics.focusEvents.push({ type: 'hidden', t: now });
      metrics.blurStartTime = now;
      metrics.tabSwitchCount++;
    } else {
      metrics.focusEvents.push({ type: 'visible', t: now });
      if (metrics.blurStartTime) {
        metrics.totalBlurDuration += now - metrics.blurStartTime;
        metrics.blurStartTime = null;
      }
    }
  }

  // Paste events (tier 2+)
  function onPaste() {
    if (CIPHER_CONFIG.tier < 2) return;
    metrics.pasteEvents++;
    metrics.lastActiveAt = Date.now();
  }

  // Copy events (tier 4+)
  function onCopy() {
    if (CIPHER_CONFIG.tier < 4) return;
    metrics.copyEvents++;
    metrics.lastActiveAt = Date.now();
  }

  // Hover events (tier 3+)
  function onMouseOver(e) {
    if (CIPHER_CONFIG.tier < 3) return;

    const target = e.target;
    if (target && target.tagName) {
      metrics.currentHover = {
        element: target.tagName.toLowerCase(),
        startTime: Date.now(),
      };
    }
  }

  function onMouseOut(e) {
    if (CIPHER_CONFIG.tier < 3) return;

    if (metrics.currentHover) {
      const duration = Date.now() - metrics.currentHover.startTime;
      if (duration > 50) { // Only track meaningful hovers
        metrics.hoverEvents.push({
          element: metrics.currentHover.element,
          duration,
          t: Date.now(),
        });
      }
      metrics.currentHover = null;
    }
  }

  // ============================================
  // METRICS SNAPSHOT
  // ============================================

  function getMetricsSnapshot() {
    const now = Date.now();

    // Calculate aggregate stats
    const mouseVelocities = metrics.mouseMovements.map(m => m.velocity).filter(v => v > 0);
    const avgMouseVelocity = mouseVelocities.length > 0
      ? mouseVelocities.reduce((a, b) => a + b, 0) / mouseVelocities.length
      : 0;

    const keystrokeDwells = metrics.keystrokeDynamics.map(k => k.dwell).filter(d => d > 0);
    const avgKeystrokeDwell = keystrokeDwells.length > 0
      ? keystrokeDwells.reduce((a, b) => a + b, 0) / keystrokeDwells.length
      : 0;

    const keystrokeVariance = keystrokeDwells.length > 1
      ? calculateVariance(keystrokeDwells)
      : 0;

    return {
      sessionId: metrics.sessionId,
      startedAt: metrics.startedAt,
      duration: now - metrics.startedAt,
      lastActiveAt: metrics.lastActiveAt,

      // Mouse metrics
      mouseMovements: metrics.mouseMovements.slice(-MAX_MOUSE_SAMPLES),
      mouseClicks: metrics.mouseClicks,
      mouseMovementCount: metrics.mouseMovements.length,
      avgMouseVelocity,

      // Keyboard metrics
      keystrokeDynamics: metrics.keystrokeDynamics.slice(-MAX_KEYSTROKE_SAMPLES),
      keypressCount: metrics.keypressCount,
      backspaceCount: metrics.backspaceCount,
      avgKeystrokeDwell,
      keystrokeVariance,

      // Scroll metrics
      scrollEvents: metrics.scrollEvents.slice(-MAX_SCROLL_SAMPLES),
      scrollEventCount: metrics.scrollEvents.length,

      // Focus metrics
      focusEvents: metrics.focusEvents,
      tabSwitchCount: metrics.tabSwitchCount,
      totalBlurDuration: metrics.totalBlurDuration + (metrics.blurStartTime ? now - metrics.blurStartTime : 0),

      // Interaction metrics
      pasteEvents: metrics.pasteEvents,
      copyEvents: metrics.copyEvents,

      // Hover metrics
      hoverEvents: metrics.hoverEvents,

      // Question timing
      responseTime: metrics.responseTime,
      questionStartTimes: metrics.questionStartTimes,

      // Device fingerprint
      deviceFingerprint: metrics.deviceFingerprint,

      // Config
      tier: CIPHER_CONFIG.tier,
    };
  }

  function calculateVariance(arr) {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const squaredDiffs = arr.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
  }

  // ============================================
  // COMMUNICATION WITH PARENT
  // ============================================

  function postMetricsToParent() {
    try {
      window.parent.postMessage({
        type: 'CIPHER_METRICS',
        metrics: getMetricsSnapshot(),
      }, '*');
    } catch (e) {
      console.warn('Cipher: Failed to post metrics', e);
    }
  }

  function postSessionRestored(questionIndex) {
    try {
      window.parent.postMessage({
        type: 'CIPHER_SESSION_RESTORED',
        questionIndex,
        sessionId: metrics.sessionId,
      }, '*');
    } catch (e) {
      console.warn('Cipher: Failed to post session restored', e);
    }
  }

  // ============================================
  // SURVEY COMPLETION INTERCEPTION
  // ============================================

  // Override/intercept survey completion to include metrics
  const originalPostMessage = window.postMessage.bind(window);

  window.addEventListener('message', function(e) {
    // If this is a survey response being sent
    if (e.source === window && e.data) {
      const type = e.data.type;

      if (type === 'survey-response' || type === 'SURVEY_COMPLETE') {
        // Clear session on completion
        clearSession();

        // Re-post to parent with metrics included
        try {
          window.parent.postMessage({
            type: 'SURVEY_COMPLETE',
            responses: e.data.responses || e.data.data,
            behavioralMetrics: getMetricsSnapshot(),
          }, '*');
        } catch (err) {
          console.warn('Cipher: Failed to post completion with metrics', err);
        }
      }
    }
  });

  // ============================================
  // QUESTION TRACKING HELPERS
  // ============================================

  // Global function for survey to call when question changes
  window.__cipherQuestionStart = function(questionId) {
    metrics.questionStartTimes[questionId] = Date.now();
    window.__cipherCurrentQuestionIndex = Object.keys(metrics.questionStartTimes).length - 1;
  };

  window.__cipherQuestionEnd = function(questionId) {
    const startTime = metrics.questionStartTimes[questionId];
    if (startTime) {
      metrics.responseTime.push(Date.now() - startTime);
    }
  };

  // ============================================
  // INITIALIZATION
  // ============================================

  function init() {
    // Generate fingerprint
    metrics.deviceFingerprint = generateFingerprint();

    // Restore session if available
    const restored = restoreSession();
    if (restored) {
      // Merge restored metrics
      const restoredMetrics = restored.metrics;
      metrics = {
        ...metrics,
        ...restoredMetrics,
        sessionId: CIPHER_CONFIG.sessionId, // Keep new session ID
        startedAt: restoredMetrics.startedAt, // Keep original start
        deviceFingerprint: metrics.deviceFingerprint, // Use fresh fingerprint
      };

      // Notify parent
      postSessionRestored(restored.questionIndex);
    }

    // Attach event listeners
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('click', onMouseClick, { passive: true });
    document.addEventListener('keydown', onKeyDown, { passive: true });
    document.addEventListener('keyup', onKeyUp, { passive: true });

    // Tier 2+: Focus and paste tracking
    if (CIPHER_CONFIG.tier >= 2) {
      window.addEventListener('focus', onFocus);
      window.addEventListener('blur', onBlur);
      document.addEventListener('visibilitychange', onVisibilityChange);
      document.addEventListener('paste', onPaste);
    }

    // Tier 3+: Scroll and hover
    if (CIPHER_CONFIG.tier >= 3) {
      document.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('mouseover', onMouseOver, { passive: true });
      document.addEventListener('mouseout', onMouseOut, { passive: true });
    }

    // Tier 4+: Copy events
    if (CIPHER_CONFIG.tier >= 4) {
      document.addEventListener('copy', onCopy);
    }

    // Periodic metrics posting
    setInterval(postMetricsToParent, CIPHER_CONFIG.metricsInterval);

    // Periodic session save
    setInterval(saveSession, CIPHER_CONFIG.saveInterval);

    // Save on visibility change (user leaving)
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        saveSession();
      }
    });

    // Save on beforeunload
    window.addEventListener('beforeunload', saveSession);

    // Initial metrics post
    setTimeout(postMetricsToParent, 1000);
  }

  // Start tracking
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
</script>
`;
}

/**
 * Types for behavioral metrics (matching what the tracker collects)
 */
export interface BehavioralMetrics {
  sessionId: string;
  startedAt: number;
  duration: number;
  lastActiveAt: number;

  // Mouse
  mouseMovements: Array<{ x: number; y: number; t: number; velocity: number }>;
  mouseClicks: Array<{ x: number; y: number; t: number; hadHover: boolean }>;
  mouseMovementCount: number;
  avgMouseVelocity: number;

  // Keyboard
  keystrokeDynamics: Array<{
    key: string;
    downAt: number;
    upAt: number;
    dwell: number;
    flightTime: number;
  }>;
  keypressCount: number;
  backspaceCount: number;
  avgKeystrokeDwell: number;
  keystrokeVariance: number;

  // Scroll
  scrollEvents: Array<{ y: number; t: number; velocity: number }>;
  scrollEventCount: number;

  // Focus
  focusEvents: Array<{ type: string; t: number }>;
  tabSwitchCount: number;
  totalBlurDuration: number;

  // Interaction
  pasteEvents: number;
  copyEvents: number;

  // Hover
  hoverEvents: Array<{ element: string; duration: number; t: number }>;

  // Question timing
  responseTime: number[];
  questionStartTimes: Record<string, number>;

  // Device
  deviceFingerprint: DeviceFingerprint | null;

  // Config
  tier: CipherTier;
}

export interface DeviceFingerprint {
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  timezone: string;
  timezoneOffset: number;
  screenWidth: number;
  screenHeight: number;
  screenAvailWidth: number;
  screenAvailHeight: number;
  colorDepth: number;
  pixelRatio: number;
  touchSupport: boolean;
  maxTouchPoints: number;
  hardwareConcurrency: number;
  deviceMemory: number;
  cookiesEnabled: boolean;
  webDriver: boolean;
  automationDetected: boolean;
  canvasFingerprint: string | null;
  webglVendor: string | null;
  webglRenderer: string | null;
  pluginCount: number;
  collectedAt: number;
}
