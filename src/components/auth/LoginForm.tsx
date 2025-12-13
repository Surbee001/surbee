"use client"
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const params = useSearchParams()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const back = params.get('redirectedFrom') || params.get('redirect') || '/'
        router.replace(back)
      }
    })
  }, [])
  const redirectTo = params.get('redirect') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      router.replace(redirectTo)
    } catch (err: any) {
      setError(err?.message || 'Authentication error')
    } finally {
      setLoading(false)
    }
  }

  async function oauth(provider: 'google' | 'github') {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin + '/auth/callback?next=' + encodeURIComponent(redirectTo) : undefined
        }
      })
      if (error) throw error
    } catch (err: any) {
      setError(err?.message || 'OAuth error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto flex">
        {/* Login Form - Left Side */}
        <div className="w-3/5 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-center mb-8">
              <img src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg" alt="Surbee" className="h-12" />
            </div>
            <h1 className="text-3xl font-normal text-center mb-8" style={{ fontFamily: 'Tobias, Sohne, sans-serif' }}>Welcome to Surbee</h1>
            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" className="w-full rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} placeholder="••••••••" className="w-full rounded-lg bg-white text-gray-900 placeholder:text-gray-500 border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300" />
              </div>
              {error && <div className="text-sm text-red-500">{error}</div>}
              <button disabled={loading} className="w-full rounded-lg bg-black hover:bg-gray-800 text-white py-2 transition-colors disabled:opacity-50">
                {loading ? 'Please wait...' : (mode === 'signin' ? 'Sign in' : 'Create account')}
              </button>
            </form>
            
            <div className="my-6 h-px w-full bg-gray-200" />
            
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => oauth('google')} disabled={loading} className="rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 py-2 transition-colors">Google</button>
              <button onClick={() => oauth('github')} disabled={loading} className="rounded-lg bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 py-2 transition-colors">GitHub</button>
            </div>
            
            <div className="mt-6 text-sm text-gray-600 text-center">
              {mode === 'signin' ? (
                <span>Don&apos;t have an account? <button onClick={() => setMode('signup')} className="text-gray-900 hover:underline font-medium">Sign up</button></span>
              ) : (
                <span>Already have an account? <button onClick={() => setMode('signin')} className="text-gray-900 hover:underline font-medium">Sign in</button></span>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Side - Gray Box */}
        <div className="w-2/5 bg-gray-100 rounded-xl">
        </div>
      </div>
    </div>
  )
}

