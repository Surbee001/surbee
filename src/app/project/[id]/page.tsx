"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, Plus, Home, Library, Search, MessageSquare, Folder as FolderIcon, ArrowUp, User, ThumbsUp, HelpCircle, Gift, ChevronsLeft, Menu, AtSign, Settings2, Inbox, FlaskConical, BookOpen, X, Paperclip, History, Monitor, Smartphone, Tablet, ExternalLink, RotateCcw, Eye, GitBranch, StopCircle, Flag, PanelLeftClose, PanelLeftOpen, Share2, Copy } from "lucide-react";
import UserNameBadge from "@/components/UserNameBadge";
import UserMenu from "@/components/ui/user-menu";
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { File, Folder, Tree } from "@/components/ui/file-tree";
import AIResponseActions from "@/components/ui/ai-response-actions";
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import ChatInputLight from "@/components/ui/chat-input-light";
import dynamic from 'next/dynamic'
import { MODELS } from "@/lib/deepsite/providers";
import { useDeepSite } from "./deepsite-integration/hooks/useDeepSite";
import { DeepSiteRenderer } from "./deepsite-integration/renderer/DeepSiteRenderer";
import { ChatMessage } from "./deepsite-integration/types";
import { SelectedHtmlElement } from "./deepsite-integration/components/SelectedHtmlElement";
import { EditModeTooltip } from "./deepsite-integration/components/EditModeTooltip";
import { AuthGuard } from "@/components/auth/AuthGuard";
import AppLayout from "@/components/layout/AppLayout";
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
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



