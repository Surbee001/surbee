/**
 * Cipher Synthetic Data Generator
 *
 * Generates realistic behavioral data for ML training.
 * Creates 50,000 samples across fraud and legitimate archetypes.
 */

import { CipherFeatures, FEATURE_NAMES, DEFAULT_FEATURES } from './types';

// ============================================
// RANDOM UTILITIES
// ============================================

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomBetween(min, max + 1));
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

// Log-normal distribution (realistic for human timing)
function logNormal(median: number, sigma = 0.5): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return median * Math.exp(sigma * z);
}

// Normal distribution
function normal(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + std * z;
}

// Clamp value between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================
// SURVEY LENGTH CONFIGURATIONS
// ============================================

type SurveyLength = 'short' | 'medium' | 'long';

interface SurveyConfig {
  questionCount: number;
  openEndedCount: number;
  expectedTimeMinutes: [number, number]; // [min, max] for legitimate
}

const SURVEY_CONFIGS: Record<SurveyLength, SurveyConfig> = {
  short: {
    questionCount: randomInt(5, 10),
    openEndedCount: randomInt(1, 2),
    expectedTimeMinutes: [0.5, 3],
  },
  medium: {
    questionCount: randomInt(15, 25),
    openEndedCount: randomInt(2, 4),
    expectedTimeMinutes: [2, 8],
  },
  long: {
    questionCount: randomInt(30, 50),
    openEndedCount: randomInt(3, 6),
    expectedTimeMinutes: [5, 20],
  },
};

function getSurveyConfig(length: SurveyLength): SurveyConfig {
  // Regenerate with fresh random values
  const configs: Record<SurveyLength, () => SurveyConfig> = {
    short: () => ({
      questionCount: randomInt(5, 10),
      openEndedCount: randomInt(1, 2),
      expectedTimeMinutes: [0.5, 3],
    }),
    medium: () => ({
      questionCount: randomInt(15, 25),
      openEndedCount: randomInt(2, 4),
      expectedTimeMinutes: [2, 8],
    }),
    long: () => ({
      questionCount: randomInt(30, 50),
      openEndedCount: randomInt(3, 6),
      expectedTimeMinutes: [5, 20],
    }),
  };
  return configs[length]();
}

// ============================================
// FRAUD ARCHETYPES
// ============================================

/**
 * Pure Bot - Zero interaction, automation flags
 */
function generatePureBot(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const completionTime = randomBetween(1, 15); // 1-15 seconds

  return {
    ...DEFAULT_FEATURES,

    // Behavioral - zero or near-zero
    mouseDistanceTotal: randomBetween(0, 10),
    mouseVelocityMean: 0,
    mouseVelocityStd: 0,
    mouseVelocityMax: 0,
    mouseAccelerationMean: 0,
    mouseCurvatureEntropy: 0,
    mouseStraightLineRatio: randomBoolean(0.3) ? 1 : 0,
    mousePauseCount: 0,
    keystrokeCount: randomInt(0, 5),
    keystrokeTimingMean: 0,
    keystrokeTimingStd: 0,
    keystrokeDwellMean: 0,
    keystrokeFlightMean: 0,
    backspaceRatio: 0,
    pasteEventCount: randomInt(0, 2),
    pasteCharRatio: randomBoolean(0.2) ? randomBetween(0.8, 1) : 0,
    scrollCount: randomInt(0, 3),
    scrollVelocityMean: 0,
    scrollDirectionChanges: 0,
    focusLossCount: 0,
    focusLossDurationTotal: 0,
    hoverCount: 0,
    hoverDurationMean: 0,
    clickCount: config.questionCount,
    hoverBeforeClickRatio: 0,

    // Temporal - very fast
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(0, 100), // Very uniform
    timePerQuestionMin: (completionTime * 1000) / config.questionCount * 0.8,
    timePerQuestionMax: (completionTime * 1000) / config.questionCount * 1.2,
    readingVsAnsweringRatio: 0,
    firstInteractionDelayMs: randomBetween(0, 100),
    idleTimeTotal: 0,
    activeTimeRatio: 1,
    responseAcceleration: 0,
    timeOfDayHour: randomInt(0, 23),
    dayOfWeek: randomInt(0, 6),

    // Device - automation detected
    hasWebdriver: randomBoolean(0.8),
    hasAutomationFlags: randomBoolean(0.9),
    pluginCount: randomInt(0, 2),
    screenResolutionCommon: randomBoolean(0.3),
    timezoneOffsetMinutes: randomChoice([0, -300, -480, 330]),
    timezoneMatchesIp: randomBoolean(0.3),
    fingerprintSeenCount: randomInt(1, 100),
    deviceMemoryGb: randomChoice([0, 2, 4]),
    hardwareConcurrency: randomChoice([1, 2, 4]),
    touchSupport: false,

    // Network - often datacenter
    isVpn: randomBoolean(0.4),
    isDatacenter: randomBoolean(0.7),
    isTor: randomBoolean(0.1),
    isProxy: randomBoolean(0.3),
    ipReputationScore: randomBetween(0, 0.3),
    ipCountryCode: randomChoice(['US', 'RU', 'CN', 'IN', 'BR', 'NG']),
    geoTimezoneMatch: randomBoolean(0.2),
    ipSeenCount: randomInt(5, 100),

    // Content - straight-lining
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(0, 20),
    openEndedLengthStd: randomBetween(0, 5),
    openEndedWordCountMean: randomBetween(0, 5),
    openEndedUniqueWordRatio: randomBetween(0, 0.3),
    straightLineRatio: randomBetween(0.7, 1),
    answerEntropy: randomBetween(0, 0.5),
    firstOptionRatio: randomBetween(0.6, 1),
    lastOptionRatio: randomBetween(0, 0.2),
    middleOptionRatio: randomBetween(0, 0.2),
    responseUniquenessScore: randomBetween(0, 0.3),
    duplicateAnswerRatio: randomBetween(0.5, 1),
    naRatio: randomBetween(0, 0.1),
    skipRatio: randomBetween(0, 0.1),

    // Honeypot
    attentionCheckPassed: randomBoolean(0.2),
    attentionCheckCount: randomInt(0, 2),
    consistencyCheckScore: randomBetween(0, 0.4),
    trapFieldFilled: randomBoolean(0.6),
    honeypotScore: randomBetween(0.5, 1),
  };
}

/**
 * Script/Automation - Has some interaction but mechanical
 */
