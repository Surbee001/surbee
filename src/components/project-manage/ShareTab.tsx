"use client";

import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, QrCode, Check, Eye, Edit2, Users, Link as LinkIcon, Sparkles } from 'lucide-react';
import { api } from '@/lib/trpc/react';

interface ShareTabProps {
  projectId: string;
  publishedUrl?: string | null;
}

export const ShareTab: React.FC<ShareTabProps> = ({ projectId, publishedUrl }) => {
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const { data: shareSettings, isLoading } = api.project.getShareSettings.useQuery({ projectId });
  const updateSettings = api.project.updateShareSettings.useMutation();

  // Use window.location.origin for local dev, surbee.com for production
  const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? `${window.location.origin}/s/`
    : 'https://surbee.com/s/';

  // Priority: customSlug > publishedUrl > projectId
  const surveyUrl = shareSettings?.customSlug
    ? `${baseUrl}${shareSettings.customSlug}`
    : publishedUrl
      ? `${baseUrl}${publishedUrl}`
      : `${baseUrl}${projectId}`;
  const embedCode = `<iframe src="${surveyUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  useEffect(() => {
    if (shareSettings?.customSlug) {
      setCustomSlug(shareSettings.customSlug);
    }
  }, [shareSettings]);

  const handleCopy = (text: string, type: 'link' | 'embed') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveCustomSlug = async () => {
    if (customSlug && customSlug !== projectId) {
      await updateSettings.mutateAsync({
        projectId,
        customSlug,
      });
    }
    setIsEditingSlug(false);
  };

  const handleSocialShare = (platform: string) => {
    const title = shareSettings?.ogTitle || 'Check out this survey!';
    const description = shareSettings?.ogDescription || 'Please participate in this survey';

    const shareUrls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(surveyUrl)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(surveyUrl)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(surveyUrl)}`,
      reddit: `https://reddit.com/submit?url=${encodeURIComponent(surveyUrl)}&title=${encodeURIComponent(title)}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${surveyUrl}`)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${description}\n\n${surveyUrl}`)}`,
    };

    if (platform === 'email' || platform === 'whatsapp') {
      window.location.href = shareUrls[platform];
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleUpdateLinkSettings = async (field: string, value: any) => {
    await updateSettings.mutateAsync({
      projectId,
      [field]: value,
    });
  };

  return (
    <div style={{
      padding: '0 32px 32px 32px',
      maxWidth: '1400px',
      margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '16px',
      }}>
        {/* Survey Link */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
            Survey Link
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 20px 0' }}>
            Share this link to collect responses
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '12px 16px',
            }}>
              <LinkIcon className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)', flexShrink: 0 }} />
              <input
                type="text"
                value={surveyUrl}
                readOnly
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => handleCopy(surveyUrl, 'link')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {copied === 'link' ? (
                  <Check className="h-4 w-4" style={{ color: 'white' }} />
                ) : (
                  <Copy className="h-4 w-4" style={{ color: 'white' }} />
                )}
              </button>
            </div>
          </div>

          <button
            onClick={() => window.open(surveyUrl, '_blank')}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <ExternalLink className="h-4 w-4" />
            Open Survey
          </button>
        </div>

        {/* Custom Link */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
            Custom Link
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 20px 0' }}>
            Create a memorable, branded URL
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '12px',
          }}>
            <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '14px' }}>{baseUrl}</span>
            {isEditingSlug ? (
              <input
                type="text"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
                placeholder="your-custom-slug"
                maxLength={50}
              />
            ) : (
              <span style={{ color: 'white', fontSize: '14px', fontFamily: 'monospace' }}>
                {customSlug || projectId}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {isEditingSlug ? (
              <>
                <button
                  onClick={handleSaveCustomSlug}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#0f0f0f',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingSlug(false)}
                  style={{
                    flex: 1,
                    padding: '10px 16px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditingSlug(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
              >
                <Edit2 className="h-4 w-4" />
                Customize
              </button>
            )}
          </div>
        </div>

        {/* Embed Code */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
            Embed Code
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 20px 0' }}>
            Embed this survey on your website
          </p>

          <div style={{ position: 'relative' }}>
            <pre style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '16px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '12px',
              fontFamily: 'monospace',
              overflowX: 'auto',
              margin: 0,
            }}>
              {embedCode}
            </pre>
            <button
              onClick={() => handleCopy(embedCode, 'embed')}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '6px',
                padding: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {copied === 'embed' ? (
                <Check className="h-4 w-4" style={{ color: 'white' }} />
              ) : (
                <Copy className="h-4 w-4" style={{ color: 'white' }} />
              )}
            </button>
          </div>
        </div>

        {/* QR Code */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
            QR Code
          </h3>
          <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 20px 0' }}>
            For print materials and offline distribution
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              padding: '32px',
            }}>
              <QrCode className="h-24 w-24" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
            </div>
            <button style={{
              width: '100%',
              padding: '10px 16px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}>
              Download QR Code
            </button>
          </div>
        </div>
      </div>

      {/* Social Share */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '16px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
          Share on Social Media
        </h3>
        <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: '0 0 20px 0' }}>
          Quick share to your favorite platforms
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}>
          {[
            { name: 'Facebook', platform: 'facebook' },
            { name: 'X (Twitter)', platform: 'twitter' },
            { name: 'LinkedIn', platform: 'linkedin' },
            { name: 'Reddit', platform: 'reddit' },
            { name: 'WhatsApp', platform: 'whatsapp' },
            { name: 'Email', platform: 'email' },
          ].map((social) => (
            <button
              key={social.platform}
              onClick={() => handleSocialShare(social.platform)}
              style={{
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                borderRadius: '8px',
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
            >
              {social.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
