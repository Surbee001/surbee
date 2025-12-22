import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase-server';

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
        plan: 'free',
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating subscription:', createError);
      // Return default free plan if creation fails
      return NextResponse.json({
        subscription: {
          plan: 'free',
          status: 'active',
        }
      });
    }

    subscription = newSubscription;
  }

  return NextResponse.json({
    subscription: {
      plan: subscription.plan,
      status: subscription.status,
      billingCycle: subscription.billing_cycle,
      currentPeriodEnd: subscription.current_period_end,
    }
  });
}
