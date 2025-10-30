"use client";

import { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Search, Plug2, Settings as SettingsIcon, Sparkles } from "lucide-react";

interface ChatSettingsMenuProps {
  className?: string;
  onClose?: () => void;
}

const ChatSettingsMenu = forwardRef<HTMLDivElement, ChatSettingsMenuProps>(
  ({ className = "", onClose }, ref) => {
    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className={`w-[220px] rounded-xl border bg-white text-zinc-800 border-zinc-200 dark:bg-[#1b1b1b] dark:text-zinc-100 dark:border-zinc-800 ${className}`}
          style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)' }}
          role="dialog"
          aria-modal="true"
        >
          <div className="p-2">
            {/* Use style */}
            <button
              className="group flex w-full items-center gap-2.5 px-1.5 h-8 rounded-md text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors"
              onClick={onClose}
              style={{ fontFamily: 'Sohne, sans-serif' }}
            >
              <SettingsIcon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200" />
              <span className="truncate">Use style</span>
              <svg
                className="ml-auto h-4 w-4 text-zinc-500/80"
                viewBox="0 0 256 256"
                fill="currentColor"
              >
                <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z" />
              </svg>
            </button>

            <div className="h-px my-1.5 mx-0.5 bg-zinc-200 dark:bg-white/10" />

            {/* Web search toggle */}
            <div className="flex w-full items-center gap-2.5 px-1.5 h-[2.5rem] rounded-md text-sm text-zinc-700 dark:text-zinc-300" style={{ fontFamily: 'Sohne, sans-serif' }}>
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Search className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <div className="flex-1 min-w-0">
                  <div className="truncate group-hover:text-zinc-900 dark:group-hover:text-white">Web search</div>
                  <div className="text-[12px] text-zinc-400 truncate"> </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-7 h-4 rounded-full bg-zinc-300 dark:bg-zinc-600 peer-checked:bg-blue-500 transition-colors" />
                <div className="absolute left-[2px] top-[2px] h-3 w-3 rounded-full bg-white transition-all peer-checked:translate-x-full" />
              </label>
            </div>

            {/* Brainstorm toggle */}
            <div className="flex w-full items-center gap-2.5 px-1.5 h-[2.5rem] rounded-md text-sm text-zinc-700 dark:text-zinc-300" style={{ fontFamily: 'Sohne, sans-serif' }}>
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <Sparkles className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <div className="flex-1 min-w-0">
                  <div className="truncate group-hover:text-zinc-900 dark:group-hover:text-white">Brainstorm</div>
                  <div className="text-[12px] text-zinc-400 truncate"> </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-7 h-4 rounded-full bg-zinc-300 dark:bg-zinc-600 peer-checked:bg-blue-500 transition-colors" />
                <div className="absolute left-[2px] top-[2px] h-3 w-3 rounded-full bg-white transition-all peer-checked:translate-x-full" />
              </label>
            </div>

            <div className="h-px my-1.5 mx-0.5 bg-zinc-200 dark:bg-white/10" />

            {/* Add connectors */}
            <button className="group flex w-full items-center gap-2.5 px-1.5 h-8 rounded-md text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors" style={{ fontFamily: 'Sohne, sans-serif' }}>
              <Plug2 className="w-4 h-4 text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200" />
              <span className="truncate">Add connectors</span>
              <span className="ml-2 inline-flex items-center h-4 px-2 rounded-2xl text-[0.5625rem] font-medium text-blue-500 bg-blue-500/10 uppercase">pro</span>
            </button>

            {/* Manage connectors */}
            <button className="group flex w-full items-center gap-2.5 px-1.5 h-8 rounded-md text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors" style={{ fontFamily: 'Sohne, sans-serif' }}>
              <SettingsIcon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-400 dark:group-hover:text-zinc-200" />
              <span className="truncate">Manage connectors</span>
              <svg className="ml-auto h-4 w-4 text-zinc-400 dark:text-zinc-500/70" viewBox="0 0 256 256" fill="currentColor">
                <path d="M224,104a8,8,0,0,1-16,0V59.32l-66.33,66.34a8,8,0,0,1-11.32-11.32L196.68,48H152a8,8,0,0,1,0-16h64a8,8,0,0,1,8,8Zm-40,24a8,8,0,0,0-8,8v72H48V80h72a8,8,0,0,0,0-16H48A16,16,0,0,0,32,80V208a16,16,0,0,0,16,16H176a16,16,0,0,0,16-16V136A8,8,0,0,0,184,128Z" />
              </svg>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }
);

ChatSettingsMenu.displayName = "ChatSettingsMenu";

export default ChatSettingsMenu;


