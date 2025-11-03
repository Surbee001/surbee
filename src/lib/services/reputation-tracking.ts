/**
 * Reputation Tracking Service
 *
 * Tracks IP addresses and device fingerprints across time to build reputation scores
 * Identifies repeat offenders and trustworthy respondents
 */

export interface ReputationProfile {
  identifier: string // IP or device hash
  type: 'ip' | 'device'

  // Submission history
  totalSubmissions: number
  flaggedSubmissions: number
  legitimateSubmissions: number

  // Scores
  reputationScore: number // 0-1 (higher = more trustworthy)
  riskScore: number // 0-1 (higher = more risky)

  // Patterns
  averageFraudScore: number
  submissionVelocity: number // submissions per hour
  surveyDiversity: number // how many different surveys

  // Timing
  firstSeen: string
  lastSeen: string
  daysSinceFirstSeen: number

  // Evidence
  violations: string[]
  positiveSignals: string[]
}

export interface ReputationUpdate {
  identifier: string
  type: 'ip' | 'device'
  fraudScore: number
  isFlagged: boolean
  timestamp: string
}

/**
 * Get reputation for an IP address or device
 */
export async function getReputation(
  supabase: any,
  identifier: string,
  type: 'ip' | 'device'
): Promise<ReputationProfile> {
  try {
    const column = type === 'ip' ? 'ip_address' : 'device_data'

    // Fetch all submissions from this identifier
    const { data: responses, error } = await supabase
      .from('survey_responses')
      .select('id, survey_id, fraud_score, is_flagged, created_at, flag_reasons')
      .eq(column, identifier)
      .order('created_at', { ascending: true })
      .limit(1000) // Limit for performance

    if (error || !responses || responses.length === 0) {
      return getDefaultReputation(identifier, type)
    }

    // Calculate metrics
    const totalSubmissions = responses.length
    const flaggedSubmissions = responses.filter(r => r.is_flagged).length
    const legitimateSubmissions = totalSubmissions - flaggedSubmissions

    const fraudScores = responses.map(r => r.fraud_score || 0).filter(s => s > 0)
    const averageFraudScore = fraudScores.length > 0
      ? fraudScores.reduce((sum, score) => sum + score, 0) / fraudScores.length
      : 0

    // Calculate reputation score (inverse of fraud rate)
    const fraudRate = flaggedSubmissions / totalSubmissions
    const reputationScore = Math.max(0, 1 - fraudRate - averageFraudScore * 0.3)

    // Calculate risk score
    const riskScore = Math.min(1, fraudRate + averageFraudScore * 0.5)

    // Calculate submission velocity
    const firstSeen = new Date(responses[0].created_at)
    const lastSeen = new Date(responses[responses.length - 1].created_at)
    const hoursDiff = (lastSeen.getTime() - firstSeen.getTime()) / (1000 * 60 * 60)
    const submissionVelocity = hoursDiff > 0 ? totalSubmissions / hoursDiff : 0

    // Calculate survey diversity
    const uniqueSurveys = new Set(responses.map(r => r.survey_id))
    const surveyDiversity = uniqueSurveys.size / totalSubmissions

    // Collect violations
    const violations: string[] = []
    const allReasons = responses.flatMap(r => r.flag_reasons || [])
    const reasonCounts = new Map<string, number>()

    allReasons.forEach(reason => {
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1)
    })

    reasonCounts.forEach((count, reason) => {
      if (count >= 2) { // Repeated violations
        violations.push(`${reason} (${count}x)`)
      }
    })

    // Identify positive signals
    const positiveSignals: string[] = []
    if (reputationScore > 0.8) positiveSignals.push('High reputation score')
    if (flaggedSubmissions === 0) positiveSignals.push('No flagged submissions')
    if (submissionVelocity < 1) positiveSignals.push('Normal submission rate')
    if (surveyDiversity > 0.5) positiveSignals.push('Diverse survey participation')

    const daysSinceFirstSeen = (Date.now() - firstSeen.getTime()) / (1000 * 60 * 60 * 24)

    return {
      identifier,
      type,
      totalSubmissions,
      flaggedSubmissions,
      legitimateSubmissions,
      reputationScore,
      riskScore,
      averageFraudScore,
      submissionVelocity,
      surveyDiversity,
      firstSeen: firstSeen.toISOString(),
      lastSeen: lastSeen.toISOString(),
      daysSinceFirstSeen,
      violations,
      positiveSignals,
    }
  } catch (error) {
    console.error('Reputation lookup error:', error)
    return getDefaultReputation(identifier, type)
  }
}

/**
 * Update reputation after new submission
 */
export async function updateReputation(
  supabase: any,
  update: ReputationUpdate
): Promise<void> {
  try {
    // Store in reputation_tracking table (if it exists)
    // For now, just log the update
    console.log('Reputation update:', update)

    // In a full implementation, you would:
    // 1. Store in a dedicated reputation_tracking table
    // 2. Update cached reputation scores
    // 3. Trigger alerts for high-risk patterns
  } catch (error) {
    console.error('Reputation update error:', error)
  }
}

