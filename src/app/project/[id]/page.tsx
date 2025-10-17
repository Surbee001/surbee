"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, Plus, Home, Library, Search, MessageSquare, Folder as FolderIcon, ArrowUp, User, ThumbsUp, HelpCircle, Gift, ChevronsLeft, Menu, AtSign, Settings2, Inbox, FlaskConical, BookOpen, X, Paperclip, History, Monitor, Smartphone, Tablet, ExternalLink, RotateCcw, Eye, GitBranch, StopCircle, Flag, PanelLeftClose, PanelLeftOpen, Share2, Copy, Hammer } from "lucide-react";
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
import { ThinkingDisplay } from '../../../../components/ThinkingUi/components/thinking-display';
import { ToolCall } from '../../../../components/ThinkingUi/components/tool-call';
import { AILoader } from '@/components/ai-loader';

interface ThinkingStep {
  id: string;
  content: string;
  status: "thinking" | "complete";
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

  const activeRequestRef = useRef<AbortController | null>(null);

  
  const [thinkingHtmlStream, setThinkingHtmlStream] = useState<string>('');
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingLabel, setBuildingLabel] = useState('Building survey experience...');
  const [hasHtmlContent, setHasHtmlContent] = useState(false);
  const buildingLabelRef = useRef(buildingLabel);
  useEffect(() => {
    buildingLabelRef.current = buildingLabel;
  }, [buildingLabel]);

  const recordError = (err: string) => {
    console.error('[Error]', err);
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












  const stop = () => {
    if (activeRequestRef.current) {
      activeRequestRef.current.abort();
      activeRequestRef.current = null;
    }
    setIsThinking(false);
    setIsInputDisabled(false);
    deepSite.setIsAiWorking(false);
    deepSite.setIsThinking(false);
    setIsBuilding(false);
    const defaultBuildLabel = 'Building survey experience...';
    setBuildingLabel(defaultBuildLabel);
    buildingLabelRef.current = defaultBuildLabel;
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

    // Set thinking to true FIRST to keep UI visible
    setIsThinking(true);
    
    setIsInputDisabled(true);
    deepSite.setIsAiWorking(true);
    deepSite.setIsThinking(true);

    setIsBuilding(false);
    
    // Fun random building labels
    const buildingLabels = [
      'Doodling your survey...',
      'Sketching questions...',
      'Crafting something special...',
      'Painting your survey...',
      'Conjuring magic...',
      'Weaving ideas together...',
      'Sculpting the experience...',
      'Drawing up something cool...',
      'Creating survey vibes...',
      'Mixing the perfect blend...',
      'Composing your masterpiece...',
      'Brewing survey magic...',
    ];
    const randomBuildLabel = buildingLabels[Math.floor(Math.random() * buildingLabels.length)];
    setBuildingLabel(randomBuildLabel);
    buildingLabelRef.current = randomBuildLabel;
    setThinkingHtmlStream('');
    setHasHtmlContent(false);
    
    // Now clear steps - thinking is already true so UI won't disappear
    setThinkingSteps([]);

    // Simply track each reasoning line as it comes in
    let reasoningCounter = 0;

    const addReasoningStep = (text: string) => {
      console.log('[Thinking] Adding reasoning:', text);
      const stepId = `reasoning-${Date.now()}-${reasoningCounter++}`;
      
      setThinkingSteps((prev) => {
        const newSteps = [
          ...prev,
          {
            id: stepId,
            content: text,
            status: 'thinking' as const
          }
        ];
        console.log('[Thinking] Steps count:', newSteps.length);
        return newSteps;
      });
    };

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

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to read response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let htmlBuf = '';
      let lastPushedLen = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let boundary = buffer.indexOf('\n');
        while (boundary !== -1) {
          const line = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 1);

          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (payload.trim().length > 0) {
              try {
                const ev = JSON.parse(payload);
                
                // Handle batch events - unpack and process each event
                if (ev.type === 'batch' && Array.isArray(ev.events)) {
                  for (const batchedEvent of ev.events) {
                    // Process each batched event directly
                    if (batchedEvent.type === 'reasoning' && batchedEvent.text) {
                      const text = String(batchedEvent.text).trim();
                      if (text.length > 0) {
                        // Always add reasoning step - don't trigger building from reasoning text
                        addReasoningStep(text);
                      }
                    } else if (batchedEvent.type === 'message' && batchedEvent.text) {
                      const messageText = String(batchedEvent.text).trim();
                      console.log('[Message] AI response received (batch):', messageText.substring(0, 100));
                      if (messageText.length > 0) {
                        // Don't close thinking - just add the message to chat
                        // Thinking stays open and can continue showing more reasoning after the message
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: batchedEvent.id || `msg-${Date.now()}`,
                            text: messageText,
                            isUser: false,
                            timestamp: new Date(),
                          },
                        ]);
                      }
                    } else if (batchedEvent.type === 'tool_call' && batchedEvent.name === 'buildHtmlCode') {
                      // Tool call to buildHtmlCode means building phase is starting
                      console.log('[Tool Call] buildHtmlCode starting - closing thinking, starting building');
                      setThinkingSteps((prev) => prev.map((step) => ({ ...step, status: 'complete' })));
                      setIsThinking(false);
                      setIsBuilding(true);
                    }
                  }
                  boundary = buffer.indexOf('\n');
                  continue;
                }
                
                if (ev.type === 'reasoning' && ev.text) {
                  const text = String(ev.text).trim();
                  if (text.length > 0) {
                    // Always add reasoning step - don't trigger building from reasoning text
                    addReasoningStep(text);
                  }
                } else if (ev.type === 'message' && ev.text) {
                  // Handle AI message responses - add to chat but keep thinking open
                  const messageText = String(ev.text).trim();
                  console.log('[Message] AI response received:', messageText.substring(0, 100));
                  if (messageText.length > 0) {
                    // Don't close thinking - just add the message to chat
                    // Thinking stays open and can continue showing more reasoning after the message
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: ev.id || `msg-${Date.now()}`,
                        text: messageText,
                        isUser: false,
                        timestamp: new Date(),
                      },
                    ]);
                  }
                } else if (ev.type === 'tool_call' && ev.name === 'buildHtmlCode') {
                  // Tool call to buildHtmlCode means building phase is starting
                  console.log('[Tool Call] buildHtmlCode starting - closing thinking, starting building');
                  setThinkingSteps((prev) => prev.map((step) => ({ ...step, status: 'complete' })));
                  setIsThinking(false);
                  setIsBuilding(true);
                } else if (ev.type === 'html_chunk' && typeof ev.chunk === 'string') {
                  htmlBuf += ev.chunk;
                  // First HTML chunk means thinking is done
                  if (!htmlBuf || htmlBuf.length === ev.chunk.length) {
                    setIsThinking(false);
                    setThinkingSteps((prev) => prev.map((step) => ({ ...step, status: 'complete' })));
                  }
                  setIsBuilding(true);
                  setHasHtmlContent(true);
                  if (htmlBuf.length > lastPushedLen) {
                    lastPushedLen = htmlBuf.length;
                    deepSite.updateHtml(htmlBuf);
                    setThinkingHtmlStream(htmlBuf);
                  }
                } else if (ev.type === 'complete') {
                  if (htmlBuf.length > lastPushedLen) {
                    deepSite.updateHtml(htmlBuf);
                    setThinkingHtmlStream(htmlBuf);
                  }
                  const finalLabel = 'Build complete.';
                  setBuildingLabel(finalLabel);
                  buildingLabelRef.current = finalLabel;
                  // Ensure thinking is closed and all steps marked complete
                  setIsThinking(false);
                  setThinkingSteps((prev) => prev.map((step) => ({ ...step, status: 'complete' })));
                  setIsBuilding(false);
                } else if (ev.type === 'error' && ev.message) {
                  const errorMessage = String(ev.message);
                  const errorId = ev.id || `error-${Date.now()}`;
                  setThinkingSteps((prev) => [
                    ...prev,
                    { id: errorId, content: `Error: ${errorMessage}`, status: 'thinking' },
                  ]);
                  setIsThinking(false);
                  setIsBuilding(false);
                }
              } catch {
                // ignore malformed line
              }
            }
          }

          boundary = buffer.indexOf('\n');
        }
      }

      return true;
    } catch (error) {
      console.error('runSurveyBuild error', error);
      const message = error instanceof Error ? error.message : 'Unexpected agent error.';
      const failureLabel = 'Build interrupted.';
      setIsBuilding(false);
      setBuildingLabel(failureLabel);
      buildingLabelRef.current = failureLabel;
      // Mark all thinking steps as complete
      setThinkingSteps((prev) => prev.map((step) => ({ ...step, status: 'complete' })));
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
      return false;
    } finally {
      setIsThinking(false);
      setIsInputDisabled(false);
      deepSite.setIsAiWorking(false);
      deepSite.setIsThinking(false);
      setIsBuilding(false);
      activeRequestRef.current = null;
    }
  }, [deepSite, recordError]);

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
            <div className="flex-1 overflow-y-auto pl-12 pr-6 py-6" ref={chatAreaRef}>
              <div className="space-y-6">
                {messages.length === 0 && !isThinking && (
                  <div></div>
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
                {(isThinking || isBuilding) && (
                  <>
                    {isThinking && <ThinkingDisplay steps={thinkingSteps} isThinking={isThinking} />}
                    {isBuilding && (
                      <ToolCall
                        icon={<Hammer className="h-4 w-4 text-muted-foreground" />}
                        label={buildingLabel}
                        isActive
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          </div>

        {/* Chat Input */}
        <div className="pl-8 pr-4 pb-3">
          <div className="relative ml-0 mr-0">
            {/* Chat input container to anchor controls to the box itself */}
            <div className="relative">
              <ChatInputLight
                onSendMessage={(message, images) => handleSendMessage(message, images)}
                isInputDisabled={isInputDisabled || deepSite.isAiWorking}
                placeholder="Ask for a follow-up"
                className="chat-input-grey"
                isEditMode={isEditableModeEnabled}
                onToggleEditMode={() => {
                  setIsEditableModeEnabled(!isEditableModeEnabled);
                  if (selectedElement) {
                    setSelectedElement(null);
                  }
                }}
                showSettings={false}
                selectedElement={selectedElement}
                disableRotatingPlaceholders={true}
                onClearSelection={() => setSelectedElement(null)}
              />
              {/* Additional Controls pinned to the input's top-right */}
              <div className="absolute top-2 right-2 flex items-center gap-2 z-10">

                {isThinking && (
                  <button
                    onClick={stop}
                    className="relative justify-center whitespace-nowrap ring-offset-background focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-7 data-[state=open]:bg-muted focus-visible:outline-none group inline-flex gap-1 items-center px-2.5 py-1 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer w-fit focus-visible:ring-0 focus-visible:ring-offset-0 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-transparent"
                    type="button"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Stop</span>
                  </button>
                )}
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
          <div className="flex-1 flex flex-col relative bg-[#0a0a0a] rounded-[0.625rem] border border-zinc-800 mt-0 mr-3 mb-3 ml-2 overflow-hidden">
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#0a0a0a]">
              {/* Show loading animation while building but no HTML yet */}
              {(isBuilding || isThinking) && !hasHtmlContent ? (
                <AILoader text="Building" size={200} />
              ) : (
                /* Device-sized container with smooth transitions on resize */
                <div className={`relative ${getDeviceStyles()} transition-all duration-300 ease-in-out`}>
                  <DeepSiteRenderer
                    key={`renderer-${rendererKey}`}
                    html={deepSite.html}
                    currentPath={selectedRoute}
                    deviceType={currentDevice}
                    title="Website Preview"
                    className="h-full w-full bg-[#0a0a0a]"
                    isEditableModeEnabled={isEditableModeEnabled}
                    onClickElement={(element) => {
                      setIsEditableModeEnabled(false);
                      setSelectedElement(element);
                    }}
                  />
                </div>
              )}
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
