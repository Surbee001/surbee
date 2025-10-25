"use client";

import React, { useState, useRef, useEffect } from "react";
import { RevealSection, RevealDiv } from "@/components/landing/Reveal";
import localFont from "next/font/local";
import TypingOverlay from "@/components/landing/TypingOverlay";
import { ImageKitProvider, Image as IKImage } from "@imagekit/next";
import CreatedWithSurbee from "@/components/landing/CreatedWithSurbee";
import GradientTitle from "@/components/landing/GradientTitle";
import HeroSection from "@/components/landing/HeroSection";
import PricingCards from "@/components/pricing/PricingCards";
import TestimonialCarousel from "@/components/landing/TestimonialCarousel";


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

const tobiasLight = localFont({
  src: "../../../Font/Tobiasfont/Tobias-TRIAL-Light.ttf",
  weight: "300",
  style: "normal",
  variable: "--font-tobias",
  display: "swap",
});

// TODO: Replace with actual Diatype font files when available
// For now, using Epilogue as a temporary substitute that has a similar clean, modern look
const diatype = localFont({
  src: [
    {
      path: "../../../Font/Epilogue_Complete/Fonts/WEB/fonts/Epilogue-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../Font/Epilogue_Complete/Fonts/WEB/fonts/Epilogue-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../Font/Epilogue_Complete/Fonts/WEB/fonts/Epilogue-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-diatype",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
});

export default function LandingPage() {
  const [mousePosFeatures, setMousePosFeatures] = useState({ x: 50, y: 50 });
  const [mousePosDetect, setMousePosDetect] = useState({ x: 50, y: 50 });
  const [mousePosCommunity, setMousePosCommunity] = useState({ x: 50, y: 50 });
  const [mousePosTools, setMousePosTools] = useState({ x: 50, y: 50 });
  const [mousePosJoin, setMousePosJoin] = useState({ x: 50, y: 50 });
  const containerRefFeatures = useRef<HTMLSpanElement>(null);
  const containerRefDetect = useRef<HTMLSpanElement>(null);
  const containerRefCommunity = useRef<HTMLSpanElement>(null);
  const containerRefTools = useRef<HTMLSpanElement>(null);
  const containerRefJoin = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRefFeatures.current) {
        const rect = containerRefFeatures.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosFeatures({ x, y });
      }
      if (containerRefDetect.current) {
        const rect = containerRefDetect.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosDetect({ x, y });
      }
      if (containerRefCommunity.current) {
        const rect = containerRefCommunity.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosCommunity({ x, y });
      }
      if (containerRefTools.current) {
        const rect = containerRefTools.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosTools({ x, y });
      }
      if (containerRefJoin.current) {
        const rect = containerRefJoin.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosJoin({ x, y });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
    <div className={`min-h-screen w-full ${epilogue.variable} ${tobiasLight.variable} ${diatype.variable}`} style={{ backgroundColor: "#FEFFFC", fontFamily: "var(--font-epilogue)" }}>

      {/* Main Content - full width without sidebar */}
      <main className="w-full pt-12">
          {/* Title and description (hero header) */}
          <RevealSection
            className="w-full max-w-[1920px] mx-auto px-5 md:px-8 xl:px-12 2xl:px-30 pb-8 pt-4 xl:pb-20 xl:pt-12"
          >
            <HeroSection />
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
              <IKImage
                src="/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png"
                alt="Surbee hero landscape"
                width={1920}
                height={1080}
                className="h-full w-full object-cover"
                transformation={[{ width: 1536, quality: 85 }]}
                loading="lazy"
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
                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-[#FEFFFC] border border-neutral-300 text-[15px] tracking-15 leading-[140%] rounded-full cursor-pointer h-8 w-8" style={{ color: '#0A0A0A', fontFamily: 'var(--font-inter), sans-serif' }}>
                          <svg height="13" width="11" fill="none" viewBox="0 0 11 13" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.2392 6.0143C10.1938 6.0597 10.14 6.09571 10.0807 6.12028C10.0214 6.14485 9.95791 6.15749 9.89375 6.15749C9.82959 6.15749 9.76606 6.14485 9.70679 6.12028C9.64752 6.09571 9.59368 6.0597 9.54833 6.0143L5.98795 2.45331V12.0158C5.98795 12.1453 5.93651 12.2695 5.84495 12.361C5.75339 12.4526 5.6292 12.504 5.49972 12.504C5.37023 12.504 5.24605 12.4526 5.15449 12.361C5.06293 12.2695 5.01149 12.1453 5.01149 12.0158V2.45331L1.4511 6.0143C1.35949 6.10592 1.23524 6.15738 1.10568 6.15738C0.976127 6.15738 0.851876 6.10592 0.760265 6.0143C0.668654 5.92269 0.617188 5.79844 0.617188 5.66888C0.617187 5.53933 0.668654 5.41507 0.760265 5.32346L5.1543 0.92943C5.19964 0.884036 5.25349 0.848025 5.31276 0.823456C5.37203 0.798886 5.43556 0.78624 5.49972 0.78624C5.56388 0.78624 5.62741 0.798886 5.68668 0.823456C5.74595 0.848025 5.7998 0.884036 5.84514 0.92943L10.2392 5.32346C10.2846 5.36881 10.3206 5.42265 10.3451 5.48192C10.3697 5.54119 10.3824 5.60472 10.3824 5.66888C10.3824 5.73304 10.3697 5.79658 10.3451 5.85584C10.3206 5.91511 10.2846 5.96896 10.2392 6.0143Z" fill="currentColor" />
                          </svg>
                        </button>
                      </div>
                    </div>
	                    {/* Hover tooltip */}
	                    <div className="absolute z-50 bg-neutral-900 backdrop-blur-[20px] flex flex-col gap-1.5 items-center justify-center px-3 py-1 w-min rounded-full whitespace-nowrap text-[#EEF1ED] text-xs font-medium leading-[130%] tracking-[-0.12px] left-1/2 transform -translate-x-1/2 bottom-full mb-4 opacity-0 translate-y-1 scale-95 pointer-events-none transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100">
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


          {/* Features title */}
          <section className="px-6 pt-24 pb-2 text-center">
            <div className="relative">
              <h2 className="select-none hero-text-tobias">
                <span className="leading-none block" style={{ fontSize: '61px', fontWeight: 100, letterSpacing: '-2px', lineHeight: '51px', color: '#0A0A0A' }}>
                  <span className="relative">
                    <span className="inline-block -translate-y-[0.135em] opacity-0">
                      Here's what Surbee can do for you
                    </span>
                    <span ref={containerRefFeatures} className="px-[5%] -mx-[5%] block absolute inset-0 pointer overflow-hidden" style={{ fontFamily: 'Tobias, "Tobias Fallback", serif', fontSize: '51px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '51px' }}>
                      <svg
                        className="select-none pointer-events-none"
                        height="100%"
                        width="100%"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <defs>
                          <linearGradient
                            id="textHoverEffectGradient-features"
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
                            id="textHoverEffectRevealMask-features"
                            cx={`${mousePosFeatures.x}%`}
                            cy={`${mousePosFeatures.y}%`}
                            gradientUnits="userSpaceOnUse"
                            r="40%"
                          >
                            <stop offset="30%" stopColor="white" />
                            <stop offset="100%" stopColor="black" />
                          </radialGradient>
                          <mask id="textHoverEffectMask-features">
                            <rect
                              height="100%"
                              width="100%"
                              fill="url(#textHoverEffectRevealMask-features)"
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
                          Here's what Surbee can do for you
                        </text>
                        <text
                          className="text-[1em] drop-shadow-[0_0_1px_var(--background,black)]"
                          dominantBaseline="middle"
                          fill="url(#textHoverEffectGradient-features)"
                          mask="url(#textHoverEffectMask-features)"
                          opacity="1"
                          textAnchor="middle"
                          x="50%"
                          y="55%"
                        >
                          Here's what Surbee can do for you
                        </text>
                      </svg>
                    </span>
                  </span>
                </span>
              </h2>
            </div>
          </section>

	          {/* Post-hero section */}
	          <div className="w-full border-t border-b border-gray-200">
            <RevealSection
              className="px-0 w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row"
            >
	              <div className="p-2 md:p-4 2xl:p-8 flex border-b lg:border-b-0 items-center justify-center lg:max-w-[60%] xl:max-w-[68%] lg:min-h-[630px] w-full overflow-hidden">
	                <div className="relative w-full h-full flex items-center justify-center p-8">
	                  <IKImage
	                    className="absolute inset-0 object-cover rounded-lg"
	                    alt="Drone view colorful landscape"
	                    src="/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png"
                      width={1600}
                      height={900}
                      transformation={[{ width: 1280, quality: 85 }]}
                      loading="lazy"
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
	                          <div className="relative">
	                          <h4 className="select-none hero-text-tobias">
	                          <span className="leading-none block" style={{ fontSize: '38px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '38px', color: '#0A0A0A' }}>
	                          <span className="relative">
	                          <span className="inline-block -translate-y-[0.135em] opacity-0">
	                          Detect Odd Behaviors & Bad Data
	                          </span>
	                          <span ref={containerRefDetect} className="px-[5%] -mx-[5%] block absolute inset-0 pointer overflow-hidden" style={{ fontFamily: 'Tobias, "Tobias Fallback", serif', fontSize: '38px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '38px' }}>
	                          <svg className="select-none pointer-events-none" height="100%" width="100%" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
	                          <defs>
	                          <linearGradient id="textHoverEffectGradient-detect" cx="50%" cy="50%" gradientTransform="rotate(-10)" gradientUnits="userSpaceOnUse">
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
	                          <radialGradient id="textHoverEffectRevealMask-detect" cx={`${mousePosDetect.x}%`} cy={`${mousePosDetect.y}%`} gradientUnits="userSpaceOnUse" r="40%">
	                          <stop offset="30%" stopColor="white" />
	                          <stop offset="100%" stopColor="black" />
	                          </radialGradient>
	                          <mask id="textHoverEffectMask-detect">
	                          <rect height="100%" width="100%" fill="url(#textHoverEffectRevealMask-detect)" x="0%" y="0" />
	                          </mask>
	                          </defs>
	                          <text className="text-[1em] fill-current text-shadow-ascii-contrast" dominantBaseline="middle" textAnchor="middle" x="50%" y="55%">
	                          Detect Odd Behaviors & Bad Data
	                          </text>
	                          <text className="text-[1em] drop-shadow-[0_0_1px_var(--background,black)]" dominantBaseline="middle" fill="url(#textHoverEffectGradient-detect)" mask="url(#textHoverEffectMask-detect)" opacity="1" textAnchor="middle" x="50%" y="55%">
	                          Detect Odd Behaviors & Bad Data
	                          </text>
	                          </svg>
	                          </span>
	                          </span>
	                          </span>
	                          </h4>
	                          </div>
	                        <div className="flex flex-col gap-2">
	                          <p className="font-medium text-[15px] tracking-15 leading-[140%] [font-variant-numeric:lining-nums_proportional-nums]" style={{ color: '#6B7280', fontFamily: 'var(--font-inter), sans-serif' }}>
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
	                  <IKImage
	                    className="absolute inset-0 object-cover rounded-lg"
	                    alt="Drone view colorful landscape 2"
	                    src="/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_abf323ce-3d0a-417d-8ce7-b307c8e84258.png"
                      width={1600}
                      height={900}
                      transformation={[{ width: 1280, quality: 85 }]}
                      loading="lazy"
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
	                          <div className="relative">
	                          <h4 className="select-none hero-text-tobias">
	                          <span className="leading-none block" style={{ fontSize: '38px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '38px', color: '#0A0A0A' }}>
	                          <span className="relative">
                          <span className="inline-block -translate-y-[0.135em] opacity-0">
                          Grow a Community<br />Around Your Surveys
                          </span>
	                          <span ref={containerRefCommunity} className="px-[5%] -mx-[5%] block absolute inset-0 pointer overflow-hidden" style={{ fontFamily: 'Tobias, "Tobias Fallback", serif', fontSize: '38px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '38px' }}>
	                          <svg className="select-none pointer-events-none" height="100%" width="100%" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
	                          <defs>
	                          <linearGradient id="textHoverEffectGradient-community" cx="50%" cy="50%" gradientTransform="rotate(-10)" gradientUnits="userSpaceOnUse">
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
	                          <radialGradient id="textHoverEffectRevealMask-community" cx={`${mousePosCommunity.x}%`} cy={`${mousePosCommunity.y}%`} gradientUnits="userSpaceOnUse" r="40%">
	                          <stop offset="30%" stopColor="white" />
	                          <stop offset="100%" stopColor="black" />
	                          </radialGradient>
	                          <mask id="textHoverEffectMask-community">
	                          <rect height="100%" width="100%" fill="url(#textHoverEffectRevealMask-community)" x="0%" y="0" />
	                          </mask>
	                          </defs>
                          <text className="text-[1em] fill-current text-shadow-ascii-contrast" dominantBaseline="middle" textAnchor="middle" x="50%" y="55%">
                            Grow a Community<tspan x="50%" dy="1.2em">Around Your Surveys</tspan>
                          </text>
                          <text className="text-[1em] drop-shadow-[0_0_1px_var(--background,black)]" dominantBaseline="middle" fill="url(#textHoverEffectGradient-community)" mask="url(#textHoverEffectMask-community)" opacity="1" textAnchor="middle" x="50%" y="55%">
                            Grow a Community<tspan x="50%" dy="1.2em">Around Your Surveys</tspan>
                          </text>
	                          </svg>
	                          </span>
	                          </span>
	                          </span>
	                          </h4>
	                          </div>
	                        <div className="flex flex-col gap-2">
	                          <p className="font-medium text-[15px] tracking-15 leading-[140%] [font-variant-numeric:lining-nums_proportional-nums]" style={{ color: '#6B7280', fontFamily: 'var(--font-inter), sans-serif' }}>
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


          <div className="py-12"></div>

          {/* Created with Surbee Section */}
          <RevealSection
            className="py-8 mx-auto w-full max-w-[1400px] flex flex-col justify-center items-center"
          >
            <CreatedWithSurbee />
          </RevealSection>

          {/* Integrations Section */}
          <RevealSection
            className="py-8 mx-auto w-full max-w-4xl flex flex-col justify-center items-center"
          >
            <div className="relative">
              <h2 className="select-none hero-text-tobias">
                <span className="leading-none block" style={{ fontSize: '38px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '38px', color: '#0A0A0A' }}>
                  <span className="relative">
                    <span className="inline-block -translate-y-[0.135em] opacity-0">
                      Connect the tools you already use
                    </span>
                    <span ref={containerRefTools} className="px-[5%] -mx-[5%] block absolute inset-0 pointer overflow-hidden" style={{ fontFamily: 'Tobias, "Tobias Fallback", serif', fontSize: '38px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '38px' }}>
                      <svg className="select-none pointer-events-none" height="100%" width="100%" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="textHoverEffectGradient-tools" cx="50%" cy="50%" gradientTransform="rotate(-10)" gradientUnits="userSpaceOnUse">
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
                          <radialGradient id="textHoverEffectRevealMask-tools" cx={`${mousePosTools.x}%`} cy={`${mousePosTools.y}%`} gradientUnits="userSpaceOnUse" r="40%">
                            <stop offset="30%" stopColor="white" />
                            <stop offset="100%" stopColor="black" />
                          </radialGradient>
                          <mask id="textHoverEffectMask-tools">
                            <rect height="100%" width="100%" fill="url(#textHoverEffectRevealMask-tools)" x="0%" y="0" />
                          </mask>
                        </defs>
                        <text className="text-[1em] fill-current text-shadow-ascii-contrast" dominantBaseline="middle" textAnchor="middle" x="50%" y="55%">
                          Connect the tools you already use
                        </text>
                        <text className="text-[1em] drop-shadow-[0_0_1px_var(--background,black)]" dominantBaseline="middle" fill="url(#textHoverEffectGradient-tools)" mask="url(#textHoverEffectMask-tools)" opacity="1" textAnchor="middle" x="50%" y="55%">
                          Connect the tools you already use
                        </text>
                      </svg>
                    </span>
                  </span>
                </span>
              </h2>
            </div>
	            <div className="flex justify-center gap-3 sm:gap-4 pb-5 md:pb-6 pt-3 md:pt-6 px-3 sm:px-4 flex-wrap">
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <IKImage
	                      src="https://ik.imagekit.io/on0moldgr/SurbeeIcons/Sheets?updatedAt=1760287548067"
	                      alt="Sheets"
	                      width={30}
	                      height={41}
	                      className="w-full h-full object-contain"
	                      style={{ color: "transparent" }}
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
	                    <IKImage
	                      src="https://ik.imagekit.io/on0moldgr/SurbeeIcons/typeform?updatedAt=1760287565909"
	                      alt="Typeform"
	                      width={30}
	                      height={30}
	                      className="w-full h-full object-contain"
	                      style={{ color: "transparent" }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Typeform
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <IKImage
	                      src="https://ik.imagekit.io/on0moldgr/SurbeeIcons/monkey?updatedAt=1760287596302"
	                      alt="SurveyMonkey"
	                      width={40}
	                      height={40}
	                      className="w-full h-full object-contain"
	                      style={{ color: "transparent" }}
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
	                    <IKImage
	                      src="https://ik.imagekit.io/on0moldgr/SurbeeIcons/forms?updatedAt=1760287609080"
	                      alt="Forms"
	                      width={30}
	                      height={41}
	                      className="w-full h-full object-contain"
	                      style={{ color: "transparent" }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Forms
	                    </span>
	                  </div>
	                </div>
	                <div className="flex relative flex-col items-center group">
	                  <div className="flex z-10 justify-center items-center p-4 w-16 h-16 text-xl text-white rounded-lg border border-gray-200 shadow-md transition-all duration-300 backdrop-blur-[1px] group-hover:scale-105 group-hover:-translate-y-8">
	                    <IKImage
	                      src="https://ik.imagekit.io/on0moldgr/SurbeeIcons/notion?updatedAt=1760287621171"
	                      alt="Notion"
	                      width={40}
	                      height={40}
	                      className="w-full h-full object-contain"
	                      style={{ color: "transparent" }}
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
	                    <IKImage
	                      src="https://ik.imagekit.io/on0moldgr/SurbeeIcons/docs?updatedAt=1760287634920"
	                      alt="Docs"
	                      width={30}
	                      height={41}
	                      className="w-full h-full object-contain"
	                      style={{ color: "transparent" }}
	                    />
	                  </div>
	                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
	                    <span className="text-xs font-medium text-center text-gray-700 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur-none">
	                      Docs
	                    </span>
	                  </div>
	                </div>
	            </div>
          </RevealSection>

	          {/* Testimonials Section */}
	          <RevealSection className="w-full">
	            <TestimonialCarousel />
	          </RevealSection>

	          {/* Footer Section */}
	          <RevealSection className="mt-8 w-full px-6 pb-8">
	            <RevealDiv className="relative h-[50vh] w-full overflow-hidden rounded-md">
	              <IKImage
	                src="/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__423e2f06-d2d7-4c2c-bd7b-9aec2b6c1fbe.png"
	                alt="Join our community"
                  width={1920}
                  height={1080}
	                className="h-full w-full object-cover"
                  transformation={[{ width: 1536, quality: 85 }]}
                  loading="lazy"
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
	                      <div className="relative">
	                      <h3 className="select-none hero-text-tobias">
	                      <span className="leading-none block" style={{ fontSize: '38px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '38px', color: '#0A0A0A' }}>
	                      <span className="relative">
                      <span className="inline-block -translate-y-[0.135em] opacity-0">
                      Join Our Community
                      </span>
	                      <span ref={containerRefJoin} className="px-[5%] -mx-[5%] block absolute inset-0 pointer overflow-hidden" style={{ fontFamily: 'Tobias, "Tobias Fallback", serif', fontSize: '38px', fontWeight: 100, letterSpacing: '-4px', lineHeight: '38px' }}>
	                      <svg className="select-none pointer-events-none" height="100%" width="100%" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
	                      <defs>
	                      <linearGradient id="textHoverEffectGradient-join" cx="50%" cy="50%" gradientTransform="rotate(-10)" gradientUnits="userSpaceOnUse">
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
	                      <radialGradient id="textHoverEffectRevealMask-join" cx={`${mousePosJoin.x}%`} cy={`${mousePosJoin.y}%`} gradientUnits="userSpaceOnUse" r="40%">
	                      <stop offset="30%" stopColor="white" />
	                      <stop offset="100%" stopColor="black" />
	                      </radialGradient>
	                      <mask id="textHoverEffectMask-join">
	                      <rect height="100%" width="100%" fill="url(#textHoverEffectRevealMask-join)" x="0%" y="0" />
	                      </mask>
	                      </defs>
                      <text className="text-[1em] fill-current text-shadow-ascii-contrast" dominantBaseline="middle" textAnchor="middle" x="50%" y="55%">
                      Join Our Community
                      </text>
                      <text className="text-[1em] drop-shadow-[0_0_1px_var(--background,black)]" dominantBaseline="middle" fill="url(#textHoverEffectGradient-join)" mask="url(#textHoverEffectMask-join)" opacity="1" textAnchor="middle" x="50%" y="55%">
                      Join Our Community
                      </text>
	                      </svg>
	                      </span>
	                      </span>
	                      </span>
	                      </h3>
	                      </div>
	                      <p className="text-[15px] leading-[140%] text-center" style={{ color: '#0A0A0A', fontFamily: 'var(--font-inter), sans-serif' }}>
	                        Connect with researchers, share insights, and stay updated on Surbee
	                      </p>
	                    </div>
	                    
	                    {/* Hover tooltip */}
	                    <div className="absolute z-50 bg-neutral-900 backdrop-blur-[20px] flex flex-col gap-1.5 items-center justify-center px-3 py-1 w-min rounded-full whitespace-nowrap text-[#EEF1ED] text-xs font-medium leading-[130%] tracking-[-0.12px] left-1/2 transform -translate-x-1/2 bottom-full mb-4 opacity-0 translate-y-1 scale-95 pointer-events-none transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100">
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

      <style
        dangerouslySetInnerHTML={{
          __html: `
.hero-text-tobias {
  font-family: var(--font-tobias), var(--font-inter), sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
`,
        }}
      />
    </ImageKitProvider>
  );
}
