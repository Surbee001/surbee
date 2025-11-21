'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { DraggableAnalysisDot } from './DraggableAnalysisDot';
import { AnalysisDot } from '@/types/database';
import { Plus, Sparkles, X, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AnalysisDotsManagerProps {
  projectId: string;
  children: React.ReactNode;
}

export function AnalysisDotsManager({ projectId, children }: AnalysisDotsManagerProps) {
  const { user } = useAuth();
  const [dots, setDots] = useState<AnalysisDot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [addMenuPosition, setAddMenuPosition] = useState({ x: 0, y: 0 });
  const [isLongPress, setIsLongPress] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const defaultDotRef = useRef<HTMLDivElement>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    })
  );

  useEffect(() => {
    if (user) {
      fetchDots();
      checkOnboarding();
    }
  }, [projectId, user]);

  const fetchDots = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/projects/${projectId}/analysis-dots?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setDots(data.dots || []);
      }
    } catch (error) {
      console.error('Error fetching dots:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkOnboarding = () => {
    const seen = localStorage.getItem(`analysis-dots-onboarding-${projectId}`);
    if (!seen) {
      setShowOnboarding(true);
    }
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(`analysis-dots-onboarding-${projectId}`, 'true');
  };

  const handleDefaultDotRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (defaultDotRef.current) {
      const rect = defaultDotRef.current.getBoundingClientRect();
      setAddMenuPosition({
        x: rect.right + 10,
        y: rect.top,
      });
      setShowAddMenu(true);
    }
  };

  const handleDefaultDotMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      if (defaultDotRef.current) {
        const rect = defaultDotRef.current.getBoundingClientRect();
        setAddMenuPosition({
          x: rect.right + 10,
          y: rect.top,
        });
        setShowAddMenu(true);
      }
    }, 500); // 500ms long press
  };

  const handleDefaultDotMouseUp = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    setIsLongPress(false);
  };

  const handleAddDotAtPosition = async (x: number, y: number) => {
    if (!user || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const percentX = ((x - container.left) / container.width) * 100;
    const percentY = ((y - container.top) / container.height) * 100;

    try {
      const response = await fetch(`/api/projects/${projectId}/analysis-dots`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          position_x: Math.max(0, Math.min(100, percentX)),
          position_y: Math.max(0, Math.min(100, percentY)),
          label: `Analysis ${dots.length + 1}`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDots([...dots, data.dot]);
      }
    } catch (error) {
      console.error('Error adding dot:', error);
    }
    setShowAddMenu(false);
  };

  const handlePositionUpdate = async (dotId: string, x: number, y: number) => {
    if (!user) return;
    try {
      await fetch(`/api/projects/${projectId}/analysis-dots`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          dotId,
          position_x: x,
          position_y: y,
        }),
      });

      setDots(
        dots.map((dot) =>
          dot.id === dotId ? { ...dot, position_x: x, position_y: y } : dot
        )
      );
    } catch (error) {
      console.error('Error updating dot position:', error);
    }
  };

  const handleDeleteDot = async (dotId: string) => {
    if (!user) return;
    try {
      await fetch(`/api/projects/${projectId}/analysis-dots?dotId=${dotId}&userId=${user.id}`, {
        method: 'DELETE',
      });

      setDots(dots.filter((dot) => dot.id !== dotId));
    } catch (error) {
      console.error('Error deleting dot:', error);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    // Handled by DraggableAnalysisDot component
  };

  // Click anywhere on the page to add a dot when in add mode
  const handleContainerClick = (e: React.MouseEvent) => {
    if (showAddMenu && e.target === containerRef.current) {
      handleAddDotAtPosition(e.clientX, e.clientY);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      onClick={handleContainerClick}
    >
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>

        {/* Render children (the actual page content) */}
        {children}

        {/* Render draggable dots */}
        {!isLoading &&
          dots.map((dot) => (
            <DraggableAnalysisDot
              key={dot.id}
              dot={dot}
              projectId={projectId}
              onPositionUpdate={handlePositionUpdate}
              onDelete={handleDeleteDot}
              containerRef={containerRef}
            />
          ))}
      </DndContext>

      {/* CSS for pulsing animation */}
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes pulse-ring-delayed {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          50% {
            transform: scale(2.5);
            opacity: 0.3;
          }
          100% {
            transform: scale(3);
            opacity: 0;
          }
        }

        @keyframes glow {
          0%, 100% {
            opacity: 0.5;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }

        @keyframes spin-slow {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes slide-down {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }

        .animate-pulse-ring {
          animation: pulse-ring 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-pulse-ring-delayed {
          animation: pulse-ring-delayed 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 0.5s;
        }

        .animate-glow {
          animation: glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 4s linear infinite;
        }

        .animate-slide-down {
          animation: slide-down 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}
