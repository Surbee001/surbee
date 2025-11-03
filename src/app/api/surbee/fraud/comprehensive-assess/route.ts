/**
 * Comprehensive Fraud Assessment API
 *
 * Integrates all fraud detection systems:
 * - Behavioral analysis (Phase 1 & 2)
 * - AI text detection (Phase 3)
 * - Semantic analysis (Phase 3)
 * - Plagiarism detection (Phase 3)
 * - IP reputation (Phase 1)
 * - Device fingerprinting (Phase 1)
 */

import { NextRequest, NextResponse } from 'next/server'
import { analyzeTextResponses } from '@/lib/services/ai-text-detection'
import { detectContradictions, analyzeResponseQuality, detectQualityTimeMismatch } from '@/lib/services/semantic-analysis'
import { checkPlagiarism, quickPlagiarismCheck, detectTemplateResponses } from '@/lib/services/plagiarism-detection'
import { getIPReputation, validateTimezone, getClientIP } from '@/lib/services/ip-reputation'
import {
  detectAutomationFromFingerprint,
  validateFingerprintConsistency,
} from '@/lib/services/device-fingerprint'
import type { BehavioralMetrics } from '@/features/survey/types'

export interface ComprehensiveFraudAssessment {
  // Overall verdict
  overallRiskScore: number // 0-1
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  isLikelyFraud: boolean
  confidence: number // 0-1

  // Category scores
  scores: {
    behavioral: number
    aiContent: number
    plagiarism: number
    contradictions: number
    ipReputation: number
    deviceFingerprint: number
  }

  // Detailed findings
  findings: {
    // AI & Content
    aiGenerated?: {
      detected: boolean
      probability: number
      indicators: string[]
    }
    plagiarism?: {
      detected: boolean
      sources: number
      topMatches: Array<{ url: string; similarity: number }>
    }
    contradictions?: {
      found: boolean
      count: number
      examples: string[]
    }
    quality?: {
      score: number
      effortLevel: string
      issues: string[]
    }

    // Behavioral
    automation?: {
      detected: boolean
      confidence: number
      reasons: string[]
    }
    interaction?: {
      mouseEvents: number
      keystrokes: number
      tabSwitches: number
      pasteCount: number
    }

    // Identity
    ipRisk?: {
      isVPN: boolean
      isDataCenter: boolean
      threatLevel: string
      location: string
    }
    deviceRisk?: {
      isAutomation: boolean
      issues: string[]
    }
  }

  // Actionable recommendations
  recommendations: string[]

  // Evidence summary
  evidence: {
    highRisk: string[]
    mediumRisk: string[]
    lowRisk: string[]
    humanIndicators: string[]
  }

