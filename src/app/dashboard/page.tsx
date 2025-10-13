"use client";

import { ChevronDown, ChevronLeft, Plus, Home, Library, Search, MessageSquare, Folder as FolderIcon, ArrowUp, User, ThumbsUp, HelpCircle, Gift, ChevronsLeft, AtSign, Settings2, Inbox, FlaskConical, BookOpen, X, Paperclip, Clock, Users, BarChart3, Calendar, FileText, Target, Settings } from "lucide-react";
import dynamic from 'next/dynamic'
import { ImageKitProvider } from '@imagekit/next';
const InviteModal = dynamic(() => import('@/components/referrals/InviteModal'), { ssr: false })
import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { File, Folder, Tree } from "@/components/ui/file-tree";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import AIResponseActions from "@/components/ui/ai-response-actions";
import { TextShimmer } from "@/components/ui/text-shimmer";
import ChatInput from "@/components/ui/chat-input";
import ChatInputLight from "@/components/ui/chat-input-light";
import ThoughtProcess from "../../../components/survey-builder/thought-process";
import { useRouter, useSearchParams } from "next/navigation";
import UserNameBadge from "@/components/UserNameBadge";
import UserMenu from "@/components/ui/user-menu";
import { recordAIFeedback } from '@/lib/database';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtime } from '@/contexts/RealtimeContext';
import { CommunityProjectCard } from '@/components/community/CommunityProjectCard';
 

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

interface CommunityProject {
  id: string;
  title: string;
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
  previewImage?: string;
  userAvatar?: string;
}

// Sample community projects data
const sampleCommunityProjects: CommunityProject[] = [
  {
    id: 'community-1',
    title: 'Customer Satisfaction Survey',
    status: 'published',
    updatedAt: '2024-01-15T10:00:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/1.png&w=96&q=75',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png'
  },
  {
    id: 'community-2',
    title: 'Employee Engagement Study',
    status: 'published',
    updatedAt: '2024-01-14T09:30:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/2.png&w=96&q=75',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png'
  },
  {
    id: 'community-3',
    title: 'Product Feedback Collection',
    status: 'published',
    updatedAt: '2024-01-13T16:20:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/3.png&w=96&q=75',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_abf323ce-3d0a-417d-8ce7-b307c8e84258.png'
  },
  {
    id: 'community-4',
    title: 'Brand Awareness Research',
    status: 'published',
    updatedAt: '2024-01-12T08:00:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/4.png&w=96&q=75',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__423e2f06-d2d7-4c2c-bd7b-9aec2b6c1fbe.png'
  },
  {
    id: 'community-5',
    title: 'User Experience Evaluation',
    status: 'published',
    updatedAt: '2024-01-11T14:30:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/5.png&w=96&q=75',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png'
  },
  {
    id: 'community-6',
    title: 'Market Research Analysis',
    status: 'published',
    updatedAt: '2024-01-10T12:00:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/6.png&w=96&q=75',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png'
  },
  {
    id: 'community-7',
    title: 'Customer Journey Mapping',
    status: 'published',
    updatedAt: '2024-01-09T16:30:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/7.png&w=96&q=75',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_abf323ce-3d0a-417d-8ce7-b307c8e84258.png'
  },
  {
    id: 'community-8',
    title: 'Website Usability Test',
    status: 'published',
    updatedAt: '2024-01-08T11:45:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/8.png&w=96&q=75',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__423e2f06-d2d7-4c2c-bd7b-9aec2b6c1fbe.png'
  },
  {
    id: 'community-9',
    title: 'Social Media Sentiment',
    status: 'published',
    updatedAt: '2024-01-07T13:20:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/9.png&w=96&q=75',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png'
  },
  {
    id: 'community-10',
    title: 'Pricing Strategy Survey',
    status: 'published',
    updatedAt: '2024-01-06T10:15:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/10.png&w=96&q=75',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png'
  },
  {
    id: 'community-11',
    title: 'Feature Request Analysis',
    status: 'published',
    updatedAt: '2024-01-05T15:45:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/1.png&w=96&q=75'
  },
  {
    id: 'community-12',
    title: 'Onboarding Experience',
    status: 'published',
    updatedAt: '2024-01-04T09:30:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/2.png&w=96&q=75'
  },
  {
    id: 'community-13',
    title: 'Support Ticket Analysis',
    status: 'published',
    updatedAt: '2024-01-03T14:20:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/3.png&w=96&q=75'
  },
  {
    id: 'community-14',
    title: 'Mobile App Feedback',
    status: 'published',
    updatedAt: '2024-01-02T11:10:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/4.png&w=96&q=75'
  },
  {
    id: 'community-15',
    title: 'Content Preference Study',
    status: 'published',
    updatedAt: '2024-01-01T16:00:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/5.png&w=96&q=75'
  },
  {
    id: 'community-16',
    title: 'Accessibility Survey',
    status: 'published',
    updatedAt: '2023-12-31T12:30:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/6.png&w=96&q=75'
  },
  {
    id: 'community-17',
    title: 'Performance Metrics',
    status: 'published',
    updatedAt: '2023-12-30T10:45:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/7.png&w=96&q=75'
  },
  {
    id: 'community-18',
    title: 'Security Awareness Check',
    status: 'published',
    updatedAt: '2023-12-29T15:20:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/8.png&w=96&q=75'
  },
  {
    id: 'community-19',
    title: 'Training Effectiveness',
    status: 'published',
    updatedAt: '2023-12-28T13:15:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/9.png&w=96&q=75'
  },
  {
    id: 'community-20',
    title: 'Innovation Ideas',
    status: 'published',
    updatedAt: '2023-12-27T11:30:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/10.png&w=96&q=75'
  },
  {
    id: 'community-21',
    title: 'Remote Work Survey',
    status: 'published',
    updatedAt: '2023-12-26T14:45:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/1.png&w=96&q=75'
  },
  {
    id: 'community-22',
    title: 'Digital Transformation',
    status: 'published',
    updatedAt: '2023-12-25T09:20:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/2.png&w=96&q=75'
  },
  {
    id: 'community-23',
    title: 'Sustainability Focus',
    status: 'published',
    updatedAt: '2023-12-24T16:10:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/3.png&w=96&q=75'
  },
  {
    id: 'community-24',
    title: 'Team Collaboration',
    status: 'published',
    updatedAt: '2023-12-23T12:40:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/4.png&w=96&q=75'
  },
  {
    id: 'community-25',
    title: 'Quality Assurance',
    status: 'published',
    updatedAt: '2023-12-22T15:25:00Z',
    userAvatar: 'https://endlesstools.io/_next/image?url=/embeds/avatars/5.png&w=96&q=75'
  }
];

