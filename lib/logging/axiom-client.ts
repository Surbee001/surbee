import { Axiom } from '@axiomhq/js'

export class AxiomLogger {
  private axiom: Axiom
  private dataset: string

  constructor(dataset = process.env.AXIOM_DATASET || 'ai-survey-platform') {
    this.axiom = new Axiom({ token: process.env.AXIOM_TOKEN || '', orgId: process.env.AXIOM_ORG_ID })
    this.dataset = dataset
  }

  async logUserBehavior(data: {
    userId?: string
    sessionId: string
    surveyId: string
    eventType: 'mouse_move' | 'keystroke' | 'scroll' | 'focus' | 'blur' | 'visibility_change'
    payload: any
    timestamp: number
  }) {
    try {
      await this.axiom.ingest(this.dataset, [
        {
          _time: new Date(data.timestamp).toISOString(),
          event_type: 'user_behavior',
          user_id: data.userId,
          session_id: data.sessionId,
          survey_id: data.surveyId,
          behavior_type: data.eventType,
          ...data.payload,
          ip_address: this.getClientIP(),
          user_agent: this.getUserAgent(),
          page_url: this.getCurrentURL(),
        },
      ])
    } catch (error) {
      console.error('Failed to log behavioral data:', error)
    }
  }

  async logAIGeneration(data: {
    userId: string
    prompt: string
    promptHash: string
    model: string
    generationType: 'survey' | 'component' | 'validation'
    duration: number
    success: boolean
    error?: string
    tokensUsed?: number
    cost?: number
    cacheHit?: boolean
  }) {
    await this.axiom.ingest(this.dataset, [
      {
        _time: new Date().toISOString(),
        event_type: 'ai_generation',
        user_id: data.userId,
        prompt_hash: data.promptHash,
        model: data.model,
        generation_type: data.generationType,
        duration_ms: data.duration,
        success: data.success,
        error: data.error,
        tokens_used: data.tokensUsed,
        cost_usd: data.cost,
        cache_hit: data.cacheHit,
        memory_usage: typeof process !== 'undefined' ? (process.memoryUsage?.().heapUsed || 0) : 0,
        cpu_usage: typeof process !== 'undefined' ? process.cpuUsage?.() : undefined,
      },
    ])
  }

  async logFraudAnalysis(data: {
    responseId: string
    surveyId: string
    userId?: string
    fraudScore: number
    flagged: boolean
    riskFactors: string[]
    behavioralFeatures: number[]
    modelVersion: string
    processingTime: number
  }) {
    await this.axiom.ingest(this.dataset, [
      {
        _time: new Date().toISOString(),
        event_type: 'fraud_analysis',
        response_id: data.responseId,
        survey_id: data.surveyId,
        user_id: data.userId,
        fraud_score: data.fraudScore,
        flagged: data.flagged,
        risk_factors: data.riskFactors,
        model_version: data.modelVersion,
        processing_time_ms: data.processingTime,
        behavioral_features: JSON.stringify(data.behavioralFeatures || []),
      },
    ])
  }

  async logBusinessEvent(data: {
    eventType: 'survey_created' | 'survey_completed' | 'credit_earned' | 'credit_spent' | 'user_signup' | 'survey_started'
    userId?: string
    metadata?: Record<string, any>
  }) {
    await this.axiom.ingest(this.dataset, [
      { _time: new Date().toISOString(), event_type: 'business_event', business_event_type: data.eventType, user_id: data.userId, ...(data.metadata || {}) },
    ])
  }

  async logAPICall(data: {
    endpoint: string
    method: string
    userId?: string
    duration: number
    statusCode: number
    error?: string
    requestSize?: number
    responseSize?: number
  }) {
    await this.axiom.ingest(this.dataset, [
      {
        _time: new Date().toISOString(),
        event_type: 'api_call',
        endpoint: data.endpoint,
        method: data.method,
        user_id: data.userId,
        duration_ms: data.duration,
        status_code: data.statusCode,
        error: data.error,
        request_size_bytes: data.requestSize,
        response_size_bytes: data.responseSize,
      },
    ])
  }

  private eventBuffer: any[] = []
  private bufferSize = 100

  async bufferEvent(event: any) {
    this.eventBuffer.push({ ...event, _time: new Date().toISOString() })
    if (this.eventBuffer.length >= this.bufferSize) await this.flushBuffer()
  }

  async flushBuffer() {
    if (this.eventBuffer.length === 0) return
    try {
      await this.axiom.ingest(this.dataset, [...this.eventBuffer])
      this.eventBuffer = []
    } catch (error) {
      console.error('Failed to flush event buffer:', error)
    }
  }

  private getClientIP(): string { return 'unknown' }
  private getUserAgent(): string { return typeof window !== 'undefined' ? navigator.userAgent : 'server' }
  private getCurrentURL(): string { return typeof window !== 'undefined' ? window.location.href : 'server' }
}

export const axiomLogger = new AxiomLogger()

if (typeof window === 'undefined') {
  setInterval(() => axiomLogger.flushBuffer(), 5000)
}

