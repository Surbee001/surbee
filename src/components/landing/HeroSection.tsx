"use client";

import React, { useState, useRef, useEffect } from "react";

export default function HeroSection() {
  const [mousePos1, setMousePos1] = useState({ x: 79, y: 99 });
  const [mousePos2, setMousePos2] = useState({ x: 68, y: 3.9 });
  const containerRef1 = useRef<HTMLDivElement>(null);
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

  return (
    <div className="relative flex h-full flex-col justify-between gap-10 min-h-[80vh]">
      {/* Badge Announcement */}
      <div className="mr-auto -mt-20">
        <a
          className="x:focus-visible:nextra-focus flex group mr-auto"
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

      {/* Top Hero Text - "Craft exceptional" */}
      <div ref={containerRef1} className="relative -mt-[220px]">
        <h1 className="select-none hero-text-tobias">
          <span className="self-start leading-none block" style={{ fontSize: '100px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '100px', color: '#0A0A0A' }}>
            <span className="relative">
              <span className="inline-block -translate-y-[0.135em] opacity-0">
                Craft exceptional
              </span>
              <span className="px-[5%] -mx-[5%] block absolute inset-0 pointer" style={{ fontFamily: 'Tobias, "Tobias Fallback", serif', fontSize: '100px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '100px' }}>
                <svg
                  className="select-none pointer-events-none"
                  height="100%"
                  width="100%"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="textHoverEffectGradient-_r_p_"
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
                      id="textHoverEffectRevealMask-_r_p_"
                      cx={`${mousePos1.x}%`}
                      cy={`${mousePos1.y}%`}
                      gradientUnits="userSpaceOnUse"
                      r="40%"
                    >
                      <stop offset="30%" stopColor="white" />
                      <stop offset="100%" stopColor="black" />
                    </radialGradient>
                    <mask id="textHoverEffectMask-_r_p_">
                      <rect
                        height="100%"
                        width="100%"
                        fill="url(#textHoverEffectRevealMask-_r_p_)"
                        x="0%"
                        y="0"
                      />
                    </mask>
                  </defs>
                  <text
                    className="text-[1em] fill-current text-shadow-ascii-contrast"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    x="50%"
                    y="55%"
                  >
                    Craft exceptional
                  </text>
                  <text
                    className="text-[1em] drop-shadow-[0_0_1px_var(--background,black)]"
                    dominantBaseline="middle"
                    fill="url(#textHoverEffectGradient-_r_p_)"
                    mask="url(#textHoverEffectMask-_r_p_)"
                    opacity="1"
                    textAnchor="middle"
                    x="50%"
                    y="55%"
                  >
                    Craft exceptional
                  </text>
                </svg>
              </span>
            </span>
          </span>
        </h1>
      </div>

      {/* Bottom Hero Text - "survey experiences" */}
      <div ref={containerRef2} className="relative self-end mt-8">
        <h2 className="select-none hero-text-tobias">
          <span className="leading-none block" style={{ fontSize: '100px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '100px', color: '#0A0A0A' }}>
            <span className="relative">
              <span className="inline-block -translate-y-[0.135em] opacity-0">
                survey experiences
              </span>
              <span className="px-[5%] -mx-[5%] block absolute inset-0 pointer" style={{ fontFamily: 'Tobias, "Tobias Fallback", serif', fontSize: '100px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '100px' }}>
                <svg
                  className="select-none pointer-events-none"
                  height="100%"
                  width="100%"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="textHoverEffectGradient-_r_q_"
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
                      id="textHoverEffectRevealMask-_r_q_"
                      cx={`${mousePos2.x}%`}
                      cy={`${mousePos2.y}%`}
                      gradientUnits="userSpaceOnUse"
                      r="40%"
                    >
                      <stop offset="30%" stopColor="white" />
                      <stop offset="100%" stopColor="black" />
                    </radialGradient>
                    <mask id="textHoverEffectMask-_r_q_">
                      <rect
                        height="100%"
                        width="100%"
                        fill="url(#textHoverEffectRevealMask-_r_q_)"
                        x="0%"
                        y="0"
                      />
                    </mask>
                  </defs>
                  <text
                    className="text-[1em] fill-current text-shadow-ascii-contrast"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    x="50%"
                    y="55%"
                  >
                    survey experiences
                  </text>
                  <text
                    className="text-[1em] drop-shadow-[0_0_1px_var(--background,black)]"
                    dominantBaseline="middle"
                    fill="url(#textHoverEffectGradient-_r_q_)"
                    mask="url(#textHoverEffectMask-_r_q_)"
                    opacity="1"
                    textAnchor="middle"
                    x="50%"
                    y="55%"
                  >
                    survey experiences
                  </text>
                </svg>
              </span>
            </span>
          </span>
        </h2>
      </div>

      {/* Description and CTA Button */}
      <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end -mt-6">
        <p className="bsmnt-text-body-md md:bsmnt-text-body-lg max-w-[30rem] text-balance" style={{ color: '#6B7280', fontFamily: 'var(--font-inter), sans-serif' }}>
          <strong className="font-normal" style={{ color: '#0A0A0A' }}>
            Create surveys that researchers trust and participants enjoy.
          </strong>{" "}
          AI-powered generation, fraud detection, and real-time analytics{" "}
          <br className="hidden lg:block" /> all on our complete research platform.
        </p>
        <div className="flex w-full flex-col gap-3 md:flex-row md:justify-end">
          <a
            href="/test-login"
            className="px-8 py-4 text-base font-medium bg-black text-white hover:bg-neutral-800 transition-all duration-300 ease-out w-full md:w-auto text-center"
            style={{ fontFamily: 'var(--font-inter), sans-serif', borderRadius: '12px' }}
          >
            Start Building
          </a>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
@font-face {
  font-family: 'Tobias';
  src: url('/fonts/Tobias-TRIAL-Thin.ttf') format('truetype');
  font-weight: 100;
  font-style: normal;
  font-display: swap;
}

.hero-text-tobias {
  font-family: 'Tobias', var(--font-inter), sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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
