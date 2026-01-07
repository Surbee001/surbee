"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TypeformButton, TypeformButtonContainer } from '@/components/ui/typeform-button';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PreviewTab } from '@/components/project-manage/PreviewTab';
import { ShareTab } from '@/components/project-manage/share';
import { EvaluationTab } from '@/components/project-manage/EvaluationTab';
import { InsightsTab } from '@/components/project-manage/insights';
import { ProjectSettings } from '@/components/project-manage/ProjectSettings';
import AppLayout from '@/components/layout/AppLayout';
import { useTheme } from '@/hooks/useTheme';
import { motion } from 'framer-motion';
import { ProjectBreadcrumb } from '@/components/ui/project-breadcrumb';
import { ComponentRegistryProvider } from '@/contexts/ComponentRegistry';
import { extractPageContext } from '@/lib/services/component-detection';
import { useComponentRegistry } from '@/contexts/ComponentRegistry';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
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
  const { userPreferences } = useUserPreferences();
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
          userPreferences: userPreferences,
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
    </>
  );
}

export type TabType = 'preview' | 'insights' | 'evaluation' | 'share' | 'settings';

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
  // Agent panel state
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [agentInput, setAgentInput] = useState('');
  const [agentMessages, setAgentMessages] = useState<ChatMessage[]>([]);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const agentAbortRef = React.useRef<AbortController | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const agentTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [agentInputHeight, setAgentInputHeight] = useState(24);
  const [isReferenceMode, setIsReferenceMode] = useState(false);
  const [agentReferences, setAgentReferences] = useState<Array<{ id: string; title: string; content: string }>>([]);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);

  // Reference mode - highlight hoverable elements
  const hoveredElementRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!isReferenceMode || (activeTab !== 'insights' && activeTab !== 'evaluation')) {
      setHoveredElement(null);
      hoveredElementRef.current = null;
      return;
    }

    const findReferenceableParent = (el: HTMLElement): HTMLElement | null => {
      let current: HTMLElement | null = el;
      while (current && current !== document.body) {
        // Check if it's inside the main content area
        if (!containerRef.current?.contains(current)) {
          return null;
        }

        // Look for elements with background color or border (likely cards/sections)
        const style = window.getComputedStyle(current);
        const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
                             style.backgroundColor !== 'transparent';
        const hasBorder = style.borderWidth !== '0px';
        const hasMinSize = current.offsetWidth > 100 && current.offsetHeight > 50;

        // Also check for specific patterns in styles or data attributes
        const isReferenceable = current.hasAttribute('data-referenceable') ||
                               (hasBackground && hasMinSize) ||
                               (hasBorder && hasMinSize);

        if (isReferenceable) {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const referenceable = findReferenceableParent(target);

      if (referenceable) {
        setHoveredElement(referenceable);
        hoveredElementRef.current = referenceable;
      } else {
        setHoveredElement(null);
        hoveredElementRef.current = null;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const currentHovered = hoveredElementRef.current;
      if (currentHovered) {
        e.preventDefault();
        e.stopPropagation();

        // Extract content from the element
        const title = currentHovered.getAttribute('data-title') ||
                     currentHovered.querySelector('h2, h3, h4, span[style*="font-weight"]')?.textContent ||
                     'Selected content';
        const content = currentHovered.textContent?.slice(0, 500) || '';

        // Add reference
        const newRef = {
          id: `ref_${Date.now()}`,
          title: title.trim().slice(0, 30),
          content: content.trim(),
        };
        setAgentReferences(prev => [...prev, newRef]);
        setIsReferenceMode(false);
        setHoveredElement(null);
        hoveredElementRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('click', handleClick, true);
    };
  }, [isReferenceMode, activeTab]);

  // Remove a reference
  const removeAgentReference = (id: string) => {
    setAgentReferences(prev => prev.filter(r => r.id !== id));
  };

  // Clear agent chat
  const clearAgentChat = () => {
    setAgentMessages([]);
    setAgentInput('');
    setAgentInputHeight(24);
    setAgentReferences([]);
    if (agentTextareaRef.current) {
      agentTextareaRef.current.style.height = 'auto';
    }
  };

  // Auto-resize textarea and update border radius
  const handleAgentInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAgentInput(e.target.value);
    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120);
    textarea.style.height = newHeight + 'px';
    setAgentInputHeight(newHeight);
  };

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

  // Agent chat functions
  const handleAgentStop = () => {
    if (agentAbortRef.current) {
      agentAbortRef.current.abort();
      agentAbortRef.current = null;
    }
    setIsAgentLoading(false);
  };

  const streamAgentResponse = async (question: string) => {
    if (!user) return;

    agentAbortRef.current = new AbortController();

    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          messages: [
            ...agentMessages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: question },
          ],
        }),
        signal: agentAbortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      const aiMessageId = Date.now().toString();
      let fullResponse = '';

      setAgentMessages(prev => [...prev, {
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
          const colonIndex = line.indexOf(':');
          if (colonIndex === -1) continue;
          const prefix = line.slice(0, colonIndex);
          const data = line.slice(colonIndex + 1);

          try {
            if (prefix === '0') {
              const text = JSON.parse(data);
              if (typeof text === 'string') {
                fullResponse += text;
                setAgentMessages(prev => prev.map(m =>
                  m.id === aiMessageId ? { ...m, content: fullResponse } : m
                ));
              }
            }
          } catch (e) {}
        }
      }

      setAgentMessages(prev => prev.map(m =>
        m.id === aiMessageId ? { ...m, content: fullResponse } : m
      ));
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      setAgentMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      agentAbortRef.current = null;
    }
  };

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentInput.trim() || isAgentLoading || !user) return;

    // Build message with references
    let fullMessage = agentInput;
    if (agentReferences.length > 0) {
      const refContext = agentReferences.map(r => `[${r.title}]: ${r.content}`).join('\n\n');
      fullMessage = `${agentInput}\n\n---\nReferenced content:\n${refContext}`;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: agentInput, // Show only the user's text in the UI
      timestamp: new Date(),
    };

    setAgentMessages(prev => [...prev, userMessage]);
    const messageToSend = fullMessage; // Send full message with refs to API
    setAgentInput('');
    setAgentReferences([]); // Clear references after sending

    // Reset textarea height
    setAgentInputHeight(24);
    if (agentTextareaRef.current) {
      agentTextareaRef.current.style.height = 'auto';
    }

    setIsAgentLoading(true);

    try {
      await streamAgentResponse(messageToSend);
    } finally {
      setIsAgentLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAgentInput(suggestion);
  };

  const agentSuggestions = [
    'Analyze survey responses',
    'Find drop-off patterns',
    'Summarize key insights',
    'Detect fraud patterns',
  ];

  return (
            <ComponentRegistryProvider>
              <div 
                className="flex flex-col h-full" 
                style={{ 
                  backgroundColor: 'var(--surbee-sidebar-bg)',
                  padding: '16px',
                  width: '100%',
                  overflow: 'hidden'
                }}
              >
                            {/* Header (Back Button and Tabs) - OUTSIDE the window */}
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0 4px',
                                marginBottom: 16,
                                flexShrink: 0,
                                position: 'relative',
                                zIndex: 0
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
                                    {/* Agent Pill Button */}
                                    <button
                                      onClick={() => setIsAgentOpen(!isAgentOpen)}
                                      style={{
                                        padding: '6px 14px',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: isAgentOpen ? 'var(--surbee-fg-primary)' : 'var(--surbee-fg-primary)',
                                        backgroundColor: isAgentOpen ? 'var(--surbee-bg-secondary, #f5f5f5)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '9999px',
                                        cursor: 'pointer',
                                        transition: 'all 200ms ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                      }}
                                      onMouseEnter={(e) => {
                                        if (!isAgentOpen) {
                                          e.currentTarget.style.backgroundColor = 'var(--surbee-bg-secondary, #f5f5f5)';
                                        }
                                      }}
                                      onMouseLeave={(e) => {
                                        if (!isAgentOpen) {
                                          e.currentTarget.style.backgroundColor = 'transparent';
                                        }
                                      }}
                                    >
                                      {/* Unique Agent Icon - Neural/AI sparkle */}
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="3"/>
                                        <path d="M12 2v4"/>
                                        <path d="M12 18v4"/>
                                        <path d="M4.93 4.93l2.83 2.83"/>
                                        <path d="M16.24 16.24l2.83 2.83"/>
                                        <path d="M2 12h4"/>
                                        <path d="M18 12h4"/>
                                        <path d="M4.93 19.07l2.83-2.83"/>
                                        <path d="M16.24 7.76l2.83-2.83"/>
                                      </svg>
                                      Agent
                                    </button>

                                    {/* Divider */}
                                    <div
                                      style={{
                                        width: '1px',
                                        height: '16px',
                                        backgroundColor: 'var(--surbee-fg-tertiary, currentColor)',
                                        opacity: 0.3,
                                      }}
                                    />

                                    <button
                                      onClick={() => setActiveTab('preview')}
                                      style={{
                                        padding: '0',
                                        fontSize: '14px',
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
                                        fontSize: '14px',
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
                                      onClick={() => setActiveTab('share')}
                                      style={{
                                        padding: '0',
                                        fontSize: '14px',
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

                                    {/* Divider */}
                                    <div
                                      style={{
                                        width: '1px',
                                        height: '16px',
                                        backgroundColor: 'var(--surbee-fg-tertiary, currentColor)',
                                        opacity: 0.3,
                                        marginLeft: 'auto',
                                      }}
                                    />

                                    {/* Settings Icon */}
                                    <button
                                      onClick={() => {
                                        setActiveTab('settings');
                                      }}
                                      style={{
                                        padding: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        color: 'var(--surbee-fg-tertiary)',
                                        transition: 'color 200ms ease, opacity 200ms ease, background-color 200ms ease',
                                        opacity: 0.6,
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                        e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                                        e.currentTarget.style.backgroundColor = 'var(--surbee-bg-secondary, rgba(0, 0, 0, 0.05))';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '0.6';
                                        e.currentTarget.style.color = 'var(--surbee-fg-tertiary)';
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                      }}
                                      title="Settings"
                                    >
                                      <svg
                                        height="16"
                                        width="16"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          clipRule="evenodd"
                                          d="M11.568 3.5a1 1 0 0 0-.863.494l-.811 1.381A3.001 3.001 0 0 1 7.33 6.856l-1.596.013a1 1 0 0 0-.858.501l-.439.761a1 1 0 0 0-.004.992l.792 1.4a3 3 0 0 1 0 2.954l-.792 1.4a1 1 0 0 0 .004.992l.439.76a1 1 0 0 0 .858.502l1.596.013a3 3 0 0 1 2.564 1.48l.811 1.382a1 1 0 0 0 .863.494h.87a1 1 0 0 0 .862-.494l.812-1.381a3.001 3.001 0 0 1 2.563-1.481l1.596-.013a1 1 0 0 0 .86-.501l.438-.761a1 1 0 0 0 .004-.992l-.793-1.4a3 3 0 0 1 0-2.954l.793-1.4a1 1 0 0 0-.004-.992l-.439-.76a1 1 0 0 0-.858-.502l-1.597-.013a3 3 0 0 1-2.563-1.48L13.3 3.993a1 1 0 0 0-.862-.494h-.87ZM8.98 2.981A3.001 3.001 0 0 1 11.568 1.5h.87c1.064 0 2.049.564 2.588 1.481l.811 1.382a1 1 0 0 0 .855.494l1.596.013a3 3 0 0 1 2.575 1.502l.44.76a3 3 0 0 1 .011 2.975l-.792 1.4a1 1 0 0 0 0 .985l.792 1.401a3 3 0 0 1-.012 2.974l-.439.761a3.001 3.001 0 0 1-2.575 1.503l-1.597.012a1 1 0 0 0-.854.494l-.811 1.382a3.001 3.001 0 0 1-2.588 1.481h-.87a3.001 3.001 0 0 1-2.588-1.481l-.811-1.382a1 1 0 0 0-.855-.494l-1.596-.012a3.001 3.001 0 0 1-2.576-1.503l-.438-.76a3 3 0 0 1-.013-2.975l.793-1.4a1 1 0 0 0 0-.985l-.793-1.4a3 3 0 0 1 .013-2.975l.438-.761A3.001 3.001 0 0 1 5.718 4.87l1.596-.013a1 1 0 0 0 .855-.494l.81-1.382Z"
                                          fillRule="evenodd"
                                        />
                                        <path
                                          clipRule="evenodd"
                                          d="M12.003 10.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8.502 12a3.5 3.5 0 1 1 7 .001 3.5 3.5 0 0 1-7-.001Z"
                                          fillRule="evenodd"
                                        />
                                      </svg>
                                    </button>

                                    {/* Continue Editing Button */}
                                    <button
                                      onClick={() => router.push(`/project/${projectId}`)}
                                      style={{
                                        padding: '6px 14px',
                                        fontSize: '13px',
                                        fontWeight: '500',
                                        color: 'var(--surbee-button-primary-fg, white)',
                                        backgroundColor: 'var(--surbee-button-primary-bg, #171717)',
                                        border: 'none',
                                        borderRadius: '9999px',
                                        cursor: 'pointer',
                                        transition: 'all 200ms ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.opacity = '0.85';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.opacity = '1';
                                      }}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                      </svg>
                                      Continue Editing
                                    </button>
                              </nav>
                            </div>
                
                {/* Split Panel Container */}
                <div
                  style={{
                    display: 'flex',
                    flex: 1,
                    gap: '8px',
                    overflow: 'hidden',
                    minHeight: 0,
                  }}
                >
                  {/* Main Content Window */}
                  <motion.div
                    ref={containerRef}
                    className="flex flex-col overflow-hidden no-scrollbar rounded-xl shadow-sm"
                    initial={{ y: -20, opacity: 1 }}
                    animate={{
                      y: isExiting ? -20 : 0,
                      opacity: 1
                    }}
                    transition={{
                      duration: 0.3,
                      ease: [0.2, 0.8, 0.2, 1]
                    }}
                    style={{
                      backgroundColor: 'var(--surbee-bg-primary)',
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      flex: 1,
                      minWidth: 0,
                      willChange: 'transform',
                      boxSizing: 'border-box',
                      position: 'relative',
                      zIndex: 10,
                    }}
                  >          {/* Tab Content */}
          {activeTab === 'insights' ? (
            <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
              <div className="overflow-y-auto" style={{ padding: '24px', height: '100%' }}>
                <InsightsTab projectId={projectId} />
              </div>
            </div>
          ) : activeTab === 'evaluation' ? (
            <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
              <div className="overflow-y-auto" style={{ height: '100%' }}>
                <EvaluationTab projectId={projectId} />
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto" style={{ padding: '24px' }}>
              {activeTab === 'preview' && <PreviewTab projectId={projectId} sandboxBundle={sandboxBundle} activeChatSessionId={activeChatSessionId} />}
              {activeTab === 'share' && <ShareTab projectId={projectId} publishedUrl={publishedUrl} />}
              {activeTab === 'settings' && <ProjectSettings projectId={projectId} onClose={() => setActiveTab('preview')} />}
            </div>
          )}

          {/* Ask Surbee Component - Inside container at bottom - Hidden for Preview, Insights, Evaluation, Cipher, and Settings Tabs */}
          {activeTab !== 'preview' && activeTab !== 'insights' && activeTab !== 'evaluation' && activeTab !== 'cipher' && activeTab !== 'settings' && !isAgentOpen && (
            <div className="ask-surbee-container">
              <AskSurbeeComponent activeTab={activeTab} projectId={projectId} />
            </div>
          )}
        </motion.div>

        {/* Agent Panel */}
        {isAgentOpen && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
            className="flex flex-col overflow-hidden rounded-xl shadow-sm"
            style={{
              width: '380px',
              flexShrink: 0,
              backgroundColor: 'var(--surbee-bg-primary)',
            }}
          >
            {/* Agent Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--surbee-fg-primary)',
                }}
              >
                Agent
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* Clear Button */}
                <button
                  onClick={clearAgentChat}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: agentMessages.length > 0 ? 'pointer' : 'default',
                    color: 'var(--surbee-fg-tertiary)',
                    borderRadius: '9999px',
                    transition: 'all 150ms ease',
                    opacity: agentMessages.length > 0 ? 1 : 0.4,
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                  onMouseEnter={(e) => {
                    if (agentMessages.length > 0) {
                      e.currentTarget.style.backgroundColor = 'var(--surbee-bg-secondary, #f5f5f5)';
                      e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--surbee-fg-tertiary)';
                  }}
                  title="Clear chat"
                  disabled={agentMessages.length === 0}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                    <path d="M8 16H3v5" />
                  </svg>
                  Clear
                </button>
                {/* Close Button */}
                <button
                  onClick={() => setIsAgentOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '28px',
                    height: '28px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--surbee-fg-tertiary)',
                    borderRadius: '50%',
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--surbee-bg-secondary, #f5f5f5)';
                    e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--surbee-fg-tertiary)';
                  }}
                  title="Close"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Agent Messages */}
            <div
              className="flex-1 overflow-y-auto"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {agentMessages.length === 0 ? (
                /* Empty State with Suggestions */
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    gap: '24px',
                    paddingTop: '40px',
                  }}
                >
                  <div
                    style={{
                      textAlign: 'center',
                      color: 'var(--surbee-fg-tertiary)',
                      fontSize: '14px',
                    }}
                  >
                    Ask the agent anything about your survey
                  </div>

                  {/* Suggestion Pills */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      justifyContent: 'center',
                      maxWidth: '300px',
                    }}
                  >
                    {agentSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        style={{
                          padding: '8px 14px',
                          fontSize: '13px',
                          color: 'var(--surbee-fg-secondary)',
                          backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                          border: 'none',
                          borderRadius: '9999px',
                          cursor: 'pointer',
                          transition: 'all 150ms ease',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surbee-bg-tertiary, #e5e5e5)';
                          e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surbee-bg-secondary, #f5f5f5)';
                          e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Messages List */
                agentMessages.map((message) => (
                  <div key={message.id} style={{ marginBottom: '16px' }}>
                    {message.role === 'user' ? (
                      /* User message - dark bubble, right aligned */
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div
                          style={{
                            padding: '10px 16px',
                            backgroundColor: 'var(--surbee-chat-user-bg, rgb(38, 38, 38))',
                            color: 'var(--surbee-chat-user-fg, #ffffff)',
                            borderRadius: '18px',
                            maxWidth: 'min(85%, 280px)',
                            wordBreak: 'break-word',
                          }}
                        >
                          <p style={{
                            fontSize: '14px',
                            lineHeight: '1.5',
                            margin: 0,
                            whiteSpace: 'pre-wrap',
                          }}>
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* AI message - no bubble, just text */
                      <div
                        style={{
                          color: 'var(--surbee-fg-primary)',
                          fontSize: '14px',
                          lineHeight: '1.6',
                        }}
                      >
                        {message.content ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: String(message.content)
                                .replace(/^### (.*$)/gim, '<h3 style="font-size:15px;font-weight:600;margin:12px 0 8px 0;">$1</h3>')
                                .replace(/^## (.*$)/gim, '<h2 style="font-size:16px;font-weight:600;margin:16px 0 8px 0;">$1</h2>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                .replace(/^- (.*$)/gim, '<li style="margin-left:16px;margin-bottom:4px;">$1</li>')
                                .replace(/^\d+\. (.*$)/gim, '<li style="margin-left:16px;margin-bottom:4px;">$1</li>')
                                .replace(/\n/g, '<br>')
                            }}
                          />
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--surbee-fg-tertiary)', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                            <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--surbee-fg-tertiary)', borderRadius: '50%', animation: 'pulse 1s infinite 0.2s' }} />
                            <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--surbee-fg-tertiary)', borderRadius: '50%', animation: 'pulse 1s infinite 0.4s' }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Agent Input */}
            <div
              style={{
                padding: '12px 16px',
              }}
            >
              {/* Reference Button - Above chatbox, Only on Insights and Evaluation tabs */}
              {(activeTab === 'insights' || activeTab === 'evaluation') && (
                <div style={{ marginBottom: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsReferenceMode(!isReferenceMode)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '5px 10px',
                      gap: '5px',
                      backgroundColor: isReferenceMode ? 'rgba(59, 130, 246, 0.15)' : 'var(--surbee-bg-secondary, #f5f5f5)',
                      border: isReferenceMode ? '1px solid rgb(59, 130, 246)' : '1px solid var(--surbee-border-subtle, rgba(0,0,0,0.05))',
                      borderRadius: '9999px',
                      cursor: 'pointer',
                      color: isReferenceMode ? 'rgb(59, 130, 246)' : 'var(--surbee-fg-secondary)',
                      fontSize: '12px',
                      fontWeight: '500',
                      transition: 'all 150ms ease',
                    }}
                    title="Click to select content from the page"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    {isReferenceMode ? 'Selecting...' : 'Attach reference'}
                  </button>
                </div>
              )}

              {/* Reference Pills */}
              {agentReferences.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {agentReferences.map(ref => (
                    <div
                      key={ref.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '9999px',
                        fontSize: '12px',
                        color: 'rgb(59, 130, 246)',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ref.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAgentReference(ref.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '14px',
                          height: '14px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'rgb(59, 130, 246)',
                          padding: 0,
                        }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAgentSubmit}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '8px',
                    padding: '12px 14px',
                    backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                    borderRadius: agentInputHeight > 30 ? '15px' : '9999px',
                  }}
                >
                  <textarea
                    ref={agentTextareaRef}
                    value={agentInput}
                    onChange={handleAgentInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAgentSubmit(e as any);
                      }
                    }}
                    placeholder="Ask anything..."
                    disabled={isAgentLoading}
                    rows={1}
                    style={{
                      flex: 1,
                      border: 'none',
                      backgroundColor: 'transparent',
                      outline: 'none',
                      fontSize: '14px',
                      lineHeight: '1.5',
                      color: 'var(--surbee-fg-primary)',
                      resize: 'none',
                      minHeight: '24px',
                      maxHeight: '120px',
                      overflowY: 'auto',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    type={isAgentLoading ? 'button' : 'submit'}
                    onClick={isAgentLoading ? handleAgentStop : undefined}
                    disabled={!isAgentLoading && !agentInput.trim()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      flexShrink: 0,
                      backgroundColor: (isAgentLoading || agentInput.trim())
                        ? 'var(--surbee-fg-primary)'
                        : 'transparent',
                      border: 'none',
                      borderRadius: '50%',
                      cursor: (isAgentLoading || agentInput.trim()) ? 'pointer' : 'default',
                      color: (isAgentLoading || agentInput.trim()) ? 'white' : 'var(--surbee-fg-tertiary)',
                      opacity: (isAgentLoading || agentInput.trim()) ? 1 : 0.5,
                      transition: 'all 150ms ease',
                    }}
                  >
                    {isAgentLoading ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="6" width="12" height="12" rx="1" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </motion.div>
        )}
        </div>

        {/* Reference Mode Highlight Overlay */}
        {isReferenceMode && hoveredElement && (
          <div
            style={{
              position: 'fixed',
              top: hoveredElement.getBoundingClientRect().top - 2,
              left: hoveredElement.getBoundingClientRect().left - 2,
              width: hoveredElement.getBoundingClientRect().width + 4,
              height: hoveredElement.getBoundingClientRect().height + 4,
              border: '2px solid rgb(59, 130, 246)',
              borderRadius: '8px',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              pointerEvents: 'none',
              zIndex: 9999,
            }}
          />
        )}

        {/* Reference Mode Instructions Toast */}
        {isReferenceMode && (
          <div
            style={{
              position: 'fixed',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              padding: '10px 20px',
              backgroundColor: 'var(--surbee-toast-bg, rgb(38, 38, 38))',
              color: 'var(--surbee-toast-fg, white)',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: '500',
              zIndex: 10000,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            Click on any element to reference it
            <button
              onClick={() => setIsReferenceMode(false)}
              style={{
                marginLeft: '8px',
                padding: '2px 8px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        )}

        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    </ComponentRegistryProvider>
  );
}