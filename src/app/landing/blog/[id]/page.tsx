"use client";

import React, { useState, useEffect } from "react";
import { RevealSection, RevealDiv } from "@/components/landing/Reveal";
import localFont from "next/font/local";
import { ImageKitProvider, Image as IKImage } from "@imagekit/next";
import Link from "next/link";
import { notFound } from "next/navigation";

const epilogue = localFont({
  src: [
    {
      path: "../../../../../public/fonts/Epilogue-Variable.woff2",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../../../../../public/fonts/Epilogue-VariableItalic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-epilogue",
  display: "swap",
});

// Sample blog posts data (in a real app, this would come from a database or CMS)
const blogPosts = {
  "1": {
    id: 1,
    title: "The Future of Survey Design: How AI is Revolutionizing Research",
    date: "March 15, 2024",
    author: "Dr. Sarah Mitchell",
    authorTitle: "Head of Research Innovation",
    image: "/Surbee Art/u7411232448_a_landscape_colorful_burnt_orange_bright_pink_reds__8962677a-4a62-4258-ae2d-0dda6908e0e2.png",
    content: `
      <h2>The research landscape is evolving at an unprecedented pace.</h2>
      <p>In recent years, artificial intelligence has transformed countless industries, and market research is no exception. The traditional approach to survey design—manual question crafting, tedious formatting, and time-consuming analysis—is being revolutionized by AI-powered tools that can understand context, generate insights, and adapt to user needs in real-time.</p>

      <h3>The Traditional Challenges</h3>
      <p>For decades, researchers have faced similar challenges when creating surveys. Writing unbiased questions that elicit meaningful responses requires significant expertise and time. Even experienced researchers can spend weeks crafting the perfect survey, only to discover issues during the analysis phase. The iterative process of refining questions based on pilot testing adds another layer of complexity and time investment.</p>

      <h3>Enter AI-Powered Survey Design</h3>
      <p>Artificial intelligence is changing the game by enabling researchers to:</p>
      <ul>
        <li><strong>Generate questions in natural language:</strong> Simply describe what you want to learn, and AI will craft appropriate questions with proper formatting and structure.</li>
        <li><strong>Identify potential biases:</strong> Advanced algorithms can detect leading questions, double-barreled items, and other common survey pitfalls before they affect your data.</li>
        <li><strong>Optimize survey length:</strong> AI can analyze your research goals and suggest the optimal number of questions to maximize response rates while minimizing survey fatigue.</li>
        <li><strong>Personalize respondent experience:</strong> Adaptive surveys that change based on previous answers are now possible at scale, creating more engaging experiences for participants.</li>
      </ul>

      <h3>Real-World Applications</h3>
      <p>The impact of AI in survey design is already being felt across various sectors. Academic researchers are using AI to create more valid and reliable instruments for their studies. Market research firms are leveraging these tools to reduce time-to-insight from weeks to days. Even UX researchers are finding value in AI-generated surveys for user feedback collection.</p>

      <blockquote>
        <p>"AI doesn't replace the researcher's expertise—it amplifies it. By handling the tedious aspects of survey creation, it frees us to focus on strategic thinking and insight generation."</p>
        <footer>— Dr. James Chen, Behavioral Economics Researcher</footer>
      </blockquote>

      <h3>The Human Element Remains Crucial</h3>
      <p>While AI brings incredible capabilities to survey design, the human touch remains irreplaceable. Understanding context, cultural nuances, and the subtle art of question phrasing still requires human judgment. The most successful research teams are those that combine AI efficiency with human expertise.</p>

      <h3>Looking Ahead</h3>
      <p>As we look to the future, we can expect even more sophisticated AI tools for survey research. From predictive analytics that can forecast survey performance to automated insight generation that highlights key findings in real-time, the possibilities are exciting. However, the fundamental goal remains the same: to understand people better through thoughtful, well-designed research.</p>

      <h3>Getting Started with AI-Powered Surveys</h3>
      <p>For researchers looking to embrace this transformation, the key is to start small and iterate. Begin by using AI tools for specific aspects of survey design, such as question generation or formatting. As you become more comfortable with these tools, you can expand their role in your research workflow.</p>

      <p>The future of survey design is here, and it's more accessible, efficient, and insightful than ever before. By embracing AI while maintaining human oversight, researchers can unlock new possibilities and deliver better insights faster than ever.</p>
    `
  },
  "2": {
    id: 2,
    title: "10 Common Survey Mistakes and How to Avoid Them",
    date: "March 12, 2024",
    author: "Michael Torres",
    authorTitle: "Senior Research Methodologist",
    image: "/Surbee Art/u7411232448_a_drone_top_view_looking_straight_down_colorful_bur_38ad15d7-b5a3-4398-b147-29c92e90c780.png",
    content: `
      <h2>Crafting the perfect survey is both an art and a science.</h2>
      <p>Even the most experienced researchers can fall into common traps that compromise data quality and lead to misleading conclusions. Understanding these pitfalls is the first step toward creating more effective surveys that deliver reliable insights.</p>

      <h3>1. Leading Questions</h3>
      <p>One of the most common mistakes is asking questions that subtly guide respondents toward a particular answer. For example, "Don't you agree that our new product is amazing?" primes respondents to think positively. Instead, use neutral language: "How would you rate our new product?"</p>

      <h3>2. Double-Barreled Questions</h3>
      <p>Questions that ask about two things at once can confuse respondents and produce unusable data. "How satisfied are you with our product quality and customer service?" forces respondents to give one answer for two distinct concepts. Always split these into separate questions.</p>

      <h3>3. Ambiguous Language</h3>
      <p>Words like "often," "sometimes," or "rarely" mean different things to different people. Instead, provide specific frequency options: "Never," "1-2 times per month," "3-5 times per month," etc.</p>

      <h3>4. Acronyms and Jargon</h3>
      <p>Never assume respondents understand industry-specific terms. If you must use technical language, provide a brief explanation. Remember, your respondents might not share your expertise.</p>

      <h3>3. Survey Fatigue</h3>
      <p>Long surveys inevitably lead to rushed answers and drop-offs. Research shows response rates drop significantly after the 5-10 minute mark. Focus on essential questions and consider breaking longer surveys into multiple shorter ones.</p>

      <h3>6. Inadequate Response Options</h3>
      <p>Forcing respondents into categories that don't fit creates data gaps. Always include "Other" with an open text field, and consider "Prefer not to answer" for sensitive questions.</p>

      <h3>7. Question Order Bias</h3>
      <p>The sequence of questions can influence responses. Start with easy, engaging questions, then move to more specific ones. Save demographic questions for the end unless they're needed for screening.</p>

      <h3>8. Forgetting to Test</h3>
      <p>What seems clear to you might confuse others. Always pilot your survey with a small group before full deployment. This reveals issues with wording, navigation, and timing.</p>

      <h3>9. Ignoring Mobile Users</h3>
      <p>Over 40% of surveys are now completed on mobile devices. If your survey isn't mobile-friendly, you're alienating a huge portion of your audience. Test on various devices and screen sizes.</p>

      <h3>10. No Clear Purpose</h3>
      <p>Every question should serve a specific research objective. Before writing, map out what decisions each data point will inform. If you can't articulate why you need a question, remove it.</p>

      <h3>Best Practices for Better Surveys</h3>
      <p>Avoiding these mistakes requires attention to detail and a user-centric approach. Keep your respondents in mind throughout the design process. Think about their time, their understanding, and their motivation to participate.</p>

      <p>Remember, good survey design isn't just about collecting data—it's about collecting meaningful data that drives better decisions. Take the time to craft thoughtful questions, test thoroughly, and iterate based on feedback.</p>
    `
  }
};


export default function BlogPost({ params }: { params: { id: string } }) {
  const post = blogPosts[params.id as keyof typeof blogPosts];
  const [mounted, setMounted] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setMounted(true);
    setCurrentUrl(window.location.href);
  }, []);

  if (!post) {
    notFound();
  }

  const sidebarWidthClass = "w-56";

  return (
    <ImageKitProvider urlEndpoint="https://ik.imagekit.io/on0moldgr">
    <div className={`min-h-screen w-full ${epilogue.variable}`} style={{ backgroundColor: "#FEFFFC", fontFamily: "var(--font-epilogue)" }}>
      {/* Top Navigation */}
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

      {/* Layout wrapper */}
      <div className="flex w-full">
        {/* Side Menu */}
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
          {/* Blog Post Header */}
          <RevealSection className="px-6 pb-8">
            {/* Back to Blog Link */}
            <Link
              href="/landing/blog"
              className="inline-flex items-center text-sm text-[#171717] hover:text-neutral-700 transition-colors mb-8"
            >
              <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blog
            </Link>
            <div className="max-w-4xl mx-auto text-center">
              {/* Hero Image */}
              <div className="mb-8">
                <div className="aspect-[16/9] w-full overflow-hidden rounded-lg">
                  <IKImage
                    src={post.image}
                    alt={post.title}
                    width={1920}
                    height={1080}
                    className="h-full w-full object-cover"
                    transformation={[{ width: 1536, quality: 85 }]}
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-[#171717] font-semibold leading-none tracking-[-0.96px] text-[48px] max-w-[800px] mx-auto mb-6 sm:text-[54px] sm:leading-[110%] sm:tracking-[-1.08px] xl:text-[70px] xl:leading-none xl:tracking-[-1.4px]">
                {post.title}
              </h1>

              {/* Author and Date */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
                    <span className="text-lg font-semibold text-[#171717]">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-[15px] font-medium text-[#171717]">
                      {post.author}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {post.authorTitle}
                    </p>
                  </div>
                </div>
                <span className="text-neutral-400">•</span>
                <time className="text-sm text-neutral-600">
                  {post.date}
                </time>
              </div>
            </div>
          </RevealSection>

          {/* Blog Post Content */}
          <RevealSection className="px-6 pb-12">
            <div className="max-w-3xl mx-auto">
              <div
                className="prose prose-lg max-w-none text-center"
                style={{
                  fontFamily: "var(--font-epilogue)",
                  color: "#171717"
                }}
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Article Footer */}
              <div className="mt-16 pt-8 border-t border-neutral-200">
                <div className="text-center">
                  <p className="text-[15px] text-neutral-600 mb-4">
                    Share this article
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    {mounted && (
                      <>
                        <a
                          href={`https://twitter.com/intent/text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(currentUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-[#171717] transition-colors"
                          aria-label="Share on Twitter"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                        <a
                          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neutral-400 hover:text-[#171717] transition-colors"
                          aria-label="Share on LinkedIn"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                        <button
                          onClick={() => navigator.clipboard.writeText(currentUrl)}
                          className="text-neutral-400 hover:text-[#171717] transition-colors"
                          aria-label="Copy link"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </main>
      </div>
    </div>
    </ImageKitProvider>
  );
}