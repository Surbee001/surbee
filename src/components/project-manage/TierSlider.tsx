"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CIPHER_TIERS, CipherTier } from '@/lib/cipher/tier-config';
import { Crown, Sparkles } from 'lucide-react';

interface TierSliderProps {
  value: CipherTier;
  onChange: (tier: CipherTier) => void;
  disabled?: boolean;
  userPlan?: 'free' | 'pro' | 'max';
}

const TIER_INFO: Record<CipherTier, {
  name: string;
  description: string;
  color: string;
  bgColor: string;
  requiredPlan?: 'pro' | 'max';
}> = {
  1: {
    name: 'Basic',
    description: 'Essential behavioral checks',
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-500',
  },
  2: {
    name: 'Standard',
    description: 'Focus tracking & paste detection',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
  },
  3: {
    name: 'Enhanced',
    description: 'Scroll patterns & hover analysis',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500',
    requiredPlan: 'pro',
  },
  4: {
    name: 'Advanced',
    description: 'AI detection & deep analysis',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500',
    requiredPlan: 'max',
  },
  5: {
    name: 'Maximum',
    description: 'Fraud ring detection & full suite',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500',
    requiredPlan: 'max',
  },
};

export function TierSlider({
  value,
  onChange,
  disabled = false,
  userPlan = 'free',
}: TierSliderProps) {
  const router = useRouter();
  const currentTier = TIER_INFO[value];
  const tierConfig = CIPHER_TIERS[value];

  const canAccessTier = (tier: CipherTier): boolean => {
    const tierInfo = TIER_INFO[tier];
    if (!tierInfo.requiredPlan) return true;
    if (tierInfo.requiredPlan === 'pro') return userPlan === 'pro' || userPlan === 'max';
    if (tierInfo.requiredPlan === 'max') return userPlan === 'max';
    return false;
  };

  const handleTierChange = (newTier: CipherTier) => {
    if (!canAccessTier(newTier)) {
      router.push('/home/pricing');
      return;
    }
    onChange(newTier);
  };

  const PlanBadge = ({ plan, accessible }: { plan: 'pro' | 'max'; accessible: boolean }) => {
    const isPro = plan === 'pro';

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (!accessible) router.push('/home/pricing');
        }}
        className={`
          inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold
          transition-all
          ${accessible ? 'cursor-default' : 'cursor-pointer hover:scale-105'}
          ${isPro
            ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30'
            : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
          }
        `}
      >
        {isPro ? (
          <><Sparkles className="w-2.5 h-2.5" /> PRO</>
        ) : (
          <><Crown className="w-2.5 h-2.5" /> MAX</>
        )}
      </button>
    );
  };

  const renderBadges = (tier: CipherTier) => {
    const tierInfo = TIER_INFO[tier];
    if (!tierInfo.requiredPlan) return null;

    const accessible = canAccessTier(tier);

    if (tierInfo.requiredPlan === 'pro') {
      return (
        <div className="flex gap-1 mt-1 justify-center">
          <PlanBadge plan="pro" accessible={accessible} />
          <PlanBadge plan="max" accessible={accessible} />
        </div>
      );
    }

    if (tierInfo.requiredPlan === 'max') {
      return (
        <div className="flex justify-center mt-1">
          <PlanBadge plan="max" accessible={accessible} />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {/* Current tier display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${currentTier.bgColor}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{currentTier.name}</span>
              <span className="text-zinc-500 text-sm">Tier {value}</span>
              {currentTier.requiredPlan && (
                <span
                  onClick={() => !canAccessTier(value) && router.push('/home/pricing')}
                  className={`
                    inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold
                    ${!canAccessTier(value) ? 'cursor-pointer hover:scale-105' : ''}
                    ${currentTier.requiredPlan === 'max'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-indigo-500/20 text-indigo-400'
                    }
                  `}
                >
                  {currentTier.requiredPlan === 'max' ? (
                    <><Crown className="w-2.5 h-2.5" /> MAX</>
                  ) : (
                    <><Sparkles className="w-2.5 h-2.5" /> PRO+</>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">{currentTier.description}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-white">{tierConfig.checks.length}</span>
          <span className="text-sm text-zinc-400 ml-1">checks</span>
        </div>
      </div>

      {/* Slider */}
      <div className="relative pt-2">
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => handleTierChange(parseInt(e.target.value) as CipherTier)}
          disabled={disabled}
          className="w-full h-2 bg-zinc-700 rounded-full appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0"
        />

        {/* Tier markers */}
        <div className="flex justify-between mt-3 px-0.5">
          {([1, 2, 3, 4, 5] as CipherTier[]).map((tier) => {
            const tierInfo = TIER_INFO[tier];
            const isSelected = tier === value;
            const accessible = canAccessTier(tier);

            return (
              <button
                key={tier}
                onClick={() => handleTierChange(tier)}
                disabled={disabled}
                className={`
                  flex flex-col items-center gap-1 transition-all relative
                  ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                  ${isSelected ? 'opacity-100' : 'opacity-60 hover:opacity-100'}
                `}
              >
                <div
                  className={`
                    w-3 h-3 rounded-full border-2 transition-all
                    ${isSelected
                      ? `${tierInfo.bgColor} border-white`
                      : `bg-zinc-800 border-zinc-600 ${!accessible ? 'border-dashed' : ''}`
                    }
                  `}
                />
                <span className={`text-[10px] ${isSelected ? 'text-white font-medium' : 'text-zinc-500'}`}>
                  {tier}
                </span>
                {tierInfo.requiredPlan && !accessible && (
                  <div className="absolute -top-4">
                    {tierInfo.requiredPlan === 'max' ? (
                      <Crown className="w-3 h-3 text-amber-400/60" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-indigo-400/60" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tier cards with badges */}
      <div className="grid grid-cols-5 gap-1 mt-2">
        {([1, 2, 3, 4, 5] as CipherTier[]).map((tier) => {
          const tierInfo = TIER_INFO[tier];
          const isSelected = tier === value;
          const accessible = canAccessTier(tier);

          return (
            <button
              key={tier}
              onClick={() => handleTierChange(tier)}
              disabled={disabled}
              className={`
                text-center p-2 rounded-lg transition-all
                ${isSelected
                  ? 'bg-zinc-800 border border-zinc-600'
                  : 'hover:bg-zinc-800/50 border border-transparent'
                }
                ${!accessible && !isSelected ? 'opacity-50' : ''}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`text-[10px] font-medium ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                {tierInfo.name}
              </div>
              {renderBadges(tier)}
            </button>
          );
        })}
      </div>

      {/* Upgrade prompt for locked tiers */}
      {!canAccessTier(value) && (
        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-3">
          <p className="text-sm text-zinc-300">
            {TIER_INFO[value].requiredPlan === 'max' ? (
              <>Tier {value} requires a <span className="text-amber-400 font-medium">Max</span> plan.</>
            ) : (
              <>Tier {value} requires a <span className="text-indigo-400 font-medium">Pro</span> or <span className="text-amber-400 font-medium">Max</span> plan.</>
            )}
          </p>
          <button
            onClick={() => router.push('/home/pricing')}
            className="mt-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            View pricing →
          </button>
        </div>
      )}
    </div>
  );
}