function generateScriptBot(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const completionTime = randomBetween(10, 45);

  return {
    ...DEFAULT_FEATURES,

    // Behavioral - mechanical patterns
    mouseDistanceTotal: randomBetween(100, 1000),
    mouseVelocityMean: randomBetween(0.5, 1.5),
    mouseVelocityStd: randomBetween(0, 0.2), // Very uniform
    mouseVelocityMax: randomBetween(1, 3),
    mouseAccelerationMean: randomBetween(0, 0.01),
    mouseCurvatureEntropy: randomBetween(0, 0.3), // Straight lines
    mouseStraightLineRatio: randomBetween(0.7, 1),
    mousePauseCount: randomInt(0, 3),
    keystrokeCount: randomInt(10, 50),
    keystrokeTimingMean: randomBetween(50, 100),
    keystrokeTimingStd: randomBetween(0, 20), // Very uniform
    keystrokeDwellMean: randomBetween(50, 80),
    keystrokeFlightMean: randomBetween(50, 100),
    backspaceRatio: 0, // No corrections
    pasteEventCount: randomInt(0, 3),
    pasteCharRatio: randomBetween(0, 0.3),
    scrollCount: randomInt(5, 20),
    scrollVelocityMean: randomBetween(1, 3),
    scrollDirectionChanges: randomInt(0, 3),
    focusLossCount: 0,
    focusLossDurationTotal: 0,
    hoverCount: randomInt(0, 10),
    hoverDurationMean: randomBetween(0, 100),
    clickCount: config.questionCount + randomInt(0, 5),
    hoverBeforeClickRatio: randomBetween(0, 0.2),

    // Temporal - uniform timing
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(50, 300), // Low variance
    timePerQuestionMin: (completionTime * 1000) / config.questionCount * 0.9,
    timePerQuestionMax: (completionTime * 1000) / config.questionCount * 1.1,
    readingVsAnsweringRatio: randomBetween(0, 0.2),
    firstInteractionDelayMs: randomBetween(100, 500),
    idleTimeTotal: randomBetween(0, 2000),
    activeTimeRatio: randomBetween(0.9, 1),
    responseAcceleration: randomBetween(-0.1, 0.1),
    timeOfDayHour: randomInt(0, 23),
    dayOfWeek: randomInt(0, 6),

    // Device
    hasWebdriver: randomBoolean(0.5),
    hasAutomationFlags: randomBoolean(0.6),
    pluginCount: randomInt(0, 5),
    screenResolutionCommon: randomBoolean(0.5),
    timezoneOffsetMinutes: randomChoice([0, -300, -480, 330, -420]),
    timezoneMatchesIp: randomBoolean(0.4),
    fingerprintSeenCount: randomInt(1, 50),
    deviceMemoryGb: randomChoice([2, 4, 8]),
    hardwareConcurrency: randomChoice([2, 4, 8]),
    touchSupport: false,

    // Network
    isVpn: randomBoolean(0.5),
    isDatacenter: randomBoolean(0.5),
    isTor: randomBoolean(0.05),
    isProxy: randomBoolean(0.3),
    ipReputationScore: randomBetween(0.1, 0.5),
    ipCountryCode: randomChoice(['US', 'RU', 'CN', 'IN', 'PH', 'VN']),
    geoTimezoneMatch: randomBoolean(0.4),
    ipSeenCount: randomInt(3, 50),

    // Content
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(10, 50),
    openEndedLengthStd: randomBetween(0, 10),
    openEndedWordCountMean: randomBetween(2, 10),
    openEndedUniqueWordRatio: randomBetween(0.2, 0.5),
    straightLineRatio: randomBetween(0.5, 0.9),
    answerEntropy: randomBetween(0.3, 1),
    firstOptionRatio: randomBetween(0.4, 0.8),
    lastOptionRatio: randomBetween(0, 0.3),
    middleOptionRatio: randomBetween(0.1, 0.3),
    responseUniquenessScore: randomBetween(0.1, 0.4),
    duplicateAnswerRatio: randomBetween(0.3, 0.7),
    naRatio: randomBetween(0, 0.1),
    skipRatio: randomBetween(0, 0.05),

    // Honeypot
    attentionCheckPassed: randomBoolean(0.4),
    attentionCheckCount: randomInt(0, 2),
    consistencyCheckScore: randomBetween(0.2, 0.6),
    trapFieldFilled: randomBoolean(0.3),
    honeypotScore: randomBetween(0.3, 0.7),
  };
}

/**
 * Speed Runner - Very fast but some human traits
 */
function generateSpeedRunner(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const completionTime = randomBetween(15, 60);

  return {
    ...DEFAULT_FEATURES,

    // Behavioral - minimal but present
    mouseDistanceTotal: randomBetween(500, 2000),
    mouseVelocityMean: randomBetween(1, 3),
    mouseVelocityStd: randomBetween(0.2, 0.6),
    mouseVelocityMax: randomBetween(3, 8),
    mouseAccelerationMean: randomBetween(0.01, 0.03),
    mouseCurvatureEntropy: randomBetween(0.2, 0.6),
    mouseStraightLineRatio: randomBetween(0.4, 0.7),
    mousePauseCount: randomInt(1, 5),
    keystrokeCount: randomInt(20, 80),
    keystrokeTimingMean: randomBetween(80, 150),
    keystrokeTimingStd: randomBetween(10, 40),
    keystrokeDwellMean: randomBetween(60, 100),
    keystrokeFlightMean: randomBetween(80, 150),
    backspaceRatio: randomBetween(0, 0.02),
    pasteEventCount: randomInt(0, 2),
    pasteCharRatio: randomBetween(0, 0.2),
    scrollCount: randomInt(5, 25),
    scrollVelocityMean: randomBetween(2, 5),
    scrollDirectionChanges: randomInt(1, 5),
    focusLossCount: randomInt(0, 2),
    focusLossDurationTotal: randomBetween(0, 5000),
    hoverCount: randomInt(5, 20),
    hoverDurationMean: randomBetween(50, 200),
    clickCount: config.questionCount + randomInt(2, 10),
    hoverBeforeClickRatio: randomBetween(0.1, 0.4),

    // Temporal
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(200, 800),
    timePerQuestionMin: randomBetween(500, 1500),
    timePerQuestionMax: randomBetween(3000, 8000),
    readingVsAnsweringRatio: randomBetween(0.1, 0.3),
    firstInteractionDelayMs: randomBetween(200, 1000),
    idleTimeTotal: randomBetween(0, 5000),
    activeTimeRatio: randomBetween(0.85, 0.98),
    responseAcceleration: randomBetween(0, 0.3), // Speeding up
    timeOfDayHour: randomInt(0, 23),
    dayOfWeek: randomInt(0, 6),

    // Device - looks more normal
    hasWebdriver: randomBoolean(0.1),
    hasAutomationFlags: randomBoolean(0.15),
    pluginCount: randomInt(2, 10),
    screenResolutionCommon: randomBoolean(0.7),
    timezoneOffsetMinutes: randomChoice([-300, -360, -420, -480, 0, 60]),
    timezoneMatchesIp: randomBoolean(0.6),
    fingerprintSeenCount: randomInt(1, 20),
    deviceMemoryGb: randomChoice([4, 8, 16]),
    hardwareConcurrency: randomChoice([4, 8, 12]),
    touchSupport: randomBoolean(0.2),

    // Network
    isVpn: randomBoolean(0.3),
    isDatacenter: randomBoolean(0.2),
    isTor: randomBoolean(0.02),
    isProxy: randomBoolean(0.15),
    ipReputationScore: randomBetween(0.3, 0.6),
    ipCountryCode: randomChoice(['US', 'IN', 'PH', 'NG', 'KE', 'PK']),
    geoTimezoneMatch: randomBoolean(0.5),
    ipSeenCount: randomInt(1, 30),

    // Content - some straight-lining
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(15, 40),
    openEndedLengthStd: randomBetween(5, 15),
    openEndedWordCountMean: randomBetween(3, 8),
    openEndedUniqueWordRatio: randomBetween(0.3, 0.6),
    straightLineRatio: randomBetween(0.4, 0.7),
    answerEntropy: randomBetween(0.5, 1.2),
    firstOptionRatio: randomBetween(0.3, 0.6),
    lastOptionRatio: randomBetween(0.1, 0.3),
    middleOptionRatio: randomBetween(0.2, 0.4),
    responseUniquenessScore: randomBetween(0.2, 0.5),
    duplicateAnswerRatio: randomBetween(0.2, 0.5),
    naRatio: randomBetween(0, 0.05),
    skipRatio: randomBetween(0, 0.05),

    // Honeypot
    attentionCheckPassed: randomBoolean(0.5),
    attentionCheckCount: randomInt(0, 2),
    consistencyCheckScore: randomBetween(0.3, 0.7),
    trapFieldFilled: randomBoolean(0.15),
    honeypotScore: randomBetween(0.2, 0.5),
  };
}

/**
 * Straight-liner - Selects same options repeatedly
 */
