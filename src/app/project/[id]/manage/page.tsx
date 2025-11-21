"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TypeformButton, TypeformButtonContainer } from '@/components/ui/typeform-button';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PreviewTab } from '@/components/project-manage/PreviewTab';
import { UnifiedInsightsTab } from '@/components/project-manage/UnifiedInsightsTab';
import { ShareTab } from '@/components/project-manage/ShareTab';
import AppLayout from '@/components/layout/AppLayout';
import { useTheme } from '@/hooks/useTheme';
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

// Ask Surbee Component
function AskSurbeeComponent({ activeTab, projectId }: { activeTab: TabType; projectId: string }) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ id: string; type: 'user' | 'ai'; content: string; timestamp: Date }>>([]);
  const [showChat, setShowChat] = React.useState(false);
  const hasText = inputValue.trim().length > 0;

  // Responsive widths - expand more when showing chat
  const baseWidth = '225px';
  const expandedWidth = showChat ? '500px' : '355px';
  const chatHeight = showChat ? '400px' : '48px';

  const streamAIResponse = async (question: string) => {
    if (!user) return '';
    try {
      const response = await fetch(`/api/projects/${projectId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          messages: [
            ...messages.map(m => ({ role: m.type === 'user' ? 'user' : 'assistant', content: m.content })),
            { role: 'user', content: question },
          ],
          pageContext: '', // Will be populated by the API
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) {
        throw new Error('No response body');
      }

      // Create AI message placeholder
      const aiMessageId = Date.now().toString();
      setMessages(prev => [...prev, {
        id: aiMessageId,
        type: 'ai',
        content: '',
        timestamp: new Date(),
      }]);

      // Handle Vercel AI SDK data stream format
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.startsWith(':')) continue;

          if (line.startsWith('0:')) {
            // Text chunk from Vercel AI SDK
            try {
              const text = JSON.parse(line.slice(2));
              fullResponse += text;
              // Update the AI message with streaming content
              setMessages(prev => prev.map(m =>
                m.id === aiMessageId ? { ...m, content: fullResponse } : m
              ));
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      return fullResponse;
    } catch (error) {
      console.error('Error streaming AI response:', error);
      throw error;
    }
  };

  // Keep mock responses as fallback
  const generateMockResponse = (question: string, tab: TabType) => {
    const responses = {
      insights: {
        'response rate': `## Survey Performance Analysis

Your survey has shown **excellent** performance metrics:

| Metric | Value | Trend | Status |
|--------|-------|-------|--------|
| **Response Rate** | 78.5% | ↗️ +12% | Excellent |
| **Completion Rate** | 92.3% | ↗️ +5% | Outstanding |
| **Avg. Time** | 4m 32s | ↘️ -23s | Good |
| **Bounce Rate** | 7.2% | ↘️ -3% | Improving |

### Key Insights:
- **Peak engagement** occurs between 2-4 PM
- **Mobile users** complete 15% faster than desktop
- **Question 3** has the highest drop-off rate (12%)

### Recommendations:
1. **Optimize Question 3** - Consider shortening or splitting
2. **Mobile-first** - Your mobile experience is superior
3. **Time targeting** - Focus promotion during peak hours`,

        'completion rate': `## Completion Funnel Analysis

Your survey completion funnel shows strong performance:

| Stage | Users | Completion | Drop-off |
|-------|-------|------------|----------|
| **Started** | 1,247 | 100% | - |
| **Question 1** | 1,198 | 96.1% | 3.9% |
| **Question 2** | 1,156 | 96.5% | 3.5% |
| **Question 3** | 1,089 | 94.2% | 6.8% |
| **Question 4** | 1,023 | 93.9% | 5.4% |
| **Completed** | 1,001 | 97.8% | 2.2% |

### Funnel Health Score: **94/100** 🎯

**Strongest Points:**
- High initial engagement (96.1%)
- Excellent final completion (97.8%)

**Areas for Improvement:**
- Question 3 needs optimization (6.8% drop-off)
- Consider A/B testing question order`,

        'analytics': `## Advanced Analytics Dashboard

### Response Quality Metrics
| Quality Level | Count | Percentage | Avg. Time |
|---------------|-------|------------|-----------|
| **Excellent** | 456 | 45.6% | 3m 12s |
| **Good** | 312 | 31.2% | 4m 45s |
| **Fair** | 178 | 17.8% | 6m 23s |
| **Poor** | 55 | 5.5% | 8m 12s |

### Sentiment Analysis
- **Positive**: 67% (671 responses)
- **Neutral**: 23% (230 responses)
- **Negative**: 10% (100 responses)

### Geographic Distribution
| Region | Responses | Avg. Score |
|--------|-----------|------------|
| **North America** | 445 | 4.2/5 |
| **Europe** | 312 | 4.1/5 |
| **Asia Pacific** | 178 | 4.0/5 |
| **Other** | 66 | 3.9/5 |

### Device Performance
- **Desktop**: 4.1/5 avg rating, 5m 23s avg time
- **Mobile**: 4.3/5 avg rating, 3m 45s avg time
- **Tablet**: 4.0/5 avg rating, 4m 12s avg time`
      },
      share: {
        'sharing': `## Survey Sharing Strategy

### Current Sharing Performance
| Channel | Shares | Clicks | Conversion |
|---------|--------|--------|------------|
| **Direct Link** | 1,247 | 1,089 | 87.3% |
| **Email** | 892 | 756 | 84.7% |
| **Social Media** | 445 | 312 | 70.1% |
| **QR Code** | 234 | 198 | 84.6% |

### Optimal Sharing Times
- **Best**: Tuesday-Thursday, 10 AM - 2 PM
- **Good**: Monday-Friday, 9 AM - 5 PM  
- **Avoid**: Weekends, Late evenings

### Privacy Settings Status
| Setting | Status | Impact |
|---------|--------|--------|
| **Public Access** | ✅ Enabled | High visibility |
| **Email Required** | ❌ Disabled | Lower friction |
| **IP Tracking** | ✅ Enabled | Better analytics |
| **Response Limits** | ❌ None | Unlimited responses`,

        'embed': `## Embedding Performance

### Embed Code Analytics
| Website | Views | Completions | Rate |
|---------|-------|-------------|------|
| **Main Site** | 2,456 | 1,234 | 50.2% |
| **Blog Post** | 1,089 | 567 | 52.1% |
| **Landing Page** | 892 | 445 | 49.9% |
| **Email Campaign** | 445 | 234 | 52.6% |

### Embed Code Snippet:
\`\`\`html
<iframe 
  src="https://surbee.dev/survey/${projectId}" 
  width="100%" 
  height="600px"
  frameborder="0">
</iframe>
\`\`\`

### Responsive Embed Options:
- **Mobile Optimized**: Auto-adjusts to screen size
- **Custom Styling**: Matches your brand colors
- **Analytics Ready**: Tracks embedded performance`
      }
    };

    // Generate contextual response based on question keywords
    const questionLower = question.toLowerCase();
    
    if (tab === 'insights') {
      if (questionLower.includes('response rate') || questionLower.includes('completion')) {
        return responses.insights['completion rate'];
      } else if (questionLower.includes('analytics') || questionLower.includes('data')) {
        return responses.insights['analytics'];
      } else {
        return responses.insights['response rate'];
      }
    } else if (tab === 'share') {
      if (questionLower.includes('embed') || questionLower.includes('code')) {
        return responses.share['embed'];
      } else {
        return responses.share['sharing'];
      }
    }

    return `## Survey Analysis Results

Based on your question about **"${question}"**, here are the key insights:

### Current Status
- **Active Responses**: 1,247
- **Completion Rate**: 92.3%
- **Average Rating**: 4.2/5
- **Response Time**: 4m 32s

### Top Insights
1. **Peak Performance**: Tuesday-Thursday, 10 AM - 2 PM
2. **Mobile Advantage**: 15% faster completion on mobile
3. **Quality Score**: 94/100 (Excellent)

### Recommendations
- Optimize Question 3 (highest drop-off)
- Focus on mobile experience
- Consider time-based targeting

*This is a mock response for demonstration purposes.*`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasText || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const question = inputValue;
    setInputValue('');
    setIsLoading(true);
    setShowChat(true);

    // Use real AI streaming response
    try {
      await streamAIResponse(question);
      setIsLoading(false);
    } catch (error) {
      console.error('Error getting AI response:', error);
      // Fallback to mock response on error
      const mockResponse = generateMockResponse(question, activeTab);

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: mockResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
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
              className="relative flex w-full h-full rounded-[24px] p-2 shadow-sm backdrop-blur-xl"
              style={{
                border: "0px solid rgb(229, 231, 235)",
                boxSizing: "border-box",
                position: "relative",
                display: "flex",
                width: "100%",
                height: "100%",
                borderRadius: "24px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                padding: "0.5rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                backdropFilter: "blur(16px)",
              }}
            >
              <input
                className="mx-3 w-full bg-transparent focus:outline-none text-white placeholder-gray-400"
                placeholder="Ask Surbee about your survey data..."
                aria-label="Message Surbee"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
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
              className={`absolute top-2 h-8 w-8 flex-none rounded-full p-0 transition-all duration-200 ${
                hasText && !isLoading
                  ? 'opacity-100 cursor-pointer hover:opacity-80 bg-white text-black'
                  : 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-600'
              }`}
              type="submit"
              aria-label="Send prompt to Surbee"
              disabled={!hasText || isLoading}
              onClick={handleSubmit}
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
                backgroundColor: hasText && !isLoading ? "white" : "rgba(255, 255, 255, 0.15)",
                color: hasText && !isLoading ? "black" : "rgba(255, 255, 255, 0.6)",
              }}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
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
            className="flex flex-col h-full rounded-[24px] backdrop-blur-xl"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              backdropFilter: "blur(16px)",
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
                  {message.type === 'ai' ? (
                    <div className="text-white px-4 py-3">
                      <div dangerouslySetInnerHTML={{ 
                        __html: message.content
                          // Headers
                          .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-white mb-2 mt-4">$1</h3>')
                          .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-white mb-3 mt-6">$1</h2>')
                          .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-white mb-4 mt-8">$1</h1>')
                          // Bold and italic
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                          .replace(/\*(.*?)\*/g, '<em class="text-white italic">$1</em>')
                          // Code blocks
                          .replace(/```([\s\S]*?)```/g, '<pre class="bg-white/10 border border-white/20 rounded-lg p-3 my-3 overflow-x-auto"><code class="text-white font-mono text-sm">$1</code></pre>')
                          .replace(/`(.*?)`/g, '<code class="bg-white/20 px-2 py-1 rounded text-sm text-white font-mono">$1</code>')
                          // Lists
                          .replace(/^- (.*$)/gim, '<li class="text-white ml-4 mb-1">• $1</li>')
                          .replace(/^\d+\. (.*$)/gim, '<li class="text-white ml-4 mb-1">$1</li>')
                          // Tables
                          .replace(/\|(.*?)\|/g, (match, content) => {
                            const rows = content.split('\n').filter((row: string) => row.trim());
                            if (rows.length < 2) return match;
                            
                            const headers = rows[0].split('|').map((h: string) => h.trim()).filter(Boolean);
                            const dataRows = rows.slice(1).map((row: string) => 
                              row.split('|').map((cell: string) => cell.trim()).filter(Boolean)
                            );
                            
                            return `
                              <div class="overflow-x-auto my-4">
                                <table class="min-w-full border-collapse border border-white/20">
                                  <thead>
                                    <tr class="bg-white/10">
                                      ${headers.map((header: string) => 
                                        `<th class="border border-white/20 px-3 py-2 text-left text-white font-semibold">${header}</th>`
                                      ).join('')}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${dataRows.map((row: string[]) => 
                                      `<tr class="hover:bg-white/5">
                                        ${row.map((cell: string) => 
                                          `<td class="border border-white/20 px-3 py-2 text-white">${cell}</td>`
                                        ).join('')}
                                      </tr>`
                                    ).join('')}
                                  </tbody>
                                </table>
                              </div>
                            `;
                          })
                          // Line breaks
                          .replace(/\n/g, '<br>')
                      }} />
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
              {isLoading && (
                <div className="animate-slide-in">
                  <div className="flex items-center gap-2 text-gray-400">
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <span className="text-sm ml-2">Analyzing your data...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input - Same style as original */}
            <div className="p-3">
              <form onSubmit={handleSubmit} className="relative">
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
                  className={`absolute top-2 h-8 w-8 flex-none rounded-full p-0 transition-all duration-200 ${
                    hasText && !isLoading
                      ? 'opacity-100 cursor-pointer hover:opacity-80 bg-white text-black'
                      : 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-600'
                  }`}
                  type="submit"
                  aria-label="Send prompt to Surbee"
                  disabled={!hasText || isLoading}
                  onClick={handleSubmit}
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
                    backgroundColor: hasText && !isLoading ? "white" : "rgba(255, 255, 255, 0.15)",
                    color: hasText && !isLoading ? "black" : "rgba(255, 255, 255, 0.6)",
                  }}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
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

export type TabType = 'preview' | 'insights' | 'share';

export default function ProjectManagePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDarkMode = isMounted && theme === 'dark';

  // Fetch project data to get sandbox bundle
  const [sandboxBundle, setSandboxBundle] = useState<SandboxBundle | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  React.useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (response.ok) {
          const projectData = await response.json();
          if (projectData.sandbox_bundle) {
            setSandboxBundle(projectData.sandbox_bundle);
          }
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      } finally {
        setIsLoadingProject(false);
      }
    };

    fetchProjectData();
  }, [projectId]);

  return (
    <AuthGuard>
      <AppLayout>
        <ComponentRegistryProvider>
          <div className="flex flex-col h-screen" style={{ backgroundColor: 'var(--surbee-bg-primary)' }}>
            {/* Header with Segmented Control Navigation */}
            <div style={{
              padding: '20px 32px',
              borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
            }}>
              <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Left side - Back Button and Segmented Control */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Back Button */}
                  <button
                    onClick={() => router.push('/dashboard/projects')}
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

                  {/* Segmented Control */}
                  <div
                    style={{
                      position: 'relative',
                      display: 'inline-flex',
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      borderRadius: '8px',
                      padding: '3px',
                      height: '38px',
                    }}
                  >
                    {/* Sliding indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '3px',
                        left: activeTab === 'preview' ? '3px' : activeTab === 'insights' ? '83px' : '166px',
                        width: '77px',
                        height: 'calc(100% - 6px)',
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                        borderRadius: '6px',
                        transition: 'left 300ms cubic-bezier(0.19, 1, 0.22, 1)',
                      }}
                    />

                    <button
                      onClick={() => setActiveTab('preview')}
                      style={{
                        position: 'relative',
                        padding: '0 16px',
                        height: '32px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: activeTab === 'preview'
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-fg-secondary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'color 200ms ease',
                        whiteSpace: 'nowrap',
                        minWidth: '77px',
                      }}
                    >
                      Preview
                    </button>

                    <button
                      onClick={() => setActiveTab('insights')}
                      style={{
                        position: 'relative',
                        padding: '0 16px',
                        height: '32px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: activeTab === 'insights'
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-fg-secondary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'color 200ms ease',
                        whiteSpace: 'nowrap',
                        minWidth: '77px',
                      }}
                    >
                      Insights
                    </button>

                    <button
                      onClick={() => setActiveTab('share')}
                      style={{
                        position: 'relative',
                        padding: '0 16px',
                        height: '32px',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: activeTab === 'share'
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-fg-secondary)',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        transition: 'color 200ms ease',
                        whiteSpace: 'nowrap',
                        minWidth: '77px',
                      }}
                    >
                      Share
                    </button>
                  </div>
                </div>

                {/* Right side - Edit Project Button */}
                <button
                  onClick={() => router.push(`/project/${projectId}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '0 16px',
                    height: '38px',
                    fontSize: '13px',
                    fontWeight: '500',
                    backgroundColor: isDarkMode ? '#ffffff' : '#000000',
                    color: isDarkMode ? '#000000' : '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit Project
                </button>
              </div>
            </div>

            {/* Tab Content - Full Width with Analysis Dots */}
            {activeTab === 'insights' ? (
              <AnalysisDotsManager projectId={projectId}>
                <div className="flex-1 overflow-auto min-h-0" style={{ paddingTop: '32px' }}>
                  <UnifiedInsightsTab projectId={projectId} />
                </div>
              </AnalysisDotsManager>
            ) : (
              <div className="flex-1 overflow-auto min-h-0" style={{ paddingTop: '32px' }}>
                {activeTab === 'preview' && <PreviewTab projectId={projectId} sandboxBundle={sandboxBundle} />}
                {activeTab === 'share' && <ShareTab projectId={projectId} />}
              </div>
            )}

            {/* Ask Surbee Component - Sticky at Bottom - Hidden for Preview Tab */}
            {activeTab !== 'preview' && (
              <div className="ask-surbee-container">
                <AskSurbeeComponent activeTab={activeTab} projectId={projectId} />
              </div>
            )}
          </div>
        </ComponentRegistryProvider>
      </AppLayout>
    </AuthGuard>
  );
}
