"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, Search, MoreHorizontal, Trash2, Pencil, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ChatSession {
  id: string;
  title: string;
  updated_at: string;
  created_at: string;
  is_starred: boolean;
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffDays / 365)}y ago`;
}

const ITEMS_PER_PAGE = 20;

export default function ChatsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const fetchSessions = useCallback(async (search: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '200',
        offset: '0',
        sort: 'updated',
      });
      if (search) params.set('search', search);

      const res = await fetch(`/api/dashboard/chat-sessions?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch chats:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchSessions(searchQuery);
  }, [user, fetchSessions, searchQuery]);

  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [searchQuery]);

  const displayedSessions = useMemo(() => {
    return sessions.slice(0, displayedCount);
  }, [sessions, displayedCount]);

  const hasMore = displayedCount < sessions.length;

  const handleNewChat = () => {
    router.push('/home');
  };

  const handleOpenChat = (id: string) => {
    router.push(`/home/chat/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/dashboard/chat-session?sessionId=${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s.id !== id));
      setTotal(prev => prev - 1);
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    try {
      await fetch('/api/dashboard/chat-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: id, title: newTitle.trim() }),
      });
      setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle.trim() } : s));
      setRenamingId(null);
    } catch (err) {
      console.error('Failed to rename chat:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-[1280px] md:px-8">
          <div className="flex items-center justify-between mb-1">
            <div className="h-10 w-32 rounded-lg" style={{ backgroundColor: 'var(--surbee-bg-secondary)' }} />
            <div className="h-10 w-36 rounded-full" style={{ backgroundColor: 'var(--surbee-bg-secondary)' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="projects-header">
        <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-[1280px] md:px-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="projects-title">Chats</h1>
            <button
              onClick={handleNewChat}
              className="px-6 py-2.5 flex items-center justify-center gap-2 text-sm font-medium transition-all rounded-full border cursor-pointer"
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                borderColor: '#e5e5e5',
                fontFamily: 'var(--font-inter), sans-serif',
                width: '164px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.borderColor = '#d4d4d4';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#e5e5e5';
              }}
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Search */}
          <div className="flex flex-row items-center justify-between mb-2">
            <div
              className="flex items-center h-9 rounded-full px-4 gap-2 w-[260px] transition-all duration-200"
              style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-bg)'}
            >
              <Search size={16} style={{ color: 'var(--surbee-fg-muted)', flexShrink: 0 }} />
              <input
                className="h-full w-full border-none bg-transparent outline-none text-sm"
                placeholder="Search chats"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  color: 'var(--surbee-fg-primary)',
                  fontFamily: 'var(--font-inter), sans-serif'
                }}
              />
            </div>
            <p className="text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
              {total} {total === 1 ? 'chat' : 'chats'}
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px" style={{ backgroundColor: 'var(--surbee-border-accent)' }} />
        </div>
      </div>

      {/* Scrollable Cards Section */}
      <div className="projects-cards-container">
        <div className="projects-cards-content">
          <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">
            {/* Chat Cards */}
            <div className="flex flex-col gap-2">
              {loading && sessions.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl px-4 py-3 animate-pulse"
                    style={{ backgroundColor: 'var(--surbee-card-bg)' }}
                  >
                    <div className="space-y-2">
                      <div className="h-4 w-48 rounded" style={{ backgroundColor: 'var(--surbee-bg-secondary)' }} />
                      <div className="h-3 w-24 rounded" style={{ backgroundColor: 'var(--surbee-bg-secondary)' }} />
                    </div>
                  </div>
                ))
              ) : displayedSessions.length === 0 ? (
                <div className="text-center py-20">
                  <h3 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                    {searchQuery ? 'No chats found' : 'No chats yet'}
                  </h3>
                  <p className="text-[14px] mb-6" style={{ color: 'var(--surbee-fg-muted)' }}>
                    {searchQuery
                      ? 'Try adjusting your search query'
                      : 'Start a conversation to see it here'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={handleNewChat}
                      className="px-6 py-3 rounded-full text-[14px] font-medium transition-colors"
                      style={{
                        backgroundColor: 'var(--surbee-bg-secondary)',
                        color: 'var(--surbee-fg-primary)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-bg-tertiary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-bg-secondary)'}
                    >
                      Start Your First Chat
                    </button>
                  )}
                </div>
              ) : (
                displayedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="group/chat flex items-center gap-3 rounded-xl px-4 py-3 cursor-pointer transition-colors"
                    style={{ backgroundColor: 'transparent' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => {
                      if (renamingId !== session.id) handleOpenChat(session.id);
                    }}
                  >
                    {/* Title & Time */}
                    <div className="flex-1 min-w-0">
                      {renamingId === session.id ? (
                        <input
                          autoFocus
                          className="w-full bg-transparent border-none outline-none text-sm font-medium"
                          style={{ color: 'var(--surbee-fg-primary)' }}
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename(session.id, renameValue);
                            if (e.key === 'Escape') setRenamingId(null);
                          }}
                          onBlur={() => handleRename(session.id, renameValue)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--surbee-fg-primary)' }}>
                          {session.title || 'Untitled Chat'}
                        </p>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: 'var(--surbee-fg-muted)' }}>
                        Last message {formatTimeAgo(session.updated_at)}
                      </p>
                    </div>

                    {/* Starred indicator */}
                    {session.is_starred && (
                      <Star className="w-3.5 h-3.5 flex-shrink-0 fill-current" style={{ color: '#f59e0b' }} />
                    )}

                    {/* Actions dropdown */}
                    <div className="opacity-0 group-hover/chat:opacity-100 transition-opacity flex-shrink-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-1.5 rounded-md transition-colors"
                            style={{ color: 'var(--surbee-fg-muted)' }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-bg-tertiary)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          style={{
                            borderRadius: '12px',
                            padding: '4px',
                            border: '1px solid var(--surbee-dropdown-border)',
                            backgroundColor: 'var(--surbee-dropdown-bg)',
                            backdropFilter: 'blur(12px)',
                            boxShadow: 'rgba(0, 0, 0, 0.2) 0px 7px 16px',
                            minWidth: '150px',
                          }}
                        >
                          <DropdownMenuItem
                            className="cursor-pointer"
                            style={{ borderRadius: '8px', padding: '8px 12px', color: 'var(--surbee-dropdown-text)' }}
                            onSelect={(e) => {
                              e.preventDefault();
                              setRenamingId(session.id);
                              setRenameValue(session.title || '');
                            }}
                          >
                            <Pencil className="w-3.5 h-3.5 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="cursor-pointer"
                            style={{ borderRadius: '8px', padding: '8px 12px', color: '#ef4444' }}
                            onSelect={() => handleDelete(session.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Show more button */}
            {hasMore && !loading && (
              <div className="flex justify-center py-6">
                <button
                  onClick={() => setDisplayedCount(prev => prev + ITEMS_PER_PAGE)}
                  className="px-6 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--surbee-bg-secondary)',
                    color: 'var(--surbee-fg-primary)',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-bg-secondary)'}
                >
                  Show more
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
