import { NextResponse } from 'next/server';
import { fetchBlogPosts } from '@/lib/notion';

export async function GET() {
  try {
    const posts = await fetchBlogPosts();
    return NextResponse.json({ posts });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load posts' }, { status: 500 });
  }
}

