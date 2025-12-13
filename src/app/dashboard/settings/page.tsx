"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      router.replace('/dashboard/settings/general');
    }
  }, [authLoading, router]);

  // Show loading spinner while redirecting
  return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
    </div>
  );
}
