"use client";

import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, Check, ChevronRight, Link2, QrCode, Code2, Share2, Download, Globe, Eye } from 'lucide-react';
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

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(surveyUrl)}&bgcolor=ffffff&color=000000&format=png`;

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
    <section
      style={{
        width: '100%',
        padding: '40px 40px 60px',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          marginLeft: 'auto',
          marginRight: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
            borderRadius: '6px',
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--surbee-bg-primary, #fff)',
              borderRadius: '6px',
              flexShrink: 0,
            }}
          >
            <Link2 size={24} style={{ color: 'var(--surbee-fg-tertiary)' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: '12px',
                color: 'var(--surbee-fg-tertiary)',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Survey Link
            </div>
            <div
              style={{
                fontSize: '14px',
                color: 'var(--surbee-fg-primary)',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}
            >
              {surveyUrl}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={() => handleCopy(surveyUrl, 'link')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                backgroundColor: copied === 'link' ? '#22c55e' : 'var(--surbee-fg-primary)',
                color: 'var(--surbee-bg-primary, #fff)',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {copied === 'link' ? <Check size={16} /> : <Copy size={16} />}
              {copied === 'link' ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={() => window.open(surveyUrl, '_blank')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px',
                backgroundColor: 'var(--surbee-bg-primary, #fff)',
                color: 'var(--surbee-fg-primary)',
                border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
              borderRadius: '6px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)',
                marginBottom: '12px',
              }}
            />
            <div style={{ fontSize: '20px', fontWeight: 500, color: 'var(--surbee-fg-primary)', marginBottom: '4px' }}>
              Live
            </div>
            <div style={{ fontSize: '12px', color: 'var(--surbee-fg-tertiary)' }}>
              Accepting responses
            </div>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
              borderRadius: '6px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Eye size={20} style={{ color: 'var(--surbee-fg-tertiary)', marginBottom: '12px' }} />
            <div style={{ fontSize: '20px', fontWeight: 500, color: 'var(--surbee-fg-primary)', marginBottom: '4px' }}>
              --
            </div>
            <div style={{ fontSize: '12px', color: 'var(--surbee-fg-tertiary)' }}>
              Views
            </div>
          </div>
        </div>

        {/* Two Column Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Custom URL Card */}
          <div
            style={{
              backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
              borderRadius: '6px',
              padding: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <Globe size={16} style={{ color: 'var(--surbee-fg-tertiary)' }} />
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>
                Custom URL
              </span>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surbee-bg-primary, #fff)',
                borderRadius: '6px',
                padding: '14px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--surbee-fg-tertiary)', fontFamily: 'monospace' }}>
                {baseUrl}
              </span>
              {isEditingSlug ? (
                <input
                  type="text"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="your-slug"
                  autoFocus
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    fontSize: '12px',
                    color: 'var(--surbee-fg-primary)',
                    fontFamily: 'monospace',
                    outline: 'none',
                  }}
                />
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--surbee-fg-primary)', fontFamily: 'monospace' }}>
                  {customSlug || projectId.slice(0, 8)}
                </span>
              )}
            </div>

            {isEditingSlug ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSaveCustomSlug}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: 'var(--surbee-fg-primary)',
                    color: 'var(--surbee-bg-primary, #fff)',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingSlug(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: 'var(--surbee-bg-primary, #fff)',
                    color: 'var(--surbee-fg-tertiary)',
                    border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingSlug(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: 'var(--surbee-fg-primary)',
                  border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Customize <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* QR Code Card */}
          <div
            style={{
              backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
              borderRadius: '6px',
              padding: '20px',
              display: 'flex',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: '100px',
                height: '100px',
                backgroundColor: 'var(--surbee-bg-primary, #fff)',
                borderRadius: '6px',
                padding: '8px',
                flexShrink: 0,
              }}
            >
              <img src={qrCodeUrl} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <QrCode size={16} style={{ color: 'var(--surbee-fg-tertiary)' }} />
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>
                  QR Code
                </span>
              </div>
              <div style={{ flex: 1 }} />
              <button
                onClick={handleDownloadQR}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: 'var(--surbee-fg-primary)',
                  border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <Download size={14} />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Embed Code Card */}
        <div
          style={{
            backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
            borderRadius: '6px',
            padding: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <Code2 size={16} style={{ color: 'var(--surbee-fg-tertiary)' }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>
              Embed Code
            </span>
          </div>

          <div
            style={{
              backgroundColor: 'var(--surbee-bg-primary, #fff)',
              borderRadius: '6px',
              padding: '14px',
              marginBottom: '16px',
            }}
          >
            <code
              style={{
                fontSize: '11px',
                color: 'var(--surbee-fg-secondary)',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                lineHeight: '1.5',
              }}
            >
              {embedCode}
            </code>
          </div>

          <button
            onClick={() => handleCopy(embedCode, 'embed')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: copied === 'embed' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
              color: copied === 'embed' ? '#22c55e' : 'var(--surbee-fg-primary)',
              border: `1px solid ${copied === 'embed' ? 'rgba(34, 197, 94, 0.3)' : 'var(--surbee-bg-tertiary, #e5e5e5)'}`,
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {copied === 'embed' ? <Check size={14} /> : <Copy size={14} />}
            {copied === 'embed' ? 'Copied' : 'Copy Code'}
          </button>
        </div>

        {/* Social Share Card */}
        <div
          style={{
            backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
            borderRadius: '6px',
            padding: '20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            <Share2 size={16} style={{ color: 'var(--surbee-fg-tertiary)' }} />
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>
              Share on Social
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {socialPlatforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleSocialShare(platform.id)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--surbee-bg-primary, #fff)',
                  color: 'var(--surbee-fg-primary)',
                  border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {platform.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShareTabRedesign;
