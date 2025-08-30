'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ScrollAreaProps {
  children: React.ReactNode;
  className?: string;
  type?: 'auto' | 'always' | 'scroll' | 'hover';
}

export function ScrollArea({
  children,
  className,
  type = 'hover',
  ...props
}: ScrollAreaProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full w-full overflow-auto',
          type === 'hover' && 'scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent',
          type === 'always' && 'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100',
          type === 'auto' && 'overflow-auto',
          type === 'scroll' && 'overflow-scroll'
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(156 163 175) transparent',
        }}
      >
        {children}
      </div>
    </div>
  );
}