function generateStraightLiner(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const completionTime = randomBetween(30, 120);
  const pattern = randomChoice(['first', 'last', 'alternating']);

  return {
    ...DEFAULT_FEATURES,

    // Behavioral - some human patterns
    mouseDistanceTotal: randomBetween(1000, 5000),
    mouseVelocityMean: randomBetween(0.8, 2),
    mouseVelocityStd: randomBetween(0.3, 0.8),
    mouseVelocityMax: randomBetween(3, 7),
    mouseAccelerationMean: randomBetween(0.01, 0.04),
    mouseCurvatureEntropy: randomBetween(0.3, 0.8),
    mouseStraightLineRatio: randomBetween(0.3, 0.6),
    mousePauseCount: randomInt(2, 10),
    keystrokeCount: randomInt(30, 100),
    keystrokeTimingMean: randomBetween(100, 200),
    keystrokeTimingStd: randomBetween(30, 80),
    keystrokeDwellMean: randomBetween(80, 130),
    keystrokeFlightMean: randomBetween(100, 180),
    backspaceRatio: randomBetween(0, 0.03),
    pasteEventCount: randomInt(0, 3),
    pasteCharRatio: randomBetween(0, 0.3),
    scrollCount: randomInt(10, 40),
    scrollVelocityMean: randomBetween(1, 4),
    scrollDirectionChanges: randomInt(2, 8),
    focusLossCount: randomInt(0, 3),
    focusLossDurationTotal: randomBetween(0, 10000),
    hoverCount: randomInt(10, 40),
    hoverDurationMean: randomBetween(100, 400),
    clickCount: config.questionCount + randomInt(5, 15),
    hoverBeforeClickRatio: randomBetween(0.2, 0.5),

    // Temporal
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(300, 1000),
    timePerQuestionMin: randomBetween(800, 2000),
    timePerQuestionMax: randomBetween(5000, 15000),
    readingVsAnsweringRatio: randomBetween(0.2, 0.4),
    firstInteractionDelayMs: randomBetween(500, 2000),
    idleTimeTotal: randomBetween(0, 10000),
    activeTimeRatio: randomBetween(0.75, 0.95),
    responseAcceleration: randomBetween(0.1, 0.4), // Getting faster
    timeOfDayHour: randomInt(0, 23),
    dayOfWeek: randomInt(0, 6),

    // Device
    hasWebdriver: randomBoolean(0.05),
    hasAutomationFlags: randomBoolean(0.08),
    pluginCount: randomInt(3, 12),
    screenResolutionCommon: randomBoolean(0.8),
    timezoneOffsetMinutes: randomChoice([-300, -360, -420, -480, 0, 60, 330]),
    timezoneMatchesIp: randomBoolean(0.7),
    fingerprintSeenCount: randomInt(1, 15),
    deviceMemoryGb: randomChoice([4, 8, 16]),
    hardwareConcurrency: randomChoice([4, 8, 12, 16]),
    touchSupport: randomBoolean(0.3),

    // Network
    isVpn: randomBoolean(0.25),
    isDatacenter: randomBoolean(0.1),
    isTor: randomBoolean(0.01),
    isProxy: randomBoolean(0.1),
    ipReputationScore: randomBetween(0.4, 0.7),
    ipCountryCode: randomChoice(['US', 'GB', 'CA', 'AU', 'IN', 'PH']),
    geoTimezoneMatch: randomBoolean(0.65),
    ipSeenCount: randomInt(1, 20),

    // Content - THE KEY: straight-lining
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(20, 60),
    openEndedLengthStd: randomBetween(5, 20),
    openEndedWordCountMean: randomBetween(4, 12),
    openEndedUniqueWordRatio: randomBetween(0.3, 0.6),
    straightLineRatio: randomBetween(0.7, 1), // High!
    answerEntropy: randomBetween(0.2, 0.8), // Low
    firstOptionRatio: pattern === 'first' ? randomBetween(0.7, 1) : randomBetween(0.1, 0.3),
    lastOptionRatio: pattern === 'last' ? randomBetween(0.7, 1) : randomBetween(0.1, 0.3),
    middleOptionRatio: pattern === 'alternating' ? randomBetween(0.1, 0.3) : randomBetween(0.1, 0.3),
    responseUniquenessScore: randomBetween(0.1, 0.4),
    duplicateAnswerRatio: randomBetween(0.5, 0.9),
    naRatio: randomBetween(0, 0.05),
    skipRatio: randomBetween(0, 0.05),

    // Honeypot
    attentionCheckPassed: randomBoolean(0.4),
    attentionCheckCount: randomInt(0, 2),
    consistencyCheckScore: randomBetween(0.2, 0.6),
    trapFieldFilled: randomBoolean(0.1),
    honeypotScore: randomBetween(0.2, 0.5),
  };
}

/**
 * Copy-Paste Farm - High paste events, similar content
 */
function generateCopyPasteFarm(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const completionTime = randomBetween(60, 180);

  return {
    ...DEFAULT_FEATURES,

    // Behavioral
    mouseDistanceTotal: randomBetween(2000, 8000),
    mouseVelocityMean: randomBetween(0.8, 1.8),
    mouseVelocityStd: randomBetween(0.4, 1),
    mouseVelocityMax: randomBetween(3, 8),
    mouseAccelerationMean: randomBetween(0.02, 0.05),
    mouseCurvatureEntropy: randomBetween(0.4, 1),
    mouseStraightLineRatio: randomBetween(0.2, 0.5),
    mousePauseCount: randomInt(5, 20),
    keystrokeCount: randomInt(20, 60), // Low for amount of text
    keystrokeTimingMean: randomBetween(100, 200),
    keystrokeTimingStd: randomBetween(40, 100),
    keystrokeDwellMean: randomBetween(90, 150),
    keystrokeFlightMean: randomBetween(100, 200),
    backspaceRatio: randomBetween(0, 0.02),
    pasteEventCount: randomInt(5, 15), // High!
    pasteCharRatio: randomBetween(0.5, 0.9), // High!
    scrollCount: randomInt(10, 50),
    scrollVelocityMean: randomBetween(1, 3),
    scrollDirectionChanges: randomInt(3, 12),
    focusLossCount: randomInt(2, 10), // Switching to copy
    focusLossDurationTotal: randomBetween(5000, 30000),
    hoverCount: randomInt(15, 50),
    hoverDurationMean: randomBetween(150, 500),
    clickCount: config.questionCount + randomInt(10, 30),
    hoverBeforeClickRatio: randomBetween(0.3, 0.6),

    // Temporal
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(500, 2000),
    timePerQuestionMin: randomBetween(1000, 3000),
    timePerQuestionMax: randomBetween(8000, 20000),
    readingVsAnsweringRatio: randomBetween(0.2, 0.4),
    firstInteractionDelayMs: randomBetween(1000, 3000),
    idleTimeTotal: randomBetween(5000, 20000),
    activeTimeRatio: randomBetween(0.6, 0.85),
    responseAcceleration: randomBetween(-0.1, 0.2),
    timeOfDayHour: randomInt(0, 23),
    dayOfWeek: randomInt(0, 6),

    // Device
    hasWebdriver: randomBoolean(0.05),
    hasAutomationFlags: randomBoolean(0.08),
    pluginCount: randomInt(3, 15),
    screenResolutionCommon: randomBoolean(0.75),
    timezoneOffsetMinutes: randomChoice([-300, -360, 0, 330, 480]),
    timezoneMatchesIp: randomBoolean(0.5),
    fingerprintSeenCount: randomInt(1, 30),
    deviceMemoryGb: randomChoice([4, 8]),
    hardwareConcurrency: randomChoice([4, 8]),
    touchSupport: randomBoolean(0.2),

    // Network
    isVpn: randomBoolean(0.4),
    isDatacenter: randomBoolean(0.15),
    isTor: randomBoolean(0.02),
    isProxy: randomBoolean(0.2),
    ipReputationScore: randomBetween(0.3, 0.6),
    ipCountryCode: randomChoice(['IN', 'PH', 'PK', 'BD', 'NG', 'KE']),
    geoTimezoneMatch: randomBoolean(0.5),
    ipSeenCount: randomInt(2, 40),

    // Content
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(50, 200), // Long pasted text
    openEndedLengthStd: randomBetween(10, 30),
    openEndedWordCountMean: randomBetween(10, 40),
    openEndedUniqueWordRatio: randomBetween(0.2, 0.5), // Lower uniqueness
    straightLineRatio: randomBetween(0.3, 0.6),
    answerEntropy: randomBetween(0.6, 1.2),
    firstOptionRatio: randomBetween(0.2, 0.4),
    lastOptionRatio: randomBetween(0.2, 0.4),
    middleOptionRatio: randomBetween(0.2, 0.4),
    responseUniquenessScore: randomBetween(0.1, 0.4), // Similar to others
    duplicateAnswerRatio: randomBetween(0.3, 0.6),
    naRatio: randomBetween(0, 0.05),
    skipRatio: randomBetween(0, 0.03),

    // Honeypot
    attentionCheckPassed: randomBoolean(0.6),
    attentionCheckCount: randomInt(0, 2),
    consistencyCheckScore: randomBetween(0.4, 0.8),
    trapFieldFilled: randomBoolean(0.08),
    honeypotScore: randomBetween(0.1, 0.4),
  };
}

