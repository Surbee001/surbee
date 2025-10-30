"use client"
import { cn } from "@/lib/utils"
import type React from "react"
import { ShiningText } from "./shining-text"

interface ToolCallProps {
  icon?: React.ReactNode
  label?: string
  isActive?: boolean
  className?: string
}

export function ToolCall({ icon, label = "Building", isActive = false, className }: ToolCallProps) {
  return (
    <div className={cn("relative my-1 min-h-6 animate-in fade-in duration-500", className)}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {isActive ? <ShiningText text={label} className="text-sm" /> : <span>{label}</span>}
      </div>
    </div>
  )
}
