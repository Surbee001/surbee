import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import IORedis from 'ioredis'

interface ServiceStatus { status: 'up' | 'down'; responseTime?: number; error?: string }

export async function GET() {
  const checks = {
    status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      ai: await checkAI(),
      fraud: await checkFraudService(),
    },
  }
  const serviceStatuses = Object.values(checks.services)
  const down = serviceStatuses.filter((s) => s.status === 'down').length
  if (down > 0) checks.status = down === serviceStatuses.length ? 'unhealthy' : 'degraded'
  if (checks.status === 'healthy') (checks as any).metrics = await gatherMetrics()
  const statusCode = checks.status === 'healthy' ? 200 : checks.status === 'degraded' ? 200 : 503
  return NextResponse.json(checks, { status: statusCode })
}

async function checkDatabase(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    await supabase.from('projects').select('id', { count: 'exact', head: true }).limit(1)
    return { status: 'up', responseTime: Date.now() - start }
  } catch (e: any) {
    return { status: 'down', error: e?.message }
  }
}

async function checkRedis(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    if (!process.env.REDIS_URL || process.env.DISABLE_REDIS === 'true') {
      return { status: 'down' }
    }
    const redis = new IORedis(process.env.REDIS_URL)
    await redis.ping()
    await redis.disconnect()
    return { status: 'up', responseTime: Date.now() - start }
  } catch (e: any) {
    return { status: 'down', error: e?.message }
  }
}

async function checkAI(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const resp = await fetch('https://api.openai.com/v1/models', { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } })
    if (!resp.ok) throw new Error(`AI API returned ${resp.status}`)
    return { status: 'up', responseTime: Date.now() - start }
  } catch (e: any) {
    return { status: 'down', error: e?.message }
  }
}

async function checkFraudService(): Promise<ServiceStatus> {
  const start = Date.now()
  try {
    const url = (process.env.FRAUD_API_URL || 'http://localhost:8000') + '/health'
    const resp = await fetch(url)
    if (!resp.ok) throw new Error(`Fraud service returned ${resp.status}`)
    return { status: 'up', responseTime: Date.now() - start }
  } catch (e: any) {
    return { status: 'down', error: e?.message }
  }
}

async function gatherMetrics() {
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000)
  // Approximate metrics using Supabase counts
  const { count: recentResponses } = await supabase
    .from('survey_responses')
    .select('*', { count: 'exact', head: true })
    .gte('completed_at', hourAgo.toISOString())
  const activeUsers = 0
  const recentErrors = 0
  return { activeUsers, responsesPerHour: recentResponses, errorRate: recentErrors / Math.max(recentResponses, 1) }
}

