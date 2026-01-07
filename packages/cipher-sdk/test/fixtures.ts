/**
 * Test fixtures for Cipher SDK
 *
 * Contains mock data for testing different validation scenarios.
 */

import type {
  ValidationInput,
  ResponseInput,
  BehavioralMetrics,
  DeviceInfo,
  MouseMovement,
  KeystrokeEvent,
  MouseClick,
  ScrollEvent,
  FocusEvent,
} from '../src/types';

// =============================================================================
// RESPONSE FIXTURES
// =============================================================================

/**
 * High-quality, legitimate survey responses
 */
export const legitimateResponses: ResponseInput[] = [
  {
    question: 'What do you like most about our product?',
    answer: 'I really appreciate the intuitive interface and how easy it is to navigate. The customer support team has also been incredibly helpful whenever I had questions.',
    questionType: 'text',
    responseTimeMs: 45000, // 45 seconds - thoughtful
    questionIndex: 0,
  },
  {
    question: 'How would you rate our service? (1-5)',
    answer: '4',
    questionType: 'rating',
    responseTimeMs: 3000,
    questionIndex: 1,
  },
  {
    question: 'How likely are you to recommend us? (1-10)',
    answer: '8',
    questionType: 'scale',
    responseTimeMs: 4000,
    questionIndex: 2,
  },
  {
    question: 'What improvements would you suggest?',
    answer: 'It would be great to have a mobile app version. Also, adding dark mode would be helpful for late-night work sessions.',
    questionType: 'text',
    responseTimeMs: 38000,
    questionIndex: 3,
  },
  {
    question: 'Which features do you use most?',
    answer: 'Dashboard',
    questionType: 'multiple_choice',
    responseTimeMs: 5000,
    questionIndex: 4,
  },
];

/**
 * Low-effort/spam responses
 */
export const spamResponses: ResponseInput[] = [
  {
    question: 'What do you like most about our product?',
    answer: 'good',
    questionType: 'text',
    responseTimeMs: 1200, // Way too fast
    questionIndex: 0,
  },
  {
    question: 'How would you rate our service? (1-5)',
    answer: '5',
    questionType: 'rating',
    responseTimeMs: 500,
    questionIndex: 1,
  },
  {
    question: 'How likely are you to recommend us? (1-10)',
    answer: '5',
    questionType: 'scale',
    responseTimeMs: 400,
    questionIndex: 2,
  },
  {
    question: 'What improvements would you suggest?',
    answer: 'n/a',
    questionType: 'text',
    responseTimeMs: 800,
    questionIndex: 3,
  },
  {
    question: 'Which features do you use most?',
    answer: 'Dashboard',
    questionType: 'multiple_choice',
    responseTimeMs: 300,
    questionIndex: 4,
  },
];

/**
 * Straight-lining responses (same answer for all scale questions)
 */
export const straightLiningResponses: ResponseInput[] = [
  {
    question: 'How satisfied are you with feature A? (1-5)',
    answer: '3',
    questionType: 'rating',
    responseTimeMs: 2000,
    questionIndex: 0,
  },
  {
    question: 'How satisfied are you with feature B? (1-5)',
    answer: '3',
    questionType: 'rating',
    responseTimeMs: 1800,
    questionIndex: 1,
  },
  {
    question: 'How satisfied are you with feature C? (1-5)',
    answer: '3',
    questionType: 'rating',
    responseTimeMs: 1900,
    questionIndex: 2,
  },
  {
    question: 'How satisfied are you with feature D? (1-5)',
    answer: '3',
    questionType: 'rating',
    responseTimeMs: 1700,
    questionIndex: 3,
  },
  {
    question: 'How satisfied are you with feature E? (1-5)',
    answer: '3',
    questionType: 'rating',
    responseTimeMs: 1850,
    questionIndex: 4,
  },
  {
    question: 'How satisfied are you with feature F? (1-5)',
    answer: '3',
    questionType: 'rating',
    responseTimeMs: 1750,
    questionIndex: 5,
  },
];

/**
 * Bot-like rapid completion
 */
export const botResponses: ResponseInput[] = [
  {
    question: 'Describe your experience',
    answer: 'The experience was satisfactory and met expectations adequately.',
    questionType: 'text',
    responseTimeMs: 800, // Impossibly fast for this text length
    questionIndex: 0,
  },
  {
    question: 'Rate overall satisfaction (1-5)',
    answer: '4',
    questionType: 'rating',
    responseTimeMs: 100, // Way too fast
    questionIndex: 1,
  },
  {
    question: 'Additional comments',
    answer: 'No additional comments at this time. Thank you for the survey.',
    questionType: 'text',
    responseTimeMs: 500, // Impossibly fast
    questionIndex: 2,
  },
];

