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
      className="group w-full p-[5px] rounded-[12px] relative border flex flex-col gap-[5px] h-full"
      style={{
        cursor: "pointer",
        backgroundColor: "#141414",
        borderColor: 'var(--surbee-border-accent)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#f8f8f8';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--surbee-border-accent)';
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
            <p className="text-white font-medium truncate max-w-[140px]" title={template.title}>
              {template.title}
            </p>
            <div className="flex items-center gap-1 text-gray-400 text-xs">
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

export default function NotionMarketplace() {
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
      {/* Full Width Hero Image Section */}
      <div
        className="hero-image-full-width"
        style={{
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          backgroundColor: "#1a1a1a",
          padding: "60px 0 40px 0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="hero-image-wrapper"
          style={{
            position: "relative",
            padding: "5px",
            backgroundColor: "#1a1a1a",
            borderRadius: "12px",
            border: "1px solid var(--surbee-border-accent)",
            maxWidth: "1200px",
            width: "90%",
          }}
        >
          <img
            src="/cofounder-assets/hero-anim-bg-2.png"
            alt="Marketplace Hero"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
              display: "block",
            }}
          />
        </div>
      </div>

      <main
        className="page_main__UgkPO"
        style={{
          padding: "0px 20px",
          margin: "auto",
          gap: "100px",
          display: "flex",
          maxWidth: "1300px",
          flexDirection: "column",
        }}
      >
        {/* Marketplace Content */}
        <div
          className="page_hero__OC_yx"
          style={{
            gap: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: "60px",
          }}
        >
          <div
            className="page_heroText__u8zUU"
            style={{
              gap: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h1
              className="text-h1"
              style={{ fontSize: "62px", letterSpacing: "-0.05em" }}
            >
              Marketplace
            </h1>
            <p
              className="text-lead text-balance"
              style={{
                fontVariationSettings: '"opsz" 30',
                fontSize: "20px",
                textWrap: "balance",
                maxWidth: "520px",
                textAlign: "center",
                lineHeight: "1.4",
              }}
            >
              Discover ready-to-use survey templates, take community polls, and find the perfect starting point for your research.
            </p>
          </div>
          <form
            className="styles_form__nIod2"
            style={{
              overflow: "visible",
              display: "flex",
              width: "100%",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <div
              className="styles_input__k1E0f"
              style={{
                position: "relative",
                width: "100%",
                maxWidth: "220px",
                fontSize: "15px",
                fontVariationSettings: '"opsz" 16, "wght" 480',
              }}
            >
            <div
              className="styles_overlay__GJHy0"
              style={{
                padding: "12px 12px 12px 14px",
                gap: "10px",
                inset: "0px auto",
                position: "absolute",
                display: "flex",
                width: "100%",
                flexGrow: 0,
                alignItems: "center",
                justifyContent: "start",
                color: "rgb(119, 119, 119)",
                fontSize: "14px",
                pointerEvents: "none",
                transition: "color 0.1s",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 1,
              }}
            >
              <Search className="h-4 w-4" />
            </div>
            <input
                id="search"
                className="appearance-none [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
                name="search"
                type="search"
                autoComplete="off"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search…"
                style={{
                  appearance: "none",
                  padding: "12px 12px 12px 40px",
                  borderRadius: "100px",
                  transition: "box-shadow 0.2s, background-color 0.2s",
                  width: "100%",
                  height: "44px",
                  backgroundColor: "#181818",
                  boxShadow: "rgba(0, 153, 255, 0) 0px 0px 0px 1px inset",
                  caretColor: "#fff",
                }}
              />
            </div>
          </form>
        </div>

          {/* Featured Slideshow */}
          <section className="space-y-6">
            <div className="products-section_experimentalHeader__gIYKf">
              <h2 className="products-section_headerHeading__hSnK_" style={{ fontSize: '20px' }}>Featured</h2>
            </div>

            <FeaturedSlideshow
              templates={templateMatches}
                  onRemixTemplate={handleRemixTemplate}
                />
          </section>

        </main>
      </div>
  );
}

