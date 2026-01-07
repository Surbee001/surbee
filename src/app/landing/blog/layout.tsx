import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, best practices, and tips for creating effective surveys and collecting quality data.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
