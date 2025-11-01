"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Github } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/dashboard');
  };

  const handleGithubLogin = () => {
    router.push('/dashboard');
  };

  const handleGoogleLogin = () => {
    router.push('/dashboard');
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      {/* Background Image with Dark Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://ik.imagekit.io/on0moldgr/Surbee%20Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__4d561ac8-4332-456e-872f-1620cdef4d80.png?updatedAt=1761758702696')",
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Login Content - No Container Background */}
      <div className="relative z-10 w-full max-w-sm mx-4 flex flex-col items-center">
        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-900 py-4 px-6 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] mb-4 shadow-lg"
          style={{ fontFamily: 'FK Grotesk, sans-serif' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
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
          <span className="text-base font-medium">Continue with Google</span>
        </button>

        {/* Email Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-gray-400 text-white py-4 px-6 rounded-xl flex items-center justify-center space-x-3 hover:bg-gray-500 transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
          style={{ fontFamily: 'FK Grotesk, sans-serif' }}
        >
          <span className="text-base font-medium">Continue with Email</span>
        </button>

        {/* Terms and Privacy */}
        <div className="text-center mt-8">
          <p className="text-sm text-white" style={{ fontFamily: 'Sohne, sans-serif' }}>
            By signing up, you agree to our{' '}
            <Link href="/terms" className="underline hover:text-gray-200 transition-colors font-medium">
              Terms and Conditions
            </Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-gray-200 transition-colors font-medium">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
