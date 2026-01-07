import React from "react";
import type { Metadata } from "next";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your surveys, view analytics, and create new projects with AI-powered insights.",
};

export default function DashboardLayout({
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


