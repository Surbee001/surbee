"use client";

import React from "react";
import ModernNavbar from "@/components/layout/ModernNavbar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ModernAppLayout({
  children,
  fullBleed = false,
}: Readonly<{
  children: React.ReactNode;
  fullBleed?: boolean;
}>) {
  return (
    <AuthGuard>
      <div
        className="modern-app-layout"
        style={{
          fontFamily: 'var(--font-inter), sans-serif',
          backgroundColor: 'var(--surbee-bg-primary)',
          color: 'var(--surbee-fg-primary)',
          minHeight: '100vh'
        }}
      >
        <ModernNavbar />

        <main
          className="modern-app-content"
          style={{
            paddingTop: '64px', // Account for fixed navbar
            minHeight: '100vh'
          }}
        >
          {fullBleed ? (
            <div className="h-full">
              {children}
            </div>
          ) : (
            <div
              className="modern-app-container"
              style={{
                maxWidth: '1400px',
                margin: '0 auto',
                padding: '32px 24px'
              }}
            >
              {children}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
