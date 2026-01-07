import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: announcements, error } = await supabase
      .from('announcements')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error('Error in announcements API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
