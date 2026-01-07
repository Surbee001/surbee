"use client";

import React, { useState } from 'react';
import { Link2, Copy, Check, ExternalLink } from 'lucide-react';
import styles from './share.module.css';

interface SurveyLinkCardProps {
  surveyUrl: string;
}

export function SurveyLinkCard({ surveyUrl }: SurveyLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(surveyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    window.open(surveyUrl, '_blank');
  };

  return (
    <div className={styles.heroCard}>
      <div className={styles.heroIcon}>
        <Link2 size={22} />
      </div>

      <div className={styles.heroContent}>
        <div className={styles.heroLabel}>Survey Link</div>
        <div className={styles.heroUrl}>{surveyUrl}</div>
      </div>

      <div className={styles.heroActions}>
        <button
          onClick={handleCopy}
          className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button onClick={handleOpen} className={styles.openBtn}>
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
}

export default SurveyLinkCard;
