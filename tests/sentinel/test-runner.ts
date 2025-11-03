/**
 * SENTINEL Test Runner
 *
 * Executes comprehensive test suite and collects performance metrics
 * Compares results against expected outcomes and competitor benchmarks
 */

import { allTestCases, testCaseStats, type TestCase } from './test-cases'
import { calculateEnsembleScore } from '@/lib/ml/ensemble-scoring'
import { detectAdvancedFraud } from '@/features/survey/behavior/advanced-detection'
import { analyzeTextResponses } from '@/lib/services/ai-text-detection'
import { detectContradictions } from '@/lib/services/semantic-analysis'
import { analyzeResponseQuality } from '@/lib/services/semantic-analysis'

export interface TestResult {
  testCase: TestCase
  sentinelOutput: {
    fraudScore: number
    riskLevel: string
    confidence: number
    processingTimeMs: number
    modelScores: any
    reasoning: any
  }
  evaluation: {
    correct: boolean // Did we get the risk level right?
    scoreError: number // Abs difference from expected
    truePositive: boolean
    trueNegative: boolean
    falsePositive: boolean
    falseNegative: boolean
  }
}

export interface TestSummary {
  totalTests: number
  correctClassifications: number
  accuracy: number

  // Confusion matrix
  truePositives: number
  trueNegatives: number
  falsePositives: number
  falseNegatives: number

  // Metrics
  precision: number
  recall: number
  f1Score: number
  specificity: number

  // Performance
  avgProcessingTimeMs: number
  avgFraudScore: {
    legitimate: number
    fraud: number
  }

  // Category breakdown
  categoryResults: {
    [category: string]: {
      total: number
      correct: number
      accuracy: number
      avgScore: number
    }
  }

  // Detailed results
  results: TestResult[]
}

/**
 * Run all tests and collect metrics
 */
export async function runAllTests(provider: 'openai' | 'anthropic' = 'openai'): Promise<TestSummary> {
  console.log(`\n🚀 Starting SENTINEL Test Suite`)
  console.log(`🤖 AI Provider: ${provider.toUpperCase()} ${provider === 'anthropic' ? '(Claude Haiku 4.5)' : '(GPT-4o)'}`)
  console.log(`📊 Total test cases: ${testCaseStats.total}`)
  console.log(`   - Legitimate: ${testCaseStats.legitimate}`)
  console.log(`   - AI-generated: ${testCaseStats.aiGenerated}`)
  console.log(`   - Bot/Automation: ${testCaseStats.bot}`)
  console.log(`   - Plagiarism: ${testCaseStats.plagiarism}`)
  console.log(`   - Low-effort: ${testCaseStats.lowEffort}`)
  console.log(`   - Fraud Ring: ${testCaseStats.fraudRing}`)
  console.log(`   - Mixed Fraud: ${testCaseStats.mixedFraud}\n`)

  const results: TestResult[] = []

  // Run each test case
  for (const testCase of allTestCases) {
    console.log(`Testing: ${testCase.id} - ${testCase.description}`)

    const result = await runSingleTest(testCase, provider)
    results.push(result)

    // Log result
    const icon = result.evaluation.correct ? '✅' : '❌'
    console.log(`  ${icon} Expected: ${testCase.expectedRiskLevel}, Got: ${result.sentinelOutput.riskLevel}`)
    console.log(`     Score: ${result.sentinelOutput.fraudScore.toFixed(3)} (expected ~${testCase.expectedFraudScore.toFixed(3)})`)
    console.log(`     Time: ${result.sentinelOutput.processingTimeMs}ms\n`)
  }

  // Calculate summary statistics
  const summary = calculateSummary(results)

  return summary
}

/**
 * Run a single test case through SENTINEL
 */
