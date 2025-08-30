'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SelectAtom as SelectAtomType } from './types';

interface SelectAtomProps {
  atom: SelectAtomType;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  onValidation?: (isValid: boolean, errors: string[]) => void;
  className?: string;
  isEditing?: boolean;
  onEdit?: (atom: SelectAtomType) => void;
}

export function SelectAtom({
  atom,
  value = '',
  onChange,
  onValidation,
  className,
  isEditing = false,
  onEdit,
}: SelectAtomProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateField = (inputValue: string | string[]) => {
    const newErrors: string[] = [];

    if (atom.validation) {
      atom.validation.forEach((rule) => {
        switch (rule.type) {
          case 'required': {
            const isEmpty = Array.isArray(inputValue)
              ? inputValue.length === 0
              : !inputValue || inputValue.trim() === '';
            if (isEmpty) {
              newErrors.push(rule.message || 'This field is required');
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

  const handleChange = (newValue: string) => {
    const finalValue = atom.multiple
      ? Array.isArray(value)
        ? value.includes(newValue)
          ? value.filter((v) => v !== newValue)
          : [...value, newValue]
        : [newValue]
      : newValue;

    onChange?.(finalValue);
    validateField(finalValue);
  };

  const getDisplayValue = () => {
    if (atom.multiple && Array.isArray(value)) {
      return value.length > 0
        ? `${value.length} selected`
        : 'Select options...';
    }
    if (typeof value === 'string' && value) {
      const option = atom.options.find((opt) => opt.value === value);
      return option?.label || value;
    }
    return atom.placeholder || 'Select an option...';
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
            'text-sm font-medium',
            atom.required &&
              'after:content-["*"] after:ml-0.5 after:text-red-500',
          )}
          style={{
            color: atom.styling?.color,
            fontFamily: atom.styling?.fontFamily,
            fontSize: atom.styling?.fontSize,
            fontWeight: atom.styling?.fontWeight,
          }}
        >
          {atom.label}
        </Label>
      )}

      <Select
        value={Array.isArray(value) ? value[0] || '' : value}
        onValueChange={handleChange}
        disabled={isEditing}
      >
        <SelectTrigger
          className={cn(
            'transition-all duration-200',
            errors.length > 0 && 'border-red-500 focus:border-red-500',
            isEditing && 'cursor-pointer hover:ring-2 hover:ring-blue-300',
          )}
          style={{
            backgroundColor: atom.styling?.backgroundColor,
            color: atom.styling?.color,
            borderColor: atom.styling?.borderColor,
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
        >
          <SelectValue placeholder={getDisplayValue()} />
        </SelectTrigger>

        <SelectContent
          style={{
            backgroundColor: atom.styling?.backgroundColor,
            color: atom.styling?.color,
            fontFamily: atom.styling?.fontFamily,
            fontSize: atom.styling?.fontSize,
            fontWeight: atom.styling?.fontWeight,
          }}
        >
          {atom.options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={cn(
                'transition-colors',
                option.disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p
              key={`${atom.id}-error-${index}`}
              className="text-sm text-red-500"
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
