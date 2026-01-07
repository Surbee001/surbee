import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Survey Editor",
  description: "Build and customize your survey with AI-powered tools. Add questions, logic, and design your perfect form.",
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
