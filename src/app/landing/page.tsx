import React from "react";
import dynamic from "next/dynamic";
const RevealSection = dynamic(() => import("@/components/landing/Reveal").then(m => m.RevealSection), { ssr: false });
const RevealDiv = dynamic(() => import("@/components/landing/Reveal").then(m => m.RevealDiv), { ssr: false });
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
              href="/test-login"
            className="rounded-full border border-neutral-300 px-4 py-1.5 text-sm text-[#171717] hover:bg-neutral-100"
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
          <div className="flex h-full flex-col justify-between p-4 pt-20">
            <div className="px-1 mt-auto mb-5">
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
          <section className="px-6 pt-12 pb-8 text-center">
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
	            <div className="space-y-5 md:space-y-6 w-min mx-auto hidden min-[365px]:block">
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

	          {/* Results Section */}
	          <div className="w-full">
	            <section
	              id="results"
	              className="2xl:pb-[220px] xl:pb-[200px] md:pb-[160px] pb-[120px] 2xl:pt-[200px] xl:pt-[180px] md:pt-[140px] pt-[120px] 2xl:px-30 xl:px-12 md:px-8 px-5 w-full max-w-[1920px] mx-auto"
	            >
	              <div className="flex flex-col lg:flex-row gap-30 sm:gap-23 lg:gap-8 items-center">
	                <div className="flex flex-col flex-1 gap-8 lg:gap-15 text-center lg:text-left">
	                  <div className="flex flex-col">
	                    <p className="font-mondwest font-normal text-[54px] sm:text-[64px] md:text-[54px] lg:text-[64px] text-neutral-900 leading-[130%] tracking-[-1.28px]">
	                      15,847
	                    </p>
	                    <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">
	                      surveys created with Surbee
	                    </p>
	                  </div>
	                  <div className="flex flex-col">
	                    <p className="font-mondwest font-normal text-[54px] sm:text-[64px] md:text-[54px] lg:text-[64px] text-neutral-900 leading-[130%] tracking-[-1.28px]">
	                      2.3M+
	                    </p>
	                    <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">
	                      responses collected and analyzed
	                    </p>
	                  </div>
	                  <div className="flex flex-col">
	                    <p className="font-mondwest font-normal text-[54px] sm:text-[64px] md:text-[54px] lg:text-[64px] text-neutral-900 leading-[130%] tracking-[-1.28px]">
	                      <span className="flex items-center lg:justify-start justify-center gap-1">
	                        500{" "}
	                        <svg
	                          height="23"
	                          width="23"
	                          fill="none"
	                          viewBox="0 0 23 23"
	                          xmlns="http://www.w3.org/2000/svg"
	                        >
	                          <path
	                            d="M13.4688 10.1087H22.6451V13.3826H13.4688V22.8816H10.1488V13.3826H0.972575V10.1087H10.1488V0.563566H13.4688V10.1087Z"
	                            fill="#2C2C2C"
	                          />
	                        </svg>
	                      </span>
	                    </p>
	                    <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800">
	                      active researchers using Surbee
	                    </p>
	                  </div>
	                </div>
	                <div className="flex flex-col flex-1 gap-8 items-center lg:items-start">
	                  <div className="w-full max-w-[600px]">
	                    <div className="relative w-full h-full overflow-hidden">
	                      <div className="relative w-full h-full flex flex-col justify-end">
	                        <div className="relative h-full opacity-0 pointer-events-none overflow-hidden">
	                          <div className="flex w-full h-full flex-row flex-no-wrap">
	                            <div
	                              className="flex-shrink-0 w-full h-full"
	                              style={{ minWidth: "100%" }}
	                            >
	                              <div className="flex flex-col gap-8 justify-end items-center lg:items-start h-full pl-1 py-1">
	                                <img
	                                  className="rounded-md base-box-shadow"
	                                  height={104}
	                                  width={91}
	                                  alt="User"
	                                  src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_861e01b6-89f3-4d0f-aad6-6192ba927e14.png?raw=true"
                                  style={{
                                    WebkitUserDrag: "none",
                                    userSelect: "none",
                                    boxShadow:
                                      "rgba(0, 0, 0, 0.14) 0px 2px 2px, rgba(0, 0, 0, 0) 0px 6px 6px, rgba(0, 0, 0, 0.06) 0px 0px 0px 3px",
                                    color: "transparent",
                                  } as React.CSSProperties & { WebkitUserDrag: string }}
	                                />
	                                <p className="font-af-foundary font-medium text-[24px] md:text-[28px] text-center lg:text-left max-w-[504px] lg:max-w-[520px] leading-[130%] tracking-48">
                                  <span
                                    className="relative"
                                    style={{
                                      background: "#c2185b", // Darker red
                                      padding: "0 4px",
                                      borderRadius: "2px",
                                    }}
                                  >
	                                    "Surbee's AI-powered survey creation has
	                                    completely transformed our research workflow.
	                                  </span>{" "}
	                                  It automatically generates sophisticated surveys
	                                  from simple descriptions, analyzes responses with
	                                  incredible accuracy, and saves us countless hours of manual work."
	                                </p>
	                                <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-700">
	                                  Dr. Sarah Martinez, Research Director at Insight Analytics
	                                </p>
	                              </div>
	                            </div>
	                            <div
	                              className="flex-shrink-0 w-full h-full"
	                              style={{ minWidth: "100%" }}
	                            >
	                              <div className="flex flex-col gap-8 justify-end items-center lg:items-start h-full pl-1 py-1">
	                                <img
	                                  className="rounded-md base-box-shadow"
	                                  height={104}
	                                  width={91}
	                                  alt="User"
	                                  src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__496a7873-dd10-4e60-a067-a2c0bc0ef982.png?raw=true"
                                  style={{
                                    WebkitUserDrag: "none",
                                    userSelect: "none",
                                    boxShadow:
                                      "rgba(0, 0, 0, 0.14) 0px 2px 2px, rgba(0, 0, 0, 0) 0px 6px 6px, rgba(0, 0, 0, 0.06) 0px 0px 0px 3px",
                                    color: "transparent",
                                  } as React.CSSProperties & { WebkitUserDrag: string }}
	                                />
	                                <p className="font-af-foundary font-medium text-[24px] md:text-[28px] text-center lg:text-left max-w-[504px] lg:max-w-[520px] leading-[130%] tracking-48">
	                                  "As a market researcher, Surbee has revolutionized
	                                  how we conduct studies. The AI generates nuanced
	                                  questions automatically, detects response quality
	                                  issues in real-time, and{" "}
                                  <span
                                    className="relative"
                                    style={{
                                      background: "#c2185b", // Darker red
                                      padding: "0 4px",
                                      borderRadius: "2px",
                                    }}
                                  >
	                                    delivers insights 10x faster than traditional methods."
	                                  </span>
	                                </p>
	                                <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-700">
	                                  Michael Chen, Head of UX Research at TechFlow
	                                </p>
	                              </div>
	                            </div>
	                          </div>
	                        </div>
	                        <div
	                          className="absolute inset-0 w-full h-full cursor-pointer"
	                          style={{
	                            transition: "none",
	                            opacity: 1,
	                            filter: "blur(0px)",
	                            clipPath: "inset(0px)",
	                            pointerEvents: "auto",
	                          }}
	                        >
	                          <div className="flex flex-col gap-8 justify-end items-center lg:items-start h-full pl-1 py-1">
	                            <img
	                              className="rounded-md base-box-shadow"
	                              height={104}
	                              width={91}
	                              alt="Results"
	                              src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_861e01b6-89f3-4d0f-aad6-6192ba927e14.png?raw=true"
                                  style={{
                                    WebkitUserDrag: "none",
                                    userSelect: "none",
                                    boxShadow:
                                      "rgba(0, 0, 0, 0.14) 0px 2px 2px, rgba(0, 0, 0, 0) 0px 6px 6px, rgba(0, 0, 0, 0.06) 0px 0px 0px 3px",
                                    color: "transparent",
                                  } as React.CSSProperties & { WebkitUserDrag: string }}
	                            />
	                            <p className="font-af-foundary font-medium text-[24px] md:text-[28px] text-center lg:text-left max-w-[504px] lg:max-w-[520px] leading-[130%] tracking-48">
                                  <span
                                    className="relative"
                                    style={{
                                      background: "#c2185b", // Darker red
                                      padding: "0 4px",
                                      borderRadius: "2px",
                                    }}
                                  >
	                                "Integrating GIC into my daily operations has been a
	                                complete game-changer for my efficiency.
	                              </span>{" "}
	                              Their swarm of agents seamlessly handles tasks that
	                              used to consume hours of my time, allowing me to focus
	                              on decision-making. I love it– huge time save and
	                              efficiency boost."
	                            </p>
	                            <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-700">
	                              Blaine Davis at Superconnector
	                            </p>
	                          </div>
	                        </div>
	                        <div
	                          className="absolute inset-0 w-full h-full cursor-pointer"
	                          style={{
	                            transition: "none",
	                            opacity: 0,
	                            filter: "blur(4px)",
	                            clipPath: "inset(0px)",
	                            pointerEvents: "none",
	                          }}
	                        >
	                          <div className="flex flex-col gap-8 justify-end items-center lg:items-start h-full pl-1 py-1">
	                            <img
	                              className="rounded-md base-box-shadow"
	                              height={104}
	                              width={91}
	                              alt="Results"
	                              src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__496a7873-dd10-4e60-a067-a2c0bc0ef982.png?raw=true"
                                  style={{
                                    WebkitUserDrag: "none",
                                    userSelect: "none",
                                    boxShadow:
                                      "rgba(0, 0, 0, 0.14) 0px 2px 2px, rgba(0, 0, 0, 0) 0px 6px 6px, rgba(0, 0, 0, 0.06) 0px 0px 0px 3px",
                                    color: "transparent",
                                  } as React.CSSProperties & { WebkitUserDrag: string }}
	                            />
	                            <p className="font-af-foundary font-medium text-[24px] md:text-[28px] text-center lg:text-left max-w-[504px] lg:max-w-[520px] leading-[130%] tracking-48">
	                              "As a solo founder, Cofounder has opened up my time
	                              from responding and coordinating user interviews to
	                              being able to work on the product full time and ship
	                              faster than just working solo or even with an EA.{" "}
                                  <span
                                    className="relative"
                                    style={{
                                      background: "#c2185b", // Darker red
                                      padding: "0 4px",
                                      borderRadius: "2px",
                                    }}
                                  >
	                                Truly couldn't function without it."
	                              </span>
	                            </p>
	                            <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-700">
	                              Sabina Cabrera at Pogidraw
	                            </p>
	                          </div>
	                        </div>
	                      </div>
	                      <div className="mt-8 w-full flex justify-center lg:justify-start">
	                        <div className="h-3 flex items-center gap-1 border border-neutral-300 rounded-full py-1 px-1.25">
	                          <div className="relative h-1 flex">
	                            <button
	                              className="relative transition-all duration-300 ease-out w-[7px] h-1 bg-neutral-900 rounded-[4px]"
	                              aria-label="Go to slide 1"
	                            />
	                          </div>
	                          <div className="relative h-1 flex">
	                            <button
	                              className="relative transition-all duration-300 ease-out w-1 h-1 bg-neutral-600 hover:bg-white/75 rounded-full"
	                              aria-label="Go to slide 2"
	                            />
	                          </div>
	                        </div>
	                      </div>
	                    </div>
	                  </div>
	                </div>
	              </div>
	            </section>
	          </div>
        </main>
      </div>
    </div>
  );
}


