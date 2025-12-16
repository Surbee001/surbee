import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

interface RouteContext {
  params: Promise<{ url: string }>;
}

// Get a published survey by its public URL
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { url: publishedUrl } = await context.params;

    const { data: project, error } = await ProjectsService.getPublishedProject(publishedUrl);

    // Check for specific error messages (like "not published yet")
    if (error) {
      const errorMessage = error.message || 'Failed to load survey';
      const isNotPublished = errorMessage.includes('not been published') || errorMessage.includes('not currently available');
      return NextResponse.json(
        { error: errorMessage },
        { status: isNotPublished ? 404 : 500 }
      );
    }

    // Debug logging
    console.log('[Published Survey API] Project found:', {
      id: project.id,
      title: project.title,
      hasSandboxBundle: !!project.sandbox_bundle,
      hasSurveySchema: !!project.survey_schema,
      sandboxBundleKeys: project.sandbox_bundle ? Object.keys(project.sandbox_bundle) : null,
      status: project.status,
      published_url: project.published_url
    });

    // Check for sandbox_bundle (AI-generated survey) first, then survey_schema as fallback
    if (!project || (!project.sandbox_bundle && !project.survey_schema)) {
      console.log('[Published Survey API] No content found:', {
        hasProject: !!project,
        hasSandboxBundle: project?.sandbox_bundle ? true : false,
        hasSurveySchema: project?.survey_schema ? true : false
      });
      return NextResponse.json(
        { error: 'Survey not found or has no content yet' },
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
