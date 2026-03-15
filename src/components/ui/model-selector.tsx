"use client";

import { useState } from "react";
import { ChevronDown, Crown, Sparkles, Brain } from "lucide-react";
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
  thinkingEnabled?: boolean;
  onThinkingChange?: (enabled: boolean) => void;
  iconOnly?: boolean; // renders as a circular icon button instead of text pill
}

// Models that support thinking/reasoning
const THINKING_SUPPORTED_MODELS: Set<AIModel> = new Set([
  'gpt-5',
  'gpt-5.2',
  'gpt-5-mini',
  'gpt-5.1-codex',
  'claude-haiku',
]);

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

// Rich model data for iconOnly dropdown (matching home page style)
const OPENAI_ICON_PATH = "M20.247 10.277a4.68 4.68 0 0 0-.412-3.888c-1.05-1.805-3.163-2.734-5.226-2.297A4.83 4.83 0 0 0 10.991 2.5c-2.108-.005-3.98 1.335-4.628 3.314a4.8 4.8 0 0 0-3.208 2.297 4.74 4.74 0 0 0 .597 5.613 4.68 4.68 0 0 0 .412 3.888c1.051 1.805 3.163 2.734 5.226 2.297a4.82 4.82 0 0 0 3.618 1.59c2.11.006 3.981-1.334 4.63-3.316a4.8 4.8 0 0 0 3.208-2.296 4.74 4.74 0 0 0-.598-5.612v.002Zm-7.238 9.981a3.63 3.63 0 0 1-2.31-.824c.03-.015.08-.043.114-.063l3.834-2.185a.61.61 0 0 0 .316-.539v-5.334l1.62.924a.06.06 0 0 1 .031.043v4.418c-.002 1.964-1.614 3.556-3.605 3.56m-7.752-3.267a3.5 3.5 0 0 1-.43-2.386l.113.067 3.834 2.185a.63.63 0 0 0 .63 0l4.681-2.667v1.847a.06.06 0 0 1-.023.049l-3.875 2.208c-1.727.981-3.932.398-4.93-1.303m-1.01-8.259a3.6 3.6 0 0 1 1.878-1.56l-.001.13v4.37a.61.61 0 0 0 .314.538l4.681 2.667-1.62.923a.06.06 0 0 1-.055.005l-3.876-2.21a3.54 3.54 0 0 1-1.321-4.862Zm13.314 3.058-4.68-2.668L14.5 8.2a.06.06 0 0 1 .055-.005l3.876 2.208a3.536 3.536 0 0 1 1.32 4.865 3.6 3.6 0 0 1-1.877 1.56v-4.5a.61.61 0 0 0-.313-.538m1.613-2.396-.113-.067-3.835-2.185a.63.63 0 0 0-.63 0L9.916 9.81V7.963a.06.06 0 0 1 .022-.05l3.876-2.206c1.726-.983 3.933-.398 4.929 1.306.42.72.573 1.562.43 2.381zm-10.14 3.291-1.62-.923a.06.06 0 0 1-.032-.044V7.301C7.383 5.335 9 3.741 10.993 3.742c.843 0 1.659.292 2.307.824l-.114.064-3.834 2.185a.61.61 0 0 0-.315.538zv.002Zm.88-1.872L12 9.625l2.085 1.187v2.376L12 14.375l-2.085-1.187z";
const ANTHROPIC_ICON_PATH = "m4.35 9.87 2.37-1.33.03-.11-.03-.07H6.6l-.4-.02-1.35-.04-1.16-.05-1.14-.06-.28-.06L2 7.78l.03-.18.24-.16.34.03.76.06 1.14.07.82.05 1.23.13h.2l.02-.08-.06-.05-.06-.05-1.18-.8-1.27-.84-.67-.49-.36-.24L3 5l-.08-.5.33-.37.44.03.1.03.45.35.96.74 1.24.91.18.15.08-.05v-.03l-.08-.14-.67-1.22-.72-1.25-.32-.52-.09-.3a1.4 1.4 0 0 1-.05-.37l.37-.5.2-.07.5.06.21.18.32.71.5 1.12.77 1.51.23.46.12.41.05.13h.08v-.08l.06-.85.12-1.05.11-1.35.04-.37.2-.46.37-.25.29.14.24.34-.03.23-.15.92-.27 1.45-.19.98h.1l.13-.13.5-.65.82-1.03.36-.41.43-.45.27-.22h.52l.38.56-.17.59-.53.67-.44.57-.64.85-.39.68.04.06h.09l1.43-.32.77-.13.92-.16.42.2.04.2-.16.4-.99.23-1.15.24-1.72.4-.02.02.02.03.78.07.33.02h.8l1.52.12.4.25.23.32-.04.25-.6.3-.83-.19-1.91-.45-.65-.17h-.1v.06l.55.53 1 .9 1.26 1.17.06.3-.16.22-.17-.02-1.1-.83-.43-.38-.96-.8h-.07v.08l.23.32 1.17 1.76.06.55-.09.17-.3.1-.33-.05-.7-.97-.7-1.08-.57-.98-.07.04-.34 3.63-.16.19-.36.14-.3-.23-.17-.37.16-.74.2-.97.15-.76.15-.95.08-.32v-.02l-.07.01-.72.98L6.08 12l-.86.92L5 13l-.36-.18.04-.34.2-.29 1.19-1.52.72-.94.46-.54V9.1h-.03l-3.17 2.06-.56.08-.25-.23.03-.38.12-.12.95-.65Z";
const CHIP_ICON_PATH = "M1.43 12.628c0 .402.268.678.67.678h.862v2.78c0 .401.268.66.67.66h2.77v.863c0 .401.276.67.678.67s.67-.268.67-.67v-.862h1.43v.862c0 .401.268.67.67.67s.678-.268.678-.67v-.862h1.423v.862c0 .401.268.67.67.67.41 0 .678-.268.678-.67v-.862h2.77c.402 0 .67-.26.67-.662v-2.787h.862c.402 0 .67-.276.67-.678s-.268-.67-.67-.67h-.862v-1.43h.862c.402 0 .67-.268.67-.67 0-.401-.268-.678-.67-.678h-.862V7.748h.862c.402 0 .67-.276.67-.678s-.268-.67-.67-.67h-.862V3.639c0-.401-.268-.67-.67-.67H13.3v-.853c0-.402-.268-.678-.678-.678-.402 0-.67.276-.67.678v.854h-1.423v-.854c0-.402-.276-.678-.678-.678s-.67.276-.67.678v.854H7.75v-.854c0-.402-.268-.678-.67-.678s-.678.276-.678.678v.854h-2.77c-.402 0-.67.268-.67.67v2.77H2.1c-.402 0-.67.268-.67.67 0 .401.268.678.67.678h.862V9.18H2.1c-.402 0-.67.276-.67.678 0 .401.268.67.67.67h.862v1.43H2.1c-.402 0-.67.268-.67.67m2.88 2.528V4.567c0-.184.067-.25.242-.25H15.15c.175 0 .242.066.242.25v10.59c0 .183-.067.242-.242.242H4.551c-.175 0-.242-.059-.242-.243m2.435-1.548h6.228c.427 0 .628-.201.628-.645v-6.21c0-.436-.201-.637-.628-.637H6.745c-.426 0-.636.2-.636.636v6.211c0 .444.21.645.636.645m.46-1.298V7.413c0-.125.085-.2.202-.2h4.897c.125 0 .2.075.2.2v4.897c0 .117-.075.201-.2.201H7.406a.193.193 0 0 1-.201-.2";

