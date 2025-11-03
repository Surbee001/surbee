import type { DeviceFingerprint } from '@/features/survey/types'

/**
 * Device Fingerprint Analysis Service
 *
 * Generates consistent hashes from device fingerprints and compares them
 * to detect multiple submissions from the same device
 */

/**
 * Generate a hash from a device fingerprint
 */
export function hashDeviceFingerprint(fingerprint: DeviceFingerprint): string {
  // Concatenate all fingerprint properties
  const components = [
    fingerprint.userAgent || '',
    fingerprint.platform || '',
    fingerprint.language || '',
    fingerprint.timezone || '',
    fingerprint.screen?.w || '',
    fingerprint.screen?.h || '',
    fingerprint.screen?.dpr || '',
    fingerprint.screen?.depth || '',
    fingerprint.hardware?.cores || '',
    fingerprint.hardware?.memory || '',
    fingerprint.canvasFingerprint || '',
    fingerprint.webglFingerprint || '',
    (fingerprint.fonts || []).sort().join(','),
  ].join('|')

  return simpleHash(components)
}

/**
 * Calculate similarity score between two device fingerprints
 * Returns 0-1, where 1 is identical
 */
export function calculateFingerprintSimilarity(
  fp1: DeviceFingerprint,
  fp2: DeviceFingerprint
): number {
  let totalWeight = 0
  let matchWeight = 0

  // User Agent (weight: 20)
  if (fp1.userAgent && fp2.userAgent) {
    totalWeight += 20
    if (fp1.userAgent === fp2.userAgent) {
      matchWeight += 20
    }
  }

  // Platform (weight: 10)
  if (fp1.platform && fp2.platform) {
    totalWeight += 10
    if (fp1.platform === fp2.platform) {
      matchWeight += 10
    }
  }

  // Language (weight: 5)
  if (fp1.language && fp2.language) {
    totalWeight += 5
    if (fp1.language === fp2.language) {
      matchWeight += 5
    }
  }

  // Timezone (weight: 10)
  if (fp1.timezone && fp2.timezone) {
    totalWeight += 10
    if (fp1.timezone === fp2.timezone) {
      matchWeight += 10
    }
  }

  // Screen dimensions (weight: 15)
  if (fp1.screen && fp2.screen) {
    totalWeight += 15
    if (fp1.screen.w === fp2.screen.w && fp1.screen.h === fp2.screen.h) {
      matchWeight += 15
    }
  }

  // Hardware (weight: 10)
  if (fp1.hardware && fp2.hardware) {
    totalWeight += 10
    if (
      fp1.hardware.cores === fp2.hardware.cores &&
      fp1.hardware.memory === fp2.hardware.memory
    ) {
      matchWeight += 10
    }
  }

  // Canvas fingerprint (weight: 15)
  if (fp1.canvasFingerprint && fp2.canvasFingerprint) {
    totalWeight += 15
    if (fp1.canvasFingerprint === fp2.canvasFingerprint) {
      matchWeight += 15
    }
  }

  // WebGL fingerprint (weight: 15)
  if (fp1.webglFingerprint && fp2.webglFingerprint) {
    totalWeight += 15
    if (fp1.webglFingerprint === fp2.webglFingerprint) {
      matchWeight += 15
    }
  }

  if (totalWeight === 0) return 0

  return matchWeight / totalWeight
}

/**
 * Check if device fingerprint indicates automation/bot
 */
export function detectAutomationFromFingerprint(
  fingerprint: DeviceFingerprint
): {
  isAutomation: boolean
  confidence: number
  reasons: string[]
} {
  const reasons: string[] = []
  let suspicionScore = 0

  // Check WebDriver flag
  if (fingerprint.webDriver === true) {
    reasons.push('WebDriver detected')
    suspicionScore += 0.4
  }

  // Check automation flag
  if (fingerprint.automation === true) {
    reasons.push('Automation detected')
    suspicionScore += 0.4
  }

  // Check for suspicious user agent
  const ua = fingerprint.userAgent?.toLowerCase() || ''
  const suspiciousUAPatterns = [
    'headless',
    'phantom',
    'selenium',
    'webdriver',
    'bot',
    'crawler',
    'spider',
  ]

  for (const pattern of suspiciousUAPatterns) {
    if (ua.includes(pattern)) {
      reasons.push(`Suspicious user agent: contains "${pattern}"`)
      suspicionScore += 0.3
      break
    }
  }

  // Check for missing plugins (real browsers usually have some)
  if (fingerprint.plugins && fingerprint.plugins.length === 0) {
    reasons.push('No browser plugins detected')
    suspicionScore += 0.2
  }

  // Check for impossible screen dimensions
  if (fingerprint.screen) {
    const { w, h } = fingerprint.screen
    if (w && h && (w < 100 || h < 100 || w > 10000 || h > 10000)) {
      reasons.push(`Impossible screen dimensions: ${w}x${h}`)
      suspicionScore += 0.3
    }
  }

  // Check for missing canvas/webgl fingerprints (bots often don't have these)
  if (!fingerprint.canvasFingerprint && !fingerprint.webglFingerprint) {
    reasons.push('Missing canvas and WebGL fingerprints')
    suspicionScore += 0.2
  }

  // Check for touch support inconsistencies
  if (fingerprint.platform?.toLowerCase().includes('mobile')) {
    if (fingerprint.touchSupport === false || fingerprint.maxTouchPoints === 0) {
      reasons.push('Mobile platform but no touch support')
      suspicionScore += 0.15
    }
  }

  suspicionScore = Math.min(1, suspicionScore)

  return {
    isAutomation: suspicionScore >= 0.5,
    confidence: suspicionScore,
    reasons,
  }
}

