"use client";

import React, { useState, useRef, useEffect } from "react";
import VideoSection from "./VideoSection";
import ChatInputLight from "@/components/ui/chat-input-light";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function HeroSection() {
  const router = useRouter();
  const [mousePos1, setMousePos1] = useState({ x: 79, y: 99 });
  const [mousePos2, setMousePos2] = useState({ x: 68, y: 3.9 });
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isHoveringResources, setIsHoveringResources] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shouldSlideNavbar, setShouldSlideNavbar] = useState(false);
  const [isLogoTransitioning, setIsLogoTransitioning] = useState(false);
  const containerRef1 = useRef<HTMLSpanElement>(null);
  const containerRef2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Track mouse for first text
      if (containerRef1.current) {
        const rect1 = containerRef1.current.getBoundingClientRect();
        const x1 = ((e.clientX - rect1.left) / rect1.width) * 100;
        const y1 = ((e.clientY - rect1.top) / rect1.height) * 100;
        setMousePos1({ x: x1, y: y1 });
      }

      // Track mouse for second text
      if (containerRef2.current) {
        const rect2 = containerRef2.current.getBoundingClientRect();
        const x2 = ((e.clientX - rect2.left) / rect2.width) * 100;
        const y2 = ((e.clientY - rect2.top) / rect2.height) * 100;
        setMousePos2({ x: x2, y: y2 });
      }
    };

    // Update resources open state based on hover
    if (isHoveringResources && !isResourcesOpen) {
      setIsResourcesOpen(true);
    } else if (!isHoveringResources && isResourcesOpen) {
      // Add a small delay before closing to prevent flickering
      const timer = setTimeout(() => {
        setIsResourcesOpen(false);
      }, 100);
      return () => clearTimeout(timer);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      // Simple scroll-based animation trigger
      // Transition when scrolled 300px down (around when hero title is visible)
      const transitionPoint = 300;
      const shouldSlide = window.scrollY > transitionPoint;
      setShouldSlideNavbar(shouldSlide);
      setIsLogoTransitioning(shouldSlide);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isResourcesOpen, isHoveringResources, shouldSlideNavbar, isLogoTransitioning]);

  // Handle chat input submission
  const handleChatSubmit = (message: string, images?: string[]) => {
    if (!message.trim()) return;

    // Redirect to survey builder with the initial prompt
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      sessionStorage.setItem('surbee_initial_prompt', message.trim());
    } catch {}
    router.push(`/project/${projectId}`);
  };

  return (
    <div className="relative flex h-full flex-col items-center min-h-[80vh] pt-16 pb-0 mt-8 md:mt-16">
      {/* Dark overlay with reduced opacity */}
      <AnimatePresence>
        {isResourcesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40"
            style={{ 
              background: 'rgba(0, 0, 0, 0.12)'
            }}
          />
        )}
      </AnimatePresence>


      {/* Navbar Container */}
      <div className="fixed top-0 left-0 w-full px-6 py-5 flex items-center z-50">
        {/* Left side - Logo fixed */}
        <div className="flex items-center" style={{ gap: '24px' }}>
          {/* Logo Container - Fixed */}
          <div className="flex items-center" style={{ position: 'relative' }}>
            {/* Original Logo - Fades out */}
            <motion.img
              src="/logo.svg"
              alt="Surbee"
              style={{ height: 48, width: 'auto', filter: 'brightness(0)' }}
              animate={{
                opacity: isLogoTransitioning ? 0 : 1,
                x: shouldSlideNavbar ? '-132px' : 0
              }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            />

            {/* New Logo - Fades in */}
            <motion.img
              src="https://raw.githubusercontent.com/Surbee001/webimg/bde8b822978508d5d1eaab50cc0d5a3b3023e501/New%20SVG.svg"
              alt="Surbee New"
              style={{
                height: 48,
                width: 'auto',
                filter: 'brightness(0)',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              animate={{
                opacity: isLogoTransitioning ? 1 : 0,
                x: shouldSlideNavbar ? '-132px' : 0
              }}
              transition={{
                duration: 0.3,
                ease: [0.25, 0.1, 0.25, 1]
              }}
            />
          </div>

          {/* Nav buttons - Animated */}
          <motion.div
            className="flex items-center gap-6 nav-menu-buttons"
            style={{ backgroundColor: isResourcesOpen ? '#FFFFFF' : '#F2F2F2', borderRadius: '8px', padding: '8px 16px', transition: 'background-color 0.2s ease' }}
            animate={{
              x: shouldSlideNavbar ? '-132px' : 0
            }}
            transition={{
              duration: 0.3,
              ease: [0.25, 0.1, 0.25, 1] // Custom easing for smooth motion
            }}
          >
          <button 
            className="font-medium flex items-center gap-1 transition-all duration-200 cursor-pointer" 
            style={{ color: '#171717', fontFamily: 'var(--font-diatype), sans-serif', fontSize: '16px' }}
            onMouseEnter={(e) => {
              setIsHoveringResources(true);
              if (!isResourcesOpen) {
                const parent = e.currentTarget.closest('.nav-menu-buttons');
                const buttons = parent?.querySelectorAll('button, a');
                buttons?.forEach(btn => {
                  if (btn !== e.currentTarget) {
                    (btn as HTMLElement).style.opacity = '0.4';
                  }
                });
              }
            }}
            onMouseLeave={(e) => {
              setIsHoveringResources(false);
              const parent = e.currentTarget.closest('.nav-menu-buttons');
              const buttons = parent?.querySelectorAll('button, a');
              buttons?.forEach(btn => {
                (btn as HTMLElement).style.opacity = '1';
              });
            }}
          >
            Resources
            <svg 
              className="w-3 h-3 transition-transform duration-200" 
              style={{ transform: isResourcesOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <a
            href="/enterprise"
            className="font-medium transition-all duration-200 cursor-pointer"
            style={{ color: '#171717', fontFamily: 'var(--font-diatype), sans-serif', fontSize: '16px' }}
            onMouseEnter={(e) => {
              const parent = e.currentTarget.closest('.nav-menu-buttons');
              const buttons = parent?.querySelectorAll('button, a');
              buttons?.forEach(btn => {
                if (btn !== e.currentTarget) {
                  (btn as HTMLElement).style.opacity = '0.4';
                }
              });
            }}
            onMouseLeave={(e) => {
              const parent = e.currentTarget.closest('.nav-menu-buttons');
              const buttons = parent?.querySelectorAll('button, a');
              buttons?.forEach(btn => {
                (btn as HTMLElement).style.opacity = '1';
              });
            }}
          >
            Enterprise
          </a>
          <a
            href="/blog"
            className="font-medium transition-all duration-200 cursor-pointer"
            style={{ color: '#171717', fontFamily: 'var(--font-diatype), sans-serif', fontSize: '16px' }}
            onMouseEnter={(e) => {
              const parent = e.currentTarget.closest('.nav-menu-buttons');
              const buttons = parent?.querySelectorAll('button, a');
              buttons?.forEach(btn => {
                if (btn !== e.currentTarget) {
                  (btn as HTMLElement).style.opacity = '0.4';
                }
              });
            }}
            onMouseLeave={(e) => {
              const parent = e.currentTarget.closest('.nav-menu-buttons');
              const buttons = parent?.querySelectorAll('button, a');
              buttons?.forEach(btn => {
                (btn as HTMLElement).style.opacity = '1';
              });
            }}
          >
            Blog
          </a>
          <a
            href="/docs"
            className="font-medium transition-all duration-200 cursor-pointer"
            style={{ color: '#171717', fontFamily: 'var(--font-diatype), sans-serif', fontSize: '16px' }}
            onMouseEnter={(e) => {
              const parent = e.currentTarget.closest('.nav-menu-buttons');
              const buttons = parent?.querySelectorAll('button, a');
              buttons?.forEach(btn => {
                if (btn !== e.currentTarget) {
                  (btn as HTMLElement).style.opacity = '0.4';
                }
              });
            }}
            onMouseLeave={(e) => {
              const parent = e.currentTarget.closest('.nav-menu-buttons');
              const buttons = parent?.querySelectorAll('button, a');
              buttons?.forEach(btn => {
                (btn as HTMLElement).style.opacity = '1';
              });
            }}
          >
            Docs
          </a>
          <a
            href="/pricing"
            className="font-medium transition-all duration-200 cursor-pointer"
            style={{ color: '#171717', fontFamily: 'var(--font-diatype), sans-serif', fontSize: '16px' }}
            onMouseEnter={(e) => {
              const parent = e.currentTarget.closest('.nav-menu-buttons');
              const buttons = parent?.querySelectorAll('button, a');
              buttons?.forEach(btn => {
                if (btn !== e.currentTarget) {
                  (btn as HTMLElement).style.opacity = '0.4';
                }
              });
            }}
            onMouseLeave={(e) => {
              const parent = e.currentTarget.closest('.nav-menu-buttons');
              const buttons = parent?.querySelectorAll('button, a');
              buttons?.forEach(btn => {
                (btn as HTMLElement).style.opacity = '1';
              });
            }}
          >
            Pricing
          </a>
          </motion.div>
        </div>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right side - Fixed */}
        <div className="flex gap-2" id="nav-buttons">
          <button 
            className="px-4 py-1 rounded-lg font-medium transition-all duration-200 cursor-pointer" 
            style={{ backgroundColor: '#F2F2F2', color: '#171717', fontFamily: 'var(--font-diatype), sans-serif', minHeight: '28px', fontSize: '16px' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#E8E8E8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F2F2F2'; }}
          >
            Login
          </button>
          <button 
            className="px-4 py-1 rounded-lg font-medium transition-all duration-200 cursor-pointer" 
            style={{ backgroundColor: '#171717', color: '#ffffff', fontFamily: 'var(--font-diatype), sans-serif', minHeight: '28px', fontSize: '16px' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#000000'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#171717'; }}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Large Dropdown Container */}
      <AnimatePresence>
        {isResourcesOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bg-white rounded-3xl z-50"
            style={{
              left: '24px',
              transformOrigin: 'top',
              width: '800px',
              maxWidth: '90vw',
              top: '80px'
            }}
            onMouseEnter={() => setIsHoveringResources(true)}
            onMouseLeave={() => setIsHoveringResources(false)}
          >
            {/* Content inside the dropdown */}
            <div className="p-3">
              <div className="grid grid-cols-2 gap-2.5">
                {/* First container - #B0C6D9 */}
                <div
                  className="rounded-lg p-6 min-h-[520px]"
                  style={{ backgroundColor: '#B0C6D9' }}
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff', fontFamily: 'var(--font-diatype), sans-serif' }}>
                    Documentation
                  </h3>
                  <div className="space-y-3">
                    <a href="/docs/getting-started" className="block group">
                      <div className="text-sm font-medium mb-1 group-hover:opacity-80 transition-colors" style={{ color: '#ffffff', fontFamily: 'var(--font-diatype), sans-serif' }}>
                        Getting Started
                      </div>
                      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Learn the basics and build your first survey
                      </div>
                    </a>
                    <a href="/docs/api" className="block group">
                      <div className="text-sm font-medium mb-1 group-hover:opacity-80 transition-colors" style={{ color: '#ffffff', fontFamily: 'var(--font-diatype), sans-serif' }}>
                        API Reference
                      </div>
                      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Complete API documentation and examples
                      </div>
                    </a>
                    <a href="/docs/integrations" className="block group">
                      <div className="text-sm font-medium mb-1 group-hover:opacity-80 transition-colors" style={{ color: '#ffffff', fontFamily: 'var(--font-diatype), sans-serif' }}>
                        Integrations
                      </div>
                      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Connect with your favorite tools
                      </div>
                    </a>
                  </div>
                </div>

                {/* Second container - lighter red */}
                <div
                  className="rounded-lg p-6 min-h-[520px]"
                  style={{ backgroundColor: '#F4A5A7' }}
                >
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff', fontFamily: 'var(--font-diatype), sans-serif' }}>
                    Resources
                  </h3>
                  <div className="space-y-3">
                    <a href="/guides" className="block group">
                      <div className="text-sm font-medium mb-1 group-hover:opacity-80 transition-colors" style={{ color: '#ffffff', fontFamily: 'var(--font-diatype), sans-serif' }}>
                        Guides & Tutorials
                      </div>
                      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Step-by-step guides to advanced topics
                      </div>
                    </a>
                    <a href="/examples" className="block group">
                      <div className="text-sm font-medium mb-1 group-hover:opacity-80 transition-colors" style={{ color: '#ffffff', fontFamily: 'var(--font-diatype), sans-serif' }}>
                        Examples
                      </div>
                      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Real-world survey examples and templates
                      </div>
                    </a>
                    <a href="/support" className="block group">
                      <div className="text-sm font-medium mb-1 group-hover:opacity-80 transition-colors" style={{ color: '#ffffff', fontFamily: 'var(--font-diatype), sans-serif' }}>
                        Support
                      </div>
                      <div className="text-sm" style={{ color: 'rgba(255,255,255,0.8)' }}>
                        Get help from our team and community
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge Announcement - Centered at top */}
      <div className="w-full flex justify-center z-10 mb-8" style={{ marginTop: '20px' }}>
        <a
          className="x:focus-visible:nextra-focus flex group"
          href="/pricing"
        >
          <div className="flex items-start justify-between gap-4 bg-white dark:bg-[#111111] border border-neutral-300 dark:border-neutral-800 rounded-[0.5rem] p-2 transition-[border-color] dark:text-neutral-400 text-neutral-700 group-hover:border-neutral-400/75 dark:group-hover:border-neutral-700/75 group-hover:shadow-xs dark:shadow-neutral-800/50">
            <p className="badge bsmnt-text-body-xs tracking-[0.01em] font-mono uppercase px-1.5 py-[5px] w-fit relative rounded-xs before:absolute before:inset-0 before:rounded-[0.1875rem] before:transition-all before:p-px before:content-[''] after:absolute after:inset-px after:rounded-xs after:transition-all after:content-[''] after:bg-background text-info-700 dark:text-info-300 before:bg-info-300 dark:before:bg-info-700">
              <span className="relative z-10 flex items-center justify-center gap-x-1 leading-[1] -mt-[1px]">
                Now in Beta
              </span>
            </p>
            <p className="bsmnt-text-body-sm text-pretty leading-4.5">
              AI-powered survey builder transforming research workflows
            </p>
            <svg
              className="size-4 duration-300 ease-in-out text-neutral-500 flex-shrink-0 mt-0.5"
              height="16"
              width="16"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="transition-transform duration-300 ease-in-out group-hover:translate-x-2"
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <rect
                className="scale-x-0 transition-transform origin-left duration-300 ease-in-out group-hover:translate-x-2 group-hover:scale-x-100"
                height="2"
                width="14"
                fill="currentColor"
                rx="1"
                x="2"
                y="11"
              />
            </svg>
          </div>
        </a>
      </div>

      {/* Spacer above title */}
      <div className="h-8"></div>

      {/* Centered Hero Text - "Craft exceptional survey experiences" */}
      <div className="relative flex items-center justify-center text-center mb-6">
        <div className="relative">
          <h1 className="select-none hero-text-diatype">
            <span className="leading-none block" style={{ fontSize: '72px', fontWeight: 400, letterSpacing: '-1px', lineHeight: '69px', color: '#0A0A0A' }}>
              <span className="relative">
                <span className="inline-block -translate-y-[0.135em] opacity-0">
                  Craft exceptional survey experiences
                </span>
                <span ref={containerRef1} className="px-[5%] -mx-[5%] block absolute inset-0 pointer" style={{ fontFamily: 'var(--font-diatype), sans-serif', fontSize: '72px', fontWeight: 400, letterSpacing: '-1px', lineHeight: '69px' }}>
                  <svg
                    className="select-none pointer-events-none"
                    height="80px"
                    width="100%"
                    viewBox="0 0 1000 100"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient
                        id="textHoverEffectGradient-hero"
                        cx="50%"
                        cy="50%"
                        gradientTransform="rotate(-10)"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0%" stopColor="#320F1E" />
                        <stop offset="8.56%" stopColor="#C83228" />
                        <stop offset="25.06%" stopColor="#FB873F" />
                        <stop offset="37.56%" stopColor="#D2DC91" />
                        <stop offset="50.06%" stopColor="#5A8250" />
                        <stop offset="62.06%" stopColor="#002314" />
                        <stop offset="74.06%" stopColor="#00143C" />
                        <stop offset="86.06%" stopColor="#2873D7" />
                        <stop offset="95.06%" stopColor="#9BC3FF" />
                      </linearGradient>
                      <radialGradient
                        id="textHoverEffectRevealMask-hero"
                        cx={`${mousePos1.x}%`}
                        cy={`${mousePos1.y}%`}
                        gradientUnits="userSpaceOnUse"
                        r="40%"
                      >
                        <stop offset="30%" stopColor="white" />
                        <stop offset="100%" stopColor="black" />
                      </radialGradient>
                      <mask id="textHoverEffectMask-hero">
                        <rect
                          height="100%"
                          width="100%"
                          fill="url(#textHoverEffectRevealMask-hero)"
                          x="0%"
                          y="0"
                        />
                      </mask>
                    </defs>
                    <text
                      className="text-[1em] fill-current text-shadow-ascii-contrast"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      x="500"
                      y="50"
                    >
                      Craft exceptional survey experiences
                    </text>
                    <text
                      className="text-[1em] drop-shadow-[0_0_1px_var(--background,black)]"
                      dominantBaseline="middle"
                      fill="url(#textHoverEffectGradient-hero)"
                      mask="url(#textHoverEffectMask-hero)"
                      opacity="1"
                      textAnchor="middle"
                      x="500"
                      y="50"
                    >
                      Craft exceptional survey experiences
                    </text>
                  </svg>
                </span>
              </span>
            </span>
          </h1>
        </div>
      </div>

      {/* Chat Input */}
      <div className="w-full max-w-2xl mx-auto mb-16 px-4">
        <div className="flex justify-center">
          <div className="w-full max-w-xl">
            <ChatInputLight
              onSendMessage={handleChatSubmit}
              placeholder="Ask Surbee to draft a survey..."
              className="chat-input-landing"
              theme="white"
              disableRotatingPlaceholders={false}
              borderRadius="32px"
            />
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="h-24"></div>

      {/* Video Section */}
      <VideoSection />

      <style
        dangerouslySetInnerHTML={{
          __html: `
.hero-text-diatype {
  font-family: var(--font-diatype), var(--font-inter), sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.chat-input-landing {
  background-color: transparent !important;
  border-color: #d4d4d4 !important;
}

.chat-input-landing > div {
  background-color: #f5f5f5 !important;
  border-color: #d4d4d4 !important;
  border-radius: 32px !important;
}

.bsmnt-text-display-sm {
  font-size: 100px;
  font-weight: 100;
  letter-spacing: -0.02em;
}

.bsmnt-text-body-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.bsmnt-text-body-sm {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.bsmnt-text-body-md {
  font-size: 1rem;
  line-height: 1.5rem;
}

.bsmnt-text-body-lg {
  font-size: 1.125rem;
  line-height: 1.75rem;
}
`,
        }}
      />
    </div>
  );
}
