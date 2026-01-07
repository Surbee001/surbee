import React from "react";
import type { Metadata } from "next";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";

export const metadata: Metadata = {
  title: "Marketplace",
  description: "Discover and use pre-built survey templates. Browse community-created surveys and start collecting responses instantly.",
};

export default function MarketplaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
}
