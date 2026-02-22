import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

const PADDLE_API_KEY = process.env.PADDLE_API_KEY || '';
const PADDLE_ENVIRONMENT = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';

const PADDLE_API_URL = PADDLE_ENVIRONMENT === 'production'
  ? 'https://api.paddle.com'
  : 'https://sandbox-api.paddle.com';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get user's Paddle customer ID from subscription
    const { data: subscription, error } = await supabaseAdmin
      .from('user_subscriptions')
      .select('paddle_customer_id, paddle_subscription_id')
      .eq('user_id', userId)
      .single();

    if (error || !subscription?.paddle_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Create a customer portal session via Paddle API
    const response = await fetch(`${PADDLE_API_URL}/customers/${subscription.paddle_customer_id}/portal-sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription_ids: subscription.paddle_subscription_id
          ? [subscription.paddle_subscription_id]
          : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Paddle portal session error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create portal session' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const portalUrl = data.data?.urls?.general?.overview;

    if (!portalUrl) {
      return NextResponse.json(
        { error: 'Portal URL not available' },
        { status: 500 }
      );
    }

    return NextResponse.json({ portalUrl });
  } catch (error) {
    console.error('Customer portal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