// =============================================================================
// BEHAVIORAL METRICS FIXTURES
// =============================================================================

/**
 * Normal human behavioral metrics
 */
export const normalBehavior: BehavioralMetrics = {
  sessionId: 'test-session-001',
  startedAt: Date.now() - 180000,
  duration: 180000, // 3 minutes
  lastActiveAt: Date.now(),
  mouseMovements: generateHumanMouseMovements(100),
  mouseClicks: generateHumanClicks(15),
  mouseMovementCount: 450,
  avgMouseVelocity: 8.5,
  keystrokeDynamics: generateHumanKeystrokes(50),
  keypressCount: 280,
  backspaceCount: 28,
  avgKeystrokeDwell: 120,
  keystrokeVariance: 0.35,
  scrollEvents: generateHumanScrolls(10),
  scrollEventCount: 35,
  focusEvents: [{ type: 'focus', t: 0 }, { type: 'blur', t: 60000 }, { type: 'focus', t: 65000 }],
  tabSwitchCount: 2,
  totalBlurDuration: 5000,
  pasteEvents: 0,
  copyEvents: 0,
  hoverEvents: [],
  responseTime: [45000, 3000, 4000, 38000, 5000],
  questionStartTimes: { 'q0': 0, 'q1': 45000, 'q2': 48000, 'q3': 52000, 'q4': 90000 },
};

/**
 * Bot-like behavioral metrics
 */
export const botBehavior: BehavioralMetrics = {
  sessionId: 'test-session-bot',
  startedAt: Date.now() - 15000,
  duration: 15000, // 15 seconds - way too fast
  lastActiveAt: Date.now(),
  mouseMovements: generateRoboticMouseMovements(20),
  mouseClicks: generateRoboticClicks(5),
  mouseMovementCount: 20,
  avgMouseVelocity: 10, // Constant
  keystrokeDynamics: [], // No typing
  keypressCount: 0,
  backspaceCount: 0, // No corrections
  avgKeystrokeDwell: 0,
  keystrokeVariance: 0,
  scrollEvents: generateRoboticScrolls(2),
  scrollEventCount: 2,
  focusEvents: [{ type: 'focus', t: 0 }],
  tabSwitchCount: 0,
  totalBlurDuration: 0,
  pasteEvents: 5, // All pasted
  copyEvents: 0,
  hoverEvents: [],
  responseTime: [800, 100, 500],
  questionStartTimes: { 'q0': 0, 'q1': 800, 'q2': 900 },
};

/**
 * Suspicious behavioral metrics (paste-heavy)
 */
export const pasteHeavyBehavior: BehavioralMetrics = {
  sessionId: 'test-session-paste',
  startedAt: Date.now() - 60000,
  duration: 60000, // 1 minute
  lastActiveAt: Date.now(),
  mouseMovements: generateHumanMouseMovements(50),
  mouseClicks: generateHumanClicks(8),
  mouseMovementCount: 150,
  avgMouseVelocity: 7.2,
  keystrokeDynamics: generateHumanKeystrokes(10),
  keypressCount: 10,
  backspaceCount: 0,
  avgKeystrokeDwell: 110,
  keystrokeVariance: 0.28,
  scrollEvents: generateHumanScrolls(5),
  scrollEventCount: 8,
  focusEvents: [
    { type: 'focus', t: 0 },
    { type: 'blur', t: 5000 },
    { type: 'focus', t: 10000 },
    { type: 'blur', t: 15000 },
    { type: 'focus', t: 25000 },
    { type: 'blur', t: 30000 },
    { type: 'focus', t: 50000 },
  ],
  tabSwitchCount: 12, // Many tab switches
  totalBlurDuration: 40000, // 66% time away
  pasteEvents: 8, // Heavy pasting
  copyEvents: 0,
  hoverEvents: [],
  responseTime: [15000, 8000, 12000, 18000, 7000],
  questionStartTimes: { 'q0': 0, 'q1': 15000, 'q2': 23000, 'q3': 35000, 'q4': 53000 },
};

// =============================================================================
// DEVICE INFO FIXTURES
// =============================================================================

/**
 * Normal desktop device
 */
