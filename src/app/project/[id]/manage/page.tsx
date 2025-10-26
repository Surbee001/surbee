"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TypeformButton, TypeformButtonContainer } from '@/components/ui/typeform-button';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PreviewTab } from '@/components/project-manage/PreviewTab';
import { UnifiedInsightsTab } from '@/components/project-manage/UnifiedInsightsTab';
import { ShareTab } from '@/components/project-manage/ShareTab';
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
  const [inputValue, setInputValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [messages, setMessages] = React.useState<Array<{ id: string; type: 'user' | 'ai'; content: string; timestamp: Date }>>([]);
  const [showChat, setShowChat] = React.useState(false);
  const hasText = inputValue.trim().length > 0;

  // Responsive widths - compact when not focused, expand when focused or has text
  const compactWidth = '140px'; // Just fits "Ask Surbee"
  const inputWidth = '355px';   // Input field width
  const expandedWidth = showChat ? '500px' : (isFocused || hasText ? inputWidth : compactWidth);
  const chatHeight = showChat ? '400px' : '48px';

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
    setInputValue('');
    setIsLoading(true);
    setShowChat(true);

    // Simulate API delay
    setTimeout(() => {
      const mockResponse = generateMockResponse(inputValue, activeTab);
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai' as const,
        content: mockResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
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
          isFocused || hasText ? (
            // Expanded mode - show input field when focused or has text
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
            // Compact mode - just "Ask Surbee" text when not focused and no text
            <div
              className="relative h-full cursor-pointer"
              onClick={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              tabIndex={0}
              style={{
                border: "0px solid rgb(229, 231, 235)",
                boxSizing: "border-box",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                borderRadius: "24px",
                backgroundColor: "rgba(255, 255, 255, 0.08)",
                padding: "0.5rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                backdropFilter: "blur(16px)",
              }}
            >
              <span
                className="text-white font-medium select-none"
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Ask Surbee
              </span>
            </div>
          )
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
  const [activeTab, setActiveTab] = useState<TabType>('preview');
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const tabRefs = {
    preview: React.useRef<HTMLButtonElement>(null),
    insights: React.useRef<HTMLButtonElement>(null),
    share: React.useRef<HTMLButtonElement>(null),
  };

  // Sandbox bundle state for preview - use default content
  const [sandboxBundle, setSandboxBundle] = useState<SandboxBundle | null>({
    files: {
      "src/Survey.tsx": `export default function GeneratedSurvey() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm uppercase tracking-wider text-white/70 mb-6">
            Customer Discovery
          </div>
          <h1 className="text-4xl font-semibold mb-4">
            Tell us about your experience
          </h1>
          <p className="text-lg text-white/70">
            Your feedback helps us improve our platform
          </p>
        </header>

        <section className="space-y-8">
          <article className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-medium text-white/90 mb-6">
              How satisfied are you with our platform?
            </h2>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  className="h-12 w-12 rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/20 hover:border-white/20"
                >
                  {rating}
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-medium text-white/90 mb-6">
              What features do you use most?
            </h2>
            <div className="flex flex-wrap gap-3">
              {['Analytics', 'Survey Builder', 'Team Management', 'Integrations'].map((feature) => (
                <label
                  key={feature}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/80 transition hover:bg-white/10 cursor-pointer"
                >
                  <input type="checkbox" className="accent-white/80" />
                  {feature}
                </label>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="text-xl font-medium text-white/90 mb-6">
              Any additional feedback?
            </h2>
            <div className="relative">
              <textarea
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
                rows={4}
                placeholder="Share your thoughts..."
              />
            </div>
          </article>
        </section>

        <footer className="text-center mt-12">
          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3 text-black font-semibold transition hover:bg-gray-100">
            Submit Response
          </button>
        </footer>
      </div>
    </main>
  );
}`,
    },
    entry: 'src/Survey.tsx',
    dependencies: ['react', 'react-dom', 'lucide-react'],
  });

  React.useEffect(() => {
    const updateUnderline = () => {
      const activeRef = tabRefs[activeTab].current;
      if (activeRef) {
        const { offsetLeft, offsetWidth } = activeRef;
        setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
      }
    };

    updateUnderline();
    window.addEventListener('resize', updateUnderline);
    return () => window.removeEventListener('resize', updateUnderline);
  }, [activeTab]);

  const handleBack = () => {
    router.push('/dashboard/projects');
  };

  return (
    <AuthGuard>
      <div className="flex flex-col h-screen" style={{ backgroundColor: '#0f0f0f' }}>
        {/* Simple Title Navigation */}
        <div style={{
          padding: '40px 32px 20px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Back Button and Tabs */}
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', gap: '48px', alignItems: 'baseline' }}>
                {/* Back Button */}
                <button
                  onClick={handleBack}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    padding: 0,
                    paddingBottom: '8px',
                    transition: 'color 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'}
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <button
                  ref={tabRefs.preview}
                  onClick={() => setActiveTab('preview')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontWeight: activeTab === 'preview' ? '500' : '400',
                    fontSize: '42px',
                    lineHeight: '40px',
                    letterSpacing: '-0.05em',
                    color: activeTab === 'preview' ? 'white' : 'rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    padding: 0,
                    paddingBottom: '8px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => activeTab !== 'preview' && (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
                  onMouseLeave={(e) => activeTab !== 'preview' && (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)')}
                >
                  Preview
                </button>

                <button
                  ref={tabRefs.insights}
                  onClick={() => setActiveTab('insights')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontWeight: activeTab === 'insights' ? '500' : '400',
                    fontSize: '42px',
                    lineHeight: '40px',
                    letterSpacing: '-0.05em',
                    color: activeTab === 'insights' ? 'white' : 'rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    padding: 0,
                    paddingBottom: '8px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => activeTab !== 'insights' && (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
                  onMouseLeave={(e) => activeTab !== 'insights' && (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)')}
                >
                  Insights
                </button>

                <button
                  ref={tabRefs.share}
                  onClick={() => setActiveTab('share')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontFamily: 'var(--font-inter), sans-serif',
                    fontWeight: activeTab === 'share' ? '500' : '400',
                    fontSize: '42px',
                    lineHeight: '40px',
                    letterSpacing: '-0.05em',
                    color: activeTab === 'share' ? 'white' : 'rgba(255, 255, 255, 0.3)',
                    cursor: 'pointer',
                    padding: 0,
                    paddingBottom: '8px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => activeTab !== 'share' && (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)')}
                  onMouseLeave={(e) => activeTab !== 'share' && (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)')}
                >
                  Share
                </button>
              </div>

              {/* Sliding underline */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: underlineStyle.left,
                  width: underlineStyle.width,
                  height: '2px',
                  backgroundColor: 'white',
                  transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Tab Content - Full Width */}
        <div className="flex-1 overflow-auto min-h-0" style={{ paddingTop: '32px' }}>
          {activeTab === 'preview' && <PreviewTab projectId={projectId} sandboxBundle={sandboxBundle} />}
          {activeTab === 'insights' && <UnifiedInsightsTab projectId={projectId} />}
          {activeTab === 'share' && <ShareTab projectId={projectId} />}
        </div>

        {/* Ask Surbee Component - Sticky at Bottom - Hidden for Preview Tab */}
        {activeTab !== 'preview' && (
          <div className="ask-surbee-container">
            <AskSurbeeComponent activeTab={activeTab} projectId={projectId} />
          </div>
        )}
      </div>

      {/* Global Styles for Button Hover Effect */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
html {
  border: 0px solid;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
  text-size-adjust: 100%;
  tab-size: 4;
  font-variation-settings: normal;
  -webkit-tap-highlight-color: transparent;
  font-family: "__saans_cd5095","__saans_Fallback_cd5095",sans-serif;
  font-feature-settings: "dlig", "ss07", "calt" 0;
  appearance: none;
  color-scheme: dark;
}

body {
  border: 0px solid;
  box-sizing: border-box;
  -webkit-font-smoothing: antialiased;
  margin: 0px;
  line-height: inherit;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  background-color: hsl(0 0% 8%/var(--tw-bg-opacity,1));
  color: hsl(0 0% 100%/var(--tw-text-opacity,1));
}
`,
        }}
      />
    </AuthGuard>
  );
}
