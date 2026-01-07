"use client";

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/trpc/react';
import { SurveyLinkCard } from './SurveyLinkCard';
import { StatsStrip } from './StatsStrip';
import { CustomUrlCard } from './CustomUrlCard';
import { QRCodeCard } from './QRCodeCard';
import { EmbedCodeCard } from './EmbedCodeCard';
import { SocialShareCard } from './SocialShareCard';
import { SettingsCard } from './SettingsCard';
import styles from './share.module.css';

interface ShareTabProps {
  projectId: string;
  publishedUrl?: string | null;
}

export function ShareTab({ projectId, publishedUrl }: ShareTabProps) {
  const { data: shareSettings, refetch } = api.project.getShareSettings.useQuery({ projectId });
  const updateSettings = api.project.updateShareSettings.useMutation({
    onSuccess: () => refetch(),
  });

  const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://form.localhost:3000/'
    : 'https://form.surbee.dev/';

  const surveyUrl = shareSettings?.customSlug
    ? `${baseUrl}${shareSettings.customSlug}`
    : publishedUrl
      ? `${baseUrl}${publishedUrl}`
      : `${baseUrl}${projectId}`;

  const handleSaveSlug = async (slug: string) => {
    await updateSettings.mutateAsync({ projectId, customSlug: slug });
  };

  const handleToggleSetting = async (id: string, enabled: boolean) => {
    await updateSettings.mutateAsync({ projectId, [id]: enabled });
  };

  // Settings configuration
  const settingsConfig = [
    {
      id: 'acceptResponses',
      label: 'Accept Responses',
      description: 'Allow new survey responses to be submitted',
      enabled: shareSettings?.acceptResponses ?? true,
    },
    {
      id: 'showProgressBar',
      label: 'Show Progress Bar',
      description: 'Display a progress indicator during the survey',
      enabled: shareSettings?.showProgressBar ?? true,
    },
    {
      id: 'collectEmail',
      label: 'Collect Email',
      description: 'Ask respondents for their email address',
      enabled: shareSettings?.collectEmail ?? false,
    },
    {
      id: 'requireAuth',
      label: 'Require Sign In',
      description: 'Only allow signed-in users to respond',
      enabled: shareSettings?.requireAuth ?? false,
    },
  ];

  return (
    <div className={styles.shareContainer}>
      <div className={styles.shareContent}>
        {/* Hero - Survey Link */}
        <SurveyLinkCard surveyUrl={surveyUrl} />

        {/* Stats Strip */}
        <StatsStrip
          isLive={shareSettings?.acceptResponses ?? true}
          views={0}
          responses={0}
        />

        {/* Two Column Grid */}
        <div className={styles.twoColumnGrid}>
          {/* Custom URL */}
          <CustomUrlCard
            baseUrl={baseUrl}
            currentSlug={shareSettings?.customSlug || ''}
            projectId={projectId}
            onSaveSlug={handleSaveSlug}
          />

          {/* QR Code */}
          <QRCodeCard surveyUrl={surveyUrl} projectId={projectId} />

          {/* Embed Code - Full Width */}
          <EmbedCodeCard surveyUrl={surveyUrl} />

          {/* Social Share - Full Width */}
          <SocialShareCard surveyUrl={surveyUrl} />

          {/* Settings - Full Width */}
          <SettingsCard
            settings={settingsConfig}
            onToggle={handleToggleSetting}
          />
        </div>
      </div>
    </div>
  );
}

export default ShareTab;
