'use client';

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Image, Music, Video, File, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadFile {
  id: string;
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  category?: string;
  summary?: string;
}

interface DocumentUploadProps {
  onClose: () => void;
}

export function DocumentUpload({ onClose }: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (file: File) => {
    const type = file.type;
    if (type.startsWith('image/')) return <Image size={16} />;
    if (type.startsWith('audio/')) return <Music size={16} />;
    if (type.startsWith('video/')) return <Video size={16} />;
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return <FileText size={16} />;
    return <File size={16} />;
  };

  const getFileCategory = (file: File): string => {
    const type = file.type;
    if (type.startsWith('image/')) return 'images';
    if (type.startsWith('audio/')) return 'audio';
    if (type.startsWith('video/')) return 'video';
    if (type.includes('pdf') || type.includes('document') || type.includes('text')) return 'documents';
    return 'other';
  };

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = Array.from(selectedFiles).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending',
      progress: 0,
      category: getFileCategory(file)
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Auto-upload files
    newFiles.forEach(uploadFile);
  }, []);

  const uploadFile = async (uploadFile: UploadFile) => {
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id ? { ...f, status: 'uploading' } : f
    ));

    try {
      const formData = new FormData();
      formData.append('file', uploadFile.file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f => {
          if (f.id === uploadFile.id && f.progress < 90) {
            return { ...f, progress: f.progress + 10 };
          }
          return f;
        }));
      }, 200);

      // Upload to existing blob storage API
      const response = await fetch('/api/surbee/blob/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (response.ok) {
        const result = await response.json();
        
        // Generate summary for the document
        const summaryResponse = await fetch('/api/kb/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fileUrl: result.url,
            fileName: uploadFile.file.name,
            fileType: uploadFile.file.type
          }),
        });

        let summary = 'Document uploaded successfully';
        if (summaryResponse.ok) {
          const summaryResult = await summaryResponse.json();
          summary = summaryResult.summary;
        }

        setFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'success', progress: 100, summary }
            : f
        ));
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'error', progress: 0 }
          : f
      ));
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  return (
    <motion.div
      className="bg-white border-2 border-black rounded-lg p-6 w-96 max-h-[500px] overflow-hidden flex flex-col"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-black">Upload Documents</h3>
        <Button
          variant="ghost"
          size="iconXs"
          onClick={onClose}
          className="text-black hover:bg-gray-100"
        >
          <X size={16} />
        </Button>
      </div>

      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging 
            ? 'border-black bg-gray-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-1">
          Drop files here or click to browse
        </p>
        <p className="text-xs text-gray-500">
          PDF, images, audio, video, and documents
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.mp3,.mp4,.wav,.mov"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-4 flex-1 overflow-y-auto">
          <h4 className="text-sm font-medium text-black mb-2">
            Files ({files.length})
          </h4>
          
          <AnimatePresence>
            {files.map((file) => (
              <motion.div
                key={file.id}
                className="flex items-center gap-3 p-2 rounded border border-gray-200 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-gray-600">
                  {getFileIcon(file.file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">
                    {file.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  
                  {file.summary && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {file.summary}
                    </p>
                  )}
                  
                  {file.status === 'uploading' && (
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                      <div 
                        className="bg-black h-1 rounded-full transition-all duration-300"
                        style={{ width: `${file.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  {file.status === 'success' && (
                    <Check size={16} className="text-green-600" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle size={16} className="text-red-600" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="iconXss"
                    onClick={() => removeFile(file.id)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1"
            >
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => setFiles([])}
              className="flex-1"
            >
              Clear All
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}