'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Lock, Unlock, Sparkles, RotateCcw, Undo, Redo } from 'lucide-react';
import { useSurveyStore } from '@/lib/surbee/store';
import type { DNAMix } from '@/lib/surbee/types';
import { debounce } from 'lodash';

interface DesignDNAEditorProps {
  className?: string;
}

export function DesignDNAEditor({ className }: DesignDNAEditorProps) {
  const { currentDNA, updateDNA, undo, redo, suggestAlternatives } =
    useSurveyStore();
  const [lockedProperties, setLockedProperties] = useState<Set<keyof DNAMix>>(
    new Set(),
  );
  const [localDNA, setLocalDNA] = useState<DNAMix>(currentDNA);

  // Debounced DNA update to ensure 60fps
  const debouncedUpdateDNA = useCallback(
    debounce((newDNA: DNAMix) => {
      updateDNA(newDNA);
    }, 200),
    [updateDNA],
  );

  const handleDNAChange = (property: keyof DNAMix, value: number) => {
    if (lockedProperties.has(property)) return;

    const newDNA = { ...localDNA, [property]: value };
    setLocalDNA(newDNA);
    debouncedUpdateDNA(newDNA);
  };

  const toggleLock = (property: keyof DNAMix) => {
    const newLocked = new Set(lockedProperties);
    if (newLocked.has(property)) {
      newLocked.delete(property);
    } else {
      newLocked.add(property);
    }
    setLockedProperties(newLocked);
  };

  const resetDNA = () => {
    const defaultDNA: DNAMix = {
      Academic: 30,
      TypeformPro: 20,
      Corporate: 20,
      Minimalist: 15,
      Playful: 15,
    };
    setLocalDNA(defaultDNA);
    updateDNA(defaultDNA);
  };

  const dnaProfiles: Array<{
    key: keyof DNAMix;
    label: string;
    color: string;
  }> = [
    { key: 'Academic', label: 'Academic', color: '#1a1a1a' },
    { key: 'TypeformPro', label: 'Typeform Pro', color: '#4f46e5' },
    { key: 'Corporate', label: 'Corporate', color: '#2563eb' },
    { key: 'Minimalist', label: 'Minimalist', color: '#000000' },
    { key: 'Playful', label: 'Playful', color: '#f59e0b' },
  ];

  return (
    <div className={`bg-white border-l border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Design DNA</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={undo}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
          <button
            onClick={resetDNA}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* DNA Mixers */}
        {dnaProfiles.map(({ key, label, color }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-medium text-gray-700">
                  {label}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500 w-8 text-right">
                  {localDNA[key]}%
                </span>
                <button
                  onClick={() => toggleLock(key)}
                  className={`p-1 rounded transition-colors ${
                    lockedProperties.has(key)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title={lockedProperties.has(key) ? 'Unlock' : 'Lock'}
                >
                  {lockedProperties.has(key) ? (
                    <Lock className="w-3 h-3" />
                  ) : (
                    <Unlock className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={localDNA[key]}
                onChange={(e) => handleDNAChange(key, parseInt(e.target.value))}
                disabled={lockedProperties.has(key)}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  lockedProperties.has(key)
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                style={{
                  backgroundColor: '#e5e7eb',
                  accentColor: color,
                }}
              />
              <div
                className="absolute top-0 left-0 h-2 rounded-lg transition-all duration-200"
                style={{
                  width: `${localDNA[key]}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </motion.div>
        ))}

        {/* Total Percentage Indicator */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total</span>
            <span
              className={`font-medium ${
                Object.values(localDNA).reduce((sum, val) => sum + val, 0) ===
                100
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {Object.values(localDNA).reduce((sum, val) => sum + val, 0)}%
            </span>
          </div>
        </div>

        {/* Suggest Alternatives */}
        <div className="pt-4">
          <button
            onClick={suggestAlternatives}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            <span>Suggest Alternatives</span>
          </button>
        </div>

        {/* Real-time Preview */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Style Preview
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>
                Spacing:{' '}
                {Math.round(
                  localDNA.Academic * 0.08 +
                    localDNA.TypeformPro * 0.16 +
                    localDNA.Corporate * 0.12 +
                    localDNA.Minimalist * 0.04 +
                    localDNA.Playful * 0.2,
                )}
                px
              </span>
              <span>
                Radius:{' '}
                {Math.round(
                  localDNA.Academic * 0.02 +
                    localDNA.TypeformPro * 0.12 +
                    localDNA.Corporate * 0.06 +
                    localDNA.Minimalist * 0.0 +
                    localDNA.Playful * 0.16,
                )}
                px
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span>
                Shadow:{' '}
                {localDNA.TypeformPro > 50 || localDNA.Playful > 50
                  ? 'Large'
                  : localDNA.Corporate > 50
                    ? 'Medium'
                    : 'None'}
              </span>
              <span>Font: {localDNA.Academic > 50 ? 'Serif' : 'Sans'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
