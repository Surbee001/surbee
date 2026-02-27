import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, surveySchema, sandboxBundle } = await request.json();
    const { id: projectId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate sandbox bundle has actual content
    if (sandboxBundle) {
      const hasAppFile = sandboxBundle.files &&
        (sandboxBundle.files['/App.tsx'] || sandboxBundle.files['App.tsx'] ||
         sandboxBundle.files['/App.jsx'] || sandboxBundle.files['App.jsx']);

      if (!hasAppFile) {
        // sandboxBundle provided but no App file found
      }

      const appContent = sandboxBundle.files?.['/App.tsx'] ||
                        sandboxBundle.files?.['App.tsx'] ||
                        sandboxBundle.files?.['/App.jsx'] ||
                        sandboxBundle.files?.['App.jsx'] || '';

      if (appContent.length < 50) {
        // App file is very short
      }
    }

    const { data: project, error } = await ProjectsService.publishProject(
      projectId,
      userId,
      surveySchema,
      sandboxBundle
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!project) {
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
