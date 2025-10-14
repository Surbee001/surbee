"use client"

import { cn } from "@/lib/utils"

interface ShiningTextProps {
  text: string
  className?: string
}

export function ShiningText({ text, className }: ShiningTextProps) {
  const words = text.split(" ")

  return (
    <span className={cn("inline", className)}>
      {words.map((word, index) => (
        <span key={index}>
          <span className="inline-block bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:400%_100%] bg-clip-text text-transparent animate-shine">
            {word}
          </span>
          {index < words.length - 1 && " "}
        </span>
      ))}
    </span>
  )
}