const richModels: Array<{
  id: AIModel;
  name: string;
  description: string;
  requiredPlan?: 'pro' | 'max';
  icon: { viewBox: string; path: string };
}> = [
  { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast & affordable for simple tasks', icon: { viewBox: '0 0 24 24', path: OPENAI_ICON_PATH } },
  { id: 'claude-haiku', name: 'Claude Haiku 4.5', description: 'Fast responses with near-frontier intelligence', icon: { viewBox: '0 0 16 16', path: ANTHROPIC_ICON_PATH } },
  { id: 'gpt-5', name: 'GPT-5', description: 'Flagship GPT model for complex tasks', requiredPlan: 'pro', icon: { viewBox: '0 0 24 24', path: OPENAI_ICON_PATH } },
  { id: 'gpt-5.2', name: 'GPT-5.2', description: 'Latest GPT model with enhanced reasoning', requiredPlan: 'pro', icon: { viewBox: '0 0 24 24', path: OPENAI_ICON_PATH } },
  { id: 'gpt-5.1-codex', name: 'Codex Max', description: 'Optimized for code and technical tasks', requiredPlan: 'max', icon: { viewBox: '0 0 24 24', path: OPENAI_ICON_PATH } },
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
  userPlan = 'free_user',
  thinkingEnabled = false,
  onThinkingChange,
  iconOnly = false,
}: ModelSelectorProps) {
  const router = useRouter();
  const selectedModelData = models.find(m => m.id === selectedModel) || models[0];
  const userIsPro = isPro(userPlan);
  const userIsMax = isMax(userPlan);
  const supportsThinking = THINKING_SUPPORTED_MODELS.has(selectedModel);

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
    <div className="flex items-center gap-1.5">
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {iconOnly ? (
          <button
            disabled={disabled}
            className={`inline-flex items-center justify-center rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none h-[28px] w-7 ${theme === 'white' ? 'text-gray-700 hover:text-black hover:bg-black/5' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
            type="button"
            title="Select AI model"
          >
            <svg height="14" width="14" viewBox="0 0 20 20" fill="currentColor">
              <path d="M1.43 12.628c0 .402.268.678.67.678h.862v2.78c0 .401.268.66.67.66h2.77v.863c0 .401.276.67.678.67s.67-.268.67-.67v-.862h1.43v.862c0 .401.268.67.67.67s.678-.268.678-.67v-.862h1.423v.862c0 .401.268.67.67.67.41 0 .678-.268.678-.67v-.862h2.77c.402 0 .67-.26.67-.662v-2.787h.862c.402 0 .67-.276.67-.678s-.268-.67-.67-.67h-.862v-1.43h.862c.402 0 .67-.268.67-.67 0-.401-.268-.678-.67-.678h-.862V7.748h.862c.402 0 .67-.276.67-.678s-.268-.67-.67-.67h-.862V3.639c0-.401-.268-.67-.67-.67H13.3v-.853c0-.402-.268-.678-.678-.678-.402 0-.67.276-.67.678v.854h-1.423v-.854c0-.402-.276-.678-.678-.678s-.67.276-.67.678v.854H7.75v-.854c0-.402-.268-.678-.67-.678s-.678.276-.678.678v.854h-2.77c-.402 0-.67.268-.67.67v2.77H2.1c-.402 0-.67.268-.67.67 0 .401.268.678.67.678h.862V9.18H2.1c-.402 0-.67.276-.67.678 0 .401.268.67.67.67h.862v1.43H2.1c-.402 0-.67.268-.67.67m2.88 2.528V4.567c0-.184.067-.25.242-.25H15.15c.175 0 .242.066.242.25v10.59c0 .183-.067.242-.242.242H4.551c-.175 0-.242-.059-.242-.243m2.435-1.548h6.228c.427 0 .628-.201.628-.645v-6.21c0-.436-.201-.637-.628-.637H6.745c-.426 0-.636.2-.636.636v6.211c0 .444.21.645.636.645m.46-1.298V7.413c0-.125.085-.2.202-.2h4.897c.125 0 .2.075.2.2v4.897c0 .117-.075.201-.2.201H7.406a.193.193 0 0 1-.201-.2" />
            </svg>
          </button>
        ) : (
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
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={iconOnly ? 'start' : 'start'}
        side="bottom"
        style={iconOnly ? {
          borderRadius: '24px',
          padding: '8px',
          border: '1px solid var(--surbee-dropdown-border)',
          backgroundColor: 'var(--surbee-dropdown-bg)',
          backdropFilter: 'blur(12px)',
          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 7px 16px',
          width: '300px',
          fontFamily: "'Opening Hours Sans', sans-serif",
        } : {
          borderColor: 'var(--surbee-dropdown-border)',
          backgroundColor: 'var(--surbee-dropdown-bg)',
          backdropFilter: 'blur(12px)',
        }}
        className={iconOnly ? '' : 'rounded-lg border w-[180px]'}
      >
        {iconOnly ? (
          <>
            {richModels.map((model) => {
              const isLocked = !canAccessModel(model.requiredPlan, userPlan);
              return (
                <DropdownMenuItem
                  key={model.id}
                  className="cursor-pointer"
                  style={{ borderRadius: '18px', padding: '8px 8px 8px 16px', color: 'var(--surbee-dropdown-text)', marginBottom: '1px' }}
                  onSelect={() => {
                    if (isLocked) {
                      router.push('/home/pricing');
                    } else {
                      onModelChange(model.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="flex h-5 items-center justify-center -ml-1 -mr-1 min-w-6">
                      <svg height="18" width="18" viewBox={model.icon.viewBox} fill="currentColor" style={{ color: 'var(--surbee-dropdown-text-muted)' }}>
                        <path d={model.icon.path} />
                      </svg>
                    </div>
                    <div className="flex flex-col w-full">
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{model.name}</p>
                        {isLocked && model.requiredPlan === 'pro' && (
                          <span className="inline-flex items-center h-4 px-2 rounded-2xl text-[0.5625rem] font-medium uppercase" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>Pro</span>
                        )}
                        {isLocked && model.requiredPlan === 'max' && (
                          <span className="inline-flex items-center h-4 px-2 rounded-2xl text-[0.5625rem] font-medium uppercase" style={{ backgroundColor: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' }}>Max</span>
                        )}
                      </div>
                    </div>
                    {selectedModel === model.id && (
                      <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor" className="flex-shrink-0 mt-0.5" style={{ color: 'var(--surbee-dropdown-text-muted)' }}>
                        <path d="M7.23 11.72c.22 0 .41-.1.55-.3l4.2-5.97c.07-.13.16-.28.16-.43 0-.3-.27-.5-.55-.5-.17 0-.33.12-.46.31l-3.92 5.6-1.9-2.28c-.15-.21-.3-.26-.49-.26a.52.52 0 0 0-.52.53c0 .14.07.28.16.41l2.2 2.58c.17.22.35.32.57.32Z" />
                      </svg>
                    )}
                  </div>
                </DropdownMenuItem>
              );
            })}
          </>
        ) : (
          models.map((model) => {
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
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    {supportsThinking && onThinkingChange && !iconOnly && (
      <button
        disabled={disabled}
        onClick={() => onThinkingChange(!thinkingEnabled)}
        className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
        style={{
          color: 'var(--surbee-fg-secondary)',
          backgroundColor: 'transparent',
          borderColor: 'var(--surbee-sidebar-border)',
          fontFamily: 'var(--font-inter), sans-serif',
          opacity: thinkingEnabled ? 1 : 0.6,
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        title={thinkingEnabled ? "Thinking enabled — click to disable" : "Enable thinking/reasoning"}
      >
        <Brain size={12} />
        <span>{thinkingEnabled ? 'Think on' : 'Think'}</span>
      </button>
    )}
    </div>
  );
}
