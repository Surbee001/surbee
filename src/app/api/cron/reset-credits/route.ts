import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { PLAN_CONFIG } from '@/lib/credits';

/**
 * POST /api/cron/reset-credits
 *
 * Monthly cron job to reset user credits based on their subscription plan.
 * This should be called by a cron scheduler (e.g., Vercel Cron, Railway Cron, etc.)
 *
 * Authorization: Requires CRON_SECRET in headers for security
 *
 * Schedule: Run daily and check which users need credits reset
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();

    // Find users whose credits need to be reset
    // (credits_reset_at is in the past or null)
    const { data: usersToReset, error: fetchError } = await supabase
      .from('user_subscriptions')
      .select('id, user_id, plan, monthly_credits, api_credits_monthly')
      .or(`credits_reset_at.is.null,credits_reset_at.lt.${now.toISOString()}`);

    if (fetchError) {
      console.error('Error fetching users for credit reset:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch users', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!usersToReset || usersToReset.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users need credit reset',
        resetCount: 0,
      });
    }

    // Calculate next reset date (1 month from now)
    const nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);

    // Reset credits for each user
    let resetCount = 0;
    const errors: string[] = [];

    for (const user of usersToReset) {
      const plan = user.plan || 'free';
      const planConfig = PLAN_CONFIG[plan as keyof typeof PLAN_CONFIG] || PLAN_CONFIG.free;

      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({
          credits_remaining: planConfig.monthlyCredits,
          monthly_credits: planConfig.monthlyCredits,
          api_credits_remaining: planConfig.apiCredits,
          api_credits_monthly: planConfig.apiCredits,
          credits_reset_at: nextResetDate.toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        errors.push(`User ${user.user_id}: ${updateError.message}`);
      } else {
        resetCount++;

        // Log the credit reset
        await supabase.from('credit_usage').insert({
          user_id: user.user_id,
          action: 'monthly_reset',
          credits_used: 0,
          metadata: {
            plan,
            credits_added: planConfig.monthlyCredits,
            api_credits_added: planConfig.apiCredits,
            reset_date: now.toISOString(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Reset credits for ${resetCount} users`,
      resetCount,
      totalUsers: usersToReset.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error in credit reset cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cron/reset-credits
 *
 * Check status of credit reset (for debugging/monitoring)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const now = new Date();

    // Count users pending reset
    const { count: pendingCount } = await supabase
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true })
      .or(`credits_reset_at.is.null,credits_reset_at.lt.${now.toISOString()}`);

    // Get last reset activity
    const { data: lastReset } = await supabase
      .from('credit_usage')
      .select('created_at, metadata')
      .eq('action', 'monthly_reset')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      status: 'healthy',
      pendingResets: pendingCount || 0,
      lastReset: lastReset?.created_at || null,
      currentTime: now.toISOString(),
    });
  } catch (error) {
    console.error('Error checking credit reset status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
