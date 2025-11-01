import React from "react";
import ConsoleLayout from "@/components/console/ConsoleLayout";

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
