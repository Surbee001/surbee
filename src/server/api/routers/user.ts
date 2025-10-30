import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { distributeMonthlyCredits, updateUserCredits } from '@/lib/user/credits'
import { supabase } from '@/lib/supabase'

export const userRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await supabase.from('users').select('*').eq('id', ctx.session!.user.id).single()
    return data
  }),
  credits: protectedProcedure.query(async ({ ctx }) => {
    const { data } = await supabase.from('users').select('credits').eq('id', ctx.session!.user.id).single()
    return data?.credits ?? 0
  }),
  award: protectedProcedure
    .input(z.object({ amount: z.number().int().min(1), reason: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session!.user.id
      await updateUserCredits(userId, 'EARNED_QUALITY_BONUS', input.amount, { reason: input.reason })
      const { data } = await supabase.from('users').select('credits').eq('id', userId).single()
      return { credits: data?.credits ?? 0 }
    }),
  distributeMonthly: protectedProcedure.mutation(async () => {
    await distributeMonthlyCredits()
    return { ok: true }
  }),
  getOrCreateReferral: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session!.user.id
    const { data: me } = await supabase.from('users').select('id, referral_code').eq('id', userId).single()
    if (!me) throw new Error('User not found')
    if (!me.referral_code) {
      const code = `SRB-${userId.slice(0, 4)}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      await supabase.from('users').update({ referral_code: code }).eq('id', userId)
      return { code }
    }
    return { code: me.referral_code }
  }),
  redeemReferral: protectedProcedure
    .input(z.object({ code: z.string().min(4) }))
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session!.user.id
      const { data: me } = await supabase.from('users').select('*').eq('id', userId).single()
      if (!me) throw new Error('User not found')
      if (me.referral_redeemed) return { ok: false, message: 'Already redeemed' }
      const { data: referrer } = await supabase.from('users').select('id').eq('referral_code', input.code).maybeSingle()
      if (!referrer) return { ok: false, message: 'Invalid code' }
      if (referrer.id === userId) return { ok: false, message: 'Cannot redeem your own code' }
      await supabase.from('users').update({ referred_by_id: referrer.id, referral_redeemed: true }).eq('id', userId)
      await updateUserCredits(userId, 'EARNED_REFERRAL', 5, { referrerId: referrer.id })
      await updateUserCredits(referrer.id, 'EARNED_REFERRAL', 5, { referredId: userId })
      const { data: updated } = await supabase.from('users').select('credits').eq('id', userId).single()
      return { ok: true, credits: updated?.credits ?? 0 }
    }),
})

