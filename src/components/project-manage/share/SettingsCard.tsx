"use client";

import React from 'react';
import { Settings } from 'lucide-react';
import styles from './share.module.css';

interface Setting {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

interface SettingsCardProps {
  settings: Setting[];
  onToggle: (id: string, enabled: boolean) => void;
}

export function SettingsCard({ settings, onToggle }: SettingsCardProps) {
  return (
    <div className={`${styles.card} ${styles.settingsCard}`}>
      <div className={styles.cardTitle}>
        <Settings size={16} />
        Share Settings
      </div>

      {settings.map((setting) => (
        <div key={setting.id} className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <div className={styles.settingLabel}>{setting.label}</div>
            <div className={styles.settingDescription}>{setting.description}</div>
          </div>
          <button
            className={`${styles.toggle} ${setting.enabled ? styles.toggleActive : ''}`}
            onClick={() => onToggle(setting.id, !setting.enabled)}
            role="switch"
            aria-checked={setting.enabled}
          />
        </div>
      ))}
    </div>
  );
}

export default SettingsCard;
