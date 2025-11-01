import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

// Get a published survey by its public URL
export async function GET(
  request: NextRequest,
  { params }: { params: { url: string } }
) {
  try {
    const publishedUrl = params.url;

    const { data: project, error } = await ProjectsService.getPublishedProject(publishedUrl);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!project || !project.survey_schema) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Return only the survey schema and basic project info (no sensitive data)
    return NextResponse.json({
      id: project.id,
      title: project.title,
      description: project.description,
      survey_schema: project.survey_schema,
      published_at: project.published_at
    });
  } catch (error) {
    console.error('Error fetching published survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
