import React from "react";
import type { Metadata } from "next";
import ConsoleLayout from "@/components/console/ConsoleLayout";

export const metadata: Metadata = {
  title: "Developer Console",
  description: "Access API keys, documentation, and developer tools to integrate Surbee into your applications.",
};

export default function ConsoleDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConsoleLayout>
      {children}
    </ConsoleLayout>
  );
}