export const normalDevice: DeviceInfo = {
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  platform: 'MacIntel',
  language: 'en-US',
  languages: ['en-US', 'en'],
  timezone: 'America/New_York',
  timezoneOffset: 300,
  screenWidth: 1920,
  screenHeight: 1080,
  screenAvailWidth: 1920,
  screenAvailHeight: 1055,
  colorDepth: 24,
  pixelRatio: 2,
  touchSupport: false,
  maxTouchPoints: 0,
  hardwareConcurrency: 8,
  deviceMemory: 16,
  cookiesEnabled: true,
  webDriver: false,
  automationDetected: false,
  canvasFingerprint: 'abc123xyz',
  webglVendor: 'Apple Inc.',
  webglRenderer: 'Apple M1',
  pluginCount: 5,
  collectedAt: Date.now(),
};

/**
 * Normal mobile device
 */
export const mobileDevice: DeviceInfo = {
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  platform: 'iPhone',
  language: 'en-US',
  languages: ['en-US'],
  timezone: 'America/Los_Angeles',
  timezoneOffset: 480,
  screenWidth: 390,
  screenHeight: 844,
  screenAvailWidth: 390,
  screenAvailHeight: 844,
  colorDepth: 24,
  pixelRatio: 3,
  touchSupport: true,
  maxTouchPoints: 5,
  hardwareConcurrency: 6,
  deviceMemory: 4,
  cookiesEnabled: true,
  webDriver: false,
  automationDetected: false,
  canvasFingerprint: 'mobile123',
  webglVendor: 'Apple Inc.',
  webglRenderer: 'Apple GPU',
  pluginCount: 0, // Normal for mobile
  collectedAt: Date.now(),
};

/**
 * Headless browser / bot device
 */
export const headlessDevice: DeviceInfo = {
  userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36',
  platform: 'Linux x86_64',
  language: 'en-US',
  languages: ['en-US'],
  timezone: 'UTC',
  timezoneOffset: 0,
  screenWidth: 800,
  screenHeight: 600,
  screenAvailWidth: 800,
  screenAvailHeight: 600,
  colorDepth: 24,
  pixelRatio: 1,
  touchSupport: false,
  maxTouchPoints: 0,
  hardwareConcurrency: 4,
  deviceMemory: 8,
  cookiesEnabled: true,
  webDriver: true,
  automationDetected: true,
  canvasFingerprint: null,
  webglVendor: null,
  webglRenderer: null,
  pluginCount: 0,
  collectedAt: Date.now(),
};

/**
 * Spoofed/mismatched device
 */
export const spoofedDevice: DeviceInfo = {
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  platform: 'Win32',
  language: 'en-US',
  languages: ['en-US'],
  timezone: 'America/New_York',
  timezoneOffset: 1000, // Invalid offset
  screenWidth: 1920,
  screenHeight: 1080,
  screenAvailWidth: 2000, // Impossible: larger than screen
  screenAvailHeight: 1200,
  colorDepth: 24,
  pixelRatio: 0, // Invalid
  touchSupport: true,
  maxTouchPoints: 0, // Mismatch with touchSupport
  hardwareConcurrency: 256, // Impossible
  deviceMemory: 512, // Impossible
  cookiesEnabled: true,
  webDriver: false,
  automationDetected: false,
  canvasFingerprint: 'spoofed',
  webglVendor: 'Spoofed Vendor',
  webglRenderer: 'Spoofed Renderer',
  pluginCount: 0,
  collectedAt: Date.now(),
};

// =============================================================================
// COMPLETE VALIDATION INPUT FIXTURES
// =============================================================================

/**
 * Legitimate survey submission
 */
export const legitimateSubmission: ValidationInput = {
  responses: legitimateResponses,
  behavioralMetrics: normalBehavior,
  deviceInfo: normalDevice,
  context: {
    surveyId: 'test-survey-1',
    expectedMinTime: 60000, // 1 minute minimum
    expectedMaxTime: 600000, // 10 minutes max
    questionCount: 5,
  },
};

/**
 * Spam/low-effort submission
 */
export const spamSubmission: ValidationInput = {
  responses: spamResponses,
  behavioralMetrics: botBehavior,
  deviceInfo: normalDevice,
  context: {
    surveyId: 'test-survey-1',
    expectedMinTime: 60000,
    expectedMaxTime: 600000,
    questionCount: 5,
  },
};

/**
 * Bot submission
 */
