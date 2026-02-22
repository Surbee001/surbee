/**
 * Cipher Feature Extraction Service
 *
 * Transforms raw behavioral data from survey responses into a consistent
 * 75-dimension feature vector for ML training and inference.
 */

import {
  CipherFeatures,
  CipherFeaturesRow,
  SurveyResponseData,
  MouseMovement,
  KeystrokeEvent,
  DeviceData,
  FEATURE_VERSION,
  FEATURE_NAMES,
  DEFAULT_FEATURES,
} from './types';

// ============================================
// MAIN EXTRACTION FUNCTION
// ============================================

/**
 * Extract all features from a survey response
 */
export function extractFeatures(response: SurveyResponseData): CipherFeatures {
  const features: CipherFeatures = { ...DEFAULT_FEATURES };

  // Extract behavioral features
  extractMouseFeatures(response.mouseData, features);
  extractKeystrokeFeatures(response.keystrokeData, features);
  extractScrollFeatures(response, features);
  extractFocusFeatures(response, features);

  // Extract temporal features
  extractTemporalFeatures(response, features);

  // Extract device features
  extractDeviceFeatures(response.deviceData, features);

  // Extract content features
  extractContentFeatures(response, features);

  // Extract honeypot features (if available)
  extractHoneypotFeatures(response, features);

  return features;
}

/**
 * Convert features to normalized 0-1 vector
 */
export function featuresToVector(features: CipherFeatures): number[] {
  return FEATURE_NAMES.map((name) => {
    const value = features[name];
    // Convert booleans to 0/1
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    // For strings (like ipCountryCode), use a hash-based normalization
    if (typeof value === 'string') {
      return hashString(value) / 1000000;
    }
    // Normalize numeric values
    return normalizeFeature(name, value as number);
  });
}

/**
 * Convert features to database row format
 */
export function featuresToDbRow(
  responseId: string,
  surveyId: string,
  features: CipherFeatures
): Omit<CipherFeaturesRow, 'id' | 'created_at'> {
  const vector = featuresToVector(features);

  return {
    response_id: responseId,
    survey_id: surveyId,
    feature_vector: vector,
    feature_version: FEATURE_VERSION,

    // Behavioral
    mouse_distance_total: features.mouseDistanceTotal,
    mouse_velocity_mean: features.mouseVelocityMean,
    mouse_velocity_std: features.mouseVelocityStd,
    mouse_velocity_max: features.mouseVelocityMax,
    mouse_acceleration_mean: features.mouseAccelerationMean,
    mouse_curvature_entropy: features.mouseCurvatureEntropy,
    mouse_straight_line_ratio: features.mouseStraightLineRatio,
    mouse_pause_count: features.mousePauseCount,
    keystroke_count: features.keystrokeCount,
    keystroke_timing_mean: features.keystrokeTimingMean,
    keystroke_timing_std: features.keystrokeTimingStd,
    keystroke_dwell_mean: features.keystrokeDwellMean,
    keystroke_flight_mean: features.keystrokeFlightMean,
    backspace_ratio: features.backspaceRatio,
    paste_event_count: features.pasteEventCount,
    paste_char_ratio: features.pasteCharRatio,
    scroll_count: features.scrollCount,
    scroll_velocity_mean: features.scrollVelocityMean,
    scroll_direction_changes: features.scrollDirectionChanges,
    focus_loss_count: features.focusLossCount,
    focus_loss_duration_total: features.focusLossDurationTotal,
    hover_count: features.hoverCount,
    hover_duration_mean: features.hoverDurationMean,
    click_count: features.clickCount,
    hover_before_click_ratio: features.hoverBeforeClickRatio,

    // Temporal
    completion_time_seconds: features.completionTimeSeconds,
    time_per_question_mean: features.timePerQuestionMean,
    time_per_question_std: features.timePerQuestionStd,
    time_per_question_min: features.timePerQuestionMin,
    time_per_question_max: features.timePerQuestionMax,
    reading_vs_answering_ratio: features.readingVsAnsweringRatio,
    first_interaction_delay_ms: features.firstInteractionDelayMs,
    idle_time_total: features.idleTimeTotal,
    active_time_ratio: features.activeTimeRatio,
    response_acceleration: features.responseAcceleration,
    time_of_day_hour: features.timeOfDayHour,
    day_of_week: features.dayOfWeek,

    // Device
    has_webdriver: features.hasWebdriver,
    has_automation_flags: features.hasAutomationFlags,
    plugin_count: features.pluginCount,
    screen_resolution_common: features.screenResolutionCommon,
    timezone_offset_minutes: features.timezoneOffsetMinutes,
    timezone_matches_ip: features.timezoneMatchesIp,
    fingerprint_seen_count: features.fingerprintSeenCount,
    device_memory_gb: features.deviceMemoryGb,
    hardware_concurrency: features.hardwareConcurrency,
    touch_support: features.touchSupport,

    // Network
    is_vpn: features.isVpn,
    is_datacenter: features.isDatacenter,
    is_tor: features.isTor,
    is_proxy: features.isProxy,
    ip_reputation_score: features.ipReputationScore,
    ip_country_code: features.ipCountryCode,
    geo_timezone_match: features.geoTimezoneMatch,
    ip_seen_count: features.ipSeenCount,

    // Content
    question_count: features.questionCount,
    open_ended_count: features.openEndedCount,
    open_ended_length_mean: features.openEndedLengthMean,
    open_ended_length_std: features.openEndedLengthStd,
    open_ended_word_count_mean: features.openEndedWordCountMean,
    open_ended_unique_word_ratio: features.openEndedUniqueWordRatio,
    straight_line_ratio: features.straightLineRatio,
    answer_entropy: features.answerEntropy,
    first_option_ratio: features.firstOptionRatio,
    last_option_ratio: features.lastOptionRatio,
    middle_option_ratio: features.middleOptionRatio,
    response_uniqueness_score: features.responseUniquenessScore,
    duplicate_answer_ratio: features.duplicateAnswerRatio,
    na_ratio: features.naRatio,
    skip_ratio: features.skipRatio,

    // Honeypot
    attention_check_passed: features.attentionCheckPassed,
    attention_check_count: features.attentionCheckCount,
    consistency_check_score: features.consistencyCheckScore,
    trap_field_filled: features.trapFieldFilled,
    honeypot_score: features.honeypotScore,
  };
}

