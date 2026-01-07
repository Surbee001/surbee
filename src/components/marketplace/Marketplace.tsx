import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Compass,
  Flame,
  Gauge,
  Search,
  Sparkles,
  FileText,
  User,
  ChevronDown,
  Upload,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  communityCategories,
  communitySurveys,
  communityTemplates,
  trendingSurveys,
  trendingTemplates,
} from '@/lib/community/data';
import { CommunityCategoryCard } from '@/components/community/CommunityCategoryCard';
import { CommunityTemplateCard } from '@/components/community/CommunityTemplateCard';
import { CommunitySurveyCard } from '@/components/community/CommunitySurveyCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface MarketplaceProject {
  id: string;
  title: string;
  description: string | null;
  preview_image_url: string | null;
  published_url: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_template: boolean;
  remix_count: number;
  response_count: number;
  author_name?: string;
  author_avatar?: string;
}

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Trending', value: 'trending' },
  { label: 'New', value: 'new' },
  { label: 'Most Remixed', value: 'remixed' },
];

// Filter Dropdown Component (matches Projects page style)
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
  const longestText = Math.max(
    ...options.map(opt => opt.label.length),
    placeholder.length
  );
  const dynamicWidth = Math.max(120, longestText * 8 + 60);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-1.5 h-9 py-1.5 px-4 text-sm font-normal transition-all duration-200 cursor-pointer rounded-full"
          style={{
            color: 'var(--surbee-fg-primary)',
            fontFamily: 'var(--font-inter), sans-serif',
            backgroundColor: 'var(--surbee-sidebar-bg)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-bg)'}
        >
          <span>{selectedOption?.label || placeholder}</span>
          <ChevronDown size={16} style={{ color: 'var(--surbee-fg-muted)' }} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={4}
        style={{
          borderRadius: '24px',
          padding: '8px',
          border: '1px solid var(--surbee-dropdown-border)',
          backgroundColor: 'var(--surbee-dropdown-bg)',
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
              color: 'var(--surbee-dropdown-text)',
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



function FeaturedSlideshow({
  templates,
  onRemixTemplate
}: {
  templates: any[];
  onRemixTemplate: (id: string) => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Calculate total number of slides (each slide shows 3 cards)
  const totalSlides = Math.ceil(templates.length / 3);
  const maxSlides = Math.min(4, totalSlides); // Show up to 4 slides or total available

  // Auto-advance disabled as requested

  // Get templates for current slide
  const getCurrentTemplates = () => {
    const startIndex = currentSlide * 3;
    const currentTemplates = templates.slice(startIndex, startIndex + 3);
    console.log('Current slide templates:', currentSlide, currentTemplates.map(t => t.title));
    return currentTemplates;
  };

  // Get all templates for mobile grid (up to 12 cards for 4 slides)
  const getAllTemplates = () => {
    return templates.slice(0, 12);
  };

  // Handle dot click
  const handleDotClick = useCallback((slideIndex: number) => {
    setCurrentSlide(slideIndex);
  }, []);

  return (
    <div
      className="featured-slider_container__ndMOX"
      style={{ position: "relative", width: "100%" }}
    >
      <div
        className="featured-slider_sliderContainer__6bQkM"
        style={{
          position: "relative",
          display: "block",
          willChange: "transform",
        }}
      >
        <div
          className="featured-slider_slidesWrapper__OxR84"
          style={{
            position: "relative",
            width: "100%",
            minHeight: "200px",
            isolation: "isolate",
          }}
        >
          {/* Slide container */}
          <div
            key={currentSlide}
            className="featured-slider_slide__sji9b featured-slider_slideActive__UVuOd"
            style={{
              position: "relative",
              width: "100%",
            }}
          >
            <div
              className="featured-slider_slideContent__V0XaH"
              style={{
                gap: "12px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
              }}
            >
              {getCurrentTemplates().map((template, index) => (
                <ProjectStyleCard
                  key={`${template.id}-${currentSlide}`}
                  template={template}
                  onRemixTemplate={onRemixTemplate}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div
          className="featured-slider_dotNavigation__7Mr0F"
          style={{
            gap: "5px",
            position: "absolute",
            zIndex: 10,
            top: "-32px",
            right: "0px",
            display: "flex",
          }}
        >
          {Array.from({ length: maxSlides }, (_, index) => (
            <button
              key={index}
              className={`featured-slider_dot__vAqB5 ${
                currentSlide === index ? 'featured-slider_dotActive__Qmmpm' : ''
              }`}
              style={{
                border: "none",
                borderRadius: "8px",
                position: "relative",
                width: "5px",
                height: "5px",
                backgroundColor: currentSlide === index
                  ? "#fff"
                  : "rgb(from #fff r g b/40%)",
                cursor: "pointer",
              }}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>

      {/* Mobile Grid (hidden on desktop) */}
      <div
        className="featured-slider_mobileGrid__STVyM"
          style={{
            gap: "20px 12px",
            gridTemplateColumns: "repeat(2, 1fr)",
            display: "none",
          }}
      >
        {getAllTemplates().map((template, index) => (
          <ProjectStyleCard
            key={template.id}
            template={template}
            onRemixTemplate={onRemixTemplate}
          />
        ))}
      </div>
    </div>
  );
}

function ProjectStyleCard({
  template,
  onRemixTemplate,
  isTemplate = false
}: {
  template: any;
  onRemixTemplate: (id: string) => void;
  isTemplate?: boolean;
}) {
  const router = useRouter();

  // Determine the type based on template properties
  const getType = () => {
    if (isTemplate || template.is_template) return 'Template';
    if (template.category?.toLowerCase().includes('survey')) return 'Survey';
    return 'Survey';
  };

  const getButtonText = () => {
    const type = getType();
    if (type === 'Template') return 'Remix';
    return 'Try';
  };

  // Get response or remix count
  const count = template.remix_count || template.remixCount || template.response_count || template.responseCount || 0;
  const countLabel = isTemplate || template.is_template ? 'remixes' : 'responses';

  const handleRemix = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to project/[id] page with remix mode
    router.push(`/project/${template.id}?remix=true`);
  };

  const handleCardClick = () => {
    if (template.published_url) {
      window.open(template.published_url, '_blank');
    } else {
      router.push(`/project/${template.id}?remix=true`);
    }
  };

  return (
    <div
      className="group w-full p-[2px] rounded-[12px] relative border flex flex-col gap-[5px] h-full"
      style={{
        cursor: "pointer",
        backgroundColor: 'var(--surbee-card-bg)',
        borderColor: 'transparent',
        boxSizing: 'border-box'
      }}
      onClick={handleCardClick}
      onMouseEnter={(e) => {
        const isDark = document.documentElement.classList.contains('dark');
        e.currentTarget.style.borderColor = isDark ? '#f8f8f8' : '#000000';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      <div className="w-full flex justify-between">
        <div className="flex gap-[5px]">
          <img
            className="rounded-[8px]"
            height={42}
            width={42}
            src={template.author_avatar || "https://endlesstools.io/_next/image?url=/embeds/avatars/4.png&w=96&q=75"}
            alt="User avatar"
          />
          <div className="text-sm flex flex-col justify-center h-[42px]">
            <p className="font-medium truncate max-w-[140px]" style={{ color: 'var(--surbee-fg-primary)' }} title={template.title}>
              {template.title}
            </p>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--surbee-fg-secondary)' }}>
              <User className="w-3 h-3" />
              <span>{count} {countLabel}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleRemix}
          className="w-[70px] h-[42px] bg-white text-black opacity-0 group-hover:opacity-100 group-hover:border-[#f8f8f8] group-hover:pointer-events-auto text-sm rounded-lg flex items-center justify-center font-medium cursor-pointer pointer-events-auto hover:bg-gray-100 transition-colors"
          style={{ border: '1px solid var(--surbee-border-accent)' }}
        >
          {getButtonText()}
        </button>
      </div>
      <div className="w-full rounded-[8px] aspect-[210/130] mt-auto overflow-hidden">
        <img
          src={template.preview_image_url || template.previewImage || "https://endlesstools.io/embeds/4.png"}
          alt={template.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://endlesstools.io/embeds/4.png";
          }}
        />
      </div>
    </div>
  );
}

function TemplatesGridSection({
  templates,
  onRemixTemplate
}: {
  templates: any[];
  onRemixTemplate: (id: string) => void;
}) {
  // Show first 8 templates in a 4x2 grid
  const displayTemplates = templates.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="products-section_headerHeading__hSnK_" style={{ fontSize: '20px' }}>
          Templates
        </h2>
        <a
          className="products-section_experimentalCta__OdkJr text-label"
          href="#"
          style={{
            color: '#7F7F7F',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#7F7F7F';
          }}
        >
          See All
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {displayTemplates.map((template, index) => (
          <ProjectStyleCard
            key={template.id}
            template={template}
            onRemixTemplate={onRemixTemplate}
          />
        ))}
      </div>
    </div>
  );
}

function SurveysGridSection({
  surveys,
  onTakeSurvey
}: {
  surveys: any[];
  onTakeSurvey: (id: string) => void;
}) {
  // Show first 8 surveys in a 4x2 grid
  const displaySurveys = surveys.slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="products-section_headerHeading__hSnK_" style={{ fontSize: '20px' }}>
          Surveys
        </h2>
        <a
          className="products-section_experimentalCta__OdkJr text-label"
          href="#"
          style={{
            color: '#7F7F7F',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'none',
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#7F7F7F';
          }}
        >
          See All
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {displaySurveys.map((survey, index) => (
          <ProjectStyleCard
            key={survey.id}
            template={survey}
            onRemixTemplate={onTakeSurvey}
          />
        ))}
      </div>
    </div>
  );
}

const sortOptions: DropdownOption[] = [
  { value: 'recent', label: 'Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'remixed', label: 'Most Remixed' },
  { value: 'title', label: 'Name' },
];

export default function Marketplace() {
  const router = useRouter();
  const { user } = useAuth();
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string>('recent');
  const [publishedProjects, setPublishedProjects] = useState<MarketplaceProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch published projects from the database
  useEffect(() => {
    const fetchPublishedProjects = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/marketplace/projects');
        if (response.ok) {
          const data = await response.json();
          setPublishedProjects(data.projects || []);
        }
      } catch (error) {
        console.error('Failed to fetch marketplace projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedProjects();
  }, []);

  const normalize = (value: string) => value.toLowerCase();
  const query = normalize(searchQuery);

  // Filter and sort published projects
  const filteredProjects = useMemo(() => {
    let filtered = publishedProjects.filter((project) => {
      if (!query) return true;
      const haystack = [project.title, project.description || ''].join(' ').toLowerCase();
      return haystack.includes(query);
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'popular':
          return (b.response_count || 0) - (a.response_count || 0);
        case 'remixed':
          return (b.remix_count || 0) - (a.remix_count || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [publishedProjects, query, sortBy]);

  // Separate templates from surveys
  const templates = useMemo(() => filteredProjects.filter(p => p.is_template), [filteredProjects]);
  const surveys = useMemo(() => filteredProjects.filter(p => !p.is_template), [filteredProjects]);

  // Also include mock data for now
  const templateMatches = useMemo(() => {
    const base =
      templateFilter === 'trending'
        ? trendingTemplates
        : templateFilter === 'new'
        ? [...communityTemplates].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
        : templateFilter === 'remixed'
        ? [...communityTemplates].sort((a, b) => b.remixCount - a.remixCount)
        : communityTemplates;

    const result = !query ? base.slice(0, 12) : base
      .filter((template) => {
        const haystack = [
          template.title,
          template.description,
          template.category,
          template.tags.join(' '),
          template.framework,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 12);

    return result;
  }, [templateFilter, query]);

  const surveyMatches = useMemo(() => {
    const base =
      templateFilter === 'trending'
        ? trendingSurveys
        : templateFilter === 'new'
        ? [...communitySurveys].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
        : templateFilter === 'remixed'
        ? [...communitySurveys].sort((a, b) => b.responseCount - a.responseCount)
        : communitySurveys;

    const result = !query ? base.slice(0, 12) : base
      .filter((survey) => {
        const haystack = [
          survey.title,
          survey.description,
          survey.category,
          survey.tags?.join(' ') || '',
          survey.difficulty,
          survey.estimatedTime,
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .slice(0, 12);

    return result;
  }, [templateFilter, query]);

  const handleRemixTemplate = (templateId: string) => {
    router.push(`/project/${templateId}?remix=true`);
  };

  const handleTakeSurvey = (surveyId: string) => {
    router.push(`/project/${surveyId}?remix=true`);
  };

  return (
    <div
      className="min-h-full w-full pb-24"
      style={{ backgroundColor: 'var(--surbee-bg-primary)' }}
    >
      {/* Header Section */}
      <div className="flex flex-col gap-6 p-6 mx-auto w-full max-w-[1280px] md:px-8 pt-8">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h1 className="projects-title">Marketplace</h1>
          </div>
        </div>

        {/* Filter and Sort Section - Matches Projects page */}
        <div className="flex flex-row items-center justify-between mb-2">
          {/* Search Input */}
          <div
            className="flex items-center h-9 rounded-full px-4 gap-2 w-[260px] transition-all duration-200"
            style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-bg)'}
          >
            <Search size={16} style={{ color: 'var(--surbee-fg-muted)', flexShrink: 0 }} />
            <input
              className="h-full w-full border-none bg-transparent outline-none text-sm"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                onChange={(value) => setSortBy(value)}
              />
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="w-full h-px" style={{ backgroundColor: 'var(--surbee-border-accent)' }}></div>
      </div>

      <main
        className="page_main__UgkPO"
        style={{
          padding: "20px 20px 0px 20px",
          margin: "auto",
          gap: "60px",
          display: "flex",
          maxWidth: "1280px",
          flexDirection: "column",
          minHeight: "500px",
        }}
      >
        {/* Published Surveys Section */}
        {surveys.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="products-section_headerHeading__hSnK_" style={{ fontSize: '20px', color: 'var(--surbee-fg-primary)' }}>
                Community Surveys
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {surveys.map((survey) => (
                <ProjectStyleCard
                  key={survey.id}
                  template={survey}
                  onRemixTemplate={handleTakeSurvey}
                  isTemplate={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Published Templates Section */}
        {templates.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="products-section_headerHeading__hSnK_" style={{ fontSize: '20px', color: 'var(--surbee-fg-primary)' }}>
                Community Templates
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {templates.map((template) => (
                <ProjectStyleCard
                  key={template.id}
                  template={template}
                  onRemixTemplate={handleRemixTemplate}
                  isTemplate={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mock Templates Section */}
        {templateMatches.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="products-section_headerHeading__hSnK_" style={{ fontSize: '20px', color: 'var(--surbee-fg-primary)' }}>
                Templates
              </h2>
              <a
                className="products-section_experimentalCta__OdkJr text-label"
                href="#"
                style={{
                  color: '#7F7F7F',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#7F7F7F';
                }}
              >
                See All
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {templateMatches.slice(0, 8).map((template) => (
                <ProjectStyleCard
                  key={template.id}
                  template={template}
                  onRemixTemplate={handleRemixTemplate}
                  isTemplate={true}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mock Surveys Section */}
        {surveyMatches.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="products-section_headerHeading__hSnK_" style={{ fontSize: '20px', color: 'var(--surbee-fg-primary)' }}>
                Surveys
              </h2>
              <a
                className="products-section_experimentalCta__OdkJr text-label"
                href="#"
                style={{
                  color: '#7F7F7F',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  textDecoration: 'none',
                  transition: 'color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#7F7F7F';
                }}
              >
                See All
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {surveyMatches.slice(0, 8).map((survey) => (
                <ProjectStyleCard
                  key={survey.id}
                  template={survey}
                  onRemixTemplate={handleTakeSurvey}
                  isTemplate={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-pulse text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
              Loading marketplace...
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProjects.length === 0 && templateMatches.length === 0 && surveyMatches.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-[18px] font-semibold mb-2" style={{ color: 'var(--surbee-fg-primary)' }}>
              No results found
            </h3>
            <p className="text-[14px] mb-6" style={{ color: 'var(--surbee-fg-muted)' }}>
              Try adjusting your search query
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
