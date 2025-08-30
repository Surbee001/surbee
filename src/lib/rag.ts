import OpenAI from 'openai'
import { supabase } from '@/lib/supabase'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type RagChunk = {
  id?: string
  project_id: string
  user_id?: string
  source?: string
  path?: string
  content: string
  metadata?: Record<string, any>
}

export async function upsertChunks(chunks: RagChunk[]) {
  if (!chunks?.length) return { count: 0 }
  const rows = [] as any[]
  for (const ch of chunks) {
    const embedding = await embedText(ch.content)
    rows.push({
      id: ch.id,
      project_id: ch.project_id,
      user_id: ch.user_id || null,
      source: ch.source || null,
      path: ch.path || null,
      content: ch.content,
      embedding,
      metadata: ch.metadata || {},
      created_at: new Date().toISOString(),
    })
  }
  const { error } = await supabase.from('rag_chunks').upsert(rows)
  if (error) throw new Error(error.message)
  return { count: rows.length }
}

export async function searchProjectContext(projectId: string, query: string, topK = 8) {
  const qvec = await embedText(query)
  const { data, error } = await supabase
    .from('rag_chunks')
    .select('id, content, embedding, source, path, metadata')
    .eq('project_id', projectId)
    .limit(1000)
  if (error) throw new Error(error.message)
  const scored = (data || []).map((r: any) => ({
    id: r.id,
    source: r.source,
    path: r.path,
    content: r.content,
    metadata: r.metadata,
    score: cosineSim(qvec, r.embedding || [])
  }))
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, topK)
}

export function packContext(results: { content: string; source?: string; path?: string }[], capChars = 32000) {
  const lines: string[] = []
  let used = 0
  for (const r of results) {
    const header = `# Source: ${r.source || 'note'} ${r.path ? `(${r.path})` : ''}`.trim()
    const chunk = `${header}\n${r.content.trim()}\n\n`
    if (used + chunk.length > capChars) break
    lines.push(chunk)
    used += chunk.length
  }
  return lines.join('')
}

async function embedText(text: string): Promise<number[]> {
  const { data } = await openai.embeddings.create({ model: process.env.OPENAI_EMBEDDINGS_MODEL || 'text-embedding-3-large', input: text })
  return data[0]?.embedding || []
}

function cosineSim(a: number[], b: number[]) {
  const n = Math.min(a.length, b.length)
  let dot = 0, na = 0, nb = 0
  for (let i = 0; i < n; i++) { dot += a[i] * b[i]; na += a[i]*a[i]; nb += b[i]*b[i] }
  const d = Math.sqrt(na) * Math.sqrt(nb)
  return d ? dot / d : 0
}

