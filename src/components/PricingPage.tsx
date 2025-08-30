// app/components/PricingPage.tsx
"use client";

import React, { useState } from 'react';
import { Check, X, Sparkles, Zap } from 'lucide-react';

type PlanType = 'personal' | 'business';
type SubscriptionTier = 'pro' | 'max';

interface PricingFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  yearlyPrice?: number;
  description: string;
  popular?: boolean;
  features: PricingFeature[];
  buttonText: string;
  buttonClass: string;
  disclaimer?: string;
}

interface PricingPageProps {
  onClose?: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onClose }) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('personal');

  const plans: PricingPlan[] = [
    {
      id: 'pro',
      name: 'Pro',
      price: 20,
      yearlyPrice: 16.67,
      description: 'Upgrade productivity and learning with additional access.',
      popular: true,
      features: [
        { text: '10x as many citations in answers', included: true },
        { text: 'Access to Perplexity Labs', included: true },
        { text: 'Unlimited file and photo uploads', included: true },
        { text: 'Extended access to Perplexity Research', included: true },
        { text: 'Extended access to image generation', included: true },
        { text: 'Limited access to video generation', included: true },
        { text: 'One subscription for all the latest AI models including GPT-5 and Claude Sonnet 4', included: true },
        { text: 'Exclusive access to Pro Perks and more', included: true, highlight: true },
      ],
      buttonText: 'Get Pro',
      buttonClass: 'bg-cyan-500 hover:bg-cyan-600 text-gray-900',
      disclaimer: 'Existing subscriber? See billing help',
    },
    {
      id: 'max',
      name: 'Max',
      price: 200,
      description: "Unlock Perplexity's full capabilities with early access to new products.",
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Early access to Comet, the agentic browser', included: true },
        { text: 'Unlimited access to Perplexity Labs', included: true },
        { text: 'Unlimited access to Perplexity Research', included: true },
        { text: 'Use advanced AI models like OpenAI o3-pro and Anthropic Claude Opus 4.1', included: true },
        { text: 'Enhanced access to video generation', included: true },
        { text: 'Priority support', included: true },
      ],
      buttonText: 'Get Max',
      buttonClass: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
      disclaimer: 'For personal use only, and subject to our policies',
    },
  ];

  const closeModal = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeModal}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-auto bg-gray-900 rounded-lg shadow-2xl border border-gray-700/50">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors z-10"
          aria-label="Close pricing modal"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-gray-100 mb-6">
              Select your plan
            </h1>
            
            {/* Plan Toggle */}
            <div className="inline-flex bg-gray-800/20 rounded-lg p-0.5 border border-gray-700/40">
              <button
                onClick={() => setSelectedPlan('personal')}
                className={`px-6 py-2 rounded-md text-sm font-light transition-all ${
                  selectedPlan === 'personal'
                    ? 'bg-gray-800 text-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Personal
              </button>
              <button
                onClick={() => setSelectedPlan('business')}
                className={`px-6 py-2 rounded-md text-sm font-light transition-all ${
                  selectedPlan === 'business'
                    ? 'bg-gray-800 text-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                Business
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-px bg-gray-700/50 rounded-lg overflow-hidden">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-gray-900 p-8 relative"
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-6 right-6">
                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs bg-cyan-900/30 text-cyan-400 border border-cyan-800/30">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Popular
                    </span>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h2 className="text-xl font-medium text-gray-100 mb-4">
                    {plan.name}
                  </h2>
                  
                  <div className="flex items-baseline mb-2">
                    <span className="text-3xl font-medium text-gray-100">
                      ${plan.price}.00
                    </span>
                    <span className="text-sm text-gray-400 ml-2">/ month</span>
                  </div>
                  
                  {plan.yearlyPrice && (
                    <p className="text-sm text-gray-400">
                      ${plan.yearlyPrice} when billed annually
                    </p>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                  {plan.description}
                </p>

                {/* CTA Button */}
                <button
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${plan.buttonClass}`}
                  onClick={() => console.log(`Subscribe to ${plan.name}`)}
                >
                  {plan.buttonText}
                </button>

                {/* Features List */}
                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mt-0.5 mr-3 flex-shrink-0">
                        {feature.included ? (
                          feature.highlight ? (
                            <Zap className="w-4 h-4 text-yellow-400" />
                          ) : (
                            <Check className="w-4 h-4 text-cyan-400" />
                          )
                        ) : (
                          <X className="w-4 h-4 text-gray-600" />
                        )}
                      </span>
                      <span className="text-sm text-gray-400 leading-relaxed">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Disclaimer */}
                {plan.disclaimer && (
                  <p className="mt-8 text-xs text-gray-500">
                    {plan.disclaimer.includes('billing help') ? (
                      <>
                        Existing subscriber? See{' '}
                        <a href="#" className="underline hover:text-gray-400">
                          billing help
                        </a>
                      </>
                    ) : plan.disclaimer.includes('policies') ? (
                      <>
                        For personal use only, and subject to our{' '}
                        <a href="#" className="underline hover:text-gray-400">
                          policies
                        </a>
                      </>
                    ) : (
                      plan.disclaimer
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;