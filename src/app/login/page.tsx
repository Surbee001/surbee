'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [isHovered, setIsHovered] = useState<string | null>(null)

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

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    try {
      setLoading(true)
      setError('')

      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      })

      if (signInError) {
        setError(signInError.message)
      } else {
        setEmailSent(true)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: '#F7F7F4',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          width: '100%',
          maxWidth: '400px',
          display: 'flex',
          flexDirection: 'column',
          gap: '32px',
        }}
      >
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          <h1
            style={{
              fontFamily: "'Opening Hours Sans', 'Inter', sans-serif",
              fontSize: '26px',
              lineHeight: '1.2em',
              letterSpacing: '-0.05em',
              color: '#11100C',
              margin: 0,
              fontWeight: 400,
            }}
          >
            {emailSent ? 'Check your email' : 'Welcome to Surbee'}
          </h1>
          <p
            style={{
              fontSize: '15px',
              lineHeight: '1.5',
              color: '#646464',
              margin: 0,
            }}
          >
            {emailSent
              ? `We sent a magic link to ${email}. Click the link to sign in.`
              : 'Sign in to create and analyze surveys with AI.'
            }
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {emailSent ? (
            <motion.div
              key="email-sent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
            >
              <button
                onClick={() => {
                  setEmailSent(false)
                  setEmail('')
                  setShowEmailInput(false)
                }}
                style={{
                  padding: '12px 20px',
                  backgroundColor: 'transparent',
                  color: '#11100C',
                  border: '1px solid rgba(100, 100, 100, 0.2)',
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F2C4FF'
                  e.currentTarget.style.borderColor = '#F2C4FF'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.borderColor = 'rgba(100, 100, 100, 0.2)'
                }}
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="login-options"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              {/* Google Sign In */}
              <button
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
                onMouseEnter={() => setIsHovered('google')}
                onMouseLeave={() => setIsHovered(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '12px 20px',
                  backgroundColor: isHovered === 'google' ? '#F2C4FF' : '#000000',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'background-color 0.25s ease',
                  width: '100%',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <path d="M15.83 8.18C15.83 7.65333 15.7833 7.15333 15.7033 6.66667H8.17V9.67333H12.4833C12.29 10.66 11.7233 11.4933 10.8833 12.06V14.06H13.4567C14.9633 12.6667 15.83 10.6133 15.83 8.18Z" fill="#4285F4"/>
                  <path d="M8.17 16C10.33 16 12.1367 15.28 13.4567 14.06L10.8833 12.06C10.1633 12.54 9.25 12.8333 8.17 12.8333C6.08334 12.8333 4.31667 11.4267 3.68334 9.52667H1.03V11.5867C2.34334 14.2 5.04334 16 8.17 16Z" fill="#34A853"/>
                  <path d="M3.68334 9.52667C3.51667 9.04667 3.43 8.53333 3.43 8C3.43 7.46667 3.52334 6.95334 3.68334 6.47334V4.41334H1.03C0.483335 5.49334 0.170002 6.70667 0.170002 8C0.170002 9.29333 0.483335 10.5067 1.03 11.5867L3.68334 9.52667Z" fill="#FBBC05"/>
                  <path d="M8.17 3.16667C9.35 3.16667 10.4033 3.57334 11.2367 4.36667L13.5167 2.08667C12.1367 0.793334 10.33 0 8.17 0C5.04334 0 2.34334 1.8 1.03 4.41334L3.68334 6.47334C4.31667 4.57334 6.08334 3.16667 8.17 3.16667Z" fill="#EA4335"/>
                </svg>
                <span>{loading ? 'Signing in...' : 'Continue with Google'}</span>
              </button>

              {/* Divider */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  margin: '8px 0',
                }}
              >
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(100, 100, 100, 0.2)' }} />
                <span style={{ fontSize: '12px', color: '#646464', textTransform: 'uppercase', letterSpacing: '0.05em' }}>or</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(100, 100, 100, 0.2)' }} />
              </div>

              {/* Email Input */}
              {showEmailInput ? (
                <motion.form
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  onSubmit={handleEmailLogin}
                  style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
                >
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    placeholder="Enter your email"
                    disabled={loading}
                    required
                    autoFocus
                    style={{
                      padding: '12px 16px',
                      backgroundColor: '#FFFFFF',
                      border: error ? '1px solid #ef4444' : '1px solid rgba(100, 100, 100, 0.2)',
                      borderRadius: '50px',
                      fontSize: '14px',
                      color: '#11100C',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                    }}
                  />
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEmailInput(false)
                        setEmail('')
                        setError('')
                      }}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        backgroundColor: 'transparent',
                        color: '#646464',
                        border: '1px solid rgba(100, 100, 100, 0.2)',
                        borderRadius: '50px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      onMouseEnter={() => setIsHovered('email-submit')}
                      onMouseLeave={() => setIsHovered(null)}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        backgroundColor: isHovered === 'email-submit' ? '#F2C4FF' : '#000000',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '50px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'background-color 0.25s ease',
                      }}
                    >
                      {loading ? '...' : 'Continue'}
                    </button>
                  </div>
                </motion.form>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                  onClick={() => setShowEmailInput(true)}
                  onMouseEnter={() => setIsHovered('email')}
                  onMouseLeave={() => setIsHovered(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '12px 20px',
                    backgroundColor: isHovered === 'email' ? '#F2C4FF' : 'transparent',
                    color: isHovered === 'email' ? '#FFFFFF' : '#11100C',
                    border: isHovered === 'email' ? '1px solid #F2C4FF' : '1px solid rgba(100, 100, 100, 0.2)',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    width: '100%',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 6L12 13L2 6" />
                  </svg>
                  <span>Continue with Email</span>
                </motion.button>
              )}

              {/* Error message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontSize: '13px',
                    color: '#ef4444',
                    margin: 0,
                    textAlign: 'center',
                  }}
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Terms */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          style={{
            fontSize: '12px',
            color: '#646464',
            textAlign: 'center',
            margin: 0,
          }}
        >
          By continuing, you agree to our{' '}
          <a href="/terms" style={{ color: '#11100C', textDecoration: 'underline' }}>Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" style={{ color: '#11100C', textDecoration: 'underline' }}>Privacy Policy</a>
        </motion.p>
      </motion.div>
    </div>
  )
}
