"use client";

import React from "react";

export function PricingCards() {
  return (
    <>
      <div className="gap-g1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <a
          className="card card--text aspect-natural-box sm:aspect-natural-box md:aspect-16/9-box lg:aspect-4/5-box"
          href="https://cursor.com/download"
        >
          <div className="col-span-full row-span-full flex flex-col justify-between">
            <div>
              <div className="flex items-baseline gap-x-2">
                <h3 id="tier-0-0" className="type-md">
                  Hobby
                </h3>
              </div>
              <p className="flex items-baseline">
                <span className="type-md text-theme-text-sec">Free</span>
              </p>
              <p className="text-theme-text-sec mt-v9/12">Includes:</p>
              <ul className="mt-v9/12 space-y-v2/12" role="list">
                <li className="gap-x-g0.75 flex">
                  <span>{"\u2713"}</span> One-week Pro trial
                </li>
                <li className="gap-x-g0.75 flex">
                  <span>{"\u2713"}</span> Limited Agent requests
                </li>
                <li className="gap-x-g0.75 flex">
                  <span>{"\u2713"}</span> Limited Tab completions
                </li>
              </ul>
            </div>
            <div className="mt-v1.5">
              <span className="btn btn--secondary">Download</span>
            </div>
          </div>
        </a>
        <a
          className="card card--text aspect-natural-box sm:aspect-natural-box md:aspect-16/9-box lg:aspect-4/5-box"
          href="https://cursor.com/api/auth/checkoutDeepControl"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="col-span-full row-span-full flex flex-col justify-between">
            <div>
              <div className="flex items-baseline gap-x-2">
                <h3 id="tier-0-1" className="type-md">
                  Pro
                </h3>
              </div>
              <p className="flex items-baseline">
                <span className="type-md text-theme-text-sec">$20</span>
                <span className="text-theme-text-sec text-sm">
                  {"\u200A/\u200A"}mo.
                </span>
              </p>
              <p className="text-theme-text-sec mt-v9/12">
                Everything in Hobby, plus:
              </p>
              <ul className="mt-v9/12 space-y-v2/12" role="list">
                <li className="gap-x-g0.75 flex">
                  <span>{"\u2713"}</span> Extended limits on Agent
                </li>
                <li className="gap-x-g0.75 flex">
                  <span>{"\u2713"}</span> Unlimited Tab completions
                </li>
                <li className="gap-x-g0.75 flex">
                  <span>{"\u2713"}</span> Background Agents
                </li>
                <li className="gap-x-g0.75 flex">
                  <span>{"\u2713"}</span> Maximum context windows
                </li>
              </ul>
            </div>
            <div className="mt-v1.5">
              <span className="btn btn--secondary">Get Pro</span>
            </div>
          </div>
        </a>
        <a
          className="card card--text aspect-natural-box sm:aspect-natural-box md:aspect-16/9-box lg:aspect-4/5-box"
          href="https://cursor.com/api/auth/checkoutDeepControl?tier=pro_plus"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="col-span-full row-span-full flex flex-col justify-between">
            <div>
              <div className="flex items-baseline gap-x-2">
                <h3 id="tier-0-2" className="type-md">
                  Pro+
                </h3>
                <p className="text-theme-accent">Recommended</p>
              </div>
              <p className="flex items-baseline">
                <span className="type-md text-theme-text-sec">$60</span>
                <span className="text-theme-text-sec text-sm">
                  {"\u200A/\u200A"}mo.
                </span>
              </p>
              <p className="text-theme-text-sec mt-v9/12">
                Everything in Pro, plus:
              </p>
              <ul className="mt-v9/12 space-y-v2/12" role="list">
                <li className="gap-x-g0.75 flex">
                  <span>{"\u2713"}</span> 3x usage on all OpenAI, Claude, Gemini models
                </li>
              </ul>
            </div>
            <div className="mt-v1.5">
              <span className="btn">Get Pro+</span>
            </div>
          </div>
        </a>
        <a
          className="card card--text aspect-natural-box sm:aspect-natural-box md:aspect-16/9-box lg:aspect-4/5-box"
          href="https://cursor.com/api/auth/checkoutDeepControl?tier=ultra"
          rel="noopener noreferrer"
          target="_blank"
        >
          <div className="col-span-full row-span-full flex flex-col justify-between">
            <div>
              <div className="flex items-baseline gap-x-2">
                <h3 id="tier-0-3" className="type-md">
                  Ultra
                </h3>
              </div>
              <p className="flex items-baseline">
                <span className="type-md text-theme-text-sec">$200</span>
                <span className="text-theme-text-sec text-sm">
                  {"\u200A/\u200A"}mo.
                </span>
              </p>
              <p className="text-theme-text-sec mt-v9/12">
                Everything in Pro, plus:
              </p>
              <ul className="mt-v9/12 space-y-v2/12" role="list">
                <li className="gap-x-g0.75 flex">
                  <span>{"\u2713"}</span> 20x usage on all OpenAI, Claude, Gemini
                  models
                </li>
                <li className="gap-x-g0.75 flex">
                  <span>{"\u2713"}</span> Priority access to new features
                </li>
              </ul>
            </div>
            <div className="mt-v1.5">
              <span className="btn btn--secondary">Get Ultra</span>
            </div>
          </div>
        </a>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Pricing card styles */
            .card {
              display: grid;
              grid-template-rows: 1fr;
              grid-template-columns: 1fr;
              border: 1px solid rgba(0, 0, 0, 0.08);
              border-radius: 12px;
              padding: 24px;
              background: #fff;
              transition: all 0.2s ease;
              position: relative;
              overflow: hidden;
            }

            .card:hover {
              border-color: rgba(0, 0, 0, 0.12);
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
            }

            .card--text {
              color: #0a0a0a;
            }

            /* Aspect ratio utilities */
            .aspect-natural-box {
              aspect-ratio: auto;
            }

            @media (min-width: 640px) {
              .sm\\:aspect-natural-box {
                aspect-ratio: auto;
              }
            }

            @media (min-width: 768px) {
              .md\\:aspect-16\\/9-box {
                aspect-ratio: 16 / 9;
              }
            }

            @media (min-width: 1024px) {
              .lg\\:aspect-4\\/5-box {
                aspect-ratio: 4 / 5;
                min-height: 450px;
              }
            }

            .col-span-full {
              grid-column: 1 / -1;
            }

            .row-span-full {
              grid-row: 1 / -1;
            }

            .type-md {
              font-size: 20px;
              font-weight: 600;
              line-height: 1.4;
              color: #0a0a0a;
            }

            .text-theme-text-sec {
              color: #6b7280;
            }

            .text-theme-accent {
              color: #10b981;
              font-size: 14px;
              font-weight: 500;
            }

            .btn {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              padding: 10px 20px;
              border-radius: 8px;
              font-size: 14px;
              font-weight: 500;
              transition: all 0.2s ease;
              background: #0a0a0a;
              color: #fff;
              border: none;
              width: 100%;
            }

            .btn:hover {
              background: #1a1a1a;
            }

            .btn--secondary {
              background: #f5f5f5;
              color: #0a0a0a;
            }

            .btn--secondary:hover {
              background: #e5e5e5;
            }

            .mt-v9\\/12 {
              margin-top: 0.75rem;
            }

            .mt-v1\\.5 {
              margin-top: 1.5rem;
            }

            .mt-v3 {
              margin-top: 3rem;
            }

            .space-y-v2\\/12 > * + * {
              margin-top: 0.5rem;
            }

            .space-y-v8\\/12 > * + * {
              margin-top: 2rem;
            }

            .gap-g1 {
              gap: 1rem;
            }

            .gap-x-g0\\.75 {
              column-gap: 0.75rem;
            }
          `,
        }}
      />
    </>
  );
}

export default PricingCards;
