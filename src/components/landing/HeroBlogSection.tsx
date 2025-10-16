"use client";

import React from "react";
import { motion } from "framer-motion";
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
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
      <motion.div
        className={`w-full ${className}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Featured Image */}
          <motion.div
            className="flex-1 w-full lg:w-auto"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
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

                {/* Featured badge */}
                {post.featured && (
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-[#171717] backdrop-blur-sm">
                      Featured
                    </span>
                  </div>
                )}
              </div>
            </Link>
          </motion.div>

          {/* Content */}
          <motion.div
            className="flex-1 w-full lg:w-auto lg:max-w-md xl:max-w-lg"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
          >
            <div className="flex flex-col gap-6">
              {/* Date */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[#8a8a8a]">
                  {post.date}
                </span>
                {post.featured && (
                  <>
                    <span className="text-sm text-[#8a8a8a]">•</span>
                    <span className="text-sm font-medium text-[#8a8a8a]">Featured</span>
                  </>
                )}
              </div>

              {/* Title */}
              <div>
                <h2 className="font-semibold text-2xl md:text-3xl lg:text-4xl leading-tight text-[#171717] group-hover:text-neutral-700 transition-colors mb-4">
                  <Link href={`/landing/blog/${post.id}`} className="hover:underline decoration-2 underline-offset-4">
                    {post.title}
                  </Link>
                </h2>
              </div>

              {/* Excerpt */}
              <div>
                <p className="text-base md:text-lg text-[#171717]/80 leading-relaxed line-clamp-3">
                  {post.excerpt}
                </p>
              </div>

              {/* Read More Button */}
              <motion.div
                className="pt-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={`/landing/blog/${post.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171717] text-white text-sm font-medium hover:bg-neutral-800 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Read More
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </ImageKitProvider>
  );
}
