import type { BehavioralMetrics, SuspiciousFlag } from '../types'
import { detectAdvancedFraudPatterns } from './enhanced-scoring'

export function computeSuspicionScore(m: BehavioralMetrics): { score: number; flags: SuspiciousFlag[] } {
  const flags: SuspiciousFlag[] = []
  let score = 0

  // rapid completion: low total time with many questions
  const totalMs = m.responseTime.reduce((a, b) => a + b, 0)
  if (totalMs > 0 && m.responseTime.length >= 10 && totalMs < 60_000) {
    flags.push({ code: 'rapid_completion', message: 'Completed too quickly', weight: 0.35 })
    score += 0.35
  }

  // uniform response time (low variance) suggests bot-like behaviour
  if (m.responseTime.length > 3) {
    const avg = totalMs / m.responseTime.length
    const variance = m.responseTime.reduce((s, t) => s + Math.pow(t - avg, 2), 0) / m.responseTime.length
    if (variance < 1000) {
      flags.push({ code: 'uniform_timing', message: 'Uniform response timing', weight: 0.15 })
      score += 0.15
    }
  }

  // low interaction: almost no mouse movement and no keypresses
  if ((m.mouseMovements?.length || 0) < 10 && (m.keypressCount || 0) < 2) {
    flags.push({ code: 'low_interaction', message: 'Low interaction footprint', weight: 0.2 })
    score += 0.2
  }

  // excessive paste events
  if ((m.pasteEvents || 0) > 3) {
    flags.push({ code: 'excessive_paste', message: 'Multiple paste operations', weight: 0.2 })
    score += 0.2
  }

  // high pointer velocity spikes
  if ((m.pointerVelocityAvg || 0) > 1.5) {
    flags.push({ code: 'pointer_spikes', message: 'High pointer velocity', weight: 0.1 })
    score += 0.1
  }

  // long inactivity gaps
  if (m.lastInputAt && Date.now() - m.lastInputAt > 90_000) {
    flags.push({ code: 'inactivity', message: 'Long inactivity gap', weight: 0.1 })
    score += 0.1
  }

  // incorporate server-reported flags
  for (const f of m.suspiciousFlags || []) {
    score += f.weight
  }

  // Enhanced AI-powered fraud detection patterns
  const enhancedDetection = detectAdvancedFraudPatterns(m)
  score += enhancedDetection.additionalScore
  flags.push(...enhancedDetection.newFlags)

  return { score: clamp(score, 0, 1), flags }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}