/**
 * Datacenter/VPN Bot - Datacenter IP with suspicious behavior
 */
function generateDatacenterBot(surveyLength: SurveyLength): CipherFeatures {
  const base = randomChoice([generatePureBot, generateScriptBot, generateSpeedRunner])(surveyLength);

  return {
    ...base,
    isDatacenter: true,
    isVpn: randomBoolean(0.5),
    ipReputationScore: randomBetween(0, 0.3),
    ipSeenCount: randomInt(10, 100),
    geoTimezoneMatch: randomBoolean(0.2),
  };
}

/**
 * Sophisticated Fraud - Almost human but with subtle tells
 */
function generateSophisticatedFraud(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const [minTime, maxTime] = config.expectedTimeMinutes;
  const completionTime = randomBetween(minTime * 60 * 0.5, maxTime * 60 * 0.7); // Faster than expected

  return {
    ...DEFAULT_FEATURES,

    // Behavioral - looks human but slightly off
    mouseDistanceTotal: randomBetween(3000, 12000),
    mouseVelocityMean: randomBetween(0.6, 1.5),
    mouseVelocityStd: randomBetween(0.3, 0.7), // Slightly too uniform
    mouseVelocityMax: randomBetween(3, 7),
    mouseAccelerationMean: randomBetween(0.02, 0.05),
    mouseCurvatureEntropy: randomBetween(0.5, 1.2),
    mouseStraightLineRatio: randomBetween(0.25, 0.45), // Slightly high
    mousePauseCount: randomInt(5, 20),
    keystrokeCount: randomInt(50, 200),
    keystrokeTimingMean: randomBetween(120, 200),
    keystrokeTimingStd: randomBetween(30, 70), // Slightly too uniform
    keystrokeDwellMean: randomBetween(90, 140),
    keystrokeFlightMean: randomBetween(100, 180),
    backspaceRatio: randomBetween(0.01, 0.04), // Low corrections
    pasteEventCount: randomInt(0, 3),
    pasteCharRatio: randomBetween(0, 0.2),
    scrollCount: randomInt(15, 60),
    scrollVelocityMean: randomBetween(1, 3),
    scrollDirectionChanges: randomInt(5, 15),
    focusLossCount: randomInt(0, 4),
    focusLossDurationTotal: randomBetween(0, 15000),
    hoverCount: randomInt(20, 60),
    hoverDurationMean: randomBetween(150, 500),
    clickCount: config.questionCount + randomInt(10, 30),
    hoverBeforeClickRatio: randomBetween(0.4, 0.7),

    // Temporal
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(800, 2500),
    timePerQuestionMin: randomBetween(1500, 4000),
    timePerQuestionMax: randomBetween(8000, 25000),
    readingVsAnsweringRatio: randomBetween(0.3, 0.5),
    firstInteractionDelayMs: randomBetween(500, 2000),
    idleTimeTotal: randomBetween(2000, 15000),
    activeTimeRatio: randomBetween(0.75, 0.92),
    responseAcceleration: randomBetween(0.05, 0.25), // Slightly speeding up
    timeOfDayHour: randomInt(0, 23),
    dayOfWeek: randomInt(0, 6),

    // Device - looks normal
    hasWebdriver: false,
    hasAutomationFlags: false,
    pluginCount: randomInt(5, 15),
    screenResolutionCommon: randomBoolean(0.85),
    timezoneOffsetMinutes: randomChoice([-300, -360, -420, -480, 0, 60]),
    timezoneMatchesIp: randomBoolean(0.7),
    fingerprintSeenCount: randomInt(1, 10),
    deviceMemoryGb: randomChoice([8, 16]),
    hardwareConcurrency: randomChoice([8, 12, 16]),
    touchSupport: randomBoolean(0.25),

    // Network
    isVpn: randomBoolean(0.35),
    isDatacenter: randomBoolean(0.15),
    isTor: false,
    isProxy: randomBoolean(0.1),
    ipReputationScore: randomBetween(0.4, 0.7),
    ipCountryCode: randomChoice(['US', 'GB', 'CA', 'AU', 'IN']),
    geoTimezoneMatch: randomBoolean(0.6),
    ipSeenCount: randomInt(1, 15),

    // Content - subtle patterns
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(40, 120),
    openEndedLengthStd: randomBetween(15, 40),
    openEndedWordCountMean: randomBetween(8, 25),
    openEndedUniqueWordRatio: randomBetween(0.4, 0.7),
    straightLineRatio: randomBetween(0.35, 0.55), // Slightly high
    answerEntropy: randomBetween(0.8, 1.5),
    firstOptionRatio: randomBetween(0.25, 0.45),
    lastOptionRatio: randomBetween(0.15, 0.35),
    middleOptionRatio: randomBetween(0.25, 0.45),
    responseUniquenessScore: randomBetween(0.3, 0.6),
    duplicateAnswerRatio: randomBetween(0.2, 0.4),
    naRatio: randomBetween(0, 0.03),
    skipRatio: randomBetween(0, 0.02),

    // Honeypot
    attentionCheckPassed: randomBoolean(0.75),
    attentionCheckCount: randomInt(0, 2),
    consistencyCheckScore: randomBetween(0.5, 0.85),
    trapFieldFilled: false,
    honeypotScore: randomBetween(0.05, 0.25),
  };
}

// ============================================
// LEGITIMATE ARCHETYPES
// ============================================

/**
 * Thoughtful Desktop User - Careful, engaged respondent
 */
