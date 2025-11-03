/**
 * Fraud Ring Detection Service
 *
 * Detects coordinated cheating, answer key sharing, and organized fraud rings
 * by analyzing patterns across multiple survey submissions
 */

import type { BehavioralMetrics, DeviceFingerprint } from '@/features/survey/types'
import { calculateFingerprintSimilarity } from './device-fingerprint'

export interface FraudRingAnalysis {
  isFraudRing: boolean
  confidence: number // 0-1
  ringSize: number // estimated number of colluding respondents
  patterns: FraudRingPattern[]
  evidence: {
    identicalAnswers: number
    similarBehavior: number
    coordinatedTiming: number
    sharedDevices: number
    sharedIPs: number
  }
  suspiciousGroups: SuspiciousGroup[]
}

export interface FraudRingPattern {
  type: 'answer-sharing' | 'coordinated-timing' | 'device-sharing' | 'ip-sharing' | 'behavioral-similarity'
  severity: 'low' | 'medium' | 'high'
  description: string
  affectedResponses: string[] // response IDs
  confidence: number
}

export interface SuspiciousGroup {
  responseIds: string[]
  similarityScore: number // 0-1
  sharedAttributes: string[]
  riskLevel: 'low' | 'medium' | 'high'
}

/**
 * Detect fraud rings across survey submissions
 */
export async function detectFraudRing(
  supabase: any,
  surveyId: string,
  options?: {
    minGroupSize?: number
    similarityThreshold?: number
    timeWindowHours?: number
  }
): Promise<FraudRingAnalysis> {
  const minGroupSize = options?.minGroupSize || 3
  const similarityThreshold = options?.similarityThreshold || 0.7
  const timeWindowHours = options?.timeWindowHours || 24

  try {
    // Fetch recent responses for this survey
    const windowStart = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000).toISOString()

    const { data: responses, error } = await supabase
      .from('survey_responses')
      .select('id, responses, device_data, ip_address, created_at, timing_data, mouse_data, keystroke_data')
      .eq('survey_id', surveyId)
      .gte('created_at', windowStart)
      .order('created_at', { ascending: false })

    if (error || !responses || responses.length < minGroupSize) {
      return {
        isFraudRing: false,
        confidence: 0,
        ringSize: 0,
        patterns: [],
        evidence: {
          identicalAnswers: 0,
          similarBehavior: 0,
          coordinatedTiming: 0,
          sharedDevices: 0,
          sharedIPs: 0,
        },
        suspiciousGroups: [],
      }
    }

    const patterns: FraudRingPattern[] = []
    const evidence = {
      identicalAnswers: 0,
      similarBehavior: 0,
      coordinatedTiming: 0,
      sharedDevices: 0,
      sharedIPs: 0,
    }

    // 1. Detect Answer Sharing
    const answerGroups = detectAnswerSharing(responses, similarityThreshold)
    if (answerGroups.length > 0) {
      answerGroups.forEach(group => {
        patterns.push({
          type: 'answer-sharing',
          severity: group.similarityScore > 0.9 ? 'high' : 'medium',
          description: `${group.responseIds.length} responses with ${Math.round(group.similarityScore * 100)}% identical answers`,
          affectedResponses: group.responseIds,
          confidence: group.similarityScore,
        })
        evidence.identicalAnswers += group.responseIds.length
      })
    }

    // 2. Detect Coordinated Timing
    const timingGroups = detectCoordinatedTiming(responses)
    if (timingGroups.length > 0) {
      timingGroups.forEach(group => {
        patterns.push({
          type: 'coordinated-timing',
          severity: 'medium',
          description: `${group.responseIds.length} responses submitted within ${group.timeSpanMinutes} minutes`,
          affectedResponses: group.responseIds,
          confidence: 0.7,
        })
        evidence.coordinatedTiming += group.responseIds.length
      })
    }

    // 3. Detect Device Sharing
    const deviceGroups = detectDeviceSharing(responses, similarityThreshold)
    if (deviceGroups.length > 0) {
      deviceGroups.forEach(group => {
        patterns.push({
          type: 'device-sharing',
          severity: 'high',
          description: `${group.responseIds.length} responses from ${group.sharedAttribute}`,
          affectedResponses: group.responseIds,
          confidence: 0.85,
        })
        evidence.sharedDevices += group.responseIds.length
      })
    }

    // 4. Detect IP Sharing
    const ipGroups = detectIPSharing(responses)
    if (ipGroups.length > 0) {
      ipGroups.forEach(group => {
        patterns.push({
          type: 'ip-sharing',
          severity: group.count > 10 ? 'high' : 'medium',
          description: `${group.count} responses from IP ${maskIP(group.ip)}`,
          affectedResponses: group.responseIds,
          confidence: 0.6,
        })
        evidence.sharedIPs += group.count
      })
    }

    // 5. Detect Behavioral Similarity
    const behaviorGroups = detectBehavioralSimilarity(responses, similarityThreshold)
    if (behaviorGroups.length > 0) {
      behaviorGroups.forEach(group => {
        patterns.push({
          type: 'behavioral-similarity',
          severity: 'medium',
          description: `${group.responseIds.length} responses with ${Math.round(group.similarityScore * 100)}% similar behavior patterns`,
          affectedResponses: group.responseIds,
          confidence: group.similarityScore,
        })
        evidence.similarBehavior += group.responseIds.length
      })
    }

    // Identify suspicious groups
    const suspiciousGroups = identifySuspiciousGroups(
      responses,
      answerGroups,
      deviceGroups,
      ipGroups,
      behaviorGroups
    )

    // Calculate overall metrics
    const totalIndicators = Object.values(evidence).reduce((sum, val) => sum + val, 0)
    const isFraudRing = suspiciousGroups.some(g => g.riskLevel === 'high') || patterns.length >= 3
    const ringSize = Math.max(...suspiciousGroups.map(g => g.responseIds.length), 0)
    const confidence = Math.min(
      (patterns.length / 5) * 0.5 + (totalIndicators / responses.length) * 0.5,
      1
    )

    return {
      isFraudRing,
      confidence,
      ringSize,
      patterns,
      evidence,
      suspiciousGroups,
    }
  } catch (error) {
    console.error('Fraud ring detection error:', error)
    return {
      isFraudRing: false,
      confidence: 0,
      ringSize: 0,
      patterns: [],
      evidence: {
        identicalAnswers: 0,
        similarBehavior: 0,
        coordinatedTiming: 0,
        sharedDevices: 0,
        sharedIPs: 0,
      },
      suspiciousGroups: [],
    }
  }
}

