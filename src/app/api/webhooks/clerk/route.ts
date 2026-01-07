import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Map Clerk plan IDs to our database plan values and credits
const PLAN_MAP: Record<string, { dbPlan: string; credits: number }> = {
  'surbee_pro': { dbPlan: 'pro', credits: 2000 },
  'surbee_max': { dbPlan: 'max', credits: 6000 },
  'pro': { dbPlan: 'pro', credits: 2000 },
  'max': { dbPlan: 'max', credits: 6000 },
  'free': { dbPlan: 'free', credits: 100 },
};

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('Missing CLERK_WEBHOOK_SECRET');
    return new Response('Webhook secret not configured', { status: 500 });
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify the webhook
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  const eventType = evt.type;
  console.log(`📥 Clerk webhook received: ${eventType}`);

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Handle user created - give them free plan
    if (eventType === 'user.created') {
      const { id, email_addresses } = evt.data;
      const email = email_addresses?.[0]?.email_address;

      await supabase.from('user_subscriptions').upsert({
        user_id: id,
        plan: 'free',
        monthly_credits: 100,
        credits_remaining: 100,
        status: 'active',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

      console.log(`✅ Created free subscription for Clerk user ${id}`);
    }

    // Handle billing/subscription events
    // Clerk sends these when using their billing feature
    if (eventType === 'user.updated') {
      const userData = evt.data as any;
      const userId = userData.id;

      // Check if there's subscription metadata
      const publicMetadata = userData.public_metadata || {};
      const plan = publicMetadata.plan || publicMetadata.subscription_plan;

      if (plan && userId) {
        const planConfig = PLAN_MAP[plan] || { dbPlan: 'free', credits: 100 };

        await supabase.from('user_subscriptions').upsert({
          user_id: userId,
          plan: planConfig.dbPlan,
          monthly_credits: planConfig.credits,
          credits_remaining: planConfig.credits,
          credits_reset_at: new Date().toISOString(),
          status: 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        console.log(`✅ Updated subscription for user ${userId}: ${plan}`);
      }
    }

    // Handle Clerk Billing subscription events (if using Clerk Billing)
    if ((eventType as string).startsWith('subscription.')) {
      const subscription = evt.data as any;
      const userId = subscription.user_id || subscription.metadata?.supabase_user_id;
      const planId = subscription.plan_id || subscription.metadata?.plan;
      const status = subscription.status;

      if (userId && planId) {
        const planConfig = PLAN_MAP[planId] || { dbPlan: 'free', credits: 100 };

        if (status === 'active') {
          await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            plan: planConfig.dbPlan,
            monthly_credits: planConfig.credits,
            credits_remaining: planConfig.credits,
            credits_reset_at: new Date().toISOString(),
            status: 'active',
            updated_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

          console.log(`✅ Subscription activated: User ${userId} -> ${planId}`);
        } else if (status === 'canceled' || status === 'cancelled') {
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
      }
    }

    // Handle checkout session completed (Clerk Billing)
    if ((eventType as string) === 'checkout.session.completed') {
      const session = evt.data as any;
      const userId = session.client_reference_id || session.metadata?.supabase_user_id;
      const planId = session.metadata?.plan;

      if (userId && planId) {
        const planConfig = PLAN_MAP[planId] || { dbPlan: 'free', credits: 100 };

        await supabase.from('user_subscriptions').upsert({
          user_id: userId,
          plan: planConfig.dbPlan,
          monthly_credits: planConfig.credits,
          credits_remaining: planConfig.credits,
          credits_reset_at: new Date().toISOString(),
          status: 'active',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

        console.log(`✅ Checkout completed: User ${userId} -> ${planId}`);
      }
    }

    return new Response('Webhook processed', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Webhook processing failed', { status: 500 });
  }
}
