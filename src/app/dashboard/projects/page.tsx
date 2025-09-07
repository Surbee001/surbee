"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/database';
import { ProjectCard } from '@/components/project-card/ProjectCard';

interface ProjectWithStats extends Project {
  responseCount?: number;
  completionRate?: number;
  avgTimeToComplete?: number; // in minutes
  lastActivity?: Date;
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium border rounded-lg hover:bg-accent hover:text-accent-foreground min-w-[8rem]" 
                style={{ 
                  color: 'var(--surbee-fg-primary)', 
                  borderColor: 'var(--surbee-border-primary)' 
                }}>
          <span>{selectedOption?.label || placeholder}</span>
          <ChevronDown size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Skeleton Loading Component - Updated for new project card design
const SkeletonCard: React.FC = () => (
  <div className="project-card-container">
    {/* Survey Preview Card Skeleton */}
    <div className="project-card-preview-section">
      <div className="skeleton-image" style={{ height: '11rem', borderRadius: 'calc(0.5rem * 1.5)' }}></div>
    </div>
    
    {/* User Info and Actions Skeleton */}
    <div className="project-card-info-section">
      {/* User Avatar Skeleton */}
      <div className="project-card-avatar-wrapper">
        <div className="skeleton-circle" style={{ width: '2.25rem', height: '2.25rem' }}></div>
      </div>

      {/* Title, Status, and Actions Skeleton */}
      <div className="project-card-content-wrapper">
        <div className="project-card-text-section">
          {/* Title and Status Badge Skeleton */}
          <div className="project-card-title-row">
            <div className="skeleton-text" style={{ width: '60%', height: '1rem' }}></div>
            <div className="skeleton-badge"></div>
          </div>
          
          {/* Last Edited Skeleton */}
          <div className="project-card-meta-row" style={{ marginTop: '0.25rem' }}>
            <div className="skeleton-text" style={{ width: '40%', height: '0.75rem' }}></div>
          </div>
        </div>

        {/* 3 Dots Menu Skeleton */}
        <div className="skeleton-circle" style={{ width: '1.75rem', height: '1.75rem' }}></div>
      </div>
    </div>
  </div>
);

const OldProjectCard: any = ({ 
  project, 
  onLike, 
  onSettings, 
  onDuplicate, 
  onDelete, 
  onShare, 
  onArchive,
  isPinned,
  onTogglePin,
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
const sampleProjects = [
  {
    id: '1',
    title: 'Customer Satisfaction Survey 2024',
    user_id: 'user1',
    status: 'published' as const,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T14:30:00Z',
    responseCount: 247,
    type: 'Survey'
  },
  {
    id: '2',
    title: 'Employee Engagement Study',
    user_id: 'user1', 
    status: 'draft' as const,
    created_at: '2024-02-01T09:15:00Z',
    updated_at: '2024-02-05T11:45:00Z',
    responseCount: 89,
    type: 'Study'
  },
  {
    id: '3',
    title: 'Product Feedback Collection',
    user_id: 'user1',
    status: 'published' as const,
    created_at: '2024-01-28T16:20:00Z',
    updated_at: '2024-02-02T09:10:00Z',
    responseCount: 156,
    type: 'Feedback'
  },
  {
    id: '4',
    title: 'Brand Awareness Research',
    user_id: 'user1',
    status: 'published' as const,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-25T16:20:00Z',
    responseCount: 312,
    type: 'Survey'
  },
  {
    id: '5',
    title: 'User Experience Evaluation',
    user_id: 'user1',
    status: 'draft' as const,
    created_at: '2024-02-10T14:30:00Z',
    updated_at: '2024-02-12T10:15:00Z',
    responseCount: 45,
    type: 'Study'
  },
  {
    id: '6',
    title: 'Market Research Analysis',
    user_id: 'user1',
    status: 'published' as const,
    created_at: '2024-01-05T12:00:00Z',
    updated_at: '2024-01-30T09:45:00Z',
    responseCount: 198,
    type: 'Survey'
  },
  {
    id: '7',
    title: 'Customer Journey Mapping',
    user_id: 'user1',
    status: 'archived' as const,
    created_at: '2023-12-15T16:30:00Z',
    updated_at: '2024-01-05T14:20:00Z',
    responseCount: 87,
    type: 'Study'
  },
  {
    id: '8',
    title: 'Website Usability Test',
    user_id: 'user1',
    status: 'draft' as const,
    created_at: '2024-02-08T11:45:00Z',
    updated_at: '2024-02-10T08:30:00Z',
    responseCount: 23,
    type: 'Feedback'
  }
];

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [typeFilter, setTypeFilter] = useState<'Survey' | 'Study' | 'Feedback'>('Survey');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'responses'>('updated');
  const itemsPerPage = 8;

  // Dropdown options
  const typeOptions: DropdownOption[] = [
    { value: 'Survey', label: 'Survey' },
    { value: 'Study', label: 'Study' },
    { value: 'Feedback', label: 'Feedback' }
  ];

  const sortOptions: DropdownOption[] = [
    { value: 'updated', label: 'Last Modified' },
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
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      const matchesType = project.type === typeFilter;
      const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
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
  }, [projects, statusFilter, typeFilter, searchQuery, sortBy, pinnedIds]);

  // Pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const currentProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchQuery, sortBy]);

  const handleCreateSurvey = async () => {
    if (!user) return;
    router.push('/visual-builder');
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
      <div className="flex flex-col h-full">
        <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-[1280px] md:px-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="projects-title">Projects</h1>
            <button className="px-6 py-2.5 bg-white text-black flex items-center gap-2 text-sm font-medium" style={{ borderRadius: '0.38rem' }}>
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          <div className="flex items-center justify-between mb-4">
            <nav className="flex items-center">
              <ul className="flex items-center gap-6">
                <li><span className="text-lg font-medium">All</span></li>
                <li><span className="text-lg text-gray-500">Published</span></li>
                <li><span className="text-lg text-gray-500">Drafts</span></li>
                <li><span className="text-lg text-gray-500">Archived</span></li>
              </ul>
            </nav>
            <div className="flex items-center gap-4">
              <div className="search-input opacity-50">
                <Search className="w-4 h-4" />
              </div>
              <button className="filter-button opacity-50">
                <Filter className="w-4 h-4" />
                Filter
              </button>
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
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="projects-header">
        <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-[1280px] md:px-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="projects-title">Projects</h1>
            <button
              onClick={handleCreateSurvey}
              className="px-6 py-2.5 bg-white text-black flex items-center gap-2 text-sm font-medium transition-all hover:bg-gray-100"
              style={{ borderRadius: '0.38rem' }}
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            {/* Navigation Tabs */}
            <nav className="flex items-center">
              <ul className="flex items-center gap-6">
                <li>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`text-lg transition-colors hover:text-[var(--surbee-fg-primary)] cursor-pointer ${
                      statusFilter === 'all' 
                        ? 'text-[var(--surbee-fg-primary)] font-medium' 
                        : 'text-[var(--surbee-fg-muted)] font-normal'
                    }`}
                  >
                    All
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setStatusFilter('published')}
                    className={`text-lg transition-colors hover:text-[var(--surbee-fg-primary)] cursor-pointer ${
                      statusFilter === 'published' 
                        ? 'text-[var(--surbee-fg-primary)] font-medium' 
                        : 'text-[var(--surbee-fg-muted)] font-normal'
                    }`}
                  >
                    Published
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setStatusFilter('draft')}
                    className={`text-lg transition-colors hover:text-[var(--surbee-fg-primary)] cursor-pointer ${
                      statusFilter === 'draft' 
                        ? 'text-[var(--surbee-fg-primary)] font-medium' 
                        : 'text-[var(--surbee-fg-muted)] font-normal'
                    }`}
                  >
                    Drafts
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setStatusFilter('archived')}
                    className={`text-lg transition-colors hover:text-[var(--surbee-fg-primary)] cursor-pointer ${
                      statusFilter === 'archived' 
                        ? 'text-[var(--surbee-fg-primary)] font-medium' 
                        : 'text-[var(--surbee-fg-muted)] font-normal'
                    }`}
                  >
                    Archived
                  </button>
                </li>
              </ul>
            </nav>
            
            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surbee-input-placeholder)' }} />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input pl-10"
                />
              </div>
              <FilterDropdown
                options={typeOptions}
                value={typeFilter}
                onChange={(value) => setTypeFilter(value as any)}
              />
              <FilterDropdown
                options={sortOptions}
                value={sortBy}
                onChange={(value) => setSortBy(value as any)}
              />
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full h-px bg-gray-200/10"></div>
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
                {statusFilter !== 'all' || typeFilter !== 'all' || searchQuery
                  ? 'Try adjusting your filters or search query' 
                  : 'Create your first project to get started'}
              </p>
              {statusFilter === 'all' && typeFilter === 'all' && !searchQuery && (
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
  );
}


