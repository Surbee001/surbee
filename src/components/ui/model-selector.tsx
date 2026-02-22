"use client";

import { useState } from "react";
import { ChevronDown, Crown, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
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
  theme?: 'dark' | 'white';
  userPlan?: string; // e.g., 'free_user', 'surbee_pro', 'surbee_max', 'surbee_enterprise'
}

// Model configuration with plan requirements
const models: Array<{
  id: AIModel;
  name: string;
  provider: string;
  requiredPlan?: 'pro' | 'max';
}> = [
  { id: 'gpt-5-mini' as AIModel, name: 'GPT-5 Mini', provider: 'OpenAI' },
  { id: 'claude-haiku' as AIModel, name: 'Haiku 4.5', provider: 'Anthropic' },
  { id: 'gpt-5' as AIModel, name: 'GPT-5', provider: 'OpenAI', requiredPlan: 'pro' },
  { id: 'gpt-5.2' as AIModel, name: 'GPT-5.2', provider: 'OpenAI', requiredPlan: 'pro' },
  { id: 'gpt-5.1-codex' as AIModel, name: 'Codex Max', provider: 'OpenAI', requiredPlan: 'max' },
];

// Check if user can access a model
function canAccessModel(requiredPlan: 'pro' | 'max' | undefined, userPlan: string): boolean {
  if (!requiredPlan) return true;

  const planHierarchy = ['free', 'pro', 'max', 'enterprise'];
  const normalizedPlan = userPlan.replace('surbee_', '').replace('_user', '');
  const userLevel = planHierarchy.indexOf(normalizedPlan);
  const requiredLevel = planHierarchy.indexOf(requiredPlan);

  return userLevel >= requiredLevel;
}

// Check if user is Pro or higher
function isPro(userPlan: string): boolean {
  return !userPlan.includes('free');
}

// Check if user is Max or higher
function isMax(userPlan: string): boolean {
  return userPlan.includes('max') || userPlan.includes('enterprise');
}

export default function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
  theme = 'dark',
  userPlan = 'free_user'
}: ModelSelectorProps) {
  const router = useRouter();
  const selectedModelData = models.find(m => m.id === selectedModel) || models[0];
  const userIsPro = isPro(userPlan);
  const userIsMax = isMax(userPlan);

  const handleModelSelect = (model: typeof models[0]) => {
    if (!canAccessModel(model.requiredPlan, userPlan)) {
      router.push('/home/pricing');
      return;
    }
    onModelChange(model.id);
  };

  // Determine if we should show badge for selected model
  const showSelectedBadge = selectedModelData.requiredPlan && (
    (selectedModelData.requiredPlan === 'pro' && !userIsPro) ||
    (selectedModelData.requiredPlan === 'max' && !userIsMax)
  );

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
            width: showSelectedBadge ? '150px' : '120px'
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
          <span className="flex items-center gap-1.5">
            {selectedModelData.name}
            {showSelectedBadge && selectedModelData.requiredPlan === 'pro' && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-400">
                <Sparkles className="w-2 h-2" /> PRO
              </span>
            )}
            {showSelectedBadge && selectedModelData.requiredPlan === 'max' && (
              <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-400">
                <Crown className="w-2 h-2" /> MAX
              </span>
            )}
          </span>
          <ChevronDown size={14} style={{ color: 'var(--surbee-fg-secondary)' }} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-lg border w-[180px]" style={{ borderColor: 'var(--surbee-dropdown-border)', backgroundColor: 'var(--surbee-dropdown-bg)', backdropFilter: 'blur(12px)' }}>
        {models.map((model) => {
          const isAccessible = canAccessModel(model.requiredPlan, userPlan);
          const showProBadge = model.requiredPlan === 'pro' && !userIsPro;
          const showMaxBadge = model.requiredPlan === 'max' && !userIsMax;

          return (
            <DropdownMenuItem
              key={model.id}
              onClick={() => handleModelSelect(model)}
              className={`rounded-lg cursor-pointer ${!isAccessible ? 'opacity-70' : ''}`}
              style={{ color: 'var(--surbee-dropdown-text)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surbee-dropdown-item-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-medium ${!isAccessible ? 'text-zinc-400' : ''}`}>{model.name}</span>
                  {showProBadge && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-400 flex-shrink-0">
                      <Sparkles className="w-2 h-2" /> PRO
                    </span>
                  )}
                  {showMaxBadge && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-400 flex-shrink-0">
                      <Crown className="w-2 h-2" /> MAX
                    </span>
                  )}
                </div>
                <span className="text-xs" style={{ color: 'var(--surbee-fg-secondary)' }}>
                  {model.provider}
                </span>
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
