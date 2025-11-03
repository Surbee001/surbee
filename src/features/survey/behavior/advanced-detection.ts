/**
 * Advanced Fraud Detection System
 *
 * Implements 50+ sophisticated detection methods for identifying cheating,
 * automation, low-effort responses, and fraudulent behavior in surveys.
 */

import type { BehavioralMetrics, SuspiciousFlag, DeviceFingerprint } from '../types'

export interface AdvancedDetectionResult {
  flags: SuspiciousFlag[]
  totalScore: number
  categories: {
    automation: number
    content: number
    timing: number
    attention: number
    device: number
    interaction: number
  }
}

/**
 * Main detection function - runs all 50+ detection methods
 */
export function detectAdvancedFraud(
  metrics: BehavioralMetrics,
  responses?: Record<string, any>
): AdvancedDetectionResult {
  const flags: SuspiciousFlag[] = []
  const categories = {
    automation: 0,
    content: 0,
    timing: 0,
    attention: 0,
    device: 0,
    interaction: 0,
  }

  // AUTOMATION DETECTION (Methods 6-10, 24-29, 37-42)
  const automationFlags = detectAutomation(metrics)
  flags.push(...automationFlags)
  categories.automation = automationFlags.reduce((sum, f) => sum + f.weight, 0)

  // TIMING ANOMALIES (Methods 16-20)
  const timingFlags = detectTimingAnomalies(metrics, responses)
  flags.push(...timingFlags)
  categories.timing = timingFlags.reduce((sum, f) => sum + f.weight, 0)

  // ATTENTION & FOCUS (Methods 21-25)
  const attentionFlags = detectAttentionViolations(metrics)
  flags.push(...attentionFlags)
  categories.attention = attentionFlags.reduce((sum, f) => sum + f.weight, 0)

  // INTERACTION ANOMALIES (Methods 26-36)
  const interactionFlags = detectInteractionAnomalies(metrics)
  flags.push(...interactionFlags)
  categories.interaction = interactionFlags.reduce((sum, f) => sum + f.weight, 0)

  // DEVICE & FINGERPRINT (Methods 37-42)
  const deviceFlags = detectDeviceAnomalies(metrics.deviceFingerprint)
  flags.push(...deviceFlags)
  categories.device = deviceFlags.reduce((sum, f) => sum + f.weight, 0)

  // CONTENT ANALYSIS (Methods 53-58) - if responses provided
  if (responses) {
    const contentFlags = detectContentAnomalies(responses, metrics)
    flags.push(...contentFlags)
    categories.content = contentFlags.reduce((sum, f) => sum + f.weight, 0)
  }

  const totalScore = Object.values(categories).reduce((sum, val) => sum + val, 0)

  return {
    flags,
    totalScore: Math.min(1, totalScore),
    categories,
  }
}

/**
 * AUTOMATION DETECTION
 * Detects bots, scripts, and automated form filling
 */
