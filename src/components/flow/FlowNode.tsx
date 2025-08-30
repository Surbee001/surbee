import React, { useState, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { X, Plus, Settings, ChevronDown, ChevronUp } from 'lucide-react';

export interface NodePort {
  id: string;
  type: 'input' | 'output';
  position: 'left' | 'right' | 'top' | 'bottom';
  label?: string;
  connected?: boolean;
}

export interface FlowNodeData {
  id: string;
  type: 'card' | 'condition' | 'action' | 'start' | 'end';
  title: string;
  content?: string;
  position: { x: number; y: number };
  ports: NodePort[];
  parameters?: Record<string, any>;
}

interface FlowNodeProps {
  node: FlowNodeData;
  isSelected?: boolean;
  onNodeSelect?: (nodeId: string) => void;
  onNodeUpdate?: (nodeId: string, data: Partial<FlowNodeData>) => void;
  onNodeDelete?: (nodeId: string) => void;
  onPortConnect?: (nodeId: string, portId: string) => void;
  onPortDisconnect?: (nodeId: string, portId: string) => void;
}

export default function FlowNode({
  node,
  isSelected = false,
  onNodeSelect,
  onNodeUpdate,
  onNodeDelete,
  onPortConnect,
  onPortDisconnect
}: FlowNodeProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(node.title);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleNodeClick = () => {
    onNodeSelect?.(node.id);
  };

  const handleTitleEdit = () => {
    if (isEditing) {
      onNodeUpdate?.(node.id, { title: editTitle });
    }
    setIsEditing(!isEditing);
  };

  const handleDelete = () => {
    onNodeDelete?.(node.id);
  };

  const getNodeStyle = () => {
    const baseStyle = "bg-zinc-800 border-2 rounded-lg shadow-lg min-w-[200px]";
    const selectedStyle = isSelected ? "border-blue-500" : "border-zinc-700";
    const typeStyle = {
      card: "bg-zinc-800",
      condition: "bg-orange-800/20 border-orange-500/50",
      action: "bg-blue-800/20 border-blue-500/50",
      start: "bg-green-800/20 border-green-500/50",
      end: "bg-red-800/20 border-red-500/50"
    };
    
    return `${baseStyle} ${selectedStyle} ${typeStyle[node.type]}`;
  };

  const renderPorts = () => {
    return node.ports.map((port) => (
      <div
        key={port.id}
        className={`absolute w-3 h-3 rounded-full border-2 ${
          port.connected 
            ? 'bg-green-500 border-green-400' 
            : 'bg-zinc-600 border-zinc-500'
        } cursor-pointer hover:scale-125 transition-transform`}
        style={{
          [port.position]: '-6px',
          top: port.position === 'left' || port.position === 'right' ? '50%' : undefined,
          left: port.position === 'top' || port.position === 'bottom' ? '50%' : undefined,
          transform: port.position === 'left' || port.position === 'right' 
            ? 'translateY(-50%)' 
            : 'translateX(-50%)'
        }}
        onClick={() => onPortConnect?.(node.id, port.id)}
        title={port.label || `${port.type} port`}
      />
    ));
  };

  const renderNodeContent = () => {
    switch (node.type) {
      case 'card':
        return (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleEdit}
                onKeyPress={(e) => e.key === 'Enter' && handleTitleEdit()}
                className="bg-transparent text-white font-medium text-sm focus:outline-none"
                disabled={!isEditing}
              />
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <Settings className="w-3 h-3" />
              </button>
            </div>
            <textarea
              value={node.content || ''}
              onChange={(e) => onNodeUpdate?.(node.id, { content: e.target.value })}
              placeholder="Enter card content..."
              className="w-full bg-transparent text-gray-300 text-sm resize-none focus:outline-none"
              rows={3}
            />
          </div>
        );

      case 'condition':
        return (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleEdit}
                onKeyPress={(e) => e.key === 'Enter' && handleTitleEdit()}
                className="bg-transparent text-white font-medium text-sm focus:outline-none"
                disabled={!isEditing}
              />
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            {isExpanded && (
              <div className="space-y-2">
                <input
                  value={node.parameters?.condition || ''}
                  onChange={(e) => onNodeUpdate?.(node.id, { 
                    parameters: { ...node.parameters, condition: e.target.value }
                  })}
                  placeholder="Enter condition..."
                  className="w-full bg-zinc-700/50 text-white text-sm px-2 py-1 rounded border border-zinc-600 focus:outline-none focus:border-zinc-500"
                />
                <div className="flex gap-2 text-xs text-gray-400">
                  <span>True →</span>
                  <span>False →</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'action':
        return (
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={handleTitleEdit}
                onKeyPress={(e) => e.key === 'Enter' && handleTitleEdit()}
                className="bg-transparent text-white font-medium text-sm focus:outline-none"
                disabled={!isEditing}
              />
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            {isExpanded && (
              <select
                value={node.parameters?.action || ''}
                onChange={(e) => onNodeUpdate?.(node.id, { 
                  parameters: { ...node.parameters, action: e.target.value }
                })}
                className="w-full bg-zinc-700/50 text-white text-sm px-2 py-1 rounded border border-zinc-600 focus:outline-none focus:border-zinc-500"
              >
                <option value="">Select action...</option>
                <option value="send_email">Send Email</option>
                <option value="save_data">Save Data</option>
                <option value="redirect">Redirect</option>
                <option value="custom">Custom Action</option>
              </select>
            )}
          </div>
        );

      case 'start':
      case 'end':
        return (
          <div className="p-3 text-center">
            <div className="text-white font-medium text-sm mb-1">
              {node.type === 'start' ? 'Start' : 'End'}
            </div>
            <div className="text-gray-400 text-xs">
              {node.type === 'start' ? 'Flow begins here' : 'Flow ends here'}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      ref={nodeRef}
      className={`absolute ${getNodeStyle()}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        zIndex: isSelected ? 10 : 1
      }}
      onClick={handleNodeClick}
      drag
      dragMomentum={false}
      whileDrag={{ scale: 1.05, zIndex: 20 }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between p-2 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            node.type === 'card' ? 'bg-gray-400' :
            node.type === 'condition' ? 'bg-orange-400' :
            node.type === 'action' ? 'bg-blue-400' :
            node.type === 'start' ? 'bg-green-400' :
            'bg-red-400'
          }`} />
          <span className="text-xs text-gray-400 uppercase">{node.type}</span>
        </div>
        <button
          onClick={handleDelete}
          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Node Content */}
      {renderNodeContent()}

      {/* Ports */}
      {renderPorts()}
    </motion.div>
  );
} 