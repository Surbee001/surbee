import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function upsertDesignPatternEmbedding(id: string, text: string) {
  const vector = await embedText(text)
  await supabase.from('pattern_embeddings').upsert({ id, content: text, embedding: vector, created_at: new Date().toISOString() })
}

export async function searchDesignPatterns(query: string, topK = 5) {
  const vector = await embedText(query)
  const { data } = await supabase.from('pattern_embeddings').select('id, content, embedding')
  const scored = (data || []).map((r: any) => ({ id: r.id, content: r.content, score: dot(vector, r.embedding || []) / (norm(vector) * norm(r.embedding || [])) || 0 }))
  return scored.sort((a, b) => b.score - a.score).slice(0, topK)
}

async function embedText(text: string): Promise<number[]> {
  const { data } = await openai.embeddings.create({ model: 'text-embedding-3-large', input: text })
  return data[0]?.embedding || []
}

function dot(a: number[], b: number[]) { const n = Math.min(a.length, b.length); let s = 0; for (let i = 0; i < n; i++) s += a[i] * b[i]; return s }
function norm(a: number[]) { return Math.sqrt(a.reduce((s, v) => s + v * v, 0)) || 1 }

