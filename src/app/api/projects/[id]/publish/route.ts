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
      sandboxBundleKeys: sandboxBundle ? Object.keys(sandboxBundle) : null,
      sandboxHasFiles: sandboxBundle?.files ? Object.keys(sandboxBundle.files).length : 0
    });

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate sandbox bundle has actual content
    if (sandboxBundle) {
      const hasAppFile = sandboxBundle.files &&
        (sandboxBundle.files['/App.tsx'] || sandboxBundle.files['App.tsx'] ||
         sandboxBundle.files['/App.jsx'] || sandboxBundle.files['App.jsx']);

      if (!hasAppFile) {
        console.warn('[Publish API] Warning: sandboxBundle provided but no App file found');
      }

      const appContent = sandboxBundle.files?.['/App.tsx'] ||
                        sandboxBundle.files?.['App.tsx'] ||
                        sandboxBundle.files?.['/App.jsx'] ||
                        sandboxBundle.files?.['App.jsx'] || '';

      if (appContent.length < 50) {
        console.warn('[Publish API] Warning: App file is very short:', appContent.length, 'chars');
      }
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

    // Verify project was actually published
    if (project.status !== 'published') {
      console.error('[Publish API] Project status is not published after publishProject:', project.status);
      return NextResponse.json(
        { error: 'Failed to publish survey - status not updated' },
        { status: 500 }
      );
    }

    // Verify sandbox_bundle exists
    if (!project.sandbox_bundle) {
      console.warn('[Publish API] Warning: Published project has no sandbox_bundle');
    }

    console.log('[Publish API] Success:', {
      publishedUrl: project.published_url,
      status: project.status,
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
