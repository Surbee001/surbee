import { Pinecone } from '@pinecone-database/pinecone'
import { getOpenAI, chooseModel } from './model-router'

const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY || '' })

interface DesignPattern {
  prompt: string
  context?: any
  designConfig: any
  components: any[]
  userId: string
  performance?: { completionRate: number; avgTime: number; userSatisfaction: number }
}

export async function storeDesignPattern(pattern: DesignPattern) {
  const openai = getOpenAI()
  const embedModel = chooseModel('embed').model
  const embedding = await openai.embeddings.create({ model: embedModel, input: `${pattern.prompt} ${JSON.stringify(pattern.context)}` })
  const index = pinecone.index(process.env.PINECONE_INDEX || 'survey-patterns')
  await index.upsert([
    {
      id: `pattern-${Date.now()}-${pattern.userId}`,
      values: embedding.data[0].embedding,
      metadata: {
        prompt: pattern.prompt,
        context: JSON.stringify(pattern.context || {}),
        designConfig: JSON.stringify(pattern.designConfig),
        components: JSON.stringify(pattern.components),
        userId: pattern.userId,
        createdAt: new Date().toISOString(),
      },
    } as any,
  ])
}

export async function findSimilarPatterns(prompt: string, context?: any, limit = 5) {
  const openai = getOpenAI()
  const embedModel = chooseModel('embed').model
  const embedding = await openai.embeddings.create({ model: embedModel, input: `${prompt} ${JSON.stringify(context)}` })
  const index = pinecone.index(process.env.PINECONE_INDEX || 'survey-patterns')
  const results = await index.query({ vector: embedding.data[0].embedding, topK: limit, includeMetadata: true })
  return (results.matches || []).map((match: any) => ({
    score: match.score,
    pattern: {
      prompt: match.metadata?.prompt,
      context: safeParse(match.metadata?.context),
      designConfig: safeParse(match.metadata?.designConfig),
      components: safeParse(match.metadata?.components),
    },
  }))
}

function safeParse(s: any) {
  try { return JSON.parse(s as string) } catch { return null }
}

