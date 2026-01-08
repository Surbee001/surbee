"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type AIModel = 'gpt-5' | 'gpt-5.2' | 'gpt-5-mini' | 'gpt-5.1-codex' | 'claude-haiku' | 'mistral';

interface ModelSelectorProps {
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  disabled?: boolean;
}

const models = [
  { id: 'gpt-5' as AIModel, name: 'GPT-5', provider: 'OpenAI' },
  { id: 'gpt-5.2' as AIModel, name: 'GPT-5.2', provider: 'OpenAI' },
  { id: 'gpt-5-mini' as AIModel, name: 'GPT-5 Mini', provider: 'OpenAI' },
  { id: 'gpt-5.1-codex' as AIModel, name: 'Codex Max', provider: 'OpenAI' },
  { id: 'claude-haiku' as AIModel, name: 'Haiku 4.5', provider: 'Anthropic' },
];

export default function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false
}: ModelSelectorProps) {
  const selectedModelData = models.find(m => m.id === selectedModel) || models[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={disabled}
          className="flex items-center justify-between gap-1.5 px-2 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          style={{
            color: 'var(--surbee-fg-primary)',
            backgroundColor: 'transparent',
            borderColor: 'var(--surbee-sidebar-border)',
            fontFamily: 'var(--font-inter), sans-serif',
            width: '120px'
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title="Select AI model"
        >
          <span>{selectedModelData.name}</span>
          <ChevronDown size={14} style={{ color: 'var(--surbee-fg-secondary)' }} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-lg border w-[120px]" style={{ borderColor: 'var(--surbee-dropdown-border)', backgroundColor: 'var(--surbee-dropdown-bg)', backdropFilter: 'blur(12px)' }}>
        {models.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => onModelChange(model.id)}
            className="rounded-lg cursor-pointer"
            style={{ color: 'var(--surbee-dropdown-text)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surbee-dropdown-item-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex flex-col">
              <span className="font-medium">{model.name}</span>
              <span className="text-xs" style={{ color: 'var(--surbee-fg-secondary)' }}>
                {model.provider}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