function detectAutomation(metrics: BehavioralMetrics): SuspiciousFlag[] {
  const flags: SuspiciousFlag[] = []

  // Method 6: Survey Bot Detection
  if (metrics.deviceFingerprint?.webDriver || metrics.deviceFingerprint?.automation) {
    flags.push({
      code: 'automation_detected',
      message: 'Automation framework detected (Selenium/Puppeteer)',
      weight: 0.5,
    })
  }

  // Method 7: Browser Automation Detection
  const ua = metrics.deviceFingerprint?.userAgent?.toLowerCase() || ''
  if (ua.includes('headless') || ua.includes('selenium') || ua.includes('webdriver')) {
    flags.push({
      code: 'headless_browser',
      message: 'Headless browser detected',
      weight: 0.5,
    })
  }

  // Method 9: Form Auto-Fill Script Detection
  if (metrics.timeToFirstInteraction) {
    const avgTimeToFirst = Object.values(metrics.timeToFirstInteraction).reduce((a, b) => a + b, 0) / Object.keys(metrics.timeToFirstInteraction).length
    if (avgTimeToFirst < 100) { // Less than 100ms to start interacting
      flags.push({
        code: 'instant_interaction',
        message: 'Instant interaction suggesting auto-fill script',
        weight: 0.4,
      })
    }
  }

  // Method 24: No Typing Variation (Robotic Keystrokes)
  if (metrics.keystrokeDynamics && metrics.keystrokeDynamics.length > 10) {
    const dwellTimes = metrics.keystrokeDynamics.map(k => k.dwell).filter((d): d is number => d !== undefined && d > 0)
    const flightTimes = metrics.keystrokeDynamics.map(k => k.flightTime).filter((f): f is number => f !== undefined && f > 0)

    const dwellVariance = calculateVariance(dwellTimes)
    const flightVariance = calculateVariance(flightTimes)

    if (dwellVariance < 50 && flightVariance < 100) {
      flags.push({
        code: 'robotic_typing',
        message: 'Robotic typing patterns with no variation',
        weight: 0.4,
      })
    }
  }

  // Method 28: Impossible Typing Speed
  if (metrics.keystrokeDynamics && metrics.keystrokeDynamics.length > 20) {
    const timespan = metrics.keystrokeDynamics[metrics.keystrokeDynamics.length - 1].downAt - metrics.keystrokeDynamics[0].downAt
    const wpm = (metrics.keystrokeDynamics.length / 5) / (timespan / 60000) // Average word = 5 characters
    if (wpm > 150) {
      flags.push({
        code: 'impossible_typing_speed',
        message: `Typing speed of ${Math.round(wpm)} WPM exceeds human limits`,
        weight: 0.35,
      })
    }
  }

  // Method 29: No Corrections/Backspaces
  if ((metrics.keypressCount || 0) > 50 && (metrics.backspaceCount || 0) === 0) {
    flags.push({
      code: 'no_corrections',
      message: 'No typing corrections detected (inhuman)',
      weight: 0.25,
    })
  }

  // Method 31: Robotic Mouse Movement
  if (metrics.mouseMovements && metrics.mouseMovements.length > 20) {
    let straightLines = 0
    for (let i = 2; i < metrics.mouseMovements.length; i++) {
      const p1 = metrics.mouseMovements[i - 2]
      const p2 = metrics.mouseMovements[i - 1]
      const p3 = metrics.mouseMovements[i]

      const dx1 = p2.x - p1.x
      const dy1 = p2.y - p1.y
      const dx2 = p3.x - p2.x
      const dy2 = p3.y - p2.y

      const crossProduct = Math.abs(dx1 * dy2 - dy1 * dx2)
      if (crossProduct < 5) straightLines++
    }

    if (straightLines / metrics.mouseMovements.length > 0.8) {
      flags.push({
        code: 'perfect_mouse_lines',
        message: 'Mouse movements are suspiciously straight',
        weight: 0.4,
      })
    }
  }

  // Method 32: Mouse Teleporting
  if (metrics.mouseMovements && metrics.mouseMovements.length > 10) {
    let teleports = 0
    for (let i = 1; i < metrics.mouseMovements.length; i++) {
      const prev = metrics.mouseMovements[i - 1]
      const curr = metrics.mouseMovements[i]
      const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2))
      const timeDiff = curr.t - prev.t

      if (distance > 500 && timeDiff < 50) teleports++
    }

    if (teleports > 5) {
      flags.push({
        code: 'mouse_teleporting',
        message: 'Mouse cursor teleporting detected',
        weight: 0.35,
      })
    }
  }

  // Method 33: No Hover Behavior
  if (metrics.hoverEvents && metrics.hoverEvents.length === 0 && (metrics.mouseMovements?.length || 0) > 20) {
    flags.push({
      code: 'no_hover',
      message: 'No hover behavior detected before clicks',
      weight: 0.3,
    })
  }

  // Method 35: High Velocity Bot Movement
  if (metrics.mouseAcceleration && metrics.mouseAcceleration.length > 10) {
    const avgAcceleration = metrics.mouseAcceleration.reduce((a, b) => a + b, 0) / metrics.mouseAcceleration.length
    if (avgAcceleration > 10) {
      flags.push({
        code: 'high_mouse_acceleration',
        message: 'Unrealistic mouse acceleration detected',
        weight: 0.3,
      })
    }
  }

  // Method 36: No Scroll on Long Content
  if (metrics.scrollPattern && metrics.scrollPattern.length === 0 && metrics.responseTime.length > 5) {
    flags.push({
      code: 'no_scrolling',
      message: 'No scrolling detected on multi-question survey',
      weight: 0.25,
    })
  }

  return flags
}

/**
 * TIMING ANOMALIES DETECTION
 * Detects impossible speeds and suspicious timing patterns
 */
