"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// We rely on reactflow if available. The app should install it via pnpm add reactflow
// Types are optional at runtime, so we guard dynamic features carefully
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Connection,
  Edge,
  Node,
  MarkerType,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  Panel,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

import PlusEdge from "./edges/PlusEdge";
import CardNode from "./nodes/CardNode";
import IfNode from "./nodes/IfNode";
import ActionNode from "./nodes/ActionNode";
import StartNode from "./nodes/StartNode";
import EndNode from "./nodes/EndNode";
import NodePalette from "./NodePalette";

type ExportFormat = "json" | "xml";

export interface NodeFlowBuilderProps {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  onFlowChange?: (data: { nodes: Node[]; edges: Edge[] }) => void;
}

const nodeTypes = {
  card: CardNode,
  if: IfNode,
  action: ActionNode,
  start: StartNode,
  end: EndNode,
};

const edgeTypes = {
  plus: PlusEdge,
};

const defaultNodes: Node[] = [
  {
    id: "start",
    type: "start",
    position: { x: 100, y: 100 },
    data: { label: "Start" },
  },
  {
    id: "card-1",
    type: "card",
    position: { x: 350, y: 100 },
    data: { title: "Card", content: "Ask a question" },
  },
  {
    id: "end",
    type: "end",
    position: { x: 650, y: 100 },
    data: { label: "End" },
  },
];

const defaultEdges: Edge[] = [
  {
    id: "e-start-card1",
    source: "start",
    target: "card-1",
    type: "plus",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#8a8a8a" },
  },
  {
    id: "e-card1-end",
    source: "card-1",
    target: "end",
    type: "plus",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#8a8a8a" },
  },
];