export const botSubmission: ValidationInput = {
  responses: botResponses,
  behavioralMetrics: botBehavior,
  deviceInfo: headlessDevice,
  context: {
    surveyId: 'test-survey-1',
    expectedMinTime: 60000,
    expectedMaxTime: 600000,
    questionCount: 3,
  },
};

/**
 * Straight-lining submission
 */
export const straightLiningSubmission: ValidationInput = {
  responses: straightLiningResponses,
  behavioralMetrics: normalBehavior,
  deviceInfo: normalDevice,
  context: {
    surveyId: 'test-survey-2',
    expectedMinTime: 30000,
    expectedMaxTime: 300000,
    questionCount: 6,
  },
};

/**
 * AI-assisted submission (paste-heavy)
 */
export const aiAssistedSubmission: ValidationInput = {
  responses: legitimateResponses,
  behavioralMetrics: pasteHeavyBehavior,
  deviceInfo: normalDevice,
  context: {
    surveyId: 'test-survey-1',
    expectedMinTime: 60000,
    expectedMaxTime: 600000,
    questionCount: 5,
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateHumanMouseMovements(count: number): MouseMovement[] {
  const movements: MouseMovement[] = [];
  let x = 500;
  let y = 400;
  let t = 0;

  for (let i = 0; i < count; i++) {
    // Human-like random movement with varying velocities
    const dx = (Math.random() - 0.5) * 100;
    const dy = (Math.random() - 0.5) * 100;
    const dt = 16 + Math.random() * 50; // 16-66ms between movements

    x = Math.max(0, Math.min(1920, x + dx));
    y = Math.max(0, Math.min(1080, y + dy));
    t += dt;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const velocity = distance / dt;

    movements.push({ x, y, t, velocity });
  }

  return movements;
}

function generateRoboticMouseMovements(count: number): MouseMovement[] {
  const movements: MouseMovement[] = [];
  let x = 0;
  let y = 0;
  let t = 0;

  for (let i = 0; i < count; i++) {
    // Perfectly linear movement at constant speed
    x += 100;
    y += 50;
    t += 10; // Uniform timing

    movements.push({ x, y, t, velocity: 10 }); // Constant velocity
  }

  return movements;
}

function generateHumanKeystrokes(count: number): KeystrokeEvent[] {
  const keystrokes: KeystrokeEvent[] = [];
  let t = 0;

  for (let i = 0; i < count; i++) {
    // Human typing has variable dwell and flight times
    const dwell = 80 + Math.random() * 120; // 80-200ms key hold
    const flightTime = 100 + Math.random() * 200; // 100-300ms between keys
    const downAt = t;
    const upAt = t + dwell;

    keystrokes.push({
      key: String.fromCharCode(97 + Math.floor(Math.random() * 26)),
      downAt,
      upAt,
      dwell,
      flightTime,
    });

    t = upAt + flightTime;
  }

  return keystrokes;
}

function generateHumanClicks(count: number): MouseClick[] {
  const clicks: MouseClick[] = [];
  let t = 0;

  for (let i = 0; i < count; i++) {
    clicks.push({
      x: Math.random() * 1920,
      y: Math.random() * 1080,
      t,
      hadHover: Math.random() > 0.2, // 80% have hover first
    });

    t += 2000 + Math.random() * 5000; // 2-7 seconds between clicks
  }

  return clicks;
}

function generateRoboticClicks(count: number): MouseClick[] {
  const clicks: MouseClick[] = [];
  let t = 0;

  for (let i = 0; i < count; i++) {
    clicks.push({
      x: 500 + i * 100,
      y: 300,
      t,
      hadHover: false, // No hover before click
    });

    t += 500; // Uniform 500ms between clicks
  }

  return clicks;
}

function generateHumanScrolls(count: number): ScrollEvent[] {
  const scrolls: ScrollEvent[] = [];
  let y = 0;
  let t = 0;

  for (let i = 0; i < count; i++) {
    const deltaY = (Math.random() - 0.3) * 200;
    y += deltaY;
    scrolls.push({
      y,
      velocity: 2 + Math.random() * 8, // Variable velocity
      t,
    });

    t += 500 + Math.random() * 2000;
  }

  return scrolls;
}

function generateRoboticScrolls(count: number): ScrollEvent[] {
  const scrolls: ScrollEvent[] = [];
  let y = 0;
  let t = 0;

  for (let i = 0; i < count; i++) {
    y += 100;
    scrolls.push({
      y,
      velocity: 5, // Constant velocity
      t,
    });

    t += 1000; // Uniform timing
  }

  return scrolls;
}
