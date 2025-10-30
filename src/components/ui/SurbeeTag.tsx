import React from "react";

interface SurbeeTagProps {
  variant?: "default" | "minimal" | "compact";
  showText?: boolean;
  className?: string;
}

export default function SurbeeTag({
  variant = "default",
  showText = true,
  className = ""
}: SurbeeTagProps) {
  const baseClasses = "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm";

  const variants = {
    default: "px-4 py-2",
    minimal: "px-3 py-1.5",
    compact: "px-2 py-1"
  };

  const textSizes = {
    default: "text-sm",
    minimal: "text-xs",
    compact: "text-xs"
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {/* Surbee Logo */}
      <div className={`flex items-center justify-center ${
        variant === "compact" ? "w-4 h-4" : variant === "minimal" ? "w-5 h-5" : "w-6 h-6"
      }`}>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#0A0A0A]"
        >
          <path
            d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 25.2c-6.292 0-11.4-5.108-11.4-11.4S9.708 4.4 16 4.4s11.4 5.108 11.4 11.4-5.108 11.4-11.4 11.4z"
            fill="currentColor"
          />
          <path
            d="M16 8.8c-2.208 0-4 1.792-4 4v6.4c0 2.208 1.792 4 4 4s4-1.792 4-4V12.8c0-2.208-1.792-4-4-4zm1.6 10.4c0 .664-.536 1.2-1.2 1.2s-1.2-.536-1.2-1.2v-6.4c0-.664.536-1.2 1.2-1.2s1.2.536 1.2 1.2v6.4z"
            fill="currentColor"
          />
          <path
            d="M12.8 16c0 1.768-1.432 3.2-3.2 3.2s-3.2-1.432-3.2-3.2 1.432-3.2 3.2-3.2 3.2 1.432 3.2 3.2zM22.4 16c0 1.768-1.432 3.2-3.2 3.2s-3.2-1.432-3.2-3.2 1.432-3.2 3.2-3.2 3.2 1.432 3.2 3.2z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Created with Surbee Text */}
      {showText && (
        <span
          className={`${textSizes[variant]} font-medium tracking-wide`}
          style={{
            color: '#0A0A0A',
            fontFamily: 'var(--font-inter), sans-serif'
          }}
        >
          {variant === "compact" ? "Surbee" : "Created with Surbee"}
        </span>
      )}
    </div>
  );
}

// Alternative component using the GitHub logo URL
export function SurbeeTagWithLogo({
  variant = "default",
  showText = true,
  className = ""
}: SurbeeTagProps) {
  const baseClasses = "inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 backdrop-blur-sm shadow-sm";

  const variants = {
    default: "px-4 py-2",
    minimal: "px-3 py-1.5",
    compact: "px-2 py-1"
  };

  const textSizes = {
    default: "text-sm",
    minimal: "text-xs",
    compact: "text-xs"
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {/* Surbee Logo from GitHub */}
      <div className={`flex items-center justify-center ${
        variant === "compact" ? "w-4 h-4" : variant === "minimal" ? "w-5 h-5" : "w-6 h-6"
      }`}>
        <img
          src="https://raw.githubusercontent.com/Surbee001/webimg/bde8b822978508d5d1eaab50cc0d5a3b3023e501/BEE%20Logo%20Surbee.svg"
          alt="Surbee Logo"
          className="w-full h-full object-contain"
          style={{ filter: 'brightness(0)' }} // Make it black
        />
      </div>

      {/* Created with Surbee Text */}
      {showText && (
        <span
          className={`${textSizes[variant]} font-medium tracking-wide`}
          style={{
            color: '#0A0A0A',
            fontFamily: 'var(--font-inter), sans-serif'
          }}
        >
          {variant === "compact" ? "Surbee" : "Created with Surbee"}
        </span>
      )}
    </div>
  );
}
