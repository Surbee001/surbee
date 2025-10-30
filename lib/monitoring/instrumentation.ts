import * as Sentry from '@sentry/nextjs'
import { datadogRum as DatadogRum } from '@datadog/browser-rum'

export function initializeMonitoring() {
  if (process.env.SENTRY_DSN && !Sentry.isInitialized?.()) {
    Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV, tracesSampleRate: 0.1 })
  }

  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_DD_APPLICATION_ID && process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN) {
    DatadogRum.init({
      applicationId: process.env.NEXT_PUBLIC_DD_APPLICATION_ID!,
      clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
      site: 'datadoghq.com',
      service: 'ai-survey-platform',
      env: process.env.NODE_ENV,
      version: (process as any)?.env?.npm_package_version,
      sessionSampleRate: 100,
      sessionReplaySampleRate: 20,
      trackUserInteractions: true,
      trackResources: true,
      trackLongTasks: true,
    })
  }
}

export class MetricsCollector {
  private static instance: MetricsCollector
  static getInstance() { if (!this.instance) this.instance = new MetricsCollector(); return this.instance }

  trackGenerationMetrics(duration: number, model: string, success: boolean) {
    Sentry.addBreadcrumb({ category: 'ai-generation', message: `Survey generation ${success ? 'completed' : 'failed'}`, data: { duration, model }, level: success ? 'info' : 'error' })
    if (typeof window !== 'undefined') { DatadogRum.addAction('survey_generation', { duration, model, success }) }
  }

  trackFraudDetection(responseId: string, fraudScore: number, flagged: boolean, actualFraud?: boolean) {
    const data = { responseId, fraudScore, flagged, ...(actualFraud !== undefined && { actualFraud }) }
    Sentry.addBreadcrumb({ category: 'fraud-detection', data, level: 'info' })
    if (actualFraud !== undefined) {
      const accurate = flagged === actualFraud
      this.trackMetric('fraud_detection_accuracy', accurate ? 1 : 0, { fraud_score: String(fraudScore) })
    }
  }

  trackUserEngagement(action: string, metadata?: Record<string, any>) {
    if (typeof window !== 'undefined') { DatadogRum.addAction(action, metadata) }
  }

  private trackMetric(name: string, value: number, tags?: Record<string, string>) {
    fetch('/api/metrics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, value, tags }) }).catch(() => {})
  }
}

export const metrics = MetricsCollector.getInstance()

