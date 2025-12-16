import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, surveySchema, sandboxBundle } = await request.json();
    const { id: projectId } = await params;

    console.log('[Publish API] Publishing project:', {
      projectId,
      userId,
      hasSurveySchema: !!surveySchema,
      hasSandboxBundle: !!sandboxBundle,
      sandboxBundleKeys: sandboxBundle ? Object.keys(sandboxBundle) : null
    });

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: project, error } = await ProjectsService.publishProject(
      projectId,
      userId,
      surveySchema,
      sandboxBundle
    );

    if (error) {
      console.log('[Publish API] Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!project) {
      console.log('[Publish API] Project not found');
      return NextResponse.json(
        { error: 'Project not found or you do not have permission' },
        { status: 404 }
      );
    }

    console.log('[Publish API] Success:', {
      publishedUrl: project.published_url,
      hasSandboxBundle: !!project.sandbox_bundle
    });

    return NextResponse.json(
      {
        success: true,
        project,
        publishedUrl: project.published_url
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error publishing project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
