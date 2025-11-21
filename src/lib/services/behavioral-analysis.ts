/**
 * Advanced Behavioral Analysis Service - Part of Cipher Fraud Detection
 *
 * Analyzes user interaction patterns including:
 * - Mouse movement characteristics (parallelism, teleporting, acceleration)
 * - Keystroke dynamics (timing variance, corrections, speed)
 * - Scroll behavior
 * - Interaction naturalness
 */

export interface MouseMovement {
  x: number
  y: number
  timestamp: number
}

export interface KeystrokeEvent {
  key: string
  timestamp: number
  type: 'keydown' | 'keyup'
}

export interface ScrollEvent {
  scrollY: number
  timestamp: number
}

export interface BehavioralAnalysisResult {
  overallScore: number // 0-1, higher = more suspicious
  confidence: number // 0-1
  detections: {
    roboticMouseMovements: boolean
    mouseTeleporting: boolean
    uniformKeystrokeTiming: boolean
    noTypingCorrections: boolean
    impossibleTypingSpeed: boolean
    instantFormFilling: boolean
    highMouseAcceleration: boolean
    noHoverBehavior: boolean
    noScrolling: boolean
  }
  metrics: {
    mouseParallelism: number // 0-1, higher = more parallel lines
    mouseTeleportCount: number
    keystrokeVariance: number // milliseconds
    backspaceCount: number
    wordsPerMinute: number
    timeToFirstInteraction: number // milliseconds
    maxMouseAcceleration: number
    hoverBeforeClickRatio: number
    scrollEventsCount: number
  }
  flags: string[]
}

/**
 * Comprehensive behavioral analysis
 */
