import { Queue } from 'bullmq'
import IORedis from 'ioredis'

// Guard Redis connection - only connect if Redis URL is explicitly provided
const connection = process.env.REDIS_URL ? new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: true,
}) : null

export const surveyGenerationQueue = connection ? new Queue('survey-generation', { connection }) : null
export const analyticsQueue = connection ? new Queue('analytics-processing', { connection }) : null
export const creditQueue = connection ? new Queue('credit-distribution', { connection }) : null
export const fraudAnalysisQueue = connection ? new Queue('fraud-analysis', { connection }) : null

export interface SurveyGenerationJob {
  userId: string
  prompt: string
  context?: any
  priority: 'low' | 'normal' | 'high'
}

export interface AnalyticsJob {
  surveyId: string
  responseId: string
  behavioralData: any
  timestamp: Date
}

export interface CreditDistributionJob {
  userId: string
  action: string
  amount: number
  metadata?: any
}

export async function queueSurveyGeneration(data: SurveyGenerationJob) {
  if (!surveyGenerationQueue) {
    console.warn('Redis not configured, skipping queue operation')
    return null
  }
  return await surveyGenerationQueue.add('generate-survey', data, {
    priority: data.priority === 'high' ? 1 : data.priority === 'low' ? 3 : 2,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  })
}

export async function queueAnalyticsProcessing(data: AnalyticsJob) {
  if (!analyticsQueue) {
    console.warn('Redis not configured, skipping analytics queue')
    return null
  }
  return await analyticsQueue.add('process-analytics', data, {
    delay: 5000,
    attempts: 2,
  })
}

export async function queueCreditDistribution(data: CreditDistributionJob) {
  if (!creditQueue) {
    console.warn('Redis not configured, skipping credit queue')
    return null
  }
  return await creditQueue.add('distribute-credit', data, { attempts: 2 })
}

