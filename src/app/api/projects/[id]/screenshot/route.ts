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
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_M2wj4PhFgmzJpOwj1oPguux0kw4=',
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/on0moldgr',
    });
  }
  return imagekitInstance;
}

/**
 * POST /api/projects/[id]/screenshot
 * Accepts a screenshot image and saves it as the project preview
 */
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: projectId } = await context.params;
    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    if (!imageFile) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    return NextResponse.json({
      success: true,
      previewUrl: uploadResponse.url,
    });
  } catch (error) {
    console.error('Error saving screenshot:', error);
    return NextResponse.json(
      { error: 'Failed to save screenshot' },
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