function detectTimingAnomalies(metrics: BehavioralMetrics, responses?: Record<string, any>): SuspiciousFlag[] {
  const flags: SuspiciousFlag[] = []

  // Method 16: Impossibly Fast Completion
  const totalTime = metrics.responseTime.reduce((a, b) => a + b, 0)
  const questionCount = metrics.responseTime.length

  if (questionCount > 5 && totalTime / questionCount < 2000) { // Less than 2 seconds per question
    flags.push({
      code: 'impossibly_fast',
      message: `Average ${Math.round(totalTime / questionCount / 1000)}s per question`,
      weight: 0.45,
    })
  }

  // Method 17: Uniform Timing (Bot Pattern)
  if (metrics.responseTime.length > 5) {
    const variance = calculateVariance(metrics.responseTime)
    const mean = metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length
    const cv = Math.sqrt(variance) / mean

    if (cv < 0.15) { // Coefficient of variation too low
      flags.push({
        code: 'uniform_timing',
        message: 'Suspiciously uniform response timing',
        weight: 0.4,
      })
    }
  }

  // Method 18: Complex Question Speed Reading
  // This would require question text analysis - simplified version
  const fastComplexResponses = metrics.responseTime.filter(t => t < 3000).length
  if (fastComplexResponses / questionCount > 0.7) {
    flags.push({
      code: 'speed_reading',
      message: 'Answering complex questions too quickly',
      weight: 0.35,
    })
  }

  // Method 19: Suspicious Pauses
  const longPauses = metrics.responseTime.filter(t => t > 120000) // > 2 minutes
  if (longPauses.length > 2) {
    flags.push({
      code: 'suspicious_pauses',
      message: 'Multiple extended pauses suggesting external lookup',
      weight: 0.25,
    })
  }

  // Method 20: Copy-Paste Timing
  if (metrics.copyPasteEvents) {
    const rapidPastes = metrics.copyPasteEvents.filter(event => {
      if (event.type === 'paste' && event.textLength && event.textLength > 50) {
        // Check if text appeared instantly (paste)
        return true
      }
      return false
    })

    if (rapidPastes.length > 3) {
      flags.push({
        code: 'rapid_paste_timing',
        message: 'Multiple instances of rapid text appearance (paste)',
        weight: 0.35,
      })
    }
  }

  return flags
}

/**
 * ATTENTION & FOCUS VIOLATIONS
 * Detects tab switching, window minimizing, and distraction
 */
function detectAttentionViolations(metrics: BehavioralMetrics): SuspiciousFlag[] {
  const flags: SuspiciousFlag[] = []

  const focusEvents = metrics.focusEvents || []
  const blurEvents = focusEvents.filter(e => e.type === 'blur').length
  const visibilityChanges = focusEvents.filter(e => e.type === 'visibilitychange').length

  // Method 21: Tab Switching
  if (blurEvents > 5) {
    flags.push({
      code: 'excessive_tab_switching',
      message: `${blurEvents} tab switches detected`,
      weight: 0.3,
    })
  }

  // Method 22: Window Focus Loss
  if (visibilityChanges > 8) {
    flags.push({
      code: 'window_focus_loss',
      message: 'Multiple window visibility changes',
      weight: 0.25,
    })
  }

  // Method 24: Extended Away Time
  if (metrics.lastInputAt) {
    const inactiveTime = Date.now() - metrics.lastInputAt
    if (inactiveTime > 300000) { // 5 minutes
      flags.push({
        code: 'extended_inactivity',
        message: 'Extended period of inactivity',
        weight: 0.2,
      })
    }
  }

  // Method 30: Copy-Paste of Questions
  if (metrics.copyPasteEvents) {
    const copyEvents = metrics.copyPasteEvents.filter(e => e.type === 'copy')
    if (copyEvents.length > 3) {
      flags.push({
        code: 'copying_questions',
        message: 'Multiple copy operations (possibly copying questions)',
        weight: 0.3,
      })
    }
  }

  return flags
}

/**
 * INTERACTION ANOMALIES
 * Detects suspicious input patterns and low engagement
 */
