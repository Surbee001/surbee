import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import ImageKit from 'imagekit';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Lazy initialization of ImageKit
let imagekitInstance: ImageKit | null = null;

function getImageKit(): ImageKit {
  if (!imagekitInstance) {
    imagekitInstance = new ImageKit({
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || '',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/on0moldgr',
    });
  }
  return imagekitInstance;
}

/**
 * POST /api/projects/[id]/capture-screenshot
 * Captures a screenshot of the survey using an external screenshot service.
 * Only works for published surveys with public URLs.
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;
    const { publishedUrl } = await request.json().catch(() => ({}));

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('sandbox_bundle, published_url')
      .eq('id', projectId)
      .single();

    if (projectError || !project?.sandbox_bundle) {
      return NextResponse.json({ error: 'No sandbox bundle found' }, { status: 404 });
    }

    const effectivePublishedUrl = publishedUrl || project.published_url;

    // Use external screenshot service (only works for published surveys with public URLs)
    if (effectivePublishedUrl) {
      const surveyUrl = `https://form.surbee.dev/${effectivePublishedUrl}`;
      const screenshotApiUrl = `https://api.screenshotone.com/take?access_key=free&url=${encodeURIComponent(surveyUrl)}&viewport_width=1200&viewport_height=900&format=png&timeout=30`;

      try {
        const externalResponse = await fetch(screenshotApiUrl, {
          signal: AbortSignal.timeout(35000) // 35 second timeout
        });

        if (externalResponse.ok) {
          const imageBuffer = await externalResponse.arrayBuffer();
          const buffer = Buffer.from(imageBuffer);

          // Upload to ImageKit
          const uploadResponse = await getImageKit().upload({
            file: buffer,
            fileName: `preview_${projectId}_${Date.now()}.png`,
            folder: '/project-previews',
          });

          // Update project with new preview URL
          await supabaseAdmin
            .from('projects')
            .update({
              preview_image_url: uploadResponse.url,
              last_preview_generated_at: new Date().toISOString(),
            })
            .eq('id', projectId);

          return NextResponse.json({ success: true, previewUrl: uploadResponse.url });
        } else {
          // External service returned non-OK status
        }
      } catch {
        // External screenshot service failed
      }
    }

    // No screenshot method worked - return gracefully
    return NextResponse.json({
      success: false,
      message: 'Screenshot capture not available - will retry later'
    }, { status: 200 }); // Return 200 to avoid error logs
  } catch (error) {
    console.error('[CaptureScreenshot] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
