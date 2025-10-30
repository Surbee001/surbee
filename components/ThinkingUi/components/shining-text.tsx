"use client"

import { cn } from "@/lib/utils"

interface ShiningTextProps {
  text: string
  className?: string
}

export function ShiningText({ text, className }: ShiningTextProps) {
  return (
    <span 
      className={cn(
        "inline-block bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:400%_100%] bg-clip-text text-transparent animate-shine",
        className
      )}
    >
      {text}
    </span>
  )
}
