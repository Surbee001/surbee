import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

export default function StartNode({ data }: NodeProps) {
  return (
    <div className="rounded-full border border-zinc-800 bg-[#1a1a1a] text-gray-200 w-[80px] h-[80px] flex items-center justify-center text-sm font-medium">
      {data.label ?? "Start"}
      <Handle type="source" position={Position.Right} className="!bg-zinc-600" />
    </div>
  );
}


