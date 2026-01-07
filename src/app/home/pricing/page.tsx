"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { useTheme } from "@/contexts/ThemeContext";

type PlanType = "free_user" | "surbee_pro" | "surbee_max" | "surbee_enterprise";

// Plan icon URLs from ImageKit
const PLAN_ICONS: Record<string, string> = {
  free_user: 'https://ik.imagekit.io/on0moldgr/composition.svg',
  surbee_pro: 'https://ik.imagekit.io/on0moldgr/composition%20(1).svg',
  surbee_max: 'https://ik.imagekit.io/on0moldgr/composition%20(2).svg',
};

// Cancel/Downgrade Modal with retention offer
function CancelModal({
  isOpen,
  onClose,
  onConfirmCancel,
  onAcceptOffer
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
  onAcceptOffer: () => void;
}) {
  const [step, setStep] = useState<'initial' | 'offer' | 'confirming'>('initial');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl p-8"
        style={{ backgroundColor: 'var(--surbee-bg-secondary)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'initial' && (
          <>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: 'var(--surbee-fg-primary)' }}
            >
              We're sad to see you go
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--surbee-fg-secondary)' }}
            >
              Before you cancel, we'd love to understand what we could do better. Your feedback helps us improve Surbee for everyone.
            </p>

            <div className="flex flex-col gap-3 mb-6">
              {['Too expensive', 'Missing features I need', 'Found a better alternative', 'Not using it enough', 'Other'].map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: 'var(--surbee-bg-tertiary)',
                    border: '1px solid transparent'
                  }}
                >
                  <input type="radio" name="cancel-reason" className="accent-blue-500" />
                  <span className="text-sm" style={{ color: 'var(--surbee-fg-primary)' }}>
                    {reason}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--surbee-bg-tertiary)',
                  color: 'var(--surbee-fg-primary)'
                }}
              >
                Keep my plan
              </button>
              <button
                onClick={() => setStep('offer')}
                className="flex-1 h-10 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444'
                }}
              >
                Continue canceling
              </button>
            </div>
          </>
        )}

        {step === 'offer' && (
          <>
            <div
              className="text-center mb-6 p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
            >
              <div className="text-3xl mb-2">🎁</div>
              <h2
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--surbee-fg-primary)' }}
              >
                Wait! Here's a special offer
              </h2>
              <p
                className="text-2xl font-bold mb-1"
                style={{ color: '#3b82f6' }}
              >
                40% OFF
              </p>
              <p
                className="text-sm"
                style={{ color: 'var(--surbee-fg-secondary)' }}
              >
                Stay with us for one more month at a discounted rate
              </p>
            </div>

            <p
              className="text-sm text-center mb-6"
              style={{ color: 'var(--surbee-fg-muted)' }}
            >
              This offer is only available right now. Your discount will be applied to your next billing cycle.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onAcceptOffer();
                  onClose();
                }}
                className="w-full h-11 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff'
                }}
              >
                Accept 40% discount
              </button>
              <button
                onClick={() => setStep('confirming')}
                className="w-full h-10 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--surbee-fg-muted)'
                }}
              >
                No thanks, cancel anyway
              </button>
            </div>
          </>
        )}

        {step === 'confirming' && (
          <>
            <h2
              className="text-xl font-semibold mb-3"
              style={{ color: 'var(--surbee-fg-primary)' }}
            >
              Confirm cancellation
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--surbee-fg-secondary)' }}
            >
              Your subscription will remain active until the end of your current billing period. After that, you'll be moved to the Free plan.
            </p>

            <div
              className="p-4 rounded-xl mb-6"
              style={{ backgroundColor: 'var(--surbee-bg-tertiary)' }}
            >
              <p className="text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
                You'll lose access to:
              </p>
              <ul className="mt-2 space-y-1">
                {['Advanced AI models', 'Agent Mode', 'Priority support', 'Custom branding'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm" style={{ color: 'var(--surbee-fg-secondary)' }}>
                    <span style={{ color: '#ef4444' }}>✕</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 h-10 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff'
                }}
              >
                Keep my plan
              </button>
              <button
                onClick={() => {
                  onConfirmCancel();
                  onClose();
                }}
                className="flex-1 h-10 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444'
                }}
              >
                Cancel subscription
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { credits } = useCredits();
  const [isAnnual, setIsAnnual] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlan = credits?.plan || "free_user";

  const handleClose = () => {
    router.back();
  };

  const getButtonText = (plan: PlanType): string => {
    if (currentPlan === plan) return "Current plan";

    const planOrder: Record<PlanType, number> = { free_user: 0, surbee_pro: 1, surbee_max: 2, surbee_enterprise: 3 };

    if (planOrder[plan] > planOrder[currentPlan as PlanType]) {
      if (plan === "surbee_enterprise") return "Contact Sales";
      return plan === "surbee_pro" ? "Upgrade to Pro" : "Upgrade to Max";
    } else {
      const displayName = plan.replace('surbee_', '').replace('free_user', 'Free');
      return `Downgrade to ${displayName.charAt(0).toUpperCase() + displayName.slice(1)}`;
    }
  };

  const isCurrentPlan = (plan: PlanType): boolean => currentPlan === plan;

  const handleUpgrade = async (plan: PlanType) => {
    // Redirect to Clerk's billing portal for the specific plan
    // Clerk handles the checkout flow automatically
    window.location.href = `/billing?plan=${plan}`;
  };

  const handleDowngrade = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    // Redirect to Clerk's billing portal to manage/cancel subscription
    window.location.href = '/billing';
  };

  const handleAcceptOffer = async () => {
    // For retention offers, we can track this and handle via Clerk's billing portal
    // The 40% discount would be configured as a coupon in Clerk
    setShowCancelModal(false);
    window.location.href = '/billing?offer=retention';
  };

  const handlePlanClick = (plan: PlanType) => {
    if (isCurrentPlan(plan)) return;

    if (plan === "surbee_enterprise") {
      router.push("/contact-sales");
    } else if (plan === "free_user") {
      handleDowngrade();
    } else {
      handleUpgrade(plan);
    }
  };

  return (
    <div
      className="flex flex-col w-full h-full overflow-auto items-center justify-center"
      style={{
        backgroundColor: "var(--surbee-bg-primary)",
        padding: "32px 24px",
        minHeight: "100vh",
      }}
    >
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 z-10 flex justify-center items-center transition-all duration-200 cursor-pointer rounded-full w-9 h-9"
        style={{
          backgroundColor: "var(--surbee-bg-tertiary)",
          color: "var(--surbee-fg-primary)",
        }}
        aria-label="Close"
        title="Close"
      >
        <svg
          height="20"
          width="20"
          fill="none"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.499 23.624A1.1 1.1 0 0 1 8.4 22.512c0-.295.108-.576.322-.777l5.71-5.723-5.71-5.71a1.07 1.07 0 0 1-.322-.777c0-.63.483-1.098 1.099-1.098.308 0 .549.107.763.308l5.737 5.724 5.763-5.737c.228-.228.469-.322.763-.322.616 0 1.112.483 1.112 1.099 0 .308-.094.549-.335.79l-5.723 5.723 5.71 5.71c.227.2.335.482.335.79 0 .616-.496 1.112-1.125 1.112a1.06 1.06 0 0 1-.79-.322l-5.71-5.723-5.697 5.723a1.1 1.1 0 0 1-.803.322"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Content */}
      <div className="flex flex-col items-center gap-8 mx-auto w-full">
        {/* Header */}
        <h2
          className="text-pretty leading-[1.2] text-3xl md:text-4xl text-center"
          style={{
            color: "var(--surbee-fg-primary)",
            fontFamily: "Kalice-Trial-Regular, sans-serif",
          }}
        >
          Build smarter surveys, unlock deeper insights
        </h2>

        {/* Plan Toggle */}
        <div className="flex items-center gap-3">
          <p className="text-sm" style={{ color: "var(--surbee-fg-secondary)" }}>
            Save <strong style={{ color: "var(--surbee-fg-primary)" }}>17%</strong> with annual billing
          </p>
          <button
            className="relative w-8 h-5 rounded-full transition-colors duration-200"
            style={{
              backgroundColor: isAnnual ? "#0285ff" : "rgba(232, 232, 232, 0.2)",
            }}
            type="button"
            role="switch"
            aria-checked={isAnnual}
            onClick={() => setIsAnnual(!isAnnual)}
          >
            <div
              className="absolute w-4 h-4 bg-white rounded-full top-0.5 transition-all duration-200"
              style={{ left: isAnnual ? "14px" : "2px" }}
            />
          </button>
        </div>

        {/* Pricing Tiers */}
        <div className="grid gap-5 justify-center grid-cols-1 md:grid-cols-3">
          {/* Free Tier */}
          <PricingTier
            name="Free"
            price="$0"
            credits="100 credits/month"
            buttonText={getButtonText("free_user")}
            isCurrentPlan={isCurrentPlan("free_user")}
            tierStyle="default"
            iconUrl={PLAN_ICONS.free_user}
            features={[
              "Survey generation (all complexities)",
              "Unlimited survey responses",
              "Chat with Claude Haiku",
              "Cipher fraud detection (2/month)",
              "CSV export",
              "Email support",
            ]}
            onButtonClick={() => handlePlanClick("free_user")}
            disabled={isCurrentPlan("free_user") || isProcessing}
          />

          {/* Pro Tier */}
          <PricingTier
            name="Pro"
            price={isAnnual ? "$16.67/mo" : "$20/mo"}
            originalPrice={isAnnual ? "$20/mo" : undefined}
            credits="2,000 credits/month"
            buttonText={getButtonText("surbee_pro")}
            isCurrentPlan={isCurrentPlan("surbee_pro")}
            tierStyle="highlighted"
            iconUrl={PLAN_ICONS.surbee_pro}
            features={[
              "All AI models (GPT-5, Lema, Claude)",
              "Agent Mode for workflows",
              "Evaluation tools",
              "Cipher Basic analysis",
              "Remove Surbee branding",
              "All export formats",
              "Priority support",
            ]}
            onButtonClick={() => handlePlanClick("surbee_pro")}
            disabled={isCurrentPlan("surbee_pro") || isProcessing}
          />

          {/* Max Tier */}
          <PricingTier
            name="Max"
            price={isAnnual ? "$50/mo" : "$60/mo"}
            originalPrice={isAnnual ? "$60/mo" : undefined}
            credits="6,000 credits/month"
            buttonText={getButtonText("surbee_max")}
            isCurrentPlan={isCurrentPlan("surbee_max")}
            tierStyle="glow"
            iconUrl={PLAN_ICONS.surbee_max}
            features={[
              "Everything in Pro",
              "Full Cipher + real-time monitoring",
              "Custom domain support",
              "Higher rate limits (3x Pro)",
              "Advanced analytics",
              "Dedicated support",
            ]}
            onButtonClick={() => handlePlanClick("surbee_max")}
            disabled={isCurrentPlan("surbee_max") || isProcessing}
          />

        </div>

        {/* Enterprise CTA */}
        <p className="text-center text-sm mt-6" style={{ color: "var(--surbee-fg-muted)" }}>
          Need more? <a href="/contact-sales" className="underline hover:opacity-80" style={{ color: "var(--surbee-fg-secondary)" }}>Contact us for Enterprise pricing</a>
        </p>
      </div>

      {/* Cancel Modal */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirmCancel={handleConfirmCancel}
        onAcceptOffer={handleAcceptOffer}
      />
    </div>
  );
}

