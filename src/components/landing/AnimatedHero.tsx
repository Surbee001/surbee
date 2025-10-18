"use client";

import React, { useState, useRef, useEffect } from "react";

export default function AnimatedHero() {
  const [mousePos1, setMousePos1] = useState({ x: 79, y: 99 });
  const [mousePos2, setMousePos2] = useState({ x: 68, y: 3.9 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Update positions for both text elements with different offsets
      setMousePos1({ x, y });
      setMousePos2({ x: x * 0.9, y: y * 0.8 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <div ref={containerRef} className="relative flex h-full flex-col">
        <h1 className="flex h-full flex-col select-none">
          <span className="bsmnt-text-display-sm self-start leading-none md:text-[6.25rem]">
            <span className="relative">
              <span className="inline-block -translate-y-[0.135em] opacity-0">
                Build Beautiful
              </span>
              <span className="px-[5%] -mx-[5%] block absolute inset-0 pointer">
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
                    Build Beautiful
                  </text>
                  <text
                    className="text-[1em] drop-shadow-[0_0_1px_var(--background,black)] transition-opacity duration-300"
                    dominantBaseline="middle"
                    fill="url(#textHoverEffectGradient-_r_p_)"
                    mask="url(#textHoverEffectMask-_r_p_)"
                    opacity="1"
                    textAnchor="middle"
                    x="50%"
                    y="55%"
                  >
                    Build Beautiful
                  </text>
                </svg>
              </span>
            </span>
          </span>
          <span className="bsmnt-text-display-sm mt-auto self-end leading-none md:text-[6.25rem]">
            <span className="relative">
              <span className="inline-block -translate-y-[0.135em] opacity-0">
                Survey Experiences.
              </span>
              <span className="px-[5%] -mx-[5%] block absolute inset-0 pointer">
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
                    Survey Experiences.
                  </text>
                  <text
                    className="text-[1em] drop-shadow-[0_0_1px_var(--background,black)] transition-opacity duration-300"
                    dominantBaseline="middle"
                    fill="url(#textHoverEffectGradient-_r_q_)"
                    mask="url(#textHoverEffectMask-_r_q_)"
                    opacity="1"
                    textAnchor="middle"
                    x="50%"
                    y="55%"
                  >
                    Survey Experiences.
                  </text>
                </svg>
              </span>
            </span>
          </span>
        </h1>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
html {
  font-size: 1rem;
  line-height: var(--tw-leading,calc(1.5/1));
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "rlig", "calt", "ss01";
  -webkit-tap-highlight-color: transparent;
  overflow-x: hidden;
  color-scheme: dark;
}

.bsmnt-text-display-sm {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 700;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .bsmnt-text-display-sm {
    font-size: 6.25rem;
  }
}
`,
        }}
      />
    </>
  );
}

