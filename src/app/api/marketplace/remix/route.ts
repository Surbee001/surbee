import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, userId } = body;

    if (!projectId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch the original project
    const { data: originalProject, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (fetchError || !originalProject) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create a new project as a remix
    const newProjectId = uuidv4();
    const { data: newProject, error: createError } = await supabaseAdmin
      .from('projects')
      .insert({
        id: newProjectId,
        title: `${originalProject.title} (Remix)`,
        description: originalProject.description,
        user_id: userId,
        status: 'draft',
        survey_schema: originalProject.survey_schema,
        sandbox_bundle: originalProject.sandbox_bundle,
        preview_image_url: originalProject.preview_image_url,
        remixed_from_id: projectId,
        is_template: false,
        is_marketplace_visible: false,
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating remix:', createError);
      return NextResponse.json({ error: 'Failed to create remix' }, { status: 500 });
    }

    // Increment the remix count on the original project
    await supabaseAdmin
      .from('projects')
      .update({ remix_count: (originalProject.remix_count || 0) + 1 })
      .eq('id', projectId);

    return NextResponse.json({
      project: newProject,
      redirectUrl: `/project/${newProjectId}`,
      message: 'Project remixed successfully'
    });
  } catch (error) {
    console.error('Remix API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
