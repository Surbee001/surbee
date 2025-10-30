import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { findMatchingSurveys } from '@/lib/community/discovery'
import { supabase } from '@/lib/supabase'

export const communityRouter = createTRPCRouter({
  leaderboard: publicProcedure
    .query(async ({ ctx }) => {
      const { data } = await supabase
        .from('users')
        .select('id, name, credits')
        .order('credits', { ascending: false })
        .limit(10)
      return data || []
    }),
  matches: protectedProcedure
    .input(z.object({ preferences: z.object({ categories: z.array(z.string()).optional(), timeCommitment: z.enum(['short','medium','long']).optional(), creditRange: z.object({ min: z.number(), max: z.number() }).optional() }).optional() }))
    .query(async ({ input, ctx }) => {
      const results = await findMatchingSurveys(ctx.session!.user.id, input.preferences)
      return results
    }),
})

