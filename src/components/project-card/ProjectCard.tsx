import React from 'react';
import { MoreHorizontal, Copy, Share, Settings, Archive, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectCardProps {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
  previewImage?: string;
  userAvatar?: string;
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
  onDuplicate,
  onShare,
  onSettings,
  onArchive,
  onDelete,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/project/${id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Published';
      case 'draft': return 'Draft';
      case 'archived': return 'Archived';
      default: return 'Draft';
    }
  };

  return (
    <div className="project-card-container">
      {/* Survey Preview Card */}
      <div className="project-card-preview-section">
        <div
          className="project-card-preview-link"
          onClick={handleCardClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCardClick();
            }
          }}
        >
          <div className="project-card-preview-inner">
            {previewImage ? (
              <img
                className="project-card-preview-image"
                alt={`Screenshot of ${title}`}
                src={previewImage}
              />
            ) : (
              <div className="project-card-preview-placeholder">
                <span className="project-card-preview-placeholder-text">No preview</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info and Actions Below Card */}
      <div className="project-card-info-section">
        {/* User Avatar */}
        <div className="project-card-avatar-wrapper">
          <span className="project-card-avatar">
            {userAvatar ? (
              <img
                className="project-card-avatar-image"
                src={userAvatar}
                alt="User avatar"
              />
            ) : (
              <div className="project-card-avatar-gradient" />
            )}
          </span>
        </div>

        {/* Title, Status, and Actions */}
        <div className="project-card-content-wrapper">
          <div className="project-card-text-section">
            {/* Title and Status Badge */}
            <div className="project-card-title-row">
              <p className="project-card-title">
                {title}
              </p>
              <span className="project-card-status-badge">
                {getStatusLabel(status)}
              </span>
            </div>
            
            {/* Last Edited */}
            <div className="project-card-meta-row">
              <p className="project-card-meta-text">Edited {formatDate(updatedAt)}</p>
            </div>
          </div>

          {/* 3 Dots Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="project-card-menu-button"
                onClick={(e) => e.stopPropagation()}
                aria-label="More options"
              >
                <MoreHorizontal className="project-card-menu-icon" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.(id);
                }}
              >
                <Copy size={16} />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.(id);
                }}
              >
                <Share size={16} />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onSettings?.(id);
                }}
              >
                <Settings size={16} />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive?.(id);
                }}
              >
                <Archive size={16} />
                <span>Archive</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(id);
                }}
                className="text-destructive"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};