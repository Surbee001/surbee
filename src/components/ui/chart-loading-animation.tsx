"use client";

import React, { useEffect, useState, useRef } from "react";

const COLS = 12;
const ROWS = 10;
const GRID_SIZE = COLS * ROWS;

interface ChartLoadingAnimationProps {
  className?: string;
}

export function ChartLoadingAnimation({ className = "" }: ChartLoadingAnimationProps) {
  const [opacities, setOpacities] = useState<number[]>(() => 
    Array.from({ length: GRID_SIZE }, () => 0.3)
  );
  const frameRef = useRef(0);

  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      frameRef.current += 1;
      const time = frameRef.current * 0.04;
      
      setOpacities(
        Array.from({ length: GRID_SIZE }, (_, index) => {
          const row = Math.floor(index / COLS);
          const col = index % COLS;
          
          // Create a diagonal shimmer wave
          const wave1 = Math.sin((col * 0.5 + row * 0.5 - time * 2) * 0.8);
          const wave2 = Math.sin((col * 0.3 + row * 0.3 - time * 1.5) * 1.2);
          
          // Combine waves for shimmer effect
          const combined = (wave1 + wave2) / 2;
          
          // Map to opacity range 0.2 - 0.7
          return 0.2 + (combined + 1) * 0.25;
        })
      );
      
      animationId = requestAnimationFrame(animate);
    };
    
    animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div
      className={`relative w-full ${className}`}
      style={{
        maxWidth: "32rem",
      }}
    >
      {/* Main card container */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          backgroundColor: "oklch(24.57% .003 196.96)",
          boxShadow:
            "0 0 0 1px rgba(255, 255, 255, .08), 0 10px 15px -3px rgb(0 0 0 / .1), 0 4px 6px -4px rgb(0 0 0 / .1)",
        }}
      >
        {/* Dot grid container */}
        <div
          style={{
            aspectRatio: "16 / 10",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, 1fr)`,
              gridTemplateRows: `repeat(${ROWS}, 1fr)`,
              width: "100%",
              height: "100%",
              gap: "0",
            }}
          >
            {opacities.map((opacity, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "rgb(113, 113, 122)",
                    opacity: opacity,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component for use in chat
export function ChartLoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeStyles = {
    sm: { maxWidth: "280px" },
    md: { maxWidth: "32rem" },
    lg: { maxWidth: "40rem" },
  };

  return (
    <div className="w-full" style={sizeStyles[size]}>
      <ChartLoadingAnimation />
    </div>
  );
}
