"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { PADDLE_CONFIG, getPaddlePriceId } from "@/lib/paddle";

type PlanType = "free_user" | "surbee_pro" | "surbee_max" | "surbee_enterprise";
type BillingCycle = "monthly" | "annual";

const PLAN_DETAILS: Record<PlanType, {
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  credits: string;
  features: string[];
  paddlePlan?: 'pro' | 'max';
}> = {
  free_user: {
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    credits: "100 credits/month",
    features: ["Survey generation", "Unlimited responses", "Chat with Claude Haiku", "CSV export"],
  },
  surbee_pro: {
    name: "Pro",
    priceMonthly: 20,
    priceAnnual: 200,
    credits: "2,000 credits/month",
    features: [
      "All premium AI models (GPT-5, Claude, etc.)",
      "Agent Mode for automated workflows",
      "Evaluation & analysis tools",
      "Remove Surbee branding",
    ],
    paddlePlan: 'pro',
  },
  surbee_max: {
    name: "Max",
    priceMonthly: 60,
    priceAnnual: 600,
    credits: "6,000 credits/month",
    features: [
      "Everything in Pro",
      "Full Cipher fraud detection",
      "Custom domain support",
      "3x higher rate limits",
    ],
    paddlePlan: 'max',
  },
  surbee_enterprise: {
    name: "Enterprise",
    priceMonthly: -1,
    priceAnnual: -1,
    credits: "Unlimited credits",
    features: ["Everything in Max", "SSO", "Custom integrations", "SLA guarantee"],
  },
};

// Loading shimmer component
function LoadingShimmer() {
  const [loadingText, setLoadingText] = useState(0);
  const loadingMessages = [
    "Getting your plan ready",
    "Preparing checkout",
    "Almost there",
  ];
  const subMessages = [
    "Setting up your premium features",
    "Configuring your account",
    "Finalizing details",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--surbee-bg-primary)" }}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="relative">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-500" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-base font-medium animate-pulse"
            style={{ color: "var(--surbee-fg-primary)" }}
          >
            {loadingMessages[loadingText]}
          </span>
          <span
            className="text-sm transition-opacity duration-300"
            style={{ color: "var(--surbee-fg-muted)" }}
          >
            {subMessages[loadingText]}
          </span>
        </div>
      </div>
    </div>
  );
}

// Feature icon component
function FeatureIcon({ index }: { index: number }) {
  const icons = [
    // Sparkle/AI icon
    <svg key="ai" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" fill="currentColor"/>
    </svg>,
    // Zap/Speed icon
    <svg key="zap" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" fill="currentColor"/>
    </svg>,
    // Chart/Analytics icon
    <svg key="chart" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 16L12 11L15 14L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
    // Shield/Security icon
    <svg key="shield" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" fill="currentColor"/>
    </svg>,
  ];
  return <span style={{ color: "#8F8DF6" }}>{icons[index % icons.length]}</span>;
}

