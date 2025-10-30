import React from "react";
import { cn } from "@/lib/utils";

interface LoadingIconProps {
  className?: string;
  size?: number;
}

export default function LoadingIcon({ className, size = 16 }: LoadingIconProps) {
  return (
    <div
      className={cn("flex items-center justify-center", className)}
    >
      <svg
        height={size}
        width={size}
        fill="none"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin text-gray-400"
      >
        <circle
          cx="10"
          cy="4"
          fill="currentColor"
          r="2"
        />
        <circle
          cx="16"
          cy="10"
          fill="currentColor"
          r="2"
        />
        <circle
          cx="10"
          cy="16"
          fill="currentColor"
          r="2"
        />
        <circle
          cx="4"
          cy="10"
          fill="currentColor"
          r="2"
        />
      </svg>
    </div>
  );
}