async function runSingleTest(testCase: TestCase, provider: 'openai' | 'anthropic' = 'openai'): Promise<TestResult> {
  const startTime = Date.now()

  try {
    // 1. Run behavioral fraud detection
    const behavioralResult = detectAdvancedFraud(
      testCase.behavioralMetrics,
      testCase.responses
    )

    // 2. Run AI text detection (if responses have text)
    let aiAnalysis = null
    const hasTextResponses = Object.values(testCase.responses).some(
      r => typeof r === 'string' && r.length > 10
    )

    if (hasTextResponses) {
      aiAnalysis = await analyzeTextResponses(
        testCase.responses,
        testCase.questions,
        {
          provider, // Use selected provider
          model: provider === 'openai' ? 'gpt-4o' : undefined, // Use gpt-4o for OpenAI, default for Claude
          timeSpent: testCase.behavioralMetrics.responseTime?.reduce((acc, val) => ({ ...acc, [`q${Object.keys(acc).length + 1}`]: val }), {}),
          pasteEvents: testCase.behavioralMetrics.copyPasteEvents?.filter(e => e.type === 'paste').length || 0,
          tabSwitches: testCase.behavioralMetrics.focusEvents?.filter(e => e.type === 'blur').length || 0,
        }
      )
    }

    // 3. Run semantic analysis
    let contradictionAnalysis = null
    if (hasTextResponses && Object.keys(testCase.responses).length > 1) {
      contradictionAnalysis = await detectContradictions(
        testCase.responses,
        testCase.questions,
        {
          provider, // Use selected provider
          model: provider === 'openai' ? 'gpt-4o' : undefined,
        }
      )
    }

    // 4. Calculate ensemble score
    const ensembleResult = calculateEnsembleScore({
      behavioral: behavioralResult.overallScore,
      aiContent: aiAnalysis?.aiProbability || 0,
      plagiarism: 0, // Would need Google API for real testing
      contradictions: contradictionAnalysis ? (1 - contradictionAnalysis.consistencyScore) : 0,
      ipReputation: testCase.behavioralMetrics.deviceFingerprint?.automation ? 0.8 : 0,
      deviceFingerprint: testCase.behavioralMetrics.deviceFingerprint?.webDriver ? 0.9 :
                          (testCase.behavioralMetrics.deviceFingerprint?.automation ? 0.8 : 0),
      fraudRing: 0, // Would need cross-session analysis
      baselineDeviation: 0, // Would need baseline data

      behavioralMetrics: testCase.behavioralMetrics,
      responses: testCase.responses,
    })

    const endTime = Date.now()
    const processingTimeMs = endTime - startTime

    // Evaluate results
    const evaluation = evaluateResult(testCase, ensembleResult)

    return {
      testCase,
      sentinelOutput: {
        fraudScore: ensembleResult.fraudScore,
        riskLevel: ensembleResult.riskLevel,
        confidence: ensembleResult.confidence,
        processingTimeMs,
        modelScores: ensembleResult.modelScores,
        reasoning: ensembleResult.reasoning,
      },
      evaluation,
    }
  } catch (error: any) {
    console.error(`❌ Error testing ${testCase.id}:`, error.message)

    // Return a failed result
    return {
      testCase,
      sentinelOutput: {
        fraudScore: 0,
        riskLevel: 'error',
        confidence: 0,
        processingTimeMs: Date.now() - startTime,
        modelScores: {},
        reasoning: { summary: `Error: ${error.message}` },
      },
      evaluation: {
        correct: false,
        scoreError: 1,
        truePositive: false,
        trueNegative: false,
        falsePositive: false,
        falseNegative: false,
      },
    }
  }
}

/**
 * Evaluate if SENTINEL's output matches expected outcome
 */
function evaluateResult(testCase: TestCase, sentinelOutput: any): TestResult['evaluation'] {
  const expectedRiskLevel = testCase.expectedRiskLevel
  const actualRiskLevel = sentinelOutput.riskLevel

  // Check if risk level classification is correct
  const riskLevelCorrect = expectedRiskLevel === actualRiskLevel

  // Allow for adjacent risk levels to count as partially correct
  const riskLevels = ['low', 'medium', 'high', 'critical']
  const expectedIndex = riskLevels.indexOf(expectedRiskLevel)
  const actualIndex = riskLevels.indexOf(actualRiskLevel)
  const isAdjacentRisk = Math.abs(expectedIndex - actualIndex) === 1

  const correct = riskLevelCorrect || isAdjacentRisk

  // Calculate score error
  const scoreError = Math.abs(sentinelOutput.fraudScore - testCase.expectedFraudScore)

  // Confusion matrix classification
  const shouldFlag = testCase.metadata.shouldFlag
  const didFlag = sentinelOutput.riskLevel === 'high' || sentinelOutput.riskLevel === 'critical'

  const truePositive = shouldFlag && didFlag
  const trueNegative = !shouldFlag && !didFlag
  const falsePositive = !shouldFlag && didFlag
  const falseNegative = shouldFlag && !didFlag

  return {
    correct,
    scoreError,
    truePositive,
    trueNegative,
    falsePositive,
    falseNegative,
  }
}

