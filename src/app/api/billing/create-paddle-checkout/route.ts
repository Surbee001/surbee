import { NextRequest, NextResponse } from 'next/server';
import { getPaddlePriceId } from '@/lib/paddle';

const PADDLE_API_KEY = process.env.PADDLE_API_KEY || '';
const PADDLE_ENVIRONMENT = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT || 'sandbox';

const PADDLE_API_URL = PADDLE_ENVIRONMENT === 'production'
  ? 'https://api.paddle.com'
  : 'https://sandbox-api.paddle.com';

export async function POST(request: NextRequest) {
  try {
    const { userId, email, plan, billingCycle } = await request.json();

    if (!userId || !plan || !billingCycle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the price ID
    const paddlePlan = plan === 'surbee_pro' ? 'pro' : plan === 'surbee_max' ? 'max' : null;
    if (!paddlePlan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceId = getPaddlePriceId(paddlePlan, billingCycle);
    if (!priceId) {
      return NextResponse.json({ error: 'Invalid price configuration' }, { status: 400 });
    }

    // Create a transaction via Paddle API
    const response = await fetch(`${PADDLE_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PADDLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            price_id: priceId,
            quantity: 1,
          },
        ],
        customer_id: null, // Will be created on checkout
        custom_data: {
          userId,
          plan,
        },
        ...(email && {
          customer: {
            email,
          },
        }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Paddle API error:', data);
      return NextResponse.json(
        { error: data.error?.detail || 'Failed to create checkout' },
        { status: response.status }
      );
    }

    // Return the checkout URL
    const checkoutUrl = data.data?.checkout?.url;
    if (!checkoutUrl) {
      return NextResponse.json(
        { error: 'No checkout URL returned' },
        { status: 500 }
      );
    }

    return NextResponse.json({ checkoutUrl, transactionId: data.data?.id });
  } catch (error) {
    console.error('Create checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
