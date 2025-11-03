/**
 * AI Text Detection Service
 *
 * Uses OpenAI's reasoning models (o1/o3) via Vercel AI SDK to detect:
 * - AI-generated content (ChatGPT, Claude, Gemini, etc.)
 * - Plagiarism and copied content
 * - Contradictions and inconsistencies
 * - Low-effort responses
 * - Semantic anomalies
 */

import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'

export interface AITextAnalysisResult {
  // Overall scores
  isAIGenerated: boolean
  aiProbability: number // 0-1
  isPlagiarized: boolean
  plagiarismProbability: number // 0-1
  hasContradictions: boolean
  isLowEffort: boolean

  // Detailed analysis
  detectedPatterns: string[]
  contradictions: string[]
  qualityScore: number // 0-1 (higher = better quality)
  humanLikeness: number // 0-1 (higher = more human-like)

  // Evidence
  evidence: {
    aiIndicators: string[]
    humanIndicators: string[]
    plagiarismIndicators: string[]
    contradictionDetails: string[]
  }

  // Overall assessment
  riskScore: number // 0-1 (combined fraud risk)
  confidence: number // 0-1 (confidence in assessment)
  reasoning: string // Detailed explanation from reasoning model
}

/**
 * Analyze survey responses using AI reasoning model
 */
export async function analyzeTextResponses(
  responses: Record<string, any>,
  questions: Record<string, string>,
  options?: {
    model?: string
    provider?: 'openai' | 'anthropic' // New: choose provider
    timeSpent?: Record<string, number> // Time spent per question
    pasteEvents?: number
    tabSwitches?: number
  }
): Promise<AITextAnalysisResult> {
  const modelName = options?.model || 'gpt-4o' // Default to gpt-4o for speed in tests
  const provider = options?.provider || 'openai'

  // Prepare the analysis prompt
  const prompt = buildAnalysisPrompt(responses, questions, options)

  try {
    // Choose the appropriate model provider
    let modelInstance
    if (provider === 'anthropic') {
      // Use Claude Haiku 4.5 for fast, cost-effective analysis
      modelInstance = anthropic('claude-haiku-4-5-20251001')
    } else {
      // Use OpenAI models
      modelInstance = openai(modelName)
    }

    const { text } = await generateText({
      model: modelInstance,
      prompt,
      maxTokens: 4000,
    })

    // Parse the reasoning model's response
    return parseAnalysisResult(text)
  } catch (error) {
    console.error('AI text analysis error:', error)

    // Fallback to heuristic analysis
    return performHeuristicAnalysis(responses, questions, options)
  }
}

/**
 * Build comprehensive analysis prompt for reasoning model
 */
