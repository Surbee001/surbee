import React, { useMemo, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Compass,
  Flame,
  Gauge,
  Search,
  Sparkles,
  FileText,
  User,
} from 'lucide-react';

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

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Trending', value: 'trending' },
  { label: 'New', value: 'new' },
  { label: 'Most Remixed', value: 'remixed' },
];



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
  onRemixTemplate
}: {
  template: any;
  onRemixTemplate: (id: string) => void;
}) {
  // Determine the type based on template properties
  const getType = () => {
    if (template.category?.toLowerCase().includes('survey')) return 'Survey';
    if (template.category?.toLowerCase().includes('template')) return 'Template';
    return 'Component';
  };

  const getButtonText = () => {
    const type = getType();
    if (type === 'Survey') return 'Try Survey';
    return 'Remix';
  };

  // Mock response count - in real implementation, this would come from template data
  const responseCount = template.responseCount || 154;

  return (
    <div
      className="group w-full p-[2px] rounded-[12px] relative border flex flex-col gap-[5px] h-full"
      style={{
        cursor: "pointer",
        backgroundColor: 'var(--surbee-card-bg)',
        borderColor: 'transparent',
        boxSizing: 'border-box'
      }}
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
            src="https://endlesstools.io/_next/image?url=/embeds/avatars/4.png&w=96&q=75"
            alt="User avatar"
          />
          <div className="text-sm flex flex-col justify-center h-[42px]">
            <p className="font-medium truncate max-w-[140px]" style={{ color: 'var(--surbee-fg-primary)' }} title={template.title}>
              {template.title}
            </p>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--surbee-fg-secondary)' }}>
              <User className="w-3 h-3" />
              <span>{responseCount}</span>
            </div>
          </div>
        </div>
        <div
          className="w-[70px] h-[42px] bg-white text-black opacity-0 group-hover:opacity-100 group-hover:border-[#f8f8f8] group-hover:pointer-events-auto text-sm rounded-lg flex items-center justify-center font-medium cursor-pointer pointer-events-auto"
          style={{ border: '1px solid var(--surbee-border-accent)' }}
        >
          Edit
        </div>
      </div>
      <div className="w-full rounded-[8px] aspect-[210/130] mt-auto overflow-hidden">
        <img
          src={template.previewImage || "https://endlesstools.io/embeds/4.png"}
          alt={template.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('Image failed to load:', template.previewImage);
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

export default function Marketplace() {
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const normalize = (value: string) => value.toLowerCase();
  const query = normalize(searchQuery);

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

    console.log('Template matches:', result.length, result.slice(0, 3).map(t => ({ id: t.id, title: t.title, previewImage: t.previewImage })));
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

    console.log('Survey matches:', result.length, result.slice(0, 3).map(s => ({ id: s.id, title: s.title, previewImage: s.previewImage })));
    return result;
  }, [templateFilter, query]);


  const filteredCategories = useMemo(() => {
    if (!query) return communityCategories;
    return communityCategories.filter((category) =>
      [category.title, category.description, category.slug].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [query]);

  const handleRemixTemplate = (templateId: string) => {
    console.log('Remix template', templateId);
  };

  const handleTakeSurvey = (surveyId: string) => {
    console.log('Take survey', surveyId);
  };

  return (
    <div
      className="min-h-full w-full pb-24"
      style={{ backgroundColor: 'var(--surbee-bg-primary)' }}
    >
      {/* Centered Header with Search */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px 60px 20px",
        }}
      >
        <h1
          className="text-h1"
          style={{
            fontFamily: 'Kalice-Trial-Regular, sans-serif',
            fontWeight: 400,
            fontSize: "62px",
            letterSpacing: "-0.05em",
            marginBottom: "16px",
            color: 'var(--surbee-fg-primary)',
          }}
        >
          Marketplace
        </h1>
        <p
          className="text-lead text-balance"
          style={{
            fontVariationSettings: '"opsz" 30',
            fontSize: "18px",
            textWrap: "balance",
            maxWidth: "480px",
            margin: "0 auto 32px auto",
            lineHeight: "1.5",
            color: 'var(--surbee-fg-tertiary)',
          }}
        >
          Discover and explore community-created surveys and templates shared by users.
        </p>

        {/* Search Pill */}
        <div
          style={{
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 18px",
              backgroundColor: "var(--surbee-bg-secondary)",
              border: "1px solid var(--surbee-border-primary)",
              borderRadius: "50px",
              transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--surbee-border-accent)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--surbee-border-primary)";
            }}
          >
            <Search className="w-4 h-4" style={{ color: "var(--surbee-fg-secondary)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                backgroundColor: "transparent",
                color: "var(--surbee-fg-primary)",
                fontSize: "14px",
              }}
            />
          </div>
        </div>
      </div>

      <main
        className="page_main__UgkPO"
        style={{
          padding: "80px 20px 0px 20px",
          margin: "auto",
          gap: "100px",
          display: "flex",
          maxWidth: "1300px",
          flexDirection: "column",
          minHeight: "500px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Empty State */}
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📭</div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '12px',
              color: 'var(--surbee-fg-primary)',
            }}
          >
            No projects yet
          </h2>
          <p
            style={{
              fontSize: '16px',
              color: 'var(--surbee-fg-secondary)',
              maxWidth: '400px',
              margin: '0 auto',
              lineHeight: '1.5',
            }}
          >
            When users publish their surveys and templates, they'll appear here for the community to discover and use.
          </p>
        </div>
      </main>
    </div>
  );
}
