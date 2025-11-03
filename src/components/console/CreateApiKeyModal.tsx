"use client";

import React, { useState } from 'react';
import { X, Copy, Check, AlertCircle } from 'lucide-react';

interface CreateApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (key: any) => void;
}

export default function CreateApiKeyModal({ isOpen, onClose, onSuccess }: CreateApiKeyModalProps) {
  const [step, setStep] = useState<'create' | 'reveal'>('create');
  const [keyName, setKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    // TODO: Call API to create key
    const newKey = `sk_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setGeneratedKey(newKey);
    setStep('reveal');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    onSuccess({ name: keyName, key: generatedKey });
    // Reset state
    setStep('create');
    setKeyName('');
    setGeneratedKey('');
    setCopied(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-xl shadow-2xl"
        style={{
          backgroundColor: 'var(--surbee-bg-primary)',
          border: '1px solid var(--surbee-border-primary)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--surbee-border-primary)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
            {step === 'create' ? 'Create API Key' : 'Your API Key'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-opacity-80 transition-colors"
            style={{ color: 'var(--surbee-fg-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {step === 'create' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                  Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  className="w-full px-4 py-2 rounded-lg border text-sm transition-all"
                  style={{
                    backgroundColor: 'var(--surbee-input-background)',
                    borderColor: 'var(--surbee-input-border)',
                    color: 'var(--surbee-fg-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--surbee-input-focus)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--surbee-input-border)';
                  }}
                  autoFocus
                />
                <p className="text-xs mt-2" style={{ color: 'var(--surbee-fg-muted)' }}>
                  A descriptive name for your API key
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--surbee-accent-subtle)', borderLeft: '3px solid var(--surbee-accent-primary)' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--surbee-accent-primary)' }} />
                <p className="text-xs" style={{ color: 'var(--surbee-fg-primary)' }}>
                  Keep your API key secure. Don't share it in publicly accessible areas such as GitHub, client-side code, etc.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surbee-bg-secondary)', border: '1px solid var(--surbee-border-primary)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                    {keyName}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: copied ? 'var(--surbee-semantic-successSubtle)' : 'var(--surbee-accent-subtle)',
                      color: copied ? 'var(--surbee-semantic-success)' : 'var(--surbee-accent-primary)',
                    }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <code className="text-sm font-mono break-all" style={{ color: 'var(--surbee-fg-primary)' }}>
                  {generatedKey}
                </code>
              </div>

              <div className="flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--surbee-semantic-warningSubtle)', borderLeft: '3px solid var(--surbee-semantic-warning)' }}>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--surbee-semantic-warning)' }} />
                <div className="text-xs" style={{ color: 'var(--surbee-fg-primary)' }}>
                  <p className="font-semibold mb-1">Important: Save this key now</p>
                  <p style={{ color: 'var(--surbee-fg-muted)' }}>
                    You won't be able to see this key again. Make sure to copy it to a safe place.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'var(--surbee-border-primary)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: 'var(--surbee-bg-secondary)',
              color: 'var(--surbee-fg-primary)',
              border: '1px solid var(--surbee-border-primary)'
            }}
          >
            Cancel
          </button>
          {step === 'create' ? (
            <button
              onClick={handleCreate}
              disabled={!keyName.trim()}
              className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--surbee-accent-primary)',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                if (keyName.trim()) {
                  e.currentTarget.style.backgroundColor = 'var(--surbee-accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surbee-accent-primary)';
              }}
            >
              Create Key
            </button>
          ) : (
            <button
              onClick={handleDone}
              className="px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: 'var(--surbee-accent-primary)',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surbee-accent-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surbee-accent-primary)';
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
