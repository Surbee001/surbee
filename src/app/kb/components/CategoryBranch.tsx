'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Grid, List, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentCard } from './DocumentCard';
import { useDocuments, type Document } from './DocumentManager';

interface CategoryBranchProps {
  category: {
    id: string;
    name: string;
    icon: React.ReactNode;
    count: number;
    color: string;
  };
  onClose: () => void;
  position: { x: number; y: number; angle: number };
}

type SortOption = 'name' | 'date' | 'size';
type ViewMode = 'grid' | 'list';

export function CategoryBranch({ category, onClose, position }: CategoryBranchProps) {
  const { state, actions } = useDocuments();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);

  const categoryDocuments = useMemo(() => {
    const filtered = state.documents.filter(doc => doc.category === category.id);
    
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
  }, [state.documents, category.id, sortBy, sortDirection]);

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortDirection('desc');
    }
  };

  const handleDocumentView = (document: Document) => {
    window.open(document.url, '_blank');
  };

  const handleDocumentEdit = (document: Document) => {
    // TODO: Implement edit functionality
    console.log('Edit document:', document);
  };

  const handleDocumentDelete = async (document: Document) => {
    if (window.confirm(`Are you sure you want to delete "${document.name}"?`)) {
      await actions.deleteDocument(document.id);
    }
  };

  const handleDocumentDownload = (document: Document) => {
    const link = document.createElement('a');
    link.href = document.url;
    link.download = document.name;
    link.click();
  };

  // Calculate panel position based on branch position
  const panelX = position.x > 300 ? position.x - 400 : position.x + 50;
  const panelY = Math.max(50, Math.min(position.y - 100, window.innerHeight - 400));

  return (
    <motion.div
      className="fixed z-50"
      style={{ left: panelX, top: panelY }}
      initial={{ opacity: 0, scale: 0.9, x: -20 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.9, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      <div className="bg-white border-2 border-black rounded-lg shadow-lg w-96 max-h-[500px] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {category.icon}
              <h3 className="font-semibold text-black capitalize">{category.name}</h3>
              <span className="text-sm text-gray-500">({categoryDocuments.length})</span>
            </div>
            <Button
              variant="ghost"
              size="iconXs"
              onClick={onClose}
              className="text-black hover:bg-gray-100"
            >
              <X size={16} />
            </Button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* View mode toggle */}
            <div className="flex rounded-md border border-gray-300 overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setViewMode('grid')}
                className="rounded-none border-0"
              >
                <Grid size={12} />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => setViewMode('list')}
                className="rounded-none border-0"
              >
                <List size={12} />
              </Button>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-1">
              <Button
                variant={sortBy === 'name' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => handleSort('name')}
                className="text-xs"
              >
                Name
                {sortBy === 'name' && (
                  sortDirection === 'asc' ? <SortAsc size={10} /> : <SortDesc size={10} />
                )}
              </Button>
              <Button
                variant={sortBy === 'date' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => handleSort('date')}
                className="text-xs"
              >
                Date
                {sortBy === 'date' && (
                  sortDirection === 'asc' ? <SortAsc size={10} /> : <SortDesc size={10} />
                )}
              </Button>
              <Button
                variant={sortBy === 'size' ? 'default' : 'ghost'}
                size="xs"
                onClick={() => handleSort('size')}
                className="text-xs"
              >
                Size
                {sortBy === 'size' && (
                  sortDirection === 'asc' ? <SortAsc size={10} /> : <SortDesc size={10} />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto p-2">
          {categoryDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="mb-2">{category.icon}</div>
              <p className="text-sm">No {category.name.toLowerCase()} found</p>
              <p className="text-xs text-gray-400 mt-1">
                Upload some files to get started
              </p>
            </div>
          ) : (
            <div className={`gap-2 ${
              viewMode === 'grid' 
                ? 'grid grid-cols-1' 
                : 'flex flex-col'
            }`}>
              <AnimatePresence>
                {categoryDocuments.map((document) => (
                  <motion.div
                    key={document.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DocumentCard
                      document={document}
                      isExpanded={expandedDocument === document.id}
                      onClick={() => setExpandedDocument(
                        expandedDocument === document.id ? null : document.id
                      )}
                      onView={handleDocumentView}
                      onEdit={handleDocumentEdit}
                      onDelete={handleDocumentDelete}
                      onDownload={handleDocumentDownload}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        {categoryDocuments.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                {categoryDocuments.length} document{categoryDocuments.length !== 1 ? 's' : ''}
              </span>
              <span>
                Total size: {(
                  categoryDocuments.reduce((sum, doc) => sum + doc.size, 0) / 1024 / 1024
                ).toFixed(1)} MB
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Connection line to original branch */}
      <svg
        className="absolute inset-0 pointer-events-none -z-10"
        width="100"
        height="100"
        style={{
          left: position.x - panelX - 50,
          top: position.y - panelY - 50,
        }}
      >
        <motion.line
          x1="50"
          y1="50"
          x2={panelX > position.x ? "0" : "100"}
          y2="100"
          stroke="#000000"
          strokeWidth="1"
          strokeDasharray="4,4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.3 }}
        />
      </svg>
    </motion.div>
  );
}