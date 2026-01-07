import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the perfect plan for your survey needs. Free, Pro, and Max plans available with AI-powered features, fraud detection, and advanced analytics.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
