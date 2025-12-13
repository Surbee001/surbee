"use client";

import React from "react";
import { usePathname } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Enable fullBleed for the project manage page
  // This allows the manage page to control its own internal layout (header outside, content inside)
  // without being constrained by the default dashboard white box container.
  const isManagePage = pathname?.includes('/manage');

  // Hide sidebar for pricing page (full screen)
  const isPricingPage = pathname?.includes('/pricing');

  return (
    <AppLayout fullBleed={isManagePage || isPricingPage} hideSidebar={isPricingPage}>
      {children}
    </AppLayout>
  );
}
