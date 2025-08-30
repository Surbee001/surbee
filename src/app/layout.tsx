import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import React from 'react'
import Providers from './providers'

const inter = Inter({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Surbee Lyra - Pricing",
  description: "Choose the perfect plan for your AI-powered workflow. Free, Pro, and Max plans available.",
  generator: "Surbee Lyra",
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
