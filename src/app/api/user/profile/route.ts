import { supabaseAdmin } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/user/profile
 * Get user profile from database
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
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ profile: profile || null });
  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/user/profile
 * Save user profile to database
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;
    const body = await request.json();

    // Support both old format and new format
    const userId = body.userId;
    const profile = body.profile || body;

    const name = profile.name;
    const age = profile.age;
    const heardFrom = profile.heardFrom || profile.heard_from;
    const surveyPreference = profile.surveyPreference || profile.survey_preference;
    const interests = profile.interests;
    const onboardingCompleted = profile.onboarding_completed ?? profile.onboardingCompleted;
    const acceptedTermsAt = profile.acceptedTermsAt || profile.accepted_terms_at;
    const subscribedToEmails = profile.subscribedToEmails ?? profile.subscribed_to_emails;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only include fields that are provided
    if (name !== undefined) updateData.name = name;
    if (age !== undefined) updateData.age = age;
    if (heardFrom !== undefined) updateData.heard_from = heardFrom;
    if (surveyPreference !== undefined) updateData.survey_preference = surveyPreference;
    if (interests !== undefined) updateData.interests = interests;
    if (onboardingCompleted !== undefined) updateData.onboarding_completed = onboardingCompleted;
    if (acceptedTermsAt !== undefined) updateData.accepted_terms_at = acceptedTermsAt;
    if (subscribedToEmails !== undefined) updateData.subscribed_to_emails = subscribedToEmails;

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: userId,
          ...updateData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }
  } catch (error) {
    console.error('Profile save error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save profile' },
      { status: 500 }
    );
  }
}
