'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, FileText, Image, Music, Video, File } from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { SearchFilter } from './SearchFilter';
import { CategoryBranch } from './CategoryBranch';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  color: string;
}

const defaultCategories: Category[] = [
  {
    id: 'documents',
    name: 'Documents',
    icon: <FileText size={20} />,
    count: 0,
    color: '#000000'
  },
  {
    id: 'images',
    name: 'Images',
    icon: <Image size={20} />,
    count: 0,
    color: '#000000'
  },
  {
    id: 'audio',
    name: 'Audio',
    icon: <Music size={20} />,
    count: 0,
    color: '#000000'
  },
  {
    id: 'video',
    name: 'Video',
    icon: <Video size={20} />,
    count: 0,
    color: '#000000'
  },
  {
    id: 'other',
    name: 'Other',
    icon: <File size={20} />,
    count: 0,
    color: '#000000'
  }
];

export function CircularNav() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [categories] = useState<Category[]>(defaultCategories);

  const radius = 200;
  const centerX = 300;
  const centerY = 300;

  const branchPositions = useMemo(() => {
    return categories.map((_, index) => {
      const angle = (index * (2 * Math.PI)) / categories.length - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return { x, y, angle };
    });
  }, [categories.length]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
    setIsUploadMode(false);
    setIsSearchMode(false);
  };

  const handleUploadClick = () => {
    setIsUploadMode(!isUploadMode);
    setSelectedCategory(null);
    setIsSearchMode(false);
  };

  const handleSearchClick = () => {
    setIsSearchMode(!isSearchMode);
    setSelectedCategory(null);
    setIsUploadMode(false);
  };

  return (
    <div className="relative w-[600px] h-[600px] select-none">
      <svg
        width="600"
        height="600"
        className="absolute inset-0"
        viewBox="0 0 600 600"
      >
        {/* Connection lines from center to branches */}
        {categories.map((_, index) => {
          const pos = branchPositions[index];
          return (
            <motion.line
              key={`line-${index}`}
              x1={centerX}
              y1={centerY}
              x2={pos.x}
              y2={pos.y}
              stroke="#000000"
              strokeWidth="1"
              opacity={selectedCategory === categories[index].id ? 0.8 : 0.3}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
          );
        })}

        {/* Category branches */}
        {categories.map((category, index) => {
          const pos = branchPositions[index];
          const isSelected = selectedCategory === category.id;
          
          return (
            <g key={category.id}>
              {/* Branch circle */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={isSelected ? 35 : 25}
                fill="white"
                stroke="#000000"
                strokeWidth="2"
                className="cursor-pointer"
                onClick={() => handleCategoryClick(category.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              />
              
              {/* Category icon would be positioned here - handled by React component below */}
            </g>
          );
        })}

        {/* Central circle */}
        <motion.circle
          cx={centerX}
          cy={centerY}
          r={60}
          fill="white"
          stroke="#000000"
          strokeWidth="3"
          className="cursor-pointer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      </svg>

      {/* React components positioned over SVG */}
      
      {/* Category icons and labels */}
      {categories.map((category, index) => {
        const pos = branchPositions[index];
        const isSelected = selectedCategory === category.id;
        
        return (
          <motion.div
            key={`icon-${category.id}`}
            className="absolute cursor-pointer"
            style={{
              left: pos.x - 20,
              top: pos.y - 20,
              width: 40,
              height: 40,
            }}
            onClick={() => handleCategoryClick(category.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
          >
            <div className="w-full h-full flex items-center justify-center text-black">
              {category.icon}
            </div>
            
            {/* Category label */}
            <motion.div
              className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-black whitespace-nowrap"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: isSelected ? 1 : 0.7, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {category.name}
              {category.count > 0 && (
                <span className="ml-1 text-gray-600">({category.count})</span>
              )}
            </motion.div>
          </motion.div>
        );
      })}

      {/* Central upload button */}
      <motion.div
        className="absolute cursor-pointer"
        style={{
          left: centerX - 30,
          top: centerY - 30,
          width: 60,
          height: 60,
        }}
        onClick={handleUploadClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="w-full h-full flex items-center justify-center">
          <motion.div
            animate={{ rotate: isUploadMode ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus size={28} className="text-black" />
          </motion.div>
        </div>
      </motion.div>

      {/* Search button - positioned at top */}
      <motion.div
        className="absolute cursor-pointer"
        style={{
          left: centerX - 20,
          top: 50,
          width: 40,
          height: 40,
        }}
        onClick={handleSearchClick}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <div className="w-full h-full flex items-center justify-center bg-white border-2 border-black rounded-full">
          <Search size={20} className="text-black" />
        </div>
      </motion.div>

      {/* Upload component */}
      <AnimatePresence>
        {isUploadMode && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pointer-events-auto">
              <DocumentUpload onClose={() => setIsUploadMode(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search component */}
      <AnimatePresence>
        {isSearchMode && (
          <motion.div
            className="absolute top-20 left-1/2 transform -translate-x-1/2 pointer-events-none"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pointer-events-auto">
              <SearchFilter onClose={() => setIsSearchMode(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category branch expansion */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pointer-events-auto">
              <CategoryBranch
                category={categories.find(c => c.id === selectedCategory)!}
                onClose={() => setSelectedCategory(null)}
                position={branchPositions[categories.findIndex(c => c.id === selectedCategory)]}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}