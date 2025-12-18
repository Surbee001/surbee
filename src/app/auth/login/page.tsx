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
    <>
      <div
        className="flex flex-col gap-5 pt-4 pb-9"
        style={{
          gridRowStart: '2',
          color: 'rgb(238, 238, 238)',
          fontFamily:
            '"Cursor Gothic", -apple-system, "system-ui", "Segoe UI (Custom)", Roboto, "Helvetica Neue", "Open Sans (Custom)", system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        <div className="flex flex-col items-center justify-center gap-5 ak-Header">
          <img
            className="ak-Logo ak-Logo-light h-10 w-auto"
            alt="Surbee"
            src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg"
          />
          <img
            className="ak-Logo ak-Logo-dark h-10 w-auto hidden"
            alt="Surbee"
            src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg"
          />
          <h1 className="text-2xl font-normal text-center balance ak-Heading">
            Sign in
          </h1>
        </div>

        <div className="bg-slate-900/80 rounded-2xl shadow-xl p-6 border border-slate-700/80 ak-Card max-w-md w-full mx-auto">
          <form onSubmit={handleEmailContinue} className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 ak-AuthForm">
              <div className="flex flex-col gap-2">
                <div className="flex">
                  <label
                    className="text-sm font-bold text-slate-100 ak-Label"
                    htmlFor="radix-:R2kbj7puljsq:"
                  >
                    Email
                  </label>
                </div>
                <div className="text-slate-50 border border-slate-700 rounded-lg bg-slate-900 ak-TextField">
                  <input
                    id="radix-:R2kbj7puljsq:"
                    className="w-full rounded-lg bg-transparent text-slate-50 placeholder:text-slate-500 border-0 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Your email address"
                    autoCapitalize="off"
                    autoFocus
                  />
                </div>
              </div>

              <button
                className="relative w-full inline-flex items-center justify-center rounded-lg bg-slate-50 text-slate-900 text-sm font-medium py-2.5 px-4 transition-colors hover:bg-white ak-PrimaryButton"
                type="submit"
                disabled={loading}
                style={{ position: 'relative' }}
              >
                <span>{loading ? 'Continuing…' : 'Continue'}</span>
              </button>
            </div>

            <div className="text-xs text-slate-400 text-center ak-TextSeparator">
              OR
            </div>

            <div className="flex flex-col gap-3 ak-AuthMethodsProviders">
              {/* Google OAuth */}
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-slate-50 border border-slate-600 py-2.5 px-4 text-sm font-medium hover:bg-slate-800 transition-colors ak-AuthButton"
                style={{ overflow: 'visible', position: 'relative', display: 'inline-flex', flexGrow: 1 }}
              >
                <svg
                  className="w-4 h-4 ak-AuthButtonIcon"
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
                <span className="text-sm ak-AuthButtonLabel">
                  {loading ? 'Signing in…' : 'Continue with Google'}
                </span>
              </button>

              {/* GitHub OAuth */}
              <button
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-slate-50 border border-slate-600 py-2.5 px-4 text-sm font-medium hover:bg-slate-800 transition-colors ak-AuthButton"
                style={{ overflow: 'visible', position: 'relative', display: 'inline-flex', flexGrow: 1 }}
              >
                <svg
                  className="w-4 h-4 ak-AuthButtonIcon"
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
                <span className="text-sm ak-AuthButtonLabel">
                  {loading ? 'Signing in…' : 'Continue with GitHub'}
                </span>
              </button>

              {/* Apple OAuth - Placeholder (disabled in Supabase config) */}
              <button
                disabled={true}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-slate-50 border border-slate-600 py-2.5 px-4 text-sm font-medium opacity-50 cursor-not-allowed ak-AuthButton"
                style={{ overflow: 'visible', position: 'relative', display: 'inline-flex', flexGrow: 1 }}
              >
                <svg
                  className="w-4 h-4 ak-AuthButtonIcon"
                  height="15"
                  width="15"
                  fill="none"
                  viewBox="0 0 15 15"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ overflow: 'visible' }}
                >
                  <path
                    d="M14.219 3.33667C14.1169 3.41674 12.3137 4.44312 12.3137 6.72534C12.3137 9.3651 14.6082 10.299 14.6769 10.3221C14.6663 10.379 14.3124 11.601 13.4671 12.8462C12.7134 13.942 11.9263 15.0359 10.7288 15.0359C9.53134 15.0359 9.22317 14.3333 7.84081 14.3333C6.49366 14.3333 6.01469 15.0591 4.91935 15.0591C3.82401 15.0591 3.05978 14.0451 2.18104 12.8C1.1632 11.3378 0.34082 9.06625 0.34082 6.91034C0.34082 3.45232 2.56668 1.61835 4.75732 1.61835C5.92133 1.61835 6.89164 2.39036 7.62246 2.39036C8.31802 2.39036 9.40277 1.5721 10.7271 1.5721C11.2289 1.5721 13.0321 1.61835 14.219 3.33667ZM10.0984 0.108136C10.646 -0.548247 11.0334 -1.459 11.0334 -2.36975C11.0334 -2.49605 11.0229 -2.62412 11 -2.72729C10.1089 -2.6935 9.04883 -2.12783 8.40959 -1.37895C7.90772 -0.802617 7.43931 0.108136 7.43931 1.03134C7.43931 1.1701 7.46218 1.30883 7.47277 1.35331C7.52909 1.36398 7.62067 1.37643 7.71224 1.37643C8.51172 1.37643 9.51724 0.835672 10.0984 0.108136Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-sm ak-AuthButtonLabel">
                  Continue with Apple
                </span>
              </button>
            </div>
          </form>

          <p className="text-sm text-center text-slate-400 mt-5">
            Don't have an account?{' '}
            <button
              onClick={() => router.push('/dashboard')}
              className="text-slate-100 hover:text-white underline-offset-4 hover:underline ak-Link"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
html {
  color-scheme: dark;
}
`,
        }}
      />
    </>
  )
}
