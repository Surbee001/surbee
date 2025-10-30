"use client";

import React from "react";
import { motion } from "framer-motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  amount?: number;
  delay?: number;
};

export function RevealSection({ children, className, y = 12, duration = 0.35, amount = 0.35, delay = 0 }: RevealProps) {
  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: "easeOut", delay }}
    >
      {children}
    </motion.section>
  );
}

export function RevealDiv({ children, className, y = 10, duration = 0.3, amount = 0.35, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}


