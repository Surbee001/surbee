"use client"

import { useState, useEffect, useRef } from 'react'

interface GridCell {
  id: string
  x: number
  y: number
  blinkDelay: number
  initialOpacity: number
}

interface ProjectLoaderProps {
  gridSize?: number
  cellShape?: "circle" | "square"
  cellGap?: number
  blinkSpeed?: number
  className?: string
  text?: string
  isDark?: boolean
}

export default function ProjectLoader({
  gridSize = 14,
  cellShape = "circle",
  cellGap = 4,
  blinkSpeed = 2200,
  className = "",
  text = "Building",
  isDark = true,
}: ProjectLoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [gridCells, setGridCells] = useState<GridCell[]>([])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const generate = () => {
      const w = el.offsetWidth
      const h = el.offsetHeight
      if (w === 0 || h === 0) return

      const cellWithGap = gridSize + cellGap
      const cols = Math.ceil(w / cellWithGap) + 1
      const rows = Math.ceil(h / cellWithGap) + 1

      const cells: GridCell[] = []
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          cells.push({
            id: `${row}-${col}`,
            x: col * cellWithGap,
            y: row * cellWithGap,
            blinkDelay: Math.random() * blinkSpeed,
            initialOpacity: Math.random() * 0.5 + 0.15,
          })
        }
      }
      setGridCells(cells)
    }

    generate()

    const observer = new ResizeObserver(generate)
    observer.observe(el)
    return () => observer.disconnect()
  }, [gridSize, cellGap, blinkSpeed])

  const dotColor = isDark
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(0, 0, 0, 0.08)'

  const textColor = isDark
    ? 'rgba(255, 255, 255, 0.35)'
    : 'rgba(0, 0, 0, 0.3)'

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {gridCells.map(cell => (
        <div
          key={cell.id}
          className={cellShape === 'circle' ? 'rounded-full' : 'rounded-sm'}
          style={{
            position: 'absolute',
            left: cell.x,
            top: cell.y,
            width: gridSize,
            height: gridSize,
            backgroundColor: dotColor,
            opacity: cell.initialOpacity,
            animation: `projectLoaderBlink ${blinkSpeed}ms ease-in-out infinite`,
            animationDelay: `${cell.blinkDelay}ms`,
            willChange: 'opacity',
          }}
        />
      ))}

      {text && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span
            className="text-xs font-medium tracking-wide"
            style={{ color: textColor }}
          >
            {text}
          </span>
        </div>
      )}

      <style jsx>{`
        @keyframes projectLoaderBlink {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </div>
  )
}