  // Detailed reasoning (from AI models)
  reasoning: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      responses, // Survey answers
      questions, // Question text
      behavioralMetrics, // BehavioralMetrics from frontend
      sessionId,
      respondentId,
    } = body

    // Get client IP
    const clientIP = getClientIP(request) || 'unknown'

    // Run all analyses in parallel for speed
    const [
      aiAnalysis,
      contradictionAnalysis,
      qualityAnalysis,
      plagiarismResult,
      ipReputation,
    ] = await Promise.all([
      // AI text detection
      analyzeTextResponses(responses, questions, {
        timeSpent: behavioralMetrics?.responseTime?.reduce((acc: Record<string, number>, time: number, idx: number) => {
          acc[`q${idx}`] = time
          return acc
        }, {}),
        pasteEvents: behavioralMetrics?.pasteEvents || 0,
        tabSwitches: behavioralMetrics?.focusEvents?.filter((e: any) => e.type === 'blur').length || 0,
      }).catch(err => {
        console.error('AI analysis error:', err)
        return null
      }),

      // Contradiction detection
      detectContradictions(responses, questions).catch(err => {
        console.error('Contradiction analysis error:', err)
        return null
      }),

      // Quality analysis
      analyzeResponseQuality(responses, questions, behavioralMetrics?.responseTime).catch(err => {
        console.error('Quality analysis error:', err)
        return null
      }),

      // Plagiarism check
      checkPlagiarism(responses).catch(err => {
        console.error('Plagiarism check error:', err)
        return null
      }),

      // IP reputation
      clientIP !== 'unknown' ? getIPReputation(clientIP).catch(err => {
        console.error('IP reputation error:', err)
        return null
      }) : null,
    ])

    // Quick checks that don't require API calls
    const quickPlagiarism = quickPlagiarismCheck(responses)
    const templateCheck = detectTemplateResponses(responses)

    // Device fingerprint analysis
    const deviceAutomation = behavioralMetrics?.deviceFingerprint
      ? detectAutomationFromFingerprint(behavioralMetrics.deviceFingerprint)
      : null

    const fingerprintConsistency = behavioralMetrics?.deviceFingerprint
      ? validateFingerprintConsistency(behavioralMetrics.deviceFingerprint)
      : null

    // Timezone validation
    const timezoneCheck = ipReputation && behavioralMetrics?.deviceFingerprint?.timezone
      ? validateTimezone(ipReputation.timezone, behavioralMetrics.deviceFingerprint.timezone)
      : null

    // Quality/time mismatch check
    const qualityTimeMismatch = qualityAnalysis && behavioralMetrics?.responseTime
      ? detectQualityTimeMismatch(
          qualityAnalysis,
          behavioralMetrics.responseTime.reduce((a: number, b: number) => a + b, 0) / behavioralMetrics.responseTime.length
        )
      : null

    // Calculate category scores
    const scores = {
      behavioral: calculateBehavioralScore(behavioralMetrics),
      aiContent: aiAnalysis?.aiProbability || 0,
      plagiarism: plagiarismResult?.plagiarismScore || (quickPlagiarism.duplicateCount > 0 ? 0.5 : 0),
      contradictions: contradictionAnalysis ? (1 - contradictionAnalysis.consistencyScore) : 0,
      ipReputation: ipReputation?.riskScore || 0,
      deviceFingerprint: deviceAutomation?.confidence || fingerprintConsistency?.riskScore || 0,
    }

    // Calculate overall risk score (weighted average)
    const overallRiskScore = (
      scores.behavioral * 0.25 +
      scores.aiContent * 0.20 +
      scores.plagiarism * 0.15 +
      scores.contradictions * 0.10 +
      scores.ipReputation * 0.15 +
      scores.deviceFingerprint * 0.15
    )

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (overallRiskScore >= 0.8) riskLevel = 'critical'
    else if (overallRiskScore >= 0.6) riskLevel = 'high'
    else if (overallRiskScore >= 0.4) riskLevel = 'medium'

    // Collect evidence
    const evidence = {
      highRisk: [] as string[],
      mediumRisk: [] as string[],
      lowRisk: [] as string[],
      humanIndicators: [] as string[],
    }

    // AI indicators
    if (aiAnalysis) {
      evidence.highRisk.push(...aiAnalysis.evidence.aiIndicators)
      evidence.humanIndicators.push(...aiAnalysis.evidence.humanIndicators)
    }

    // Plagiarism indicators
    if (plagiarismResult && plagiarismResult.matches.length > 0) {
      evidence.highRisk.push(`Found ${plagiarismResult.matches.length} plagiarism matches`)
    }

    // Contradiction indicators
    if (contradictionAnalysis && contradictionAnalysis.contradictions.length > 0) {
      evidence.mediumRisk.push(...contradictionAnalysis.contradictions.map(c => c.description))
    }

    // IP indicators
    if (ipReputation) {
      if (ipReputation.isVPN) evidence.mediumRisk.push('VPN detected')
      if (ipReputation.isDataCenter) evidence.mediumRisk.push('Data center IP')
      if (ipReputation.isTor) evidence.highRisk.push('Tor exit node detected')
    }

    // Device indicators
    if (deviceAutomation?.isAutomation) {
      evidence.highRisk.push(...deviceAutomation.reasons)
    }

    // Timezone mismatch
    if (timezoneCheck && !timezoneCheck.isConsistent) {
      evidence.mediumRisk.push(timezoneCheck.reason || 'Timezone mismatch')
    }

    // Template responses
    if (templateCheck.isTemplate) {
      evidence.mediumRisk.push(...templateCheck.templateIndicators)
    }

    // Quality/time mismatch
    if (qualityTimeMismatch?.hasMismatch) {
      evidence.mediumRisk.push(qualityTimeMismatch.explanation)
    }

    // Generate recommendations
    const recommendations = generateRecommendations({
      riskLevel,
      scores,
      aiAnalysis,
      plagiarismResult,
      contradictionAnalysis,
      deviceAutomation,
      ipReputation,
    })

    // Build comprehensive assessment
    const assessment: ComprehensiveFraudAssessment = {
      overallRiskScore,
      riskLevel,
      isLikelyFraud: overallRiskScore >= 0.6,
      confidence: calculateConfidence([
        aiAnalysis?.confidence,
        contradictionAnalysis?.confidence,
        plagiarismResult?.confidence,
      ]),

      scores,

      findings: {
        aiGenerated: aiAnalysis ? {
          detected: aiAnalysis.isAIGenerated,
          probability: aiAnalysis.aiProbability,
          indicators: aiAnalysis.evidence.aiIndicators,
        } : undefined,

        plagiarism: plagiarismResult ? {
          detected: plagiarismResult.isPlagiarized,
          sources: plagiarismResult.matches.length,
          topMatches: plagiarismResult.matches.slice(0, 3).map(m => ({
            url: m.sourceUrl,
            similarity: m.similarity,
          })),
        } : undefined,

        contradictions: contradictionAnalysis ? {
          found: contradictionAnalysis.hasContradictions,
          count: contradictionAnalysis.contradictions.length,
          examples: contradictionAnalysis.contradictions.slice(0, 3).map(c => c.description),
        } : undefined,

        quality: qualityAnalysis ? {
          score: qualityAnalysis.responseQuality,
          effortLevel: qualityAnalysis.effortLevel,
          issues: qualityAnalysis.issues,
        } : undefined,

        automation: deviceAutomation ? {
          detected: deviceAutomation.isAutomation,
          confidence: deviceAutomation.confidence,
          reasons: deviceAutomation.reasons,
        } : undefined,

        interaction: behavioralMetrics ? {
          mouseEvents: behavioralMetrics.mouseMovements?.length || 0,
          keystrokes: behavioralMetrics.keypressCount || 0,
          tabSwitches: behavioralMetrics.focusEvents?.filter((e: any) => e.type === 'blur').length || 0,
          pasteCount: behavioralMetrics.pasteEvents || 0,
        } : undefined,

        ipRisk: ipReputation ? {
          isVPN: ipReputation.isVPN || false,
          isDataCenter: ipReputation.isDataCenter || false,
          threatLevel: ipReputation.threatLevel || 'low',
          location: `${ipReputation.city || ''}, ${ipReputation.country || ''}`.trim(),
        } : undefined,

        deviceRisk: fingerprintConsistency ? {
          isAutomation: deviceAutomation?.isAutomation || false,
          issues: fingerprintConsistency.issues,
        } : undefined,
      },

      recommendations,
      evidence,

      reasoning: [
        aiAnalysis?.reasoning,
        contradictionAnalysis?.reasoning,
        qualityTimeMismatch?.explanation,
      ].filter(Boolean).join('\n\n'),
    }

    return NextResponse.json(assessment)
  } catch (error) {
    console.error('Comprehensive fraud assessment error:', error)
    return NextResponse.json(
      { error: 'Fraud assessment failed', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * Calculate behavioral risk score from metrics
 */
function calculateBehavioralScore(metrics?: BehavioralMetrics): number {
  if (!metrics) return 0

  let score = 0

  // Fast completion
  const avgTime = metrics.responseTime.length > 0
    ? metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length
    : 0

  if (avgTime < 3000) score += 0.3 // < 3s per question

  // Low interaction
  const mouseCount = metrics.mouseMovements?.length || 0
  const keyCount = metrics.keypressCount || 0

  if (mouseCount < 20 && keyCount < 10) score += 0.3

  // Excessive paste
  if ((metrics.pasteEvents || 0) > 3) score += 0.2

  // Tab switching
  const blurCount = metrics.focusEvents?.filter(e => e.type === 'blur').length || 0
  if (blurCount > 5) score += 0.2

  return Math.min(score, 1)
}

/**
 * Calculate confidence from multiple analyses
 */
function calculateConfidence(confidences: Array<number | undefined>): number {
  const valid = confidences.filter((c): c is number => c !== undefined && c > 0)
  if (valid.length === 0) return 0.5

  return valid.reduce((sum, c) => sum + c, 0) / valid.length
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(data: any): string[] {
  const recommendations: string[] = []

  if (data.riskLevel === 'critical' || data.riskLevel === 'high') {
    recommendations.push('REJECT: This response shows multiple strong fraud indicators')
  }

  if (data.scores.aiContent > 0.7) {
    recommendations.push('FLAG: AI-generated content detected - consider manual review')
  }

  if (data.plagiarismResult?.matches.length > 0) {
    recommendations.push(`FLAG: Found ${data.plagiarismResult.matches.length} potential plagiarism sources`)
  }

  if (data.contradictionAnalysis?.contradictions.length > 2) {
    recommendations.push('FLAG: Multiple contradictions found - respondent may be inconsistent or inattentive')
  }

  if (data.deviceAutomation?.isAutomation) {
    recommendations.push('REJECT: Automation tools detected (Selenium, Puppeteer, etc.)')
  }

  if (data.ipReputation?.isTor) {
    recommendations.push('FLAG: Tor network detected - high anonymization risk')
  }

  if (data.riskLevel === 'low') {
    recommendations.push('ACCEPT: Response appears legitimate with minimal fraud indicators')
  }

  if (data.riskLevel === 'medium') {
    recommendations.push('REVIEW: Moderate risk - recommend manual review before decision')
  }

  return recommendations
}
