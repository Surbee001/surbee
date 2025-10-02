"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type TypingOverlayProps = {
  prompts?: string[];
};

const DEFAULT_PROMPTS = [
  "Create a 10-question onboarding survey for new users",
  "Detect suspicious responses and flag low-quality data",
  "Spin up a community to gather quick answers this week",
];

export default function TypingOverlay({ prompts = DEFAULT_PROMPTS }: TypingOverlayProps) {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState("");
  const [phase, setPhase] = useState<"typing" | "pause" | "fade">("typing");
  const [show, setShow] = useState(true);
  const timerRef = useRef<number | null>(null);

  const current = useMemo(() => prompts[index % prompts.length], [index, prompts]);

  useEffect(() => {
    if (phase === "typing") {
      if (display.length < current.length) {
        timerRef.current = window.setTimeout(() => setDisplay(current.slice(0, display.length + 1)), 28);
      } else {
        // pause longer so users can read the line
        timerRef.current = window.setTimeout(() => setPhase("pause"), 2200);
      }
    } else if (phase === "pause") {
      timerRef.current = window.setTimeout(() => setPhase("fade"), 100);
    } else if (phase === "fade") {
      // trigger exit animation; reset occurs on exit complete
      setShow(false);
    }
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [phase, display, current, prompts.length]);

  const handleExitComplete = () => {
    setShow(true);
    setDisplay("");
    setIndex((i) => (i + 1) % prompts.length);
    setPhase("typing");
  };

  return (
    <div className="relative flex flex-col gap-1.5 tracking-15 leading-[140%] text-neutral-800 min-h-[60px] w-full pt-1" style={{ fontFamily: "var(--font-epilogue)" }}>
      <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
        {show && (
          <motion.div
            key={`line-${index}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              filter: "blur(12px)",
              transition: { duration: 0.5, ease: "easeOut" }
            }}
            className="z-10 text-left text-[#171717] w-full"
            style={{ opacity: 0.92 }}
          >
            <span className="font-medium">{display}</span>
            <span className="ml-0.5 inline-block h-3 w-[2px] translate-y-[1px] bg-[#171717] animate-[blink_1s_ease-in-out_infinite]" style={{ opacity: 0.92 }} />
          </motion.div>
        )}
      </AnimatePresence>
      <style jsx>{`
        @keyframes blink {
          0%, 49% {
            opacity: 1;
          }
          50%, 100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}


