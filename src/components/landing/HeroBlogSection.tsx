"use client";

import React from "react";
import { ImageKitProvider, Image as IKImage } from "@imagekit/next";
import Link from "next/link";

interface HeroBlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  featured?: boolean;
}

interface HeroBlogSectionProps {
  post: HeroBlogPost;
  className?: string;
}

export default function HeroBlogSection({ post, className = "" }: HeroBlogSectionProps) {
  return (
    <div className={`w-full max-w-7xl mx-auto ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Featured Image */}
        <div className="order-2 lg:order-1">
          <Link href={`/landing/blog/${post.id}`} className="group block">
            <div className="relative w-full overflow-hidden rounded-lg bg-neutral-100 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="aspect-[16/9] w-full overflow-hidden">
                <IKImage
                  src={post.image}
                  alt={post.title}
                  width={800}
                  height={450}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  transformation={[{ width: 800, height: 450, quality: 85 }]}
                  loading="lazy"
                />
              </div>
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>
        </div>

        {/* Content */}
        <div className="order-1 lg:order-2">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight text-[#171717] mb-4">
                <Link
                  href={`/landing/blog/${post.id}`}
                  className="hover:text-neutral-700 transition-colors hover:underline decoration-2 underline-offset-4"
                >
                  {post.title}
                </Link>
              </h2>
            </div>

            {/* Excerpt */}
            <div>
              <p className="text-base md:text-lg text-[#171717]/80 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            {/* Read More Button */}
            <div className="pt-2">
              <Link
                href={`/landing/blog/${post.id}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FBFAF4] text-[#171717] text-sm font-medium hover:bg-[#F5F4F0] transition-all duration-200 border border-neutral-200 hover:border-neutral-300"
              >
                Read More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
