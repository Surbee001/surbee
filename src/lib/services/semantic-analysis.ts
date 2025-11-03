/**
 * Semantic Analysis Service
 *
 * Detects contradictions, inconsistencies, and logical flaws in survey responses
 * using AI reasoning models
 */

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

export interface ContradictionAnalysis {
  hasContradictions: boolean
  contradictions: Contradiction[]
  consistencyScore: number // 0-1 (higher = more consistent)
  confidence: number
  reasoning: string
}

export interface Contradiction {
  questionIds: string[]
  type: 'factual' | 'logical' | 'temporal' | 'demographic' | 'preference'
  description: string
  severity: 'low' | 'medium' | 'high'
  evidence: string[]
}

export interface QualityAnalysis {
  responseQuality: number // 0-1
  effortLevel: 'minimal' | 'low' | 'medium' | 'high'
  relevanceScore: number // 0-1 (how relevant answers are to questions)
  detailLevel: 'sparse' | 'adequate' | 'detailed' | 'excessive'
  issues: string[]
  strengths: string[]
}

/**
 * Detect contradictions across survey responses
 */
export async function detectContradictions(
  responses: Record<string, any>,
  questions: Record<string, string>,
  options?: {
    provider?: 'openai' | 'anthropic'
    model?: string
  }
): Promise<ContradictionAnalysis> {
  const prompt = buildContradictionPrompt(responses, questions)

  try {
    // Choose model provider
    const provider = options?.provider || 'openai'
    let modelInstance

    if (provider === 'anthropic') {
      modelInstance = anthropic('claude-haiku-4-5-20251001')
    } else {
      const modelName = options?.model || 'gpt-4o'
      modelInstance = openai(modelName)
    }

    const { text } = await generateText({
      model: modelInstance,
      prompt,
      maxTokens: 3000,
    })

    return parseContradictionResult(text)
  } catch (error) {
    console.error('Contradiction detection error:', error)
    return performBasicContradictionCheck(responses, questions)
  }
}

/**
 * Build prompt for contradiction detection
 */
function buildContradictionPrompt(
  responses: Record<string, any>,
  questions: Record<string, string>
): string {
  const qaList = Object.entries(responses)
    .map(([qId, answer]) => {
      const question = questions[qId] || qId
      return `[${qId}] Q: ${question}\n     A: ${JSON.stringify(answer)}`
    })
    .join('\n\n')

  return `You are an expert logical reasoning system. Analyze these survey responses for contradictions and inconsistencies.

SURVEY Q&A:
${qaList}

---

ANALYSIS TASK:

Identify ALL contradictions across these responses. A contradiction occurs when:

1. **Factual Contradictions**: Respondent states incompatible facts
   - Example: Says they're 25 in Q1 but worked in the field for 30 years in Q5
   - Example: Says they've never used product X but describes using it in detail

2. **Logical Contradictions**: Mutually exclusive conditions stated as true
   - Example: Says they strongly agree AND strongly disagree with the same concept
   - Example: Selected incompatible options in related questions

3. **Temporal Contradictions**: Timeline impossibilities
   - Example: Started job after it ended
   - Example: Events in wrong chronological order

4. **Demographic Contradictions**: Incompatible demographic information
   - Example: Says "I'm a student" in Q2 but "I've been retired for 10 years" in Q8
   - Example: Lives in incompatible locations simultaneously

5. **Preference Contradictions**: Contradictory preferences or opinions
   - Example: Says they hate coffee but prefer dark roast coffee
   - Example: Says they never exercise but gym is their favorite hobby

**IMPORTANT DISTINCTION:**
- Complexity or nuance in responses is NOT a contradiction
- Changing one's mind or having mixed feelings is human and normal
- Only flag clear, unambiguous contradictions that cannot logically coexist

**SEVERITY LEVELS:**
- **HIGH**: Impossible to both be true (e.g., age contradictions, factual impossibilities)
- **MEDIUM**: Very unlikely but theoretically possible (e.g., preference flips, timeline issues)
- **LOW**: Potentially explainable inconsistencies (e.g., rounding differences, ambiguous phrasing)

---

OUTPUT FORMAT (JSON):

\`\`\`json
{
  "hasContradictions": boolean,
  "contradictions": [
    {
      "questionIds": ["q1", "q5"],
      "type": "factual" | "logical" | "temporal" | "demographic" | "preference",
      "description": "Clear description of the contradiction",
      "severity": "low" | "medium" | "high",
      "evidence": ["Quote from Q1", "Quote from Q5"]
    }
  ],
  "consistencyScore": number (0-1, where 1 = perfectly consistent),
  "confidence": number (0-1, your confidence in this analysis),
  "reasoning": "COMPREHENSIVE DETAILED ANALYSIS (minimum 150 words):

1. WHAT THE RESPONDENT DID: Describe the respondent's answer patterns across all questions. Highlight any inconsistent or contradictory statements with specific examples.

2. IDENTIFIED CONTRADICTIONS: For each contradiction found, explain:
   - What two or more statements contradict each other (with direct quotes)
   - Why these statements cannot logically coexist
   - Whether this appears to be intentional deception, carelessness, or misunderstanding

3. CONSISTENCY PATTERNS: Analyze the overall consistency of the responses. Are there patterns in the inconsistencies? Do they suggest random answering, multiple people taking the survey, or genuine confusion?

4. SEVERITY JUSTIFICATION: Explain why each contradiction received its severity rating (low/medium/high). What makes some contradictions more serious than others?

5. POTENTIAL EXPLANATIONS: Consider legitimate reasons for the inconsistencies (e.g., question ambiguity, respondent changed their mind, misread questions) and explain why they were accepted or ruled out.

6. FLAGGING DECISIONS: Explain why you chose NOT to flag certain potential contradictions, demonstrating your reasoning process.

This detailed analysis helps human reviewers understand your thought process and make final decisions."
}
\`\`\`

Analyze thoroughly. Be precise. Only flag real contradictions.`
}

