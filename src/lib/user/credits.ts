import { supabase } from '@/lib/supabase'

export type CreditAction = 'EARNED_MONTHLY' | 'EARNED_RESPONSE' | 'EARNED_QUALITY_BONUS' | 'SPENT_GENERATION' | 'SPENT_PREMIUM_FEATURE' | 'EARNED_REFERRAL'

export async function updateUserCredits(
  userId: string,
  action: CreditAction,
  amount: number,
  metadata?: any,
) {
  // Fetch current credits and update deterministically (consider implementing a Supabase RPC for atomic increment)
  const { data: userRow } = await supabase.from('users').select('credits').eq('id', userId).single()
  const newCredits = (userRow?.credits || 0) + amount
  await supabase.from('users').update({ credits: newCredits }).eq('id', userId)

  await supabase
    .from('credit_logs')
    .insert({ user_id: userId, action, amount, description: getCreditDescription(action, metadata), metadata })
  if (Math.abs(amount) >= 10) {
    await sendCreditNotification(userId, action, amount)
  }
}

export function calculateCreditReward(fraudScore: number): number {
  let credits = 2
  if (fraudScore < 0.1) credits += 2
  else if (fraudScore < 0.3) credits += 1
  return Math.min(credits, 5)
}

export async function distributeMonthlyCredits() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  const { data: users } = await supabase.from('users').select('id, created_at').lt('created_at', cutoff)
  for (const u of users || []) {
    await updateUserCredits(u.id, 'EARNED_MONTHLY', 5, { month: new Date().getMonth() + 1, year: new Date().getFullYear() })
  }
}

function getCreditDescription(action: CreditAction, metadata?: any) {
  switch (action) {
    case 'SPENT_GENERATION': return 'Survey generation'
    case 'EARNED_RESPONSE': return 'Survey completion reward'
    case 'EARNED_MONTHLY': return 'Monthly credits'
    case 'EARNED_QUALITY_BONUS': return 'Quality bonus'
    case 'EARNED_REFERRAL': return 'Referral reward'
    case 'SPENT_PREMIUM_FEATURE': return 'Premium feature usage'
    default: return 'Credit transaction'
  }
}

async function sendCreditNotification(userId: string, action: CreditAction, amount: number) {
  // Stub for email/push notifications
  return true
}

