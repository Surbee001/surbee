import React from "react";

export default function LandingPage() {
  const sidebarWidthClass = "w-56"; // 14rem ~ 224px
  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "#FEFFFC" }}>
      {/* Top Navigation (full-width) */}
      <nav className="fixed left-0 right-0 top-0 z-40 w-full border-b border-neutral-200/80 bg-transparent">
        <div className="flex h-16 items-center justify-end gap-4 px-6">
          <a href="#pricing" className="text-sm text-[#171717] hover:underline">
            Pricing
          </a>
          <a
            href="#login"
            className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-[#171717] hover:bg-neutral-100"
          >
            Log in
          </a>
          <a
            href="#signup"
            className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm text-white hover:bg-black"
          >
            Sign up
          </a>
        </div>
      </nav>

      {/* Layout wrapper: fixed sidebar + flowing content */}
      <div className="flex w-full">
        {/* Side Menu - fixed full height */}
        <aside
          className={`${sidebarWidthClass} fixed left-0 top-0 z-50 h-screen border-r border-neutral-200/80 bg-transparent`}
        >
          {/* add top padding to avoid overlapping the nav items while border still cuts through */}
          <div className="flex h-full flex-col justify-end p-4 pt-20">
            <div
              className="flex flex-col gap-2 transition-opacity duration-700 ease-out opacity-100"
              style={{ width: "calc(100vw - calc(100vw - 100%))" }}
            >
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 outline-none underline-offset-4 hover:text-neutral-700 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-[#171717] font-medium bg-neutral-300 rounded px-2 py-1 -ml-1"
                href="#cofounder"
              >
                Cofounder
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-600 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                href="#use-cases"
              >
                Use cases
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-600 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                href="#product"
              >
                Product
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-600 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                href="#agents"
              >
                Agents
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-600 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                href="#integrations"
              >
                Integrations
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-600 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                href="#results"
              >
                Results
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-600 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                href="#blog"
              >
                Blog
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content - occupies the rest of the page width */}
        <main className={`ml-56 w-full pt-20`}> {/* ml must equal sidebar width; pt offset for navbar */}
          {/* Title and description - left aligned full width with breathing room */}
          <section className="max-w-none px-8">
            <h1 className="text-5xl font-semibold tracking-tight text-[#171717]">
              Surbee – Collaborative Surveys, Built Beautifully
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-7 text-[#171717]">
              Create, collaborate, and launch surveys with a clean, minimal workflow.
              Pixel-perfect design, fast collaboration, and a delightful building experience.
            </p>
          </section>

          {/* Divider spanning full content width and touching sidebar border */}
          <div className="mt-10 h-px w-full bg-neutral-200" />

          {/* Picture/Hero area filling the hero section width */}
          <section className="mt-8 h-[70vh] w-full bg-neutral-100" />

          {/* Divider spanning full content width and touching sidebar border */}
          <div className="mt-8 h-px w-full bg-neutral-200" />
        </main>
      </div>
    </div>
  );
}


