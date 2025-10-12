"use client"

import React from "react";

export default function HeroSection() {
  return (
    <hgroup className="h-full flex max-w-[425px] flex-col flex-shrink-0 z-1 justify-center">
      <div style={{ opacity: 1, transform: "none" }}>
        <h1 className="text-title-secondary md:text-title-primary max-w-[335px] md:max-w-[820px] mb-[15px] md:mb-[35px]" style={{ textAlign: "left" }}>
          Automate your surveys with natural language
        </h1>
      </div>
      <div style={{ opacity: 1, transform: "none" }}>
        <p className="text-subtitle max-w-[335px] md:max-w-[540px] text-grey-4 text-left">
          Surbee plugs into your research workflow, automates survey building, and organizes responses.
          Empowering you with the tools you already use.
        </p>
      </div>
      <div
        className="mt-[35px]"
        style={{ opacity: 1, transform: "none" }}
      >
        <a
          className="px-6 py-2.5 text-sm font-medium bg-black text-white hover:bg-neutral-800 transition-all duration-300 ease-out cursor-pointer pointer-events-auto inline-flex items-center justify-center"
          href="/test-login"
          style={{ fontFamily: 'var(--font-inter), sans-serif', borderRadius: '12px', minWidth: '120px' }}
        >
          Get Started
        </a>
      </div>
    </hgroup>
  );
}