function buildAnalysisPrompt(
  responses: Record<string, any>,
  questions: Record<string, string>,
  options?: {
    timeSpent?: Record<string, number>
    pasteEvents?: number
    tabSwitches?: number
  }
): string {
  const responseList = Object.entries(responses)
    .map(([qId, answer]) => {
      const question = questions[qId] || qId
      const timeSpent = options?.timeSpent?.[qId]
      const timeInfo = timeSpent ? ` (${Math.round(timeSpent / 1000)}s)` : ''
      return `Q: ${question}\nA: ${JSON.stringify(answer)}${timeInfo}`
    })
    .join('\n\n')

  const contextInfo = options ? `
BEHAVIORAL CONTEXT:
- Paste events: ${options.pasteEvents || 0}
- Tab switches: ${options.tabSwitches || 0}
- Average time per question: ${options.timeSpent ? Math.round(Object.values(options.timeSpent).reduce((a, b) => a + b, 0) / Object.values(options.timeSpent).length / 1000) : 'unknown'}s
` : ''

  return `You are an expert fraud detection system analyzing survey responses for authenticity. Your task is to determine if these responses show signs of:

1. **AI-Generated Content** - Text written by ChatGPT, Claude, Gemini, or other LLMs
2. **Plagiarism** - Content copied from the web or other sources
3. **Contradictions** - Logically inconsistent answers across questions
4. **Low-Effort Responses** - Minimal engagement, random answers, or spam

Use your reasoning capabilities to deeply analyze patterns, writing style, semantic coherence, and behavioral signals.

${contextInfo}

SURVEY RESPONSES:
${responseList}

---

ANALYSIS INSTRUCTIONS:

**Phase 1: AI-Generated Content Detection**

Analyze each text response for these AI signatures:
- Characteristic LLM phrases ("As an AI", "It's important to note", "Here's a comprehensive", "In conclusion")
- Perfect grammar with no natural errors or typos
- Overly formal or academic tone for casual questions
- Hedging language ("may", "might", "could potentially")
- Bullet-point or structured formatting where inappropriate
- Lack of personal anecdotes or specific details
- Generic responses that could apply to anything
- Consistent high-quality prose across all answers
- Use of transitional phrases common in AI text
- Absence of colloquialisms or casual language
- Uniform sentence structure and length
- Politically correct or overly balanced responses

**Phase 2: Plagiarism Detection**

Look for signs of copied content:
- Fragments that seem out of context
- Sudden tone or style shifts within an answer
- Overly polished text for simple questions
- Technical jargon or domain expertise inconsistent across answers
- Quote-like formatting or attribution language
- Answers that seem like encyclopedia entries
- Inconsistent perspective (1st person vs 3rd person)
- Text that reads like a blog post or article

**Phase 3: Contradiction Analysis**

Cross-reference answers for logical inconsistencies:
- Contradictory facts stated in different answers
- Incompatible preferences or opinions
- Timeline inconsistencies
- Demographic contradictions (age, location, experience level)
- Answers that contradict the question context
- Mutually exclusive choices selected

**Phase 4: Low-Effort Detection**

Identify minimal engagement:
- One-word answers to open-ended questions
- Generic filler responses ("good", "fine", "ok")
- Copy-pasted identical answers to different questions
- Irrelevant responses
- Random character strings
- Answers that don't address the question
- Pattern responses (all "5", all "Agree", etc.)

**Phase 5: Human-Likeness Assessment**

Look for authentic human indicators:
- Natural typos and grammatical imperfections
- Conversational tone and casual language
- Personal opinions stated directly
- Specific examples or anecdotes
- Emotional language or strong opinions
- Informal abbreviations ("idk", "tbh", "lol")
- Stream-of-consciousness writing
- Incomplete thoughts or run-on sentences
- Cultural or regional language patterns
- Varied response quality (some better than others)

**Phase 6: Behavioral Correlation**

Consider behavioral data:
- High paste count + perfect text = likely copied
- Fast response time + long text = likely pre-written or AI
- Tab switches + polished answers = external lookup
- No typing errors + perfect prose = automation

**Phase 7: Statistical Patterns**

Analyze aggregate patterns:
- Perplexity (text predictability)
- Burstiness (variation in sentence length)
- Lexical diversity (vocabulary richness)
- Sentiment consistency
- Formality consistency
- Complexity consistency

---

OUTPUT FORMAT:

Provide your analysis as a structured JSON response:

\`\`\`json
{
  "isAIGenerated": boolean,
  "aiProbability": number (0-1),
  "isPlagiarized": boolean,
  "plagiarismProbability": number (0-1),
  "hasContradictions": boolean,
  "isLowEffort": boolean,
  "detectedPatterns": ["pattern1", "pattern2"],
  "contradictions": ["contradiction1", "contradiction2"],
  "qualityScore": number (0-1),
  "humanLikeness": number (0-1),
  "evidence": {
    "aiIndicators": ["indicator1", "indicator2"],
    "humanIndicators": ["indicator1", "indicator2"],
    "plagiarismIndicators": ["indicator1", "indicator2"],
    "contradictionDetails": ["detail1", "detail2"]
  },
  "riskScore": number (0-1),
  "confidence": number (0-1),
  "reasoning": "COMPREHENSIVE DETAILED EXPLANATION (minimum 200 words):

1. WHAT THE RESPONDENT DID: Describe exactly what the respondent did in their survey responses. Include specific examples from their answers, behavioral patterns observed (paste events, timing, etc.), and any suspicious actions.

2. WHY THIS IS SUSPICIOUS/FRAUDULENT: Explain in detail why each identified pattern should be considered fraud. Connect specific evidence to fraud indicators (e.g., 'The phrase X is a common AI signature because...', 'The timing of Y seconds indicates automation because...').

3. SPECIFIC EVIDENCE: List each piece of evidence with direct quotes and examples from the responses. Explain how each piece of evidence contributes to the fraud assessment.

4. BEHAVIORAL ANALYSIS: Analyze the behavioral context (time spent, paste events, tab switches) and explain how it correlates with the text analysis.

5. SEVERITY ASSESSMENT: Explain why this case warrants the assigned risk score (0-1). What makes this case more or less severe than average?

6. ALTERNATIVE EXPLANATIONS: Consider non-fraudulent explanations and explain why they were ruled out or deemed less likely.

Be extremely detailed and specific. This explanation will be used by human reviewers to make final decisions."
}
\`\`\`

**CRITICAL INSTRUCTIONS:**

1. Be THOROUGH - Use your reasoning capabilities to deeply analyze every response
2. Cite SPECIFIC EXAMPLES - Reference actual text from responses in your reasoning
3. Consider CONTEXT - Short answers to simple questions are normal; long essays to "yes/no" questions are suspicious
4. Be PROBABILISTIC - Express uncertainty with probability scores, don't make absolute claims without strong evidence
5. Look for PATTERNS - Individual indicators are weak; clusters of indicators are strong
6. Consider BASERATES - Not all formal writing is AI; not all errors are human
7. Cross-validate - Use behavioral data to validate or contradict text analysis
8. Provide ACTIONABLE reasoning - Your reasoning should help humans understand and validate your assessment

Begin your analysis now. Think step-by-step through each phase, examining the responses carefully for subtle patterns and anomalies.`
}

