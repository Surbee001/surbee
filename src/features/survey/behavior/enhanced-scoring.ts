import type { BehavioralMetrics, SuspiciousFlag } from '../types'

// Enhanced AI-powered fraud detection patterns
export function detectAdvancedFraudPatterns(m: BehavioralMetrics): { additionalScore: number; newFlags: SuspiciousFlag[] } {
  const flags: SuspiciousFlag[] = []
  let additionalScore = 0

  // 1. Mouse Movement Pattern Analysis
  const mouseAnalysis = analyzeMousePatterns(m.mouseMovements || [])
  if (mouseAnalysis.isRobotic) {
    flags.push({ code: 'robotic_mouse', message: 'Robotic mouse movement patterns', weight: 0.4 })
    additionalScore += 0.4
  }
  if (mouseAnalysis.isTeleporting) {
    flags.push({ code: 'mouse_teleport', message: 'Instantaneous mouse position changes', weight: 0.3 })
    additionalScore += 0.3
  }

  // 2. Keystroke Dynamics Analysis
  const keystrokeAnalysis = analyzeKeystrokeDynamics(m.keystrokeDynamics || [])
  if (keystrokeAnalysis.isUnnatural) {
    flags.push({ code: 'unnatural_typing', message: 'Unnatural typing patterns', weight: 0.25 })
    additionalScore += 0.25
  }

  // 3. Response Pattern Analysis
  const responseAnalysis = analyzeResponsePatterns(m.responseTime || [])
  if (responseAnalysis.isRepeatingPattern) {
    flags.push({ code: 'pattern_repetition', message: 'Repeating response patterns', weight: 0.2 })
    additionalScore += 0.2
  }

  // 4. Device Fingerprint Analysis
  const deviceAnalysis = analyzeDeviceFingerprint(m.deviceFingerprint)
  if (deviceAnalysis.isSuspicious) {
    flags.push({ code: 'suspicious_device', message: 'Suspicious device characteristics', weight: 0.15 })
    additionalScore += 0.15
  }

  // 5. Cross-Question Consistency
  const consistencyAnalysis = analyzeCrossQuestionConsistency(m)
  if (consistencyAnalysis.isInconsistent) {
    flags.push({ code: 'inconsistent_responses', message: 'Inconsistent response patterns', weight: 0.2 })
    additionalScore += 0.2
  }

  // 6. Attention and Cognitive Load Indicators
  const attentionAnalysis = analyzeAttentionPatterns(m)
  if (attentionAnalysis.lowAttention) {
    flags.push({ code: 'low_attention', message: 'Low attention indicators', weight: 0.15 })
    additionalScore += 0.15
  }

  return { additionalScore: clamp(additionalScore, 0, 0.8), newFlags: flags }
}

// Mouse movement pattern analysis
function analyzeMousePatterns(movements: any[]): { isRobotic: boolean; isTeleporting: boolean } {
  if (movements.length < 10) return { isRobotic: false, isTeleporting: false }

  let straightLineCount = 0
  let teleportCount = 0
  
  for (let i = 2; i < movements.length; i++) {
    const prev = movements[i-2]
    const curr = movements[i-1]
    const next = movements[i]
    
    // Check for straight line movement (robotic indicator)
    if (prev && curr && next) {
      const dx1 = curr.x - prev.x
      const dy1 = curr.y - prev.y
      const dx2 = next.x - curr.x
      const dy2 = next.y - curr.y
      
      // Check if vectors are parallel (indicating straight line)
      const crossProduct = Math.abs(dx1 * dy2 - dy1 * dx2)
      if (crossProduct < 1) straightLineCount++
    }
    
    // Check for teleporting (sudden large jumps)
    if (curr && next) {
      const distance = Math.sqrt(Math.pow(next.x - curr.x, 2) + Math.pow(next.y - curr.y, 2))
      const timeDiff = next.t - curr.t
      if (distance > 500 && timeDiff < 50) teleportCount++
    }
  }
  
  return {
    isRobotic: straightLineCount / movements.length > 0.7,
    isTeleporting: teleportCount > 3
  }
}

