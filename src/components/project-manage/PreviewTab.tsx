"use client";

import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { api } from '@/lib/trpc/react';

interface PreviewTabProps {
  projectId: string;
  sandboxBundle?: {
    files: Record<string, string>;
    entry: string;
    dependencies?: string[];
    devDependencies?: string[];
  } | null;
  activeChatSessionId?: string | null;
}

type DeviceType = 'desktop' | 'mobile' | 'tablet';

const deviceDimensions: Record<DeviceType, { width: string; height: string; maxWidth: string }> = {
  desktop: { width: '100%', height: '100%', maxWidth: '100%' },
  tablet: { width: '768px', height: '1024px', maxWidth: '768px' },
  mobile: { width: '375px', height: '812px', maxWidth: '375px' },
};

export const PreviewTab: React.FC<PreviewTabProps> = ({ projectId }) => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: shareSettings } = api.project.getShareSettings.useQuery({ projectId });

  const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? `${window.location.origin}/s/`
    : 'https://surbee.com/s/';

  const surveyUrl = shareSettings?.customSlug
    ? `${baseUrl}${shareSettings.customSlug}`
    : `${baseUrl}${projectId}`;

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenInNewTab = () => {
    window.open(surveyUrl, '_blank');
  };

  const dimensions = deviceDimensions[deviceType];

  return (
    <div className="preview-root">
      {/* Full-screen Preview Frame */}
      <div className="preview-container">
        <div
          className={`preview-frame ${deviceType !== 'desktop' ? 'device-frame' : ''}`}
          style={{
            width: dimensions.width,
            maxWidth: dimensions.maxWidth,
            height: deviceType === 'desktop' ? '100%' : dimensions.height,
          }}
        >
          {isLoading && (
            <div className="loading-overlay">
              <Loader2 className="loading-spinner" size={32} />
              <span>Loading survey...</span>
            </div>
          )}
          <iframe
            key={refreshKey}
            src={surveyUrl}
            className="preview-iframe"
            onLoad={() => setIsLoading(false)}
            title="Survey Preview"
          />
        </div>
      </div>

      {/* Floating Blurred Toolbar - Overlay on top */}
      <div className="preview-toolbar-overlay">
        <div className="preview-toolbar">
          <div className="device-switcher">
            <button
              className={`device-btn ${deviceType === 'desktop' ? 'active' : ''}`}
              onClick={() => setDeviceType('desktop')}
              title="Desktop view"
            >
              <Monitor size={18} />
            </button>
            <button
              className={`device-btn ${deviceType === 'tablet' ? 'active' : ''}`}
              onClick={() => setDeviceType('tablet')}
              title="Tablet view"
            >
              <Tablet size={18} />
            </button>
            <button
              className={`device-btn ${deviceType === 'mobile' ? 'active' : ''}`}
              onClick={() => setDeviceType('mobile')}
              title="Mobile view"
            >
              <Smartphone size={18} />
            </button>
          </div>

          <div className="toolbar-url">
            <span className="url-text">{surveyUrl}</span>
          </div>

          <div className="toolbar-actions">
            <button className="action-btn" onClick={handleRefresh} title="Refresh preview">
              <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
            </button>
            <button className="action-btn" onClick={handleOpenInNewTab} title="Open in new tab">
              <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .preview-root {
          position: relative;
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--surbee-bg-primary, #131314);
          overflow: hidden;
        }

        .preview-toolbar-overlay {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          pointer-events: none;
        }

        .preview-toolbar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          background: rgba(30, 30, 31, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          pointer-events: auto;
        }

        .device-switcher {
          display: flex;
          gap: 2px;
          padding: 3px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 10px;
        }

        .device-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 30px;
          background: transparent;
          border: none;
          border-radius: 7px;
          color: var(--surbee-fg-muted, #888);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .device-btn:hover {
          color: var(--surbee-fg-primary, #E8E8E8);
          background: rgba(255, 255, 255, 0.08);
        }

        .device-btn.active {
          color: var(--surbee-fg-primary, #E8E8E8);
          background: rgba(255, 255, 255, 0.12);
        }

        .toolbar-url {
          display: flex;
          align-items: center;
          padding: 6px 12px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          max-width: 300px;
          overflow: hidden;
        }

        .url-text {
          font-family: 'Menlo', 'Monaco', monospace;
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .toolbar-actions {
          display: flex;
          gap: 4px;
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.06);
          border: none;
          border-radius: 8px;
          color: var(--surbee-fg-muted, #888);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-btn:hover {
          color: var(--surbee-fg-primary, #E8E8E8);
          background: rgba(255, 255, 255, 0.12);
        }

        .action-btn :global(.spinning) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .preview-container {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: var(--surbee-bg-primary, #131314);
        }

        .preview-frame {
          position: relative;
          background: white;
          overflow: hidden;
        }

        .preview-frame.device-frame {
          border-radius: 24px;
          border: 8px solid #2a2a2a;
          box-shadow:
            0 0 0 2px #1a1a1a,
            0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .preview-iframe {
          width: 100%;
          height: 100%;
          border: none;
          display: block;
        }

        .loading-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: var(--surbee-bg-secondary, #1E1E1F);
          color: var(--surbee-fg-muted, #888);
          font-size: 14px;
          z-index: 10;
        }

        .loading-overlay :global(.loading-spinner) {
          animation: spin 1s linear infinite;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        @media (max-width: 768px) {
          .preview-toolbar-overlay {
            top: 12px;
            left: 12px;
            right: 12px;
            transform: none;
          }

          .preview-toolbar {
            width: 100%;
            justify-content: space-between;
            padding: 8px 12px;
          }

          .toolbar-url {
            flex: 1;
            max-width: none;
          }
        }
      `}</style>
    </div>
  );
};

export default PreviewTab;
