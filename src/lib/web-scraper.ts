/**
 * Universal Web Scraper
 * Works with any AI model - extracts content from URLs including JS-rendered pages
 */

export interface ScrapeResult {
  success: boolean
  content: string
  title?: string
  description?: string
  error?: string
  source: 'jina' | 'direct' | 'none'
}

/**
 * Scrape a URL and return its content as markdown
 * Uses Jina AI Reader for JS-rendered pages (free, no API key needed)
 */
export async function scrapeUrl(url: string): Promise<ScrapeResult> {
  // Try Jina AI Reader first - handles JavaScript-rendered pages
  const jinaResult = await scrapeWithJina(url)
  if (jinaResult.success) {
    return jinaResult
  }

  // Fallback to direct fetch for simple HTML pages
  const directResult = await scrapeDirectly(url)
  if (directResult.success) {
    return directResult
  }

  return {
    success: false,
    content: '',
    error: 'Could not fetch the page content. The page may require login or have restricted access.',
    source: 'none'
  }
}

/**
 * Scrape using Jina AI Reader API
 * Free service that handles JavaScript-rendered pages and returns clean markdown
 * Docs: https://jina.ai/reader
 */
async function scrapeWithJina(url: string): Promise<ScrapeResult> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`

    const response = await fetch(jinaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/markdown',
        'X-Return-Format': 'markdown',
        // Optional: Add timeout handling
        'X-Timeout': '30',
      },
    })

    if (!response.ok) {
      console.error('Jina Reader error:', response.status, response.statusText)
      return {
        success: false,
        content: '',
        error: `Jina Reader returned ${response.status}`,
        source: 'jina'
      }
    }

    const content = await response.text()

    // Check if we got meaningful content
    if (!content || content.length < 50) {
      return {
        success: false,
        content: '',
        error: 'Page returned empty or minimal content',
        source: 'jina'
      }
    }

    // Extract title from the first heading if present
    const titleMatch = content.match(/^#\s+(.+)$/m)
    const title = titleMatch ? titleMatch[1].trim() : undefined

    // Extract description from first paragraph
    const descMatch = content.match(/^(?!#)(.{50,300})/m)
    const description = descMatch ? descMatch[1].trim() : undefined

    return {
      success: true,
      content,
      title,
      description,
      source: 'jina'
    }
  } catch (error) {
    console.error('Jina scrape error:', error)
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'jina'
    }
  }
}

/**
 * Direct HTML fetch for simple static pages
 * Won't work for JS-rendered content but good as fallback
 */
async function scrapeDirectly(url: string): Promise<ScrapeResult> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SurbeeBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    })

    if (!response.ok) {
      return {
        success: false,
        content: '',
        error: `Direct fetch returned ${response.status}`,
        source: 'direct'
      }
    }

    const html = await response.text()

    // Basic HTML to text conversion
    const content = htmlToText(html)

    if (!content || content.length < 50) {
      return {
        success: false,
        content: '',
        error: 'Page returned empty content',
        source: 'direct'
      }
    }

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : undefined

    // Extract meta description
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    const description = descMatch ? descMatch[1].trim() : undefined

    return {
      success: true,
      content,
      title,
      description,
      source: 'direct'
    }
  } catch (error) {
    console.error('Direct scrape error:', error)
    return {
      success: false,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'direct'
    }
  }
}

/**
 * Basic HTML to text conversion
 */
function htmlToText(html: string): string {
  return html
    // Remove script and style tags with content
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, '')
    // Convert headers to markdown
    .replace(/<h1[^>]*>([^<]*)<\/h1>/gi, '# $1\n')
    .replace(/<h2[^>]*>([^<]*)<\/h2>/gi, '## $1\n')
    .replace(/<h3[^>]*>([^<]*)<\/h3>/gi, '### $1\n')
    // Convert paragraphs and divs to newlines
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Convert list items
    .replace(/<li[^>]*>/gi, '- ')
    .replace(/<\/li>/gi, '\n')
    // Remove remaining HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Clean up whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

/**
 * Extract survey-specific content from scraped markdown
 * Useful for detecting questions, options, etc.
 */
export function extractSurveyContent(content: string): {
  questions: string[]
  hasOptions: boolean
  estimatedQuestionCount: number
} {
  // Look for question patterns
  const questionPatterns = [
    /^\d+[\.\)]\s*.+\?/gm,           // "1. What is...?"
    /^[\*\-]\s*.+\?/gm,              // "- What is...?"
    /^Q\d+[\.:]\s*.+/gim,            // "Q1: What..."
    /^\*\*.+\?\*\*/gm,               // "**What is...?**"
    /^.{10,100}\?$/gm,               // Any line ending with ?
  ]

  const questions: string[] = []
  for (const pattern of questionPatterns) {
    const matches = content.match(pattern)
    if (matches) {
      questions.push(...matches)
    }
  }

  // Deduplicate
  const uniqueQuestions = [...new Set(questions)]

  // Check for options (multiple choice indicators)
  const hasOptions = /^\s*[\[\(]?\s*[a-dA-D1-4]\s*[\]\)]?\s*[\.:\)]\s*.+/m.test(content) ||
                     /^\s*[○●◯◉]\s*.+/m.test(content) ||
                     /^\s*\*\s+[^*].+/m.test(content)

  return {
    questions: uniqueQuestions.slice(0, 50), // Limit to 50
    hasOptions,
    estimatedQuestionCount: uniqueQuestions.length
  }
}
