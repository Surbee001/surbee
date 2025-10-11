"use client"

import { ThinkingDisplay } from "@/components/thinking-display"
import { ToolCall } from "@/components/tool-call"
import { Hammer } from "lucide-react"

export default function Home() {
  // Example usage - replace with your actual data
  const steps = [
    {
      id: "step-1",
      content: "Analyzing the user's request and breaking down the requirements...",
      status: "complete" as const,
    },
    {
      id: "step-2",
      content: "Searching through the codebase to understand the existing architecture...",
      status: "thinking" as const,
    },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Thinking Display */}
        <ThinkingDisplay steps={steps} duration={5} isThinking={true} />

        {/* AI Reply Text */}
        <div className="text-foreground">
          <p className="text-base leading-relaxed">Your AI response text goes here...</p>
        </div>

        {/* Tool Call */}
        <ToolCall icon={<Hammer className="h-4 w-4" />} label="Building" isActive={true} />
      </div>
    </div>
  )
}
