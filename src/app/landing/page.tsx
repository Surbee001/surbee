import React from "react";
import { RevealSection, RevealDiv } from "@/components/landing/Reveal";
import localFont from "next/font/local";
import TypingOverlay from "@/components/landing/TypingOverlay";

const epilogue = localFont({
  src: [
    {
      path: "../../../public/fonts/Epilogue-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../../public/fonts/Epilogue-VariableItalic.woff2",
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
              href="/test-login"
            className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm text-[#171717] hover:bg-neutral-100"
          >
            Log in
          </a>
          <a
              href="/test-login"
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
          <div className="flex h-full flex-col p-4 pt-20">
            <div className="flex-1 flex flex-col">
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
                  className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 outline-none underline-offset-4 hover:text-neutral-800 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-[#171717] font-medium bg-neutral-100 rounded px-2 py-1 -ml-1"
                >
                  Surbee
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
                  href="#students"
                >
                  Students
                </a>
                
               
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="#blog"
                >
                  Blog
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-1 pb-4">
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

        {/* Main Content - occupies the rest of the page width */}
        <main className={`ml-56 w-full pt-20`}> {/* ml must equal sidebar width; pt offset for navbar */}
          {/* Title and description (hero header) */}
          <RevealSection
            className="w-full max-w-[1920px] mx-auto px-5 md:px-8 xl:px-12 2xl:px-30 pb-8 pt-8 xl:pb-20 xl:pt-20"
          >
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
          </RevealSection>

          {/* Divider spanning full content width and touching sidebar border */}
          <div className="mt-10 h-px w-full bg-neutral-200" />

          {/* Picture/Hero area with rounded corners and padding like before + centered overlay card */}
	          <RevealSection
              className="mt-8 w-full px-6"
            >
	            <RevealDiv
                className="relative h-[60vh] w-full overflow-hidden rounded-md"
            >
              <img
                src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png?raw=true"
                alt="Surbee hero landscape"
                className="h-full w-full object-cover"
              />

              {/* Centered overlay prompt card */}
	              <RevealDiv
                  className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
              >
	                <a
	                  className="cursor-pointer pointer-events-auto group"
	                  href="/test-login"
                >
	                  <RevealDiv
                      className="relative inline-block"
                  >
                    <div className="rounded-lg px-4 pt-3 pb-2 backdrop-blur-lg max-w-[calc(100vw_-_64px)] w-[640px] flex flex-col items-start justify-between gap-2 h-[140px] bg-gradient-to-b from-[rgba(255,255,255,0.80)] to-[rgba(255,255,255,0.16)] shadow-[0px_4px_12px_0px_rgba(255,255,255,0.10)_inset,0px_0px_0px_6px_rgba(255,255,255,0.40),0px_1px_8px_0px_rgba(0,0,0,0.13),0px_2px_6px_0px_rgba(0,0,0,0.20)]">
                      {/* Typing overlay at top */}
                      <TypingOverlay prompts={[
                        "Build a survey with conditional logic and skip patterns based on user responses",
                        "Generate 15 PhD-level questions about machine learning ethics and bias",
                        "Create a product feedback survey with a clean minimalist design and progress bar",
                      ]} />
                      <div className="flex flex-row items-center justify-between w-full">
                        {/* Attachment icon at bottom-left */}
                        <svg className="text-[#FEFFFC]" height="24" width="24" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.374 6.58264L6.19085 12.8682C5.97358 13.092 5.85309 13.3924 5.85544 13.7043C5.85779 14.0162 5.98278 14.3147 6.2034 14.5352C6.42403 14.7558 6.72256 14.8806 7.03449 14.8828C7.34642 14.885 7.6467 14.7644 7.87042 14.5471L15.2411 7.07471C15.6865 6.62926 15.9368 6.0251 15.9368 5.39514C15.9368 4.76518 15.6865 4.16102 15.2411 3.71557C14.7956 3.27012 14.1915 3.01987 13.5615 3.01987C12.9316 3.01987 12.3274 3.27012 11.8819 3.71557L4.51128 11.1887C3.85217 11.8586 3.48448 12.7618 3.48831 13.7016C3.49214 14.6414 3.86717 15.5416 4.53171 16.2062C5.19626 16.8707 6.09647 17.2458 7.03628 17.2496C7.97608 17.2534 8.87932 16.8857 9.54925 16.2266L15.6396 10.1451" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {/* Send button at bottom-right */}
                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-[#FEFFFC] text-[#171717] border border-neutral-300 text-[15px] tracking-15 leading-[140%] rounded-full cursor-pointer h-8 w-8">
                          <svg height="13" width="11" fill="none" viewBox="0 0 11 13" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.2392 6.0143C10.1938 6.0597 10.14 6.09571 10.0807 6.12028C10.0214 6.14485 9.95791 6.15749 9.89375 6.15749C9.82959 6.15749 9.76606 6.14485 9.70679 6.12028C9.64752 6.09571 9.59368 6.0597 9.54833 6.0143L5.98795 2.45331V12.0158C5.98795 12.1453 5.93651 12.2695 5.84495 12.361C5.75339 12.4526 5.6292 12.504 5.49972 12.504C5.37023 12.504 5.24605 12.4526 5.15449 12.361C5.06293 12.2695 5.01149 12.1453 5.01149 12.0158V2.45331L1.4511 6.0143C1.35949 6.10592 1.23524 6.15738 1.10568 6.15738C0.976127 6.15738 0.851876 6.10592 0.760265 6.0143C0.668654 5.92269 0.617188 5.79844 0.617188 5.66888C0.617187 5.53933 0.668654 5.41507 0.760265 5.32346L5.1543 0.92943C5.19964 0.884036 5.25349 0.848025 5.31276 0.823456C5.37203 0.798886 5.43556 0.78624 5.49972 0.78624C5.56388 0.78624 5.62741 0.798886 5.68668 0.823456C5.74595 0.848025 5.7998 0.884036 5.84514 0.92943L10.2392 5.32346C10.2846 5.36881 10.3206 5.42265 10.3451 5.48192C10.3697 5.54119 10.3824 5.60472 10.3824 5.66888C10.3824 5.73304 10.3697 5.79658 10.3451 5.85584C10.3206 5.91511 10.2846 5.96896 10.2392 6.0143Z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
	                    {/* Hover tooltip */}
	                    <div className="absolute z-50 bg-neutral-900 backdrop-blur-[20px] flex flex-col gap-1.5 px-3 py-1 w-min rounded-full whitespace-nowrap text-[#EEF1ED] text-xs font-medium leading-[130%] tracking-[-0.12px] left-1/2 transform -translate-x-1/2 bottom-full mb-4 opacity-0 translate-y-1 scale-95 pointer-events-none transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100">
                      <div className="flex items-center gap-1">
	                        <p className="font-medium text-[13px] tracking-13 leading-[130%] text-neutral-50">
	                          Try Surbee
                        </p>
                        <svg className="text-neutral-600 -mt-0.25" height="12" width="7" fill="none" viewBox="0 0 6 9" xmlns="http://www.w3.org/2000/svg">
                          <rect height="1.41526" width="1.41526" fill="currentColor" x="3.7002" y="3.79085" />
                          <rect height="1.41526" width="1.41526" fill="currentColor" x="0.884766" y="0.97023" />
                          <rect height="1.41526" width="1.41526" fill="currentColor" x="0.884766" y="6.6144" />
                          <rect height="4.24579" width="1.41526" fill="currentColor" x="2.28467" y="2.37558" />
                        </svg>
                      </div>
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent top-full border-t-[6px] border-t-neutral-900" />
	                    </div>
	                  </RevealDiv>
                </a>
	              </RevealDiv>
	            </RevealDiv>
	          </RevealSection>

          {/* Centered description text */}
          <RevealSection
            className="mt-8 mb-6 px-6"
          >
            <div className="text-center">
              <p className="text-[15px] text-neutral-600 leading-[140%] max-w-2xl mx-auto">
                Describe what you want, and Surbee drafts complete surveys — questions, options, and logic — instantly. Iterate with plain English.
              </p>
            </div>
          </RevealSection>

          {/* Features title */}
          <section className="px-6 pt-24 pb-2 text-center">
            <h2 className="font-af-foundary font-medium tracking-15 text-neutral-900 text-center text-[20px] leading-[130%] tracking-24 sm:text-[24px] sm:tracking-48 mb-8">
              Here's what Surbee can do for you
            </h2>
          </section>

	          {/* Divider spanning full content width and touching sidebar border */}
	          <div className="mt-2 h-px w-full bg-neutral-200" />

	          {/* Post-hero section */}
	          <div className="w-full border-t border-b border-gray-200">
            <RevealSection
              className="px-0 w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row"
            >
	              <div className="p-2 md:p-4 2xl:p-8 flex border-b lg:border-b-0 items-center justify-center lg:max-w-[60%] xl:max-w-[68%] lg:min-h-[630px] w-full overflow-hidden">
	                <div className="relative w-full h-full flex items-center justify-center p-8">
	                  <img
	                    className="absolute inset-0 object-cover rounded-lg"
	                    alt="Drone view colorful landscape"
	                    sizes="100vw"
	                    src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png?raw=true"
	                    style={{
	                      color: "transparent",
	                      inset: "0px",
	                      position: "absolute",
	                      height: "100%",
	                      width: "100%",
	                    }}
	                  />
	                  <div className="relative w-80 min-h-20 rounded-2xl overflow-hidden opacity-100 border border-[rgba(255,255,255,0.20)] p-1 bg-gradient-to-b from-[rgba(255,255,255,0.72)] to-[rgba(255,255,255,0.48)] shadow-[0_4px_12px_0_rgba(255,255,255,0.10)_inset,0_1px_8px_0_rgba(0,0,0,0.07),0_2px_6px_0_rgba(0,0,0,0.14)] backdrop-blur-lg">
	                    <div className="flex justify-between items-center pl-3 py-3 pr-2">
	                      <div className="text-gray-800 font-medium">
	                        <p className="font-af-foundary font-bold text-[15px] tracking-15 leading-[140%] text-neutral-800">
	                          Data Detective
	                        </p>
	                      </div>
                      <div className="border rounded-full min-w-[42px] text-center" style={{ background: "transparent", borderColor: "rgba(255, 255, 255, 0.3)", minWidth: "42px" }}>
                        <div className="text-gray-800 font-medium text-[12px]" style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "12px" }}>
                          95%
                        </div>
                      </div>
	                    </div>
	                    <div className="flex rounded-lg border" style={{ borderColor: "rgba(255, 255, 255, 0.1)", background: "rgba(255, 255, 255, 0.2)" }}>
	                      <div className="py-1 px-3 w-full">
	                        <div className="todo-item flex justify-between min-h-[36px] items-center py-3 border-b" style={{ borderColor: "rgba(16, 66, 89, 0.08)", minHeight: "42px" }}>
	                          <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">
	                            Suspicious patterns detected
	                          </p>
	                          <div className="w-4 h-4 flex items-center justify-center">
	                            <div className="flex items-center justify-center p-[7px] rounded-full bg-transparent border border-white/30 w-6 h-6">
	                              <svg className="lucide lucide-check w-3 h-3 text-white" height="12" width="12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
	                                <path d="M20 6 9 17l-5-5" />
	                              </svg>
	                            </div>
	                          </div>
	                        </div>
	                        <div className="todo-item flex justify-between min-h-[36px] items-center py-3 border-b" style={{ borderColor: "rgba(16, 66, 89, 0.08)", minHeight: "42px" }}>
	                          <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">
	                            Bot responses identified
	                          </p>
	                          <div className="w-4 h-4 flex items-center justify-center">
	                            <div className="flex items-center justify-center p-[7px] rounded-full bg-transparent border border-white/30 w-6 h-6">
	                              <svg className="lucide lucide-check w-3 h-3 text-white" height="12" width="12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
	                                <path d="M20 6 9 17l-5-5" />
	                              </svg>
	                            </div>
	                          </div>
	                        </div>
	                        <div className="todo-item flex justify-between min-h-[36px] items-center py-3" style={{ borderColor: "rgba(16, 66, 89, 0.08)", minHeight: "42px" }}>
	                          <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">
	                            Data quality verified
	                          </p>
	                          <div className="w-4 h-4 flex items-center justify-center">
	                            <div className="flex items-center justify-center p-[7px] rounded-full bg-transparent border border-white/30 w-6 h-6">
	                              <svg className="lucide lucide-check w-3 h-3 text-white" height="12" width="12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
	                                <path d="M20 6 9 17l-5-5" />
	                              </svg>
	                            </div>
	                          </div>
	                        </div>
	                      </div>
	                    </div>
	                  </div>
	                </div>
	              </div>
	              <div className="border-l border-gray-200 flex-1 flex flex-col justify-end p-5 sm:p-8 2xl:px-9 2xl:py-8">
	                <div className="relative w-full h-full overflow-hidden">
	                  <div className="relative w-full h-full min-h-[190px] sm:min-h-[170px] lg:min-h-auto flex flex-col justify-end">
	                    <div className="flex flex-col gap-8 justify-end h-full">
	                      <div className="flex flex-col gap-4">
	                        <h4 className="font-af-foundary font-medium tracking-15 [font-variant-numeric:lining-nums_proportional-nums] text-[24px] leading-[130%] tracking-24 sm:text-[24px] sm:tracking-48 text-left text-neutral-900">
	                          Detect Odd Behaviors & Bad Data
	                        </h4>
	                        <div className="flex flex-col gap-2">
	                          <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
	                            Surbee flags suspicious patterns, bots, and inconsistent answers — like a data detective.
	                          </p>
	                        </div>
	                      </div>
	                    </div>
	                  </div>
	                </div>
	              </div>
            </RevealSection>
	          </div>

	          {/* Second card section */}
	          <div className="w-full border-b border-gray-200">
            <RevealSection
              className="px-0 w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row-reverse"
            >
	              <div className="p-2 md:p-4 2xl:p-8 flex border-b lg:border-b-0 items-center justify-center lg:max-w-[60%] xl:max-w-[68%] lg:min-h-[630px] w-full overflow-hidden">
	                <div className="relative w-full h-full flex items-center justify-center p-8">
	                  <img
	                    className="absolute inset-0 object-cover rounded-lg"
	                    alt="Drone view colorful landscape 2"
	                    sizes="100vw"
	                    src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_abf323ce-3d0a-417d-8ce7-b307c8e84258.png?raw=true"
	                    style={{
	                      color: "transparent",
	                      inset: "0px",
	                      position: "absolute",
	                      height: "100%",
	                      width: "100%",
	                    }}
	                  />
	                  <div className="relative w-80 min-h-20 rounded-2xl overflow-hidden opacity-100 border border-[rgba(255,255,255,0.20)] p-1 bg-gradient-to-b from-[rgba(255,255,255,0.72)] to-[rgba(255,255,255,0.48)] shadow-[0_4px_12px_0_rgba(255,255,255,0.10)_inset,0_1px_8px_0_rgba(0,0,0,0.07),0_2px_6px_0_rgba(0,0,0,0.14)] backdrop-blur-lg">
	                    <div className="flex justify-between items-center pl-3 py-3 pr-2">
	                      <div className="text-gray-800 font-medium">
	                        <p className="font-af-foundary font-bold text-[15px] tracking-15 leading-[140%] text-neutral-800">
	                          Community Hub
	                        </p>
	                      </div>
                      <div className="border rounded-full min-w-[42px] text-center" style={{ background: "transparent", borderColor: "rgba(255, 255, 255, 0.3)", minWidth: "42px" }}>
                        <div className="text-gray-800 font-medium text-[12px]" style={{ color: "rgba(255, 255, 255, 0.9)", fontSize: "12px" }}>
                          127
                        </div>
                      </div>
	                    </div>
	                    <div className="flex rounded-lg border" style={{ borderColor: "rgba(255, 255, 255, 0.1)", background: "rgba(255, 255, 255, 0.2)" }}>
	                      <div className="py-1 px-3 w-full">
	                        <div className="todo-item flex justify-between min-h-[36px] items-center py-3 border-b" style={{ borderColor: "rgba(16, 66, 89, 0.08)", minHeight: "42px" }}>
	                          <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">
	                            Active discussions ongoing
	                          </p>
	                          <div className="w-4 h-4 flex items-center justify-center">
	                            <div className="flex items-center justify-center p-[7px] rounded-full bg-transparent border border-white/30 w-6 h-6">
	                              <svg className="lucide lucide-check w-3 h-3 text-white" height="12" width="12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
	                                <path d="M20 6 9 17l-5-5" />
	                              </svg>
	                            </div>
	                          </div>
	                        </div>
	                        <div className="todo-item flex justify-between min-h-[36px] items-center py-3 border-b" style={{ borderColor: "rgba(16, 66, 89, 0.08)", minHeight: "42px" }}>
	                          <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">
	                            50 responses collected
	                          </p>
	                          <div className="w-4 h-4 flex items-center justify-center">
	                            <div className="flex items-center justify-center p-[7px] rounded-full bg-transparent border border-white/30 w-6 h-6">
	                              <svg className="lucide lucide-check w-3 h-3 text-white" height="12" width="12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
	                                <path d="M20 6 9 17l-5-5" />
	                              </svg>
	                            </div>
	                          </div>
	                        </div>
	                        <div className="todo-item flex justify-between min-h-[36px] items-center py-3" style={{ borderColor: "rgba(16, 66, 89, 0.08)", minHeight: "42px" }}>
	                          <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">
	                            Insights surfaced
	                          </p>
	                          <div className="w-4 h-4 flex items-center justify-center">
	                            <div className="flex items-center justify-center p-[7px] rounded-full bg-transparent border border-white/30 w-6 h-6">
	                              <svg className="lucide lucide-check w-3 h-3 text-white" height="12" width="12" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
	                                <path d="M20 6 9 17l-5-5" />
	                              </svg>
	                            </div>
	                          </div>
	                        </div>
	                      </div>
	                    </div>
	                  </div>
	                </div>
	              </div>
	              <div className="lg:border-r border-gray-200 flex-1 flex flex-col justify-end p-5 sm:p-8 2xl:px-9 2xl:py-8">
	                <div className="relative w-full h-full overflow-hidden">
	                  <div className="relative w-full h-full min-h-[190px] sm:min-h-[170px] lg:min-h-auto flex flex-col justify-end">
	                    <div className="flex flex-col gap-8 justify-end h-full">
	                      <div className="flex flex-col gap-4">
	                        <h4 className="font-af-foundary font-medium tracking-15 [font-variant-numeric:lining-nums_proportional-nums] text-[24px] leading-[130%] tracking-24 sm:text-[24px] sm:tracking-48 text-left text-neutral-900">
	                          Grow a Community Around Your Surveys
	                        </h4>
	                        <div className="flex flex-col gap-2">
	                          <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-700 [font-variant-numeric:lining-nums_proportional-nums]">
	                            Launch a lightweight community where participants discuss, respond, and resurface insights.
	                          </p>
	                        </div>
	                      </div>
	                    </div>
	                  </div>
	                </div>
	              </div>
            </RevealSection>
	          </div>

	          {/* Spacer section */}
	          <div className="py-12"></div>

	          {/* Integrations Section */}
          <RevealSection
            className="py-8 mx-auto w-full max-w-4xl flex flex-col justify-center items-center"
          >
	            <h2 className="font-af-foundary font-medium tracking-15 text-neutral-900 text-center text-[20px] leading-[130%] tracking-24 sm:text-[24px] sm:tracking-48 mb-8">
	              Connect the tools you already use
	            </h2>
	            <div className="flex justify-center gap-3 sm:gap-4 pb-5 md:pb-6 border-t border-b border-gray-200 pt-3 md:pt-6 px-3 sm:px-4 flex-wrap">
	              <div className="flex justify-center gap-3 sm:gap-4 pb-5 md:pb-6 border-t border-gray-200 pt-3 md:pt-6 border-b px-3 sm:px-4">
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={24}
	                      width={30}
	                      alt="Airtable"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/airtable.f153f282.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fairtable.f153f282.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fairtable.f153f282.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Airtable
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="Attio"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/attio.bb561be4.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fattio.bb561be4.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fattio.bb561be4.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Attio
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={41}
	                      width={30}
	                      alt="Sheets"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/google-sheets.0ca29299.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-sheets.0ca29299.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-sheets.0ca29299.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Sheets
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="Google Forms"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/google-forms.12345678.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-forms.12345678.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-forms.12345678.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Google Forms
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="SurveyMonkey"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/surveymonkey.87654321.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsurveymonkey.87654321.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsurveymonkey.87654321.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      SurveyMonkey
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={41}
	                      width={30}
	                      alt="Docs"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/google-docs.f7ba532d.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-docs.f7ba532d.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-docs.f7ba532d.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Docs
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="Calendar"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/google-calendar.2438840b.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-calendar.2438840b.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-calendar.2438840b.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Calendar
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={23}
	                      width={30}
	                      alt="Gmail"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/gmail.e5bdc0e4.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgmail.e5bdc0e4.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgmail.e5bdc0e4.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Gmail
	                    </span>
	                  </div>
	                </div>
	              </div>
	              <div className="flex justify-center gap-3 sm:gap-4 pb-5 md:pb-6 border-b border-gray-200 px-3 sm:px-4">
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="Intercom"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/intercom.64399410.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fintercom.64399410.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fintercom.64399410.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Intercom
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="Notion"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/notion.f18f0582.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fnotion.f18f0582.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fnotion.f18f0582.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Notion
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="Limitless"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/limitless.70cd9c81.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flimitless.70cd9c81.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flimitless.70cd9c81.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Limitless
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="Linear"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/linear.1c44320d.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flinear.1c44320d.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flinear.1c44320d.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Linear
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="Loops"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/loops.66c08dd0.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Floops.66c08dd0.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Floops.66c08dd0.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Loops
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="Metabase"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/metabase.d38bb0ee.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmetabase.d38bb0ee.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmetabase.d38bb0ee.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Metabase
	                    </span>
	                  </div>
	                </div>
	              </div>
	              <div className="flex justify-center gap-3 sm:gap-4 pb-5 md:pb-6 border-b border-gray-200 px-3 sm:px-4">
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={27}
	                      width={30}
	                      alt="PDL"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/people-data-labs.9aafd8bf.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fpeople-data-labs.9aafd8bf.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fpeople-data-labs.9aafd8bf.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      PDL
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="PostHog"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/posthog.0fe60258.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fposthog.0fe60258.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fposthog.0fe60258.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      PostHog
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="Slack"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/slack.b35ec1a3.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fslack.b35ec1a3.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fslack.b35ec1a3.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Slack
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={30}
	                      width={30}
	                      alt="Github"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/github.0fa38615.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgithub.0fa38615.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgithub.0fa38615.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Github
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={41}
	                      width={30}
	                      alt="Slides"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/google-slides.b68e7a05.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-slides.b68e7a05.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-slides.b68e7a05.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Slides
	                    </span>
	                  </div>
	                </div>
	              </div>
	            </div>
	            <div className="space-y-6 min-[365px]:hidden">
	              <div className="flex justify-center flex-wrap gap-y-6 gap-x-3 pb-6">
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Airtable"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/airtable.f153f282.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fairtable.f153f282.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fairtable.f153f282.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Airtable
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Attio"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/attio.bb561be4.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fattio.bb561be4.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fattio.bb561be4.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Attio
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Sheets"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/google-sheets.0ca29299.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-sheets.0ca29299.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-sheets.0ca29299.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Sheets
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Docs"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/google-docs.f7ba532d.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-docs.f7ba532d.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-docs.f7ba532d.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Docs
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Calendar"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/google-calendar.2438840b.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-calendar.2438840b.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-calendar.2438840b.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Calendar
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Gmail"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/gmail.e5bdc0e4.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgmail.e5bdc0e4.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgmail.e5bdc0e4.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Gmail
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Intercom"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/intercom.64399410.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fintercom.64399410.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fintercom.64399410.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Intercom
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Notion"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/notion.f18f0582.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fnotion.f18f0582.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fnotion.f18f0582.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Notion
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Limitless"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/limitless.70cd9c81.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flimitless.70cd9c81.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flimitless.70cd9c81.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Limitless
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Linear"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/linear.1c44320d.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flinear.1c44320d.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flinear.1c44320d.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Linear
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Loops"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/loops.66c08dd0.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Floops.66c08dd0.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Floops.66c08dd0.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Loops
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Metabase"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/metabase.d38bb0ee.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmetabase.d38bb0ee.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fmetabase.d38bb0ee.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Metabase
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="PDL"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/people-data-labs.9aafd8bf.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fpeople-data-labs.9aafd8bf.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fpeople-data-labs.9aafd8bf.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      PDL
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="PostHog"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/posthog.0fe60258.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fposthog.0fe60258.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fposthog.0fe60258.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      PostHog
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Slack"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/slack.b35ec1a3.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fslack.b35ec1a3.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fslack.b35ec1a3.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Slack
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Github"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/github.0fa38615.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgithub.0fa38615.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgithub.0fa38615.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Github
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <img
	                      height={64}
	                      width={64}
	                      alt="Slides"
	                      src="https://cofounder.co/_next/image?url=/_next/static/media/google-slides.b68e7a05.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD"
	                      srcSet="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-slides.b68e7a05.avif&w=64&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 1x, /_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgoogle-slides.b68e7a05.avif&w=128&q=75&dpl=dpl_HY9P3FzB29EFnuuhHdxrrNak6CfD 2x"
                      style={{
                        color: "transparent",
                      }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Slides
	                    </span>
	                  </div>
	                </div>
	              </div>
	            </div>
          </RevealSection>

	          {/* Testimonials Section */}
	          <div className="w-full">
	            <section
	              id="results"
	              className="2xl:pb-[120px] xl:pb-[100px] md:pb-[80px] pb-[60px] 2xl:pt-[120px] xl:pt-[100px] md:pt-[80px] pt-[60px] 2xl:px-30 xl:px-12 md:px-8 px-5 w-full max-w-[1920px] mx-auto"
	            >
	              <h2 className="font-af-foundary font-medium tracking-15 text-[#171717] text-center text-[20px] leading-[130%] tracking-24 sm:text-[24px] sm:tracking-48 mb-12">
	                What people are saying about Surbee
	              </h2>
	              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
	                {/* Left Testimonial */}
	                <div className="flex flex-col gap-6 p-8 bg-neutral-50 rounded-lg">
	                  <p className="font-af-foundary font-medium text-[18px] md:text-[20px] text-[#171717] leading-[140%]">
	                    "Surbee will help my students collect reliable results quickly, it's definitely going to raise the quality of their work. The automated validation catches issues I used to spend hours explaining."
	                  </p>
	                  <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-[#171717]">
	                    — Prelaunch testimonial
	                  </p>
	                </div>
	                
	                {/* Right Testimonial */}
	                <div className="flex flex-col gap-6 p-8 bg-neutral-50 rounded-lg">
	                  <p className="font-af-foundary font-medium text-[18px] md:text-[20px] text-[#171717] leading-[140%]">
	                    "I've been waiting for something like this. Creating surveys used to take me days, now I can prototype in minutes and iterate based on real feedback. It's going to change how we do research."
	                  </p>
	                  <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-[#171717]">
	                    — Prelaunch testimonial
	                  </p>
	                </div>
	              </div>
	            </section>
	          </div>

	          {/* Footer Section */}
	          <RevealSection className="mt-8 w-full px-6 pb-8">
	            <RevealDiv className="relative h-[50vh] w-full overflow-hidden rounded-md">
	              <img
	                src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__423e2f06-d2d7-4c2c-bd7b-9aec2b6c1fbe.png?raw=true"
	                alt="Join our community"
	                className="h-full w-full object-cover"
	              />
	              
	              {/* Centered overlay card */}
	              <RevealDiv className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
	                <a
	                  className="cursor-pointer pointer-events-auto group"
	                  href="https://discord.gg/surbee"
	                  target="_blank"
	                  rel="noopener noreferrer"
	                >
	                  <RevealDiv className="relative inline-block">
	                    <div className="rounded-lg px-8 py-6 backdrop-blur-lg max-w-[calc(100vw_-_64px)] w-[500px] flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-[rgba(255,255,255,0.80)] to-[rgba(255,255,255,0.16)] shadow-[0px_4px_12px_0px_rgba(255,255,255,0.10)_inset,0px_0px_0px_6px_rgba(255,255,255,0.40),0px_1px_8px_0px_rgba(0,0,0,0.13),0px_2px_6px_0px_rgba(0,0,0,0.20)]">
	                      <h3 className="text-[#171717] font-semibold text-[28px] leading-[130%] tracking-[-0.56px] text-center">
	                        Join Our Community
	                      </h3>
	                      <p className="text-[#171717] text-[15px] leading-[140%] text-center">
	                        Connect with researchers, share insights, and stay updated on Surbee
	                      </p>
	                    </div>
	                    
	                    {/* Hover tooltip */}
	                    <div className="absolute z-50 bg-neutral-900 backdrop-blur-[20px] flex flex-col gap-1.5 px-3 py-1 w-min rounded-full whitespace-nowrap text-[#EEF1ED] text-xs font-medium leading-[130%] tracking-[-0.12px] left-1/2 transform -translate-x-1/2 bottom-full mb-4 opacity-0 translate-y-1 scale-95 pointer-events-none transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100">
	                      <div className="flex items-center gap-1">
	                        <p className="font-medium text-[13px] tracking-13 leading-[130%] text-neutral-50">
	                          Join Discord
	                        </p>
	                        <svg className="text-neutral-600 -mt-0.25" height="12" width="7" fill="none" viewBox="0 0 6 9" xmlns="http://www.w3.org/2000/svg">
	                          <rect height="1.41526" width="1.41526" fill="currentColor" x="3.7002" y="3.79085" />
	                          <rect height="1.41526" width="1.41526" fill="currentColor" x="0.884766" y="0.97023" />
	                          <rect height="1.41526" width="1.41526" fill="currentColor" x="0.884766" y="6.6144" />
	                          <rect height="4.24579" width="1.41526" fill="currentColor" x="2.28467" y="2.37558" />
	                        </svg>
	                      </div>
	                      <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent top-full border-t-[6px] border-t-neutral-900" />
	                    </div>
	                  </RevealDiv>
	                </a>
	              </RevealDiv>
	            </RevealDiv>
	          </RevealSection>
        </main>
      </div>
    </div>
  );
}


