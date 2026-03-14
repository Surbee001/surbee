import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// Helper to trigger screenshot capture in background
async function triggerScreenshotCapture(projectId: string, publishedUrl?: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://surbee.com';
    // Fire and forget - don't wait for screenshot to complete
    // Call the capture-screenshot endpoint which does server-side screenshot capture
    fetch(`${baseUrl}/api/projects/${projectId}/capture-screenshot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publishedUrl }),
    }).catch(() => { /* screenshot capture fire-and-forget */ });
  } catch {
    // Could not trigger screenshot
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { userId, previewImage, sandboxBundle, blockSurvey } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // First try to update the project
    const updateData: Record<string, unknown> = {
      preview_image_url: previewImage || null,
      last_preview_generated_at: previewImage ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };
    if (sandboxBundle) updateData.sandbox_bundle = sandboxBundle;
    if (blockSurvey) updateData.block_survey = blockSurvey;

    const { data: existingProject, error: updateError } = await supabaseAdmin
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .eq('user_id', userId)
      .select()
      .single();

    // If project was updated, trigger screenshot capture in background
    if (existingProject && sandboxBundle) {
      // Capture screenshot asynchronously (don't block response)
      triggerScreenshotCapture(projectId, existingProject.published_url);

      return NextResponse.json({
        success: true,
        project: existingProject
      }, { status: 200 });
    }

    // If project was updated but no sandbox, just return
    if (existingProject) {
      return NextResponse.json({
        success: true,
        project: existingProject
      }, { status: 200 });
    }

    // If no project found (PGRST116), create it with the preview data
    if (updateError?.code === 'PGRST116' || !existingProject) {
      const insertData: Record<string, unknown> = {
        id: projectId,
        user_id: userId,
        title: blockSurvey?.title || 'Untitled Project',
        status: 'draft',
        preview_image_url: previewImage || null,
        last_preview_generated_at: previewImage ? new Date().toISOString() : null,
      };
      if (sandboxBundle) insertData.sandbox_bundle = sandboxBundle;
      if (blockSurvey) insertData.block_survey = blockSurvey;

      const { data: newProject, error: createError } = await supabaseAdmin
        .from('projects')
        .insert(insertData)
        .select()
        .single();

      if (createError) {
        // Handle duplicate key error (project was created between our check and insert)
        if (createError.code === '23505') {
          const retryData: Record<string, unknown> = {
            preview_image_url: previewImage || null,
            last_preview_generated_at: previewImage ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          };
          if (sandboxBundle) retryData.sandbox_bundle = sandboxBundle;
          if (blockSurvey) retryData.block_survey = blockSurvey;

          const { data: retryProject, error: retryError } = await supabaseAdmin
            .from('projects')
            .update(retryData)
            .eq('id', projectId)
            .eq('user_id', userId)
            .select()
            .single();

          if (retryError) {
            return NextResponse.json({ error: retryError.message }, { status: 500 });
          }
          return NextResponse.json({ success: true, project: retryProject }, { status: 200 });
        }
        return NextResponse.json({ error: createError.message }, { status: 500 });
      }

      // Trigger screenshot capture for new project
      if (sandboxBundle) {
        triggerScreenshotCapture(projectId);
      }

      return NextResponse.json({
        success: true,
        project: newProject
      }, { status: 201 });
    }

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      project: existingProject
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating project preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
