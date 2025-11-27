import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-server';
import { ProjectsService } from '@/lib/services/projects';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: projects, error } = await ProjectsService.getUserProjects(userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch response counts for all projects
    const projectIds = projects?.map((p: any) => p.id) || [];

    if (projectIds.length > 0) {
      // Get response counts for each project
      const { data: responseCounts } = await supabaseAdmin
        .from('survey_responses')
        .select('survey_id')
        .in('survey_id', projectIds);

      // Count responses per project
      const countMap: Record<string, number> = {};
      responseCounts?.forEach((r: any) => {
        countMap[r.survey_id] = (countMap[r.survey_id] || 0) + 1;
      });

      // Attach response counts to projects
      const projectsWithCounts = projects?.map((p: any) => ({
        ...p,
        responseCount: countMap[p.id] || 0,
      }));

      return NextResponse.json({ projects: projectsWithCounts });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, user_id } = body;

    if (!title || !user_id) {
      return NextResponse.json({ error: 'Title and user_id are required' }, { status: 400 });
    }

    const { data: project, error } = await ProjectsService.createProject({
      id,
      title,
      description,
      user_id
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}