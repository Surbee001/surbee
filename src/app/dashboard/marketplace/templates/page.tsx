"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ImageKitProvider } from "@imagekit/next";
import {
  ArrowLeft,
  ListFilter,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import {
  communityCategories,
  communityTemplates,
  CommunityTemplate,
} from "@/lib/community/data";
import { CommunityTemplateCard } from "@/components/community/CommunityTemplateCard";

const sortOptions = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "remixed", label: "Most Remixed" },
  { value: "alphabetical", label: "A → Z" },
];

const difficultyFilters: Array<{
  value: "all" | CommunityTemplate["difficulty"];
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const templateCategories = communityCategories.filter(
  (category) => category.contentType !== "surveys"
);

function CommunityTemplatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState<string>(
    searchParams.get("q") ?? ""
  );
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get("category") ?? "all"
  );
  const [sort, setSort] = useState<string>(
    searchParams.get("sort") ?? "trending"
  );
  const [difficulty, setDifficulty] =
    useState<CommunityTemplate["difficulty"] | "all">("all");

  useEffect(() => {
    const nextCategory = searchParams.get("category") ?? "all";
    if (nextCategory !== activeCategory) {
      setActiveCategory(nextCategory);
    }
  }, [searchParams, activeCategory]);

  const templates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const activeCategoryMeta = communityCategories.find(
      (category) => category.slug === activeCategory
    );

    let results = communityTemplates.slice();

    if (activeCategory !== "all" && activeCategoryMeta) {
      const keywords = activeCategoryMeta.keywords ?? [
        activeCategoryMeta.title,
      ];

      results = results.filter((template) =>
        keywords.some((keyword) =>
          template.category.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    }

    if (difficulty !== "all") {
      results = results.filter((template) => template.difficulty === difficulty);
    }

    if (query) {
      results = results.filter((template) => {
        const haystack = [
          template.title,
          template.description,
          template.category,
          template.tags.join(" "),
          template.framework,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(query);
      });
    }

    switch (sort) {
      case "newest":
        results.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "remixed":
        results.sort((a, b) => b.remixCount - a.remixCount);
        break;
      case "alphabetical":
        results.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "trending":
      default:
        results.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
        break;
    }

    return results;
  }, [searchQuery, activeCategory, difficulty, sort]);

  const updateUrl = (
    params: Record<string, string | null | undefined>
  ): void => {
    const query = new URLSearchParams(searchParams);
    Object.entries(params).forEach(([key, value]) => {
      if (!value) {
        query.delete(key);
      } else {
        query.set(key, value);
      }
    });

    router.replace(`?${query.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (nextCategory: string) => {
    setActiveCategory(nextCategory);
    updateUrl({
      category: nextCategory === "all" ? null : nextCategory,
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    updateUrl({
      q: value.length ? value : null,
    });
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    updateUrl({
      sort: value === "trending" ? null : value,
    });
  };

  const handleDifficultyChange = (
    nextDifficulty: CommunityTemplate["difficulty"] | "all"
  ) => {
    setDifficulty(nextDifficulty);
  };

  const handleSelectTemplate = (templateId: string) => {
    router.push(`/dashboard/marketplace/templates/${templateId}`);
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
                <Sparkles className="h-4 w-4 text-pink-400" />
                Community Templates
              </div>
            </div>
            <div className="max-w-3xl space-y-3">
              <h1 className="text-4xl font-semibold text-white md:text-5xl">
                Remix templates built by the community
              </h1>
              <p className="text-base text-white/60 md:text-lg">
                Curated frameworks, dashboards, and onboarding flows ready to
                personalise for your team.
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
                placeholder="Search by template name, tag, or use case"
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
                    All Templates
                  </button>
                  {templateCategories.map((category) => (
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
                {templates.length} templates
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
                      onClick={() => handleDifficultyChange(filter.value)}
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

              <label className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm text-white/60"
                style={{
                  borderColor: "var(--surbee-border-accent)",
                  backgroundColor: "#111",
                }}
              >
                <span>Sort</span>
                <select
                  value={sort}
                  onChange={(event) => handleSortChange(event.target.value)}
                  className="bg-transparent text-sm text-white outline-none"
                >
                  {sortOptions.map((option) => (
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
              {templates.map((template) => (
                <CommunityTemplateCard
                  key={template.id}
                  template={template}
                  onRemixTemplate={(templateId) =>
                    router.push(`/dashboard/marketplace/templates/${templateId}?action=remix`)
                  }
                  onSelectTemplate={handleSelectTemplate}
                />
              ))}
            </div>
            {templates.length === 0 && (
              <div
                className="rounded-2xl border px-10 py-16 text-center text-white/60"
                style={{
                  borderColor: "var(--surbee-border-accent)",
                  backgroundColor: "#111",
                }}
              >
                No templates match your filters yet. Try a different combination.
              </div>
            )}
          </section>
        </div>
      </div>
    </ImageKitProvider>
  );
}

// Main component with Suspense boundary
export default function CommunityTemplatesPage() {
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
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  Community Templates
                </div>
              </div>
              <div className="max-w-3xl space-y-3">
                <h1 className="text-4xl font-semibold text-white md:text-5xl">
                  Remix templates built by the community
                </h1>
                <p className="text-base text-white/60 md:text-lg">
                  Curated frameworks, dashboards, and onboarding flows ready to
                  personalise for your team.
                </p>
              </div>
            </header>
            <div className="flex items-center justify-center py-20">
              <div className="text-white/60">Loading templates...</div>
            </div>
          </div>
        </div>
      </ImageKitProvider>
    }>
      <CommunityTemplatesContent />
    </Suspense>
  );
}

