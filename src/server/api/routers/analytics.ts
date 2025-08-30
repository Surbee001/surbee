import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { supabase } from '@/lib/supabase'

export const analyticsRouter = createTRPCRouter({
  surveyStats: publicProcedure
    .input(z.object({ surveyId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { data } = await supabase.from('survey_analytics').select('*').eq('survey_id', input.surveyId).limit(1).single()
      return data || null
    }),
})

