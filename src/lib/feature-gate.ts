import { getUserCredits, PLAN_CONFIG, PlanType } from './credits';
import { supabaseAdmin } from './supabase-server';

export type Feature =
  | 'premiumModels'
  | 'agentMode'
  | 'evaluation'
  | 'cipherFull'
  | 'cipherBasic'
  | 'brandingRemoval'
  | 'allExports'
  | 'customDomain';

export type RateLimitedFeature =
  | 'surveyGeneration'
  | 'dashboardChat'
  | 'agentMode'
  | 'cipher'
  | 'evaluation'
  | 'chartGeneration';

interface FeatureCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: PlanType;
}

interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt?: string;
  reason?: string;
}

/**
 * Check if a feature is available for a user's plan
 */
export async function checkFeature(
  userId: string,
  feature: Feature
): Promise<FeatureCheckResult> {
  const userCredits = await getUserCredits(userId);
  const plan = userCredits?.plan ?? 'free';

  // Special handling for cipher - free users get limited access
  if (feature === 'cipherBasic') {
    return { allowed: true }; // Basic cipher is available to all
  }

  const planConfig = PLAN_CONFIG[plan];

  // Map feature to plan config
  const featureKey = feature as keyof typeof planConfig.features;
  const isAllowed = planConfig.features[featureKey] ?? false;

  if (isAllowed) {
    return { allowed: true };
  }

  // Determine which plan is needed
  let upgradeRequired: PlanType = 'pro';
  if (feature === 'cipherFull' || feature === 'customDomain') {
    upgradeRequired = 'max';
  }

  return {
    allowed: false,
    reason: `This feature requires ${upgradeRequired.charAt(0).toUpperCase() + upgradeRequired.slice(1)} plan or higher`,
    upgradeRequired,
  };
}

/**
 * Check rate limit for a feature
 */
export async function checkRateLimit(
  userId: string,
  feature: RateLimitedFeature
): Promise<RateLimitCheckResult> {
  const userCredits = await getUserCredits(userId);
  const plan = userCredits?.plan ?? 'free';
  const planConfig = PLAN_CONFIG[plan];
  const limits = planConfig.rateLimits[feature];

  // Check if feature is disabled (limit = 0)
  if ('daily' in limits && limits.daily === 0) {
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      reason: `${feature} is not available on your plan`,
    };
  }

  // Unlimited
  if (('daily' in limits && limits.daily === null) ||
      ('monthly' in limits && limits.monthly === null) ||
      ('hourly' in limits && limits.hourly === null)) {
    return {
      allowed: true,
      remaining: -1,
      limit: -1,
    };
  }

  // Get usage count for the period
  const now = new Date();
  let periodStart: Date;
  let limit: number;
  let periodType: string;

  if ('hourly' in limits && limits.hourly !== null && limits.hourly !== undefined) {
    periodStart = new Date(now.getTime() - 60 * 60 * 1000);
    limit = limits.hourly;
    periodType = 'hourly';
  } else if ('daily' in limits && limits.daily !== null && limits.daily !== undefined) {
    periodStart = new Date(now);
    periodStart.setHours(0, 0, 0, 0);
    limit = limits.daily;
    periodType = 'daily';
  } else if ('monthly' in limits && limits.monthly !== null && limits.monthly !== undefined) {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    limit = limits.monthly;
    periodType = 'monthly';
  } else {
    return { allowed: true, remaining: -1, limit: -1 };
  }

  // Map feature to credit actions
  const actionPrefix = getActionPrefix(feature);

  const { count } = await supabaseAdmin
    .from('credit_usage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', periodStart.toISOString())
    .like('action', `${actionPrefix}%`);

  const used = count ?? 0;
  const remaining = Math.max(0, limit - used);

  if (remaining === 0) {
    return {
      allowed: false,
      remaining: 0,
      limit,
      reason: `You've reached your ${periodType} limit for ${feature}`,
    };
  }

  return {
    allowed: true,
    remaining,
    limit,
  };
}

function getActionPrefix(feature: RateLimitedFeature): string {
  switch (feature) {
    case 'surveyGeneration':
      return 'survey_';
    case 'dashboardChat':
      return 'chat_';
    case 'agentMode':
      return 'agent_';
    case 'cipher':
      return 'cipher_';
    case 'evaluation':
      return 'evaluation_';
    case 'chartGeneration':
      return 'chart';
    default:
      return feature;
  }
}

/**
 * Combined check for feature access and rate limits
 */
export async function canUseFeature(
  userId: string,
  feature: Feature,
  rateLimitFeature?: RateLimitedFeature
): Promise<{
  allowed: boolean;
  featureCheck: FeatureCheckResult;
  rateLimitCheck?: RateLimitCheckResult;
}> {
  const featureCheck = await checkFeature(userId, feature);

  if (!featureCheck.allowed) {
    return {
      allowed: false,
      featureCheck,
    };
  }

  if (rateLimitFeature) {
    const rateLimitCheck = await checkRateLimit(userId, rateLimitFeature);
    return {
      allowed: rateLimitCheck.allowed,
      featureCheck,
      rateLimitCheck,
    };
  }

  return {
    allowed: true,
    featureCheck,
  };
}
