import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Plan configuration
const PLAN_CONFIG: Record<string, { name: string; dbPlan: string; credits: number; price: number }> = {
  surbee_pro: { name: 'Pro', dbPlan: 'pro', credits: 2000, price: 200 },
  surbee_max: { name: 'Max', dbPlan: 'max', credits: 6000, price: 600 },
};

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json();

    if (!plan || !userId) {
      return NextResponse.json({ error: 'Missing plan or userId' }, { status: 400 });
    }

    const planConfig = PLAN_CONFIG[plan];
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Use Clerk's billing API to create a checkout session
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    if (!clerkSecretKey) {
      return NextResponse.json({ error: 'Clerk is not configured' }, { status: 500 });
    }

    // Get the base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Create checkout session via Clerk's Backend API
    const response = await fetch('https://api.clerk.com/v1/billing/checkout_sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: plan, // Your plan ID configured in Clerk dashboard
        success_url: `${baseUrl}/home?upgraded=true&plan=${plan}`,
        cancel_url: `${baseUrl}/billing?plan=${plan}&cancelled=true`,
        metadata: {
          supabase_user_id: userId,
          plan: plan,
          credits: planConfig.credits.toString(),
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Clerk API error:', errorData);

      // If Clerk billing API isn't available, fall back to direct Supabase update for testing
      if (response.status === 404 || response.status === 400) {
        console.log('Clerk billing API not available, using direct update for testing');

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Direct update for testing purposes
        const { error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan: planConfig.dbPlan,
            monthly_credits: planConfig.credits,
            credits_remaining: planConfig.credits,
            credits_reset_at: new Date().toISOString(),
            status: 'active',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (subscriptionError) {
          console.error('Error updating subscription:', subscriptionError);
          return NextResponse.json({ error: `Failed to update subscription: ${subscriptionError.message}` }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          message: `Successfully upgraded to ${planConfig.name}! (Test mode - Clerk billing not configured)`,
          testMode: true,
        });
      }

      return NextResponse.json({
        error: errorData.message || 'Failed to create checkout session'
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      checkoutUrl: data.url,
      sessionId: data.id,
    });

  } catch (error: any) {
    console.error('Error creating checkout:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