// Keystroke dynamics analysis
function analyzeKeystrokeDynamics(keystrokes: any[]): { isUnnatural: boolean } {
  if (keystrokes.length < 5) return { isUnnatural: false }
  
  // Calculate dwell times and flight times
  const dwellTimes = keystrokes.map(k => k.dwell || 0).filter(d => d > 0)
  const flightTimes: number[] = []
  
  for (let i = 1; i < keystrokes.length; i++) {
    if (keystrokes[i-1].upAt && keystrokes[i].downAt) {
      flightTimes.push(keystrokes[i].downAt - keystrokes[i-1].upAt)
    }
  }
  
  // Check for unnatural uniformity
  const dwellVariance = calculateVariance(dwellTimes)
  const flightVariance = calculateVariance(flightTimes)
  
  // Human typing has natural variation; too uniform suggests automation
  return {
    isUnnatural: dwellVariance < 100 || flightVariance < 200
  }
}

// Response pattern analysis
function analyzeResponsePatterns(responseTimes: number[]): { isRepeatingPattern: boolean } {
  if (responseTimes.length < 5) return { isRepeatingPattern: false }
  
  // Look for repeating patterns in response times
  const normalizedTimes = responseTimes.map(t => Math.round(t / 1000)) // Round to seconds
  const patterns = new Map<string, number>()
  
  for (let i = 0; i < normalizedTimes.length - 2; i++) {
    const pattern = `${normalizedTimes[i]}-${normalizedTimes[i+1]}-${normalizedTimes[i+2]}`
    patterns.set(pattern, (patterns.get(pattern) || 0) + 1)
  }
  
  // If any pattern repeats more than 30% of the time, it's suspicious
  const maxPatternCount = Math.max(...Array.from(patterns.values()))
  return {
    isRepeatingPattern: maxPatternCount / (normalizedTimes.length - 2) > 0.3
  }
}

// Device fingerprint analysis
function analyzeDeviceFingerprint(device: any): { isSuspicious: boolean } {
  if (!device || !device.userAgent) return { isSuspicious: false }
  
  const ua = device.userAgent.toLowerCase()
  
  // Check for automation tools, headless browsers, or suspicious patterns
  const suspiciousPatterns = [
    'headless', 'phantom', 'selenium', 'webdriver', 'automation',
    'bot', 'crawler', 'spider', 'scraper'
  ]
  
  const hasSuspiciousUA = suspiciousPatterns.some(pattern => ua.includes(pattern))
  
  // Check for unusual screen dimensions or missing standard properties
  const hasUnusualScreen = device.screen && (
    device.screen.w < 100 || device.screen.h < 100 ||
    device.screen.w > 10000 || device.screen.h > 10000
  )
  
  return {
    isSuspicious: hasSuspiciousUA || hasUnusualScreen || false
  }
}

// Cross-question consistency analysis
function analyzeCrossQuestionConsistency(m: BehavioralMetrics): { isInconsistent: boolean } {
  // Analyze response patterns across related questions
  const responseTimes = m.responseTime || []
  if (responseTimes.length < 3) return { isInconsistent: false }
  
  const variance = calculateVariance(responseTimes)
  const mean = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
  
  // If coefficient of variation is too high, responses are inconsistent
  const coefficientOfVariation = Math.sqrt(variance) / mean
  
  return {
    isInconsistent: coefficientOfVariation > 2.0 // Very high variation
  }
}

// Attention pattern analysis
function analyzeAttentionPatterns(m: BehavioralMetrics): { lowAttention: boolean } {
  const focusEvents = m.focusEvents || []
  const scrollEvents = m.scrollPattern || []
  
  // Count focus/blur events (tab switching indicates distraction)
  const focusLossCount = focusEvents.filter(e => e.type === 'blur').length
  
  // Check for rapid scrolling without reading time
  let rapidScrollCount = 0
  for (let i = 1; i < scrollEvents.length; i++) {
    const timeDiff = scrollEvents[i].t - scrollEvents[i-1].t
    const scrollDiff = Math.abs(scrollEvents[i].y - scrollEvents[i-1].y)
    if (timeDiff < 100 && scrollDiff > 200) rapidScrollCount++
  }
  
  return {
    lowAttention: focusLossCount > 5 || rapidScrollCount > 10
  }
}

