import { NextRequest, NextResponse } from 'next/server';
import { getUserCredits } from '@/lib/credits';

/**
 * GET /api/credits
 * Get user's current credit balance
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const credits = await getUserCredits(userId);

    if (!credits) {
      return NextResponse.json(
        { error: 'Could not fetch credits' },
        { status: 500 }
      );
    }

    return NextResponse.json(credits);
  } catch (error) {
    console.error('Error fetching credits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
