import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

/**
 * GET /api/analytics/consent
 * Get the current analytics consent status for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('analytics_consent, analytics_consent_asked_at')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching consent:', error);
      return NextResponse.json({ error: 'Failed to fetch consent status' }, { status: 500 });
    }

    return NextResponse.json({
      consent: profile?.analytics_consent ?? null,
      lastAskedAt: profile?.analytics_consent_asked_at ?? null,
    });
  } catch (error) {
    console.error('Error in consent GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/analytics/consent
 * Update the analytics consent status for a user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, consent } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (typeof consent !== 'boolean') {
      return NextResponse.json({ error: 'Consent must be a boolean' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Try to update existing profile
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching profile:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          analytics_consent: consent,
          analytics_consent_asked_at: now,
          analytics_consent_updated_at: now,
          updated_at: now,
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Error updating consent:', updateError);
        return NextResponse.json({ error: 'Failed to update consent' }, { status: 500 });
      }
    } else {
      // Create new profile with consent
      const { error: insertError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: userId,
          analytics_consent: consent,
          analytics_consent_asked_at: now,
          analytics_consent_updated_at: now,
        });

      if (insertError) {
        console.error('Error creating profile with consent:', insertError);
        return NextResponse.json({ error: 'Failed to save consent' }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      consent,
      updatedAt: now,
    });
  } catch (error) {
    console.error('Error in consent POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/analytics/consent
 * Mark that the user was asked about consent (for once-per-day logic)
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Try to update existing profile
    const { data: existingProfile, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      await supabaseAdmin
        .from('user_profiles')
        .update({
          analytics_consent_asked_at: now,
          updated_at: now,
        })
        .eq('user_id', userId);
    } else {
      await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: userId,
          analytics_consent_asked_at: now,
        });
    }

    return NextResponse.json({
      success: true,
      askedAt: now,
    });
  } catch (error) {
    console.error('Error in consent PATCH:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
