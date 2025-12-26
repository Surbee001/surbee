"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Copy,
  Share,
  Settings,
  Archive,
  Trash2,
} from 'lucide-react';
import { ImageKitProvider } from '@imagekit/next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/database';
import { ProjectCard } from '@/components/project-card/ProjectCard';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';

interface ProjectWithStats extends Project {
  responseCount?: number;
  completionRate?: number;
  avgTimeToComplete?: number; // in minutes
  lastActivity?: Date;
  previewImage?: string;
  type?: string;
}


// Filter Dropdown Component using Shadcn
interface DropdownOption {
  value: string;
  label: string;
}

interface FilterDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select..."
}) => {
  const selectedOption = options.find(opt => opt.value === value);

  // Calculate width based on longest text
  const longestText = Math.max(
    ...options.map(opt => opt.label.length),
    placeholder.length
  );
  const dynamicWidth = Math.max(120, longestText * 8 + 60); // 8px per character + padding

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 h-9 py-1.5 px-4 text-sm font-normal transition-all duration-200 cursor-pointer rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)]"
          style={{
            color: 'var(--surbee-fg-primary)',
            fontFamily: 'var(--font-inter), sans-serif',
          }}
        >
          <span>{selectedOption?.label || placeholder}</span>
          <ChevronDown size={16} style={{ color: 'rgba(232, 232, 232, 0.4)' }} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        style={{
          borderRadius: '24px',
          padding: '8px',
          border: '1px solid rgba(232, 232, 232, 0.08)',
          backgroundColor: 'rgb(19, 19, 20)',
          boxShadow: 'rgba(0, 0, 0, 0.04) 0px 7px 16px',
          minWidth: `${dynamicWidth}px`,
        }}
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="cursor-pointer"
            style={{
              borderRadius: '18px',
              padding: '10px 14px',
              color: 'var(--surbee-fg-primary)',
              fontSize: '14px',
              marginBottom: '1px',
            }}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Info Icon Component
const InfoIcon: React.FC = () => (
  <span aria-labelledby="info-tooltip">
    <span>
      <svg
        className="h-4.5 w-4.5 text-grey-500 cursor-pointer"
        fill="none"
        viewBox="0 0 16 16"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          d="M2 5.6A3.6 3.6 0 0 1 5.6 2h4.8A3.6 3.6 0 0 1 14 5.6v4.8a3.6 3.6 0 0 1-3.6 3.6H5.6A3.6 3.6 0 0 1 2 10.4zm6.667-.933H7.334V6h1.333zm0 2.666H7.334v4h1.333z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </svg>
    </span>
  </span>
);


// Skeleton Loading Component - Matches ProjectCard structure exactly
const SkeletonCard: React.FC = () => (
  <div
    className="w-full p-[5px] rounded-[12px] relative border flex flex-col gap-[5px] h-full"
    style={{
      backgroundColor: 'var(--surbee-card-bg)',
      borderColor: 'transparent',
      boxSizing: 'border-box'
    }}
  >
    <div className="w-full flex justify-between">
      <div className="flex gap-[5px]">
        {/* Avatar skeleton */}
        <Skeleton className="w-[35px] h-[35px] rounded-[8px]" />
        <div className="text-sm flex flex-col justify-center h-[35px] gap-1">
          {/* Title skeleton */}
          <Skeleton className="h-3.5 w-24 rounded" />
          {/* Response count skeleton */}
          <Skeleton className="h-2.5 w-12 rounded" />
        </div>
      </div>
      {/* Edit button skeleton (hidden, matches hover state) */}
      <div className="w-[66px] h-[35px]" />
    </div>
    {/* Preview image skeleton */}
    <div className="w-full rounded-[8px] aspect-[210/119] mt-auto overflow-hidden">
      <Skeleton className="w-full h-full rounded-[8px]" />
    </div>
  </div>
);