function generateThoughtfulDesktop(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const [minTime, maxTime] = config.expectedTimeMinutes;
  const completionTime = randomBetween(minTime * 60, maxTime * 60);

  return {
    ...DEFAULT_FEATURES,

    // Behavioral - rich, natural patterns
    mouseDistanceTotal: randomBetween(8000, 30000),
    mouseVelocityMean: randomBetween(0.5, 1.2),
    mouseVelocityStd: randomBetween(0.4, 1.0), // Good variance
    mouseVelocityMax: randomBetween(3, 8),
    mouseAccelerationMean: randomBetween(0.02, 0.06),
    mouseCurvatureEntropy: randomBetween(1.0, 2.5), // Natural curves
    mouseStraightLineRatio: randomBetween(0.1, 0.3),
    mousePauseCount: randomInt(10, 40),
    keystrokeCount: randomInt(100, 400),
    keystrokeTimingMean: logNormal(150, 0.4),
    keystrokeTimingStd: randomBetween(50, 150), // High variance
    keystrokeDwellMean: logNormal(100, 0.3),
    keystrokeFlightMean: logNormal(130, 0.4),
    backspaceRatio: randomBetween(0.03, 0.12), // Corrections!
    pasteEventCount: randomInt(0, 2),
    pasteCharRatio: randomBetween(0, 0.1),
    scrollCount: randomInt(20, 80),
    scrollVelocityMean: randomBetween(0.5, 2),
    scrollDirectionChanges: randomInt(8, 25),
    focusLossCount: randomInt(1, 6),
    focusLossDurationTotal: randomBetween(5000, 30000),
    hoverCount: randomInt(30, 100),
    hoverDurationMean: randomBetween(200, 800),
    clickCount: config.questionCount + randomInt(15, 50),
    hoverBeforeClickRatio: randomBetween(0.5, 0.85),

    // Temporal - thoughtful pacing
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(3000, 10000), // High variance
    timePerQuestionMin: randomBetween(3000, 8000),
    timePerQuestionMax: randomBetween(15000, 45000),
    readingVsAnsweringRatio: randomBetween(0.4, 0.7),
    firstInteractionDelayMs: randomBetween(1000, 5000),
    idleTimeTotal: randomBetween(10000, 60000),
    activeTimeRatio: randomBetween(0.6, 0.85),
    responseAcceleration: randomBetween(-0.15, 0.15), // Varies
    timeOfDayHour: randomInt(8, 22), // Daytime
    dayOfWeek: randomInt(0, 6),

    // Device - normal desktop
    hasWebdriver: false,
    hasAutomationFlags: false,
    pluginCount: randomInt(5, 20),
    screenResolutionCommon: true,
    timezoneOffsetMinutes: randomChoice([-300, -360, -420, -480, 0, 60, -240]),
    timezoneMatchesIp: true,
    fingerprintSeenCount: 1,
    deviceMemoryGb: randomChoice([8, 16, 32]),
    hardwareConcurrency: randomChoice([8, 12, 16, 20]),
    touchSupport: false,

    // Network - clean
    isVpn: randomBoolean(0.1),
    isDatacenter: false,
    isTor: false,
    isProxy: false,
    ipReputationScore: randomBetween(0.7, 1),
    ipCountryCode: randomChoice(['US', 'GB', 'CA', 'AU', 'DE', 'FR']),
    geoTimezoneMatch: true,
    ipSeenCount: 1,

    // Content - diverse, thoughtful
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(60, 200),
    openEndedLengthStd: randomBetween(30, 80),
    openEndedWordCountMean: randomBetween(12, 40),
    openEndedUniqueWordRatio: randomBetween(0.6, 0.85),
    straightLineRatio: randomBetween(0.05, 0.25),
    answerEntropy: randomBetween(1.5, 2.5),
    firstOptionRatio: randomBetween(0.15, 0.35),
    lastOptionRatio: randomBetween(0.15, 0.35),
    middleOptionRatio: randomBetween(0.3, 0.55),
    responseUniquenessScore: randomBetween(0.6, 0.9),
    duplicateAnswerRatio: randomBetween(0.05, 0.2),
    naRatio: randomBetween(0, 0.02),
    skipRatio: randomBetween(0, 0.02),

    // Honeypot - passes
    attentionCheckPassed: true,
    attentionCheckCount: randomInt(1, 3),
    consistencyCheckScore: randomBetween(0.8, 1),
    trapFieldFilled: false,
    honeypotScore: 0,
  };
}

/**
 * Mobile User - Touch patterns, different behavior
 */
function generateMobileUser(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const [minTime, maxTime] = config.expectedTimeMinutes;
  const completionTime = randomBetween(minTime * 60 * 0.8, maxTime * 60 * 1.2);

  return {
    ...DEFAULT_FEATURES,

    // Behavioral - touch-based
    mouseDistanceTotal: randomBetween(2000, 8000), // Less precise
    mouseVelocityMean: randomBetween(0.3, 0.8),
    mouseVelocityStd: randomBetween(0.3, 0.8),
    mouseVelocityMax: randomBetween(2, 5),
    mouseAccelerationMean: randomBetween(0.01, 0.04),
    mouseCurvatureEntropy: randomBetween(0.5, 1.5),
    mouseStraightLineRatio: randomBetween(0.2, 0.5), // More direct taps
    mousePauseCount: randomInt(5, 25),
    keystrokeCount: randomInt(50, 250),
    keystrokeTimingMean: logNormal(200, 0.5), // Slower on mobile
    keystrokeTimingStd: randomBetween(80, 200),
    keystrokeDwellMean: logNormal(120, 0.4),
    keystrokeFlightMean: logNormal(180, 0.5),
    backspaceRatio: randomBetween(0.05, 0.15), // More typos on mobile
    pasteEventCount: randomInt(0, 1),
    pasteCharRatio: randomBetween(0, 0.05),
    scrollCount: randomInt(30, 120), // More scrolling
    scrollVelocityMean: randomBetween(1, 4),
    scrollDirectionChanges: randomInt(10, 35),
    focusLossCount: randomInt(2, 10), // Notifications
    focusLossDurationTotal: randomBetween(10000, 60000),
    hoverCount: randomInt(5, 20), // Less hover on touch
    hoverDurationMean: randomBetween(50, 200),
    clickCount: config.questionCount + randomInt(10, 40),
    hoverBeforeClickRatio: randomBetween(0.1, 0.3),

    // Temporal
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(4000, 12000),
    timePerQuestionMin: randomBetween(2000, 6000),
    timePerQuestionMax: randomBetween(20000, 50000),
    readingVsAnsweringRatio: randomBetween(0.35, 0.6),
    firstInteractionDelayMs: randomBetween(1500, 6000),
    idleTimeTotal: randomBetween(15000, 80000),
    activeTimeRatio: randomBetween(0.5, 0.8),
    responseAcceleration: randomBetween(-0.1, 0.2),
    timeOfDayHour: randomInt(6, 23),
    dayOfWeek: randomInt(0, 6),

    // Device - mobile
    hasWebdriver: false,
    hasAutomationFlags: false,
    pluginCount: randomInt(0, 5),
    screenResolutionCommon: true,
    timezoneOffsetMinutes: randomChoice([-300, -360, -420, -480, 0, 60, 330]),
    timezoneMatchesIp: randomBoolean(0.9),
    fingerprintSeenCount: 1,
    deviceMemoryGb: randomChoice([3, 4, 6, 8]),
    hardwareConcurrency: randomChoice([4, 6, 8]),
    touchSupport: true, // Key!

    // Network
    isVpn: randomBoolean(0.05),
    isDatacenter: false,
    isTor: false,
    isProxy: false,
    ipReputationScore: randomBetween(0.7, 1),
    ipCountryCode: randomChoice(['US', 'GB', 'CA', 'AU', 'IN', 'DE']),
    geoTimezoneMatch: randomBoolean(0.85),
    ipSeenCount: 1,

    // Content
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(40, 120), // Shorter on mobile
    openEndedLengthStd: randomBetween(20, 50),
    openEndedWordCountMean: randomBetween(8, 25),
    openEndedUniqueWordRatio: randomBetween(0.55, 0.8),
    straightLineRatio: randomBetween(0.1, 0.3),
    answerEntropy: randomBetween(1.3, 2.3),
    firstOptionRatio: randomBetween(0.15, 0.35),
    lastOptionRatio: randomBetween(0.15, 0.35),
    middleOptionRatio: randomBetween(0.3, 0.5),
    responseUniquenessScore: randomBetween(0.55, 0.85),
    duplicateAnswerRatio: randomBetween(0.08, 0.25),
    naRatio: randomBetween(0, 0.03),
    skipRatio: randomBetween(0, 0.03),

    // Honeypot
    attentionCheckPassed: randomBoolean(0.95),
    attentionCheckCount: randomInt(1, 3),
    consistencyCheckScore: randomBetween(0.75, 1),
    trapFieldFilled: false,
    honeypotScore: 0,
  };
}

