"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useCredits } from "@/hooks/useCredits";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type PlanType = "free_user" | "surbee_pro" | "surbee_max" | "surbee_enterprise";

const PLAN_DETAILS: Record<PlanType, { name: string; price: string; priceMonthly: string; credits: string; features: string[] }> = {
  free_user: {
    name: "Free",
    price: "$0",
    priceMonthly: "$0/mo",
    credits: "100 credits/month",
    features: ["Survey generation", "Unlimited responses", "Chat with Claude Haiku", "CSV export"],
  },
  surbee_pro: {
    name: "Pro",
    price: "$200/year",
    priceMonthly: "$16.67/mo",
    credits: "2,000 credits/month",
    features: ["All AI models", "Agent Mode", "Evaluation tools", "Remove branding", "Priority support"],
  },
  surbee_max: {
    name: "Max",
    price: "$600/year",
    priceMonthly: "$50/mo",
    credits: "6,000 credits/month",
    features: ["Everything in Pro", "Full Cipher", "Custom domain", "Higher rate limits", "Dedicated support"],
  },
  surbee_enterprise: {
    name: "Enterprise",
    price: "Custom",
    priceMonthly: "Custom",
    credits: "Unlimited credits",
    features: ["Everything in Max", "SSO", "Custom integrations", "SLA guarantee"],
  },
};