export function analyzeBehavior(data: {
  mouseMovements?: MouseMovement[]
  keystrokes?: KeystrokeEvent[]
  scrollEvents?: ScrollEvent[]
  responseTime?: number[] // milliseconds per question
  focusEvents?: Array<{ type: 'focus' | 'blur'; timestamp: number }>
  clickEvents?: Array<{ x: number; y: number; timestamp: number; hadHover: boolean }>
}): BehavioralAnalysisResult {
  const flags: string[] = []
  const detections = {
    roboticMouseMovements: false,
    mouseTeleporting: false,
    uniformKeystrokeTiming: false,
    noTypingCorrections: false,
    impossibleTypingSpeed: false,
    instantFormFilling: false,
    highMouseAcceleration: false,
    noHoverBehavior: false,
    noScrolling: false,
  }

  // Analyze mouse movements
  const mouseAnalysis = analyzeMouseMovements(data.mouseMovements || [])
  if (mouseAnalysis.parallelism > 0.8) {
    detections.roboticMouseMovements = true
    flags.push('Robotic mouse movements detected (>80% parallel lines)')
  }
  if (mouseAnalysis.teleportCount > 0) {
    detections.mouseTeleporting = true
    flags.push(`Mouse teleporting detected (${mouseAnalysis.teleportCount} jumps >500px in <50ms)`)
  }
  if (mouseAnalysis.maxAcceleration > 10) {
    detections.highMouseAcceleration = true
    flags.push(`High mouse acceleration detected (${mouseAnalysis.maxAcceleration.toFixed(1)} units)`)
  }

  // Analyze keystrokes
  const keystrokeAnalysis = analyzeKeystrokes(data.keystrokes || [])
  if (keystrokeAnalysis.variance < 50 && (data.keystrokes?.length || 0) > 10) {
    detections.uniformKeystrokeTiming = true
    flags.push(`Uniform keystroke timing (variance: ${keystrokeAnalysis.variance.toFixed(0)}ms)`)
  }
  if (keystrokeAnalysis.backspaceCount === 0 && keystrokeAnalysis.totalKeys > 50) {
    detections.noTypingCorrections = true
    flags.push('No typing corrections detected on 50+ keystrokes')
  }
  if (keystrokeAnalysis.wpm > 150) {
    detections.impossibleTypingSpeed = true
    flags.push(`Impossible typing speed: ${keystrokeAnalysis.wpm} WPM`)
  }

  // Analyze timing
  const timeToFirstInteraction = calculateTimeToFirstInteraction(
    data.mouseMovements,
    data.keystrokes,
    data.clickEvents
  )
  if (timeToFirstInteraction < 100 && timeToFirstInteraction > 0) {
    detections.instantFormFilling = true
    flags.push(`Instant form filling: ${timeToFirstInteraction}ms to first interaction`)
  }

  // Analyze hover behavior
  const hoverAnalysis = analyzeHoverBehavior(data.clickEvents || [])
  if (hoverAnalysis.ratio < 0.3 && (data.clickEvents?.length || 0) > 5) {
    detections.noHoverBehavior = true
    flags.push(`No hover before clicks (${(hoverAnalysis.ratio * 100).toFixed(0)}% hover rate)`)
  }

  // Analyze scrolling
  const scrollAnalysis = analyzeScrollBehavior(data.scrollEvents || [])
  if (scrollAnalysis.hasLongContent && scrollAnalysis.scrollCount === 0) {
    detections.noScrolling = true
    flags.push('No scrolling detected on long content')
  }

  // Calculate overall suspicion score
  const suspicionFactors = [
    mouseAnalysis.parallelism > 0.8 ? 0.15 : 0,
    mouseAnalysis.teleportCount > 0 ? 0.15 : 0,
    mouseAnalysis.maxAcceleration > 10 ? 0.1 : 0,
    keystrokeAnalysis.variance < 50 && keystrokeAnalysis.totalKeys > 10 ? 0.15 : 0,
    keystrokeAnalysis.backspaceCount === 0 && keystrokeAnalysis.totalKeys > 50 ? 0.1 : 0,
    keystrokeAnalysis.wpm > 150 ? 0.15 : 0,
    timeToFirstInteraction < 100 && timeToFirstInteraction > 0 ? 0.1 : 0,
    hoverAnalysis.ratio < 0.3 && (data.clickEvents?.length || 0) > 5 ? 0.05 : 0,
    scrollAnalysis.hasLongContent && scrollAnalysis.scrollCount === 0 ? 0.05 : 0,
  ]

  const overallScore = Math.min(1, suspicionFactors.reduce((sum, factor) => sum + factor, 0))

  // Calculate confidence based on data availability
  const dataAvailability = [
    (data.mouseMovements?.length || 0) > 0,
    (data.keystrokes?.length || 0) > 0,
    (data.scrollEvents?.length || 0) > 0,
    (data.clickEvents?.length || 0) > 0,
  ].filter(Boolean).length

  const confidence = Math.min(1, dataAvailability / 4 + 0.5)

  return {
    overallScore,
    confidence,
    detections,
    metrics: {
      mouseParallelism: mouseAnalysis.parallelism,
      mouseTeleportCount: mouseAnalysis.teleportCount,
      keystrokeVariance: keystrokeAnalysis.variance,
      backspaceCount: keystrokeAnalysis.backspaceCount,
      wordsPerMinute: keystrokeAnalysis.wpm,
      timeToFirstInteraction,
      maxMouseAcceleration: mouseAnalysis.maxAcceleration,
      hoverBeforeClickRatio: hoverAnalysis.ratio,
      scrollEventsCount: scrollAnalysis.scrollCount,
    },
    flags,
  }
}

/**
 * Analyze mouse movement patterns for automation indicators
 */
function analyzeMouseMovements(movements: MouseMovement[]): {
  parallelism: number
  teleportCount: number
  maxAcceleration: number
} {
  if (movements.length < 3) {
    return { parallelism: 0, teleportCount: 0, maxAcceleration: 0 }
  }

  // Calculate parallelism (straight lines indicate automation)
  let parallelSegments = 0
  let totalSegments = 0

  for (let i = 2; i < movements.length; i++) {
    const p1 = movements[i - 2]
    const p2 = movements[i - 1]
    const p3 = movements[i]

    // Calculate angle between segments
    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x)
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
    const angleDiff = Math.abs(angle1 - angle2)

    // If angles are very similar (< 5 degrees), it's a straight line
    if (angleDiff < 0.087) {
      // 5 degrees in radians
      parallelSegments++
    }
    totalSegments++
  }

  const parallelism = totalSegments > 0 ? parallelSegments / totalSegments : 0

  // Detect teleporting (large jumps in short time)
  let teleportCount = 0
  for (let i = 1; i < movements.length; i++) {
    const prev = movements[i - 1]
    const curr = movements[i]
    const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2))
    const timeDelta = curr.timestamp - prev.timestamp

    if (distance > 500 && timeDelta < 50) {
      teleportCount++
    }
  }

  // Calculate max acceleration
  let maxAcceleration = 0
  for (let i = 2; i < movements.length; i++) {
    const p1 = movements[i - 2]
    const p2 = movements[i - 1]
    const p3 = movements[i]

    const v1 = calculateVelocity(p1, p2)
    const v2 = calculateVelocity(p2, p3)
    const timeDelta = (p3.timestamp - p2.timestamp) / 1000 // seconds

    if (timeDelta > 0) {
      const acceleration = Math.abs(v2 - v1) / timeDelta
      maxAcceleration = Math.max(maxAcceleration, acceleration)
    }
  }

  return { parallelism, teleportCount, maxAcceleration }
}

