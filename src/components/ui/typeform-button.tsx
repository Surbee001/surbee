import React from "react";
import { cn } from "@/lib/utils";

interface TypeformButtonProps {
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
  href?: string;
  disabled?: boolean;
}

export function TypeformButton({
  children,
  isActive = false,
  onClick,
  className,
  href,
  disabled = false,
}: TypeformButtonProps) {
  const baseStyles = {
    boxSizing: "inherit" as const,
    border: "none",
    borderRadius: "8px",
    font: '500 14px / 143% -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    gap: "8px",
    padding: "0px 12px",
    textDecoration: "none",
    whiteSpace: "nowrap" as const,
    WebkitBoxAlign: "center" as const,
    alignItems: "center",
    alignSelf: "center",
    display: "flex",
    flexShrink: 0,
    height: "32px",
    WebkitBoxPack: "center" as const,
    justifyContent: "center",
    transitionProperty: "background-color, color",
    transitionDuration: "0.2s",
    position: "relative" as const,
    appearance: "button" as const,
    cursor: disabled ? "not-allowed" : isActive ? "default" : "pointer",
    backgroundColor: isActive 
      ? "rgba(87, 84, 91, 0.06)" 
      : "rgba(60, 50, 62, 0)",
    color: isActive 
      ? "rgb(76, 65, 78)" 
      : "rgb(101, 93, 103)",
    opacity: disabled ? 0.5 : 1,
  };

  const Component = href ? "a" : "button";

  return (
    <Component
      className={cn("typeform-button", className)}
      style={baseStyles}
      onClick={disabled ? undefined : onClick}
      href={href}
      disabled={disabled}
    >
      {children}
    </Component>
  );
}

interface TypeformButtonContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function TypeformButtonContainer({
  children,
  className,
}: TypeformButtonContainerProps) {
  return (
    <div
      className={cn("typeform-button-container", className)}
      style={{
        boxSizing: "inherit" as const,
        width: "fit-content",
        overflowY: "hidden" as const,
        display: "flex",
        scrollbarWidth: "thin" as const,
      }}
    >
      <div
        role="tablist"
        tabIndex={0}
        style={{
          boxSizing: "inherit" as const,
          gap: "4px",
          padding: "0px 12px",
          display: "flex",
          height: "56px",
          width: "fit-content",
          outline: "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
