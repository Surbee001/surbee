import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/api/root'
import { createContext } from '@/server/api/trpc'

const handler = async (req: Request) => {
  let effectiveReq: Request = req
  if (req.method === 'POST') {
    try {
      const clonedReq = req.clone()
      const body = await clonedReq.text()

      // Attempt to normalize batch body to include { json: ... } wrapper (compat shim)
      try {
        const parsed = JSON.parse(body)
        const keys = Object.keys(parsed)

        const isBatch = keys.some((k) => /^\d+$/.test(k))
        const hasJsonWrapper = isBatch
          ? keys.every((k) => parsed[k] && typeof parsed[k] === 'object' && 'json' in parsed[k])
          : 'json' in parsed

        if (!hasJsonWrapper) {
          const headers = new Headers(req.headers)
          headers.set('content-type', 'application/json')

          if (isBatch) {
            // Wrap each batch item under json
            const wrapped: Record<string, any> = {}
            for (const k of keys) {
              const item = parsed[k]
              if (item && typeof item === 'object') {
                const { meta, json, ...rest } = item as any
                wrapped[k] = json !== undefined ? { json, ...(meta ? { meta } : {}) } : { json: rest, ...(meta ? { meta } : {}) }
              } else {
                wrapped[k] = { json: item }
              }
            }
            effectiveReq = new Request(req.url, { method: req.method, headers, body: JSON.stringify(wrapped) })
          } else {
            // Single-call: wrap whole body under json
            const singleWrapped = { json: parsed }
            effectiveReq = new Request(req.url, { method: req.method, headers, body: JSON.stringify(singleWrapped) })
          }
        }
      } catch {
        // Body is not JSON, pass through as-is
      }
    } catch {
      // Could not read request body, pass through as-is
    }
  }
  
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: effectiveReq,
    router: appRouter,
    createContext,
    onError: ({ error, path }) => {
      console.error(`tRPC error on ${path}:`, error.message);
    }
  })
}

export { handler as GET, handler as POST }

