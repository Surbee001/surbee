"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Code, Zap, Package, ExternalLink, ChevronRight } from 'lucide-react';

const docSections = [
  {
    title: 'Getting Started',
    icon: Zap,
    items: [
      { title: 'Quick Start Guide', href: '#quick-start' },
      { title: 'Authentication', href: '#authentication' },
      { title: 'Making Your First Request', href: '#first-request' },
      { title: 'Error Handling', href: '#errors' },
    ]
  },
  {
    title: 'API Reference',
    icon: Code,
    items: [
      { title: 'Surveys API', href: '#surveys' },
      { title: 'Responses API', href: '#responses' },
      { title: 'Analytics API', href: '#analytics' },
      { title: 'Projects API', href: '#projects' },
      { title: 'Users API', href: '#users' },
    ]
  },
  {
    title: 'SDK Libraries',
    icon: Package,
    items: [
      { title: 'JavaScript/TypeScript', href: '#sdk-js' },
      { title: 'Python', href: '#sdk-python' },
      { title: 'Ruby', href: '#sdk-ruby' },
      { title: 'Go', href: '#sdk-go' },
    ]
  },
];

export default function DocumentationPage() {
  const [activeSection, setActiveSection] = useState('quick-start');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-4">
        <h1 className="text-2xl font-bold mb-4" style={{ color: 'var(--surbee-fg-primary)' }}>
          Documentation
        </h1>

        <nav className="space-y-6">
          {docSections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.title}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4" style={{ color: 'var(--surbee-accent-primary)' }} />
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                    {section.title}
                  </h3>
                </div>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <button
                        onClick={() => setActiveSection(item.href.substring(1))}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                          activeSection === item.href.substring(1) ? 'font-medium' : ''
                        }`}
                        style={{
                          backgroundColor: activeSection === item.href.substring(1) ? 'var(--surbee-sidebar-active)' : 'transparent',
                          color: activeSection === item.href.substring(1) ? 'var(--surbee-accent-primary)' : 'var(--surbee-fg-secondary)'
                        }}
                        onMouseEnter={(e) => {
                          if (activeSection !== item.href.substring(1)) {
                            e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeSection !== item.href.substring(1)) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {item.title}
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* External Links */}
        <div className="pt-6 border-t" style={{ borderColor: 'var(--surbee-border-primary)' }}>
          <a
            href="https://docs.surbee.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ color: 'var(--surbee-fg-secondary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ExternalLink className="w-4 h-4" />
            Full Documentation
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6">
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Quick Start Guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--surbee-fg-primary)' }}>
                1. Install the SDK
              </h3>
              <div className="rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: 'var(--surbee-bg-tertiary)', borderBottom: '1px solid var(--surbee-border-primary)' }}>
                  <span className="text-xs font-mono" style={{ color: 'var(--surbee-fg-muted)' }}>bash</span>
                  <button className="text-xs" style={{ color: 'var(--surbee-accent-primary)' }}>Copy</button>
                </div>
                <pre className="p-4 overflow-x-auto" style={{ backgroundColor: 'var(--surbee-bg-secondary)' }}>
                  <code className="text-sm font-mono" style={{ color: 'var(--surbee-fg-primary)' }}>
                    npm install @surbee/sdk
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--surbee-fg-primary)' }}>
                2. Initialize the Client
              </h3>
              <div className="rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: 'var(--surbee-bg-tertiary)', borderBottom: '1px solid var(--surbee-border-primary)' }}>
                  <span className="text-xs font-mono" style={{ color: 'var(--surbee-fg-muted)' }}>typescript</span>
                  <button className="text-xs" style={{ color: 'var(--surbee-accent-primary)' }}>Copy</button>
                </div>
                <pre className="p-4 overflow-x-auto" style={{ backgroundColor: 'var(--surbee-bg-secondary)' }}>
                  <code className="text-sm font-mono" style={{ color: 'var(--surbee-fg-primary)' }}>
{`import { Surbee } from '@surbee/sdk';

const surbee = new Surbee({
  apiKey: process.env.SURBEE_API_KEY,
});`}
                  </code>
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--surbee-fg-primary)' }}>
                3. Make Your First Request
              </h3>
              <div className="rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2" style={{ backgroundColor: 'var(--surbee-bg-tertiary)', borderBottom: '1px solid var(--surbee-border-primary)' }}>
                  <span className="text-xs font-mono" style={{ color: 'var(--surbee-fg-muted)' }}>typescript</span>
                  <button className="text-xs" style={{ color: 'var(--surbee-accent-primary)' }}>Copy</button>
                </div>
                <pre className="p-4 overflow-x-auto" style={{ backgroundColor: 'var(--surbee-bg-secondary)' }}>
                  <code className="text-sm font-mono" style={{ color: 'var(--surbee-fg-primary)' }}>
{`// Fetch all surveys
const surveys = await surbee.surveys.list({
  limit: 10,
  offset: 0
});

console.log(surveys);`}
                  </code>
                </pre>
              </div>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surbee-accent-subtle)', border: '1px solid var(--surbee-border-primary)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                Need more help?
              </h4>
              <p className="text-sm mb-3" style={{ color: 'var(--surbee-fg-muted)' }}>
                Check out our comprehensive guides and API reference for detailed information.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://docs.surbee.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--surbee-accent-primary)',
                    color: '#ffffff'
                  }}
                >
                  <BookOpen className="w-4 h-4" />
                  View Full Docs
                </a>
                <a
                  href="https://github.com/surbee/examples"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors"
                  style={{
                    backgroundColor: 'var(--surbee-bg-primary)',
                    borderColor: 'var(--surbee-border-primary)',
                    color: 'var(--surbee-fg-primary)'
                  }}
                >
                  <Code className="w-4 h-4" />
                  View Examples
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
