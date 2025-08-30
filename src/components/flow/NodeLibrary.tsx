import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Settings, Zap, GitBranch, Play, Square, FileText } from 'lucide-react';
import { FlowNodeData, NodePort } from './FlowNode';

interface NodeTemplate {
  type: FlowNodeData['type'];
  title: string;
  description: string;
  icon: React.ReactNode;
  ports: NodePort[];
  parameters?: Record<string, any>;
}

interface NodeLibraryProps {
  onNodeCreate?: (node: Omit<FlowNodeData, 'id' | 'position'>) => void;
}

const nodeTemplates: NodeTemplate[] = [
  {
    type: 'start',
    title: 'Start Node',
    description: 'Beginning of the flow',
    icon: <Play className="w-4 h-4" />,
    ports: [
      { id: 'output', type: 'output', position: 'right', label: 'Start' }
    ]
  },
  {
    type: 'card',
    title: 'Card Node',
    description: 'Display content or information',
    icon: <FileText className="w-4 h-4" />,
    ports: [
      { id: 'input', type: 'input', position: 'left', label: 'Input' },
      { id: 'output', type: 'output', position: 'right', label: 'Output' }
    ]
  },
  {
    type: 'condition',
    title: 'If Condition',
    description: 'Branch based on conditions',
    icon: <GitBranch className="w-4 h-4" />,
    ports: [
      { id: 'input', type: 'input', position: 'left', label: 'Input' },
      { id: 'true', type: 'output', position: 'right', label: 'True' },
      { id: 'false', type: 'output', position: 'bottom', label: 'False' }
    ],
    parameters: { condition: '' }
  },
  {
    type: 'action',
    title: 'Action Node',
    description: 'Perform operations',
    icon: <Zap className="w-4 h-4" />,
    ports: [
      { id: 'input', type: 'input', position: 'left', label: 'Input' },
      { id: 'output', type: 'output', position: 'right', label: 'Output' }
    ],
    parameters: { action: '' }
  },
  {
    type: 'end',
    title: 'End Node',
    description: 'End of the flow',
    icon: <Square className="w-4 h-4" />,
    ports: [
      { id: 'input', type: 'input', position: 'left', label: 'End' }
    ]
  }
];

export default function NodeLibrary({ onNodeCreate }: NodeLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All Nodes', count: nodeTemplates.length },
    { id: 'flow', name: 'Flow Control', count: nodeTemplates.filter(n => ['start', 'end', 'condition'].includes(n.type)).length },
    { id: 'content', name: 'Content', count: nodeTemplates.filter(n => n.type === 'card').length },
    { id: 'actions', name: 'Actions', count: nodeTemplates.filter(n => n.type === 'action').length }
  ];

  const filteredNodes = nodeTemplates.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'flow' && ['start', 'end', 'condition'].includes(node.type)) ||
                           (selectedCategory === 'content' && node.type === 'card') ||
                           (selectedCategory === 'actions' && node.type === 'action');
    
    return matchesSearch && matchesCategory;
  });

  const handleNodeDrag = (nodeTemplate: NodeTemplate) => {
    // This would be handled by the drag-and-drop system
    // For now, we'll just call the create function
    onNodeCreate?.({
      type: nodeTemplate.type,
      title: nodeTemplate.title,
      ports: nodeTemplate.ports,
      parameters: nodeTemplate.parameters
    });
  };

  return (
    <div className="w-64 bg-[#171717] border-r border-zinc-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-700">
        <h3 className="text-white font-medium mb-3">Node Library</h3>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-zinc-700 text-white text-sm rounded-md border border-zinc-600 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 border-b border-zinc-700">
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-700 text-gray-300 hover:bg-zinc-600'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Node List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredNodes.map((nodeTemplate) => (
          <motion.div
            key={nodeTemplate.type}
            className="bg-zinc-700 rounded-lg p-3 cursor-pointer hover:bg-zinc-600 transition-colors"
            onClick={() => handleNodeDrag(nodeTemplate)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-zinc-600 rounded-md">
                {nodeTemplate.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{nodeTemplate.title}</h4>
                <p className="text-gray-400 text-xs">{nodeTemplate.description}</p>
              </div>
            </div>
            
            {/* Ports Preview */}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {nodeTemplate.ports.map((port) => (
                <span key={port.id} className="px-1 py-0.5 bg-zinc-600 rounded">
                  {port.label || port.type}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
        
        {filteredNodes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">No nodes found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-700">
        <button className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          Create Custom Node
        </button>
      </div>
    </div>
  );
} 