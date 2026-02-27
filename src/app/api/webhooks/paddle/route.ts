import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { supabaseAdmin } from '@/lib/supabase-server';
import { PADDLE_PLAN_CONFIG, getPlanFromPaddlePrice } from '@/lib/paddle';

const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET || '';

// Verify Paddle webhook signature
function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) return false;

  try {
    // Parse the signature header: ts=timestamp;h1=hash
    const parts = signature.split(';');
    const timestampPart = parts.find(p => p.startsWith('ts='));
    const hashPart = parts.find(p => p.startsWith('h1='));

    if (!timestampPart || !hashPart) return false;

    const timestamp = timestampPart.replace('ts=', '');
    const expectedHash = hashPart.replace('h1=', '');

    // Create the signed payload
    const signedPayload = `${timestamp}:${rawBody}`;

    // Calculate HMAC
    const hmac = createHmac('sha256', secret);
    hmac.update(signedPayload);
    const calculatedHash = hmac.digest('hex');

    // Time-safe comparison
    return timingSafeEqual(
      Buffer.from(calculatedHash),
      Buffer.from(expectedHash)
    );
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

interface PaddleWebhookEvent {
  event_id: string;
  event_type: string;
  occurred_at: string;
  notification_id: string;
  data: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('paddle-signature');

    // Verify signature in production
    if (process.env.NODE_ENV === 'production' && PADDLE_WEBHOOK_SECRET) {
      if (!verifyWebhookSignature(rawBody, signature, PADDLE_WEBHOOK_SECRET)) {
        console.error('Invalid Paddle webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event: PaddleWebhookEvent = JSON.parse(rawBody);
    switch (event.event_type) {
      case 'subscription.created':
      case 'subscription.activated':
        await handleSubscriptionCreated(event.data);
        break;

      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data);
        break;

      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data);
        break;

      case 'subscription.past_due':
        await handleSubscriptionPastDue(event.data);
        break;

      case 'transaction.completed':
        await handleTransactionCompleted(event.data);
        break;

      case 'transaction.payment_failed':
        await handlePaymentFailed(event.data);
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paddle webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionCreated(data: Record<string, unknown>) {
  const subscriptionId = data.id as string;
  const customerId = data.customer_id as string;
  const status = data.status as string;
  const customData = data.custom_data as { userId?: string; plan?: string } | null;
  const items = data.items as Array<{ price: { id: string } }> | undefined;

  if (!customData?.userId) {
    console.error('No userId in subscription custom_data');
    return;
  }

  const userId = customData.userId;

  // Get plan info from price ID
  const priceId = items?.[0]?.price?.id;
  let dbPlan = 'surbee_pro';
  let monthlyCredits = 2000;

  if (priceId) {
    const planInfo = getPlanFromPaddlePrice(priceId);
    if (planInfo) {
      const config = PADDLE_PLAN_CONFIG[planInfo.plan as keyof typeof PADDLE_PLAN_CONFIG];
      if (config) {
        dbPlan = config.dbPlan;
        monthlyCredits = config.monthlyCredits;
      }
    }
  }

  // Calculate next reset date (1 month from now)
  const creditsResetAt = new Date();
  creditsResetAt.setMonth(creditsResetAt.getMonth() + 1);

  // Upsert subscription
  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan: dbPlan,
      monthly_credits: monthlyCredits,
      credits_remaining: monthlyCredits,
      credits_reset_at: creditsResetAt.toISOString(),
      status: status === 'active' ? 'active' : 'pending',
      paddle_customer_id: customerId,
      paddle_subscription_id: subscriptionId,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }

}

async function handleSubscriptionUpdated(data: Record<string, unknown>) {
  const subscriptionId = data.id as string;
  const status = data.status as string;
  const items = data.items as Array<{ price: { id: string } }> | undefined;

  // Find user by subscription ID
  const { data: subscription } = await supabaseAdmin
    .from('user_subscriptions')
    .select('user_id')
    .eq('paddle_subscription_id', subscriptionId)
    .single();

  if (!subscription) {
    console.error('Subscription not found:', subscriptionId);
    return;
  }

  // Get plan info from price ID
  const priceId = items?.[0]?.price?.id;
  let updateData: Record<string, unknown> = {
    status: status === 'active' ? 'active' : status,
    updated_at: new Date().toISOString(),
  };

  if (priceId) {
    const planInfo = getPlanFromPaddlePrice(priceId);
    if (planInfo) {
      const config = PADDLE_PLAN_CONFIG[planInfo.plan as keyof typeof PADDLE_PLAN_CONFIG];
      if (config) {
        updateData = {
          ...updateData,
          plan: config.dbPlan,
          monthly_credits: config.monthlyCredits,
        };
      }
    }
  }

  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update(updateData)
    .eq('paddle_subscription_id', subscriptionId);

  if (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }

}

async function handleSubscriptionCanceled(data: Record<string, unknown>) {
  const subscriptionId = data.id as string;

  // Revert to free plan
  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      plan: 'free_user',
      monthly_credits: 100,
      credits_remaining: 100,
      status: 'canceled',
      paddle_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', subscriptionId);

  if (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }

}

async function handleSubscriptionPastDue(data: Record<string, unknown>) {
  const subscriptionId = data.id as string;

  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', subscriptionId);

  if (error) {
    console.error('Error updating subscription to past_due:', error);
  }

}

async function handleTransactionCompleted(data: Record<string, unknown>) {
  const subscriptionId = data.subscription_id as string | undefined;
  const origin = data.origin as string;

  // Only handle recurring payments (not initial subscription creation)
  if (!subscriptionId || origin !== 'subscription_recurring') {
    return;
  }

  // Find subscription and reset credits
  const { data: subscription } = await supabaseAdmin
    .from('user_subscriptions')
    .select('user_id, monthly_credits')
    .eq('paddle_subscription_id', subscriptionId)
    .single();

  if (!subscription) {
    return;
  }

  // Reset credits for the new billing period
  const creditsResetAt = new Date();
  creditsResetAt.setMonth(creditsResetAt.getMonth() + 1);

  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      credits_remaining: subscription.monthly_credits,
      credits_reset_at: creditsResetAt.toISOString(),
      status: 'active',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', subscriptionId);

  if (error) {
    console.error('Error resetting credits:', error);
  }

}

async function handlePaymentFailed(data: Record<string, unknown>) {
  const subscriptionId = data.subscription_id as string | undefined;

  if (!subscriptionId) return;

  const { error } = await supabaseAdmin
    .from('user_subscriptions')
    .update({
      status: 'past_due',
      updated_at: new Date().toISOString(),
    })
    .eq('paddle_subscription_id', subscriptionId);

  if (error) {
    console.error('Error updating subscription after payment failure:', error);
  }

}
