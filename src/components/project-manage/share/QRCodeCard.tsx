"use client";

import React from 'react';
import { QrCode, Download } from 'lucide-react';
import styles from './share.module.css';

interface QRCodeCardProps {
  surveyUrl: string;
  projectId: string;
}

export function QRCodeCard({ surveyUrl, projectId }: QRCodeCardProps) {
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(surveyUrl)}&bgcolor=ffffff&color=000000&format=png`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `survey-qr-${projectId}.png`;
    link.href = qrCodeUrl;
    link.target = '_blank';
    link.click();
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>
        <QrCode size={16} />
        QR Code
      </div>

      <div className={styles.qrCard}>
        <div className={styles.qrCodeWrapper}>
          <img src={qrCodeUrl} alt="QR Code" />
        </div>

        <div className={styles.qrContent}>
          <p className={styles.qrDescription}>
            Scan this QR code to open your survey directly on any mobile device.
          </p>
          <button onClick={handleDownload} className={styles.downloadBtn}>
            <Download size={14} />
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}

export default QRCodeCard;
