import React from "react";
import type { Metadata } from "next";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";

export const metadata: Metadata = {
  title: "Chats",
  description: "View and manage all your chat conversations.",
};

export default function ChatsLayout({
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
