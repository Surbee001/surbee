"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Shield, Eye, EyeOff, AlertTriangle, Trash2, Settings2,
  Check, Copy, ExternalLink, Upload, Image, Lock, MessageSquare, ChevronDown, Info, X
} from 'lucide-react';
import { CipherTier, CIPHER_TIERS, CIPHER_CHECKS, getChecksForTier, CipherCheckId } from '@/lib/cipher/tier-config';

interface ProjectSettingsProps {
  projectId: string;
  onClose?: () => void;
}

type SettingsTab = 'general' | 'privacy' | 'responses' | 'cipher' | 'danger';
type SubscriptionPlan = 'free' | 'pro' | 'max' | 'enterprise';

interface ProjectData {
  id: string;
  title: string;
  description?: string;
  is_public?: boolean;
  settings?: {
    branding?: {
      hideBadge?: boolean;
      customLogo?: string;
      primaryColor?: string;
      backgroundColor?: string;
    };
    notifications?: {
      emailOnResponse?: boolean;
      emailDigest?: 'none' | 'daily' | 'weekly';
    };
    responses?: {
      limitResponses?: boolean;
      maxResponses?: number;
      closeAfterDate?: string;
      showThankYouPage?: boolean;
      thankYouMessage?: string;
      redirectUrl?: string;
    };
    privacy?: {
      passwordProtected?: boolean;
      password?: string;
      collectIpAddresses?: boolean;
    };
    project?: {
      showProgressBar?: boolean;
      showQuestionNumbers?: boolean;
      randomizeQuestions?: boolean;
      randomizeOptions?: boolean;
    };
  };
  published_url?: string;
}

interface ShareSettings {
  ogImage?: string;
  ogDescription?: string;
  customSlug?: string;
  iconUrl?: string;
}

// Pro Badge Component - blue pill matching dashboard model selector
function ProBadge({ className = '', isPro, onClick }: { className?: string; isPro: boolean; onClick: () => void }) {
  if (isPro) return null;
  return (
    <button
      type="button"
      className={`inline-flex items-center h-4 px-2 rounded-2xl text-[0.5625rem] font-medium uppercase ${className}`}
      style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', cursor: 'pointer' }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      Pro
    </button>
  );
}

