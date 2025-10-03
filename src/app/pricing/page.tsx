"use client";

import React, { useState } from "react";
import localFont from "next/font/local";
import { motion, AnimatePresence } from "framer-motion";

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
  return (
    <div className={`min-h-screen w-full ${epilogue.variable}`} style={{ backgroundColor: "#FEFFFC", fontFamily: "var(--font-epilogue)" }}>
      {/* Top Navigation (full-width) with blur */}
      <nav className="fixed left-0 right-0 top-0 z-40 w-full bg-[#FEFFFC]/70 backdrop-blur supports-[backdrop-filter]:bg-[#FEFFFC]/70">
        <div className="flex h-16 items-center justify-between gap-4 px-6 md:px-8 xl:px-12 2xl:px-30">
          <div className="text-2xl text-[#171717] font-semibold tracking-[-0.02em]">surbee</div>
          <div className="flex items-center gap-4">
            <a href="/landing" className="text-sm text-[#171717] hover:text-neutral-800 transition-all duration-300 ease-out">
              Home
            </a>
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

      {/* Main Content - full width, no sidebar */}
      <main className="w-full pt-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 xl:px-12 2xl:px-30 pt-16 pb-20">
          <header className="mb-16 text-center">
            <h1 className="text-[#171717] text-[54px] font-semibold tracking-[-0.02em] leading-[110%]">
              Pricing
            </h1>
            <p className="mt-4 text-[15px] leading-[140%] text-neutral-600 max-w-2xl mx-auto">
              Choose the plan that fits your workflow. Upgrade anytime.
            </p>
          </header>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch justify-center">
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

        {/* FAQ Section */}
        <section className="px-6 pt-24 pb-2 text-center">
          <h2 className="font-af-foundary font-medium tracking-15 text-neutral-900 text-center text-[20px] leading-[130%] tracking-24 sm:text-[24px] sm:tracking-48 mb-12">
            FAQs
          </h2>
          
          <div className="max-w-3xl mx-auto">
            <FAQItem 
              question="What is Surbee?"
              answer="Surbee is an AI-powered survey automation platform that helps you build, deploy, and analyze surveys using natural language. Simply describe what you want, and Surbee generates complete surveys with questions, options, and logic instantly."
            />
            <FAQItem 
              question="How many credits do I get per month?"
              answer="The Trial plan includes 500 credits per month, Pro includes 4,000 credits per month, and Enterprise offers custom limits based on your needs. Credits are used for AI-powered survey generation, analysis, and fraud detection features."
            />
            <FAQItem 
              question="Can I upgrade or downgrade my plan anytime?"
              answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing adjustments for the current billing period."
            />
            <FAQItem 
              question="What integrations does Surbee support?"
              answer="Surbee integrates with popular tools like Google Sheets, Airtable, Notion, Slack, and many more. Pro users can also request new integrations, and Enterprise customers get access to custom integrations and API access."
            />
            <FAQItem 
              question="Does Surbee detect fraudulent survey responses?"
              answer="Yes! Surbee includes advanced fraud detection that identifies suspicious patterns, bot responses, and inconsistent answers. This helps ensure your survey data is reliable and high-quality."
            />
            <FAQItem 
              question="Is there a free trial available?"
              answer="Yes! Our Trial plan is completely free and includes 500 credits per month. You can explore core features and see how Surbee fits your workflow before upgrading to a paid plan."
            />
          </div>
        </section>
        </div>
      </main>
    </div>
  );
}

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left py-2 hover:opacity-80 transition-opacity"
      >
        <span className="text-[#171717] font-medium text-[17px] leading-[140%] pr-4">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-shrink-0"
        >
          <svg
            className="w-5 h-5 text-[#171717]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-4">
              <p className="text-neutral-600 text-[15px] leading-[140%] text-left">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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