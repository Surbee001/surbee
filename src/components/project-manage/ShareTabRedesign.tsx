"use client";

import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, Check, ChevronRight, Link2, QrCode, Code2, Share2, Download, Globe, Users, Eye } from 'lucide-react';
import { api } from '@/lib/trpc/react';

interface ShareTabRedesignProps {
  projectId: string;
  publishedUrl?: string | null;
}

export const ShareTabRedesign: React.FC<ShareTabRedesignProps> = ({ projectId, publishedUrl }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const { data: shareSettings } = api.project.getShareSettings.useQuery({ projectId });
  const updateSettings = api.project.updateShareSettings.useMutation();

  const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? `${window.location.origin}/s/`
    : 'https://surbee.com/s/';

  const surveyUrl = shareSettings?.customSlug
    ? `${baseUrl}${shareSettings.customSlug}`
    : publishedUrl
      ? `${baseUrl}${publishedUrl}`
      : `${baseUrl}${projectId}`;

  const embedCode = `<iframe src="${surveyUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  // QR Code URL using API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(surveyUrl)}&bgcolor=transparent&color=ffffff&format=png`;

  useEffect(() => {
    if (shareSettings?.customSlug) {
      setCustomSlug(shareSettings.customSlug);
    }
  }, [shareSettings]);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveCustomSlug = async () => {
    if (customSlug && customSlug !== projectId) {
      await updateSettings.mutateAsync({ projectId, customSlug });
    }
    setIsEditingSlug(false);
  };

  const handleDownloadQR = async () => {
    const link = document.createElement('a');
    link.download = `survey-qr-${projectId}.png`;
    link.href = qrCodeUrl;
    link.target = '_blank';
    link.click();
  };

  const socialPlatforms = [
    { id: 'twitter', label: 'X' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'email', label: 'Email' },
  ];

  const handleSocialShare = (platform: string) => {
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(surveyUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(surveyUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(surveyUrl)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(surveyUrl)}`,
      email: `mailto:?body=${encodeURIComponent(surveyUrl)}`,
    };

    if (platform === 'email') {
      window.location.href = urls[platform];
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="share-root">
      {/* Bento Grid */}
      <div className="share-bento">
        {/* Main Link Card - Large */}
        <div className="bento-card link-hero">
          <div className="hero-icon">
            <Link2 size={24} />
          </div>
          <div className="hero-content">
            <div className="hero-label">Survey Link</div>
            <div className="hero-url">{surveyUrl}</div>
          </div>
          <div className="hero-actions">
            <button
              className={`hero-btn primary ${copied === 'link' ? 'copied' : ''}`}
              onClick={() => handleCopy(surveyUrl, 'link')}
            >
              {copied === 'link' ? <Check size={16} /> : <Copy size={16} />}
              {copied === 'link' ? 'Copied' : 'Copy'}
            </button>
            <button
              className="hero-btn secondary"
              onClick={() => window.open(surveyUrl, '_blank')}
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* Status Card */}
        <div className="bento-card status-card">
          <div className="status-indicator active" />
          <div className="status-text">Live</div>
          <div className="status-label">Accepting responses</div>
        </div>

        {/* Views Stat (placeholder) */}
        <div className="bento-card stat-card">
          <div className="stat-icon">
            <Eye size={18} />
          </div>
          <div className="stat-number">--</div>
          <div className="stat-label">Views</div>
        </div>

        {/* Custom URL Card */}
        <div className="bento-card custom-url-card">
          <div className="card-header">
            <Globe size={16} />
            <span>Custom URL</span>
          </div>

          <div className="url-editor">
            <span className="url-base">{baseUrl}</span>
            {isEditingSlug ? (
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="your-slug"
                className="slug-input"
                autoFocus
              />
            ) : (
              <span className="slug-text">{customSlug || projectId.slice(0, 8)}</span>
            )}
          </div>

          {isEditingSlug ? (
            <div className="edit-buttons">
              <button className="btn-save" onClick={handleSaveCustomSlug}>Save</button>
              <button className="btn-cancel" onClick={() => setIsEditingSlug(false)}>Cancel</button>
            </div>
          ) : (
            <button className="btn-edit" onClick={() => setIsEditingSlug(true)}>
              Customize
              <ChevronRight size={14} />
            </button>
          )}
        </div>

        {/* QR Code Card */}
        <div className="bento-card qr-card">
          <div className="qr-preview">
            <img src={qrCodeUrl} alt="QR Code" />
          </div>
          <div className="qr-info">
            <div className="card-header">
              <QrCode size={16} />
              <span>QR Code</span>
            </div>
            <button className="btn-download" onClick={handleDownloadQR}>
              <Download size={14} />
              Download
            </button>
          </div>
        </div>

        {/* Embed Card */}
        <div className="bento-card embed-card">
          <div className="card-header">
            <Code2 size={16} />
            <span>Embed Code</span>
          </div>
          <div className="embed-preview">
            <code>{embedCode}</code>
          </div>
          <button
            className={`btn-copy ${copied === 'embed' ? 'copied' : ''}`}
            onClick={() => handleCopy(embedCode, 'embed')}
          >
            {copied === 'embed' ? <Check size={14} /> : <Copy size={14} />}
            {copied === 'embed' ? 'Copied' : 'Copy Code'}
          </button>
        </div>

        {/* Social Share Card */}
        <div className="bento-card social-card">
          <div className="card-header">
            <Share2 size={16} />
            <span>Share</span>
          </div>
          <div className="social-buttons">
            {socialPlatforms.map((platform) => (
              <button
                key={platform.id}
                className="social-btn"
                onClick={() => handleSocialShare(platform.id)}
              >
                {platform.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tips Card */}
        <div className="bento-card tips-card">
          <div className="tips-badge">Tips</div>
          <div className="tips-content">
            Share your survey on social media during <strong>peak hours</strong> (9-11 AM, 7-9 PM) for best response rates.
          </div>
        </div>
      </div>

      <style jsx>{`
        .share-root {
          --font-display: 'Kalice Regular', 'Kalice-Trial-Regular', Georgia, serif;
          --font-body: var(--font-inter, 'Sohne', -apple-system, sans-serif);
          --font-mono: 'Menlo', 'Monaco', 'Courier New', monospace;
          --accent: #091717;

          font-family: var(--font-body);
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        /* Bento Grid */
        .share-bento {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: minmax(100px, auto);
          gap: 16px;
        }

        @media (max-width: 1000px) {
          .share-bento { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .share-bento { grid-template-columns: 1fr; }
        }

        .bento-card {
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          transition: transform 0.2s ease;
        }

        .bento-card:hover {
          transform: translateY(-2px);
        }

        /* Link Hero Card */
        .link-hero {
          grid-column: span 3;
          flex-direction: row;
          align-items: center;
          gap: 20px;
        }

        @media (max-width: 1000px) {
          .link-hero { grid-column: span 2; }
        }

        @media (max-width: 600px) {
          .link-hero {
            grid-column: span 1;
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .hero-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 12px;
          color: var(--surbee-fg-muted, #888);
          flex-shrink: 0;
        }

        .hero-content {
          flex: 1;
          min-width: 0;
        }

        .hero-label {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }

        .hero-url {
          font-family: var(--font-mono);
          font-size: 14px;
          word-break: break-all;
          line-height: 1.4;
        }

        .hero-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .hero-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hero-btn.primary {
          background: var(--surbee-fg-primary, #E8E8E8);
          color: var(--surbee-bg-primary, #131314);
        }

        .hero-btn.primary:hover {
          opacity: 0.9;
        }

        .hero-btn.primary.copied {
          background: #22c55e;
          color: white;
        }

        .hero-btn.secondary {
          background: var(--surbee-bg-tertiary, #252526);
          color: var(--surbee-fg-primary, #E8E8E8);
          padding: 12px;
        }

        .hero-btn.secondary:hover {
          background: var(--surbee-bg-elevated, #1E1E1F);
        }

        /* Status Card */
        .status-card {
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-bottom: 12px;
          animation: pulse 2s ease infinite;
        }

        .status-indicator.active {
          background: #22c55e;
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.5);
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .status-text {
          font-family: var(--font-display);
          font-size: 24px;
          margin-bottom: 4px;
        }

        .status-label {
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
        }

        /* Stat Card */
        .stat-card {
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 10px;
          color: var(--surbee-fg-muted, #888);
          margin-bottom: 12px;
        }

        .stat-number {
          font-family: var(--font-mono);
          font-size: 28px;
          font-weight: 500;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        /* Custom URL Card */
        .custom-url-card {
          grid-column: span 2;
        }

        @media (max-width: 600px) {
          .custom-url-card { grid-column: span 1; }
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
          color: var(--surbee-fg-muted, #888);
        }

        .url-editor {
          display: flex;
          align-items: center;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .url-base {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
          flex-shrink: 0;
        }

        .slug-input {
          flex: 1;
          background: transparent;
          border: none;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--surbee-fg-primary, #E8E8E8);
          outline: none;
          min-width: 0;
        }

        .slug-text {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .btn-edit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px;
          background: transparent;
          border: 1px solid var(--surbee-border-primary, rgba(255,255,255,0.1));
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-edit:hover {
          background: var(--surbee-bg-tertiary, #252526);
        }

        .edit-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-save, .btn-cancel {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-save {
          background: var(--surbee-fg-primary, #E8E8E8);
          color: var(--surbee-bg-primary, #131314);
        }

        .btn-cancel {
          background: var(--surbee-bg-tertiary, #252526);
          color: var(--surbee-fg-muted, #888);
        }

        /* QR Code Card */
        .qr-card {
          grid-column: span 2;
          flex-direction: row;
          align-items: center;
          gap: 20px;
        }

        @media (max-width: 600px) {
          .qr-card { grid-column: span 1; }
        }

        .qr-preview {
          width: 100px;
          height: 100px;
          flex-shrink: 0;
        }

        .qr-preview img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .qr-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .btn-download {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: transparent;
          border: 1px solid var(--surbee-border-primary, rgba(255,255,255,0.1));
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-download:hover {
          background: var(--surbee-bg-tertiary, #252526);
        }

        /* Embed Card */
        .embed-card {
          grid-column: span 2;
        }

        @media (max-width: 600px) {
          .embed-card { grid-column: span 1; }
        }

        .embed-preview {
          flex: 1;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .embed-preview code {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--surbee-fg-muted, #888);
          word-break: break-all;
          line-height: 1.5;
        }

        .btn-copy {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: transparent;
          border: 1px solid var(--surbee-border-primary, rgba(255,255,255,0.1));
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-copy:hover {
          background: var(--surbee-bg-tertiary, #252526);
        }

        .btn-copy.copied {
          background: rgba(34, 197, 94, 0.15);
          border-color: rgba(34, 197, 94, 0.3);
          color: #22c55e;
        }

        /* Social Card */
        .social-card {
          grid-column: span 2;
        }

        @media (max-width: 600px) {
          .social-card { grid-column: span 1; }
        }

        .social-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: auto;
        }

        .social-btn {
          padding: 10px 16px;
          background: var(--surbee-bg-tertiary, #252526);
          border: none;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .social-btn:hover {
          background: var(--surbee-bg-elevated, #1E1E1F);
          transform: translateY(-1px);
        }

        /* Tips Card */
        .tips-card {
          grid-column: span 2;
          background: var(--accent);
          color: #0a0a0a;
        }

        @media (max-width: 600px) {
          .tips-card { grid-column: span 1; }
        }

        .tips-badge {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 8px;
          background: rgba(0,0,0,0.1);
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 12px;
        }

        .tips-content {
          font-size: 14px;
          line-height: 1.6;
        }

        .tips-content strong {
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ShareTabRedesign;
