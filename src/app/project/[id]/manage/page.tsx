"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TypeformButton, TypeformButtonContainer } from '@/components/ui/typeform-button';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PreviewTab } from '@/components/project-manage/PreviewTab';
import { InsightsTabRedesign } from '@/components/project-manage/InsightsTabRedesign';
import { ShareTabRedesign } from '@/components/project-manage/ShareTabRedesign';
import { CipherTab } from '@/components/project-manage/CipherTab';
import { EvaluationTab } from '@/components/project-manage/EvaluationTab';
import AppLayout from '@/components/layout/AppLayout';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';
import { ProjectBreadcrumb } from '@/components/ui/project-breadcrumb';
import { ComponentRegistryProvider } from '@/contexts/ComponentRegistry';
import { AnalysisDotsManager } from '@/components/analysis-dots/AnalysisDotsManager';
import { extractPageContext } from '@/lib/services/component-detection';
import { useComponentRegistry } from '@/contexts/ComponentRegistry';
import { useAuth } from '@/contexts/AuthContext';
import './styles.css';
import './share-styles.css';

// Sandbox Bundle Type
interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

// Message type for chat
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Ask Surbee Component
function AskSurbeeComponent({ activeTab, projectId }: { activeTab: TabType; projectId: string }) {
  const { user } = useAuth();
  const [showChat, setShowChat] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  const hasText = inputValue.trim().length > 0;

  // Responsive widths - expand more when showing chat
  const expandedWidth = showChat ? '500px' : '355px';
  const chatHeight = showChat ? '400px' : '48px';

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const streamAIResponse = async (question: string) => {
    if (!user) return;

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: question },
          ],
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      const aiMessageId = Date.now().toString();
      let fullResponse = '';

      // Add empty AI message
      setMessages(prev => [...prev, {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }]);

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          // Parse AI SDK data stream format
          // Format: PREFIX:JSON_DATA
          const colonIndex = line.indexOf(':');
          if (colonIndex === -1) continue;

          const prefix = line.slice(0, colonIndex);
          const data = line.slice(colonIndex + 1);

          try {
            if (prefix === '0') {
              // Text content
              const text = JSON.parse(data);
              if (typeof text === 'string') {
                fullResponse += text;
                setMessages(prev => prev.map(m =>
                  m.id === aiMessageId ? { ...m, content: fullResponse } : m
                ));
              }
            }
          } catch (e) {
            // Skip unparseable lines
          }
        }
      }

      // Update final message
      setMessages(prev => prev.map(m =>
        m.id === aiMessageId ? { ...m, content: fullResponse } : m
      ));

    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Stream error:', error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasText || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowChat(true);

    try {
      await streamAIResponse(inputValue);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e as any);
    }
  };

  return (
    <>
      <div
        className="ask-surbee-widget"
        style={{
          width: expandedWidth,
          height: chatHeight,
          transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        {!showChat ? (
          // Input mode
          <form
            className="relative h-full"
            style={{
              border: "0px solid rgb(229, 231, 235)",
              boxSizing: "border-box",
              position: "relative",
            }}
          >
            <label
              className="relative flex w-full h-full rounded-[24px] p-2"
              style={{
                boxSizing: "border-box",
                position: "relative",
                display: "flex",
                width: "100%",
                height: "100%",
                borderRadius: "24px",
                backgroundColor: "rgba(30, 30, 31, 0.75)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                padding: "0.5rem",
              }}
            >
              <input
                className="mx-3 w-full bg-transparent focus:outline-none text-white placeholder-gray-400"
                placeholder="Ask Surbee about your survey data..."
                aria-label="Message Surbee"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                style={{
                  border: "0px solid rgb(229, 231, 235)",
                  boxSizing: "border-box",
                  margin: "0px",
                  padding: "0px",
                  fontFamily: "inherit",
                  fontFeatureSettings: "inherit",
                  fontVariationSettings: "inherit",
                  color: "white",
                  marginLeft: "0.75rem",
                  marginRight: "0.75rem",
                  height: "2rem",
                  width: "100%",
                  backgroundColor: "transparent",
                  paddingInlineEnd: "2rem",
                  fontSize: "0.875rem",
                  lineHeight: "1.435rem",
                  letterSpacing: "-0.01em",
                  fontWeight: 400,
                  textWrap: "pretty",
                }}
              />
            </label>
            <button
              className={`absolute top-2 h-8 w-8 flex-none rounded-full p-0 transition-all duration-200 flex items-center justify-center ${ isLoading
                  ? 'opacity-100 cursor-pointer hover:opacity-80 bg-white text-black'
                  : hasText
                    ? 'opacity-100 cursor-pointer hover:opacity-80 bg-white text-black'
                    : 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-600'
              }`}
              type={isLoading ? "button" : "submit"}
              aria-label={isLoading ? "Stop generation" : "Send prompt to Surbee"}
              disabled={!isLoading && !hasText}
              onClick={isLoading ? handleStop : handleFormSubmit}
              style={{
                border: "0px solid rgb(229, 231, 235)",
                boxSizing: "border-box",
                margin: "0px",
                fontFamily: "inherit",
                fontFeatureSettings: "inherit",
                fontVariationSettings: "inherit",
                fontSize: "100%",
                fontWeight: "inherit",
                lineHeight: "inherit",
                letterSpacing: "inherit",
                textTransform: "none",
                appearance: "button",
                backgroundImage: "none",
                position: "absolute",
                top: "0.5rem",
                height: "2rem",
                width: "2rem",
                flex: "0 0 auto",
                borderRadius: "9999px",
                padding: "0px",
                insetInlineEnd: "0.5rem",
                backgroundColor: (isLoading || hasText) ? "white" : "rgba(255, 255, 255, 0.15)",
                color: (isLoading || hasText) ? "black" : "rgba(255, 255, 255, 0.6)",
              }}
            >
              {isLoading ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              ) : (
                <svg
                  height="32"
                  width="32"
                  fill="none"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{
                    border: "0px solid rgb(229, 231, 235)",
                    boxSizing: "border-box",
                    display: "block",
                    verticalAlign: "middle",
                  }}
                >
                  <path
                    d="M16 22L16 10M16 10L11 15M16 10L21 15"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                    style={{
                      border: "0px solid rgb(229, 231, 235)",
                      boxSizing: "border-box",
                    }}
                  />
                </svg>
              )}
            </button>
          </form>
        ) : (
          // Chat mode
          <div
            className="flex flex-col h-full rounded-[24px]"
            style={{
              backgroundColor: "rgba(30, 30, 31, 0.75)",
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Close button */}
            <div className="flex justify-end p-2">
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages with padding and bubbles */}
            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="animate-slide-in">
                  {message.role === 'assistant' ? (
                    <div className="text-white px-4 py-3">
                      {message.content ? (
                        <div dangerouslySetInnerHTML={{ __html: String(message.content)
                            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mb-2 mt-4">$1</h3>')
                            .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mb-3 mt-6">$1</h2>')
                            .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4 mt-8">$1</h1>')
                            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em class="text-white italic">$1</em>')
                            .replace(/```([\s\S]*?)```/g, '<pre class="bg-white/10 border border-white/20 rounded-lg p-3 my-3 overflow-x-auto"><code class="text-white font-mono text-sm">$1</code></pre>')
                            .replace(/`(.*?)`/g, '<code class="bg-white/20 px-2 py-1 rounded text-sm text-white font-mono">$1</code>')
                            .replace(/^- (.*$)/gim, '<li class="text-white ml-4 mb-1 list-disc list-inside">$1</li>')
                            .replace(/^\d+\. (.*$)/gim, '<li class="text-white ml-4 mb-1 list-decimal list-inside">$1</li>')
                            .replace(/\n/g, '<br>')
                        }} />
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400">
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-right">
                      <p className="text-sm text-white inline-block bg-white/20 px-4 py-3 rounded-lg">
                        {message.content}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input - Same style as original */}
            <div className="p-3">
              <form onSubmit={handleFormSubmit} className="relative">
                <label
                  className="relative flex w-full rounded-[24px] p-2 shadow-sm backdrop-blur-xl"
                  style={{
                    border: "0px solid rgb(229, 231, 235)",
                    boxSizing: "border-box",
                    position: "relative",
                    display: "flex",
                    width: "100%",
                    borderRadius: "24px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    padding: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    backdropFilter: "blur(16px)",
                  }}
                >
                  <input
                    className="mx-3 w-full bg-transparent focus:outline-none text-white placeholder-gray-400"
                    placeholder="Ask a follow-up question..."
                    aria-label="Message Surbee"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    style={{
                      border: "0px solid rgb(229, 231, 235)",
                      boxSizing: "border-box",
                      margin: "0px",
                      padding: "0px",
                      fontFamily: "inherit",
                      fontFeatureSettings: "inherit",
                      fontVariationSettings: "inherit",
                      color: "white",
                      marginLeft: "0.75rem",
                      marginRight: "0.75rem",
                      height: "2rem",
                      width: "100%",
                      backgroundColor: "transparent",
                      paddingInlineEnd: "2rem",
                      fontSize: "0.875rem",
                      lineHeight: "1.435rem",
                      letterSpacing: "-0.01em",
                      fontWeight: 400,
                      textWrap: "pretty",
                    }}
                  />
                </label>
                <button
                  className={`absolute top-2 h-8 w-8 flex-none rounded-full p-0 transition-all duration-200 flex items-center justify-center ${ isLoading
                      ? 'opacity-100 cursor-pointer hover:opacity-80 bg-white text-black'
                      : hasText
                        ? 'opacity-100 cursor-pointer hover:opacity-80 bg-white text-black'
                        : 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-600'
                  }`}
                  type={isLoading ? "button" : "submit"}
                  aria-label={isLoading ? "Stop generation" : "Send prompt to Surbee"}
                  disabled={!isLoading && !hasText}
                  onClick={isLoading ? handleStop : handleFormSubmit}
                  style={{
                    border: "0px solid rgb(229, 231, 235)",
                    boxSizing: "border-box",
                    margin: "0px",
                    fontFamily: "inherit",
                    fontFeatureSettings: "inherit",
                    fontVariationSettings: "inherit",
                    fontSize: "100%",
                    fontWeight: "inherit",
                    lineHeight: "inherit",
                    letterSpacing: "inherit",
                    textTransform: "none",
                    appearance: "button",
                    backgroundImage: "none",
                    position: "absolute",
                    top: "0.5rem",
                    height: "2rem",
                    width: "2rem",
                    flex: "0 0 auto",
                    borderRadius: "9999px",
                    padding: "0px",
                    insetInlineEnd: "0.5rem",
                    backgroundColor: (isLoading || hasText) ? "white" : "rgba(255, 255, 255, 0.15)",
                    color: (isLoading || hasText) ? "black" : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {isLoading ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="6" width="12" height="12" rx="1" />
                    </svg>
                  ) : (
                    <svg
                      height="32"
                      width="32"
                      fill="none"
                      viewBox="0 0 32 32"
                      xmlns="http://www.w3.org/2000/svg"
                      style={{
                        border: "0px solid rgb(229, 231, 235)",
                        boxSizing: "border-box",
                        display: "block",
                        verticalAlign: "middle",
                      }}
                    >
                      <path
                        d="M16 22L16 10M16 10L11 15M16 10L21 15"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.7"
                        style={{
                          border: "0px solid rgb(229, 231, 235)",
                          boxSizing: "border-box",
                        }}
                      />
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
html {
  border: 0px solid rgb(229, 231, 235);
  box-sizing: border-box;
  line-height: 1.5;
  text-size-adjust: 100%;
  tab-size: 4;
  font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  font-feature-settings: normal;
  font-variation-settings: normal;
  -webkit-tap-highlight-color: transparent;
  color-scheme: dark;
}

body {
  border: 0px solid rgb(229, 231, 235);
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
  font-feature-settings: "liga", "calt";
  -webkit-font-smoothing: antialiased;
  counter-reset: katexEqnNo 0 mmlEqnNo 0;
  margin: 0px;
  background-color: #141414;
  font-size: 1.0625rem;
  line-height: 1.74994rem;
  letter-spacing: -0.01em;
  font-weight: 400;
  color: white;
  text-wrap: pretty;
}
`,
        }}
      />
    </>
  );
}

export type TabType = 'preview' | 'insights' | 'evaluation' | 'cipher' | 'share';

export default function ProjectManagePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [isMounted, setIsMounted] = useState(false);
  // State to control exit animation
  const [isExiting, setIsExiting] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDarkMode = isMounted && theme === 'dark';

  // Fetch project data to get sandbox bundle and active session
  const [sandboxBundle, setSandboxBundle] = useState<SandboxBundle | null>(null);
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  React.useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (!user?.id) {
          setIsLoadingProject(false);
          return;
        }

        // Fetch project data
        const response = await fetch(`/api/projects/${projectId}?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.project) {
            // Load sandbox bundle
            if (data.project.sandbox_bundle) {
              setSandboxBundle(data.project.sandbox_bundle);
            }
            // Load active chat session ID from project
            if (data.project.active_chat_session_id) {
              setActiveChatSessionId(data.project.active_chat_session_id);
            }
            // Load published URL for share tab
            if (data.project.published_url) {
              setPublishedUrl(data.project.published_url);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProjectData();
  }, [projectId, user?.id]);

  // Handle back button click with animation
  const handleBack = () => {
    setIsExiting(true);
    // Wait for animation to complete before navigating
    setTimeout(() => {
      router.push('/projects');
    }, 300); // Match transition duration
  };

  // Remove exit animation on mount - we want smooth entry only
  React.useEffect(() => {
    setIsExiting(false);
  }, []);

  return (
    <AuthGuard>
      <AppLayout fullBleed>
        <ComponentRegistryProvider>
          {/* Top bar with back button and tabs - in the sidebar area */}
          <div
            ref={containerRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              flexShrink: 0
            }}
          >
                  {/* Back Button */}
                  <button
                    onClick={handleBack}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--surbee-fg-secondary)',
                      transition: 'color 200ms ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                  </button>

                  {/* Tabs - On the Right */}
                  <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <button
                      onClick={() => setActiveTab('preview')}
                      style={{
                        padding: '0',
                        fontSize: '14px', // Increased to 14px
                        fontWeight: activeTab === 'preview' ? '500' : '400',
                        color: activeTab === 'preview'
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-fg-tertiary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 200ms ease, opacity 200ms ease',
                        opacity: activeTab === 'preview' ? 1 : 0.6,
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== 'preview') {
                          e.currentTarget.style.opacity = '0.9';
                          e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== 'preview') {
                          e.currentTarget.style.opacity = '0.6';
                          e.currentTarget.style.color = 'var(--surbee-fg-tertiary)';
                        }
                      }}
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => setActiveTab('insights')}
                      style={{
                        padding: '0',
                        fontSize: '14px', // Increased to 14px
                        fontWeight: activeTab === 'insights' ? '500' : '400',
                        color: activeTab === 'insights'
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-fg-tertiary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 200ms ease, opacity 200ms ease',
                        opacity: activeTab === 'insights' ? 1 : 0.6,
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== 'insights') {
                          e.currentTarget.style.opacity = '0.9';
                          e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== 'insights') {
                          e.currentTarget.style.opacity = '0.6';
                          e.currentTarget.style.color = 'var(--surbee-fg-tertiary)';
                        }
                      }}
                    >
                      Insights
                    </button>

                    <button
                      onClick={() => setActiveTab('evaluation')}
                      style={{
                        padding: '0',
                        fontSize: '14px',
                        fontWeight: activeTab === 'evaluation' ? '500' : '400',
                        color: activeTab === 'evaluation'
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-fg-tertiary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 200ms ease, opacity 200ms ease',
                        opacity: activeTab === 'evaluation' ? 1 : 0.6,
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== 'evaluation') {
                          e.currentTarget.style.opacity = '0.9';
                          e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== 'evaluation') {
                          e.currentTarget.style.opacity = '0.6';
                          e.currentTarget.style.color = 'var(--surbee-fg-tertiary)';
                        }
                      }}
                    >
                      Evaluation
                    </button>

                    <button
                      onClick={() => setActiveTab('cipher')}
                      style={{
                        padding: '0',
                        fontSize: '14px',
                        fontWeight: activeTab === 'cipher' ? '500' : '400',
                        color: activeTab === 'cipher'
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-fg-tertiary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 200ms ease, opacity 200ms ease',
                        opacity: activeTab === 'cipher' ? 1 : 0.6,
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== 'cipher') {
                          e.currentTarget.style.opacity = '0.9';
                          e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== 'cipher') {
                          e.currentTarget.style.opacity = '0.6';
                          e.currentTarget.style.color = 'var(--surbee-fg-tertiary)';
                        }
                      }}
                    >
                      Cipher
                    </button>

                    <button
                      onClick={() => setActiveTab('share')}
                      style={{
                        padding: '0',
                        fontSize: '14px', // Increased to 14px
                        fontWeight: activeTab === 'share' ? '500' : '400',
                        color: activeTab === 'share'
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-fg-tertiary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color 200ms ease, opacity 200ms ease',
                        opacity: activeTab === 'share' ? 1 : 0.6,
                      }}
                      onMouseEnter={(e) => {
                        if (activeTab !== 'share') {
                          e.currentTarget.style.opacity = '0.9';
                          e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (activeTab !== 'share') {
                          e.currentTarget.style.opacity = '0.6';
                          e.currentTarget.style.color = 'var(--surbee-fg-tertiary)';
                        }
                      }}
                    >
                      Share
                    </button>
                  </nav>
            </div>

          {/* Main Content Container - The rounded box with animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{
              opacity: isExiting ? 0 : 1,
              scale: isExiting ? 0.98 : 1
            }}
            transition={{
              duration: 0.25,
              ease: [0.32, 0.72, 0, 1]
            }}
            className="flex-1 flex flex-col rounded-xl overflow-hidden no-scrollbar"
            style={{
              backgroundColor: 'var(--surbee-bg-primary)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              margin: '0 16px 16px 16px',
              minHeight: 0, // Important for flex children to shrink properly
            }}
          >
              {/* Tab Content */}
              {activeTab === 'insights' ? (
                <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
                  <AnalysisDotsManager projectId={projectId}>
                    <div className="overflow-y-auto" style={{ padding: '24px', height: '100%' }}>
                      <InsightsTabRedesign projectId={projectId} />
                    </div>
                  </AnalysisDotsManager>
                </div>
              ) : activeTab === 'evaluation' ? (
                <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
                  <div className="overflow-y-auto" style={{ height: '100%' }}>
                    <EvaluationTab projectId={projectId} />
                  </div>
                </div>
              ) : activeTab === 'cipher' ? (
                <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
                  <div className="overflow-y-auto" style={{ padding: '24px', height: '100%' }}>
                    <CipherTab projectId={projectId} />
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-auto" style={{ padding: '24px' }}>
                  {activeTab === 'preview' && <PreviewTab projectId={projectId} sandboxBundle={sandboxBundle} activeChatSessionId={activeChatSessionId} />}
                  {activeTab === 'share' && <ShareTabRedesign projectId={projectId} publishedUrl={publishedUrl} />}
                </div>
              )}

            {/* Ask Surbee Component - Inside container at bottom - Hidden for Preview, Evaluation, and Cipher Tabs */}
            {activeTab !== 'preview' && activeTab !== 'evaluation' && activeTab !== 'cipher' && (
              <div className="ask-surbee-container">
                <AskSurbeeComponent activeTab={activeTab} projectId={projectId} />
              </div>
            )}
          </motion.div>
          <style jsx global>{`
            .no-scrollbar::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </ComponentRegistryProvider>
      </AppLayout>
    </AuthGuard>
  );
}