/**
 * Check if identifier is on blocklist
 */
export async function isBlocklisted(
  supabase: any,
  identifier: string,
  type: 'ip' | 'device'
): Promise<{ isBlocked: boolean; reason?: string; since?: string }> {
  try {
    // Check reputation
    const reputation = await getReputation(supabase, identifier, type)

    // Auto-blocklist criteria
    if (reputation.riskScore > 0.9) {
      return {
        isBlocked: true,
        reason: 'High risk score',
        since: reputation.lastSeen,
      }
    }

    if (reputation.flaggedSubmissions > 10) {
      return {
        isBlocked: true,
        reason: 'Too many flagged submissions',
        since: reputation.firstSeen,
      }
    }

    if (reputation.submissionVelocity > 100) {
      return {
        isBlocked: true,
        reason: 'Excessive submission rate',
        since: reputation.lastSeen,
      }
    }

    return { isBlocked: false }
  } catch (error) {
    console.error('Blocklist check error:', error)
    return { isBlocked: false }
  }
}

/**
 * Get reputation tier
 */
export function getReputationTier(score: number): {
  tier: 'trusted' | 'good' | 'neutral' | 'suspicious' | 'blocked'
  color: string
  description: string
} {
  if (score >= 0.9) {
    return {
      tier: 'trusted',
      color: 'green',
      description: 'Highly trustworthy - consistent legitimate submissions',
    }
  } else if (score >= 0.7) {
    return {
      tier: 'good',
      color: 'blue',
      description: 'Good reputation - mostly legitimate submissions',
    }
  } else if (score >= 0.4) {
    return {
      tier: 'neutral',
      color: 'gray',
      description: 'Neutral - insufficient data or mixed history',
    }
  } else if (score >= 0.2) {
    return {
      tier: 'suspicious',
      color: 'orange',
      description: 'Suspicious - multiple fraud indicators',
    }
  } else {
    return {
      tier: 'blocked',
      color: 'red',
      description: 'High risk - should be blocked',
    }
  }
}

/**
 * Default reputation for new identifiers
 */
function getDefaultReputation(identifier: string, type: 'ip' | 'device'): ReputationProfile {
  return {
    identifier,
    type,
    totalSubmissions: 0,
    flaggedSubmissions: 0,
    legitimateSubmissions: 0,
    reputationScore: 0.5, // Neutral for new identifiers
    riskScore: 0.5,
    averageFraudScore: 0,
    submissionVelocity: 0,
    surveyDiversity: 0,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    daysSinceFirstSeen: 0,
    violations: [],
    positiveSignals: ['New identifier'],
  }
}

/**
 * Analyze reputation trends over time
 */
export async function analyzeReputationTrends(
  supabase: any,
  identifier: string,
  type: 'ip' | 'device',
  days: number = 30
): Promise<{
  trend: 'improving' | 'declining' | 'stable'
  recentFraudRate: number
  historicalFraudRate: number
  changePercent: number
}> {
  try {
    const column = type === 'ip' ? 'ip_address' : 'device_data'
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // Get recent submissions
    const { data: recent } = await supabase
      .from('survey_responses')
      .select('is_flagged, fraud_score')
      .eq(column, identifier)
      .gte('created_at', cutoffDate)

    // Get historical submissions (before cutoff)
    const { data: historical } = await supabase
      .from('survey_responses')
      .select('is_flagged, fraud_score')
      .eq(column, identifier)
      .lt('created_at', cutoffDate)

    if (!recent || recent.length === 0) {
      return {
        trend: 'stable',
        recentFraudRate: 0,
        historicalFraudRate: 0,
        changePercent: 0,
      }
    }

    const recentFraudRate = recent.filter(r => r.is_flagged).length / recent.length
    const historicalFraudRate = historical && historical.length > 0
      ? historical.filter(r => r.is_flagged).length / historical.length
      : 0

    const changePercent = historicalFraudRate > 0
      ? ((recentFraudRate - historicalFraudRate) / historicalFraudRate) * 100
      : 0

    let trend: 'improving' | 'declining' | 'stable' = 'stable'
    if (changePercent < -20) trend = 'improving'
    else if (changePercent > 20) trend = 'declining'

    return {
      trend,
      recentFraudRate,
      historicalFraudRate,
      changePercent,
    }
  } catch (error) {
    console.error('Trend analysis error:', error)
    return {
      trend: 'stable',
      recentFraudRate: 0,
      historicalFraudRate: 0,
      changePercent: 0,
    }
  }
}

/**
 * Get top offenders (for admin dashboard)
 */
export async function getTopOffenders(
  supabase: any,
  limit: number = 10
): Promise<Array<{
  identifier: string
  type: 'ip' | 'device'
  violations: number
  lastSeen: string
}>> {
  try {
    // This would require a dedicated reputation table in production
    // For now, return empty array
    return []
  } catch (error) {
    console.error('Top offenders query error:', error)
    return []
  }
}
