import { NextRequest, NextResponse } from 'next/server';
import { getUsageStats } from '@/lib/credits';

/**
 * GET /api/credits/usage
 * Get user's credit usage statistics
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

    const usage = await getUsageStats(userId);

    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