/**
 * Parse the reasoning model's JSON response
 */
function parseAnalysisResult(text: string): AITextAnalysisResult {
  try {
    // Extract JSON from markdown code block if present
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/)
    const jsonText = jsonMatch ? jsonMatch[1] : text

    const parsed = JSON.parse(jsonText)

    return {
      isAIGenerated: parsed.isAIGenerated || false,
      aiProbability: clamp(parsed.aiProbability || 0, 0, 1),
      isPlagiarized: parsed.isPlagiarized || false,
      plagiarismProbability: clamp(parsed.plagiarismProbability || 0, 0, 1),
      hasContradictions: parsed.hasContradictions || false,
      isLowEffort: parsed.isLowEffort || false,
      detectedPatterns: parsed.detectedPatterns || [],
      contradictions: parsed.contradictions || [],
      qualityScore: clamp(parsed.qualityScore || 0.5, 0, 1),
      humanLikeness: clamp(parsed.humanLikeness || 0.5, 0, 1),
      evidence: {
        aiIndicators: parsed.evidence?.aiIndicators || [],
        humanIndicators: parsed.evidence?.humanIndicators || [],
        plagiarismIndicators: parsed.evidence?.plagiarismIndicators || [],
        contradictionDetails: parsed.evidence?.contradictionDetails || [],
      },
      riskScore: clamp(parsed.riskScore || 0, 0, 1),
      confidence: clamp(parsed.confidence || 0.5, 0, 1),
      reasoning: parsed.reasoning || 'No reasoning provided',
    }
  } catch (error) {
    console.error('Failed to parse AI analysis result:', error)
    console.error('Raw text:', text)

    // Return default result
    return {
      isAIGenerated: false,
      aiProbability: 0,
      isPlagiarized: false,
      plagiarismProbability: 0,
      hasContradictions: false,
      isLowEffort: false,
      detectedPatterns: [],
      contradictions: [],
      qualityScore: 0.5,
      humanLikeness: 0.5,
      evidence: {
        aiIndicators: [],
        humanIndicators: [],
        plagiarismIndicators: [],
        contradictionDetails: [],
      },
      riskScore: 0,
      confidence: 0,
      reasoning: 'Failed to parse AI response',
    }
  }
}

/**
 * Fallback heuristic analysis if AI call fails
 */
