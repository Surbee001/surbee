import React from "react";
import { cn } from "@/lib/utils";

type ColorfulTextProps = {
  text: string;
  className?: string;
};

const SATURATION = 82;
const LIGHTNESS = 56;

export default function ColorfulText({ text, className }: ColorfulTextProps) {
  const characters = Array.from(text);
  const nonWhitespaceCount = characters.filter((char) => char.trim().length > 0).length || 1;

  let colorIndex = 0;

  return (
    <span className={cn("colorful-text", className)}>
      {characters.map((char, idx) => {
        if (char.trim().length === 0) {
          return <React.Fragment key={`space-${idx}`}>{char}</React.Fragment>;
        }

        const progress = nonWhitespaceCount > 1 ? colorIndex / (nonWhitespaceCount - 1) : 0.5;
        const hue = Math.round(progress * 360);
        colorIndex += 1;

        return (
          <span
            key={`char-${idx}`}
            className="colorful-text__letter"
            style={{
              color: `hsl(${hue}, ${SATURATION}%, ${LIGHTNESS}%)`,
              transition: "color 200ms ease",
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
}
