"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useTheme } from '@/hooks/useTheme';
import { HelpCircle, Check, ChevronUp, ChevronDown, Gift, X, Copy, ArrowRight, ExternalLink, Settings as SettingsIcon, Sun, Moon, Laptop, MessageSquare, MoreHorizontal, Pencil, Trash2, Coins, Inbox, PanelLeftClose, PanelLeft } from "lucide-react";
import { useCredits } from '@/hooks/useCredits';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Helper function to format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  return `${diffMonths} month${diffMonths === 1 ? '' : 's'} ago`;
}

const SidebarItem = ({ 
  label, 
  isActive = false, 
  onClick,
  comingSoon = false,
  icon = null
}: {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  comingSoon?: boolean;
  icon?: 'arrow' | 'external' | 'chevron-down' | 'chevron-up' | null;
}) => (
  <div 
    className={`sidebar-item group ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    <span className="sidebar-item-label justify-between">
      <span>{label}</span>
      {comingSoon && (
        <span className="coming-soon-label">Coming Soon</span>
      )}
      {icon === 'arrow' && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />}
      {icon === 'external' && <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />}
      {icon === 'chevron-down' && <ChevronDown className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />}
      {icon === 'chevron-up' && <ChevronUp className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />}
    </span>
  </div>
);

interface DashboardSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function DashboardSidebar({ isCollapsed = false, onToggleCollapse }: DashboardSidebarProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [inboxTab, setInboxTab] = useState<'inbox' | 'whats-new'>('whats-new');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [renamingChatId, setRenamingChatId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<{ id: string; type: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user, userProfile } = useAuth();
  const { userPreferences } = useUserPreferences();
  const { theme, setTheme } = useTheme();
  const { credits, loading: creditsLoading, percentUsed } = useCredits();

  // Check if profile is set up (has name or profile picture)
  const isProfileComplete = useMemo(() => {
    const hasName = userPreferences?.displayName && userPreferences.displayName.trim() !== '';
    const hasPicture = user?.user_metadata?.picture || user?.user_metadata?.avatar_url;
    return hasName || hasPicture;
  }, [userPreferences?.displayName, user?.user_metadata?.picture, user?.user_metadata?.avatar_url]);

  // Calculate days until credits reset
  const daysUntilReset = useMemo(() => {
    if (!credits?.creditsResetAt) return null;
    const resetDate = new Date(credits.creditsResetAt);
    const now = new Date();
    const diffTime = resetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [credits?.creditsResetAt]);


  // Focus rename input when renaming
  useEffect(() => {
    if (renamingChatId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingChatId]);

  // Fetch announcements and notifications when inbox opens
  useEffect(() => {
    if (isInboxOpen) {
      // Fetch announcements
      fetch('/api/announcements')
        .then(res => res.json())
        .then(data => {
          if (data.announcements) {
            setAnnouncements(data.announcements);
          }
        })
        .catch(err => console.error('Failed to fetch announcements:', err));

      // Fetch notifications if user is logged in
      if (user?.id) {
        fetch(`/api/notifications?userId=${user.id}`)
          .then(res => res.json())
          .then(data => {
            if (data.notifications) {
              setNotifications(data.notifications);
              setUnreadCount(data.unreadCount || 0);
            }
          })
          .catch(err => console.error('Failed to fetch notifications:', err));
      }
    }
  }, [isInboxOpen, user?.id]);

  const handleDismissNotification = async (notificationId: string) => {
    if (!user?.id) return;
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, userId: user.id, action: 'dismiss' }),
      });
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to dismiss notification:', err);
    }
  };

  const handleNotificationAction = async (notification: any) => {
    if (!user?.id) return;
    // Mark as read
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: notification.id, userId: user.id, action: 'mark_read' }),
      });
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
    // Navigate if there's a link
    if (notification.link_url) {
      setIsInboxOpen(false);
      router.push(notification.link_url);
    }
  };

  const handleRenameChat = async (chatId: string, chatType: string) => {
    if (!renameValue.trim()) {
      setRenamingChatId(null);
      return;
    }
    
    try {
      if (chatType === 'dashboard') {
        await fetch('/api/dashboard/chat-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: chatId,
            userId: user?.id,
            title: renameValue.trim(),
          }),
        });
      } else {
        // For project chats, update the project title
        await fetch(`/api/projects/${chatId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: renameValue.trim() }),
        });
      }
      
      // Update local state
      setRecentChats(prev => prev.map(c => 
        c.id === chatId ? { ...c, title: renameValue.trim() } : c
      ));
    } catch (error) {
      console.error('Failed to rename chat:', error);
    }
    
    setRenamingChatId(null);
    setRenameValue('');
  };

  const openDeleteDialog = (chat: { id: string; type: string; title: string }) => {
    setChatToDelete(chat);
    setDeleteDialogOpen(true);
  };

  const handleDeleteChat = async () => {
    if (!chatToDelete) return;
    
    setIsDeleting(true);
    try {
      if (chatToDelete.type === 'dashboard') {
        await fetch(`/api/dashboard/chat-session?sessionId=${chatToDelete.id}`, {
          method: 'DELETE',
        });
      } else {
        await fetch(`/api/projects/${chatToDelete.id}`, {
          method: 'DELETE',
        });
      }
      
      // Remove from local state
      setRecentChats(prev => prev.filter(c => c.id !== chatToDelete.id));
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    } catch (error) {
      console.error('Failed to delete chat:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleChats = async () => {
    const newState = !isChatsOpen;
    setIsChatsOpen(newState);
    
    if (newState && recentChats.length === 0 && user?.id) {
      try {
        // Fetch more chats (20) so users can scroll through their history
        const res = await fetch(`/api/chats/recent?userId=${user.id}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setRecentChats(data.recentChats || []);
        }
      } catch (e) {
        console.error("Failed to fetch chats", e);
      }
    }
  };

  const handleSendFeedback = () => {
    if (feedbackText.trim()) {
      // TODO: Send feedback to backend
      console.log('Feedback:', feedbackText);
      setFeedbackText('');
      setIsFeedbackModalOpen(false);
      // Show success message
    }
  };

  const displayName = useMemo(() => {
    if (userProfile?.name) return userProfile.name;
    const email = user?.email ?? "";
    return email.split("@")[0] || "User";
  }, [user, userProfile]);

  const initialLetter = useMemo(() => (displayName?.[0]?.toUpperCase() || "U"), [displayName]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleProfileAction = (action: string) => {
    setIsUserMenuOpen(false);
    switch (action) {
      case 'settings':
        handleNavigation('/home/settings');
        break;
      case 'upgrade':
        handleNavigation('/home/pricing');
        break;
      case 'learn':
        console.log('Open learn more');
        break;
      case 'logout':
        signOut().then(() => {
          router.push('/login');
        });
        break;
    }
  };

  const logoSrc = "/logo.svg";

  // Subscription state
  const [subscription, setSubscription] = useState<{ plan: string; status: string } | null>(null);

  // Fetch subscription on mount
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user?.id) return;

      try {
        // Get session for auth token
        const { supabase } = await import('@/lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.access_token) {
          const res = await fetch('/api/user/subscription', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
            },
          });
          if (res.ok) {
            const data = await res.json();
            setSubscription(data.subscription);
          }
        }
      } catch (e) {
        console.error("Failed to fetch subscription", e);
      }
    };

    fetchSubscription();
  }, [user?.id]);

  // Get plan display name and class
  const planDisplayName = subscription?.plan
    ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
    : 'Free';
  const isPaidPlan = subscription?.plan === 'pro' || subscription?.plan === 'max';

  return (
    <div className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-container">
        {/* Top: Logo and Toggle */}
        <div className="profile-section">
          <div className="flex items-center justify-between w-full">
            {!isCollapsed && (
              <img
                src={logoSrc}
                alt="Surbee"
                className="dark:invert"
                style={{
                  height: 28,
                  width: 'auto',
                  borderRadius: 6,
                  objectFit: 'contain',
                  transition: 'filter 0.2s ease'
                }}
              />
            )}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="sidebar-toggle-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: '0.38rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--surbee-fg-muted)',
                  transition: 'background-color 0.15s ease-linear, color 0.15s ease-linear',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                  e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--surbee-fg-muted)';
                }}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <PanelLeft className="w-5 h-5" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className={`user-plan-text ${isPaidPlan ? 'pro' : ''}`}>{planDisplayName}</div>
          <SidebarItem
            label="Home"
            isActive={pathname === '/home' || pathname.startsWith('/home?')}
            onClick={() => router.push('/home')}
          />
          <SidebarItem
            label="Projects"
            isActive={pathname.startsWith('/projects')}
            onClick={() => handleNavigation('/projects')}
            icon="arrow"
          />
          {false && (
            <SidebarItem
              label="Knowledge Base"
              isActive={pathname.startsWith('/home/kb')}
              onClick={() => handleNavigation('/home/kb')}
            />
          )}
          <SidebarItem
            label="Community"
            isActive={pathname.startsWith('/marketplace')}
            onClick={() => handleNavigation('/marketplace')}
            icon="arrow"
          />
          
          <div className="sidebar-group">
            <SidebarItem
              label="Chats"
              isActive={isChatsOpen}
              onClick={toggleChats}
              icon={isChatsOpen ? 'chevron-up' : 'chevron-down'}
            />
            
            <AnimatePresence>
              {isChatsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pl-4 py-1 space-y-1">
                    <div 
                      className="text-xs text-zinc-400 hover:text-zinc-100 cursor-pointer py-1.5 px-2 rounded-md hover:bg-white/5 transition-colors truncate"
                      onClick={() => {
                        // Clear any chatId from URL and go to fresh home
                        router.push('/home');
                      }}
                    >
                      + New Chat
                    </div>
                    <div 
                      className="overflow-y-auto space-y-1 custom-scrollbar"
                      style={{ maxHeight: '150px' }}
                    >
                    {recentChats.map((chat) => (
                      <div 
                        key={chat.id}
                        className="group relative text-xs text-zinc-400 hover:text-zinc-100 cursor-pointer py-1.5 px-2 rounded-md hover:bg-white/5 transition-colors flex items-center gap-1.5"
                      >
                        {renamingChatId === chat.id ? (
                          <input
                            ref={renameInputRef}
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={() => handleRenameChat(chat.id, chat.type)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenameChat(chat.id, chat.type);
                              if (e.key === 'Escape') { setRenamingChatId(null); setRenameValue(''); }
                            }}
                            className="flex-1 bg-transparent border border-zinc-600 rounded px-1 py-0.5 text-xs text-zinc-100 outline-none focus:border-zinc-400"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <>
                            <div
                              className="flex-1 flex items-center gap-1.5 truncate"
                              onClick={() => {
                                if (chat.type === 'dashboard' && chat.chatId) {
                                  handleNavigation(`/home/chat/${chat.chatId}`);
                                } else if (chat.projectId) {
                                  handleNavigation(`/project/${chat.projectId}`);
                                }
                              }}
                              title={chat.title}
                            >
                              {chat.type === 'dashboard' && (
                                <MessageSquare className="w-3 h-3 opacity-50 flex-shrink-0" />
                              )}
                              <span className="truncate">{chat.title}</span>
                            </div>
                            
                            {/* 3-dot menu dropdown */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-all flex-shrink-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="w-3.5 h-3.5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="end"
                                side="bottom"
                                sideOffset={4}
                                style={{
                                  borderRadius: '12px',
                                  padding: '4px',
                                  border: '1px solid rgba(232, 232, 232, 0.08)',
                                  backgroundColor: 'rgb(19, 19, 20)',
                                  boxShadow: 'rgba(0, 0, 0, 0.2) 0px 8px 24px',
                                  minWidth: '140px',
                                }}
                              >
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  style={{ 
                                    borderRadius: '8px', 
                                    padding: '8px 12px', 
                                    color: 'var(--surbee-fg-primary)',
                                    fontSize: '13px',
                                  }}
                                  onSelect={() => {
                                    setRenameValue(chat.title);
                                    setRenamingChatId(chat.id);
                                  }}
                                >
                                  <div className="flex items-center gap-2">
                                    <Pencil className="w-3.5 h-3.5 opacity-60" />
                                    <span>Rename</span>
                                  </div>
                                </DropdownMenuItem>
<DropdownMenuItem
                                                  className="cursor-pointer"
                                                  style={{ 
                                                    borderRadius: '8px', 
                                                    padding: '8px 12px', 
                                                    color: '#ef4444',
                                                    fontSize: '13px',
                                                  }}
                                                  onSelect={() => openDeleteDialog({ id: chat.id, type: chat.type, title: chat.title })}
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                    <span>Delete</span>
                                                  </div>
                                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    ))}
                    {recentChats.length === 0 && (
                      <div className="text-xs text-zinc-500 py-1 px-2 italic">
                        No recent chats
                      </div>
                    )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <SidebarItem label="Get Help" onClick={() => {}} icon="external" />
        </nav>

        {/* Bottom account/settings trigger */}
        <div className="sidebar-bottom">
          <div className="flex items-center justify-between w-full">
            {/* Profile Picture Button */}
            <div
              className="sidebar-bottom-btn"
              onClick={() => setIsUserMenuOpen((v) => !v)}
            >
              <div
                className="profile-circle"
                style={{ width: 28, height: 28, overflow: 'hidden' }}
              >
                {user?.user_metadata?.picture ? (
                  <img
                    src={user.user_metadata.picture}
                    alt={displayName}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  initialLetter
                )}
              </div>
            </div>

            {/* Inbox/Notification Button */}
            <div
              className="sidebar-bottom-btn"
              onClick={() => setIsInboxOpen((v) => !v)}
            >
              <div className="relative flex items-center justify-center">
                <Inbox className="w-5 h-5" style={{ color: 'var(--surbee-fg-primary)' }} />
                {/* Notification badge - only show if there are unread notifications */}
                {unreadCount > 0 && (
                  <span
                    className="absolute flex items-center justify-center text-[10px] font-medium text-white"
                    style={{
                      top: -6,
                      right: -6,
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Overlay to close on outside click; high z-index */}
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
                role="menu"
              >
                {/* User info header */}
                <div className="user-menu-header-section">
                  <div className="user-menu-username">{displayName}</div>
                  <div className="user-menu-email">{user?.email || 'you@example.com'}</div>
                </div>

                {/* Credits Section */}
                <div className="flex flex-col gap-2 px-3 py-3" style={{ color: 'rgb(153, 153, 153)' }}>
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'var(--surbee-fg-muted)' }}>
                      <Coins className="w-3 h-3" />
                      Credits
                    </h5>
                    <span className="text-xs">
                      {creditsLoading ? (
                        <span style={{ color: 'var(--surbee-fg-secondary)' }}>Loading...</span>
                      ) : credits ? (
                        <>
                          <span style={{ color: 'var(--surbee-fg-muted)' }}>{credits.creditsRemaining.toLocaleString()}</span>
                          <span style={{ color: 'var(--surbee-fg-secondary)' }}> / {credits.monthlyCredits.toLocaleString()}</span>
                        </>
                      ) : (
                        <span style={{ color: 'var(--surbee-fg-secondary)' }}>--</span>
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
                          backgroundColor: percentUsed > 80 ? '#ef4444' : percentUsed > 50 ? '#eab308' : '#a855f7',
                          width: `${100 - percentUsed}%`,
                        }}
                      />
                    </div>
                  </div>
                  <p className="text-xs leading-4" style={{ color: 'var(--surbee-fg-secondary)' }}>
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
                              style={{ color: 'var(--surbee-fg-muted)' }}
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
                              style={{ color: 'var(--surbee-fg-muted)' }}
                            >
                              Upgrade
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </p>
                </div>

                {/* Set up profile button - only show if profile not complete */}
                {!isProfileComplete && (
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleNavigation('/home/settings/general'); }}
                    className="user-menu-setup-profile"
                  >
                    Set up profile
                  </button>
                )}

                {/* Settings */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/home/settings'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center gap-2">
                    <div className="user-menu-icon-circle">
                      <SettingsIcon className="h-4 w-4" />
                    </div>
                    <span>Settings</span>
                  </div>
                </button>

                {/* Theme selector */}
                <div className="user-menu-theme-section">
                  <div className="user-menu-theme-label">Theme</div>
                  <div className="user-menu-theme-toggle">
                    <button
                      className={`user-menu-theme-btn ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => setTheme('light')}
                      aria-label="Light theme"
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <button
                      className={`user-menu-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => setTheme('dark')}
                      aria-label="Dark theme"
                    >
                      <Moon className="h-4 w-4" />
                    </button>
                    <button
                      className={`user-menu-theme-btn ${theme === 'system' ? 'active' : ''}`}
                      onClick={() => setTheme('system')}
                      aria-label="System theme"
                    >
                      <Laptop className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Upgrade Plan - hide for max/enterprise users */}
                {credits?.plan !== 'max' && credits?.plan !== 'enterprise' && (
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleNavigation('/home/pricing'); }}
                    className="user-menu-item"
                  >
                    <span>Upgrade plan</span>
                  </button>
                )}

                {/* Changelog */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/changelog'); }}
                  className="user-menu-item"
                >
                  <span>Changelog</span>
                </button>

                {/* Give Feedback */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); setIsFeedbackModalOpen(true); }}
                  className="user-menu-item"
                >
                  <span>Give Feedback</span>
                </button>

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

          {/* Invite and Earn Modal */}
          {isInviteModalOpen && (
            <div className="invite-modal-overlay" onClick={() => setIsInviteModalOpen(false)}>
              <div className="invite-modal-content" onClick={(e) => e.stopPropagation()}>
                <button
                  className="invite-modal-close"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="invite-modal-layout">
                  <div className="invite-modal-text">
                    <h2 className="invite-modal-title">Inv<em>i</em>te and E<em>a</em>rn</h2>

                    <div className="invite-how-it-works">
                      <h3 className="invite-section-title">How it works:</h3>
                      <div className="invite-steps">
                        <div className="invite-step">• Share your unique invite link with friends</div>
                        <div className="invite-step">• They join Surbee and start creating</div>
                        <div className="invite-step">• You earn 5 credits when they publish their first project</div>
                      </div>
                    </div>

                    <button
                      className="invite-copy-button"
                      onClick={() => {
                        const inviteLink = `https://surbee.com/invite/${user?.id || 'demo'}`;
                        navigator.clipboard.writeText(inviteLink);
                        // TODO: Add toast notification
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </button>

                    <button
                      className="invite-terms-link"
                      onClick={() => {
                        setIsInviteModalOpen(false);
                        window.open('/terms', '_blank');
                      }}
                    >
                      View Terms and Conditions
                    </button>

                  </div>

                  <div className="invite-modal-image">
                    <img
                      src="https://github.com/Surbee001/webimg/blob/main/u7411232448_i_need_a_very_visble_heart_a_2d_heart._--ar_34_--pr_23edf17f-fb22-43b6-b589-c3e3d7c2d068.png?raw=true"
                      alt="Invite and Earn"
                      className="invite-heart-image"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Feedback Modal */}
          {isFeedbackModalOpen && (
            <>
              <div className="feedback-modal-overlay" onClick={() => setIsFeedbackModalOpen(false)} />
              <div className="feedback-modal-input-wrapper" onClick={(e) => e.stopPropagation()}>
                <div className="feedback-modal-textarea-container">
                  <textarea
                    className="feedback-modal-textarea"
                    placeholder="Share your thoughts, suggestions, or report issues..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    autoFocus
                  />
                </div>
                <button
                  className="feedback-modal-send-btn"
                  onClick={handleSendFeedback}
                  disabled={!feedbackText.trim()}
                >
                  Send
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Chat Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent
          className="sm:max-w-[400px] border-none"
          style={{
            backgroundColor: 'rgb(19, 19, 20)',
            borderRadius: '16px',
          }}
        >
          <DialogHeader>
            <DialogTitle 
              className="text-lg font-semibold"
              style={{ color: 'var(--surbee-fg-primary)' }}
            >
              Delete Chat
            </DialogTitle>
            <DialogDescription 
              className="text-sm mt-2"
              style={{ color: 'var(--surbee-fg-muted)' }}
            >
              Are you sure you want to delete{' '}
              <span className="font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                "{chatToDelete?.title}"
              </span>
              ? This action cannot be undone and will permanently remove the chat and all its messages.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 gap-3 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="flex-1 sm:flex-none cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(232, 232, 232, 0.12)',
                color: 'var(--surbee-fg-primary)',
                borderRadius: '10px',
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteChat}
              disabled={isDeleting}
              className="flex-1 sm:flex-none cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                borderRadius: '10px',
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Inbox Popup */}
      <AnimatePresence>
        {isInboxOpen && (
          <>
            <div
              className="inbox-popup-overlay"
              onClick={() => setIsInboxOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
              className="inbox-popup"
            >
              <div className="inbox-popup-inner">
                {/* Tab Container */}
                <div className="inbox-popup-tabs">
                  <div className="inbox-popup-tabs-container">
                    {/* Sliding Indicator */}
                    <div
                      className="inbox-popup-tabs-indicator"
                      style={{
                        left: inboxTab === 'inbox' ? 'calc(0% + 4px)' : 'calc(50% + 4px)',
                        width: 'calc(50% - 8px)',
                      }}
                    />
                    <div className="inbox-popup-tabs-buttons">
                      <button
                        className={`inbox-popup-tab ${inboxTab === 'inbox' ? 'active' : ''}`}
                        onClick={() => setInboxTab('inbox')}
                      >
                        Inbox{unreadCount > 0 ? ` (${unreadCount})` : ''}
                      </button>
                      <button
                        className={`inbox-popup-tab ${inboxTab === 'whats-new' ? 'active' : ''}`}
                        onClick={() => setInboxTab('whats-new')}
                      >
                        What&apos;s new
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className="inbox-popup-content">
                  {/* Inbox Tab */}
                  <div
                    className={`inbox-popup-scroll ${inboxTab === 'inbox' ? '' : 'hidden'}`}
                  >
                    <div className="inbox-popup-list">
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <Inbox className="w-10 h-10 mb-3 opacity-30" style={{ color: 'hsl(40 9% 75%)' }} />
                          <p className="text-sm" style={{ color: 'hsl(40 9% 75%)' }}>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div key={notification.id} className="inbox-notification-item">
                            <div className="inbox-notification-row">
                              <span className="inbox-notification-avatar">
                                <img
                                  src="/logo.svg"
                                  alt="Surbee"
                                  className="dark:invert"
                                />
                              </span>
                              <div className="inbox-notification-content">
                                <div className="inbox-notification-header">
                                  {!notification.is_read && <span className="inbox-notification-unread" />}
                                  <h3 className="inbox-notification-title">
                                    {notification.title}
                                  </h3>
                                </div>
                                {notification.description && (
                                  <p className="inbox-notification-desc">
                                    {notification.description}
                                  </p>
                                )}
                                <p className="inbox-notification-time">
                                  {formatRelativeTime(notification.created_at)}
                                </p>
                                <div className="inbox-notification-actions">
                                  <button
                                    className="inbox-action-btn secondary"
                                    onClick={() => handleDismissNotification(notification.id)}
                                  >
                                    Dismiss
                                  </button>
                                  {notification.link_url && (
                                    <button
                                      className="inbox-action-btn primary"
                                      onClick={() => handleNotificationAction(notification)}
                                    >
                                      {notification.type === 'welcome' ? 'Get Started' : 'View'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* What's New Tab */}
                  <div
                    className={`inbox-popup-scroll ${inboxTab === 'whats-new' ? '' : 'hidden'}`}
                  >
                    <div className="inbox-popup-news">
                      {announcements.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                          <Gift className="w-10 h-10 mb-3 opacity-30" style={{ color: 'hsl(40 9% 75%)' }} />
                          <p className="text-sm" style={{ color: 'hsl(40 9% 75%)' }}>No announcements yet</p>
                        </div>
                      ) : (
                        announcements.map((announcement, index) => (
                          announcement.is_featured || index === 0 ? (
                            // Featured News Item
                            <a
                              key={announcement.id}
                              className="inbox-news-item featured"
                              href={announcement.link_url || '/changelog'}
                              onClick={(e) => {
                                e.preventDefault();
                                setIsInboxOpen(false);
                                router.push(announcement.link_url || '/changelog');
                              }}
                            >
                              <div className="inbox-news-item-inner">
                                <div className="inbox-news-header">
                                  <h3 className="inbox-news-title">{announcement.title}</h3>
                                  <svg className="inbox-news-arrow" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.47 6.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H5a.75.75 0 0 1 0-1.5h12.19l-3.72-3.72a.75.75 0 0 1 0-1.06" />
                                  </svg>
                                </div>
                                <p className="inbox-news-desc">{announcement.description}</p>
                                {announcement.image_url && (
                                  <div className="inbox-news-image">
                                    <img src={announcement.image_url} alt={announcement.title} />
                                  </div>
                                )}
                                <span className="inbox-news-time">{formatRelativeTime(announcement.published_at)}</span>
                              </div>
                            </a>
                          ) : (
                            // Regular News Item
                            <div
                              key={announcement.id}
                              className="inbox-news-item"
                              onClick={() => {
                                if (announcement.link_url) {
                                  setIsInboxOpen(false);
                                  router.push(announcement.link_url);
                                }
                              }}
                            >
                              <div className="inbox-news-item-inner">
                                <div className="inbox-news-item-row">
                                  <div className="inbox-news-item-content">
                                    <div className="inbox-news-header">
                                      <h3 className="inbox-news-title">{announcement.title}</h3>
                                      <svg className="inbox-news-arrow" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.47 6.47a.75.75 0 0 1 1.06 0l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.72-3.72H5a.75.75 0 0 1 0-1.5h12.19l-3.72-3.72a.75.75 0 0 1 0-1.06" />
                                      </svg>
                                    </div>
                                    <p className="inbox-news-desc">{announcement.description}</p>
                                    <span className="inbox-news-time">{formatRelativeTime(announcement.published_at)}</span>
                                  </div>
                                  {announcement.image_url && (
                                    <div className="inbox-news-image">
                                      <img src={announcement.image_url} alt={announcement.title} />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
