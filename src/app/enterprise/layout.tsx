import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enterprise",
  description: "Enterprise-grade survey solutions with advanced security, SSO, custom integrations, and dedicated support for your organization.",
};

export default function EnterpriseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
