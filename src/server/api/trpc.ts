import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import type { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export type Session = { user: { id: string } } | null

export async function createContext(opts?: { req?: NextRequest }) {
  let session: Session = null
  try {
    const authHeader = opts?.req?.headers.get('authorization')
    console.log('Auth header present:', !!authHeader)
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    console.log('Token extracted:', !!token)
    
    if (token) {
      try {
        const { data, error } = await supabase.auth.getUser(token)
        console.log('Supabase auth result:', { hasUser: !!data?.user, error: error?.message })
        if (data?.user) session = { user: { id: data.user.id } }
      } catch (authError) {
        console.log('Supabase auth failed:', authError)
        // Don't throw - just continue without session
      }
    }
  } catch (contextError) {
    console.log('Context creation error:', contextError)
    // Don't throw - return empty session
  }
  
  console.log('Final session:', session ? 'authenticated' : 'anonymous')
  return { session }
}

type Context = Awaited<ReturnType<typeof createContext>>

const t = initTRPC.context<Context>().create({ transformer: superjson })

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next()
})

