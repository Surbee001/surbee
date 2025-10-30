'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Star, Heart, ThumbsUp } from 'lucide-react';
import type { RatingAtom as RatingAtomType } from './types';

interface RatingAtomProps {
  atom: RatingAtomType;
  value?: number;
  onChange?: (value: number) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  className?: string;
  isEditing?: boolean;
  onEdit?: (atom: RatingAtomType) => void;
}

export function RatingAtom({
  atom,
  value = 0,
  onChange,
  onValidation,
  className,
  isEditing = false,
  onEdit,
}: RatingAtomProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [hoverValue, setHoverValue] = useState(0);

  const validateField = (inputValue: number) => {
    const newErrors: string[] = [];

    if (atom.validation) {
      atom.validation.forEach((rule) => {
        switch (rule.type) {
          case 'required': {
            if (inputValue === 0) {
              newErrors.push(rule.message || 'This field is required');
            }
            break;
          }
          case 'min': {
            if (inputValue < (rule.value || 0)) {
              newErrors.push(
                rule.message || `Minimum rating of ${rule.value} required`,
              );
            }
            break;
          }
        }
      });
    }

    setErrors(newErrors);
    onValidation?.(newErrors.length === 0, newErrors);
    return newErrors.length === 0;
  };

  const handleClick = (rating: number) => {
    if (isEditing) return;
    onChange?.(rating);
    validateField(rating);
  };

  const handleMouseEnter = (rating: number) => {
    if (isEditing) return;
    setHoverValue(rating);
  };

  const handleMouseLeave = () => {
    if (isEditing) return;
    setHoverValue(0);
  };

  const getIcon = () => {
    switch (atom.icon) {
      case 'heart':
        return Heart;
      case 'thumbs':
        return ThumbsUp;
      case 'star':
      default:
        return Star;
    }
  };

  const IconComponent = getIcon();

  const getLayoutClass = () => {
    switch (atom.layout) {
      case 'horizontal':
        return 'flex-row';
      case 'grid':
        return 'grid grid-cols-5 gap-2';
      case 'vertical':
      default:
        return 'flex-col';
    }
  };

  return (
    <div
      className={cn('space-y-2', className)}
      style={atom.styling}
      onClick={() => isEditing && onEdit?.(atom)}
    >
      {atom.label && (
        <Label
          htmlFor={atom.id}
          className={cn(
            'text-sm font-medium text-white',
            atom.required &&
              'after:content-["*"] after:ml-0.5 after:text-red-400',
          )}
          style={{
            color: atom.styling?.color || '#ffffff',
            fontFamily: atom.styling?.fontFamily,
            fontSize: atom.styling?.fontSize,
            fontWeight: atom.styling?.fontWeight,
          }}
        >
          {atom.label}
        </Label>
      )}

      <div className={cn('flex items-center gap-1', getLayoutClass())}>
        {Array.from({ length: atom.maxRating }, (_, index) => {
          const rating = index + 1;
          const isActive = hoverValue >= rating || value >= rating;
          const isHovered = hoverValue === rating;

          return (
            <button
              key={rating}
              type="button"
              onClick={() => handleClick(rating)}
              onMouseEnter={() => handleMouseEnter(rating)}
              onMouseLeave={handleMouseLeave}
              disabled={isEditing}
              className={cn(
                'transition-all duration-200 p-1 rounded',
                isActive && 'text-yellow-500',
                !isActive && 'text-gray-400',
                isHovered && 'scale-110',
                isEditing && 'cursor-pointer hover:ring-2 hover:ring-blue-300',
                !isEditing && 'hover:scale-110',
              )}
              style={{
                color: isActive ? '#fbbf24' : atom.styling?.color || '#9ca3af',
                fontSize: atom.styling?.fontSize || '1.5rem',
              }}
            >
              <IconComponent
                size={
                  atom.styling?.fontSize
                    ? Number.parseInt(atom.styling.fontSize, 10)
                    : 24
                }
                fill={isActive ? 'currentColor' : 'none'}
              />
            </button>
          );
        })}
      </div>

      {atom.showLabels && atom.labels && (
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          {atom.labels.map((label, index) => (
            <span
              key={`${atom.id}-label-${index}`}
              className="text-center"
              style={{ fontFamily: atom.styling?.fontFamily }}
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p
              key={`${atom.id}-error-${index}`}
              className="text-sm text-red-400"
              style={{ fontFamily: atom.styling?.fontFamily }}
            >
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
