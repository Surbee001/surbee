'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Pencil, Copy, Share2, Settings, Archive, Trash2, ExternalLink } from 'lucide-react';
import { Image as IKImage } from '@imagekit/next';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

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
  onRename?: (id: string, newTitle: string) => void;
  onDuplicate?: (id: string) => void;
  onShare?: (id: string) => void;
  onSettings?: (id: string) => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
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
  onRename,
  onDuplicate,
  onShare,
  onSettings,
  onArchive,
  onDelete,
}) => {
  const router = useRouter();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(title);

  const handleCardClick = () => {
    if (isRenaming) return;
    router.push(`/dashboard/projects/${id}/manage`);
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
              <img
                src="https://endlesstools.io/embeds/4.png"
                alt={title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent
        className="w-[200px] rounded-lg border border-zinc-800 bg-[#1b1b1b]/95 backdrop-blur-xl p-1 shadow-xl"
      >
        {/* Project title header */}
        <div className="px-2 py-1.5 text-zinc-500 truncate text-xs font-medium">
          {title}
        </div>

        <ContextMenuSeparator className="bg-white/10" />

        {/* Open in new tab */}
        <ContextMenuItem
          className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-300 rounded-md cursor-pointer hover:bg-white/5 focus:bg-white/5"
          onClick={() => window.open(`/dashboard/projects/${id}/manage`, '_blank')}
        >
          <ExternalLink className="h-4 w-4 text-zinc-500" />
          <span>Open in new tab</span>
        </ContextMenuItem>

        {/* Rename */}
        <ContextMenuItem
          className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-300 rounded-md cursor-pointer hover:bg-white/5 focus:bg-white/5"
          onClick={() => setIsRenaming(true)}
        >
          <Pencil className="h-4 w-4 text-zinc-500" />
          <span>Rename</span>
        </ContextMenuItem>

        {/* Duplicate */}
        <ContextMenuItem
          className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-300 rounded-md cursor-pointer hover:bg-white/5 focus:bg-white/5"
          onClick={() => onDuplicate?.(id)}
        >
          <Copy className="h-4 w-4 text-zinc-500" />
          <span>Duplicate</span>
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-white/10" />

        {/* Share */}
        {status === 'published' && publishedUrl && (
          <ContextMenuItem
            className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-300 rounded-md cursor-pointer hover:bg-white/5 focus:bg-white/5"
            onClick={() => {
              const surveyUrl = `${window.location.origin}/s/${publishedUrl}`;
              navigator.clipboard.writeText(surveyUrl);
              onShare?.(id);
            }}
          >
            <Share2 className="h-4 w-4 text-zinc-500" />
            <span>Copy survey link</span>
          </ContextMenuItem>
        )}

        {/* Settings */}
        <ContextMenuItem
          className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-300 rounded-md cursor-pointer hover:bg-white/5 focus:bg-white/5"
          onClick={() => {
            onSettings?.(id);
            router.push(`/dashboard/projects/${id}/manage?tab=settings`);
          }}
        >
          <Settings className="h-4 w-4 text-zinc-500" />
          <span>Settings</span>
        </ContextMenuItem>

        <ContextMenuSeparator className="bg-white/10" />

        {/* Archive */}
        <ContextMenuItem
          className="flex items-center gap-2 px-2 py-1.5 text-sm text-zinc-300 rounded-md cursor-pointer hover:bg-white/5 focus:bg-white/5"
          onClick={() => onArchive?.(id)}
        >
          <Archive className="h-4 w-4 text-zinc-500" />
          <span>{status === 'archived' ? 'Unarchive' : 'Archive'}</span>
        </ContextMenuItem>

        {/* Delete */}
        <ContextMenuItem
          className="flex items-center gap-2 px-2 py-1.5 text-sm text-red-400 rounded-md cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10"
          onClick={() => onDelete?.(id)}
        >
          <Trash2 className="h-4 w-4 text-red-400" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
