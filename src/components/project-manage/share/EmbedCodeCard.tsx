"use client";

import React, { useState } from 'react';
import { Code2, Copy, Check } from 'lucide-react';
import styles from './share.module.css';

interface EmbedCodeCardProps {
  surveyUrl: string;
}

export function EmbedCodeCard({ surveyUrl }: EmbedCodeCardProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<iframe
  src="${surveyUrl}"
  width="100%"
  height="600"
  frameborder="0"
  style="border: none; border-radius: 8px;"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${styles.card} ${styles.embedCard}`}>
      <div className={styles.cardTitle}>
        <Code2 size={16} />
        Embed Code
      </div>

      <div className={styles.codeBlock}>
        <code>{embedCode}</code>
      </div>

      <button
        onClick={handleCopy}
        className={`${styles.copyCodeBtn} ${copied ? styles.copyCodeBtnSuccess : ''}`}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        {copied ? 'Copied' : 'Copy Code'}
      </button>
    </div>
  );
}

export default EmbedCodeCard;
