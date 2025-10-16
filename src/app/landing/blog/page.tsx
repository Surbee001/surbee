import React from "react";
import { RevealSection, RevealDiv } from "@/components/landing/Reveal";
import FramerBlogHero from "@/components/landing/FramerBlogHero";
import localFont from "next/font/local";
import { ImageKitProvider, Image as IKImage } from "@imagekit/next";
import Link from "next/link";

const epilogue = localFont({
  src: [
    {
      path: "../../../../public/fonts/Epilogue-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../../../public/fonts/Epilogue-VariableItalic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-epilogue",
  display: "swap",
});

export default function BlogPage() {
  const sidebarWidthClass = "w-56";

  // Sample blog data
  const mainBlogPost = {
    id: 1,
    title: "The Future of Survey Design: How AI is Revolutionizing Research",
    date: "March 15, 2024",
    image: "/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png",
    excerpt: "Discover how artificial intelligence is transforming the way we create and analyze surveys, making research more accessible and insightful than ever before."
  };

  const blogPosts = [
    {
      id: 2,
      title: "10 Common Survey Mistakes and How to Avoid Them",
      date: "March 12, 2024",
      image: "/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png",
      excerpt: "Learn about the most frequent errors in survey design and practical tips to create better questions."
    },
    {
      id: 3,
      title: "Understanding Response Bias in Research",
      date: "March 10, 2024",
      image: "/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_abf323ce-3d0a-417d-8ce7-b307c8e84258.png",
      excerpt: "Explore different types of response bias and strategies to minimize their impact on your data."
    },
    {
      id: 4,
      title: "The Power of Open-Ended Questions",
      date: "March 8, 2024",
      image: "/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__4ce65e66-d621-45c5-bf0a-fbb5ca988ffc.png",
      excerpt: "Why qualitative insights matter and how to effectively use open-ended questions in your surveys."
    },
    {
      id: 5,
      title: "Survey Length vs. Response Rate: Finding the Sweet Spot",
      date: "March 5, 2024",
      image: "/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__a251fdff-9dfc-4ba5-ae7b-fc45b9e25c11.png",
      excerpt: "Data-driven insights on optimal survey length and its impact on completion rates."
    },
    {
      id: 6,
      title: "Mobile-First Survey Design Best Practices",
      date: "March 2, 2024",
      image: "/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__eaaaa7a6-e50c-45e5-b7b9-d04871dae055.png",
      excerpt: "Essential tips for creating surveys that work perfectly on mobile devices."
    },
    {
      id: 7,
      title: "Data Validation Techniques for Better Results",
      date: "February 28, 2024",
      image: "/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__423e2f06-d2d7-4c2c-bd7b-9aec2b6c1fbe.png",
      excerpt: "Advanced methods to ensure data quality and reliability in your survey responses."
    },
    {
      id: 8,
      title: "The Psychology of Survey Responses",
      date: "February 25, 2024",
      image: "/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png",
      excerpt: "Understanding how respondents think and make decisions when answering surveys."
    },
    {
      id: 9,
      title: "Building Community Around Your Research",
      date: "February 22, 2024",
      image: "/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png",
      excerpt: "How to engage participants and create a loyal community for ongoing research."
    },
  ];

  return (
    <div className={`min-h-screen w-full ${epilogue.variable}`} style={{ backgroundColor: "#FEFFFC", fontFamily: "var(--font-epilogue)" }}>
      {/* Top Navigation (full-width) with blur */}
      <nav className="fixed left-0 right-0 top-0 z-40 w-full bg-[#FEFFFC]/70 backdrop-blur supports-[backdrop-filter]:bg-[#FEFFFC]/70">
        <div className="flex h-16 items-center justify-between gap-4 pl-56 pr-6">
          <div className="text-2xl text-[#171717] font-semibold tracking-[-0.02em] pl-5 md:pl-8 xl:pl-12 2xl:pl-30">surbee</div>
          <div className="flex items-center gap-4">
            <a href="/pricing" className="text-sm text-[#171717] hover:text-neutral-800 transition-all duration-300 ease-out">
            Pricing
          </a>
          <a
              href="/test-login"
            className="rounded-full border border-neutral-300 bg-white px-4 py-1.5 text-sm text-[#171717] hover:bg-neutral-100"
          >
            Log in
          </a>
          <a
              href="/test-login"
            className="rounded-full bg-neutral-900 px-4 py-1.5 text-sm text-white hover:bg-black"
          >
            Sign up
          </a>
          </div>
        </div>
      </nav>

      {/* Layout wrapper: fixed sidebar + flowing content */}
      <div className="flex w-full">
        {/* Side Menu - fixed full height */}
        <aside
          className={`${sidebarWidthClass} fixed left-0 top-0 z-50 h-screen border-r border-neutral-200/80 bg-[#FEFFFC]`}
        >
          <div className="flex h-full flex-col p-4 pt-20">
            <div className="flex-1"></div>

            <div className="flex flex-col">
              <div className="px-1 mb-5">
                <img
                  src="https://raw.githubusercontent.com/Surbee001/webimg/c120f0dfd46532bb149db06425090559998d97d5/New%20SVG.svg"
                  alt="Surbee logo"
                  className="w-20 h-auto object-contain"
                />
              </div>
              <div
                className="flex flex-col gap-2 transition-opacity duration-700 ease-out opacity-100"
                style={{ width: "calc(100vw - calc(100vw - 100%))" }}
              >
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap shrink-0 outline-none underline-offset-4 hover:text-neutral-800 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing"
                >
                  Surbee
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing#use-cases"
                >
                  Use cases
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing#students"
                >
                  Students
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-neutral-400 hover:text-neutral-800 rounded px-2 py-1 -ml-1"
                  href="/landing/privacy"
                >
                  Privacy
                </a>
                <a
                  className="inline-flex items-center gap-2 whitespace-nowrap font-medium shrink-0 outline-none underline-offset-4 focus-visible:ring-0 focus-visible:text-neutral-900 p-0 text-[15px] leading-[140%] w-min justify-start h-5 transition-all duration-300 ease-out text-[#171717] font-medium bg-neutral-100 rounded px-2 py-1 -ml-1"
                >
                  Blog
                </a>
              </div>
            </div>

            <div className="flex items-center gap-3 px-1 pb-4 mt-6">
              <a href="https://twitter.com/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#171717] transition-colors" aria-label="X">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://discord.gg/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#171717] transition-colors" aria-label="Discord">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 127.14 96"><path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.9-72.15zM42.45 65.69C36.18 65.69 31 60 31 53s5-12.74 11.43-12.74S54 46 53.89 53s-5.05 12.69-11.44 12.69zm42.24 0C78.41 65.69 73.25 60 73.25 53s5-12.74 11.44-12.74S96.23 46 96.12 53s-5.04 12.69-11.43 12.69z"/></svg>
              </a>
              <a href="https://instagram.com/surbee" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#171717] transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
              </a>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`ml-56 w-full pt-20`}>

          {/* Hero Blog Post (Framer exact markup) */}
          <RevealSection className="mt-0 p-0">
            <FramerBlogHero />
          </RevealSection>

          {/* Divider */}
          <div className="mt-12 h-px w-full bg-neutral-200" />

          {/* 3x3 Grid of Blog Posts */}
          <RevealSection className="mt-12 px-6 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {blogPosts.map((post) => (
                <Link key={post.id} href={`/landing/blog/${post.id}`} className="group">
                  <div className="relative overflow-hidden rounded-lg bg-neutral-50 transition-all duration-300">
                    <div className="aspect-[16/10] w-full overflow-hidden">
                      <IKImage
                        src={post.image}
                        alt={post.title}
                        width={640}
                        height={400}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        transformation={[{ width: 640, quality: 85 }]}
                        loading="lazy"
                      />
                    </div>
                    <div className="p-5 md:p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-medium text-neutral-600 uppercase tracking-wider">
                          {post.date}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg md:text-xl leading-tight text-[#171717] mb-2 group-hover:text-neutral-700 transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-neutral-600 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center text-sm font-medium text-[#171717] group-hover:text-neutral-700 transition-colors">
                        Read more
                        <svg className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </RevealSection>
        </main>
      </div>
    </div>
  );
}