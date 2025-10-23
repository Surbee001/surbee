import React from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import { Image as IKImage } from '@imagekit/next';

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
    router.push(`/project/${id}/manage`);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/project/${id}/manage`);
  };

  // Mock response count - in real implementation, this would come from props
  const responseCount = 154;

  return (
    <div
      className="group w-full p-[5px] rounded-[12px] relative border transition-all duration-300 ease-in-out flex flex-col gap-[5px] h-full"
      style={{ 
        cursor: "pointer",
        backgroundColor: "#141414",
        borderColor: 'var(--surbee-border-accent)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#f8f8f8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--surbee-border-accent)';
      }}
      onClick={handleCardClick}
    >
      <div className="w-full flex justify-between">
        <div className="flex gap-[5px]">
          <img
            className="rounded-[8px]"
            height={35}
            width={35}
            src={userAvatar || "https://endlesstools.io/_next/image?url=/embeds/avatars/4.png&w=96&q=75"}
            alt="User avatar"
          />
          <div className="text-sm flex flex-col justify-center h-[35px]">
            <p className="text-white font-medium truncate max-w-[120px]" title={title}>{title}</p>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
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
          <IKImage
            src={previewImage}
            alt={title}
            width={210}
            height={119}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src="https://endlesstools.io/embeds/4.png"
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
};