import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let stripe: Stripe | null = null;
const getStripe = () => {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-05-28.basil',
    });
  }
  return stripe;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Map plan IDs to database values and credits
const PLAN_MAP: Record<string, { dbPlan: string; credits: number }> = {
  surbee_pro: { dbPlan: 'pro', credits: 2000 },
  surbee_max: { dbPlan: 'max', credits: 6000 },
};

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log(`📥 Stripe webhook received: ${event.type}`);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const plan = session.metadata?.plan;
        const customerEmail = session.customer_email;

        if (userId && plan) {
          const planConfig = PLAN_MAP[plan];
          if (planConfig) {
            await supabase.from('user_subscriptions').upsert({
              user_id: userId,
              plan: planConfig.dbPlan,
              monthly_credits: planConfig.credits,
              credits_remaining: planConfig.credits,
              credits_reset_at: new Date().toISOString(),
              status: 'active',
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            console.log(`✅ Subscription activated: User ${userId} -> ${plan}`);
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;
        const plan = subscription.metadata?.plan;

        if (userId && plan) {
          const planConfig = PLAN_MAP[plan];
          const status = subscription.status === 'active' ? 'active' : subscription.status;

          if (planConfig) {
            await supabase.from('user_subscriptions').upsert({
              user_id: userId,
              plan: status === 'active' ? planConfig.dbPlan : 'free',
              monthly_credits: status === 'active' ? planConfig.credits : 100,
              credits_remaining: status === 'active' ? planConfig.credits : 100,
              status: status,
              stripe_subscription_id: subscription.id,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

            console.log(`✅ Subscription updated: User ${userId} -> ${plan} (${status})`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          // Revert to free plan
          await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            plan: 'free',
            monthly_credits: 100,
            credits_remaining: 100,
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

          console.log(`✅ Subscription cancelled: User ${userId} reverted to free`);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          // Get the subscription to find the user
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;
          const plan = subscription.metadata?.plan;

          if (userId && plan) {
            const planConfig = PLAN_MAP[plan];
            if (planConfig) {
              // Reset credits on successful payment (monthly renewal)
              await supabase.from('user_subscriptions').update({
                credits_remaining: planConfig.credits,
                credits_reset_at: new Date().toISOString(),
                status: 'active',
                updated_at: new Date().toISOString(),
              }).eq('user_id', userId);

              console.log(`✅ Credits reset for user ${userId}: ${planConfig.credits} credits`);
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (subscriptionId) {
          const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata?.userId;

          if (userId) {
            await supabase.from('user_subscriptions').update({
              status: 'past_due',
              updated_at: new Date().toISOString(),
            }).eq('user_id', userId);

            console.log(`⚠️ Payment failed for user ${userId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
