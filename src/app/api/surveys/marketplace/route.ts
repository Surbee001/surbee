import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';

// Get all published surveys for the marketplace
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const category = searchParams.get('category') || undefined;

    const { data: surveys, error, total } = await ProjectsService.getAllPublishedSurveys({
      limit,
      offset,
      category,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Transform to marketplace format
    const marketplaceSurveys = (surveys || []).map((survey) => ({
      id: survey.id,
      title: survey.title,
      description: survey.description || '',
      category: 'General', // Could be expanded with actual category support
      responseCount: 0, // Could be expanded with actual response counts
      createdAt: survey.created_at,
      publishedAt: survey.published_at,
      previewImage: survey.preview_image_url,
      publishedUrl: survey.published_url,
      difficulty: 'intermediate' as const,
      estimatedTime: '5-10 min',
    }));

    return NextResponse.json({
      surveys: marketplaceSurveys,
      total: total || 0,
      hasMore: (offset + limit) < (total || 0),
    });
  } catch (error) {
    console.error('Error fetching marketplace surveys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
