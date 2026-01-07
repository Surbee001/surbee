import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase-server';

const SubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  userId: z.string().uuid().optional(),
  source: z.string().optional().default('onboarding'),
  interests: z.array(z.string()).optional(),
});

/**
 * POST /api/email-subscribers
 * Add a new email subscriber (for Loops integration)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, userId, source, interests } = SubscribeSchema.parse(body);

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('email_subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existing) {
      // If exists but inactive, reactivate
      if (!existing.is_active) {
        const { error: updateError } = await supabaseAdmin
          .from('email_subscribers')
          .update({
            is_active: true,
            unsubscribed_at: null,
            name: name || undefined,
            user_id: userId || undefined,
            interests: interests || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;

        return NextResponse.json({
          success: true,
          message: 'Subscription reactivated',
          id: existing.id,
        });
      }

      // Already subscribed and active
      return NextResponse.json(
        { success: true, message: 'Already subscribed' },
        { status: 200 }
      );
    }

    // Insert new subscriber
    const { data, error } = await supabaseAdmin
      .from('email_subscribers')
      .insert({
        email: email.toLowerCase(),
        name,
        user_id: userId,
        source,
        interests,
        subscribed_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) {
      console.error('Email subscribe error:', error);

      // Handle unique constraint violation gracefully
      if (error.code === '23505') {
        return NextResponse.json(
          { success: true, message: 'Already subscribed' },
          { status: 200 }
        );
      }

      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed',
      id: data.id,
    });

  } catch (error: any) {
    console.error('Email subscription error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors[0]?.message || 'Invalid data',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to subscribe. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/email-subscribers
 * Get subscriber count (admin use)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');

    let query = supabaseAdmin
      .from('email_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (source) {
      query = query.eq('source', source);
    }

    const { count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: count || 0,
    });

  } catch (error) {
    console.error('Email subscribers count error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get count' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/email-subscribers
 * Unsubscribe an email
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('email_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase());

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    });

  } catch (error) {
    console.error('Email unsubscribe error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
