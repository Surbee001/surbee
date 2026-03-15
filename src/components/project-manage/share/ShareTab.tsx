"use client";

import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Code2, Share2, Mail, Lock, Eye, EyeOff, Image as ImageIcon, Type, FileText } from 'lucide-react';
import { api } from '@/lib/trpc/react';

interface ShareTabProps {
  projectId: string;
  publishedUrl?: string | null;
}

type SubTab = 'sharing' | 'settings';

// Social icons
const TwitterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const LinkedInIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const FacebookIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export function ShareTab({ projectId, publishedUrl }: ShareTabProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('sharing');
  const [copied, setCopied] = useState<string | null>(null);
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [hideBadge, setHideBadge] = useState(false);
  const [requirePassword, setRequirePassword] = useState(false);
  const [acceptResponses, setAcceptResponses] = useState(true);

  const { data: shareSettings, refetch } = api.project.getShareSettings.useQuery({ projectId });
  const updateSettings = api.project.updateShareSettings.useMutation({ onSuccess: () => refetch() });

  useEffect(() => {
    if (shareSettings) {
      setOgTitle(shareSettings.ogTitle || '');
      setOgDescription(shareSettings.ogDescription || '');
      setOgImage(shareSettings.ogImage || '');
      setCustomSlug(shareSettings.customSlug || '');
    }
  }, [shareSettings]);

  const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://form.localhost:3000/'
    : 'https://form.surbee.dev/';

  const surveyUrl = shareSettings?.customSlug
    ? `${baseUrl}${shareSettings.customSlug}`
    : publishedUrl
      ? `${baseUrl}${publishedUrl}`
      : `${baseUrl}${projectId}`;

  const embedCode = `<iframe src="${surveyUrl}" width="100%" height="600" frameborder="0" style="border: none; border-radius: 8px;"></iframe>`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSaveSlug = async () => {
    if (customSlug.trim()) {
      await updateSettings.mutateAsync({ projectId, customSlug: customSlug.trim() });
    }
    setIsEditingSlug(false);
  };

  const handleSaveOg = async () => {
    await updateSettings.mutateAsync({
      projectId,
      ogTitle: ogTitle || undefined,
      ogDescription: ogDescription || undefined,
      ogImage: ogImage || undefined,
    });
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(surveyUrl);
    const encodedTitle = encodeURIComponent(ogTitle || 'Take my survey');
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    };
    if (platform === 'email') {
      window.location.href = urls[platform];
    } else {
      window.open(urls[platform], '_blank', 'width=600,height=500');
    }
  };

  const tabs: { key: SubTab; label: string }[] = [
    { key: 'sharing', label: 'Sharing' },
    { key: 'settings', label: 'Settings' },
  ];

  const sectionStyle: React.CSSProperties = {
    background: 'var(--surbee-bg-secondary)',
    border: '1px solid var(--surbee-border-primary)',
    borderRadius: '12px',
    padding: '20px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '13px', fontWeight: 600, color: 'var(--surbee-fg-primary)', marginBottom: '8px',
  };

  const descStyle: React.CSSProperties = {
    fontSize: '12px', color: 'var(--surbee-fg-muted)', marginBottom: '12px', lineHeight: 1.5,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--surbee-border-primary)',
    backgroundColor: 'var(--surbee-bg-tertiary)',
    color: 'var(--surbee-fg-primary)', fontSize: '13px',
    fontFamily: 'inherit', outline: 'none',
  };

  const pillBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', fontSize: '14px', fontWeight: 500,
    color: 'var(--surbee-fg-primary)',
    background: active ? 'var(--surbee-accent-subtle, rgba(232, 232, 232, 0.05))' : 'transparent',
    border: active ? 'none' : '1px solid var(--surbee-border-primary)',
    borderRadius: '9999px', cursor: 'pointer',
    transition: 'all 0.2s ease', fontFamily: 'inherit',
  });

  const toggleStyle = (active: boolean): React.CSSProperties => ({
    width: 36, height: 20, borderRadius: 10,
    backgroundColor: active ? '#2563eb' : 'var(--surbee-border-primary)',
    border: 'none', cursor: 'pointer', position: 'relative' as const,
    transition: 'background-color 0.2s', flexShrink: 0,
  });

  const toggleDotStyle = (active: boolean): React.CSSProperties => ({
    width: 16, height: 16, borderRadius: '50%', backgroundColor: '#fff',
    position: 'absolute' as const, top: 2,
    left: active ? 18 : 2, transition: 'left 0.2s',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
  });

  return (
    <div style={{ padding: '32px', height: '100%', overflow: 'auto' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 400, color: 'var(--surbee-fg-primary)', margin: 0, fontFamily: 'Kalice-Trial-Regular, serif' }}>Share</h1>
        </div>

        {/* Pill Tabs */}
        <nav style={{ display: 'flex', gap: '8px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={pillBtnStyle(activeTab === t.key)}>
              {t.label}
            </button>
          ))}
        </nav>

        {/* ─── SHARING TAB ─── */}
        {activeTab === 'sharing' && (
          <>
            {/* Survey Link */}
            <div style={{ ...sectionStyle, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 500, color: 'var(--surbee-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Survey Link</div>
                <div style={{ fontSize: '13px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--surbee-fg-primary)', wordBreak: 'break-all', lineHeight: 1.5 }}>{surveyUrl}</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => handleCopy(surveyUrl, 'link')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                    background: copied === 'link' ? '#22c55e' : 'var(--surbee-fg-primary)',
                    color: copied === 'link' ? '#fff' : 'var(--surbee-bg-primary)',
                    border: 'none', borderRadius: '9999px', fontSize: '13px', fontWeight: 500,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {copied === 'link' ? <Check size={14} /> : <Copy size={14} />}
                  {copied === 'link' ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={() => window.open(surveyUrl, '_blank')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 36, background: 'var(--surbee-bg-tertiary)',
                    color: 'var(--surbee-fg-muted)', border: '1px solid var(--surbee-border-primary)',
                    borderRadius: '9999px', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>

            {/* Custom URL */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Custom URL</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surbee-bg-tertiary)', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--surbee-fg-muted)' }}>{baseUrl}</span>
                {isEditingSlug ? (
                  <input
                    type="text" value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveSlug() }}
                    autoFocus
                    style={{ flex: 1, background: 'transparent', border: 'none', fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--surbee-fg-primary)', outline: 'none' }}
                    placeholder="my-survey"
                  />
                ) : (
                  <span style={{ fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--surbee-fg-primary)', flex: 1 }}>{customSlug || projectId}</span>
                )}
              </div>
              {isEditingSlug ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleSaveSlug} style={{ flex: 1, padding: '8px 16px', background: 'var(--surbee-fg-primary)', color: 'var(--surbee-bg-primary)', border: 'none', borderRadius: '9999px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setIsEditingSlug(false)} style={{ flex: 1, padding: '8px 16px', background: 'var(--surbee-bg-tertiary)', color: 'var(--surbee-fg-secondary)', border: '1px solid var(--surbee-border-primary)', borderRadius: '9999px', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setIsEditingSlug(true)} style={{ width: '100%', padding: '8px 16px', background: 'var(--surbee-bg-tertiary)', color: 'var(--surbee-fg-primary)', border: '1px solid var(--surbee-border-primary)', borderRadius: '9999px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' }}>Customize</button>
              )}
            </div>

            {/* Embed Code */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', ...labelStyle }}><Code2 size={14} /> Embed Code</div>
              <div style={{ background: 'var(--surbee-bg-tertiary)', borderRadius: '8px', padding: '12px', marginBottom: '12px', overflowX: 'auto' }}>
                <code style={{ fontSize: '11px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--surbee-fg-secondary)', lineHeight: 1.6, wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>{embedCode}</code>
              </div>
              <button
                onClick={() => handleCopy(embedCode, 'embed')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
                  background: copied === 'embed' ? 'rgba(34,197,94,0.1)' : 'var(--surbee-bg-tertiary)',
                  color: copied === 'embed' ? '#22c55e' : 'var(--surbee-fg-primary)',
                  border: `1px solid ${copied === 'embed' ? 'rgba(34,197,94,0.3)' : 'var(--surbee-border-primary)'}`,
                  borderRadius: '9999px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {copied === 'embed' ? <Check size={14} /> : <Copy size={14} />}
                {copied === 'embed' ? 'Copied' : 'Copy Code'}
              </button>
            </div>

            {/* Social Share */}
            <div style={sectionStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', ...labelStyle }}><Share2 size={14} /> Share</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { id: 'twitter', label: 'X', Icon: TwitterIcon },
                  { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
                  { id: 'facebook', label: 'Facebook', Icon: FacebookIcon },
                  { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon },
                  { id: 'email', label: 'Email', Icon: Mail },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => handleShare(id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px',
                      background: 'var(--surbee-bg-tertiary)', color: 'var(--surbee-fg-primary)',
                      border: '1px solid var(--surbee-border-primary)', borderRadius: '9999px',
                      fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    }}
                  >
                    {id === 'email' ? <Mail size={14} /> : <Icon />}
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {activeTab === 'settings' && (
          <>
            {/* Share Preview (OG Tags) */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Share Preview</div>
              <p style={descStyle}>Customize how your survey appears when shared on social media.</p>

              {/* Preview card */}
              <div style={{
                border: '1px solid var(--surbee-border-primary)', borderRadius: '10px',
                overflow: 'hidden', marginBottom: '16px',
              }}>
                <div style={{
                  height: 120, background: ogImage ? `url(${ogImage}) center/cover` : 'var(--surbee-bg-tertiary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {!ogImage && <ImageIcon size={24} style={{ color: 'var(--surbee-fg-muted)', opacity: 0.4 }} />}
                </div>
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--surbee-fg-primary)', marginBottom: '4px' }}>{ogTitle || 'Your Survey Title'}</div>
                  <div style={{ fontSize: '12px', color: 'var(--surbee-fg-muted)', lineHeight: 1.4 }}>{ogDescription || 'Add a description for your survey...'}</div>
                  <div style={{ fontSize: '11px', color: 'var(--surbee-fg-muted)', marginTop: '6px', opacity: 0.6 }}>{surveyUrl}</div>
                </div>
              </div>

              {/* OG Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: 'var(--surbee-fg-secondary)', marginBottom: '6px' }}><Type size={12} /> Title</div>
                  <input type="text" value={ogTitle} onChange={(e) => setOgTitle(e.target.value)} onBlur={handleSaveOg} placeholder="Survey title" maxLength={60} style={inputStyle} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: 'var(--surbee-fg-secondary)', marginBottom: '6px' }}><FileText size={12} /> Description</div>
                  <textarea value={ogDescription} onChange={(e) => setOgDescription(e.target.value)} onBlur={handleSaveOg} placeholder="Brief description of your survey" maxLength={155} rows={2} style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 500, color: 'var(--surbee-fg-secondary)', marginBottom: '6px' }}><ImageIcon size={12} /> Image URL</div>
                  <input type="text" value={ogImage} onChange={(e) => setOgImage(e.target.value)} onBlur={handleSaveOg} placeholder="https://..." style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Response Settings */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Response Settings</div>
              {[
                { id: 'accept', label: 'Accept Responses', desc: 'Allow new survey responses', value: acceptResponses, onChange: setAcceptResponses },
              ].map(setting => (
                <div key={setting.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--surbee-border-primary)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--surbee-fg-primary)', marginBottom: '2px' }}>{setting.label}</div>
                    <div style={{ fontSize: '12px', color: 'var(--surbee-fg-muted)' }}>{setting.desc}</div>
                  </div>
                  <button onClick={() => setting.onChange(!setting.value)} style={toggleStyle(setting.value)}>
                    <div style={toggleDotStyle(setting.value)} />
                  </button>
                </div>
              ))}
            </div>

            {/* Access & Privacy */}
            <div style={sectionStyle}>
              <div style={labelStyle}>Access & Privacy</div>

              {/* Password Protection */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--surbee-border-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={14} style={{ color: 'var(--surbee-fg-muted)' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--surbee-fg-primary)', marginBottom: '2px' }}>
                      Require Password
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '9999px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 600 }}>PRO</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--surbee-fg-muted)' }}>Respondents must enter a password to view</div>
                  </div>
                </div>
                <button onClick={() => setRequirePassword(!requirePassword)} style={toggleStyle(requirePassword)}>
                  <div style={toggleDotStyle(requirePassword)} />
                </button>
              </div>

              {/* Hide Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <EyeOff size={14} style={{ color: 'var(--surbee-fg-muted)' }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--surbee-fg-primary)', marginBottom: '2px' }}>
                      Hide "Powered by Surbee"
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '9999px', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontWeight: 600 }}>PRO</span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--surbee-fg-muted)' }}>Remove Surbee branding from your survey</div>
                  </div>
                </div>
                <button onClick={() => setHideBadge(!hideBadge)} style={toggleStyle(hideBadge)}>
                  <div style={toggleDotStyle(hideBadge)} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ShareTab;
