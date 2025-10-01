'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './cofounder-landing.css';

export default function CofounderLanding() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  useEffect(() => {
    // Fade in animations
    const fadeElements = document.querySelectorAll('.opacity-0');
    fadeElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.remove('opacity-0');
      }, 100 * index);
    });
  }, []);

  return (
    <div className="__variable_5567bd __variable_12efe5 __variable_9a8899 antialiased bg-neutral-50">
      <main className="flex flex-row h-screen pt-20">
        {/* Sidebar */}
        <div className="flex flex-col w-[var(--sidebar-width)] border-r h-full justify-between pt-6 pb-12 pl-20 pr-12 fixed top-0 left-0 gap-12 hidden lg:flex bg-neutral-50 z-52">
          <Image
            alt="Cofounder"
            loading="lazy"
            width={74}
            height={142}
            className="-ml-3 transition-opacity duration-700 ease-out opacity-0"
            src="/images/cofunder-logo-flower.avif"
          />
          
          <div className="logo-context-menu fixed bg-neutral-50 rounded-lg p-2 shadow-md border" style={{ top: 0, left: 0, zIndex: -1, opacity: 0, transform: 'scale(0.95)' }}>
            <div className="text-neutral-700 transition-colors py-2 px-1.5 hover:bg-neutral-100 cursor-pointer rounded-md">
              <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%]">
                Download logo as PNG
              </p>
            </div>
            <hr className="border-neutral-400 my-0.25" />
            <div className="text-neutral-700 transition-colors py-2 px-1.5 hover:bg-neutral-100 cursor-pointer rounded-md">
              <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%]">
                Download wordmark as PNG
              </p>
            </div>
            <div className="text-neutral-700 transition-colors py-2 px-1.5 hover:bg-neutral-100 cursor-pointer rounded-md">
              <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%]">
                Download wordmark as SVG
              </p>
            </div>
          </div>

          <div className="flex flex-col full-page-width gap-2 transition-opacity duration-700 ease-out opacity-0">
            <Link href="#cofounder" className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1">
              Cofounder
            </Link>
            <Link href="#use-cases" className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1">
              Use cases
            </Link>
            <Link href="#product" className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1">
              Product
            </Link>
            <Link href="#agents" className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1">
              Agents
            </Link>
            <Link href="#integrations" className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1">
              Integrations
            </Link>
            <Link href="#results" className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1">
              Results
            </Link>
            <Link href="#blog" className="inline-flex items-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 cursor-pointer underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-900 hover:text-neutral-700 rounded px-2 py-1 -ml-1">
              Blog
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:pl-[var(--sidebar-width)] max-w-full">
          {/* Navigation */}
          <nav className="fixed top-0 z-[102] bg-white/90 backdrop-blur-sm transition-[min-height] duration-180 ease-in-out sidebar-page-width">
            <div className="w-full">
              <div className="2xl:px-30 xl:px-12 md:px-8 px-5 max-w-[1920px] mx-auto w-full flex items-center justify-between py-2 min-h-20">
                <Link href="/" className="text-neutral-900 hover:text-neutral-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="120" height="30" viewBox="0 0 86 16" fill="none">
                    <path d="M81.6948 15.9999H78.3271V15.1618H79.1652V8.42147H78.3271V7.57828H79.1652V6.73509H80.0084V5.89191H80.8516V7.57828H81.6948V8.42147H80.8516V15.1618H81.6948V15.9999ZM85.0624 8.42147H83.3811V7.57828H81.6948V6.73509H85.0624V8.42147Z" fill="currentColor" />
                    <path d="M75.7972 16H71.5864V15.162H70.7432V14.3188H69.9001V12.6324H69.062V10.108H69.9001V8.4216H70.7432V9.26479H75.7972V8.4216H74.954V7.57842H71.5864V6.73523H75.7972V7.57842H76.6404V8.4216H77.4836V10.108H70.7432V12.6324H71.5864V14.3188H72.4296V15.162H75.7972V16ZM71.5864 8.4216H70.7432V7.57842H71.5864V8.4216ZM77.4836 14.3188H76.6404V13.4756H77.4836V14.3188ZM76.6404 15.162H75.7972V14.3188H76.6404V15.162Z" fill="currentColor" />
                    <path d="M68.6503 16H66.1207V15.162H65.2775V14.3188H66.1207V8.42159H65.2775V7.57841H66.1207V2.52442H65.2775V1.68123H66.1207V0.838046H66.9639V0H67.8071V15.162H68.6503V16ZM65.2775 16H61.9099V15.162H61.0667V14.3188H60.2235V12.6324H59.3855V10.108H60.2235V8.42159H61.0667V7.57841H61.9099V6.73522H65.2775V7.57841H62.7531V8.42159H61.9099V10.108H61.0667V12.6324H61.9099V14.3188H62.7531V15.162H65.2775V16Z" fill="currentColor" />
                    <path d="M52.2128 15.9999H48.8452V15.1618H49.6833V8.42147H48.8452V7.57828H49.6833V6.73509H50.5264V5.89191H51.3696V7.57828H52.2128V8.42147H51.3696V15.1618H52.2128V15.9999ZM58.5316 15.9999H55.1588V15.1618H56.002V8.42147H55.1588V7.57828H52.2128V6.73509H56.002V7.57828H56.8452V8.42147H57.6884V15.1618H58.5316V15.9999Z" fill="currentColor" />
                    <path d="M43.7859 16H40.8399V15.162H39.9967V14.3188H39.1535V7.57842H38.3154V6.73523H40.8399V14.3188H41.683V15.162H43.7859V16ZM48.0018 16H45.4722V14.3188H44.6291V13.4756H45.4722V7.57842H44.6291V6.73523H47.1586V15.162H48.0018V16ZM44.6291 15.162H43.7859V14.3188H44.6291V15.162Z" fill="currentColor" />
                    <path d="M35.3639 16H31.1531V15.162H30.3099V14.3188H29.4667V12.6324H28.6287V10.108H29.4667V8.4216H30.3099V7.57842H31.1531V6.73523H35.3639V7.57842H36.2071V8.4216H37.0503V10.108H37.8934V12.6324H37.0503V14.3188H36.2071V15.162H35.3639V16ZM31.9963 15.162H34.5207V14.3188H35.3639V12.6324H36.2071V10.108H35.3639V8.4216H34.5207V7.57842H31.9963V8.4216H31.1531V10.108H30.3099V12.6324H31.1531V14.3188H31.9963V15.162Z" fill="currentColor" />
                    <path d="M29.9083 2.52442H28.227V0.838046H25.6975V0H29.0651V0.838046H29.9083V2.52442ZM26.5407 16H23.173V15.162H24.0111V7.57841H22.7566V6.73522H24.0111V2.52442H24.8543V0.838046H25.6975V6.73522H28.6435V7.57841H25.6975V15.162H26.5407V16Z" fill="currentColor" />
                    <path d="M19.7948 16H15.584V15.162H14.7408V14.3188H13.8976V12.6324H13.0596V10.108H13.8976V8.4216H14.7408V7.57842H15.584V6.73523H19.7948V7.57842H20.638V8.4216H21.4812V10.108H22.3244V12.6324H21.4812V14.3188H20.638V15.162H19.7948V16ZM16.4272 15.162H18.9516V14.3188H19.7948V12.6324H20.638V10.108H19.7948V8.4216H18.9516V7.57842H16.4272V8.4216H15.584V10.108H14.7408V12.6324H15.584V14.3188H16.4272V15.162Z" fill="currentColor" />
                    <path d="M11.7892 5.89215H10.946V5.0541H10.108V4.21091H9.26478V3.36772H4.2108V2.52454H10.946V4.21091H11.7892V5.89215ZM4.2108 15.1621H2.52442V14.3189H1.68123V13.4757H0.838046V11.7893H0V6.73533H0.838046V5.0541H1.68123V4.21091H2.52442V3.36772H4.2108V4.21091H3.36761V5.0541H2.52442V6.73533H1.68123V11.7893H2.52442V13.4757H3.36761V14.3189H4.2108V15.1621ZM10.946 16.0001H4.2108V15.1621H9.26478V14.3189H10.108V13.4757H10.946V12.6325H11.7892V14.3189H10.946V16.0001Z" fill="currentColor" />
                  </svg>
                </Link>

                <div className="flex items-center gap-4 lg:gap-6">
                  <Link href="/pricing" className="items-center justify-center gap-2 whitespace-nowrap font-medium disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none cursor-pointer text-neutral-900 underline-offset-4 hover:text-neutral-700 transition-colors duration-200 rounded focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] tracking-15 leading-[140%] hidden lg:block pb-0.25">
                    Pricing
                  </Link>
                  
                  <div className="gap-2 flex items-center">
                    <Link href="https://app.cofounder.co" className="items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none cursor-pointer border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground h-9 px-4 pb-2 pt-1.75 text-[15px] tracking-15 leading-[140%] hidden lg:block">
                      Log in
                    </Link>
                    
                    <div className="group relative overflow-hidden rounded-full cursor-pointer">
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 primary-button-hover-bg"></div>
                      <div className="relative w-full h-full z-10 flex items-center justify-center">
                        <Link href="https://app.cofounder.co" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none cursor-pointer bg-primary text-primary-foreground btn-default-shadow border border-neutral-700 h-9 px-4 pb-2 pt-1.75">
                          Sign up
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>

          {/* Hero Section */}
          <div className="w-full">
            <header id="cofounder" className="xl:pb-20 pb-8 xl:pt-20 pt-8 2xl:px-30 xl:px-12 md:px-8 px-5 w-full max-w-[1920px] mx-auto opacity-0 delay-0">
              <div className="flex flex-col gap-12">
                <h1 className="home-hero-title font-mondwest text-neutral-900 text-[48px] leading-none tracking-[-0.96px] max-w-[520px] w-full sm:text-[54px] sm:leading-[110%] sm:tracking-[-1.08px] sm:max-w-[620px] xl:text-[70px] xl:leading-none xl:tracking-[-1.4px] xl:max-w-[720px] 3xl:text-[90px] 3xl:leading-none 3xl:tracking-[-1.8px] 3xl:max-w-[820px]">
                  Automate your life with natural language
                </h1>
                <div className="flex flex-col gap-6">
                  <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-800 max-w-[482px]">
                    Cofounder plugs into your existing tools, writes automations, and organizes workflows. Driving the software you're already familiar with.
                  </p>
                </div>
              </div>
            </header>
          </div>

          {/* Hero Animation Section */}
          <div className="w-full border-t border-b">
            <section className="pb-4 pt-4 px-4 w-full max-w-[1920px] mx-auto opacity-0">
              <div className="relative h-full w-full sm:max-w-auto min-h-[420px] sm:min-h-[400px] 2xl:aspect-[5/2] 3xl:max-h-[max(calc(30vh),_600px)] pt-16 lg:pt-0 flex items-start lg:items-center justify-center overflow-hidden rounded-lg">
                <Image 
                  alt="Hero animation"
                  loading="lazy"
                  fill
                  className="object-cover z-[-1] object-[50%_75%]"
                  sizes="100vw"
                  src="/images/hero-anim-bg-2.png"
                />
                
                <Link href="https://app.cofounder.co" target="_blank" className="cursor-pointer">
                  <div className="relative inline-block">
                    <div className="rounded-lg px-4 pt-5 pb-3 backdrop-blur-lg max-w-[calc(100vw_-_64px)] w-[512px] flex flex-col justify-between gap-4 min-h-[125px] bg-gradient-to-b from-[rgba(255,255,255,0.80)] to-[rgba(255,255,255,0.16)] shadow-[0px_4px_12px_0px_rgba(255,255,255,0.10)_inset,0px_0px_0px_6px_rgba(255,255,255,0.40),0px_1px_8px_0px_rgba(0,0,0,0.13),0px_2px_6px_0px_rgba(0,0,0,0.20)] transition-all duration-300">
                      <div className="flex flex-col gap-4 tracking-15 leading-[140%] text-neutral-800">
                        <span className="transition-all duration-700 font-af-foundary font-medium">
                          <span className="text-black ml-0.5 animate-cursor-pulse">|</span>
                        </span>
                      </div>
                      
                      <div className="flex flex-row gap-4 items-center justify-between">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M12.374 6.58264L6.19085 12.8682C5.97358 13.092 5.85309 13.3924 5.85544 13.7043C5.85779 14.0162 5.98278 14.3147 6.2034 14.5352C6.42403 14.7558 6.72256 14.8806 7.03449 14.8828C7.34642 14.885 7.6467 14.7644 7.87042 14.5471L15.2411 7.07471C15.6865 6.62926 15.9368 6.0251 15.9368 5.39514C15.9368 4.76518 15.6865 4.16102 15.2411 3.71557C14.7956 3.27012 14.1915 3.01987 13.5615 3.01987C12.9316 3.01987 12.3274 3.27012 11.8819 3.71557L4.51128 11.1887C3.85217 11.8586 3.48448 12.7618 3.48831 13.7016C3.49214 14.6414 3.86717 15.5416 4.53171 16.2062C5.19626 16.8707 6.09647 17.2458 7.03628 17.2496C7.97608 17.2534 8.87932 16.8857 9.54925 16.2266L15.6396 10.1451" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 shrink-0 outline-none bg-primary text-primary-foreground border border-neutral-700 size-9 text-[15px] tracking-15 leading-[140%] rounded-full cursor-pointer h-8 w-8">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="13" viewBox="0 0 11 13" fill="none">
                            <path d="M10.2392 6.0143C10.1938 6.0597 10.14 6.09571 10.0807 6.12028C10.0214 6.14485 9.95791 6.15749 9.89375 6.15749C9.82959 6.15749 9.76606 6.14485 9.70679 6.12028C9.64752 6.09571 9.59368 6.0597 9.54833 6.0143L5.98795 2.45331V12.0158C5.98795 12.1453 5.93651 12.2695 5.84495 12.361C5.75339 12.4526 5.6292 12.504 5.49972 12.504C5.37023 12.504 5.24605 12.4526 5.15449 12.361C5.06293 12.2695 5.01149 12.1453 5.01149 12.0158V2.45331L1.4511 6.0143C1.35949 6.10592 1.23524 6.15738 1.10568 6.15738C0.976127 6.15738 0.851876 6.10592 0.760265 6.0143C0.668654 5.92269 0.617188 5.79844 0.617188 5.66888C0.617187 5.53933 0.668654 5.41507 0.760265 5.32346L5.1543 0.92943C5.19964 0.884036 5.25349 0.848025 5.31276 0.823456C5.37203 0.798886 5.43556 0.78624 5.49972 0.78624C5.56388 0.78624 5.62741 0.798886 5.68668 0.823456C5.74595 0.848025 5.7998 0.884036 5.84514 0.92943L10.2392 5.32346C10.2846 5.36881 10.3206 5.42265 10.3451 5.48192C10.3697 5.54119 10.3824 5.60472 10.3824 5.66888C10.3824 5.73304 10.3697 5.79658 10.3451 5.85584C10.3206 5.91511 10.2846 5.96896 10.2392 6.0143Z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="absolute z-50 bg-neutral-900 backdrop-blur-[20px] flex flex-col gap-1.5 px-3 py-1 w-min rounded-full whitespace-nowrap text-[#EEF1ED] text-xs font-medium leading-[130%] tracking-[-0.12px] font-af-foundary transition-all duration-300 ease-out left-1/2 transform -translate-x-1/2 bottom-full mb-4 opacity-0 translate-y-2 pointer-events-none">
                      <div className="flex items-center gap-1">
                        <p className="font-af-foundary font-medium text-[13px] tracking-13 leading-[130%] text-neutral-50">
                          Try Cofounder yourself
                        </p>
                        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 6 9" fill="none" className="text-neutral-600 -mt-0.25">
                          <rect x="3.7002" y="3.79085" width="1.41526" height="1.41526" fill="currentColor" />
                          <rect x="0.884766" y="0.97023" width="1.41526" height="1.41526" fill="currentColor" />
                          <rect x="0.884766" y="6.6144" width="1.41526" height="1.41526" fill="currentColor" />
                          <rect x="2.28467" y="2.37558" width="1.41526" height="4.24579" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent top-full border-t-[6px] border-t-neutral-900"></div>
                    </div>
                  </div>
                </Link>
              </div>
            </section>
          </div>

          {/* Use Cases Section */}
          <div className="w-full">
            <section id="use-cases" className="pb-[180px] pt-[140px] px-4 w-full max-w-[1920px] mx-auto opacity-0">
              <div className="flex flex-col md:gap-6 items-center">
                <h2 className="font-af-foundary font-medium tracking-15 text-neutral-900 text-center text-[20px] leading-[130%] tracking-24 sm:text-[24px] sm:tracking-48 mb-10 sm:mb-13.5 max-w-[320px] sm:max-w-none">
                  Here's some of the things Cofounder can do for you
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Use Case Cards - shortened for brevity, add full cards from HTML */}
                  <UseCaseCard 
                    href="https://app.cofounder.co/replay/df83f210-d59e-47bc-8057-b4ace0d29520"
                    title="Analyze this startup (Cofounder)"
                    description="Run a VC-style startup deep dive: build an analysis spreadsheet, research online, benchmark competitors, and enrich staff profiles."
                    toolIcons={['/images/other-tool.avif']}
                  />
                  <UseCaseCard 
                    href="https://app.cofounder.co/replay/374c20b5-4df0-47bf-8308-29a5fa917f76"
                    title="What's going on in engineering"
                    description="Get a snapshot of your engineering team's status, priorities, and challenges."
                    toolIcons={['/images/linear.avif', '/images/slack.avif']}
                  />
                  <UseCaseCard 
                    href="https://app.cofounder.co/replay/cc082528-1026-4f3d-b342-c27b9ced4ea9"
                    title="Make me a resume based on what you know"
                    description="Create a public-ready PDF resume from known data and online research, omitting all personal contact details."
                    toolIcons={['/images/other-tool.avif']}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Additional sections would follow the same pattern */}
        </div>
      </main>
    </div>
  );
}

