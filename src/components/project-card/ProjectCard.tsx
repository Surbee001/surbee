'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Pencil, Copy, Share2, Settings, Archive, Trash2, ExternalLink, Upload, Globe } from 'lucide-react';
import { Image as IKImage } from '@imagekit/next';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from '@/components/ui/context-menu';
import { useAuth } from '@/contexts/AuthContext';

// Simple draft placeholder - just text
const DraftPlaceholder: React.FC = () => (
  <div
    className="w-full h-full flex items-center justify-center"
    style={{ backgroundColor: '#0a0a0a' }}
  >
    <span
      className="text-sm font-medium"
      style={{ color: 'rgba(255,255,255,0.25)' }}
    >
      Draft
    </span>
  </div>
);

interface ProjectCardProps {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
  previewImage?: string;
  userAvatar?: string;
  activeChatSessionId?: string | null;
  responseCount?: number;
  publishedUrl?: string | null;
  isMarketplaceVisible?: boolean;
  isTemplate?: boolean;
  onRename?: (id: string, newTitle: string) => void;
  onDuplicate?: (id: string) => void;
  onShare?: (id: string) => void;
  onSettings?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPublishToMarketplace?: (id: string, isTemplate: boolean) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  status,
  updatedAt,
  previewImage,
  userAvatar,
  activeChatSessionId,
  responseCount = 0,
  publishedUrl,
  isMarketplaceVisible = false,
  isTemplate = false,
  onRename,
  onDuplicate,
  onShare,
  onSettings,
  onArchive,
  onDelete,
  onPublishToMarketplace,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishToMarketplace = async (asTemplate: boolean) => {
    if (!user) return;

    setIsPublishing(true);
    try {
      const response = await fetch('/api/marketplace/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: id,
          isTemplate: asTemplate,
          userId: user.id,
        }),
      });

      if (response.ok) {
        onPublishToMarketplace?.(id, asTemplate);
      }
    } catch (error) {
      console.error('Failed to publish to marketplace:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCardClick = () => {
    if (isRenaming) return;
    router.push(`/projects/${id}/manage`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = activeChatSessionId
      ? `/project/${id}?sessionId=${activeChatSessionId}`
      : `/project/${id}`;
    router.push(url);
  };

  const handleRenameSubmit = () => {
    if (newTitle.trim() && newTitle !== title) {
      onRename?.(id, newTitle.trim());
    }
    setIsRenaming(false);
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit();
    } else if (e.key === 'Escape') {
      setNewTitle(title);
      setIsRenaming(false);
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className="group w-full p-[5px] rounded-[12px] relative border transition-all duration-300 ease-in-out flex flex-col gap-[5px] h-full"
          style={{
            cursor: "pointer",
            backgroundColor: 'var(--surbee-card-bg)',
            borderColor: 'transparent',
            boxSizing: 'border-box'
          }}
          onMouseEnter={(e) => {
            const isDark = document.documentElement.classList.contains('dark');
            e.currentTarget.style.borderColor = isDark ? '#f8f8f8' : '#000000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'transparent';
          }}
          onClick={handleCardClick}
        >
          <div className="w-full flex justify-between">
            <div className="flex gap-[5px]">
              <div className="rounded-[8px] overflow-hidden flex-shrink-0" style={{ width: 35, height: 35 }}>
                {userAvatar ? (
                  <img
                    className="w-full h-full object-cover"
                    src={userAvatar}
                    alt="User avatar"
                    onError={(e) => {
                      // Fallback to default if image fails to load
                      e.currentTarget.src = "https://endlesstools.io/_next/image?url=/embeds/avatars/4.png&w=96&q=75";
                    }}
                  />
                ) : (
                  <img
                    className="w-full h-full object-cover"
                    src="https://endlesstools.io/_next/image?url=/embeds/avatars/4.png&w=96&q=75"
                    alt="User avatar"
                  />
                )}
              </div>
              <div className="text-sm flex flex-col justify-center h-[35px]">
                {isRenaming ? (
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onBlur={handleRenameSubmit}
                    onKeyDown={handleRenameKeyDown}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                    className="font-medium max-w-[120px] bg-transparent border-b border-zinc-500 outline-none text-sm"
                    style={{ color: 'var(--surbee-fg-primary)' }}
                  />
                ) : (
                  <p className="font-medium truncate max-w-[120px]" style={{ color: 'var(--surbee-fg-primary)' }} title={title}>{title}</p>
                )}
                <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--surbee-fg-secondary)' }}>
                  <User className="w-3 h-3" />
                  <span>{responseCount}</span>
                </div>
              </div>
            </div>
            <div
              onClick={handleEditClick}
              className="w-[66px] h-[35px] bg-white text-black opacity-0 group-hover:opacity-100 group-hover:border-[#f8f8f8] group-hover:pointer-events-auto duration-300 ease-in-out text-sm rounded-lg flex items-center justify-center font-medium cursor-pointer pointer-events-auto active:scale-95 transition"
              style={{ border: '1px solid var(--surbee-border-accent)' }}
            >
              Edit
            </div>
          </div>
          <div className="w-full rounded-[8px] aspect-[210/119] mt-auto overflow-hidden">
            {previewImage ? (
              previewImage.startsWith('data:') ? (
                <img
                  src={previewImage}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <IKImage
                  src={previewImage}
                  alt={title}
                  width={210}
                  height={119}
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <DraftPlaceholder />
            )}
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent
        style={{
          borderRadius: '24px',
          padding: '8px',
          border: '1px solid var(--surbee-dropdown-border)',
          backgroundColor: 'var(--surbee-dropdown-bg)',
          backdropFilter: 'blur(12px)',
          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 7px 16px',
          minWidth: '200px',
        }}
      >
        {/* Open in new tab */}
        <ContextMenuItem
          className="cursor-pointer"
          style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-primary)', fontSize: '14px', marginBottom: '1px' }}
          onClick={() => window.open(`/projects/${id}/manage`, '_blank')}
        >
          <div className="flex items-center gap-3">
            <ExternalLink className="h-4 w-4" style={{ color: 'var(--surbee-dropdown-text-muted)' }} />
            <span>Open in new tab</span>
          </div>
        </ContextMenuItem>

        {/* Rename */}
        <ContextMenuItem
          className="cursor-pointer"
          style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-primary)', fontSize: '14px', marginBottom: '1px' }}
          onClick={() => setIsRenaming(true)}
        >
          <div className="flex items-center gap-3">
            <Pencil className="h-4 w-4" style={{ color: 'var(--surbee-dropdown-text-muted)' }} />
            <span>Rename</span>
          </div>
        </ContextMenuItem>

        {/* Duplicate */}
        <ContextMenuItem
          className="cursor-pointer"
          style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-primary)', fontSize: '14px', marginBottom: '1px' }}
          onClick={() => onDuplicate?.(id)}
        >
          <div className="flex items-center gap-3">
            <Copy className="h-4 w-4" style={{ color: 'var(--surbee-dropdown-text-muted)' }} />
            <span>Duplicate</span>
          </div>
        </ContextMenuItem>

        <ContextMenuSeparator style={{ backgroundColor: 'var(--surbee-dropdown-separator)', margin: '4px 0' }} />

        {/* Share */}
        {status === 'published' && publishedUrl && (
          <ContextMenuItem
            className="cursor-pointer"
            style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-primary)', fontSize: '14px', marginBottom: '1px' }}
            onClick={() => {
              const surveyUrl = `https://form.surbee.dev/${publishedUrl}`;
              navigator.clipboard.writeText(surveyUrl);
              onShare?.(id);
            }}
          >
            <div className="flex items-center gap-3">
              <Share2 className="h-4 w-4" style={{ color: 'var(--surbee-dropdown-text-muted)' }} />
              <span>Copy survey link</span>
            </div>
          </ContextMenuItem>
        )}

        {/* Settings */}
        <ContextMenuItem
          className="cursor-pointer"
          style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-primary)', fontSize: '14px', marginBottom: '1px' }}
          onClick={() => {
            onSettings?.(id);
            router.push(`/projects/${id}/manage?tab=settings`);
          }}
        >
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4" style={{ color: 'var(--surbee-dropdown-text-muted)' }} />
            <span>Settings</span>
          </div>
        </ContextMenuItem>

        <ContextMenuSeparator style={{ backgroundColor: 'var(--surbee-dropdown-separator)', margin: '4px 0' }} />

        {/* Publish to Marketplace */}
        {status === 'published' && !isMarketplaceVisible && (
          <ContextMenuSub>
            <ContextMenuSubTrigger
              className="cursor-pointer"
              style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-primary)', fontSize: '14px', marginBottom: '1px' }}
            >
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4" style={{ color: 'var(--surbee-dropdown-text-muted)' }} />
                <span>Publish to Marketplace</span>
              </div>
            </ContextMenuSubTrigger>
            <ContextMenuSubContent
              style={{
                borderRadius: '18px',
                padding: '6px',
                border: '1px solid var(--surbee-dropdown-border)',
                backgroundColor: 'var(--surbee-dropdown-bg)',
                backdropFilter: 'blur(12px)',
                boxShadow: 'rgba(0, 0, 0, 0.2) 0px 7px 16px',
              }}
            >
              <ContextMenuItem
                className="cursor-pointer"
                style={{ borderRadius: '14px', padding: '8px 12px', color: 'var(--surbee-fg-primary)', fontSize: '13px', marginBottom: '1px' }}
                onClick={() => handlePublishToMarketplace(false)}
                disabled={isPublishing}
              >
                <div className="flex items-center gap-2">
                  <Upload className="h-3.5 w-3.5" style={{ color: 'var(--surbee-dropdown-text-muted)' }} />
                  <span>As Survey</span>
                </div>
              </ContextMenuItem>
              <ContextMenuItem
                className="cursor-pointer"
                style={{ borderRadius: '14px', padding: '8px 12px', color: 'var(--surbee-fg-primary)', fontSize: '13px' }}
                onClick={() => handlePublishToMarketplace(true)}
                disabled={isPublishing}
              >
                <div className="flex items-center gap-2">
                  <Copy className="h-3.5 w-3.5" style={{ color: 'var(--surbee-dropdown-text-muted)' }} />
                  <span>As Template (Remixable)</span>
                </div>
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        {/* Already in marketplace indicator */}
        {isMarketplaceVisible && (
          <ContextMenuItem
            className="cursor-default"
            style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-secondary)', fontSize: '14px', marginBottom: '1px' }}
            disabled
          >
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4" style={{ color: 'rgba(100, 200, 100, 0.8)' }} />
              <span>In Marketplace {isTemplate ? '(Template)' : '(Survey)'}</span>
            </div>
          </ContextMenuItem>
        )}

        <ContextMenuSeparator style={{ backgroundColor: 'var(--surbee-dropdown-separator)', margin: '4px 0' }} />

        {/* Archive */}
        <ContextMenuItem
          className="cursor-pointer"
          style={{ borderRadius: '18px', padding: '10px 14px', color: 'var(--surbee-fg-primary)', fontSize: '14px', marginBottom: '1px' }}
          onClick={() => onArchive?.(id)}
        >
          <div className="flex items-center gap-3">
            <Archive className="h-4 w-4" style={{ color: 'var(--surbee-dropdown-text-muted)' }} />
            <span>{status === 'archived' ? 'Unarchive' : 'Archive'}</span>
          </div>
        </ContextMenuItem>

        {/* Delete */}
        <ContextMenuItem
          className="cursor-pointer"
          style={{ borderRadius: '18px', padding: '10px 14px', color: '#ef4444', fontSize: '14px' }}
          onClick={() => onDelete?.(id)}
        >
          <div className="flex items-center gap-3">
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </div>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