// ============================================
// BEHAVIORAL FEATURE EXTRACTION
// ============================================

function extractMouseFeatures(
  mouseData: MouseMovement[] | null,
  features: CipherFeatures
): void {
  if (!mouseData || mouseData.length === 0) {
    return;
  }

  // Total distance traveled
  let totalDistance = 0;
  const velocities: number[] = [];
  const accelerations: number[] = [];
  let pauseCount = 0;
  let straightSegments = 0;
  let totalSegments = 0;

  for (let i = 1; i < mouseData.length; i++) {
    const prev = mouseData[i - 1];
    const curr = mouseData[i];

    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const dt = curr.t - prev.t;
    const distance = Math.sqrt(dx * dx + dy * dy);

    totalDistance += distance;

    if (dt > 0) {
      const velocity = distance / dt;
      velocities.push(velocity);

      // Detect pauses (no movement for > 500ms)
      if (dt > 500 && distance < 5) {
        pauseCount++;
      }

      // Calculate acceleration
      if (i > 1 && velocities.length >= 2) {
        const prevVelocity = velocities[velocities.length - 2];
        const acceleration = (velocity - prevVelocity) / dt;
        accelerations.push(Math.abs(acceleration));
      }
    }

    // Check if movement is roughly straight
    totalSegments++;
    if (Math.abs(dx) < 5 || Math.abs(dy) < 5) {
      straightSegments++;
    }
  }

  features.mouseDistanceTotal = totalDistance;
  features.mouseVelocityMean = mean(velocities);
  features.mouseVelocityStd = std(velocities);
  features.mouseVelocityMax = velocities.length > 0 ? Math.max(...velocities) : 0;
  features.mouseAccelerationMean = mean(accelerations);
  features.mousePauseCount = pauseCount;
  features.mouseStraightLineRatio = totalSegments > 0 ? straightSegments / totalSegments : 0;

  // Curvature entropy (measure of path complexity)
  features.mouseCurvatureEntropy = calculateCurvatureEntropy(mouseData);
}

