"use client";

import React from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Plan icon URLs from ImageKit
const PLAN_ICONS = {
  free: 'https://ik.imagekit.io/on0moldgr/composition.svg',
  pro: 'https://ik.imagekit.io/on0moldgr/composition%20(1).svg',
  max: 'https://ik.imagekit.io/on0moldgr/composition%20(2).svg',
  enterprise: 'https://ik.imagekit.io/on0moldgr/composition%20(2).svg',
};

interface PricingFeature {
  text: string;
  included: boolean;
  highlight?: boolean;
}

interface PricingTier {
  name: string;
  description: string;
  price: string;
  period?: string;
  credits: string;
  apiCredits?: string;
  features: PricingFeature[];
  cta: string;
  popular?: boolean;
  iconUrl?: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    description: "Get started with Surbee",
    price: "$0",
    credits: "100 credits/month",
    iconUrl: PLAN_ICONS.free,
    features: [
      { text: "Survey generation (all complexities)", included: true },
      { text: "Unlimited survey responses", included: true },
      { text: "Chat with Claude Haiku", included: true },
      { text: "Cipher fraud detection (2/month)", included: true, highlight: true },
      { text: "CSV export only", included: true },
      { text: "Premium AI models", included: false },
      { text: "Agent Mode", included: false },
      { text: "Evaluation tools", included: false },
      { text: "Remove Surbee branding", included: false },
    ],
    cta: "Start Free",
  },
  {
    name: "Pro",
    description: "For professionals",
    price: "$20",
    period: "/mo",
    credits: "2,000 credits/month",
    apiCredits: "$5 API credits included",
    popular: true,
    iconUrl: PLAN_ICONS.pro,
    features: [
      { text: "Everything in Free", included: true },
      { text: "All AI models (GPT-5, Lema, etc.)", included: true, highlight: true },
      { text: "Agent Mode", included: true, highlight: true },
      { text: "Evaluation tools", included: true, highlight: true },
      { text: "Cipher Basic analysis", included: true },
      { text: "Remove Surbee branding", included: true },
      { text: "All export formats", included: true },
      { text: "Priority support", included: true },
      { text: "Custom domain", included: false },
    ],
    cta: "Upgrade to Pro",
  },
  {
    name: "Max",
    description: "For power users",
    price: "$60",
    period: "/mo",
    credits: "6,000 credits/month",
    apiCredits: "$10 API credits included",
    iconUrl: PLAN_ICONS.max,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Full Cipher with real-time monitoring", included: true, highlight: true },
      { text: "Custom domain support", included: true, highlight: true },
      { text: "Higher rate limits", included: true },
      { text: "Dedicated support", included: true },
      { text: "Advanced analytics", included: true },
    ],
    cta: "Upgrade to Max",
  },
  {
    name: "Enterprise",
    description: "For teams & API access",
    price: "Custom",
    credits: "Unlimited credits",
    apiCredits: "Custom API volume pricing",
    iconUrl: PLAN_ICONS.enterprise,
    features: [
      { text: "Everything in Max", included: true },
      { text: "Unlimited credits", included: true, highlight: true },
      { text: "Full Cipher API access", included: true, highlight: true },
      { text: "Custom integrations", included: true },
      { text: "SSO & team management", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "SLA guarantee", included: true },
    ],
    cta: "Contact Sales",
  },
];