/**
 * Calculate velocity between two points
 */
function calculateVelocity(p1: MouseMovement, p2: MouseMovement): number {
  const distance = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  const timeDelta = (p2.timestamp - p1.timestamp) / 1000 // seconds
  return timeDelta > 0 ? distance / timeDelta : 0
}

/**
 * Analyze keystroke patterns for automation indicators
 */
function analyzeKeystrokes(keystrokes: KeystrokeEvent[]): {
  variance: number
  backspaceCount: number
  wpm: number
  totalKeys: number
} {
  if (keystrokes.length < 2) {
    return { variance: 0, backspaceCount: 0, wpm: 0, totalKeys: 0 }
  }

  // Calculate timing variance
  const intervals: number[] = []
  for (let i = 1; i < keystrokes.length; i++) {
    if (keystrokes[i].type === 'keydown' && keystrokes[i - 1].type === 'keydown') {
      intervals.push(keystrokes[i].timestamp - keystrokes[i - 1].timestamp)
    }
  }

  const avgInterval = intervals.length > 0 ? intervals.reduce((a, b) => a + b, 0) / intervals.length : 0
  const variance =
    intervals.length > 0
      ? Math.sqrt(
          intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length
        )
      : 0

  // Count backspaces
  const backspaceCount = keystrokes.filter((k) => k.key === 'Backspace' || k.key === 'Delete').length

  // Calculate WPM (assuming average word is 5 characters)
  const keydownEvents = keystrokes.filter((k) => k.type === 'keydown')
  const totalKeys = keydownEvents.length
  if (totalKeys > 0) {
    const firstTimestamp = keydownEvents[0].timestamp
    const lastTimestamp = keydownEvents[keydownEvents.length - 1].timestamp
    const durationMinutes = (lastTimestamp - firstTimestamp) / 60000
    const wpm = durationMinutes > 0 ? totalKeys / 5 / durationMinutes : 0
    return { variance, backspaceCount, wpm, totalKeys }
  }

  return { variance, backspaceCount, wpm: 0, totalKeys: 0 }
}

/**
 * Calculate time to first interaction
 */
function calculateTimeToFirstInteraction(
  mouseMovements?: MouseMovement[],
  keystrokes?: KeystrokeEvent[],
  clickEvents?: Array<{ timestamp: number }>
): number {
  const timestamps = [
    ...(mouseMovements || []).map((m) => m.timestamp),
    ...(keystrokes || []).map((k) => k.timestamp),
    ...(clickEvents || []).map((c) => c.timestamp),
  ].filter((t) => t > 0)

  if (timestamps.length === 0) return 0

  const minTimestamp = Math.min(...timestamps)
  return minTimestamp
}

/**
 * Analyze hover behavior before clicks
 */
function analyzeHoverBehavior(clickEvents: Array<{ hadHover: boolean }>): {
  ratio: number
} {
  if (clickEvents.length === 0) {
    return { ratio: 0 }
  }

  const hoverCount = clickEvents.filter((c) => c.hadHover).length
  return { ratio: hoverCount / clickEvents.length }
}

/**
 * Analyze scroll behavior
 */
function analyzeScrollBehavior(
  scrollEvents: ScrollEvent[]
): {
  scrollCount: number
  hasLongContent: boolean
} {
  // Assume content is long if max scroll > 1000px
  const maxScroll = scrollEvents.length > 0 ? Math.max(...scrollEvents.map((s) => s.scrollY)) : 0
  const hasLongContent = maxScroll > 1000

  return {
    scrollCount: scrollEvents.length,
    hasLongContent,
  }
}
