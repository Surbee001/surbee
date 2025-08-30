'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Palette,
  Eye,
  Code,
  Download,
  Save,
  Settings,
  ChevronDown,
  MoveUp,
  MoveDown,
  Trash2,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AtomRenderer } from './atoms/AtomRenderer';
import { AtomCategories } from './AtomCategories';
import type { LyraForm, AnyAtom } from './atoms/types';

interface LyraFormBuilderProps {
  form: LyraForm;
  onFormChange: (form: LyraForm) => void;
  isEditing?: boolean;
}

export function LyraFormBuilder({
  form,
  onFormChange,
  isEditing = false,
}: LyraFormBuilderProps) {
  const [selectedAtom, setSelectedAtom] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [showAtomCategories, setShowAtomCategories] = useState(false);

  const validateForm = () => {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    form.atoms.forEach((atom) => {
      const atomErrors: string[] = [];
      const value = formValues[atom.id];

      if (atom.required && (!value || value === '')) {
        atomErrors.push('This field is required');
        isValid = false;
      }

      if (atom.validation) {
        atom.validation.forEach((rule) => {
          switch (rule.type) {
            case 'email':
              if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                atomErrors.push(rule.message || 'Please enter a valid email');
                isValid = false;
              }
              break;
            case 'min':
              if (value && value.length < (rule.value as number)) {
                atomErrors.push(
                  rule.message || `Minimum ${rule.value} characters required`,
                );
                isValid = false;
              }
              break;
            case 'max':
              if (value && value.length > (rule.value as number)) {
                atomErrors.push(
                  rule.message || `Maximum ${rule.value} characters allowed`,
                );
                isValid = false;
              }
              break;
            case 'pattern':
              if (
                value &&
                rule.value &&
                !new RegExp(rule.value as string).test(value)
              ) {
                atomErrors.push(rule.message || 'Invalid format');
                isValid = false;
              }
              break;
          }
        });
      }

      if (atomErrors.length > 0) {
        errors[atom.id] = atomErrors;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleAtomChange = (atomId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [atomId]: value }));
  };

  const handleAtomValidation = (atomId: string, errors: string[]) => {
    setFormErrors((prev) => ({ ...prev, [atomId]: errors }));
  };

  const addAtom = (atomType: string) => {
    const newAtom: AnyAtom = {
      id: `atom-${Date.now()}`,
      type: atomType,
      label: `New ${atomType.replace('-', ' ')}`,
      placeholder: `Enter ${atomType.replace('-', ' ')}`,
      required: false,
      validation: [],
      styling: {},
      logic: [],
      metadata: {},
    };

    const updatedForm = {
      ...form,
      atoms: [...form.atoms, newAtom],
    };

    onFormChange(updatedForm);
    setShowAtomCategories(false);
  };

  const updateAtom = (atomId: string, updates: Partial<AnyAtom>) => {
    const updatedForm = {
      ...form,
      atoms: form.atoms.map((atom) =>
        atom.id === atomId ? { ...atom, ...updates } : atom,
      ),
    };
    onFormChange(updatedForm);
  };

  const deleteAtom = (atomId: string) => {
    const updatedForm = {
      ...form,
      atoms: form.atoms.filter((atom) => atom.id !== atomId),
    };
    onFormChange(updatedForm);
    setSelectedAtom(null);
  };

  const moveAtom = (atomId: string, direction: 'up' | 'down') => {
    const currentIndex = form.atoms.findIndex((atom) => atom.id === atomId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= form.atoms.length) return;

    const newAtoms = [...form.atoms];
    [newAtoms[currentIndex], newAtoms[newIndex]] = [
      newAtoms[newIndex],
      newAtoms[currentIndex],
    ];

    const updatedForm = {
      ...form,
      atoms: newAtoms,
    };
    onFormChange(updatedForm);
  };

  const updateTheme = (theme: Partial<LyraForm['theme']>) => {
    const updatedForm = {
      ...form,
      theme: { ...form.theme, ...theme },
    };
    onFormChange(updatedForm);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted:', formValues);
      // Handle form submission
    }
  };

  const exportForm = () => {
    const formData = {
      form,
      values: formValues,
      errors: formErrors,
    };
    console.log('Exporting form:', formData);
    // Handle form export
  };

  return (
    <div className="h-full flex flex-col">
      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Form Title and Description */}
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    onFormChange({ ...form, title: e.target.value })
                  }
                  placeholder="Form Title"
                  className="text-2xl font-bold border-0 p-0 focus:ring-0 bg-transparent text-white placeholder-gray-400"
                />
              </div>
              <div>
                <Textarea
                  value={form.description || ''}
                  onChange={(e) =>
                    onFormChange({ ...form, description: e.target.value })
                  }
                  placeholder="Form description (optional)"
                  className="border-0 p-0 resize-none focus:ring-0 bg-transparent text-white placeholder-gray-400"
                  rows={2}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">{form.title}</h1>
              {form.description && (
                <p className="text-gray-400">{form.description}</p>
              )}
            </div>
          )}

          <Separator className="bg-zinc-700" />

          {/* Form Atoms */}
          <div className="space-y-4">
            {form.atoms.map((atom, index) => (
              <motion.div
                key={atom.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`relative group ${
                  selectedAtom === atom.id && isEditing
                    ? 'ring-2 ring-purple-500 rounded-lg'
                    : ''
                }`}
              >
                <AtomRenderer
                  atom={atom}
                  value={formValues[atom.id]}
                  onChange={(value) => handleAtomChange(atom.id, value)}
                  onValidation={(errors) =>
                    handleAtomValidation(atom.id, errors)
                  }
                  isEditing={isEditing}
                  onEdit={() => setSelectedAtom(atom.id)}
                />

                {/* Error Messages */}
                {formErrors[atom.id] && formErrors[atom.id].length > 0 && (
                  <div className="mt-2 space-y-1">
                    {formErrors[atom.id].map((error, errorIndex) => (
                      <p
                        key={`${atom.id}-error-${errorIndex}`}
                        className="text-sm text-red-400"
                      >
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Submit Button */}
          {!isEditing && (
            <div className="pt-6">
              <Button onClick={handleSubmit} className="w-full" size="lg">
                Submit Form
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
