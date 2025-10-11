import React from 'react';
import { Users, Star, Tag, FileText } from 'lucide-react';
import { Image as IKImage } from '@imagekit/next';

interface CommunityTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  remixCount: number;
  createdAt: string;
  previewImage?: string;
  tags: string[];
  framework: string;
}

interface CommunityTemplateCardProps {
  template: CommunityTemplate;
  onRemixTemplate: (templateId: string) => void;
}

export const CommunityTemplateCard: React.FC<CommunityTemplateCardProps> = ({
  template,
  onRemixTemplate,
}) => {
  return (
    <div
      className="group w-full p-[5px] rounded-[12px] relative border transition-all duration-300 ease-in-out flex flex-col gap-[5px] h-full"
      style={{ 
        cursor: "pointer",
        backgroundColor: "#141414",
        borderColor: 'var(--surbee-border-accent)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'white';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--surbee-border-accent)';
      }}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-start">
        <div className="flex gap-[5px] flex-1 min-w-0">
          <div className="text-sm flex flex-col justify-start gap-1">
            <p className="text-white font-medium text-sm leading-tight truncate" title={template.title}>
              {template.title}
            </p>
            <p className="text-gray-400 text-xs leading-tight line-clamp-2" title={template.description}>
              {template.description}
            </p>
          </div>
        </div>
        
        {/* Remix Button */}
        <div
          className="w-[80px] h-[32px] bg-white text-black opacity-0 group-hover:opacity-100 group-hover:border-white group-hover:pointer-events-auto duration-300 ease-in-out text-xs rounded-lg flex items-center justify-center font-medium cursor-pointer pointer-events-auto active:scale-95 transition"
          style={{ border: '1px solid var(--surbee-border-accent)' }}
          onClick={(e) => {
            e.stopPropagation();
            onRemixTemplate(template.id);
          }}
        >
          Remix
        </div>
      </div>

      {/* Category and Framework */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs px-2 py-1 rounded-md bg-gray-700 text-gray-300">
          {template.category}
        </span>
        <span className="text-xs px-2 py-1 rounded-md bg-blue-500/20 text-blue-400 flex items-center gap-1">
          <Star className="w-3 h-3" />
          {template.framework}
        </span>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-1 flex-wrap">
        {template.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="text-xs px-2 py-1 rounded-md bg-gray-800 text-gray-400 flex items-center gap-1">
            <Tag className="w-2 h-2" />
            {tag}
          </span>
        ))}
        {template.tags.length > 3 && (
          <span className="text-xs text-gray-500">+{template.tags.length - 3}</span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{template.remixCount.toLocaleString()} remixes</span>
        </div>
      </div>

      {/* Preview Image */}
      <div className="w-full rounded-[8px] aspect-[210/119] mt-auto overflow-hidden">
        {template.previewImage ? (
          <IKImage
            src={template.previewImage}
            alt={template.title}
            width={210}
            height={119}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};
