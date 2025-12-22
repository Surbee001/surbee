"use client";

import React, { useState } from 'react';
import { Github, Mail } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { Component as AnimatedBackground } from '../open-ai-codex-animated-background';
import { useAuth } from '@/contexts/AuthContext';
import { GuestGuard } from './AuthGuard';
import Link from 'next/link';

export default function SurbeeLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('redirect') || '/home';
  const { signIn, signInWithOAuth, hasCompletedOnboarding } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGithubLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithOAuth('github');
    if (error) {
      setError(error.message);
    } else {
      // Check onboarding status before redirecting
      const destination = hasCompletedOnboarding ? redirectTo : '/onboarding';
      router.push(destination);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await signInWithOAuth('google');
    if (error) {
      setError(error.message);
    } else {
      // Check onboarding status before redirecting
      const destination = hasCompletedOnboarding ? redirectTo : '/onboarding';
      router.push(destination);
    }
    setLoading(false);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(email, password);
    if (error) {
      setError(error.message);
    } else {
      // Check onboarding status before redirecting
      const destination = hasCompletedOnboarding ? redirectTo : '/onboarding';
      router.push(destination);
    }
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin + redirectTo : undefined }
      });
      if (error) throw error;
      alert('Check your email for the magic link!');
    } catch (err: any) {
      setError(err?.message || 'Failed to send magic link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="bg-white min-h-screen flex">
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center justify-center">
              <img 
                src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg" 
                alt="Surbee" 
                className="h-20" 
              />
            </div>
          </div>

          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h1 className="text-xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'PP Editorial, serif' }}>
              Welcome back
            </h1>
            <p className="text-sm text-gray-600 leading-5" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
              Sign in to continue creating powerful surveys<br />
              and websites with AI-driven insights
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}


          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleGithubLogin}
              disabled={loading}
              className="w-full bg-black text-white py-2.5 px-4 rounded-lg flex items-center justify-center space-x-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
              style={{ fontFamily: 'FK Grotesk, sans-serif' }}
            >
              <Github size={16} />
              <span className="text-sm">Continue with GitHub</span>
            </button>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white border border-gray-300 text-gray-900 py-2.5 px-4 rounded-lg flex items-center justify-center space-x-3 hover:bg-gray-50 transition-colors disabled:opacity-50"
              style={{ fontFamily: 'FK Grotesk, sans-serif' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm">Continue with Google</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500" style={{ fontFamily: 'Sohne, sans-serif' }}>or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-3 mb-4">
            <div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email or username"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                style={{ fontFamily: 'FK Grotesk, sans-serif' }}
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                style={{ fontFamily: 'FK Grotesk, sans-serif' }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 px-4 rounded-lg text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
              style={{ fontFamily: 'FK Grotesk, sans-serif' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Magic Link Alternative */}
          <div className="text-center mb-4">
            <button
              onClick={handleMagicLink}
              disabled={loading || !email}
              className="text-sm text-gray-600 hover:text-black transition-colors disabled:opacity-50"
              style={{ fontFamily: 'FK Grotesk, sans-serif' }}
            >
              Or send magic link to email
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600" style={{ fontFamily: 'Sohne, sans-serif' }}>
              Don't have an account?{' '}
              <Link href="/signup" className="text-black hover:underline font-medium">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Animated Background */}
      <div className="hidden lg:flex flex-1 relative">
        <div className="absolute inset-0 rounded-lg overflow-hidden mx-4 my-6">
          <AnimatedBackground />
        </div>
      </div>
      </div>
    </GuestGuard>
  );
}