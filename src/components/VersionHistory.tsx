import React from 'react';
import { RotateCcw, Clock } from 'lucide-react';

interface BundleVersion {
  id: string;
  timestamp: number;
  bundle: {
    files: Record<string, string>;
    entry: string;
    dependencies?: string[];
    devDependencies?: string[];
  };
  description: string;
  messageId?: string;
}

interface VersionHistoryProps {
  versions: BundleVersion[];
  currentVersionId: string | null;
  onRestore: (versionId: string) => void;
}

function formatTimestamp(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // Less than 1 minute
  if (diff < 60000) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours}h ago`;
  }

  // Format as date
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function VersionHistory({ versions, currentVersionId, onRestore }: VersionHistoryProps) {
  if (versions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-4">
        <Clock className="w-12 h-12 mb-3 opacity-40" style={{ color: 'var(--surbee-fg-secondary)' }} />
        <p className="text-sm" style={{ color: 'var(--surbee-fg-secondary)' }}>
          No version history yet
        </p>
        <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--surbee-fg-secondary)' }}>
          Versions are saved automatically as the AI builds
        </p>
      </div>
    );
  }

  // Reverse to show newest first
  const sortedVersions = [...versions].reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--surbee-border-accent)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
          Version History
        </h3>
        <p className="text-xs mt-1" style={{ color: 'var(--surbee-fg-secondary)' }}>
          {versions.length} {versions.length === 1 ? 'version' : 'versions'} saved
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-2">
          {sortedVersions.map((version, index) => {
            const isCurrentVersion = version.id === currentVersionId;
            const versionNumber = versions.length - index;

            return (
              <div
                key={version.id}
                className="rounded-lg border p-3 transition-colors"
                style={{
                  borderColor: isCurrentVersion ? 'var(--surbee-border-accent)' : 'transparent',
                  backgroundColor: isCurrentVersion ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                        Version {versionNumber}
                      </span>
                      {isCurrentVersion && (
                        <span className="px-2 py-0.5 text-xs rounded-full" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                          Current
                        </span>
                      )}
                    </div>

                    <p className="text-xs mt-1" style={{ color: 'var(--surbee-fg-secondary)' }}>
                      {formatTimestamp(version.timestamp)}
                    </p>

                    <p className="text-xs mt-1.5" style={{ color: 'var(--surbee-fg-secondary)' }}>
                      {Object.keys(version.bundle.files).length} files
                    </p>
                  </div>

                  {!isCurrentVersion && (
                    <button
                      onClick={() => onRestore(version.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--surbee-fg-primary)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                      }}
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