export function PricingCards() {
  const router = useRouter();

  const handleCtaClick = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case "free":
        router.push("/login");
        break;
      case "pro":
        router.push("/billing?plan=surbee_pro");
        break;
      case "max":
        router.push("/billing?plan=surbee_max");
        break;
      case "enterprise":
        router.push("/contact-sales");
        break;
      default:
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
      {pricingTiers.map((tier) => (
        <div
          key={tier.name}
          className={cn(
            "rounded-xl p-6 border transition-all duration-300 flex flex-col",
            tier.popular
              ? "bg-black text-white border-black scale-[1.02] shadow-xl"
              : "bg-neutral-100 border-neutral-200 hover:bg-neutral-50"
          )}
        >
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1">
              {tier.iconUrl && (
                <img
                  src={tier.iconUrl}
                  alt={`${tier.name} plan icon`}
                  className="w-5 h-5"
                  style={{
                    filter: tier.popular
                      ? 'brightness(0) invert(1)'
                      : 'brightness(0) invert(0.3)'
                  }}
                />
              )}
              <h3
                className={cn(
                  "text-xl font-semibold",
                  tier.popular ? "text-white" : "text-black"
                )}
              >
                {tier.name}
              </h3>
              {tier.popular && (
                <span className="ml-auto text-xs font-medium bg-orange-500 text-white px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
            </div>
            <p
              className={cn(
                "text-sm",
                tier.popular ? "text-neutral-300" : "text-neutral-500"
              )}
            >
              {tier.description}
            </p>
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-baseline gap-1">
              <span
                className={cn(
                  "text-3xl font-bold",
                  tier.popular ? "text-white" : "text-black"
                )}
              >
                {tier.price}
              </span>
              {tier.period && (
                <span
                  className={cn(
                    "text-lg",
                    tier.popular ? "text-neutral-400" : "text-neutral-500"
                  )}
                >
                  {tier.period}
                </span>
              )}
            </div>
            <p
              className={cn(
                "text-sm mt-1 font-medium",
                tier.popular ? "text-neutral-300" : "text-neutral-600"
              )}
            >
              {tier.credits}
            </p>
            {tier.apiCredits && (
              <p
                className={cn(
                  "text-xs mt-0.5",
                  tier.popular ? "text-neutral-400" : "text-neutral-500"
                )}
              >
                {tier.apiCredits}
              </p>
            )}
          </div>

          {/* Features */}
          <div className="flex-grow space-y-2.5 mb-6">
            {tier.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2.5">
                {feature.included ? (
                  <Check
                    className={cn(
                      "w-4 h-4 flex-shrink-0 mt-0.5",
                      tier.popular ? "text-green-400" : "text-green-600"
                    )}
                  />
                ) : (
                  <X
                    className={cn(
                      "w-4 h-4 flex-shrink-0 mt-0.5",
                      tier.popular ? "text-neutral-500" : "text-neutral-400"
                    )}
                  />
                )}
                <span
                  className={cn(
                    "text-sm",
                    feature.included
                      ? tier.popular
                        ? feature.highlight
                          ? "text-white font-medium"
                          : "text-neutral-200"
                        : feature.highlight
                        ? "text-black font-medium"
                        : "text-neutral-600"
                      : tier.popular
                      ? "text-neutral-500 line-through"
                      : "text-neutral-400 line-through"
                  )}
                >
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => handleCtaClick(tier.name)}
            className={cn(
              "w-full py-3 px-6 font-medium rounded-full transition-colors",
              tier.popular
                ? "bg-white text-black hover:bg-neutral-100"
                : "bg-black text-white hover:bg-neutral-800"
            )}
          >
            {tier.cta}
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * Compact pricing cards for embedded use (e.g., upgrade prompts)
 */
export function CompactPricingCards({ currentPlan = "free" }: { currentPlan?: string }) {
  const router = useRouter();
  const upgradeTiers = pricingTiers.filter(
    (tier) => tier.name.toLowerCase() !== currentPlan.toLowerCase() && tier.name !== "Free"
  );

  const handleCtaClick = (tierName: string) => {
    switch (tierName.toLowerCase()) {
      case "pro":
        router.push("/billing?plan=surbee_pro");
        break;
      case "max":
        router.push("/billing?plan=surbee_max");
        break;
      case "enterprise":
        router.push("/contact-sales");
        break;
      default:
        break;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {upgradeTiers.map((tier) => (
        <div
          key={tier.name}
          className={cn(
            "rounded-lg p-4 border",
            tier.popular
              ? "bg-black text-white border-black"
              : "bg-white border-neutral-200"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {tier.iconUrl && (
                <img
                  src={tier.iconUrl}
                  alt={`${tier.name} plan icon`}
                  className="w-4 h-4"
                  style={{
                    filter: tier.popular
                      ? 'brightness(0) invert(1)'
                      : 'brightness(0) invert(0.3)'
                  }}
                />
              )}
              <h4
                className={cn(
                  "font-semibold",
                  tier.popular ? "text-white" : "text-black"
                )}
              >
                {tier.name}
              </h4>
            </div>
            {tier.popular && (
              <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">
                Popular
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span
              className={cn(
                "text-2xl font-bold",
                tier.popular ? "text-white" : "text-black"
              )}
            >
              {tier.price}
            </span>
            {tier.period && (
              <span
                className={cn(
                  "text-sm",
                  tier.popular ? "text-neutral-400" : "text-neutral-500"
                )}
              >
                {tier.period}
              </span>
            )}
          </div>
          <p
            className={cn(
              "text-sm mb-3",
              tier.popular ? "text-neutral-300" : "text-neutral-600"
            )}
          >
            {tier.credits}
          </p>
          <button
            onClick={() => handleCtaClick(tier.name)}
            className={cn(
              "w-full py-2 px-4 text-sm font-medium rounded-full transition-colors",
              tier.popular
                ? "bg-white text-black hover:bg-neutral-100"
                : "bg-black text-white hover:bg-neutral-800"
            )}
          >
            {tier.cta}
          </button>
        </div>
      ))}
    </div>
  );
}

export default PricingCards;
