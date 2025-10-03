"use client";

import React from "react";
import localFont from "next/font/local";

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

export default function PricingPage() {
  const sidebarWidthClass = "w-56"; // 14rem ~ 224px
  return (
    <div className={`min-h-screen w-full ${epilogue.variable}`} style={{ backgroundColor: "#FEFFFC", fontFamily: "var(--font-epilogue)" }}>
      {/* Top Navigation (full-width) with blur */}
      <nav className="fixed left-0 right-0 top-0 z-40 w-full bg-[#FEFFFC]/70 backdrop-blur supports-[backdrop-filter]:bg-[#FEFFFC]/70">
        <div className="flex h-16 items-center justify-between gap-4 pl-56 pr-6">
          <div className="text-2xl text-[#171717] font-semibold tracking-[-0.02em] pl-5 md:pl-8 xl:pl-12 2xl:pl-30">surbee</div>
          <div className="flex items-center gap-4">
            <a href="/pricing" className="text-sm text-[#171717] hover:text-neutral-800 transition-all duration-300 ease-out">
              Pricing
            </a>
            <a
              href="/test-login"
              className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm text-[#171717] hover:bg-neutral-100"
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
          <div className="flex h-full flex-col p-4 pt-20">
            <div className="flex-1 flex flex-col">
              <div className="px-1 mb-5">
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
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing"
                >
                  Surbee
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing#use-cases"
                >
                  Use cases
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing#product"
                >
                  Product
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 outline-none underline-offset-4 hover:text-neutral-800 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-[#171717] font-medium bg-neutral-100 rounded px-2 py-1 -ml-1"
                >
                  Pricing
                </a>
              </div>
            </div>
            
            <div className="flex items-center gap-3 px-1 pb-4">
              <a href="https://twitter.com/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#171717] transition-colors" aria-label="X">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://discord.gg/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#171717] transition-colors" aria-label="Discord">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 127.14 96"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15zM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69z"/></svg>
              </a>
              <a href="https://instagram.com/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#171717] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content - occupies the rest of the page width */}
        <main className={`ml-56 w-full pt-20`}> {/* ml must equal sidebar width; pt offset for navbar */}
          <div className="max-w-6xl mx-auto px-5 md:px-8 xl:px-12 2xl:px-30 pt-8 pb-20">
        <header className="mb-10 md:mb-14">
              <h1 className="text-[#171717] text-[48px] md:text-[54px] xl:text-[70px] font-semibold tracking-[-0.02em] leading-none">
            Pricing
          </h1>
              <p className="mt-3 text-[15px] leading-[140%] text-neutral-600">
            Choose the plan that fits your workflow. Upgrade anytime.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch">
          {/* Trial */}
          <PlanCard
            title="Trial"
            price="0"
            period="/ month"
            includes="500 credits / month"
            ctaHref="/test-login"
            imageSrc="https://cofounder.co/_next/image?url=/images/pricing-img-1.png&w=1920&q=75"
            features={[
              "Core features",
              "Community support",
              "Basic usage limits",
              "Limited generations",
            ]}
          />

          {/* Pro */}
          <PlanCard
            title="Pro"
            price="39.99"
            period="/ month"
            includes="4000 credits / month"
            ctaHref="/test-login"
            imageSrc="https://cofounder.co/_next/image?url=/images/pricing-img-2.png&w=1920&q=75"
            features={[
              "Everything from Trial",
              "Higher usage limits",
              "Priority support",
              "Request new integrations",
            ]}
          />

          {/* Enterprise */}
          <PlanCard
            title="Enterprise"
            price="Custom"
            period=""
            includes="Unlimited teams & SSO"
            ctaHref="/test-login"
            imageSrc="https://cofounder.co/_next/image?url=/images/pricing-img-3.png&w=1920&q=75"
            features={[
              "Everything in Pro",
              "Dedicated support",
              "Custom limits & SLAs",
              "Security reviews & SSO/SAML",
            ]}
          />
                      </div>
          </div>
        </main>
                    </div>
                  </div>
  );
}

type PlanCardProps = {
  title: string;
  price: string;
  period: string;
  includes: string;
  imageSrc: string;
  ctaHref: string;
  features: string[];
};

function PlanCard({ title, price, period, includes, imageSrc, ctaHref, features }: PlanCardProps) {
  return (
    <div className="group rounded-2xl border border-[#DEE2DE] bg-neutral-50 cursor-pointer transition-all hover:shadow-[0_2px_2px_0_rgba(0,0,0,0.06),_0_6px_6px_0_rgba(0,0,0,0.00),_0_0_0_5px_rgba(0,0,0,0.04)] shadow-[0_2px_2px_0_rgba(0,0,0,0.06),_0_6px_6px_0_rgba(0,0,0,0.00),_0_0_0_5px_rgba(0,0,0,0.04)] px-4 pb-8 pt-2.5 sm:px-8 sm:py-3 md:py-5 md:px-6 xl:px-8 xl:pb-10 flex-1 min-h-none lg:min-h-[700px] w-full max-w-[420px] sm:max-w-[704px] xl:max-w-none flex flex-col h-full">
      <div className="flex justify-between items-center pb-6">
        <p
          className="font-af-foundary font-medium text-[15px] tracking-15 leading-[140%]"
          style={{ color: "rgb(180, 184, 180)" }}
        >
          {title}
        </p>
        <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <a
            className="flex items-center gap-[6px] px-[10px] py-1 rounded-[100px] border border-[rgba(255,255,255,0.60)] bg-neutral-900 shadow-[0_4px_12px_0_rgba(255,255,255,0.10)_inset,0_2px_6px_0_rgba(0,0,0,0.20)] backdrop-blur-[20px] cursor-pointer hover:[&>svg]:translate-x-[2px]"
            aria-label="Select pricing plan"
            href={ctaHref}
          >
            <span className="text-[#FFF] font-af-foundary text-[13px] font-medium leading-[130%] tracking-[-0.13px]">
              Select
            </span>
            <svg
              className="text-[#FFF] transition-transform duration-200"
              height="13"
              width="11"
              fill="none"
              viewBox="0 0 7 10"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect height="1.41526" width="1.41526" fill="currentColor" x="4.36621" y="4.43835" />
              <rect height="1.41526" width="1.41526" fill="currentColor" x="1.55078" y="1.61774" />
              <rect height="1.41526" width="1.41526" fill="currentColor" x="1.55078" y="7.2619" />
              <rect height="4.24579" width="1.41526" fill="currentColor" x="2.95117" y="3.02307" />
            </svg>
          </a>
                    </div>
                  </div>

      <div className="flex-1 flex flex-col">
        <div className="flex flex-col sm:flex-row lg:flex-col lg:gap-0 gap-4">
          <div className="relative lg:w-full w-full sm:w-1/2 h-[230px] sm:h-[222px] aspect-square [border-radius:16px] [border:1px_solid_#DEE2DE] overflow-hidden">
            <img
              className="object-cover absolute inset-0 h-full w-full select-none"
              alt={title}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              src={imageSrc}
              draggable={false}
            />
                      </div>
          <div className="flex flex-col flex-1">
            <div className="flex-1">
              <div className="lg:mt-6 mt-0 flex flex-col gap-2">
                <p className="font-af-foundary font-medium text-[13px] tracking-13 leading-[130%] text-neutral-700">
                  Starting at
                </p>
                <div className="flex items-baseline gap-1">
                  <div className="flex items-baseline">
                    <img
                      className="mr-[7px] self-center select-none"
                      height={30}
                      width={16}
                      alt="$"
                      src="https://cofounder.co/_next/static/media/dolar-sign.6d789d18.svg"
                      draggable={false}
                    />
                    <p className="font-mondwest font-normal text-[50px] text-neutral-900 leading-[110%] mr-[7px]">
                      {price}
                    </p>
                  </div>
                  {period ? (
                    <p className="font-af-foundary font-medium text-[15px] text-neutral-800 leading-[140%] tracking-[-0.15px] [font-variant-numeric:lining-nums_proportional-nums]">
                      {period}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-4">
                <ul className="flex flex-col gap-3">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-neutral-900 font-af-foundary text-[15px] font-medium leading-[140%] tracking-[-0.15px] [font-variant-numeric:lining-nums_proportional-nums]">
                      <img
                        height={15}
                        width={14}
                        alt="checkbox"
                        src="https://cofounder.co/_next/static/media/checkbox-green.9f99a2ea.svg"
                        draggable={false}
                      />
                      <span className="text-neutral-900 font-af-foundary text-[15px] font-medium leading-[140%] tracking-[-0.15px] [font-variant-numeric:lining-nums_proportional-nums] -mt-[3px]">
                        {f}
                      </span>
                    </li>
                  ))}
                  </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <p className="font-af-foundary font-medium text-[13px] tracking-13 leading-[130%] text-neutral-700">
            Includes
          </p>
          <p className="font-af-foundary font-medium text-[13px] tracking-13 leading-[130%] text-neutral-600">
            {includes}
            </p>
          </div>
        <div className="block sm:hidden pt-5">
          <a
            className="flex w-full text-center justify-center items-center gap-[6px] px-[10px] py-1 min-h-[36px] rounded-[100px] border border-[rgba(255,255,255,0.60)] bg-neutral-900 shadow-[0_4px_12px_0_rgba(255,255,255,0.10)_inset,0_2px_6px_0_rgba(0,0,0,0.20)] cursor-pointer"
            aria-label="Select pricing plan"
            href={ctaHref}
          >
            <span className="text-[#FFF] font-af-foundary text-[15px] font-medium leading-[140%] tracking-[-0.15px]">
              Select
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}