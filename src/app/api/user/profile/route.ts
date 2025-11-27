import { supabaseAdmin } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = supabaseAdmin;
    const body = await request.json();
    const { userId, name, age, heardFrom, surveyPreference, interests } = body;

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          name,
          age,
          heard_from: heardFrom,
          survey_preference: surveyPreference,
          interests,
          updated_at: new Date().toISOString()
        })
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
          name,
          age,
          heard_from: heardFrom,
          survey_preference: surveyPreference,
          interests,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
