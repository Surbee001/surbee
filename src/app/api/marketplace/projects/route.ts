import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // 'templates' or 'surveys' or null for all

    // Fetch published projects that are marked for marketplace
    let query = supabaseAdmin
      .from('projects')
      .select(`
        id,
        title,
        description,
        preview_image_url,
        published_url,
        user_id,
        created_at,
        updated_at,
        is_template,
        is_marketplace_visible,
        remix_count,
        users:user_id (
          id,
          display_name,
          avatar_url
        )
      `)
      .eq('status', 'published')
      .eq('is_marketplace_visible', true)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Filter by type if specified
    if (type === 'templates') {
      query = query.eq('is_template', true);
    } else if (type === 'surveys') {
      query = query.eq('is_template', false);
    }

    const { data: projects, error } = await query;

    if (error) {
      console.error('Error fetching marketplace projects:', error);
      // If is_marketplace_visible column doesn't exist yet, fallback to just published
      const { data: fallbackProjects, error: fallbackError } = await supabaseAdmin
        .from('projects')
        .select(`
          id,
          title,
          description,
          preview_image_url,
          published_url,
          user_id,
          created_at,
          updated_at
        `)
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (fallbackError) {
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
      }

      // Get response counts for each project
      const projectsWithCounts = await Promise.all(
        (fallbackProjects || []).map(async (project) => {
          const { count } = await supabaseAdmin
            .from('survey_responses')
            .select('*', { count: 'exact', head: true })
            .eq('survey_id', project.id);

          return {
            ...project,
            is_template: false,
            remix_count: 0,
            response_count: count || 0,
            author_name: null,
            author_avatar: null,
          };
        })
      );

      return NextResponse.json({ projects: projectsWithCounts });
    }

    // Get response counts for each project
    const projectsWithCounts = await Promise.all(
      (projects || []).map(async (project: any) => {
        const { count } = await supabaseAdmin
          .from('survey_responses')
          .select('*', { count: 'exact', head: true })
          .eq('survey_id', project.id);

        return {
          id: project.id,
          title: project.title,
          description: project.description,
          preview_image_url: project.preview_image_url,
          published_url: project.published_url,
          user_id: project.user_id,
          created_at: project.created_at,
          updated_at: project.updated_at,
          is_template: project.is_template || false,
          remix_count: project.remix_count || 0,
          response_count: count || 0,
          author_name: project.users?.display_name || null,
          author_avatar: project.users?.avatar_url || null,
        };
      })
    );

    return NextResponse.json({ projects: projectsWithCounts });
  } catch (error) {
    console.error('Marketplace API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Publish a project to marketplace as template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, isTemplate = false, userId } = body;

    if (!projectId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the user owns this project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    // Update project to be marketplace visible
    const { data: updatedProject, error: updateError } = await supabaseAdmin
      .from('projects')
      .update({
        is_marketplace_visible: true,
        is_template: isTemplate,
        status: 'published',
        published_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('Error publishing to marketplace:', updateError);
      return NextResponse.json({ error: 'Failed to publish to marketplace' }, { status: 500 });
    }

    return NextResponse.json({ project: updatedProject, message: 'Published to marketplace successfully' });
  } catch (error) {
    console.error('Marketplace publish error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
