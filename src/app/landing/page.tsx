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
          className={`${sidebarWidthClass} fixed left-0 top-16 z-30 h-[calc(100vh-64px)] border border-neutral-200/80 bg-transparent`}
        >
          <div className="flex h-full flex-col justify-end p-4">
            <div className="space-y-2 text-sm text-[#171717]">
              <a href="#home" className="block hover:underline">
                Cofounder
              </a>
              <a href="#features" className="block hover:underline">
                Use cases
              </a>
              <a href="#product" className="block hover:underline">
                Product
              </a>
              <a href="#agents" className="block hover:underline">
                Agents
              </a>
              <a href="#integrations" className="block hover:underline">
                Integrations
              </a>
              <a href="#results" className="block hover:underline">
                Results
              </a>
              <a href="#blog" className="block hover:underline">
                Blog
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content - occupies the rest of the page width */}
        <main className={`ml-56 w-full pt-20 px-6`}> {/* ml must equal sidebar width; pt offset for navbar */}
          {/* Title and description - left aligned full width */}
          <section className="max-w-none">
            <h1 className="text-5xl font-semibold tracking-tight text-[#171717]">
              Surbee – Collaborative Surveys, Built Beautifully
            </h1>
            <p className="mt-4 text-lg leading-7 text-[#171717]">
              Create, collaborate, and launch surveys with a clean, minimal workflow.
              Pixel-perfect design, fast collaboration, and a delightful building experience.
            </p>
          </section>

          {/* Divider spanning full content width */}
          <div className="mt-8 h-px w-full bg-neutral-200" />

          {/* Picture/Hero area filling the hero section width */}
          <section className="mt-8 h-[70vh] w-full rounded-md bg-neutral-100" />

          {/* Divider spanning full content width */}
          <div className="mt-8 h-px w-full bg-neutral-200" />
        </main>
      </div>
    </div>
  );
}


