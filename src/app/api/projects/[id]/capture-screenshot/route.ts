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
 * Captures a screenshot of the survey using the Modal sandbox or external service
 * Works for both draft and published surveys
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;
    const { publishedUrl } = await request.json().catch(() => ({}));

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    console.log(`[CaptureScreenshot] Starting capture for project ${projectId}`);

    // Get the project's sandbox bundle
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('sandbox_bundle, published_url')
      .eq('id', projectId)
      .single();

    if (projectError || !project?.sandbox_bundle) {
      console.log('[CaptureScreenshot] No sandbox bundle found');
      return NextResponse.json({ error: 'No sandbox bundle found' }, { status: 404 });
    }

    const modalEndpoint = process.env.MODAL_SANDBOX_ENDPOINT;
    const effectivePublishedUrl = publishedUrl || project.published_url;

    // Strategy 1: Try Modal sandbox screenshot endpoint first
    if (modalEndpoint) {
      try {
        console.log('[CaptureScreenshot] Trying Modal sandbox screenshot...');
        const screenshotResponse = await fetch(`${modalEndpoint}/api/sandbox/screenshot`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            files: project.sandbox_bundle.files,
            sandbox_id: `screenshot-${projectId}-${Date.now()}`,
          }),
        });

        if (screenshotResponse.ok) {
          const screenshotData = await screenshotResponse.json();
          if (screenshotData.screenshot_base64) {
            // Upload base64 screenshot to ImageKit
            const uploadResponse = await getImageKit().upload({
              file: screenshotData.screenshot_base64,
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

            console.log(`[CaptureScreenshot] Screenshot saved via Modal: ${uploadResponse.url}`);
            return NextResponse.json({ success: true, previewUrl: uploadResponse.url });
          }
        } else {
          console.log('[CaptureScreenshot] Modal screenshot endpoint returned:', screenshotResponse.status);
        }
      } catch (modalError) {
        console.log('[CaptureScreenshot] Modal screenshot failed:', modalError);
      }
    }

    // Strategy 2: Try external screenshot service (only if we have a published URL)
    if (effectivePublishedUrl) {
      console.log('[CaptureScreenshot] Trying external screenshot service...');
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

          console.log(`[CaptureScreenshot] Screenshot saved via external service: ${uploadResponse.url}`);
          return NextResponse.json({ success: true, previewUrl: uploadResponse.url });
        } else {
          console.log('[CaptureScreenshot] External service returned:', externalResponse.status);
        }
      } catch (extError) {
        console.log('[CaptureScreenshot] External screenshot service failed:', extError);
      }
    } else {
      console.log('[CaptureScreenshot] No published URL available for external service');
    }

    // No screenshot method worked - return gracefully
    console.log('[CaptureScreenshot] All screenshot methods failed, returning without screenshot');
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
