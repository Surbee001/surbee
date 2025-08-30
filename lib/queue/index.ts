import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq'
import IORedis from 'ioredis'

// Guard Redis connection - only connect if Redis URL is explicitly provided
const connection = process.env.REDIS_URL ? new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  lazyConnect: true,
}) : null

export const surveyQueue = connection ? new Queue('survey-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    removeOnComplete: true,
    backoff: { type: 'exponential', delay: 2000 },
  },
}) : null

export const surveyQueueEvents = connection ? new QueueEvents('survey-generation', {
  connection,
}) : null

export function addSurveyJob<T>(name: string, data: T, opts?: JobsOptions) {
  if (!surveyQueue) {
    console.warn('Redis not configured, skipping survey job')
    return Promise.resolve(null)
  }
  return surveyQueue.add(name, data as any, opts)
}

export function createSurveyWorker(
  handler: (data: any) => Promise<any>,
): Worker | null {
  if (!connection) {
    console.warn('Redis not configured, cannot create worker')
    return null
  }
  const worker = new Worker(
    'survey-generation',
    async (job) => {
      return handler(job.data)
    },
    { connection },
  )
  return worker
}

