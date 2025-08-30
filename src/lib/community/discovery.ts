import { supabase } from '@/lib/supabase'

interface Preferences {
  categories?: string[]
  timeCommitment?: 'short' | 'medium' | 'long'
  creditRange?: { min: number; max: number }
}

export async function findMatchingSurveys(userId: string, preferences?: Preferences) {
  const { data: resp } = await supabase.from('survey_responses').select('survey_id').eq('respondent_id', userId)
  const respondedIds = (resp || []).map((r: any) => r.survey_id)
  const { data: available } = await supabase
    .from('surveys')
    .select('id, title, description, created_at, metadata, target_responses, is_public')
    .eq('is_public', true)
    .eq('status', 'ACTIVE')

  const scored = available.map((s: any) => {
    let score = 0
    const days = (Date.now() - new Date(s.createdAt).getTime()) / (24 * 60 * 60 * 1000)
    score += Math.max(0, 10 - days)
    const ratio = (s._count?.responses || 0) / (s.targetResponses || 100)
    score += (1 - ratio) * 5
    // preference hooks (category, time commitment) via metadata
    const category = (s.metadata as any)?.category
    if (preferences?.categories?.length && category && preferences.categories.includes(category)) score += 2
    return { ...s, matchScore: score }
  })

  return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 20)
}

