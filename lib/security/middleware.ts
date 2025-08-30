import type { NextApiRequest, NextApiResponse } from 'next'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import { verify } from 'jsonwebtoken'
import type { ZodSchema } from 'zod'

export const createRateLimit = (windowMs: number, max: number) =>
  rateLimit({ windowMs, max, message: 'Too many requests from this IP', standardHeaders: true, legacyHeaders: false })

export const rateLimits = {
  general: createRateLimit(15 * 60 * 1000, 100),
  ai: createRateLimit(60 * 60 * 1000, 10),
  auth: createRateLimit(15 * 60 * 1000, 5),
}

export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'api.openai.com', 'api.anthropic.com'],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
})

export function validateInput(schema: ZodSchema<any>) {
  return (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    try {
      const validated = schema.parse(req.body)
      ;(req as any).body = validated
      next()
    } catch (error: any) {
      res.status(400).json({ error: 'Invalid input', details: error?.errors || error?.message })
    }
  }
}

export function requireAuth(req: NextApiRequest, res: NextApiResponse, next: Function) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Authentication required' })
  try {
    const decoded = verify(token, process.env.JWT_SECRET || '')
    ;(req as any).user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function validateApiKey(req: NextApiRequest, res: NextApiResponse, next: Function) {
  const apiKey = req.headers['x-api-key']
  if (!apiKey || apiKey !== process.env.API_SECRET_KEY) return res.status(401).json({ error: 'Invalid API key' })
  next()
}

