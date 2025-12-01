"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, HelpCircle, Shield, CreditCard, ExternalLink, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Image as IKImage } from '@imagekit/next';
import { toast } from 'sonner';
import { Copy } from 'lucide-react';

const connectors = [
  { name: 'Google Sheets', icon: 'https://ik.imagekit.io/on0moldgr/SurbeeIcons/Sheets?updatedAt=1760287548067', connected: false },
  { name: 'Typeform', icon: 'https://ik.imagekit.io/on0moldgr/SurbeeIcons/typeform?updatedAt=1760287565909', connected: false },
  { name: 'SurveyMonkey', icon: 'https://ik.imagekit.io/on0moldgr/SurbeeIcons/monkey?updatedAt=1760287596302', connected: true },
  { name: 'Notion', icon: 'https://ik.imagekit.io/on0moldgr/SurbeeIcons/notion?updatedAt=1760287621171', connected: false },
  { name: 'Slack', icon: 'https://ik.imagekit.io/on0moldgr/SurbeeIcons/slack?updatedAt=1760287639779', connected: false },
  { name: 'Zapier', icon: 'https://ik.imagekit.io/on0moldgr/SurbeeIcons/zapier?updatedAt=1760287655847', connected: false },
  { name: 'HubSpot', icon: 'https://ik.imagekit.io/on0moldgr/SurbeeIcons/hubspot?updatedAt=1760287672327', connected: false },
  { name: 'Salesforce', icon: 'https://ik.imagekit.io/on0moldgr/SurbeeIcons/salesforce?updatedAt=1760287688343', connected: false },
];

export default function ConnectorsSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showFade, setShowFade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [connectorStates, setConnectorStates] = useState(connectors);
  const [showApiKey, setShowApiKey] = useState(false);

  useEffect(() => {
    // Reset scroll position and fade when component mounts
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setShowFade(false);
    }

    const handleScroll = () => {
      if (scrollRef.current) {
        setShowFade(scrollRef.current.scrollTop > 0);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleConnect = (name: string) => {
    setConnectorStates(prev =>
      prev.map(conn =>
        conn.name === name ? { ...conn, connected: !conn.connected } : conn
      )
    );
    const connector = connectorStates.find(c => c.name === name);
    if (connector) {
      if (connector.connected) {
        toast.success(`Disconnected from ${name}`);
      } else {
        toast.success(`Connected to ${name}`);
      }
    }
  };

  const handleShowApiKey = () => {
    setShowApiKey(!showApiKey);
  };

  const handleViewApiDocs = () => {
    // TODO: Open API documentation
    window.open('https://docs.surbee.com/api', '_blank');
    toast.info('Opening API documentation...');
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 min-h-0 px-6 md:px-10 lg:px-16 pt-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full max-w-6xl mx-auto">
          {/* Settings Navigation - Fixed */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="space-y-4 flex-shrink-0">
              <h1 className="projects-title">
                Settings
              </h1>

              <div className="space-y-1">
                {[
                  { icon: Settings, label: 'General', active: false, href: '/dashboard/settings/general' },
                  { icon: HelpCircle, label: 'Account', active: false, href: '/dashboard/settings/account' },
                  { icon: Shield, label: 'Privacy & Security', active: false, href: '/dashboard/settings/privacy' },
                  { icon: CreditCard, label: 'Billing', active: false, href: '/dashboard/settings/billing' },
                  { icon: Settings, label: 'Connectors', active: true, href: '/dashboard/settings/connectors' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => router.push(item.href)}
                      className={`
                        relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-150 cursor-pointer mb-0.5
                        ${item.active ? 'text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}
                      `}
                      style={{
                        backgroundColor: item.active
                          ? 'var(--surbee-sidebar-active)'
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[14px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Connectors Content - Only this scrolls */}
          <div className="lg:col-span-3 relative flex flex-col min-h-0 overflow-hidden">
            {/* Fade overlay at top - only show when scrolling */}
            <div className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[var(--surbee-bg-primary)] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
              showFade ? 'opacity-100' : 'opacity-0'
            }`} />

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              className="flex-1 min-h-0 overflow-y-auto pr-4 space-y-6 pb-16"
              style={{ scrollbarWidth: 'thin' }}
            >
              {/* Connectors Section */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Connectors
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Connect Surbee with your favorite tools and platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {connectorStates.map((connector) => (
                      <div
                        key={connector.name}
                        className="flex items-center justify-between p-4 rounded-lg border transition-all"
                        style={{
                          backgroundColor: 'var(--surbee-bg-secondary)',
                          borderColor: 'var(--surbee-card-border)',
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center border"
                            style={{
                              backgroundColor: 'var(--surbee-bg-primary)',
                              borderColor: 'var(--surbee-border-accent)',
                            }}
                          >
                            <IKImage
                              src={connector.icon}
                              alt={connector.name}
                              width={32}
                              height={32}
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <h3 className="text-[14px] font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                              {connector.name}
                            </h3>
                            {connector.connected && (
                              <p className="text-[12px] flex items-center gap-1" style={{ color: 'var(--surbee-fg-muted)' }}>
                                <Check className="w-3 h-3 text-green-500" />
                                Connected
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleConnect(connector.name)}
                          className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
                          style={{
                            backgroundColor: connector.connected
                              ? 'transparent'
                              : 'var(--surbee-fg-primary)',
                            color: connector.connected
                              ? 'var(--surbee-fg-primary)'
                              : 'var(--surbee-bg-primary)',
                            border: connector.connected
                              ? '1px solid var(--surbee-border-accent)'
                              : 'none',
                          }}
                        >
                          {connector.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* API Access */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    API Access
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Use our API to build custom integrations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[14px] font-medium mb-2 block" style={{ color: 'var(--surbee-fg-primary)' }}>
                        API Key
                      </label>
                      <div className="flex gap-2">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={showApiKey ? 'surbee_demo_xxxxxxxxxxxxxxxxxxxx' : 'surbee_••••••••••••••••••••'}
                          readOnly
                          className="flex-1 p-2.5 rounded-lg border text-[14px] font-mono"
                          style={{
                            backgroundColor: 'var(--surbee-bg-secondary)',
                            borderColor: 'var(--surbee-card-border)',
                            color: 'var(--surbee-fg-primary)'
                          }}
                        />
                        <button
                          onClick={handleShowApiKey}
                          className="px-4 py-2.5 rounded-lg border transition-colors text-[14px] font-medium flex items-center justify-center"
                          style={{
                            borderColor: 'var(--surbee-border-accent)',
                            backgroundColor: 'var(--surbee-sidebar-hover)',
                            color: 'var(--surbee-fg-primary)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                          }}
                        >
                          {showApiKey ? 'Hide' : 'Show'}
                        </button>
                        {showApiKey && (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText('surbee_demo_xxxxxxxxxxxxxxxxxxxx');
                              toast.success('API key copied to clipboard');
                            }}
                            className="px-4 py-2.5 rounded-lg border transition-colors text-[14px] font-medium flex items-center justify-center"
                            style={{
                              borderColor: 'var(--surbee-border-accent)',
                              backgroundColor: 'var(--surbee-sidebar-hover)',
                              color: 'var(--surbee-fg-primary)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                            }}
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleViewApiDocs}
                      className="flex items-center gap-2 text-[14px] font-medium transition-colors"
                      style={{ color: 'var(--surbee-fg-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      View API Documentation
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
