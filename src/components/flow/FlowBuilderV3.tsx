import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import NodeLibrary from './NodeLibrary';

interface FlowNodeData {
  id: string;
  type: 'card' | 'condition' | 'action' | 'start' | 'end';
  title: string;
  content?: string;
  position: { x: number; y: number };
  ports: Array<{
    id: string;
    type: 'input' | 'output';
    position: 'left' | 'right' | 'top' | 'bottom';
    label?: string;
    connected?: boolean;
  }>;
  parameters?: Record<string, any>;
}

interface ConnectionData {
  id: string;
  from: { nodeId: string; portId: string };
  to: { nodeId: string; portId: string };
  isValid?: boolean;
  isActive?: boolean;
}

interface FlowBuilderV3Props {
  onSave?: (data: any) => void;
}

export default function FlowBuilderV3({ onSave }: FlowBuilderV3Props) {
  const [nodes, setNodes] = useState<FlowNodeData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; portId: string } | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const generateNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateConnectionId = () => `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleNodeCreate = useCallback((nodeData: any) => {
    const newNode: FlowNodeData = {
      ...nodeData,
      id: generateNodeId(),
      position: { x: 100, y: 100 }
    };
    setNodes(prev => [...prev, newNode]);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, data: Partial<FlowNodeData>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...data } : node
    ));
  }, []);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setConnections(prev => prev.filter(conn => 
      conn.from.nodeId !== nodeId && conn.to.nodeId !== nodeId
    ));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handlePortConnect = useCallback((nodeId: string, portId: string) => {
    if (!isConnecting) {
      // Start connection
      setIsConnecting(true);
      setConnectingFrom({ nodeId, portId });
    } else {
      // Complete connection
      if (connectingFrom && connectingFrom.nodeId !== nodeId) {
        const newConnection: ConnectionData = {
          id: generateConnectionId(),
          from: connectingFrom,
          to: { nodeId, portId },
          isValid: true
        };
        setConnections(prev => [...prev, newConnection]);
      }
      setIsConnecting(false);
      setConnectingFrom(null);
    }
  }, [isConnecting, connectingFrom]);

  const handlePortMouseDown = useCallback((nodeId: string, portId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsConnecting(true);
    setConnectingFrom({ nodeId, portId });
  }, []);

  const handlePortMouseUp = useCallback((nodeId: string, portId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting && connectingFrom && connectingFrom.nodeId !== nodeId) {
      const newConnection: ConnectionData = {
        id: generateConnectionId(),
        from: connectingFrom,
        to: { nodeId, portId },
        isValid: true
      };
      setConnections(prev => [...prev, newConnection]);
    }
    setIsConnecting(false);
    setConnectingFrom(null);
  }, [isConnecting, connectingFrom]);

  const handleClearCanvas = useCallback(() => {
    setNodes([]);
    setConnections([]);
    setSelectedNodeId(null);
    setIsConnecting(false);
    setConnectingFrom(null);
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setScale(prev => Math.max(0.1, Math.min(3, prev + delta * 0.1)));
  }, []);

  const getPortPosition = useCallback((nodeId: string, portId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const port = node.ports.find(p => p.id === portId);
    if (!port) return { x: 0, y: 0 };

    const nodePos = node.position;
    const nodeWidth = 200;
    const nodeHeight = 100;

    switch (port.position) {
      case 'left':
        return { x: nodePos.x, y: nodePos.y + nodeHeight / 2 };
      case 'right':
        return { x: nodePos.x + nodeWidth, y: nodePos.y + nodeHeight / 2 };
      case 'top':
        return { x: nodePos.x + nodeWidth / 2, y: nodePos.y };
      case 'bottom':
        return { x: nodePos.x + nodeWidth / 2, y: nodePos.y + nodeHeight };
      default:
        return { x: nodePos.x, y: nodePos.y };
    }
  }, [nodes]);

  const renderNode = (node: FlowNodeData) => {
    const getNodeStyle = () => {
      const baseStyle = "bg-zinc-800 border-2 rounded-lg shadow-lg min-w-[200px]";
      const selectedStyle = selectedNodeId === node.id ? "border-blue-500" : "border-zinc-700";
      const typeStyle = {
        card: "bg-zinc-800",
        condition: "bg-orange-800/20 border-orange-500/50",
        action: "bg-blue-800/20 border-blue-500/50",
        start: "bg-green-800/20 border-green-500/50",
        end: "bg-red-800/20 border-red-500/50"
      };
      
      return `${baseStyle} ${selectedStyle} ${typeStyle[node.type]}`;
    };

    return (
      <motion.div
        key={node.id}
        className={`absolute ${getNodeStyle()}`}
        style={{
          left: node.position.x,
          top: node.position.y,
          zIndex: selectedNodeId === node.id ? 10 : 1
        }}
        onClick={() => handleNodeSelect(node.id)}
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
            onClick={(e) => {
              e.stopPropagation();
              handleNodeDelete(node.id);
            }}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Node Content */}
        <div className="p-3">
          <div className="text-white font-medium text-sm mb-2">{node.title}</div>
          {node.content && (
            <div className="text-gray-300 text-xs">{node.content}</div>
          )}
        </div>

                 {/* Ports */}
         {node.ports.map((port) => (
           <div
             key={port.id}
             className={`absolute w-3 h-3 rounded-full border-2 ${
               port.connected 
                 ? 'bg-green-500 border-green-400' 
                 : 'bg-zinc-600 border-zinc-500'
             } cursor-crosshair hover:scale-125 transition-transform`}
             style={{
               [port.position]: '-6px',
               top: port.position === 'left' || port.position === 'right' ? '50%' : undefined,
               left: port.position === 'top' || port.position === 'bottom' ? '50%' : undefined,
               transform: port.position === 'left' || port.position === 'right' 
                 ? 'translateY(-50%)' 
                 : 'translateX(-50%)'
             }}
             onMouseDown={(e) => handlePortMouseDown(node.id, port.id, e)}
             onMouseUp={(e) => handlePortMouseUp(node.id, port.id, e)}
             title={port.label || `${port.type} port`}
           />
         ))}
      </motion.div>
    );
  };

  const renderConnection = (connection: ConnectionData) => {
    const fromPos = getPortPosition(connection.from.nodeId, connection.from.portId);
    const toPos = getPortPosition(connection.to.nodeId, connection.to.portId);
    
    const path = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x + 50} ${fromPos.y}, ${toPos.x - 50} ${toPos.y}, ${toPos.x} ${toPos.y}`;
    
    return (
      <g key={connection.id}>
        <motion.path
          d={path}
          className={`stroke-2 fill-none ${
            connection.isValid !== false ? "stroke-green-500" : "stroke-red-500"
          } ${connection.isActive ? "stroke-blue-400" : ""} hover:stroke-opacity-80 transition-colors`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ cursor: 'pointer' }}
        />
        <motion.polygon
          points={`${toPos.x - 8},${toPos.y - 4} ${toPos.x},${toPos.y} ${toPos.x - 8},${toPos.y + 4}`}
          className={`stroke-2 fill-none ${
            connection.isValid !== false ? "stroke-green-500" : "stroke-red-500"
          } ${connection.isActive ? "stroke-blue-400" : ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.2 }}
        />
      </g>
    );
  };

  return (
    <div className="flex h-full bg-[#171717]">
      {/* Node Library Sidebar */}
      <NodeLibrary onNodeCreate={handleNodeCreate} />

      {/* Main Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <motion.div
          ref={canvasRef}
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          drag
          dragMomentum={false}
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
               backgroundPosition: `${position.x % (20 * scale)}px ${position.y % (20 * scale)}px`,
               width: '100vw',
               height: '100vh',
               left: '-50vw',
               top: '-50vh'
             }}
           />

          {/* SVG for Connections */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
              </marker>
            </defs>
            
            {/* Render Connections */}
            {connections.map(renderConnection)}
          </svg>

          {/* Render Nodes */}
          <AnimatePresence>
            {nodes.map(renderNode)}
          </AnimatePresence>
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
            onClick={handleClearCanvas}
            className="p-2 bg-zinc-800/80 text-white rounded-md hover:bg-zinc-700/80 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="absolute bottom-4 left-4 text-xs text-gray-400">
          {nodes.length} nodes, {connections.length} connections
          {isConnecting && connectingFrom && (
            <span className="ml-2 text-blue-400">Connecting...</span>
          )}
        </div>
      </div>
    </div>
  );
} 