interface PricingTierProps {
  name: string;
  price: string;
  originalPrice?: string;
  credits: string;
  description?: string;
  buttonText: string;
  isCurrentPlan: boolean;
  tierStyle: "default" | "highlighted" | "glow";
  features: string[];
  onButtonClick: () => void;
  disabled?: boolean;
  iconUrl?: string;
}

function PricingTier({
  name,
  price,
  originalPrice,
  credits,
  description,
  buttonText,
  isCurrentPlan,
  tierStyle,
  features,
  onButtonClick,
  disabled,
  iconUrl,
}: PricingTierProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Icon filter: off-white for dark mode, off-black for light mode
  const iconFilter = isDark
    ? 'brightness(0) invert(0.9)'
    : 'brightness(0) invert(0.15)';

  const getCardStyle = () => {
    const base: React.CSSProperties = {
      backgroundColor: "var(--surbee-card-bg)",
    };

    if (tierStyle === "highlighted") {
      base.backgroundColor = "var(--surbee-bg-tertiary)";
      base.border = "1px solid var(--surbee-border-accent)";
    } else if (tierStyle === "glow") {
      base.backgroundColor = "var(--surbee-bg-tertiary)";
      base.boxShadow = "0 0 40px rgba(59, 130, 246, 0.15), 0 0 80px rgba(59, 130, 246, 0.1)";
      base.border = "1px solid rgba(59, 130, 246, 0.3)";
    }

    return base;
  };

  const getButtonStyle = (): React.CSSProperties => {
    if (disabled) {
      return {
        backgroundColor: "var(--surbee-bg-tertiary)",
        color: "var(--surbee-fg-muted)",
        cursor: "default",
        opacity: 0.7,
      };
    }

    if (tierStyle === "highlighted") {
      return {
        backgroundColor: isHovered ? "#0070e0" : "#0285ff",
        color: "#ffffff",
        cursor: "pointer",
      };
    }

    if (tierStyle === "glow") {
      return {
        backgroundColor: isHovered ? "#2563eb" : "#3b82f6",
        color: "#ffffff",
        cursor: "pointer",
      };
    }

    return {
      backgroundColor: isHovered ? "#1a1a1a" : "#000000",
      color: "#ffffff",
      cursor: "pointer",
    };
  };

  return (
    <div
      className="relative flex flex-col rounded-2xl p-6 w-full max-w-[320px] h-full"
      style={getCardStyle()}
    >
      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div
          className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "var(--surbee-bg-primary)",
            color: "var(--surbee-fg-muted)",
            border: "1px solid var(--surbee-border-secondary)",
          }}
        >
          Current plan
        </div>
      )}

      {/* Recommended Badge for Pro */}
      {tierStyle === "highlighted" && !isCurrentPlan && (
        <div
          className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "#0285ff",
            color: "#ffffff",
          }}
        >
          Recommended
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col gap-3 mb-5">
        {iconUrl && (
          <img
            src={iconUrl}
            alt={`${name} plan icon`}
            style={{ width: 40, height: 40, filter: iconFilter }}
          />
        )}
        <h6
          className="font-semibold text-base"
          style={{ color: "var(--surbee-fg-primary)" }}
        >
          {name}
        </h6>
        <div className="flex items-baseline gap-2">
          <h6
            className="font-bold text-2xl"
            style={{ color: "var(--surbee-fg-primary)" }}
          >
            {price}
          </h6>
          {originalPrice && (
            <span
              className="text-sm line-through"
              style={{ color: "var(--surbee-fg-muted)" }}
            >
              {originalPrice}
            </span>
          )}
        </div>
        <p className="text-sm font-medium" style={{ color: "var(--surbee-fg-secondary)" }}>
          {credits}
        </p>
        {description && (
          <p className="text-sm" style={{ color: "var(--surbee-fg-muted)" }}>
            {description}
          </p>
        )}
      </div>

      {/* Features List - grows to fill space */}
      <div className="flex-1 mb-5">
        <FeatureList features={features} />
      </div>

      {/* Button - always at bottom */}
      <button
        onClick={onButtonClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex justify-center items-center h-11 text-sm whitespace-nowrap transition-all duration-200 rounded-full font-medium px-6 py-3 w-full"
        style={getButtonStyle()}
      >
        {buttonText}
      </button>
    </div>
  );
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-2.5">
          <svg
            height="16"
            width="16"
            className="flex-shrink-0 mt-0.5"
            style={{ color: "var(--surbee-fg-secondary)" }}
            fill="none"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.233 11.725c.221 0 .409-.107.543-.314l4.203-5.958c.074-.134.16-.281.16-.429 0-.301-.267-.495-.549-.495-.167 0-.334.107-.462.301l-3.922 5.603-1.89-2.28c-.16-.213-.308-.267-.496-.267a.519.519 0 0 0-.515.529c0 .147.06.288.154.415l2.205 2.58c.167.222.348.315.57.315Z"
              fill="currentColor"
            />
          </svg>
          <p
            className="text-[13px] leading-relaxed"
            style={{ color: "var(--surbee-fg-secondary)" }}
          >
            {feature}
          </p>
        </li>
      ))}
    </ul>
  );
}
