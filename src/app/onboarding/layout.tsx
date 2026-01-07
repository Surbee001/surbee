import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Started",
  description: "Set up your Surbee account and start creating AI-powered surveys in minutes.",
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: '#F7F7F4',
        color: '#11100C'
      }}
    >
      {children}
    </div>
  );
}