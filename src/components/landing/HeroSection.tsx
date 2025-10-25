"use client";

import React, { useState, useRef, useEffect } from "react";
import VideoSection from "./VideoSection";
import ChatInputLight from "@/components/ui/chat-input-light";
import { useRouter } from "next/navigation";

export default function HeroSection() {
  const router = useRouter();
  const [mousePos1, setMousePos1] = useState({ x: 79, y: 99 });
  const [mousePos2, setMousePos2] = useState({ x: 68, y: 3.9 });
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

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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
    <div className="relative flex h-full flex-col justify-center items-center min-h-[80vh] -mt-12 md:-mt-20">
      {/* Badge Announcement - Centered at top */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <a
          className="x:focus-visible:nextra-focus flex group"
          href="/pricing"
        >
          <div className="flex items-start justify-between gap-4 bg-white dark:bg-[#111111] border border-neutral-300 dark:border-neutral-800 rounded-[0.5rem] p-2 transition-[border-color] dark:text-neutral-400 text-neutral-700 w-full group-hover:border-neutral-400/75 dark:group-hover:border-neutral-700/75 group-hover:shadow-xs dark:shadow-neutral-800/50">
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

      {/* Centered Hero Text - "Craft exceptional survey experiences" */}
      <div className="relative flex-1 flex items-center justify-center text-center pt-16">
        <div className="relative">
          <h1 className="select-none hero-text-diatype">
            <span className="leading-none block" style={{ fontSize: '72px', fontWeight: 400, letterSpacing: '-1px', lineHeight: '80px', color: '#0A0A0A' }}>
              <span className="relative">
                <span className="inline-block -translate-y-[0.135em] opacity-0">
                  craft exceptional survey experiences
                </span>
                <span ref={containerRef1} className="px-[5%] -mx-[5%] block absolute inset-0 pointer" style={{ fontFamily: 'var(--font-diatype), sans-serif', fontSize: '72px', fontWeight: 400, letterSpacing: '-1px', lineHeight: '80px' }}>
                  <svg
                    className="select-none pointer-events-none"
                    height="100%"
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
                      craft exceptional survey experiences
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
                      craft exceptional survey experiences
                    </text>
                  </svg>
                </span>
              </span>
            </span>
          </h1>
        </div>
      </div>

      {/* Chat Input */}
      <div className="w-full max-w-2xl mx-auto mt-8 mb-8 px-4">
        <div className="flex justify-center">
          <div className="w-full max-w-lg">
            <ChatInputLight
              onSendMessage={handleChatSubmit}
              placeholder="Ask Surbee to draft a survey..."
              className="chat-input-landing"
              theme="white"
              disableRotatingPlaceholders={false}
            />
          </div>
        </div>
      </div>

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
  background-color: #f5f5f5 !important;
  border-color: #d4d4d4 !important;
}

.chat-input-landing > div {
  background-color: #f5f5f5 !important;
  border-color: #d4d4d4 !important;
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
