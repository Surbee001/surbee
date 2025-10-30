import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server/api/root'
import { createContext } from '@/server/api/trpc'

const handler = async (req: Request) => {
  console.log('=== tRPC ROUTE CALLED ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  // Log request body for debugging
  let effectiveReq: Request = req
  if (req.method === 'POST') {
    try {
      const clonedReq = req.clone()
      const body = await clonedReq.text()
      console.log('Raw request body:', body)
      console.log('Body length:', body.length)

      // Attempt to normalize batch body to include { json: ... } wrapper (compat shim)
      try {
        const parsed = JSON.parse(body)
        const keys = Object.keys(parsed)
        console.log('Parsed body structure:', keys)

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
            console.log('Applied tRPC batch compat shim (added json wrapper)')
          } else {
            // Single-call: wrap whole body under json
            const singleWrapped = { json: parsed }
            effectiveReq = new Request(req.url, { method: req.method, headers, body: JSON.stringify(singleWrapped) })
            console.log('Applied tRPC single-call compat shim (wrapped body under json)')
          }
        }
      } catch (parseError) {
        console.log('Failed to parse body as JSON:', parseError)
      }
    } catch (bodyError) {
      console.log('Failed to read request body:', bodyError)
    }
  }
  
  return fetchRequestHandler({
    endpoint: '/api/trpc',
    req: effectiveReq,
    router: appRouter,
    createContext,
    onError: ({ error, path, input }) => {
      console.log('=== tRPC ERROR ===')
      console.log('Path:', path)
      console.log('Input received by tRPC:', input)
      console.log('Error details:', {
        code: error.code,
        message: error.message,
        cause: error.cause
      })
    }
  })
}

export { handler as GET, handler as POST }

