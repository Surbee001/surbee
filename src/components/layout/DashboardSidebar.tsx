"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { HelpCircle, Check, ChevronUp, ChevronDown, Gift, X, Copy, ArrowRight, ExternalLink, Settings as SettingsIcon, Sun, Moon, Laptop, MessageSquare, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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

export default function DashboardSidebar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isChatsOpen, setIsChatsOpen] = useState(false);
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
  const { theme, setTheme } = useTheme();


  // Focus rename input when renaming
  useEffect(() => {
    if (renamingChatId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingChatId]);

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
    setIsProfileOpen(false);
    switch (action) {
      case 'settings':
        handleNavigation('/dashboard/settings');
        break;
      case 'upgrade':
        handleNavigation('/dashboard/upgrade-plan');
        break;
      case 'learn':
        console.log('Open learn more');
        break;
      case 'logout':
        signOut().then(() => {
          router.push('/');
        });
        break;
    }
  };

  const logoSrc = "/logo.svg";

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-container">
        {/* Top Left: Surbee Logo (replaces profile toggle) */}
        <div className="profile-section">
          <div className="flex items-center justify-center w-full">
            <img
              src={logoSrc}
              alt="Surbee"
              className="dark:invert"
              style={{
                height: 40,
                width: 'auto',
                borderRadius: 8,
                objectFit: 'contain',
                transition: 'filter 0.2s ease'
              }}
            />
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="user-plan-text pro">Max</div>
          <SidebarItem
            label="Home"
            isActive={pathname === '/dashboard'}
            onClick={() => handleNavigation('/dashboard')}
          />
          <SidebarItem
            label="Projects"
            isActive={pathname.startsWith('/dashboard/projects')}
            onClick={() => handleNavigation('/dashboard/projects')}
            icon="arrow"
          />
          {false && (
            <SidebarItem
              label="Knowledge Base"
              isActive={pathname.startsWith('/dashboard/kb')}
              onClick={() => handleNavigation('/dashboard/kb')}
            />
          )}
          <SidebarItem
            label="Community"
            isActive={pathname.startsWith('/dashboard/marketplace')}
            onClick={() => handleNavigation('/dashboard/marketplace')}
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
                        // Clear any chatId from URL and go to fresh dashboard
                        router.push('/dashboard');
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
                                  handleNavigation(`/dashboard?chatId=${chat.chatId}`);
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
          <div className="sidebar-item" onClick={() => setIsUserMenuOpen((v) => !v)}>
            <span className="sidebar-item-label">
              <span className="flex items-center gap-2">
                <div className="profile-circle" style={{ width: 28, height: 28, overflow: 'hidden' }}>
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
                <span style={{ fontWeight: 600 }}>{displayName}</span>
              </span>
              {isUserMenuOpen ? <ChevronUp className="h-3 w-3" style={{ opacity: 0.6 }} /> : <ChevronDown className="h-3 w-3" style={{ opacity: 0.6 }} />}
            </span>
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

                {/* Set up profile button */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard/settings'); }}
                  className="user-menu-setup-profile"
                >
                  Set up profile
                </button>

                {/* Settings */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard/settings'); }}
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

                {/* Upgrade Plan */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard/pricing'); }}
                  className="user-menu-item"
                >
                  <span>Upgrade plan</span>
                </button>

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
    </div>
  );
}
