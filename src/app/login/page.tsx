'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    try {
      setLoading(true)
      setError('')

      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      })

      if (signInError) {
        setError(signInError.message)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailContinue = async (e: React.FormEvent) => {
    e.preventDefault()
    // For now, redirect to Google OAuth since email flow isn't fully implemented
    await handleOAuthLogin('google')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: '#F7F7F4',
        fontFamily:
          '"Cursor Gothic", -apple-system, "system-ui", "Segoe UI (Custom)", Roboto, "Helvetica Neue", "Open Sans (Custom)", system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-black/95 text-slate-100 px-6 py-8 shadow-2xl border border-slate-800">
        <header className="mb-8">
          <div className="mb-6">
            <img
              className="h-8 w-auto"
              alt="Surbee"
              src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg"
            />
          </div>
          <h1 className="text-2xl font-semibold text-white">
            Welcome to Surbee
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            The new way to build software
          </p>
        </header>

        <div className="flex flex-col gap-3 mb-6">
          <button
            onClick={() => handleOAuthLogin('google')}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#151515] text-slate-50 border border-[#262626] py-2.5 px-4 text-sm font-medium hover:bg-[#1d1d1d] transition-colors"
          >
            <svg
              className="w-4 h-4"
              height="15"
              width="15"
              fill="none"
              viewBox="0 0 16 16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g>
                <path
                  d="M15.83 8.18C15.83 7.65333 15.7833 7.15333 15.7033 6.66667H8.17V9.67333H12.4833C12.29 10.66 11.7233 11.4933 10.8833 12.06V14.06H13.4567C14.9633 12.6667 15.83 10.6133 15.83 8.18Z"
                  fill="#4285F4"
                />
                <path
                  d="M8.17 16C10.33 16 12.1367 15.28 13.4567 14.06L10.8833 12.06C10.1633 12.54 9.25 12.8333 8.17 12.8333C6.08334 12.8333 4.31667 11.4267 3.68334 9.52667H1.03V11.5867C2.34334 14.2 5.04334 16 8.17 16Z"
                  fill="#34A853"
                />
                <path
                  d="M3.68334 9.52667C3.51667 9.04667 3.43 8.53333 3.43 8C3.43 7.46667 3.52334 6.95334 3.68334 6.47334V4.41334H1.03C0.483335 5.49334 0.170002 6.70667 0.170002 8C0.170002 9.29333 0.483335 10.5067 1.03 11.5867L3.68334 9.52667Z"
                  fill="#FBBC05"
                />
                <path
                  d="M8.17 3.16667C9.35 3.16667 10.4033 3.57334 11.2367 4.36667L13.5167 2.08667C12.1367 0.793334 10.33 0 8.17 0C5.04334 0 2.34334 1.8 1.03 4.41334L3.68334 6.47334C4.31667 4.57334 6.08334 3.16667 8.17 3.16667Z"
                  fill="#EA4335"
                />
              </g>
            </svg>
            <span>{loading ? 'Signing in…' : 'Continue with Google'}</span>
          </button>

          <button
            onClick={() => handleOAuthLogin('github')}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#151515] text-slate-50 border border-[#262626] py-2.5 px-4 text-sm font-medium hover:bg-[#1d1d1d] transition-colors"
          >
            <svg
              className="w-4 h-4"
              height="16"
              width="16"
              fill="none"
              viewBox="0 0 15 15"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
            <span>{loading ? 'Signing in…' : 'Continue with GitHub'}</span>
          </button>

          <button
            disabled
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#151515] text-slate-500 border border-[#262626] py-2.5 px-4 text-sm font-medium opacity-60 cursor-not-allowed"
          >
            <span>Continue with Apple</span>
          </button>
        </div>

        <form onSubmit={handleEmailContinue} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              className="w-full rounded-md bg-black border border-[#262626] px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Your email address"
              autoCapitalize="off"
              autoFocus
            />
          </div>

          <button
            className="w-full inline-flex items-center justify-center rounded-md bg-slate-50 text-slate-900 text-sm font-medium py-2.5 px-4 transition-colors hover:bg-white"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? 'Continuing…' : 'Continue'}</span>
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-6">
          Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