export function ProjectSettings({ projectId, onClose }: ProjectSettingsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [userPlan, setUserPlan] = useState<SubscriptionPlan>('free');

  // File upload refs
  const iconFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Project data state
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [shareSettings, setShareSettings] = useState<ShareSettings>({});

  // Check if user is Pro or higher
  const isPro = userPlan !== 'free';
  const goToPricing = useCallback(() => window.open('/home/pricing', '_blank'), []);
  const [formData, setFormData] = useState({
    // General
    title: '',
    description: '',
    // Privacy
    isPublic: false,
    passwordProtected: false,
    password: '',
    collectIpAddresses: false,
    // Branding
    hideBadge: false,
    customLogo: '',
    primaryColor: '#6366f1',
    backgroundColor: '#131314',
    // Notifications
    emailOnResponse: true,
    emailDigest: 'none' as 'none' | 'daily' | 'weekly',
    // Responses
    limitResponses: false,
    maxResponses: 100,
    closeAfterDate: '',
    showThankYouPage: true,
    thankYouMessage: 'Thank you for completing this survey!',
    redirectUrl: '',
    // Project
    showProgressBar: true,
    showQuestionNumbers: true,
    randomizeQuestions: false,
    randomizeOptions: false,
    // Share/Embed
    iconUrl: '',
    coverImageUrl: '',
    customSlug: '',
    // Cipher
    cipherEnabled: true,
    cipherTier: 3 as CipherTier,
    cipherCheckOverrides: {} as Record<string, boolean>,
    showAllChecks: true,
    expanded_Behavioral: false,
    expanded_Device: false,
    expanded_Content: false,
    expanded_Network: false,
    expanded_AI: false,
  } as Record<string, any>);

  // Compute active checks based on tier + overrides
  const activeChecks = useMemo(() => {
    const tierChecks = getChecksForTier(formData.cipherTier);
    const result: Record<string, boolean> = {};

    // Start with all checks from tier
    Object.keys(CIPHER_CHECKS).forEach(checkId => {
      const isInTier = tierChecks.includes(checkId);
      // Apply override if exists, otherwise use tier default
      result[checkId] = formData.cipherCheckOverrides[checkId] !== undefined
        ? formData.cipherCheckOverrides[checkId]
        : isInTier;
    });

    return result;
  }, [formData.cipherTier, formData.cipherCheckOverrides]);

  // Handle tier change - reset overrides
  const handleTierChange = useCallback((tier: CipherTier) => {
    setFormData(prev => ({
      ...prev,
      cipherTier: tier,
      cipherCheckOverrides: {}, // Reset overrides when tier changes
    }));
    setHasChanges(true);
  }, []);

  // Handle individual check toggle
  const handleCheckToggle = useCallback((checkId: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      cipherCheckOverrides: {
        ...prev.cipherCheckOverrides,
        [checkId]: enabled,
      },
    }));
    setHasChanges(true);
  }, []);

  // Group checks by category for display
  const checksByCategory = useMemo(() => {
    const categories: Record<string, Array<{ id: string; name: string; description: string; tier: number }>> = {
      'Behavioral': [],
      'Device': [],
      'Content': [],
      'Network': [],
      'AI': [],
    };

    Object.entries(CIPHER_CHECKS).forEach(([id, check]) => {
      const category =
        ['rapid_completion', 'uniform_timing', 'low_interaction', 'excessive_paste', 'pointer_spikes', 'robotic_typing', 'mouse_teleporting', 'no_corrections', 'hover_behavior', 'scroll_patterns', 'mouse_acceleration'].includes(id) ? 'Behavioral' :
        ['webdriver_detected', 'automation_detected', 'no_plugins', 'suspicious_user_agent', 'device_fingerprint_mismatch', 'screen_anomaly'].includes(id) ? 'Device' :
        ['straight_line_answers', 'minimal_effort', 'excessive_tab_switching', 'window_focus_loss', 'impossibly_fast', 'suspicious_pauses'].includes(id) ? 'Content' :
        ['vpn_detection', 'datacenter_ip', 'tor_detection', 'proxy_detection', 'timezone_validation'].includes(id) ? 'Network' :
        'AI';

      categories[category].push({
        id,
        name: check.name,
        description: check.description,
        tier: check.tier,
      });
    });

    return categories;
  }, []);

  // Fetch project data
  useEffect(() => {
    const fetchProject = async () => {
      if (!user?.id) return;
      try {
        // Fetch project and share settings in parallel
        const [projectRes, shareRes] = await Promise.all([
          fetch(`/api/projects/${projectId}?userId=${user.id}`),
          fetch(`/api/projects/${projectId}/share-settings`).catch(() => null),
        ]);

        if (projectRes.ok) {
          const data = await projectRes.json();
          const project = data.project;
          setProjectData(project);
          setFormData(prev => ({
            ...prev,
            title: project.title || '',
            description: project.description || '',
            isPublic: project.is_public || false,
            hideBadge: project.settings?.branding?.hideBadge || false,
            customLogo: project.settings?.branding?.customLogo || '',
            primaryColor: project.settings?.branding?.primaryColor || '#6366f1',
            backgroundColor: project.settings?.branding?.backgroundColor || '#131314',
            emailOnResponse: project.settings?.notifications?.emailOnResponse ?? true,
            emailDigest: project.settings?.notifications?.emailDigest || 'none',
            limitResponses: project.settings?.responses?.limitResponses || false,
            maxResponses: project.settings?.responses?.maxResponses || 100,
            closeAfterDate: project.settings?.responses?.closeAfterDate || '',
            showThankYouPage: project.settings?.responses?.showThankYouPage ?? true,
            thankYouMessage: project.settings?.responses?.thankYouMessage || 'Thank you for completing this survey!',
            redirectUrl: project.settings?.responses?.redirectUrl || '',
            passwordProtected: project.settings?.privacy?.passwordProtected || false,
            password: project.settings?.privacy?.password || '',
            collectIpAddresses: project.settings?.privacy?.collectIpAddresses || false,
            showProgressBar: project.settings?.project?.showProgressBar ?? true,
            showQuestionNumbers: project.settings?.project?.showQuestionNumbers ?? true,
            randomizeQuestions: project.settings?.project?.randomizeQuestions || false,
            randomizeOptions: project.settings?.project?.randomizeOptions || false,
          }));
        }

        if (shareRes && shareRes.ok) {
          const shareData = await shareRes.json();
          setShareSettings(shareData);
          setFormData(prev => ({
            ...prev,
            iconUrl: shareData.iconUrl || shareData.ogImage || '',
            coverImageUrl: shareData.ogImage || '',
            customSlug: shareData.customSlug || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching project:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId, user?.id]);

  // Fetch user subscription
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const { data: { session } } = await (await import('@/lib/supabase')).supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch('/api/user/subscription', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserPlan(data.subscription?.plan || 'free');
        }
      } catch (err) {
        console.error('Error fetching subscription:', err);
      }
    };
    fetchSubscription();
  }, []);

  // Track changes
  const handleFormChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'icon' | 'cover') => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/surbee/blob/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (type === 'icon') {
          handleFormChange('iconUrl', data.url);
        } else {
          handleFormChange('coverImageUrl', data.url);
        }
        // Save to share settings immediately
        await fetch(`/api/projects/${projectId}/share-settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(type === 'icon' ? { iconUrl: data.url } : { ogImage: data.url }),
        });
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Save settings
  const handleSave = async () => {
    if (!user?.id || !hasChanges) return;
    setSaving(true);
    try {
      // Update project basic info
      await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: formData.title,
          description: formData.description,
          is_public: formData.isPublic,
        }),
      });

      // Update project settings
      await fetch(`/api/projects/${projectId}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          settings: {
            branding: {
              hideBadge: formData.hideBadge,
              customLogo: formData.customLogo,
              primaryColor: formData.primaryColor,
              backgroundColor: formData.backgroundColor,
            },
            notifications: {
              emailOnResponse: formData.emailOnResponse,
              emailDigest: formData.emailDigest,
            },
            responses: {
              limitResponses: formData.limitResponses,
              maxResponses: formData.maxResponses,
              closeAfterDate: formData.closeAfterDate || null,
              showThankYouPage: formData.showThankYouPage,
              thankYouMessage: formData.thankYouMessage,
              redirectUrl: formData.redirectUrl || null,
            },
            privacy: {
              passwordProtected: formData.passwordProtected,
              password: formData.password || null,
              collectIpAddresses: formData.collectIpAddresses,
            },
            project: {
              showProgressBar: formData.showProgressBar,
              showQuestionNumbers: formData.showQuestionNumbers,
              randomizeQuestions: formData.randomizeQuestions,
              randomizeOptions: formData.randomizeOptions,
            },
          },
        }),
      });

      // Update share settings
      if (formData.customSlug) {
        await fetch(`/api/projects/${projectId}/share-settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customSlug: formData.customSlug }),
        });
      }

      setHasChanges(false);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  // Delete project
  const handleDeleteProject = async () => {
    if (!user?.id || deleteInput !== projectData?.title) return;
    try {
      const res = await fetch(`/api/projects/${projectId}?userId=${user.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/projects');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  const copyPublishedUrl = () => {
    const slug = formData.customSlug || projectData?.published_url;
    if (slug) {
      navigator.clipboard.writeText(`https://form.surbee.dev/${slug}`);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'General', icon: <Settings2 className="w-4 h-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Lock className="w-4 h-4" /> },
    { id: 'responses', label: 'Responses', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'cipher', label: 'Cipher', icon: <Shield className="w-4 h-4" /> },
    { id: 'danger', label: 'Delete', icon: <Trash2 className="w-4 h-4" /> },
  ];

  if (loading) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="settings-modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            className="settings-modal-content"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="settings-loading">
              <div className="settings-loader" />
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="settings-fullscreen"
      >
        {/* Close button */}
        <button
          className="settings-close-btn"
          onClick={onClose}
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="settings-scroll-container">
          <div className="project-settings-root">
            {/* Header */}
            <header className="settings-header">
              <h1 className="settings-title">Project settings</h1>
            </header>

      {/* Tab Navigation */}
      <nav className="settings-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <div className="settings-content" key={activeTab}>
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="settings-section">
            <div className="form-field">
              <label className="field-label">Survey Name</label>
              <p className="field-description">Give your survey a descriptive name</p>
              <input
                type="text"
                className="field-input"
                value={formData.title}
                onChange={(e) => handleFormChange('title', e.target.value)}
                placeholder="My Survey"
              />
            </div>

            <div className="form-field">
              <label className="field-label">Description</label>
              <p className="field-description">A brief description of your survey (optional)</p>
              <textarea
                className="field-textarea"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                placeholder="This survey helps us understand..."
                rows={3}
              />
            </div>

            <div className="divider" />

            {/* Survey Icon */}
            <div className="form-field">
              <label className="field-label">
                Survey Icon
                <ProBadge className="ml-2" isPro={isPro} onClick={goToPricing} />
              </label>
              <p className="field-description">Displayed in browser tabs and when shared</p>
              <div className="image-upload-area">
                <input
                  ref={iconFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'icon')}
                />
                {formData.iconUrl ? (
                  <div className="image-preview">
                    <img src={formData.iconUrl} alt="Survey icon" className="icon-preview" />
                    <button
                      className="change-image-btn"
                      onClick={() => {
                        if (!isPro) { goToPricing(); return; }
                        iconFileInputRef.current?.click();
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    className="upload-btn"
                    onClick={() => {
                      if (!isPro) { goToPricing(); return; }
                      iconFileInputRef.current?.click();
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Icon
                  </button>
                )}
              </div>
            </div>

            {/* Cover Image */}
            <div className="form-field">
              <label className="field-label">
                Social Share Image
                <ProBadge className="ml-2" isPro={isPro} onClick={goToPricing} />
              </label>
              <p className="field-description">Displayed when your survey link is shared on social media (1200x630px recommended)</p>
              <div className="image-upload-area cover">
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'cover')}
                />
                {formData.coverImageUrl ? (
                  <div className="image-preview cover">
                    <img src={formData.coverImageUrl} alt="Cover" className="cover-preview" />
                    <button
                      className="change-image-btn"
                      onClick={() => {
                        if (!isPro) { goToPricing(); return; }
                        coverFileInputRef.current?.click();
                      }}
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <button
                    className="upload-btn cover"
                    onClick={() => {
                      if (!isPro) { goToPricing(); return; }
                      coverFileInputRef.current?.click();
                    }}
                  >
                    <Image className="w-5 h-5" />
                    <span>Upload Cover Image</span>
                  </button>
                )}
              </div>
            </div>

            {(projectData?.published_url || formData.customSlug) && (
              <>
                <div className="divider" />
                <div className="form-field">
                  <label className="field-label">Custom URL Slug</label>
                  <p className="field-description">Customize your survey link</p>
                  <div className="url-field">
                    <span className="url-prefix">form.surbee.dev/</span>
                    <input
                      type="text"
                      className="field-input url-slug-input"
                      value={formData.customSlug}
                      onChange={(e) => handleFormChange('customSlug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="my-survey"
                    />
                    <button
                      className="url-action-btn"
                      onClick={copyPublishedUrl}
                      title="Copy URL"
                    >
                      {copiedUrl ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <a
                      href={`https://form.surbee.dev/${formData.customSlug || projectData?.published_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="url-action-btn"
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </>
            )}

            <div className="divider" />

            <div className="form-field">
              <label className="toggle-field">
                <div className="toggle-info">
                  <span className="field-label">Show Progress Bar</span>
                  <span className="field-description">Display survey progress to respondents</span>
                </div>
                <button
                  type="button"
                  className={`toggle-btn ${formData.showProgressBar ? 'active' : ''}`}
                  onClick={() => handleFormChange('showProgressBar', !formData.showProgressBar)}
                >
                  <div className="toggle-thumb" />
                </button>
              </label>
            </div>

            <div className="form-field">
              <label className="toggle-field">
                <div className="toggle-info">
                  <span className="field-label">Show Question Numbers</span>
                  <span className="field-description">Display "1 of 10" style progress</span>
                </div>
                <button
                  type="button"
                  className={`toggle-btn ${formData.showQuestionNumbers ? 'active' : ''}`}
                  onClick={() => handleFormChange('showQuestionNumbers', !formData.showQuestionNumbers)}
                >
                  <div className="toggle-thumb" />
                </button>
              </label>
            </div>

            <div className="form-field">
              <label className="toggle-field">
                <div className="toggle-info">
                  <span className="field-label">Randomize Questions</span>
                  <span className="field-description">Show questions in random order</span>
                </div>
                <button
                  type="button"
                  className={`toggle-btn ${formData.randomizeQuestions ? 'active' : ''}`}
                  onClick={() => handleFormChange('randomizeQuestions', !formData.randomizeQuestions)}
                >
                  <div className="toggle-thumb" />
                </button>
              </label>
            </div>

            <div className="form-field">
              <label className="toggle-field">
                <div className="toggle-info">
                  <span className="field-label">Randomize Options</span>
                  <span className="field-description">Randomize answer choice order</span>
                </div>
                <button
                  type="button"
                  className={`toggle-btn ${formData.randomizeOptions ? 'active' : ''}`}
                  onClick={() => handleFormChange('randomizeOptions', !formData.randomizeOptions)}
                >
                  <div className="toggle-thumb" />
                </button>
              </label>
            </div>

            <div className="form-field">
              <label className="toggle-field">
                <div className="toggle-info">
                  <span className="field-label">
                    Hide Surbee Badge
                    <ProBadge className="ml-2" isPro={isPro} onClick={goToPricing} />
                  </span>
                  <span className="field-description">Remove "Powered by Surbee" from your survey</span>
                </div>
                <button
                  type="button"
                  className={`toggle-btn ${formData.hideBadge ? 'active' : ''}`}
                  onClick={() => {
                    if (!isPro) {
                      goToPricing();
                      return;
                    }
                    handleFormChange('hideBadge', !formData.hideBadge);
                  }}
                >
                  <div className="toggle-thumb" />
                </button>
              </label>
            </div>
          </div>
        )}

        {/* PRIVACY TAB */}
        {activeTab === 'privacy' && (
          <div className="settings-section">
            <div className="form-field">
              <label className="toggle-field">
                <div className="toggle-info">
                  <span className="field-label">
                    Password Protection
                    <ProBadge className="ml-2" isPro={isPro} onClick={goToPricing} />
                  </span>
                  <span className="field-description">Require a password to access the survey</span>
                </div>
                <button
                  type="button"
                  className={`toggle-btn ${formData.passwordProtected ? 'active' : ''}`}
                  onClick={() => {
                    if (!isPro) {
                      goToPricing();
                      return;
                    }
                    handleFormChange('passwordProtected', !formData.passwordProtected);
                  }}
                >
                  <div className="toggle-thumb" />
                </button>
              </label>
            </div>

            {formData.passwordProtected && (
              <div className="form-field nested">
                <input
                  type="password"
                  className="field-input"
                  value={formData.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            )}

            <div className="form-field">
              <label className="toggle-field">
                <div className="toggle-info">
                  <span className="field-label">Collect IP Addresses</span>
                  <span className="field-description">Store respondent IP addresses for fraud detection</span>
                </div>
                <button
                  type="button"
                  className={`toggle-btn ${formData.collectIpAddresses ? 'active' : ''}`}
                  onClick={() => handleFormChange('collectIpAddresses', !formData.collectIpAddresses)}
                >
                  <div className="toggle-thumb" />
                </button>
              </label>
            </div>

            <div className="divider" />

            <h2 className="section-title">Notifications</h2>

            <div className="form-field">
              <label className="toggle-field">
                <div className="toggle-info">
                  <span className="field-label">Email on new response</span>
                  <span className="field-description">Receive an email when someone completes your survey</span>
                </div>
                <button
                  type="button"
                  className={`toggle-btn ${formData.emailOnResponse ? 'active' : ''}`}
                  onClick={() => handleFormChange('emailOnResponse', !formData.emailOnResponse)}
                >
                  <div className="toggle-thumb" />
                </button>
              </label>
            </div>

            <div className="form-field">
              <label className="field-label">Email Digest</label>
              <p className="field-description">Receive a summary of responses</p>
              <select
                className="field-select"
                value={formData.emailDigest}
                onChange={(e) => handleFormChange('emailDigest', e.target.value)}
              >
                <option value="none">Never</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>
        )}

        {/* RESPONSES TAB */}
        {activeTab === 'responses' && (
          <div className="settings-section">
            <div className="form-field">
              <label className="toggle-field">
                <div className="toggle-info">
                  <span className="field-label">Limit Total Responses</span>
                  <span className="field-description">Stop accepting responses after a certain number</span>
                </div>
                <button
                  type="button"
                  className={`toggle-btn ${formData.limitResponses ? 'active' : ''}`}
                  onClick={() => handleFormChange('limitResponses', !formData.limitResponses)}
                >
                  <div className="toggle-thumb" />
                </button>
              </label>
            </div>

            {formData.limitResponses && (
              <div className="form-field nested">
                <label className="field-label">Maximum Responses</label>
                <input
                  type="number"
                  className="field-input small"
                  value={formData.maxResponses}
                  onChange={(e) => handleFormChange('maxResponses', parseInt(e.target.value) || 100)}
                  min={1}
                />
              </div>
            )}

            <div className="form-field">
              <label className="field-label">Close After Date</label>
              <p className="field-description">Automatically close the survey after a specific date</p>
              <button
                type="button"
                className="date-dropdown-trigger"
                onClick={(e) => {
                  const input = e.currentTarget.nextElementSibling as HTMLInputElement;
                  input?.showPicker?.();
                }}
              >
                <span>{formData.closeAfterDate ? new Date(formData.closeAfterDate).toLocaleString() : 'Select date...'}</span>
                <ChevronDown className="w-4 h-4" style={{ color: 'rgba(232, 232, 232, 0.5)' }} />
              </button>
              <input
                type="datetime-local"
                className="date-input-hidden"
                value={formData.closeAfterDate}
                onChange={(e) => handleFormChange('closeAfterDate', e.target.value)}
              />
            </div>

            <div className="form-field">
              <label className="field-label">Redirect URL</label>
              <p className="field-description">Redirect to a custom URL after submission (optional)</p>
              <input
                type="url"
                className="field-input"
                value={formData.redirectUrl}
                onChange={(e) => handleFormChange('redirectUrl', e.target.value)}
                placeholder="https://example.com/thank-you"
              />
            </div>
          </div>
        )}

        {/* CIPHER TAB */}
        {activeTab === 'cipher' && user?.id && (
          <div className="settings-section">
            <div className="cipher-form-field">
              <p className="cipher-field-label">Enable Cipher</p>
              <p className="cipher-field-description">Our intelligent engine analyzes behavioral patterns, response quality, and authenticity signals in real-time</p>
              <div className="cipher-checks-group">
                <label className="cipher-checkbox-label">
                  <button
                    type="button"
                    className={`cipher-checkbox ${formData.cipherEnabled ? 'checked' : ''}`}
                    onClick={() => handleFormChange('cipherEnabled', !formData.cipherEnabled)}
                    role="checkbox"
                    aria-checked={formData.cipherEnabled}
                  >
                    <span style={{
                      opacity: formData.cipherEnabled ? 1 : 0,
                      transform: formData.cipherEnabled ? 'none' : 'scale(0.8)',
                      transition: '0.1s cubic-bezier(0.25, 0.5, 0.25, 1)',
                      display: 'flex',
                      pointerEvents: 'none',
                    }}>
                      <Check size={16} />
                    </span>
                  </button>
                  <div className="cipher-checkbox-content">
                    <span className="cipher-checkbox-title">Enable fraud detection on this survey</span>
                    <span className="cipher-checkbox-desc">Automatically analyze responses for suspicious patterns</span>
                  </div>
                </label>
              </div>
            </div>

            {formData.cipherEnabled && (
              <>
                <div className="cipher-divider" />

                <div className="cipher-form-field">
                  <p className="cipher-field-label">Intelligence level</p>
                  <p className="cipher-field-description">Higher tiers unlock deeper analysis and AI-powered verification</p>

                  <div className="cipher-tier-radio-group">
                    {([1, 2, 3, 4, 5] as CipherTier[]).map((tier) => (
                      <label key={tier} className="cipher-radio-label">
                        <button
                          type="button"
                          className={`cipher-radio ${formData.cipherTier === tier ? 'checked' : ''}`}
                          onClick={() => handleTierChange(tier)}
                          role="radio"
                          aria-checked={formData.cipherTier === tier}
                        >
                          {formData.cipherTier === tier && <span className="cipher-radio-dot" />}
                        </button>
                        <div className="cipher-radio-content">
                          <span className="cipher-radio-title">Tier {tier} - {CIPHER_TIERS[tier].name}</span>
                          <span className="cipher-radio-desc">
                            {CIPHER_TIERS[tier].description}
                            {CIPHER_TIERS[tier].estimatedCostPerResponse > 0 && (
                              <> · ~${CIPHER_TIERS[tier].estimatedCostPerResponse.toFixed(3)}/response</>
                            )}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="cipher-divider" />

                {Object.entries(checksByCategory).map(([category, checks]) => (
                  checks.length > 0 && (
                    <div key={category} className="cipher-form-field">
                      <p className="cipher-field-label">{category.charAt(0).toUpperCase() + category.slice(1)} signals</p>
                      <p className="cipher-field-description">
                        {checks.filter(c => activeChecks[c.id]).length} of {checks.length} active
                      </p>

                      <div className="cipher-checks-group">
                        {checks.map((check) => (
                          <label key={check.id} className="cipher-checkbox-label">
                            <button
                              type="button"
                              className={`cipher-checkbox ${activeChecks[check.id] ? 'checked' : ''}`}
                              onClick={() => handleCheckToggle(check.id, !activeChecks[check.id])}
                              role="checkbox"
                              aria-checked={activeChecks[check.id]}
                            >
                              <span style={{
                                opacity: activeChecks[check.id] ? 1 : 0,
                                transform: activeChecks[check.id] ? 'none' : 'scale(0.8)',
                                transition: '0.1s cubic-bezier(0.25, 0.5, 0.25, 1)',
                                display: 'flex',
                                pointerEvents: 'none',
                              }}>
                                <Check size={16} />
                              </span>
                            </button>
                            <div className="cipher-checkbox-content">
                              <span className="cipher-checkbox-title">{check.name}</span>
                              <span className="cipher-checkbox-desc">{check.description}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </>
            )}
          </div>
        )}

        {/* DELETE TAB */}
        {activeTab === 'danger' && (
          <div className="settings-section">
            <div className="danger-zone-card">
              <div className="danger-zone-content">
                <h3 className="danger-zone-title">Delete this survey</h3>
                <p className="danger-zone-description">
                  Once deleted, this survey and all its responses will be permanently removed. This action cannot be undone.
                </p>
              </div>

              {!showDeleteConfirm ? (
                <button
                  className="danger-zone-btn"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete survey
                </button>
              ) : (
                <div className="danger-zone-confirm">
                  <p className="danger-zone-confirm-label">
                    Type <strong>{projectData?.title}</strong> to confirm:
                  </p>
                  <input
                    type="text"
                    className="danger-zone-input"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="Enter survey name"
                  />
                  <div className="danger-zone-actions">
                    <button
                      className="danger-zone-cancel"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteInput('');
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="danger-zone-delete"
                      onClick={handleDeleteProject}
                      disabled={deleteInput !== projectData?.title}
                    >
                      Delete permanently
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save Footer */}
      {activeTab !== 'danger' && (
        <div className="settings-footer">
          <button
            className={`save-btn ${hasChanges ? '' : 'disabled'}`}
            onClick={handleSave}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      )}

      <style jsx>{`
        .project-settings-root {
          max-width: 800px;
          margin: 0 auto;
          padding: 48px 32px 120px;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .settings-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 400px;
        }

        .settings-loader {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid var(--surbee-border-primary, rgba(255,255,255,0.1));
          border-top-color: var(--surbee-fg-primary, #E8E8E8);
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .hidden {
          display: none;
        }

        /* Header */
        .settings-header {
          margin-bottom: 32px;
        }

        .settings-title {
          font-family: 'Kalice-Trial-Regular', sans-serif;
          font-size: 28px;
          font-weight: 400;
          line-height: 1.4;
          margin-bottom: 0;
        }

        /* Tabs */
        .settings-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .settings-tab {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.1);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .settings-tab:hover {
          border-color: rgba(232, 232, 232, 0.2);
        }

        .settings-tab.active {
          background: rgba(232, 232, 232, 0.05);
          border-color: transparent;
        }

        /* Content */
        .settings-content {
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .settings-section {
          max-width: 800px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 700;
          line-height: 1.4;
          padding-bottom: 16px;
          margin: 16px 0 4px;
          display: flex;
          align-items: center;
        }

        .section-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin-bottom: 16px;
        }

        .divider {
          margin: 40px 0;
          width: 100%;
          height: 1px;
          background-color: rgba(232, 232, 232, 0.08);
        }

        /* Form Fields */
        .form-field {
          display: flex;
          flex-direction: column;
          color: rgba(232, 232, 232, 0.6);
          margin-top: 16px;
        }

        .form-field.nested {
          margin-left: 24px;
          padding-left: 16px;
          border-left: 2px solid rgba(232, 232, 232, 0.1);
        }

        .field-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .field-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 4px 0 8px;
        }

        .field-input {
          display: flex;
          align-items: center;
          padding: 0 12px;
          height: 36px;
          border-radius: 18px;
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.15);
          transition: all 0.2s ease;
        }

        .field-input.small {
          max-width: 120px;
        }

        .field-input:focus {
          outline: none;
          border-color: rgba(232, 232, 232, 0.3);
        }

        .field-input::placeholder {
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
        }

        .field-textarea {
          display: flex;
          padding: 12px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.15);
          resize: vertical;
          min-height: 80px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .field-textarea:focus {
          outline: none;
          border-color: rgba(232, 232, 232, 0.3);
        }

        .field-select {
          display: flex;
          align-items: center;
          padding: 0 16px;
          height: 36px;
          border-radius: 18px;
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.15);
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23888' viewBox='0 0 16 16'%3E%3Cpath d='M5.25317 6.2182C5.46077 6.0106 5.7822 6.01729 5.96969 6.21152L8.56792 8.96373L11.1527 6.21152C11.3402 6.0106 11.675 6.01729 11.8692 6.22489C12.05 6.41237 12.0433 6.72043 11.8491 6.92803L9.21746 9.71373C8.86923 10.0954 8.25317 10.0954 7.90494 9.71373L5.27323 6.92803C5.09917 6.74049 5.08574 6.39232 5.25317 6.2182Z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 36px;
          max-width: 200px;
        }

        .field-select:focus {
          outline: none;
          border-color: rgba(232, 232, 232, 0.3);
        }

        .field-select option {
          background: #1E1E1F;
          color: #E8E8E8;
        }

        /* Date Dropdown Trigger - styled like evals/insights */
        .date-dropdown-trigger {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          max-width: 280px;
          height: 40px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.15);
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .date-dropdown-trigger:hover {
          background: rgba(232, 232, 232, 0.04);
          border-color: rgba(232, 232, 232, 0.25);
        }

        .date-input-hidden {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          width: 0;
          height: 0;
        }

        /* Image Upload */
        .image-upload-area {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .image-upload-area.cover {
          width: 100%;
        }

        .upload-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          background: rgba(232, 232, 232, 0.04);
          border: 1px dashed rgba(232, 232, 232, 0.2);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .upload-btn:hover {
          background: rgba(232, 232, 232, 0.08);
          border-color: rgba(232, 232, 232, 0.3);
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .upload-btn.cover {
          width: 100%;
          height: 120px;
          flex-direction: column;
          justify-content: center;
        }

        .image-preview {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .image-preview.cover {
          width: 100%;
        }

        .icon-preview {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid rgba(232, 232, 232, 0.1);
        }

        .cover-preview {
          width: 100%;
          max-width: 300px;
          height: 120px;
          border-radius: 12px;
          object-fit: cover;
          border: 1px solid rgba(232, 232, 232, 0.1);
        }

        .change-image-btn {
          padding: 6px 12px;
          font-size: 13px;
          color: var(--surbee-fg-secondary);
          background: rgba(232, 232, 232, 0.06);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .change-image-btn:hover {
          background: rgba(232, 232, 232, 0.1);
          color: var(--surbee-fg-primary);
        }

        /* URL Field */
        .url-field {
          display: flex;
          gap: 0;
          align-items: center;
        }

        .url-prefix {
          display: flex;
          align-items: center;
          padding: 0 12px;
          height: 36px;
          font-size: 13px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          background: rgba(232, 232, 232, 0.04);
          border: 1px solid rgba(232, 232, 232, 0.15);
          border-right: none;
          border-radius: 18px 0 0 18px;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
        }

        .url-slug-input {
          border-radius: 0;
          border-left: none;
          flex: 1;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 13px;
        }

        .url-action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(232, 232, 232, 0.06);
          border: 1px solid rgba(232, 232, 232, 0.15);
          border-left: none;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .url-action-btn:last-child {
          border-radius: 0 18px 18px 0;
        }

        .url-action-btn:hover {
          background: rgba(232, 232, 232, 0.1);
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        /* Toggle */
        .toggle-field {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          cursor: pointer;
        }

        .toggle-info {
          display: flex;
          flex-direction: column;
        }

        .toggle-btn {
          position: relative;
          width: 40px;
          height: 22px;
          border-radius: 11px;
          background: rgba(232, 232, 232, 0.12);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .toggle-btn.active {
          background: var(--surbee-fg-primary, #E8E8E8);
        }

        .toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--surbee-bg-primary, rgb(19, 19, 20));
          transition: transform 0.2s ease;
        }

        .toggle-btn.active .toggle-thumb {
          transform: translateX(18px);
        }

        /* Radio Group */
        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          border-radius: 20px;
          padding: 20px 24px;
          background-color: rgba(232, 232, 232, 0.02);
        }

        .radio-option {
          display: flex;
          gap: 12px;
          cursor: pointer;
        }

        .radio-btn {
          flex-shrink: 0;
          width: 16px;
          height: 16px;
          border-radius: 8px;
          border: 1px solid rgba(232, 232, 232, 0.2);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          transition: all 0.125s ease;
        }

        .radio-btn.selected {
          border-color: var(--surbee-fg-primary, #E8E8E8);
          background: var(--surbee-fg-primary, #E8E8E8);
        }

        .radio-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--surbee-bg-primary, rgb(19, 19, 20));
        }

        .radio-content {
          display: flex;
          flex-direction: column;
        }

        .radio-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .radio-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin-top: 2px;
        }

        /* Color Fields */
        .color-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .color-fields {
            grid-template-columns: 1fr;
          }
        }

        .color-input-wrapper {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .color-picker {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid rgba(232, 232, 232, 0.15);
          cursor: pointer;
          padding: 0;
          overflow: hidden;
        }

        .color-picker::-webkit-color-swatch-wrapper {
          padding: 0;
        }

        .color-picker::-webkit-color-swatch {
          border: none;
          border-radius: 6px;
        }

        .color-text {
          flex: 1;
          font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
          font-size: 13px;
        }

        /* Sana-style Components */
        .sana-style {
          max-width: 100%;
        }

        .sana-section-title {
          font-size: 16px;
          font-weight: 700;
          line-height: 1.4;
          color: var(--surbee-fg-primary, #E8E8E8);
          padding-bottom: 16px;
          margin: 16px 0 4px;
        }

        .sana-form-field {
          display: flex;
          flex-direction: column;
          color: rgba(232, 232, 232, 0.6);
        }

        .sana-field-label {
          font-size: 14px;
          font-weight: 700;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin: 0;
        }

        .sana-field-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 4px 0 12px;
        }

        /* Sana Switch - Monochrome */
        .sana-switch {
          position: relative;
          width: 40px;
          height: 22px;
          border-radius: 11px;
          background: rgba(232, 232, 232, 0.12);
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
          padding: 0;
        }

        .sana-switch.active {
          background: var(--surbee-fg-primary, #E8E8E8);
        }

        .sana-switch-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--surbee-bg-primary, rgb(19, 19, 20));
          transition: transform 0.2s ease;
        }

        .sana-switch.active .sana-switch-thumb {
          transform: translateX(18px);
        }

        /* Sana Table */
        .sana-table-container {
          margin-top: 8px;
          overflow: hidden;
        }

        .sana-table {
          width: 100%;
          border-collapse: collapse;
        }

        .sana-table th {
          text-align: left;
          padding: 0;
        }

        .sana-sort-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          height: 36px;
          font-size: 14px;
          font-weight: 700;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid transparent;
          border-radius: 9999px;
          cursor: pointer;
          transition: background 0.2s ease;
          white-space: nowrap;
        }

        .sana-sort-btn:hover {
          background: rgba(232, 232, 232, 0.06);
        }

        .sana-sort-btn svg {
          opacity: 0.5;
        }

        .sana-table td {
          padding: 12px 16px;
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          border-bottom: 1px solid rgba(232, 232, 232, 0.06);
        }

        .sana-table tbody tr {
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .sana-table tbody tr:hover {
          background: rgba(232, 232, 232, 0.03);
        }

        .sana-status-text {
          font-size: 14px;
          font-weight: 400;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        /* Sana Threshold */
        .sana-threshold-row {
          display: flex;
          align-items: center;
          gap: 12px;
          max-width: 300px;
        }

        .sana-slider {
          flex: 1;
          height: 4px;
          background: rgba(232, 232, 232, 0.15);
          border-radius: 2px;
          appearance: none;
          cursor: pointer;
        }

        .sana-slider::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--surbee-fg-primary, #E8E8E8);
          cursor: pointer;
        }

        .sana-threshold-value {
          font-size: 14px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          min-width: 40px;
          text-align: right;
        }

        /* Footer */
        .settings-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: flex-start;
          padding: 24px 32px;
          border-top: 1px solid rgba(232, 232, 232, 0.05);
          background-color: var(--surbee-bg-primary, rgb(19, 19, 20));
          z-index: 10;
          max-width: 900px;
        }

        .save-btn {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 600;
          color: var(--surbee-bg-primary, rgb(19, 19, 20));
          background: var(--surbee-fg-primary, #E8E8E8);
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-btn:hover:not(.disabled) {
          background: rgba(232, 232, 232, 0.9);
        }

        .save-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: rgba(232, 232, 232, 0.04);
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
        }

        /* Cipher Tier Slider */
        .cipher-tier-section {
          margin-top: 24px;
        }

        .cipher-tier-slider-container {
          margin-top: 16px;
        }

        .cipher-tier-labels {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .cipher-tier-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          border-radius: 8px;
        }

        .cipher-tier-label:hover {
          background: rgba(232, 232, 232, 0.05);
        }

        .cipher-tier-label.active .tier-number {
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .cipher-tier-label .tier-number {
          font-size: 18px;
          font-weight: 600;
          color: rgba(232, 232, 232, 0.4);
          transition: color 0.2s ease;
        }

        .cipher-tier-label .tier-name {
          font-size: 11px;
          color: rgba(232, 232, 232, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cipher-tier-label.active .tier-name {
          color: rgba(232, 232, 232, 0.7);
        }

        .cipher-tier-track {
          position: relative;
          height: 4px;
          background: rgba(232, 232, 232, 0.1);
          border-radius: 2px;
          margin: 0 24px;
        }

        .cipher-tier-fill {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          background: var(--surbee-fg-primary, #E8E8E8);
          border-radius: 2px;
          transition: width 0.2s ease;
        }

        .cipher-tier-input {
          position: absolute;
          top: -8px;
          left: 0;
          width: 100%;
          height: 20px;
          opacity: 0;
          cursor: pointer;
          margin: 0;
        }

        .cipher-tier-info {
          margin-top: 16px;
          padding: 12px 16px;
          background: rgba(232, 232, 232, 0.03);
          border-radius: 12px;
        }

        .tier-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 0;
        }

        .tier-cost {
          font-size: 13px;
          color: rgba(232, 232, 232, 0.4);
          margin: 8px 0 0 0;
        }

        /* Cipher Checks Header */
        .cipher-checks-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        /* Dropdown Trigger - Matches eval page style */
        .cipher-dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px 6px 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 9999px;
          color: var(--surbee-fg-primary, #E8E8E8);
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
          white-space: nowrap;
        }

        .cipher-dropdown-trigger:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .cipher-dropdown-trigger svg {
          color: rgba(232, 232, 232, 0.6);
        }

        .cipher-categories-container {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Cipher Category Accordion */
        .cipher-category-section {
          border: 1px solid rgba(232, 232, 232, 0.08);
          border-radius: 12px;
          overflow: hidden;
        }

        .cipher-category-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 14px 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .cipher-category-header:hover {
          background: rgba(232, 232, 232, 0.03);
        }

        .cipher-category-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cipher-category-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin: 0;
          text-transform: none;
          letter-spacing: 0;
        }

        .cipher-category-count {
          font-size: 12px;
          color: rgba(232, 232, 232, 0.4);
        }

        .cipher-checks-list {
          display: flex;
          flex-direction: column;
          border-top: 1px solid rgba(232, 232, 232, 0.06);
        }

        .cipher-check-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          transition: background 0.15s ease;
        }

        .cipher-check-row:not(:last-child) {
          border-bottom: 1px solid rgba(232, 232, 232, 0.04);
        }

        .cipher-check-row:hover {
          background: rgba(232, 232, 232, 0.02);
        }

        .cipher-check-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cipher-check-name {
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .cipher-check-tooltip {
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(232, 232, 232, 0.35);
          cursor: help;
          transition: color 0.15s ease;
        }

        .cipher-check-tooltip:hover {
          color: rgba(232, 232, 232, 0.6);
        }

        /* Monochrome Toggle - White when active */
        .cipher-check-toggle {
          position: relative;
          width: 40px;
          height: 22px;
          border-radius: 11px;
          background: rgba(232, 232, 232, 0.12);
          border: none;
          cursor: pointer;
          transition: background 0.2s ease;
          padding: 0;
          flex-shrink: 0;
        }

        .cipher-check-toggle.active {
          background: var(--surbee-fg-primary, #E8E8E8);
        }

        .cipher-check-toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--surbee-bg-primary, rgb(19, 19, 20));
          transition: transform 0.2s ease;
        }

        .cipher-check-toggle.active .cipher-check-toggle-thumb {
          transform: translateX(18px);
        }

        /* Professional Danger Zone */
        .danger-zone-card {
          border: 1px solid rgba(239, 68, 68, 0.15);
          border-radius: 12px;
          padding: 20px;
          background: rgba(239, 68, 68, 0.02);
        }

        .danger-zone-content {
          margin-bottom: 16px;
        }

        .danger-zone-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin: 0 0 6px 0;
        }

        .danger-zone-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 0;
          line-height: 1.5;
        }

        .danger-zone-btn {
          display: inline-flex;
          align-items: center;
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 500;
          color: #ef4444;
          background: transparent;
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .danger-zone-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.5);
        }

        .danger-zone-confirm {
          padding-top: 16px;
          border-top: 1px solid rgba(239, 68, 68, 0.1);
        }

        .danger-zone-confirm-label {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 0 0 12px 0;
        }

        .danger-zone-confirm-label strong {
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .danger-zone-input {
          width: 100%;
          max-width: 320px;
          padding: 10px 14px;
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: rgba(232, 232, 232, 0.04);
          border: 1px solid rgba(232, 232, 232, 0.1);
          border-radius: 8px;
          outline: none;
          margin-bottom: 16px;
        }

        .danger-zone-input:focus {
          border-color: rgba(232, 232, 232, 0.2);
        }

        .danger-zone-input::placeholder {
          color: rgba(232, 232, 232, 0.3);
        }

        .danger-zone-actions {
          display: flex;
          gap: 10px;
        }

        .danger-zone-cancel {
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: rgba(232, 232, 232, 0.06);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .danger-zone-cancel:hover {
          background: rgba(232, 232, 232, 0.1);
        }

        .danger-zone-delete {
          padding: 10px 18px;
          font-size: 14px;
          font-weight: 500;
          color: white;
          background: #ef4444;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .danger-zone-delete:hover:not(:disabled) {
          background: #dc2626;
        }

        .danger-zone-delete:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Cipher Sana-style Components */
        .cipher-section-header {
          font-size: 16px;
          font-weight: 700;
          line-height: 1.4;
          color: var(--surbee-fg-primary, #E8E8E8);
          padding-bottom: 16px;
          margin: 16px 0 4px;
        }

        .cipher-form-field {
          display: flex;
          flex-direction: column;
          margin-top: 8px;
        }

        .cipher-field-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin: 0;
        }

        .cipher-field-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 4px 0 12px;
        }

        .cipher-divider {
          margin: 32px 0;
          width: 100%;
          height: 1px;
          background-color: rgba(232, 232, 232, 0.08);
        }

        /* Cipher Checkbox */
        .cipher-checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
        }

        .cipher-checkbox-label + .cipher-checkbox-label {
          margin-top: 16px;
        }

        .cipher-checkbox {
          flex: 0 0 16px;
          width: 16px;
          height: 16px;
          border-radius: 5px;
          border: 1px solid rgba(232, 232, 232, 0.2);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          transition: 0.1s cubic-bezier(0.25, 0.5, 0.25, 1);
          color: currentColor;
          padding: 0;
        }

        .cipher-checkbox:hover {
          border-color: rgba(232, 232, 232, 0.4);
        }

        .cipher-checkbox.checked {
          border-color: rgba(232, 232, 232, 0.2);
          background: transparent;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .cipher-checkbox-content {
          display: flex;
          flex-direction: column;
        }

        .cipher-checkbox-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .cipher-checkbox-desc {
          font-size: 14px;
          font-weight: 400;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          transition: color 0.1s cubic-bezier(0.25, 0.5, 0.25, 1);
        }

        .cipher-checkbox-label:hover .cipher-checkbox-desc {
          color: rgba(232, 232, 232, 0.8);
        }

        /* Cipher Radio Group */
        .cipher-tier-radio-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-radius: 16px;
          padding: 12px;
          background-color: rgba(232, 232, 232, 0.02);
        }

        .cipher-radio-label {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          padding: 12px;
          border-radius: 10px;
          transition: background 0.15s ease;
        }

        .cipher-radio-label:hover {
          background: rgba(232, 232, 232, 0.04);
        }

        .cipher-radio {
          flex-shrink: 0;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 1px solid rgba(232, 232, 232, 0.25);
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          transition: all 0.15s ease;
          padding: 0;
        }

        .cipher-radio:hover {
          border-color: rgba(232, 232, 232, 0.4);
        }

        .cipher-radio.checked {
          border-color: var(--surbee-fg-primary, #E8E8E8);
          background: var(--surbee-fg-primary, #E8E8E8);
        }

        .cipher-radio-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--surbee-bg-primary, rgb(19, 19, 20));
        }

        .cipher-radio-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cipher-radio-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .cipher-radio-desc {
          font-size: 13px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.5));
          line-height: 1.4;
        }

        /* Cipher Checks Group - Rounded container like Sana */
        .cipher-checks-group {
          display: flex;
          flex-direction: column;
          border-radius: 20px;
          padding: 20px 24px;
          margin-bottom: 32px;
          background-color: rgba(232, 232, 232, 0.02);
        }

        /* Modal Styles */
        .settings-modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .settings-modal-content {
          position: relative;
          width: 900px;
          max-width: calc(100vw - 32px);
          max-height: calc(100vh - 32px);
          border-radius: 16px;
          border: 1px solid rgba(232, 232, 232, 0.08);
          background: var(--surbee-bg-primary, rgb(19, 19, 20));
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(232, 232, 232, 0.08) transparent;
        }

        /* Full Screen Layout */
        .settings-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100vw;
          height: 100vh;
          z-index: 99999;
          background: var(--surbee-bg-primary, rgb(19, 19, 20));
          overflow: hidden;
        }

        .settings-close-btn {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 100000;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(232, 232, 232, 0.06);
          border: 1px solid rgba(232, 232, 232, 0.1);
          border-radius: 10px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .settings-close-btn:hover {
          background: rgba(232, 232, 232, 0.1);
          color: var(--surbee-fg-primary, #E8E8E8);
          border-color: rgba(232, 232, 232, 0.2);
        }

        .settings-scroll-container {
          width: 100%;
          height: 100%;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(232, 232, 232, 0.08) transparent;
        }
      `}</style>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProjectSettings;
