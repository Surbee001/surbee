"use client";

import React from "react";

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Hobby Card */}
      <div className="bg-neutral-100 rounded-3xl p-8 border border-neutral-200 hover:shadow-lg transition-all duration-300 h-fit">
        <div className="text-left mb-6">
          <h3 className="text-2xl font-semibold text-black mb-2">Hobby</h3>
          <p className="text-lg text-neutral-500 font-medium">Free</p>
        </div>

        <div className="mb-8">
          <p className="text-neutral-700 font-medium mb-4">Includes</p>
        </div>

        <div className="text-left">
          <button className="w-full py-3 px-6 bg-white text-black font-medium rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors">
            Start Free
          </button>
        </div>
      </div>

      {/* Pro Card */}
      <div className="bg-neutral-100 rounded-3xl p-8 border border-neutral-200 hover:shadow-lg transition-all duration-300 h-fit">
        <div className="text-left mb-6">
          <h3 className="text-2xl font-semibold text-black mb-2">Pro</h3>
          <p className="text-lg text-neutral-500 font-medium">$20</p>
        </div>

        <div className="mb-8">
          <p className="text-neutral-700 font-medium mb-4">Everything in Hobby, Plus:</p>
        </div>

        <div className="text-left">
          <button className="w-full py-3 px-6 bg-white text-black font-medium rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors">
            Get Pro
          </button>
        </div>
      </div>

      {/* Max Card */}
      <div className="bg-neutral-100 rounded-3xl p-8 border border-neutral-200 hover:shadow-lg transition-all duration-300 h-fit">
        <div className="text-left mb-6">
          <h3 className="text-2xl font-semibold text-black mb-2">Max</h3>
          <p className="text-lg text-neutral-500 font-medium">100%</p>
        </div>

        <div className="mb-8">
          <p className="text-neutral-700 font-medium mb-4">Everything in Pro. Plus:</p>
        </div>

        <div className="text-left">
          <button className="w-full py-3 px-6 bg-white text-black font-medium rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors">
            Get Max
          </button>
        </div>
      </div>
    </div>
  );
}

export default PricingCards;
