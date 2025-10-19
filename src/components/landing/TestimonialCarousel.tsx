"use client";

import React, { useState } from "react";

export default function TestimonialCarousel() {
  const [currentIndex, setCurrentIndex] = useState(2); // Start with the third testimonial (index 2)

  const testimonials = [
    {
      text: "Thanks to Speakeasy, building and maintaining high-quality, language-idiomatic API clients became simple and efficient. We accelerated our release schedule without sacrificing code quality.",
      author: "Steve Calvert",
      role: "Software Engineer @ Glean",
      avatar: "https://www.speakeasy.com/_next/image?url=/assets/quote-headshots/steve-calvert.jpeg&w=96&q=75",
      srcSet: "/_next/image?url=%2Fassets%2Fquote-headshots%2Fsteve-calvert.jpeg&w=48&q=75 1x, /_next/image?url=%2Fassets%2Fquote-headshots%2Fsteve-calvert.jpeg&w=96&q=75 2x"
    },
    {
      text: "We've been using Speakeasy to create Dub's TypeScript SDK and it's been an amazing experience so far: Sublime DX + beautiful product.",
      author: "Steven Tey",
      role: "Founder @ Dub.co",
      avatar: "https://www.speakeasy.com/_next/image?url=/assets/quote-headshots/steven-tey.jpeg&w=96&q=75",
      srcSet: "/_next/image?url=%2Fassets%2Fquote-headshots%2Fsteven-tey.jpeg&w=48&q=75 1x, /_next/image?url=%2Fassets%2Fquote-headshots%2Fsteven-tey.jpeg&w=96&q=75 2x"
    },
    {
      text: "The MCP server we built using Speakeasy just works. It made becoming AI-native much simpler than we expected",
      author: "Constantine Nathanson",
      role: "Staff software engineer @ Cloudinary",
      avatar: "https://www.speakeasy.com/_next/image?url=/assets/quote-headshots/constantine-nathanson.jpeg&w=96&q=75",
      srcSet: "/_next/image?url=%2Fassets%2Fquote-headshots%2Fconstantine-nathanson.jpeg&w=48&q=75 1x, /_next/image?url=%2Fassets%2Fquote-headshots%2Fconstantine-nathanson.jpeg&w=96&q=75 2x"
    },
    {
      text: "Speakeasy is a beautiful and easy-to-manage product with a team fully committed to the developer experience that understands our needs.",
      author: "Leonardo Risch",
      role: "Engineering manager @ Latitude.sh",
      avatar: "https://www.speakeasy.com/_next/image?url=/assets/quote-headshots/leonardo-risch.jpeg&w=96&q=75",
      srcSet: "/_next/image?url=%2Fassets%2Fquote-headshots%2Fleonardo-risch.jpeg&w=48&q=75 1x, /_next/image?url=%2Fassets%2Fquote-headshots%2Fleonardo-risch.jpeg&w=96&q=75 2x"
    },
    {
      text: "Big thanks to Speakeasy for their partnership!",
      author: "Lee Robinson",
      role: "Developer experience @ Vercel",
      avatar: "https://www.speakeasy.com/_next/image?url=/assets/quote-headshots/lee-rob.jpeg&w=96&q=75",
      srcSet: "/_next/image?url=%2Fassets%2Fquote-headshots%2Flee-rob.jpeg&w=48&q=75 1x, /_next/image?url=%2Fassets%2Fquote-headshots%2Flee-rob.jpeg&w=96&q=75 2x"
    },
    {
      text: "Helping our customers ship as quickly as possible is our #1 priority. Speakeasy has made it so that we can provide first-class devex for our API users across any platform. Faster ship times = immediate ROI for both our customers and us.",
      author: "Nick Gomez",
      role: "Co-founder & CEO @ Inkeep",
      avatar: "https://www.speakeasy.com/_next/image?url=/assets/quote-headshots/nick-gomez.jpeg&w=96&q=75",
      srcSet: "/_next/image?url=%2Fassets%2Fquote-headshots%2Fnick-gomez.jpeg&w=48&q=75 1x, /_next/image?url=%2Fassets%2Fquote-headshots%2Fnick-gomez.jpeg&w=96&q=75 2x"
    },
    {
      text: "I am super impressed with the generated SDK... When DX is your moat, it is super hard to outsource this, but Speakeasy makes it possible",
      author: "Andreas Thomas",
      role: "Co-founder & CTO @ Unkey",
      avatar: "https://www.speakeasy.com/_next/image?url=/assets/quote-headshots/andreas-thomas.jpeg&w=96&q=75",
      srcSet: "/_next/image?url=%2Fassets%2Fquote-headshots%2Fandreas-thomas.jpeg&w=48&q=75 1x, /_next/image?url=%2Fassets%2Fquote-headshots%2Fandreas-thomas.jpeg&w=96&q=75 2x"
    },
    {
      text: "I can't recommend Speakeasy enough!",
      author: "Pontus Abrahamsson",
      role: "Co-founder @ Midday & Languine",
      avatar: "https://www.speakeasy.com/_next/image?url=/assets/quote-headshots/pontus-abrahamsson.jpeg&w=96&q=75",
      srcSet: "/_next/image?url=%2Fassets%2Fquote-headshots%2Fpontus-abrahamsson.jpeg&w=48&q=75 1x, /_next/image?url=%2Fassets%2Fquote-headshots%2Fpontus-abrahamsson.jpeg&w=96&q=75 2x"
    },
    {
      text: "The Speakeasy team has been fantastic. The support feels like a real partnership, making all the difference.",
      author: "Greg Poirier",
      role: "Director of engineering @ SolarWinds",
      avatar: "https://www.speakeasy.com/_next/image?url=/assets/quote-headshots/greg-poirier.jpeg&w=96&q=75",
      srcSet: "/_next/image?url=%2Fassets%2Fquote-headshots%2Fgreg-poirier.jpeg&w=48&q=75 1x, /_next/image?url=%2Fassets%2Fquote-headshots%2Fgreg-poirier.jpeg&w=96&q=75 2x"
    }
  ];

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1));
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
                  className="max-w-[54.375rem] w-full mx-auto flex flex-col items-center gap-9.5 flex-[0_0_100%] justify-center"
                  style={{ opacity: index === currentIndex ? 1 : 0 }}
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
        <div className="w-full flex items-center justify-center gap-4.5">
          <div className="flex-shrink-0">
            <button
              onClick={goToPrevious}
              className="disabled:opacity-50 border-border transition-colors duration-300 w-10.5 h-10.5 border flex items-center justify-center hover:bg-neutral-300/10"
              aria-label="move to left"
            >
              <svg
                className="lucide lucide-chevron-left h-4 w-4"
                height="24"
                width="24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={goToNext}
              className="disabled:opacity-50 border-border transition-colors duration-300 w-10.5 h-10.5 border flex items-center justify-center hover:bg-neutral-300/10"
              aria-label="move to right"
            >
              <svg
                className="lucide lucide-chevron-right h-4 w-4"
                height="24"
                width="24"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
        <div
          className="pointer-events-none absolute top-0 left-0 h-full w-[20%] transition-opacity duration-500 z-10 bg-gradient-to-r from-white to-transparent"
          aria-hidden="true"
          style={{ opacity: 0 }}
        />
        <div
          className="pointer-events-none absolute top-0 right-0 h-full w-[20%] transition-opacity duration-500 z-10 bg-gradient-to-l from-white to-transparent"
          aria-hidden="true"
          style={{ opacity: 0 }}
        />
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@font-face {
  font-family: 'Tobias';
  src: url('/fonts/Tobias-TRIAL-Thin.ttf') format('truetype');
  font-weight: 100;
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
