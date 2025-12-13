"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export interface ReferenceItem {
  id: string;
  type: 'survey' | 'chat';
  title: string;
  description?: string;
  previewUrl?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReference?: (item: ReferenceItem) => void;
}

export function SearchModal({ isOpen, onClose, onSelectReference }: SearchModalProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [surveys, setSurveys] = useState<ReferenceItem[]>([]);
  const [chats, setChats] = useState<ReferenceItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch surveys and chats
  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      // Fetch surveys
      const surveysRes = await fetch(`/api/projects?userId=${user.id}`);
      if (surveysRes.ok) {
        const surveysData = await surveysRes.json();
        setSurveys((surveysData.projects || []).map((p: any) => ({
          id: p.id,
          type: 'survey' as const,
          title: p.title || 'Untitled Survey',
          description: new Date(p.updated_at || p.created_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          previewUrl: p.preview_image_url,
        })));
      }

      // Fetch chats
      const chatsRes = await fetch(`/api/chats/recent?limit=20`);
      if (chatsRes.ok) {
        const chatsData = await chatsRes.json();
        setChats((chatsData.recentChats || [])
          .filter((c: any) => c.type === 'dashboard')
          .map((c: any) => ({
            id: c.id,
            type: 'chat' as const,
            title: c.title || 'Untitled Chat',
            description: new Date(c.timestamp).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
          })));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      fetchData();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setSearchQuery("");
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, fetchData]);

  const handleSelectItem = (item: ReferenceItem) => {
    onSelectReference?.(item);
    onClose();
  };

  // Filter items based on search query
  const filteredSurveys = surveys.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredChats = chats.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!shouldRender) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.25)',
        opacity: isAnimating ? 1 : 0,
        transitionDuration: isAnimating ? '300ms' : '150ms',
      }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-[900px] max-h-[80vh] overflow-auto transition-all"
        style={{
          backgroundColor: 'rgb(19, 19, 20)',
          borderRadius: '40px',
          padding: '28px 36px 36px',
          boxShadow: '0 0 4px 0 rgba(0,0,0,0.04), 0 12px 32px 0 rgba(0,0,0,0.08)',
          opacity: isAnimating ? 1 : 0,
          transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
          transitionDuration: isAnimating ? '300ms' : '150ms',
          transitionTimingFunction: isAnimating ? 'cubic-bezier(0.16, 1, 0.3, 1)' : 'ease-out',
          scrollbarColor: 'rgba(232, 232, 232, 0.08) rgba(0, 0, 0, 0)',
          scrollbarWidth: 'thin',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-6 right-6 flex items-center justify-center w-9 h-9 rounded-full transition-colors"
          style={{ backgroundColor: 'rgba(232, 232, 232, 0.06)' }}
          onClick={onClose}
        >
          <X size={20} style={{ color: 'var(--surbee-fg-primary)' }} />
        </button>

        {/* Title */}
        <h2
          className="font-bold text-lg mb-5"
          style={{ color: 'var(--surbee-fg-primary)', lineHeight: 1.4 }}
        >
          Search
        </h2>

        {/* Search Input */}
        <div className="relative flex items-center mb-6">
          <svg
            className="absolute left-4 pointer-events-none"
            height="16"
            width="16"
            fill="currentColor"
            viewBox="0 0 16 16"
            style={{ color: 'rgba(232, 232, 232, 0.4)' }}
          >
            <path d="M1.719 6.484a5.35 5.35 0 0 0 5.344 5.344 5.3 5.3 0 0 0 3.107-1.004l3.294 3.301a.8.8 0 0 0 .57.228c.455 0 .77-.342.77-.79a.77.77 0 0 0-.221-.55L11.308 9.72a5.28 5.28 0 0 0 1.098-3.235 5.35 5.35 0 0 0-5.344-5.343A5.35 5.35 0 0 0 1.72 6.484m1.145 0a4.2 4.2 0 0 1 4.199-4.198 4.2 4.2 0 0 1 4.198 4.198 4.2 4.2 0 0 1-4.198 4.199 4.2 4.2 0 0 1-4.2-4.199" />
          </svg>
          <input
            type="text"
            className="w-full h-10 py-2 px-10 text-sm rounded-full transition-all duration-200"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid rgba(232, 232, 232, 0.15)',
              color: 'var(--surbee-fg-primary)',
            }}
            placeholder="Search surveys or chats"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        ) : (
          <>
            {/* Surveys Section */}
            {filteredSurveys.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(232, 232, 232, 0.4)' }}>
                  Surveys
                </p>
                <div className="space-y-0">
                  {filteredSurveys.map((item) => (
                    <article
                      key={`survey-${item.id}`}
                      onClick={() => handleSelectItem(item)}
                      className="relative cursor-pointer transition-colors duration-150 hover:bg-white/[0.04]"
                      style={{ padding: '16px 0' }}
                    >
                      <div className="flex gap-4">
                        {/* Preview thumbnail */}
                        <div 
                          className="flex-shrink-0 flex items-center justify-center"
                          style={{ width: '48px' }}
                        >
                          <div 
                            className="w-full rounded-lg overflow-hidden"
                            style={{ 
                              transform: 'rotate(2deg)',
                              backgroundColor: 'rgba(232, 232, 232, 0.06)',
                              padding: '8px',
                            }}
                          >
                            {item.previewUrl ? (
                              <img 
                                src={item.previewUrl} 
                                alt={item.title}
                                className="w-full h-auto rounded"
                                style={{ objectFit: 'contain' }}
                              />
                            ) : (
                              <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'rgba(232, 232, 232, 0.5)', margin: '0 auto', display: 'block' }}>
                                <path d="M6.08 5.5h3.85a.3.3 0 0 0 .3-.32.3.3 0 0 0-.3-.3H6.08a.3.3 0 0 0-.32.3c0 .18.13.32.32.32m0 1.77h3.85a.3.3 0 0 0 .3-.32.3.3 0 0 0-.3-.3H6.08a.3.3 0 0 0-.32.3c0 .18.13.32.32.32m0 1.77H7.9a.3.3 0 0 0 .31-.3.3.3 0 0 0-.31-.32H6.08a.3.3 0 0 0-.32.32c0 .17.13.3.32.3m-2.35 2.81c0 1.07.52 1.6 1.57 1.6h5.4c1.05 0 1.57-.53 1.57-1.6v-7.7c0-1.06-.52-1.6-1.57-1.6H5.3c-1.05 0-1.57.54-1.57 1.6zm.82-.01V4.17c0-.51.27-.8.8-.8h5.3c.53 0 .8.29.8.8v7.67c0 .5-.27.79-.8.79h-5.3c-.53 0-.8-.28-.8-.8Z" />
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden" style={{ maxWidth: '580px' }}>
                          <header style={{ marginBottom: '4px' }}>
                            <h3
                              className="font-bold text-sm"
                              style={{
                                color: 'var(--surbee-fg-primary)',
                                lineHeight: 1.4,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginBottom: '4px',
                              }}
                            >
                              {item.title}
                            </h3>
                            <p 
                              className="text-sm"
                              style={{ color: 'rgba(232, 232, 232, 0.5)' }}
                            >
                              Last modified <time>{item.description}</time>
                            </p>
                          </header>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Chats Section */}
            {filteredChats.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'rgba(232, 232, 232, 0.4)' }}>
                  Chats
                </p>
                <div className="space-y-0">
                  {filteredChats.map((item) => (
                    <article
                      key={`chat-${item.id}`}
                      onClick={() => handleSelectItem(item)}
                      className="relative cursor-pointer transition-colors duration-150 hover:bg-white/[0.04]"
                      style={{ padding: '16px 0' }}
                    >
                      <div className="flex gap-4">
                        {/* Preview thumbnail */}
                        <div 
                          className="flex-shrink-0 flex items-center justify-center"
                          style={{ width: '48px' }}
                        >
                          <div 
                            className="w-full rounded-lg overflow-hidden"
                            style={{ 
                              transform: 'rotate(-2deg)',
                              backgroundColor: 'rgba(232, 232, 232, 0.06)',
                              padding: '8px',
                            }}
                          >
                            <svg height="24" width="24" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'rgba(232, 232, 232, 0.5)', margin: '0 auto', display: 'block' }}>
                              <path d="M8 1C4.134 1 1 3.582 1 6.8c0 1.67.85 3.16 2.2 4.22v2.78a.8.8 0 001.3.62l2.08-1.67c.47.05.94.05 1.42.05 3.866 0 7-2.582 7-5.8S11.866 1 8 1z" />
                            </svg>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden" style={{ maxWidth: '580px' }}>
                          <header style={{ marginBottom: '4px' }}>
                            <h3
                              className="font-bold text-sm"
                              style={{
                                color: 'var(--surbee-fg-primary)',
                                lineHeight: 1.4,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginBottom: '4px',
                              }}
                            >
                              {item.title}
                            </h3>
                            <p 
                              className="text-sm"
                              style={{ color: 'rgba(232, 232, 232, 0.5)' }}
                            >
                              Last modified <time>{item.description}</time>
                            </p>
                          </header>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {filteredSurveys.length === 0 && filteredChats.length === 0 && (
              <div
                className="flex flex-col items-center justify-center py-12 text-center"
                style={{ color: 'rgba(232, 232, 232, 0.4)' }}
              >
                <svg height="48" width="48" fill="currentColor" viewBox="0 0 16 16" className="mb-4 opacity-30">
                  <path d="M1.719 6.484a5.35 5.35 0 0 0 5.344 5.344 5.3 5.3 0 0 0 3.107-1.004l3.294 3.301a.8.8 0 0 0 .57.228c.455 0 .77-.342.77-.79a.77.77 0 0 0-.221-.55L11.308 9.72a5.28 5.28 0 0 0 1.098-3.235 5.35 5.35 0 0 0-5.344-5.343A5.35 5.35 0 0 0 1.72 6.484m1.145 0a4.2 4.2 0 0 1 4.199-4.198 4.2 4.2 0 0 1 4.198 4.198 4.2 4.2 0 0 1-4.198 4.199 4.2 4.2 0 0 1-4.2-4.199" />
                </svg>
                <p className="text-sm">
                  {searchQuery ? 'No results found' : 'No surveys or chats yet'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
