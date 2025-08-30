import React, { useEffect } from "react";

export default function NodePalette({ anchor, onClose, onCreateNode }: { anchor: { x: number; y: number }; onClose: () => void; onCreateNode: (type: string) => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="absolute bg-[#171717] border border-zinc-800 rounded-lg shadow-xl text-sm text-gray-300 p-2 w-44 z-50"
      style={{ left: anchor.x, top: anchor.y }}
      onMouseLeave={onClose}
    >
      <div className="px-2 py-1 text-xs text-gray-400">Add node</div>
      <button onClick={() => onCreateNode('card')} className="block w-full text-left px-2 py-1.5 rounded-md hover:bg-white/5">Card</button>
      <button onClick={() => onCreateNode('if')} className="block w-full text-left px-2 py-1.5 rounded-md hover:bg-white/5">If Condition</button>
      <button onClick={() => onCreateNode('action')} className="block w-full text-left px-2 py-1.5 rounded-md hover:bg-white/5">Action</button>
      <button onClick={() => onCreateNode('end')} className="block w-full text-left px-2 py-1.5 rounded-md hover:bg-white/5">End</button>
    </div>
  );
}


