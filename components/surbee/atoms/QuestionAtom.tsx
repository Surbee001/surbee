'use client';

import React from 'react';
import { clsx } from 'clsx';
import type { AtomStyle } from '@/lib/surbee/types';

interface QuestionAtomProps {
  style: AtomStyle;
  content: string;
  type: 'text-input' | 'rating' | 'multiple-choice' | 'slider' | 'textarea';
  options?: string[];
  placeholder?: string;
  required?: boolean;
  id: string;
  onUpdate?: (id: string, props: Partial<QuestionAtomProps>) => void;
}

export function QuestionAtom({
  style,
  content,
  type,
  options = [],
  placeholder,
  required = false,
  id,
  onUpdate,
}: QuestionAtomProps) {
  const getFontClass = (font: string) => {
    switch (font) {
      case 'serif':
        return 'font-serif';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-sans';
    }
  };

  const getShadowClass = (shadow: string) => {
    switch (shadow) {
      case 'sm':
        return 'shadow-sm';
      case 'md':
        return 'shadow-md';
      case 'lg':
        return 'shadow-lg';
      default:
        return '';
    }
  };

  const containerClasses = clsx(
    'w-full transition-all duration-200',
    `p-[${style.spacing}px]`,
    `rounded-[${style.radius}px]`,
    getShadowClass(style.shadow),
    getFontClass(style.font),
  );

  const containerStyle = {
    backgroundColor: style.palette.background,
    color: style.palette.text,
    borderColor: style.palette.secondary,
  };

  const renderInput = () => {
    switch (type) {
      case 'text-input':
        return (
          <input
            type="text"
            placeholder={placeholder || 'Enter your answer...'}
            className="w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2"
            style={{
              borderColor: style.palette.secondary,
              backgroundColor: style.palette.background,
              color: style.palette.text,
            }}
          />
        );

      case 'textarea':
        return (
          <textarea
            placeholder={placeholder || 'Enter your answer...'}
            rows={4}
            className="w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 resize-none"
            style={{
              borderColor: style.palette.secondary,
              backgroundColor: style.palette.background,
              color: style.palette.text,
            }}
          />
        );

      case 'rating':
        return (
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium hover:opacity-80 transition-opacity"
                style={{
                  borderColor: style.palette.primary,
                  color: style.palette.primary,
                }}
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case 'multiple-choice':
        return (
          <div className="space-y-2">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded border-2"
                  style={{ borderColor: style.palette.primary }}
                />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                backgroundColor: style.palette.secondary,
                accentColor: style.palette.primary,
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={containerClasses} style={containerStyle}>
      <div
        className="text-lg font-semibold mb-3"
        style={{ color: style.palette.primary }}
      >
        {content}
        {required && <span style={{ color: style.palette.secondary }}> *</span>}
      </div>
      {renderInput()}
    </div>
  );
}