/**
 * Parse contradiction analysis result
 */
function parseContradictionResult(text: string): ContradictionAnalysis {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    const jsonText = jsonMatch ? jsonMatch[1] : text
    const parsed = JSON.parse(jsonText)

    return {
      hasContradictions: parsed.hasContradictions || false,
      contradictions: (parsed.contradictions || []).map((c: any) => ({
        questionIds: c.questionIds || [],
        type: c.type || 'logical',
        description: c.description || '',
        severity: c.severity || 'medium',
        evidence: c.evidence || [],
      })),
      consistencyScore: clamp(parsed.consistencyScore ?? 0.5, 0, 1),
      confidence: clamp(parsed.confidence ?? 0.5, 0, 1),
      reasoning: parsed.reasoning || 'No reasoning provided',
    }
  } catch (error) {
    console.error('Failed to parse contradiction result:', error)
    return {
      hasContradictions: false,
      contradictions: [],
      consistencyScore: 0.5,
      confidence: 0,
      reasoning: 'Failed to parse AI response',
    }
  }
}

/**
 * Fallback basic contradiction check
 */
function performBasicContradictionCheck(
  responses: Record<string, any>,
  _questions: Record<string, string>
): ContradictionAnalysis {
  const contradictions: Contradiction[] = []

  // Very basic checks
  const values = Object.values(responses)

  // Check for identical answers to all questions (suspicious)
  if (values.length > 5 && values.every(v => v === values[0])) {
    contradictions.push({
      questionIds: Object.keys(responses),
      type: 'logical',
      description: 'All questions answered identically',
      severity: 'medium',
      evidence: ['All responses are identical'],
    })
  }

  return {
    hasContradictions: contradictions.length > 0,
    contradictions,
    consistencyScore: contradictions.length > 0 ? 0.3 : 0.7,
    confidence: 0.4, // Low confidence for basic checks
    reasoning: 'Basic heuristic check (AI API unavailable)',
  }
}

/**
 * Analyze response quality and effort level
 */
export async function analyzeResponseQuality(
  responses: Record<string, any>,
  questions: Record<string, string>,
  timeSpent?: Record<string, number>
): Promise<QualityAnalysis> {
  const prompt = buildQualityPrompt(responses, questions, timeSpent)

  try {
    const { text } = await generateText({
      model: openai('gpt-4o'), // Use standard model for quality checks
      prompt,
      maxTokens: 2000,
    })

    return parseQualityResult(text)
  } catch (error) {
    console.error('Quality analysis error:', error)
    return performBasicQualityCheck(responses, questions)
  }
}

/**
 * Build quality analysis prompt
 */