interface HistoryEntry {
  id: string;
  prompt: string;
  timestamp: Date;
  changes: string[];
  version: number;
  isFlagged: boolean;
}

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage() {
  // In client components, use useParams() to read dynamic params
  const { id } = useParams() as { id?: string };
  const projectId: string | undefined = id;
  const searchParams = useSearchParams();
  // Disabled for demo
  const user = { id: 'demo-user' };
  const authLoading = false;
  // Disabled for demo
  const subscribeToProject = () => {};
  const router = useRouter();
  
  // Enable temporary mock mode to work on UI without DB/auth
  const mockMode = (searchParams?.get('mock') === '1') || (process.env.NEXT_PUBLIC_MOCK_PROJECT === 'true');

  // Project state - mock project for demo
  const [project, setProject] = useState<Project | null>({
    id: 'demo-project',
    title: 'Demo Project',
    description: 'Survey built with Grok 4 Fast Reasoning',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'demo-user',
    status: 'draft'
  });
  const [projectLoading, setProjectLoading] = useState(false);
  
  const [isPlanUsageOpen, setIsPlanUsageOpen] = useState(true);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isHomeOpen, setIsHomeOpen] = useState(false);
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  const [chatText, setChatText] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ [key: string]: string }>({});
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  
  // Thinking chain state
  const [showHistory, setShowHistory] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [versionCounter, setVersionCounter] = useState(1);
  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'phone'>('desktop');
  const [previewUrl, setPreviewUrl] = useState('/');
  const [isPageDropdownOpen, setIsPageDropdownOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('/');
  const [pages, setPages] = useState<{ path: string; title: string }[]>([{ path: '/', title: '/' }]);
  const [isChatHidden, setIsChatHidden] = useState(false);
  const [currentView, setCurrentView] = useState<'viewer' | 'flow'>('viewer');
  const [isEditMode, setIsEditMode] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isEditableModeEnabled, setIsEditableModeEnabled] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [activeTopButton, setActiveTopButton] = useState<'upgrade' | 'publish' | null>(null);
  const [rendererKey, setRendererKey] = useState(0);
  const [isAskMode, setIsAskMode] = useState(false);
  const [isCgihadiDropdownOpen, setIsCgihadiDropdownOpen] = useState(false);
  const askModeRef = useRef(false);
  useEffect(() => { askModeRef.current = isAskMode; }, [isAskMode]);
  // Error detection and credit guard
  const conversationIdRef = useRef<string | null>(null);
  const thinkingStartRef = useRef<number | null>(null);
  const activeRequestRef = useRef<AbortController | null>(null);
  const [builderStatus, setBuilderStatus] = useState<'idle' | 'thinking' | 'building' | 'complete' | 'error'>('idle');
  const [builderStatusDetail, setBuilderStatusDetail] = useState<string>('');
  const [builderThinkingText, setBuilderThinkingText] = useState<string>('');
  const [isBuilderPanelOpen, setIsBuilderPanelOpen] = useState(true);
  const [builderThinkingDuration, setBuilderThinkingDuration] = useState<number>(0);
  const [latestUsage, setLatestUsage] = useState<Record<string, unknown> | null>(null);

  const latestPromptTokens = typeof (latestUsage as any)?.prompt_tokens === 'number' ? (latestUsage as any).prompt_tokens : null;
  const latestCompletionTokens = typeof (latestUsage as any)?.completion_tokens === 'number' ? (latestUsage as any).completion_tokens : null;
  const latestReasoningTokens = typeof (latestUsage as any)?.completion_tokens_details?.reasoning_tokens === 'number'
    ? (latestUsage as any).completion_tokens_details.reasoning_tokens
    : null;
  const latestTotalTokens = typeof (latestUsage as any)?.total_tokens === 'number' ? (latestUsage as any).total_tokens : null;

  const [errorBarVisible, setErrorBarVisible] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const [lastErrors, setLastErrors] = useState<string[]>([]);
  const lastTokenIncRef = useRef<number>(0);
  const lastCreditChargeRef = useRef<number>(0);
  const refundLastUsage = () => {
    try {
      if (lastTokenIncRef.current > 0) {
        ctxTokensUsedRef.current = Math.max(0, ctxTokensUsedRef.current - lastTokenIncRef.current);
        const limit = ctxLimitRef.current || GROK_CONTEXT_TOKENS;
        const pct = ((ctxTokensUsedRef.current % limit) / limit) * 100;
        setContextPercent(Math.max(0, Math.min(100, Math.round(pct * 10) / 10)));
        lastTokenIncRef.current = 0;
      }
      if (lastCreditChargeRef.current === 1) {
        setCreditsUsed(u => Math.max(0, u - 1));
        lastCreditChargeRef.current = 0;
      }
    } catch {}
  };
  const recordError = (err: string) => {
    setErrorBarVisible(true);
    setLastErrors(prev => [err, ...prev].slice(0, 5));
    setErrorCount(c => c + 1);
    refundLastUsage();
  };

  // Context usage meter for Grok-4 with 2 million token limit
  const GROK_CONTEXT_TOKENS = 2000000; // 2 million tokens
  const [contextPercent, setContextPercent] = useState<number>(0);
  const ctxTokensUsedRef = useRef<number>(0);
  const ctxLimitRef = useRef<number>(GROK_CONTEXT_TOKENS);

  // Auto-reset context when hitting 2 million tokens
  const resetContextIfNeeded = () => {
    if (ctxTokensUsedRef.current >= GROK_CONTEXT_TOKENS) {
      console.log('[Context] Auto-resetting context at 2M tokens');
      ctxTokensUsedRef.current = 0;
      setContextPercent(0);
    }
  };
  const estimateTokens = (text: string) => Math.ceil((text || '').length / 4);
  const preciseCountTokens = async (text: string) => {
    try {
      const model = (isAskMode ? (process.env.OPENAI_LONG_MODEL || 'o200k_base') : (process.env.OPENAI_MODEL || 'cl100k_base'));
      const res = await fetch('/api/tokens/estimate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, model }) });
      const data = await res.json();
      if (data?.ok && typeof data.count === 'number') return data.count as number;
    } catch {}
    return estimateTokens(text);
  };
  
  // DeepSite integration
  // Memoize callbacks to prevent unnecessary re-renders
  const onDeepSiteMessage = useCallback((message: any) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const onDeepSiteError = useCallback((error: string) => {
    console.error('DeepSite error:', error);
    recordError(typeof error === 'string' ? error : 'Renderer error');
  }, [recordError]);

  const deepSite = useDeepSite({
    defaultHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Preview</title>
  <style>html,body{height:100%;margin:0;padding:0;background:#101010;color:#fff}</style>
</head>
<body></body>
</html>`,
    onMessage: onDeepSiteMessage,
    onError: onDeepSiteError,
    projectId: projectId || undefined
  });
  
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const publishMenuRef = useRef<HTMLDivElement>(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [creditsUsed, setCreditsUsed] = useState(0);
  const [creditsTotal] = useState(5);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [publishToCommunity, setPublishToCommunity] = useState(true);

  // Fetch project data (or use mock)
  useEffect(() => {
    const fetchProject = async () => {
      if (mockMode) {
        // Minimal mock project so the page can render without backend
        const now = new Date().toISOString();
        setProject({
          id: projectId || 'mock-project',
          created_at: now,
          updated_at: now,
          title: `Demo Project ${projectId || ''}`.trim(),
          description: null,
          user_id: 'mock-user',
          status: 'draft',
        } as Project);
        // No seeded chat messages in mock mode
        setMessages([]);
        setHasStartedChat(false);
        setProjectLoading(false);
        return;
      }

      if (!user || !projectId) return;
      
      try {
        const response = await fetch(`/api/projects/${projectId}?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setProject(data.project);
          
          // Load existing messages
          const messagesResponse = await fetch(`/api/projects/${projectId}/messages?userId=${user.id}`);
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json();
            const formattedMessages = messagesData.messages?.map((msg: any) => ({
              id: msg.id,
              text: msg.content,
              isUser: Boolean(msg.is_user),
              timestamp: new Date(msg.created_at),
            })) || [];
            setMessages(formattedMessages);
            if (formattedMessages.length > 0) {
              setHasStartedChat(true);
            }
          }
        } else if (response.status === 404) {
          // Project doesn't exist, create it
          const createResponse = await fetch('/api/projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: `Project ${projectId}`,
              description: 'Project created from builder',
              user_id: user.id
            })
          });
          
          if (createResponse.ok) {
            const { project } = await createResponse.json();
            setProject(project);
          }
        }
      } catch (error) {
        console.error('Failed to fetch project:', error);
      } finally {
        setProjectLoading(false);
      }
    };

    if (user && !authLoading && projectId) {
      fetchProject();
    }
  }, [user, authLoading, projectId]);

  // Subscribe to real-time messages for this project
  useEffect(() => {
    if (projectId && user && !mockMode) {
      const unsubscribe = subscribeToProject();
      return unsubscribe;
    }
  }, [projectId, user, subscribeToProject, mockMode]);

    // Sync in-frame navigations to the route dropdown
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data: any = e.data || {};
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
  }, []);



  // Handle placeholder visibility
  useEffect(() => {
    // Check for initial prompt and images from session storage
    let initialPrompt: string | null = null;
    let initialImages: string[] = [];
    try {
      if (typeof window !== 'undefined') {
        initialPrompt = sessionStorage.getItem('surbee_initial_prompt');
        const imagesStr = sessionStorage.getItem('surbee_initial_images');
        if (imagesStr) {
          try { initialImages = JSON.parse(imagesStr) as string[]; } catch {}
          sessionStorage.removeItem('surbee_initial_images');
        }
        if (initialPrompt) {
          sessionStorage.removeItem('surbee_initial_prompt');
        }
      }
    } catch {}
    
    if (initialPrompt || (initialImages && initialImages.length > 0)) {
      handleSendMessage(initialPrompt || '', initialImages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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





  const stopGeneration = () => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
    }
    deepSite.stopGeneration();
    deepSite.setIsAiWorking(false);
    deepSite.setIsThinking(false);
    setIsThinking(false);
    setIsInputDisabled(false);
    applyBuilderStatus('error', 'Generation stopped by user.');
    setIsBuilderPanelOpen(true);

    const stopMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Generation stopped.',
      isUser: false,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, stopMsg]);
  };

  // Fix errors helper for the error bar
  const handleFixErrors = async () => {
    try {
      setErrorBarVisible(false);
      const prompt = 'Please fix any errors in the current HTML, validate structure and accessibility, and ensure it renders without runtime errors.';
      await handleSendMessage(prompt);
    } catch {
      // no-op
    }
  };

  const appendThinkingChunk = (chunk: string) => {
    if (typeof chunk !== 'string' || chunk.length === 0) return;

    const normalized = chunk
      .replace(/\\uFFFD/g, '')
      .replace(/\\r\\n/g, '\n')
      .replace(/\\r/g, '\n');

    if (!normalized) return;

    setBuilderThinkingText((prev) => {
      if (!prev) {
        return normalized;
      }

      const lastChar = prev[prev.length - 1] ?? '';
      const firstChar = normalized[0] ?? '';

      const needsSpace =
        !/\\s/.test(lastChar) &&
        !/^[\\s.,!?;:)\\]]/.test(firstChar);

      return prev + (needsSpace ? ' ' : '') + normalized;
    });
  };
  const sanitizeHtmlBuffer = (input: string): string => {
    if (!input) return '';

    let sanitized = input
      .replace(/```(?:html)?/gi, '')
      .replace(/\uFFFD/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/g, '');

    const startIndex = sanitized.search(/<!DOCTYPE|<html\b|<head\b|<body\b/i);
    if (startIndex > 0) {
      sanitized = sanitized.slice(startIndex);
    }

    return sanitized;
  };

  const extractPreviewHtml = (source: string) => {
    const sanitized = sanitizeHtmlBuffer(source);
    if (!sanitized) return '';

    const docMatch = sanitized.match(/<!DOCTYPE html[\s\S]*?<\/html>/i);
    if (docMatch) return docMatch[0];

    const lower = sanitized.toLowerCase();
    const htmlIndex = lower.indexOf('<html');
    if (htmlIndex !== -1) {
      const end = lower.lastIndexOf('</html>');
      if (end !== -1) {
        const extracted = sanitized.slice(htmlIndex, end + '</html>'.length);
        if (extracted.includes('<head') || extracted.includes('<body')) {
          return extracted;
        }
      }
    }

    const bodyStart = lower.indexOf('<body');
    if (bodyStart !== -1) {
      const bodyEnd = lower.lastIndexOf('</body>');
      if (bodyEnd !== -1) {
        const bodyContent = sanitized.slice(bodyStart, bodyEnd + '</body>'.length);
        return `<!DOCTYPE html><html>${bodyContent}</html>`;
      }
    }

    const tagMatch = sanitized.match(/<(!DOCTYPE|html|head|body|section|main|div)/i);
    if (tagMatch && tagMatch.index !== undefined) {
      return sanitized.slice(tagMatch.index);
    }

    return '';
  };

  const applyBuilderStatus = (
    status: 'idle' | 'thinking' | 'building' | 'complete' | 'error',
    detail?: string
  ) => {
    setBuilderStatus(status);
    if (detail) {
      setBuilderStatusDetail(detail);
      return;
    }
    if (status === 'thinking') {
      setBuilderStatusDetail('Analyzing request...');
    } else if (status === 'building') {
      setBuilderStatusDetail('Generating survey HTML...');
    }
  };

  const runSurveyBuild = useCallback(async (prompt: string, images?: string[]) => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      return false;
    }

    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
    }

    const controller = new AbortController();
    activeRequestRef.current = controller;

    applyBuilderStatus('thinking', 'Engaging Surbee agent...');
    setIsBuilderPanelOpen(true);
    setBuilderThinkingText('');
    setBuilderThinkingDuration(0);
    setLatestUsage(null);

    setIsThinking(true);
    setIsInputDisabled(true);
    deepSite.setIsAiWorking(true);
    deepSite.setIsThinking(true);

    try {
      const response = await fetch('/api/agents/surbee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: trimmed, images }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to reach Surbee agent workflow');
      }

      const data = await response.json();
      const result = data?.result;

      if (!result?.output_text) {
        throw new Error('Agent response was empty.');
      }

      const aiMessage: ChatMessage = {
        id: `${Date.now()}-agent`,
        text: result.output_text,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (result.stage === 'build' && result.output_text.trim().length > 0) {
        deepSite.updateHtml(result.output_text, trimmed);
        applyBuilderStatus('complete', 'Generated new survey HTML.');
      } else if (result.stage === 'plan') {
        applyBuilderStatus('complete', 'Planning notes ready.');
      } else if (result.stage === 'fail') {
        applyBuilderStatus('error', 'Guardrails prevented a response.');
      } else {
        applyBuilderStatus('complete');
      }

      return true;
    } catch (error) {
      console.error('runSurveyBuild error', error);
      const message = error instanceof Error ? error.message : 'Unexpected agent error.';
      recordError(message);
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-error`,
          text: `Error: ${message}`,
          isUser: false,
          timestamp: new Date(),
        },
      ]);
      applyBuilderStatus('error', message);
      return false;
    } finally {
      setIsThinking(false);
      setIsInputDisabled(false);
      setIsBuilderPanelOpen(false);
      deepSite.setIsAiWorking(false);
      deepSite.setIsThinking(false);
      activeRequestRef.current = null;
    }
  }, [applyBuilderStatus, deepSite, recordError]);

  const handleSendMessage = async (message?: string, images?: string[]) => {
    const textToSend = message || chatText.trim();
    const imagePayload = Array.isArray(images) && images.length > 0 ? images : undefined;
    if (!textToSend && !imagePayload && files.length === 0) return;
    if (isInputDisabled || deepSite.isAiWorking) return;

    if (!message) {
      setChatText("");
      setFiles([]);
      setFilePreviews({});
    }
    setHasStartedChat(true);

    try {
      const tokenCount = await preciseCountTokens(textToSend);
      const inc = tokenCount + (imagePayload ? imagePayload.length * 128 : 0);
      ctxTokensUsedRef.current += inc;

      // Check if we need to reset context
      resetContextIfNeeded();

      const limit = ctxLimitRef.current;
      const pct = (ctxTokensUsedRef.current / limit) * 100;
      setContextPercent(Math.max(0, Math.min(100, Math.round(pct * 10) / 10)));
    } catch {}

    const contentEditableDiv = document.querySelector('.ProseMirror') as HTMLDivElement;
    if (contentEditableDiv) {
      contentEditableDiv.innerHTML = '<p class="is-empty is-editor-empty" style="margin: 0px; color: rgb(235, 235, 235);"><br class="ProseMirror-trailingBreak"></p>';
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    await runSurveyBuild(textToSend, imagePayload);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isImageFile = (file: File) => file.type.startsWith("image/");

  const processFile = (file: File) => {
    if (!isImageFile(file)) {
      console.log("Only image files are allowed");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      console.log("File too large (max 10MB)");
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

  const handleHistoryClick = () => {
    setShowHistory(!showHistory);
  };

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

  // Derive pages from current HTML by scanning for anchor links with absolute paths
  useEffect(() => {
    try {
      const tmp = document.createElement('div');
      tmp.innerHTML = deepSite.html || '';
      const anchors = Array.from(tmp.querySelectorAll('a')) as HTMLAnchorElement[];
      const found: { path: string; title: string }[] = [];
      const seen = new Set<string>();
      // Always include root
      found.push({ path: '/', title: '/' });
      seen.add('/');
      anchors.forEach(a => {
        const href = (a.getAttribute('href') || '').trim();
        if (!href || !href.startsWith('/')) return;
        const path = href.split('#')[0];
        if (!seen.has(path)) {
          const txt = (a.textContent || '').trim();
          const title = txt || path;
          found.push({ path, title });
          seen.add(path);
        }
      });
      setPages(found);
      // If selected route no longer exists, fall back to '/'
      if (!found.find(p => p.path === selectedRoute)) {
        setSelectedRoute('/');
      }
    } catch {
      // ignore parsing errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deepSite.html]);

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
    };

    if (isCgihadiDropdownOpen || isPageDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCgihadiDropdownOpen, isPageDropdownOpen]);

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

  // Skip loading states for demo mode
  // if (authLoading || projectLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
  //     </div>
  //   );
  // }

  // Skip authentication for demo mode
  // if (!user && !mockMode) {
  //   window.location.href = '/login';
  //   return null;
  // }

  // Skip project check for demo mode
  // if (!project) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-semibold mb-2 text-white">Project not found</h1>
  //         <p className="text-gray-400">The project you're looking for doesn't exist or you don't have access to it.</p>
  //         <button 
  //           onClick={() => window.location.href = '/dashboard/projects'}
  //           className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  //         >
  //           Back to Projects
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <AppLayout hideSidebar fullBleed>
      <div className="flex h-full w-full" style={{ fontFamily: 'FK Grotesk, sans-serif', backgroundColor: 'var(--surbee-sidebar-bg)', color: 'var(--surbee-fg-primary)' }}>
      {/* Left Sidebar - Chat Area */}
      <div className={`flex flex-col transition-all duration-300 ${
        isChatHidden ? 'w-0 opacity-0 pointer-events-none' : (isSidebarCollapsed ? 'w-16' : 'w-140')
      }`} style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
        {/* Profile Section at Top (match dashboard UserMenu) */}
        <div className="profile-section relative">
          <div className="flex items-center gap-1">
            <div className="profile-button">
              <div 
                className="profile-circle cursor-pointer"
                onClick={() => setIsCgihadiDropdownOpen(!isCgihadiDropdownOpen)}
              >
                H
              </div>
              <motion.div
                className="profile-arrow-container cursor-pointer"
                animate={{ rotate: isCgihadiDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setIsCgihadiDropdownOpen(!isCgihadiDropdownOpen)}
              >
                <ChevronDown className="profile-arrow" />
              </motion.div>
            </div>
            <div className="user-plan-text pro" style={{ margin: '0', padding: '0', marginLeft: '-8px' }}>Max</div>
          </div>
          <AnimatePresence>
            {isCgihadiDropdownOpen && (
              <motion.div
                className="absolute z-50 mt-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <UserMenu className="mt-2" onClose={() => setIsCgihadiDropdownOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Area in Sidebar */}
        <div className="flex-1 flex flex-col min-h-0">
          {showHistory ? (
            /* History View */
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 pr-4">
                <div className="mb-4" style={{ paddingLeft: '8px' }}>
                  <h3 className="text-lg font-semibold text-white mb-2" style={{
                    fontFamily: 'Sohne, sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    lineHeight: '1.375rem'
                  }}>History</h3>
                </div>
                <div className="space-y-2">
                  {historyEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-800/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-white font-medium truncate" style={{ fontFamily: 'Sohne, sans-serif' }}>
                              {entry.prompt}
                            </p>
                            <span className="text-xs text-gray-500 bg-zinc-800 px-2 py-1 rounded whitespace-nowrap">
                              v{entry.version}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{formatHistoryDate(entry.timestamp)}</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleHistoryFlag(entry.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          entry.isFlagged 
                            ? 'text-yellow-400 hover:text-yellow-300' 
                            : 'text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100'
                        }`}
                        title={entry.isFlagged ? 'Remove flag' : 'Flag this version'}
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages View */
            <div className="flex-1 overflow-y-auto px-4 py-4" ref={chatAreaRef}>
              <div className="space-y-4">
                {messages.length === 0 && !isThinking && (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-400">
                    Start a conversation to see Surbee's responses.
                  </div>
                )}

                {messages.map((message, idx) => {
                  const lastUserPrompt =
                    [...messages].slice(0, idx).reverse().find((m) => m.isUser)?.text || "";
                  return (
                    <div
                      key={message.id}
                      className={message.isUser ? "flex justify-end" : "flex justify-start"}
                    >
                      {message.isUser ? (
                        <div className="max-w-[85%] rounded-2xl bg-zinc-900 px-4 py-3 text-sm text-zinc-100 shadow-sm">
                          {message.text}
                        </div>
                      ) : (
                        <div className="group relative max-w-full flex-1 rounded-2xl bg-zinc-900/40 px-4 py-4 text-sm text-zinc-100 shadow-sm">
                          <MarkdownRenderer content={message.text} className="prose-invert prose-sm max-w-none" />
                          <div className="mt-2">
                            <AIResponseActions
                              message={message.text}
                              onCopy={(content) => navigator.clipboard.writeText(content)}
                              onRetry={() => {
                                if (lastUserPrompt) {
                                  void handleSendMessage(lastUserPrompt);
                                }
                              }}
                              onCreateSurvey={() => {
                                const prompt = lastUserPrompt || messages.find((m) => m.isUser)?.text || "";
                                if (prompt) {
                                  const newProjectId = `project_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
                                  try {
                                    sessionStorage.setItem("surbee_initial_prompt", prompt);
                                  } catch {}
                                  window.location.href = `/project/${newProjectId}`;
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2 rounded-2xl bg-zinc-900/40 px-3 py-2 text-xs text-zinc-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-zinc-400" />
                      Surbee is thinking...
                    </div>
                  </div>
                )}



                {/* Thinking Panel - Shows Reasoning Process */}
                {isBuilderPanelOpen && (
                  <div className="relative my-1 min-h-6">
                    <div
                      className="relative flex origin-top-left flex-col gap-2 overflow-x-clip"
                      style={{ opacity: 1, transform: "none" }}
                    >
                      <span>
                        <div className="relative w-full text-start">
                          <div className="flex w-full flex-col items-start justify-between text-start">
                            <button className="flex w-full items-center gap-0.5">
                              <span>
                                <span
                                  className="flex items-center gap-1 truncate text-start align-middle text-token-text-secondary hover:text-token-text-primary dark:hover:text-token-text-primary dark:text-[var(--interactive-label-tertiary-default)]"
                                  style={{ opacity: 1 }}
                                >
                                  Thought for {builderThinkingDuration > 0 ? `${builderThinkingDuration.toFixed(1)}s` : '14s'}
                                </span>
                              </span>
                            </button>
                          </div>
                        </div>
                      </span>
                      <div className="max-w-[calc(0.8*var(--thread-content-max-width,40rem))]">
                        <div
                          className="relative z-0"
                          style={{ opacity: 1, height: "auto", overflowY: "hidden" }}
                        >
                          <div
                            className="relative flex h-full flex-col"
                            style={{ margin: "4px 0px" }}
                          >
                            {builderThinkingText.trim().length > 0 && (
                              <>
                                <div
                                  className="text-token-text-secondary start-0 end-0 top-0 flex origin-left"
                                  role="button"
                                  style={{
                                    zIndex: 0,
                                    opacity: 1,
                                    position: "static",
                                    transform: "none",
                                  }}
                                >
                                  <div className="relative flex w-full items-start gap-2 overflow-clip">
                                    <div className="flex h-full w-4 shrink-0 flex-col items-center">
                                      <div className="flex h-5 shrink-0 items-center justify-center">
                                        <div className="bg-token-interactive-icon-tertiary-default h-[6px] w-[6px] rounded-full" />
                                      </div>
                                      <div
                                        className="bg-token-border-heavy h-full w-[1px] rounded-full"
                                        style={{ opacity: 1, transform: "none" }}
                                      />
                                    </div>
                                    <div className="w-full" style={{ marginBottom: "12px" }}>
                                      <div className="w-full" />
                                      <div
                                        className="_markdown_1frq2_10 text-token-text-secondary text-sm markdown prose dark:prose-invert w-full break-words dark markdown-new-styling"
                                        style={{ maxWidth: "unset" }}
                                      >
                                        <p
                                          style={{
                                            marginBlock: "calc(.25rem*1)",
                                            marginTop: "calc(.25rem*0)",
                                            marginBottom: "0px",
                                          }}
                                        >
                                          {builderThinkingText}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            {latestUsage && (
                              <div
                                className="text-token-text-secondary start-0 end-0 top-0 flex origin-left"
                                role="button"
                                style={{
                                  zIndex: 1,
                                  opacity: 1,
                                  position: "static",
                                  transform: "none",
                                }}
                              >
                                <div className="relative flex w-full items-start gap-2 overflow-clip">
                                  <div className="flex h-full w-4 shrink-0 flex-col items-center">
                                    <div className="flex h-5 shrink-0 items-center justify-center">
                                      <svg
                                        className="h-[15px] w-[15px]"
                                        height="20"
                                        width="20"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M12.498 6.90887C12.7094 6.60867 13.1245 6.53642 13.4248 6.74774C13.7249 6.95913 13.7971 7.37424 13.5859 7.6745L9.62695 13.2995C9.51084 13.4644 9.32628 13.5681 9.125 13.5807C8.94863 13.5918 8.77583 13.5319 8.64453 13.4167L8.59082 13.364L6.50781 11.072L6.42773 10.9645C6.26956 10.6986 6.31486 10.3488 6.55273 10.1325C6.79045 9.91663 7.14198 9.9053 7.3916 10.0876L7.49219 10.1774L9.0166 11.8542L12.498 6.90887Z" />
                                        <path
                                          clipRule="evenodd"
                                          d="M10.3333 2.08496C14.7046 2.08496 18.2483 5.62867 18.2483 10C18.2483 14.3713 14.7046 17.915 10.3333 17.915C5.96192 17.915 2.41821 14.3713 2.41821 10C2.41821 5.62867 5.96192 2.08496 10.3333 2.08496ZM10.3333 3.41504C6.69646 3.41504 3.74829 6.3632 3.74829 10C3.74829 13.6368 6.69646 16.585 10.3333 16.585C13.97 16.585 16.9182 13.6368 16.9182 10C16.9182 6.3632 13.97 3.41504 10.3333 3.41504Z"
                                          fillRule="evenodd"
                                        />
                                      </svg>
                                    </div>
                                  </div>
                                  <div className="w-full" style={{ marginBottom: "0px" }}>
                                    <div className="w-full" />
                                    <div className="text-token-text-secondary text-sm">
                                      {builderStatus === 'thinking' ? 'Thinking...' : builderStatus === 'building' ? 'Building...' : builderStatus === 'complete' ? 'Complete' : 'Error'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="px-1 pr-0 pb-3">
          <div className="relative ml-1 mr-0">
            {/* Credits/Error bar exactly above chatbox */}
            {errorBarVisible ? (
              <div className="mb-0.5 -mx-2 flex items-center justify-between rounded-t-[0.625rem] bg-red-900/70 border border-red-800 px-2 py-2" style={{ marginLeft: '-8px', marginRight: '-0px' }}>
                <div className="flex items-center gap-2 text-red-200 text-xs">
                  <span>Errors detected</span>
                  <span>{errorCount} {errorCount === 1 ? 'error' : 'errors'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleFixErrors} className="px-2 py-0.5 rounded bg-white text-black text-xs font-medium hover:opacity-90">Fix for me</button>
                  <button onClick={() => setErrorBarVisible(false)} className="text-red-200 hover:text-white text-xs">Close</button>
                </div>
              </div>
            ) : (
              <div className="relative overflow-visible flex items-center justify-between rounded-t-xl border px-3 py-1.5"
                   style={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(63,63,70,0.4)' }}>
                <span className="text-xs text-gray-300" style={{ fontFamily: 'Sohne, sans-serif', transform: 'translateY(-1px)' }}>Credits left {Math.max(0, creditsTotal - creditsUsed)}/{creditsTotal}</span>
                <span className="text-xs text-gray-400" style={{ transform: 'translateY(-1px)' }}>Project: {project?.title || 'Untitled'}</span>
                {/* Visual extension behind the chatbox */}
                <div aria-hidden
                     className="pointer-events-none absolute left-[-1px] right-[-1px] top-full h-8 border-x rounded-b-none"
                     style={{ backgroundColor: '#1A1A1A', borderColor: 'rgba(63,63,70,0.4)' }}
                />
              </div>
            )}

            {/* Chat input container to anchor controls to the box itself */}
            <div className="relative">
              <ChatInputLight
                onSendMessage={(message, images) => handleSendMessage(message, images)}
                isInputDisabled={isInputDisabled || deepSite.isAiWorking}
                placeholder="Ask a follow up."
                className="chat-input-grey"
                isEditMode={isEditableModeEnabled}
                onToggleEditMode={() => {
                  setIsEditableModeEnabled(!isEditableModeEnabled);
                  if (selectedElement) {
                    setSelectedElement(null);
                  }
                }}
                isAskMode={isAskMode}
                onToggleAskMode={() => setIsAskMode(v => !v)}
                showSettings={false}
                selectedElement={selectedElement}
                onClearSelection={() => setSelectedElement(null)}
                tokenPercent={contextPercent}
              />
              {/* Additional Controls pinned to the input's top-right */}
              <div className="absolute top-2 right-2 flex items-center gap-2 z-10">
                {deepSite.isAiWorking && (
                  <button
                    onClick={stopGeneration}
                    className="relative justify-center whitespace-nowrap ring-offset-background focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-7 data-[state=open]:bg-muted focus-visible:outline-none group inline-flex gap-1 items-center px-2.5 py-1 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer w-fit focus-visible:ring-0 focus-visible:ring-offset-0 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-transparent"
                    type="button"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Stop</span>
                  </button>
                )}
                {/* Token meter moved into ChatInputLight */}
              </div>
            </div>
        </div>
      </div>
      </div>

      {/* Right Side - Preview */}
      <div className="flex-1 flex flex-col relative" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
        {/* Header */}
        <div className="h-14 flex items-center justify-between pl-2 pr-4" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
          {/* Left Section */}
          <div className="flex items-center gap-2">
            {/* Collapse/Expand Chat */}
            <button
              className={`rounded-md transition-colors cursor-pointer ${
                isChatHidden 
                  ? 'text-gray-400 hover:text-white hover:bg-white/5' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setIsChatHidden(v => !v)}
              title={isChatHidden ? 'Expand chat' : 'Collapse chat'}
              style={{
                fontFamily: 'Sohne, sans-serif',
                padding: '8px 12px'
              }}
            >
              {isChatHidden ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
            <button
              className={`rounded-md transition-colors cursor-pointer ${
                showHistory 
                  ? 'text-white bg-white/10' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setShowHistory((v) => !v)}
              aria-pressed={showHistory}
              title="Toggle history"
              style={{
                fontFamily: 'Sohne, sans-serif',
                padding: '8px 12px'
              }}
            >
              <History className="w-4 h-4" />
            </button>
          </div>

          {/* Center Section - Device Controls */}
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="relative flex h-8 min-w-[340px] max-w-[560px] items-center justify-between gap-2 rounded-md border border-zinc-800 bg-[#1a1a1a] px-2 text-sm page-dropdown">
              {/* Device View Buttons */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentDevice('desktop')}
                  className={`p-1 rounded transition-colors ${
                    currentDevice === 'desktop' 
                      ? 'bg-zinc-700/50 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setCurrentDevice('tablet')}
                  className={`p-1 rounded transition-colors ${
                    currentDevice === 'tablet' 
                      ? 'bg-zinc-700/50 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setCurrentDevice('phone')}
                  className={`p-1 rounded transition-colors ${
                    currentDevice === 'phone' 
                      ? 'bg-zinc-700/50 text-white' 
                      : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Center: Route dropdown showing '/', '/contact', etc. */}
              <div className="flex-1 flex items-center gap-2 px-1">
                <div className="relative">
                  <button
                    onClick={togglePageDropdown}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-gray-200 hover:bg-zinc-700/30"
                    title="Select page"
                  >
                    <span className="text-sm" style={{ fontFamily: 'Sohne, sans-serif' }}>{selectedRoute}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {isPageDropdownOpen && (
                    <div className="absolute z-50 mt-1 w-48 bg-[#0f0f0f] border border-zinc-800 rounded-md shadow-xl">
                      <div className="py-1 max-h-64 overflow-auto">
                        {pages.map(p => (
                          <button
                            key={p.path}
                            onClick={() => { setSelectedRoute(p.path); setIsPageDropdownOpen(false); setRendererKey(k => k+1); }}
                            className={`w-full text-left px-3 py-1.5 text-sm hover:bg-white/5 ${selectedRoute === p.path ? 'text-white' : 'text-gray-300'}`}
                          >
                            {p.path}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {isEditableModeEnabled && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    const previewUrl = `https://Surbee.dev/preview/${projectId}`;
                    window.open(previewUrl, '_blank', 'width=1200,height=800');
                  }}
                  className="p-1 rounded text-gray-400 hover:text-white hover:bg-zinc-700/30 transition-colors"
                  title="Open preview in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setRendererKey((k) => k + 1)}
                  className="p-1 rounded text-gray-400 hover:text-white hover:bg-zinc-700/30 transition-colors"
                  title="Refresh page"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Section - Upgrade & Publish Buttons */}
          <div className="relative flex items-center gap-2">
            {/* Share */}
            <div className="relative">
              <button
                onClick={() => setIsShareOpen((v) => !v)}
                className="p-1.5 rounded-md text-gray-300 hover:bg-white/10"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {isShareOpen && (
                <div ref={shareMenuRef} className="absolute top-full right-0 mt-2 w-[320px] bg-black border border-zinc-800 rounded-xl shadow-2xl z-50 p-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Share</span>
                      <button
                        onClick={() => { try { navigator.clipboard.writeText(window.location.href); } catch {} }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-white/5 hover:bg-white/10 text-gray-200"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy link
                      </button>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400">Invite by email</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="name@company.com"
                          className="flex-1 h-8 rounded-md bg-zinc-900 border border-zinc-800 px-2 text-sm text-white outline-none focus:border-zinc-700"
                        />
                        <button
                          onClick={() => { try { /* TODO: backend invite */ alert(`Invited ${inviteEmail}`); } catch {} setInviteEmail(''); }}
                          className="h-8 px-2 rounded-md bg-white text-black text-sm font-medium hover:opacity-90"
                        >
                          Invite
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-sm text-gray-300">Publish to community</span>
                      <button
                        onClick={() => setPublishToCommunity(v => !v)}
                        className={`w-10 h-6 rounded-full relative transition-colors ${publishToCommunity ? 'bg-blue-600' : 'bg-zinc-700'}`}
                        aria-pressed={publishToCommunity}
                        title="Toggle publish to community"
                      >
                        <span className={`absolute top-0.5 ${publishToCommunity ? 'left-5' : 'left-0.5'} w-5 h-5 bg-white rounded-full transition-all`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              className={`relative px-3 py-1.5 font-medium text-sm transition-all duration-150 cursor-pointer rounded-[0.38rem] ${
                activeTopButton === 'upgrade' ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
              style={{
                fontFamily: 'FK Grotesk, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.375rem'
              }}
              onClick={() => router.push('/dashboard/upgrade-plan')}
            >
              Upgrade
            </button>
            <button
              onClick={() => {
                setIsPublishOpen((v) => !v);
                setActiveTopButton(activeTopButton === 'publish' ? null : 'publish');
              }}
              className={`relative px-3 py-1.5 font-medium text-sm transition-all duration-150 cursor-pointer rounded-[0.38rem] ${
                activeTopButton === 'publish' ? 'bg-white text-black' : 'bg-white text-black hover:opacity-90'
              }`}
              style={{
                fontFamily: 'FK Grotesk, sans-serif',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: '1.375rem'
              }}
            >
              Publish
            </button>
            {isPublishOpen && (
              <div
                ref={publishMenuRef}
                className="absolute top-full right-0 mt-2 w-[360px] bg-black border border-zinc-800 rounded-xl shadow-2xl z-50"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Preview</span>
                    <a
                      href={`https://Surbee.dev/preview/${projectId}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 px-2 py-1 rounded-md text-xs text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="truncate">Surbee.dev/preview/{projectId}</span>
                    </a>
                  </div>
                  <div className="border-t border-zinc-800" />
                  <div className="space-y-2">
                    <button className="w-full h-9 rounded-md bg-zinc-900 text-gray-200 text-sm font-medium hover:bg-zinc-800 transition-colors border border-zinc-800">
                      Connect Domain
                    </button>
                    <button className="w-full h-9 rounded-md bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors border border-white/10">
                      Publish to Surbee.dev
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex relative">
          {/* Restored rounded preview frame with border, like before */}
          <div className="flex-1 flex flex-col relative bg-[#1a1a1a] rounded-[0.625rem] border border-zinc-800 mt-0 mr-3 mb-3 ml-2 overflow-hidden">
            <div className="flex-1 overflow-hidden flex items-center justify-center">
              {/* Device-sized container with smooth transitions on resize */}
              <div className={`relative ${getDeviceStyles()} transition-all duration-300 ease-in-out`}>
                <DeepSiteRenderer
                  key={`renderer-${rendererKey}`}
                  html={deepSite.html}
                  currentPath={selectedRoute}
                  deviceType={currentDevice}
                  title="Website Preview"
                  className="h-full w-full"
                  isEditableModeEnabled={isEditableModeEnabled}
                  onClickElement={(element) => {
                    setIsEditableModeEnabled(false);
                    setSelectedElement(element);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

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
      </div>
    </AppLayout>
  );
}




