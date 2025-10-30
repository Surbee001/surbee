'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, Hash, FileText, Image, Music, Video, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDocuments } from './DocumentManager';

interface SearchFilterProps {
  onClose: () => void;
}

const categoryIcons = {
  documents: <FileText size={14} />,
  images: <Image size={14} />,
  audio: <Music size={14} />,
  video: <Video size={14} />,
  other: <File size={14} />,
};

export function SearchFilter({ onClose }: SearchFilterProps) {
  const { state, actions } = useDocuments();
  const [localQuery, setLocalQuery] = useState(state.searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const categoryStats = actions.getCategoryStats();
  const allTags = Array.from(
    new Set(state.documents.flatMap(doc => doc.tags))
  ).slice(0, 10); // Show top 10 tags

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      actions.setSearchQuery(localQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [localQuery, actions]);

  const handleCategoryFilter = (category: string) => {
    const newCategory = state.selectedCategory === category ? null : category;
    actions.setSelectedCategory(newCategory);
  };

  const handleTagClick = (tag: string) => {
    const newQuery = localQuery.includes(tag) 
      ? localQuery.replace(tag, '').trim() 
      : `${localQuery} ${tag}`.trim();
    setLocalQuery(newQuery);
  };

  const clearFilters = () => {
    setLocalQuery('');
    actions.setSearchQuery('');
    actions.setSelectedCategory(null);
  };

  const hasActiveFilters = state.searchQuery || state.selectedCategory;

  return (
    <motion.div
      className="bg-white border-2 border-black rounded-lg p-4 w-80 shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search size={18} className="text-black" />
          <h3 className="font-semibold text-black">Search & Filter</h3>
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

      {/* Search input */}
      <div className="relative mb-4">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search documents, tags, or content..."
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
        {localQuery && (
          <button
            onClick={() => setLocalQuery('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Results count */}
      <div className="text-xs text-gray-600 mb-4">
        {state.filteredDocuments.length} of {state.documents.length} documents
      </div>

      {/* Filters toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowFilters(!showFilters)}
        className="w-full mb-4 justify-between"
      >
        <span className="flex items-center gap-2">
          <Filter size={14} />
          Filters
        </span>
        <motion.div
          animate={{ rotate: showFilters ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <X size={14} />
        </motion.div>
      </Button>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Category filters */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-black mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryStats).map(([category, count]) => (
                  <motion.button
                    key={category}
                    onClick={() => handleCategoryFilter(category)}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                      state.selectedCategory === category
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:border-black'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {categoryIcons[category as keyof typeof categoryIcons]}
                    <span className="capitalize">{category}</span>
                    <span>({count})</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tag filters */}
            {allTags.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-black mb-2">Popular Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {allTags.map((tag) => (
                    <motion.button
                      key={tag}
                      onClick={() => handleTagClick(tag)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                        localQuery.includes(tag)
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Hash size={8} />
                      {tag}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear filters */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full"
            >
              Clear All Filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filters display */}
      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            className="mt-3 pt-3 border-t border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <h4 className="text-xs font-medium text-gray-600 mb-2">Active Filters:</h4>
            <div className="flex flex-wrap gap-1">
              {state.searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded-full">
                  <Search size={8} />
                  "{state.searchQuery}"
                </span>
              )}
              {state.selectedCategory && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-black text-white text-xs rounded-full">
                  {categoryIcons[state.selectedCategory as keyof typeof categoryIcons]}
                  {state.selectedCategory}
                </span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}