"use client";

import React, { useState, useEffect } from 'react';
import { Copy, ExternalLink, QrCode, Check, Eye, Edit2, Users, Link as LinkIcon, Sparkles } from 'lucide-react';
import { api } from '@/lib/trpc/react';

interface ShareTabProps {
  projectId: string;
}

export const ShareTab: React.FC<ShareTabProps> = ({ projectId }) => {
  const [copied, setCopied] = useState<'link' | 'embed' | null>(null);
  const [customSlug, setCustomSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);

  const { data: shareSettings, isLoading } = api.project.getShareSettings.useQuery({ projectId });
  const updateSettings = api.project.updateShareSettings.useMutation();

  const baseUrl = 'https://surbee.com/s/';
  const surveyUrl = shareSettings?.customSlug
    ? `${baseUrl}${shareSettings.customSlug}`
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
    <div className="share-tab">
      <div className="share-tab-grid">
        {/* Left Column */}
        <div className="share-column">
          {/* Quick Share Section */}
          <div className="share-section">
            <h3 className="share-section-title">Quick Share</h3>
            <p className="share-section-description">
              Share your survey on social media platforms
            </p>

            <div className="share-social-grid">
              <button
                onClick={() => handleSocialShare('facebook')}
                className="share-social-card"
              >
                <div className="share-social-icon facebook">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <span className="share-social-label">Facebook</span>
              </button>

              <button
                onClick={() => handleSocialShare('twitter')}
                className="share-social-card"
              >
                <div className="share-social-icon twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="share-social-label">X (Twitter)</span>
              </button>

              <button
                onClick={() => handleSocialShare('linkedin')}
                className="share-social-card"
              >
                <div className="share-social-icon linkedin">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <span className="share-social-label">LinkedIn</span>
              </button>

              <button
                onClick={() => handleSocialShare('reddit')}
                className="share-social-card"
              >
                <div className="share-social-icon reddit">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                  </svg>
                </div>
                <span className="share-social-label">Reddit</span>
              </button>

              <button
                onClick={() => handleSocialShare('whatsapp')}
                className="share-social-card"
              >
                <div className="share-social-icon whatsapp">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <span className="share-social-label">WhatsApp</span>
              </button>

              <button
                onClick={() => handleSocialShare('email')}
                className="share-social-card"
              >
                <div className="share-social-icon email">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </div>
                <span className="share-social-label">Email</span>
              </button>
            </div>
          </div>

          {/* Get Targeted Participants */}
          <div className="share-section">
            <h3 className="share-section-title">
              <Sparkles className="h-5 w-5 inline-block mr-2" />
              Get Targeted Participants
            </h3>
            <p className="share-section-description">
              Reach qualified respondents who match your target audience
            </p>

            <div className="targeted-participants-card">
              <div className="targeted-participants-icon">
                <Users className="h-6 w-6" />
              </div>
              <div className="targeted-participants-content">
                <h4 className="targeted-participants-title">Purchase Panel Responses</h4>
                <p className="targeted-participants-desc">
                  Get responses from our verified panel of participants. Target by demographics, interests, and behaviors.
                </p>
                <ul className="targeted-participants-features">
                  <li>✓ High-quality responses</li>
                  <li>✓ Demographic targeting</li>
                  <li>✓ Fast turnaround (24-48hrs)</li>
                  <li>✓ Verified participants</li>
                </ul>
              </div>
              <button className="targeted-participants-btn">
                Get Started
              </button>
            </div>
          </div>

          {/* Link Customization */}
          <div className="share-section">
            <h3 className="share-section-title">Custom Link</h3>
            <p className="share-section-description">
              Create a memorable, branded URL for your survey
            </p>

            <div className="custom-link-container">
              <div className="custom-link-preview">
                <span className="custom-link-base">{baseUrl}</span>
                {isEditingSlug ? (
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    className="custom-link-input"
                    placeholder="your-custom-slug"
                    maxLength={50}
                  />
                ) : (
                  <span className="custom-link-slug">{customSlug || projectId}</span>
                )}
              </div>

              <div className="custom-link-actions">
                {isEditingSlug ? (
                  <>
                    <button onClick={handleSaveCustomSlug} className="custom-link-save-btn">
                      Save
                    </button>
                    <button onClick={() => setIsEditingSlug(false)} className="custom-link-cancel-btn">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsEditingSlug(true)} className="custom-link-edit-btn">
                    <Edit2 className="h-4 w-4" />
                    Customize
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="share-column">
          {/* Public Link Section */}
          <div className="share-section">
            <h3 className="share-section-title">Survey Link</h3>
            <p className="share-section-description">
              Share this link to collect responses
            </p>

            <div className="share-link-container">
              <div className="share-link-box">
                <LinkIcon className="h-4 w-4 share-link-icon" />
                <input
                  type="text"
                  value={surveyUrl}
                  readOnly
                  className="share-link-input"
                />
                <button
                  onClick={() => handleCopy(surveyUrl, 'link')}
                  className="share-copy-btn"
                >
                  {copied === 'link' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <button onClick={() => window.open(surveyUrl, '_blank')} className="share-open-btn">
                <ExternalLink className="h-4 w-4" />
                <span>Open Survey</span>
              </button>
            </div>
          </div>

          {/* Link Preview Settings */}
          <div className="share-section">
            <h3 className="share-section-title">Link Preview Settings</h3>
            <p className="share-section-description">
              Customize how your survey appears when shared on social media
            </p>

            <div className="link-settings-form">
              <div className="link-settings-field">
                <label className="link-settings-label">
                  <Eye className="h-4 w-4" />
                  Preview Title
                </label>
                <input
                  type="text"
                  value={shareSettings?.ogTitle || ''}
                  onChange={(e) => handleUpdateLinkSettings('ogTitle', e.target.value)}
                  className="link-settings-input"
                  placeholder="Your Survey Title"
                  maxLength={60}
                />
                <span className="link-settings-hint">Recommended: 40-60 characters</span>
              </div>

              <div className="link-settings-field">
                <label className="link-settings-label">Description</label>
                <textarea
                  value={shareSettings?.ogDescription || ''}
                  onChange={(e) => handleUpdateLinkSettings('ogDescription', e.target.value)}
                  className="link-settings-textarea"
                  placeholder="Describe your survey..."
                  maxLength={155}
                  rows={3}
                />
                <span className="link-settings-hint">Recommended: 120-155 characters</span>
              </div>

              <div className="link-settings-field">
                <label className="link-settings-label">Thumbnail Image URL</label>
                <input
                  type="url"
                  value={shareSettings?.ogImage || ''}
                  onChange={(e) => handleUpdateLinkSettings('ogImage', e.target.value)}
                  className="link-settings-input"
                  placeholder="https://example.com/image.jpg"
                />
                <span className="link-settings-hint">Recommended: 1200x630px</span>
              </div>

              {shareSettings?.ogImage && (
                <div className="link-preview-card">
                  <img src={shareSettings.ogImage} alt="Preview" className="link-preview-image" />
                  <div className="link-preview-content">
                    <h4 className="link-preview-title">{shareSettings.ogTitle || 'Survey Title'}</h4>
                    <p className="link-preview-desc">{shareSettings.ogDescription || 'Survey description...'}</p>
                    <span className="link-preview-url">{surveyUrl}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Embed Code Section */}
          <div className="share-section">
            <h3 className="share-section-title">Embed Code</h3>
            <p className="share-section-description">
              Embed this survey directly on your website
            </p>

            <div className="share-code-container">
              <pre className="share-code-box">{embedCode}</pre>
              <button
                onClick={() => handleCopy(embedCode, 'embed')}
                className="share-copy-btn-absolute"
              >
                {copied === 'embed' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="share-section">
            <h3 className="share-section-title">QR Code</h3>
            <p className="share-section-description">
              Download QR code for print materials and offline distribution
            </p>

            <div className="share-qr-container">
              <div className="share-qr-placeholder">
                <QrCode className="h-24 w-24" />
              </div>
              <button className="share-download-btn">
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