function performHeuristicAnalysis(
  responses: Record<string, any>,
  _questions: Record<string, string>,
  options?: {
    timeSpent?: Record<string, number>
    pasteEvents?: number
    tabSwitches?: number
  }
): AITextAnalysisResult {
  const textResponses = Object.values(responses).filter(r => typeof r === 'string' && r.length > 10)

  let aiIndicatorCount = 0
  let humanIndicatorCount = 0
  const aiIndicators: string[] = []
  const humanIndicators: string[] = []

  // Check for AI patterns
  const aiPhrases = [
    'as an ai', 'it\'s important to note', 'here\'s a comprehensive',
    'in conclusion', 'to summarize', 'it\'s worth noting',
    'from my perspective', 'in my opinion as', 'i would recommend',
  ]

  textResponses.forEach(text => {
    const lower = text.toLowerCase()

    // AI indicators
    if (aiPhrases.some(phrase => lower.includes(phrase))) {
      aiIndicatorCount++
      aiIndicators.push('Contains common AI phrases')
    }

    // Perfect grammar (no typos)
    if (text.length > 50 && !hasTypos(text)) {
      aiIndicatorCount++
      aiIndicators.push('Perfect grammar with no typos')
    }

    // Human indicators
    if (hasTypos(text)) {
      humanIndicatorCount++
      humanIndicators.push('Contains natural typos')
    }

    if (/\b(lol|lmao|tbh|idk|imo|ngl)\b/i.test(text)) {
      humanIndicatorCount++
      humanIndicators.push('Uses casual internet slang')
    }
  })

  const aiProbability = aiIndicatorCount / Math.max(textResponses.length, 1)
  const humanLikeness = humanIndicatorCount / Math.max(textResponses.length, 1)

  // Check for paste events correlation
  const pasteRisk = (options?.pasteEvents || 0) > 3 ? 0.4 : 0

  const riskScore = clamp((aiProbability * 0.5) + (pasteRisk * 0.5), 0, 1)

  return {
    isAIGenerated: aiProbability > 0.6,
    aiProbability,
    isPlagiarized: pasteRisk > 0.3,
    plagiarismProbability: pasteRisk,
    hasContradictions: false,
    isLowEffort: textResponses.length === 0,
    detectedPatterns: aiIndicators,
    contradictions: [],
    qualityScore: 0.5,
    humanLikeness,
    evidence: {
      aiIndicators,
      humanIndicators,
      plagiarismIndicators: pasteRisk > 0.3 ? ['Multiple paste events detected'] : [],
      contradictionDetails: [],
    },
    riskScore,
    confidence: 0.5, // Lower confidence for heuristics
    reasoning: 'Heuristic analysis (AI API unavailable): ' +
               `Found ${aiIndicatorCount} AI indicators and ${humanIndicatorCount} human indicators`,
  }
}

/**
 * Simple typo detection
 */
function hasTypos(text: string): boolean {
  // Common typos patterns
  const typoPatterns = [
    /\s{2,}/, // Multiple spaces
    /[a-z]{15,}/, // Very long words (likely typos)
    /([a-z])\1{2,}/, // Repeated letters (thhis, goood)
    /\b(teh|hte|adn|nad|taht|waht|recieve|occured)\b/i, // Common typos
  ]

  return typoPatterns.some(pattern => pattern.test(text))
}

/**
 * Clamp number between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Quick AI check for a single text response
 */
export async function quickAICheck(text: string): Promise<{
  isAIGenerated: boolean
  confidence: number
  indicators: string[]
}> {
  const prompt = `Analyze this text and determine if it was written by an AI (ChatGPT, Claude, etc.) or a human.

Text: "${text}"

Respond with JSON:
{
  "isAIGenerated": boolean,
  "confidence": number (0-1),
  "indicators": ["reason1", "reason2"]
}`

  try {
    const { text: response } = await generateText({
      model: openai('gpt-4o-mini'), // Use faster model for quick checks
      prompt,
      maxTokens: 500,
    })

    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/)
    const jsonText = jsonMatch ? jsonMatch[1] : response
    const parsed = JSON.parse(jsonText)

    return {
      isAIGenerated: parsed.isAIGenerated || false,
      confidence: clamp(parsed.confidence || 0.5, 0, 1),
      indicators: parsed.indicators || [],
    }
  } catch (error) {
    console.error('Quick AI check error:', error)

    // Fallback heuristic
    const aiPhrases = ['as an ai', 'it\'s important to note', 'here\'s a comprehensive']
    const hasAIPhrases = aiPhrases.some(phrase => text.toLowerCase().includes(phrase))

    return {
      isAIGenerated: hasAIPhrases,
      confidence: hasAIPhrases ? 0.7 : 0.3,
      indicators: hasAIPhrases ? ['Contains common AI phrases'] : ['No obvious AI patterns'],
    }
  }
}
