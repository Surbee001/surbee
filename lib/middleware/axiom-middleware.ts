import type { NextApiRequest, NextApiResponse } from 'next'
import { axiomLogger } from '@/lib/logging/axiom-client'

export function withAxiomLogging(handler: (req: NextApiRequest, res: NextApiResponse) => any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = Date.now()
    const requestSize = req.body ? JSON.stringify(req.body).length : 0
    try {
      const result = await handler(req, res)
      const duration = Date.now() - start
      await axiomLogger.logAPICall({
        endpoint: req.url || 'unknown',
        method: req.method || 'GET',
        userId: (req as any).user?.id,
        duration,
        statusCode: res.statusCode,
        requestSize,
        responseSize: result ? JSON.stringify(result).length : 0,
      })
      return result
    } catch (error: any) {
      const duration = Date.now() - start
      await axiomLogger.logAPICall({ endpoint: req.url || 'unknown', method: req.method || 'GET', userId: (req as any).user?.id, duration, statusCode: 500, error: error?.message, requestSize })
      throw error
    }
  }
}

