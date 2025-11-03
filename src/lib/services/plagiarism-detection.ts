/**
 * Plagiarism Detection Service
 *
 * Checks survey responses against web content using Google Custom Search API
 * to detect copied text
 */

export interface PlagiarismResult {
  isPlagiarized: boolean
  plagiarismScore: number // 0-1
  matches: PlagiarismMatch[]
  confidence: number
  checkedTexts: number
}

export interface PlagiarismMatch {
  questionId: string
  sourceUrl: string
  sourceTitle: string
  matchedText: string
  similarity: number // 0-1
  snippet: string
}

/**
 * Check responses for plagiarism using Google Custom Search
 */
export async function checkPlagiarism(
  responses: Record<string, any>,
  options?: {
    apiKey?: string
    searchEngineId?: string
    minTextLength?: number
    maxChecks?: number
  }
): Promise<PlagiarismResult> {
  const apiKey = options?.apiKey || process.env.GOOGLE_SEARCH_API_KEY
  const searchEngineId = options?.searchEngineId || process.env.GOOGLE_SEARCH_ENGINE_ID
  const minTextLength = options?.minTextLength || 50
  const maxChecks = options?.maxChecks || 5 // Limit to avoid quota exhaustion

  if (!apiKey || !searchEngineId) {
    console.warn('Google Search API credentials not configured')
    return {
      isPlagiarized: false,
      plagiarismScore: 0,
      matches: [],
      confidence: 0,
      checkedTexts: 0,
    }
  }

  const matches: PlagiarismMatch[] = []
  const textResponses = Object.entries(responses)
    .filter(([_, answer]) => typeof answer === 'string' && answer.length >= minTextLength)
    .slice(0, maxChecks) // Limit number of checks

  let checkedCount = 0

  for (const [questionId, answer] of textResponses) {
    const text = answer as string

    try {
      const searchMatches = await searchForText(text, apiKey, searchEngineId)

      if (searchMatches.length > 0) {
        matches.push(...searchMatches.map(match => ({
          ...match,
          questionId,
        })))
      }

      checkedCount++

      // Delay to avoid rate limiting
      await delay(500)
    } catch (error) {
      console.error('Plagiarism check error for question', questionId, error)
    }
  }

  // Calculate overall plagiarism score
  const plagiarismScore = matches.length > 0
    ? matches.reduce((sum, m) => sum + m.similarity, 0) / textResponses.length
    : 0

  return {
    isPlagiarized: plagiarismScore > 0.6,
    plagiarismScore,
    matches,
    confidence: checkedCount / textResponses.length,
    checkedTexts: checkedCount,
  }
}

/**
 * Search for text using Google Custom Search API
 */
async function searchForText(
  text: string,
  apiKey: string,
  searchEngineId: string
): Promise<Omit<PlagiarismMatch, 'questionId'>[]> {
  // Extract meaningful phrases from the text
  const searchQuery = extractSearchQuery(text)

  const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(searchQuery)}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Google Search API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return []
    }

    const matches: Omit<PlagiarismMatch, 'questionId'>[] = []

    // Check each search result
    for (const item of data.items.slice(0, 5)) {
      const snippet = item.snippet || ''
      const similarity = calculateTextSimilarity(text, snippet)

      if (similarity > 0.5) { // 50% similarity threshold
        matches.push({
          sourceUrl: item.link,
          sourceTitle: item.title,
          matchedText: text,
          similarity,
          snippet,
        })
      }
    }

    return matches
  } catch (error) {
    console.error('Google Search API error:', error)
    return []
  }
}

/**
 * Extract meaningful search query from text
 */
function extractSearchQuery(text: string): string {
  // Remove common words and extract key phrases
  const words = text.split(/\s+/)

  // Take first 10-15 words as search query (Google has query length limits)
  const query = words.slice(0, 12).join(' ')

  // Add quotes for exact phrase matching
  return `"${query}"`
}

/**
 * Calculate similarity between two texts
 */
function calculateTextSimilarity(text1: string, text2: string): number {
  // Normalize texts
  const normalize = (str: string) => str.toLowerCase().replace(/[^\w\s]/g, '').trim()

  const normalized1 = normalize(text1)
  const normalized2 = normalize(text2)

  // Check for exact substring match
  if (normalized2.includes(normalized1) || normalized1.includes(normalized2)) {
    return 1.0
  }

  // Calculate word overlap
  const words1 = new Set(normalized1.split(/\s+/))
  const words2 = new Set(normalized2.split(/\s+/))

  const intersection = new Set([...words1].filter(word => words2.has(word)))
  const union = new Set([...words1, ...words2])

  // Jaccard similarity
  const jaccard = intersection.size / union.size

  // Check for sequential word matches (n-grams)
  const trigrams1 = getTrigrams(normalized1)
  const trigrams2 = getTrigrams(normalized2)

  const trigramIntersection = new Set([...trigrams1].filter(tg => trigrams2.has(tg)))
  const trigramUnion = new Set([...trigrams1, ...trigrams2])

  const trigramSimilarity = trigramIntersection.size / Math.max(trigramUnion.size, 1)

  // Combine both metrics (weighted average)
  return (jaccard * 0.4) + (trigramSimilarity * 0.6)
}

