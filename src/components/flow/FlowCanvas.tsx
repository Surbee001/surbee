import React, { useState, useRef, useCallback } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut, Grid, RotateCcw, Trash2 } from 'lucide-react';

interface FlowCanvasProps {
  children: React.ReactNode;
  onNodeCreate?: (position: { x: number; y: number }) => void;
  onConnectionCreate?: (from: string, to: string) => void;
}

export default function FlowCanvas({ children, onNodeCreate, onConnectionCreate }: FlowCanvasProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false
  });
  const canvasRef = useRef<HTMLDivElement>(null);

  const handlePan = useCallback((event: any, info: PanInfo) => {
    setPosition(prev => ({
      x: prev.x + info.offset.x,
      y: prev.y + info.offset.y
    }));
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setScale(prev => Math.max(0.1, Math.min(3, prev + delta * 0.1)));
  }, []);

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setContextMenu({
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        visible: true
      });
    }
  }, []);

  const handleAddNode = useCallback((type: string) => {
    if (onNodeCreate) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const x = (contextMenu.x - position.x) / scale;
        const y = (contextMenu.y - position.y) / scale;
        onNodeCreate({ x, y });
      }
    }
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, [contextMenu, position, scale, onNodeCreate]);

  return (
    <div className="relative w-full h-full bg-[#171717] overflow-hidden">
      {/* Canvas Container */}
      <motion.div
        ref={canvasRef}
        className="relative w-full h-full cursor-grab active:cursor-grabbing"
        onContextMenu={handleContextMenu}
        drag
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onPan={handlePan}
        style={{
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: '0 0'
        }}
      >
        {/* Infinite Grid Background */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(64, 64, 64, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(64, 64, 64, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${position.x % (20 * scale)}px ${position.y % (20 * scale)}px`
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => handleZoom(1)}
          className="p-2 bg-zinc-800/80 text-white rounded-md hover:bg-zinc-700/80 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(-1)}
          className="p-2 bg-zinc-800/80 text-white rounded-md hover:bg-zinc-700/80 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => setScale(1)}
          className="p-2 bg-zinc-800/80 text-white rounded-md hover:bg-zinc-700/80 transition-colors"
          title="Reset Zoom"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            // Clear all nodes and connections
            if (onNodeCreate) {
              // This would clear the canvas
              console.log('Clear canvas');
            }
          }}
          className="p-2 bg-zinc-800/80 text-white rounded-md hover:bg-zinc-700/80 transition-colors"
          title="Clear Canvas"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="absolute z-50 bg-zinc-800 border border-zinc-700 rounded-md shadow-lg py-1"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
        >
          <button
            onClick={() => handleAddNode('card')}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700 transition-colors"
          >
            Add Card Node
          </button>
          <button
            onClick={() => handleAddNode('condition')}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700 transition-colors"
          >
            Add If Condition
          </button>
          <button
            onClick={() => handleAddNode('action')}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700 transition-colors"
          >
            Add Action Node
          </button>
          <button
            onClick={() => handleAddNode('start')}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700 transition-colors"
          >
            Add Start Node
          </button>
          <button
            onClick={() => handleAddNode('end')}
            className="w-full px-4 py-2 text-left text-sm text-white hover:bg-zinc-700 transition-colors"
          >
            Add End Node
          </button>
        </div>
      )}

      {/* Click outside to close context menu */}
      {contextMenu.visible && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        />
      )}
    </div>
  );
} 