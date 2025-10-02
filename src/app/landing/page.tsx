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
            <div className="relative h-[70vh] w-full overflow-hidden rounded-md">
              <img
                src="https://github.com/Surbee001/webimg/blob/main/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__cbbf9473-785a-4dc6-a4d0-8eb684185fbc.png?raw=true"
                alt="Surbee hero landscape"
                className="h-full w-full object-cover"
              />

              {/* Centered overlay prompt card */}
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                <a
                  className="cursor-pointer pointer-events-auto"
                  href="https://app.cofounder.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="relative inline-block">
                    <div className="rounded-lg px-4 pt-5 pb-3 backdrop-blur-lg max-w-[calc(100vw_-_64px)] w-[512px] flex flex-col justify-between gap-4 min-h-[125px] bg-gradient-to-b from-[rgba(255,255,255,0.80)] to-[rgba(255,255,255,0.16)] shadow-[0px_4px_12px_0px_rgba(255,255,255,0.10)_inset,0px_0px_0px_6px_rgba(255,255,255,0.40),0px_1px_8px_0px_rgba(0,0,0,0.13),0px_2px_6px_0px_rgba(0,0,0,0.20)] transition-all duration-300">
                      <div className="flex flex-col gap-4 tracking-15 leading-[140%] text-neutral-800">
                        <span
                          className="font-af-foundary font-medium"
                          style={{
                            clipPath: "inset(0px 50% 0px 0px)",
                            filter: "blur(6.412px)",
                            opacity: 0.1985,
                          }}
                        >
                          When an email is a bug report, create a new linear issue and message the #bugs channel
                        </span>
                      </div>
                      <div className="flex flex-row gap-4 items-center justify-between">
                        <svg height="20" width="20" fill="none" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.374 6.58264L6.19085 12.8682C5.97358 13.092 5.85309 13.3924 5.85544 13.7043C5.85779 14.0162 5.98278 14.3147 6.2034 14.5352C6.42403 14.7558 6.72256 14.8806 7.03449 14.8828C7.34642 14.885 7.6467 14.7644 7.87042 14.5471L15.2411 7.07471C15.6865 6.62926 15.9368 6.0251 15.9368 5.39514C15.9368 4.76518 15.6865 4.16102 15.2411 3.71557C14.7956 3.27012 14.1915 3.01987 13.5615 3.01987C12.9316 3.01987 12.3274 3.27012 11.8819 3.71557L4.51128 11.1887C3.85217 11.8586 3.48448 12.7618 3.48831 13.7016C3.49214 14.6414 3.86717 15.5416 4.53171 16.2062C5.19626 16.8707 6.09647 17.2458 7.03628 17.2496C7.97608 17.2534 8.87932 16.8857 9.54925 16.2266L15.6396 10.1451" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-primary text-primary-foreground border border-neutral-700 size-9 text-[15px] tracking-15 leading-[140%] rounded-full cursor-pointer h-8 w-8">
                          <svg height="13" width="11" fill="none" viewBox="0 0 11 13" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.2392 6.0143C10.1938 6.0597 10.14 6.09571 10.0807 6.12028C10.0214 6.14485 9.95791 6.15749 9.89375 6.15749C9.82959 6.15749 9.76606 6.14485 9.70679 6.12028C9.64752 6.09571 9.59368 6.0597 9.54833 6.0143L5.98795 2.45331V12.0158C5.98795 12.1453 5.93651 12.2695 5.84495 12.361C5.75339 12.4526 5.6292 12.504 5.49972 12.504C5.37023 12.504 5.24605 12.4526 5.15449 12.361C5.06293 12.2695 5.01149 12.1453 5.01149 12.0158V2.45331L1.4511 6.0143C1.35949 6.10592 1.23524 6.15738 1.10568 6.15738C0.976127 6.15738 0.851876 6.10592 0.760265 6.0143C0.668654 5.92269 0.617188 5.79844 0.617188 5.66888C0.617187 5.53933 0.668654 5.41507 0.760265 5.32346L5.1543 0.92943C5.19964 0.884036 5.25349 0.848025 5.31276 0.823456C5.37203 0.798886 5.43556 0.78624 5.49972 0.78624C5.56388 0.78624 5.62741 0.798886 5.68668 0.823456C5.74595 0.848025 5.7998 0.884036 5.84514 0.92943L10.2392 5.32346C10.2846 5.36881 10.3206 5.42265 10.3451 5.48192C10.3697 5.54119 10.3824 5.60472 10.3824 5.66888C10.3824 5.73304 10.3697 5.79658 10.3451 5.85584C10.3206 5.91511 10.2846 5.96896 10.2392 6.0143Z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="absolute z-50 bg-neutral-900 backdrop-blur-[20px] flex flex-col gap-1.5 px-3 py-1 w-min rounded-full whitespace-nowrap text-[#EEF1ED] text-xs font-medium leading-[130%] tracking-[-0.12px] left-1/2 transform -translate-x-1/2 bottom-full mb-4 opacity-100 translate-y-0 pointer-events-auto">
                      <div className="flex items-center gap-1">
                        <p className="font-medium text-[13px] tracking-13 leading-[130%] text-neutral-50">
                          Try Cofounder yourself
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
                  </div>
                </a>
              </div>
            </div>
          </section>

          {/* Divider spanning full content width and touching sidebar border */}
          <div className="mt-8 h-px w-full bg-neutral-200" />
        </main>
      </div>
    </div>
  );
}


