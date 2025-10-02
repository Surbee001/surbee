"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type TypingOverlayProps = {
  prompts?: string[];
};

const DEFAULT_PROMPTS = [
  "Create a 10-question onboarding survey for new users |",
  "Detect suspicious responses and flag low-quality data |",
  "Spin up a community to gather quick answers this week |",
];

export default function TypingOverlay({ prompts = DEFAULT_PROMPTS }: TypingOverlayProps) {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "fade">("typing");
  const timerRef = useRef<number | null>(null);

  const current = useMemo(() => prompts[index % prompts.length], [index, prompts]);

  useEffect(() => {
    if (phase === "typing") {
      if (display.length < current.length) {
        timerRef.current = window.setTimeout(() => setDisplay(current.slice(0, display.length + 1)), 28);
      } else {
        timerRef.current = window.setTimeout(() => setPhase("pause"), 700);
      }
    } else if (phase === "pause") {
      timerRef.current = window.setTimeout(() => setPhase("fade"), 450);
    } else if (phase === "fade") {
      timerRef.current = window.setTimeout(() => {
        setDisplay("");
        setIndex((i) => (i + 1) % prompts.length);
        setPhase("typing");
      }, 350);
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [phase, display, current, prompts.length]);

  return (
    <div className="flex flex-col gap-3 tracking-15 leading-[140%] text-neutral-800">
      <span className="font-medium text-[#171717]">
        {display}
        <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[1px] bg-[#171717] animate-pulse" />
      </span>
    </div>
  );
}


