"use client"
import { cn } from "@/lib/utils"

import { ShiningText } from "./shining-text"
import { useEffect, useState, useRef } from "react"
import { ChevronDown } from "lucide-react"

interface ThinkingStep {
  id: string
  content: string
  status: "thinking" | "complete"
}

interface ThinkingDisplayProps {
  steps: ThinkingStep[]
  duration?: number
  isThinking?: boolean
  className?: string
}

export function ThinkingDisplay({ steps, isThinking = false, className }: ThinkingDisplayProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [elapsedTime, setElapsedTime] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Force open when thinking starts or when new steps arrive
  useEffect(() => {
    if (isThinking) {
      setIsOpen(true)
    }
  }, [isThinking, steps.length])

  useEffect(() => {
    if (isThinking && !startTimeRef.current) {
      // Start tracking time when thinking begins
      startTimeRef.current = Date.now()
      setIsOpen(true) // Ensure display is open when thinking starts
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }
      }, 100)
    } else if (!isThinking && startTimeRef.current) {
      // Stop tracking when thinking ends
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setElapsedTime(finalTime)
      // Keep it open after completion so user can see what was thought
      // setIsOpen(false)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isThinking])
  
  // Reset timer when component unmounts or isThinking becomes false after being true
  useEffect(() => {
    if (!isThinking && startTimeRef.current) {
      // Reset for next thinking session
      return () => {
        startTimeRef.current = null
        setElapsedTime(0)
      }
    }
  }, [isThinking])

  // Always show when thinking, even with no steps yet
  if (!isThinking && steps.length === 0) {
    return null
  }

  return (
    <div className={cn("relative my-1 min-h-6", className)}>
      <div className="relative flex origin-top-left flex-col gap-2 overflow-x-clip">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer group"
        >
          <ChevronDown 
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isOpen ? "rotate-0" : "-rotate-90"
            )}
          />
          {isThinking ? (
            <ShiningText text="Thinking..." className="text-sm cursor-pointer" />
          ) : (
            <span className="cursor-pointer">{`Thought for ${elapsedTime}s`}</span>
          )}
        </button>

        <div
          className={cn(
            "max-w-[calc(0.8*var(--thread-content-max-width,40rem))] transition-all duration-300 ease-in-out overflow-hidden pl-5",
            isOpen ? "opacity-100 max-h-[2000px]" : "opacity-0 max-h-0",
          )}
        >
          <div className="relative z-0">
            <div className="relative flex h-full flex-col" style={{ margin: "4px 0px" }}>
              {steps.map((step, index) => (
                <ThinkingStep
                  key={step.id}
                  content={step.content}
                  status={step.status}
                  isLast={index === steps.length - 1}
                  zIndex={index}
                  isThinking={isThinking}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ThinkingStepProps {
  content: string
  status: "thinking" | "complete"
  isLast: boolean
  zIndex: number
  isThinking: boolean
}

function ThinkingStep({ content, status, isLast, zIndex }: ThinkingStepProps) {
  const isComplete = status === "complete"

  return (
    <div
      className="text-muted-foreground start-0 end-0 top-0 flex origin-left animate-in fade-in duration-500"
      style={{
        zIndex,
        position: "static",
      }}
    >
      <div className="relative flex w-full items-start gap-2 overflow-clip">
        <div className="flex h-full w-4 shrink-0 flex-col items-center">
          <div className="flex h-5 shrink-0 items-center justify-center">
            {isComplete ? (
              <svg
                className="h-[15px] w-[15px] text-primary"
                height="20"
                width="20"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12.498 6.90887C12.7094 6.60867 13.1245 6.53642 13.4248 6.74774C13.7249 6.95913 13.7971 7.37424 13.5859 7.6745L9.62695 13.2995C9.51084 13.4644 9.32628 13.5681 9.125 13.5807C8.94863 13.5918 8.77583 13.5319 8.64453 13.4167L8.59082 13.364L6.50781 11.072L6.42773 10.9645C6.26956 10.6986 6.31486 10.3488 6.55273 10.1325C6.79045 9.91663 7.14198 9.9053 7.3916 10.0876L7.49219 10.1774L9.0166 11.8542L12.498 6.90887Z" />
                <path
                  clipRule="evenodd"
                  d="M10.3333 2.08496C14.7046 2.08496 18.2483 5.62867 18.2483 10C18.2483 14.3713 14.7046 17.915 10.3333 17.915C5.96192 17.915 2.41821 14.3713 2.41821 10C2.41821 5.62867 5.96192 2.08496 10.3333 2.08496ZM10.3333 3.41504C6.69646 3.41504 3.74829 6.3632 3.74829 10C3.74829 13.6368 6.69646 16.585 10.3333 16.585C13.97 16.585 16.9182 13.6368 16.9182 10C16.9182 6.3632 13.97 3.41504 10.3333 3.41504Z"
                  fillRule="evenodd"
                />
              </svg>
            ) : (
              <div className="bg-muted-foreground/40 h-[6px] w-[6px] rounded-full animate-pulse" />
            )}
          </div>
          {!isLast && <div className="bg-border h-full w-[1px] rounded-full" />}
        </div>
        <div className="w-full" style={{ marginBottom: isLast ? "0px" : "12px" }}>
          <div className="text-sm w-full break-words whitespace-pre-wrap">
            <span className="text-muted-foreground">{content}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
