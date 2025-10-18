"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageKitProvider, Image as IKImage } from "@imagekit/next";
import PricingCards from "@/components/pricing/PricingCards";

export default function PricingPage() {
  const [selectedFrequency, setSelectedFrequency] = useState("monthly");
  const sidebarWidthClass = "w-56"; // 14rem ~ 224px

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
    <div className="min-h-screen w-full" style={{ backgroundColor: "#FEFFFC" }}>
      {/* Top Navigation (full-width) with blur */}
	  <nav className="sticky inset-x-0 top-0 nav-gradient z-50"
        style={{
          background: "linear-gradient(#FEFFFC 40%, rgba(254, 255, 252, 0))",
        }}
      >
		<div className="flex h-20 items-center justify-between gap-4 pl-56 pr-6">
		  <div className="text-2xl font-semibold tracking-[-0.02em] pl-5 md:pl-8 xl:pl-12 2xl:pl-30" style={{ color: '#0A0A0A', fontFamily: 'var(--font-inter), sans-serif' }}>surbee</div>
          <div className="flex items-center gap-6">
            <a href="/landing" className="text-sm hover:text-neutral-800 transition-all duration-300 ease-out" style={{ color: '#0A0A0A', fontFamily: 'var(--font-inter), sans-serif' }}>
              Home
            </a>
          <div className="flex items-center gap-2">
            <a
              href="/test-login"
              className="px-4 py-1.5 text-sm font-medium border bg-white text-black hover:bg-neutral-50 transition-all duration-300 ease-out"
              style={{ fontFamily: 'var(--font-inter), sans-serif', borderRadius: '12px', borderColor: '#e5e7eb' }}
            >
              Log in
            </a>
            <a
              href="/test-login"
              className="px-4 py-1.5 text-sm font-medium bg-black text-white hover:bg-neutral-800 transition-all duration-300 ease-out"
              style={{ fontFamily: 'var(--font-inter), sans-serif', borderRadius: '12px' }}
            >
              Sign up
            </a>
          </div>
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
            {/* Spacer to push content to bottom */}
            <div className="flex-1"></div>

            {/* Logo and menu at bottom */}
            <div className="flex flex-col">
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
                  className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 outline-none underline-offset-4 hover:text-neutral-800 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out font-medium bg-neutral-100 rounded px-2 py-1 -ml-1"
                  style={{ color: '#0A0A0A', fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  Surbee
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  Home
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="#pricing"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  Pricing
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="#use-cases"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  Use cases
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="#students"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  Students
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing/privacy"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  Privacy
                </a>


                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing/blog"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  Blog
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1 pb-4 mt-6">
              <a href="https://twitter.com/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 transition-colors" style={{ fontFamily: 'var(--font-inter), sans-serif' }} aria-label="X">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://discord.gg/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 transition-colors" style={{ fontFamily: 'var(--font-inter), sans-serif' }} aria-label="Discord">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 127.14 96"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15zM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69z"/></svg>
              </a>
              <a href="https://instagram.com/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 transition-colors" style={{ fontFamily: 'var(--font-inter), sans-serif' }} aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content - occupies the rest of the page width */}
        <main className={`ml-56 w-full pt-20`}> {/* ml must equal sidebar width; pt offset for navbar */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 xl:px-12 2xl:px-30 pt-16 pb-20">
          <header className="mb-16 text-center">
            <h1 className="text-[54px] font-semibold tracking-[-0.02em] leading-[110%]" style={{ color: '#0A0A0A', fontFamily: 'var(--font-inter), sans-serif' }}>
              Pricing
            </h1>
            <p className="mt-4 text-[15px] leading-[140%] max-w-2xl mx-auto" style={{ color: '#6B7280', fontFamily: 'var(--font-inter), sans-serif' }}>
              Choose the plan that fits your workflow. Upgrade anytime.
            </p>
          </header>

          <div className="flex justify-center mt-8 mb-6">
            <fieldset aria-label="Payment frequency">
              <div className="relative flex rounded-full text-center p-0.5 bg-gray-100 border border-gray-200">
                <div
                  className={`absolute rounded-full transition-all duration-300 ease-out bg-white border border-gray-200 ${selectedFrequency === 'monthly' ? 'left-0.5' : 'left-[calc(50%-2px)]'}`}
                  style={{
                    width: "101px",
                    top: "2px",
                    bottom: "2px",
                  }}
                />
                <label className={`group relative cursor-pointer rounded-full text-base leading-[1] px-4 py-2 z-10 transition-colors ${selectedFrequency === 'monthly' ? 'text-black' : 'text-gray-600 hover:text-black'}`} style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                  <input
                    className="absolute inset-0 cursor-pointer appearance-none rounded-full opacity-0"
                    name="frequency"
                    type="radio"
                    value="monthly"
                    checked={selectedFrequency === 'monthly'}
                    onChange={(e) => setSelectedFrequency(e.target.value)}
                  />
                  <span>Monthly</span>
                </label>
                <label className={`group relative cursor-pointer rounded-full text-base leading-[1] px-4 py-2 z-10 transition-colors ${selectedFrequency === 'yearly' ? 'text-black' : 'text-gray-600 hover:text-black'}`} style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                  <input
                    className="absolute inset-0 cursor-pointer appearance-none rounded-full opacity-0"
                    name="frequency"
                    type="radio"
                    value="yearly"
                    checked={selectedFrequency === 'yearly'}
                    onChange={(e) => setSelectedFrequency(e.target.value)}
                  />
                  <span>Yearly</span>
                </label>
              </div>
            </fieldset>
          </div>

        <div className="mb-12">
          <h2 id="individual" className="text-2xl font-semibold mb-8" style={{ color: '#0A0A0A', fontFamily: 'var(--font-inter), sans-serif' }}>
            <a
              className="hover:opacity-90"
              href="/pricing#individual"
            >
              Individual Plans
            </a>
          </h2>
          <PricingCards />
        </div>

        {/* FAQ Section */}
        <section className="px-6 pt-24 pb-2 text-center">
          <h2 className="font-medium text-center text-[20px] leading-[130%] mb-12" style={{ color: '#0A0A0A', fontFamily: 'var(--font-inter), sans-serif', fontSize: '20px', letterSpacing: '0.15px', lineHeight: '130%', marginBottom: '3rem' }}>
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
    </div>
    </ImageKitProvider>
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
        <span className="font-medium text-[17px] leading-[140%] pr-4" style={{ color: '#0A0A0A', fontFamily: 'var(--font-inter), sans-serif' }}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex-shrink-0"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: '#0A0A0A' }}
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
              <p className="text-[15px] leading-[140%] text-left" style={{ color: '#6B7280', fontFamily: 'var(--font-inter), sans-serif' }}>
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
