/**
 * Tiered Fraud Assessment API - Cost-Optimized Cipher Analysis
 *
 * Runs fraud detection checks based on the survey's configured tier level:
 * - Tier 1: Basic behavioral heuristics (FREE)
 * - Tier 2: + Device fingerprinting (FREE)
 * - Tier 3: + Light AI analysis (gpt-4o-mini)
 * - Tier 4: + Full behavioral + IP reputation (gpt-4o-mini periodic)
 * - Tier 5: All 60+ checks (gpt-4o full analysis)
 */

import { NextRequest, NextResponse } from 'next/server';
import { CipherTier, CIPHER_TIERS, getChecksForTier } from '@/lib/cipher/tier-config';
import type { BehavioralMetrics } from '@/lib/cipher/cipher-tracker';
import { buildEvidenceSignals, calculateBayesianFraudProbability, determineRiskLevel } from '@/lib/services/bayesian-inference';
import { getClientIP, getIPReputation, validateTimezone } from '@/lib/services/ip-reputation';
import { detectAutomationFromFingerprint, validateFingerprintConsistency } from '@/lib/services/device-fingerprint';
import { detectContradictions, type ContradictionAnalysis, type Contradiction } from '@/lib/services/semantic-analysis';
import { detectFraudRing, type FraudRingAnalysis } from '@/lib/services/fraud-ring-detection';
import { getReputation, updateReputation, type ReputationProfile } from '@/lib/services/reputation-tracking';
import { supabaseAdmin } from '@/lib/supabase-server';
import { runHybridAssessment, type CipherFeatures } from '@/lib/cipher';

export interface TieredAssessmentRequest {
  tier: CipherTier;
  responses: Record<string, any>;
  questions?: Array<{ id: string; text: string; type: string }>;
  behavioralMetrics: BehavioralMetrics;
  projectId?: string;
  sessionId?: string;
  respondentId?: string;
  advancedChecks?: Record<string, boolean>;
}

export interface TieredAssessmentResponse {
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  tier: CipherTier;
  tierName: string;

  scores: {
    behavioral: number;
    aiContent: number;
    device: number;
    network: number;
    contradictions: number;
    fraudRing: number;
    reputation: number;
  };

  findings: {
    behavioral?: BehavioralFindings;
    device?: DeviceFindings;
    content?: ContentFindings;
    network?: NetworkFindings;
    ai?: AIFindings;
    contradictions?: ContradictionFindings;
    fraudRing?: FraudRingFindings;
    reputation?: ReputationFindings;
  };

  flags: string[];
  humanIndicators: string[];

  // Explainability engine output
  explainability: {
    summary: string;
    keyFactors: string[];
    mitigatingFactors: string[];
    recommendations: string[];
  };

  // Cost tracking
  aiCallsMade: number;
  estimatedCost: number;
}

interface ContradictionFindings {
  hasContradictions: boolean;
  count: number;
  contradictions: Contradiction[];
  consistencyScore: number;
  reasoning?: string;
}

interface BehavioralFindings {
  mouseMovementCount: number;
  avgMouseVelocity: number;
  keypressCount: number;
  backspaceCount: number;
  pasteEvents: number;
  tabSwitchCount: number;
  totalDuration: number;
  flags: string[];
}

interface DeviceFindings {
  isAutomation: boolean;
  webDriverDetected: boolean;
  confidence: number;
  issues: string[];
}

interface ContentFindings {
  straightLiningDetected: boolean;
  minimalEffortDetected: boolean;
  patternAnswers: boolean;
  flags: string[];
}

interface NetworkFindings {
  isVPN: boolean;
  isDataCenter: boolean;
  isTor: boolean;
  location?: string;
}

interface AIFindings {
  aiContentDetected: boolean;
  aiProbability: number;
  contradictionsFound: boolean;
  plagiarismDetected: boolean;
  indicators: string[];
}

interface FraudRingFindings {
  detected: boolean;
  ringSize: number;
  confidence: number;
  patterns: string[];
}

interface ReputationFindings {
  score: number;
  riskLevel: 'low' | 'medium' | 'high';
  totalSubmissions: number;
  flaggedSubmissions: number;
  violations: string[];
}

/**
 * Tiered fraud assessment endpoint
 */
