"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TypeformButton, TypeformButtonContainer } from '@/components/ui/typeform-button';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PreviewTab } from '@/components/project-manage/PreviewTab';
import { ResultsTab } from '@/components/project-manage/ResultsTab';
import { AnalyticsTab } from '@/components/project-manage/AnalyticsTab';
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
function AskSurbeeComponent() {
  const [inputValue, setInputValue] = React.useState('');
  const [isFocused, setIsFocused] = React.useState(false);
  const hasText = inputValue.trim().length > 0;

  // Responsive widths - default to desktop sizes for SSR
  const baseWidth = '225px';
  const expandedWidth = '355px';

  return (
    <>
      <div
        className="ask-surbee-widget"
        style={{
          width: isFocused ? expandedWidth : baseWidth,
          height: "48px",
          transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <form
          className="relative"
          style={{
            border: "0px solid rgb(229, 231, 235)",
            boxSizing: "border-box",
            position: "relative",
          }}
        >
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
              placeholder="Ask Surbee"
              aria-label="Message Surbee"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
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
              hasText
                ? 'opacity-100 cursor-pointer hover:opacity-80 bg-white text-black'
                : 'opacity-50 cursor-not-allowed bg-gray-400 text-gray-600'
            }`}
            type="submit"
            aria-label="Send prompt to Surbee"
            disabled={!hasText}
            onClick={(e) => {
              e.preventDefault();
              if (hasText) {
                // Handle form submission here
                console.log('Sending:', inputValue);
                setInputValue('');
              }
            }}
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
              backgroundColor: hasText ? "white" : "rgba(255, 255, 255, 0.15)",
              color: hasText ? "black" : "rgba(255, 255, 255, 0.6)",
            }}
          >
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
          </button>
        </form>
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

export type TabType = 'preview' | 'results' | 'analytics' | 'share';

export default function ProjectManagePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('preview');

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

  const handleBack = () => {
    router.push('/dashboard/projects');
  };

  return (
    <AuthGuard>
      <div className="flex flex-col h-screen" style={{ backgroundColor: '#1C1C1C' }}>
        {/* Top Control Container */}
        <div className="flex items-center justify-center p-6" style={{ backgroundColor: '#1C1C1C' }}>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="w-px h-6" style={{ backgroundColor: '#404040' }} />

            <TypeformButtonContainer>
              <TypeformButton
                isActive={activeTab === 'preview'}
                onClick={() => setActiveTab('preview')}
              >
                Preview
              </TypeformButton>
              <TypeformButton
                isActive={activeTab === 'results'}
                onClick={() => setActiveTab('results')}
              >
                Results
              </TypeformButton>
              <TypeformButton
                isActive={activeTab === 'analytics'}
                onClick={() => setActiveTab('analytics')}
              >
                Analytics
              </TypeformButton>
              <TypeformButton
                isActive={activeTab === 'share'}
                onClick={() => setActiveTab('share')}
              >
                Share
              </TypeformButton>
            </TypeformButtonContainer>
          </div>
        </div>

        {/* Tab Content - Full Width */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'preview' && <PreviewTab projectId={projectId} sandboxBundle={sandboxBundle} />}
          {activeTab === 'results' && <ResultsTab projectId={projectId} />}
          {activeTab === 'analytics' && <AnalyticsTab projectId={projectId} />}
          {activeTab === 'share' && <ShareTab projectId={projectId} />}
        </div>

        {/* Ask Surbee Component - Sticky at Bottom */}
        <div className="ask-surbee-container">
          <AskSurbeeComponent />
        </div>
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
