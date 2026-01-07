import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description: "Access documentation, guides, and resources to help you get the most out of Surbee's AI-powered survey platform.",
};

export default function KBLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}