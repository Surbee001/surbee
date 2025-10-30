'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Image, 
  Music, 
  Video, 
  File, 
  MoreVertical, 
  Eye, 
  Download, 
  Edit, 
  Trash2, 
  Calendar,
  User,
  Hash
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type Document } from './DocumentManager';

interface DocumentCardProps {
  document: Document;
  onView?: (document: Document) => void;
  onEdit?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  isExpanded?: boolean;
  onClick?: () => void;
}

export function DocumentCard({ 
  document, 
  onView, 
  onEdit, 
  onDelete, 
  onDownload, 
  isExpanded = false,
  onClick 
}: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getFileIcon = () => {
    const type = document.type;
    if (type.startsWith('image/')) return <Image size={16} className="text-black" />;
    if (type.startsWith('audio/')) return <Music size={16} className="text-black" />;
    if (type.startsWith('video/')) return <Video size={16} className="text-black" />;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) 
      return <FileText size={16} className="text-black" />;
    return <File size={16} className="text-black" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <motion.div
      className={`group relative bg-white border border-gray-200 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
        isHovered ? 'border-black shadow-sm' : 'hover:border-gray-300'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Main content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* File icon */}
          <div className="mt-1 flex-shrink-0">
            {getFileIcon()}
          </div>

          {/* Document info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-black truncate text-sm">
              {document.name}
            </h3>
            
            <p className="text-xs text-gray-500 mt-1">
              {formatFileSize(document.size)} • {formatDate(document.createdAt)}
            </p>

            {/* Summary */}
            <p className={`text-xs text-gray-600 mt-2 leading-relaxed ${
              isExpanded ? '' : 'line-clamp-2'
            }`}>
              {document.summary}
            </p>

            {/* Tags */}
            {document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {document.tags.slice(0, isExpanded ? undefined : 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    <Hash size={8} />
                    {tag}
                  </span>
                ))}
                {!isExpanded && document.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{document.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions menu */}
          <div className="relative flex-shrink-0">
            <Button
              variant="ghost"
              size="iconXss"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical size={14} />
            </Button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                >
                  {onView && (
                    <button
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(document);
                        setShowMenu(false);
                      }}
                    >
                      <Eye size={12} />
                      View
                    </button>
                  )}
                  
                  {onDownload && (
                    <button
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(document);
                        setShowMenu(false);
                      }}
                    >
                      <Download size={12} />
                      Download
                    </button>
                  )}
                  
                  {onEdit && (
                    <button
                      className="w-full px-3 py-2 text-left text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(document);
                        setShowMenu(false);
                      }}
                    >
                      <Edit size={12} />
                      Edit
                    </button>
                  )}
                  
                  {onDelete && (
                    <button
                      className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(document);
                        setShowMenu(false);
                      }}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Expanded metadata */}
        <AnimatePresence>
          {isExpanded && document.metadata && (
            <motion.div
              className="mt-4 pt-4 border-t border-gray-100"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="grid grid-cols-2 gap-4 text-xs">
                {document.metadata.author && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <User size={12} />
                    <span>Author: {document.metadata.author}</span>
                  </div>
                )}
                
                {document.metadata.pages && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText size={12} />
                    <span>Pages: {document.metadata.pages}</span>
                  </div>
                )}
                
                {document.metadata.duration && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={12} />
                    <span>Duration: {Math.round(document.metadata.duration)}s</span>
                  </div>
                )}
                
                {document.metadata.dimensions && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Image size={12} />
                    <span>
                      {document.metadata.dimensions.width} × {document.metadata.dimensions.height}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hover overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-black bg-opacity-5 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}