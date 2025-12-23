'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Image as IKImage } from '@imagekit/next';
import {
  ArrowLeft,
  Flag,
  Heart,
  Repeat2,
  Share2,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react';

import type { CommunityTemplate } from '@/lib/community/data';
import { CommunityTemplateCard } from '@/components/community/CommunityTemplateCard';

interface TemplateDetailViewProps {
  template: CommunityTemplate;
  relatedTemplates: CommunityTemplate[];
  highlightAction?: string;
}

export function TemplateDetailView({
  template,
  relatedTemplates,
  highlightAction,
}: TemplateDetailViewProps) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [flagged, setFlagged] = useState(false);

  const formattedCreatedAt = useMemo(() => {
    return new Intl.DateTimeFormat('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(template.createdAt));
  }, [template.createdAt]);

  const handleRemix = () => {
    console.log('Remix template', template.id);
  };

  const handleShare = () => {
    navigator.clipboard
      .writeText(window.location.href)
      .catch(() => console.warn('Unable to copy link'));
  };

  return (
    <div
      className="min-h-full w-full pb-20"
      style={{ backgroundColor: 'var(--surbee-bg-primary)' }}
    >
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-12 px-6 pb-20 pt-10 md:px-8">
        <header className="flex flex-col gap-6">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-white/60">
            <Link href="/marketplace" className="flex items-center gap-2 hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Community
            </Link>
            <span className="text-white/30">/</span>
            <Link href="/marketplace/templates" className="hover:text-white">
              Templates
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white/80">{template.title}</span>
          </nav>

          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-white/50">
                <Sparkles className="h-4 w-4 text-pink-400" />
                Community Template
              </div>
              <h1 className="text-4xl font-semibold text-white md:text-5xl">
                {template.title}
              </h1>
              <p className="max-w-2xl text-base text-white/60 md:text-lg">
                {template.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                <span className="rounded-full border px-3 py-1" style={{ borderColor: 'var(--surbee-border-accent)' }}>
                  {template.category}
                </span>
                <span>Framework: {template.framework}</span>
                <span>Created {formattedCreatedAt}</span>
              </div>
            </div>

            <div className="flex flex-col items-stretch gap-3">
              <button
                type="button"
                onClick={handleRemix}
                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition`}
                style={{
                  background:
                    highlightAction === 'remix'
                      ? 'linear-gradient(135deg, #ff7a18, #af002d 71%)'
                      : '#fff',
                  color: highlightAction === 'remix' ? '#fff' : '#000',
                }}
              >
                <Repeat2 className="h-4 w-4" />
                Remix template
              </button>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setLiked((state) => !state)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                    liked ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                  }`}
                  style={{ borderColor: 'var(--surbee-border-accent)', backgroundColor: '#111' }}
                >
                  <Heart className="h-4 w-4" fill={liked ? 'currentColor' : 'none'} />
                </button>
                <button
                  type="button"
                  onClick={() => setFlagged((state) => !state)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
                    flagged ? 'bg-white text-black' : 'text-white/70 hover:text-white'
                  }`}
                  style={{ borderColor: 'var(--surbee-border-accent)', backgroundColor: '#111' }}
                >
                  <Flag className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex h-11 w-11 items-center justify-center rounded-full border text-white/70 transition hover:text-white"
                  style={{ borderColor: 'var(--surbee-border-accent)', backgroundColor: '#111' }}
                >
                  <Share2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-10 md:grid-cols-[minmax(0,2fr)_1fr]">
          <div
            className="overflow-hidden rounded-3xl border"
            style={{ borderColor: 'var(--surbee-border-accent)', backgroundColor: '#111' }}
          >
            <div className="aspect-[16/9] w-full bg-black/40">
              {template.previewImage ? (
                <IKImage
                  src={template.previewImage}
                  alt={template.title}
                  width={1200}
                  height={675}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/40">
                  Preview coming soon
                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-6 rounded-3xl border p-6"
            style={{ borderColor: 'var(--surbee-border-accent)', backgroundColor: '#111' }}
          >
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">Template details</h2>
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Users className="h-4 w-4" />
                <span>{template.remixCount.toLocaleString()} remixes</span>
              </div>
              {typeof template.likes === 'number' && (
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <Heart className="h-4 w-4" />
                  <span>{template.likes.toLocaleString()} likes</span>
                </div>
              )}
              {template.author && (
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  <span>Created by {template.author}</span>
                </div>
              )}
              {template.difficulty && (
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <Tag className="h-4 w-4" />
                  <span>{template.difficulty} setup</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-widest text-white/50">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border px-3 py-1 text-xs uppercase tracking-wide text-white/70"
                    style={{ borderColor: 'var(--surbee-border-accent)', backgroundColor: '#0f0f0f' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-semibold text-white">Related templates</h2>
            <button
              type="button"
              onClick={() => router.push('/marketplace/templates')}
              className="text-sm text-white/60 transition hover:text-white"
            >
              Browse all templates
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {relatedTemplates.map((relatedTemplate) => (
              <CommunityTemplateCard
                key={relatedTemplate.id}
                template={relatedTemplate}
                onRemixTemplate={() => router.push(`/marketplace/templates/${relatedTemplate.id}?action=remix`)}
                onSelectTemplate={(templateId) =>
                  router.push(`/marketplace/templates/${templateId}`)
                }
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

