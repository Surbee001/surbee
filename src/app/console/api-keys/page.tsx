"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Key, Copy, Trash2, MoreVertical, Eye, EyeOff, AlertCircle } from 'lucide-react';
import CreateApiKeyModal from '@/components/console/CreateApiKeyModal';

// Mock data - replace with actual API calls
const mockApiKeys = [
  {
    id: '1',
    name: 'Production API Key',
    prefix: 'sk_live_abc123',
    created: '2024-01-15',
    lastUsed: '2 hours ago',
    requests: 1420
  },
  {
    id: '2',
    name: 'Development Key',
    prefix: 'sk_test_def456',
    created: '2024-01-10',
    lastUsed: '5 days ago',
    requests: 342
  },
  {
    id: '3',
    name: 'Staging Environment',
    prefix: 'sk_test_ghi789',
    created: '2024-01-05',
    lastUsed: 'Never',
    requests: 0
  },
];

export default function ApiKeysPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState(mockApiKeys);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const handleCreateApiKey = () => {
    setIsModalOpen(true);
  };

  const handleApiKeyCreated = (newKey: any) => {
    // TODO: Add new key to list
    setIsModalOpen(false);
  };

  const handleCopyKey = (prefix: string) => {
    navigator.clipboard.writeText(prefix);
    // TODO: Show toast notification
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.filter(key => key.id !== id));
      // TODO: Call API to delete key
    }
  };

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  const maskKey = (prefix: string, isVisible: boolean) => {
    if (isVisible) return prefix;
    const parts = prefix.split('_');
    if (parts.length >= 3) {
      return `${parts[0]}_${parts[1]}_${'•'.repeat(parts[2].length)}`;
    }
    return '•'.repeat(prefix.length);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
            API Keys
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--surbee-fg-muted)' }}>
            Manage your API keys for accessing Surbee services
          </p>
        </div>
        <button
          onClick={handleCreateApiKey}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
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
          <Key className="w-4 h-4" />
          Create New Key
        </button>
      </div>

      {/* Warning Banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: 'var(--surbee-accent-subtle)', border: '1px solid var(--surbee-border-primary)' }}>
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--surbee-accent-primary)' }} />
        <div className="text-sm">
          <p className="font-semibold mb-1" style={{ color: 'var(--surbee-fg-primary)' }}>
            Keep your API keys secure
          </p>
          <p style={{ color: 'var(--surbee-fg-muted)' }}>
            Your API keys carry many privileges. Keep them secure and don't share them in publicly accessible areas.
            If a key is compromised, delete it immediately and create a new one.
          </p>
        </div>
      </div>

      {/* API Keys List */}
      {apiKeys.length === 0 ? (
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Key className="w-16 h-16 mb-4" style={{ color: 'var(--surbee-fg-muted)', opacity: 0.5 }} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
              No API keys yet
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--surbee-fg-muted)' }}>
              Create your first API key to start using the Surbee API
            </p>
            <button
              onClick={handleCreateApiKey}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: 'var(--surbee-accent-primary)',
                color: '#ffffff',
              }}
            >
              <Key className="w-4 h-4" />
              Create API Key
            </button>
          </CardContent>
        </Card>
      ) : (
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surbee-border-primary)' }}>
                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                      Name
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                      Key
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                      Created
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                      Last Used
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                      Requests
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((key, index) => (
                    <tr
                      key={key.id}
                      style={{
                        borderBottom: index < apiKeys.length - 1 ? '1px solid var(--surbee-border-primary)' : 'none'
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4" style={{ color: 'var(--surbee-fg-muted)' }} />
                          <span className="font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                            {key.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono" style={{ color: 'var(--surbee-fg-primary)' }}>
                            {maskKey(key.prefix, visibleKeys.has(key.id))}
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="p-1 hover:opacity-70 transition-opacity"
                            style={{ color: 'var(--surbee-fg-muted)' }}
                          >
                            {visibleKeys.has(key.id) ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
                        {key.created}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
                        {key.lastUsed}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
                        {key.requests.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopyKey(key.prefix)}
                            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                            style={{ color: 'var(--surbee-fg-muted)' }}
                            title="Copy key"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteKey(key.id)}
                            className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                            style={{ color: 'var(--surbee-semantic-error)' }}
                            title="Delete key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <CreateApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleApiKeyCreated}
      />
    </div>
  );
}
