'use client';

import React from 'react';
import { TextInputAtom } from './TextInputAtom';
import { TextAreaAtom } from './TextAreaAtom';
import { SelectAtom } from './SelectAtom';
import { RatingAtom } from './RatingAtom';
import type { AnyAtom } from './types';

interface AtomRendererProps {
  atom: AnyAtom;
  value?: any;
  onChange?: (value: any) => void;
  onValidation?: (errors: string[]) => void;
  className?: string;
  isEditing?: boolean;
  onEdit?: (atom: AnyAtom) => void;
}

export function AtomRenderer({
  atom,
  value,
  onChange,
  onValidation,
  className,
  isEditing = false,
  onEdit,
}: AtomRendererProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(atom);
    }
  };

  const renderPlaceholder = (type: string) => (
    <div
      className={`p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 ${
        isEditing ? 'cursor-pointer hover:border-purple-400' : ''
      } ${className || ''}`}
      onClick={isEditing ? handleEdit : undefined}
    >
      <div className="text-center">
        <div className="text-sm font-medium text-gray-600 mb-1">
          {atom.label ||
            type.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </div>
        <div className="text-xs text-gray-400">
          {isEditing ? 'Click to edit' : 'Component coming soon'}
        </div>
      </div>
    </div>
  );

  switch (atom.type) {
    case 'text-input':
      return (
        <TextInputAtom
          atom={atom}
          value={value}
          onChange={onChange}
          onValidation={onValidation}
          className={className}
          isEditing={isEditing}
          onEdit={onEdit}
        />
      );

    case 'text-area':
      return (
        <TextAreaAtom
          atom={atom}
          value={value}
          onChange={onChange}
          onValidation={onValidation}
          className={className}
          isEditing={isEditing}
          onEdit={onEdit}
        />
      );

    case 'select':
      return (
        <SelectAtom
          atom={atom}
          value={value}
          onChange={onChange}
          onValidation={onValidation}
          className={className}
          isEditing={isEditing}
          onEdit={onEdit}
        />
      );

    case 'rating':
      return (
        <RatingAtom
          atom={atom}
          value={value}
          onChange={onChange}
          onValidation={onValidation}
          className={className}
          isEditing={isEditing}
          onEdit={onEdit}
        />
      );

    // ===== RECOMMENDED ATOMS =====
    case 'video-audio':
    case 'short-text':
    case 'multiple-choice':
      return renderPlaceholder(atom.type);

    // ===== CONNECT TO APPS ATOMS =====
    case 'hubspot':
    case 'browse-apps':
      return renderPlaceholder(atom.type);

    // ===== CONTACT ATOMS =====
    case 'contact-info':
    case 'email':
    case 'phone':
    case 'address':
    case 'website':
      return renderPlaceholder(atom.type);

    // ===== TEXT/VIDEO ATOMS =====
    case 'long-text':
    case 'clarify-ai':
    case 'faq-ai':
      return renderPlaceholder(atom.type);

    // ===== CHOICE ATOMS =====
    case 'dropdown':
    case 'picture-choice':
    case 'yes-no':
    case 'legal':
    case 'checkbox':
    case 'radio-group':
    case 'checkbox-group':
      return renderPlaceholder(atom.type);

    // ===== RATING ATOMS =====
    case 'nps':
    case 'opinion-scale':
    case 'ranking':
    case 'matrix':
      return renderPlaceholder(atom.type);

    // ===== OTHER ATOMS =====
    case 'number':
    case 'date':
    case 'payment':
    case 'file-upload':
    case 'google-drive':
    case 'calendly':
    case 'slider':
    case 'date-picker':
      return renderPlaceholder(atom.type);

    // ===== WELCOME ATOMS =====
    case 'partial-submit':
    case 'statement':
    case 'question-group':
    case 'multi-page':
    case 'end-screen':
    case 'redirect':
      return renderPlaceholder(atom.type);

    // ===== LAYOUT ATOMS =====
    case 'image':
    case 'divider':
    case 'spacer':
    case 'container':
    case 'heading':
    case 'paragraph':
    case 'button':
    case 'progress':
    case 'card':
      return renderPlaceholder(atom.type);

    default:
      return (
        <div
          className={`p-4 border border-red-300 rounded-lg bg-red-50 ${className || ''}`}
        >
          <div className="text-center">
            <div className="text-sm font-medium text-red-600 mb-1">
              Unknown Atom Type
            </div>
            <div className="text-xs text-red-400">Type: {atom.type}</div>
          </div>
        </div>
      );
  }
}
