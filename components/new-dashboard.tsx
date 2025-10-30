'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TreeView, type TreeNode } from '@/components/ui/tree-view';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  MoreHorizontal,
  FileText,
  Menu,
  Home,
  Inbox,
  BarChart3,
  BookOpen,
  Database,
  Upload,
  CheckSquare,
  Code,
  GraduationCap,
  TrendingUp,
  PenTool,
  Briefcase,
  ChevronDown,
  Settings,
  CreditCard,
  LogOut,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Bell,
  MessageSquare,
  Calendar,
  User,
  AlertCircle,
  Globe,
  Layout,
  ArrowUpRight,
  Download,
  FlaskConical,
  Pin,
  PinOff,
  Folder,
  ClipboardList,
  BarChart,
  Book,
  File,
} from 'lucide-react';
import { PromptBox } from './ui/chatgpt-prompt-input';
import ChatMessage from '@/components/survey-builder/chat-message';
import AssistantMessage from '@/components/survey-builder/assistant-message';
import ReactMarkdown from 'react-markdown';
import { TextShimmer } from './ui/text-shimmer';
import { Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AIAssistantInterface from './ai-assistant-interface';

interface Document {
  id: string;
  title: string;
  authors: string;
  added: string;
  viewed: string;
  fileType: string;
  summary: string;
  content: string;
  selected?: boolean;
}

interface Tab {
  id: string;
  title: string;
  type:
    | 'home'
    | 'inbox'
    | 'surveys'
    | 'analytics'
    | 'knowledge-base'
    | 'table'
    | 'document';
  document?: Document;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
}

interface NewDashboardProps {
  user?: {
    name?: string;
    email?: string;
    image?: string;
  };
  documents?: Document[];
  children?: React.ReactNode;
}

export default function NewDashboard({
  user,
  documents = [],
  children,
}: NewDashboardProps) {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [tabs, setTabs] = useState<Tab[]>([
    { id: 'home', title: 'Home', type: 'home' },
  ]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showKnowledgeTree, setShowKnowledgeTree] = useState(false);
  const [showInboxPanel, setShowInboxPanel] = useState(false);
  const [credits, setCredits] = useState(3);
  // Pin state for the entire sidemenu
  const [isMenuPinned, setIsMenuPinned] = useState(false);
  // Track which menu is open (for hover or pin)
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [menuJustOpened, setMenuJustOpened] = useState(false);
  // Notification center state for Home
  const [showNotifications, setShowNotifications] = useState(false);
  // File tree expanded state
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  // File tree search state
  const [fileTreeSearch, setFileTreeSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Prevent input blur on re-render
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFileTreeSearch(e.target.value);
  }

  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Survey Response Received',
      message: "New response to your 'Customer Satisfaction' survey",
      timestamp: '2 minutes ago',
      type: 'info',
      read: false,
    },
    {
      id: '2',
      title: 'Knowledge Base Updated',
      message: "Document 'Research Analysis.pdf' has been processed",
      timestamp: '1 hour ago',
      type: 'success',
      read: false,
    },
    {
      id: '3',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight from 2-4 AM EST',
      timestamp: '3 hours ago',
      type: 'warning',
      read: true,
    },
    {
      id: '4',
      title: 'Welcome to Surbee!',
      message: 'Complete your profile setup to get started',
      timestamp: '1 day ago',
      type: 'info',
      read: true,
    },
  ]);

  // Mock documents for now - will be replaced with real data
  const mockDocuments: Document[] =
    documents.length > 0
      ? documents
      : [
          {
            id: '1',
            title: 'Chronic inflammation and the hallmarks of aging.pdf',
            authors: 'Baechle, et al.',
            added: 'Yesterday',
            viewed: '22 hours ago',
            fileType: 'PDF',
            summary:
              'This review explores the interplay between chronic inflammation...',
            content: 'Full document content here...',
          },
          {
            id: '2',
            title:
              'Loss of epigenetic information as a cause of mammalian aging.docx',
            authors: 'Yang, et al.',
            added: '2 days ago',
            viewed: '1 day ago',
            fileType: 'DOCX',
            summary:
              'The study by Yang et al. demonstrates that loss of epigenetic...',
            content: 'Full document content here...',
          },
          {
            id: '3',
            title: 'Longevity research dataset.xlsx',
            authors: 'Research Team',
            added: '1 week ago',
            viewed: '3 days ago',
            fileType: 'XLSX',
            summary: 'Comprehensive dataset on longevity research findings...',
            content: 'Dataset content here...',
          },
        ];

  const knowledgeBaseData: TreeNode[] = [
    {
      id: 'kb-1',
      label: 'Research Documents',
      children: [
        { id: 'kb-1-1', label: 'Aging Research.pdf' },
        { id: 'kb-1-2', label: 'Longevity Studies.docx' },
        {
          id: 'kb-1-3',
          label: 'Clinical Trials',
          children: [
            { id: 'kb-1-3-1', label: 'Phase I Studies.pdf' },
            { id: 'kb-1-3-2', label: 'Phase II Results.docx' },
          ],
        },
      ],
    },
    {
      id: 'kb-2',
      label: 'Project Files',
      children: [
        { id: 'kb-2-1', label: 'Analysis Reports.xlsx' },
        { id: 'kb-2-2', label: 'Data Sets.csv' },
      ],
    },
  ];

  const openTab = (type: Tab['type'], title: string, document?: Document) => {
    const existingTab = tabs.find(
      (tab) =>
        tab.type === type && (!document || tab.document?.id === document?.id),
    );
    if (existingTab) {
      setActiveTab(existingTab.id);
      return;
    }

    const newTab: Tab = {
      id: document ? `doc-${document.id}` : type,
      title: document
        ? document.title.substring(0, 30) +
          (document.title.length > 30 ? '...' : '')
        : title,
      type,
      document,
    };
    setTabs([...tabs, newTab]);
    setActiveTab(newTab.id);
  };

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);
    if (activeTab === tabId) {
      setActiveTab(newTabs[newTabs.length - 1]?.id || 'home');
    }
  };

  const toggleLeftPanel = () => {
    setLeftPanelOpen(!leftPanelOpen);
  };

  const toggleInboxPanel = () => {
    setShowInboxPanel(!showInboxPanel);
    // Mark notifications as read when opening inbox
    if (!showInboxPanel) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const showRightPanel =
    activeTabData?.type === 'knowledge-base' ||
    activeTabData?.type === 'surveys';
  const showTabBar =
    activeTabData?.type === 'knowledge-base' ||
    activeTabData?.type === 'surveys';

  // Get user initials for avatar
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() || 'U';

  // Short, punchy greetings (max 3-4 words)
  const greetingMessages = [
    'Welcome to Surbee',
    'Let’s get started',
    'Ready for feedback?',
    'Design your survey',
    'Ask. Learn. Improve.',
    'Create. Share. Grow.',
    'Build something great',
    'Your ideas matter',
    'Start your journey',
    'Make it happen',
  ];
  const userName = user?.name?.split(' ')[0] || '';
  const greetingIndexRef = useRef<number>(
    Math.floor(Math.random() * greetingMessages.length),
  );
  const greetingMessage = `${greetingMessages[greetingIndexRef.current]}${userName ? `, ${userName}` : ''}`;

  // File tree data for Globe
  const fileTree = [
    {
      id: '1',
      label: 'Research',
      children: [
        { id: '1-1', label: 'Aging.pdf' },
        { id: '1-2', label: 'Longevity.docx' },
      ],
    },
    {
      id: '2',
      label: 'Projects',
      children: [
        { id: '2-1', label: 'Analysis.xlsx' },
        { id: '2-2', label: 'Data.csv' },
      ],
    },
  ];
  function toggleNode(id: string) {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }

  function filterTree(nodes: any[], search: string): any[] {
    if (!search) return nodes;
    return nodes
      .map((node: any) => {
        if (node.children) {
          const filteredChildren = filterTree(node.children, search);
          if (
            filteredChildren.length > 0 ||
            node.label.toLowerCase().includes(search.toLowerCase())
          ) {
            return { ...node, children: filteredChildren };
          }
        } else if (node.label.toLowerCase().includes(search.toLowerCase())) {
          return node;
        }
        return null;
      })
      .filter(Boolean);
  }

  function FileTree({ nodes }: { nodes: any[] }) {
    return (
      <ul className="pl-2">
        {nodes.map((node: any) => {
          const isExpanded = expandedNodes.has(node.id);
          return (
            <li key={node.id} className="mb-1">
              <div
                className="flex items-center text-gray-300 font-[Gambarino-Regular] cursor-pointer select-none"
                style={{
                  fontFamily: 'Gambarino-Regular, serif',
                  fontWeight: 700,
                }}
              >
                {node.children ? (
                  <span
                    onClick={() => toggleNode(node.id)}
                    className="transition-transform duration-200"
                  >
                    <ChevronRight
                      className={`w-3 h-3 mr-1 text-gray-500 inline-block transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </span>
                ) : (
                  <File className="w-4 h-4 mr-1" />
                )}
                {node.children ? <Folder className="w-4 h-4 mr-1" /> : null}
                {node.label}
              </div>
              {node.children && (
                <div
                  className={`dropdown-anim ${isExpanded ? 'dropdown-open' : 'dropdown-closed'}`}
                  style={{ willChange: 'height, opacity' }}
                >
                  {isExpanded && <FileTree nodes={node.children} />}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  }

  type MenuContentProps = {
    isPinned: boolean;
    onPin: () => void;
    showNotifications?: boolean;
    setShowNotifications?: (v: boolean) => void;
  };

  // SecondaryMenu component for the sliding menu
  function SecondaryMenu({
    menuId,
    children,
  }: { menuId: string; children: React.ReactNode }) {
    const isOpen = openMenu === menuId || (isMenuPinned && openMenu === menuId);
    return isOpen ? (
      <div
        className={`fixed left-16 z-50 flex group/secondary-menu ${menuJustOpened && !isMenuPinned ? 'animate-slide-in' : ''}`}
        style={{
          top: '0.5rem',
          height: 'calc(100vh - 1rem)',
          right: 'calc(100vw - 4rem - (showRightPanel ? 420 : 0)px - 0.5rem)',
        }}
        onMouseEnter={() => {
          if (!isMenuPinned) setOpenMenu(menuId);
        }}
        onMouseLeave={() => {
          if (!isMenuPinned) {
            setOpenMenu(null);
            setMenuJustOpened(false);
          }
        }}
      >
        <div
          className={`w-64 h-full bg-[#18191A] flex flex-col p-6 ${isMenuPinned ? '' : 'border-r border-[#232324]'}`}
          style={{
            background: '#18191A',
            color: '#F3F3F3',
            borderRight: isMenuPinned ? 'none' : '1px solid #232324',
          }}
        >
          {children}
        </div>
      </div>
    ) : null;
  }

  // SidebarButton now only controls which menu is open
  function SidebarButton({
    icon,
    label,
    menuId,
    onClick,
  }: {
    icon: React.ReactNode;
    label: string;
    menuId: string;
    onClick?: () => void;
  }) {
    const router = useRouter();
    const isOpen = openMenu === menuId || (isMenuPinned && openMenu === menuId);
    return (
      <div
        className="relative flex flex-col items-center w-full"
        onMouseEnter={() => {
          if (!openMenu) setMenuJustOpened(true);
          setOpenMenu(menuId);
        }}
        onClick={() => {
          if (onClick) {
            onClick();
          } else if (menuId === 'account') {
            router.push('/dashboard/account');
          } else if (isMenuPinned) {
            setOpenMenu(menuId);
          }
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          className="rounded-lg h-10 w-10 flex items-center justify-center"
        >
          {icon}
        </Button>
        <span className="text-[11px] text-gray-400 mt-1 mb-2 select-none pointer-events-none">
          {label}
        </span>
      </div>
    );
  }

  // Main content area width logic
  const secondaryMenuWidth = isMenuPinned ? 256 : 0; // 64*4 = 256px

  // Memoize filtered file tree to avoid remounting FileTree and losing input focus
  const filteredFileTree = filterTree(fileTree, fileTreeSearch);

  // Home chat state
  const [homeChatMessages, setHomeChatMessages] = useState<any[]>([]);
  const [homeChatInput, setHomeChatInput] = useState('');
  const [homeChatGenerating, setHomeChatGenerating] = useState(false);
  const homeChatContainerRef = useRef<HTMLDivElement>(null);
  // Track if the user has sent a message in the home chat
  const [homeChatStarted, setHomeChatStarted] = useState(false);
  // Track current AI phase and steps
  const [aiPhase, setAiPhase] = useState<
    'thinking' | 'searching' | 'brainstorming' | 'reading' | 'finished'
  >('thinking');
  const [aiSteps, setAiSteps] = useState<string[]>([]);
  const [currentUserPrompt, setCurrentUserPrompt] = useState('');

  useEffect(() => {
    if (activeTab === 'home' && homeChatContainerRef.current) {
      homeChatContainerRef.current.scrollTop =
        homeChatContainerRef.current.scrollHeight;
    }
  }, [homeChatMessages, activeTab]);

  async function sendHomeChatMessage(value: string) {
    if (!value.trim()) return;
    setHomeChatStarted(true);
    setHomeChatGenerating(true);
    setCurrentUserPrompt(value);

    // Set initial AI phase
    setAiPhase('thinking');
    setAiSteps(['Understanding the user query...']);

    const userMsg = {
      id: crypto.randomUUID(),
      role: 'user',
      content: value,
    };

    setHomeChatMessages((prev) => [...prev, userMsg]);
    setHomeChatInput('');

    // Simulate AI thinking process with steps
    setTimeout(() => {
      setAiPhase('searching');
      setAiSteps([
        'Understanding the user query...',
        'Searching for relevant information...',
        'Analyzing search results...',
      ]);
    }, 1000);

    setTimeout(() => {
      setAiPhase('reading');
      setAiSteps([
        'Understanding the user query...',
        'Searching for relevant information...',
        'Analyzing search results...',
        'Reading sources • 20',
      ]);
    }, 2000);

    setTimeout(() => {
      setAiPhase('finished');
      setAiSteps([
        'Understanding the user query...',
        'Searching for relevant information...',
        'Analyzing search results...',
        'Reading sources • 20',
        'Generating response...',
      ]);
    }, 3000);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'home-chat',
          message: {
            id: userMsg.id,
            role: 'user',
            parts: [{ type: 'text', text: value }],
          },
          selectedChatModel: 'chat-model-reasoning',
          selectedVisibilityType: 'private',
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.type === 'text-delta' || data.type === 'text') {
                    const aiResponse = {
                      id: crypto.randomUUID(),
                      role: 'assistant',
                      content: data.textDelta || data.text || '',
                      phase: 'answered',
                    };
                    setHomeChatMessages((prev) => [...prev, aiResponse]);
                  }
                } catch (e) {
                  /* ignore */
                }
              }
            }
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        const json = await res.json();
        const aiResponse = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: json.assistantMessage || 'Here is my response.',
          phase: 'answered',
        };
        setHomeChatMessages((prev) => [...prev, aiResponse]);
      }
    } catch (err) {
      // Use mock response instead of error message
      const mockResponses = [
        "Hello! I'm here to help you with any questions or tasks you might have. How can I assist you today?",
        "That's an interesting question! Let me think about that for a moment...",
        "I understand what you're asking. Here's what I can tell you about that topic.",
        "Thanks for sharing that with me. I'd be happy to help you explore this further.",
        "That's a great point! I think we can work together to find a solution.",
        'I appreciate you bringing this up. Let me provide some insights on this matter.',
        "Interesting perspective! Here's what I think about that...",
        "I'm glad you asked that question. Let me break this down for you.",
        "That's a complex topic, but I think I can help clarify some things.",
        "Thanks for the question! Here's my take on this...",
      ];

      const randomResponse =
        mockResponses[Math.floor(Math.random() * mockResponses.length)];

      const aiResponse = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: randomResponse,
        phase: 'answered',
      };
      setHomeChatMessages((prev) => [...prev, aiResponse]);
    } finally {
      setHomeChatGenerating(false);
    }
  }

  // Add a simple HomeAssistantMessage for home chat that does not use useBuilder
  function HomeAssistantMessage({ message }: { message: any }) {
    const { content, thoughtProcess, phase } = message;

    return (
      <div className="w-full py-4 font-dmsans">
        <div className="space-y-4 overflow-hidden">
          {/* Show the main content */}
          {content && (
            <div
              className="text-lg text-zinc-300 max-w-none"
              style={{ fontFamily: 'DM Sans, sans-serif' }}
            >
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-[#18191A] text-[#F3F3F3] flex flex-col font-dmsans overflow-hidden dark"
      style={{ background: '#18191A', color: '#F3F3F3' }}
    >
      {/* Top Header - REMOVED */}
      {/* <header className="h-12 bg-[#1a1a1a] flex items-center justify-between px-6 border-b border-[#2a2a2a]"> ... </header> */}

      <div className="flex flex-1 bg-[#18191A] relative overflow-hidden">
        {/* Sidebar */}
        <div className="w-16 bg-[#18191A] flex flex-col items-center py-4 space-y-4 relative z-30 h-full">
          {/* Sidebar Logo (white) */}
          <div className="mb-4 flex items-center justify-center w-full ml-2">
            <img
              src="/BEE Logo Surbee.svg"
              alt="Logo"
              className="h-8 w-8 filter invert brightness-200"
            />
          </div>
          {/* Sidebar Main Icons */}
          <div className="flex flex-col items-center space-y-4 flex-1 mt-4 ml-2">
            <SidebarButton
              icon={<Home className="w-5 h-5" />}
              label="Home"
              menuId="home"
            />
            <SidebarButton
              icon={<FlaskConical className="w-5 h-5" />}
              label="Lab"
              menuId="lab"
            />
            <SidebarButton
              icon={<Globe className="w-5 h-5" />}
              label="Globe"
              menuId="globe"
            />
          </div>
          {/* Sidebar User Icon at Bottom Left */}
          <div className="mt-auto mb-2 flex items-center justify-center w-full ml-2">
            <SidebarButton
              icon={<User className="w-5 h-5" />}
              label="Account"
              menuId="account"
            />
          </div>
        </div>
        {/* Secondary Menus - z-50 to ensure always above everything */}
        <SecondaryMenu menuId="home">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span
                className="font-[Gambarino-Regular] text-lg"
                style={{
                  fontFamily: 'Gambarino-Regular, serif',
                  fontWeight: 700,
                }}
              >
                Home
              </span>
              <button
                type="button"
                className="ml-2 p-1 text-gray-400 hover:text-white"
                onClick={() => setIsMenuPinned(!isMenuPinned)}
              >
                {isMenuPinned ? (
                  <PinOff className="w-4 h-4 fill-current" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex-1 transition-all duration-200">
              {!showNotifications ? (
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start mb-2 font-[Gambarino-Regular] text-base"
                  onClick={() => {
                    if (setShowNotifications) setShowNotifications(true);
                  }}
                >
                  <Bell className="w-4 h-4 mr-2" /> Notification Center
                </Button>
              ) : (
                <div
                  className={`fade-in-inbox ${showNotifications ? 'fade-in-inbox-active' : ''}`}
                >
                  <div className="font-semibold mb-2 font-[Gambarino-Regular]">
                    Notifications
                  </div>
                  <div className="text-gray-400 text-sm mb-4">
                    You have no new notifications.
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-start font-[Gambarino-Regular] text-base"
                    onClick={() => {
                      if (setShowNotifications) setShowNotifications(false);
                    }}
                  >
                    Back
                  </Button>
                </div>
              )}
            </div>
          </div>
        </SecondaryMenu>
        <SecondaryMenu menuId="lab">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span
                className="font-[Gambarino-Regular] text-lg"
                style={{
                  fontFamily: 'Gambarino-Regular, serif',
                  fontWeight: 700,
                }}
              >
                Lab
              </span>
              <button
                type="button"
                className="ml-2 p-1 text-gray-400 hover:text-white"
                onClick={() => setIsMenuPinned(!isMenuPinned)}
              >
                {isMenuPinned ? (
                  <PinOff className="w-4 h-4 fill-current" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start font-[Gambarino-Regular] text-base"
                onClick={() => router.push('/dashboard/projects')}
              >
                <Folder className="w-4 h-4 mr-2" /> Projects
              </Button>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start font-[Gambarino-Regular] text-base"
              >
                <ClipboardList className="w-4 h-4 mr-2" /> Surveys
              </Button>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start font-[Gambarino-Regular] text-base"
              >
                <BarChart className="w-4 h-4 mr-2" /> Analytics
              </Button>
            </div>
          </div>
        </SecondaryMenu>
        <SecondaryMenu menuId="globe">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span
                className="font-[Gambarino-Regular] text-lg"
                style={{
                  fontFamily: 'Gambarino-Regular, serif',
                  fontWeight: 700,
                }}
              >
                Globe
              </span>
              <button
                type="button"
                className="ml-2 p-1 text-gray-400 hover:text-white"
                onClick={() => setIsMenuPinned(!isMenuPinned)}
              >
                {isMenuPinned ? (
                  <PinOff className="w-4 h-4 fill-current" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </button>
            </div>
            <div className="mb-2 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={fileTreeSearch}
                onChange={handleSearchChange}
                placeholder="Search files..."
                className="w-full pl-8 pr-2 py-1 rounded bg-[#232323] text-white text-sm font-[Gambarino-Regular] border border-[#3a3a3a] focus:outline-none"
                style={{
                  fontFamily: 'Gambarino-Regular, serif',
                  fontWeight: 700,
                }}
                autoComplete="off"
              />
            </div>
            <div className="flex-1 overflow-y-auto mt-2">
              <FileTree nodes={filteredFileTree} />
            </div>
          </div>
        </SecondaryMenu>
        {/* Main Content Area - always dark */}
        <div
          className={`bg-[#232324] rounded-xl border border-zinc-800 m-2 overflow-hidden transition-all duration-150`}
          style={{
            width: showRightPanel
              ? `calc(100vw - 4rem - 420px)`
              : `calc(100vw - 4rem)`,
            marginLeft: `calc(1rem + ${isMenuPinned ? '256px' : '0px'})`,
            transition:
              'margin-left 0.15s cubic-bezier(0.4,0,0.2,1), width 0.15s cubic-bezier(0.4,0,0.2,1)',
            background: '#232324',
            borderColor: '#37373A',
          }}
        >
          {/* Tab Bar - always dark */}
          {showTabBar && (
            <div className="h-12 bg-[#232324] flex items-center px-4 border-b border-zinc-800 rounded-t-xl">
              <div className="flex items-center space-x-1">
                {tabs
                  .filter(
                    (tab) =>
                      tab.type === 'knowledge-base' || tab.type === 'surveys',
                  )
                  .map((tab) => (
                    <div
                      key={tab.id}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg cursor-pointer ${
                        activeTab === tab.id
                          ? 'bg-[#232324] text-white'
                          : 'text-gray-400 hover:text-white hover:bg-[#232324]'
                      }`}
                      onClick={() => setActiveTab(tab.id)}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-4 w-4 hover:bg-zinc-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.id);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {/* Content Area - always dark */}
          <div className="flex-1 flex items-center justify-center overflow-hidden bg-[#232324] text-[#F3F3F3]">
            {children ? (
              children
            ) : activeTabData?.type === 'home' ? (
              <div className="flex flex-1 flex-col">
                <AIAssistantInterface />
              </div>
            ) : activeTabData?.type === 'knowledge-base' ? (
              // Knowledge Base Table View (existing implementation)
              <div
                className="p-2 h-full overflow-auto"
                style={{
                  background: 'none',
                  border: 'none',
                  borderRadius: 0,
                  boxShadow: 'none',
                  margin: 0,
                  padding: 0,
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-white">
                    Knowledge Base
                  </h1>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      className="text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button className="bg-orange-400 hover:bg-orange-500 text-white">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search files..."
                      className="bg-[#1a1a1a] border-[#3a3a3a] text-white pl-10"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-gray-300 hover:text-white hover:bg-[#1a1a1a]"
                  >
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    Sort
                  </Button>
                </div>

                <Card className="bg-[#1f1f1f] border-[#3a3a3a]">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-gray-300 border-b border-[#3a3a3a]">
                      <div className="col-span-4">Title</div>
                      <div className="col-span-2">Authors</div>
                      <div className="col-span-2">Added</div>
                      <div className="col-span-2">Viewed</div>
                      <div className="col-span-2">File type</div>
                    </div>
                    {mockDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="grid grid-cols-12 gap-4 p-4 hover:bg-[#2a2a2a] transition-colors border-b border-[#3a3a3a] last:border-b-0 cursor-pointer"
                      >
                        <div className="col-span-4">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-white font-medium">
                              {doc.title}
                            </span>
                          </div>
                        </div>
                        <div className="col-span-2 text-gray-300">
                          {doc.authors}
                        </div>
                        <div className="col-span-2 text-gray-400">
                          {doc.added}
                        </div>
                        <div className="col-span-2 text-gray-400">
                          {doc.viewed || '-'}
                        </div>
                        <div className="col-span-2 text-gray-300">
                          {doc.fileType}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Other Pages
              <div
                className="flex items-center justify-center h-full"
                style={{ background: 'none', padding: 0 }}
              >
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-[#3a3a3a] rounded-full mx-auto flex items-center justify-center">
                    {activeTabData?.type === 'inbox' && (
                      <Inbox className="w-8 h-8 text-gray-300" />
                    )}
                    {activeTabData?.type === 'surveys' && (
                      <FileText className="w-8 h-8 text-gray-300" />
                    )}
                    {activeTabData?.type === 'analytics' && (
                      <BarChart3 className="w-8 h-8 text-gray-300" />
                    )}
                  </div>
                  <h1 className="text-2xl font-medium text-white capitalize">
                    {activeTabData?.type?.replace('-', ' ')}
                  </h1>
                  <p className="text-gray-400">
                    This section is under development
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Right Properties Panel - always dark */}
        {showRightPanel && (
          <div
            className="absolute right-0 top-0 h-full z-30 bg-[#232324] border-l border-zinc-600"
            style={{
              width: '420px',
              background: '#232324',
              borderColor: '#52525B',
              padding: 0,
            }}
          >
            <div
              className="flex flex-col h-full"
              style={{ background: 'none', padding: 0 }}
            >
              <div
                className="h-12 flex items-center justify-between px-0"
                style={{ background: 'none', padding: 0 }}
              >
                <div className="flex space-x-4">
                  <span className="text-sm font-medium text-gray-200">
                    Properties
                  </span>
                  <span className="text-sm text-gray-400">History</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-2 hover:bg-[#2a2a2a]"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-300" />
                </Button>
              </div>

              <div
                className="flex-1 space-y-6"
                style={{ background: 'none', padding: 0 }}
              >
                <div className="space-y-6">
                  <div>
                    <span className="text-sm text-gray-300 font-medium">
                      Current Page
                    </span>
                    <div className="mt-2">
                      <span className="text-sm text-gray-200">
                        {activeTabData?.title}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-300 font-medium">
                      Type
                    </span>
                    <div className="mt-2">
                      <span className="text-sm text-gray-200 capitalize">
                        {activeTabData?.type?.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <style jsx global>{`
@keyframes slide-in {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-slide-in { animation: slide-in 0.18s cubic-bezier(0.4,0,0.2,1); }
@keyframes fade-in-slow {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in-slow { animation: fade-in-slow 0.3s ease; opacity: 1 !important; }

.fade-in-inbox {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.25s cubic-bezier(0.4,0,0.2,1), transform 0.25s cubic-bezier(0.4,0,0.2,1);
  pointer-events: none;
}
.fade-in-inbox-active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.dropdown-anim {
  transition: max-height 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.25s cubic-bezier(0.4,0,0.2,1);
  overflow: hidden;
  max-height: 0;
  opacity: 0;
}
.dropdown-open {
  max-height: 500px;
  opacity: 1;
}
.dropdown-closed {
  max-height: 0;
  opacity: 0;
}
`}</style>
    </div>
  );
}