function extractKeystrokeFeatures(
  keystrokeData: KeystrokeEvent[] | null,
  features: CipherFeatures
): void {
  if (!keystrokeData || keystrokeData.length === 0) {
    return;
  }

  const dwells: number[] = [];
  const flights: number[] = [];
  let backspaceCount = 0;

  for (let i = 0; i < keystrokeData.length; i++) {
    const event = keystrokeData[i];

    if (event.dwell && event.dwell > 0) {
      dwells.push(event.dwell);
    }

    if (event.flightTime && event.flightTime > 0) {
      flights.push(event.flightTime);
    }

    if (event.key === 'Backspace') {
      backspaceCount++;
    }
  }

  features.keystrokeCount = keystrokeData.length;
  features.keystrokeDwellMean = mean(dwells);
  features.keystrokeFlightMean = mean(flights);
  features.keystrokeTimingMean = mean([...dwells, ...flights]);
  features.keystrokeTimingStd = std([...dwells, ...flights]);
  features.backspaceRatio = keystrokeData.length > 0 ? backspaceCount / keystrokeData.length : 0;
}

function extractScrollFeatures(
  response: SurveyResponseData,
  features: CipherFeatures
): void {
  // Get scroll data from device_data if available
  const deviceData = response.deviceData as any;
  const scrollEvents = deviceData?.scrollEvents || [];

  if (scrollEvents.length === 0) {
    return;
  }

  const velocities: number[] = [];
  let directionChanges = 0;
  let lastDirection = 0;

  for (let i = 1; i < scrollEvents.length; i++) {
    const prev = scrollEvents[i - 1];
    const curr = scrollEvents[i];

    const dy = curr.y - prev.y;
    const dt = curr.t - prev.t;

    if (dt > 0) {
      velocities.push(Math.abs(dy / dt));
    }

    const currentDirection = dy > 0 ? 1 : dy < 0 ? -1 : 0;
    if (currentDirection !== 0 && lastDirection !== 0 && currentDirection !== lastDirection) {
      directionChanges++;
    }
    if (currentDirection !== 0) {
      lastDirection = currentDirection;
    }
  }

  features.scrollCount = scrollEvents.length;
  features.scrollVelocityMean = mean(velocities);
  features.scrollDirectionChanges = directionChanges;
}

function extractFocusFeatures(
  response: SurveyResponseData,
  features: CipherFeatures
): void {
  // Get focus data from device_data if available
  const deviceData = response.deviceData as any;
  const focusEvents = deviceData?.focusEvents || [];

  if (focusEvents.length === 0) {
    return;
  }

  let focusLossCount = 0;
  let totalBlurDuration = 0;
  let blurStart: number | null = null;

  for (const event of focusEvents) {
    if (event.type === 'blur' || event.type === 'hidden') {
      focusLossCount++;
      blurStart = event.t;
    } else if ((event.type === 'focus' || event.type === 'visible') && blurStart !== null) {
      totalBlurDuration += event.t - blurStart;
      blurStart = null;
    }
  }

  features.focusLossCount = focusLossCount;
  features.focusLossDurationTotal = totalBlurDuration;
}

// ============================================
// TEMPORAL FEATURE EXTRACTION
// ============================================

