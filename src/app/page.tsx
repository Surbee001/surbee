'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login page - landing page is temporarily hidden
    router.replace('/login');
  }, [router]);

  return null;
}
