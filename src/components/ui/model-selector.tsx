"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

export type AIModel = 'gpt-5' | 'claude-haiku';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  theme?: 'dark' | 'white';
  disabled?: boolean;
}

const models = [
  { id: 'gpt-5' as AIModel, name: 'GPT-5', provider: 'OpenAI' },
  { id: 'claude-haiku' as AIModel, name: 'Claude Haiku', provider: 'Anthropic' }
];

export default function ModelSelector({
  selectedModel,
  onModelChange,
  theme = 'dark',
  disabled = false
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedModelData = models.find(m => m.id === selectedModel) || models[0];

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer border ${
          theme === 'white'
            ? 'border-gray-300 text-gray-700 hover:text-black hover:bg-black/5'
            : 'border-zinc-700/40 text-gray-300 hover:text-white hover:bg-white/5'
        }`}
        type="button"
        title="Select AI model"
      >
        <Sparkles className="h-3 w-3" />
        <span className="font-medium">{selectedModelData.name}</span>
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute bottom-full left-0 mb-2 min-w-[180px] rounded-lg shadow-lg border z-50 ${
            theme === 'white'
              ? 'bg-white border-gray-200'
              : 'bg-[#1e1e1e] border-zinc-700'
          }`}
        >
          <div className="py-1">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                  model.id === selectedModel
                    ? theme === 'white'
                      ? 'bg-gray-100 text-black'
                      : 'bg-zinc-800 text-white'
                    : theme === 'white'
                      ? 'text-gray-700 hover:bg-gray-50'
                      : 'text-gray-300 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{model.name}</span>
                  <span className={`text-xs ${
                    theme === 'white' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {model.provider}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
