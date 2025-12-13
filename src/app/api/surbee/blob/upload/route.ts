import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { requireAuth } from '@/lib/auth-utils';

// Security: Allowed file types (MIME types)
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/csv',
  'application/json',
];

// Security: Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Security: Sanitize filename to prevent path traversal and other attacks
function sanitizeFilename(filename: string): string {
  // Remove path separators and special characters
  const sanitized = filename
    .replace(/[/\\]/g, '_') // Replace path separators
    .replace(/\.\./g, '_') // Prevent path traversal
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Only allow safe characters
    .replace(/^\./, '_') // Don't start with dot
    .substring(0, 100); // Limit length

  return sanitized || 'unnamed_file';
}

// Security: Validate file signature (magic bytes) matches MIME type
function validateFileSignature(buffer: ArrayBuffer, mimeType: string): boolean {
  const bytes = new Uint8Array(buffer);

  // Check magic bytes for common file types
  const signatures: Record<string, number[][]> = {
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/png': [[0x89, 0x50, 0x4e, 0x47]],
    'image/gif': [[0x47, 0x49, 0x46, 0x38]],
    'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  };

  const expectedSignatures = signatures[mimeType];
  if (!expectedSignatures) {
    // For types we don't have signatures for, allow based on extension
    return true;
  }

  return expectedSignatures.some((sig) =>
    sig.every((byte, index) => bytes[index] === byte)
  );
}

export async function POST(req: NextRequest) {
  try {
    // Security: Require authentication
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Security: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` },
        { status: 400 }
      );
    }

    // Security: Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Allowed types: images, PDF, CSV, JSON' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    // Security: Validate file signature matches declared MIME type
    if (!validateFileSignature(arrayBuffer, file.type)) {
      return NextResponse.json(
        { error: 'File content does not match declared type' },
        { status: 400 }
      );
    }

    // Security: Sanitize filename and create unique path
    const sanitizedName = sanitizeFilename(file.name);
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const path = `uploads/${user.id}/${uniqueId}-${sanitizedName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'public')
      .upload(path, new Uint8Array(arrayBuffer), {
        contentType: file.type,
        upsert: false, // Security: Don't allow overwriting
      });

    if (error) {
      console.error('File upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: pub } = supabase.storage
      .from(process.env.NEXT_PUBLIC_SUPABASE_BUCKET || 'public')
      .getPublicUrl(path);

    return NextResponse.json({
      url: pub?.publicUrl || null,
      path,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'An error occurred during upload' },
      { status: 500 }
    );
  }
}