/**
 * Detect answer sharing (identical or highly similar answers)
 */
function detectAnswerSharing(
  responses: any[],
  threshold: number
): Array<{ responseIds: string[]; similarityScore: number }> {
  const groups: Array<{ responseIds: string[]; similarityScore: number }> = []
  const processed = new Set<string>()

  for (let i = 0; i < responses.length; i++) {
    if (processed.has(responses[i].id)) continue

    const group: string[] = [responses[i].id]
    const r1 = responses[i].responses || {}

    for (let j = i + 1; j < responses.length; j++) {
      if (processed.has(responses[j].id)) continue

      const r2 = responses[j].responses || {}
      const similarity = calculateAnswerSimilarity(r1, r2)

      if (similarity >= threshold) {
        group.push(responses[j].id)
        processed.add(responses[j].id)
      }
    }

    if (group.length >= 3) {
      // At least 3 similar responses = suspicious
      groups.push({
        responseIds: group,
        similarityScore: threshold,
      })
      processed.add(responses[i].id)
    }
  }

  return groups
}

/**
 * Calculate similarity between two response sets
 */
function calculateAnswerSimilarity(r1: Record<string, any>, r2: Record<string, any>): number {
  const keys = new Set([...Object.keys(r1), ...Object.keys(r2)])
  if (keys.size === 0) return 0

  let matches = 0
  keys.forEach(key => {
    const v1 = r1[key]
    const v2 = r2[key]

    if (v1 === v2) {
      matches++
    } else if (typeof v1 === 'string' && typeof v2 === 'string') {
      // Check text similarity
      const sim = calculateTextSimilarity(v1, v2)
      if (sim > 0.8) matches++
    }
  })

  return matches / keys.size
}

