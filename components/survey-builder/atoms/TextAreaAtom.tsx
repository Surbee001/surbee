'use client';

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { TextAreaAtom as TextAreaAtomType } from './types';

interface TextAreaAtomProps {
  atom: TextAreaAtomType;
  value?: string;
  onChange?: (value: string) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  className?: string;
  isEditing?: boolean;
  onEdit?: (atom: TextAreaAtomType) => void;
}

export function TextAreaAtom({
  atom,
  value = '',
  onChange,
  onValidation,
  className,
  isEditing = false,
  onEdit,
}: TextAreaAtomProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const validateField = (inputValue: string) => {
    const newErrors: string[] = [];

    if (atom.validation) {
      atom.validation.forEach((rule) => {
        switch (rule.type) {
          case 'required':
            if (!inputValue.trim()) {
              newErrors.push(rule.message || 'This field is required');
            }
            break;
          case 'min': {
            if (inputValue.length < (rule.value || 0)) {
              newErrors.push(
                rule.message || `Minimum ${rule.value} characters required`,
              );
            }
            break;
          }
          case 'max': {
            if (inputValue.length > (rule.value || 0)) {
              newErrors.push(
                rule.message || `Maximum ${rule.value} characters allowed`,
              );
            }
            break;
          }
          case 'pattern': {
            if (rule.value && !new RegExp(rule.value).test(inputValue)) {
              newErrors.push(rule.message || 'Invalid format');
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

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange?.(newValue);
    validateField(newValue);
  };

  const handleBlur = () => {
    setIsFocused(false);
    validateField(value);
  };

  const handleFocus = () => {
    setIsFocused(true);
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

      <Textarea
        id={atom.id}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={atom.placeholder}
        rows={atom.rows || 4}
        maxLength={atom.maxLength}
        minLength={atom.minLength}
        required={atom.required}
        className={cn(
          'transition-all duration-200 resize-none bg-[#2d2f2f] border-zinc-600 text-white placeholder-gray-400',
          errors.length > 0 && 'border-red-500 focus:border-red-500',
          isFocused && 'ring-2 ring-blue-500 ring-opacity-50',
          isEditing && 'cursor-pointer hover:ring-2 hover:ring-blue-300',
        )}
        style={{
          backgroundColor: atom.styling?.backgroundColor || '#2d2f2f',
          color: atom.styling?.color || '#ffffff',
          borderColor: atom.styling?.borderColor || '#52525b',
          borderRadius: atom.styling?.borderRadius,
          borderWidth: atom.styling?.borderWidth,
          borderStyle: atom.styling?.borderStyle,
          padding: atom.styling?.padding,
          margin: atom.styling?.margin,
          width: atom.styling?.width,
          height: atom.styling?.height,
          fontFamily: atom.styling?.fontFamily,
          fontSize: atom.styling?.fontSize,
          fontWeight: atom.styling?.fontWeight,
          textAlign: atom.styling?.textAlign,
          boxShadow: atom.styling?.boxShadow,
          opacity: atom.styling?.opacity,
        }}
      />

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