/**
 * Find similar device fingerprints in database
 */
export async function findSimilarFingerprints(
  fingerprint: DeviceFingerprint,
  supabase: any,
  surveyId: string,
  similarityThreshold: number = 0.8
): Promise<{
  count: number
  similarResponses: Array<{
    id: string
    similarity: number
    createdAt: string
  }>
}> {
  try {
    // Get all responses for this survey with device fingerprints
    const { data, error } = await supabase
      .from('survey_responses')
      .select('id, device_data, created_at')
      .eq('survey_id', surveyId)
      .not('device_data', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1000) // Limit to recent responses for performance

    if (error) {
      console.error('Error fetching fingerprints:', error)
      return { count: 0, similarResponses: [] }
    }

    const similarResponses: Array<{
      id: string
      similarity: number
      createdAt: string
    }> = []

    // Compare with each fingerprint
    for (const response of data || []) {
      try {
        const otherFingerprint = response.device_data as DeviceFingerprint
        const similarity = calculateFingerprintSimilarity(fingerprint, otherFingerprint)

        if (similarity >= similarityThreshold) {
          similarResponses.push({
            id: response.id,
            similarity,
            createdAt: response.created_at,
          })
        }
      } catch (e) {
        // Skip invalid fingerprints
        continue
      }
    }

    return {
      count: similarResponses.length,
      similarResponses: similarResponses.sort((a, b) => b.similarity - a.similarity),
    }
  } catch (error) {
    console.error('Error in findSimilarFingerprints:', error)
    return { count: 0, similarResponses: [] }
  }
}

/**
 * Validate device fingerprint consistency
 */
export function validateFingerprintConsistency(
  fingerprint: DeviceFingerprint
): {
  isConsistent: boolean
  issues: string[]
  riskScore: number
} {
  const issues: string[] = []
  let riskScore = 0

  // Check platform consistency with user agent
  if (fingerprint.platform && fingerprint.userAgent) {
    const platform = fingerprint.platform.toLowerCase()
    const ua = fingerprint.userAgent.toLowerCase()

    // Mac platform should have Mac user agent
    if (platform.includes('mac') && !ua.includes('mac')) {
      issues.push('Platform/User-Agent mismatch: Mac platform but no Mac in UA')
      riskScore += 0.3
    }

    // Windows platform should have Windows user agent
    if (platform.includes('win') && !ua.includes('win')) {
      issues.push('Platform/User-Agent mismatch: Windows platform but no Windows in UA')
      riskScore += 0.3
    }

    // Linux platform should have Linux user agent
    if (platform.includes('linux') && !ua.includes('linux')) {
      issues.push('Platform/User-Agent mismatch: Linux platform but no Linux in UA')
      riskScore += 0.3
    }
  }

  // Check screen dimensions
  if (fingerprint.screen) {
    const { w, h, dpr } = fingerprint.screen

    // Check for common resolutions
    if (w && h) {
      // Impossible dimensions
      if (w < 100 || h < 100) {
        issues.push(`Unrealistic screen size: ${w}x${h}`)
        riskScore += 0.4
      }

      // Very unusual aspect ratio
      const aspectRatio = w / h
      if (aspectRatio < 0.5 || aspectRatio > 4) {
        issues.push(`Unusual aspect ratio: ${aspectRatio.toFixed(2)}`)
        riskScore += 0.2
      }
    }

    // Check DPR
    if (dpr && (dpr < 0.5 || dpr > 5)) {
      issues.push(`Unusual device pixel ratio: ${dpr}`)
      riskScore += 0.2
    }
  }

  // Check hardware consistency
  if (fingerprint.hardware) {
    const { cores, memory } = fingerprint.hardware

    // Unusual CPU core count
    if (cores && (cores < 1 || cores > 128)) {
      issues.push(`Unusual CPU core count: ${cores}`)
      riskScore += 0.2
    }

    // Unusual memory amount
    if (memory && (memory < 1 || memory > 512)) {
      issues.push(`Unusual memory amount: ${memory}GB`)
      riskScore += 0.2
    }
  }

  riskScore = Math.min(1, riskScore)

  return {
    isConsistent: issues.length === 0,
    issues,
    riskScore,
  }
}

/**
 * Simple string hashing function
 */
function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}
