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
          className={`${sidebarWidthClass} fixed left-0 top-0 z-50 h-screen border-r border-neutral-200/80 bg-[#FEFFFC]`}
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
          {/* Title and description (hero header) */}
          <section className="w-full max-w-[1920px] mx-auto px-5 md:px-8 xl:px-12 2xl:px-30 pb-8 pt-8 xl:pb-20 xl:pt-20">
            <div className="flex flex-col gap-12">
              <h1 className='text-[#171717] font-semibold leading-none tracking-[-0.96px] text-[48px] max-w-[520px] sm:text-[54px] sm:leading-[110%] sm:tracking-[-1.08px] sm:max-w-[620px] xl:text-[70px] xl:leading-none xl:tracking-[-1.4px] xl:max-w-[720px] 3xl:text-[90px] 3xl:leading-none 3xl:tracking-[-1.8px] 3xl:max-w-[820px]'>
                Automate your life with natural language
              </h1>
              <div className="flex flex-col gap-6">
                <p className="text-[#171717] text-[15px] leading-[140%] max-w-[482px]">
                  Cofounder plugs into your existing tools, writes automations, and organizes workflows.
                  Driving the software you’re already familiar with.
                </p>
              </div>
            </div>
          </section>

          {/* Divider spanning full content width and touching sidebar border */}
          <div className="mt-10 h-px w-full bg-neutral-200" />

          {/* Picture/Hero area with rounded corners and padding like before */}
          <section className="mt-8 w-full px-6">
            <div className="h-[70vh] w-full overflow-hidden rounded-md">
              <img
                src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__cbbf9473-785a-4dc6-a4d0-8eb684185fbc.png?raw=true"
                alt="Surbee hero landscape"
                className="h-full w-full object-cover"
              />
            </div>
          </section>

          {/* Divider spanning full content width and touching sidebar border */}
          <div className="mt-8 h-px w-full bg-neutral-200" />
        </main>
      </div>
    </div>
  );
}


