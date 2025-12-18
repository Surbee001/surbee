import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-utils';
import { supabase } from '@/lib/supabase';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Security: Get authenticated user from session
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    // Get share settings from project_share_settings
    const { data, error } = await supabase
      .from('project_share_settings')
      .select('*')
      .eq('project_id', id)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching share settings:', error);
      return NextResponse.json({ error: 'Failed to fetch share settings' }, { status: 500 });
    }

    // Return default settings if none exist
    if (!data) {
      return NextResponse.json({
        projectId: id,
        customSlug: null,
        ogTitle: null,
        ogDescription: null,
        ogImage: null,
        isPublic: true,
      });
    }

    return NextResponse.json({
      projectId: data.project_id,
      customSlug: data.custom_slug,
      ogTitle: data.og_title,
      ogDescription: data.og_description,
      ogImage: data.og_image,
      isPublic: data.is_public,
    });
  } catch (error) {
    console.error('Error fetching share settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Security: Get authenticated user from session
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const { customSlug, ogTitle, ogDescription, ogImage, isPublic } = body;

    // Check if custom slug is available (if provided)
    if (customSlug) {
      const { data: existing, error: checkError } = await supabase
        .from('project_share_settings')
        .select('project_id')
        .eq('custom_slug', customSlug)
        .neq('project_id', id)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle no rows gracefully

      // If error is not "no rows" and we got data, slug is taken
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking slug availability:', checkError);
        return NextResponse.json(
          { error: 'Failed to check slug availability' },
          { status: 500 }
        );
      }

      if (existing) {
        return NextResponse.json(
          { error: 'This custom URL is already taken' },
          { status: 400 }
        );
      }
    }

    // Upsert settings
    const { data, error } = await supabase
      .from('project_share_settings')
      .upsert({
        project_id: id,
        user_id: user.id,
        custom_slug: customSlug,
        og_title: ogTitle,
        og_description: ogDescription,
        og_image: ogImage,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'project_id',
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating share settings:', error);
      return NextResponse.json(
        { error: 'Failed to update share settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      projectId: data.project_id,
      customSlug: data.custom_slug,
      ogTitle: data.og_title,
      ogDescription: data.og_description,
      ogImage: data.og_image,
      isPublic: data.is_public,
    });
  } catch (error) {
    console.error('Error updating share settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