/**
 * Get trigrams (3-word sequences) from text
 */
function getTrigrams(text: string): Set<string> {
  const words = text.split(/\s+/)
  const trigrams = new Set<string>()

  for (let i = 0; i < words.length - 2; i++) {
    const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
    trigrams.add(trigram)
  }

  return trigrams
}

/**
 * Delay helper
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Quick plagiarism check using direct text matching (no API)
 */
export function quickPlagiarismCheck(
  responses: Record<string, any>
): {
  suspiciousDuplicates: boolean
  duplicateCount: number
  identicalResponses: string[][]
} {
  const textResponses: [string, string][] = Object.entries(responses)
    .filter(([_, answer]) => typeof answer === 'string' && answer.length > 20)
    .map(([qId, answer]) => [qId, answer as string])

  const identicalResponses: string[][] = []
  let duplicateCount = 0

  // Check for identical responses to different questions
  for (let i = 0; i < textResponses.length; i++) {
    for (let j = i + 1; j < textResponses.length; j++) {
      const [qId1, text1] = textResponses[i]
      const [qId2, text2] = textResponses[j]

      if (text1 === text2) {
        identicalResponses.push([qId1, qId2])
        duplicateCount++
      }
    }
  }

  return {
    suspiciousDuplicates: duplicateCount > 0,
    duplicateCount,
    identicalResponses,
  }
}

/**
 * Check for copied text across multiple survey submissions
 */
export async function checkCrossSubmissionPlagiarism(
  currentResponses: Record<string, any>,
  previousResponses: Array<Record<string, any>>
): Promise<{
  hasCopiedFromPrevious: boolean
  copiedCount: number
  matches: Array<{
    questionId: string
    submissionIndex: number
    similarity: number
  }>
}> {
  const matches: Array<{
    questionId: string
    submissionIndex: number
    similarity: number
  }> = []

  const currentTexts = Object.entries(currentResponses)
    .filter(([_, answer]) => typeof answer === 'string' && answer.length > 20)

  for (const [questionId, currentAnswer] of currentTexts) {
    const currentText = currentAnswer as string

    previousResponses.forEach((prevResponse, index) => {
      const prevAnswer = prevResponse[questionId]

      if (typeof prevAnswer === 'string' && prevAnswer.length > 20) {
        const similarity = calculateTextSimilarity(currentText, prevAnswer)

        if (similarity > 0.8) { // 80% similarity = likely copied
          matches.push({
            questionId,
            submissionIndex: index,
            similarity,
          })
        }
      }
    })
  }

  return {
    hasCopiedFromPrevious: matches.length > 0,
    copiedCount: matches.length,
    matches,
  }
}

/**
 * Detect if text appears to be from a common source (e.g., sample answers, templates)
 */
export function detectTemplateResponses(
  responses: Record<string, any>
): {
  isTemplate: boolean
  templateIndicators: string[]
  confidence: number
} {
  const indicators: string[] = []
  const textResponses = Object.values(responses).filter(r => typeof r === 'string')

  // Common template phrases
  const templatePhrases = [
    '[insert', '[your answer', '[write here', 'lorem ipsum',
    'sample answer', 'example response', 'placeholder text',
    'todo:', 'tbd', 'n/a', 'not applicable',
  ]

  let indicatorCount = 0

  textResponses.forEach(text => {
    const lower = (text as string).toLowerCase()

    templatePhrases.forEach(phrase => {
      if (lower.includes(phrase)) {
        indicators.push(`Contains template phrase: "${phrase}"`)
        indicatorCount++
      }
    })

    // Check for brackets with capitals (common in templates)
    if (/\[A-Z\w+\]/.test(text as string)) {
      indicators.push('Contains template placeholders')
      indicatorCount++
    }
  })

  const confidence = Math.min(indicatorCount / Math.max(textResponses.length, 1), 1)

  return {
    isTemplate: confidence > 0.3,
    templateIndicators: indicators,
    confidence,
  }
}
