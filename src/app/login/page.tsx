'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
    document.documentElement.style.background = '#EEE9E5';
    document.body.style.background = '#EEE9E5';
    window.scrollTo(0, 0);
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('Google login error:', error);
      setLoading(false);
    }
  };

  return (
    <>
      <div className="login-page">
        <style dangerouslySetInnerHTML={{__html: `
          @font-face {
            font-family: 'Kalice-Trial-Bold';
            src: url('/fonts/Kalice-Trial-Bold.otf') format('opentype');
            font-weight: 700;
            font-style: normal;
          }
          @font-face {
            font-family: 'Kalice-Trial-Regular';
            src: url('/fonts/Kalice-Trial-Regular.otf') format('opentype');
            font-weight: 400;
            font-style: normal;
          }
          html { font-size: calc(100vw/1440); background: #EEE9E5 !important; }
          body { overflow-x:hidden; overflow: overlay; -webkit-font-smoothing: antialiased; background: #EEE9E5 !important; }
          @media screen and (min-width: 1440px) { html {font-size: 1px;} }
          @media screen and (min-width: 768px) and (max-width: 991px) { html {font-size: calc(100vw/768);} }
          @media screen and (min-width: 480px) and (max-width: 767px) { html {font-size: calc(100vw/480);} }
          @media screen and (max-width: 479px) { html {font-size: calc(100vw/375);} }
          [class*="heading-"] { margin-top:0px; margin-bottom:0px; }
          [class*="text-"] { margin-top:0px; margin-bottom:0px; }
          :root { --typography-font-size-title-large: 14px; --typography-font-size-body-large: 14px; --typography-font-size-body-medium: 24px; --typography-font-size-body-standard: 16px; }
          [class*="image-wrapper"] { width:100%; position:relative; overflow:hidden; }
          [class*="overlay-"] { pointer-events:none; }
          [class*="container-"] { margin-left:auto; margin-right:auto; width:100% }
          .w-richtext > *:first-child { margin-top: 0; }
          .w-richtext > *:last-child { margin-bottom: 0; }
          @media screen and (max-width:991px) { [hidetablet="yes"] { display:none; } }
        `}} />

        <div className="section is--hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EEE9E5' }}>
          <style dangerouslySetInnerHTML={{__html: `
            .login-heading {
              overflow: visible !important;
              padding-bottom: 48px;
              line-height: 1.1;
              text-align: center;
              font-family: Kalice-Trial-Regular, sans-serif;
              margin: 0 0 24rem 0;
            }
            h1.login-heading {
              font-size: 96rem;
              font-weight: 400;
              letter-spacing: -1.92rem;
              color: black;
            }
            .login-subtext {
              font-size: 14rem;
              line-height: 1.6;
              color: rgba(0,0,0,0.6);
              text-align: center;
              margin: 0 0 40rem 0;
              font-family: 'Courier New', 'Menlo', 'Monaco', monospace;
              letter-spacing: 0.5px;
            }
            .login-form-container {
              position: relative;
              z-index: 10;
              max-width: 600rem;
              width: 100%;
              padding: 0 20rem;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .login-heading {
              width: 100%;
            }
            .login-buttons-wrapper {
              width: 100%;
              max-width: 400rem;
              display: flex;
              flex-direction: column;
              gap: 12rem;
            }
            .login-button {
              position: relative;
              padding: 12rem 20rem;
              border-radius: 8px;
              border: none;
              font-size: 14rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              font-family: Kalice-Trial-Regular, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12rem;
              overflow: hidden;
              width: 100%;
            }
            .login-button--google {
              background: white;
              color: #1f2937;
              border: 1px solid #e5e7eb;
            }
            .login-button--email {
              background: black;
              color: white;
            }
            .hover--bg {
              position: absolute;
              inset: 0;
              opacity: 0;
              transition: opacity 0.3s ease;
            }
            .hover--bg.is--black {
              background: rgba(0, 0, 0, 0.1);
            }
            .hover--bg.is--purple {
              background: rgba(168, 85, 247, 0.15);
            }
            .login-button:hover .hover--bg {
              opacity: 1;
            }
            .login-button-content {
              position: relative;
              z-index: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12rem;
            }
            .login-button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .login-input {
              width: 100%;
              padding: 12rem 16rem;
              margin-bottom: 16rem;
              border: 1px solid #e5e7eb;
              border-radius: 8rem;
              font-size: 14rem;
              font-family: Kalice-Trial-Regular, sans-serif;
            }
            .login-input:focus {
              outline: none;
              border-color: black;
              box-shadow: 0 0 0 3rem rgba(0,0,0,0.1);
            }
            .login-error {
              background: #fee2e2;
              border: 1px solid #fca5a5;
              color: #991b1b;
              padding: 12rem 16rem;
              border-radius: 8rem;
              font-size: 14rem;
              margin-bottom: 16rem;
            }
            .login-label {
              display: block;
              font-size: 14rem;
              font-weight: 600;
              margin-bottom: 8rem;
              color: black;
              font-family: Kalice-Trial-Regular, sans-serif;
            }
            .login-terms {
              text-align: center;
              font-size: 12rem;
              color: rgba(0,0,0,0.6);
              margin-top: 24rem;
              line-height: 1.6;
              font-family: Sohne, sans-serif;
            }
            .login-terms a {
              color: black;
              text-decoration: underline;
              transition: color 0.2s;
            }
            .login-terms a:hover {
              color: rgba(0,0,0,0.8);
            }
            .login-back-button {
              position: absolute;
              top: 40rem;
              left: 40rem;
              z-index: 20;
              background: black;
              color: white;
              padding: 8rem 16rem;
              border-radius: 999rem;
              border: none;
              font-size: 14rem;
              cursor: pointer;
              font-family: Kalice-Trial-Regular, sans-serif;
              transition: all 0.2s;
            }
            .login-back-button:hover {
              background: #1f2937;
            }
          `}} />

          {/* Decorative hero lines */}
          <div hidetablet="yes" style={{ position: 'absolute', left: '10%', top: 0, width: '1px', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)' }} />
          <div hidetablet="yes" style={{ position: 'absolute', left: '20%', top: 0, width: '1px', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.08), transparent)' }} />
          <div hidetablet="yes" style={{ position: 'absolute', left: '30%', top: 0, width: '1px', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), transparent)' }} />
          <div hidetablet="yes" style={{ position: 'absolute', right: '30%', top: 0, width: '1px', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.06), transparent)' }} />
          <div hidetablet="yes" style={{ position: 'absolute', right: '20%', top: 0, width: '1px', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.08), transparent)' }} />
          <div hidetablet="yes" style={{ position: 'absolute', right: '10%', top: 0, width: '1px', height: '100%', background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)' }} />

          <div className="login-form-container">
            {showEmailForm && (
              <button
                className="login-back-button"
                onClick={() => {
                  setShowEmailForm(false);
                  setEmail('');
                  setPassword('');
                  setError('');
                }}
              >
                ← Back
              </button>
            )}

            {!showEmailForm ? (
              <>
                <h1 className="login-heading">Sign in to Surbee</h1>
                <p className="login-subtext">Create smarter surveys in minutes</p>

                <div className="login-buttons-wrapper">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="login-button login-button--google"
                  >
                    <div className="hover--bg is--black"></div>
                    <div className="login-button-content">
                      <svg width="18rem" height="18rem" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowEmailForm(true)}
                    disabled={loading}
                    className="login-button login-button--email"
                  >
                    <div className="hover--bg is--purple"></div>
                    <div className="login-button-content">
                      Continue with Email
                    </div>
                  </button>
                </div>

                <div className="login-terms">
                  By signing in, you agree to our{' '}
                  <Link href="/terms">Terms and Conditions</Link>
                  {' '}and{' '}
                  <Link href="/privacy">Privacy Policy</Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="login-heading" style={{ fontSize: '56rem' }}>Sign in with Email</h1>
                <p className="login-subtext" style={{ margin: '0 0 32rem 0' }}>Enter your credentials</p>

                <div style={{ width: '100%', maxWidth: '400rem' }}>
                  <form onSubmit={handleEmailSubmit}>
                  {error && (
                    <div className="login-error">{error}</div>
                  )}

                  <div>
                    <label className="login-label">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="login-input"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="login-label">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="login-input"
                      disabled={loading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="login-button login-button--email"
                  >
                    <div className="hover--bg is--purple"></div>
                    <div className="login-button-content" style={{ color: 'white' }}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </div>
                  </button>
                  </form>
                </div>

                <div className="login-terms">
                  By signing in, you agree to our{' '}
                  <Link href="/terms">Terms and Conditions</Link>
                  {' '}and{' '}
                  <Link href="/privacy">Privacy Policy</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