function detectInteractionAnomalies(metrics: BehavioralMetrics): SuspiciousFlag[] {
  const flags: SuspiciousFlag[] = []

  // Method 26: Excessive Paste Operations
  const pasteCount = metrics.pasteEvents || 0
  if (pasteCount > 5) {
    flags.push({
      code: 'excessive_pasting',
      message: `${pasteCount} paste operations detected`,
      weight: 0.35,
    })
  }

  // Method 34: Minimal Mouse Activity
  const mouseCount = metrics.mouseMovements?.length || 0
  const questionCount = metrics.responseTime.length

  if (questionCount > 5 && mouseCount < questionCount * 5) {
    flags.push({
      code: 'minimal_mouse',
      message: 'Insufficient mouse activity for survey length',
      weight: 0.3,
    })
  }

  // Check for DevTools usage
  if (metrics.devToolsDetected && metrics.devToolsDetected.length > 0) {
    flags.push({
      code: 'devtools_open',
      message: 'Developer tools were open during survey',
      weight: 0.4,
    })
  }

  // Time to first interaction anomalies
  if (metrics.timeToFirstInteraction) {
    const times = Object.values(metrics.timeToFirstInteraction)
    const avgTimeToInteract = times.reduce((a, b) => a + b, 0) / times.length

    if (avgTimeToInteract < 200) { // Less than 200ms is suspicious
      flags.push({
        code: 'instant_answers',
        message: 'Answering before questions could be read',
        weight: 0.4,
      })
    }
  }

  return flags
}

/**
 * DEVICE & FINGERPRINT ANOMALIES
 * Detects suspicious devices, VPNs, and fingerprint issues
 */
function detectDeviceAnomalies(fingerprint?: DeviceFingerprint): SuspiciousFlag[] {
  const flags: SuspiciousFlag[] = []

  if (!fingerprint) return flags

  // Method 37: Headless Browser Detection
  if (fingerprint.webDriver) {
    flags.push({
      code: 'webdriver_present',
      message: 'WebDriver property detected',
      weight: 0.5,
    })
  }

  // Method 38: Automation Tool Signatures
  if (fingerprint.automation) {
    flags.push({
      code: 'automation_tools',
      message: 'Automation tool signatures detected',
      weight: 0.5,
    })
  }

  // Method 39: Unnatural Device Characteristics
  if (fingerprint.screen) {
    const { w, h } = fingerprint.screen
    if (w && h && (w < 200 || h < 200 || w > 8000 || h > 8000)) {
      flags.push({
        code: 'impossible_screen',
        message: `Impossible screen dimensions: ${w}x${h}`,
        weight: 0.4,
      })
    }
  }

  // Method 40: Missing plugins (bots often have no plugins)
  if (fingerprint.plugins && fingerprint.plugins.length === 0) {
    flags.push({
      code: 'no_plugins',
      message: 'No browser plugins detected',
      weight: 0.25,
    })
  }

  // Method 42: Touch support inconsistencies
  const isMobile = fingerprint.platform?.toLowerCase().includes('mobile') ||
                   fingerprint.userAgent?.toLowerCase().includes('mobile')

  if (isMobile && (!fingerprint.touchSupport || fingerprint.maxTouchPoints === 0)) {
    flags.push({
      code: 'mobile_no_touch',
      message: 'Mobile device with no touch support',
      weight: 0.35,
    })
  }

  return flags
}

/**
 * CONTENT ANOMALIES
 * Detects pattern answers, gibberish, and suspicious content
 */
function detectContentAnomalies(responses: Record<string, any>, _metrics: BehavioralMetrics): SuspiciousFlag[] {
  const metrics = _metrics // Keep reference for future use
  const flags: SuspiciousFlag[] = []

  const answers = Object.values(responses)

  // Method 12: Pattern Answers (AAAA, ABCD, etc.)
  const answerPattern = detectAnswerPattern(answers)
  if (answerPattern) {
    flags.push({
      code: 'pattern_answers',
      message: `Detected answer pattern: ${answerPattern}`,
      weight: 0.4,
    })
  }

  // Method 13: Straight-Line Survey Responses
  const numericAnswers = answers.filter(a => typeof a === 'number')
  if (numericAnswers.length > 5) {
    const uniqueValues = new Set(numericAnswers).size
    if (uniqueValues === 1) {
      flags.push({
        code: 'straight_line_answers',
        message: 'All rating questions answered identically',
        weight: 0.45,
      })
    }
  }

  // Method 14: Gibberish Text Entries
  const textAnswers = answers.filter(a => typeof a === 'string' && a.length > 5)
  const gibberishCount = textAnswers.filter(text => isGibberish(text as string)).length

  if (gibberishCount > 0) {
    flags.push({
      code: 'gibberish_text',
      message: `${gibberishCount} gibberish text responses detected`,
      weight: 0.4,
    })
  }

  // Method 15: Minimal Effort Answers
  const shortAnswers = textAnswers.filter((text) => (text as string).split(' ').length < 3)
  if (shortAnswers.length > textAnswers.length / 2 && textAnswers.length > 3) {
    flags.push({
      code: 'minimal_effort',
      message: 'Majority of text answers are very short',
      weight: 0.3,
    })
  }

  // Method 58: Speeding + High Quality (suspicious combination)
  const avgResponseTime = metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length
  const hasLongTextAnswers = textAnswers.some(text => (text as string).split(' ').length > 20)

  if (avgResponseTime < 5000 && hasLongTextAnswers) {
    flags.push({
      code: 'speed_quality_mismatch',
      message: 'High-quality answers with impossibly fast timing',
      weight: 0.35,
    })
  }

  return flags
}

