"use client";

import React from 'react';
import { WebContainerPreview } from '@/components/sandbox/WebContainerPreview';

interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

interface PreviewTabProps {
  projectId: string;
  sandboxBundle?: SandboxBundle | null;
  activeChatSessionId?: string | null;
}

export const PreviewTab: React.FC<PreviewTabProps> = ({ projectId, sandboxBundle }) => {
  // No sandbox bundle - show placeholder
  if (!sandboxBundle?.files) {
    return (
      <div className="preview-root">
        <div className="empty-state">
          <h3>No Survey Generated Yet</h3>
          <p>Create your survey using the AI chat to see a preview here.</p>
        </div>

        <style jsx>{`
          .preview-root {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--surbee-bg-primary, #131314);
            margin: -24px;
          }

          .empty-state {
            text-align: center;
            color: var(--surbee-fg-muted, #888);
          }

          .empty-state h3 {
            color: var(--surbee-fg-primary, #E8E8E8);
            font-size: 18px;
            font-weight: 500;
            margin: 0 0 8px 0;
          }

          .empty-state p {
            font-size: 14px;
            margin: 0;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="preview-root">
      <div className="preview-container">
        <WebContainerPreview
          bundle={sandboxBundle}
          projectId={projectId}
          className="w-full h-full"
        />
      </div>

      <style jsx>{`
        .preview-root {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          background: var(--surbee-bg-primary, #131314);
          overflow: hidden;
          margin: -24px;
        }

        .preview-container {
          flex: 1;
          display: flex;
          overflow: hidden;
          background: var(--surbee-bg-primary, #131314);
        }
      `}</style>
    </div>
  );
};

export default PreviewTab;
