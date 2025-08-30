import React from "react";
import { Handle, Position, NodeProps } from "reactflow";

export default function IfNode({ data }: NodeProps) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-[#1a1a1a] text-gray-200 w-[280px]">
      <div className="px-3 py-2 border-b border-zinc-800 text-sm font-medium">If Condition</div>
      <div className="px-3 py-3 text-sm text-gray-300">
        <div className="bg-[#171717] border border-zinc-800 rounded-md px-2 py-1">{data.condition ?? "condition()"}</div>
        <div className="mt-2 text-xs text-gray-400">True → right, False → bottom</div>
      </div>
      <Handle type="target" position={Position.Left} className="!bg-zinc-600" />
      <Handle id="true" type="source" position={Position.Right} className="!bg-green-600" />
      <Handle id="false" type="source" position={Position.Bottom} className="!bg-red-600" />
    </div>
  );
}


