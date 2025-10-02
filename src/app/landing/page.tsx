import React from "react";
import localFont from "next/font/local";
import TypingOverlay from "@/components/landing/TypingOverlay";

const epilogue = localFont({
  src: [
    {
      path: "../../../Font/Epilogue_Complete/Fonts/WEB/fonts/Epilogue-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../../Font/Epilogue_Complete/Fonts/WEB/fonts/Epilogue-VariableItalic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-epilogue",
  display: "swap",
});

export default function LandingPage() {
  const sidebarWidthClass = "w-56"; // 14rem ~ 224px
  return (
    <div className={`min-h-screen w-full ${epilogue.variable}`} style={{ backgroundColor: "#FEFFFC", fontFamily: "var(--font-epilogue)" }}>
	  {/* Top Navigation (full-width) with blur */}
	  <nav className="fixed left-0 right-0 top-0 z-40 w-full bg-[#FEFFFC]/70 backdrop-blur supports-[backdrop-filter]:bg-[#FEFFFC]/70">
		<div className="flex h-16 items-center justify-between gap-4 pl-56 pr-6">
		  <div className="text-2xl text-[#171717] font-semibold tracking-[-0.02em] pl-5 md:pl-8 xl:pl-12 2xl:pl-30">surbee</div>
		  <div className="flex items-center gap-4">
			<a href="#pricing" className="text-sm text-[#171717] hover:text-neutral-800 transition-all duration-300 ease-out">
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
		</div>
	  </nav>

      {/* Layout wrapper: fixed sidebar + flowing content */}
      <div className="flex w-full">
        {/* Side Menu - fixed full height */}
		    <aside
	          className={`${sidebarWidthClass} fixed left-0 top-0 z-50 h-screen border-r border-neutral-200/80 bg-[#FEFFFC]`}
	        >
          {/* add top padding to avoid overlapping the nav items while border still cuts through */}
		  <div className="flex h-full flex-col justify-between p-4 pt-20">
			<div className="px-2">
			  <img
				src="https://raw.githubusercontent.com/Surbee001/webimg/c120f0dfd46532bb149db06425090559998d97d5/New%20SVG.svg"
				alt="Surbee side illustration"
				className="w-full h-auto object-contain"
			  />
			</div>
            <div
              className="flex flex-col gap-2 transition-opacity duration-700 ease-out opacity-100"
              style={{ width: "calc(100vw - calc(100vw - 100%))" }}
            >
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 outline-none underline-offset-4 hover:text-neutral-800 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-[#171717] font-medium bg-neutral-100 rounded px-2 py-1 -ml-1"
                href="#cofounder"
              >
                Cofounder
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                href="#use-cases"
              >
                Use cases
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                href="#product"
              >
                Product
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                href="#agents"
              >
                Agents
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                href="#integrations"
              >
                Integrations
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                href="#results"
              >
                Results
              </a>
              <a
                className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
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
                Automate your surveys with natural language
              </h1>
              <div className="flex flex-col gap-6">
                <p className="text-[#171717] text-[15px] leading-[140%] max-w-[482px]">
                  Surbee plugs into your research workflow, automates survey building, and organizes responses.
                  Empowering you with the tools you already use.
                </p>
              </div>
            </div>
          </section>

          {/* Divider spanning full content width and touching sidebar border */}
          <div className="mt-10 h-px w-full bg-neutral-200" />

          {/* Picture/Hero area with rounded corners and padding like before + centered overlay card */}
	          <section className="mt-8 w-full px-6">
	            <div className="relative h-[60vh] w-full overflow-hidden rounded-md">
              <img
                src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__cbbf9473-785a-4dc6-a4d0-8eb684185fbc.png?raw=true"
                alt="Surbee hero landscape"
                className="h-full w-full object-cover"
              />

            </div>
          </section>

	          {/* Centered description text */}
	          <section className="mt-8 px-6">
	            <div className="text-center">
	              <p className="text-[15px] leading-[140%] text-[#171717] max-w-[600px] mx-auto">
	                Describe what you want, and Surbee drafts complete surveys — questions, options, and logic — instantly. Iterate with plain English.
	              </p>
	            </div>
	          </section>

	          {/* Divider spanning full content width and touching sidebar border */}
	          <div className="mt-8 h-px w-full bg-neutral-200" />

	          {/* Post-hero section */}
	          <section className="px-6 py-12">
	            <h2 className="text-2xl sm:text-3xl font-semibold text-[#171717] mb-8">
	              Here’s some things Surbee can do for you
	            </h2>
	            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
	              {/* Card 1: Create Forms in Natural Language */}
	              <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white/70">
	                <div className="h-40 w-full bg-neutral-100" />
	                <div className="p-5">
	                  <h3 className="text-lg font-semibold text-[#171717]">Create Forms in Natural Language</h3>
	                  <p className="mt-2 text-sm text-[#171717]">
	                    Describe what you want, and Surbee drafts complete surveys — questions,
	                    options, and logic — instantly. Iterate with plain English.
	                  </p>
	                </div>
	              </div>

	              {/* Card 2: Analyze behaviors like Sherlock Holmes */}
	              <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white/70">
	                <div className="h-40 w-full bg-neutral-100" />
	                <div className="p-5">
	                  <h3 className="text-lg font-semibold text-[#171717]">Detect Odd Behaviors & Bad Data</h3>
	                  <p className="mt-2 text-sm text-[#171717]">
	                    Surbee flags suspicious patterns, bots, and inconsistent answers — like
	                    a data detective — so your insights stay trustworthy.
	                  </p>
	                </div>
	              </div>

	              {/* Card 3: Build a community for fast answers */}
	              <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white/70">
	                <div className="h-40 w-full bg-neutral-100" />
	                <div className="p-5">
	                  <h3 className="text-lg font-semibold text-[#171717]">Grow a Community Around Your Surveys</h3>
	                  <p className="mt-2 text-sm text-[#171717]">
	                    Launch a lightweight community where participants discuss, respond, and
	                    resurface insights — accelerating answers to your questions.
	                  </p>
	                </div>
	              </div>
	            </div>
	          </section>
        </main>
      </div>
    </div>
  );
}