/**
 * Calculate text similarity (simplified)
 */
function calculateTextSimilarity(t1: string, t2: string): number {
  const words1 = new Set(t1.toLowerCase().split(/\s+/))
  const words2 = new Set(t2.toLowerCase().split(/\s+/))

  const intersection = new Set([...words1].filter(w => words2.has(w)))
  const union = new Set([...words1, ...words2])

  return intersection.size / union.size
}

/**
 * Detect coordinated timing (submissions close together)
 */
function detectCoordinatedTiming(
  responses: any[]
): Array<{ responseIds: string[]; timeSpanMinutes: number }> {
  const groups: Array<{ responseIds: string[]; timeSpanMinutes: number }> = []

  // Group by submission time windows (5-minute buckets)
  const timeBuckets = new Map<number, string[]>()

  responses.forEach(r => {
    const timestamp = new Date(r.created_at).getTime()
    const bucket = Math.floor(timestamp / (5 * 60 * 1000)) // 5-minute buckets

    if (!timeBuckets.has(bucket)) {
      timeBuckets.set(bucket, [])
    }
    timeBuckets.get(bucket)!.push(r.id)
  })

  // Find buckets with suspicious activity
  timeBuckets.forEach((ids, bucket) => {
    if (ids.length >= 5) {
      // 5+ submissions in 5 minutes = suspicious
      groups.push({
        responseIds: ids,
        timeSpanMinutes: 5,
      })
    }
  })

  return groups
}

/**
 * Detect device sharing (multiple submissions from same device)
 */
function detectDeviceSharing(
  responses: any[],
  threshold: number
): Array<{ responseIds: string[]; sharedAttribute: string }> {
  const groups: Array<{ responseIds: string[]; sharedAttribute: string }> = []

  // Group by device fingerprint similarity
  const deviceGroups = new Map<string, string[]>()

  responses.forEach((r, i) => {
    if (!r.device_data) return

    let foundGroup = false

    // Check against existing groups
    deviceGroups.forEach((ids, key) => {
      const existingIndex = responses.findIndex(resp => resp.id === ids[0])
      if (existingIndex >= 0 && responses[existingIndex].device_data) {
        const similarity = calculateFingerprintSimilarity(
          r.device_data,
          responses[existingIndex].device_data
        )

        if (similarity >= threshold) {
          ids.push(r.id)
          foundGroup = true
        }
      }
    })

    if (!foundGroup) {
      deviceGroups.set(r.id, [r.id])
    }
  })

  deviceGroups.forEach((ids, key) => {
    if (ids.length >= 3) {
      groups.push({
        responseIds: ids,
        sharedAttribute: 'identical device fingerprint',
      })
    }
  })

  return groups
}

/**
 * Detect IP sharing (multiple submissions from same IP)
 */
function detectIPSharing(
  responses: any[]
): Array<{ ip: string; count: number; responseIds: string[] }> {
  const groups: Array<{ ip: string; count: number; responseIds: string[] }> = []
  const ipMap = new Map<string, string[]>()

  responses.forEach(r => {
    if (!r.ip_address) return

    if (!ipMap.has(r.ip_address)) {
      ipMap.set(r.ip_address, [])
    }
    ipMap.get(r.ip_address)!.push(r.id)
  })

  ipMap.forEach((ids, ip) => {
    if (ids.length >= 5) {
      // 5+ from same IP = suspicious
      groups.push({ ip, count: ids.length, responseIds: ids })
    }
  })

  return groups
}

/**
 * Detect behavioral similarity
 */
