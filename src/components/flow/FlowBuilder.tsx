import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import FlowCanvas from './FlowCanvas';
import FlowNode, { FlowNodeData, NodePort } from './FlowNode';
import FlowConnection, { ConnectionData } from './FlowConnection';
import NodeLibrary from './NodeLibrary';

interface FlowBuilderProps {
  onSave?: (data: { nodes: FlowNodeData[]; connections: ConnectionData[] }) => void;
}

export default function FlowBuilder({ onSave }: FlowBuilderProps) {
  const [nodes, setNodes] = useState<FlowNodeData[]>([]);
  const [connections, setConnections] = useState<ConnectionData[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; portId: string } | null>(null);

  const generateNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateConnectionId = () => `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleNodeCreate = useCallback((nodeData: Omit<FlowNodeData, 'id' | 'position'>) => {
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
    setSelectedConnectionId(null);
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

  const handleConnectionClick = useCallback((connectionId: string) => {
    setSelectedConnectionId(connectionId);
    setSelectedNodeId(null);
  }, []);

  const handleAddNodeOnConnection = useCallback((connectionId: string, position: { x: number; y: number }) => {
    // This would open the node library or create a node at the midpoint
    console.log('Add node on connection:', connectionId, position);
  }, []);

  const getNodePosition = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.position || { x: 0, y: 0 };
  }, [nodes]);

  const getPortPosition = useCallback((nodeId: string, portId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const port = node.ports.find(p => p.id === portId);
    if (!port) return { x: 0, y: 0 };

    const nodePos = node.position;
    const nodeWidth = 200; // Approximate node width
    const nodeHeight = 100; // Approximate node height

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

  const handleSave = useCallback(() => {
    onSave?.({ nodes, connections });
  }, [nodes, connections, onSave]);

  return (
    <div className="flex h-full bg-[#171717]">
      {/* Node Library Sidebar */}
      <NodeLibrary onNodeCreate={handleNodeCreate} />

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <FlowCanvas onNodeCreate={handleNodeCreate}>
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
            {connections.map((connection) => {
              const fromPos = getPortPosition(connection.from.nodeId, connection.from.portId);
              const toPos = getPortPosition(connection.to.nodeId, connection.to.portId);
              
              return (
                <FlowConnection
                  key={connection.id}
                  connection={connection}
                  fromPosition={fromPos}
                  toPosition={toPos}
                  onConnectionClick={handleConnectionClick}
                  onAddNode={handleAddNodeOnConnection}
                />
              );
            })}
          </svg>

          {/* Render Nodes */}
          <AnimatePresence>
            {nodes.map((node) => (
              <FlowNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onNodeSelect={handleNodeSelect}
                onNodeUpdate={handleNodeUpdate}
                onNodeDelete={handleNodeDelete}
                onPortConnect={handlePortConnect}
              />
            ))}
          </AnimatePresence>
        </FlowCanvas>

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