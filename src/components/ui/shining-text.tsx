'use client';

import { motion } from 'framer-motion';
import React from 'react';

export function ShiningText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`relative inline-block ${className}`} style={{ color: 'rgb(235,235,235)' }}>
      <span>{text}</span>
      <motion.span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        style={{ mixBlendMode: 'overlay' }}
      />
    </div>
  );
}


