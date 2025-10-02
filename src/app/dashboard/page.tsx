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
  const { user, userProfile, loading: authLoading } = useAuth();
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
    // Demo mode: Allow sending messages without authentication
    // if (!user) return;

    // Generate chat session ID for new conversations
    let sessionId = currentChatSessionId;
    if (!sessionId) {
      sessionId = generateChatSessionId();
      setCurrentChatSessionId(sessionId);
    }

    // Redirect to survey builder with the initial prompt
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      sessionStorage.setItem('surbee_initial_prompt', message.trim());
    } catch {}
    router.push(`/project/${projectId}/view`);
    return;

    // No longer needed since we're redirecting to project builder
  };

  const openImageModal = (imageUrl: string) => setSelectedImage(imageUrl);

  const handleRecentChatClick = (projectId: string) => {
    router.push(`/project/${projectId}/view`);
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
      // Demo mode: Skip fetching chats if no user
      if (!user) {
        setLoadingChats(false);
        return;
      }
      
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


  // Show loading state only during initial auth loading
  if (authLoading) {
    return (
      <div className="flex flex-col h-full" style={{ fontFamily: 'Sohne, sans-serif' }}>
        {/* Only skeleton for main content area - no sidebar */}
        <div className="w-full max-w-2xl flex flex-col mx-auto flex-1 justify-center">
          {/* Greeting Text Skeleton */}
          <div className="text-center mb-4">
            <div className="skeleton-text mx-auto mb-6" style={{ 
              width: '350px', 
              height: '3rem',
              borderRadius: '0.5rem'
            }}></div>
            <div className="skeleton-text mx-auto mb-4" style={{ 
              width: '500px', 
              height: '1.5rem',
              borderRadius: '0.375rem'
            }}></div>
            <div className="skeleton-text mx-auto" style={{ 
              width: '400px', 
              height: '1.5rem',
              borderRadius: '0.375rem'
            }}></div>
          </div>

          {/* Chat Input Skeleton */}
          <div className="mt-8 px-4">
            <div className="relative">
              <div className="skeleton-form-input" style={{
                height: '3rem',
                borderRadius: '0.75rem',
                marginBottom: '1rem'
              }}></div>
              
              {/* Quick Actions Skeleton */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton-base" style={{
                    width: '120px',
                    height: '2rem',
                    borderRadius: '1rem'
                  }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Demo mode: Allow access without authentication
  // if (!user) {
  //   router.push('/login');
  //   return null;
  // }

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
                      Hell<span style={{ fontStyle: 'italic', fontWeight: 200 }}>o</span>, {user ? (userProfile?.name || user?.user_metadata?.name || user?.email?.split('@')[0]) : 'there'}.
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
                                  window.location.href = `/project/${projectId}/view`;
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
                  placeholder={"What survey do you want to create today?"}
                  className="chat-input-grey"
                />

                {/* Suggestion Pills - Moving Carousel */}
                <div className="mt-4 w-full">
                  <div className="space-y-2 overflow-hidden">
                    {/* Top Row - Moving Left (revert fades to full-width edges) */}
                    <div className="relative group marquee marquee--slow">
                      <div className="marquee__track gap-2">
                        {[
                          "Create a customer feedback survey",
                          "Design an employee satisfaction form", 
                          "Build a product review questionnaire",
                          "Make a market research survey",
                          "Generate a user experience poll",
                          "Create an event registration form",
                          "Design a course evaluation survey",
                          "Build a health screening questionnaire"
                        ].concat([
                          "Create a customer feedback survey",
                          "Design an employee satisfaction form", 
                          "Build a product review questionnaire",
                          "Make a market research survey",
                          "Generate a user experience poll",
                          "Create an event registration form",
                          "Design a course evaluation survey",
                          "Build a health screening questionnaire"
                        ]).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(suggestion, [])}
                            className="flex-shrink-0 px-3 py-1.5 text-xs bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent pointer-events-none" />
                      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent pointer-events-none" />
                    </div>

                    {/* Bottom Row - Moving Right (Narrower) */}
                    <div className="relative group marquee marquee--reverse marquee--slow">
                      {/* Make bottom line shorter to match fades and clip track inside this width */}
                      <div className="max-w-[80%] mx-auto relative overflow-hidden">
                        <div className="marquee__track gap-2">
                        {[
                          "Create a job application form",
                          "Design a website feedback survey", 
                          "Build a membership signup form",
                          "Generate a training needs assessment",
                          "Create a volunteer registration form",
                          "Design a patient intake questionnaire"
                        ].concat([
                          "Create a job application form",
                          "Design a website feedback survey", 
                          "Build a membership signup form",
                          "Generate a training needs assessment",
                          "Create a volunteer registration form",
                          "Design a patient intake questionnaire"
                        ]).map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => handleSendMessage(suggestion, [])}
                            className="flex-shrink-0 px-3 py-1.5 text-xs bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                        </div>
                        {/* Narrower fades so the bottom line feels shorter; placed inside wrapper */}
                        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent" />
                        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#1C1C1C] via-[#1C1C1C]/80 to-transparent" />
                      </div>
                    </div>
                  </div>
                </div>
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
