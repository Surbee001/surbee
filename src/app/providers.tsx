"use client"
import React from 'react'
import superjson from 'superjson'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { api } from '@/lib/trpc/react'
import { httpLink, loggerLink } from '@trpc/client'
import { supabase } from '@/lib/supabase'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { RealtimeProvider } from '@/contexts/RealtimeContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) return false;
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      mutations: {
        retry: 1,
      },
    },
  }))
  const [trpcClient] = React.useState(() =>
    api.createClient({
      transformer: superjson,
      links: [
        loggerLink({
          enabled: () => true,
        }),
        httpLink({
          url: '/api/trpc',
          headers: async () => {
            try {
              const { data } = await supabase.auth.getSession()
              const token = data?.session?.access_token
              return token ? { Authorization: `Bearer ${token}` } : {}
            } catch {
              return {}
            }
          },
        }),
      ],
    }),
  )

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ErrorBoundary>
          <RealtimeProvider>
            <ThemeProvider>
              <api.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
                  <ErrorBoundary>
                    {children}
                  </ErrorBoundary>
                  <Toaster position="top-right" />
                </QueryClientProvider>
              </api.Provider>
            </ThemeProvider>
          </RealtimeProvider>
        </ErrorBoundary>
      </AuthProvider>
    </ErrorBoundary>
  )
}

