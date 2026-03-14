import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';
import { supabaseAdmin } from '@/lib/supabase-server';

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

    // Check for content: block_survey, sandbox_bundle, or survey_schema
    if (!project || (!project.block_survey && !project.sandbox_bundle && !project.survey_schema)) {
      return NextResponse.json(
        { error: 'Survey not found or has no content yet' },
        { status: 404 }
      );
    }

    const settings = project.settings || {};

    // Check if survey is closed by date
    if (settings.responses?.closeAfterDate) {
      const closeDate = new Date(settings.responses.closeAfterDate);
      if (new Date() > closeDate) {
        return NextResponse.json({
          closed: true,
          closureReason: 'expired',
          closureDate: settings.responses.closeAfterDate,
          title: project.title,
        });
      }
    }

    // Check if response limit is reached
    if (settings.responses?.limitResponses && settings.responses?.maxResponses) {
      const { count, error: countError } = await supabaseAdmin
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('survey_id', project.id)
        .eq('is_preview', false);

      if (!countError && count !== null && count >= settings.responses.maxResponses) {
        return NextResponse.json({
          closed: true,
          closureReason: 'limit_reached',
          maxResponses: settings.responses.maxResponses,
          title: project.title,
        });
      }
    }

    // Return the project data including sandbox_bundle for rendering
    // Include flags for client-side handling
    return NextResponse.json({
      id: project.id,
      title: project.title,
      description: project.description,
      block_survey: project.block_survey || null,
      sandbox_bundle: project.sandbox_bundle,
      sandbox_preview_url: project.sandbox_preview_url || null,
      survey_schema: project.survey_schema,
      published_at: project.published_at,
      // Include settings needed for client
      settings: {
        passwordProtected: settings.privacy?.passwordProtected || false,
        showThankYouPage: settings.responses?.showThankYouPage ?? true,
        thankYouMessage: settings.responses?.thankYouMessage || 'Thank you for completing this survey!',
        redirectUrl: settings.responses?.redirectUrl || null,
      }
    });
  } catch (error) {
    console.error('Error fetching published survey:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Verify password for protected surveys
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { url: publishedUrl } = await context.params;
    const body = await request.json();
    const { password } = body;

    const { data: project, error } = await ProjectsService.getPublishedProject(publishedUrl);

    if (error || !project) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      );
    }

    const settings = project.settings || {};

    // Check if password protection is enabled
    if (!settings.privacy?.passwordProtected) {
      return NextResponse.json({ valid: true });
    }

    // Verify password
    const storedPassword = settings.privacy?.password;
    if (password === storedPassword) {
      return NextResponse.json({ valid: true });
    }

    return NextResponse.json(
      { valid: false, error: 'Incorrect password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
