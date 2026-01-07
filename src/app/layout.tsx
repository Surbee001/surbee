import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from 'react'
import Script from 'next/script'
import Providers from './providers'

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Surbee | AI-Powered Survey Platform",
    template: "%s | Surbee",
  },
  description: "Create beautiful, intelligent surveys with AI. Get real-time fraud detection, smart analytics, and actionable insights from your survey responses.",
  keywords: ["survey", "AI surveys", "form builder", "survey analytics", "fraud detection", "response validation"],
  authors: [{ name: "Surbee" }],
  creator: "Surbee",
  publisher: "Surbee",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Surbee",
    title: "Surbee | AI-Powered Survey Platform",
    description: "Create beautiful, intelligent surveys with AI. Get real-time fraud detection, smart analytics, and actionable insights.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Surbee | AI-Powered Survey Platform",
    description: "Create beautiful, intelligent surveys with AI. Get real-time fraud detection, smart analytics, and actionable insights.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ariaLive = (
    <div id="aria-live-region" aria-live="polite" className="sr-only" />
  )
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('surbee-theme') || 'system';
                  var resolved = theme;
                  if (theme === 'system') {
                    resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  // Remove existing theme classes and add the resolved one
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(resolved);
                  document.body.style.backgroundColor = resolved === 'dark' ? '#0f0f0f' : '#ffffff';
                  document.body.style.color = resolved === 'dark' ? '#fafafa' : '#0a0a0a';
                } catch (e) {
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add('dark');
                  document.body.style.backgroundColor = '#0f0f0f';
                  document.body.style.color = '#fafafa';
                }
              })();
            `,
          }}
        />
        <Script
          src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js"
          strategy="afterInteractive"
          async
        />
      </head>
      <body
        className={`${inter.variable} antialiased min-h-screen bg-background font-sans`}
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
        </Providers>
        {ariaLive}
      </body>
    </html>
  );
}

