import client from 'prom-client'

client.collectDefaultMetrics()

export const metrics = {
  generationDuration: new client.Histogram({
    name: 'survey_generation_duration_seconds',
    help: 'Time taken to generate survey components',
    labelNames: ['model', 'complexity'] as const,
    buckets: [0.1, 0.3, 0.5, 1, 2, 5, 10],
  }),
  generationSuccess: new client.Counter({
    name: 'survey_generation_success_total',
    help: 'Number of successful survey generations',
    labelNames: ['model', 'survey_type'] as const,
  }),
  fraudDetected: new client.Counter({
    name: 'fraud_detected_total',
    help: 'Number of fraudulent responses detected',
    labelNames: ['survey_id', 'fraud_type'] as const,
  }),
  surveyCompletions: new client.Counter({
    name: 'survey_completions_total',
    help: 'Number of completed surveys',
    labelNames: ['survey_id', 'user_type'] as const,
  }),
  creditTransactions: new client.Counter({
    name: 'credit_transactions_total',
    help: 'Number of credit transactions',
    labelNames: ['action', 'user_id'] as const,
  }),
  httpRequestDuration: new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'route'] as const,
    buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2, 5],
  }),
}

export function observeHttp(reqMethod: string, route: string, durationMs: number) {
  metrics.httpRequestDuration.observe({ method: reqMethod, route }, durationMs / 1000)
}

