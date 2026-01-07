import React from "react";
import type { Metadata } from "next";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";

export const metadata: Metadata = {
  title: "Projects",
  description: "View and manage all your survey projects. Create, edit, and analyze surveys with AI-powered tools.",
};

export default function ProjectsLayout({
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
