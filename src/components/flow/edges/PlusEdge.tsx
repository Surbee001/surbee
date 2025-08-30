import React, { useMemo } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useReactFlow } from "reactflow";

export default function PlusEdge({ id, sourceX, sourceY, targetX, targetY, source, target, markerEnd, style }: any) {
  const { getNode, setNodes, setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getBezierPath({ sourceX, sourceY, targetX, targetY });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={{ stroke: "#8a8a8a", strokeWidth: 2, ...style }} />
      <EdgeLabelRenderer>
        <button
          className="nodrag nopan absolute -translate-x-1/2 -translate-y-1/2 rounded-full w-5 h-5 flex items-center justify-center text-xs bg-[#171717] border border-zinc-800 text-gray-200 hover:bg-white/5"
          style={{ left: labelX, top: labelY }}
          onClick={(e) => {
            e.stopPropagation();
            // Fire a custom event; parent builder listens via edgeTypes not trivial; we store in window for simplicity
            const ev = new CustomEvent("plus-edge-click", { detail: { edgeId: id, midX: labelX, midY: labelY, source, target } });
            window.dispatchEvent(ev);
          }}
        >
          +
        </button>
      </EdgeLabelRenderer>
    </>
  );
}


