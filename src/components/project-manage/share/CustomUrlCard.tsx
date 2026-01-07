"use client";

import React, { useState, useEffect } from 'react';
import { Globe, ChevronRight } from 'lucide-react';
import styles from './share.module.css';

interface CustomUrlCardProps {
  baseUrl: string;
  currentSlug: string;
  projectId: string;
  onSaveSlug: (slug: string) => Promise<void>;
}

export function CustomUrlCard({ baseUrl, currentSlug, projectId, onSaveSlug }: CustomUrlCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [slug, setSlug] = useState(currentSlug);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSlug(currentSlug);
  }, [currentSlug]);

  const handleSave = async () => {
    if (slug && slug !== projectId) {
      setIsSaving(true);
      try {
        await onSaveSlug(slug);
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow lowercase letters, numbers, and hyphens
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(value);
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>
        <Globe size={16} />
        Custom URL
      </div>

      <div className={styles.urlInput}>
        <span className={styles.urlPrefix}>{baseUrl}</span>
        {isEditing ? (
          <input
            type="text"
            value={slug}
            onChange={handleSlugChange}
            placeholder="your-custom-slug"
            autoFocus
            className={styles.slugInput}
          />
        ) : (
          <span className={styles.urlSlug}>{slug || projectId.slice(0, 8)}</span>
        )}
      </div>

      {isEditing ? (
        <div className={styles.btnRow}>
          <button onClick={handleSave} disabled={isSaving} className={styles.saveBtn}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
            Cancel
          </button>
        </div>
      ) : (
        <button onClick={() => setIsEditing(true)} className={styles.customizeBtn}>
          Customize
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

export default CustomUrlCard;