// Helper Components
interface UseCaseCardProps {
  href: string;
  title: string;
  description: string;
  toolIcons: string[];
}

function UseCaseCard({ href, title, description, toolIcons }: UseCaseCardProps) {
  return (
    <Link 
      href={href}
      target="_blank"
      className="group flex flex-col rounded-2xl border border-[#DEE2DE] bg-neutral-50 shadow-[0_2px_2px_0_rgba(0,0,0,0.06),_0_6px_6px_0_rgba(0,0,0,0.00)] transition-all hover:shadow-[0_2px_2px_0_rgba(0,0,0,0.06),_0_6px_6px_0_rgba(0,0,0,0.00),_0_0_0_5px_rgba(0,0,0,0.04)] p-4 sm:pt-5 sm:px-6 gap-4 justify-between max-w-[332px] cursor-pointer"
    >
      <div className="flex flex-col gap-2">
        <h3 className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-900">
          {title}
        </h3>
        <p className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%] text-neutral-700">
          {description}
        </p>
      </div>
      
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {toolIcons.map((icon, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div className="flex items-center justify-center p-[7px] h-7 w-7 rounded-full bg-neutral-300">
                <Image alt="Tool" loading="lazy" width={37} height={37} className="w-full" src={icon} />
              </div>
            </div>
          ))}
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 group-hover:blur-none transition-opacity ease-out duration-220">
          <button className="flex items-center gap-[6px] px-[10px] py-1 rounded-[100px] border border-[rgba(255,255,255,0.60)] bg-neutral-900 shadow-[0_4px_12px_0_rgba(255,255,255,0.10)_inset,0_2px_6px_0_rgba(0,0,0,0.20)] backdrop-blur-[20px] cursor-pointer hover:[&>svg]:translate-x-[2px]">
            <span className="text-[#FFF] font-af-foundary text-[13px] font-medium leading-[130%] tracking-[-0.13px]">
              See it work
            </span>
            <svg width="11" height="13" viewBox="0 0 7 10" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-neutral-600 transition-transform duration-200">
              <rect x="4.36621" y="4.43835" width="1.41526" height="1.41526" fill="currentColor" />
              <rect x="1.55078" y="1.61774" width="1.41526" height="1.41526" fill="currentColor" />
              <rect x="1.55078" y="7.2619" width="1.41526" height="1.41526" fill="currentColor" />
              <rect x="2.95117" y="3.02307" width="1.41526" height="4.24579" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}

