import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base - Surbee Lyra",
  description: "Circular navigation interface for document management and knowledge organization",
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