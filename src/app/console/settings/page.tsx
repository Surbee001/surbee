"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Users, Webhook, Shield, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ConsoleSettingsPage() {
  const { user } = useAuth();
  const [organizationName, setOrganizationName] = useState('My Organization');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [rateLimit, setRateLimit] = useState('1000');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = () => {
    // TODO: Save settings
    console.log('Saving settings...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
            Settings
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--surbee-fg-muted)' }}>
            Manage your organization and API settings
          </p>
        </div>
      </div>

      {/* Organization Settings */}
      <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" style={{ color: 'var(--surbee-accent-primary)' }} />
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Organization</CardTitle>
          </div>
          <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
            Basic information about your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
              Organization Name
            </label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--surbee-input-background)',
                borderColor: 'var(--surbee-input-border)',
                color: 'var(--surbee-fg-primary)'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
              Organization ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={user?.uid || 'loading...'}
                readOnly
                className="flex-1 px-4 py-2 rounded-lg border text-sm font-mono"
                style={{
                  backgroundColor: 'var(--surbee-bg-secondary)',
                  borderColor: 'var(--surbee-border-primary)',
                  color: 'var(--surbee-fg-primary)'
                }}
              />
              <button
                onClick={() => navigator.clipboard.writeText(user?.uid || '')}
                className="px-4 py-2 rounded-lg border text-sm font-medium transition-colors"
                style={{
                  backgroundColor: 'var(--surbee-bg-primary)',
                  borderColor: 'var(--surbee-border-primary)',
                  color: 'var(--surbee-fg-primary)'
                }}
              >
                Copy
              </button>
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--surbee-fg-muted)' }}>
              Use this ID for support requests and integrations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Settings */}
      <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="w-5 h-5" style={{ color: 'var(--surbee-accent-primary)' }} />
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Webhooks</CardTitle>
          </div>
          <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
            Configure webhooks to receive real-time notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
              Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-domain.com/webhook"
              className="w-full px-4 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--surbee-input-background)',
                borderColor: 'var(--surbee-input-border)',
                color: 'var(--surbee-fg-primary)'
              }}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--surbee-fg-muted)' }}>
              We'll send POST requests to this URL for events
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
              Events to Subscribe
            </label>
            <div className="space-y-2">
              {[
                { id: 'survey.created', label: 'Survey Created' },
                { id: 'response.received', label: 'Response Received' },
                { id: 'project.updated', label: 'Project Updated' },
                { id: 'key.revoked', label: 'API Key Revoked' },
              ].map((event) => (
                <label key={event.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded"
                    style={{
                      accentColor: 'var(--surbee-accent-primary)'
                    }}
                  />
                  <span className="text-sm" style={{ color: 'var(--surbee-fg-primary)' }}>
                    {event.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rate Limiting */}
      <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: 'var(--surbee-accent-primary)' }} />
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Rate Limiting</CardTitle>
          </div>
          <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
            Configure rate limits for your API keys
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
              Requests per Minute
            </label>
            <input
              type="number"
              value={rateLimit}
              onChange={(e) => setRateLimit(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--surbee-input-background)',
                borderColor: 'var(--surbee-input-border)',
                color: 'var(--surbee-fg-primary)'
              }}
            />
            <p className="text-xs mt-2" style={{ color: 'var(--surbee-fg-muted)' }}>
              Maximum number of API requests allowed per minute
            </p>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--surbee-accent-subtle)', border: '1px solid var(--surbee-border-primary)' }}>
            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--surbee-accent-primary)' }} />
            <div className="text-sm">
              <p className="font-semibold mb-1" style={{ color: 'var(--surbee-fg-primary)' }}>
                Rate Limiting Best Practices
              </p>
              <p style={{ color: 'var(--surbee-fg-muted)' }}>
                Set appropriate rate limits to prevent abuse while ensuring your application has the resources it needs.
                Requests exceeding the limit will receive a 429 Too Many Requests response.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5" style={{ color: 'var(--surbee-accent-primary)' }} />
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Notifications</CardTitle>
          </div>
          <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
            Manage email notifications for important events
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--surbee-fg-primary)' }}>
                Usage Alerts
              </p>
              <p className="text-xs" style={{ color: 'var(--surbee-fg-muted)' }}>
                Get notified when you reach 80% of your rate limit
              </p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                notificationsEnabled ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  notificationsEnabled ? 'transform translate-x-5' : 'transform translate-x-0.5'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--surbee-fg-primary)' }}>
                Security Alerts
              </p>
              <p className="text-xs" style={{ color: 'var(--surbee-fg-muted)' }}>
                Get notified about suspicious API activity
              </p>
            </div>
            <button
              className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 bg-blue-500`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform transform translate-x-5`}></div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg font-medium text-sm transition-all"
          style={{
            backgroundColor: 'var(--surbee-accent-primary)',
            color: '#ffffff'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surbee-accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surbee-accent-primary)';
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