// Utility functions
function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
  return numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

// Real-time fraud assessment for live survey taking
export function assessRealTimeFraud(currentMetrics: Partial<BehavioralMetrics>): {
  riskLevel: 'low' | 'medium' | 'high';
  shouldFlag: boolean;
  recommendations: string[];
} {
  const recommendations: string[] = []
  let riskScore = 0
  
  // Quick checks for immediate red flags
  if (currentMetrics.responseTime) {
    const avgResponseTime = currentMetrics.responseTime.reduce((a, b) => a + b, 0) / currentMetrics.responseTime.length
    if (avgResponseTime < 1000) { // Less than 1 second per question
      riskScore += 0.4
      recommendations.push('Extremely fast responses detected')
    }
  }
  
  if (currentMetrics.mouseMovements && currentMetrics.mouseMovements.length < 5) {
    riskScore += 0.3
    recommendations.push('Very limited mouse interaction')
  }
  
  if (currentMetrics.pasteEvents && currentMetrics.pasteEvents > 2) {
    riskScore += 0.2
    recommendations.push('Multiple paste operations detected')
  }
  
  // Check for suspicious device fingerprint
  if (currentMetrics.deviceFingerprint) {
    const deviceCheck = analyzeDeviceFingerprint(currentMetrics.deviceFingerprint)
    if (deviceCheck.isSuspicious) {
      riskScore += 0.3
      recommendations.push('Suspicious device characteristics')
    }
  }
  
  const riskLevel = riskScore > 0.6 ? 'high' : riskScore > 0.3 ? 'medium' : 'low'
  
  return {
    riskLevel,
    shouldFlag: riskScore > 0.5,
    recommendations
  }
}

// AI-powered pattern recognition for sophisticated fraud detection
export function detectAIPatterns(behavioralHistory: BehavioralMetrics[]): {
  isLikelyBot: boolean;
  confidence: number;
  patterns: string[];
} {
  if (behavioralHistory.length < 3) {
    return { isLikelyBot: false, confidence: 0, patterns: [] }
  }
  
  const patterns: string[] = []
  let botIndicators = 0
  const totalIndicators = 6
  
  // 1. Check for consistent timing patterns across sessions
  const timingConsistency = analyzeCrossSessionTiming(behavioralHistory)
  if (timingConsistency > 0.8) {
    patterns.push('Highly consistent timing across sessions')
    botIndicators++
  }
  
  // 2. Check for identical mouse movement patterns
  const mouseConsistency = analyzeCrossSessionMouse(behavioralHistory)
  if (mouseConsistency > 0.7) {
    patterns.push('Identical mouse movement patterns')
    botIndicators++
  }
  
  // 3. Check for lack of natural human variation
  const variationScore = analyzeNaturalVariation(behavioralHistory)
  if (variationScore < 0.3) {
    patterns.push('Lack of natural human behavioral variation')
    botIndicators++
  }
  
  // 4. Check for superhuman consistency
  const humanLikeness = analyzeHumanLikeness(behavioralHistory)
  if (humanLikeness < 0.4) {
    patterns.push('Superhuman consistency in responses')
    botIndicators++
  }
  
  // 5. Environmental consistency (too perfect)
  const envConsistency = analyzeEnvironmentalConsistency(behavioralHistory)
  if (envConsistency > 0.9) {
    patterns.push('Unnaturally consistent environment')
    botIndicators++
  }
  
  // 6. Learning pattern absence (humans improve/change over time)
  const learningPattern = analyzeLearningPattern(behavioralHistory)
  if (!learningPattern) {
    patterns.push('No natural learning or adaptation patterns')
    botIndicators++
  }
  
  const confidence = botIndicators / totalIndicators
  
  return {
    isLikelyBot: confidence > 0.6,
    confidence,
    patterns
  }
}

