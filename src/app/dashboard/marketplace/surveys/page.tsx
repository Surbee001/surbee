"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageKitProvider } from "@imagekit/next";
import {
  ArrowLeft,
  Clock,
  ListFilter,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import {
  communityCategories,
  communitySurveys,
  CommunitySurvey,
} from "@/lib/community/data";
import { CommunitySurveyCard } from "@/components/community/CommunitySurveyCard";

// Type for marketplace surveys from API
interface MarketplaceSurvey {
  id: string;
  title: string;
  description: string;
  category: string;
  responseCount: number;
  createdAt: string;
  publishedAt: string;
  previewImage?: string;
  publishedUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
}

const difficultyFilters: Array<{
  value: "all" | CommunitySurvey["difficulty"];
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const timeFilters = [
  { value: "all", label: "Any length" },
  { value: "quick", label: "< 6 min" },
  { value: "standard", label: "6 – 10 min" },
  { value: "deep", label: "10+ min" },
];

const surveyCategories = communityCategories.filter(
  (category) => category.contentType !== "templates"
);

function CommunitySurveysContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("q") ?? ""
  );
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get("category") ?? "all"
  );
  const [difficulty, setDifficulty] =
    useState<CommunitySurvey["difficulty"] | "all">("all");
  const [timeFilter, setTimeFilter] = useState<string>(
    searchParams.get("duration") ?? "all"
  );

  // State for published surveys from API
  const [publishedSurveys, setPublishedSurveys] = useState<MarketplaceSurvey[]>([]);
  const [loadingPublished, setLoadingPublished] = useState(true);

  // Fetch published surveys from API
  useEffect(() => {
    const fetchPublishedSurveys = async () => {
      try {
        setLoadingPublished(true);
        const response = await fetch('/api/surveys/marketplace?limit=100');
        if (response.ok) {
          const data = await response.json();
          setPublishedSurveys(data.surveys || []);
        }
      } catch (error) {
        console.error('Failed to fetch published surveys:', error);
      } finally {
        setLoadingPublished(false);
      }
    };

    fetchPublishedSurveys();
  }, []);

  useEffect(() => {
    const nextCategory = searchParams.get("category") ?? "all";
    if (nextCategory !== activeCategory) {
      setActiveCategory(nextCategory);
    }
  }, [searchParams, activeCategory]);

  const parseDuration = (value: string) => {
    const numeric = parseInt(value.replace(/\D/g, ""), 10);
    return Number.isNaN(numeric) ? null : numeric;
  };

  const surveys = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const activeCategoryMeta = communityCategories.find(
      (category) => category.slug === activeCategory
    );

    // Convert published surveys to CommunitySurvey format
    const publishedAsCommunitySurveys: CommunitySurvey[] = publishedSurveys.map((survey) => ({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      category: survey.category || 'General',
      responseCount: survey.responseCount || 0,
      createdAt: survey.createdAt,
      previewImage: survey.previewImage,
      difficulty: survey.difficulty || 'intermediate',
      estimatedTime: survey.estimatedTime || '5-10 min',
      tags: [],
      author: 'Community',
    }));

    // Combine static surveys with published surveys (published first)
    let results = [...publishedAsCommunitySurveys, ...communitySurveys];

    if (activeCategory !== "all" && activeCategoryMeta) {
      const keywords = activeCategoryMeta.keywords ?? [
        activeCategoryMeta.title,
      ];
      results = results.filter((survey) =>
        keywords.some((keyword) =>
          survey.category.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    if (difficulty !== "all") {
      results = results.filter((survey) => survey.difficulty === difficulty);
    }

    if (timeFilter !== "all") {
      results = results.filter((survey) => {
        const duration = parseDuration(survey.estimatedTime);
        if (duration === null) return true;
        switch (timeFilter) {
          case "quick":
            return duration < 6;
          case "standard":
            return duration >= 6 && duration <= 10;
          case "deep":
            return duration > 10;
          default:
            return true;
        }
      });
    }

    if (query) {
      results = results.filter((survey) => {
        const haystack = [
          survey.title,
          survey.description,
          survey.category,
          survey.tags?.join(" "),
          survey.author,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    return results;
  }, [searchQuery, activeCategory, difficulty, timeFilter, publishedSurveys]);

  const handleCategoryChange = (nextCategory: string) => {
    setActiveCategory(nextCategory);
    const params = new URLSearchParams(searchParams);
    if (nextCategory === "all") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value.length === 0) {
      params.delete("q");
    } else {
      params.set("q", value);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleTimeChange = (value: string) => {
    setTimeFilter(value);
    const params = new URLSearchParams(searchParams);
    if (value === "all") {
      params.delete("duration");
    } else {
      params.set("duration", value);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleTakeSurvey = (surveyId: string) => {
    console.log("Open survey", surveyId);
  };

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
      <div
        className="min-h-full w-full pb-20"
        style={{ backgroundColor: "var(--surbee-bg-primary)" }}
      >
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-6 pb-16 pt-10 md:px-8">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
              <Link
                href="/dashboard/marketplace"
                className="flex items-center gap-2 text-white/60 transition hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Community
              </Link>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/50">
                <Clock className="h-4 w-4 text-orange-400" />
                Community Surveys
              </div>
            </div>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-4xl font-semibold text-white md:text-5xl">
                Take surveys and share your perspective
              </h1>
              <p className="text-base text-white/60 md:text-lg">
                Support builders by giving feedback. Discover trending surveys
                looking for responses right now.
              </p>
            </div>

            <div
              className="flex w-full items-center gap-2 rounded-xl border px-4 py-2.5"
              style={{
                borderColor: "var(--surbee-border-accent)",
                backgroundColor: "#111",
              }}
            >
              <Search className="h-5 w-5 text-gray-500" />
              <input
                value={searchQuery}
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search by survey topic, audience, or creator"
                className="h-10 w-full border-none bg-transparent text-sm text-white outline-none placeholder:text-gray-500"
              />
            </div>
          </header>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs uppercase tracking-widest text-white/50">
                  Categories
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange("all")}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      activeCategory === "all"
                        ? "bg-white text-black"
                        : "text-white/60 hover:text-white"
                    }`}
                    style={{
                      borderColor: "var(--surbee-border-accent)",
                      backgroundColor: activeCategory === "all" ? "#fff" : "#111",
                    }}
                  >
                    All Surveys
                  </button>
                  {surveyCategories.map((category) => (
                    <button
                      type="button"
                      key={category.slug}
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`rounded-full border px-4 py-2 text-sm transition ${
                        activeCategory === category.slug
                          ? "bg-white text-black"
                          : "text-white/60 hover:text-white"
                      }`}
                      style={{
                        borderColor: "var(--surbee-border-accent)",
                        backgroundColor:
                          activeCategory === category.slug ? "#fff" : "#111",
                      }}
                    >
                      {category.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-white/60">
                <SlidersHorizontal className="h-4 w-4" />
                {surveys.length} surveys
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_auto]">
              <div className="flex items-center gap-1 text-sm text-white/70">
                <ListFilter className="h-4 w-4" />
                Difficulty
                <div
                  className="ml-3 flex items-center gap-2 rounded-full border px-2 py-1"
                  style={{
                    borderColor: "var(--surbee-border-accent)",
                    backgroundColor: "#111",
                  }}
                >
                  {difficultyFilters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => setDifficulty(filter.value)}
                      className={`rounded-full px-3 py-1 text-xs transition ${
                        difficulty === filter.value
                          ? "bg-white text-black"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <label
                className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm text-white/60"
                style={{
                  borderColor: "var(--surbee-border-accent)",
                  backgroundColor: "#111",
                }}
              >
                <span>Duration</span>
                <select
                  value={timeFilter}
                  onChange={(event) => handleTimeChange(event.target.value)}
                  className="bg-transparent text-sm text-white outline-none"
                >
                  {timeFilters.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-black text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {surveys.map((survey) => (
                <CommunitySurveyCard
                  key={survey.id}
                  survey={survey}
                  onTakeSurvey={handleTakeSurvey}
                />
              ))}
            </div>
            {surveys.length === 0 && (
              <div
                className="rounded-2xl border px-10 py-16 text-center text-white/60"
                style={{
                  borderColor: "var(--surbee-border-accent)",
                  backgroundColor: "#111",
                }}
              >
                No surveys match your filters yet. Try a different combination.
              </div>
            )}
          </section>
        </div>
      </div>
    </ImageKitProvider>
  );
}

// Main component with Suspense boundary
export default function CommunitySurveysPage() {
  return (
    <Suspense fallback={
      <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
        <div
          className="min-h-full w-full pb-20"
          style={{ backgroundColor: "var(--surbee-bg-primary)" }}
        >
          <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-6 pb-16 pt-10 md:px-8">
            <header className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <Link
                  href="/dashboard/marketplace"
                  className="flex items-center gap-2 text-white/60 transition hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Community
                </Link>
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/50">
                  <Clock className="h-4 w-4 text-orange-400" />
                  Community Surveys
                </div>
              </div>
              <div className="max-w-3xl space-y-3">
                <h1 className="text-4xl font-semibold text-white md:text-5xl">
                  Take surveys and share your perspective
                </h1>
                <p className="text-base text-white/60 md:text-lg">
                  Support builders by giving feedback. Discover trending surveys
                  looking for responses right now.
                </p>
              </div>
            </header>
            <div className="flex items-center justify-center py-20">
              <div className="text-white/60">Loading surveys...</div>
            </div>
          </div>
        </div>
      </ImageKitProvider>
    }>
      <CommunitySurveysContent />
    </Suspense>
  );
}

