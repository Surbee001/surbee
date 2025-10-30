'use client';
import Image from 'next/image';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AvatarItem {
  id: number;
  name: string;
  designation: string;
  image: string;
}

interface AvatarGroupProps {
  items: AvatarItem[];
  className?: string;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  showInviteButton?: boolean;
}

// Individual Avatar Component
const Avatar = ({
  item,
  index,
  totalItems,
  size,
  isHovered,
  onHover,
  onLeave,
}: {
  item: AvatarItem;
  index: number;
  totalItems: number;
  size: 'sm' | 'md' | 'lg';
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className="relative group flex items-center justify-center"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        marginLeft: index === 0 ? 0 : '-0.5rem',
        zIndex: totalItems - index,
      }}
    >
      <AnimatePresence mode="popLayout">
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 200,
                damping: 20,
              },
            }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute top-full mt-1 whitespace-nowrap text-xs text-center text-gray-700 bg-white rounded-md px-2 py-1 z-50 shadow-lg border border-gray-200"
          >
            {item.name}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05, zIndex: 100 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative"
      >
        <Image
          height={100}
          width={100}
          src={item.image}
          alt={item.name}
          className={cn(
            'object-cover !rounded-full border-2 border-background transition duration-300',
            sizeClasses[size],
          )}
        />
      </motion.div>
    </div>
  );
};

const AvatarGroup = ({
  items,
  className,
  maxVisible = 5,
  size = 'md',
  showInviteButton = false,
}: AvatarGroupProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  return (
    <div className={cn('flex items-center justify-center', className)}>
      {visibleItems.map((item, index) => (
        <Avatar
          key={item.id}
          item={item}
          index={index}
          totalItems={visibleItems.length}
          size={size}
          isHovered={hoveredIndex === item.id}
          onHover={() => setHoveredIndex(item.id)}
          onLeave={() => setHoveredIndex(null)}
        />
      ))}

      {remainingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            'flex items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground font-medium',
            size === 'sm'
              ? 'h-8 w-8'
              : size === 'md'
                ? 'h-10 w-10'
                : 'h-12 w-12',
            'ml-[-0.5rem]',
          )}
        >
          +{remainingCount}
        </motion.div>
      )}

      {showInviteButton && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
          style={{
            marginLeft: '-0.5rem',
            zIndex: 1,
          }}
        >
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-3 py-1 h-8 w-8 text-xs font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center"
          >
            +
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default AvatarGroup;