function BillingContent() {
  const { user, loading } = useAuth();
  const { credits } = useCredits();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") as PlanType | null;
  const cancelled = searchParams.get("cancelled") === "true";

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(cancelled ? "Payment was cancelled. You can try again when ready." : null);

  const currentPlan = (credits?.plan || "free_user") as PlanType;
  const planToShow = selectedPlan || currentPlan;
  const planDetails = PLAN_DETAILS[planToShow];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--surbee-bg-primary)" }}>
        <div className="animate-pulse text-sm" style={{ color: "var(--surbee-fg-muted)" }}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    router.push("/login?redirect=/billing");
    return null;
  }

  const handleCheckout = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      const response = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        // Redirect to Clerk/Stripe Checkout
        window.location.href = data.checkoutUrl;
      } else if (data.success) {
        // Direct success (test mode or already processed)
        router.push("/home?upgraded=true");
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isUpgrade = selectedPlan && selectedPlan !== "free_user" && selectedPlan !== currentPlan;

  return (
    <div className="flex flex-col w-full min-h-screen items-center justify-center p-8" style={{ backgroundColor: "var(--surbee-bg-primary)" }}>
      {/* Close Button */}
      <button
        onClick={() => router.push("/home")}
        className="absolute top-6 right-6 z-10 flex justify-center items-center transition-all duration-200 cursor-pointer rounded-full w-9 h-9"
        style={{ backgroundColor: "var(--surbee-bg-tertiary)", color: "var(--surbee-fg-primary)" }}
        aria-label="Close"
      >
        <svg height="20" width="20" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.499 23.624A1.1 1.1 0 0 1 8.4 22.512c0-.295.108-.576.322-.777l5.71-5.723-5.71-5.71a1.07 1.07 0 0 1-.322-.777c0-.63.483-1.098 1.099-1.098.308 0 .549.107.763.308l5.737 5.724 5.763-5.737c.228-.228.469-.322.763-.322.616 0 1.112.483 1.112 1.099 0 .308-.094.549-.335.79l-5.723 5.723 5.71 5.71c.227.2.335.482.335.79 0 .616-.496 1.112-1.125 1.112a1.06 1.06 0 0 1-.79-.322l-5.71-5.723-5.697 5.723a1.1 1.1 0 0 1-.803.322" fill="currentColor" />
        </svg>
      </button>

      <div className="max-w-lg w-full">
        {isUpgrade ? (
          <>
            {/* Upgrade Flow */}
            <h1 className="text-2xl font-semibold text-center mb-2" style={{ color: "var(--surbee-fg-primary)" }}>
              Upgrade to {planDetails.name}
            </h1>
            <p className="text-center mb-8" style={{ color: "var(--surbee-fg-secondary)" }}>
              {planDetails.priceMonthly} · {planDetails.credits}
            </p>

            {/* Plan Summary Card */}
            <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "var(--surbee-bg-secondary)" }}>
              <div className="flex justify-between items-center mb-4">
                <span style={{ color: "var(--surbee-fg-primary)" }}>{planDetails.name} Plan</span>
                <span className="font-semibold" style={{ color: "var(--surbee-fg-primary)" }}>{planDetails.price}</span>
              </div>
              <ul className="space-y-2">
                {planDetails.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--surbee-fg-muted)" }}>
                    <svg height="14" width="14" fill="none" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7.233 11.725c.221 0 .409-.107.543-.314l4.203-5.958c.074-.134.16-.281.16-.429 0-.301-.267-.495-.549-.495-.167 0-.334.107-.462.301l-3.922 5.603-1.89-2.28c-.16-.213-.308-.267-.496-.267a.519.519 0 0 0-.515.529c0 .147.06.288.154.415l2.205 2.58c.167.222.348.315.57.315Z" fill="currentColor" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={isProcessing}
              className="w-full h-12 rounded-full text-sm font-medium transition-colors"
              style={{ backgroundColor: "#0285ff", color: "#ffffff", opacity: isProcessing ? 0.7 : 1 }}
            >
              {isProcessing ? "Redirecting to checkout..." : `Continue to Payment`}
            </button>

            <p className="text-xs text-center mt-4" style={{ color: "var(--surbee-fg-muted)" }}>
              You'll be redirected to our secure payment page powered by Stripe.
            </p>

            {/* Stripe badge */}
            <div className="flex items-center justify-center mt-6 gap-2">
              <svg width="50" height="21" viewBox="0 0 50 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.11 8.82C4.11 8.37 4.47 8.17 5.05 8.17C5.86 8.17 6.88 8.42 7.69 8.87V6.07C6.8 5.71 5.93 5.55 5.05 5.55C2.78 5.55 1.27 6.73 1.27 8.95C1.27 12.38 6.06 11.82 6.06 13.32C6.06 13.85 5.6 14.05 4.98 14.05C4.09 14.05 2.96 13.67 2.07 13.16V15.99C3.06 16.43 4.06 16.62 4.98 16.62C7.31 16.62 8.91 15.47 8.91 13.22C8.9 9.51 4.11 10.18 4.11 8.82ZM12.53 3.72L9.82 4.29V14.61C9.82 15.8 10.72 16.62 11.91 16.62C12.57 16.62 13.06 16.52 13.34 16.38V14.07C13.07 14.18 12.53 14.35 12.53 13.16V8.57H13.34V5.72H12.53V3.72ZM17.38 6.85L17.21 5.72H14.73V16.45H17.55V9.03C18.19 8.22 19.24 8.36 19.58 8.48V5.72C19.23 5.58 18.02 5.37 17.38 6.85ZM20.52 5.72H23.35V16.45H20.52V5.72ZM20.52 4.58L23.35 3.99V1.5L20.52 2.09V4.58ZM28.71 5.55C27.5 5.55 26.67 6.09 26.21 6.46L26.05 5.72H23.54V19.5L26.36 18.93V16.25C26.83 16.52 27.51 16.62 28.2 16.62C30.31 16.62 32.22 15.06 32.22 11.03C32.22 7.34 30.28 5.55 28.71 5.55ZM28.02 14.03C27.54 14.03 27.25 13.89 27.03 13.69V8.69C27.27 8.46 27.57 8.33 28.02 8.33C28.84 8.33 29.39 9.25 29.39 11.16C29.39 13.12 28.86 14.03 28.02 14.03ZM38.67 5.55C36 5.55 34.2 7.54 34.2 11.11C34.2 15.01 36.22 16.62 38.99 16.62C40.29 16.62 41.36 16.32 42.18 15.88V13.3C41.42 13.71 40.51 13.98 39.38 13.98C38.27 13.98 37.34 13.56 37.21 12.15H42.69C42.7 11.98 42.72 11.39 42.72 11.06C42.71 7.57 41.11 5.55 38.67 5.55ZM37.18 10.01C37.18 8.69 37.88 8.09 38.65 8.09C39.39 8.09 40.06 8.69 40.06 10.01H37.18Z" fill="#6772E5"/>
              </svg>
              <span className="text-xs" style={{ color: "var(--surbee-fg-muted)" }}>Secure checkout</span>
            </div>
          </>
        ) : (
          <>
            {/* Manage Current Plan */}
            <h1 className="text-2xl font-semibold text-center mb-2" style={{ color: "var(--surbee-fg-primary)" }}>
              Your Current Plan
            </h1>
            <p className="text-center mb-8" style={{ color: "var(--surbee-fg-secondary)" }}>
              Manage your subscription
            </p>

            <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "var(--surbee-bg-secondary)" }}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold" style={{ color: "var(--surbee-fg-primary)" }}>
                    {PLAN_DETAILS[currentPlan].name} Plan
                  </h3>
                  <p className="text-sm" style={{ color: "var(--surbee-fg-muted)" }}>
                    {PLAN_DETAILS[currentPlan].credits}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                  Active
                </span>
              </div>

              <div className="pt-4 border-t" style={{ borderColor: "var(--surbee-border-primary)" }}>
                <p className="text-sm mb-2" style={{ color: "var(--surbee-fg-muted)" }}>
                  Credits remaining this month
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full" style={{ backgroundColor: "var(--surbee-bg-tertiary)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: "#0285ff",
                        width: `${Math.min(100, ((credits?.creditsRemaining || 0) / (credits?.monthlyCredits || 100)) * 100)}%`
                      }}
                    />
                  </div>
                  <span className="text-sm" style={{ color: "var(--surbee-fg-secondary)" }}>
                    {credits?.creditsRemaining || 0} / {credits?.monthlyCredits || 100}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push("/home/pricing")}
                className="w-full h-12 rounded-full text-sm font-medium transition-colors"
                style={{ backgroundColor: "#0285ff", color: "#ffffff" }}
              >
                {currentPlan === "free_user" ? "Upgrade Plan" : "Change Plan"}
              </button>

              {currentPlan !== "free_user" && (
                <button
                  onClick={() => {/* Handle cancel - would open Stripe portal */}}
                  className="w-full h-10 rounded-full text-sm font-medium transition-colors"
                  style={{ backgroundColor: "transparent", color: "var(--surbee-fg-muted)", border: "1px solid var(--surbee-border-primary)" }}
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "var(--surbee-bg-primary)" }}>
          <div className="animate-pulse text-sm" style={{ color: "var(--surbee-fg-muted)" }}>Loading...</div>
        </div>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