function extractTemporalFeatures(
  response: SurveyResponseData,
  features: CipherFeatures
): void {
  const timingData = response.timingData || [];
  const completedAt = new Date(response.completedAt);
  const createdAt = new Date(response.createdAt);

  // Completion time
  const completionMs = completedAt.getTime() - createdAt.getTime();
  features.completionTimeSeconds = completionMs / 1000;

  // Time per question statistics
  if (timingData.length > 0) {
    features.timePerQuestionMean = mean(timingData);
    features.timePerQuestionStd = std(timingData);
    features.timePerQuestionMin = Math.min(...timingData);
    features.timePerQuestionMax = Math.max(...timingData);

    // Response acceleration (are they speeding up?)
    if (timingData.length >= 3) {
      const firstHalf = timingData.slice(0, Math.floor(timingData.length / 2));
      const secondHalf = timingData.slice(Math.floor(timingData.length / 2));
      const firstHalfMean = mean(firstHalf);
      const secondHalfMean = mean(secondHalf);
      features.responseAcceleration =
        firstHalfMean > 0 ? (firstHalfMean - secondHalfMean) / firstHalfMean : 0;
    }
  }

  // Time of day and day of week
  features.timeOfDayHour = completedAt.getHours();
  features.dayOfWeek = completedAt.getDay();

  // First interaction delay (from device data)
  const deviceData = response.deviceData as any;
  if (deviceData?.firstInteractionTime && deviceData?.startTime) {
    features.firstInteractionDelayMs = deviceData.firstInteractionTime - deviceData.startTime;
  }

  // Calculate idle time and active time ratio
  const mouseData = response.mouseData || [];
  const keystrokeData = response.keystrokeData || [];

  let totalIdleTime = 0;
  const allEvents = [
    ...mouseData.map((m) => ({ t: m.t })),
    ...keystrokeData.map((k) => ({ t: k.downAt })),
  ].sort((a, b) => a.t - b.t);

  for (let i = 1; i < allEvents.length; i++) {
    const gap = allEvents[i].t - allEvents[i - 1].t;
    if (gap > 3000) {
      // 3 second threshold for idle
      totalIdleTime += gap;
    }
  }

  features.idleTimeTotal = totalIdleTime;
  features.activeTimeRatio = completionMs > 0 ? 1 - totalIdleTime / completionMs : 1;
}

// ============================================
// DEVICE FEATURE EXTRACTION
// ============================================

function extractDeviceFeatures(
  deviceData: DeviceData | null,
  features: CipherFeatures
): void {
  if (!deviceData) {
    return;
  }

  // Automation detection
  features.hasWebdriver = deviceData.webDriver ?? false;
  features.hasAutomationFlags = deviceData.automationDetected ?? false;

  // Browser/device info
  features.pluginCount = deviceData.pluginCount ?? 0;
  features.timezoneOffsetMinutes = deviceData.timezoneOffset ?? 0;
  features.deviceMemoryGb = deviceData.deviceMemory ?? 4;
  features.hardwareConcurrency = deviceData.hardwareConcurrency ?? 4;
  features.touchSupport = deviceData.touchSupport ?? false;

  // Screen resolution - check if it's a common resolution
  if (deviceData.screenWidth && deviceData.screenHeight) {
    features.screenResolutionCommon = isCommonResolution(
      deviceData.screenWidth,
      deviceData.screenHeight
    );
  }
}

// ============================================
// CONTENT FEATURE EXTRACTION
// ============================================

function extractContentFeatures(
  response: SurveyResponseData,
  features: CipherFeatures
): void {
  const responses = response.responses as Record<string, unknown>;
  if (!responses || typeof responses !== 'object') {
    return;
  }

  const answers = Object.values(responses);
  features.questionCount = answers.length;

  // Analyze open-ended responses
  const openEndedTexts: string[] = [];
  const multipleChoiceAnswers: (number | string)[] = [];

  for (const answer of answers) {
    if (typeof answer === 'string' && answer.length > 20) {
      openEndedTexts.push(answer);
    } else if (typeof answer === 'number' || (typeof answer === 'string' && answer.length <= 20)) {
      multipleChoiceAnswers.push(answer);
    }
  }

  features.openEndedCount = openEndedTexts.length;

  if (openEndedTexts.length > 0) {
    const lengths = openEndedTexts.map((t) => t.length);
    const wordCounts = openEndedTexts.map((t) => t.split(/\s+/).length);

    features.openEndedLengthMean = mean(lengths);
    features.openEndedLengthStd = std(lengths);
    features.openEndedWordCountMean = mean(wordCounts);

    // Unique word ratio (vocabulary diversity)
    const allWords = openEndedTexts.join(' ').toLowerCase().split(/\s+/);
    const uniqueWords = new Set(allWords);
    features.openEndedUniqueWordRatio = allWords.length > 0 ? uniqueWords.size / allWords.length : 0;
  }

  // Multiple choice analysis
  if (multipleChoiceAnswers.length > 0) {
    // Straight-lining detection
    const answerCounts = new Map<string, number>();
    for (const answer of multipleChoiceAnswers) {
      const key = String(answer);
      answerCounts.set(key, (answerCounts.get(key) || 0) + 1);
    }
    const maxCount = Math.max(...Array.from(answerCounts.values()));
    features.straightLineRatio = maxCount / multipleChoiceAnswers.length;

    // Answer entropy (diversity)
    features.answerEntropy = calculateEntropy(multipleChoiceAnswers);

    // Position bias (first/last/middle option selection)
    const numericAnswers = multipleChoiceAnswers.filter((a) => typeof a === 'number') as number[];
    if (numericAnswers.length > 0) {
      const firstCount = numericAnswers.filter((a) => a === 0 || a === 1).length;
      const lastCount = numericAnswers.filter((a) => a >= 4).length;

      features.firstOptionRatio = firstCount / numericAnswers.length;
      features.lastOptionRatio = lastCount / numericAnswers.length;
      features.middleOptionRatio = 1 - features.firstOptionRatio - features.lastOptionRatio;
    }

    // Duplicate answer ratio
    const totalAnswers = answerCounts.size;
    const duplicates = Array.from(answerCounts.values()).filter((c) => c > 1).length;
    features.duplicateAnswerRatio = totalAnswers > 0 ? duplicates / totalAnswers : 0;
  }

  // N/A and skip detection
  const naCount = answers.filter(
    (a) =>
      a === null ||
      a === '' ||
      (typeof a === 'string' && a.toLowerCase().includes('n/a'))
  ).length;
  features.naRatio = answers.length > 0 ? naCount / answers.length : 0;
  features.skipRatio = features.naRatio; // For now, treat as same
}

