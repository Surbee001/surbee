"use client"

import React, { useState, useRef, useEffect } from "react";

type GradientTitleProps = {
  text: string;
  as?: "h1" | "h2" | "h3";
  align?: "left" | "center" | "right";
  className?: string;
  sizePx?: number;
};

export default function GradientTitle({
  text,
  as = "h2",
  align = "center",
  className = "",
  sizePx = 67,
}: GradientTitleProps) {
  const Tag = as as keyof JSX.IntrinsicElements;
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const gradientId = `textHoverEffectGradient-${text.replace(/\s+/g, '_')}`;
  const maskId = `textHoverEffectMask-${text.replace(/\s+/g, '_')}`;
  const revealMaskId = `textHoverEffectRevealMask-${text.replace(/\s+/g, '_')}`;

  return (
    <Tag className={`select-none hero-text-tobias ${className}`}>
      <span className="leading-none block" style={{ fontSize: `${sizePx}px`, fontWeight: 300, letterSpacing: '-1px', lineHeight: `${sizePx}px`, color: '#0A0A0A' }}>
        <span className="relative">
          <span className="inline-block -translate-y-[0.135em] opacity-0">
            {text}
          </span>
          <span ref={containerRef} className="px-[5%] -mx-[5%] block absolute inset-0 pointer" style={{ fontFamily: 'var(--font-tobias), "Tobias Fallback", serif', fontSize: `${sizePx}px`, fontWeight: 300, letterSpacing: '-1px', lineHeight: `${sizePx}px` }}>
            <svg
              className="select-none pointer-events-none"
              height="100%"
              width="100%"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id={gradientId}
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
                  id={revealMaskId}
                  cx={`${mousePos.x}%`}
                  cy={`${mousePos.y}%`}
                  gradientUnits="userSpaceOnUse"
                  r="40%"
                >
                  <stop offset="30%" stopColor="white" />
                  <stop offset="100%" stopColor="black" />
                </radialGradient>
                <mask id={maskId}>
                  <rect
                    height="100%"
                    width="100%"
                    fill={`url(#${revealMaskId})`}
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
                {text}
              </text>
              <text
                className="text-[1em] drop-shadow-[0_0_1px_var(--background,black)]"
                dominantBaseline="middle"
                fill={`url(#${gradientId})`}
                mask={`url(#${maskId})`}
                opacity="1"
                textAnchor="middle"
                x="50%"
                y="55%"
              >
                {text}
              </text>
            </svg>
          </span>
        </span>
      </span>
    </Tag>
  );
}


