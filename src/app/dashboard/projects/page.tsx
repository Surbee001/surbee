"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
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
        <button className="flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium border rounded-xl transition-colors hover:bg-gray-800/50 cursor-pointer" 
                style={{ 
                  color: '#ffffff', 
                  backgroundColor: 'transparent',
                  borderColor: 'var(--surbee-border-accent)',
                  fontFamily: 'var(--font-inter), sans-serif',
                  width: `${dynamicWidth}px`
                }}>
          <span>{selectedOption?.label || placeholder}</span>
          <ChevronDown size={16} className="text-gray-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-xl border" style={{ borderColor: 'var(--surbee-border-accent)', backgroundColor: '#141414', width: `${dynamicWidth}px` }}>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="rounded-lg text-white hover:bg-gray-800 cursor-pointer"
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

// Skeleton Loading Component - Updated to match exact ProjectCard layout
const SkeletonCard: React.FC = () => (
  <div
    className="group w-full p-[5px] rounded-[12px] relative border flex flex-col gap-[5px] h-full"
    style={{ 
      backgroundColor: "#141414",
      borderColor: 'var(--surbee-border-accent)'
    }}
  >
    {/* Header with avatar, title, and edit button */}
    <div className="w-full flex justify-between">
      <div className="flex gap-[5px]">
        {/* User Avatar Skeleton */}
        <div 
          className="rounded-[8px] bg-gray-800 animate-pulse"
          style={{ height: '35px', width: '35px' }}
        />
        
        {/* Title and response count skeleton */}
        <div className="text-sm flex flex-col justify-center h-[35px] gap-1">
          <div 
            className="bg-gray-800 animate-pulse rounded"
            style={{ height: '14px', width: '120px' }}
          />
          <div className="flex items-center gap-1">
            <div 
              className="bg-gray-800 animate-pulse rounded"
              style={{ height: '12px', width: '12px' }}
            />
            <div 
              className="bg-gray-800 animate-pulse rounded"
              style={{ height: '12px', width: '30px' }}
            />
          </div>
        </div>
      </div>
      
      {/* Edit Button Skeleton */}
      <div
        className="w-[66px] h-[35px] bg-gray-800 animate-pulse rounded-lg"
      />
    </div>
    
    {/* Preview Image Skeleton */}
    <div className="w-full rounded-[8px] aspect-[210/119] mt-auto overflow-hidden">
      <div className="w-full h-full bg-gray-800 animate-pulse" />
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

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      if (totalPages > 1) rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} />
      </button>

      {getPageNumbers().map((pageNum, index) => (
        <button
          key={index}
          className={`pagination-btn ${pageNum === currentPage ? 'active' : ''}`}
          disabled={pageNum === '...'}
          onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
        >
          {pageNum}
        </button>
      ))}

      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// Sample project data with more entries for pagination
