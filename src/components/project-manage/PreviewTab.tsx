"use client";

import React from 'react';
import { ModalSandboxPreview } from '@/components/sandbox/ModalSandboxPreview';
import { SurveyRenderer } from '@/components/block-editor/SurveyRenderer';
import type { BlockEditorSurvey } from '@/lib/block-editor/types';

interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

interface PreviewTabProps {
  projectId: string;
  sandboxBundle?: SandboxBundle | null;
  blockSurvey?: BlockEditorSurvey | null;
  activeChatSessionId?: string | null;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({ projectId, sandboxBundle, blockSurvey }) => {
  // Block survey preview — renders the SurveyRenderer exactly as respondents would see
  if (blockSurvey) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        background: blockSurvey.theme?.backgroundColor || '#ffffff',
        overflow: 'hidden',
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'auto',
          width: '100%',
        }}>
          <SurveyRenderer survey={blockSurvey} isPreview />
        </div>
      </div>
    );
  }

  // No content
  if (!sandboxBundle?.files) {
    return (
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surbee-bg-primary, #131314)',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--surbee-fg-muted, #888)' }}>
          <h3 style={{
            color: 'var(--surbee-fg-primary, #E8E8E8)',
            fontSize: '18px',
            fontWeight: 500,
            margin: '0 0 8px 0',
          }}>No Survey Generated Yet</h3>
          <p style={{ fontSize: '14px', margin: 0 }}>
            Create your survey using the AI chat to see a preview here.
          </p>
        </div>
      </div>
    );
  }

  // Sandbox preview
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--surbee-bg-primary, #131314)',
      overflow: 'hidden',
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        background: 'var(--surbee-bg-primary, #131314)',
      }}>
        <ModalSandboxPreview
          bundle={sandboxBundle}
          projectId={projectId}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default PreviewTab;
