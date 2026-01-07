import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

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
  try {
    const user = await getUserFromRequest(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json({ invoices: [] });
    }

    const stripe = new Stripe(stripeSecretKey);

    // Get Stripe customer ID from user_subscriptions
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ invoices: [] });
    }

    // Fetch invoices from Stripe
    const invoicesResponse = await stripe.invoices.list({
      customer: subscription.stripe_customer_id,
      limit: 20,
    });

    const invoices = invoicesResponse.data.map((invoice) => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000).toISOString(),
      amount: (invoice.total || 0) / 100, // Stripe amounts are in cents
      status: invoice.status === 'paid' ? 'paid' :
              invoice.status === 'open' ? 'pending' :
              invoice.status === 'uncollectible' ? 'overdue' :
              invoice.status || 'pending',
      description: invoice.description ||
        (invoice.lines.data[0]?.description) ||
        'Subscription',
      invoiceUrl: invoice.hosted_invoice_url || invoice.invoice_pdf,
    }));

    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ invoices: [] });
  }
}
