import React from "react";
import { RevealSection } from "@/components/landing/Reveal";
import localFont from "next/font/local";

const epilogue = localFont({
  src: [
    {
      path: "../../../../public/fonts/Epilogue-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../../../public/fonts/Epilogue-VariableItalic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-epilogue",
  display: "swap",
});

export default function PrivacyPage() {
  const sidebarWidthClass = "w-56";

  return (
    <div className={`min-h-screen w-full ${epilogue.variable}`} style={{ backgroundColor: "#FEFFFC", fontFamily: "var(--font-epilogue)" }}>
      {/* Top Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-40 w-full bg-[#FEFFFC]/70 backdrop-blur supports-[backdrop-filter]:bg-[#FEFFFC]/70">
        <div className="flex h-16 items-center justify-between gap-4 pl-56 pr-6">
          <div className="text-2xl text-[#171717] font-semibold tracking-[-0.02em] pl-5 md:pl-8 xl:pl-12 2xl:pl-30">surbee</div>
          <div className="flex items-center gap-4">
            <a href="/pricing" className="text-sm text-[#171717] hover:text-neutral-800 transition-all duration-300 ease-out">
            Pricing
          </a>
            <a
                href="/login"
              className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm text-[#171717] hover:bg-neutral-100"
            >
              Log in
            </a>
            <a
                href="/signup"
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm text-white hover:bg-black"
            >
              Sign up
            </a>
          </div>
        </div>
      </nav>

      {/* Layout wrapper */}
      <div className="flex w-full">
        {/* Side Menu */}
        <aside
          className={`${sidebarWidthClass} fixed left-0 top-0 z-50 h-screen border-r border-neutral-200/80 bg-[#FEFFFC]`}
        >
          <div className="flex h-full flex-col p-4 pt-20">
            <div className="flex-1"></div>

            <div className="flex flex-col">
              <div className="px-1 mb-5">
                <img
                  src="https://raw.githubusercontent.com/Surbee001/webimg/c120f0dfd46532bb149db06425090559998d97d5/New%20SVG.svg"
                  alt="Surbee logo"
                  className="w-20 h-auto object-contain"
                />
              </div>
              <div
                className="flex flex-col gap-2 transition-opacity duration-700 ease-out opacity-100"
                style={{ width: "calc(100vw - calc(100vw - 100%))" }}
              >
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 outline-none underline-offset-4 hover:text-neutral-800 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing"
                >
                  Surbee
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing#use-cases"
                >
                  Use cases
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing#students"
                >
                  Students
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing/blog"
                >
                  Blog
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-[#171717] font-medium bg-neutral-100 rounded px-2 py-1 -ml-1"
                >
                  Privacy
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1 pb-4 mt-6">
              <a href="https://twitter.com/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#171717] transition-colors" aria-label="X">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://discord.gg/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#171717] transition-colors" aria-label="Discord">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 127.14 96"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15zM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69z"/></svg>
              </a>
              <a href="https://instagram.com/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#171717] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`ml-56 w-full pt-20`}>
          <RevealSection className="w-full max-w-4xl mx-auto px-5 md:px-8 xl:px-12 2xl:px-30 py-12">
            <div className="prose prose-lg max-w-none">
              <h1 className="text-[#171717] font-semibold text-[48px] leading-none tracking-[-0.96px] mb-8">
                Privacy Policy
              </h1>

              <p className="text-[15px] text-neutral-600 mb-8">
                Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>

              <h2 className="text-[32px] font-semibold leading-tight mt-12 mb-6">
                1. Information We Collect
              </h2>

              <p className="text-[17px] leading-[170%] mb-6 text-justify">
                We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support. This may include your name, email address, and other contact information.
              </p>

              <h2 className="text-[32px] font-semibold leading-tight mt-12 mb-6">
                2. How We Use Your Information
              </h2>

              <p className="text-[17px] leading-[170%] mb-6 text-justify">
                We use the information we collect to provide, maintain, and improve our services, process transactions, communicate with you, and personalize your experience.
              </p>

              <h2 className="text-[32px] font-semibold leading-tight mt-12 mb-6">
                3. Information Sharing
              </h2>

              <p className="text-[17px] leading-[170%] mb-6 text-justify">
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this privacy policy.
              </p>

              <h2 className="text-[32px] font-semibold leading-tight mt-12 mb-6">
                4. Data Security
              </h2>

              <p className="text-[17px] leading-[170%] mb-6 text-justify">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-[32px] font-semibold leading-tight mt-12 mb-6">
                5. Your Rights
              </h2>

              <p className="text-[17px] leading-[170%] mb-6 text-justify">
                You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.
              </p>

              <h2 className="text-[32px] font-semibold leading-tight mt-12 mb-6">
                6. Changes to This Policy
              </h2>

              <p className="text-[17px] leading-[170%] mb-6 text-justify">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
              </p>

              <h2 className="text-[32px] font-semibold leading-tight mt-12 mb-6">
                7. Contact Us
              </h2>

              <p className="text-[17px] leading-[170%] mb-6 text-justify">
                If you have any questions about this privacy policy, please contact us at privacy@surbee.com.
              </p>
            </div>
          </RevealSection>
        </main>
      </div>
    </div>
  );
}