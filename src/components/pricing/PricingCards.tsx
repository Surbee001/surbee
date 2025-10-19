"use client";

import React from "react";
import { Check } from "lucide-react";

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
      {/* Hobby Card */}
      <div className="bg-neutral-100 rounded-md p-6 border border-neutral-200 transition-all duration-300 hover:bg-neutral-50 min-h-[450px] flex flex-col">
        <div className="text-left mb-4">
          <h3 className="text-2xl font-normal text-black mb-1">Hobby</h3>
          <p className="text-lg text-neutral-500 font-bold">Free</p>
        </div>

        <div className="mb-6 flex-grow">
          <p className="text-neutral-700 font-medium mb-4">Includes</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-sm text-neutral-600">500 credits per month</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-sm text-neutral-600">Basic survey generation</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-sm text-neutral-600">Standard support</span>
            </div>
          </div>
        </div>

        <div className="text-left mt-auto">
          <button className="py-3 px-6 bg-white text-black font-medium rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors">
            Start Free
          </button>
        </div>
      </div>

      {/* Pro Card */}
      <div className="bg-neutral-100 rounded-md p-6 border border-neutral-200 transition-all duration-300 hover:bg-neutral-50 min-h-[450px] flex flex-col">
        <div className="text-left mb-4 mt-2">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-normal text-black mb-1">Pro</h3>
            <span className="text-[0.9rem] md:text-base font-semibold" style={{ color: '#F5480C' }}>Recommended</span>
          </div>
          <p className="text-lg text-neutral-500 font-bold">$20<span className="font-bold">/mo.</span></p>
        </div>

        <div className="mb-6 flex-grow">
          <p className="text-neutral-700 font-medium mb-4">Everything in Hobby, Plus:</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-sm text-neutral-600">4,000 credits per month</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-sm text-neutral-600">Advanced survey logic</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-sm text-neutral-600">Priority support</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-sm text-neutral-600">Custom integrations</span>
            </div>
          </div>
        </div>

        <div className="text-left mt-auto">
          <button className="py-3 px-6 bg-white text-black font-medium rounded-full border border-neutral-200 hover:bg-neutral-50 transition-colors">
            Get Pro
          </button>
        </div>
      </div>

      {/* Max Card */}
      <div className="bg-neutral-100 rounded-md p-6 border border-neutral-200 transition-all duration-300 hover:bg-neutral-50 min-h-[450px] flex flex-col">
        <div className="text-left mb-4">
          <h3 className="text-2xl font-normal text-black mb-1">Max</h3>
          <p className="text-lg text-neutral-500 font-bold">$100<span className="font-bold">/mo.</span></p>
        </div>

        <div className="mb-6 flex-grow">
          <p className="text-neutral-700 font-medium mb-4">Everything in Pro. Plus:</p>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-sm text-neutral-600">Unlimited credits</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-sm text-neutral-600">Enterprise security</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-sm text-neutral-600">24/7 phone support</span>
            </div>
            <div className="flex items-center gap-3">
              <Check className="w-4 h-4 text-black flex-shrink-0" />
              <span className="text-sm text-neutral-600">Custom development</span>
            </div>
          </div>
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
