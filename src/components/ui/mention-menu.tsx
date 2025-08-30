"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type KBType = "file" | "folder";

export interface KnowledgeBaseFile {
  id: string;
  name: string;
  type: KBType;
  path: string;
}

interface MentionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFile: (file: KnowledgeBaseFile) => void;
  anchorRect: { left: number; top: number; width: number };
  searchTerm: string;
  files?: KnowledgeBaseFile[];
  className?: string;
}

const defaultFiles: KnowledgeBaseFile[] = [
  { id: "1", name: "context.md", type: "file", path: "/kb/context.md" },
  { id: "2", name: "api-reference.md", type: "file", path: "/kb/api-reference.md" },
  { id: "3", name: "user-guide.md", type: "file", path: "/kb/user-guide.md" },
  { id: "4", name: "examples", type: "folder", path: "/kb/examples" },
  { id: "5", name: "faq.md", type: "file", path: "/kb/faq.md" },
  { id: "6", name: "troubleshooting.md", type: "file", path: "/kb/troubleshooting.md" },
];

export default function MentionMenu({ isOpen, onClose, onSelectFile, anchorRect, searchTerm, files, className = "" }: MentionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const data = files && files.length ? files : defaultFiles;

  const filtered = useMemo(() => {
    const q = (searchTerm || "").toLowerCase().trim();
    if (!q) return data;
    return data.filter((f) => f.name.toLowerCase().includes(q));
  }, [data, searchTerm]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const hit = filtered[selectedIndex];
        if (hit) {
          onSelectFile(hit);
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [filtered, isOpen, onClose, onSelectFile, selectedIndex]);

  useEffect(() => {
    if (!isOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(t)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const left = Math.max(0, anchorRect.left);
  const top = Math.max(0, anchorRect.top);
  const width = 240;

  return (
    <>
      {/* CSS to prevent @ symbol from appearing blue/hyperlinked */}
      <style jsx>{`
        .ProseMirror {
          color: rgb(235, 235, 235) !important;
        }
        .ProseMirror * {
          color: inherit !important;
          text-decoration: none !important;
        }
      `}</style>
      <AnimatePresence>
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: -8, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className={`w-[240px] rounded-xl border shadow-xl bg-white text-zinc-800 border-zinc-200 dark:bg-[#1b1b1b] dark:text-zinc-100 dark:border-zinc-800 ${className}`}
        >
        <div className="p-2">
          <div className="px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 mb-2">
            Knowledge Base Files
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-zinc-500 dark:text-zinc-400 text-sm">No files found</div>
            ) : (
              filtered.map((file, idx) => (
                <button
                  key={file.id}
                  type="button"
                  className={`w-full text-left px-3 py-2.5 rounded-md transition-colors ${
                    idx === selectedIndex ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-white" : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    onSelectFile(file);
                    onClose();
                  }}
                >
                  <div className="font-medium text-sm truncate">{file.name}</div>
                </button>
              ))
            )}
          </div>
        </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}