/**
 * Fast but Genuine - Quick respondent but clearly human
 */
function generateFastGenuine(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const [minTime] = config.expectedTimeMinutes;
  const completionTime = randomBetween(minTime * 60 * 0.4, minTime * 60 * 0.8);

  return {
    ...DEFAULT_FEATURES,

    // Behavioral - fast but human
    mouseDistanceTotal: randomBetween(5000, 15000),
    mouseVelocityMean: randomBetween(0.8, 1.8), // Faster
    mouseVelocityStd: randomBetween(0.5, 1.2),
    mouseVelocityMax: randomBetween(4, 10),
    mouseAccelerationMean: randomBetween(0.03, 0.08),
    mouseCurvatureEntropy: randomBetween(0.8, 2),
    mouseStraightLineRatio: randomBetween(0.15, 0.35),
    mousePauseCount: randomInt(5, 20),
    keystrokeCount: randomInt(80, 250),
    keystrokeTimingMean: logNormal(100, 0.4), // Fast typist
    keystrokeTimingStd: randomBetween(40, 100),
    keystrokeDwellMean: logNormal(70, 0.3),
    keystrokeFlightMean: logNormal(90, 0.4),
    backspaceRatio: randomBetween(0.02, 0.08),
    pasteEventCount: randomInt(0, 2),
    pasteCharRatio: randomBetween(0, 0.1),
    scrollCount: randomInt(15, 50),
    scrollVelocityMean: randomBetween(1.5, 4),
    scrollDirectionChanges: randomInt(5, 18),
    focusLossCount: randomInt(0, 3),
    focusLossDurationTotal: randomBetween(0, 15000),
    hoverCount: randomInt(20, 60),
    hoverDurationMean: randomBetween(100, 400),
    clickCount: config.questionCount + randomInt(10, 35),
    hoverBeforeClickRatio: randomBetween(0.4, 0.7),

    // Temporal
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(2000, 6000),
    timePerQuestionMin: randomBetween(1500, 4000),
    timePerQuestionMax: randomBetween(8000, 20000),
    readingVsAnsweringRatio: randomBetween(0.25, 0.45),
    firstInteractionDelayMs: randomBetween(500, 2000),
    idleTimeTotal: randomBetween(2000, 20000),
    activeTimeRatio: randomBetween(0.75, 0.95),
    responseAcceleration: randomBetween(-0.1, 0.1),
    timeOfDayHour: randomInt(8, 22),
    dayOfWeek: randomInt(0, 6),

    // Device
    hasWebdriver: false,
    hasAutomationFlags: false,
    pluginCount: randomInt(5, 18),
    screenResolutionCommon: true,
    timezoneOffsetMinutes: randomChoice([-300, -360, -420, -480, 0, 60]),
    timezoneMatchesIp: true,
    fingerprintSeenCount: 1,
    deviceMemoryGb: randomChoice([8, 16, 32]),
    hardwareConcurrency: randomChoice([8, 12, 16]),
    touchSupport: randomBoolean(0.15),

    // Network
    isVpn: randomBoolean(0.08),
    isDatacenter: false,
    isTor: false,
    isProxy: false,
    ipReputationScore: randomBetween(0.75, 1),
    ipCountryCode: randomChoice(['US', 'GB', 'CA', 'AU', 'DE']),
    geoTimezoneMatch: true,
    ipSeenCount: 1,

    // Content
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(40, 100),
    openEndedLengthStd: randomBetween(20, 50),
    openEndedWordCountMean: randomBetween(8, 20),
    openEndedUniqueWordRatio: randomBetween(0.55, 0.8),
    straightLineRatio: randomBetween(0.1, 0.3),
    answerEntropy: randomBetween(1.4, 2.2),
    firstOptionRatio: randomBetween(0.18, 0.38),
    lastOptionRatio: randomBetween(0.15, 0.35),
    middleOptionRatio: randomBetween(0.3, 0.5),
    responseUniquenessScore: randomBetween(0.55, 0.85),
    duplicateAnswerRatio: randomBetween(0.1, 0.25),
    naRatio: randomBetween(0, 0.02),
    skipRatio: randomBetween(0, 0.02),

    // Honeypot
    attentionCheckPassed: true,
    attentionCheckCount: randomInt(1, 3),
    consistencyCheckScore: randomBetween(0.8, 1),
    trapFieldFilled: false,
    honeypotScore: 0,
  };
}

/**
 * Slow/Careful Reader - Takes time, very engaged
 */
function generateSlowCareful(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const [, maxTime] = config.expectedTimeMinutes;
  const completionTime = randomBetween(maxTime * 60, maxTime * 60 * 1.8);

  return {
    ...DEFAULT_FEATURES,

    // Behavioral - deliberate
    mouseDistanceTotal: randomBetween(15000, 50000),
    mouseVelocityMean: randomBetween(0.3, 0.8),
    mouseVelocityStd: randomBetween(0.3, 0.7),
    mouseVelocityMax: randomBetween(2, 5),
    mouseAccelerationMean: randomBetween(0.01, 0.03),
    mouseCurvatureEntropy: randomBetween(1.2, 2.8),
    mouseStraightLineRatio: randomBetween(0.08, 0.22),
    mousePauseCount: randomInt(20, 60),
    keystrokeCount: randomInt(150, 500),
    keystrokeTimingMean: logNormal(200, 0.5),
    keystrokeTimingStd: randomBetween(80, 200),
    keystrokeDwellMean: logNormal(130, 0.4),
    keystrokeFlightMean: logNormal(180, 0.5),
    backspaceRatio: randomBetween(0.05, 0.15),
    pasteEventCount: randomInt(0, 2),
    pasteCharRatio: randomBetween(0, 0.08),
    scrollCount: randomInt(40, 120),
    scrollVelocityMean: randomBetween(0.3, 1.2),
    scrollDirectionChanges: randomInt(15, 40),
    focusLossCount: randomInt(2, 8),
    focusLossDurationTotal: randomBetween(20000, 90000),
    hoverCount: randomInt(50, 150),
    hoverDurationMean: randomBetween(300, 1200),
    clickCount: config.questionCount + randomInt(20, 60),
    hoverBeforeClickRatio: randomBetween(0.6, 0.9),

    // Temporal
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(5000, 15000),
    timePerQuestionMin: randomBetween(5000, 12000),
    timePerQuestionMax: randomBetween(30000, 90000),
    readingVsAnsweringRatio: randomBetween(0.5, 0.75),
    firstInteractionDelayMs: randomBetween(3000, 10000),
    idleTimeTotal: randomBetween(30000, 120000),
    activeTimeRatio: randomBetween(0.5, 0.75),
    responseAcceleration: randomBetween(-0.2, 0.05),
    timeOfDayHour: randomInt(8, 22),
    dayOfWeek: randomInt(0, 6),

    // Device
    hasWebdriver: false,
    hasAutomationFlags: false,
    pluginCount: randomInt(5, 20),
    screenResolutionCommon: true,
    timezoneOffsetMinutes: randomChoice([-300, -360, -420, -480, 0, 60]),
    timezoneMatchesIp: true,
    fingerprintSeenCount: 1,
    deviceMemoryGb: randomChoice([8, 16]),
    hardwareConcurrency: randomChoice([4, 8, 12]),
    touchSupport: randomBoolean(0.2),

    // Network
    isVpn: randomBoolean(0.08),
    isDatacenter: false,
    isTor: false,
    isProxy: false,
    ipReputationScore: randomBetween(0.8, 1),
    ipCountryCode: randomChoice(['US', 'GB', 'CA', 'AU', 'DE', 'NL']),
    geoTimezoneMatch: true,
    ipSeenCount: 1,

    // Content - thorough
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(100, 300),
    openEndedLengthStd: randomBetween(40, 100),
    openEndedWordCountMean: randomBetween(20, 60),
    openEndedUniqueWordRatio: randomBetween(0.65, 0.9),
    straightLineRatio: randomBetween(0.03, 0.18),
    answerEntropy: randomBetween(1.8, 2.8),
    firstOptionRatio: randomBetween(0.12, 0.28),
    lastOptionRatio: randomBetween(0.12, 0.28),
    middleOptionRatio: randomBetween(0.4, 0.6),
    responseUniquenessScore: randomBetween(0.7, 0.95),
    duplicateAnswerRatio: randomBetween(0.02, 0.12),
    naRatio: randomBetween(0, 0.01),
    skipRatio: 0,

    // Honeypot
    attentionCheckPassed: true,
    attentionCheckCount: randomInt(1, 3),
    consistencyCheckScore: randomBetween(0.9, 1),
    trapFieldFilled: false,
    honeypotScore: 0,
  };
}

