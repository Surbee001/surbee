import { Axiom } from '@axiomhq/js'

export class AxiomAnalytics {
  private axiom: Axiom
  private dataset: string
  constructor() {
    this.axiom = new Axiom({ token: process.env.AXIOM_TOKEN || '', orgId: process.env.AXIOM_ORG_ID })
    this.dataset = process.env.AXIOM_DATASET || 'ai-survey-platform'
  }

  async getFraudAnalytics(timeRange = '1h') {
    const query = `['${this.dataset}'] | where _time >= ago(${timeRange}) | where event_type == "fraud_analysis" | summarize total_analyses = count(), flagged_count = countif(flagged == true), avg_fraud_score = avg(fraud_score), fraud_rate = (countif(flagged == true) * 100.0) / count() by bin(_time, 5m) | order by _time desc`
    return await (this.axiom as any).query(query)
  }

  async getAIPerformanceMetrics(timeRange = '24h') {
    const query = `['${this.dataset}'] | where _time >= ago(${timeRange}) | where event_type == "ai_generation" | summarize total_generations = count(), success_rate = (countif(success == true) * 100.0) / count(), avg_duration = avg(duration_ms), cache_hit_rate = (countif(cache_hit == true) * 100.0) / count(), total_cost = sum(cost_usd) by model, generation_type | order by total_generations desc`
    return await (this.axiom as any).query(query)
  }

  async getUserBehaviorPatterns(surveyId: string, limit = 1000) {
    const query = `['${this.dataset}'] | where event_type == "user_behavior" | where survey_id == "${surveyId}" | where _time >= ago(7d) | project session_id, behavior_type, payload, _time | take ${limit}`
    return await (this.axiom as any).query(query)
  }

  async getBusinessMetrics(timeRange = '7d') {
    const query = `['${this.dataset}'] | where _time >= ago(${timeRange}) | where event_type == "business_event" | summarize count() by business_event_type, bin(_time, 1d) | order by _time desc`
    return await (this.axiom as any).query(query)
  }

  async getAPIPerformance(timeRange = '1h') {
    const query = `['${this.dataset}'] | where _time >= ago(${timeRange}) | where event_type == "api_call" | summarize request_count = count(), avg_duration = avg(duration_ms), error_rate = (countif(status_code >= 400) * 100.0) / count(), p95_duration = percentile(duration_ms, 95) by endpoint, bin(_time, 5m) | order by _time desc`
    return await (this.axiom as any).query(query)
  }
}

export const axiomAnalytics = new AxiomAnalytics()

