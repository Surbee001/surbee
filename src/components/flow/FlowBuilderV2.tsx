import React, { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  DiagramEngine,
  DiagramModel,
  DefaultNodeModel,
  DefaultPortModel,
  DefaultLinkModel,
  DefaultNodeFactory,
  DefaultLinkFactory,
  DiagramWidget,
  PointModel,
  PortModel,
  NodeModel,
  LinkModel
} from '@projectstorm/react-diagrams';
import { Trash2 } from 'lucide-react';
import NodeLibrary from './NodeLibrary';

interface FlowBuilderV2Props {
  onSave?: (data: any) => void;
}

// Custom Node Model
class CustomNodeModel extends DefaultNodeModel {
  constructor(options: any) {
    super({
      ...options,
      type: 'custom-node'
    });
  }
}

// Custom Node Widget
class CustomNodeWidget extends React.Component<any> {
  render() {
    const { node } = this.props;
    const { title, type, content } = node.options;

    const getNodeStyle = () => {
      const baseStyle = "bg-zinc-800 border-2 rounded-lg shadow-lg min-w-[200px]";
      const typeStyle = {
        card: "bg-zinc-800",
        condition: "bg-orange-800/20 border-orange-500/50",
        action: "bg-blue-800/20 border-blue-500/50",
        start: "bg-green-800/20 border-green-500/50",
        end: "bg-red-800/20 border-red-500/50"
      };
      
      return `${baseStyle} ${typeStyle[type] || 'bg-zinc-800'}`;
    };

    return (
      <div className={`absolute ${getNodeStyle()}`}>
        {/* Node Header */}
        <div className="flex items-center justify-between p-2 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              type === 'card' ? 'bg-gray-400' :
              type === 'condition' ? 'bg-orange-400' :
              type === 'action' ? 'bg-blue-400' :
              type === 'start' ? 'bg-green-400' :
              'bg-red-400'
            }`} />
            <span className="text-xs text-gray-400 uppercase">{type}</span>
          </div>
        </div>

        {/* Node Content */}
        <div className="p-3">
          <div className="text-white font-medium text-sm mb-2">{title}</div>
          {content && (
            <div className="text-gray-300 text-xs">{content}</div>
          )}
        </div>

        {/* Ports */}
        {node.getPorts().map((port: any) => (
          <div
            key={port.id}
            className={`absolute w-3 h-3 rounded-full border-2 bg-zinc-600 border-zinc-500 cursor-pointer hover:scale-125 transition-transform`}
            style={{
              [port.options.position]: '-6px',
              top: port.options.position === 'left' || port.options.position === 'right' ? '50%' : undefined,
              left: port.options.position === 'top' || port.options.position === 'bottom' ? '50%' : undefined,
              transform: port.options.position === 'left' || port.options.position === 'right' 
                ? 'translateY(-50%)' 
                : 'translateX(-50%)'
            }}
            title={port.options.label || `${port.options.type} port`}
          />
        ))}
      </div>
    );
  }
}

// Custom Node Factory
class CustomNodeFactory extends DefaultNodeFactory {
  constructor() {
    super('custom-node');
  }

  generateReactWidget(diagramEngine: DiagramEngine, node: NodeModel): JSX.Element {
    return <CustomNodeWidget node={node} />;
  }

  generateModel(event: any): NodeModel {
    return new CustomNodeModel(event);
  }
}

export default function FlowBuilderV2({ onSave }: FlowBuilderV2Props) {
  const [engine] = useState(() => {
    const engine = new DiagramEngine();
    engine.registerNodeFactory(new CustomNodeFactory());
    engine.registerLinkFactory(new DefaultLinkFactory());
    return engine;
  });

  const [model] = useState(() => {
    const model = new DiagramModel();
    engine.setModel(model);
    return model;
  });

  const handleNodeCreate = useCallback((nodeData: any) => {
    const node = new CustomNodeModel({
      title: nodeData.title,
      type: nodeData.type,
      content: nodeData.content,
      position: { x: 100, y: 100 }
    });

    // Add ports based on node type
    if (nodeData.ports) {
      nodeData.ports.forEach((port: any) => {
        const portModel = new DefaultPortModel({
          in: port.type === 'input',
          name: port.id,
          label: port.label,
          position: port.position
        });
        node.addPort(portModel);
      });
    }

    model.addNode(node);
    engine.repaintCanvas();
  }, [engine, model]);

  const handleClearCanvas = useCallback(() => {
    model.clear();
    engine.repaintCanvas();
  }, [model, engine]);

  return (
    <div className="flex h-full bg-[#171717]">
      {/* Node Library Sidebar */}
      <NodeLibrary onNodeCreate={handleNodeCreate} />

      {/* Main Canvas Area */}
      <div className="flex-1 relative">
        <DiagramWidget
          engine={engine}
          className="w-full h-full"
          style={{
            background: '#171717',
            backgroundImage: `
              linear-gradient(rgba(64, 64, 64, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(64, 64, 64, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
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
          {model.getNodes().length} nodes, {model.getLinks().length} connections
        </div>
      </div>
    </div>
  );
} 