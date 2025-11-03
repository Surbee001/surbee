import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId, surveySchema } = await request.json();
    const { id: projectId } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: project, error } = await ProjectsService.publishProject(
      projectId,
      userId,
      surveySchema
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
