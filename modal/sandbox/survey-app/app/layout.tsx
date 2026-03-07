import type { ReactNode } from "react";
import "./globals.css";

export const metadata = { title: "Survey Preview" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          [data-nextjs-dialog-overlay],
          [data-nextjs-toast],
          nextjs-portal,
          #__next-build-indicator,
          [class*="nextjs-"] { display: none !important; }
        `}} />
      </head>
      <body style={{ backgroundColor: '#ffffff' }}>{children}</body>
    </html>
  );
}
