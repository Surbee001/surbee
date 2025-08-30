"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus,
  Heart,
  MoreHorizontal,
  Settings,
  Search,
  Filter,
  Copy,
  Trash2,
  Share,
  Archive,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Users,
  Pin
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

interface ProjectWithStats extends Project {
  responseCount?: number;
  completionRate?: number;
  avgTimeToComplete?: number; // in minutes
  lastActivity?: Date;
}

interface ProjectCardProps {
  project: ProjectWithStats;
  onLike?: () => void;
  onSettings?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  onArchive?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
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

// Skeleton Loading Component
const SkeletonCard: React.FC = () => (
  <div className="skeleton-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-meta"></div>
      <div className="skeleton-actions">
        <div className="skeleton-indicators">
          <div className="skeleton-circle"></div>
          <div className="skeleton-circle"></div>
          <div className="skeleton-text"></div>
        </div>
        <div className="skeleton-action-btns">
          <div className="skeleton-action-btn"></div>
          <div className="skeleton-action-btn"></div>
        </div>
      </div>
    </div>
  </div>
);

const ProjectCard: React.FC<ProjectCardProps> = ({ 
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
  const [liked, setLiked] = useState(false);
  const router = useRouter();

  const handleLike = () => {
    setLiked(!liked);
    onLike?.();
  };

  const handleCardClick = () => {
    router.push(`/project/${project.id}`);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      Survey: '#6366f1',
      Study: '#f59e0b',
      Feedback: '#10b981',
      default: 'var(--surbee-accent-primary)'
    } as const;
    return (colors as any)[type] || colors.default;
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
    <>
      <div className="relative">
        <div
          className="project-card"
          role="button"
          tabIndex={0}
          onClick={handleCardClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCardClick();
            }
          }}
        >
          <div className="project-card-image" onClick={handleCardClick}>
            <div className="absolute inset-0" style={{ background: 'var(--surbee-bg-primary)' }} />
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-2 py-1 rounded-md border text-xs"
                style={{ background: 'var(--surbee-bg-secondary)', borderColor: 'var(--surbee-border-primary)', color: 'var(--surbee-fg-primary)' }}
              >
                <span>{project.type}</span>
              </div>
              <div
                className="flex items-center gap-1 px-2 py-1 rounded-md border text-xs"
                style={{ background: 'var(--surbee-bg-secondary)', borderColor: 'var(--surbee-border-primary)', color: 'var(--surbee-fg-primary)' }}
                title="Responses"
              >
                <Users className="w-3 h-3" />
                {project.responseCount || 0}
              </div>
            </div>
            {isPinned ? (
              <div className="absolute top-2 right-2 p-1 rounded-md border"
                   style={{ background: 'var(--surbee-bg-secondary)', borderColor: 'var(--surbee-border-primary)' }}>
                <Pin size={14} />
              </div>
            ) : null}
          </div>

          <div className="project-card-bottom">
            <div className="mb-3">
              <h3 className="project-card-title">
                {project.title}
              </h3>
            </div>
            
            <div className="project-card-meta">
              Last modified {formatDate(project.updated_at)}
            </div>
            
            <div className="project-card-actions">
              <div className="project-card-indicators flex-1 min-w-0 flex flex-wrap">
                <div className="project-card-indicator-circles">
                  <div 
                    className="project-indicator-circle" 
                    style={{ backgroundColor: project.status === 'published' ? '#10b981' : '#f59e0b' }}
                  >
                    <span className="text-xs text-white font-medium">
                      {project.status === 'published' ? '✓' : '•'}
                    </span>
                  </div>
                  <div 
                    className="project-indicator-circle" 
                    style={{ backgroundColor: '#6366f1' }}
                  >
                    <span className="text-xs text-white font-medium">
                      {project.type.charAt(0)}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full border text-[11px]"
                    style={{
                      background: 'var(--surbee-bg-primary)',
                      borderColor: 'var(--surbee-border-primary)',
                      color: 'var(--surbee-fg-primary)'
                    }}
                  >
                    {project.status === 'published' ? 'Published' : project.status === 'draft' ? 'Draft' : 'Archived'}
                  </span>
                  {/* Removed duplicate type pill at bottom to avoid duplication with header pill */}
                </div>
              </div>

              <div className="project-action-buttons shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onTogglePin?.(); }}
                  className={`project-action-btn ${isPinned ? 'text-[var(--surbee-fg-primary)]' : 'project-settings-btn'}`}
                  aria-label={isPinned ? 'Unpin' : 'Pin'}
                  title={isPinned ? 'Unpin' : 'Pin'}
                >
                  <Pin size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike();
                  }}
                  className={`project-action-btn project-heart-btn ${liked ? 'liked' : ''}`}
                  aria-label={liked ? 'Unlike' : 'Like'}
                >
                  <Heart
                    size={18}
                    fill={liked ? 'currentColor' : 'none'}
                  />
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      onClick={(e) => e.stopPropagation()}
                        className="project-action-btn project-settings-btn"
                        aria-label="More options"
                      >
                        <MoreHorizontal size={18} />
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
        </div>
      </div>
    </>
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
  const [typeFilter, setTypeFilter] = useState<'all' | 'Survey' | 'Study' | 'Feedback'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title' | 'responses'>('updated');
  const itemsPerPage = 8;

  // Dropdown options
  const typeOptions: DropdownOption[] = [
    { value: 'all', label: 'All Types' },
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

  // Mock data loading
  useEffect(() => {
    if (user) {
      setTimeout(() => {
        setProjects(sampleProjects);
        setLoading(false);
      }, 1000);
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
      const matchesType = typeFilter === 'all' || project.type === typeFilter;
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
                project={project}
                isPinned={pinnedIds.includes(project.id)}
                onTogglePin={() => togglePin(project.id)}
                onLike={() => console.log('Liked project:', project.id)}
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


