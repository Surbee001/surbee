'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { AnalysisDot } from '@/types/database';
import { useComponentRegistry } from '@/contexts/ComponentRegistry';
import { AnalysisPopup } from './AnalysisPopup';
import { X } from 'lucide-react';

interface DraggableAnalysisDotProps {
  dot: AnalysisDot;
  projectId: string;
  onPositionUpdate: (dotId: string, x: number, y: number) => void;
  onDelete: (dotId: string) => void;
  containerRef: React.RefObject<HTMLElement>;
}

export function DraggableAnalysisDot({
  dot,
  projectId,
  onPositionUpdate,
  onDelete,
  containerRef,
}: DraggableAnalysisDotProps) {
  const [showPopup, setShowPopup] = useState(false);
  const [hoveredComponent, setHoveredComponent] = useState<any>(null);
  const [wasDragged, setWasDragged] = useState(false);
  const { getComponentAt } = useComponentRegistry();
  const dotRef = useRef<HTMLDivElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: dot.id,
  });

  // Track when dragging starts
  useEffect(() => {
    if (isDragging) {
      setWasDragged(true);
    }
  }, [isDragging]);

  // Calculate absolute position from percentage
  const style = {
    position: 'absolute' as const,
    left: `${dot.position_x}%`,
    top: `${dot.position_y}%`,
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? 'grabbing' : 'grab',
    zIndex: isDragging ? 1000 : 100,
  };

  // Check what component is under the dot when it stops dragging
  useEffect(() => {
    if (!isDragging && dotRef.current && containerRef.current) {
      const dotRect = dotRef.current.getBoundingClientRect();
      const centerX = dotRect.left + dotRect.width / 2;
      const centerY = dotRect.top + dotRect.height / 2;

      const component = getComponentAt(centerX, centerY);
      setHoveredComponent(component);
    }
  }, [isDragging, getComponentAt, containerRef]);

  // Update position on drag end
  useEffect(() => {
    if (!isDragging && transform && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const newX = ((dot.position_x / 100) * container.width + (transform.x || 0)) / container.width * 100;
      const newY = ((dot.position_y / 100) * container.height + (transform.y || 0)) / container.height * 100;

      // Clamp to 0-100%
      const clampedX = Math.max(0, Math.min(100, newX));
      const clampedY = Math.max(0, Math.min(100, newY));

      if (Math.abs(clampedX - dot.position_x) > 0.1 || Math.abs(clampedY - dot.position_y) > 0.1) {
        onPositionUpdate(dot.id, clampedX, clampedY);
      }

      // Reset drag flag after a short delay
      setTimeout(() => {
        setWasDragged(false);
      }, 100);
    }
  }, [isDragging]);

  const handleClick = (e: React.MouseEvent) => {
    // Only show popup if it wasn't a drag operation
    if (!wasDragged && !isDragging) {
      setShowPopup(true);
    }
  };

  return (
    <>
      <div
        ref={(node) => {
          setNodeRef(node);
          (dotRef as any).current = node;
        }}
        style={style}
        className="relative group"
      >
        {/* The pulsing dot */}
        <div
          onClick={handleClick}
          className="relative"
          {...listeners}
          {...attributes}
        >
          <div className="w-3 h-3 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform">
            {/* Pulsing animation rings */}
            <div className="absolute inset-0 rounded-full bg-white animate-pulse-ring" />
            <div className="absolute inset-0 rounded-full bg-white animate-pulse-ring-delayed" />
          </div>

          {/* Delete button - shows on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(dot.id);
            }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer group-hover:opacity-100"
            style={{ zIndex: 101 }}
          >
            <X className="w-2 h-2 text-white" />
          </button>

          {/* Label on hover */}
          {dot.label && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              {dot.label}
            </div>
          )}

          {/* Component indicator */}
          {hoveredComponent && !isDragging && (
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-blue-500/80 text-white text-xs rounded whitespace-nowrap">
              {hoveredComponent.label}
            </div>
          )}
        </div>
      </div>

      {/* Analysis popup */}
      {showPopup && (
        <AnalysisPopup
          dotId={dot.id}
          projectId={projectId}
          component={hoveredComponent}
          onClose={() => setShowPopup(false)}
          position={{ x: dot.position_x, y: dot.position_y }}
        />
      )}

      {/* CSS for pulsing animation */}
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }

        @keyframes pulse-ring-delayed {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(2);
            opacity: 0.3;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }

        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-ring-delayed {
          animation: pulse-ring-delayed 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </>
  );
}
