import React from "react";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";

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
