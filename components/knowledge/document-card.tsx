'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Image,
  File,
  Eye,
  Download,
  Share2,
  Sparkles,
  Clock,
  User,
  Tag,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface DocumentCardProps {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadDate: string;
  authors: string;
  tags: string[];
  summary: string;
  insights: string[];
  isPublic?: boolean;
  remixCount?: number;
  onView?: (id: string) => void;
  onAnalyze?: (id: string) => void;
  onShare?: (id: string) => void;
  onDownload?: (id: string) => void;
}

const fileTypeIcons = {
  Document: FileText,
  pdf: FileText,
  xlsx: File,
  pptx: Image,
  docx: FileText,
  csv: File,
  image: Image,
} as const;

const fileTypeColors = {
  Document: 'text-blue-600 bg-blue-100',
  pdf: 'text-red-600 bg-red-100',
  xlsx: 'text-green-600 bg-green-100',
  pptx: 'text-orange-600 bg-orange-100',
  docx: 'text-blue-600 bg-blue-100',
  csv: 'text-purple-600 bg-purple-100',
  image: 'text-pink-600 bg-pink-100',
} as const;

export default function DocumentCard({
  id,
  title,
  type,
  size,
  uploadDate,
  authors,
  tags,
  summary,
  insights,
  isPublic = false,
  remixCount = 0,
  onView,
  onAnalyze,
  onShare,
  onDownload,
}: DocumentCardProps) {
  const FileIcon = fileTypeIcons[type as keyof typeof fileTypeIcons] || FileText;
  const colorClass = fileTypeColors[type as keyof typeof fileTypeColors] || 'text-gray-600 bg-gray-100';

  const handleView = () => onView?.(id);
  const handleAnalyze = () => onAnalyze?.(id);
  const handleShare = () => onShare?.(id);
  const handleDownload = () => onDownload?.(id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full hover:shadow-lg transition-all cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className={`p-2 rounded-lg ${colorClass} mb-3`}>
              <FileIcon className="w-5 h-5" />
            </div>
            {isPublic && (
              <Badge variant="secondary" className="text-xs">
                Public
              </Badge>
            )}
          </div>
          <CardTitle 
            className="text-base leading-tight hover:text-blue-600 transition-colors line-clamp-2"
            onClick={handleView}
          >
            {title}
          </CardTitle>
          <div className="flex items-center gap-4 text-xs text-zinc-600">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {authors}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {uploadDate}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <CardDescription className="text-sm line-clamp-3 mb-3">
            {summary}
          </CardDescription>

          {insights.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1 mb-2">
                <Sparkles className="w-3 h-3 text-purple-600" />
                <span className="text-xs font-medium text-purple-600">
                  AI Insights
                </span>
              </div>
              <div className="space-y-1">
                {insights.slice(0, 2).map((insight, index) => (
                  <div
                    key={index}
                    className="text-xs text-zinc-700 line-clamp-1 pl-3 border-l-2 border-purple-200"
                  >
                    {insight}
                  </div>
                ))}
                {insights.length > 2 && (
                  <div className="text-xs text-zinc-500 pl-3">
                    +{insights.length - 2} more insights
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs px-1.5 py-0.5"
              >
                <Tag className="w-2 h-2 mr-1" />
                {tag}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                +{tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleView}
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleAnalyze}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Analyze
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleShare}
              >
                <Share2 className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleDownload}
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
          {remixCount > 0 && (
            <div className="text-xs text-zinc-500 mt-2">
              {remixCount} remixes
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
