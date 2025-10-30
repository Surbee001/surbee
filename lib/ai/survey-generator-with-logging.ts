import crypto from 'crypto'
import { axiomLogger } from '@/lib/logging/axiom-client'
import { generateSurveyComponents as originalGenerate } from './survey-generator'
import { getCachedComponents, cacheGeneratedComponents } from '@/lib/optimization/component-cache'

interface GenerationContext {
  prompt: string
  context?: { surveyType?: string; targetAudience?: string; industry?: string }
  userId: string
}

export async function generateSurveyComponents({ prompt, context, userId }: GenerationContext) {
  const start = Date.now()
  const promptHash = crypto.createHash('md5').update(`${prompt}:${JSON.stringify(context || {})}`).digest('hex')
  try {
    const cached = await getCachedComponents<any>(promptHash)
    if (cached) {
      await axiomLogger.logAIGeneration({ userId, prompt: '', promptHash, model: 'cache', generationType: 'survey', duration: Date.now() - start, success: true, cacheHit: true })
      return cached
    }
    const result = await originalGenerate({ prompt, context, userId })
    await axiomLogger.logAIGeneration({ userId, prompt: '', promptHash, model: 'gpt-4o', generationType: 'survey', duration: Date.now() - start, success: true, tokensUsed: (result as any).metadata?.tokensUsed, cost: (result as any).metadata?.cost, cacheHit: false })
    await cacheGeneratedComponents(promptHash, result)
    return result
  } catch (error: any) {
    await axiomLogger.logAIGeneration({ userId, prompt: '', promptHash, model: 'gpt-4o', generationType: 'survey', duration: Date.now() - start, success: false, error: error?.message, cacheHit: false })
    throw error
  }
}

