import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: project, error } = await ProjectsService.duplicateProject(projectId, userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
