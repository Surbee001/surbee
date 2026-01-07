import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI-Powered Surveys",
  description: "Create beautiful, intelligent surveys with AI. Get real-time fraud detection, smart analytics, and actionable insights from your survey responses.",
  openGraph: {
    title: "Surbee | AI-Powered Survey Platform",
    description: "Create beautiful, intelligent surveys with AI. Get real-time fraud detection, smart analytics, and actionable insights.",
    type: "website",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
