import { supabase } from '@/lib/supabase'
import { cache, CacheKeys } from '@/lib/cache/strategies'

export async function getSurveyWithComponents(surveyId: string, includeAnalytics = false) {
  return await cache.cacheWithInvalidation(
    CacheKeys.SURVEY(surveyId),
    () =>
      (async () => {
        const { data } = await supabase.from('surveys').select('*').eq('id', surveyId).single()
        if (!data) return null
        const survey: any = {
          id: data.id,
          title: data.title,
          description: data.description,
          generatedComponents: data.generated_components,
          designTheme: data.design_theme,
          validationRules: data.validation_rules,
          status: data.status,
          createdAt: data.created_at,
          creator: { id: data.creator_id, name: null },
          _count: { responses: 0 },
        }
        return survey
      })(),
    3600,
    [`survey:${surveyId}`],
  )
}

export async function getCommunityFeed(userId: string, limit = 20, offset = 0) {
  const cacheKey = `${CacheKeys.COMMUNITY_FEED(userId)}:${offset}:${limit}`
  return await cache.cacheWithInvalidation(
    cacheKey,
    async () => {
      const { data: resp } = await supabase.from('survey_responses').select('survey_id').eq('respondent_id', userId)
      const excludedIds = (resp || []).map((r: any) => r.survey_id)
      const { data } = await supabase
        .from('surveys')
        .select('id, title, description, created_at')
        .eq('is_public', true)
        .eq('status', 'ACTIVE')
        .not('id', 'in', `(${excludedIds.join(',') || 'NULL'})`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)
      return data || []
    },
    300,
    [`user:${userId}`, 'community:feed'],
  )
}

export async function getSurveyAnalyticsSummary(surveyId: string, days = 30) {
  const cacheKey = `${CacheKeys.ANALYTICS(surveyId)}:${days}`
  return await cache.cacheWithInvalidation(
    cacheKey,
    async () => {
      const startDate = new Date(); startDate.setDate(startDate.getDate() - days)
      const { data } = await supabase
        .from('survey_responses')
        .select('completed_at, started_at, is_flagged, fraud_score')
        .eq('survey_id', surveyId)
        .gte('completed_at', startDate.toISOString())
      return data || []
    },
    1800,
    [`analytics:${surveyId}`],
  )
}