function buildQualityPrompt(
  responses: Record<string, any>,
  questions: Record<string, string>,
  timeSpent?: Record<string, number>
): string {
  const qaList = Object.entries(responses)
    .map(([qId, answer]) => {
      const question = questions[qId] || qId
      const time = timeSpent?.[qId] ? ` [${Math.round(timeSpent[qId] / 1000)}s]` : ''
      return `Q: ${question}${time}\nA: ${JSON.stringify(answer)}`
    })
    .join('\n\n')

  return `Analyze the quality of these survey responses.

${qaList}

Evaluate:
1. **Response Quality** (0-1): Overall quality of answers
2. **Effort Level**: minimal/low/medium/high - how much effort did respondent put in?
3. **Relevance** (0-1): Do answers actually address the questions?
4. **Detail Level**: sparse/adequate/detailed/excessive
5. **Issues**: Problems with the responses
6. **Strengths**: Good aspects of the responses

Respond with JSON:
\`\`\`json
{
  "responseQuality": number,
  "effortLevel": "minimal" | "low" | "medium" | "high",
  "relevanceScore": number,
  "detailLevel": "sparse" | "adequate" | "detailed" | "excessive",
  "issues": ["issue1", "issue2"],
  "strengths": ["strength1", "strength2"]
}
\`\`\``
}

/**
 * Parse quality analysis result
 */
function parseQualityResult(text: string): QualityAnalysis {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    const jsonText = jsonMatch ? jsonMatch[1] : text
    const parsed = JSON.parse(jsonText)

    return {
      responseQuality: clamp(parsed.responseQuality ?? 0.5, 0, 1),
      effortLevel: parsed.effortLevel || 'medium',
      relevanceScore: clamp(parsed.relevanceScore ?? 0.5, 0, 1),
      detailLevel: parsed.detailLevel || 'adequate',
      issues: parsed.issues || [],
      strengths: parsed.strengths || [],
    }
  } catch (error) {
    console.error('Failed to parse quality result:', error)
    return {
      responseQuality: 0.5,
      effortLevel: 'medium',
      relevanceScore: 0.5,
      detailLevel: 'adequate',
      issues: ['Failed to analyze'],
      strengths: [],
    }
  }
}

/**
 * Fallback basic quality check
 */
function performBasicQualityCheck(
  responses: Record<string, any>,
  _questions: Record<string, string>
): QualityAnalysis {
  const textResponses = Object.values(responses).filter(r => typeof r === 'string')
  const avgLength = textResponses.reduce((sum, r) => sum + r.length, 0) / Math.max(textResponses.length, 1)

  let effortLevel: 'minimal' | 'low' | 'medium' | 'high' = 'medium'
  if (avgLength < 10) effortLevel = 'minimal'
  else if (avgLength < 30) effortLevel = 'low'
  else if (avgLength > 100) effortLevel = 'high'

  const detailLevel = avgLength < 20 ? 'sparse' : avgLength < 80 ? 'adequate' : 'detailed'

  return {
    responseQuality: avgLength > 50 ? 0.7 : 0.4,
    effortLevel,
    relevanceScore: 0.5,
    detailLevel,
    issues: avgLength < 10 ? ['Very short responses'] : [],
    strengths: avgLength > 50 ? ['Detailed responses'] : [],
  }
}

/**
 * Detect if answer quality matches time spent
 */
export function detectQualityTimeMismatch(
  quality: QualityAnalysis,
  avgTimePerQuestion: number
): {
  hasMismatch: boolean
  mismatchType: 'too-fast' | 'too-slow' | 'none'
  suspicionScore: number
  explanation: string
} {
  // High quality + fast time = suspicious (likely pre-written or AI)
  if (quality.responseQuality > 0.7 && avgTimePerQuestion < 5000) {
    return {
      hasMismatch: true,
      mismatchType: 'too-fast',
      suspicionScore: 0.7,
      explanation: 'High-quality responses completed too quickly',
    }
  }

  // Low quality + slow time = potentially suspicious (struggling or distracted)
  if (quality.responseQuality < 0.3 && avgTimePerQuestion > 30000) {
    return {
      hasMismatch: true,
      mismatchType: 'too-slow',
      suspicionScore: 0.4,
      explanation: 'Low-quality responses despite long time spent',
    }
  }

  return {
    hasMismatch: false,
    mismatchType: 'none',
    suspicionScore: 0,
    explanation: 'Time spent matches response quality',
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
