import { NextResponse } from 'next/server';

/**
 * Cipher Health Check Endpoint
 *
 * Public endpoint for status page monitoring.
 * No authentication required.
 *
 * GET /api/cipher/health
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Basic health check - just verify the service is responding
    const health = {
      status: 'operational' as const,
      service: 'cipher',
      version: '1.0.0',
      timestamp: Date.now(),
      responseTimeMs: Date.now() - startTime,
    };

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Cipher-Status': 'operational',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'degraded',
        service: 'cipher',
        version: '1.0.0',
        timestamp: Date.now(),
        error: 'Service temporarily unavailable',
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Cipher-Status': 'degraded',
        },
      }
    );
  }
}

// Also support HEAD requests for lightweight health checks
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-Cipher-Status': 'operational',
    },
  });
}
