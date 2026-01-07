import { supabaseAdmin } from './supabase-server';

// Credit costs for different actions
export const CREDIT_COSTS = {
  // Dashboard Chat
  'chat_haiku': 3,
  'chat_gpt5': 10,
  'chat_lema': 5,

  // Survey Generation
  'survey_simple': 20,    // 1-5 questions
  'survey_medium': 35,    // 6-15 questions
  'survey_complex': 50,   // 16+ questions

  // Agent Mode
  'agent_quick': 25,
  'agent_standard': 60,
  'agent_complex': 120,

  // Cipher
  'cipher_basic': 10,
  'cipher_full': 20,
  'cipher_realtime': 30,

  // Evaluation
  'evaluation_single': 20,
  'evaluation_multi': 35,

  // Chart
  'chart': 10,
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;

// Plan types - synced with Clerk billing plans
export type PlanType = 'free_user' | 'surbee_pro' | 'surbee_max' | 'surbee_enterprise';

// Legacy plan mapping for backwards compatibility
export const LEGACY_PLAN_MAP: Record<string, PlanType> = {
  'free': 'free_user',
  'pro': 'surbee_pro',
  'max': 'surbee_max',
  'enterprise': 'surbee_enterprise',
};

// Plan configurations
export const PLAN_CONFIG = {
  free_user: {
    monthlyCredits: 100,
    apiCredits: 0,
    features: {
      premiumModels: false,
      agentMode: false,
      evaluation: false,
      cipherFull: false,
      brandingRemoval: false,
      allExports: false,
      customDomain: false,
    },
    rateLimits: {
      surveyGeneration: { daily: 2 },
      dashboardChat: { hourly: 15 },
      agentMode: { daily: 0 },
      cipher: { monthly: 2 },
      evaluation: { daily: 0 },
      chartGeneration: { monthly: 2 },
    },
  },
  surbee_pro: {
    monthlyCredits: 2000,
    apiCredits: 5.00,
    features: {
      premiumModels: true,
      agentMode: true,
      evaluation: true,
      cipherFull: false,
      brandingRemoval: true,
      allExports: true,
      customDomain: false,
    },
    rateLimits: {
      surveyGeneration: { daily: 15 },
      dashboardChat: { hourly: 100 },
      agentMode: { daily: 20 },
      cipher: { daily: 10 },
      evaluation: { daily: 15 },
      chartGeneration: { daily: null }, // unlimited
    },
  },
  surbee_max: {
    monthlyCredits: 6000,
    apiCredits: 10.00,
    features: {
      premiumModels: true,
      agentMode: true,
      evaluation: true,
      cipherFull: true,
      brandingRemoval: true,
      allExports: true,
      customDomain: true,
    },
    rateLimits: {
      surveyGeneration: { daily: 50 },
      dashboardChat: { hourly: 300 },
      agentMode: { daily: 80 },
      cipher: { daily: 40 },
      evaluation: { daily: 60 },
      chartGeneration: { daily: null }, // unlimited
    },
  },
  surbee_enterprise: {
    monthlyCredits: -1, // unlimited
    apiCredits: -1, // custom
    features: {
      premiumModels: true,
      agentMode: true,
      evaluation: true,
      cipherFull: true,
      brandingRemoval: true,
      allExports: true,
      customDomain: true,
    },
    rateLimits: {
      surveyGeneration: { daily: null },
      dashboardChat: { hourly: null },
      agentMode: { daily: null },
      cipher: { daily: null },
      evaluation: { daily: null },
      chartGeneration: { daily: null },
    },
  },
} as const;

export interface CreditCheckResult {
  allowed: boolean;
  remaining: number;
  required: number;
  error?: string;
}

export interface DeductResult {
  success: boolean;
  remaining: number;
  error?: string;
}

export interface UserCredits {
  creditsRemaining: number;
  monthlyCredits: number;
  apiCreditsRemaining: number;
  apiCreditsMonthly: number;
  creditsResetAt: string;
  plan: PlanType;
}

/**
 * Get user's current credit balance and plan info
 */
export async function getUserCredits(userId: string): Promise<UserCredits | null> {
  const { data, error } = await supabaseAdmin
    .from('user_subscriptions')
    .select('credits_remaining, monthly_credits, api_credits_remaining, api_credits_monthly, credits_reset_at, plan')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // Return default free tier if no subscription found
    return {
      creditsRemaining: 100,
      monthlyCredits: 100,
      apiCreditsRemaining: 0,
      apiCreditsMonthly: 0,
      creditsResetAt: new Date().toISOString(),
      plan: 'free_user',
    };
  }

  // Normalize plan to new format
  const rawPlan = data.plan || 'free_user';
  const plan = LEGACY_PLAN_MAP[rawPlan] || (rawPlan as PlanType);

  return {
    creditsRemaining: data.credits_remaining ?? 100,
    monthlyCredits: data.monthly_credits ?? 100,
    apiCreditsRemaining: data.api_credits_remaining ?? 0,
    apiCreditsMonthly: data.api_credits_monthly ?? 0,
    creditsResetAt: data.credits_reset_at ?? new Date().toISOString(),
    plan,
  };
}

/**
 * Check if user has enough credits for an action
 */