/**
 * Distracted User - Tab switches, pauses, but completes properly
 */
function generateDistractedUser(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const [minTime, maxTime] = config.expectedTimeMinutes;
  const completionTime = randomBetween(maxTime * 60 * 0.8, maxTime * 60 * 2);

  return {
    ...DEFAULT_FEATURES,

    // Behavioral
    mouseDistanceTotal: randomBetween(8000, 25000),
    mouseVelocityMean: randomBetween(0.5, 1.2),
    mouseVelocityStd: randomBetween(0.4, 1),
    mouseVelocityMax: randomBetween(3, 8),
    mouseAccelerationMean: randomBetween(0.02, 0.05),
    mouseCurvatureEntropy: randomBetween(0.9, 2.2),
    mouseStraightLineRatio: randomBetween(0.12, 0.32),
    mousePauseCount: randomInt(15, 50),
    keystrokeCount: randomInt(100, 350),
    keystrokeTimingMean: logNormal(160, 0.5),
    keystrokeTimingStd: randomBetween(60, 150),
    keystrokeDwellMean: logNormal(110, 0.4),
    keystrokeFlightMean: logNormal(150, 0.5),
    backspaceRatio: randomBetween(0.04, 0.12),
    pasteEventCount: randomInt(0, 3),
    pasteCharRatio: randomBetween(0, 0.15),
    scrollCount: randomInt(25, 80),
    scrollVelocityMean: randomBetween(0.8, 2.5),
    scrollDirectionChanges: randomInt(10, 30),
    focusLossCount: randomInt(5, 20), // Key: lots of tab switches
    focusLossDurationTotal: randomBetween(30000, 180000), // Key: long away time
    hoverCount: randomInt(30, 90),
    hoverDurationMean: randomBetween(200, 700),
    clickCount: config.questionCount + randomInt(15, 45),
    hoverBeforeClickRatio: randomBetween(0.45, 0.75),

    // Temporal
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(5000, 20000), // High variance
    timePerQuestionMin: randomBetween(2000, 6000),
    timePerQuestionMax: randomBetween(30000, 120000),
    readingVsAnsweringRatio: randomBetween(0.3, 0.55),
    firstInteractionDelayMs: randomBetween(2000, 8000),
    idleTimeTotal: randomBetween(40000, 150000), // Lots of idle
    activeTimeRatio: randomBetween(0.4, 0.7), // Low active ratio
    responseAcceleration: randomBetween(-0.15, 0.15),
    timeOfDayHour: randomInt(8, 23),
    dayOfWeek: randomInt(0, 6),

    // Device
    hasWebdriver: false,
    hasAutomationFlags: false,
    pluginCount: randomInt(8, 25),
    screenResolutionCommon: true,
    timezoneOffsetMinutes: randomChoice([-300, -360, -420, -480, 0, 60]),
    timezoneMatchesIp: true,
    fingerprintSeenCount: 1,
    deviceMemoryGb: randomChoice([8, 16, 32]),
    hardwareConcurrency: randomChoice([8, 12, 16]),
    touchSupport: randomBoolean(0.15),

    // Network
    isVpn: randomBoolean(0.12),
    isDatacenter: false,
    isTor: false,
    isProxy: false,
    ipReputationScore: randomBetween(0.7, 1),
    ipCountryCode: randomChoice(['US', 'GB', 'CA', 'AU', 'DE']),
    geoTimezoneMatch: randomBoolean(0.9),
    ipSeenCount: 1,

    // Content
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(50, 150),
    openEndedLengthStd: randomBetween(25, 70),
    openEndedWordCountMean: randomBetween(10, 30),
    openEndedUniqueWordRatio: randomBetween(0.55, 0.8),
    straightLineRatio: randomBetween(0.08, 0.28),
    answerEntropy: randomBetween(1.4, 2.4),
    firstOptionRatio: randomBetween(0.15, 0.35),
    lastOptionRatio: randomBetween(0.15, 0.35),
    middleOptionRatio: randomBetween(0.3, 0.55),
    responseUniquenessScore: randomBetween(0.55, 0.85),
    duplicateAnswerRatio: randomBetween(0.08, 0.22),
    naRatio: randomBetween(0, 0.03),
    skipRatio: randomBetween(0, 0.02),

    // Honeypot
    attentionCheckPassed: randomBoolean(0.92),
    attentionCheckCount: randomInt(1, 3),
    consistencyCheckScore: randomBetween(0.75, 0.95),
    trapFieldFilled: false,
    honeypotScore: 0,
  };
}

/**
 * VPN Legitimate - Uses VPN but is a real user
 */
function generateVpnLegitimate(surveyLength: SurveyLength): CipherFeatures {
  const base = randomChoice([generateThoughtfulDesktop, generateFastGenuine, generateMobileUser])(surveyLength);

  return {
    ...base,
    isVpn: true,
    geoTimezoneMatch: randomBoolean(0.4),
    ipReputationScore: randomBetween(0.5, 0.8),
  };
}

/**
 * Edge Case - Elderly, accessibility, non-native speakers
 */