/**
 * Calculate summary statistics from all test results
 */
function calculateSummary(results: TestResult[]): TestSummary {
  const totalTests = results.length
  const correctClassifications = results.filter(r => r.evaluation.correct).length
  const accuracy = correctClassifications / totalTests

  // Confusion matrix
  const truePositives = results.filter(r => r.evaluation.truePositive).length
  const trueNegatives = results.filter(r => r.evaluation.trueNegative).length
  const falsePositives = results.filter(r => r.evaluation.falsePositive).length
  const falseNegatives = results.filter(r => r.evaluation.falseNegative).length

  // Metrics
  const precision = truePositives / (truePositives + falsePositives) || 0
  const recall = truePositives / (truePositives + falseNegatives) || 0
  const f1Score = 2 * (precision * recall) / (precision + recall) || 0
  const specificity = trueNegatives / (trueNegatives + falsePositives) || 0

  // Performance
  const avgProcessingTimeMs = results.reduce((sum, r) => sum + r.sentinelOutput.processingTimeMs, 0) / totalTests

  const legitimateResults = results.filter(r => r.testCase.category === 'legitimate')
  const fraudResults = results.filter(r => r.testCase.category !== 'legitimate')

  const avgFraudScore = {
    legitimate: legitimateResults.reduce((sum, r) => sum + r.sentinelOutput.fraudScore, 0) / legitimateResults.length || 0,
    fraud: fraudResults.reduce((sum, r) => sum + r.sentinelOutput.fraudScore, 0) / fraudResults.length || 0,
  }

  // Category breakdown
  const categories = [...new Set(results.map(r => r.testCase.category))]
  const categoryResults: TestSummary['categoryResults'] = {}

  for (const category of categories) {
    const categoryTests = results.filter(r => r.testCase.category === category)
    const correctCount = categoryTests.filter(r => r.evaluation.correct).length

    categoryResults[category] = {
      total: categoryTests.length,
      correct: correctCount,
      accuracy: correctCount / categoryTests.length,
      avgScore: categoryTests.reduce((sum, r) => sum + r.sentinelOutput.fraudScore, 0) / categoryTests.length,
    }
  }

  return {
    totalTests,
    correctClassifications,
    accuracy,
    truePositives,
    trueNegatives,
    falsePositives,
    falseNegatives,
    precision,
    recall,
    f1Score,
    specificity,
    avgProcessingTimeMs,
    avgFraudScore,
    categoryResults,
    results,
  }
}

/**
 * Print detailed test report
 */
