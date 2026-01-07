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
import { DashboardChatContainer } from '@/components/dashboard/DashboardChatContainer';
 

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


// Component that handles search params
function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userProfile, loading: authLoading, updateUserProfile } = useAuth();
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
  const [selectedModel, setSelectedModel] = useState<'gpt-5' | 'claude-haiku'>('gpt-5');
  const [greeting, setGreeting] = useState<string>("Let's get creative.");

  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Generate personalized greeting based on time of day
  const generateGreeting = (userName?: string) => {
    const hour = new Date().getHours();
    const firstName = userName?.split(' ')[0] || '';

    const morningGreetings = [
      `Good morning, ${firstName}.`,
      `Rise and shine, ${firstName}.`,
      `Early bird, ${firstName}.`,
      `Fresh start, ${firstName}.`,
    ];

    const afternoonGreetings = [
      `Good afternoon, ${firstName}.`,
      `Afternoon, ${firstName}.`,
      `Making moves, ${firstName}.`,
      `Midday momentum, ${firstName}.`,
      `Data awaits, ${firstName}.`,
    ];

    const eveningGreetings = [
      `Good evening, ${firstName}.`,
      `Evening, ${firstName}.`,
      `Night owl, ${firstName}.`,
      `Deep dive time, ${firstName}.`,
    ];

    const lateNightGreetings = [
      `Night owl, ${firstName}.`,
      `Still here, ${firstName}.`,
      `Late night ideas, ${firstName}.`,
      `Data never sleeps, ${firstName}.`,
    ];

    const neutralGreetings = [
      `Let's get creative, ${firstName}.`,
      `What's cooking, ${firstName}.`,
      `Time to create, ${firstName}.`,
    ];

    let pool: string[];
    if (hour >= 5 && hour < 12) pool = morningGreetings;
    else if (hour >= 12 && hour < 17) pool = afternoonGreetings;
    else if (hour >= 17 && hour < 22) pool = eveningGreetings;
    else if (hour >= 22 || hour < 5) pool = lateNightGreetings;
    else pool = neutralGreetings;

    return pool[Math.floor(Math.random() * pool.length)];
  };

  // Check if onboarding is needed - redirect to /onboarding if terms not accepted
  useEffect(() => {
    if (!user) return;

    // Redirect to onboarding if user hasn't accepted terms
    if (!userProfile?.acceptedTermsAt && !userProfile?.onboardingCompleted) {
      router.push('/onboarding');
      return;
    }

    // Use session-stored greeting or generate new one
    const storedGreeting = sessionStorage.getItem('surbee_session_greeting');
    if (storedGreeting) {
      setGreeting(storedGreeting);
    } else {
      const userName = userProfile?.name || user?.user_metadata?.name || user?.email?.split('@')[0];
      const newGreeting = generateGreeting(userName);
      sessionStorage.setItem('surbee_session_greeting', newGreeting);
      setGreeting(newGreeting);
    }
  }, [user, userProfile, router]);

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

  // FileUIPart type for AI SDK compatibility
  type FileUIPart = {
    type: 'file';
    filename: string;
    mediaType: string;
    url: string;
  };

  const handleSendMessage = async (message: string, files?: FileUIPart[]) => {
    if (!message.trim()) return;
    if (isInputDisabled) return;
    if (!user) return;

    // Generate chat session ID for new conversations
    let sessionId = currentChatSessionId;
    if (!sessionId) {
      sessionId = generateChatSessionId();
      setCurrentChatSessionId(sessionId);
    }

    // Redirect to survey builder with the initial prompt and selected model
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // DEBUG: Log what we're saving
    console.log('📝 SAVING TO SESSION STORAGE:');
    console.log('   - selectedModel:', selectedModel);
    console.log('   - files:', files?.length || 0, 'files');

    try {
      sessionStorage.setItem('surbee_initial_prompt', message.trim());
      sessionStorage.setItem('surbee_selected_model', selectedModel);

      // Save files if any were attached (in FileUIPart format)
      if (files && files.length > 0) {
        sessionStorage.setItem('surbee_initial_files', JSON.stringify(files));
        console.log('✅ Saved', files.length, 'files to sessionStorage (FileUIPart format)');
      }

      // DEBUG: Verify what was saved
      const savedModel = sessionStorage.getItem('surbee_selected_model');
      console.log('✅ VERIFIED SAVED MODEL:', savedModel);
    } catch {}
    router.push(`/project/${projectId}`);
    return;
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
        {/* Dashboard Chat Container - handles greeting, messages, and input */}
        {user && (
          <DashboardChatContainer
            userId={user.id}
            greeting={greeting}
          />
        )}
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