function BillingContent() {
  const { user, loading } = useAuth();
  const { credits } = useCredits();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") as PlanType | null;
  const cancelled = searchParams.get("cancelled") === "true";
  const success = searchParams.get("success") === "true";

  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [paddleLoading, setPaddleLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    cancelled ? "Payment was cancelled. You can try again when ready." : null
  );

  // Initialize Paddle
  useEffect(() => {
    if (typeof window === 'undefined') return;

    console.log('Initializing Paddle with:', {
      environment: PADDLE_CONFIG.environment,
      token: PADDLE_CONFIG.clientToken ? `${PADDLE_CONFIG.clientToken.substring(0, 10)}...` : 'missing',
    });

    initializePaddle({
      environment: PADDLE_CONFIG.environment,
      token: PADDLE_CONFIG.clientToken,
      eventCallback: (event) => {
        console.log('Paddle event:', event.name, event);
        if (event.name === 'checkout.completed') {
          router.push("/home?upgraded=true");
        } else if (event.name === 'checkout.closed') {
          setIsProcessing(false);
        } else if (event.name === 'checkout.error') {
          console.error('Paddle checkout error:', event);
          setError('Checkout error. Please check the console for details.');
          setIsProcessing(false);
        }
      },
    }).then((paddleInstance) => {
      if (paddleInstance) {
        console.log('Paddle initialized successfully');
        setPaddle(paddleInstance);
      } else {
        console.error('Paddle instance is null');
      }
      setPaddleLoading(false);
    }).catch((err) => {
      console.error('Failed to initialize Paddle:', err);
      setError(`Failed to initialize payment system: ${err.message || 'Unknown error'}`);
      setPaddleLoading(false);
    });
  }, [router]);

  // Handle success redirect
  useEffect(() => {
    if (success) {
      router.push("/home?upgraded=true");
    }
  }, [success, router]);

  const currentPlan = (credits?.plan || "free_user") as PlanType;
  const planToShow = selectedPlan || currentPlan;
  const planDetails = PLAN_DETAILS[planToShow];

  const handleCheckout = useCallback(async () => {
    if (!paddle) {
      setError("Payment system not initialized. Please refresh the page.");
      return;
    }
    if (!user) {
      setError("Please log in to continue.");
      return;
    }
    if (!selectedPlan) {
      setError("No plan selected.");
      return;
    }

    const paddlePlan = planDetails.paddlePlan;
    if (!paddlePlan) {
      setError("This plan cannot be purchased online. Please contact sales.");
      return;
    }

    const priceId = getPaddlePriceId(paddlePlan, billingCycle);
    if (!priceId) {
      setError("Invalid plan configuration.");
      return;
    }

    console.log('Opening Paddle checkout:', { priceId, email: user.email, userId: user.id, plan: selectedPlan });

    setError(null);
    setIsProcessing(true);

    try {
      console.log('Opening checkout with priceId:', priceId);

      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: user.email ? { email: user.email } : undefined,
        customData: {
          userId: user.id,
          plan: selectedPlan,
        },
        settings: {
          displayMode: "overlay",
          theme: "light",
          locale: "en",
        },
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Checkout error:', err);
      setError(`Failed to open checkout: ${errorMessage}`);
      setIsProcessing(false);
    }
  }, [paddle, user, selectedPlan, planDetails, billingCycle]);

  // Show loading shimmer while Paddle is initializing
  if (loading || (paddleLoading && selectedPlan)) {
    return <LoadingShimmer />;
  }

  if (!user) {
    router.push("/login?redirect=/billing");
    return null;
  }

  const isUpgrade = selectedPlan && selectedPlan !== "free_user" && selectedPlan !== currentPlan;
  const basePrice = billingCycle === "annual" ? planDetails.priceAnnual : planDetails.priceMonthly;
  const taxRate = 0.05; // 5% VAT example
  const taxAmount = basePrice * taxRate;
  const totalPrice = basePrice + taxAmount;
  const monthlyEquivalent = billingCycle === "annual"
    ? (planDetails.priceAnnual / 12).toFixed(2)
    : planDetails.priceMonthly.toFixed(2);

  return (
    <div className="flex min-h-screen items-center justify-center p-6" style={{ backgroundColor: "var(--surbee-bg-primary)" }}>
      {/* Close Button */}
      <button
        onClick={() => router.push("/home")}
        className="absolute top-6 right-6 z-10 flex justify-center items-center transition-all duration-200 cursor-pointer rounded-full w-9 h-9 hover:opacity-80"
        style={{ backgroundColor: "var(--surbee-bg-tertiary)", color: "var(--surbee-fg-primary)" }}
        aria-label="Close"
      >
        <svg height="20" width="20" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.499 23.624A1.1 1.1 0 0 1 8.4 22.512c0-.295.108-.576.322-.777l5.71-5.723-5.71-5.71a1.07 1.07 0 0 1-.322-.777c0-.63.483-1.098 1.099-1.098.308 0 .549.107.763.308l5.737 5.724 5.763-5.737c.228-.228.469-.322.763-.322.616 0 1.112.483 1.112 1.099 0 .308-.094.549-.335.79l-5.723 5.723 5.71 5.71c.227.2.335.482.335.79 0 .616-.496 1.112-1.125 1.112a1.06 1.06 0 0 1-.79-.322l-5.71-5.723-5.697 5.723a1.1 1.1 0 0 1-.803.322" fill="currentColor" />
        </svg>
      </button>

      {isUpgrade ? (
        <div className="flex max-w-[calc(100vw-48px)] flex-col gap-6 sm:max-w-[360px] md:max-w-[432px]">
          {/* Main Card */}
          <div
            className="rounded-3xl border p-8 shadow-lg"
            style={{
              backgroundColor: "var(--surbee-bg-secondary)",
              borderColor: "var(--surbee-border-primary)",
            }}
          >
            {/* Plan Name */}
            <h2
              className="mb-3 text-[28px] leading-tight font-semibold"
              style={{ color: "var(--surbee-fg-primary)" }}
            >
              {planDetails.name} plan
            </h2>

            {/* Billing Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  billingCycle === "monthly"
                    ? "bg-black text-white"
                    : ""
                }`}
                style={billingCycle !== "monthly" ? { color: "var(--surbee-fg-muted)", backgroundColor: "var(--surbee-bg-tertiary)" } : {}}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  billingCycle === "annual"
                    ? "bg-black text-white"
                    : ""
                }`}
                style={billingCycle !== "annual" ? { color: "var(--surbee-fg-muted)", backgroundColor: "var(--surbee-bg-tertiary)" } : {}}
              >
                Annual
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-600">
                  -17%
                </span>
              </button>
            </div>

            {/* Top Features */}
            <h4
              className="text-sm py-2 font-medium"
              style={{ color: "var(--surbee-fg-secondary)" }}
            >
              Top features
            </h4>

            <ul className="mb-4 flex flex-col">
              {planDetails.features.map((feature, index) => (
                <li key={index} className="relative py-2.5">
                  <div className="flex items-center gap-3.5">
                    <FeatureIcon index={index} />
                    <span
                      className="text-[15px] font-normal"
                      style={{ color: "var(--surbee-fg-primary)" }}
                    >
                      {feature}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* Divider */}
            <div className="w-full py-3">
              <div className="h-px w-full" style={{ backgroundColor: "var(--surbee-border-primary)" }} />
            </div>

            {/* Pricing Breakdown */}
            <div className="w-full pt-3 pb-5">
              <div className="flex flex-col gap-2">
                {/* Subscription line */}
                <div className="flex w-full text-[14px]">
                  <span style={{ color: "var(--surbee-fg-secondary)" }}>
                    {billingCycle === "annual" ? "Annual" : "Monthly"} subscription
                  </span>
                  <span
                    className="ml-auto"
                    style={{ color: "var(--surbee-fg-secondary)" }}
                  >
                    ${basePrice.toFixed(2)}
                  </span>
                </div>
                {billingCycle === "annual" && (
                  <div className="flex w-full text-[12px]">
                    <span style={{ color: "var(--surbee-fg-muted)" }}>
                      (${monthlyEquivalent}/month)
                    </span>
                  </div>
                )}

                {/* Tax line */}
                <div className="flex w-full text-[14px]">
                  <span style={{ color: "var(--surbee-fg-secondary)" }}>
                    Estimated tax
                  </span>
                  <span
                    className="ml-auto"
                    style={{ color: "var(--surbee-fg-secondary)" }}
                  >
                    ${taxAmount.toFixed(2)}
                  </span>
                </div>

                {/* Total line */}
                <div className="flex w-full text-base mt-2 pt-2" style={{ borderTop: "1px solid var(--surbee-border-primary)" }}>
                  <span
                    className="font-medium"
                    style={{ color: "var(--surbee-fg-primary)" }}
                  >
                    Due today
                  </span>
                  <span
                    className="ml-auto font-semibold"
                    style={{ color: "var(--surbee-fg-primary)" }}
                  >
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                className="mb-4 p-3 rounded-lg text-sm"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}
              >
                {error}
              </div>
            )}

            {/* Subscribe Button */}
            <button
              onClick={handleCheckout}
              disabled={isProcessing || !paddle}
              className="w-full py-4 px-6 rounded-full text-base font-medium transition-all hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: "#0285ff", color: "#ffffff" }}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>

          {/* Terms */}
          <p
            className="text-xs px-3 leading-relaxed"
            style={{ color: "var(--surbee-fg-muted)" }}
          >
            Renews {billingCycle === "annual" ? "annually" : "monthly"} until cancelled. ${totalPrice.toFixed(2)}/{billingCycle === "annual" ? "year" : "month"} will be charged.{" "}
            <a
              href="/home/settings/billing"
              className="underline hover:opacity-80"
            >
              Cancel anytime
            </a>{" "}
            in Settings. By subscribing, you agree to our{" "}
            <a
              href="/terms"
              className="underline hover:opacity-80"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms of Use
            </a>.
          </p>
        </div>
      ) : (
        /* Manage Current Plan View */
        <div className="max-w-lg w-full">
          <h1
            className="text-2xl font-semibold text-center mb-2"
            style={{ color: "var(--surbee-fg-primary)" }}
          >
            Your Current Plan
          </h1>
          <p
            className="text-center mb-8"
            style={{ color: "var(--surbee-fg-secondary)" }}
          >
            Manage your subscription
          </p>

          <div
            className="rounded-2xl p-6 mb-6"
            style={{ backgroundColor: "var(--surbee-bg-secondary)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3
                  className="font-semibold"
                  style={{ color: "var(--surbee-fg-primary)" }}
                >
                  {PLAN_DETAILS[currentPlan].name} Plan
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--surbee-fg-muted)" }}
                >
                  {PLAN_DETAILS[currentPlan].credits}
                </p>
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}
              >
                Active
              </span>
            </div>

            <div
              className="pt-4 border-t"
              style={{ borderColor: "var(--surbee-border-primary)" }}
            >
              <p
                className="text-sm mb-2"
                style={{ color: "var(--surbee-fg-muted)" }}
              >
                Credits remaining this month
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="flex-1 h-2 rounded-full"
                  style={{ backgroundColor: "var(--surbee-bg-tertiary)" }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      backgroundColor: "#0285ff",
                      width: `${Math.min(100, ((credits?.creditsRemaining || 0) / (credits?.monthlyCredits || 100)) * 100)}%`
                    }}
                  />
                </div>
                <span
                  className="text-sm"
                  style={{ color: "var(--surbee-fg-secondary)" }}
                >
                  {credits?.creditsRemaining || 0} / {credits?.monthlyCredits || 100}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/home/pricing")}
              className="w-full h-12 rounded-full text-sm font-medium transition-colors hover:opacity-90"
              style={{ backgroundColor: "#0285ff", color: "#ffffff" }}
            >
              {currentPlan === "free_user" ? "Upgrade Plan" : "Change Plan"}
            </button>

            {currentPlan !== "free_user" && (
              <button
                onClick={async () => {
                  try {
                    const response = await fetch("/api/billing/customer-portal", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: user.id }),
                    });
                    const data = await response.json();
                    if (data.portalUrl) {
                      window.location.href = data.portalUrl;
                    }
                  } catch (err) {
                    console.error("Failed to open customer portal:", err);
                  }
                }}
                className="w-full h-10 rounded-full text-sm font-medium transition-colors hover:opacity-80"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--surbee-fg-muted)",
                  border: "1px solid var(--surbee-border-primary)"
                }}
              >
                Manage Subscription
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<LoadingShimmer />}>
      <BillingContent />
    </Suspense>
  );
}