// Helper functions for AI pattern detection
function analyzeCrossSessionTiming(history: BehavioralMetrics[]): number {
  // Analyze timing consistency across sessions
  const sessionAverages = history.map(session => {
    const times = session.responseTime || []
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }).filter(avg => avg > 0)
  
  if (sessionAverages.length < 2) return 0
  
  const variance = calculateVariance(sessionAverages)
  const mean = sessionAverages.reduce((a, b) => a + b, 0) / sessionAverages.length
  const coefficientOfVariation = Math.sqrt(variance) / mean
  
  // Lower variation = higher consistency = more suspicious
  return Math.max(0, 1 - coefficientOfVariation)
}

function analyzeCrossSessionMouse(history: BehavioralMetrics[]): number {
  // Compare mouse movement patterns across sessions
  // This is a simplified implementation
  const mouseSessions = history.filter(h => h.mouseMovements && h.mouseMovements.length > 10)
  if (mouseSessions.length < 2) return 0
  
  // For simplicity, check if movement patterns are too similar
  // In a real implementation, you'd use more sophisticated pattern matching
  return 0.5 // Placeholder
}

function analyzeNaturalVariation(history: BehavioralMetrics[]): number {
  // Humans naturally vary in their behavior
  const allResponseTimes = history.flatMap(h => h.responseTime || [])
  if (allResponseTimes.length < 10) return 1
  
  const variance = calculateVariance(allResponseTimes)
  const mean = allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length
  
  // Normalize variation score (higher = more human-like)
  return Math.min(1, Math.sqrt(variance) / mean)
}

function analyzeHumanLikeness(history: BehavioralMetrics[]): number {
  // Check for human-like imperfections and inconsistencies
  let humanIndicators = 0
  const totalChecks = 4
  
  // Check for occasional long pauses (human distraction)
  const allTimes = history.flatMap(h => h.responseTime || [])
  const hasLongPauses = allTimes.some(time => time > 30000) // 30+ seconds
  if (hasLongPauses) humanIndicators++
  
  // Check for typing corrections/backspaces
  const allKeystrokes = history.flatMap(h => h.keystrokeDynamics || [])
  const hasCorrections = allKeystrokes.some(k => k.key === 'Backspace' || k.key === 'Delete')
  if (hasCorrections) humanIndicators++
  
  // Check for focus loss events
  const allFocusEvents = history.flatMap(h => h.focusEvents || [])
  const hasFocusLoss = allFocusEvents.some(e => e.type === 'blur')
  if (hasFocusLoss) humanIndicators++
  
  // Check for scrolling behavior
  const allScrollEvents = history.flatMap(h => h.scrollPattern || [])
  const hasScrolling = allScrollEvents.length > 0
  if (hasScrolling) humanIndicators++
  
  return humanIndicators / totalChecks
}

function analyzeEnvironmentalConsistency(history: BehavioralMetrics[]): number {
  // Check if device fingerprints are unnaturally consistent
  const devices = history.map(h => h.deviceFingerprint).filter(d => d && d.userAgent)
  if (devices.length < 2) return 0
  
  // Check if all sessions have identical device characteristics
  const firstDevice = devices[0]
  const allIdentical = devices.every(device => 
    device.userAgent === firstDevice.userAgent &&
    JSON.stringify(device.screen) === JSON.stringify(firstDevice.screen)
  )
  
  return allIdentical ? 1 : 0
}

function analyzeLearningPattern(history: BehavioralMetrics[]): boolean {
  // Humans typically get faster/more efficient over time
  if (history.length < 3) return true // Not enough data
  
  const sessionAverages = history.map(session => {
    const times = session.responseTime || []
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0
  }).filter(avg => avg > 0)
  
  if (sessionAverages.length < 3) return true
  
  // Check if there's any trend (improvement/change over time)
  const firstThird = sessionAverages.slice(0, Math.floor(sessionAverages.length / 3))
  const lastThird = sessionAverages.slice(-Math.floor(sessionAverages.length / 3))
  
  const firstAvg = firstThird.reduce((a, b) => a + b, 0) / firstThird.length
  const lastAvg = lastThird.reduce((a, b) => a + b, 0) / lastThird.length
  
  // Allow for both improvement (faster) or degradation (tired), but not identical
  const changePercent = Math.abs(firstAvg - lastAvg) / firstAvg
  
  return changePercent > 0.1 // At least 10% change indicates learning/adaptation
}