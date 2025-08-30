import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export interface ConnectionData {
  id: string;
  from: { nodeId: string; portId: string };
  to: { nodeId: string; portId: string };
  isValid?: boolean;
  isActive?: boolean;
}

interface FlowConnectionProps {
  connection: ConnectionData;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  onConnectionClick?: (connectionId: string) => void;
  onAddNode?: (connectionId: string, position: { x: number; y: number }) => void;
}

export default function FlowConnection({
  connection,
  fromPosition,
  toPosition,
  onConnectionClick,
  onAddNode
}: FlowConnectionProps) {
  const path = useMemo(() => {
    const dx = toPosition.x - fromPosition.x;
    const dy = toPosition.y - fromPosition.y;
    const controlPoint1 = { x: fromPosition.x + dx * 0.5, y: fromPosition.y };
    const controlPoint2 = { x: toPosition.x - dx * 0.5, y: toPosition.y };
    
    return `M ${fromPosition.x} ${fromPosition.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${toPosition.x} ${toPosition.y}`;
  }, [fromPosition, toPosition]);

  const midPoint = useMemo(() => ({
    x: (fromPosition.x + toPosition.x) / 2,
    y: (fromPosition.y + toPosition.y) / 2
  }), [fromPosition, toPosition]);

  const getConnectionStyle = () => {
    const baseStyle = "stroke-2 fill-none";
    const validStyle = connection.isValid !== false ? "stroke-green-500" : "stroke-red-500";
    const activeStyle = connection.isActive ? "stroke-blue-400" : "";
    const hoverStyle = "hover:stroke-opacity-80 transition-colors";
    
    return `${baseStyle} ${validStyle} ${activeStyle} ${hoverStyle}`;
  };

  const handleConnectionClick = () => {
    onConnectionClick?.(connection.id);
  };

  const handleAddNode = () => {
    onAddNode?.(connection.id, midPoint);
  };

  return (
    <g>
      {/* Connection Path */}
      <motion.path
        d={path}
        className={getConnectionStyle()}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        onClick={handleConnectionClick}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Arrow Head */}
      <motion.polygon
        points={`${toPosition.x - 8},${toPosition.y - 4} ${toPosition.x},${toPosition.y} ${toPosition.x - 8},${toPosition.y + 4}`}
        className={getConnectionStyle()}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.2 }}
      />
      
      {/* Midpoint Add Button */}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <circle
          cx={midPoint.x}
          cy={midPoint.y}
          r="12"
          className="fill-zinc-800 stroke-zinc-600 stroke-2"
          onClick={handleAddNode}
          style={{ cursor: 'pointer' }}
        />
        <foreignObject
          x={midPoint.x - 8}
          y={midPoint.y - 8}
          width="16"
          height="16"
          onClick={handleAddNode}
          style={{ cursor: 'pointer' }}
        >
          <Plus className="w-4 h-4 text-white" />
        </foreignObject>
      </motion.g>
      
      {/* Connection Label */}
      {connection.isActive && (
        <motion.text
          x={midPoint.x}
          y={midPoint.y - 20}
          className="text-xs text-white fill-current"
          textAnchor="middle"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          {connection.isValid !== false ? 'Valid' : 'Invalid'}
        </motion.text>
      )}
    </g>
  );
} 