// ============================================
// HONEYPOT FEATURE EXTRACTION
// ============================================

function extractHoneypotFeatures(
  response: SurveyResponseData,
  features: CipherFeatures
): void {
  // Check for honeypot fields in response data
  const responses = response.responses as Record<string, unknown>;
  if (!responses) {
    return;
  }

  // Look for special honeypot question IDs
  const honeypotFields = Object.entries(responses).filter(
    ([key]) => key.includes('honeypot') || key.includes('trap') || key.includes('attention')
  );

  let attentionChecksPassed = 0;
  let attentionChecksTotal = 0;
  let trapFieldFilled = false;

  for (const [key, value] of honeypotFields) {
    if (key.includes('trap') || key.includes('honeypot')) {
      // Hidden trap field - should be empty
      if (value && String(value).length > 0) {
        trapFieldFilled = true;
      }
    } else if (key.includes('attention')) {
      // Attention check question
      attentionChecksTotal++;
      // Check if correct answer (this would need to be configured per survey)
      // For now, assume any non-empty response is a pass
      if (value && String(value).length > 0) {
        attentionChecksPassed++;
      }
    }
  }

  features.trapFieldFilled = trapFieldFilled;
  features.attentionCheckCount = attentionChecksTotal;
  features.attentionCheckPassed = attentionChecksTotal === 0 || attentionChecksPassed === attentionChecksTotal;

  // Calculate overall honeypot score
  let honeypotScore = 0;
  if (trapFieldFilled) {
    honeypotScore += 0.5;
  }
  if (attentionChecksTotal > 0 && attentionChecksPassed < attentionChecksTotal) {
    honeypotScore += 0.5 * (1 - attentionChecksPassed / attentionChecksTotal);
  }
  features.honeypotScore = honeypotScore;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function std(arr: number[]): number {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

function calculateEntropy(arr: (string | number)[]): number {
  if (arr.length === 0) return 0;

  const counts = new Map<string, number>();
  for (const item of arr) {
    const key = String(item);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  let entropy = 0;
  const countValues = Array.from(counts.values());
  for (const count of countValues) {
    const p = count / arr.length;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }

  return entropy;
}

function calculateCurvatureEntropy(mouseData: MouseMovement[]): number {
  if (mouseData.length < 3) return 0;

  const angles: number[] = [];

  for (let i = 2; i < mouseData.length; i++) {
    const p1 = mouseData[i - 2];
    const p2 = mouseData[i - 1];
    const p3 = mouseData[i];

    const v1 = { x: p2.x - p1.x, y: p2.y - p1.y };
    const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };

    const dot = v1.x * v2.x + v1.y * v2.y;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

    if (mag1 > 0 && mag2 > 0) {
      const cosAngle = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
      const angle = Math.acos(cosAngle);
      // Quantize angle to bins
      const bin = Math.floor(angle / (Math.PI / 8));
      angles.push(bin);
    }
  }

  // Calculate entropy of angle distribution
  return calculateEntropy(angles.map(String));
}

function isCommonResolution(width: number, height: number): boolean {
  const commonResolutions = [
    [1920, 1080],
    [1366, 768],
    [1536, 864],
    [1440, 900],
    [1280, 720],
    [2560, 1440],
    [3840, 2160],
    [1680, 1050],
    [1600, 900],
    [1280, 1024],
    [414, 896], // iPhone XR/11
    [375, 812], // iPhone X/XS
    [390, 844], // iPhone 12/13
    [412, 915], // Pixel phones
    [360, 800], // Common Android
  ];

  return commonResolutions.some(
    ([w, h]) => (width === w && height === h) || (width === h && height === w)
  );
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Normalize a feature value to 0-1 range
 * Uses feature-specific scaling based on expected ranges
 */
function normalizeFeature(name: keyof CipherFeatures, value: number): number {
  const ranges: Record<string, [number, number]> = {
    // Behavioral
    mouseDistanceTotal: [0, 50000],
    mouseVelocityMean: [0, 5],
    mouseVelocityStd: [0, 3],
    mouseVelocityMax: [0, 20],
    mouseAccelerationMean: [0, 0.1],
    mouseCurvatureEntropy: [0, 3],
    mouseStraightLineRatio: [0, 1],
    mousePauseCount: [0, 50],
    keystrokeCount: [0, 500],
    keystrokeTimingMean: [0, 500],
    keystrokeTimingStd: [0, 200],
    keystrokeDwellMean: [0, 200],
    keystrokeFlightMean: [0, 300],
    backspaceRatio: [0, 0.3],
    pasteEventCount: [0, 10],
    pasteCharRatio: [0, 1],
    scrollCount: [0, 200],
    scrollVelocityMean: [0, 5],
    scrollDirectionChanges: [0, 50],
    focusLossCount: [0, 20],
    focusLossDurationTotal: [0, 300000],
    hoverCount: [0, 100],
    hoverDurationMean: [0, 5000],
    clickCount: [0, 100],
    hoverBeforeClickRatio: [0, 1],

    // Temporal
    completionTimeSeconds: [0, 3600],
    timePerQuestionMean: [0, 120000],
    timePerQuestionStd: [0, 60000],
    timePerQuestionMin: [0, 60000],
    timePerQuestionMax: [0, 300000],
    readingVsAnsweringRatio: [0, 1],
    firstInteractionDelayMs: [0, 30000],
    idleTimeTotal: [0, 600000],
    activeTimeRatio: [0, 1],
    responseAcceleration: [-1, 1],
    timeOfDayHour: [0, 24],
    dayOfWeek: [0, 7],

    // Device
    pluginCount: [0, 20],
    timezoneOffsetMinutes: [-720, 720],
    fingerprintSeenCount: [1, 100],
    deviceMemoryGb: [0, 32],
    hardwareConcurrency: [1, 32],

    // Network
    ipReputationScore: [0, 1],
    ipSeenCount: [1, 100],

    // Content
    questionCount: [1, 50],
    openEndedCount: [0, 20],
    openEndedLengthMean: [0, 1000],
    openEndedLengthStd: [0, 500],
    openEndedWordCountMean: [0, 200],
    openEndedUniqueWordRatio: [0, 1],
    straightLineRatio: [0, 1],
    answerEntropy: [0, 5],
    firstOptionRatio: [0, 1],
    lastOptionRatio: [0, 1],
    middleOptionRatio: [0, 1],
    responseUniquenessScore: [0, 1],
    duplicateAnswerRatio: [0, 1],
    naRatio: [0, 1],
    skipRatio: [0, 1],

    // Honeypot
    attentionCheckCount: [0, 5],
    consistencyCheckScore: [0, 1],
    honeypotScore: [0, 1],
  };

  const range = ranges[name];
  if (!range) {
    return value;
  }

  const [min, max] = range;
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(1, normalized));
}
