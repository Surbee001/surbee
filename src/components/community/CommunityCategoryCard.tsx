import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Image as IKImage } from '@imagekit/next';

import type { CommunityCategory } from '@/lib/community/data';

interface CommunityCategoryCardProps {
  category: CommunityCategory;
}

export function CommunityCategoryCard({ category }: CommunityCategoryCardProps) {
  const targetPath =
    category.contentType === 'surveys'
      ? `/dashboard/marketplace/surveys?category=${category.slug}`
      : `/dashboard/marketplace/templates?category=${category.slug}`;

  return (
    <Link href={targetPath} className="group block h-full">
      <div
        className="flex h-full flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300"
        style={{
          borderColor: 'var(--surbee-border-accent)',
          backgroundColor: '#111',
        }}
      >
        <div className="relative flex-1 overflow-hidden">
          <div className="grid h-full grid-cols-2 gap-1 p-2">
            {category.previewImages.slice(0, 4).map((src, index) => (
              <div
                key={`${category.slug}-preview-${index}`}
                className="relative overflow-hidden rounded-lg border border-transparent transition-all duration-300 group-hover:border-white/30"
                style={{
                  backgroundColor: '#1d1d1d',
                }}
              >
                {src ? (
                  <IKImage
                    src={src}
                    alt={`${category.title} preview ${index + 1}`}
                    width={120}
                    height={70}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 px-4 py-3">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
              {category.contentType === 'surveys'
                ? 'Surveys'
                : category.contentType === 'templates'
                ? 'Templates'
                : 'Templates & Surveys'}
            </p>
            <h3 className="mt-0.5 text-lg font-semibold text-white leading-tight">{category.title}</h3>
            <p className="mt-0.5 text-xs text-white/60 leading-tight">{category.description}</p>
          </div>
          <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full border transition-all duration-300 group-hover:translate-x-1 group-hover:border-[#f8f8f8] group-hover:bg-white/10">
            <ArrowRight className="h-4 w-4 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}