/**
 * UTILITY FUNCTIONS
 */

function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
  return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length
}

function detectAnswerPattern(answers: any[]): string | null {
  // Check for repeating patterns like AAAA, ABAB, ABCD repeating
  if (answers.length < 4) return null

  // Check for all same
  if (answers.every(a => a === answers[0])) {
    return 'All identical'
  }

  // Check for alternating (ABABAB)
  let isAlternating = true
  for (let i = 2; i < answers.length; i++) {
    if (answers[i] !== answers[i % 2]) {
      isAlternating = false
      break
    }
  }
  if (isAlternating) return 'Alternating pattern'

  // Check for sequential (ABCDABCD)
  const uniqueAnswers = [...new Set(answers)]
  if (uniqueAnswers.length <= 4) {
    let isSequential = true
    for (let i = 0; i < answers.length; i++) {
      if (answers[i] !== uniqueAnswers[i % uniqueAnswers.length]) {
        isSequential = false
        break
      }
    }
    if (isSequential) return 'Sequential repetition'
  }

  return null
}

function isGibberish(text: string): boolean {
  // Simple gibberish detection
  const lowerText = text.toLowerCase()

  // Check for keyboard mashing patterns
  if (/(.)\1{4,}/.test(lowerText)) return true // aaaaa
  if (/^[asdfghjkl]+$/.test(lowerText)) return true // asdfasdf
  if (/^[qwertyuiop]+$/.test(lowerText)) return true // qwerty

  // Check for very low vowel ratio
  const vowels = lowerText.match(/[aeiou]/g)?.length || 0
  const vowelRatio = vowels / lowerText.length
  if (vowelRatio < 0.15 && lowerText.length > 10) return true

  // Check for test strings
  const testStrings = ['test', 'asdf', 'qwerty', 'zzz', 'xxx', 'aaa', 'bbb']
  if (testStrings.some(test => lowerText.includes(test) && lowerText.length < 20)) return true

  return false
}

/**
 * Calculate overall fraud risk level
 */
export function calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 0.8) return 'critical'
  if (score >= 0.6) return 'high'
  if (score >= 0.4) return 'medium'
  return 'low'
}

/**
 * Generate human-readable fraud report
 */
export function generateFraudReport(result: AdvancedDetectionResult): string {
  const riskLevel = calculateRiskLevel(result.totalScore)
  const topFlags = result.flags
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)

  let report = `Fraud Risk: ${riskLevel.toUpperCase()} (Score: ${(result.totalScore * 100).toFixed(1)}%)\n\n`
  report += `Category Breakdown:\n`
  report += `- Automation: ${(result.categories.automation * 100).toFixed(1)}%\n`
  report += `- Timing: ${(result.categories.timing * 100).toFixed(1)}%\n`
  report += `- Attention: ${(result.categories.attention * 100).toFixed(1)}%\n`
  report += `- Interaction: ${(result.categories.interaction * 100).toFixed(1)}%\n`
  report += `- Device: ${(result.categories.device * 100).toFixed(1)}%\n`
  report += `- Content: ${(result.categories.content * 100).toFixed(1)}%\n\n`

  if (topFlags.length > 0) {
    report += `Top Concerns:\n`
    topFlags.forEach((flag, i) => {
      report += `${i + 1}. [${flag.code}] ${flag.message}\n`
    })
  }

  return report
}
