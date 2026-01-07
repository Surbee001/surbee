import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-server';

// Normalize legacy plan names
const LEGACY_PLAN_MAP: Record<string, string> = {
  'free': 'free_user',
  'pro': 'surbee_pro',
  'max': 'surbee_max',
  'enterprise': 'surbee_enterprise',
};

// Helper to get user from auth header (Bearer token)
async function getUserFromRequest(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get or create user subscription
  let { data: subscription, error } = await supabaseAdmin
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If no subscription exists, create a free one
  if (!subscription || error?.code === 'PGRST116') {
    const { data: newSubscription, error: createError } = await supabaseAdmin
      .from('user_subscriptions')
      .insert({
        user_id: user.id,
        plan: 'free_user',
        status: 'active',
        credits_remaining: 100,
        monthly_credits: 100,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating subscription:', createError);
      // Return default free plan if creation fails
      return NextResponse.json({
        subscription: {
          plan: 'free_user',
          status: 'active',
        }
      });
    }

    subscription = newSubscription;
  }

  // Normalize plan name for consistency
  const rawPlan = subscription.plan || 'free_user';
  const normalizedPlan = LEGACY_PLAN_MAP[rawPlan] || rawPlan;

  return NextResponse.json({
    subscription: {
      plan: normalizedPlan,
      status: subscription.status,
      billingCycle: subscription.billing_cycle,
      currentPeriodEnd: subscription.current_period_end,
    }
  });
}
