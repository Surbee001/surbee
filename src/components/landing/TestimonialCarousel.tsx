"use client";

import React, { useState } from "react";

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(2); // Start with the third testimonial (index 2)
  const [showFade, setShowFade] = useState(false);

  const testimonials = [
    {
      text: "Surbee transformed how I conduct research. The AI-powered survey generation is incredibly intuitive - I just describe what I need and get professional-quality surveys in minutes. It's like having a research assistant that never sleeps.",
      author: "Dr. Sarah Martinez",
      role: "Research Psychologist @ Stanford University",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=96&q=75",
      srcSet: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=48&q=75 1x, https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=96&q=75 2x"
    },
    {
      text: "As a busy startup founder, I need tools that just work. Surbee's fraud detection caught several suspicious responses that I would have missed otherwise. The data quality is incredible - it's saved us thousands in bad decisions.",
      author: "Marcus Chen",
      role: "CEO @ GrowthTech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=75",
      srcSet: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&q=75 1x, https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=75 2x"
    },
    {
      text: "I've tried every survey tool out there, but Surbee is different. The conditional logic and skip patterns work flawlessly, and the real-time analytics help me understand my audience like never before. My response rates have doubled.",
      author: "Jennifer Walsh",
      role: "UX Researcher @ Meta",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&q=75",
      srcSet: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&q=75 1x, https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&q=75 2x"
    },
    {
      text: "The behavioral tracking in Surbee is a game-changer for academic research. I can see exactly how participants interact with my surveys, which helps me design better studies. The fraud detection keeps my data clean and reliable.",
      author: "Prof. David Kim",
      role: "Professor of Sociology @ UCLA",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&q=75",
      srcSet: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&q=75 1x, https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&q=75 2x"
    },
    {
      text: "Surbee makes survey creation feel effortless. I went from spending hours crafting questions to having professional surveys ready in 15 minutes. The AI understands context amazingly well - it's like it reads my mind.",
      author: "Alex Rodriguez",
      role: "Product Manager @ Spotify",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&q=75",
      srcSet: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&q=75 1x, https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&q=75 2x"
    },
    {
      text: "What impresses me most about Surbee is the attention to detail. From the beautiful survey designs to the comprehensive analytics, everything works together seamlessly. It's become an essential part of our research workflow.",
      author: "Maria Santos",
      role: "Head of Customer Insights @ Airbnb",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&q=75",
      srcSet: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=48&q=75 1x, https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&q=75 2x"
    },
    {
      text: "The community features in Surbee are fantastic. I can share surveys with my research group and get feedback instantly. The collaboration tools make academic research so much more efficient and enjoyable.",
      author: "Dr. Priya Patel",
      role: "Assistant Professor @ MIT",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&q=75",
      srcSet: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=48&q=75 1x, https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&q=75 2x"
    },
    {
      text: "Surbee's real-time fraud detection gives me peace of mind. I know that the responses I'm analyzing are genuine, which is crucial for market research. The accuracy scores help me identify and focus on the most reliable data.",
      author: "Thomas Anderson",
      role: "Market Research Director @ Nielsen",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=96&q=75",
      srcSet: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=48&q=75 1x, https://images.unsplash.com/photo-1560250097-0b93528c311a?w=96&q=75 2x"
    },
    {
      text: "I love how Surbee handles complex survey logic. The skip patterns and conditional questions work perfectly, and the preview mode lets me test everything before launching. It's made my job so much easier.",
      author: "Rachel Green",
      role: "Senior Survey Designer @ Qualtrics",
      avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=96&q=75",
      srcSet: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=48&q=75 1x, https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=96&q=75 2x"
    }
  ];

  const goToPrevious = () => {
    setShowFade(true);
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
    setTimeout(() => setShowFade(false), 500);
  };

  const goToNext = () => {
    setShowFade(true);
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
    setTimeout(() => setShowFade(false), 500);
  };

  return (
    <>
      <div className="w-full max-w-[1140px] mx-auto py-48 md:py-64 px-6 h-fit flex flex-col items-center gap-10.5 relative overflow-hidden">
        <svg
          className="absolute w-24 h-auto md:top-[calc(50%-2.5rem)] md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full text-gray-200"
          height="367"
          width="1147"
          fill="none"
          viewBox="0 0 1147 367"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M95.0753 351.094C65.455 351.094 41.963 340.369 24.5993 318.92C8.25706 297.471 0.0859375 269.893 0.0859375 236.187C0.0859375 178.99 14.3854 131.495 42.9844 93.7034C72.6047 54.8905 114.992 23.7381 170.147 0.246094L174.744 17.0991C140.016 36.5055 109.375 61.0189 82.8186 90.6392C56.2624 120.26 42.4737 157.03 41.4523 200.949C56.7731 188.693 74.1368 182.564 93.5432 182.564C118.057 182.564 137.974 190.225 153.295 205.546C169.637 219.845 177.808 238.741 177.808 262.233C177.808 287.768 169.637 309.217 153.295 326.581C137.974 342.923 118.567 351.094 95.0753 351.094ZM346.337 351.094C316.717 351.094 293.225 340.369 275.861 318.92C259.519 297.471 251.348 269.893 251.348 236.187C251.348 178.99 265.648 131.495 294.246 93.7034C323.867 54.8905 366.255 23.7381 421.41 0.246094L426.006 17.0991C391.279 36.5055 360.637 61.0189 334.081 90.6392C307.525 120.26 293.736 157.03 292.714 200.949C308.035 188.693 325.399 182.564 344.805 182.564C369.319 182.564 389.236 190.225 404.557 205.546C420.899 219.845 429.07 238.741 429.07 262.233C429.07 287.768 420.899 309.217 404.557 326.581C389.236 342.923 369.829 351.094 346.337 351.094Z"
            fill="currentColor"
          />
          <path
            d="M1051.26 15.567C1080.88 15.567 1103.86 26.2916 1120.2 47.7408C1137.56 69.19 1146.25 96.7676 1146.25 130.473C1146.25 187.671 1131.44 235.677 1101.82 274.49C1073.22 312.281 1031.34 342.923 976.184 366.415L971.588 349.562C1006.32 330.155 1036.96 305.642 1063.51 276.022C1090.07 246.401 1103.86 209.631 1104.88 165.711C1089.56 177.968 1072.19 184.096 1052.79 184.096C1028.28 184.096 1007.85 176.947 991.505 162.647C976.184 147.326 968.524 127.92 968.524 104.428C968.524 78.8932 976.184 57.9547 991.505 41.6124C1007.85 24.2488 1027.76 15.567 1051.26 15.567ZM799.994 15.567C829.615 15.567 852.596 26.2916 868.938 47.7408C886.302 69.19 894.984 96.7676 894.984 130.473C894.984 187.671 880.173 235.677 850.553 274.49C821.954 312.281 780.077 342.923 724.922 366.415L720.326 349.562C755.053 330.155 785.695 305.642 812.251 276.022C838.807 246.401 852.596 209.631 853.617 165.711C838.297 177.968 820.933 184.096 801.527 184.096C777.013 184.096 756.585 176.947 740.243 162.647C724.922 147.326 717.262 127.92 717.262 104.428C717.262 78.8932 724.922 57.9547 740.243 41.6124C756.585 24.2488 776.502 15.567 799.994 15.567Z"
            fill="currentColor"
          />
        </svg>
        <div className="w-full cursor-grab active:cursor-grabbing relative">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translate3d(-${currentIndex * 100}%, 0px, 0px)` }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={index} className="flex-[0_0_100%] min-w-0 flex flex-col justify-center">
                <blockquote
                  className={`max-w-[54.375rem] w-full mx-auto flex flex-col items-center gap-9.5 flex-[0_0_100%] justify-center transition-opacity duration-500 ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <p className="text-balance text-center text-black" style={{ fontSize: '51px', fontFamily: 'Tobias, "Tobias Fallback", serif', fontWeight: 100, letterSpacing: '-2px', lineHeight: '51px' }}>
                    <span>
                      {testimonial.text}
                    </span>
                  </p>
                  <footer className="flex items-center gap-3">
                    <div className="w-10 h-10 relative overflow-hidden">
                      <img
                        className="w-full h-full object-cover grayscale"
                        height={40}
                        width={40}
                        alt={testimonial.author}
                        src={testimonial.avatar}
                        srcSet={testimonial.srcSet}
                        style={{ color: "transparent" }}
                      />
                    </div>
                    <div className="uppercase bsmnt-text-body-xs font-normal font-mono text-black">
                      <p className="leading-none">{testimonial.author} // </p>
                      <p>{testimonial.role}</p>
                    </div>
                  </footer>
                </blockquote>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full flex items-center justify-center gap-4 mt-8">
          <button
            onClick={goToPrevious}
            className="group relative bg-white border border-gray-200 rounded-full p-3 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Previous testimonial"
          >
            <svg
              className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <div className="absolute inset-0 rounded-full bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
          </button>

          <button
            onClick={goToNext}
            className="group relative bg-white border border-gray-200 rounded-full p-3 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            aria-label="Next testimonial"
          >
            <svg
              className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <div className="absolute inset-0 rounded-full bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -z-10"></div>
          </button>
        </div>
        <div
          className={`pointer-events-none absolute top-0 left-0 h-full w-[15%] z-10 bg-gradient-to-r from-white via-white/80 to-transparent transition-opacity duration-300 ${
            showFade ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />
        <div
          className={`pointer-events-none absolute top-0 right-0 h-full w-[15%] z-10 bg-gradient-to-l from-white via-white/80 to-transparent transition-opacity duration-300 ${
            showFade ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@font-face {
  font-family: 'Tobias';
  src: url('/fonts/Tobias-TRIAL-Light.ttf') format('truetype');
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}

html {
  font-size: 1rem;
  line-height: var(--tw-leading,calc(1.5/1));
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "rlig", "calt", "ss01";
  -webkit-tap-highlight-color: transparent;
  overflow-x: hidden;
  color-scheme: light;
}
`,
        }}
      />
    </>
  );
}