export async function checkCredits(
  userId: string,
  action: CreditAction
): Promise<CreditCheckResult> {
  const cost = CREDIT_COSTS[action];
  const userCredits = await getUserCredits(userId);

  if (!userCredits) {
    return {
      allowed: false,
      remaining: 0,
      required: cost,
      error: 'Could not fetch user credits',
    };
  }

  // Enterprise has unlimited credits
  if (userCredits.plan === 'surbee_enterprise') {
    return {
      allowed: true,
      remaining: -1,
      required: cost,
    };
  }

  const hasEnough = userCredits.creditsRemaining >= cost;

  return {
    allowed: hasEnough,
    remaining: userCredits.creditsRemaining,
    required: cost,
    error: hasEnough ? undefined : 'Insufficient credits',
  };
}

/**
 * Deduct credits from user's balance
 */
export async function deductCredits(
  userId: string,
  action: CreditAction,
  metadata?: Record<string, unknown>
): Promise<DeductResult> {
  const cost = CREDIT_COSTS[action];
  const userCredits = await getUserCredits(userId);

  if (!userCredits) {
    return {
      success: false,
      remaining: 0,
      error: 'Could not fetch user credits',
    };
  }

  // Enterprise has unlimited credits - just log usage
  if (userCredits.plan === 'surbee_enterprise') {
    await logCreditUsage(userId, action, cost, metadata);
    return {
      success: true,
      remaining: -1,
    };
  }

  if (userCredits.creditsRemaining < cost) {
    return {
      success: false,
      remaining: userCredits.creditsRemaining,
      error: 'Insufficient credits',
    };
  }

  const newBalance = userCredits.creditsRemaining - cost;

  // Update balance
  const { error: updateError } = await supabaseAdmin
    .from('user_subscriptions')
    .update({ credits_remaining: newBalance })
    .eq('user_id', userId);

  if (updateError) {
    console.error('Error updating credits:', updateError);
    return {
      success: false,
      remaining: userCredits.creditsRemaining,
      error: 'Failed to update credits',
    };
  }

  // Log usage
  await logCreditUsage(userId, action, cost, metadata);

  return {
    success: true,
    remaining: newBalance,
  };
}

/**
 * Log credit usage for analytics
 */
async function logCreditUsage(
  userId: string,
  action: CreditAction,
  creditsUsed: number,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabaseAdmin.from('credit_usage').insert({
      user_id: userId,
      action,
      credits_used: creditsUsed,
      metadata: metadata ?? {},
    });
  } catch (error) {
    console.error('Error logging credit usage:', error);
  }
}

/**
 * Check if a feature is available for a user's plan
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof typeof PLAN_CONFIG.free.features
): Promise<boolean> {
  const userCredits = await getUserCredits(userId);
  if (!userCredits) return false;

  const planConfig = PLAN_CONFIG[userCredits.plan];
  return planConfig.features[feature] ?? false;
}

/**
 * Get usage stats for the current billing period
 */
export async function getUsageStats(userId: string): Promise<{
  totalUsed: number;
  byAction: Record<string, number>;
  history: Array<{ action: string; credits: number; date: string }>;
}> {
  const userCredits = await getUserCredits(userId);
  if (!userCredits) {
    return { totalUsed: 0, byAction: {}, history: [] };
  }

  // Get usage since last reset
  const { data: usage } = await supabaseAdmin
    .from('credit_usage')
    .select('action, credits_used, created_at')
    .eq('user_id', userId)
    .gte('created_at', userCredits.creditsResetAt)
    .order('created_at', { ascending: false });

  if (!usage) {
    return { totalUsed: 0, byAction: {}, history: [] };
  }

  const byAction: Record<string, number> = {};
  let totalUsed = 0;

  for (const entry of usage) {
    totalUsed += entry.credits_used;
    byAction[entry.action] = (byAction[entry.action] || 0) + entry.credits_used;
  }

  return {
    totalUsed,
    byAction,
    history: usage.map((u) => ({
      action: u.action,
      credits: u.credits_used,
      date: u.created_at,
    })),
  };
}

/**
 * Reset credits for a user (called by cron job)
 */
export async function resetCreditsForPlan(
  userId: string,
  plan: PlanType
): Promise<void> {
  const planConfig = PLAN_CONFIG[plan];

  await supabaseAdmin
    .from('user_subscriptions')
    .update({
      credits_remaining: planConfig.monthlyCredits,
      api_credits_remaining: planConfig.apiCredits,
      credits_reset_at: new Date().toISOString(),
    })
    .eq('user_id', userId);
}

/**
 * Determine survey generation complexity based on question count
 */
export function getSurveyComplexity(questionCount: number): CreditAction {
  if (questionCount <= 5) return 'survey_simple';
  if (questionCount <= 15) return 'survey_medium';
  return 'survey_complex';
}

/**
 * Determine agent operation complexity based on step count
 */
export function getAgentComplexity(stepCount: number): CreditAction {
  if (stepCount <= 2) return 'agent_quick';
  if (stepCount <= 5) return 'agent_standard';
  return 'agent_complex';
}

/**
 * Get chat model credit action
 */
export function getChatModelAction(model: string): CreditAction {
  if (model.includes('gpt-5') || model.includes('gpt5')) return 'chat_gpt5';
  if (model.includes('lema')) return 'chat_lema';
  return 'chat_haiku';
}