// Component that handles search params
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading: authLoading } = useAuth();
  const { onlineUsers, subscribeToUserProjects } = useRealtime();
  const [isLabOpen, setIsLabOpen] = useState(false);
  const [isPlanUsageOpen, setIsPlanUsageOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [isFoldersOpen, setIsFoldersOpen] = useState(false);
  const [isRecentsOpen, setIsRecentsOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);

  // Check for chatbox highlight parameter
  useEffect(() => {
    const highlightChat = searchParams.get('highlightChat');
    if (highlightChat === 'true') {
      setChatboxGlow(true);
      // Remove the parameter from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('highlightChat');
      window.history.replaceState({}, '', url.toString());
      
      // Stop glow after 2 seconds (fade in + 2 seconds + fade out)
      setTimeout(() => {
        setChatboxGlow(false);
      }, 2000);
    }
  }, [searchParams]);
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
  const [chatboxGlow, setChatboxGlow] = useState(false);
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

    // Redirect to survey builder with the initial prompt
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      sessionStorage.setItem('surbee_initial_prompt', message.trim());
    } catch {}
    router.push(`/project/${projectId}`);
    return;

    // No longer needed since we're redirecting to project builder
  };

  const handleRemix = (projectId: string) => {
    console.log('Remix project:', projectId);
    // Create a new project based on the community project
    const newProjectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      sessionStorage.setItem('surbee_remix_project', projectId);
    } catch {}
    router.push(`/project/${newProjectId}`);
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

  // Show loading state only during initial auth loading
  if (authLoading) {
    return (
      <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
        <div className="flex flex-col h-full">
        {/* Only skeleton for main content area - no sidebar */}
        <div className="w-full max-w-2xl flex flex-col mx-auto flex-1 justify-center">
          {/* Greeting Text Skeleton */}
          <div className="text-center mb-4">
            <div className="skeleton-text mx-auto mb-6" style={{
              width: '350px',
              height: '3rem',
              borderRadius: '0.5rem',
              fontFamily: 'var(--font-inter), sans-serif'
            }}></div>
            <div className="skeleton-text mx-auto mb-4" style={{
              width: '500px',
              height: '1.5rem',
              borderRadius: '0.375rem',
              fontFamily: 'var(--font-inter), sans-serif'
            }}></div>
            <div className="skeleton-text mx-auto" style={{
              width: '400px',
              height: '1.5rem',
              borderRadius: '0.375rem',
              fontFamily: 'var(--font-inter), sans-serif'
            }}></div>
          </div>

          {/* Chat Input Skeleton */}
          <div className="mt-8 px-4">
            <div className="relative">
              <div className="skeleton-form-input" style={{
                height: '3rem',
                borderRadius: '0.75rem',
                marginBottom: '1rem',
                fontFamily: 'var(--font-inter), sans-serif'
              }}></div>

              {/* Quick Actions Skeleton */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton-base" style={{
                    width: '120px',
                    height: '2rem',
                    borderRadius: '1rem',
                    fontFamily: 'var(--font-inter), sans-serif'
                  }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      </ImageKitProvider>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
      <div className="relative flex flex-col h-full">
      {/* Content Area - Chat */}
      <div className="w-full max-w-2xl flex flex-col mx-auto flex-1" style={{ 
        height: '100%',
        justifyContent: hasStartedChat ? 'flex-start' : 'flex-start',
        paddingTop: hasStartedChat ? '0' : '17%',
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
                      fontFamily: 'var(--font-inter), sans-serif',
                      fontSize: '42px',
                      lineHeight: '40px',
                      fontWeight: 500,
                      letterSpacing: '-0.05em',
                      marginBottom: '0.5rem'
                    }}>
                      Let's get creative.
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
                            fontFamily: 'var(--font-inter), sans-serif',
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
                        <div className="text-left text-xs text-gray-400" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
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
                  shouldGlow={chatboxGlow}
                />
              </div>
      </div>

      {/* Community Examples Section - Outside constrained container */}
      <div className="relative w-full px-[10px] mt-80 pb-20">
        <h2 
          className="text-center mb-10"
          style={{
            fontFamily: 'var(--font-inter), sans-serif',
            fontSize: '24px',
            lineHeight: '28px',
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: 'rgb(235, 235, 235)'
          }}
        >
          Browse live community examples
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8 mb-6">
          {sampleCommunityProjects.slice(0, 10).map((project) => (
            <CommunityProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              status={project.status}
              updatedAt={project.updatedAt}
              userAvatar={project.userAvatar}
              previewImage={project.previewImage}
              onRemix={handleRemix}
            />
          ))}
        </div>
        
        <div className="text-center">
          <button 
            className="px-4 py-2 bg-white text-black text-sm rounded-md font-medium hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => {
              // Navigate to community page or show more cards
              console.log('See more community examples');
            }}
          >
            See more
          </button>
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
    </ImageKitProvider>
  );
}

