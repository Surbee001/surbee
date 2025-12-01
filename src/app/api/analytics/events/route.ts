import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

// Define valid event categories
const VALID_CATEGORIES = [
  'navigation',    // Page views, tab switches
  'feature',       // Feature usage (chat, preview, share, etc.)
  'survey',        // Survey creation, editing, publishing
  'interaction',   // User interactions (clicks, form submissions)
  'error',         // Client-side errors
  'performance',   // Performance metrics
] as const;

// Define valid event names for better typing
const VALID_EVENTS = [
  // Navigation events
  'page_view',
  'tab_switch',

  // Feature events
  'chat_message_sent',
  'chat_session_started',
  'preview_viewed',
  'preview_device_changed',
  'insights_viewed',
  'share_link_copied',
  'survey_published',
  'survey_unpublished',

  // Survey events
  'survey_created',
  'survey_edited',
  'survey_deleted',
  'question_added',
  'question_removed',

  // Interaction events
  'button_click',
  'modal_opened',
  'modal_closed',
  'form_submitted',

  // Error events
  'client_error',
  'api_error',

  // Performance events
  'page_load_time',
  'api_response_time',
] as const;

interface AnalyticsEvent {
  eventName: string;
  eventCategory: string;
  eventData?: Record<string, unknown>;
  sessionId?: string;
  pagePath?: string;
}

/**
 * POST /api/analytics/events
 * Track an analytics event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, events } = body as { userId?: string; events: AnalyticsEvent[] };

    // Validate events array
    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'Events array is required' }, { status: 400 });
    }

    // If userId is provided, check consent
    if (userId) {
      const { data: profile } = await supabaseAdmin
        .from('user_profiles')
        .select('analytics_consent')
        .eq('user_id', userId)
        .single();

      // If user has explicitly declined, don't track
      if (profile?.analytics_consent === false) {
        return NextResponse.json({ success: true, tracked: 0 });
      }
    }

    // Validate and prepare events for insertion
    const validEvents = events
      .filter((event) => {
        if (!event.eventName || !event.eventCategory) return false;
        if (!VALID_CATEGORIES.includes(event.eventCategory as typeof VALID_CATEGORIES[number])) {
          console.warn(`Invalid event category: ${event.eventCategory}`);
          return false;
        }
        return true;
      })
      .map((event) => ({
        user_id: userId || null,
        event_name: event.eventName,
        event_category: event.eventCategory,
        event_data: event.eventData || {},
        session_id: event.sessionId || null,
        page_path: event.pagePath || null,
      }));

    if (validEvents.length === 0) {
      return NextResponse.json({ error: 'No valid events to track' }, { status: 400 });
    }

    // Insert events
    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert(validEvents);

    if (error) {
      console.error('Error inserting analytics events:', error);
      return NextResponse.json({ error: 'Failed to track events' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      tracked: validEvents.length,
    });
  } catch (error) {
    console.error('Error in analytics events POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET /api/analytics/events
 * Get analytics summary (admin only - for now just basic stats)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const adminKey = searchParams.get('adminKey');

    // Simple admin key check (in production, use proper auth)
    if (adminKey !== process.env.ANALYTICS_ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get aggregated stats
    const { data: summary, error: summaryError } = await supabaseAdmin
      .from('analytics_events')
      .select('event_name, event_category, created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    if (summaryError) {
      console.error('Error fetching analytics:', summaryError);
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }

    // Aggregate the data
    const eventCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    const dailyCounts: Record<string, number> = {};

    for (const event of summary || []) {
      // Count by event name
      eventCounts[event.event_name] = (eventCounts[event.event_name] || 0) + 1;

      // Count by category
      categoryCounts[event.event_category] = (categoryCounts[event.event_category] || 0) + 1;

      // Count by day
      const day = new Date(event.created_at).toISOString().split('T')[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    }

    // Get unique user count
    const { count: uniqueUsers } = await supabaseAdmin
      .from('analytics_events')
      .select('user_id', { count: 'exact', head: true })
      .not('user_id', 'is', null)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString());

    return NextResponse.json({
      totalEvents: summary?.length || 0,
      uniqueUsers: uniqueUsers || 0,
      eventCounts,
      categoryCounts,
      dailyCounts,
      period: `${days} days`,
    });
  } catch (error) {
    console.error('Error in analytics GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