const OldProjectCard: React.FC<{
  project: ProjectWithStats;
  onLike?: () => void;
  onSettings?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}> = ({ 
  project, 
  onLike, 
  onSettings, 
  onDuplicate, 
  onDelete, 
  onShare, 
  onArchive,
  isPinned,
  onTogglePin,
}: {
  project: ProjectWithStats;
  onLike?: () => void;
  onSettings?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/project/${project.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="text-neutral-200 space-y-3 group cursor-pointer">
      {/* Survey Preview Card */}
      <div
        className="relative bg-neutral-900 rounded-2xl overflow-hidden h-44 w-full border border-neutral-800"
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
      >
        <div className="absolute inset-0" style={{ background: 'var(--surbee-bg-primary)' }} />
      </div>
      
      {/* User Info and Actions Below Card */}
      <div className="flex items-start justify-between gap-3 relative group/actions">
        <div className="flex items-start gap-3">
          {/* User Profile Picture with Gradient */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"></div>
          
          {/* User Title and Last Edited */}
          <div className="flex-1">
            <p className="text-neutral-200 text-base font-semibold line-clamp-1">
              {project.title}
            </p>
            <p className="text-sm text-neutral-500">
              Last edited {formatDate(project.updated_at)}
            </p>
          </div>
        </div>
        
        {/* Status Badge and 3 Dots Menu */}
        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <span
            className="inline-block rounded-md px-2 py-0.5 text-xs font-medium"
            style={{
              backgroundColor: "hsl(217 33% 22%)",
              color: "hsl(209 100% 85%)",
            }}
          >
            {project.status === 'published' ? 'Published' : project.status === 'draft' ? 'Draft' : 'Archived'}
          </span>
          
          {/* 3 Dots Menu - Shows on Hover */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                onClick={(e) => e.stopPropagation()}
                className="opacity-0 group-hover/actions:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-neutral-800"
                aria-label="More options"
              >
                <MoreHorizontal className="text-neutral-400 size-5 hover:text-neutral-300 transition-colors duration-200" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate?.();
                }}
              >
                <Copy size={16} />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onShare?.();
                }}
              >
                <Share size={16} />
                <span>Share</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onSettings?.();
                }}
              >
                <Settings size={16} />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive?.();
                }}
              >
                <Archive size={16} />
                <span>Archive</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
                variant="destructive"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};



