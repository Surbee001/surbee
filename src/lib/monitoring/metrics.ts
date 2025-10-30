// Placeholder metrics system - can be replaced with Prometheus, DataDog, etc.

interface MetricLabels {
  [key: string]: string | number
}

class MetricCollector {
  private metrics: Map<string, any[]> = new Map()

  observe(labels: MetricLabels, value: number) {
    const key = JSON.stringify(labels)
    if (!this.metrics.has(key)) {
      this.metrics.set(key, [])
    }
    this.metrics.get(key)?.push({ value, timestamp: Date.now() })
  }

  inc(labels: MetricLabels, value: number = 1) {
    this.observe(labels, value)
  }

  getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  reset() {
    this.metrics.clear()
  }
}

export const metrics = {
  generationDuration: new MetricCollector(),
  generationSuccess: new MetricCollector(), 
  generationFailure: new MetricCollector(),
  componentCompilation: new MetricCollector(),
  validationErrors: new MetricCollector(),
  analyticsEvents: new MetricCollector(),
}

// Export metrics data for monitoring dashboards
export function getMetricsSnapshot() {
  return {
    generationDuration: metrics.generationDuration.getMetrics(),
    generationSuccess: metrics.generationSuccess.getMetrics(),
    generationFailure: metrics.generationFailure.getMetrics(),
    componentCompilation: metrics.componentCompilation.getMetrics(),
    validationErrors: metrics.validationErrors.getMetrics(),
    analyticsEvents: metrics.analyticsEvents.getMetrics(),
    timestamp: new Date().toISOString(),
  }
}
