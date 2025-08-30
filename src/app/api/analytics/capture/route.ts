import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
// Temporarily disable queue processing to fix build
// import { queueAnalyticsProcessing } from '../../../../../../lib/queue/setup'

const AnalyticsEventSchema = z.object({
  surveyId: z.string(),
  sessionId: z.string(),
  userId: z.string().optional(),
  eventType: z.enum([
    'survey_started', 'survey_completed', 'survey_abandoned',
    'page_viewed', 'page_left', 'question_viewed', 'question_answered',
    'question_skipped', 'validation_error', 'interaction_event'
  ]),
  componentId: z.string().optional(),
  pageId: z.string().optional(),
  data: z.record(z.any()).optional(),
  timestamp: z.number(),
  
  // Behavioral data
  behavioral: z.object({
    timeOnPage: z.number().optional(),
    responseTime: z.number().optional(),
    clickCount: z.number().optional(),
    scrollDepth: z.number().optional(),
    deviceType: z.enum(['desktop', 'tablet', 'mobile']).optional(),
    screenResolution: z.string().optional(),
    userAgent: z.string().optional(),
  }).optional(),
})

const BatchAnalyticsSchema = z.object({
  events: z.array(AnalyticsEventSchema),
})

export async function POST(req: NextRequest) {
  try {
    const body = BatchAnalyticsSchema.parse(await req.json())
    
    // Process each event
    const processedEvents = []
    
    for (const event of body.events) {
      try {
        // Store in database
        const { data: stored } = await supabase.from('survey_analytics').insert({
          survey_id: event.surveyId,
          session_id: event.sessionId,
          user_id: event.userId,
          event_type: event.eventType,
          component_id: event.componentId,
          page_id: event.pageId,
          event_data: event.data || {},
          behavioral_data: event.behavioral || {},
          timestamp: new Date(event.timestamp).toISOString(),
        }).select('id').single()
        
        processedEvents.push(stored.id)
        
        // Queue for advanced processing if needed
        if (event.eventType === 'survey_completed') {
          // TODO: Re-enable when queue system is properly configured
          // await queueAnalyticsProcessing({
          //   surveyId: event.surveyId,
          //   responseId: stored.id,
          //   behavioralData: event.behavioral || {},
          //   timestamp: new Date(event.timestamp),
          // })
          console.log('Survey completed, analytics queuing disabled')
        }
        
      } catch (eventError) {
        console.error(`Failed to process analytics event:`, eventError)
        // Continue processing other events
      }
    }
    
    return NextResponse.json({
      success: true,
      processed: processedEvents.length,
      total: body.events.length,
    })
    
  } catch (error: any) {
    console.error('Analytics capture error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'validation_error',
          details: error.errors 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint for retrieving analytics
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const surveyId = searchParams.get('surveyId')
  const sessionId = searchParams.get('sessionId')
  
  if (!surveyId) {
    return NextResponse.json(
      { success: false, error: 'surveyId required' },
      { status: 400 }
    )
  }
  
  try {
    const { data: analytics } = await supabase
      .from('survey_analytics')
      .select('*')
      .eq('survey_id', surveyId)
      .order('timestamp', { ascending: true })
      .maybeSingle()
    
    // Generate insights
    const insights = generateAnalyticsInsights(analytics)
    
    return NextResponse.json({
      success: true,
      data: {
        events: analytics,
        insights,
        summary: {
          totalEvents: analytics.length,
          uniqueSessions: new Set(analytics.map(a => a.sessionId)).size,
          completionRate: insights.completionRate,
          averageTime: insights.averageCompletionTime,
        }
      }
    })
    
  } catch (error) {
    console.error('Analytics retrieval error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve analytics' },
      { status: 500 }
    )
  }
}

function generateAnalyticsInsights(events: any[]) {
  const sessions = new Map()
  
  // Group events by session
  events.forEach(event => {
    if (!sessions.has(event.sessionId)) {
      sessions.set(event.sessionId, [])
    }
    sessions.get(event.sessionId).push(event)
  })
  
  const completedSessions = Array.from(sessions.values()).filter(sessionEvents => 
    sessionEvents.some((e: any) => e.eventType === 'survey_completed')
  ).length
  
  const totalSessions = sessions.size
  const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0
  
  // Calculate average completion time
  const completionTimes = Array.from(sessions.values())
    .filter(sessionEvents => sessionEvents.some((e: any) => e.eventType === 'survey_completed'))
    .map(sessionEvents => {
      const start = sessionEvents.find((e: any) => e.eventType === 'survey_started')
      const end = sessionEvents.find((e: any) => e.eventType === 'survey_completed')
      if (start && end) {
        return new Date(end.timestamp).getTime() - new Date(start.timestamp).getTime()
      }
      return null
    })
    .filter(time => time !== null)
  
  const averageCompletionTime = completionTimes.length > 0 
    ? completionTimes.reduce((a, b) => (a || 0) + (b || 0), 0) / completionTimes.length 
    : 0
  
  // Identify drop-off points
  const pageViews = events.filter(e => e.eventType === 'page_viewed')
  const pageDropoffs = new Map()
  
  pageViews.forEach(event => {
    const pageId = event.pageId
    if (pageId) {
      pageDropoffs.set(pageId, (pageDropoffs.get(pageId) || 0) + 1)
    }
  })
  
  return {
    completionRate: Math.round(completionRate * 100) / 100,
    averageCompletionTime: Math.round(averageCompletionTime / 1000), // Convert to seconds
    totalSessions,
    completedSessions,
    dropoffPoints: Array.from(pageDropoffs.entries())
      .map(([pageId, views]) => ({ pageId, views }))
      .sort((a, b) => b.views - a.views),
    recommendations: generateRecommendations(completionRate, averageCompletionTime / 1000),
  }
}

function generateRecommendations(completionRate: number, avgTimeSeconds: number) {
  const recommendations = []
  
  if (completionRate < 50) {
    recommendations.push({
      type: 'completion_rate',
      priority: 'high',
      message: 'Low completion rate detected. Consider reducing survey length or improving question clarity.',
    })
  }
  
  if (avgTimeSeconds > 600) { // 10 minutes
    recommendations.push({
      type: 'survey_length',
      priority: 'medium',
      message: 'Survey may be too long. Consider breaking into multiple shorter surveys or adding progress indicators.',
    })
  }
  
  if (avgTimeSeconds < 30) {
    recommendations.push({
      type: 'response_quality',
      priority: 'medium',
      message: 'Very fast completion times may indicate low engagement. Consider adding attention checks.',
    })
  }
  
  return recommendations
}
