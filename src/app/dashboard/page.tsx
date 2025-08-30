"use client";

import { ChevronDown, ChevronLeft, Plus, Home, Library, Search, MessageSquare, Folder as FolderIcon, ArrowUp, User, ThumbsUp, HelpCircle, Gift, ChevronsLeft, AtSign, Settings2, Inbox, FlaskConical, BookOpen, X, Paperclip, Clock, Users, BarChart3, Calendar, FileText, Target, Settings } from "lucide-react";
import dynamic from 'next/dynamic'
const InviteModal = dynamic(() => import('@/components/referrals/InviteModal'), { ssr: false })
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { File, Folder, Tree } from "@/components/ui/file-tree";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import AIResponseActions from "@/components/ui/ai-response-actions";
import { TextShimmer } from "@/components/ui/text-shimmer";
import ChatInput from "@/components/ui/chat-input";
import ChatInputLight from "@/components/ui/chat-input-light";
import ThoughtProcess from "../../../components/survey-builder/thought-process";
import { useRouter } from "next/navigation";
import UserNameBadge from "@/components/UserNameBadge";
import UserMenu from "@/components/ui/user-menu";
import { recordAIFeedback } from '@/lib/database';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
 

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface RecentChat {
  id: string;
  title: string;
  timestamp: Date;
  projectId: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { onlineUsers, subscribeToUserProjects } = useRealtime();
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isPlanUsageOpen, setIsPlanUsageOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isRecentsOpen, setIsRecentsOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [recentChats, setRecentChats] = useState<Array<{
    id: string;
    title: string;
    projectId: string;
    timestamp: Date;
  }>>([]);
  const [loadingChats, setLoadingChats] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingDuration, setThinkingDuration] = useState(0);
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [currentThought, setCurrentThought] = useState<string>("");
  const [thinkPhase, setThinkPhase] = useState<'thinking' | 'streaming' | 'answered'>("thinking");
  const sseRef = useRef<EventSource | null>(null);
  const [isInputDisabled, setIsInputDisabled] = useState(false);
  const [surveyMode, setSurveyMode] = useState<'fast' | 'research'>('fast');
  const [currentChatSessionId, setCurrentChatSessionId] = useState<string | null>(null);


  const chatAreaRef = useRef<HTMLDivElement>(null);

  const knowledgeBaseElements = [
    {
      id: "1",
      isSelectable: true,
      name: "Research",
      children: [
        {
          id: "2",
          isSelectable: true,
          name: "Age reversal study.pdf",
        },
        {
          id: "3",
          isSelectable: true,
          name: "Clinical trials.pdf",
        },
      ],
    },
    {
      id: "4",
      isSelectable: true,
      name: "Documentation",
      children: [
        {
          id: "5",
          isSelectable: true,
          name: "User guide.pdf",
        },
        {
          id: "6",
          isSelectable: true,
          name: "API reference.pdf",
        },
      ],
    },
  ];

  // Generate unique chat session ID
  const generateChatSessionId = () => {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSendMessage = async (message: string, images?: string[]) => {
    if (!message.trim()) return;
    if (isInputDisabled) return;
    if (!user) return;

    // Generate chat session ID for new conversations
    let sessionId = currentChatSessionId;
    if (!sessionId) {
      sessionId = generateChatSessionId();
      setCurrentChatSessionId(sessionId);
    }

    // Normal chat mode - stay on home page and start chatting
    const userMessage: ChatMessage = {
      id: `${sessionId}_msg_${Date.now()}`,
      text: message.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Smooth transition when starting chat
    if (!hasStartedChat) {
      setHasStartedChat(true);
    }

    // Save user message to database (create a new project if first message)
    try {
      // For dashboard chat, create a new project for each conversation session
      if (messages.length === 0) {
        const projectResponse = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Chat: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
            description: `Chat conversation from dashboard (Session: ${sessionId})`,
            user_id: user.id
          })
        });
        
        if (projectResponse.ok) {
          const { project } = await projectResponse.json();
          
          // Save the user message
          await fetch(`/api/projects/${project.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: message.trim(),
              is_user: true,
              user_id: user.id
            })
          });
        }
      }
    } catch (error) {
      console.error('Failed to save message:', error);
    }
    
    // Start SSE think + final streaming
    const thinkingStartTime = Date.now();
    setIsThinking(true);
    setThinkPhase('thinking');
    setThoughts([]);
    setCurrentThought("");
    setIsInputDisabled(true);

    // Prepare placeholder assistant message ID for streaming tokens
    const aiMessageId = `${sessionId}_ai_${Date.now()}`;

    // Helper to apply live style edits from SSE
    const applyEdit = (edit: any) => {
      if (!edit || typeof document === 'undefined') return;
      if (edit.type === 'style' && typeof edit.target === 'string' && edit.changes) {
        try {
          const nodes = document.querySelectorAll<HTMLElement>(edit.target);
          nodes.forEach((el) => {
            Object.entries(edit.changes as Record<string, string>).forEach(([k, v]) => {
              // @ts-expect-error index style assignment
              el.style[k] = v as any;
            });
          });
        } catch {}
      }
    };

    try {
      const es = new EventSource(`/api/deepseek-think?prompt=${encodeURIComponent(message.trim())}`);
      sseRef.current = es;

      es.addEventListener('status', (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        if (data.state === 'thinking_started') setThinkPhase('thinking');
        if (data.state === 'final_streaming') setThinkPhase('streaming');
      });

      es.addEventListener('thought', (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        if (typeof data.text === 'string') {
          setThoughts(prev => [...prev, data.text]);
          setCurrentThought(data.text);
        }
      });

      es.addEventListener('edit', (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        applyEdit(data);
      });

      es.addEventListener('final_token', (e) => {
        const data = JSON.parse((e as MessageEvent).data);
        const token = typeof data.token === 'string' ? data.token : '';
        if (!token) return;
        
        // Add the AI message if it doesn't exist yet (first token)
        setMessages(prev => {
          const existing = prev.find(m => m.id === aiMessageId);
          if (!existing) {
            return [...prev, { id: aiMessageId, text: token, isUser: false, timestamp: new Date() }];
          } else {
            return prev.map(m => m.id === aiMessageId ? { ...m, text: (m.text || '') + token } : m);
          }
        });
      });

      const cleanUp = () => {
        const thinkingEndTime = Date.now();
        const duration = Math.round((thinkingEndTime - thinkingStartTime) / 1000);
        setThinkingDuration(duration);
        setIsThinking(false);
        setThinkPhase('answered');
        setIsInputDisabled(false);
        es.close();
        sseRef.current = null;
      };

      es.addEventListener('done', cleanUp);
      es.addEventListener('error', cleanUp);
    } catch (e) {
      setIsThinking(false);
      setThinkPhase('answered');
      setThinkingDuration(0);
      setIsInputDisabled(false);
      setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), text: 'Failed to reach thinking service.', isUser: false, timestamp: new Date() }]);
    }
  };

  const openImageModal = (imageUrl: string) => setSelectedImage(imageUrl);

  const handleRecentChatClick = (projectId: string) => {
    router.push(`/project/${projectId}`);
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Fetch recent chats when user is authenticated
  useEffect(() => {
    const fetchRecentChats = async () => {
      if (!user) return;
      
      try {
        const response = await fetch(`/api/chats/recent?userId=${user.id}&limit=10`);
        if (response.ok) {
          const data = await response.json();
          const formattedChats = data.recentChats?.map((chat: any) => ({
            id: chat.id,
            title: chat.title,
            projectId: chat.projectId,
            timestamp: new Date(chat.timestamp)
          })) || [];
          setRecentChats(formattedChats);
        }
      } catch (error) {
        console.error('Failed to fetch recent chats:', error);
      } finally {
        setLoadingChats(false);
      }
    };

    if (user && !authLoading) {
      fetchRecentChats();
    }
  }, [user, authLoading]);

  // Subscribe to real-time project updates
  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserProjects();
      return unsubscribe;
    }
  }, [user, subscribeToUserProjects]);

  // Smooth scroll to bottom when new messages are added
  useEffect(() => {
    if (chatAreaRef.current && messages.length > 0) {
      const scrollToBottom = () => {
        chatAreaRef.current?.scrollTo({
          top: chatAreaRef.current.scrollHeight,
          behavior: 'smooth'
        });
      };
      
      // Small delay to ensure message is rendered
      setTimeout(scrollToBottom, 100);
    }
  }, [messages.length]);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isUserMenuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        userMenuRef.current && !userMenuRef.current.contains(t) &&
        userButtonRef.current && !userButtonRef.current.contains(t)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [isUserMenuOpen]);

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: 'Sohne, sans-serif' }}>
      {/* Content Area - Chat */}
      <div className="w-full max-w-2xl flex flex-col mx-auto flex-1" style={{ 
        height: '100%',
        justifyContent: hasStartedChat ? 'flex-start' : 'center',
        transition: 'all 0.4s ease-in-out'
      }}>
              {/* Greeting Text */}
              <AnimatePresence mode="wait">
                {!hasStartedChat && (
                  <motion.div 
                    className="text-center mb-4"
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <h1 className="text-white text-center" style={{ 
                      color: 'rgb(235, 235, 235)', 
                      fontFamily: 'PP Editorial, sans-serif', 
                      fontSize: '40px', 
                      fontWeight: 200,
                      marginBottom: '0.5rem'
                    }}>
                      Hell<span style={{ fontStyle: 'italic', fontWeight: 200 }}>o</span>, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'}.
                    </h1>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages Area - Inside Container */}
              <AnimatePresence>
                {hasStartedChat && (
                  <motion.div 
                    ref={chatAreaRef}
                    className="w-full overflow-y-auto mb-4 flex-1 scrollbar-hide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ 
                      scrollBehavior: 'smooth',
                      maxHeight: 'calc(100vh - 200px)',
                      paddingTop: '2rem'
                    }}
                  >
                    <div className="space-y-6">
                      {messages.map((message, idx) => (
                      <div
                        key={message.id}
                        className={`group relative ${
                          message.isUser ? 'text-right' : 'text-left'
                        }`}
                      >
                        {/* Thinking dropdown should appear above the AI answer it belongs to */}
                        {!message.isUser && (
                          <ThoughtProcess
                            isThinking={isThinking && idx === messages.length - 1}
                            currentThought={idx === messages.length - 1 ? currentThought : ''}
                            thoughts={idx === messages.length - 1 ? thoughts : []}
                            phase={idx === messages.length - 1 ? thinkPhase : 'answered'}
                            startTime={Date.now() - thinkingDuration * 1000}
                          />
                        )}
                        <div
                          className="text-base leading-relaxed w-full"
                          style={{ 
                            color: message.isUser ? '#ffffff' : '#ffffff',
                            fontFamily: 'Sohne, sans-serif',
                            lineHeight: '1.6',
                            wordWrap: 'break-word',
                            fontSize: '16px'
                          }}
                        >
                          {/* Chat bubble styling */}
                          {message.isUser ? (
                            <div className="flex justify-end w-full">
                              <span
                                className="text-white inline-block rounded-xl max-w-[85%] px-4 py-3 whitespace-pre-wrap break-words"
                                style={{ 
                                  backgroundColor: '#212121', 
                                  overflowWrap: 'anywhere',
                                  fontSize: '16px',
                                  lineHeight: '1.5'
                                }}
                              >
                                {message.text}
                              </span>
                            </div>
                          ) : (
                            <div className="w-full max-w-full">
                              <MarkdownRenderer 
                                content={message.text} 
                                className="text-[16px] leading-6 w-full max-w-full prose prose-invert prose-sm max-w-none"
                              />
                            </div>
                          )}
                        </div>
                        {!message.isUser && (
                          <div className="mt-2 group">
                            <AIResponseActions
                              message={message.text}
                              onCopy={(content) => navigator.clipboard.writeText(content)}
                              onThumbsUp={() => recordAIFeedback('home_chat', String(message.id), 'thumbs_up')}
                              onThumbsDown={() => recordAIFeedback('home_chat', String(message.id), 'thumbs_down')}
                              onRetry={() => {
                                const lastUser = [...messages].reverse().find(m => m.isUser)?.text || '';
                                if (lastUser) handleSendMessage(lastUser);
                              }}
                              onCreateSurvey={() => {
                                const prompt = [...messages].reverse().find(m => m.isUser)?.text || '';
                                if (prompt) {
                                  const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                                  try { sessionStorage.setItem('surbee_initial_prompt', prompt); } catch {}
                                  window.location.href = `/project/${projectId}`;
                                }
                              }}
                            />
                          </div>
                        )}
                      </div>
                      ))}
                      
                      {/* Removed duplicate shimmer; ThoughtProcess handles thinking UI */}
                      
                      {/* Thinking Duration Display */}
                      {thinkingDuration > 0 && !isThinking && (
                        <div className="text-left text-xs text-gray-400" style={{ fontFamily: 'Sohne, sans-serif' }}>
                          Thought for {thinkingDuration} seconds
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Chat Input */}
              <div
                className="w-full relative"
                style={{
                  transform: hasStartedChat ? 'translateY(0)' : 'translateY(0)',
                  width: '100%',
                  maxWidth: hasStartedChat ? '100%' : '42rem',
                  marginTop: hasStartedChat ? '0' : '0rem',
                }}
              >
                <ChatInputLight
                  onSendMessage={(message, images) => {
                    handleSendMessage(message, images);
                  }}
                  isInputDisabled={isInputDisabled}
                  placeholder={hasStartedChat ? "Ask a Follow-Up..." : "Ask Surbee anything. Type @ for mentions"}
                  className="chat-input-grey"
                />
              </div>

      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative max-w-[90vw] md:max-w-[800px] max-h-[80vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 rounded-full bg-black/70 p-2 hover:bg-black/90 transition-all"
            >
              <X className="h-5 w-5 text-white" />
            </button>
            <img
              src={selectedImage}
              alt="Full preview"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />
          </div>
        </div>
      )}

      {/* Invite Modal (center popup) */}
      <InviteModal open={inviteOpen} onOpenChange={setInviteOpen} />

    </div>
  );
}