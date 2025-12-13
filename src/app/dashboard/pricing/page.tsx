"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type PlanType = "free" | "team" | "enterprise";

interface UserSubscription {
  plan: PlanType;
  billing_cycle: "monthly" | "annual" | null;
  status: string;
}

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("plan, billing_cycle, status")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        setCurrentPlan(data.plan as PlanType);
        if (data.billing_cycle) {
          setIsAnnual(data.billing_cycle === "annual");
        }
      }
      setLoading(false);
    };

    fetchSubscription();
  }, [user]);

  const handleClose = () => {
    router.back();
  };

  const getButtonText = (plan: PlanType): string => {
    if (currentPlan === plan) return "Current plan";

    const planOrder: Record<PlanType, number> = { free: 0, team: 1, enterprise: 2 };

    if (planOrder[plan] > planOrder[currentPlan]) {
      return plan === "team" ? "Upgrade to Team" : "Contact Sales";
    } else {
      return `Downgrade to ${plan.charAt(0).toUpperCase() + plan.slice(1)}`;
    }
  };

  const isCurrentPlan = (plan: PlanType): boolean => currentPlan === plan;

  // Plans to show based on current plan
  const getVisiblePlans = (): PlanType[] => {
    // Always show all plans, but Free is hidden if user is on Team or Enterprise
    if (currentPlan === "enterprise") {
      return ["team", "enterprise"];
    }
    if (currentPlan === "team") {
      return ["free", "team", "enterprise"];
    }
    return ["free", "team", "enterprise"];
  };

  const visiblePlans = getVisiblePlans();

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
            Save <strong style={{ color: "var(--surbee-fg-primary)" }}>$60 per user / year</strong> with annual plan
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
        <div
          className={`grid gap-4 justify-center ${
            visiblePlans.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : "grid-cols-1 md:grid-cols-3"
          }`}
        >
          {/* Free Tier */}
          {visiblePlans.includes("free") && (
            <PricingTier
              name="Free"
              price="$0"
              description="Try Surbee for free. Up to 5 seats"
              buttonText={getButtonText("free")}
              isCurrentPlan={isCurrentPlan("free")}
              isHighlighted={false}
              features={[
                "10 meetings and 20 messages per user and month",
                "Up to 5 members per workspace",
                "Unlimited agents and tasks",
                "Meeting integrations with Google Meet, Microsoft Teams, and Zoom",
                "Knowledge integrations with Google Drive, Sharepoint, OneDrive, Notion, and Confluence",
                "Help center support",
              ]}
              onButtonClick={() => {
                if (!isCurrentPlan("free")) {
                  // Handle downgrade
                  console.log("Downgrade to free");
                }
              }}
              disabled={isCurrentPlan("free")}
            />
          )}

          {/* Team Tier */}
          {visiblePlans.includes("team") && (
            <PricingTier
              name="Team"
              price={isAnnual ? "$30/month" : "$35/month"}
              originalPrice={isAnnual ? "$35/month" : undefined}
              billingNote={`Per member, billed ${isAnnual ? "annually" : "monthly"}`}
              buttonText={getButtonText("team")}
              isCurrentPlan={isCurrentPlan("team")}
              isHighlighted={true}
              features={[
                "Everything in free",
                "Unlimited documents, queries, and recordings",
                "All off-the-shelf integrations",
                "OpenAI & Claude LLM model selection",
                "Priority in email & chat support",
                "Early access to new features",
                "Up to 50 members per workspace",
              ]}
              highlightFirstFeature
              onButtonClick={() => {
                if (!isCurrentPlan("team")) {
                  // Handle upgrade/downgrade
                  console.log("Switch to team plan");
                }
              }}
              disabled={isCurrentPlan("team")}
            />
          )}

          {/* Enterprise Tier */}
          {visiblePlans.includes("enterprise") && (
            <PricingTier
              name="Enterprise"
              price="Custom pricing"
              billingNote="Contact sales"
              buttonText={getButtonText("enterprise")}
              isCurrentPlan={isCurrentPlan("enterprise")}
              isHighlighted={false}
              features={[
                "Everything in Free and Team",
                "Enterprise data processing agreement",
                "Domain verification, SAML-based SSO, and SCIM",
                "Additional LLM models",
                "Dedicated success team, priority support, and SLA",
                "Analytics dashboard to measure impact",
                "Custom integrations & API access",
              ]}
              highlightFirstFeature
              onButtonClick={() => {
                if (!isCurrentPlan("enterprise")) {
                  window.open("mailto:sales@surbee.com", "_blank");
                }
              }}
              disabled={isCurrentPlan("enterprise")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface PricingTierProps {
  name: string;
  price: string;
  originalPrice?: string;
  description?: string;
  billingNote?: string;
  buttonText: string;
  isCurrentPlan: boolean;
  isHighlighted: boolean;
  features: string[];
  highlightFirstFeature?: boolean;
  onButtonClick: () => void;
  disabled?: boolean;
}

function PricingTier({
  name,
  price,
  originalPrice,
  description,
  billingNote,
  buttonText,
  isCurrentPlan,
  isHighlighted,
  features,
  highlightFirstFeature,
  onButtonClick,
  disabled,
}: PricingTierProps) {
  return (
    <div
      className="relative flex flex-col rounded-2xl p-5 w-full max-w-[320px]"
      style={{
        backgroundColor: isHighlighted
          ? "var(--surbee-bg-tertiary)"
          : "var(--surbee-card-bg)",
      }}
    >
      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div
          className="absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: "var(--surbee-bg-primary)",
            color: "var(--surbee-fg-muted)",
            border: "1px solid var(--surbee-border-secondary)",
          }}
        >
          Current plan
        </div>
      )}

      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col gap-0.5">
          <h6
            className="font-semibold text-sm"
            style={{ color: "var(--surbee-fg-primary)" }}
          >
            {name}
          </h6>
        </div>
        <div className="flex items-baseline gap-2">
          <h6
            className="font-bold text-xl"
            style={{ color: "var(--surbee-fg-primary)" }}
          >
            {price}
          </h6>
          {originalPrice && (
            <span
              className="text-xs line-through"
              style={{ color: "var(--surbee-fg-muted)" }}
            >
              {originalPrice}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs" style={{ color: "var(--surbee-fg-muted)" }}>
            {description}
          </p>
        )}
        {billingNote && (
          <p className="text-xs" style={{ color: "var(--surbee-fg-muted)" }}>
            {billingNote}
          </p>
        )}
        <button
          onClick={onButtonClick}
          disabled={disabled}
          className="flex justify-center items-center h-10 text-sm whitespace-nowrap transition-all duration-200 cursor-pointer rounded-full font-medium px-5 py-2.5 mt-1"
          style={{
            backgroundColor: disabled
              ? "var(--surbee-bg-tertiary)"
              : "var(--surbee-fg-primary)",
            color: disabled
              ? "var(--surbee-fg-muted)"
              : "var(--surbee-bg-primary)",
            cursor: disabled ? "default" : "pointer",
            opacity: disabled ? 0.7 : 1,
          }}
        >
          {buttonText}
        </button>
      </div>
      <FeatureList features={features} highlightFirst={highlightFirstFeature} />
    </div>
  );
}

function FeatureList({
  features,
  highlightFirst,
}: {
  features: string[];
  highlightFirst?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-2.5">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start gap-2">
          <svg
            height="14"
            width="14"
            className="flex-shrink-0 mt-0.5"
            style={{
              color:
                index === 0 && highlightFirst
                  ? "var(--surbee-fg-primary)"
                  : "var(--surbee-fg-muted)",
            }}
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
            className="text-xs leading-relaxed"
            style={{
              color:
                index === 0 && highlightFirst
                  ? "var(--surbee-fg-primary)"
                  : "var(--surbee-fg-muted)",
            }}
          >
            {feature}
          </p>
        </li>
      ))}
    </ul>
  );
}