const sampleProjects: ProjectWithStats[] = [
  {
    id: '1',
    title: 'Customer Satisfaction Survey 2024',
    description: 'Annual customer satisfaction survey to measure service quality',
    user_id: 'user1',
    status: 'published' as const,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    responseCount: 247,
    type: 'Survey',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png'
  },
  {
    id: '2',
    title: 'Employee Engagement Study',
    description: 'Internal study to measure employee satisfaction and engagement',
    user_id: 'user1', 
    status: 'draft' as const,
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-05T11:45:00Z',
    responseCount: 89,
    type: 'Study',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png'
  },
  {
    id: '3',
    title: 'Product Feedback Collection',
    description: 'Gathering user feedback on new product features',
    user_id: 'user1',
    status: 'published' as const,
    created_at: '2024-01-28T16:20:00Z',
    updated_at: '2024-02-02T09:10:00Z',
    responseCount: 156,
    type: 'Feedback',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_abf323ce-3d0a-417d-8ce7-b307c8e84258.png'
  },
  {
    id: '4',
    title: 'Brand Awareness Research',
    description: 'Market research to measure brand recognition and awareness',
    user_id: 'user1',
    status: 'published' as const,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-25T16:20:00Z',
    responseCount: 312,
    type: 'Survey',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__423e2f06-d2d7-4c2c-bd7b-9aec2b6c1fbe.png'
  },
  {
    id: '5',
    title: 'User Experience Evaluation',
    description: 'UX study to improve product usability and user satisfaction',
    user_id: 'user1',
    status: 'draft' as const,
    created_at: '2024-02-10T14:30:00Z',
    updated_at: '2024-02-12T10:15:00Z',
    responseCount: 45,
    type: 'Study',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png'
  },
  {
    id: '6',
    title: 'Market Research Analysis',
    description: 'Comprehensive market analysis for strategic planning',
    user_id: 'user1',
    status: 'published' as const,
    created_at: '2024-01-05T12:00:00Z',
    updated_at: '2024-01-30T09:45:00Z',
    responseCount: 198,
    type: 'Survey',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png'
  },
  {
    id: '7',
    title: 'Customer Journey Mapping',
    description: 'Mapping customer touchpoints and experience journey',
    user_id: 'user1',
    status: 'archived' as const,
    created_at: '2023-12-15T16:30:00Z',
    updated_at: '2024-01-05T14:20:00Z',
    responseCount: 87,
    type: 'Study',
    previewImage: '/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_abf323ce-3d0a-417d-8ce7-b307c8e84258.png'
  },
  {
    id: '8',
    title: 'Website Usability Test',
    description: 'Testing website usability and navigation patterns',
    user_id: 'user1',
    status: 'draft' as const,
    created_at: '2024-02-08T11:45:00Z',
    updated_at: '2024-02-10T08:30:00Z',
    responseCount: 23,
    type: 'Feedback',
    previewImage: '/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__423e2f06-d2d7-4c2c-bd7b-9aec2b6c1fbe.png'
  }
];

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'responses'>('updated');
  const itemsPerPage = 8;

  // Dropdown options

  const sortOptions: DropdownOption[] = [
    { value: 'updated', label: 'Recent upload' },
    { value: 'created', label: 'Created Date' },
    { value: 'title', label: 'Name' },
    { value: 'responses', label: 'Responses' }
  ];

  // Only show loading on first visit, not on navigation
  useEffect(() => {
    if (user) {
      const hasLoaded = sessionStorage.getItem('dashboard_loaded');
      if (hasLoaded) {
        setProjects(sampleProjects);
        setLoading(false);
      } else {
        setTimeout(() => {
          setProjects(sampleProjects);
          setLoading(false);
          sessionStorage.setItem('dashboard_loaded', 'true');
        }, 1000);
      }
    }
  }, [user]);

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

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCreateSurvey = async () => {
    if (!user) return;
    // Navigate to dashboard and trigger chatbox glow
    router.push('/dashboard?highlightChat=true');
  };

  const handleDuplicate = (projectId: string) => {
    console.log('Duplicate project:', projectId);
    // Implementation for duplicating project
  };

  const handleDelete = (projectId: string) => {
    console.log('Delete project:', projectId);
    // Implementation for deleting project
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  const handleShare = (projectId: string) => {
    console.log('Share project:', projectId);
    // Implementation for sharing project
  };

  const handleArchive = (projectId: string) => {
    console.log('Archive project:', projectId);
    // Implementation for archiving project
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
                      className="max-w-xs p-0 border-0 rounded-lg [&>svg]:!hidden [&>div>svg]:!hidden [&_svg]:!hidden"
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
            <button className="px-6 py-2.5 bg-white text-black flex items-center gap-2 text-sm font-medium rounded-xl border" style={{ borderColor: 'var(--surbee-border-accent)' }}>
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Loading state filter section */}
          <div className="flex flex-row items-center justify-between mb-2">
            <div className="flex items-center border border-solid transition-colors text-global-text h-10 rounded-lg px-4 gap-1 border-grey-400 focus-within:border-global-text hover:border-grey-500 hover:focus-within:border-global-text w-[240px] opacity-50">
                <svg
                  className="flex-shrink-0 text-grey-500 h-5 w-5"
                  fill="none"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.4 3a.6.6 0 0 1 .6.6v.8a.6.6 0 0 1-.6.6H2.6a.6.6 0 0 1-.6-.6v-.8a.6.6 0 0 1 .6-.6zM11.4 7a.6.6 0 0 1 .6.6v.8a.6.6 0 0 1-.6.6H4.6a.6.6 0 0 1-.6-.6v-.8a.6.6 0 0 1 .6-.6zM9.4 11a.6.6 0 0 1 .6.6v.8a.6.6 0 0 1-.6.6H6.6a.6.6 0 0 1-.6-.6v-.8a.6.6 0 0 1 .6-.6z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  className="h-full w-full border-none bg-transparent outline-none read-only:select-all disabled:cursor-not-allowed text-global-text placeholder:text-grey-500 read-only:truncate text-body2"
                  placeholder="Filter by project name"
                  disabled
                  style={{
                    color: '#ffffff',
                    fontFamily: 'var(--font-inter), sans-serif'
                  }}
                />
              </div>
            
            <div>
              <div className="flex items-center gap-x-3">
                <p className="text-subtitle3" style={{ color: '#ffffff', fontWeight: 300 }}>Sort by</p>
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
                      className="max-w-xs p-0 border-0 rounded-lg [&>svg]:!hidden [&>div>svg]:!hidden [&_svg]:!hidden"
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
              className="px-6 py-2.5 bg-white text-black flex items-center gap-2 text-sm font-medium transition-all hover:bg-gray-100 rounded-xl border cursor-pointer"
              style={{ 
                borderColor: 'var(--surbee-border-accent)',
                fontFamily: 'var(--font-inter), sans-serif'
              }}
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* New Filter and Sort Section */}
          <div className="flex flex-row items-center justify-between mb-2">
            {/* Filter Input */}
            <div className="flex items-center border border-solid transition-colors text-global-text h-10 rounded-lg px-4 gap-1 border-grey-400 focus-within:border-global-text hover:border-grey-500 hover:focus-within:border-global-text w-[240px] cursor-pointer">
                <svg
                  className="flex-shrink-0 text-grey-500 h-5 w-5"
                  fill="none"
                  viewBox="0 0 16 16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.4 3a.6.6 0 0 1 .6.6v.8a.6.6 0 0 1-.6.6H2.6a.6.6 0 0 1-.6-.6v-.8a.6.6 0 0 1 .6-.6zM11.4 7a.6.6 0 0 1 .6.6v.8a.6.6 0 0 1-.6.6H4.6a.6.6 0 0 1-.6-.6v-.8a.6.6 0 0 1 .6-.6zM9.4 11a.6.6 0 0 1 .6.6v.8a.6.6 0 0 1-.6.6H6.6a.6.6 0 0 1-.6-.6v-.8a.6.6 0 0 1 .6-.6z"
                    fill="currentColor"
                  />
                </svg>
                <input
                  className="h-full w-full border-none bg-transparent outline-none read-only:select-all disabled:cursor-not-allowed text-global-text placeholder:text-grey-500 read-only:truncate text-body2"
                  placeholder="Filter by project name"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{
                    color: '#ffffff',
                    fontFamily: 'var(--font-inter), sans-serif'
                  }}
                />
              </div>
            
            {/* Sort Dropdown */}
            <div>
              <div className="flex items-center gap-x-3">
                <p className="text-subtitle3" style={{ color: '#ffffff', fontWeight: 300 }}>Sort by</p>
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
            {currentProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                status={project.status}
                updatedAt={project.updated_at}
                previewImage={project.previewImage}
                onSettings={() => console.log('Settings for project:', project.id)}
                onDuplicate={() => handleDuplicate(project.id)}
                onDelete={() => handleDelete(project.id)}
                onShare={() => handleShare(project.id)}
                onArchive={() => handleArchive(project.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

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
                  className="px-6 py-3 rounded-lg text-[14px] font-medium transition-colors"
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