// Main Dashboard component with Suspense boundary
export default function Dashboard() {
  return (
    <Suspense fallback={
      <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
        <div className="flex flex-col h-full">
          {/* Only skeleton for main content area - no sidebar */}
          <div className="w-full max-w-2xl flex flex-col mx-auto flex-1 justify-center">
            {/* Greeting Text Skeleton */}
            <div className="text-center mb-4">
              <div className="skeleton-text mx-auto mb-6" style={{
                width: '350px',
                height: '3rem',
                borderRadius: '0.5rem',
                fontFamily: 'var(--font-inter), sans-serif'
              }}></div>
              <div className="skeleton-text mx-auto mb-4" style={{
                width: '500px',
                height: '1.5rem',
                borderRadius: '0.375rem',
                fontFamily: 'var(--font-inter), sans-serif'
              }}></div>
              <div className="skeleton-text mx-auto" style={{
                width: '400px',
                height: '1.5rem',
                borderRadius: '0.375rem',
                fontFamily: 'var(--font-inter), sans-serif'
              }}></div>
            </div>

            {/* Chat Input Skeleton */}
            <div className="mt-8 px-4">
              <div className="relative">
                <div className="skeleton-form-input" style={{
                  height: '3rem',
                  borderRadius: '0.75rem',
                  marginBottom: '1rem',
                  fontFamily: 'var(--font-inter), sans-serif'
                }}></div>

                {/* Quick Actions Skeleton */}
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-base" style={{
                      width: '120px',
                      height: '2rem',
                      borderRadius: '1rem',
                      fontFamily: 'var(--font-inter), sans-serif'
                    }}></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ImageKitProvider>
    }>
      <DashboardContent />
    </Suspense>
  );
}
