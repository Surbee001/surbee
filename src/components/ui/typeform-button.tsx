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
    border: "0px solid",
    boxSizing: "border-box",
    WebkitFontSmoothing: "antialiased",
    width: "fit-content",
    paddingTop: "1px",
    paddingBottom: "1px",
    letterSpacing: "0px",
    fontWeight: 652,
    fontSize: "24px",
    lineHeight: "30px",
    color: "hsl(0 0% 100%/var(--tw-text-opacity,1))",
    transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke, -webkit-text-decoration-color",
    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
    transitionDuration: "0.3s",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "inherit",
    backgroundColor: "transparent",
    border: "none",
    padding: "0",
    margin: "0",
    fontFamily: "inherit",
    fontFeatureSettings: "inherit",
    fontVariationSettings: "inherit",
    fontSize: "100%",
    fontWeight: "inherit",
    lineHeight: "inherit",
    letterSpacing: "inherit",
    textTransform: "none",
    appearance: "button",
    backgroundImage: "none",
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
    <ul
      className={cn("flex flex-col [&:has(:hover)>*:not(:hover)]:text-text-tertiary", className)}
      style={{
        border: "0px solid",
        boxSizing: "border-box",
        WebkitFontSmoothing: "antialiased",
        listStyle: "none",
        margin: "0px",
        padding: "0px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {React.Children.map(children, (child) => (
        <li
          className="w-fit py-[1px] text-title-3 text-text-primary transition-colors duration-300"
          style={{
            border: "0px solid",
            boxSizing: "border-box",
            WebkitFontSmoothing: "antialiased",
            width: "fit-content",
            paddingTop: "1px",
            paddingBottom: "1px",
            letterSpacing: "0px",
            fontWeight: 652,
            fontSize: "24px",
            lineHeight: "30px",
            color: "hsl(0 0% 100%/var(--tw-text-opacity,1))",
            transitionProperty: "color, background-color, border-color, text-decoration-color, fill, stroke, -webkit-text-decoration-color",
            transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            transitionDuration: "0.3s",
          }}
        >
          {child}
        </li>
      ))}
    </ul>
  );
}
