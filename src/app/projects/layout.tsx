import React from "react";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";

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
