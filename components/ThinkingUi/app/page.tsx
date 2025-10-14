"use client"

import { ThinkingDisplay } from "@/components/thinking-display"
import { ToolCall } from "@/components/tool-call"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { Hammer } from "lucide-react"

export default function Home() {
  const [isThinking, setIsThinking] = useState(false)
  const [steps, setSteps] = useState<
    Array<{
      id: string
      content: string
      status: "thinking" | "complete"
    }>
  >([])
  const [duration, setDuration] = useState(0)
  const [showReply, setShowReply] = useState(false)
  const [showToolCall, setShowToolCall] = useState(false)
  const [isBuilding, setIsBuilding] = useState(false)

  useEffect(() => {
    if (!isThinking) return

    const startTime = Date.now()
    const interval = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000))
    }, 100)

    return () => clearInterval(interval)
  }, [isThinking])

  const simulateThinking = () => {
    setIsThinking(true)
    setSteps([])
    setDuration(0)
    setShowReply(false)
    setShowToolCall(false)
    setIsBuilding(false)

    const thinkingSteps = [
      {
        content: "Analyzing the user's request and breaking down the requirements into actionable components...",
      },
      {
        content:
          "Searching through the codebase to understand the existing architecture and identify relevant patterns...",
      },
      {
        content: "Evaluating different implementation approaches and selecting the most efficient solution...",
      },
      {
        content: "Planning the component structure with proper TypeScript types and React best practices...",
      },
    ]

    thinkingSteps.forEach((step, index) => {
      setTimeout(() => {
        setSteps((prev) => [
          ...prev,
          {
            id: `step-${index}`,
            content: step.content,
            status: "thinking" as const,
          },
        ])
      }, index * 1500)
    })

    setTimeout(() => {
      setIsThinking(false)
      setTimeout(() => {
        setShowReply(true)
      }, 300)
    }, thinkingSteps.length * 1500)

    setTimeout(
      () => {
        setShowToolCall(true)
        setIsBuilding(true)
        setTimeout(() => {
          setIsBuilding(false)
        }, 3000)
      },
      thinkingSteps.length * 1500 + 1000,
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Thinking Mode</h1>
          <p className="text-muted-foreground text-lg">Watch AI reasoning in real-time</p>
        </div>

        <div className="space-y-6">
          <Button onClick={simulateThinking} disabled={isThinking} size="lg">
            {isThinking ? "Thinking..." : "Start Thinking"}
          </Button>

          {steps.length > 0 && <ThinkingDisplay steps={steps} duration={duration} isThinking={isThinking} />}

          {showReply && (
            <div className="text-foreground animate-in fade-in duration-500">
              <p className="text-base leading-relaxed">
                I've analyzed your request and created a thinking mode UI component that displays reasoning steps with a
                collapsible dropdown. The shimmer effect appears only during active thinking on the header text and tool
                call actions.
              </p>
            </div>
          )}

          {showToolCall && <ToolCall icon={<Hammer className="h-4 w-4" />} label="Building" isActive={isBuilding} />}
        </div>
      </div>
    </div>
  )
}
