import "./globals.css";

export const metadata = {
  title: "Survey Preview",
};

// Cipher Tracker Script - Self-contained behavioral tracking for fraud detection
// Waits for CIPHER_INIT message from parent window to start tracking
const cipherTrackerScript = `
(function() {
  'use strict';

  // ============================================
  // CIPHER TRACKER - Fraud Detection Metrics
  // ============================================

  let CIPHER_CONFIG = {
    enabled: false,
    initialized: false,
    projectId: null,
    tier: 3,
    sessionId: null,
    resumeEnabled: true,
    resumeWindowHours: 48,
    metricsInterval: 10000,
    saveInterval: 5000,
  };

  const MAX_MOUSE_SAMPLES = 500;
  const MAX_KEYSTROKE_SAMPLES = 200;
  const MAX_SCROLL_SAMPLES = 100;
  const STORAGE_KEY_PREFIX = 'cipher_session_';

  // ============================================
  // METRICS STORAGE
  // ============================================

  let metrics = {
    sessionId: null,
    startedAt: null,
    lastActiveAt: null,
    mouseMovements: [],
    mouseClicks: [],
    lastMousePos: null,
    lastMouseTime: null,
    keystrokeDynamics: [],
    keydownTimes: {},
    backspaceCount: 0,
    keypressCount: 0,
    lastKeyTime: null,
    scrollEvents: [],
    lastScrollY: 0,
    lastScrollTime: null,
    focusEvents: [],
    tabSwitchCount: 0,
    totalBlurDuration: 0,
    blurStartTime: null,
    pasteEvents: 0,
    copyEvents: 0,
    hoverEvents: [],
    currentHover: null,
    questionStartTimes: {},
    responseTime: [],
    deviceFingerprint: null,
  };

  let metricsInterval = null;
  let saveInterval = null;
  let listenersAttached = false;

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
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 0,
      deviceMemory: navigator.deviceMemory || 0,
      cookiesEnabled: navigator.cookieEnabled,
      webDriver: navigator.webdriver === true,
      automationDetected: !!(
        window.callPhantom || window._phantom || window.phantom ||
        window.__nightmare || window.domAutomation || window.domAutomationController ||
        document.__selenium_unwrapped || document.__webdriver_script_fn ||
        document.__driver_evaluate || document.__webdriver_evaluate
      ),
      canvasFingerprint: getCanvasFingerprint(),
      webglVendor: getWebGLInfo().vendor,
      webglRenderer: getWebGLInfo().renderer,
      pluginCount: navigator.plugins ? navigator.plugins.length : 0,
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
      return canvas.toDataURL().slice(-50);
    } catch (e) { return null; }
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
    } catch (e) { return { vendor: null, renderer: null }; }
  }

  // ============================================
  // SESSION PERSISTENCE
  // ============================================

  function getStorageKey() {
    return STORAGE_KEY_PREFIX + CIPHER_CONFIG.projectId;
  }

  function saveSession() {
    if (!CIPHER_CONFIG.enabled || !CIPHER_CONFIG.resumeEnabled || !CIPHER_CONFIG.projectId) return;
    try {
      const sessionData = {
        metrics: {
          ...metrics,
          mouseMovements: metrics.mouseMovements.slice(-MAX_MOUSE_SAMPLES),
          keystrokeDynamics: metrics.keystrokeDynamics.slice(-MAX_KEYSTROKE_SAMPLES),
          scrollEvents: metrics.scrollEvents.slice(-MAX_SCROLL_SAMPLES),
        },
        questionIndex: window.__cipherCurrentQuestionIndex || 0,
        savedAt: Date.now(),
      };
      localStorage.setItem(getStorageKey(), JSON.stringify(sessionData));
    } catch (e) {}
  }

  function restoreSession() {
    if (!CIPHER_CONFIG.resumeEnabled || !CIPHER_CONFIG.projectId) return null;
    try {
      const saved = localStorage.getItem(getStorageKey());
      if (!saved) return null;
      const data = JSON.parse(saved);
      const hoursAgo = (Date.now() - data.savedAt) / (1000 * 60 * 60);
      if (hoursAgo > CIPHER_CONFIG.resumeWindowHours) {
        localStorage.removeItem(getStorageKey());
        return null;
      }
      return data;
    } catch (e) {
      try { localStorage.removeItem(getStorageKey()); } catch (e2) {}
      return null;
    }
  }

  function clearSession() {
    try {
      if (CIPHER_CONFIG.projectId) {
        localStorage.removeItem(getStorageKey());
      }
    } catch (e) {}
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================

  function onMouseMove(e) {
    if (!CIPHER_CONFIG.enabled) return;
    const now = Date.now();
    const x = e.clientX;
    const y = e.clientY;
    let velocity = 0;
    if (metrics.lastMousePos && metrics.lastMouseTime) {
      const dx = x - metrics.lastMousePos.x;
      const dy = y - metrics.lastMousePos.y;
      const dt = now - metrics.lastMouseTime;
      if (dt > 0) velocity = Math.sqrt(dx * dx + dy * dy) / dt;
    }
    metrics.mouseMovements.push({ x, y, t: now, velocity });
    metrics.lastMousePos = { x, y };
    metrics.lastMouseTime = now;
    metrics.lastActiveAt = now;
    if (metrics.mouseMovements.length > MAX_MOUSE_SAMPLES * 2) {
      metrics.mouseMovements = metrics.mouseMovements.slice(-MAX_MOUSE_SAMPLES);
    }
  }

  function onMouseClick(e) {
    if (!CIPHER_CONFIG.enabled) return;
    const now = Date.now();
    const hadHover = metrics.currentHover && (now - metrics.currentHover.startTime) > 100;
    metrics.mouseClicks.push({ x: e.clientX, y: e.clientY, t: now, hadHover });
    metrics.lastActiveAt = now;
  }

  function onKeyDown(e) {
    if (!CIPHER_CONFIG.enabled) return;
    const now = Date.now();
    const key = e.key;
    if (!metrics.keydownTimes[key]) metrics.keydownTimes[key] = now;
    if (key === 'Backspace') metrics.backspaceCount++;
    metrics.keypressCount++;
    metrics.lastActiveAt = now;
  }

  function onKeyUp(e) {
    if (!CIPHER_CONFIG.enabled) return;
    const now = Date.now();
    const key = e.key;
    const downTime = metrics.keydownTimes[key];
    if (downTime) {
      const dwell = now - downTime;
      let flightTime = 0;
      if (metrics.lastKeyTime) flightTime = downTime - metrics.lastKeyTime;
      metrics.keystrokeDynamics.push({
        key: key.length === 1 ? '*' : key,
        downAt: downTime, upAt: now, dwell, flightTime,
      });
      delete metrics.keydownTimes[key];
      metrics.lastKeyTime = now;
    }
    if (metrics.keystrokeDynamics.length > MAX_KEYSTROKE_SAMPLES * 2) {
      metrics.keystrokeDynamics = metrics.keystrokeDynamics.slice(-MAX_KEYSTROKE_SAMPLES);
    }
  }

  function onScroll() {
    if (!CIPHER_CONFIG.enabled || CIPHER_CONFIG.tier < 3) return;
    const now = Date.now();
    const y = window.scrollY;
    let velocity = 0;
    if (metrics.lastScrollTime) {
      const dy = y - metrics.lastScrollY;
      const dt = now - metrics.lastScrollTime;
      if (dt > 0) velocity = dy / dt;
    }
    metrics.scrollEvents.push({ y, t: now, velocity });
    metrics.lastScrollY = y;
    metrics.lastScrollTime = now;
    metrics.lastActiveAt = now;
    if (metrics.scrollEvents.length > MAX_SCROLL_SAMPLES * 2) {
      metrics.scrollEvents = metrics.scrollEvents.slice(-MAX_SCROLL_SAMPLES);
    }
  }

  function onFocus() {
    if (!CIPHER_CONFIG.enabled || CIPHER_CONFIG.tier < 2) return;
    const now = Date.now();
    metrics.focusEvents.push({ type: 'focus', t: now });
    if (metrics.blurStartTime) {
      metrics.totalBlurDuration += now - metrics.blurStartTime;
      metrics.blurStartTime = null;
    }
    metrics.lastActiveAt = now;
  }

  function onBlur() {
    if (!CIPHER_CONFIG.enabled || CIPHER_CONFIG.tier < 2) return;
    const now = Date.now();
    metrics.focusEvents.push({ type: 'blur', t: now });
    metrics.blurStartTime = now;
    metrics.tabSwitchCount++;
  }

  function onVisibilityChange() {
    if (!CIPHER_CONFIG.enabled || CIPHER_CONFIG.tier < 2) return;
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

  function onPaste() {
    if (!CIPHER_CONFIG.enabled || CIPHER_CONFIG.tier < 2) return;
    metrics.pasteEvents++;
    metrics.lastActiveAt = Date.now();
  }

  function onCopy() {
    if (!CIPHER_CONFIG.enabled || CIPHER_CONFIG.tier < 4) return;
    metrics.copyEvents++;
    metrics.lastActiveAt = Date.now();
  }

  function onMouseOver(e) {
    if (!CIPHER_CONFIG.enabled || CIPHER_CONFIG.tier < 3) return;
    const target = e.target;
    if (target && target.tagName) {
      metrics.currentHover = { element: target.tagName.toLowerCase(), startTime: Date.now() };
    }
  }

  function onMouseOut() {
    if (!CIPHER_CONFIG.enabled || CIPHER_CONFIG.tier < 3) return;
    if (metrics.currentHover) {
      const duration = Date.now() - metrics.currentHover.startTime;
      if (duration > 50) {
        metrics.hoverEvents.push({ element: metrics.currentHover.element, duration, t: Date.now() });
      }
      metrics.currentHover = null;
    }
  }

  // ============================================
  // METRICS SNAPSHOT
  // ============================================

  function getMetricsSnapshot() {
    const now = Date.now();
    const mouseVelocities = metrics.mouseMovements.map(m => m.velocity).filter(v => v > 0);
    const avgMouseVelocity = mouseVelocities.length > 0
      ? mouseVelocities.reduce((a, b) => a + b, 0) / mouseVelocities.length : 0;
    const keystrokeDwells = metrics.keystrokeDynamics.map(k => k.dwell).filter(d => d > 0);
    const avgKeystrokeDwell = keystrokeDwells.length > 0
      ? keystrokeDwells.reduce((a, b) => a + b, 0) / keystrokeDwells.length : 0;

    return {
      sessionId: metrics.sessionId,
      startedAt: metrics.startedAt,
      duration: metrics.startedAt ? now - metrics.startedAt : 0,
      lastActiveAt: metrics.lastActiveAt,
      mouseMovements: metrics.mouseMovements.slice(-MAX_MOUSE_SAMPLES),
      mouseClicks: metrics.mouseClicks,
      mouseMovementCount: metrics.mouseMovements.length,
      avgMouseVelocity,
      keystrokeDynamics: metrics.keystrokeDynamics.slice(-MAX_KEYSTROKE_SAMPLES),
      keypressCount: metrics.keypressCount,
      backspaceCount: metrics.backspaceCount,
      avgKeystrokeDwell,
      scrollEvents: metrics.scrollEvents.slice(-MAX_SCROLL_SAMPLES),
      scrollEventCount: metrics.scrollEvents.length,
      focusEvents: metrics.focusEvents,
      tabSwitchCount: metrics.tabSwitchCount,
      totalBlurDuration: metrics.totalBlurDuration + (metrics.blurStartTime ? now - metrics.blurStartTime : 0),
      pasteEvents: metrics.pasteEvents,
      copyEvents: metrics.copyEvents,
      hoverEvents: metrics.hoverEvents,
      responseTime: metrics.responseTime,
      questionStartTimes: metrics.questionStartTimes,
      deviceFingerprint: metrics.deviceFingerprint,
      tier: CIPHER_CONFIG.tier,
    };
  }

  // ============================================
  // COMMUNICATION WITH PARENT
  // ============================================

  function postMetricsToParent() {
    if (!CIPHER_CONFIG.enabled) return;
    try {
      window.parent.postMessage({ type: 'CIPHER_METRICS', metrics: getMetricsSnapshot() }, '*');
    } catch (e) {}
  }

  let lastEventPost = 0;
  const EVENT_POST_DEBOUNCE = 2000;

  function postMetricsOnEvent(eventType) {
    if (!CIPHER_CONFIG.enabled) return;
    const now = Date.now();
    if (now - lastEventPost > EVENT_POST_DEBOUNCE) {
      lastEventPost = now;
      try {
        window.parent.postMessage({ type: 'METRICS_UPDATE', eventType, metrics: getMetricsSnapshot(), timestamp: now }, '*');
      } catch (e) {}
    }
  }

  // ============================================
  // EVENT LISTENER MANAGEMENT
  // ============================================

  function attachListeners() {
    if (listenersAttached) return;
    listenersAttached = true;
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    document.addEventListener('click', onMouseClick, { passive: true });
    document.addEventListener('keydown', onKeyDown, { passive: true });
    document.addEventListener('keyup', onKeyUp, { passive: true });
    if (CIPHER_CONFIG.tier >= 2) {
      window.addEventListener('focus', onFocus);
      window.addEventListener('blur', onBlur);
      document.addEventListener('visibilitychange', onVisibilityChange);
      document.addEventListener('paste', onPaste);
    }
    if (CIPHER_CONFIG.tier >= 3) {
      document.addEventListener('scroll', onScroll, { passive: true });
      document.addEventListener('mouseover', onMouseOver, { passive: true });
      document.addEventListener('mouseout', onMouseOut, { passive: true });
    }
    if (CIPHER_CONFIG.tier >= 4) {
      document.addEventListener('copy', onCopy);
    }
  }

  function detachListeners() {
    if (!listenersAttached) return;
    listenersAttached = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('click', onMouseClick);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('blur', onBlur);
    document.removeEventListener('visibilitychange', onVisibilityChange);
    document.removeEventListener('paste', onPaste);
    document.removeEventListener('scroll', onScroll);
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('mouseout', onMouseOut);
    document.removeEventListener('copy', onCopy);
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  function initializeCipher(config) {
    if (CIPHER_CONFIG.initialized && CIPHER_CONFIG.enabled) return;

    CIPHER_CONFIG = { ...CIPHER_CONFIG, ...config, initialized: true };

    if (!CIPHER_CONFIG.enabled) {
      detachListeners();
      if (metricsInterval) { clearInterval(metricsInterval); metricsInterval = null; }
      if (saveInterval) { clearInterval(saveInterval); saveInterval = null; }
      return;
    }

    metrics.sessionId = CIPHER_CONFIG.sessionId || crypto.randomUUID();
    metrics.startedAt = Date.now();
    metrics.lastActiveAt = Date.now();
    metrics.deviceFingerprint = generateFingerprint();

    // Restore session if available
    const restored = restoreSession();
    if (restored) {
      const restoredMetrics = restored.metrics;
      metrics = {
        ...metrics,
        ...restoredMetrics,
        sessionId: metrics.sessionId,
        startedAt: restoredMetrics.startedAt,
        deviceFingerprint: metrics.deviceFingerprint,
      };
      try {
        window.parent.postMessage({
          type: 'CIPHER_SESSION_RESTORED',
          questionIndex: restored.questionIndex,
          sessionId: metrics.sessionId,
        }, '*');
      } catch (e) {}
    }

    attachListeners();

    // Start intervals
    if (metricsInterval) clearInterval(metricsInterval);
    metricsInterval = setInterval(postMetricsToParent, CIPHER_CONFIG.metricsInterval);

    if (saveInterval) clearInterval(saveInterval);
    saveInterval = setInterval(saveSession, CIPHER_CONFIG.saveInterval);

    // Save on visibility change
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) saveSession();
    });
    window.addEventListener('beforeunload', saveSession);

    // Initial metrics post
    setTimeout(postMetricsToParent, 1000);

    // Notify parent that Cipher is ready
    try {
      window.parent.postMessage({ type: 'CIPHER_READY', sessionId: metrics.sessionId }, '*');
    } catch (e) {}
  }

  // ============================================
  // MESSAGE HANDLING
  // ============================================

  window.addEventListener('message', function(e) {
    if (e.source !== window.parent) return;
    const data = e.data;
    if (!data || typeof data !== 'object') return;

    switch (data.type) {
      case 'CIPHER_INIT':
        initializeCipher(data.config || {});
        break;

      case 'SETTINGS_UPDATE':
        if (data.settings) {
          const newEnabled = data.settings.enabled;
          const newTier = data.settings.tier;

          if (typeof newEnabled === 'boolean' && newEnabled !== CIPHER_CONFIG.enabled) {
            CIPHER_CONFIG.enabled = newEnabled;
            if (newEnabled) {
              attachListeners();
              if (!metricsInterval) metricsInterval = setInterval(postMetricsToParent, CIPHER_CONFIG.metricsInterval);
              if (!saveInterval) saveInterval = setInterval(saveSession, CIPHER_CONFIG.saveInterval);
            } else {
              detachListeners();
              if (metricsInterval) { clearInterval(metricsInterval); metricsInterval = null; }
              if (saveInterval) { clearInterval(saveInterval); saveInterval = null; }
            }
          }

          if (typeof newTier === 'number' && newTier !== CIPHER_CONFIG.tier) {
            CIPHER_CONFIG.tier = newTier;
            if (CIPHER_CONFIG.enabled) {
              detachListeners();
              attachListeners();
            }
          }

          try {
            window.parent.postMessage({ type: 'SETTINGS_UPDATE_ACK', tier: CIPHER_CONFIG.tier, enabled: CIPHER_CONFIG.enabled }, '*');
          } catch (e) {}
        }
        break;

      case 'REQUEST_METRICS':
        postMetricsToParent();
        break;

      case 'TERMINATE_SESSION':
        clearSession();
        detachListeners();
        CIPHER_CONFIG.enabled = false;
        try {
          window.parent.postMessage({ type: 'SESSION_TERMINATED', reason: data.reason, sessionId: metrics.sessionId }, '*');
        } catch (e) {}
        break;
    }
  });

  // Intercept survey completion to include metrics
  window.addEventListener('message', function(e) {
    if (e.source !== window) return;
    const data = e.data;
    if (!data) return;

    if (data.type === 'survey-response' || data.type === 'SURVEY_COMPLETE') {
      clearSession();
      if (CIPHER_CONFIG.enabled) {
        try {
          window.parent.postMessage({
            type: 'SURVEY_COMPLETE',
            responses: data.responses || data.data,
            behavioralMetrics: getMetricsSnapshot(),
          }, '*');
        } catch (e) {}
      }
    }
  });

  // ============================================
  // GLOBAL HELPERS FOR SURVEY CODE
  // ============================================

  window.__cipherQuestionStart = function(questionId) {
    if (!CIPHER_CONFIG.enabled) return;
    metrics.questionStartTimes[questionId] = Date.now();
    window.__cipherCurrentQuestionIndex = Object.keys(metrics.questionStartTimes).length - 1;
    postMetricsOnEvent('question_start');
  };

  window.__cipherQuestionEnd = function(questionId) {
    if (!CIPHER_CONFIG.enabled) return;
    const startTime = metrics.questionStartTimes[questionId];
    if (startTime) {
      const timing = Date.now() - startTime;
      metrics.responseTime.push(timing);
      postMetricsOnEvent('question_answer');
      try {
        window.parent.postMessage({
          type: 'QUESTION_ANSWERED',
          questionId, questionIndex: window.__cipherCurrentQuestionIndex || 0,
          timing, sessionId: metrics.sessionId, timestamp: Date.now(),
        }, '*');
      } catch (e) {}
    }
  };

  window.__cipherPageChange = function(pageIndex, previousPage) {
    if (!CIPHER_CONFIG.enabled) return;
    try {
      window.parent.postMessage({
        type: 'PAGE_CHANGE',
        pageIndex, previousPage: previousPage || 0,
        sessionId: metrics.sessionId, timestamp: Date.now(),
      }, '*');
    } catch (e) {}
    postMetricsOnEvent('page_change');
  };

  // Notify parent that Cipher script is loaded (waiting for init)
  try {
    window.parent.postMessage({ type: 'CIPHER_LOADED' }, '*');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: cipherTrackerScript }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
