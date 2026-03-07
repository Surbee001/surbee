"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo, useDeferredValue } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Plus, Home, Library, Search, MessageSquare, Folder as FolderIcon, ArrowUp, User, ThumbsUp, HelpCircle, Gift, ChevronsLeft, Menu, AtSign, Settings2, Inbox, FlaskConical, BookOpen, X, Paperclip, History, Monitor, Smartphone, Tablet, ExternalLink, RotateCcw, Eye, GitBranch, Flag, PanelLeftClose, PanelLeftOpen, Share2, Copy, Hammer, Terminal, AlertTriangle, Settings as SettingsIcon, Sun, Moon, Laptop, CheckCircle2, Coins } from "lucide-react";
import UserNameBadge from "@/components/UserNameBadge";
import UserMenu from "@/components/ui/user-menu";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { File, Folder, Tree } from "@/components/ui/file-tree";
import ChatInputLight from "@/components/ui/chat-input-light";
import { AIModel } from "@/components/ui/model-selector";
import dynamic from 'next/dynamic'
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { ChatMessage } from '@/lib/agents/surbeeWorkflowV3';
import { AuthGuard } from "@/components/auth/AuthGuard";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { useTheme } from '@/hooks/useTheme';
import { useCredits } from '@/hooks/useCredits';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useChatSession } from '@/hooks/useChatSession';
import { useDashboardChat } from '@/hooks/useDashboardChat';
import { ThinkingDisplay } from '../../../../components/ThinkingUi/components/thinking-display';
import { ToolCall } from '../../../../components/ThinkingUi/components/tool-call';
import { AILoader } from '@/components/ai-loader';
import ProjectLoader from '@/components/ui/project-loader';
import { cn } from "@/lib/utils";
import { Response } from '@/components/ai-elements/response';
import { ToolCallTree } from '@/components/ToolCallTree';
import { AgentWorkflow, convertPartsToWorkflowBlocks } from '@/components/agent/AgentWorkflow';
import { VersionHistory } from '@/components/VersionHistory';
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ProjectSettings } from '@/components/project-manage/ProjectSettings';
import { ModalSandboxPreview } from "@/components/sandbox/ModalSandboxPreview";
import { useUserStore } from "@/stores/userStore";

interface ThinkingStep {
  id: string;
  content: string;
  status: "thinking" | "complete";
}

interface FunctionCallItem {
  id: string;
  toolName: string;
  fileName?: string;
  linesAdded?: number;
  linesDeleted?: number;
  status: "pending" | "complete";
  timestamp: Date;
}

type WorkflowContextChatMessage = {
  role: "user" | "assistant";
  text: string;
  agent?: string;
};

type SelectedElementSnapshot = {
  outerHTML: string;
  textContent: string;
  selector: string;
};

const MAX_CHAT_HISTORY_ENTRIES = 8;

const sanitizePlainTextForContext = (value: string | null | undefined, limit: number) => {
  if (!value) return "";
  const normalized = value.replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, Math.max(0, limit - 3))}...`;
};

const sanitizeHtmlSnippetForContext = (value: string | null | undefined, limit: number) => {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.length <= limit) return trimmed;
  return `${trimmed.slice(0, limit)}<!-- truncated -->`;
};

const computeElementSelector = (element: HTMLElement): string => {
  const segments: string[] = [];
  let node: HTMLElement | null = element;

  while (node && segments.length < 5) {
    let segment = node.tagName.toLowerCase();

    if (node.id) {
      segment += `#${node.id}`;
      segments.unshift(segment);
      break;
    }

    const classList = Array.from(node.classList).slice(0, 2);
    if (classList.length > 0) {
      segment += `.${classList.join(".")}`;
    }

    const parent = node.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (child) => (child as HTMLElement).tagName === node.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(node) + 1;
        segment += `:nth-of-type(${index})`;
      }
    }

    segments.unshift(segment);
    node = node.parentElement;

    if (node && node.tagName.toLowerCase() === "body") {
      segments.unshift("body");
      break;
    }
  }

  if (segments.length === 0) {
    return element.tagName.toLowerCase();
  }

  return segments.join(" > ");
};

const captureElementSnapshot = (element: HTMLElement | null): SelectedElementSnapshot | null => {
  if (!element) return null;
  return {
    outerHTML: sanitizeHtmlSnippetForContext(element.outerHTML, 8000),
    textContent: sanitizePlainTextForContext(element.textContent, 400),
    selector: sanitizePlainTextForContext(computeElementSelector(element), 250) || element.tagName.toLowerCase(),
  };
};

const buildChatHistoryPayload = (
  messages: ChatMessage[],
  limit = MAX_CHAT_HISTORY_ENTRIES
): WorkflowContextChatMessage[] => {
  if (!Array.isArray(messages) || messages.length === 0) return [];
  const recent = messages
    .filter((message) => typeof message.text === "string" && message.text.trim().length > 0)
    .slice(-limit);

  const history: WorkflowContextChatMessage[] = [];
  for (const entry of recent) {
    const safeText = sanitizePlainTextForContext(entry.text, 900);
    if (!safeText) continue;
    history.push({
      role: entry.isUser ? "user" : "assistant",
      text: safeText,
      agent: entry.isUser ? undefined : entry.agent,
    });
  }

  return history;
};

const buildChatSummary = (history: WorkflowContextChatMessage[], limit = 4): string | null => {
  if (!Array.isArray(history) || history.length === 0) return null;
  const recent = history.slice(-limit);
  const lines = recent
    .map((entry) => {
      const safe = sanitizePlainTextForContext(entry.text, 400);
      if (!safe) return null;
      const speaker =
        entry.role === "assistant" ? `Surbee${entry.agent ? ` (${entry.agent})` : ""}` : "User";
      return `${speaker}: ${safe}`;
    })
    .filter((line): line is string => Boolean(line));

  return lines.length > 0 ? lines.join("\n") : null;
};