export default function NodeFlowBuilder({
  initialNodes,
  initialEdges,
  onFlowChange,
}: NodeFlowBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes ?? defaultNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges ?? defaultEdges);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteAnchor, setPaletteAnchor] = useState<{ x: number; y: number } | null>(null);
  const [paletteEdgeContext, setPaletteEdgeContext] = useState<{ edgeId: string; midX: number; midY: number; source: string; target: string } | null>(null);

  // notify parent on changes
  useEffect(() => {
    onFlowChange?.({ nodes, edges });
  }, [nodes, edges, onFlowChange]);

  const isValidConnection = useCallback((conn: Connection) => {
    if (!conn.source || !conn.target) return false;
    if (conn.source === conn.target) return false;
    // prevent multi-inputs on end node for example (custom rule demo)
    const targetConnections = edges.filter((e) => e.target === conn.target);
    if (targetConnections.length > 5) return false; // arbitrary cap
    return true;
  }, [edges]);

  const onConnect: OnConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, type: "plus", markerEnd: { type: MarkerType.ArrowClosed, color: "#8a8a8a" } }, eds));
  }, [setEdges]);

  // Edge '+' handler opens palette
  const handleEdgeAddNode = useCallback((edgeId: string, midX: number, midY: number, source: string, target: string) => {
    setPaletteOpen(true);
    setPaletteAnchor({ x: midX, y: midY });
    setPaletteEdgeContext({ edgeId, midX, midY, source, target });
  }, []);

  // listen to custom plus-edge-click to open palette
  useEffect(() => {
    const handler = (e: any) => {
      const { edgeId, midX, midY, source, target } = e.detail || {};
      if (!edgeId) return;
      handleEdgeAddNode(edgeId, midX, midY, source, target);
    };
    window.addEventListener("plus-edge-click", handler as any);
    return () => window.removeEventListener("plus-edge-click", handler as any);
  }, [handleEdgeAddNode]);

  // Node creation from palette
  const handleCreateNode = useCallback((type: string) => {
    if (!paletteEdgeContext) return;
    const id = `${type}-${Date.now()}`;
    const position = { x: paletteEdgeContext.midX - 150, y: paletteEdgeContext.midY - 40 };
    const data: any =
      type === "card" ? { title: "Card", content: "" } :
      type === "if" ? { condition: "" } :
      type === "action" ? { action: "email" } : { label: type };

    const newNode: Node = { id, type: type as any, position, data };

    setNodes((nds) => [...nds, newNode]);
    setEdges((eds) => {
      // remove original edge and splice with two edges
      const removed = eds.filter((e) => e.id !== paletteEdgeContext.edgeId);
      return [
        ...removed,
        { id: `e-${paletteEdgeContext.source}-${id}`, source: paletteEdgeContext.source, target: id, type: "plus", markerEnd: { type: MarkerType.ArrowClosed, color: "#8a8a8a" } },
        { id: `e-${id}-${paletteEdgeContext.target}`, source: id, target: paletteEdgeContext.target, type: "plus", markerEnd: { type: MarkerType.ArrowClosed, color: "#8a8a8a" } },
      ];
    });
    setPaletteOpen(false);
  }, [paletteEdgeContext, setEdges, setNodes]);

  // Context menu basic (right-click)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const onCanvasContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleExport = useCallback((fmt: ExportFormat) => {
    const payload = { nodes, edges };
    if (fmt === "json") {
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "flow.json"; a.click(); URL.revokeObjectURL(url);
    } else {
      // very naive XML
      const xml = `<?xml version="1.0"?><flow>${nodes.map(n=>`<node id="${n.id}" type="${n.type}" x="${n.position.x}" y="${n.position.y}"/>`).join("")}${edges.map(e=>`<edge id="${e.id}" source="${e.source}" target="${e.target}"/>`).join("")}</flow>`;
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "flow.xml"; a.click(); URL.revokeObjectURL(url);
    }
  }, [nodes, edges]);

  // Key handlers for delete/copy/paste
  const rfRef = useRef<any>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // delete
      if ((e.key === "Backspace" || e.key === "Delete")) {
        setNodes((nds) => nds.filter((n) => !n.selected));
        setEdges((eds) => eds.filter((ed) => !ed.selected));
      }
      // copy/paste minimal
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        const selected = nodes.filter((n) => n.selected);
        sessionStorage.setItem("flow_clipboard", JSON.stringify(selected));
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        const raw = sessionStorage.getItem("flow_clipboard");
        if (raw) {
          try {
            const copy: Node[] = JSON.parse(raw);
            const now = Date.now();
            setNodes((nds) => [
              ...nds,
              ...copy.map((n, i) => ({
                ...n,
                id: `${n.id}-copy-${now}-${i}`,
                position: { x: n.position.x + 40, y: n.position.y + 40 },
                selected: false,
              })),
            ]);
          } catch {}
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [nodes, setNodes, setEdges]);

  return (
    <div className="w-full h-full relative" onContextMenu={onCanvasContextMenu}>
      <ReactFlow
        ref={rfRef}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as OnNodesChange}
        onEdgesChange={onEdgesChange as OnEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ animated: false }}
        isValidConnection={isValidConnection}
        proOptions={{ hideAttribution: true }}
        style={{ background: "#1a1a1a" }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#2a2a2a" />
        <MiniMap pannable zoomable nodeStrokeColor={() => "#8a8a8a"} nodeColor={() => "#1a1a1a"} maskColor="#111" />
        <Controls position="bottom-right" showInteractive={true} />
        <Panel position="top-left">
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 text-xs rounded-md bg-zinc-800 text-gray-200 hover:bg-zinc-700" onClick={() => setPaletteOpen((v) => !v)}>Nodes</button>
            <button className="px-2 py-1 text-xs rounded-md bg-zinc-800 text-gray-200 hover:bg-zinc-700" onClick={() => handleExport("json")}>Export JSON</button>
            <button className="px-2 py-1 text-xs rounded-md bg-zinc-800 text-gray-200 hover:bg-zinc-700" onClick={() => handleExport("xml")}>Export XML</button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Node palette anchored */}
      {paletteOpen && (
        <NodePalette
          anchor={paletteAnchor ?? { x: 20, y: 20 }}
          onClose={() => setPaletteOpen(false)}
          onCreateNode={handleCreateNode}
        />
      )}

      {/* Context menu basic */}
      {contextMenu && (
        <div
          className="absolute bg-[#171717] border border-zinc-800 rounded-md shadow-xl text-sm text-gray-300"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button className="block w-full text-left px-3 py-2 hover:bg-white/5" onClick={() => { setContextMenu(null); setPaletteOpen(true); setPaletteAnchor(contextMenu); }}>Add node…</button>
          <button className="block w-full text-left px-3 py-2 hover:bg-white/5" onClick={() => { setContextMenu(null); setNodes([]); setEdges([]); }}>Clear</button>
        </div>
      )}
    </div>
  );
}