export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayedCount, setDisplayedCount] = useState(12); // Start with 12 items
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'responses'>('updated');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const itemsPerLoad = 8;

  // Dropdown options

  const sortOptions: DropdownOption[] = [
    { value: 'updated', label: 'Recent upload' },
    { value: 'created', label: 'Created Date' },
    { value: 'title', label: 'Name' },
    { value: 'responses', label: 'Responses' }
  ];

  // Fetch real projects from Supabase
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Get auth token
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          console.error('No auth session found');
          return;
        }

        const response = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        } else {
          console.error('Failed to fetch projects:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && !authLoading) {
      fetchProjects();
    }
  }, [user, authLoading]);

  // Load pinned projects from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('pinnedProjects');
      if (raw) setPinnedIds(JSON.parse(raw));
    } catch {}
  }, []);

  const togglePin = (id: string) => {
    setPinnedIds((prev) => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem('pinnedProjects', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const filteredProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sort projects
    filtered.sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id) ? 1 : 0;
      const bPinned = pinnedIds.includes(b.id) ? 1 : 0;
      if (aPinned !== bPinned) return bPinned - aPinned; // pinned first
      switch (sortBy) {
        case 'updated':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'responses':
          return (b.responseCount || 0) - (a.responseCount || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [projects, searchQuery, sortBy, pinnedIds]);

  // Get displayed projects (infinite scroll)
  const displayedProjects = useMemo(() => {
    return filteredProjects.slice(0, displayedCount);
  }, [filteredProjects, displayedCount]);

  const hasMore = displayedCount < filteredProjects.length;

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(12);
  }, [searchQuery, sortBy]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayedCount(prev => prev + itemsPerLoad);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore]);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCreateSurvey = async () => {
    if (!user) return;
    // Navigate to dashboard and trigger chatbox glow
    router.push('/home?highlightChat=true');
  };

  const handleRename = async (projectId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, userId: user?.id }),
      });
      if (response.ok) {
        setProjects(prev => prev.map(p =>
          p.id === projectId ? { ...p, title: newTitle } : p
        ));
      }
    } catch (error) {
      console.error('Failed to rename project:', error);
    }
  };

  const handleDuplicate = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      if (response.ok) {
        const data = await response.json();
        setProjects(prev => [data.project, ...prev]);
      }
    } catch (error) {
      console.error('Failed to duplicate project:', error);
    }
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    try {
      const response = await fetch(`/api/projects/${projectId}?userId=${user?.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const handleShare = (projectId: string) => {
    // Link is copied in the ProjectCard component
    console.log('Shared project:', projectId);
  };

  const handleArchive = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const newStatus = project?.status === 'archived' ? 'draft' : 'archived';
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, userId: user?.id }),
      });
      if (response.ok) {
        setProjects(prev => prev.map(p =>
          p.id === projectId ? { ...p, status: newStatus } : p
        ));
      }
    } catch (error) {
      console.error('Failed to archive project:', error);
    }
  };

  // Show loading state while authenticating
  if (authLoading || loading) {
    return (
      <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
        <div className="flex flex-col h-full">
        <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-[1280px] md:px-8">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h1 className="projects-title">Projects</h1>
              <div className="flex items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center">
                        <InfoIcon />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="start"
                      className="w-[280px] p-0 border-0 rounded-lg [&>svg]:!hidden [&>div>svg]:!hidden [&_svg]:!hidden"
                      style={{ backgroundColor: 'rgba(108, 108, 108, 0.8)' }}
                      sideOffset={8}
                      hideWhenDetached={false}
                    >
                      <div className="text-sm text-white p-3">
                        <p className="font-medium mb-2">Here you'll find all your projects.</p>
                        <p>To apply changes, rename, see more info, or view analytics, click on the <span className="font-medium">Edit</span> button that appears when you hover over a project card.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <button className="px-6 py-2.5 flex items-center justify-center gap-2 text-sm font-medium rounded-full border" style={{ backgroundColor: '#ffffff', color: '#000000', borderColor: '#e5e5e5', width: '164px' }}>
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Loading state filter section */}
          <div className="flex flex-row items-center justify-between mb-2">
            <div className="flex items-center h-9 rounded-full px-4 gap-2 w-[260px] bg-[rgba(255,255,255,0.05)] opacity-50">
                <Search size={16} style={{ color: 'rgba(232, 232, 232, 0.4)', flexShrink: 0 }} />
                <input
                  className="h-full w-full border-none bg-transparent outline-none text-sm"
                  placeholder="Search"
                  disabled
                  style={{
                    color: 'var(--surbee-fg-primary)',
                    fontFamily: 'var(--font-inter), sans-serif'
                  }}
                />
              </div>
            
            <div>
              <div className="flex items-center gap-x-3">
                <p className="text-subtitle3" style={{ color: 'var(--surbee-fg-primary)', fontWeight: 300 }}>Sort by</p>
                <div className="opacity-50">
                  <FilterDropdown
                    options={sortOptions}
                    value="updated"
                    onChange={() => {}}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gray-200/10 mb-6"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mt-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
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
      <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="projects-header">
        <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-[1280px] md:px-8">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <h1 className="projects-title">Projects</h1>
              <div className="flex items-center justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center">
                        <InfoIcon />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side="bottom"
                      align="start"
                      className="w-[280px] p-0 border-0 rounded-lg [&>svg]:!hidden [&>div>svg]:!hidden [&_svg]:!hidden"
                      style={{ backgroundColor: 'rgba(108, 108, 108, 0.8)' }}
                      sideOffset={8}
                      hideWhenDetached={false}
                    >
                      <div className="text-sm text-white p-3">
                        <p className="font-medium mb-2">Here you'll find all your projects.</p>
                        <p>To apply changes, rename, see more info, or view analytics, click on the <span className="font-medium">Edit</span> button that appears when you hover over a project card.</p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <button
              onClick={handleCreateSurvey}
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
              New Project
            </button>
          </div>

          {/* New Filter and Sort Section */}
          <div className="flex flex-row items-center justify-between mb-2">
            {/* Search Input */}
            <div className="flex items-center h-9 rounded-full px-4 gap-2 w-[260px] transition-all duration-200 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)]">
                <Search size={16} style={{ color: 'rgba(232, 232, 232, 0.4)', flexShrink: 0 }} />
                <input
                  className="h-full w-full border-none bg-transparent outline-none text-sm"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{
                    color: 'var(--surbee-fg-primary)',
                    fontFamily: 'var(--font-inter), sans-serif'
                  }}
                />
              </div>
            
            {/* Sort Dropdown */}
            <div>
              <div className="flex items-center gap-x-3">
                <p className="text-subtitle3" style={{ color: 'var(--surbee-fg-primary)', fontWeight: 300 }}>Sort by</p>
                <FilterDropdown
                  options={sortOptions}
                  value={sortBy}
                  onChange={(value) => setSortBy(value as any)}
                />
              </div>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full h-px" style={{ backgroundColor: 'var(--surbee-border-accent)' }}></div>
        </div>
      </div>

      {/* Scrollable Cards Section */}
      <div className="projects-cards-container">
        {/* Top Fade Effect */}
        <div className="projects-cards-fade"></div>
        
        <div className="projects-cards-content">
          <div className="mx-auto w-full max-w-[1280px] px-6 md:px-8">
          {/* Project Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {displayedProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                status={project.status}
                updatedAt={project.updated_at}
                previewImage={project.previewImage || project.preview_image_url}
                userAvatar={user?.user_metadata?.picture || user?.user_metadata?.avatar_url}
                responseCount={project.responseCount ?? 0}
                publishedUrl={project.published_url}
                activeChatSessionId={project.active_chat_session_id}
                onRename={handleRename}
                onDuplicate={() => handleDuplicate(project.id)}
                onDelete={() => handleDelete(project.id)}
                onShare={() => handleShare(project.id)}
                onArchive={() => handleArchive(project.id)}
              />
            ))}
          </div>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div
              ref={loadMoreRef}
              className="flex justify-center py-8"
            >
              <div className="animate-pulse text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
                Loading more...
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredProjects.length === 0 && !loading && (
            <div className="text-center py-20">
              <h3 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                No projects found
              </h3>
              <p className="text-[14px] mb-6" style={{ color: 'var(--surbee-fg-muted)' }}>
                {searchQuery
                  ? 'Try adjusting your search query' 
                  : 'Create your first project to get started'}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleCreateSurvey}
                  className="px-6 py-3 rounded-full text-[14px] font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--surbee-bg-secondary)',
                    color: 'var(--surbee-fg-primary)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-bg-secondary)'}
                >
                  Create Your First Project
                </button>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
      </div>
    </ImageKitProvider>
  );
}


