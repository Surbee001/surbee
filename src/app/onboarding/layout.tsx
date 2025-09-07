import React from "react";

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div 
      className="min-h-screen"
      style={{ 
        fontFamily: 'Sohne, sans-serif',
        backgroundColor: 'var(--surbee-bg-primary)',
        color: 'var(--surbee-fg-primary)'
      }}
    >
      {children}
    </div>
  );
}