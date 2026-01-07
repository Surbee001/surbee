"use client";

import React from 'react';
import { CIPHER_TIERS, CipherTier, estimateCost } from '@/lib/cipher/tier-config';

interface TierSliderProps {
  value: CipherTier;
  onChange: (tier: CipherTier) => void;
  expectedResponses?: number;
  disabled?: boolean;
}

const TIER_COLORS = {
  1: 'bg-green-500',
  2: 'bg-blue-500',
  3: 'bg-indigo-500',
  4: 'bg-purple-500',
  5: 'bg-red-500',
};

export function TierSlider({
  value,
  onChange,
  expectedResponses = 100,
  disabled = false,
}: TierSliderProps) {
  const tier = CIPHER_TIERS[value];
  const estimatedCost = estimateCost(value, expectedResponses);

  return (
    <div className="space-y-4">
      {/* Tier Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${TIER_COLORS[value]}`} />
          <span className="text-sm font-medium text-white">
            Level {value}: {tier.name}
          </span>
        </div>
        <div className="text-xs text-zinc-400">
          {tier.estimatedCostPerResponse === 0 ? (
            <span className="text-green-400">Free</span>
          ) : (
            <span>~${estimatedCost.toFixed(2)}/100 responses</span>
          )}
        </div>
      </div>

      {/* Slider */}
      <div className="relative pt-1">
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) as CipherTier)}
          disabled={disabled}
          className={`
            w-full h-2 rounded-full appearance-none cursor-pointer
            bg-zinc-700
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-zinc-300
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-zinc-300
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        />
        {/* Tick marks */}
        <div className="flex justify-between mt-1 px-0.5">
          {[1, 2, 3, 4, 5].map((t) => (
            <div
              key={t}
              className={`text-[10px] ${value === t ? 'text-white font-medium' : 'text-zinc-500'}`}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Tier Description */}
      <p className="text-xs text-zinc-400">
        {tier.description}
      </p>

      {/* Tier Breakdown */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-zinc-800/50 rounded-lg p-2">
          <div className="text-zinc-400 mb-1">Checks enabled</div>
          <div className="text-white font-medium">
            {Object.values(tier.checks).flat().length}
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-2">
          <div className="text-zinc-400 mb-1">AI Model</div>
          <div className="text-white font-medium">
            {tier.aiModel || 'None'}
          </div>
        </div>
      </div>

      {/* Tier Legend */}
      <div className="flex flex-wrap gap-2 text-xs">
        {[1, 2, 3, 4, 5].map((t) => (
          <button
            key={t}
            onClick={() => onChange(t as CipherTier)}
            disabled={disabled}
            className={`
              px-2 py-1 rounded-full transition-colors
              ${value === t
                ? `${TIER_COLORS[t as CipherTier]} text-white`
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {CIPHER_TIERS[t as CipherTier].name}
          </button>
        ))}
      </div>
    </div>
  );
}