function detectBehavioralSimilarity(
  responses: any[],
  threshold: number
): Array<{ responseIds: string[]; similarityScore: number }> {
  const groups: Array<{ responseIds: string[]; similarityScore: number }> = []
  const processed = new Set<string>()

  for (let i = 0; i < responses.length; i++) {
    if (processed.has(responses[i].id)) continue
    if (!responses[i].timing_data && !responses[i].mouse_data) continue

    const group: string[] = [responses[i].id]

    for (let j = i + 1; j < responses.length; j++) {
      if (processed.has(responses[j].id)) continue
      if (!responses[j].timing_data && !responses[j].mouse_data) continue

      const similarity = calculateBehavioralSimilarity(responses[i], responses[j])

      if (similarity >= threshold) {
        group.push(responses[j].id)
        processed.add(responses[j].id)
      }
    }

    if (group.length >= 3) {
      groups.push({
        responseIds: group,
        similarityScore: threshold,
      })
      processed.add(responses[i].id)
    }
  }

  return groups
}

/**
 * Calculate behavioral similarity between two responses
 */
function calculateBehavioralSimilarity(r1: any, r2: any): number {
  let totalSimilarity = 0
  let metrics = 0

  // Compare timing patterns
  if (r1.timing_data && r2.timing_data) {
    const times1 = r1.timing_data
    const times2 = r2.timing_data

    if (Array.isArray(times1) && Array.isArray(times2) && times1.length > 0 && times2.length > 0) {
      const avg1 = times1.reduce((a: number, b: number) => a + b, 0) / times1.length
      const avg2 = times2.reduce((a: number, b: number) => a + b, 0) / times2.length

      const timingSimilarity = 1 - Math.abs(avg1 - avg2) / Math.max(avg1, avg2, 1)
      totalSimilarity += timingSimilarity
      metrics++
    }
  }

  // Compare mouse activity levels
  if (r1.mouse_data && r2.mouse_data) {
    const mouseCount1 = Array.isArray(r1.mouse_data) ? r1.mouse_data.length : 0
    const mouseCount2 = Array.isArray(r2.mouse_data) ? r2.mouse_data.length : 0

    if (mouseCount1 > 0 && mouseCount2 > 0) {
      const mouseSimilarity = 1 - Math.abs(mouseCount1 - mouseCount2) / Math.max(mouseCount1, mouseCount2)
      totalSimilarity += mouseSimilarity
      metrics++
    }
  }

  return metrics > 0 ? totalSimilarity / metrics : 0
}

/**
 * Identify suspicious groups by combining evidence
 */
function identifySuspiciousGroups(
  responses: any[],
  answerGroups: any[],
  deviceGroups: any[],
  ipGroups: any[],
  behaviorGroups: any[]
): SuspiciousGroup[] {
  const groups: SuspiciousGroup[] = []

  // Find overlapping groups
  const allGroups = [
    ...answerGroups.map(g => ({ ...g, type: 'answers' })),
    ...deviceGroups.map(g => ({ responseIds: g.responseIds, type: 'device' })),
    ...ipGroups.map(g => ({ responseIds: g.responseIds, type: 'ip' })),
    ...behaviorGroups.map(g => ({ ...g, type: 'behavior' })),
  ]

  // Merge overlapping groups
  allGroups.forEach(group => {
    const sharedAttributes: string[] = []
    let similarityScore = 0.5

    if ('similarityScore' in group) {
      similarityScore = group.similarityScore
    }

    sharedAttributes.push(group.type)

    // Check for overlaps with other groups
    allGroups.forEach(otherGroup => {
      if (group === otherGroup) return

      const overlap = group.responseIds.filter(id => otherGroup.responseIds.includes(id))
      if (overlap.length > 0) {
        sharedAttributes.push(otherGroup.type)
        similarityScore = Math.max(similarityScore, 'similarityScore' in otherGroup ? otherGroup.similarityScore : 0.5)
      }
    })

    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (sharedAttributes.length >= 3) riskLevel = 'high'
    else if (sharedAttributes.length >= 2) riskLevel = 'medium'

    groups.push({
      responseIds: group.responseIds,
      similarityScore,
      sharedAttributes: [...new Set(sharedAttributes)],
      riskLevel,
    })
  })

  return groups
}

/**
 * Mask IP address for privacy
 */
function maskIP(ip: string): string {
  const parts = ip.split('.')
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`
  }
  return ip.substring(0, 8) + '...'
}
