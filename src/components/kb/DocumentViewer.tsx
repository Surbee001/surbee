"use client";

import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCw,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'image' | 'spreadsheet' | 'other';
  date: Date;
  size: string;
  tags: Tag[];
  url?: string;
  content?: string;
}

interface DocumentViewerProps {
  document: Document;
  onClose: () => void;
}

// Avoid shadowing the global `document` object
export default function DocumentViewer({ document: doc, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(10); // Mock total pages
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rotation, setRotation] = useState(0);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const toggleFullscreen = () => {
    if (typeof window === 'undefined') return;
    const d = window.document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void>;
    };
    const root = d.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    const isFs = d.fullscreenElement || (d as any).webkitFullscreenElement;
    if (!isFs) {
      if (root.requestFullscreen) root.requestFullscreen();
      else if (root.webkitRequestFullscreen) root.webkitRequestFullscreen();
      setIsFullscreen(true);
    } else {
      if (d.exitFullscreen) d.exitFullscreen();
      else if ((d as any).webkitExitFullscreen) (d as any).webkitExitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: 'var(--surbee-bg-primary)' }}>
      {/* Header */}
      <div className="h-16 theme-card border-b border-theme-primary flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-10 h-10 theme-button-secondary rounded-lg flex items-center justify-center hover:bg-theme-secondary transition-colors"
          >
            <X className="w-5 h-5 text-theme-primary" />
          </button>
          
          <div className="flex items-center gap-3">
            {doc.type === 'pdf' && <FileText className="w-5 h-5 text-theme-muted" />}
            {doc.type === 'image' && <ImageIcon className="w-5 h-5 text-theme-muted" />}
            <div>
              <h2 className="text-[16px] font-medium text-theme-primary">{doc.title}</h2>

              <p className="text-[12px] text-theme-muted">
                {formatDate(doc.date)} <span className="mx-2">&middot;</span> {doc.size}
              </p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2">
            {doc.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 rounded-full text-[11px] font-medium text-theme-primary"
                style={{ backgroundColor: `${tag.color}20`, border: `1px solid ${tag.color}40` }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-2 theme-button-secondary rounded-lg p-1">
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded hover:bg-theme-secondary flex items-center justify-center transition-colors"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4 text-theme-muted" />
            </button>
            <span className="text-[12px] text-theme-muted w-12 text-center">{zoom}%</span>
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded hover:bg-theme-secondary flex items-center justify-center transition-colors"
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-4 h-4 text-theme-muted" />
            </button>
          </div>

          {/* Page Navigation (for PDFs) */}
          {doc.type === 'pdf' && (
            <div className="flex items-center gap-2 theme-button-secondary rounded-lg p-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="w-8 h-8 rounded hover:bg-theme-secondary flex items-center justify-center transition-colors"
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="w-4 h-4 text-theme-muted" />
              </button>
              <span className="text-[12px] text-theme-muted w-20 text-center">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="w-8 h-8 rounded hover:bg-theme-secondary flex items-center justify-center transition-colors"
                disabled={currentPage >= totalPages}
              >
                <ChevronRight className="w-4 h-4 text-theme-muted" />
              </button>
            </div>
          )}

          {/* Rotate */}
          <button
            onClick={handleRotate}
            className="w-10 h-10 theme-button-secondary rounded-lg flex items-center justify-center hover:bg-theme-secondary transition-colors"
          >
            <RotateCw className="w-4 h-4 text-theme-muted" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="w-10 h-10 theme-button-secondary rounded-lg flex items-center justify-center hover:bg-theme-secondary transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-theme-muted" />
            ) : (
              <Maximize2 className="w-4 h-4 text-theme-muted" />
            )}
          </button>

          <div className="w-px h-8 bg-theme-primary" />

          {/* Actions */}
          <button className="w-10 h-10 theme-button-secondary rounded-lg flex items-center justify-center hover:bg-theme-secondary transition-colors">
            <Download className="w-4 h-4 text-theme-muted" />
          </button>
          <button className="w-10 h-10 theme-button-secondary rounded-lg flex items-center justify-center hover:bg-theme-secondary transition-colors">
            <Share2 className="w-4 h-4 text-theme-muted" />
          </button>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8" style={{ backgroundColor: 'var(--surbee-bg-secondary)' }}>
        <div 
          className="bg-white rounded-lg shadow-2xl transition-transform"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center',
            maxWidth: '90%',
            maxHeight: '90%'
          }}
        >
          {/* Mock Document Content */}
          {doc.type === 'pdf' && (
            <div className="w-[816px] h-[1056px] p-16 bg-white">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Document Title</h1>
                <div className="space-y-2">
                  <p className="text-gray-700 leading-relaxed">
                    This is a sample PDF document viewer. In a real implementation, this would render
                    the actual PDF content using a library like react-pdf or pdf.js.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    The viewer includes controls for zooming, rotating, and navigating through pages.
                    You can also download the document or share it with others.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
                    incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                  </p>
                </div>
                <div className="mt-8 p-4 bg-gray-100 rounded">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Section 1</h2>
                  <p className="text-gray-600">
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu
                    fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
                    culpa qui officia deserunt mollit anim id est laborum.
                  </p>
                </div>
              </div>
            </div>
          )}

          {doc.type === 'image' && (
            <div className="p-8">
              <img
                src={doc.url || "/api/placeholder/800/600"}
                alt={doc.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}

          {doc.type === 'doc' && (
            <div className="w-[816px] h-[1056px] p-16 bg-white">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">Word Document</h1>
                <div className="space-y-2">
                  <p className="text-gray-700 leading-relaxed">
                    This is a sample Word document viewer. The actual implementation would parse
                    and display .doc or .docx files with proper formatting.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Features include text formatting, images, tables, and other rich content
                    typically found in Word documents.
                  </p>
                </div>
              </div>
            </div>
          )}

          {doc.type === 'spreadsheet' && (
            <div className="w-[1200px] h-[800px] p-8 bg-white overflow-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Column A</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Column B</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Column C</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Column D</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(20)].map((_, i) => (
                    <tr key={i}>
                      <td className="border border-gray-300 px-4 py-2">Cell A{i + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">Cell B{i + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">Cell C{i + 1}</td>
                      <td className="border border-gray-300 px-4 py-2">Cell D{i + 1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="h-10 theme-card border-t border-theme-primary flex items-center justify-between px-6">
        <div className="flex items-center gap-4 text-[11px] text-theme-muted">
          <span>Type: {doc.type.toUpperCase()}</span>
          <span className="mx-2">&middot;</span>
          <span>Size: {doc.size}</span>
          <span className="mx-2">&middot;</span>
          <span>Modified: {formatDate(doc.date)}</span>
        </div>
        <div className="text-[11px] text-theme-muted">
          {doc.type === 'pdf' && `Page ${currentPage} of ${totalPages}`}
          {doc.type === 'image' && `Zoom: ${zoom}%`}
        </div>
      </div>
    </div>
  );
}
