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
 * POST /api/projects/[id]/screenshot
 * Captures a screenshot of the project's preview and saves it
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const { userId, customUrl } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    // Get project details to find the preview URL
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, published_url, user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Determine the preview URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://surbee.com';
    const previewUrl = customUrl || `${baseUrl}/s/${project.published_url || projectId}`;

    console.log(`📸 Capturing screenshot for project ${projectId} from ${previewUrl}`);

    // Use Microlink Screenshot API (free tier)
    // Documentation: https://microlink.io/docs/api/parameters/screenshot
    const screenshotApiUrl = new URL('https://api.microlink.io');
    screenshotApiUrl.searchParams.set('url', previewUrl);
    screenshotApiUrl.searchParams.set('screenshot', 'true');
    screenshotApiUrl.searchParams.set('meta', 'false');
    screenshotApiUrl.searchParams.set('embed', 'screenshot.url');
    screenshotApiUrl.searchParams.set('viewport.width', '1200');
    screenshotApiUrl.searchParams.set('viewport.height', '900');
    screenshotApiUrl.searchParams.set('viewport.deviceScaleFactor', '2');
    screenshotApiUrl.searchParams.set('waitForTimeout', '3000'); // Wait for content to load

    const screenshotResponse = await fetch(screenshotApiUrl.toString(), {
      headers: {
        'x-api-key': process.env.MICROLINK_API_KEY || '', // Optional: for higher rate limits
      },
    });

    if (!screenshotResponse.ok) {
      // Fallback: Try alternative screenshot service (screenshotone)
      console.log('Microlink failed, trying alternative...');

      const altScreenshotUrl = `https://shot.screenshotapi.net/screenshot?token=${process.env.SCREENSHOTAPI_TOKEN || 'demo'}&url=${encodeURIComponent(previewUrl)}&width=1200&height=900&delay=3000&output=image&file_type=png`;

      const altResponse = await fetch(altScreenshotUrl);
      if (!altResponse.ok) {
        console.error('Screenshot capture failed');
        return NextResponse.json({ error: 'Failed to capture screenshot' }, { status: 500 });
      }

      // Get the image buffer
      const imageBuffer = await altResponse.arrayBuffer();

      // Upload to ImageKit
      const uploadResponse = await getImageKit().upload({
        file: Buffer.from(imageBuffer),
        fileName: `preview_${projectId}_${Date.now()}.png`,
        folder: '/project-previews',
      });

      // Update project with new preview URL
      await supabaseAdmin
        .from('projects')
        .update({
          preview_image_url: uploadResponse.url,
          last_preview_generated_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', projectId);

      return NextResponse.json({
        success: true,
        previewUrl: uploadResponse.url,
        source: 'screenshotapi',
      });
    }

    // Get the screenshot URL from Microlink response
    const screenshotUrl = await screenshotResponse.text();

    if (!screenshotUrl || !screenshotUrl.startsWith('http')) {
      // Parse as JSON if not a direct URL
      try {
        const jsonResponse = JSON.parse(screenshotUrl);
        const imageUrl = jsonResponse?.data?.screenshot?.url;

        if (imageUrl) {
          // Download and re-upload to ImageKit for persistence
          const imageResponse = await fetch(imageUrl);
          const imageBuffer = await imageResponse.arrayBuffer();

          const uploadResponse = await getImageKit().upload({
            file: Buffer.from(imageBuffer),
            fileName: `preview_${projectId}_${Date.now()}.png`,
            folder: '/project-previews',
          });

          // Update project with new preview URL
          await supabaseAdmin
            .from('projects')
            .update({
              preview_image_url: uploadResponse.url,
              last_preview_generated_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', projectId);

          return NextResponse.json({
            success: true,
            previewUrl: uploadResponse.url,
            source: 'microlink',
          });
        }
      } catch (e) {
        console.error('Failed to parse screenshot response:', e);
      }

      return NextResponse.json({ error: 'Failed to get screenshot URL' }, { status: 500 });
    }

    // Download the screenshot and upload to ImageKit
    const imageResponse = await fetch(screenshotUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    const uploadResponse = await getImageKit().upload({
      file: Buffer.from(imageBuffer),
      fileName: `preview_${projectId}_${Date.now()}.png`,
      folder: '/project-previews',
    });

    // Delete previous preview if exists (to save storage)
    if (project.published_url) {
      try {
        // List files in the folder with the project ID prefix
        const files = await getImageKit().listFiles({
          path: '/project-previews',
          searchQuery: `name:"preview_${projectId}"`,
        });

        // Delete old files (keep only the newest)
        for (const file of files.slice(1)) {
          await getImageKit().deleteFile(file.fileId);
        }
      } catch (e) {
        console.log('Could not clean up old previews:', e);
      }
    }

    // Update project with new preview URL
    await supabaseAdmin
      .from('projects')
      .update({
        preview_image_url: uploadResponse.url,
        last_preview_generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    console.log(`✅ Screenshot captured and saved: ${uploadResponse.url}`);

    return NextResponse.json({
      success: true,
      previewUrl: uploadResponse.url,
      source: 'microlink',
    });
  } catch (error) {
    console.error('Error capturing screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to capture screenshot' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/projects/[id]/screenshot
 * Returns the current preview image URL for a project
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .select('preview_image_url, last_preview_generated_at')
      .eq('id', projectId)
      .single();

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({
      previewUrl: project.preview_image_url,
      generatedAt: project.last_preview_generated_at,
    });
  } catch (error) {
    console.error('Error fetching screenshot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