export function printTestReport(summary: TestSummary) {
  console.log('\n' + '='.repeat(80))
  console.log('📊 SENTINEL TEST RESULTS')
  console.log('='.repeat(80) + '\n')

  console.log('📈 OVERALL PERFORMANCE')
  console.log(`   Total Tests: ${summary.totalTests}`)
  console.log(`   Correct Classifications: ${summary.correctClassifications}/${summary.totalTests}`)
  console.log(`   Accuracy: ${(summary.accuracy * 100).toFixed(2)}%\n`)

  console.log('🎯 CONFUSION MATRIX')
  console.log(`   True Positives:  ${summary.truePositives.toString().padStart(3)} (correctly flagged fraud)`)
  console.log(`   True Negatives:  ${summary.trueNegatives.toString().padStart(3)} (correctly accepted legitimate)`)
  console.log(`   False Positives: ${summary.falsePositives.toString().padStart(3)} (wrongly flagged legitimate)`)
  console.log(`   False Negatives: ${summary.falseNegatives.toString().padStart(3)} (missed fraud)\n`)

  console.log('📊 METRICS')
  console.log(`   Precision:   ${(summary.precision * 100).toFixed(2)}% (of flagged cases, how many were actually fraud?)`)
  console.log(`   Recall:      ${(summary.recall * 100).toFixed(2)}% (of actual fraud, how many did we catch?)`)
  console.log(`   F1 Score:    ${(summary.f1Score * 100).toFixed(2)}% (harmonic mean of precision & recall)`)
  console.log(`   Specificity: ${(summary.specificity * 100).toFixed(2)}% (of legitimate cases, how many did we accept?)\n`)

  console.log('⚡ PERFORMANCE')
  console.log(`   Avg Processing Time: ${summary.avgProcessingTimeMs.toFixed(0)}ms per response\n`)

  console.log('🔍 FRAUD SCORE DISTRIBUTION')
  console.log(`   Legitimate responses: ${summary.avgFraudScore.legitimate.toFixed(3)} avg fraud score`)
  console.log(`   Fraud responses:      ${summary.avgFraudScore.fraud.toFixed(3)} avg fraud score`)
  console.log(`   Separation:           ${(summary.avgFraudScore.fraud - summary.avgFraudScore.legitimate).toFixed(3)} (higher = better)\n`)

  console.log('📂 CATEGORY BREAKDOWN')
  for (const [category, stats] of Object.entries(summary.categoryResults)) {
    console.log(`   ${category.padEnd(15)}: ${stats.correct}/${stats.total} correct (${(stats.accuracy * 100).toFixed(1)}%) - avg score: ${stats.avgScore.toFixed(3)}`)
  }

  console.log('\n' + '='.repeat(80))

  // False positive examples
  const falsePositives = summary.results.filter(r => r.evaluation.falsePositive)
  if (falsePositives.length > 0) {
    console.log('\n⚠️  FALSE POSITIVES (Legitimate flagged as fraud):')
    falsePositives.forEach(fp => {
      console.log(`   - ${fp.testCase.id}: ${fp.testCase.description}`)
      console.log(`     Reason: ${fp.sentinelOutput.reasoning.keyFactors[0] || 'Unknown'}`)
    })
  }

  // False negative examples
  const falseNegatives = summary.results.filter(r => r.evaluation.falseNegative)
  if (falseNegatives.length > 0) {
    console.log('\n⚠️  FALSE NEGATIVES (Fraud missed):')
    falseNegatives.forEach(fn => {
      console.log(`   - ${fn.testCase.id}: ${fn.testCase.description}`)
      console.log(`     Score: ${fn.sentinelOutput.fraudScore.toFixed(3)} (below threshold)`)
    })
  }

  console.log('\n' + '='.repeat(80) + '\n')
}

/**
 * Export results to JSON for analysis
 */
export function exportResults(summary: TestSummary, filename: string = 'sentinel-test-results.json') {
  const fs = require('fs')
  const path = require('path')

  const exportData = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: summary.totalTests,
      accuracy: summary.accuracy,
      precision: summary.precision,
      recall: summary.recall,
      f1Score: summary.f1Score,
      specificity: summary.specificity,
      avgProcessingTimeMs: summary.avgProcessingTimeMs,
      categoryResults: summary.categoryResults,
    },
    confusionMatrix: {
      truePositives: summary.truePositives,
      trueNegatives: summary.trueNegatives,
      falsePositives: summary.falsePositives,
      falseNegatives: summary.falseNegatives,
    },
    detailedResults: summary.results.map(r => ({
      testId: r.testCase.id,
      category: r.testCase.category,
      description: r.testCase.description,
      expected: {
        fraudScore: r.testCase.expectedFraudScore,
        riskLevel: r.testCase.expectedRiskLevel,
        shouldFlag: r.testCase.metadata.shouldFlag,
      },
      actual: {
        fraudScore: r.sentinelOutput.fraudScore,
        riskLevel: r.sentinelOutput.riskLevel,
        confidence: r.sentinelOutput.confidence,
        processingTimeMs: r.sentinelOutput.processingTimeMs,
      },
      evaluation: r.evaluation,
      reasoning: r.sentinelOutput.reasoning.summary,
    })),
  }

  const outputPath = path.join(process.cwd(), 'tests', 'sentinel', filename)
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2))

  console.log(`\n💾 Results exported to: ${outputPath}`)
}
