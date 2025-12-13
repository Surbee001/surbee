import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';
import { requireAuth, sanitizeErrorMessage } from '@/lib/auth-utils';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Security: Get authenticated user from session instead of trusting client
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const { data: project, error } = await ProjectsService.getProject(id, user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { user_id, userId, ...updates } = body;

    // Security: Get authenticated user from session instead of trusting client
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const { data: project, error } = await ProjectsService.updateProject(id, user.id, updates);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Security: Get authenticated user from session instead of trusting client
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const { error } = await ProjectsService.deleteProject(id, user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}