function generateEdgeCase(surveyLength: SurveyLength): CipherFeatures {
  const config = getSurveyConfig(surveyLength);
  const [, maxTime] = config.expectedTimeMinutes;
  const completionTime = randomBetween(maxTime * 60 * 1.5, maxTime * 60 * 3);

  return {
    ...DEFAULT_FEATURES,

    // Behavioral - slower, less precise
    mouseDistanceTotal: randomBetween(10000, 40000),
    mouseVelocityMean: randomBetween(0.2, 0.6),
    mouseVelocityStd: randomBetween(0.2, 0.5),
    mouseVelocityMax: randomBetween(1.5, 4),
    mouseAccelerationMean: randomBetween(0.005, 0.02),
    mouseCurvatureEntropy: randomBetween(0.8, 2),
    mouseStraightLineRatio: randomBetween(0.15, 0.4),
    mousePauseCount: randomInt(20, 80),
    keystrokeCount: randomInt(80, 300),
    keystrokeTimingMean: logNormal(300, 0.6), // Slow typing
    keystrokeTimingStd: randomBetween(100, 250),
    keystrokeDwellMean: logNormal(180, 0.5),
    keystrokeFlightMean: logNormal(280, 0.6),
    backspaceRatio: randomBetween(0.08, 0.2), // More corrections
    pasteEventCount: randomInt(0, 1),
    pasteCharRatio: randomBetween(0, 0.05),
    scrollCount: randomInt(30, 100),
    scrollVelocityMean: randomBetween(0.2, 0.8),
    scrollDirectionChanges: randomInt(10, 35),
    focusLossCount: randomInt(1, 5),
    focusLossDurationTotal: randomBetween(10000, 50000),
    hoverCount: randomInt(40, 120),
    hoverDurationMean: randomBetween(400, 1500),
    clickCount: config.questionCount + randomInt(15, 50),
    hoverBeforeClickRatio: randomBetween(0.5, 0.85),

    // Temporal
    completionTimeSeconds: completionTime,
    timePerQuestionMean: (completionTime * 1000) / config.questionCount,
    timePerQuestionStd: randomBetween(8000, 25000),
    timePerQuestionMin: randomBetween(8000, 20000),
    timePerQuestionMax: randomBetween(40000, 120000),
    readingVsAnsweringRatio: randomBetween(0.45, 0.7),
    firstInteractionDelayMs: randomBetween(5000, 15000),
    idleTimeTotal: randomBetween(30000, 100000),
    activeTimeRatio: randomBetween(0.5, 0.75),
    responseAcceleration: randomBetween(-0.1, 0.1),
    timeOfDayHour: randomInt(8, 20),
    dayOfWeek: randomInt(0, 6),

    // Device
    hasWebdriver: false,
    hasAutomationFlags: false,
    pluginCount: randomInt(3, 12),
    screenResolutionCommon: true,
    timezoneOffsetMinutes: randomChoice([-300, -360, -420, -480, 0, 60]),
    timezoneMatchesIp: true,
    fingerprintSeenCount: 1,
    deviceMemoryGb: randomChoice([4, 8]),
    hardwareConcurrency: randomChoice([4, 8]),
    touchSupport: randomBoolean(0.3),

    // Network
    isVpn: false,
    isDatacenter: false,
    isTor: false,
    isProxy: false,
    ipReputationScore: randomBetween(0.75, 1),
    ipCountryCode: randomChoice(['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES']),
    geoTimezoneMatch: true,
    ipSeenCount: 1,

    // Content
    questionCount: config.questionCount,
    openEndedCount: config.openEndedCount,
    openEndedLengthMean: randomBetween(40, 120),
    openEndedLengthStd: randomBetween(20, 60),
    openEndedWordCountMean: randomBetween(8, 25),
    openEndedUniqueWordRatio: randomBetween(0.5, 0.75),
    straightLineRatio: randomBetween(0.1, 0.3),
    answerEntropy: randomBetween(1.3, 2.2),
    firstOptionRatio: randomBetween(0.15, 0.35),
    lastOptionRatio: randomBetween(0.15, 0.35),
    middleOptionRatio: randomBetween(0.3, 0.55),
    responseUniquenessScore: randomBetween(0.5, 0.8),
    duplicateAnswerRatio: randomBetween(0.1, 0.25),
    naRatio: randomBetween(0, 0.05),
    skipRatio: randomBetween(0, 0.03),

    // Honeypot
    attentionCheckPassed: randomBoolean(0.85),
    attentionCheckCount: randomInt(1, 3),
    consistencyCheckScore: randomBetween(0.7, 0.95),
    trapFieldFilled: false,
    honeypotScore: 0,
  };
}

// ============================================
// MAIN GENERATION FUNCTIONS
// ============================================

export interface SyntheticSample {
  features: CipherFeatures;
  label: boolean; // true = fraud
  archetype: string;
  surveyLength: SurveyLength;
}

type FraudGenerator = (length: SurveyLength) => CipherFeatures;
type LegitimateGenerator = (length: SurveyLength) => CipherFeatures;

const FRAUD_GENERATORS: { generator: FraudGenerator; name: string; weight: number }[] = [
  { generator: generatePureBot, name: 'pure_bot', weight: 5000 },
  { generator: generateScriptBot, name: 'script_bot', weight: 4000 },
  { generator: generateSpeedRunner, name: 'speed_runner', weight: 4000 },
  { generator: generateStraightLiner, name: 'straight_liner', weight: 4000 },
  { generator: generateCopyPasteFarm, name: 'copy_paste_farm', weight: 3000 },
  { generator: generateDatacenterBot, name: 'datacenter_bot', weight: 3000 },
  { generator: generateSophisticatedFraud, name: 'sophisticated_fraud', weight: 2000 },
];

const LEGITIMATE_GENERATORS: { generator: LegitimateGenerator; name: string; weight: number }[] = [
  { generator: generateThoughtfulDesktop, name: 'thoughtful_desktop', weight: 6000 },
  { generator: generateMobileUser, name: 'mobile_user', weight: 5000 },
  { generator: generateFastGenuine, name: 'fast_genuine', weight: 4000 },
  { generator: generateSlowCareful, name: 'slow_careful', weight: 4000 },
  { generator: generateDistractedUser, name: 'distracted_user', weight: 3000 },
  { generator: generateVpnLegitimate, name: 'vpn_legitimate', weight: 2000 },
  { generator: generateEdgeCase, name: 'edge_case', weight: 1000 },
];

function selectSurveyLength(): SurveyLength {
  const rand = Math.random();
  if (rand < 0.3) return 'short';
  if (rand < 0.8) return 'medium';
  return 'long';
}

/**
 * Generate a batch of synthetic training samples
 */
export function generateSyntheticData(count: number): SyntheticSample[] {
  const samples: SyntheticSample[] = [];
  const fraudCount = Math.floor(count / 2);
  const legitCount = count - fraudCount;

  // Calculate total weights
  const totalFraudWeight = FRAUD_GENERATORS.reduce((sum, g) => sum + g.weight, 0);
  const totalLegitWeight = LEGITIMATE_GENERATORS.reduce((sum, g) => sum + g.weight, 0);

  // Generate fraud samples
  for (const gen of FRAUD_GENERATORS) {
    const genCount = Math.round((gen.weight / totalFraudWeight) * fraudCount);
    for (let i = 0; i < genCount; i++) {
      const surveyLength = selectSurveyLength();
      samples.push({
        features: gen.generator(surveyLength),
        label: true,
        archetype: gen.name,
        surveyLength,
      });
    }
  }

  // Generate legitimate samples
  for (const gen of LEGITIMATE_GENERATORS) {
    const genCount = Math.round((gen.weight / totalLegitWeight) * legitCount);
    for (let i = 0; i < genCount; i++) {
      const surveyLength = selectSurveyLength();
      samples.push({
        features: gen.generator(surveyLength),
        label: false,
        archetype: gen.name,
        surveyLength,
      });
    }
  }

  // Shuffle the samples
  for (let i = samples.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [samples[i], samples[j]] = [samples[j], samples[i]];
  }

  return samples;
}

/**
 * Convert features to normalized vector for ML
 */
export function featuresToNormalizedVector(features: CipherFeatures): number[] {
  return FEATURE_NAMES.map((name) => {
    const value = features[name];
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'string') return 0; // Skip string features for now
    return value as number;
  });
}

/**
 * Export synthetic data as JSON for training
 */
export function exportForTraining(samples: SyntheticSample[]): {
  X: number[][];
  y: number[];
  metadata: { archetype: string; surveyLength: SurveyLength }[];
} {
  const X: number[][] = [];
  const y: number[] = [];
  const metadata: { archetype: string; surveyLength: SurveyLength }[] = [];

  for (const sample of samples) {
    X.push(featuresToNormalizedVector(sample.features));
    y.push(sample.label ? 1 : 0);
    metadata.push({
      archetype: sample.archetype,
      surveyLength: sample.surveyLength,
    });
  }

  return { X, y, metadata };
}

/**
 * Get statistics about generated data
 */
export function getDatasetStats(samples: SyntheticSample[]): {
  total: number;
  fraudCount: number;
  legitCount: number;
  byArchetype: Record<string, number>;
  bySurveyLength: Record<SurveyLength, number>;
} {
  const byArchetype: Record<string, number> = {};
  const bySurveyLength: Record<SurveyLength, number> = { short: 0, medium: 0, long: 0 };

  let fraudCount = 0;
  let legitCount = 0;

  for (const sample of samples) {
    if (sample.label) fraudCount++;
    else legitCount++;

    byArchetype[sample.archetype] = (byArchetype[sample.archetype] || 0) + 1;
    bySurveyLength[sample.surveyLength]++;
  }

  return {
    total: samples.length,
    fraudCount,
    legitCount,
    byArchetype,
    bySurveyLength,
  };
}