// Publish Dropdown Component
function PublishDropdown({
  projectId,
  project,
  publishedUrl,
  isPublishing,
  sandboxAvailable,
  onPublish
}: {
  projectId: string;
  project: any;
  publishedUrl: string | null;
  isPublishing: boolean;
  sandboxAvailable: boolean;
  onPublish: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { user } = useAuth();
  const { userPreferences } = useUserPreferences();

  // State for editable fields
  const [surveyTitle, setSurveyTitle] = useState(project?.title || '');
  const [iconUrl, setIconUrl] = useState<string>('');
  const [description, setDescription] = useState('');
  const [shareImageUrl, setShareImageUrl] = useState<string>('');
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  // Initialize with cleaned projectId (remove "project_" prefix if present)
  const initialSlug = projectId.replace(/^project_/, '').substring(0, 8);
  const [customSlug, setCustomSlug] = useState<string>(initialSlug);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const iconFileInputRef = useRef<HTMLInputElement>(null);
  const shareImageFileInputRef = useRef<HTMLInputElement>(null);
  const titleDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const descriptionDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const urlDebounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setIsMounted(true); }, []);
  const isDarkMode = isMounted && resolvedTheme === 'dark';

  // Load share settings and project data on mount
  useEffect(() => {
    if (!projectId || !user) return;

    const loadShareSettings = async () => {
      try {
        // Load share settings from project_share_settings via API
        const response = await fetch(`/api/projects/${projectId}/share-settings`);
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setIconUrl(data.ogImage || '');
            setDescription(data.ogDescription || '');
            setShareImageUrl(data.ogImage || '');
            setDescriptionCharCount((data.ogDescription || '').length);
            
            // Auto-generate slug if it doesn't exist
            let slug = data.customSlug;
            if (!slug) {
              // Generate a unique slug from projectId
              // Remove "project_" prefix if present, then take first 8 chars
              const cleanId = projectId.replace(/^project_/, '');
              slug = cleanId.substring(0, 8);
              // Update state immediately so it shows right away
              setCustomSlug(slug);
              // Save the auto-generated slug
              try {
                const saveResponse = await fetch(`/api/projects/${projectId}/share-settings`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ customSlug: slug }),
                });
                if (!saveResponse.ok) {
                  const errorData = await saveResponse.json().catch(() => ({ error: 'Unknown error' }));
                  console.error('Failed to save auto-generated slug:', saveResponse.status, errorData);
                } else {
                  const responseData = await saveResponse.json();
                  if (responseData.customSlug) {
                    setCustomSlug(responseData.customSlug);
                  }
                }
              } catch (error) {
                console.error('Error saving auto-generated slug:', error);
              }
            } else {
              // If slug exists in database, use it
              setCustomSlug(slug);
            }
          }
        } else {
          // If API call fails, ensure we still have the auto-generated slug visible
          // (it's already set as initial state, but ensure it's saved)
          const cleanId = projectId.replace(/^project_/, '');
          const autoSlug = cleanId.substring(0, 8);
          try {
            const saveResponse = await fetch(`/api/projects/${projectId}/share-settings`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customSlug: autoSlug }),
            });
            if (!saveResponse.ok) {
              const errorData = await saveResponse.json().catch(() => ({ error: 'Unknown error' }));
              console.error('Failed to save auto-generated slug:', saveResponse.status, errorData);
            }
          } catch (error) {
            console.error('Error saving auto-generated slug:', error);
          }
        }
      } catch (error) {
        console.error('Error loading share settings:', error);
        // On error, the initial state already has the auto-generated slug
      }
    };

    loadShareSettings();
  }, [projectId, user]);

  // Update title when project changes
  useEffect(() => {
    if (project?.title) {
      setSurveyTitle(project.title);
    }
  }, [project?.title]);

  // Handle icon upload
  const handleIconUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/surbee/blob/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setIconUrl(data.url);
        await saveShareSettings({ ogImage: data.url });
      } else {
        console.error('Failed to upload icon');
      }
    } catch (error) {
      console.error('Error uploading icon:', error);
    }
  };

  // Handle share image upload
  const handleShareImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/surbee/blob/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setShareImageUrl(data.url);
        await saveShareSettings({ ogImage: data.url });
      } else {
        console.error('Failed to upload share image');
      }
    } catch (error) {
      console.error('Error uploading share image:', error);
    }
  };

  // Save share settings
  const saveShareSettings = useCallback(async (updates: { ogTitle?: string; ogDescription?: string; ogImage?: string; customSlug?: string }) => {
    if (!projectId || !user) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/projects/${projectId}/share-settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to save share settings:', response.status, errorData);
        return;
      }
      
      // Optionally update local state with response data
      const data = await response.json();
      if (data.customSlug && updates.customSlug) {
        setCustomSlug(data.customSlug);
      }
    } catch (error) {
      console.error('Error saving share settings:', error);
    } finally {
      setIsSaving(false);
    }
  }, [projectId, user]);

  // Save project title
  const saveProjectTitle = useCallback(async (title: string) => {
    if (!projectId || !user) return;

    try {
      setIsSaving(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        console.error('Failed to save project title');
      }
    } catch (error) {
      console.error('Error saving project title:', error);
    } finally {
      setIsSaving(false);
    }
  }, [projectId, user]);

  // Handle title change with debounce
  const handleTitleChange = useCallback((value: string) => {
    setSurveyTitle(value);
    // Clear existing timeout
    if (titleDebounceRef.current) {
      clearTimeout(titleDebounceRef.current);
    }
    // Debounce save
    titleDebounceRef.current = setTimeout(() => {
      if (value.trim() && value !== project?.title) {
        saveProjectTitle(value);
      }
    }, 500);
  }, [project?.title, saveProjectTitle]);

  // Handle description change with character count
  const handleDescriptionChange = useCallback((value: string) => {
    setDescription(value);
    setDescriptionCharCount(value.length);
    // Clear existing timeout
    if (descriptionDebounceRef.current) {
      clearTimeout(descriptionDebounceRef.current);
    }
    // Debounce save
    descriptionDebounceRef.current = setTimeout(() => {
      saveShareSettings({ ogDescription: value });
    }, 500);
  }, [saveShareSettings]);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Use the actual published URL from database if available, otherwise show a preview slug
  const urlSlug = publishedUrl || customSlug || projectId.replace(/^project_/, '').substring(0, 8);
  const displayUrl = `form.surbee.dev/${urlSlug}`;

  const copyUrl = async () => {
    try {
      const fullUrl = `https://form.surbee.dev/${urlSlug}`;
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  // Handle URL slug change with debounce
  const handleUrlSlugChange = useCallback((value: string) => {
    // Sanitize: only allow lowercase letters, numbers, and hyphens
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setCustomSlug(sanitized);
    // Clear existing timeout
    if (urlDebounceRef.current) {
      clearTimeout(urlDebounceRef.current);
    }
    // Debounce save
    urlDebounceRef.current = setTimeout(() => {
      const cleanId = projectId.replace(/^project_/, '');
      const defaultSlug = cleanId.substring(0, 8);
      if (sanitized && sanitized !== defaultSlug) {
        saveShareSettings({ customSlug: sanitized });
      }
    }, 500);
  }, [projectId, saveShareSettings]);

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPublishing || !sandboxAvailable}
        className="w-full px-3 py-1.5 rounded-full text-sm font-medium transition-all"
        style={{
          backgroundColor: (!sandboxAvailable || isPublishing) ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'white',
          color: (!sandboxAvailable || isPublishing) ? 'var(--surbee-fg-secondary)' : '#000',
          opacity: (isPublishing || !sandboxAvailable) ? 0.6 : 1,
          cursor: (isPublishing || !sandboxAvailable) ? 'not-allowed' : 'pointer',
          fontFamily: 'FK Grotesk, sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          lineHeight: '1.375rem'
        }}
      >
        {isPublishing ? 'Publishing...' : (project?.status === 'published' || publishedUrl) ? 'Update' : 'Publish'}
      </button>

      {isOpen && (
        <>
          <div
            dir="ltr"
            style={{
              border: "0px solid rgb(229, 231, 235)",
              boxSizing: "border-box",
              borderColor: "hsl(60 3% 15%)",
              textRendering: "optimizelegibility",
              WebkitFontSmoothing: "antialiased",
              scrollbarWidth: "thin",
              scrollbarColor:
                "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
              position: "absolute",
              right: "0px",
              top: "calc(100% + 4px)",
              minWidth: "max-content",
              willChange: "transform",
              zIndex: 1001,
              fontSynthesis: "none",
            }}
          >
            <div
              id="radix-_r_ar_"
              className="overflow-hidden rounded-xl text-popover-foreground shadow-md animate-in fade-in-0 duration-150 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150 z-[1001] flex max-h-[90vh] min-w-[300px] max-w-[300px] flex-col gap-3 border border-border bg-background p-0 md:max-w-[350px]"
              aria-labelledby="radix-_r_aq_"
              aria-orientation="vertical"
              dir="ltr"
              role="menu"
              tabIndex={-1}
              style={{
                border: "0px solid rgb(229, 231, 235)",
                boxSizing: "border-box",
                textRendering: "optimizelegibility",
                WebkitFontSmoothing: "antialiased",
                scrollbarWidth: "thin",
                scrollbarColor:
                  "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                zIndex: 1001,
                display: "flex",
                maxHeight: "90vh",
                minWidth: "300px",
                transformOrigin: "100% 0px",
                flexDirection: "column",
                gap: "0.75rem",
                overflow: "hidden",
                borderRadius: "calc(0.5rem * 1.5)",
                borderWidth: "1px",
                borderColor: "rgba(232, 232, 232, 0.08)",
                backgroundColor: "rgb(19, 19, 20)",
                padding: "0px",
                color: "#E8E8E8",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
                maxWidth: "380px",
                animationName: "enter",
                animationDuration: "0.15s",
                outline: "none",
                pointerEvents: "auto",
                fontSynthesis: "none",
              }}
            >
              <div
                className="flex-shrink-0"
                style={{
                  border: "0px solid rgb(229, 231, 235)",
                  boxSizing: "border-box",
                  borderColor: "hsl(60 3% 15%)",
                  textRendering: "optimizelegibility",
                  WebkitFontSmoothing: "antialiased",
                  scrollbarWidth: "thin",
                  scrollbarColor:
                    "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                  flexShrink: 0,
                  fontSynthesis: "none",
                }}
              >
                <div
                  className="flex flex-col gap-2 p-4 pb-0"
                  style={{
                    border: "0px solid rgb(229, 231, 235)",
                    boxSizing: "border-box",
                    borderColor: "hsl(60 3% 15%)",
                    textRendering: "optimizelegibility",
                    WebkitFontSmoothing: "antialiased",
                    scrollbarWidth: "thin",
                    scrollbarColor:
                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    padding: "1rem",
                    paddingBottom: "0px",
                    fontSynthesis: "none",
                  }}
                >
                  <div
                    className="flex items-center justify-between gap-2"
                    style={{
                      border: "0px solid rgb(229, 231, 235)",
                      boxSizing: "border-box",
                      borderColor: "hsl(60 3% 15%)",
                      textRendering: "optimizelegibility",
                      WebkitFontSmoothing: "antialiased",
                      scrollbarWidth: "thin",
                      scrollbarColor:
                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.5rem",
                      fontSynthesis: "none",
                    }}
                  >
                    <div
                      className="flex items-center gap-1.5"
                      style={{
                        border: "0px solid rgb(229, 231, 235)",
                        boxSizing: "border-box",
                        borderColor: "hsl(60 3% 15%)",
                        textRendering: "optimizelegibility",
                        WebkitFontSmoothing: "antialiased",
                        scrollbarWidth: "thin",
                        scrollbarColor:
                          "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                        fontSynthesis: "none",
                      }}
                    >
                      <h3
                        className="mt-0 leading-none"
                        style={{
                          border: "0px solid rgb(229, 231, 235)",
                          boxSizing: "border-box",
                          borderColor: "hsl(60 3% 15%)",
                          textRendering: "optimizelegibility",
                          WebkitFontSmoothing: "antialiased",
                          scrollbarWidth: "thin",
                          scrollbarColor:
                            "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                          margin: "0px",
                          fontSize: "1.125rem",
                          fontWeight: 480,
                          marginTop: "0px",
                          lineHeight: 1,
                          fontSynthesis: "none",
                        }}
                      >
                        Publish
                      </h3>
                    </div>
                  </div>
                  <p
                    className="text-sm text-muted-foreground"
                    style={{
                      border: "0px solid rgb(229, 231, 235)",
                      boxSizing: "border-box",
                      borderColor: "hsl(60 3% 15%)",
                      textRendering: "optimizelegibility",
                      WebkitFontSmoothing: "antialiased",
                      scrollbarWidth: "thin",
                      scrollbarColor:
                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                      margin: "0px",
                      fontSize: "0.875rem",
                      color: "hsl(40 9% 75%)",
                      fontSynthesis: "none",
                    }}
                  >
                    Make your survey live and track its performance.
                  </p>
                </div>
              </div>
              <div
                className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden"
                style={{
                  border: "0px solid rgb(229, 231, 235)",
                  boxSizing: "border-box",
                  borderColor: "hsl(60 3% 15%)",
                  textRendering: "optimizelegibility",
                  WebkitFontSmoothing: "antialiased",
                  scrollbarWidth: "thin",
                  scrollbarColor:
                    "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                  display: "flex",
                  minHeight: "0px",
                  flex: "1 1 0%",
                  flexDirection: "column",
                  gap: "0.5rem",
                  overflowY: "auto",
                  overflowX: "hidden",
                  fontSynthesis: "none",
                }}
              >
                <div
                  className="flex flex-col gap-2"
                  style={{
                    border: "0px solid rgb(229, 231, 235)",
                    boxSizing: "border-box",
                    borderColor: "hsl(60 3% 15%)",
                    textRendering: "optimizelegibility",
                    WebkitFontSmoothing: "antialiased",
                    scrollbarWidth: "thin",
                    scrollbarColor:
                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    fontSynthesis: "none",
                  }}
                >
                  <div
                    className="mx-4 flex items-center gap-2"
                    style={{
                      border: "0px solid rgb(229, 231, 235)",
                      boxSizing: "border-box",
                      borderColor: "hsl(60 3% 15%)",
                      textRendering: "optimizelegibility",
                      WebkitFontSmoothing: "antialiased",
                      scrollbarWidth: "thin",
                      scrollbarColor:
                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                      marginLeft: "1rem",
                      marginRight: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSynthesis: "none",
                    }}
                  >
                    <div
                      className="gap-2 transition-colors duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none text-primary underline-offset-4 hover:underline py-2 mx-0 h-10 w-full whitespace-nowrap md:h-8 border border-input rounded-md px-2.5 shadow-sm text-sm font-normal flex items-center justify-between"
                      style={{
                        border: "0px solid rgb(229, 231, 235)",
                        boxSizing: "border-box",
                        textRendering: "optimizelegibility",
                        WebkitFontSmoothing: "antialiased",
                        scrollbarWidth: "thin",
                        scrollbarColor:
                          "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                        marginLeft: "0px",
                        marginRight: "0px",
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        whiteSpace: "nowrap",
                        borderRadius: "calc(0.5rem - 2px)",
                        borderWidth: "1px",
                        borderColor: "hsl(60 1% 25%)",
                        paddingLeft: "0.625rem",
                        paddingRight: "0.625rem",
                        paddingTop: "0.5rem",
                        paddingBottom: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 400,
                        color: "hsl(45 40% 98%)",
                        textUnderlineOffset: "4px",
                        boxShadow:
                          "var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),0 1px 2px 0 rgb(0 0 0/0.05)",
                        transitionProperty:
                          "color, background-color, border-color, text-decoration-color, fill, stroke",
                        transitionDuration: "0.1s",
                        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                        animationDuration: "0.1s",
                        animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                        height: "2rem",
                        fontSynthesis: "none",
                      }}
                    >
                      <span
                        className="flex min-w-0 flex-1 items-center text-base md:text-sm"
                        style={{
                          border: "0px solid rgb(229, 231, 235)",
                          boxSizing: "border-box",
                          borderColor: "hsl(60 3% 15%)",
                          textRendering: "optimizelegibility",
                          WebkitFontSmoothing: "antialiased",
                          scrollbarWidth: "thin",
                          scrollbarColor:
                            "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                          display: "flex",
                          minWidth: "0px",
                          flex: "1 1 0%",
                          alignItems: "center",
                          fontSize: "0.875rem",
                          fontSynthesis: "none",
                        }}
                      >
                        <span
                          className="min-w-0 flex-1 truncate text-left"
                          style={{
                            border: "0px solid rgb(229, 231, 235)",
                            boxSizing: "border-box",
                            borderColor: "hsl(60 3% 15%)",
                            textRendering: "optimizelegibility",
                            WebkitFontSmoothing: "antialiased",
                            scrollbarWidth: "thin",
                            scrollbarColor:
                              "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                            minWidth: "0px",
                            flex: "1 1 0%",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            textAlign: "left",
                            fontSynthesis: "none",
                          }}
                        >
                          {isEditingUrl ? (
                            <>
                              <span
                                className="font-normal text-muted-foreground"
                                style={{
                                  fontWeight: 400,
                                  color: "hsl(40 9% 75%)",
                                }}
                              >
                                form.surbee.dev/
                              </span>
                              <input
                                type="text"
                                value={customSlug}
                                onChange={(e) => handleUrlSlugChange(e.target.value)}
                                onBlur={() => setIsEditingUrl(false)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    setIsEditingUrl(false);
                                  }
                                }}
                                autoFocus
                                className="bg-transparent border-none outline-none flex-1 min-w-0"
                                style={{
                                  color: "hsl(45 40% 98%)",
                                  fontFamily: "inherit",
                                  fontSize: "0.875rem",
                                }}
                              />
                            </>
                          ) : (
                            <a
                              href={`https://form.surbee.dev/${urlSlug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              className="flex items-center min-w-0 flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                              style={{
                                textDecoration: "none",
                                color: "inherit",
                              }}
                            >
                              <span
                                className="font-normal text-muted-foreground"
                                style={{
                                  border: "0px solid rgb(229, 231, 235)",
                                  boxSizing: "border-box",
                                  borderColor: "hsl(60 3% 15%)",
                                  textRendering: "optimizelegibility",
                                  WebkitFontSmoothing: "antialiased",
                                  scrollbarWidth: "thin",
                                  scrollbarColor:
                                    "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                  fontWeight: 400,
                                  color: "hsl(40 9% 75%)",
                                  fontSynthesis: "none",
                                }}
                              >
                                form.surbee.dev/
                              </span>
                              <span
                                className="font-normal text-foreground"
                                style={{
                                  border: "0px solid rgb(229, 231, 235)",
                                  boxSizing: "border-box",
                                  borderColor: "hsl(60 3% 15%)",
                                  textRendering: "optimizelegibility",
                                  WebkitFontSmoothing: "antialiased",
                                  scrollbarWidth: "thin",
                                  scrollbarColor:
                                    "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                  fontWeight: 400,
                                  color: "hsl(45 40% 98%)",
                                  fontSynthesis: "none",
                                }}
                              >
                                {urlSlug}
                              </span>
                            </a>
                          )}
                        </span>
                      </span>
                      <button
                        className="ml-2 flex-shrink-0 rounded p-0.5"
                        aria-label="Copy URL"
                        onClick={copyUrl}
                        style={{
                          border: "0px solid rgb(229, 231, 235)",
                          boxSizing: "border-box",
                          borderColor: "hsl(60 3% 15%)",
                          textRendering: "optimizelegibility",
                          WebkitFontSmoothing: "antialiased",
                          scrollbarWidth: "thin",
                          scrollbarColor:
                            "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                          margin: "0px",
                          fontFamily: "inherit",
                          fontFeatureSettings: "inherit",
                          fontVariationSettings: "inherit",
                          fontSize: "100%",
                          fontWeight: "inherit",
                          lineHeight: "inherit",
                          letterSpacing: "inherit",
                          color: "inherit",
                          textTransform: "none",
                          appearance: "button",
                          backgroundColor: "transparent",
                          backgroundImage: "none",
                          cursor: "pointer",
                          marginLeft: "0.5rem",
                          flexShrink: 0,
                          borderRadius: "0.25rem",
                          padding: "0.125rem",
                          fontSynthesis: "none",
                        }}
                      >
                        <svg
                          className="shrink-0 h-4 w-4 text-muted-foreground"
                          height="100%"
                          width="100%"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            border: "0px solid rgb(229, 231, 235)",
                            boxSizing: "border-box",
                            borderColor: "hsl(60 3% 15%)",
                            textRendering: "optimizelegibility",
                            WebkitFontSmoothing: "antialiased",
                            scrollbarWidth: "thin",
                            scrollbarColor:
                              "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                            display: "block",
                            verticalAlign: "middle",
                            height: "1rem",
                            width: "1rem",
                            flexShrink: 0,
                            color: "hsl(40 9% 75%)",
                            pointerEvents: "none",
                            fontSynthesis: "none",
                          }}
                        >
                          <path
                            d="M19.25 10c0-.69-.56-1.25-1.25-1.25h-6c-.69 0-1.25.56-1.25 1.25v8c0 .69.56 1.25 1.25 1.25h6c.69 0 1.25-.56 1.25-1.25zm-6-4c0-.69-.56-1.25-1.25-1.25H6c-.69 0-1.25.56-1.25 1.25v8c0 .69.56 1.25 1.25 1.25h3.25V10A2.75 2.75 0 0 1 12 7.25h1.25zm1.5 1.25H18A2.75 2.75 0 0 1 20.75 10v8A2.75 2.75 0 0 1 18 20.75h-6A2.75 2.75 0 0 1 9.25 18v-1.25H6A2.75 2.75 0 0 1 3.25 14V6A2.75 2.75 0 0 1 6 3.25h6A2.75 2.75 0 0 1 14.75 6z"
                            fill="currentColor"
                            style={{
                              border: "0px solid rgb(229, 231, 235)",
                              boxSizing: "border-box",
                              borderColor: "hsl(60 3% 15%)",
                              textRendering: "optimizelegibility",
                              WebkitFontSmoothing: "antialiased",
                              scrollbarWidth: "thin",
                              scrollbarColor:
                                "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                              fontSynthesis: "none",
                            }}
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div
                    className="flex items-center px-4"
                    style={{
                      border: "0px solid rgb(229, 231, 235)",
                      boxSizing: "border-box",
                      borderColor: "hsl(60 3% 15%)",
                      textRendering: "optimizelegibility",
                      WebkitFontSmoothing: "antialiased",
                      scrollbarWidth: "thin",
                      scrollbarColor:
                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "1rem",
                      paddingRight: "1rem",
                      fontSynthesis: "none",
                    }}
                  >
                    <div
                      className="flex w-full items-center gap-2"
                      style={{
                        border: "0px solid rgb(229, 231, 235)",
                        boxSizing: "border-box",
                        borderColor: "hsl(60 3% 15%)",
                        textRendering: "optimizelegibility",
                        WebkitFontSmoothing: "antialiased",
                        scrollbarWidth: "thin",
                        scrollbarColor:
                          "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                        display: "flex",
                        width: "100%",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontSynthesis: "none",
                      }}
                    >
                      <button
                        onClick={() => setIsEditingUrl(true)}
                        className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none bg-secondary text-secondary-foreground shadow-sm hover:bg-muted-hover rounded-md py-2 gap-1.5 h-9 px-3 text-sm md:h-7 md:px-2 md:text-xs"
                        style={{
                          border: "0px solid rgb(229, 231, 235)",
                          boxSizing: "border-box",
                          borderColor: "hsl(60 3% 15%)",
                          textRendering: "optimizelegibility",
                          WebkitFontSmoothing: "antialiased",
                          scrollbarWidth: "thin",
                          scrollbarColor:
                            "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                          margin: "0px",
                          padding: "0px",
                          fontFamily: "inherit",
                          fontFeatureSettings: "inherit",
                          fontVariationSettings: "inherit",
                          lineHeight: "inherit",
                          letterSpacing: "inherit",
                          textTransform: "none",
                          appearance: "button",
                          backgroundImage: "none",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "0.375rem",
                          whiteSpace: "nowrap",
                          borderRadius: "calc(0.5rem - 2px)",
                          backgroundColor: "hsl(60 3% 15%)",
                          paddingTop: "0.5rem",
                          paddingBottom: "0.5rem",
                          fontWeight: 480,
                          color: "hsl(45 40% 98%)",
                          boxShadow:
                            "var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),0 1px 2px 0 rgb(0 0 0/0.05)",
                          transitionProperty:
                            "color, background-color, border-color, text-decoration-color, fill, stroke",
                          transitionDuration: "0.1s",
                          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                          animationDuration: "0.1s",
                          animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                          height: "1.75rem",
                          paddingLeft: "0.5rem",
                          paddingRight: "0.5rem",
                          fontSize: "0.75rem",
                          fontSynthesis: "none",
                        }}
                      >
                        Edit URL
                      </button>
                    </div>
                  </div>
                </div>
                <div
                  className="w-full md:min-w-[350px]"
                  style={{
                    border: "0px solid rgb(229, 231, 235)",
                    boxSizing: "border-box",
                    borderColor: "hsl(60 3% 15%)",
                    textRendering: "optimizelegibility",
                    WebkitFontSmoothing: "antialiased",
                    scrollbarWidth: "thin",
                    scrollbarColor:
                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                    width: "100%",
                    minWidth: "350px",
                    fontSynthesis: "none",
                  }}
                >
                  <div
                    className="border-b-0"
                    style={{
                      border: "0px solid rgb(229, 231, 235)",
                      boxSizing: "border-box",
                      borderColor: "hsl(60 3% 15%)",
                      textRendering: "optimizelegibility",
                      WebkitFontSmoothing: "antialiased",
                      scrollbarWidth: "thin",
                      scrollbarColor:
                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                      borderBottomWidth: "0px",
                      fontSynthesis: "none",
                    }}
                  >
                    <h3
                      className="flex"
                      style={{
                        border: "0px solid rgb(229, 231, 235)",
                        boxSizing: "border-box",
                        borderColor: "hsl(60 3% 15%)",
                        textRendering: "optimizelegibility",
                        WebkitFontSmoothing: "antialiased",
                        scrollbarWidth: "thin",
                        scrollbarColor:
                          "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                        margin: "0px",
                        fontSize: "1.125rem",
                        fontWeight: 480,
                        display: "flex",
                        fontSynthesis: "none",
                      }}
                    >
                      <button
                        id="radix-_r_cc_"
                        className={`flex flex-1 items-center justify-between text-left text-sm font-medium transition-all ${isAccordionOpen ? '[&>svg]:rotate-90' : ''} px-4 py-2 hover:no-underline`}
                        type="button"
                        aria-controls="radix-_r_cd_"
                        aria-expanded={isAccordionOpen}
                        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
                        style={{
                          border: "0px solid rgb(229, 231, 235)",
                          boxSizing: "border-box",
                          borderColor: "hsl(60 3% 15%)",
                          textRendering: "optimizelegibility",
                          WebkitFontSmoothing: "antialiased",
                          scrollbarWidth: "thin",
                          scrollbarColor:
                            "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                          margin: "0px",
                          padding: "0px",
                          fontFamily: "inherit",
                          fontFeatureSettings: "inherit",
                          fontVariationSettings: "inherit",
                          lineHeight: "inherit",
                          letterSpacing: "inherit",
                          color: "inherit",
                          textTransform: "none",
                          appearance: "button",
                          backgroundColor: "transparent",
                          backgroundImage: "none",
                          cursor: "pointer",
                          display: "flex",
                          flex: "1 1 0%",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingLeft: "1rem",
                          paddingRight: "1rem",
                          paddingTop: "0.5rem",
                          paddingBottom: "0.5rem",
                          textAlign: "left",
                          fontSize: "0.875rem",
                          fontWeight: 480,
                          transitionProperty: "all",
                          transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                          transitionDuration: "0.15s",
                          fontSynthesis: "none",
                        }}
                      >
                        <div
                          className="text-sm"
                          style={{
                            border: "0px solid rgb(229, 231, 235)",
                            boxSizing: "border-box",
                            borderColor: "hsl(60 3% 15%)",
                            textRendering: "optimizelegibility",
                            WebkitFontSmoothing: "antialiased",
                            scrollbarWidth: "thin",
                            scrollbarColor:
                              "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                            fontSize: "0.875rem",
                            fontSynthesis: "none",
                          }}
                        >
                          Survey info
                        </div>
                        <svg
                          className="h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200"
                          height="100%"
                          width="100%"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          style={{
                            border: "0px solid rgb(229, 231, 235)",
                            boxSizing: "border-box",
                            borderColor: "hsl(60 3% 15%)",
                            textRendering: "optimizelegibility",
                            WebkitFontSmoothing: "antialiased",
                            scrollbarWidth: "thin",
                            scrollbarColor:
                              "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                            display: "block",
                            verticalAlign: "middle",
                            height: "1.25rem",
                            width: "1.25rem",
                            flexShrink: 0,
                            color: "hsl(40 9% 75%)",
                            transitionProperty: "transform",
                            transitionTimingFunction:
                              "cubic-bezier(0.4, 0, 0.2, 1)",
                            transitionDuration: "0.2s",
                            animationDuration: "0.2s",
                            fontSynthesis: "none",
                          }}
                        >
                          <path
                            d="M9.47 6.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06L13.94 12 9.47 7.53a.75.75 0 0 1 0-1.06"
                            fill="currentColor"
                            style={{
                              border: "0px solid rgb(229, 231, 235)",
                              boxSizing: "border-box",
                              borderColor: "hsl(60 3% 15%)",
                              textRendering: "optimizelegibility",
                              WebkitFontSmoothing: "antialiased",
                              scrollbarWidth: "thin",
                              scrollbarColor:
                                "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                              fontSynthesis: "none",
                            }}
                          />
                        </svg>
                      </button>
                    </h3>
                    <div
                      id="radix-_r_cd_"
                      className="overflow-hidden"
                      aria-labelledby="radix-_r_cc_"
                      role="region"
                      style={{
                        display: isAccordionOpen ? 'block' : 'none',
                        border: "0px solid rgb(229, 231, 235)",
                          boxSizing: "border-box",
                          borderColor: "hsl(60 3% 15%)",
                          textRendering: "optimizelegibility",
                          WebkitFontSmoothing: "antialiased",
                          scrollbarWidth: "thin",
                          scrollbarColor:
                            "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                          overflow: "hidden",
                          fontSynthesis: "none",
                        }}
                      >
                        <div
                          className="pt-0 px-4 pb-1"
                          style={{
                            border: "0px solid rgb(229, 231, 235)",
                            boxSizing: "border-box",
                            borderColor: "hsl(60 3% 15%)",
                            textRendering: "optimizelegibility",
                            WebkitFontSmoothing: "antialiased",
                            scrollbarWidth: "thin",
                            scrollbarColor:
                              "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                            paddingLeft: "1rem",
                            paddingRight: "1rem",
                            paddingBottom: "0.25rem",
                            paddingTop: "0px",
                            fontSynthesis: "none",
                          }}
                        >
                          <div
                            className="space-y-2"
                            style={{
                              border: "0px solid rgb(229, 231, 235)",
                              boxSizing: "border-box",
                              borderColor: "hsl(60 3% 15%)",
                              textRendering: "optimizelegibility",
                              WebkitFontSmoothing: "antialiased",
                              scrollbarWidth: "thin",
                              scrollbarColor:
                                "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                              fontSynthesis: "none",
                            }}
                          >
                            <div
                              className="space-y-1"
                              style={{
                                border: "0px solid rgb(229, 231, 235)",
                                boxSizing: "border-box",
                                borderColor: "hsl(60 3% 15%)",
                                textRendering: "optimizelegibility",
                                WebkitFontSmoothing: "antialiased",
                                scrollbarWidth: "thin",
                                scrollbarColor:
                                  "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                fontSynthesis: "none",
                              }}
                            >
                              <label
                                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 inline-flex items-center gap-1 text-xs"
                                htmlFor="title"
                                style={{
                                  border: "0px solid rgb(229, 231, 235)",
                                  boxSizing: "border-box",
                                  borderColor: "hsl(60 3% 15%)",
                                  textRendering: "optimizelegibility",
                                  WebkitFontSmoothing: "antialiased",
                                  scrollbarWidth: "thin",
                                  scrollbarColor:
                                    "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  fontSize: "0.75rem",
                                  fontWeight: 480,
                                  fontSynthesis: "none",
                                }}
                              >
                                Icon & title
                                <svg
                                  className="shrink-0 h-4 w-4 text-muted-foreground"
                                  height="100%"
                                  width="100%"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{
                                    border: "0px solid rgb(229, 231, 235)",
                                    boxSizing: "border-box",
                                    borderColor: "hsl(60 3% 15%)",
                                    textRendering: "optimizelegibility",
                                    WebkitFontSmoothing: "antialiased",
                                    scrollbarWidth: "thin",
                                    scrollbarColor:
                                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                    display: "block",
                                    verticalAlign: "middle",
                                    height: "1rem",
                                    width: "1rem",
                                    flexShrink: 0,
                                    color: "hsl(40 9% 75%)",
                                    fontSynthesis: "none",
                                  }}
                                >
                                  <path
                                    d="M20.25 12a8.25 8.25 0 1 0-16.5 0 8.25 8.25 0 0 0 16.5 0m-9 1c0-.84.333-1.644.927-2.237l.879-.88a.665.665 0 0 0-.47-1.133H11.5a.75.75 0 0 0-.746.673l-.008.154A.75.75 0 0 1 9.25 9.5a2.25 2.25 0 0 1 2.25-2.25h1.086a2.164 2.164 0 0 1 1.53 3.694l-.879.88A1.67 1.67 0 0 0 12.75 13a.75.75 0 0 1-1.5 0m10.5-1c0 5.385-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25s9.75 4.365 9.75 9.75"
                                    fill="currentColor"
                                    style={{
                                      border: "0px solid rgb(229, 231, 235)",
                                      boxSizing: "border-box",
                                      borderColor: "hsl(60 3% 15%)",
                                      textRendering: "optimizelegibility",
                                      WebkitFontSmoothing: "antialiased",
                                      scrollbarWidth: "thin",
                                      scrollbarColor:
                                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                      fontSynthesis: "none",
                                    }}
                                  />
                                  <path
                                    d="M13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
                                    fill="currentColor"
                                    style={{
                                      border: "0px solid rgb(229, 231, 235)",
                                      boxSizing: "border-box",
                                      borderColor: "hsl(60 3% 15%)",
                                      textRendering: "optimizelegibility",
                                      WebkitFontSmoothing: "antialiased",
                                      scrollbarWidth: "thin",
                                      scrollbarColor:
                                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                      fontSynthesis: "none",
                                    }}
                                  />
                                </svg>
                              </label>
                              <div
                                className="relative h-16 overflow-hidden rounded-md border border-input bg-secondary p-4 pb-0 shadow-sm transition-colors focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-0"
                                style={{
                                  border: "0px solid rgb(229, 231, 235)",
                                  boxSizing: "border-box",
                                  textRendering: "optimizelegibility",
                                  WebkitFontSmoothing: "antialiased",
                                  scrollbarWidth: "thin",
                                  scrollbarColor:
                                    "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                  position: "relative",
                                  height: "4rem",
                                  overflow: "hidden",
                                  borderRadius: "calc(0.5rem - 2px)",
                                  borderWidth: "1px",
                                  borderColor: "hsl(60 1% 25%)",
                                  backgroundColor: "hsl(60 3% 15%)",
                                  padding: "1rem",
                                  paddingBottom: "0px",
                                  boxShadow:
                                    "var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),0 1px 2px 0 rgb(0 0 0/0.05)",
                                  transitionProperty:
                                    "color, background-color, border-color, text-decoration-color, fill, stroke",
                                  transitionTimingFunction:
                                    "cubic-bezier(0.4, 0, 0.2, 1)",
                                  transitionDuration: "0.15s",
                                  marginTop: "calc(.25rem * calc(1 - 0))",
                                  marginBottom: "calc(.25rem * 0)",
                                  fontSynthesis: "none",
                                }}
                              >
                                <div
                                  className="absolute bottom-0 left-4 right-4 top-3 rounded-t-xl bg-background shadow-md"
                                  style={{
                                    border: "0px solid rgb(229, 231, 235)",
                                    boxSizing: "border-box",
                                    borderColor: "hsl(60 3% 15%)",
                                    textRendering: "optimizelegibility",
                                    WebkitFontSmoothing: "antialiased",
                                    scrollbarWidth: "thin",
                                    scrollbarColor:
                                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                    position: "absolute",
                                    bottom: "0px",
                                    left: "1rem",
                                    right: "1rem",
                                    top: "0.75rem",
                                    borderTopLeftRadius: "calc(0.5rem * 1.5)",
                                    borderTopRightRadius: "calc(0.5rem * 1.5)",
                                    backgroundColor: "hsl(0 0% 11%)",
                                    boxShadow:
                                      "var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),0 4px 6px -1px rgb(0 0 0/0.1),0 2px 4px -2px rgb(0 0 0/0.1)",
                                    fontSynthesis: "none",
                                  }}
                                />
                                <div
                                  className="absolute bottom-0 left-4 right-4 top-3 z-10 flex items-center gap-2"
                                  style={{
                                    border: "0px solid rgb(229, 231, 235)",
                                    boxSizing: "border-box",
                                    borderColor: "hsl(60 3% 15%)",
                                    textRendering: "optimizelegibility",
                                    WebkitFontSmoothing: "antialiased",
                                    scrollbarWidth: "thin",
                                    scrollbarColor:
                                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                    position: "absolute",
                                    bottom: "0px",
                                    left: "1rem",
                                    right: "1rem",
                                    top: "0.75rem",
                                    zIndex: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.5rem",
                                    paddingLeft: "0.5rem",
                                    fontSynthesis: "none",
                                  }}
                                >
                                  <button
                                    onClick={() => iconFileInputRef.current?.click()}
                                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none hover:bg-accent/50 h-6 w-6 flex-shrink-0 cursor-pointer"
                                    type="button"
                                    style={{
                                      border: "0px solid rgb(229, 231, 235)",
                                      boxSizing: "border-box",
                                      textRendering: "optimizelegibility",
                                      WebkitFontSmoothing: "antialiased",
                                      scrollbarWidth: "thin",
                                      scrollbarColor:
                                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                      margin: "0px",
                                      padding: "0px",
                                      fontFamily: "inherit",
                                      fontFeatureSettings: "inherit",
                                      fontVariationSettings: "inherit",
                                      lineHeight: "inherit",
                                      letterSpacing: "inherit",
                                      color: "inherit",
                                      textTransform: "none",
                                      appearance: "button",
                                      backgroundImage: "none",
                                      cursor: "pointer",
                                      display: "inline-flex",
                                      height: "1.5rem",
                                      width: "1.5rem",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "0.5rem",
                                      whiteSpace: "nowrap",
                                      borderRadius: "calc(0.5rem - 2px)",
                                      fontSize: "0.875rem",
                                      fontWeight: 480,
                                      transitionProperty:
                                        "color, background-color, border-color, text-decoration-color, fill, stroke",
                                      transitionDuration: "0.1s",
                                      transitionTimingFunction:
                                        "cubic-bezier(0.4, 0, 0.2, 1)",
                                      flexShrink: 0,
                                      fontSynthesis: "none",
                                    }}
                                  >
                                    <input
                                      ref={iconFileInputRef}
                                      className="hidden"
                                      type="file"
                                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleIconUpload(file);
                                      }}
                                    />
                                    {iconUrl ? (
                                      <img
                                        className="w-4 h-4 object-contain"
                                        alt="Survey icon"
                                        src={iconUrl}
                                        style={{
                                          display: "block",
                                          verticalAlign: "middle",
                                          maxWidth: "100%",
                                          height: "1rem",
                                          width: "1rem",
                                          objectFit: "contain",
                                        }}
                                      />
                                    ) : (
                                      <svg
                                        className="shrink-0 h-4 w-4 text-muted-foreground"
                                        height="16"
                                        width="16"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"
                                          fill="currentColor"
                                        />
                                      </svg>
                                    )}
                                  </button>
                                  <input
                                    id="title"
                                    className="flex w-full rounded-md border border-input px-3 py-1 transition-colors duration-150 ease-in-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-ring/20 focus-visible:border-ring focus-visible:outline-none disabled:cursor-not-allowed disabled:border-input disabled:opacity-50 md:text-sm h-10 border-none bg-transparent text-sm shadow-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                                    value={surveyTitle}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    placeholder="Survey name"
                                    style={{
                                      border: "0px solid rgb(229, 231, 235)",
                                      boxSizing: "border-box",
                                      textRendering: "optimizelegibility",
                                      WebkitFontSmoothing: "antialiased",
                                      scrollbarWidth: "thin",
                                      scrollbarColor:
                                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                      margin: "0px",
                                      padding: "0px",
                                      fontFamily: "inherit",
                                      fontFeatureSettings: "inherit",
                                      fontVariationSettings: "inherit",
                                      fontWeight: "inherit",
                                      lineHeight: "inherit",
                                      letterSpacing: "inherit",
                                      color: "inherit",
                                      display: "flex",
                                      height: "2.5rem",
                                      width: "100%",
                                      borderRadius: "calc(0.5rem - 2px)",
                                      borderWidth: "1px",
                                      borderStyle: "none",
                                      borderColor: "hsl(60 1% 25%)",
                                      backgroundColor: "transparent",
                                      paddingRight: "0.75rem",
                                      paddingTop: "0.25rem",
                                      paddingBottom: "0.25rem",
                                      paddingLeft: "0px",
                                      boxShadow:
                                        "var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),0 0 #0000",
                                      transitionProperty:
                                        "color, background-color, border-color, text-decoration-color, fill, stroke",
                                      transitionDuration: "0.15s",
                                      transitionTimingFunction:
                                        "cubic-bezier(0.4, 0, 0.2, 1)",
                                      animationDuration: "0.15s",
                                      animationTimingFunction:
                                        "cubic-bezier(0.4, 0, 0.2, 1)",
                                      fontSize: "0.875rem",
                                      fontSynthesis: "none",
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <div
                              className="space-y-1"
                              style={{
                                border: "0px solid rgb(229, 231, 235)",
                                boxSizing: "border-box",
                                borderColor: "hsl(60 3% 15%)",
                                textRendering: "optimizelegibility",
                                WebkitFontSmoothing: "antialiased",
                                scrollbarWidth: "thin",
                                scrollbarColor:
                                  "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                marginTop: "calc(.5rem * calc(1 - 0))",
                                marginBottom: "calc(.5rem * 0)",
                                fontSynthesis: "none",
                              }}
                            >
                              <label
                                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 inline-flex items-center gap-1 text-xs"
                                htmlFor="description"
                                style={{
                                  border: "0px solid rgb(229, 231, 235)",
                                  boxSizing: "border-box",
                                  borderColor: "hsl(60 3% 15%)",
                                  textRendering: "optimizelegibility",
                                  WebkitFontSmoothing: "antialiased",
                                  scrollbarWidth: "thin",
                                  scrollbarColor:
                                    "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  fontSize: "0.75rem",
                                  fontWeight: 480,
                                  fontSynthesis: "none",
                                }}
                              >
                                Description
                                <svg
                                  className="shrink-0 h-4 w-4 text-muted-foreground"
                                  height="100%"
                                  width="100%"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{
                                    border: "0px solid rgb(229, 231, 235)",
                                    boxSizing: "border-box",
                                    borderColor: "hsl(60 3% 15%)",
                                    textRendering: "optimizelegibility",
                                    WebkitFontSmoothing: "antialiased",
                                    scrollbarWidth: "thin",
                                    scrollbarColor:
                                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                    display: "block",
                                    verticalAlign: "middle",
                                    height: "1rem",
                                    width: "1rem",
                                    flexShrink: 0,
                                    color: "hsl(40 9% 75%)",
                                    fontSynthesis: "none",
                                  }}
                                >
                                  <path
                                    d="M20.25 12a8.25 8.25 0 1 0-16.5 0 8.25 8.25 0 0 0 16.5 0m-9 1c0-.84.333-1.644.927-2.237l.879-.88a.665.665 0 0 0-.47-1.133H11.5a.75.75 0 0 0-.746.673l-.008.154A.75.75 0 0 1 9.25 9.5a2.25 2.25 0 0 1 2.25-2.25h1.086a2.164 2.164 0 0 1 1.53 3.694l-.879.88A1.67 1.67 0 0 0 12.75 13a.75.75 0 0 1-1.5 0m10.5-1c0 5.385-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25s9.75 4.365 9.75 9.75"
                                    fill="currentColor"
                                    style={{
                                      border: "0px solid rgb(229, 231, 235)",
                                      boxSizing: "border-box",
                                      borderColor: "hsl(60 3% 15%)",
                                      textRendering: "optimizelegibility",
                                      WebkitFontSmoothing: "antialiased",
                                      scrollbarWidth: "thin",
                                      scrollbarColor:
                                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                      fontSynthesis: "none",
                                    }}
                                  />
                                  <path
                                    d="M13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
                                    fill="currentColor"
                                    style={{
                                      border: "0px solid rgb(229, 231, 235)",
                                      boxSizing: "border-box",
                                      borderColor: "hsl(60 3% 15%)",
                                      textRendering: "optimizelegibility",
                                      WebkitFontSmoothing: "antialiased",
                                      scrollbarWidth: "thin",
                                      scrollbarColor:
                                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                      fontSynthesis: "none",
                                    }}
                                  />
                                </svg>
                              </label>
                              <div
                                className="relative"
                                style={{
                                  border: "0px solid rgb(229, 231, 235)",
                                  boxSizing: "border-box",
                                  borderColor: "hsl(60 3% 15%)",
                                  textRendering: "optimizelegibility",
                                  WebkitFontSmoothing: "antialiased",
                                  scrollbarWidth: "thin",
                                  scrollbarColor:
                                    "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                  position: "relative",
                                  marginTop: "calc(.25rem * calc(1 - 0))",
                                  marginBottom: "calc(.25rem * 0)",
                                  fontSynthesis: "none",
                                }}
                              >
                                <textarea
                                  id="description"
                                  className="flex min-h-[32px] w-full resize-none overflow-hidden rounded-md border border-input bg-transparent px-2.5 py-1.5 pb-4 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                                  value={description}
                                  onChange={(e) => handleDescriptionChange(e.target.value)}
                                  placeholder="Describe your survey"
                                  maxLength={155}
                                  style={{
                                    border: "0px solid rgb(229, 231, 235)",
                                    boxSizing: "border-box",
                                    textRendering: "optimizelegibility",
                                    WebkitFontSmoothing: "antialiased",
                                    scrollbarWidth: "thin",
                                    scrollbarColor:
                                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                    margin: "0px",
                                    padding: "0px",
                                    fontFamily: "inherit",
                                    fontFeatureSettings: "inherit",
                                    fontVariationSettings: "inherit",
                                    fontWeight: "inherit",
                                    lineHeight: "inherit",
                                    letterSpacing: "inherit",
                                    color: "inherit",
                                    display: "flex",
                                    width: "100%",
                                    resize: "none",
                                    overflow: "hidden",
                                    borderRadius: "calc(0.5rem - 2px)",
                                    borderWidth: "1px",
                                    borderColor: "hsl(60 1% 25%)",
                                    backgroundColor: "transparent",
                                    paddingLeft: "0.625rem",
                                    paddingRight: "0.625rem",
                                    paddingTop: "0.375rem",
                                    paddingBottom: "1rem",
                                    fontSize: "0.875rem",
                                    boxShadow:
                                      "var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),0 1px 2px 0 rgb(0 0 0/0.05)",
                                    transitionProperty:
                                      "color, background-color, border-color, text-decoration-color, fill, stroke",
                                    transitionTimingFunction:
                                      "cubic-bezier(0.4, 0, 0.2, 1)",
                                    transitionDuration: "0.15s",
                                    minHeight: "32px",
                                    height: "64px",
                                    fontSynthesis: "none",
                                  }}
                                />
                                <div
                                  className="pointer-events-none absolute bottom-0 right-1 text-xs text-muted-foreground/70"
                                  style={{
                                    border: "0px solid rgb(229, 231, 235)",
                                    boxSizing: "border-box",
                                    borderColor: "hsl(60 3% 15%)",
                                    textRendering: "optimizelegibility",
                                    WebkitFontSmoothing: "antialiased",
                                    scrollbarWidth: "thin",
                                    scrollbarColor:
                                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                    pointerEvents: "none",
                                    position: "absolute",
                                    bottom: "0px",
                                    right: "0.25rem",
                                    fontSize: "0.75rem",
                                    color: "hsl(40 9% 75%/.7)",
                                    fontSynthesis: "none",
                                  }}
                                >
                                  {descriptionCharCount} / 155
                                </div>
                              </div>
                            </div>
                            <div
                              className="space-y-1"
                              style={{
                                border: "0px solid rgb(229, 231, 235)",
                                boxSizing: "border-box",
                                borderColor: "hsl(60 3% 15%)",
                                textRendering: "optimizelegibility",
                                WebkitFontSmoothing: "antialiased",
                                scrollbarWidth: "thin",
                                scrollbarColor:
                                  "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                marginTop: "calc(.5rem * calc(1 - 0))",
                                marginBottom: "calc(.5rem * 0)",
                                fontSynthesis: "none",
                              }}
                            >
                              <label
                                className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 inline-flex items-center gap-1 text-xs"
                                htmlFor="social-image"
                                style={{
                                  border: "0px solid rgb(229, 231, 235)",
                                  boxSizing: "border-box",
                                  borderColor: "hsl(60 3% 15%)",
                                  textRendering: "optimizelegibility",
                                  WebkitFontSmoothing: "antialiased",
                                  scrollbarWidth: "thin",
                                  scrollbarColor:
                                    "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  fontSize: "0.75rem",
                                  fontWeight: 480,
                                  fontSynthesis: "none",
                                }}
                              >
                                Share image
                                <svg
                                  className="shrink-0 h-4 w-4 text-muted-foreground"
                                  height="100%"
                                  width="100%"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                  style={{
                                    border: "0px solid rgb(229, 231, 235)",
                                    boxSizing: "border-box",
                                    borderColor: "hsl(60 3% 15%)",
                                    textRendering: "optimizelegibility",
                                    WebkitFontSmoothing: "antialiased",
                                    scrollbarWidth: "thin",
                                    scrollbarColor:
                                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                    display: "block",
                                    verticalAlign: "middle",
                                    height: "1rem",
                                    width: "1rem",
                                    flexShrink: 0,
                                    color: "hsl(40 9% 75%)",
                                    fontSynthesis: "none",
                                  }}
                                >
                                  <path
                                    d="M20.25 12a8.25 8.25 0 1 0-16.5 0 8.25 8.25 0 0 0 16.5 0m-9 1c0-.84.333-1.644.927-2.237l.879-.88a.665.665 0 0 0-.47-1.133H11.5a.75.75 0 0 0-.746.673l-.008.154A.75.75 0 0 1 9.25 9.5a2.25 2.25 0 0 1 2.25-2.25h1.086a2.164 2.164 0 0 1 1.53 3.694l-.879.88A1.67 1.67 0 0 0 12.75 13a.75.75 0 0 1-1.5 0m10.5-1c0 5.385-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12 6.615 2.25 12 2.25s9.75 4.365 9.75 9.75"
                                    fill="currentColor"
                                    style={{
                                      border: "0px solid rgb(229, 231, 235)",
                                      boxSizing: "border-box",
                                      borderColor: "hsl(60 3% 15%)",
                                      textRendering: "optimizelegibility",
                                      WebkitFontSmoothing: "antialiased",
                                      scrollbarWidth: "thin",
                                      scrollbarColor:
                                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                      fontSynthesis: "none",
                                    }}
                                  />
                                  <path
                                    d="M13 16a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
                                    fill="currentColor"
                                    style={{
                                      border: "0px solid rgb(229, 231, 235)",
                                      boxSizing: "border-box",
                                      borderColor: "hsl(60 3% 15%)",
                                      textRendering: "optimizelegibility",
                                      WebkitFontSmoothing: "antialiased",
                                      scrollbarWidth: "thin",
                                      scrollbarColor:
                                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                      fontSynthesis: "none",
                                    }}
                                  />
                                </svg>
                              </label>
                              <div
                                className="w-full max-w-full overflow-hidden"
                                style={{
                                  border: "0px solid rgb(229, 231, 235)",
                                  boxSizing: "border-box",
                                  borderColor: "hsl(60 3% 15%)",
                                  textRendering: "optimizelegibility",
                                  WebkitFontSmoothing: "antialiased",
                                  scrollbarWidth: "thin",
                                  scrollbarColor:
                                    "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                  width: "100%",
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                  marginTop: "calc(.25rem * calc(1 - 0))",
                                  marginBottom: "calc(.25rem * 0)",
                                  fontSynthesis: "none",
                                }}
                              >
                                <div
                                  className="relative"
                                  style={{
                                    border: "0px solid rgb(229, 231, 235)",
                                    boxSizing: "border-box",
                                    borderColor: "hsl(60 3% 15%)",
                                    textRendering: "optimizelegibility",
                                    WebkitFontSmoothing: "antialiased",
                                    scrollbarWidth: "thin",
                                    scrollbarColor:
                                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                    position: "relative",
                                    fontSynthesis: "none",
                                  }}
                                >
                                  <button
                                    onClick={() => shareImageFileInputRef.current?.click()}
                                    className="inline-flex items-center whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none border border-input bg-muted hover:bg-accent hover:border-accent rounded-md px-3 py-2 relative disabled:opacity-100 h-32 w-full justify-center gap-2 border-dashed overflow-hidden"
                                    type="button"
                                    style={{
                                      border: "0px solid rgb(229, 231, 235)",
                                      boxSizing: "border-box",
                                      textRendering: "optimizelegibility",
                                      WebkitFontSmoothing: "antialiased",
                                      scrollbarWidth: "thin",
                                      scrollbarColor:
                                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                      margin: "0px",
                                      padding: "0px",
                                      fontFamily: "inherit",
                                      fontFeatureSettings: "inherit",
                                      fontVariationSettings: "inherit",
                                      lineHeight: "inherit",
                                      letterSpacing: "inherit",
                                      textTransform: "none",
                                      appearance: "button",
                                      backgroundImage: "none",
                                      cursor: "pointer",
                                      position: "relative",
                                      display: "inline-flex",
                                      height: "8rem",
                                      width: "100%",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: "0.5rem",
                                      whiteSpace: "nowrap",
                                      borderRadius: "calc(0.5rem - 2px)",
                                      borderWidth: "1px",
                                      borderStyle: "dashed",
                                      borderColor: "hsl(60 1% 25%)",
                                      backgroundColor: "hsl(60 3% 15%)",
                                      paddingLeft: "0.75rem",
                                      paddingRight: "0.75rem",
                                      paddingTop: "0.5rem",
                                      paddingBottom: "0.5rem",
                                      fontSize: "0.875rem",
                                      fontWeight: 480,
                                      transitionProperty:
                                        "color, background-color, border-color, text-decoration-color, fill, stroke",
                                      transitionDuration: "0.1s",
                                      transitionTimingFunction:
                                        "cubic-bezier(0.4, 0, 0.2, 1)",
                                      animationDuration: "0.1s",
                                      animationTimingFunction:
                                        "cubic-bezier(0.4, 0, 0.2, 1)",
                                      fontSynthesis: "none",
                                    }}
                                  >
                                    <input
                                      ref={shareImageFileInputRef}
                                      className="hidden"
                                      type="file"
                                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleShareImageUpload(file);
                                      }}
                                      style={{
                                        border: "0px solid rgb(229, 231, 235)",
                                        boxSizing: "border-box",
                                        borderColor: "hsl(60 3% 15%)",
                                        textRendering: "optimizelegibility",
                                        WebkitFontSmoothing: "antialiased",
                                        scrollbarWidth: "thin",
                                        scrollbarColor:
                                          "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                        margin: "0px",
                                        padding: "0px",
                                        fontFamily: "inherit",
                                        fontFeatureSettings: "inherit",
                                        fontVariationSettings: "inherit",
                                        fontSize: "100%",
                                        fontWeight: "inherit",
                                        lineHeight: "inherit",
                                        letterSpacing: "inherit",
                                        color: "inherit",
                                        display: "none",
                                        fontSynthesis: "none",
                                      }}
                                    />
                                    <div
                                      className="flex items-center gap-1 flex-col"
                                      style={{
                                        border: "0px solid rgb(229, 231, 235)",
                                        boxSizing: "border-box",
                                        borderColor: "hsl(60 3% 15%)",
                                        textRendering: "optimizelegibility",
                                        WebkitFontSmoothing: "antialiased",
                                        scrollbarWidth: "thin",
                                        scrollbarColor:
                                          "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        gap: "0.25rem",
                                        fontSynthesis: "none",
                                      }}
                                    >
                                      <svg
                                        className="shrink-0 h-5 w-5 text-muted-foreground"
                                        height="100%"
                                        width="100%"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                        style={{
                                          border: "0px solid rgb(229, 231, 235)",
                                          boxSizing: "border-box",
                                          borderColor: "hsl(60 3% 15%)",
                                          textRendering: "optimizelegibility",
                                          WebkitFontSmoothing: "antialiased",
                                          scrollbarWidth: "thin",
                                          scrollbarColor:
                                            "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                          display: "block",
                                          verticalAlign: "middle",
                                          height: "1.25rem",
                                          width: "1.25rem",
                                          flexShrink: 0,
                                          color: "hsl(40 9% 75%)",
                                          pointerEvents: "none",
                                          fontSynthesis: "none",
                                        }}
                                      >
                                        <path
                                          d="M3.25 17v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 0 7 19.25h10A2.25 2.25 0 0 0 19.25 17v-2a.75.75 0 0 1 1.5 0v2A3.75 3.75 0 0 1 17 20.75H7A3.75 3.75 0 0 1 3.25 17m8-1V5.81L8.53 8.53a.75.75 0 1 1-1.06-1.06l4-4 .056-.052a.75.75 0 0 1 1.004.052l4 4a.75.75 0 1 1-1.06 1.06l-2.72-2.72V16a.75.75 0 0 1-1.5 0"
                                          fill="currentColor"
                                          style={{
                                            border: "0px solid rgb(229, 231, 235)",
                                            boxSizing: "border-box",
                                            borderColor: "hsl(60 3% 15%)",
                                            textRendering: "optimizelegibility",
                                            WebkitFontSmoothing: "antialiased",
                                            scrollbarWidth: "thin",
                                            scrollbarColor:
                                              "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                            fontSynthesis: "none",
                                          }}
                                        />
                                      </svg>
                                      <div
                                        className="flex flex-col items-center gap-1"
                                        style={{
                                          border: "0px solid rgb(229, 231, 235)",
                                          boxSizing: "border-box",
                                          borderColor: "hsl(60 3% 15%)",
                                          textRendering: "optimizelegibility",
                                          WebkitFontSmoothing: "antialiased",
                                          scrollbarWidth: "thin",
                                          scrollbarColor:
                                            "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          gap: "0.25rem",
                                          fontSynthesis: "none",
                                        }}
                                      >
                                        <span
                                          className="text-sm font-medium text-muted-foreground"
                                          style={{
                                            border: "0px solid rgb(229, 231, 235)",
                                            boxSizing: "border-box",
                                            borderColor: "hsl(60 3% 15%)",
                                            textRendering: "optimizelegibility",
                                            WebkitFontSmoothing: "antialiased",
                                            scrollbarWidth: "thin",
                                            scrollbarColor:
                                              "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                            fontSize: "0.875rem",
                                            fontWeight: 480,
                                            color: "hsl(40 9% 75%)",
                                            fontSynthesis: "none",
                                          }}
                                        >
                                          Click to upload
                                        </span>
                                        <span
                                          className="text-xs font-normal text-muted-foreground"
                                          style={{
                                            border: "0px solid rgb(229, 231, 235)",
                                            boxSizing: "border-box",
                                            borderColor: "hsl(60 3% 15%)",
                                            textRendering: "optimizelegibility",
                                            WebkitFontSmoothing: "antialiased",
                                            scrollbarWidth: "thin",
                                            scrollbarColor:
                                              "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                                            fontSize: "0.75rem",
                                            fontWeight: 400,
                                            color: "hsl(40 9% 75%)",
                                            fontSynthesis: "none",
                                          }}
                                        >
                                          By default a screenshot of the app is used
                                        </span>
                                      </div>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
              <div
                className="flex-shrink-0"
                style={{
                  border: "0px solid rgb(229, 231, 235)",
                  boxSizing: "border-box",
                  borderColor: "hsl(60 3% 15%)",
                  textRendering: "optimizelegibility",
                  WebkitFontSmoothing: "antialiased",
                  scrollbarWidth: "thin",
                  scrollbarColor:
                    "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                  flexShrink: 0,
                  fontSynthesis: "none",
                }}
              >
                <div
                  className="flex items-center justify-end p-4 pt-0"
                  style={{
                    border: "0px solid rgb(229, 231, 235)",
                    boxSizing: "border-box",
                    borderColor: "hsl(60 3% 15%)",
                    textRendering: "optimizelegibility",
                    WebkitFontSmoothing: "antialiased",
                    scrollbarWidth: "thin",
                    scrollbarColor:
                      "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: "1rem",
                    paddingTop: "0px",
                    fontSynthesis: "none",
                  }}
                >
                  <div
                    className="flex w-full"
                    style={{
                      border: "0px solid rgb(229, 231, 235)",
                      boxSizing: "border-box",
                      borderColor: "hsl(60 3% 15%)",
                      textRendering: "optimizelegibility",
                      WebkitFontSmoothing: "antialiased",
                      scrollbarWidth: "thin",
                      scrollbarColor:
                        "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                      display: "flex",
                      width: "100%",
                      fontSynthesis: "none",
                    }}
                  >
                    <button
                      onClick={() => {
                        onPublish();
                        setIsOpen(false);
                      }}
                      disabled={isPublishing || !sandboxAvailable}
                      className="inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors duration-100 ease-in-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none hover:opacity-90 h-8 rounded-md px-3 py-2 gap-1.5 w-full"
                      style={{
                        border: "0px solid rgb(229, 231, 235)",
                        boxSizing: "border-box",
                        borderColor: "hsl(60 3% 15%)",
                        textRendering: "optimizelegibility",
                        WebkitFontSmoothing: "antialiased",
                        scrollbarWidth: "thin",
                        scrollbarColor:
                          "var(--scrollbar-thumb,initial) var(--scrollbar-track,initial)",
                        margin: "0px",
                        padding: "0px",
                        fontFamily: "inherit",
                        fontFeatureSettings: "inherit",
                        fontVariationSettings: "inherit",
                        lineHeight: "inherit",
                        letterSpacing: "inherit",
                        textTransform: "none",
                        appearance: "button",
                        backgroundImage: "none",
                        cursor: "pointer",
                        display: "inline-flex",
                        height: "2rem",
                        width: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.375rem",
                        whiteSpace: "nowrap",
                        borderRadius: "calc(0.5rem - 2px)",
                        backgroundColor: "#E8E8E8",
                        paddingLeft: "0.75rem",
                        paddingRight: "0.75rem",
                        paddingTop: "0.5rem",
                        paddingBottom: "0.5rem",
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "rgb(19, 19, 20)",
                        transitionProperty:
                          "color, background-color, border-color, text-decoration-color, fill, stroke",
                        transitionDuration: "0.1s",
                        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                        animationDuration: "0.1s",
                        animationTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                        fontSynthesis: "none",
                      }}
                    >
                      {isPublishing ? 'Publishing...' : (project?.status === 'published' || publishedUrl) ? 'Update' : 'Publish'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <style
            dangerouslySetInnerHTML={{
              __html: `
html {
  border: 0px solid rgb(229, 231, 235);
  box-sizing: border-box;
  border-color: hsl(60 3% 15%);
  text-rendering: optimizelegibility;
  -webkit-font-smoothing: antialiased;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb,initial) var(--scrollbar-track,initial);
  line-height: 1.5;
  text-size-adjust: 100%;
  tab-size: 4;
  font-family: var(--font-camera-plain),Camera Plain Variable,ui-sans-serif,system-ui,sans-serif;
  font-feature-settings: normal;
  font-variation-settings: normal;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior-y: auto;
  color-scheme: dark;
  font-synthesis: none;
}

body {
  border: 0px solid rgb(229, 231, 235);
  box-sizing: border-box;
  border-color: hsl(60 3% 15%);
  text-rendering: optimizelegibility;
  -webkit-font-smoothing: antialiased;
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb,initial) var(--scrollbar-track,initial);
  margin: 0px;
  line-height: inherit;
  background-color: hsl(0 0% 11%);
  color: hsl(45 40% 98%);
  font-size: 1rem;
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  font-family: CameraPlainVariable, "CameraPlainVariable Fallback";
  overscroll-behavior: contain;
  padding-left: 0px;
  padding-top: 0px;
  padding-right: 0px;
  margin-left: 0px;
  margin-top: 0px;
  pointer-events: none;
  font-synthesis: none;
  overflow: hidden;
  position: relative;
  margin-right: 0px;
}
`,
            }}
          />
          <div
            className="fixed inset-0 z-[1000] bg-transparent"
            onClick={() => setIsOpen(false)}
          />
        </>
      )}
    </div>
  );
}

// Simple preview-only component for main area
function ProjectPreviewOnly({
  refreshKey = 0,
  bundle,
  projectId,
  onPreviewUrlReady,
  onBuildError,
}: {
  refreshKey?: number;
  bundle?: SandboxBundle | null;
  projectId?: string;
  onPreviewUrlReady?: (url: string) => void;
  onBuildError?: (error: string) => void;
}) {
  if (!bundle) {
    return (
      <div className="h-full w-full flex items-center justify-center" style={{ backgroundColor: 'var(--surbee-bg-primary)' }}>
        <div className="text-center">
          <p className="text-xs" style={{ color: 'var(--surbee-fg-muted)' }}>
            Waiting for survey content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ModalSandboxPreview
      bundle={bundle}
      refreshKey={refreshKey}
      className="h-full w-full"
      projectId={projectId}
      onPreviewUrlReady={onPreviewUrlReady}
      onBuildError={onBuildError}
    />
  );
}

interface Project {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string | null;
  user_id: string;
  status: 'draft' | 'published' | 'archived';
}

const InviteModal = dynamic(() => import('@/components/referrals/InviteModal'), { ssr: false })

type AgentItem =
  | { type: 'message'; text?: string; agent?: string; isHtml?: boolean }
  | { type: 'reasoning'; text?: string; agent?: string }
  | { type: 'tool_call'; name?: string; arguments?: unknown; agent?: string }
  | { type: 'tool_result'; name?: string; output?: unknown; agent?: string; html?: string | null }
  | { type: 'tool_approval'; name?: string; status?: string; agent?: string }
  | { type: 'handoff'; description?: string; agent?: string; from?: string; to?: string };

interface WorkflowRunResult {
  output_text: string;
  stage: 'fail' | 'plan' | 'build';
  guardrails: unknown;
  items?: AgentItem[];
  html?: string;
}

const HTML_TAG_CUES = ['<!doctype', '<html', '<body', '<head', '<section', '<main', '<form', '<div'];

type WorkflowPhase = 'idle' | 'planner' | 'planner_summary' | 'builder' | 'complete';

interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

interface BundleVersion {
  id: string;
  timestamp: number;
  bundle: SandboxBundle;
  description: string;
  messageId?: string; // ID of the message that created this version
  title?: string; // AI-generated checkpoint title
}



interface HistoryEntry {
  id: string;
  prompt: string;
  timestamp: Date;
  changes: string[];
  version: number;
  isFlagged: boolean;
}

type SidebarView = 'chat' | 'history' | 'console';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

// Helper function to extract questions from source files
function extractQuestionsFromSourceFiles(files: Record<string, string>): Array<{
  question_id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  required?: boolean;
  order_index: number;
}> {
  const questions: Map<string, any> = new Map();

  // Regular expressions to match metadata attributes
  const questionIdRegex = /data-question-id=["']([^"']+)["']/g;
  const questionTextRegex = /data-question-text=["']([^"']+)["']/g;
  const questionTypeRegex = /data-question-type=["']([^"']+)["']/g;
  const questionOptionsRegex = /data-question-options=["']([^"']+)["']/g;
  const questionRequiredRegex = /data-question-required=["'](true|false)["']/g;

  // Process each file
  Object.values(files).forEach((content) => {
    if (typeof content !== 'string') return;

    // Find all question IDs in this file
    let match;
    const questionIdsInFile: string[] = [];

    while ((match = questionIdRegex.exec(content)) !== null) {
      questionIdsInFile.push(match[1]);
    }

    // For each question ID, extract all its metadata
    questionIdsInFile.forEach((questionId) => {
      if (questions.has(questionId)) return; // Already processed

      // Find the section of code containing this question
      const questionSection = content.substring(
        Math.max(0, content.indexOf(questionId) - 500),
        content.indexOf(questionId) + 500
      );

      // Extract question text
      const textMatch = questionSection.match(questionTextRegex);
      const questionText = textMatch ? textMatch[0].match(/["']([^"']+)["']/)?.[1] : questionId;

      // Extract question type
      const typeMatch = questionSection.match(questionTypeRegex);
      const questionType = typeMatch ? typeMatch[0].match(/["']([^"']+)["']/)?.[1] : 'text_input';

      // Extract options if present
      const optionsMatch = questionSection.match(questionOptionsRegex);
      let options: string[] | undefined;
      if (optionsMatch) {
        const optionsStr = optionsMatch[0].match(/["']([^"']+)["']/)?.[1];
        options = optionsStr ? JSON.parse(optionsStr.replace(/&quot;/g, '"')) : undefined;
      }

      // Extract required flag
      const requiredMatch = questionSection.match(questionRequiredRegex);
      const required = requiredMatch ? requiredMatch[0].includes('true') : false;

      questions.set(questionId, {
        question_id: questionId,
        question_text: questionText || questionId,
        question_type: questionType || 'text_input',
        options,
        required,
      });
    });
  });

  // Convert to array and add order_index
  const questionsArray = Array.from(questions.values());
  return questionsArray.map((q, index) => ({
    ...q,
    order_index: index + 1,
  }));
}

export default function ProjectPage() {

  // In client components, use useParams() to read dynamic params
  const { id } = useParams() as { id?: string };
  const projectId: string | undefined = id;
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { userPreferences } = useUserPreferences();
  const { subscribeToProject } = useRealtime();
  const router = useRouter();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { credits, loading: creditsLoading, percentUsed } = useCredits();
  const [isMounted, setIsMounted] = useState(false);

  // Calculate days until credits reset
  const daysUntilReset = useMemo(() => {
    if (!credits?.creditsResetAt) return null;
    const resetDate = new Date(credits.creditsResetAt);
    const now = new Date();
    const diffTime = resetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [credits?.creditsResetAt]);

  // Prevent hydration errors by only checking theme on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDarkMode = isMounted && resolvedTheme === 'dark';

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleProfileAction = (action: string) => {
    setIsUserMenuOpen(false);
    switch (action) {
      case 'settings':
        handleNavigation('/home/settings');
        break;
      case 'logout':
        // Handle logout
        handleNavigation('/');
        break;
      default:
        break;
    }
  };

  // Check if this is a sandbox preview request
  const isSandboxPreview = searchParams?.get('sandbox') === '1';

  // Extract session ID from URL for chat session management
  const sessionIdFromUrl = searchParams?.get('sessionId');

  // Initialize chat session management (skip in sandbox preview mode)
  const {
    sessionId: currentSessionId,
    isLoading: sessionLoading,
    saveMessages: saveChatMessages,
    loadSession,
  } = useChatSession({
    projectId: projectId || '',
    userId: user?.id,
    sessionId: sessionIdFromUrl,
    // Disable session management in sandbox preview mode
    enabled: !isSandboxPreview,
  });

  // Enable mock mode by default (no database)
  const mockMode = false;

  // Project state
  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [autoGeneratedTitle, setAutoGeneratedTitle] = useState<string | null>(null);
  const [isTitleGenerating, setIsTitleGenerating] = useState(false);

  const [isPlanUsageOpen, setIsPlanUsageOpen] = useState(true);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isHomeOpen, setIsHomeOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [visualEditElement, setVisualEditElement] = useState<{ selector: string; outerHTML: string; text: string } | null>(null);
  const [hoveredElement, setHoveredElement] = useState<HTMLElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState(false);

  // Reasoning and sandbox state
  const [sandboxContent, setSandboxContent] = useState<Record<string, string> | null>(null);
  const [sandboxBundle, setSandboxBundle] = useState<SandboxBundle | null>(null);
  const [sandboxError, setSandboxError] = useState<string | null>(null);
  const [rendererKey, setRendererKey] = useState(0);
  const [bundleVersions, setBundleVersions] = useState<BundleVersion[]>([]);
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null);
  const sandboxAvailable = Boolean(sandboxBundle);

  // Initialize selected model ONCE from sessionStorage
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
    if (typeof window === 'undefined') return 'gpt-5';
    try {
      const storedModel = sessionStorage.getItem('surbee_selected_model');
      if (storedModel === 'gpt-5' || storedModel === 'claude-haiku' || storedModel === 'mistral') {
        return storedModel as AIModel;
      }
    } catch (e) {
      console.error('Failed to read model from sessionStorage:', e);
    }
    return 'gpt-5';
  });

  const selectedModelRef = useRef(selectedModel);

  // Update sessionStorage when model changes
  const handleModelChange = useCallback((model: AIModel) => {
    setSelectedModel(model);
    selectedModelRef.current = model;
    try {
      sessionStorage.setItem('surbee_selected_model', model);
    } catch (e) {
      console.error('Failed to save model to sessionStorage:', e);
    }
  }, []);

  // useChat hook for message handling - using Vercel AI SDK
  const chatTransport = useMemo(() => new DefaultChatTransport({ api: '/api/agents/surbee-v3' }), []);

  // Memoize onError to prevent useChat re-initialization
  const onError = useCallback((error: Error) => {
    console.error('🚨 Chat error:', error);
  }, []);

  const { messages: rawMessages, sendMessage: originalSendMessage, status, stop, reload, setMessages } = useChat<ChatMessage>({
    transport: chatTransport,
    // DO NOT pass body here - we'll pass it in sendMessage instead to allow dynamic model switching
    onError,
    // CRITICAL: Throttle UI updates to prevent "Maximum update depth exceeded"
    experimental_throttle: 50,
  });

  // Use raw messages directly - deferring didn't help
  const messages = rawMessages;

  // Use sendMessage directly - don't wrap it
  const sendMessage = originalSendMessage;

  // Load and restore session messages when continuing from a previous session
  const [sessionLoaded, setSessionLoaded] = useState(false);
  useEffect(() => {
    const loadAndRestoreSession = async () => {
      if (!user?.id || sessionLoaded || isSandboxPreview) return;

      try {
        let session = null;

        // If we have a session ID from URL, load that specific session
        if (sessionIdFromUrl) {
          session = await loadSession();
        } else {
          // If no session ID in URL, try to load the most recent chat session for this project
          const response = await fetch(`/api/projects/${projectId}/chat-session?userId=${user.id}&latest=true`);
          if (response.ok) {
            const data = await response.json();
            session = data.session;
          }
        }

        if (session?.messages && session.messages.length > 0) {
          // Transform session messages to the format useChat expects
          const restoredMessages = session.messages.map((m: any, idx: number) => ({
            id: m.id || `restored-${idx}`,
            role: m.role,
            content: m.content,
            ...m
          }));
          setMessages(restoredMessages);
          setHasStartedChat(true);

          // Restore title from session if available
          if (session.title && session.title !== 'Untitled Survey' && session.title !== 'Untitled Project') {
            setAutoGeneratedTitle(session.title);
          }

          // Sandbox bundle is restored from project data (sandbox_bundle field) in the project loading effect
        }
        setSessionLoaded(true);
      } catch (error) {
        console.error('Failed to load session:', error);
        setSessionLoaded(true);
      }
    };

    loadAndRestoreSession();
  }, [sessionIdFromUrl, user?.id, projectId, loadSession, setMessages, isSandboxPreview, sessionLoaded]);

  // Restore chat context from dashboard if coming from dashboard chat
  const { loadChatContext, clearChatContext } = useDashboardChat();
  const [dashboardContextLoaded, setDashboardContextLoaded] = useState(false);

  useEffect(() => {
    if (dashboardContextLoaded || !user?.id) return;

    const fromDashboard = searchParams?.get('fromDashboard') === 'true';
    if (fromDashboard) {
      const context = loadChatContext();
      if (context && context.messages.length > 0) {
        // Transform messages to the format useChat expects
        const restoredMessages = context.messages.map((msg: any, idx: number) => ({
          id: msg.id || `dashboard-${idx}`,
          role: msg.role,
          parts: msg.parts || [{ type: 'text', text: msg.content || '' }],
          ...msg
        }));

        setMessages(restoredMessages);
        setHasStartedChat(true);

        // Restore model selection if available
        if (context.model && (context.model === 'gpt-5' || context.model === 'claude-haiku' || context.model === 'mistral')) {
          setSelectedModel(context.model as AIModel);
        }

        clearChatContext();

        // Remove query param from URL
        const url = new URL(window.location.href);
        url.searchParams.delete('fromDashboard');
        window.history.replaceState({}, '', url.toString());
      }
      setDashboardContextLoaded(true);
    }
  }, [searchParams, user?.id, loadChatContext, clearChatContext, setMessages, dashboardContextLoaded]);

  // Save chat messages to session only when streaming completes (not during streaming)
  const prevSavedRef = useRef({ length: 0, title: '' });
  useEffect(() => {
    if (status !== 'ready') return;
    if (messages.length === 0 || !user?.id || isSandboxPreview) return;
    const currentTitle = autoGeneratedTitle || '';
    // Skip if we already saved this exact message count AND title
    if (messages.length === prevSavedRef.current.length && currentTitle === prevSavedRef.current.title) return;
    prevSavedRef.current = { length: messages.length, title: currentTitle };

    // Strip large tool call data (source_files, file contents) to keep payload small
    const messagesToSave = messages.map(msg => {
      const base: Record<string, any> = {
        id: msg.id,
        role: msg.role,
        content: typeof msg.content === 'string' ? msg.content : '',
      };
      // Preserve parts but strip large tool result/args data
      if ((msg as any).parts) {
        base.parts = (msg as any).parts.map((part: any) => {
          if (part.type === 'tool-invocation' || part.type?.startsWith('tool-')) {
            const stripped = { ...part };
            if (stripped.args && typeof stripped.args === 'object') {
              const { source_files: _sf, file_content: _fc, content: _c, ...restArgs } = stripped.args;
              stripped.args = restArgs;
            }
            if (stripped.result && typeof stripped.result === 'object') {
              const { source_files: _sf2, ...restResult } = stripped.result;
              stripped.result = restResult;
            }
            return stripped;
          }
          return part;
        });
      }
      // Preserve toolInvocations but strip large data
      if ((msg as any).toolInvocations) {
        base.toolInvocations = (msg as any).toolInvocations.map((tool: any) => {
          const stripped = { ...tool };
          if (stripped.result?.source_files) {
            const { source_files: _sf, ...restResult } = stripped.result;
            stripped.result = restResult;
          }
          if (stripped.args?.source_files) {
            const { source_files: _sf2, file_content: _fc, content: _c, ...restArgs } = stripped.args;
            stripped.args = restArgs;
          }
          return stripped;
        });
      }
      return base;
    });

    saveChatMessages(messagesToSave as any, currentTitle || undefined).catch(err => {
      console.error('Failed to save chat messages:', err);
    });
  }, [status, messages, user?.id, saveChatMessages, isSandboxPreview, autoGeneratedTitle]);

  // Save sandbox bundle and trigger screenshot capture via API
  useEffect(() => {
    if (!sandboxBundle || !projectId || !user?.id || isSandboxPreview) return;

    const saveAndCapturePreview = async () => {
      try {
        // Wait for questions to be saved first
        await new Promise(resolve => setTimeout(resolve, 2000));

        const response = await fetch(`/api/projects/${projectId}/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            sandboxBundle: sandboxBundle,
          }),
        });

        if (!response.ok) {
          console.error('Failed to save project:', await response.text());
        }
      } catch (error) {
        console.error('Error saving project:', error);
      }
    };

    saveAndCapturePreview();
  }, [sandboxBundle, projectId, user?.id, isSandboxPreview]);

  // Extract sandbox bundle from tool results
  const prevBundleRef = useRef<string | null>(null);
  const messagesLengthRef = useRef(0);

  // Extract sandbox bundle from tool results
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    // Skip if messages length hasn't changed AND status hasn't changed to ready
    const isNewMessage = messages.length !== messagesLengthRef.current;
    const justFinishedStreaming = status === 'ready';

    if (!isNewMessage && !justFinishedStreaming) return;

    messagesLengthRef.current = messages.length;


    // Look through all assistant messages for any tool that returns source_files
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role !== 'assistant') continue;

      // Check ALL tool parts for source_files and preview_url
      for (const part of msg.parts) {
        if (part.type.startsWith('tool-') && part.state === 'output-available') {
          const output = part.output as any;

          if (output?.source_files && Object.keys(output.source_files).length > 0) {

            // Helper function to fix common syntax errors in generated code
            const fixSyntaxIssues = (code: string): string => {
              // Simple approach: Convert all single-quoted strings to template literals
              // This avoids apostrophe issues entirely
              // Match patterns like: text: 'content with apostrophe's'

              // Replace single-quoted strings with template literals (backticks)
              // But only for property values, not for keys
              let fixed = code.replace(/:\s*'([^']*?)'/gs, (match, content) => {
                // If the content doesn't contain newlines or other special chars, use template literal
                // Template literals handle apostrophes naturally
                return `: \`${content}\``;
              });

              return fixed;
            };

            // Normalize all file paths to have leading slashes and fix syntax issues
            const normalizedFiles: Record<string, string> = {};
            Object.entries(output.source_files).forEach(([path, content]) => {
              const normalizedPath = path.startsWith('/') ? path : `/${path}`;
              const contentStr = content as string;
              // Fix syntax issues in the code
              const fixedContent = fixSyntaxIssues(contentStr);
              normalizedFiles[normalizedPath] = fixedContent;
            });

            // Auto-detect entry file if not specified
            const detectEntryFile = (files: Record<string, string>): string => {
              // Config/non-component files that should never be treated as entry points
              const isConfigFile = (key: string): boolean => {
                const name = key.split('/').pop() || '';
                return /^(tailwind|postcss|next|vite|tsconfig|jest|babel|eslint|prettier|webpack)\.(config|setup)\b/i.test(name)
                  || /^tsconfig(\.\w+)?\.json$/i.test(name)
                  || /^package(-lock)?\.json$/i.test(name)
                  || /^\.env/i.test(name)
                  || /^globals?\.(css|scss)$/i.test(name);
              };

              // First check if AI provided an entry point
              if (output.entry_point || output.entry_file || output.entry) {
                const provided = output.entry_point || output.entry_file || output.entry;
                const normalized = provided.startsWith('/') ? provided : `/${provided}`;
                // Only use AI-provided entry if it's not a config file
                if (!isConfigFile(normalized)) return normalized;
              }

              // Look for common entry file patterns
              const fileKeys = Object.keys(files);

              // Priority 0: If the user provided app/page.tsx directly, use it
              const appPages = ['/app/page.tsx', '/app/page.ts', '/app/page.jsx', '/app/page.js'];
              for (const p of appPages) {
                if (fileKeys.includes(p)) return p;
              }

              // Priority 1: Look for App.tsx, App.ts, index.tsx, index.ts
              const commonEntries = ['/App.tsx', '/src/App.tsx', '/Index.tsx', '/src/Index.tsx', '/index.tsx', '/src/index.tsx'];
              for (const entry of commonEntries) {
                if (fileKeys.includes(entry)) return entry;
              }

              // Priority 2: Look for any .tsx/.ts file in root or src (excluding configs)
              const tsxFile = fileKeys.find(key =>
                (key.endsWith('.tsx') || key.endsWith('.ts')) &&
                !isConfigFile(key) &&
                (key.startsWith('/src/') || key.split('/').length === 2)
              );
              if (tsxFile) return tsxFile;

              // Priority 3: First .tsx or .ts file found (excluding configs)
              const firstReactFile = fileKeys.find(key =>
                (key.endsWith('.tsx') || key.endsWith('.ts')) && !isConfigFile(key)
              );
              if (firstReactFile) return firstReactFile;

              // Fallback: first non-config file, or /App.tsx
              const firstNonConfig = fileKeys.find(key => !isConfigFile(key));
              return firstNonConfig || '/App.tsx';
            };

            const normalizedEntry = detectEntryFile(normalizedFiles);

            // Create a proper SandboxBundle with normalized paths
            const bundle: SandboxBundle = {
              files: normalizedFiles,
              entry: normalizedEntry,
              dependencies: output.dependencies || [],
              devDependencies: output.devDependencies || [],
            };

            // Only update if bundle content has changed
            const bundleStr = JSON.stringify(bundle);
            if (bundleStr !== prevBundleRef.current) {
              prevBundleRef.current = bundleStr;


              // Extract and save questions from the generated survey
              const extractAndSaveQuestions = async () => {
                if (!projectId || !user?.id) return;

                try {
                  const questions = extractQuestionsFromSourceFiles(normalizedFiles);

                  if (questions.length > 0) {

                    // Save questions to database
                    const response = await fetch(`/api/projects/${projectId}/questions`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userId: user.id,
                        questions,
                      }),
                    });

                    if (response.ok) {
                    } else {
                      console.error('[Questions] Failed to save questions:', await response.text());
                    }
                  }
                } catch (error) {
                  console.error('[Questions] Error extracting/saving questions:', error);
                }
              };

              // Batch all state updates together to prevent cascading re-renders
              const versionId = `v${Date.now()}`;

              // Extract checkpoint title from message parts
              const checkpointPart = msg.parts?.find(
                (p: any) => p.type === 'tool-set_checkpoint_title' && p.state === 'output-available'
              );
              let versionTitle = (checkpointPart as any)?.output?.checkpoint_title;

              // Fallback: extract first few words from message text
              if (!versionTitle) {
                const textPart = msg.parts?.find((p: any) => p.type === 'text');
                const messageText = (textPart as any)?.text || '';
                const words = messageText.replace(/[#*\-\n]+/g, ' ').trim().split(/\s+/).slice(0, 5);
                versionTitle = words.length > 0 && words[0] ? words.join(' ') : undefined;
              }

              // Update sandbox bundle immediately (no startTransition - we want this to render now)
              setSandboxBundle(bundle);
              setBundleVersions(prev => {
                const newVersion: BundleVersion = {
                  id: versionId,
                  timestamp: Date.now(),
                  bundle: bundle,
                  description: `Version ${prev.length + 1}`,
                  messageId: msg.id,
                  title: versionTitle,
                };
                return [...prev, newVersion];
              });
              setCurrentVersionId(versionId);
              // Force sandbox refresh
              setRendererKey(k => k + 1);

              // Extract and save questions asynchronously
              extractAndSaveQuestions();

              // Save project with sandbox bundle to database (as draft) so it appears in projects list
              const saveProjectWithBundle = async () => {
                if (!projectId || !user?.id) return;

                try {
                  
                  // First ensure project exists (create as draft if needed)
                  // Don't update status if project is already published - avoid race condition with publish
                  const updateBody: any = {
                    title: autoGeneratedTitle || 'Untitled Survey',
                  };
                  // Only set status to draft if project doesn't exist or isn't published
                  if (!project || project.status !== 'published') {
                    updateBody.status = 'draft';
                  }
                  const projectResponse = await fetch(`/api/projects/${projectId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updateBody),
                  });

                  if (!projectResponse.ok) {
                    console.error('[Project Save] Failed to ensure project exists');
                    return;
                  }

                  // Save sandbox bundle to preview endpoint (this saves it to the project)
                  const previewResponse = await fetch(`/api/projects/${projectId}/preview`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userId: user.id,
                      sandboxBundle: bundle,
                    }),
                  });

                  if (previewResponse.ok) {
                    // Update local project state if we have it
                    const previewData = await previewResponse.json();
                    if (previewData.project) {
                      setProject(previewData.project);
                    }
                  } else {
                    console.error('[Project Save] Failed to save sandbox bundle');
                  }
                } catch (error) {
                  console.error('[Project Save] Error saving project:', error);
                }
              };

              // Save project asynchronously
              saveProjectWithBundle();
            } else {
            }
            return; // Use the most recent source_files found
          }
        }
      }
    }

  }, [messages, status]); // Also depend on status to re-check when streaming finishes

  // Track thinking duration
  const [thinkingStartTime, setThinkingStartTime] = useState<number | null>(null);
  const [thinkingDuration, setThinkingDuration] = useState<number>(0);
  const [thinkingFinished, setThinkingFinished] = useState(false);

  // Track when thinking starts/ends - based on when reasoning finishes, not when generation finishes
  useEffect(() => {
    // Check if thinking is done by looking at the last assistant message
    const lastMessage = messages[messages.length - 1];
    const hasNonReasoningParts = lastMessage?.role === 'assistant' && lastMessage?.parts?.some(
      (p: any) => p.type === 'text' || p.type?.startsWith('tool-')
    );

    if (status === 'streaming' || status === 'submitted') {
      // Start timer when streaming begins
      if (!thinkingStartTime && !thinkingFinished) {
        setThinkingStartTime(Date.now());
        setThinkingFinished(false);
      }
      // Stop timer when thinking (reasoning) finishes but generation continues
      if (thinkingStartTime && hasNonReasoningParts && !thinkingFinished) {
        const duration = Math.round((Date.now() - thinkingStartTime) / 1000);
        setThinkingDuration(duration);
        setThinkingFinished(true);
      }
    } else if (status === 'ready') {
      // Generation complete - finalize if not already done
      if (thinkingStartTime && !thinkingFinished) {
        const duration = Math.round((Date.now() - thinkingStartTime) / 1000);
        setThinkingDuration(duration);
      }
      setThinkingStartTime(null);
      setThinkingFinished(false);
    }
  }, [status, thinkingStartTime, thinkingFinished, messages]);

  // Thinking chain state
  const [sidebarView, setSidebarView] = useState<SidebarView>('chat');
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [versionCounter, setVersionCounter] = useState(1);
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'phone'>('desktop');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('/');
  const [pages, setPages] = useState<{ path: string; title: string }[]>([{ path: '/', title: '/' }]);
  const [isChatHidden, setIsChatHidden] = useState(false);
  const [currentView, setCurrentView] = useState<'viewer' | 'flow'>('viewer');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [activeTopButton, setActiveTopButton] = useState<'upgrade' | 'publish' | null>(null);
  const [isCgihadiDropdownOpen, setIsCgihadiDropdownOpen] = useState(false);

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const publishMenuRef = useRef<HTMLDivElement>(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsTotal] = useState(5);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'up' | 'down'>>({});
  // Always publish to marketplace (community)
  const publishToMarketplace = true;
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  // Load project from database (create as draft if doesn't exist)
  useEffect(() => {
    if (!mockMode && projectId && user?.id && !project && !projectLoading) {
      setProjectLoading(true);

      // Try to fetch the project
      fetch(`/api/projects/${projectId}?userId=${user.id}`)
        .then(res => {
          if (!res.ok) {
            // Project doesn't exist yet (404) - create it as a draft
            if (res.status === 404) {
              // Create project as draft via updateProject (which creates if doesn't exist)
              return fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: 'Untitled Survey',
                  status: 'draft',
                }),
              })
                .then(createRes => {
                  if (createRes.ok) {
                    return createRes.json();
                  }
                  throw new Error('Failed to create project');
                })
                .then((createData) => {
                  if (createData?.project) {
                    setProject(createData.project);
                    return createData;
                  }
                  setProject({ id: projectId } as any); // Fallback placeholder
                  return null;
                })
                .catch((err) => {
                  console.error('Failed to create project:', err);
                  setProject({ id: projectId } as any); // Fallback placeholder
                  return null;
                });
            }
            throw new Error(`HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data?.project) {
            // Project exists, use it
            setProject(data.project);
            
            // CRITICAL: Restore sandbox_bundle from database if available
            // This ensures the survey content persists across page navigations
            if (data.project.sandbox_bundle && !sandboxBundle) {
              const restoredBundle: SandboxBundle = {
                files: data.project.sandbox_bundle.files || {},
                entry: data.project.sandbox_bundle.entry || '/App.tsx',
                dependencies: data.project.sandbox_bundle.dependencies || [],
                devDependencies: data.project.sandbox_bundle.devDependencies || [],
              };
              setSandboxBundle(restoredBundle);

              // Restore sandbox preview URL if stored
              // Also add to version history
              const versionId = `restored-${Date.now()}`;
              setBundleVersions(prev => {
                // Don't add if already have versions
                if (prev.length > 0) return prev;
                return [{
                  id: versionId,
                  timestamp: Date.now(),
                  bundle: restoredBundle,
                  description: 'Restored from saved project',
                }];
              });
              setCurrentVersionId(versionId);
            }
            
            // Restore title if available (check for both default titles)
            if (data.project.title && data.project.title !== 'Untitled Project' && data.project.title !== 'Untitled Survey') {
              setAutoGeneratedTitle(data.project.title);
            }
          }
          // If project doesn't exist, it will be created on first publish
        })
        .catch(err => {
          console.error('Failed to load project:', err);
          // Set placeholder to prevent infinite retries
          setProject({ id: projectId } as any);
        })
        .finally(() => setProjectLoading(false));
    }
  }, [mockMode, projectId, user?.id, project, projectLoading]);

  // Initialize published URL from project
  useEffect(() => {
    if (project?.published_url && !publishedUrl) {
      setPublishedUrl(project.published_url);
    }
  }, [project, publishedUrl]);

  // Handle remix mode - create a copy of the project for the current user
  const [isRemixing, setIsRemixing] = useState(false);
  useEffect(() => {
    const isRemixMode = searchParams?.get('remix') === 'true';

    if (isRemixMode && projectId && user?.id && !isRemixing && project) {
      // Check if this project belongs to another user (needs remixing)
      const isOwnProject = project.user_id === user.id;

      if (!isOwnProject) {
        setIsRemixing(true);

        fetch('/api/marketplace/remix', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            userId: user.id,
          }),
        })
          .then(res => res.json())
          .then(data => {
            if (data.redirectUrl) {
              // Navigate to the new remixed project
              router.replace(data.redirectUrl);
            }
          })
          .catch(err => {
            console.error('Failed to remix project:', err);
            setIsRemixing(false);
          });
      } else {
        // It's the user's own project, just remove the remix param
        const url = new URL(window.location.href);
        url.searchParams.delete('remix');
        router.replace(url.pathname + url.search);
      }
    }
  }, [searchParams, projectId, user?.id, project, isRemixing, router]);

  // Subscribe to real-time messages for this project
  useEffect(() => {
    if (projectId && user && !mockMode) {
      const unsubscribe = subscribeToProject();
      return unsubscribe;
    }
  }, [projectId, user, mockMode]);

    // Sync in-frame navigations to the route dropdown and handle page registration
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data: any = e.data || {};

      // Handle page registration from survey
      if (data?.type === 'deepsite:registerPages' && Array.isArray(data.pages)) {
        setPages(data.pages);
        // If we're on "/" and pages were registered, select the first one
        if (data.pages.length > 0 && selectedRoute === '/') {
          setSelectedRoute(data.pages[0].path);
        }
      }

      // Handle navigation sync
      if (data && data.type === 'deepsite:navigate' && typeof data.path === 'string') {
        setSelectedRoute(prevRoute => {
          // Only update if the route actually changed
          if (prevRoute !== data.path) {
            return data.path;
          }
          return prevRoute;
        });
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [selectedRoute]);



  // Handle initial prompt from session storage
  const hasSubmittedInitialPrompt = useRef(false);
  useEffect(() => {
    // Check for initial prompt and files from session storage
    if (hasSubmittedInitialPrompt.current) return;

    let initialPrompt: string | null = null;
    let initialFiles: FileUIPart[] = [];
    try {
      if (typeof window !== 'undefined') {
        initialPrompt = sessionStorage.getItem('surbee_initial_prompt');
        // Try new format first (FileUIPart[])
        const filesStr = sessionStorage.getItem('surbee_initial_files');
        if (filesStr) {
          try { initialFiles = JSON.parse(filesStr) as FileUIPart[]; } catch {}
          sessionStorage.removeItem('surbee_initial_files');
        }
        // Fallback: check for old format (string[] of data URLs) for backwards compatibility
        if (initialFiles.length === 0) {
          const imagesStr = sessionStorage.getItem('surbee_initial_images');
          if (imagesStr) {
            try {
              const oldImages = JSON.parse(imagesStr) as string[];
              // Convert old format to FileUIPart format
              initialFiles = oldImages.map((url, idx) => ({
                type: 'file' as const,
                filename: `image-${idx}.png`,
                mediaType: 'image/png',
                url
              }));
            } catch {}
            sessionStorage.removeItem('surbee_initial_images');
          }
        }
        if (initialPrompt) {
          sessionStorage.removeItem('surbee_initial_prompt');
        }
      }
    } catch {}

    if (initialPrompt && status === 'ready') {
      hasSubmittedInitialPrompt.current = true;
      handleSubmit(initialPrompt, initialFiles.length > 0 ? initialFiles : undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Update placeholder class in editor when chat text changes
  useEffect(() => {
    const contentEditableDiv = document.querySelector('.ProseMirror') as HTMLDivElement;
    if (contentEditableDiv) {
      const isEmpty = !contentEditableDiv.textContent || contentEditableDiv.textContent.trim() === '';
      if (isEmpty) {
        contentEditableDiv.classList.add('is-editor-empty');
      } else {
        contentEditableDiv.classList.remove('is-editor-empty');
      }
    }
  }, [chatText]);













  const handleRestoreVersion = useCallback((versionId: string) => {
    const version = bundleVersions.find(v => v.id === versionId);
    if (!version) {
      console.error('[Version History] Version not found:', versionId);
      return;
    }

    setSandboxBundle(version.bundle);
    setCurrentVersionId(versionId);
    setSidebarView('chat'); // Switch back to chat view after restore
  }, [bundleVersions]);

  // FileUIPart type for AI SDK compatibility
  type FileUIPart = {
    type: 'file';
    filename: string;
    mediaType: string;
    url: string;
  };

  const handleSubmit = useCallback(async (message: string, files?: FileUIPart[]) => {
    if (!message.trim() || status !== 'ready') return;

    setHasStartedChat(true);

    // Generate title from first message using AI if not already set
    if (!autoGeneratedTitle && message.trim()) {
      setIsTitleGenerating(true);

      // Run title generation in background without blocking message send
      fetch('/api/generate-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: message,
          model: selectedModelRef.current // Pass the selected model
        }),
      })
        .then(async (response) => {
          if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let streamedTitle = '';

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              streamedTitle += chunk;
            }

            if (streamedTitle.trim()) {
              const generatedTitle = streamedTitle.trim();
              setAutoGeneratedTitle(generatedTitle);

              // Save title to database
              if (projectId && user?.id) {
                fetch(`/api/projects/${projectId}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: user.id,
                    title: generatedTitle,
                  }),
                })
                  .then((res) => {
                    if (res.ok) {
                    }
                  })
                  .catch((err) => console.error('Failed to save title:', err));
              }
            }
          }
        })
        .catch((error) => {
          console.error('Title generation failed:', error);
          // Fallback to simple title generation
          const words = message.trim().split(/\s+/);
          const titleWords = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
          const fallbackTitle = titleWords.join(' ');
          setAutoGeneratedTitle(fallbackTitle);

          // Save fallback title to database
          if (projectId && user?.id) {
            fetch(`/api/projects/${projectId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: user.id,
                title: fallbackTitle,
              }),
            }).catch((err) => console.error('Failed to save title:', err));
          }
        })
        .finally(() => {
          setIsTitleGenerating(false);
        });
    }

    // Use the current selected model from state
    const currentModel = selectedModelRef.current;
    // Send message with files using AI SDK's proper format
    const sendOptions = {
      body: {
        model: currentModel,
        projectId: id,
        userId: user?.id,
        userPreferences: userPreferences || undefined,
        thinking: true,
      }
    };

    // Build the message with visual edit element context if present
    let finalMessage = message;
    if (visualEditElement) {
      finalMessage = `${message}

---
Selected element to modify:
- Selector: ${visualEditElement.selector}
- Text content: ${visualEditElement.text || '(no text)'}
- HTML snippet:
\`\`\`html
${visualEditElement.outerHTML}
\`\`\`

Please make changes specifically to this element.`;
      // Clear the selection after sending
      setVisualEditElement(null);
    }

    if (files && files.length > 0) {
      // Send files using the AI SDK format: { text, files }
      sendMessage({ text: finalMessage, files }, sendOptions);
    } else {
      sendMessage({ text: finalMessage }, sendOptions);
    }
  }, [status, autoGeneratedTitle, visualEditElement]); // sendMessage and selectedModel intentionally excluded - using refs/direct access

  const handleSandboxFixRequest = useCallback((errorMessage: string) => {
    if (status !== 'ready') return;

    const fixPrompt = `[AUTO-FIX] The sandbox preview has a build error. Fix it without changing the design or functionality:\n\n${errorMessage}`;

    // Send auto-fix message with freeAutoFix flag to skip credit deduction
    sendMessage(
      { text: fixPrompt },
      {
        body: {
          model: selectedModelRef.current,
          projectId: id,
          userId: user?.id,
          thinking: true,
          freeAutoFix: true,
        },
      }
    );
    setSandboxError(null);
  }, [status, sendMessage, id, user?.id]);

  const handleSandboxIgnore = useCallback(() => {
    setSandboxError(null);
  }, []);

  const handlePublish = useCallback(async () => {
    if (!projectId || !user?.id) return;

    // Check if there's code in the sandbox
    if (!sandboxAvailable || !sandboxBundle) {
      setPublishSuccess('Please generate code before publishing');
      setTimeout(() => setPublishSuccess(null), 3000);
      return;
    }

    setIsPublishing(true);
    setPublishSuccess(null);

    try {
      // First, ensure the sandbox bundle is saved to the project
      await fetch(`/api/projects/${projectId}/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          sandboxBundle: sandboxBundle,
        })
      });

      // Then publish the project (creates it if it doesn't exist)
      // CRITICAL: Include sandboxBundle to ensure it's saved with the published project
      const response = await fetch(`/api/projects/${projectId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          surveySchema: null, // Can add survey schema if needed
          sandboxBundle: sandboxBundle, // Include the sandbox bundle for the shared survey
          publishToMarketplace
        })
      });

      const data = await response.json();

      if (data.success && data.publishedUrl) {
        setPublishedUrl(data.publishedUrl);
        setPublishSuccess(project?.status === 'published' ? 'Survey updated successfully!' : 'Survey published successfully!');

        // Update project status and store the full project
        const updatedProject = data.project || {
          id: projectId,
          status: 'published',
          published_url: data.publishedUrl,
          user_id: user.id
        };
        setProject(updatedProject as any);

        // Update the projects cache in userStore
        const { updateProject: updateStoreProject, projects: cachedProjects } = useUserStore.getState();
        // If project exists in cache, update it; otherwise it will be fetched next time
        if (cachedProjects.some(p => p.id === projectId)) {
          updateStoreProject(projectId, {
            status: 'published',
            published_url: data.publishedUrl,
            updated_at: new Date().toISOString(),
          });
        }

        // Trigger screenshot capture after publishing (server-side)
        try {
          fetch(`/api/projects/${projectId}/capture-screenshot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publishedUrl: data.publishedUrl })
          }).catch(() => {}); // Fire and forget
        } catch {}

        setTimeout(() => setPublishSuccess(null), 3000);
      } else {
        throw new Error(data.error || 'Failed to publish');
      }
    } catch (error) {
      console.error('Failed to publish:', error);
      setPublishSuccess('Failed to publish. Please try again.');
      setTimeout(() => setPublishSuccess(null), 3000);
    } finally {
      setIsPublishing(false);
    }
  }, [projectId, user?.id, publishToMarketplace, project, sandboxAvailable, sandboxBundle]);

  const copyPublishedLink = useCallback(async () => {
    if (!projectId) return;

    try {
      // Get custom slug from share settings
      const shareResponse = await fetch(`/api/projects/${projectId}/share-settings`);
      if (shareResponse.ok) {
        const shareData = await shareResponse.json();
        const slug = shareData?.customSlug || projectId.substring(0, 8);
        const fullUrl = `https://form.surbee.dev/${slug}`;
        await navigator.clipboard.writeText(fullUrl);
        setPublishSuccess('Link copied to clipboard!');
        setTimeout(() => setPublishSuccess(null), 2000);
      } else {
        // Fallback to projectId if share settings fail
        const fullUrl = `https://form.surbee.dev/${projectId.substring(0, 8)}`;
        await navigator.clipboard.writeText(fullUrl);
        setPublishSuccess('Link copied to clipboard!');
        setTimeout(() => setPublishSuccess(null), 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [projectId]);

  // Copy message content to clipboard
  const handleCopyMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  // Handle suggestion pill click - send as new message
  const handleSuggestionClick = useCallback((suggestion: string) => {
    if (status !== 'ready') return;
    // Send the suggestion as a new user message
    sendMessage({ content: suggestion });
  }, [status, sendMessage]);

  // Handle feedback (thumbs up/down)
  const handleFeedback = useCallback(async (messageId: string, feedbackType: 'up' | 'down', messageContent: string) => {
    // Update local state immediately
    setFeedbackGiven(prev => ({ ...prev, [messageId]: feedbackType }));

    // Send to API
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          projectId,
          messageId,
          feedbackType: feedbackType === 'up' ? 'thumbs_up' : 'thumbs_down',
          messageContent,
          context: {
            model: selectedModel,
            timestamp: new Date().toISOString(),
          },
        }),
      });
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  }, [user?.id, projectId, selectedModel]);

  // Handle retry - delete last message and regenerate
  const handleRetry = useCallback(() => {
    // Reset thinking duration for new attempt
    setThinkingDuration(0);
    setThinkingStartTime(null);
    setThinkingFinished(false);
    // Call reload which regenerates the last response
    reload();
  }, [reload]);

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const processFile = (file: File) => {
    if (!isImageFile(file)) {
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      return;
    }
    setFiles(prev => (prev.length >= 10 ? prev : [...prev, file].slice(0, 10)));
    const reader = new FileReader();
    reader.onload = (e) => setFilePreviews(prev => ({ ...prev, [file.name]: e.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    const newPreviews = { ...filePreviews };
    delete newPreviews[files[index].name];
    setFilePreviews(newPreviews);
  };

  const openImageModal = (imageUrl: string) => setSelectedImage(imageUrl);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => isImageFile(file));
    imageFiles.slice(0, 10).forEach(processFile);
  };

  const handlePaste = (e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const images: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) images.push(file)
      }
    }
    if (images.length) {
      e.preventDefault();
      images.slice(0, 10).forEach(processFile)
    }
  };

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  // Close publish menu on outside click or Escape
  useEffect(() => {
    if (!isPublishOpen && !isShareOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (publishMenuRef.current && !publishMenuRef.current.contains(t)) setIsPublishOpen(false);
      if (shareMenuRef.current && !shareMenuRef.current.contains(t)) setIsShareOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPublishOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isPublishOpen, isShareOpen]);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle copy event to strip formatting (copy as plain text only)
  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;

    const handleCopy = (e: ClipboardEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      // Get plain text only
      const plainText = selection.toString();

      // Set clipboard to plain text only
      e.clipboardData?.setData('text/plain', plainText);
      e.preventDefault();
    };

    chatArea.addEventListener('copy', handleCopy);
    return () => chatArea.removeEventListener('copy', handleCopy);
  }, []);

  // Visual Edit mode - uses postMessage to communicate with cross-origin sandbox iframe
  useEffect(() => {
    // Find the Sandpack preview iframe
    const iframe = document.querySelector('iframe[title="Survey Preview"]') as HTMLIFrameElement;

    // Send edit mode state to iframe via postMessage
    if (iframe?.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'visual-edit-mode', enabled: isEditMode }, '*');
    }

    if (!isEditMode) {
      setHoveredElement(null);
      return;
    }

    // Listen for element selection from iframe
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'visual-edit-select' && e.data.element) {
        const { selector, outerHTML, textContent } = e.data.element;
        setVisualEditElement({ selector, outerHTML, textContent });
        // Auto-disable edit mode after selection
        setIsEditMode(false);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isEditMode]);

  // Legacy visual edit code - kept for backwards compatibility with same-origin iframes
  useEffect(() => {
    if (!isEditMode) return;

    // Find the Sandpack preview iframe via DOM query
    const iframe = document.querySelector('iframe[title="Survey Preview"]') as HTMLIFrameElement;
    if (!iframe) return;

    // Try to access iframe document - may fail due to cross-origin restrictions
    let iframeDoc: Document | null = null;
    try {
      iframeDoc = iframe.contentDocument || iframe.contentWindow?.document || null;
    } catch (e) {
      // Cross-origin access blocked - postMessage handler above will be used instead
      return;
    }
    if (!iframeDoc) return;

    let highlightOverlay: HTMLDivElement | null = null;

    const createHighlight = () => {
      if (!highlightOverlay) {
        highlightOverlay = iframeDoc!.createElement('div');
        highlightOverlay.id = 'visual-edit-highlight';
        highlightOverlay.style.cssText = `
          position: fixed;
          pointer-events: none;
          border: 2px solid #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 4px;
          z-index: 999999;
          transition: all 0.1s ease;
        `;
        iframeDoc!.body.appendChild(highlightOverlay);
      }
      return highlightOverlay;
    };

    const findEditableParent = (el: HTMLElement): HTMLElement | null => {
      let current: HTMLElement | null = el;
      while (current && current !== iframeDoc!.body) {
        const style = window.getComputedStyle(current);
        const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
        const hasBorder = style.border !== 'none' && style.borderWidth !== '0px';
        const hasMinSize = current.offsetWidth > 50 && current.offsetHeight > 30;
        const isInteractive = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'IMG', 'H1', 'H2', 'H3', 'P', 'SPAN', 'DIV'].includes(current.tagName);

        if ((hasBackground || hasBorder || isInteractive) && hasMinSize) {
          return current;
        }
        current = current.parentElement;
      }
      return null;
    };

    const getSelector = (el: HTMLElement): string => {
      if (el.id) return `#${el.id}`;
      if (el.className && typeof el.className === 'string') {
        const classes = el.className.split(' ').filter(c => c && !c.startsWith('hover')).slice(0, 2).join('.');
        if (classes) return `${el.tagName.toLowerCase()}.${classes}`;
      }
      return el.tagName.toLowerCase();
    };

    const handleMouseMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const editable = findEditableParent(target);

      if (editable) {
        const highlight = createHighlight();
        const rect = editable.getBoundingClientRect();
        highlight.style.top = `${rect.top}px`;
        highlight.style.left = `${rect.left}px`;
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;
        highlight.style.display = 'block';
      } else if (highlightOverlay) {
        highlightOverlay.style.display = 'none';
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const target = e.target as HTMLElement;
      const editable = findEditableParent(target);

      if (editable) {
        const selector = getSelector(editable);
        const outerHTML = editable.outerHTML.slice(0, 500);
        const text = editable.textContent?.trim().slice(0, 200) || '';

        setVisualEditElement({ selector, outerHTML, text });
        setIsEditMode(false);
      }
    };

    iframeDoc.addEventListener('mousemove', handleMouseMove);
    iframeDoc.addEventListener('click', handleClick, true);

    return () => {
      iframeDoc.removeEventListener('mousemove', handleMouseMove);
      iframeDoc.removeEventListener('click', handleClick, true);
      if (highlightOverlay && highlightOverlay.parentNode) {
        highlightOverlay.parentNode.removeChild(highlightOverlay);
      }
    };
  }, [isEditMode]);

  const addHistoryEntry = (prompt: string, changes: string[]) => {
    const newEntry: HistoryEntry = {
      id: Date.now().toString(),
      prompt,
      timestamp: new Date(),
      changes,
      version: versionCounter,
      isFlagged: false,
    };
    setHistoryEntries(prev => [newEntry, ...prev]);
    setVersionCounter(prev => prev + 1);
  };

  const toggleHistoryFlag = (entryId: string) => {
    setHistoryEntries(prev => 
      prev.map(entry => 
        entry.id === entryId 
          ? { ...entry, isFlagged: !entry.isFlagged }
          : entry
      )
    );
  };

  const formatHistoryDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const togglePageDropdown = () => {
    setIsPageDropdownOpen(!isPageDropdownOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.cgihadi-dropdown')) {
        setIsCgihadiDropdownOpen(false);
      }
      if (!target.closest('.page-dropdown')) {
        setIsPageDropdownOpen(false);
      }
      // Close publish dropdown when clicking outside
      if (!target.closest('.publish-dropdown') && !target.closest('[data-publish-trigger]')) {
        setIsPublishOpen(false);
        if (activeTopButton === 'publish') {
          setActiveTopButton(null);
        }
      }
    };

    if (isCgihadiDropdownOpen || isPageDropdownOpen || isPublishOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCgihadiDropdownOpen, isPageDropdownOpen, isPublishOpen, activeTopButton]);

  const getDeviceStyles = () => {
    switch (currentDevice) {
      case 'phone':
        // Shrink width only; keep full height
        return 'w-[375px] max-w-full h-full';
      case 'tablet':
        // Shrink width only; keep full height
        return 'w-[768px] max-w-full h-full';
      default:
        return 'w-full h-full';
    }
  };

  // Handle element clicks in sandbox for parent window communication
  const handleElementClick = (element: HTMLElement) => {
    if (isSandboxPreview && window.parent) {
      window.parent.postMessage({
        type: 'element-selected',
        element: {
          tagName: element.tagName,
          textContent: element.textContent,
          styles: window.getComputedStyle(element)
        }
      }, window.location.origin);
    }
  };

  // If this is a sandbox preview request, show only the sandbox
  if (isSandboxPreview) {
    // For sandbox preview, we need to ensure sandbox bundle is loaded
    // Use mock bundle if none exists
    const previewBundle = sandboxBundle || {
      files: {
        "src/App.tsx": `export default function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-8">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-8 py-12 text-center max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Survey Preview</h1>
        <p className="text-white/70 mb-6">
          This survey is being built. The preview will appear once the sandbox is ready.
        </p>
        <div className="text-sm text-white/50">
          Project: ${projectId}
        </div>
      </div>
    </main>
  );
}`,
      },
      entry: 'src/App.tsx',
      dependencies: ['react', 'react-dom', 'lucide-react'],
    };

    return (
      <div className="h-screen w-full bg-[#0a0a0a] text-white">
        {/* Show sandbox view only */}
        <div className="relative h-full w-full">
          <ModalSandboxPreview
            bundle={previewBundle}
            className="h-full w-full"
            projectId={projectId}
          />
          {/* Overlay to capture clicks for element selection */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'transparent',
              zIndex: 10
            }}
          >
            <div
              className="w-full h-full pointer-events-auto cursor-crosshair opacity-0 hover:opacity-10 transition-opacity"
              style={{
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 50%)',
              }}
              onClick={(e) => {
                // For sandbox preview, we need to handle clicks differently
                // The iframe will handle its own click events
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppLayout hideSidebar fullBleed>
      <div className="flex h-full w-full" style={{ fontFamily: 'FK Grotesk, sans-serif', backgroundColor: 'var(--surbee-sidebar-bg)', color: 'var(--surbee-fg-primary)' }}>
      {/* Left Sidebar - Chat Area */}
      <div className={`flex flex-col transition-all duration-300 ${
        isChatHidden ? 'w-0 opacity-0 pointer-events-none' : (isSidebarCollapsed ? 'w-16' : 'w-140')
      }`} style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
        {/* Profile Section at Top - aligned with right header buttons */}
        <div className="relative flex items-center px-3 pt-3 pb-0">
          <button
            onClick={() => setIsUserMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-md transition-colors hover:bg-white/5"
            style={{
              cursor: 'pointer',
              padding: '8px 12px',
              fontFamily: 'FK Grotesk, sans-serif'
            }}
          >
            {isTitleGenerating ? (
              <motion.span
                className="inline-block text-sm font-semibold bg-[length:250%_100%] bg-clip-text text-transparent"
                initial={{ backgroundPosition: '100% center' }}
                animate={{ backgroundPosition: '0% center' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                style={{
                  '--base-color': 'var(--surbee-fg-secondary, #71717a)',
                  '--shimmer-color': 'var(--surbee-fg-primary, #ffffff)',
                  backgroundImage: 'linear-gradient(90deg, transparent calc(50% - 40px), var(--shimmer-color), transparent calc(50% + 40px)), linear-gradient(var(--base-color), var(--base-color))',
                  backgroundRepeat: 'no-repeat, padding-box',
                } as React.CSSProperties}
              >
                Generating title...
              </motion.span>
            ) : (
              <span className="text-sm font-semibold truncate max-w-[180px]" style={{ color: 'var(--surbee-fg-primary)' }}>
                {autoGeneratedTitle || 'Untitled Survey'}
              </span>
            )}
            {isUserMenuOpen ? <ChevronUp className="h-3 w-3 flex-shrink-0" style={{ opacity: 0.6, color: 'var(--surbee-fg-primary)' }} /> : <ChevronDown className="h-3 w-3 flex-shrink-0" style={{ opacity: 0.6, color: 'var(--surbee-fg-primary)' }} />}
          </button>

          {/* Overlay to close on outside click */}
          {isUserMenuOpen && (
            <div className="user-menu-overlay" onClick={() => setIsUserMenuOpen(false)} />
          )}

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="user-menu-panel"
                style={{ position: 'absolute', left: '16px', top: '60px', bottom: 'auto' }}
                role="menu"
              >
                {/* User info header */}
                <div className="user-menu-header-section">
                  <div className="user-menu-username">{user?.email?.split('@')[0] || 'User'}</div>
                  <div className="user-menu-email">{user?.email || ''}</div>
                </div>

                {/* Credits Section */}
                <div className="flex flex-col gap-2 px-3 py-3" style={{ color: 'var(--surbee-sidebar-text-muted)' }}>
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--surbee-sidebar-text-muted)' }}>
                      <Coins className="w-3 h-3" />
                      Credits
                    </h5>
                    <span className="text-xs">
                      {creditsLoading ? (
                        <span style={{ color: 'var(--surbee-sidebar-text-secondary)' }}>Loading...</span>
                      ) : credits ? (
                        <>
                          <span style={{ color: 'var(--surbee-sidebar-text-muted)' }}>{credits.creditsRemaining.toLocaleString()}</span>
                          <span style={{ color: 'var(--surbee-sidebar-text-secondary)' }}> / {credits.monthlyCredits.toLocaleString()}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--surbee-sidebar-text-secondary)' }}>--</span>
                      )}
                    </span>
                  </div>
                  <div
                    className="relative h-2 w-full overflow-hidden rounded-full"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                    aria-valuemax={100}
                    aria-valuemin={0}
                    aria-valuenow={percentUsed}
                    aria-valuetext={`${percentUsed}%`}
                    role="progressbar"
                  >
                    <div className="h-full w-full">
                      <div
                        className="h-full w-full flex-1 transition-all rounded-full"
                        style={{
                          backgroundColor: percentUsed > 80 ? '#ef4444' : percentUsed > 50 ? '#eab308' : '#3b82f6',
                          width: `${100 - percentUsed}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs leading-4" style={{ color: 'var(--surbee-sidebar-text-secondary)' }}>
                    {credits?.plan === 'enterprise' ? (
                      'Unlimited credits on Enterprise plan.'
                    ) : daysUntilReset !== null ? (
                      <>
                        {daysUntilReset === 0 ? 'Credits reset today.' : `${daysUntilReset} day${daysUntilReset === 1 ? '' : 's'} until credits reset.`}
                        {credits?.plan !== 'max' && (
                          <>
                            {' '}
                            <button
                              className="hover:underline cursor-pointer"
                              type="button"
                              onClick={() => { setIsUserMenuOpen(false); handleNavigation('/home/pricing'); }}
                              style={{ color: 'var(--surbee-sidebar-text-muted)' }}
                            >
                              Upgrade
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        Credits reset monthly.
                        {credits?.plan !== 'max' && (
                          <>
                            {' '}
                            <button
                              className="hover:underline cursor-pointer"
                              type="button"
                              onClick={() => { setIsUserMenuOpen(false); handleNavigation('/home/pricing'); }}
                              style={{ color: 'var(--surbee-sidebar-text-muted)' }}
                            >
                              Upgrade
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </p>
                </div>

                {/* Back to Dashboard */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/home'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center gap-2">
                    <div className="user-menu-icon-circle">
                      <Home className="h-4 w-4" />
                    </div>
                    <span>Back to Dashboard</span>
                  </div>
                </button>

                {/* Project Settings */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); setIsProjectSettingsOpen(true); }}
                  className="user-menu-setup-profile"
                >
                  Project Settings
                </button>

                {/* Theme selector */}
                <div className="user-menu-theme-section">
                  <div className="user-menu-theme-label">Theme</div>
                  <div className="user-menu-theme-toggle">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`user-menu-theme-btn ${theme === 'light' ? 'active' : ''}`}
                          onClick={() => setTheme('light')}
                          aria-label="Light theme"
                        >
                          <Sun className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={4}>Light</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`user-menu-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                          onClick={() => setTheme('dark')}
                          aria-label="Dark theme"
                        >
                          <Moon className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={4}>Dark</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={`user-menu-theme-btn ${theme === 'system' ? 'active' : ''}`}
                          onClick={() => setTheme('system')}
                          aria-label="System theme"
                        >
                          <Laptop className="h-4 w-4" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={4}>System</TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* Support */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); window.open('/support', '_blank'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Support</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-40" />
                  </div>
                </button>

                {/* Log out */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleProfileAction('logout'); }}
                  className="user-menu-item"
                >
                  <span>Log out</span>
                </button>

                {/* Footer */}
                <div className="user-menu-footer">
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleNavigation('/privacy'); }}
                    className="user-menu-footer-link"
                  >
                    Privacy
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleNavigation('/terms'); }}
                    className="user-menu-footer-link"
                  >
                    Terms
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleNavigation('/copyright'); }}
                    className="user-menu-footer-link"
                  >
                    Copyright
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); window.open('https://x.com/surbee', '_blank'); }}
                    className="user-menu-footer-link"
                    aria-label="X (Twitter)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Area in Sidebar */}
          <div className="flex-1 flex flex-col min-h-0">
            {sidebarView === 'history' ? (
              /* Version History View */
              <div className="flex-1 overflow-hidden">
                <VersionHistory
                  versions={bundleVersions}
                  currentVersionId={currentVersionId}
                  onRestore={handleRestoreVersion}
                />
              </div>
            ) : (
              /* Chat Messages View */
              <div className="flex-1 overflow-y-auto pl-4 pr-2 pt-6 thin-scrollbar" style={{ paddingBottom: '80px' }} ref={chatAreaRef}>
                <div className="space-y-4">
                  {messages?.map((msg, idx) => (
                    <div key={msg.id} className="space-y-2">
                      {msg.role === 'user' ? (
                        <div className="flex flex-col items-end gap-2">
                          {/* Show images above the bubble */}
                          {(() => {
                            const imageParts = msg.parts?.filter(p => p.type === 'image') || [];
                            const fileParts = msg.parts?.filter(p =>
                              p.type === 'file' && (p as any).mediaType?.startsWith('image/')
                            ) || [];
                            const allImageParts = [...imageParts, ...fileParts];

                            if (allImageParts.length > 0) {
                              return (
                                <div className="flex flex-wrap gap-2 justify-end">
                                  {allImageParts.map((part, imgIdx) => {
                                    let imageUrl: string;
                                    if (part.type === 'image') {
                                      imageUrl = typeof part.image === 'string'
                                        ? part.image
                                        : part.image instanceof URL
                                          ? part.image.toString()
                                          : URL.createObjectURL(new Blob([part.image as any]));
                                    } else {
                                      imageUrl = (part as any).url || '';
                                    }
                                    return (
                                      <div key={imgIdx} className="h-24 w-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <img src={imageUrl} alt={`Attachment ${imgIdx + 1}`} className="w-full h-full object-cover" />
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }
                            return null;
                          })()}

                          {/* User prompt bubble */}
                          <div
                            className="flex flex-col max-w-[80%] rounded-[20px] px-4 py-3"
                            style={{ backgroundColor: 'var(--surbee-bg-tertiary)', color: 'var(--surbee-fg-primary)' }}
                          >
                            <div
                              className="text-[14px] leading-[1.5] whitespace-pre-wrap"
                              style={{ wordBreak: 'break-word', color: 'inherit' }}
                            >
                              {msg.parts?.find(p => p.type === 'text')?.text || ''}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Progressive rendering - interleave workflow blocks with text */}
                          {(() => {
                            if (msg.role !== 'assistant') return msg.parts.map((part, partIdx) => {
                              if (part.type === 'text') {
                                return (
                                  <motion.div
                                    key={`text-${partIdx}`}
                                    className="max-w-none ai-response-markdown leading-relaxed text-[var(--surbee-fg-primary)]"
                                    style={{ fontSize: '16px' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                  >
                                    <Response>{part.text}</Response>
                                  </motion.div>
                                );
                              }
                              return null;
                            });

                            const isLastMessage = idx === messages.length - 1;
                            const isMessageStreaming = isLastMessage && status !== 'ready';
                            const hiddenTools = new Set(['suggest_followups', 'save_survey_questions']);

                            // Build progressive segments: group consecutive non-text parts
                            // into workflow blocks, with text parts between them
                            type Segment =
                              | { kind: 'workflow'; parts: any[] }
                              | { kind: 'text'; text: string; partIdx: number };

                            const segments: Segment[] = [];
                            let currentWorkflowParts: any[] = [];

                            for (let i = 0; i < msg.parts.length; i++) {
                              const part = msg.parts[i];

                              if (part.type === 'text') {
                                // Flush any accumulated workflow parts
                                if (currentWorkflowParts.length > 0) {
                                  segments.push({ kind: 'workflow', parts: [...currentWorkflowParts] });
                                  currentWorkflowParts = [];
                                }
                                if ((part as any).text?.trim()) {
                                  segments.push({ kind: 'text', text: (part as any).text, partIdx: i });
                                }
                              } else if (part.type === 'reasoning') {
                                currentWorkflowParts.push({
                                  type: 'reasoning' as const,
                                  reasoning: (part as any).text || (part as any).reasoning || (part as any).content || '',
                                });
                              } else if (part.type.startsWith('tool-') || (part as any).type === 'dynamic-tool') {
                                const toolName = (part as any).type === 'dynamic-tool'
                                  ? (part as any).toolName
                                  : part.type.replace('tool-', '');
                                if (!hiddenTools.has(toolName)) {
                                  currentWorkflowParts.push({
                                    type: 'tool-invocation' as const,
                                    toolName,
                                    input: (part as any).input || (part as any).args,
                                    result: (part as any).output,
                                    state: (part as any).state === 'output-available' ? 'result' : 'pending',
                                  });
                                }
                              }
                            }

                            // Flush remaining workflow parts
                            if (currentWorkflowParts.length > 0) {
                              segments.push({ kind: 'workflow', parts: currentWorkflowParts });
                            }

                            if (segments.length === 0 && !isMessageStreaming) return null;

                            return segments.map((segment, segIdx) => {
                              if (segment.kind === 'workflow') {
                                const workflowBlocks = convertPartsToWorkflowBlocks(segment.parts, isMessageStreaming);
                                if (workflowBlocks.length === 0) return null;
                                return (
                                  <AgentWorkflow
                                    key={`workflow-${segIdx}`}
                                    blocks={workflowBlocks}
                                    isStreaming={isMessageStreaming && segIdx === segments.length - 1}
                                  />
                                );
                              }
                              if (segment.kind === 'text') {
                                return (
                                  <motion.div
                                    key={`text-${segment.partIdx}`}
                                    className="max-w-none ai-response-markdown leading-relaxed text-[var(--surbee-fg-primary)]"
                                    style={{ fontSize: '16px' }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3, ease: "easeOut" }}
                                  >
                                    <Response>{segment.text}</Response>
                                  </motion.div>
                                );
                              }
                              return null;
                            });
                          })()}

                          {/* Action buttons - only show when message is complete */}
                          {idx === messages.length - 1 && status === 'ready' && msg.parts.some(p => p.type === 'text') && (
                            <div className="flex items-center gap-0.5 pt-2">
                              {/* Retry */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={handleRetry}
                                    className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                                    disabled={!(status === 'ready' || status === 'error')}
                                  >
                                    <RotateCcw className="w-4 h-4 text-muted-foreground" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={4}>Regenerate</TooltipContent>
                              </Tooltip>
                              {/* Copy */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => {
                                      const textContent = msg.parts?.find(p => p.type === 'text')?.text || '';
                                      handleCopyMessage(msg.id, textContent);
                                    }}
                                    className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
                                  >
                                    {copiedMessageId === msg.id ? (
                                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                                    ) : (
                                      <Copy className="w-4 h-4 text-muted-foreground" />
                                    )}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={4}>{copiedMessageId === msg.id ? "Copied!" : "Copy"}</TooltipContent>
                              </Tooltip>
                              {/* Thumbs up */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => {
                                      const textContent = msg.parts?.find(p => p.type === 'text')?.text || '';
                                      handleFeedback(msg.id, 'up', textContent);
                                    }}
                                    className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${feedbackGiven[msg.id] === 'up' ? 'bg-white/10' : ''}`}
                                    disabled={!!feedbackGiven[msg.id]}
                                  >
                                    <ThumbsUp className={`w-4 h-4 ${feedbackGiven[msg.id] === 'up' ? 'text-green-500' : 'text-muted-foreground'}`} />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={4}>Good response</TooltipContent>
                              </Tooltip>
                              {/* Thumbs down */}
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    onClick={() => {
                                      const textContent = msg.parts?.find(p => p.type === 'text')?.text || '';
                                      handleFeedback(msg.id, 'down', textContent);
                                    }}
                                    className={`p-1.5 rounded-md hover:bg-white/10 transition-colors ${feedbackGiven[msg.id] === 'down' ? 'bg-white/10' : ''}`}
                                    disabled={!!feedbackGiven[msg.id]}
                                  >
                                    <svg className={`w-4 h-4 ${feedbackGiven[msg.id] === 'down' ? 'text-red-500' : 'text-muted-foreground'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                                    </svg>
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" sideOffset={4}>Bad response</TooltipContent>
                              </Tooltip>
                            </div>
                          )}


                          {/* Suggestion pills - show AI-provided suggestions on last assistant message */}
                          {idx === messages.length - 1 && status === 'ready' && msg.role === 'assistant' && (() => {
                            // Get suggestions from the suggest_followups tool part
                            if (!msg.parts) return null;
                            const suggestPart = msg.parts.find(
                              (p: any) => p.type === 'tool-suggest_followups' && p.state === 'output-available'
                            );
                            const suggestions: string[] = (suggestPart as any)?.output?.suggestions || [];

                            if (suggestions.length === 0) return null;

                            return (
                              <motion.div
                                className="flex flex-col gap-2 pt-3 mt-3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3, delay: 0.2 }}
                              >
                                {suggestions.map((suggestion, i) => (
                                  <div key={i} className="flex items-center gap-0">
                                    {/* Branch connector */}
                                    <div className="flex h-4 w-4 shrink-0 items-end justify-start">
                                      <div
                                        className="h-1/2 w-1/2 self-start rounded-bl-sm border-b border-l"
                                        style={{ borderColor: 'rgba(255,255,255,0.2)' }}
                                      />
                                    </div>
                                    <button
                                      onClick={() => handleSuggestionClick(suggestion)}
                                      className="px-3.5 py-2 text-[13px] text-muted-foreground bg-white/5 hover:bg-white/10 rounded-full transition-colors duration-150 hover:text-foreground"
                                    >
                                      {suggestion.length > 50 ? suggestion.slice(0, 50) + '...' : suggestion}
                                    </button>
                                  </div>
                                ))}
                              </motion.div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Typing indicator — shown while waiting for first AI token */}
                  {status === 'submitted' && (
                    <div className="flex items-start gap-2 py-2">
                      <div
                        className="flex items-center gap-1.5 rounded-[20px] px-4 py-3"
                        style={{ backgroundColor: 'var(--surbee-bg-tertiary)' }}
                      >
                        {[0, 0.2, 0.4].map((delay, i) => (
                          <span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{
                              backgroundColor: 'var(--surbee-fg-muted)',
                              animation: `typingPulse 1.4s ease-in-out ${delay}s infinite`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        {/* Chat Input - overlaps messages area for scroll-behind effect */}
        <div className="pl-4 pr-2 pb-3 relative z-20" style={{ backgroundColor: 'var(--surbee-sidebar-bg)', marginTop: '-64px' }}>
          {/* Gradient fade above chatbox */}
          <div className="absolute left-0 right-0 pointer-events-none" style={{ top: '-40px', height: '40px', background: 'linear-gradient(to bottom, transparent, var(--surbee-sidebar-bg))' }} />
          <div className="relative ml-0 mr-0">
            {/* Selected Element Indicator - matches agent reference pill style */}
            {visualEditElement && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs"
                  style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: 'rgb(59, 130, 246)',
                  }}
                >
                  <Eye className="w-3 h-3" />
                  <span className="max-w-[150px] truncate">
                    {visualEditElement.selector}
                  </span>
                  <button
                    onClick={() => setVisualEditElement(null)}
                    className="flex items-center justify-center w-3.5 h-3.5 hover:bg-blue-500/20 rounded-full transition-colors"
                    title="Clear selection"
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            )}
            {/* Chat input container to anchor controls to the box itself */}
            <div className="relative">
              <ChatInputLight
                onSendMessage={(message, files) => handleSubmit(message, files)}
                isInputDisabled={status !== 'ready'}
                placeholder={visualEditElement ? "Describe changes for this element..." : "Ask for a follow-up"}
                className="chat-input-grey"
                isEditMode={isEditMode}
                onToggleEditMode={() => setIsEditMode(!isEditMode)}
                showSettings={false}
                selectedElement={null}
                disableRotatingPlaceholders={true}
                onClearSelection={() => {}}
                showModelSelector={false}
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                isBusy={status === 'submitted' || status === 'streaming'}
                onStop={stop}
                solidBackground={true}
                userPlan={credits?.plan || 'free_user'}
              />
            </div>
        </div>
      </div>
      </div>

      {/* Right Side - Preview */}
      <div className="flex-1 flex flex-col relative overflow-hidden" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
        {/* Header */}
        <div className="flex items-center justify-between pl-2 pr-3 pt-3 pb-0" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
          {/* Left Section */}
          <div className="flex items-center gap-2">
            {/* Collapse/Expand Chat */}
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`rounded-md transition-colors cursor-pointer ${
                    isChatHidden
                      ? 'text-gray-400 hover:text-white hover:bg-white/5'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setIsChatHidden(v => !v)}
                  style={{
                    fontFamily: 'Sohne, sans-serif',
                    padding: '8px 12px'
                  }}
                >
                  {isChatHidden ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>{isChatHidden ? 'Show chat' : 'Hide chat'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`rounded-md transition-colors cursor-pointer ${
                    sidebarView === 'history'
                      ? 'text-white bg-white/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setSidebarView((current) => current === 'history' ? 'chat' : 'history')}
                  aria-pressed={sidebarView === 'history'}
                  style={{
                    fontFamily: 'Sohne, sans-serif',
                    padding: '8px 12px'
                  }}
                >
                  <History className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={4}>History</TooltipContent>
            </Tooltip>
          </div>

          {/* Center Section - Device Controls */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="relative flex h-8 min-w-[340px] max-w-[560px] items-center justify-between gap-2 rounded-full px-1 text-sm page-dropdown" style={{
              backgroundColor: isDarkMode ? '#1f1f1f' : 'var(--surbee-sidebar-bg)'
            }}>
              {/* Device View Buttons - Hidden on mobile */}
              <div className="hidden md:flex items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCurrentDevice('desktop')}
                      className="aspect-square h-6 w-6 p-1 rounded-md transition-colors inline-flex items-center justify-center"
                      style={{
                        backgroundColor: currentDevice === 'desktop'
                          ? (isDarkMode ? 'rgba(113,113,122,0.5)' : 'rgba(0,0,0,0.1)')
                          : 'transparent',
                        color: currentDevice === 'desktop'
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-fg-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        if (currentDevice !== 'desktop') {
                          const isDark = document.documentElement.classList.contains('dark');
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(113,113,122,0.3)' : 'rgba(0,0,0,0.05)';
                          e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentDevice !== 'desktop') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                        }
                      }}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4}>Desktop</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCurrentDevice('tablet')}
                      className="aspect-square h-6 w-6 p-1 rounded-md transition-colors inline-flex items-center justify-center"
                      style={{
                        backgroundColor: currentDevice === 'tablet'
                          ? (isDarkMode ? 'rgba(113,113,122,0.5)' : 'rgba(0,0,0,0.1)')
                          : 'transparent',
                        color: currentDevice === 'tablet'
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-fg-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        if (currentDevice !== 'tablet') {
                          const isDark = document.documentElement.classList.contains('dark');
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(113,113,122,0.3)' : 'rgba(0,0,0,0.05)';
                          e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentDevice !== 'tablet') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                        }
                      }}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4}>Tablet</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCurrentDevice('phone')}
                      className="aspect-square h-6 w-6 p-1 rounded-md transition-colors inline-flex items-center justify-center"
                      style={{
                        backgroundColor: currentDevice === 'phone'
                          ? (isDarkMode ? 'rgba(113,113,122,0.5)' : 'rgba(0,0,0,0.1)')
                          : 'transparent',
                        color: currentDevice === 'phone'
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-fg-secondary)'
                      }}
                      onMouseEnter={(e) => {
                        if (currentDevice !== 'phone') {
                          const isDark = document.documentElement.classList.contains('dark');
                          e.currentTarget.style.backgroundColor = isDark ? 'rgba(113,113,122,0.3)' : 'rgba(0,0,0,0.05)';
                          e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentDevice !== 'phone') {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                        }
                      }}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4}>Mobile</TooltipContent>
                </Tooltip>
              </div>

              {/* Center: Route dropdown */}
              <div className="page-dropdown flex-1 flex items-center min-w-0 px-1 relative">
                <button
                  onClick={() => setIsPageDropdownOpen(!isPageDropdownOpen)}
                  className="w-full flex items-center justify-between bg-transparent text-sm px-2 py-1 rounded transition-colors"
                  style={{
                    color: 'var(--surbee-fg-primary)',
                    fontFamily: 'Sohne, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    const isDark = document.documentElement.classList.contains('dark');
                    e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span className="truncate font-mono text-xs">{selectedRoute}</span>
                  <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${isPageDropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--surbee-fg-secondary)' }} />
                </button>

                {isPageDropdownOpen && pages.length > 0 && (
                  <div
                    className="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto"
                    style={{
                      backgroundColor: 'var(--surbee-bg-primary)',
                      border: '1px solid rgba(128, 128, 128, 0.15)'
                    }}
                  >
                    {pages.map((page) => (
                      <button
                        key={page.path}
                        onClick={() => {
                          setSelectedRoute(page.path);
                          setIsPageDropdownOpen(false);
                          // Navigate iframe to new path
                          const iframe = document.querySelector('iframe');
                          iframe?.contentWindow?.postMessage({ type: 'deepsite:navigateTo', path: page.path }, '*');
                        }}
                        className="w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2"
                        style={{
                          color: 'var(--surbee-fg-primary)',
                          backgroundColor: selectedRoute === page.path ? 'var(--surbee-bg-tertiary)' : 'transparent'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedRoute !== page.path) {
                            const isDark = document.documentElement.classList.contains('dark');
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = selectedRoute === page.path ? 'var(--surbee-bg-tertiary)' : 'transparent';
                        }}
                      >
                        <span className="font-mono text-xs" style={{ color: 'var(--surbee-fg-secondary)' }}>{page.path}</span>
                        <span className="truncate">{page.title !== page.path ? page.title : ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (previewUrl) {
                          window.open(previewUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className="aspect-square h-6 w-6 p-1 rounded-md transition-colors inline-flex items-center justify-center"
                      style={{ color: 'var(--surbee-fg-secondary)', opacity: previewUrl ? 1 : 0.4, cursor: previewUrl ? 'pointer' : 'default' }}
                      disabled={!previewUrl}
                      onMouseEnter={(e) => {
                        if (!previewUrl) return;
                        const isDark = document.documentElement.classList.contains('dark');
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(113,113,122,0.3)' : 'rgba(0,0,0,0.05)';
                        e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4}>Open in new tab</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setRendererKey((k) => k + 1)}
                      className="aspect-square h-6 w-6 p-1 rounded-md transition-colors inline-flex items-center justify-center"
                      style={{ color: 'var(--surbee-fg-secondary)' }}
                      onMouseEnter={(e) => {
                        const isDark = document.documentElement.classList.contains('dark');
                        e.currentTarget.style.backgroundColor = isDark ? 'rgba(113,113,122,0.3)' : 'rgba(0,0,0,0.05)';
                        e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--surbee-fg-secondary)';
                      }}
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={4}>Refresh</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Right Section - Upgrade & Publish Buttons */}
          <div className="relative flex items-center gap-2">
            <button
              className="relative px-3 py-1.5 font-medium text-sm transition-all duration-150 cursor-pointer rounded-full"
              style={{
                fontFamily: 'FK Grotesk, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.375rem',
                backgroundColor: activeTopButton === 'upgrade'
                  ? (isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)')
                  : 'transparent',
                color: isDarkMode ? '#ffffff' : '#000000'
              }}
              onMouseEnter={(e) => {
                const isDark = document.documentElement.classList.contains('dark');
                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                if (activeTopButton !== 'upgrade') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                } else {
                  const isDark = document.documentElement.classList.contains('dark');
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                }
              }}
              onClick={() => router.push('/home/pricing')}
            >
              Upgrade
            </button>

            <PublishDropdown
              projectId={projectId}
              project={project}
              publishedUrl={publishedUrl}
              isPublishing={isPublishing}
              sandboxAvailable={sandboxAvailable}
              onPublish={handlePublish}
            />
          </div>
        </div>

                  {/* Main Content Area */}
                <div className="flex-1 flex relative overflow-hidden min-h-0">
                  {/* Restored rounded preview frame with border, like before */}
                  <div
                    className="flex-1 flex flex-col relative rounded-[0.625rem] mt-3 mr-3 mb-3 ml-2 overflow-hidden"
                    style={{
                      backgroundColor: isDarkMode ? '#202020' : '#EBEBEB',
                    }}
                  >
                    <div
                className="flex-1 overflow-hidden relative flex items-center justify-center"
                style={{
                  backgroundColor: isDarkMode ? '#202020' : '#EBEBEB'
                }}
              >
                {/* Show loading state while AI is working */}
                {(status === 'submitted' || status === 'streaming') && !sandboxAvailable ? (
                  <div
                    className="flex items-center justify-center h-full w-full"
                  >
                    <p className="text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>Building</p>
                  </div>
                ) : sandboxAvailable ? (
                  /* Show React preview when sandbox is available */
                  <div className={`${getDeviceStyles()} transition-all duration-300 mx-auto`}>
                    <ProjectPreviewOnly refreshKey={rendererKey} bundle={sandboxBundle} projectId={projectId} onPreviewUrlReady={(url) => setPreviewUrl(url)} onBuildError={handleSandboxFixRequest} />
                  </div>
                ) : (
                  /* Waiting for content */
                  <div className="flex items-center justify-center h-full text-sm" style={{ color: 'var(--surbee-fg-secondary)' }}>
                    <p>Start a conversation to see the preview</p>
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>

      {/* Visual Edit Mode Toast */}
      {isEditMode && sandboxAvailable && (
        <div
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg"
          style={{
            backgroundColor: isDarkMode ? '#1f1f1f' : 'white',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#3b82f6',
          }}
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm font-medium">Click on any element in the preview to select it</span>
          <button
            onClick={() => setIsEditMode(false)}
            className="ml-2 hover:bg-blue-500/20 rounded-full p-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="relative max-w-4xl max-h-4xl">
            <img src={selectedImage} alt="Preview" className="max-w-full max-h-full object-contain" />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      )}
      
      {/* Invite Modal */}
      <InviteModal open={inviteOpen} onOpenChange={setInviteOpen} />

      {/* Project Settings Modal */}
      {isProjectSettingsOpen && (
        <ProjectSettings
          projectId={projectId || ''}
          onClose={() => setIsProjectSettingsOpen(false)}
        />
      )}
    </div>
    </AppLayout>
  );
}
