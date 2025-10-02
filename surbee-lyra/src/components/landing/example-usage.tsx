/**
 * Example Usage: Cofounder Landing Page Component
 * 
 * This file demonstrates how to integrate the CofounderLanding component
 * into your Next.js application.
 */

// ============================================
// OPTION 1: Use as a full page
// ============================================

// app/cofounder/page.tsx
import CofounderLanding from '@/components/landing/CofounderLanding';

export default function CofounderPage() {
  return <CofounderLanding />;
}

// ============================================
// OPTION 2: Use within a layout with nav/footer
// ============================================

// app/landing/page.tsx
import CofounderLanding from '@/components/landing/CofounderLanding';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <>
      <Header />
      <CofounderLanding />
      <Footer />
    </>
  );
}

// ============================================
// OPTION 3: Add to root layout
// ============================================

// app/layout.tsx
import type { Metadata } from 'next';
import '@/components/landing/cofounder-globals.css';
import '@/components/landing/cofounder-landing.css';
import './globals.css'; // Your existing global styles

export const metadata: Metadata = {
  title: 'Cofounder - Automate your life with natural language',
  description: 'Cofounder plugs into your existing tools, writes automations, and organizes workflows.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

// ============================================
// OPTION 4: Dynamic data-driven use cases
// ============================================

// lib/use-cases.ts
export interface UseCase {
  id: string;
  href: string;
  title: string;
  description: string;
  toolIcons: string[];
}

export const useCases: UseCase[] = [
  {
    id: '1',
    href: 'https://app.cofounder.co/replay/df83f210-d59e-47bc-8057-b4ace0d29520',
    title: 'Analyze this startup (Cofounder)',
    description: 'Run a VC-style startup deep dive: build an analysis spreadsheet, research online, benchmark competitors, and enrich staff profiles.',
    toolIcons: ['/images/other-tool.avif'],
  },
  {
    id: '2',
    href: 'https://app.cofounder.co/replay/374c20b5-4df0-47bf-8308-29a5fa917f76',
    title: "What's going on in engineering",
    description: "Get a snapshot of your engineering team's status, priorities, and challenges.",
    toolIcons: ['/images/linear.avif', '/images/slack.avif'],
  },
  // Add more use cases...
];

// Then in your component:
// import { useCases } from '@/lib/use-cases';
// 
// {useCases.map(useCase => (
//   <UseCaseCard key={useCase.id} {...useCase} />
// ))}

// ============================================
// OPTION 5: Add custom sections
// ============================================

// components/landing/CofounderLandingExtended.tsx
import CofounderLanding from './CofounderLanding';

export default function CofounderLandingExtended() {
  return (
    <>
      <CofounderLanding />
      
      {/* Additional custom sections */}
      <section className="py-20 px-4 bg-neutral-100">
        <div className="max-w-[1920px] mx-auto">
          <h2 className="text-4xl font-bold text-center mb-8">
            Additional Features
          </h2>
          {/* Your custom content */}
        </div>
      </section>
    </>
  );
}

// ============================================
// OPTION 6: Integration with authentication
// ============================================

// app/dashboard/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import CofounderLanding from '@/components/landing/CofounderLanding';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? (
    <div>
      {/* Authenticated dashboard */}
      <h1>Welcome, {user.name}</h1>
    </div>
  ) : (
    <CofounderLanding />
  );
}

// ============================================
// OPTION 7: Server-side props for SEO
// ============================================

// app/landing/[slug]/page.tsx
import CofounderLanding from '@/components/landing/CofounderLanding';
import { Metadata } from 'next';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Cofounder - ${params.slug}`,
    description: 'Automate your life with natural language',
    openGraph: {
      title: 'Cofounder',
      description: 'Automate your life with natural language',
      images: ['/images/og-image.png'],
    },
  };
}

export default function LandingSlugPage({ params }: PageProps) {
  return <CofounderLanding />;
}

// ============================================
// OPTION 8: With analytics tracking
// ============================================

// components/landing/CofounderLandingWithAnalytics.tsx
'use client';

import { useEffect } from 'react';
import CofounderLanding from './CofounderLanding';

export default function CofounderLandingWithAnalytics() {
  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Cofounder Landing',
        page_location: window.location.href,
        page_path: window.location.pathname,
      });
    }
  }, []);

  return <CofounderLanding />;
}

// Extend Window type for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
  }
}

// ============================================
// OPTION 9: With theme support
// ============================================

// components/landing/ThemedCofounderLanding.tsx
'use client';

import { useTheme } from 'next-themes';
import CofounderLanding from './CofounderLanding';
import { useEffect } from 'react';

export default function ThemedCofounderLanding() {
  const { theme, setTheme } = useTheme();

  // Force light theme for Cofounder landing
  useEffect(() => {
    setTheme('light');
    
    return () => {
      // Restore previous theme on unmount if needed
    };
  }, [setTheme]);

  return <CofounderLanding />;
}

// ============================================
// Quick Start Checklist
// ============================================

/*
 * ✅ SETUP CHECKLIST:
 * 
 * 1. [ ] Copy component files to your project
 * 2. [ ] Import CSS in root layout:
 *        - cofounder-globals.css
 *        - cofounder-landing.css
 * 3. [ ] Add fonts to /public/fonts/:
 *        - af-normal.woff2
 *        - mondwest.woff2
 * 4. [ ] Add images to /public/images/:
 *        - cofunder-logo-flower.avif
 *        - hero-anim-bg-2.png
 *        - other-tool.avif
 *        - linear.avif
 *        - slack.avif
 * 5. [ ] Test responsive breakpoints
 * 6. [ ] Verify animations work
 * 7. [ ] Check hover states
 * 8. [ ] Test on mobile devices
 * 9. [ ] Validate accessibility (WCAG)
 * 10. [ ] Optimize images for production
 */

