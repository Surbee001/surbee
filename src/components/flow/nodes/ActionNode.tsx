import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

export default function ActionNode({ data }: NodeProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-[#1a1a1a] text-gray-200 w-[260px]">
      <div className="px-3 py-2 border-b border-zinc-800 text-sm font-medium">Action</div>
      <div className="px-3 py-3 text-sm text-gray-300">
        <div className="bg-[#171717] border border-zinc-800 rounded-md px-2 py-1">{data.action ?? "operation"}</div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-zinc-600" />
      <Handle type="source" position={Position.Right} className="!bg-zinc-600" />
    </div>
  );
}


