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

    // Check for sandbox_bundle (AI-generated survey) first, then survey_schema as fallback
    if (!project || (!project.sandbox_bundle && !project.survey_schema)) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    // Return the project data including sandbox_bundle for rendering
    return NextResponse.json({
      id: project.id,
      title: project.title,
      description: project.description,
      sandbox_bundle: project.sandbox_bundle,
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
