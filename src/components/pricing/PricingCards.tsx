"use client";

import React from "react";

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Hobby Card */}
      <div className="bg-neutral-100 rounded-lg p-6 border border-neutral-200 transition-all duration-300 min-h-[400px] flex flex-col">
        <div className="text-left mb-4">
          <h3 className="text-2xl font-semibold text-black mb-1">Hobby</h3>
          <p className="text-lg text-neutral-500 font-medium">Free</p>
        </div>

        <div className="mb-6 flex-grow">
          <p className="text-neutral-700 font-medium mb-2">Includes</p>
        </div>

        <div className="text-left mt-auto">
          <button className="py-3 px-6 bg-white text-black font-medium rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors">
            Start Free
          </button>
        </div>
      </div>

      {/* Pro Card */}
      <div className="bg-neutral-100 rounded-lg p-6 border border-neutral-200 transition-all duration-300 min-h-[400px] flex flex-col">
        <div className="text-left mb-4">
          <h3 className="text-2xl font-semibold text-black mb-1">Pro</h3>
          <p className="text-lg text-neutral-500 font-medium">$20</p>
        </div>

        <div className="mb-6 flex-grow">
          <p className="text-neutral-700 font-medium mb-2">Everything in Hobby, Plus:</p>
        </div>

        <div className="text-left mt-auto">
          <button className="py-3 px-6 bg-white text-black font-medium rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors">
            Get Pro
          </button>
        </div>
      </div>

      {/* Max Card */}
      <div className="bg-neutral-100 rounded-lg p-6 border border-neutral-200 transition-all duration-300 min-h-[400px] flex flex-col">
        <div className="text-left mb-4">
          <h3 className="text-2xl font-semibold text-black mb-1">Max</h3>
          <p className="text-lg text-neutral-500 font-medium">$100</p>
        </div>

        <div className="mb-6 flex-grow">
          <p className="text-neutral-700 font-medium mb-2">Everything in Pro. Plus:</p>
        </div>

        <div className="text-left mt-auto">
          <button className="py-3 px-6 bg-white text-black font-medium rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors">
            Get Max
          </button>
        </div>
      </div>
    </div>
  );
}

export default PricingCards;
