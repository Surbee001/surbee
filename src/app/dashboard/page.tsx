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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    age: '',
    heardFrom: '',
    usage: ''
  });

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

  // Check if onboarding is needed
  useEffect(() => {
    if (!user) return;

    // Show onboarding if userProfile is null or missing name
    if (!userProfile || !userProfile.name) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
      // Use session-stored greeting or generate new one
      const storedGreeting = sessionStorage.getItem('surbee_session_greeting');
      if (storedGreeting) {
        setGreeting(storedGreeting);
      } else {
        const newGreeting = generateGreeting(userProfile.name);
        sessionStorage.setItem('surbee_session_greeting', newGreeting);
        setGreeting(newGreeting);
      }
    }
  }, [user, userProfile]);

  // Handle onboarding completion
  const completeOnboarding = async () => {
    if (!user) return;

    const profile = {
      name: onboardingData.name,
      age: parseInt(onboardingData.age),
      interests: [onboardingData.usage],
      surveyPreference: (onboardingData.usage === 'work' ? 'fast' : 'research') as 'fast' | 'research'
    };

    try {
      // Save to localStorage via AuthContext (this is what controls the onboarding display)
      await updateUserProfile(profile);

      // Also save to database for persistence
      fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: onboardingData.name,
          age: parseInt(onboardingData.age),
          heardFrom: onboardingData.heardFrom,
          surveyPreference: profile.surveyPreference,
          interests: profile.interests
        })
      }).catch(err => console.error('Failed to save profile to database:', err));

      // Close onboarding and update greeting
      setShowOnboarding(false);
      const newGreeting = generateGreeting(profile.name);
      sessionStorage.setItem('surbee_session_greeting', newGreeting);
      setGreeting(newGreeting);
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

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

    // Redirect to survey builder with the initial prompt and selected model
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // DEBUG: Log what we're saving
    console.log('📝 SAVING TO SESSION STORAGE:');
    console.log('   - selectedModel:', selectedModel);
    console.log('   - images:', images?.length || 0, 'images');

    try {
      sessionStorage.setItem('surbee_initial_prompt', message.trim());
      sessionStorage.setItem('surbee_selected_model', selectedModel);

      // Save images if any were attached
      if (images && images.length > 0) {
        sessionStorage.setItem('surbee_initial_images', JSON.stringify(images));
        console.log('✅ Saved', images.length, 'images to sessionStorage');
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
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0" style={{
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(4px)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div className="relative w-full max-w-xl p-12 mx-4" style={{
            backgroundColor: 'var(--surbee-card-bg)',
            borderRadius: '19px',
            border: '1px solid var(--surbee-border-accent)',
            minHeight: '600px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {onboardingStep === 1 ? (
              <>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '20px' }}>
                  {/* Surbee Logo SVG */}
                  <img
                    src="/logo.svg"
                    alt="Surbee Logo"
                    style={{
                      width: '100px',
                      height: 'auto',
                      marginBottom: '16px',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      display: 'block'
                    }}
                  />
                  <h2 style={{
                    fontFamily: 'Kalice-Trial-Regular, sans-serif',
                    fontSize: '32px',
                    color: 'var(--surbee-fg-primary)',
                    marginBottom: '32px',
                    textAlign: 'center',
                    lineHeight: '1.2'
                  }}>Welcome to Surbee</h2>

                  <input
                    type="text"
                    value={onboardingData.name}
                    onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                    placeholder="Name"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'var(--surbee-bg-primary)',
                      border: '1px solid var(--surbee-border-accent)',
                      borderRadius: '12px',
                      color: 'var(--surbee-fg-primary)',
                      fontSize: '15px',
                      fontFamily: 'Suisse intl mono, monospace',
                      outline: 'none',
                      marginBottom: '14px'
                    }}
                  />

                  <input
                    type="number"
                    value={onboardingData.age}
                    onChange={(e) => setOnboardingData({ ...onboardingData, age: e.target.value })}
                    placeholder="Age"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'var(--surbee-bg-primary)',
                      border: '1px solid var(--surbee-border-accent)',
                      borderRadius: '12px',
                      color: 'var(--surbee-fg-primary)',
                      fontSize: '15px',
                      fontFamily: 'Suisse intl mono, monospace',
                      outline: 'none',
                      marginBottom: '14px'
                    }}
                  />

                  <input
                    type="text"
                    value={onboardingData.heardFrom}
                    onChange={(e) => setOnboardingData({ ...onboardingData, heardFrom: e.target.value })}
                    placeholder="Where did you hear about us"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      backgroundColor: 'var(--surbee-bg-primary)',
                      border: '1px solid var(--surbee-border-accent)',
                      borderRadius: '12px',
                      color: 'var(--surbee-fg-primary)',
                      fontSize: '15px',
                      fontFamily: 'Suisse intl mono, monospace',
                      outline: 'none',
                      marginBottom: '24px'
                    }}
                  />

                  <button
                    onClick={() => setOnboardingStep(2)}
                    disabled={!onboardingData.name || !onboardingData.age}
                    style={{
                      width: '100%',
                      padding: '14px',
                      backgroundColor: !onboardingData.name || !onboardingData.age ? '#444' : '#fff',
                      color: !onboardingData.name || !onboardingData.age ? '#888' : '#000',
                      border: 'none',
                      borderRadius: '999px',
                      fontSize: '15px',
                      fontWeight: 500,
                      cursor: !onboardingData.name || !onboardingData.age ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Continue
                  </button>
                </div>

                {/* Progress Bar - Single pill with fill */}
                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '120px',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '50%',
                      height: '100%',
                      backgroundColor: '#fff',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h2 style={{
                    fontFamily: 'Kalice-Trial-Regular, sans-serif',
                    fontSize: '32px',
                    color: 'var(--surbee-fg-primary)',
                    marginBottom: '48px',
                    textAlign: 'center',
                    lineHeight: '1.2'
                  }}>What will you use Surbee for?</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                    {['Work', 'Personal', 'Education'].map((option) => (
                      <button
                        key={option}
                        onClick={() => setOnboardingData({ ...onboardingData, usage: option.toLowerCase() })}
                        style={{
                          padding: '14px',
                          backgroundColor: onboardingData.usage === option.toLowerCase() ? '#fff' : 'var(--surbee-bg-primary)',
                          color: onboardingData.usage === option.toLowerCase() ? '#000' : 'var(--surbee-fg-primary)',
                          border: `1px solid ${onboardingData.usage === option.toLowerCase() ? '#fff' : 'var(--surbee-border-accent)'}`,
                          borderRadius: '12px',
                          fontSize: '15px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontFamily: 'Suisse intl mono, monospace'
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
                    <button
                      onClick={completeOnboarding}
                      disabled={!onboardingData.usage}
                      style={{
                        flex: 1,
                        padding: '14px',
                        backgroundColor: !onboardingData.usage ? '#444' : '#fff',
                        color: !onboardingData.usage ? '#888' : '#000',
                        border: 'none',
                        borderRadius: '999px',
                        fontSize: '15px',
                        fontWeight: 500,
                        cursor: !onboardingData.usage ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Get Started
                    </button>
                    <button
                      onClick={() => setOnboardingStep(1)}
                      style={{
                        flex: 1,
                        padding: '10px', // Reduced padding for text-like button
                        backgroundColor: 'transparent',
                        color: 'var(--surbee-fg-secondary)',
                        border: 'none', // No border for text button
                        borderRadius: '999px',
                        fontSize: '14px', // Slightly smaller font size
                        fontWeight: 400, // Regular weight for text button
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        marginTop: '10px' // Space between buttons
                      }}
                    >
                      Back
                    </button>
                  </div>
                </div>

                {/* Progress Bar - Single pill with fill */}
                <div style={{
                  marginTop: 'auto',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    width: '120px',
                    height: '4px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '999px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: '100%',
                      height: '100%',
                      backgroundColor: '#fff',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

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
                      color: 'var(--surbee-fg-primary)',
                      fontFamily: 'Kalice-Trial-Regular, sans-serif',
                      fontSize: '42px',
                      lineHeight: '40px',
                      fontWeight: 400,
                      letterSpacing: '-0.01em',
                      marginBottom: '0.5rem'
                    }}>
                      {greeting}
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
                            color: 'var(--surbee-fg-primary)',
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
                                  backgroundColor: 'var(--surbee-card-bg)',
                                  color: 'var(--surbee-fg-primary)',
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
                  showModelSelector={true}
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
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