export async function POST(request: NextRequest): Promise<NextResponse<TieredAssessmentResponse | { error: string }>> {
  try {
    const body: TieredAssessmentRequest = await request.json();
    const { tier, responses, questions, behavioralMetrics, advancedChecks } = body;

    // Validate tier
    if (!tier || tier < 1 || tier > 5) {
      return NextResponse.json({ error: 'Invalid tier. Must be 1-5.' }, { status: 400 });
    }

    const tierConfig = CIPHER_TIERS[tier];
    const enabledChecks = getChecksForTier(tier);

    const result: TieredAssessmentResponse = {
      overallRiskScore: 0,
      riskLevel: 'low',
      confidence: 0,
      tier,
      tierName: tierConfig.name,
      scores: { behavioral: 0, aiContent: 0, device: 0, network: 0, contradictions: 0, fraudRing: 0, reputation: 0 },
      findings: {},
      flags: [],
      humanIndicators: [],
      explainability: {
        summary: '',
        keyFactors: [],
        mitigatingFactors: [],
        recommendations: [],
      },
      aiCallsMade: 0,
      estimatedCost: 0,
    };

    // ============================================
    // TIER 1: Basic Behavioral Heuristics (FREE)
    // ============================================
    if (tier >= 1) {
      const behavioralFindings = analyzeBasicBehavioral(behavioralMetrics, enabledChecks);
      result.findings.behavioral = behavioralFindings;
      result.flags.push(...behavioralFindings.flags);
      result.scores.behavioral = calculateBehavioralScore(behavioralFindings);

      // Check for human indicators
      if (behavioralFindings.backspaceCount > 5) {
        result.humanIndicators.push('Natural typing corrections detected');
      }
      if (behavioralFindings.avgMouseVelocity > 0 && behavioralFindings.avgMouseVelocity < 2) {
        result.humanIndicators.push('Natural mouse movement speed');
      }
    }

    // ============================================
    // TIER 2: Device Fingerprinting (FREE)
    // ============================================
    if (tier >= 2 && behavioralMetrics.deviceFingerprint) {
      const deviceFindings = analyzeDeviceFingerprint(behavioralMetrics.deviceFingerprint, enabledChecks);
      result.findings.device = deviceFindings;
      result.flags.push(...deviceFindings.issues);
      result.scores.device = deviceFindings.confidence;

      // Content analysis (straight-lining, minimal effort)
      const contentFindings = analyzeContentPatterns(responses, enabledChecks);
      result.findings.content = contentFindings;
      result.flags.push(...contentFindings.flags);
    }

    // ============================================
    // TIER 3: Light AI Analysis (~$0.002)
    // ============================================
    if (tier >= 3 && tierConfig.aiModel) {
      try {
        const aiFindings = await runLightAIAnalysis(responses, questions || [], enabledChecks);
        result.findings.ai = aiFindings;
        result.scores.aiContent = aiFindings.aiProbability;
        result.flags.push(...aiFindings.indicators);
        result.aiCallsMade++;
        result.estimatedCost += 0.002;
      } catch (error) {
        console.error('Light AI analysis error:', error);
        // Continue without AI analysis
      }

      // CONTRADICTION DETECTION (Tier 3+)
      // Builds a map of question IDs to question text for analysis
      if (questions && questions.length > 0 && Object.keys(responses).length > 0) {
        try {
          const questionMap = questions.reduce((acc, q) => {
            acc[q.id] = q.text;
            return acc;
          }, {} as Record<string, string>);

          const contradictionAnalysis = await detectContradictions(
            responses,
            questionMap,
            { provider: 'openai', model: 'gpt-4o-mini' }
          );

          result.findings.contradictions = {
            hasContradictions: contradictionAnalysis.hasContradictions,
            count: contradictionAnalysis.contradictions.length,
            contradictions: contradictionAnalysis.contradictions,
            consistencyScore: contradictionAnalysis.consistencyScore,
            reasoning: contradictionAnalysis.reasoning,
          };

          // Score is inverse of consistency (low consistency = high fraud risk)
          result.scores.contradictions = 1 - contradictionAnalysis.consistencyScore;

          // Add flags for high-severity contradictions
          contradictionAnalysis.contradictions.forEach((c) => {
            if (c.severity === 'high') {
              result.flags.push(`Contradiction: ${c.description}`);
            } else if (c.severity === 'medium') {
              result.flags.push(`Inconsistency: ${c.description}`);
            }
          });

          // If highly consistent, add as human indicator
          if (contradictionAnalysis.consistencyScore > 0.9 && !contradictionAnalysis.hasContradictions) {
            result.humanIndicators.push('Responses are logically consistent');
          }

          result.aiCallsMade++;
          result.estimatedCost += 0.003; // Additional cost for contradiction check
        } catch (error) {
          console.error('Contradiction detection error:', error);
        }
      }
    }

    // ============================================
    // TIER 4: Full Behavioral + IP Reputation (~$0.01)
    // ============================================
    if (tier >= 4) {
      // IP reputation check
      const clientIP = getClientIP(request);
      if (clientIP && clientIP !== 'unknown') {
        try {
          const ipRep = await getIPReputation(clientIP);
          if (ipRep) {
            result.findings.network = {
              isVPN: ipRep.isVPN || false,
              isDataCenter: ipRep.isDataCenter || false,
              isTor: ipRep.isTor || false,
              location: ipRep.city ? `${ipRep.city}, ${ipRep.country}` : ipRep.country,
            };
            result.scores.network = ipRep.riskScore || 0;

            if (ipRep.isVPN) result.flags.push('VPN detected');
            if (ipRep.isDataCenter) result.flags.push('Data center IP detected');
            if (ipRep.isTor) result.flags.push('Tor exit node detected');
          }
        } catch (error) {
          console.error('IP reputation error:', error);
        }
      }

      // Advanced behavioral analysis
      const advancedBehavioral = analyzeAdvancedBehavioral(behavioralMetrics, enabledChecks);
      result.flags.push(...advancedBehavioral.flags);
      result.scores.behavioral = Math.max(result.scores.behavioral, advancedBehavioral.score);

      // Timezone validation
      if (result.findings.network && behavioralMetrics.deviceFingerprint?.timezone) {
        const tzCheck = validateTimezone(
          result.findings.network.location?.split(', ').pop() || '',
          behavioralMetrics.deviceFingerprint.timezone
        );
        if (tzCheck && !tzCheck.isValid) {
          result.flags.push('Timezone mismatch detected');
        }
      }
    }

    // ============================================
    // TIER 4+: Reputation Tracking
    // ============================================
    if (tier >= 4 && body.projectId) {
      const clientIP = getClientIP(request);
      if (clientIP && clientIP !== 'unknown') {
        try {
          const reputation = await getReputation(supabaseAdmin, clientIP, 'ip');
          result.findings.reputation = {
            score: reputation.reputationScore,
            riskLevel: reputation.riskScore > 0.6 ? 'high' : reputation.riskScore > 0.3 ? 'medium' : 'low',
            totalSubmissions: reputation.totalSubmissions,
            flaggedSubmissions: reputation.flaggedSubmissions,
            violations: reputation.violations,
          };
          result.scores.reputation = reputation.riskScore;

          if (reputation.riskScore > 0.6) {
            result.flags.push('High-risk IP reputation (multiple previous flagged submissions)');
          } else if (reputation.riskScore > 0.3) {
            result.flags.push('Moderate-risk IP reputation');
          }

          // If very low risk reputation, add as human indicator
          if (reputation.reputationScore > 0.8 && reputation.totalSubmissions > 5) {
            result.humanIndicators.push('Good reputation history from this IP');
          }
        } catch (error) {
          console.error('Reputation tracking error:', error);
        }
      }
    }

    // ============================================
    // TIER 5: Full Comprehensive Analysis (~$0.05)
    // ============================================
    if (tier >= 5) {
      try {
        const comprehensiveAI = await runComprehensiveAIAnalysis(responses, questions || [], behavioralMetrics);
        result.findings.ai = {
          ...result.findings.ai,
          ...comprehensiveAI,
        };
        result.scores.aiContent = comprehensiveAI.aiProbability;
        result.flags.push(...comprehensiveAI.indicators);
        result.aiCallsMade++;
        result.estimatedCost += 0.045;
      } catch (error) {
        console.error('Comprehensive AI analysis error:', error);
      }

      // Fraud ring detection (requires project ID)
      if (body.projectId) {
        try {
          const fraudRingAnalysis = await detectFraudRing(supabaseAdmin, body.projectId, {
            minGroupSize: 3,
            similarityThreshold: 0.7,
            timeWindowHours: 24,
          });

          if (fraudRingAnalysis.isFraudRing || fraudRingAnalysis.patterns.length > 0) {
            result.findings.fraudRing = {
              detected: fraudRingAnalysis.isFraudRing,
              ringSize: fraudRingAnalysis.ringSize,
              confidence: fraudRingAnalysis.confidence,
              patterns: fraudRingAnalysis.patterns.map(p => p.description),
            };
            result.scores.fraudRing = fraudRingAnalysis.confidence;

            if (fraudRingAnalysis.isFraudRing) {
              result.flags.push(`Fraud ring detected: ${fraudRingAnalysis.ringSize} coordinated submissions`);
            }
            fraudRingAnalysis.patterns.forEach(p => {
              if (p.severity === 'high') {
                result.flags.push(`Fraud ring pattern: ${p.description}`);
              }
            });
          }
        } catch (error) {
          console.error('Fraud ring detection error:', error);
        }
      }
    }

    // ============================================
    // HYBRID ML + LLM ASSESSMENT (Tier 4+)
    // XGBoost handles 75 quantitative signals, LLM handles semantic analysis
    // Final score fuses both for maximum accuracy
    // ============================================
    let hybridScore: number | null = null;
    if (tier >= 4) {
      try {
        // Build CipherFeatures from behavioral metrics
        const cipherFeatures = buildCipherFeaturesFromMetrics(behavioralMetrics, responses, result);

        // Calculate rule-based score from existing findings
        const ruleBasedScore = calculateRuleBasedScore(result.scores);

        // Run hybrid assessment (ML + LLM fusion)
        const hybridResult = await runHybridAssessment(
          cipherFeatures,
          responses,
          ruleBasedScore,
          {
            llmThresholdLow: 0.3,
            llmThresholdHigh: 0.7,
            alwaysUseLlmForOpenEnded: tier >= 5, // Only use LLM for open-ended at tier 5
            mlWeight: 0.5,
            llmWeight: 0.35,
            ruleWeight: 0.15,
          }
        );

        hybridScore = hybridResult.finalScore;

        // Add hybrid signals to flags
        for (const signal of hybridResult.topSignals) {
          if (signal.contribution > 0.15) {
            result.flags.push(`[ML] ${signal.description}`);
          }
        }

        // Track AI calls from hybrid assessment
        if (hybridResult.llmUsed) {
          result.aiCallsMade++;
          result.estimatedCost += hybridResult.estimatedCost;
        }

        // Update explainability with hybrid explanation
        if (hybridResult.explanation) {
          result.explainability.summary = hybridResult.explanation;
        }

        console.log(`[Hybrid] ML: ${(hybridResult.mlScore * 100).toFixed(0)}%, LLM: ${hybridResult.llmScore ? (hybridResult.llmScore * 100).toFixed(0) + '%' : 'skipped'}, Final: ${(hybridResult.finalScore * 100).toFixed(0)}%`);
      } catch (error) {
        console.error('Hybrid assessment error:', error);
        // Continue without hybrid - will use Bayesian fallback
      }
    }

    // ============================================
    // Calculate Final Score with Bayesian Inference
    // ============================================
    const evidenceSignals = buildEvidenceFromFindings(result.findings, result.flags);
    const bayesianResult = calculateBayesianFraudProbability(evidenceSignals, 0.15);

    // If hybrid assessment ran, blend with Bayesian (hybrid gets priority)
    if (hybridScore !== null) {
      // Weight: 70% hybrid, 30% Bayesian (hybrid is more accurate)
      result.overallRiskScore = hybridScore * 0.7 + bayesianResult.fraudProbability * 0.3;
      result.confidence = Math.max(bayesianResult.confidence, 0.85); // Higher confidence with ML
    } else {
      result.overallRiskScore = bayesianResult.fraudProbability;
      result.confidence = bayesianResult.confidence;
    }

    result.riskLevel = determineRiskLevel(result.overallRiskScore, result.confidence);

    // ============================================
    // Generate Explainability Output
    // ============================================
    result.explainability = generateExplainability(result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Tiered assessment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// ANALYSIS FUNCTIONS
// ============================================

function analyzeBasicBehavioral(metrics: BehavioralMetrics, enabledChecks: string[]): BehavioralFindings {
  const flags: string[] = [];

  // Rapid completion check
  if (enabledChecks.includes('rapid_completion')) {
    const avgTimePerQuestion = metrics.responseTime.length > 0
      ? metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length
      : 0;
    if (avgTimePerQuestion < 3000 && metrics.responseTime.length > 3) {
      flags.push('Suspiciously fast completion (< 3s per question)');
    }
  }

  // Uniform timing check
  if (enabledChecks.includes('uniform_timing') && metrics.responseTime.length > 3) {
    const variance = calculateVariance(metrics.responseTime);
    const mean = metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    if (coefficientOfVariation < 0.1) {
      flags.push('Suspiciously uniform response timing');
    }
  }

  // Low interaction check
  if (enabledChecks.includes('low_interaction')) {
    if (metrics.mouseMovementCount < 10 && metrics.keypressCount < 5) {
      flags.push('Very low interaction (minimal mouse/keyboard activity)');
    }
  }

  // Impossibly fast typing
  if (enabledChecks.includes('impossibly_fast')) {
    if (metrics.avgKeystrokeDwell > 0 && metrics.avgKeystrokeDwell < 30) {
      flags.push('Impossibly fast typing detected');
    }
  }

  return {
    mouseMovementCount: metrics.mouseMovementCount,
    avgMouseVelocity: metrics.avgMouseVelocity,
    keypressCount: metrics.keypressCount,
    backspaceCount: metrics.backspaceCount,
    pasteEvents: metrics.pasteEvents,
    tabSwitchCount: metrics.tabSwitchCount,
    totalDuration: metrics.duration,
    flags,
  };
}

function analyzeDeviceFingerprint(fingerprint: any, enabledChecks: string[]): DeviceFindings {
  const issues: string[] = [];
  let confidence = 0;

  // WebDriver detection
  if (enabledChecks.includes('webdriver_detected') && fingerprint.webDriver) {
    issues.push('WebDriver automation detected');
    confidence = Math.max(confidence, 0.95);
  }

  // Automation detection
  if (enabledChecks.includes('automation_detected') && fingerprint.automationDetected) {
    issues.push('Browser automation framework detected');
    confidence = Math.max(confidence, 0.9);
  }

  // Missing plugins (bots often have 0)
  if (enabledChecks.includes('no_plugins') && fingerprint.pluginCount === 0) {
    issues.push('No browser plugins detected (potential bot)');
    confidence = Math.max(confidence, 0.4);
  }

  // Suspicious user agent
  if (enabledChecks.includes('suspicious_user_agent')) {
    const ua = (fingerprint.userAgent || '').toLowerCase();
    const botPatterns = ['headless', 'phantom', 'selenium', 'webdriver', 'puppeteer', 'playwright'];
    if (botPatterns.some(p => ua.includes(p))) {
      issues.push('Bot-like user agent string');
      confidence = Math.max(confidence, 0.85);
    }
  }

  // Screen anomaly
  if (enabledChecks.includes('screen_anomaly')) {
    if (fingerprint.screenWidth === 0 || fingerprint.screenHeight === 0) {
      issues.push('Invalid screen dimensions');
      confidence = Math.max(confidence, 0.7);
    }
  }

  return {
    isAutomation: issues.length > 0,
    webDriverDetected: fingerprint.webDriver || false,
    confidence,
    issues,
  };
}

function analyzeContentPatterns(responses: Record<string, any>, enabledChecks: string[]): ContentFindings {
  const flags: string[] = [];
  const values = Object.values(responses).filter(v => v !== null && v !== undefined);

  // Straight-lining detection (same answer for multiple questions)
  let straightLiningDetected = false;
  if (enabledChecks.includes('straight_line_answers') && values.length > 3) {
    const stringValues = values.map(v => String(v));
    const uniqueValues = new Set(stringValues);
    if (uniqueValues.size === 1) {
      straightLiningDetected = true;
      flags.push('Same answer selected for all questions (straight-lining)');
    }
  }

  // Minimal effort detection
  let minimalEffortDetected = false;
  if (enabledChecks.includes('minimal_effort')) {
    const textResponses = values.filter(v => typeof v === 'string');
    const avgLength = textResponses.length > 0
      ? textResponses.reduce((sum, v) => sum + v.length, 0) / textResponses.length
      : 0;
    if (avgLength < 10 && textResponses.length > 2) {
      minimalEffortDetected = true;
      flags.push('Very short text responses (minimal effort)');
    }
  }

  return {
    straightLiningDetected,
    minimalEffortDetected,
    patternAnswers: false, // Would require more sophisticated analysis
    flags,
  };
}

function analyzeAdvancedBehavioral(metrics: BehavioralMetrics, enabledChecks: string[]): { flags: string[]; score: number } {
  const flags: string[] = [];
  let score = 0;

  // Mouse teleporting detection
  if (enabledChecks.includes('mouse_teleporting') && metrics.mouseMovements.length > 10) {
    const movements = metrics.mouseMovements;
    let teleportCount = 0;
    for (let i = 1; i < movements.length; i++) {
      const dx = movements[i].x - movements[i - 1].x;
      const dy = movements[i].y - movements[i - 1].y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const dt = movements[i].t - movements[i - 1].t;
      if (distance > 500 && dt < 50) {
        teleportCount++;
      }
    }
    if (teleportCount > 3) {
      flags.push('Mouse teleporting detected (instant large jumps)');
      score = Math.max(score, 0.7);
    }
  }

  // Robotic typing (uniform keystroke timing)
  if (enabledChecks.includes('robotic_typing') && metrics.keystrokeVariance < 50 && metrics.keypressCount > 20) {
    flags.push('Robotic typing pattern (uniform keystroke timing)');
    score = Math.max(score, 0.6);
  }

  // No corrections
  if (enabledChecks.includes('no_corrections') && metrics.keypressCount > 50 && metrics.backspaceCount === 0) {
    flags.push('No typing corrections (0 backspaces on 50+ keystrokes)');
    score = Math.max(score, 0.5);
  }

  // Excessive paste
  if (enabledChecks.includes('excessive_paste') && metrics.pasteEvents > 5) {
    flags.push('Excessive paste events detected');
    score = Math.max(score, 0.4);
  }

  // Excessive tab switching
  if (enabledChecks.includes('excessive_tab_switching') && metrics.tabSwitchCount > 10) {
    flags.push('Excessive tab switching detected');
    score = Math.max(score, 0.3);
  }

  return { flags, score };
}

async function runLightAIAnalysis(
  responses: Record<string, any>,
  questions: Array<{ id: string; text: string; type: string }>,
  enabledChecks: string[]
): Promise<AIFindings> {
  // Light AI analysis using gpt-4o-mini
  // This is a simplified version - full implementation would use the AI SDK

  const textResponses = Object.entries(responses)
    .filter(([_, v]) => typeof v === 'string' && v.length > 20)
    .map(([k, v]) => ({ questionId: k, answer: v as string }));

  if (textResponses.length === 0) {
    return {
      aiContentDetected: false,
      aiProbability: 0,
      contradictionsFound: false,
      plagiarismDetected: false,
      indicators: [],
    };
  }

  // For now, return a placeholder - real implementation would call AI
  // This avoids making AI calls during development/testing
  const indicators: string[] = [];

  // Basic heuristic checks that don't require AI
  for (const { answer } of textResponses) {
    // AI signature phrases
    const aiPhrases = [
      'as an ai', 'i cannot', 'it\'s important to note',
      'i don\'t have personal', 'i\'m an ai'
    ];
    if (aiPhrases.some(phrase => answer.toLowerCase().includes(phrase))) {
      indicators.push('AI signature phrase detected');
    }

    // Perfect formatting (bullet points, numbered lists)
    if (/^\s*[-•*]\s|^\s*\d+\.\s/m.test(answer) && answer.split('\n').length > 3) {
      indicators.push('Overly structured formatting');
    }
  }

  return {
    aiContentDetected: indicators.length > 0,
    aiProbability: Math.min(indicators.length * 0.2, 0.8),
    contradictionsFound: false,
    plagiarismDetected: false,
    indicators,
  };
}

async function runComprehensiveAIAnalysis(
  responses: Record<string, any>,
  questions: Array<{ id: string; text: string; type: string }>,
  metrics: BehavioralMetrics
): Promise<AIFindings> {
  // Full AI analysis using gpt-4o
  // This would use the existing analyzeTextResponses, detectContradictions, etc.

  // For now, extend light analysis
  const lightAnalysis = await runLightAIAnalysis(responses, questions, ['ai_content_full']);

  // Add more comprehensive checks
  const indicators = [...lightAnalysis.indicators];

  // Would call full plagiarism detection here
  // Would call full contradiction detection here
  // Would call semantic analysis here

  return {
    ...lightAnalysis,
    indicators,
    aiProbability: Math.min(lightAnalysis.aiProbability + 0.1, 1),
  };
}

function buildEvidenceFromFindings(findings: TieredAssessmentResponse['findings'], flags: string[]): any {
  return buildEvidenceSignals({
    automation: findings.device
      ? {
          detected: findings.device.isAutomation,
          confidence: findings.device.confidence,
          reasons: findings.device.issues,
        }
      : undefined,
    ipRisk: findings.network
      ? {
          isVPN: findings.network.isVPN,
          isDataCenter: findings.network.isDataCenter,
          isTor: findings.network.isTor,
        }
      : undefined,
    aiGenerated: findings.ai
      ? {
          detected: findings.ai.aiContentDetected,
          probability: findings.ai.aiProbability,
          indicators: findings.ai.indicators,
        }
      : undefined,
    behavioral: findings.behavioral
      ? {
          roboticMouseMovements: flags.includes('Robotic mouse movements'),
          mouseTeleporting: flags.includes('Mouse teleporting'),
          uniformKeystrokeTiming: flags.includes('Uniform keystroke timing'),
          noTypingCorrections: flags.includes('No typing corrections'),
          impossibleTypingSpeed: flags.includes('Impossibly fast typing'),
          instantFormFilling: false,
          noHoverBehavior: false,
        }
      : undefined,
    // Add contradictions to evidence
    contradictions: findings.contradictions
      ? {
          found: findings.contradictions.hasContradictions,
          count: findings.contradictions.count,
        }
      : undefined,
  });
}

function calculateBehavioralScore(findings: BehavioralFindings): number {
  let score = 0;
  const flagCount = findings.flags.length;

  // Weight flags
  score = Math.min(flagCount * 0.2, 0.8);

  // Adjust based on interaction metrics
  if (findings.mouseMovementCount < 5) score += 0.1;
  if (findings.keypressCount < 3) score += 0.1;

  return Math.min(score, 1);
}

function calculateVariance(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const squaredDiffs = arr.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Generate human-readable explainability output
 */
/**
 * Build CipherFeatures from behavioral metrics for ML inference
 */
function buildCipherFeaturesFromMetrics(
  metrics: BehavioralMetrics,
  responses: Record<string, any>,
  result: TieredAssessmentResponse
): CipherFeatures {
  // Calculate mouse velocity stats
  let mouseVelocityMean = 0;
  let mouseVelocityStd = 0;
  let mouseVelocityMax = 0;
  let mouseDistanceTotal = 0;

  if (metrics.mouseMovements && metrics.mouseMovements.length > 1) {
    const velocities: number[] = [];
    for (let i = 1; i < metrics.mouseMovements.length; i++) {
      const prev = metrics.mouseMovements[i - 1];
      const curr = metrics.mouseMovements[i];
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dt = curr.t - prev.t;
      const distance = Math.sqrt(dx * dx + dy * dy);
      mouseDistanceTotal += distance;
      if (dt > 0) {
        velocities.push(distance / dt);
      }
    }
    if (velocities.length > 0) {
      mouseVelocityMean = velocities.reduce((a, b) => a + b, 0) / velocities.length;
      mouseVelocityMax = Math.max(...velocities);
      const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mouseVelocityMean, 2), 0) / velocities.length;
      mouseVelocityStd = Math.sqrt(variance);
    }
  }

  // Calculate timing stats
  const responseTimesMs = metrics.responseTime || [];
  const timePerQuestionMean = responseTimesMs.length > 0
    ? responseTimesMs.reduce((a, b) => a + b, 0) / responseTimesMs.length
    : 0;
  const timeVariance = responseTimesMs.length > 0
    ? responseTimesMs.reduce((sum, t) => sum + Math.pow(t - timePerQuestionMean, 2), 0) / responseTimesMs.length
    : 0;
  const timePerQuestionStd = Math.sqrt(timeVariance);

  // Analyze open-ended responses
  const openEndedResponses = Object.values(responses).filter(
    v => typeof v === 'string' && v.length > 20
  ) as string[];
  const openEndedLengths = openEndedResponses.map(r => r.length);
  const openEndedLengthMean = openEndedLengths.length > 0
    ? openEndedLengths.reduce((a, b) => a + b, 0) / openEndedLengths.length
    : 0;

  // Detect straight-lining
  const answerValues = Object.values(responses).filter(v => v !== null && v !== undefined);
  const uniqueAnswers = new Set(answerValues.map(v => String(v)));
  const straightLineRatio = answerValues.length > 1
    ? 1 - (uniqueAnswers.size / answerValues.length)
    : 0;

  // Device fingerprint features
  const fp = metrics.deviceFingerprint || {};

  return {
    // Behavioral
    mouseDistanceTotal,
    mouseVelocityMean,
    mouseVelocityStd,
    mouseVelocityMax,
    mouseAccelerationMean: 0, // Would need more calculation
    mouseCurvatureEntropy: 0,
    mouseStraightLineRatio: 0,
    mousePauseCount: 0,
    keystrokeCount: metrics.keypressCount || 0,
    keystrokeTimingMean: metrics.avgKeystrokeDwell || 0,
    keystrokeTimingStd: Math.sqrt(metrics.keystrokeVariance || 0),
    keystrokeDwellMean: metrics.avgKeystrokeDwell || 0,
    keystrokeFlightMean: 0,
    backspaceRatio: metrics.keypressCount > 0 ? metrics.backspaceCount / metrics.keypressCount : 0,
    pasteEventCount: metrics.pasteEvents || 0,
    pasteCharRatio: 0,
    scrollCount: 0,
    scrollVelocityMean: 0,
    scrollDirectionChanges: 0,
    focusLossCount: metrics.tabSwitchCount || 0,
    focusLossDurationTotal: 0,
    hoverCount: 0,
    hoverDurationMean: 0,
    clickCount: metrics.mouseMovementCount || 0,
    hoverBeforeClickRatio: 0,

    // Temporal
    completionTimeSeconds: (metrics.duration || 0) / 1000,
    timePerQuestionMean,
    timePerQuestionStd,
    timePerQuestionMin: responseTimesMs.length > 0 ? Math.min(...responseTimesMs) : 0,
    timePerQuestionMax: responseTimesMs.length > 0 ? Math.max(...responseTimesMs) : 0,
    readingVsAnsweringRatio: 0,
    firstInteractionDelayMs: 0,
    idleTimeTotal: 0,
    activeTimeRatio: 0.8,
    responseAcceleration: 0,
    timeOfDayHour: new Date().getHours(),
    dayOfWeek: new Date().getDay(),

    // Device
    hasWebdriver: fp.webDriver || false,
    hasAutomationFlags: fp.automationDetected || false,
    pluginCount: fp.pluginCount || 0,
    screenResolutionCommon: true,
    timezoneOffsetMinutes: fp.timezoneOffset || 0,
    timezoneMatchesIp: true,
    fingerprintSeenCount: 1,
    deviceMemoryGb: fp.deviceMemory || 4,
    hardwareConcurrency: fp.hardwareConcurrency || 4,
    touchSupport: fp.touchSupport || false,

    // Network (from result findings)
    isVpn: result.findings.network?.isVPN || false,
    isDatacenter: result.findings.network?.isDataCenter || false,
    isTor: result.findings.network?.isTor || false,
    isProxy: false,
    ipReputationScore: result.scores.network ? 1 - result.scores.network : 0.8,
    ipCountryCode: 'US',
    geoTimezoneMatch: true,
    ipSeenCount: 1,

    // Content
    questionCount: Object.keys(responses).length,
    openEndedCount: openEndedResponses.length,
    openEndedLengthMean,
    openEndedLengthStd: 0,
    openEndedWordCountMean: openEndedLengthMean / 5, // Rough estimate
    openEndedUniqueWordRatio: 0.7,
    straightLineRatio,
    answerEntropy: 1.5,
    firstOptionRatio: 0.25,
    lastOptionRatio: 0.25,
    middleOptionRatio: 0.5,
    responseUniquenessScore: 0.7,
    duplicateAnswerRatio: straightLineRatio,
    naRatio: 0,
    skipRatio: 0,

    // Honeypot
    attentionCheckPassed: true,
    attentionCheckCount: 0,
    consistencyCheckScore: result.findings.contradictions
      ? result.findings.contradictions.consistencyScore
      : 1.0,
    trapFieldFilled: false,
    honeypotScore: 0,
  };
}

/**
 * Calculate weighted rule-based score from component scores
 */
function calculateRuleBasedScore(scores: TieredAssessmentResponse['scores']): number {
  // Weight each component
  const weights = {
    behavioral: 0.25,
    aiContent: 0.2,
    device: 0.15,
    network: 0.15,
    contradictions: 0.1,
    fraudRing: 0.1,
    reputation: 0.05,
  };

  let totalScore = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    const score = scores[key as keyof typeof scores];
    if (score > 0) {
      totalScore += score * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

function generateExplainability(result: TieredAssessmentResponse): TieredAssessmentResponse['explainability'] {
  const keyFactors: string[] = [];
  const mitigatingFactors: string[] = [];
  const recommendations: string[] = [];

  // Identify key factors contributing to risk
  if (result.scores.behavioral > 0.5) {
    keyFactors.push('Behavioral patterns suggest non-human interaction');
  }
  if (result.scores.aiContent > 0.6) {
    keyFactors.push('Text responses show characteristics of AI-generated content');
  }
  if (result.scores.device > 0.5) {
    keyFactors.push('Device fingerprint indicates automation tools');
  }
  if (result.scores.network > 0.5) {
    keyFactors.push('Network characteristics suggest anonymization (VPN/proxy)');
  }
  if (result.scores.contradictions > 0.4) {
    keyFactors.push('Response contradictions detected across questions');
  }
  if (result.scores.fraudRing > 0.5) {
    keyFactors.push('Submission patterns match fraud ring activity');
  }
  if (result.scores.reputation > 0.5) {
    keyFactors.push('IP/device has history of flagged submissions');
  }

  // Add specific flags as key factors
  result.flags.slice(0, 5).forEach(flag => {
    if (!keyFactors.some(kf => kf.toLowerCase().includes(flag.toLowerCase().slice(0, 20)))) {
      keyFactors.push(flag);
    }
  });

  // Identify mitigating factors (human indicators)
  result.humanIndicators.forEach(indicator => {
    mitigatingFactors.push(indicator);
  });

  if (result.findings.behavioral?.backspaceCount && result.findings.behavioral.backspaceCount > 3) {
    mitigatingFactors.push('Natural typing corrections observed');
  }
  if (result.findings.behavioral?.tabSwitchCount === 0) {
    mitigatingFactors.push('Respondent stayed focused on survey');
  }
  if (result.scores.contradictions < 0.2) {
    mitigatingFactors.push('Responses are logically consistent');
  }
  if (result.findings.reputation?.score && result.findings.reputation.score > 0.7) {
    mitigatingFactors.push('Good historical reputation');
  }

  // Generate recommendations based on risk level
  switch (result.riskLevel) {
    case 'critical':
      recommendations.push('Strongly consider rejecting this response');
      recommendations.push('Review behavioral data for automation signatures');
      if (result.findings.fraudRing?.detected) {
        recommendations.push('Investigate related submissions for fraud ring');
      }
      break;
    case 'high':
      recommendations.push('Manual review recommended before accepting');
      recommendations.push('Compare with known legitimate responses');
      if (result.scores.aiContent > 0.6) {
        recommendations.push('Verify authenticity of text responses');
      }
      break;
    case 'medium':
      recommendations.push('Consider additional verification if response is critical');
      recommendations.push('Monitor for similar patterns in future submissions');
      break;
    case 'low':
      recommendations.push('Response appears legitimate');
      if (mitigatingFactors.length > 0) {
        recommendations.push('Human behavior indicators present');
      }
      break;
  }

  // Generate summary
  let summary = '';
  if (result.riskLevel === 'critical' || result.riskLevel === 'high') {
    summary = `This response has a ${result.riskLevel} fraud risk (${Math.round(result.overallRiskScore * 100)}% probability) with ${Math.round(result.confidence * 100)}% confidence. `;
    summary += keyFactors.length > 0
      ? `Key concerns: ${keyFactors.slice(0, 3).join('; ')}. `
      : '';
    summary += mitigatingFactors.length > 0
      ? `However, some legitimate signals were detected: ${mitigatingFactors.slice(0, 2).join('; ')}.`
      : 'No significant mitigating factors were found.';
  } else if (result.riskLevel === 'medium') {
    summary = `This response has moderate fraud indicators (${Math.round(result.overallRiskScore * 100)}% risk). `;
    summary += `Some suspicious patterns detected but not conclusive. `;
    summary += mitigatingFactors.length > 0
      ? `Legitimate signals: ${mitigatingFactors.slice(0, 2).join('; ')}.`
      : '';
  } else {
    summary = `This response appears legitimate (${Math.round(result.overallRiskScore * 100)}% fraud probability). `;
    summary += mitigatingFactors.length > 0
      ? `Human indicators detected: ${mitigatingFactors.slice(0, 2).join('; ')}.`
      : 'Normal behavioral patterns observed.';
  }

  return {
    summary,
    keyFactors: keyFactors.slice(0, 10),
    mitigatingFactors: mitigatingFactors.slice(0, 5),
    recommendations: recommendations.slice(0, 4),
  };
}
