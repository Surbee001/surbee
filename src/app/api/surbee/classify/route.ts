import { NextRequest, NextResponse } from 'next/server'

type Classification = {
  isSurveyLike: boolean
  reason: string
  confidence: number // 0..1
}

const SURVEY_KEYWORDS = [
  'survey',
  'questionnaire',
  'form',
  'quiz',
  'poll',
  'research',
  'feedback',
  'questions',
  'rating',
  'scale',
  'likert',
  'respondent',
  'response',
  'validation',
  'branching',
  'skip logic',
]

const NON_SURVEY_KEYWORDS = [
  'landing page',
  'portfolio',
  'blog',
  'dashboard',
  'ecommerce',
  'shop',
  'game',
  'marketing site',
  'website',
  'homepage',
]

function heuristicClassify(input: string): Classification {
  const text = input.toLowerCase()
  let score = 0

  for (const k of SURVEY_KEYWORDS) if (text.includes(k)) score += 1
  for (const k of NON_SURVEY_KEYWORDS) if (text.includes(k)) score -= 1

  // Boost if phrasing requests a survey-like artifact
  if (/create|build|make/.test(text) && /(survey|form|quiz|poll)/.test(text)) score += 1.5

  const isSurveyLike = score >= 1
  const confidence = Math.max(0, Math.min(1, 0.5 + score / 6))
  return {
    isSurveyLike,
    confidence,
    reason: isSurveyLike
      ? 'Detected survey-related intent via heuristics'
      : 'Looks like a general website or non-survey request',
  }
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ ok: false, message: 'Missing prompt' }, { status: 400 })
    }

    // 1) Heuristic fast-path
    const heuristics = heuristicClassify(prompt)
    if (heuristics.confidence >= 0.75) {
      return NextResponse.json({ ok: true, source: 'heuristic', ...heuristics })
    }

    // 2) Lightweight model fallback (DeepSeek) if available
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (apiKey) {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2500) // hard cap ~2.5s
      try {
        const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            max_tokens: 60,
            temperature: 0,
            messages: [
              {
                role: 'system',
                content:
                  'Classify the user request. Respond ONLY with JSON like {"isSurveyLike":true|false,"confidence":0..1,"reason":"short"}. Survey-like means: survey, form, questionnaire, quiz, poll, feedback collection. If it is a general website request, isSurveyLike should be false.',
              },
              { role: 'user', content: prompt },
            ],
          }),
          signal: controller.signal,
        })

        clearTimeout(timeout)
        if (res.ok) {
          const data = await res.json()
          const content: string = data?.choices?.[0]?.message?.content || '{}'
          try {
            const parsed = JSON.parse(content)
            return NextResponse.json({ ok: true, source: 'model', ...parsed })
          } catch {
            // fall through to heuristics
          }
        }
      } catch {
        // timeout or API error -> fall back
      }
    }

    // 3) Fallback to heuristics if model unavailable or failed
    return NextResponse.json({ ok: true, source: 'heuristic', ...heuristics })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || 'Internal error' },
      { status: 500 },
    )
  }
}



