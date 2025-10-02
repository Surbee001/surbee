'use client';

import React, { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

export default function WisprFlowLanding() {
  // State for A/B testing and dynamic content
  const [subheaderVariant, setSubheaderVariant] = useState('control');
  const [userPlatform, setUserPlatform] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [heroOpacity, setHeroOpacity] = useState(0);

  // Refs for DOM manipulation
  const heroWrapperRef = useRef<HTMLDivElement>(null);

  // A/B test content variants
  const getVariantContent = (variant: string) => {
    switch (variant) {
      case 'ai-voice-keyboard':
        return {
          subheader: 'The AI voice keyboard that makes you 4x faster in all your apps.'
        };
      case 'voice-to-text-ai':
        return {
          subheader: 'The voice-to-text AI that turns speech into clear, polished writing in every app.'
        };
      case 'effortless-voice-dictation':
        return {
          subheader: 'Effortless voice dictation in every application: 4x faster than typing.'
        };
      case 'speech-to-text-ai':
        return {
          subheader: 'Speech-to-text + AI inside all your apps on desktop and iPhone.'
        };
      default:
        return {
          subheader: 'Effortless voice dictation in every application: 4x faster than typing, AI commands and auto-edits.'
        };
    }
  };

  // Platform detection
  const detectPlatform = () => {
    if (typeof window === 'undefined') return 'unknown';

    const userAgent = navigator.userAgent;
    if (/Mac/.test(userAgent)) {
      if (/Intel/.test(userAgent)) return 'mac_intel';
      else if (/Apple/.test(userAgent)) return 'mac_m1';
      else return 'mac_unknown';
    } else if (/Win/.test(userAgent)) {
      return 'Windows';
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
      return 'iOS';
    }
    return 'unknown';
  };

  // Cookie utilities
  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(";");
    const cookie = cookies.find((c) => c.trim().startsWith(name + "="));
    return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
  };

  const setCookie = (name: string, value: string, days: number) => {
    if (typeof document === 'undefined') return;
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + days * 24 * 60 * 60 * 1000);
    const domain = window.location.hostname.includes('wisprflow.ai') ? '.wisprflow.ai' : window.location.hostname;
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expiryDate.toUTCString()};path=/;domain=${domain};Secure;`;
  };

  // OS-specific text for download buttons
  const getOSText = (platform: string) => {
    switch (platform) {
      case 'mac_m1':
      case 'mac_intel':
      case 'mac_unknown':
        return 'Download for macOS';
      case 'Windows':
      case 'win_unknown':
        return 'Download for Windows';
      case 'iOS':
        return 'Download for iOS';
      default:
        return 'Download for free';
    }
  };

  // Initialize effects
  useEffect(() => {
    // Handle URL parameters for promo and referral codes
    const urlParams = new URLSearchParams(window.location.search);
    const promo = urlParams.get('promo_code');
    const referral = urlParams.get('referral');

    if (promo) {
      setPromoCode(promo);
      setCookie('promo_code', promo, 30);
    }

    if (referral) {
      setReferralCode(referral);
      setCookie('referral', referral, 30);
    }

    // Detect platform
    const platform = detectPlatform();
    setUserPlatform(platform);

    // Check existing A/B test variant from cookie
    const existingVariant = getCookie("homepage-subheader");
    if (existingVariant && existingVariant !== "control") {
      setSubheaderVariant(existingVariant);
    }

    // Show hero after setup
    setTimeout(() => {
      setHeroOpacity(1);
      if (heroWrapperRef.current) {
        heroWrapperRef.current.classList.remove('min-100svh');
      }
    }, 100);
  }, []);

  // Handle CTA click tracking
  const handleCTAClick = (location: string, type: string, href: string) => {
    // Add analytics tracking here
    console.log('CTA clicked:', { location, type, href });
  };

  return (
    <>{/* External Scripts */}
      <Script
        src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db%2F6544eda5f000985a163a8687%2F68c93c62c7911406d96f138f%2Ffinsweetcomponentsconfig-1.0.0.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@tanay-wispr/webflow-package@5.0.4/dist/global.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/swiper@8/swiper-bundle.min.js"
        strategy="afterInteractive"
      />

      {/* Custom Styles */}
      <style jsx>{`
        .hero-wrapper {
          opacity: ${heroOpacity};
          transition: opacity 0.3s ease;
        }

        .fs-rangeslider_handle:focus-visible {
          outline: 0rem solid transparent !important;
        }

        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-smoothing: antialiased;
          text-rendering: optimizeLegibility;
        }

        *[tabindex]:focus-visible,
        input[type="file"]:focus-visible {
          outline: 0.125rem solid #4d65ff;
          outline-offset: 0.125rem;
        }

        .inherit-color * {
          color: inherit;
        }

        .w-richtext > :not(div):first-child,
        .w-richtext > div:first-child > :first-child {
          margin-top: 0 !important;
        }

        .w-richtext>:last-child,
        .w-richtext ol li:last-child,
        .w-richtext ul li:last-child {
          margin-bottom: 0 !important;
        }

        .container-medium, .container-small, .container-large {
          margin-right: auto !important;
          margin-left: auto !important;
        }

        .text-style-3lines {
          display: -webkit-box;
          overflow: hidden;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .text-style-2lines {
          display: -webkit-box;
          overflow: hidden;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .hide {
          display: none !important;
        }

        @media screen and (max-width: 991px) {
          .hide, .hide-tablet {
            display: none !important;
          }
        }

        @media screen and (max-width: 767px) {
          .hide-mobile-landscape {
            display: none !important;
          }
        }

        @media screen and (max-width: 479px) {
          .hide-mobile {
            display: none !important;
          }
        }

        .margin-0 {
          margin: 0rem !important;
        }

        .padding-0 {
          padding: 0rem !important;
        }

        .spacing-clean {
          padding: 0rem !important;
          margin: 0rem !important;
        }

        .text-wrap-balance {
          text-wrap: balance !important;
        }

        .footer_link-block .icon-embed-xxsmall {
          opacity: 0;
          transform: translateX(-10px);
          transition: all 300ms;
        }

        .footer_link-block:hover .icon-embed-xxsmall {
          opacity: 1;
          transform: translateX(0);
        }

        .w-nav-overlay {
          margin-top: -10px !important;
          z-index: 1;
        }

        @media screen and (max-width: 992px) {
          .w-dropdown-toggle.w--open .nav_menu-dropdown-arrow {
            transform: rotate(180deg);
          }
        }

        .dropdown1_border-radius-wrap, .dropdown-border-right-overlay {
          opacity: 0;
        }

        .dropdown-link:hover .dropdown-link-text {
          color: #034f46;
        }

        .use-cases_card:hover .use-cases_arrow-icon {
          transform: translate(10px, -10px);
        }

        .hamburger_12_wrap {
          --thickness: 0.125rem;
          --gap: 0.375rem;
          --rotate: 45;
          --width: 100%;
        }

        .hamburger_12_wrap:hover .hamburger_12_line {
          width: 65%;
        }

        .hamburger_12_wrap:hover .hamburger_12_line:first-child {
          width: 85%;
        }

        .hamburger_12_wrap:hover .hamburger_12_line:last-child {
          width: 100%;
        }

        .w--open .hamburger_12_line {
          width: 100% !important;
          transform: scaleX(0);
        }

        .w--open .hamburger_12_line:first-child {
          transform: translateY(calc(var(--thickness) + var(--gap))) rotate(calc(var(--rotate) * 3 * 1deg));
        }

        .w--open .hamburger_12_line:last-child {
          transform: translateY(calc(var(--thickness) * -1 + var(--gap) * -1)) rotate(calc(var(--rotate) * 1deg));
        }

        #hero-svg path {
          fill: transparent;
        }

        #marquee-text-hero1 {
          font-size: inherit;
          font-weight: 400;
          fill: #1A1A1A;
          baseline-shift: -20%;
          opacity: 0.4;
        }

        #marquee-text-hero2 {
          font-size: inherit;
          font-weight: 600;
          fill: #fff;
          baseline-shift: -30%;
        }

        .clients_cms-wrapper {
          animation: logoTicker1 60s linear infinite;
        }

        @keyframes logoTicker1 {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-100%);
          }
        }

        @media (min-width:992px) {
          .clients_logo-image[alt="Superhuman"] {
            max-width: 15rem;
          }
        }

        @media (max-width:991px) {
          .clients_logo-image[alt="Superhuman"] {
            max-width: 11rem;
          }
        }

        @media (min-width:992px) {
          .clients_logo-image[alt="Clay"] {
            max-width: 9rem;
          }
        }

        @media (max-width:991px) {
          .clients_logo-image[alt="Clay"] {
            max-width: 8rem;
          }
        }

        #svg-trail path {
          fill: transparent;
        }

        #marquee-text-str {
          font-size: inherit;
          font-weight: 600;
          fill: #8d8d83;
        }

        #marquee-text {
          font-size: inherit;
          font-weight: 600;
          fill: #FFFFEB;
        }

        .testimonials_list-wrapper {
          animation: logoTicker 80s linear infinite;
        }

        @keyframes logoTicker {
          from {
            transform: translateX(0%);
          }
          to {
            transform: translateX(-100%);
          }
        }

        .flag {
          font-family: "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji", sans-serif;
        }

        [promo-wrap] {
          display: ${promoCode ? 'flex' : 'none'};
        }

        #heading-underline {
          stroke-width: 8 !important;
        }

        @media (max-width: 1024px) {
          #heading-underline {
            stroke-width: 12 !important;
          }
        }

        @media (max-width: 768px) {
          #heading-underline {
            stroke-width: 12 !important;
          }
        }

        @media (min-width:992px) and (max-width:1281px) {
          .banner {
            padding-top: 1rem;
            padding-bottom: 1rem;
          }

          .nav_spacer {
            height: 3.5rem;
          }

          .spacer-custom {
            padding-top: 15vw;
          }

          .hero_animation-wrapper-v2 {
            margin-top: -23vw;
          }
        }

        .nav_mobile-btn [apple-icon], .nav_mobile-btn [windows-icon] {
          width: 0.875rem;
          height: 0.875rem;
          margin-right: 4px;
        }

        @media (min-width:992px) and (max-width:1150px) {
          .spacer-custom {
            padding-bottom: 2rem;
          }
        }
      `}</style>

      <div className="page-wrapper">
        <div className="global-styles w-embed"></div>
        <div className="page-specific-css w-embed"></div>

        {/* Banner */}
        <div className="banner">
          <div className="text-wrap-balance">
            Learn more about the technical and research problems we&apos;re solving at Wispr
          </div>
          <a
            href="https://wisprflow.ai/post/technical-challenges"
            target="_blank"
            className="banner_text-link w-inline-block"
            rel="noopener noreferrer"
          >
            <div>Read Article</div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              viewBox="0 0 17 16"
              fill="none"
              className="banner_link-arrow"
            >
              <path
                d="M7.16675 10.6665L9.59768 8.23557C9.72788 8.10537 9.72788 7.8943 9.59768 7.7641L7.16675 5.33317"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>

        {/* Navigation */}
        <div className="nav_fixed">
          <div className="nav_spacer"></div>
          <div
            data-animation="default"
            data-collapse="medium"
            data-duration="400"
            data-easing="ease"
            data-easing2="ease"
            role="banner"
            className="nav_component w-nav"
          >
            <div className="nav_container-v2">
              <a
                href="/"
                id="w-node-_7957dad2-de7a-14a6-130e-6e11898d1050-63dfdea9"
                aria-current="page"
                className="nav_brand w-nav-brand w--current"
              >
                <img
                  src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/683215c6f233131a07d8bafc_navbar_logo.svg"
                  loading="lazy"
                  alt="Flow Logo"
                  className="nav_logo"
                />
              </a>

              <nav
                role="navigation"
                id="w-node-_7957dad2-de7a-14a6-130e-6e11898d1052-63dfdea9"
                className="nav_menu v2 w-nav-menu"
              >
                <div className="nav_menu-wrapper grid v2">
                  {/* Product Dropdown */}
                  <div
                    data-delay="200"
                    data-hover="true"
                    data-w-id="7957dad2-de7a-14a6-130e-6e11898d1054"
                    className="nav_menu-dropdown-toggle-v2 w-dropdown"
                  >
                    <div className="dropdown1_toggle v2 w-dropdown-toggle">
                      <div>Product</div>
                      <img
                        src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/6832181fdb427a83a4270c9a_dropdown_arrow.svg"
                        loading="lazy"
                        alt=""
                        className="nav_menu-dropdown-arrow"
                      />
                      <div className="dropdown-border-overlay"></div>
                      <div className="dropdown-border-right-overlay hide"></div>
                      <div className="dropdown1_border-radius-wrap hide">
                        <div className="dropdown1_border-radius"></div>
                      </div>
                    </div>
                    <nav className="dropdown-list-v2 w-dropdown-list">
                      <div className="dropdown-inside-wrap">
                        <div className="dropdown-wrap">
                          <div className="dropdown-list-heading">GET STARTED</div>
                          <a href="/use-cases" className="dropdown-link w-inline-block">
                            <img
                              src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/6871316154c9c063830781ef_ni-grid-plus.svg"
                              alt=""
                              className="dropdown-link-icon"
                            />
                            <div>
                              <div className="dropdown-link-text">Use cases</div>
                              <div className="dropdown-link-description">See how Flow fits into your day</div>
                            </div>
                          </a>
                          <a href="/workflows" className="dropdown-link w-inline-block">
                            <img
                              src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/68713160d632c852a4f6efee_ni-video.svg"
                              alt=""
                              className="dropdown-link-icon"
                            />
                            <div>
                              <div className="dropdown-link-text">Workflows</div>
                              <div className="dropdown-link-description">Build faster with voice-first processes</div>
                            </div>
                          </a>
                          <a href="/privacy" className="dropdown-link w-inline-block">
                            <img
                              src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/68a4e3e7e8b8d9988e10d0a2_lock%20(1).svg"
                              alt=""
                              className="dropdown-link-icon"
                            />
                            <div>
                              <div className="dropdown-link-text">Privacy & Security</div>
                              <div className="dropdown-link-description">Your data, your control</div>
                            </div>
                          </a>
                          <a href="https://docs.wisprflow.ai/" target="_blank" className="dropdown-link w-inline-block" rel="noopener noreferrer">
                            <img
                              src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/68713160a3f2ece629f48a35_Icon.svg"
                              alt=""
                              className="dropdown-link-icon"
                            />
                            <div>
                              <div className="dropdown-link-text">Help Center</div>
                              <div className="dropdown-link-description">Learn the ins and outs of Flow</div>
                            </div>
                          </a>
                        </div>
                      </div>
                    </nav>
                  </div>

                  {/* Business Link */}
                  <div className="nav-link-wrap">
                    <a href="/business" className="nav_menu-link w-inline-block">
                      <div>Business</div>
                    </a>
                  </div>

                  {/* Pricing Link */}
                  <div className="nav-link-wrap">
                    <a href="/pricing" className="nav_menu-link w-inline-block">
                      <div>Pricing</div>
                    </a>
                  </div>
                </div>
              </nav>

              {/* Mobile CTA */}
              <div className="nav_mobile-cta">
                <a
                  id="nav-mobile-download"
                  href="/get-started"
                  className="nav_mobile-btn w-button"
                  onClick={() => handleCTAClick('nav_mobile', 'download_for_free', '/get-started')}
                >
                  {promoCode && userPlatform === 'iOS' ? 'Download for iOS' :
                   promoCode ? 'Claim Free Month ðŸŽ' :
                   getOSText(userPlatform)}
                </a>
              </div>

              {/* Mobile Menu Button */}
              <div className="nav_button w-nav-button">
                <div className="hamburger_12_wrap">
                  <div className="hamburger_12_line"></div>
                  <div className="hamburger_embed w-embed"></div>
                  <div className="hamburger_12_line"></div>
                  <div className="hamburger_12_line"></div>
                </div>
              </div>

              {/* Desktop CTA */}
              <a
                id="nav-download"
                href="/get-started"
                className="nav_big-button button w-node-c3e00823-9abf-42db-4599-adf2322aefc8-63dfdea9 w-inline-block"
                onClick={() => handleCTAClick('navbar', 'download_for_free', '/get-started')}
              >
                <div>{getOSText(userPlatform)}</div>
              </a>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="main-wrapper">
          <div
            ref={heroWrapperRef}
            className="hero-wrapper min-100svh"
            style={{ opacity: heroOpacity }}
          >
            <section className="section_hero">
              <div className="spacer-custom"></div>

              {/* Promo Banner */}
              {promoCode && (
                <div className="promo-wrap homepage" style={{ display: 'flex' }}>
                  <div className="promo-div homepage">
                    <div>
                      {userPlatform === 'iOS'
                        ? `Use "${promoCode.toUpperCase()}" at desktop checkout for a free month`
                        : `Exclusive invite from ${promoCode.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')} â†’ Free month unlocked`
                      }
                    </div>
                  </div>
                </div>
              )}

              <div className="padding-global">
                <div className="padding-bottom padding-xxlarge">
                  <div className="container-medium">
                    <div className="hero_content text-align-center">
                      <h1 className="text-wrap-balance">
                        <span className="text-color-black20">Don&apos;t type,</span> just speak
                      </h1>
                      <div className="spacer-large"></div>
                      <div className="max-width-medium align-center">
                        <p className="text-size-large text-weight-semibold text-wrap-balance">
                          {getVariantContent(subheaderVariant).subheader}
                        </p>
                        <div className="spacer-medium"></div>
                        <div id="hero-button-group" className="button-group">
                          <div className="hide">
                            <img
                              src="https://cdn.prod.website-files.com/6838259bd246e848c14f0840/683829796f346a9a6f931363_apple.png"
                              alt=""
                              className="download_button-icon homepage"
                            />
                            <img
                              src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/686d4881d944a4b80f7d047e_windows.svg"
                              alt=""
                              className="download_button-icon homepage"
                            />
                          </div>
                          <a
                            href="/get-started"
                            className="button w-inline-block"
                            onClick={() => handleCTAClick('home_hero_section', 'download', '/get-started')}
                          >
                            <div>
                              {promoCode && userPlatform !== 'iOS' ? 'Claim Free Month ðŸŽ' : getOSText(userPlatform)}
                            </div>
                          </a>
                        </div>
                        <div className="spacer-medium"></div>
                        <div className="text-size-small text-color-black70">
                          Available on Mac, Windows and iPhone
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Hero Animation */}
            <div className="hero_animation-wrapper-v2">
              <div className="hero_animation is-left w-embed">
                <svg
                  id="hero-svg"
                  width="100%"
                  height="auto"
                  viewBox="0 0 1048 594"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    id="curve1"
                    d="M0.597656 50.924805C17.4612 143.2965 97.8522 293.141 284.508 353.548C440.828 399.056 583.839 294.067 500.618 184.7492C417.397 75.4309 238.217 282.098 499.258 441.668C551.913 477.802 817.468 561.26 1046.43 565.235"
                    stroke="white"
                  />
                  <text x="-3300">
                    <textPath id="marquee-text-hero1" xlinkHref="#curve1">
                      Umm, hope your week has started wellâ€¦I was talking to Cheyene earlier but reception was really bad and I think their going to handle the first part of the project, but I&apos;m not totally sure. Also, I told the team the the new timeline should be ready by Friday, although it&apos;s probably going to slip. There&apos;s been a lot of back and forth and honestly the the whole thing&apos;s been kind of chaotic, like nobody really knows what&apos;s going on so can you check in with them and see if the notes from yesterday&apos;s meeting were sent out, or if they&apos;re still waiting. I think Cheyene mentioned it but didn&apos;t confirm, and now I&apos;m a little lost.
                    </textPath>
                    <animate
                      id="marquee1-anim"
                      attributeName="x"
                      dur="35s"
                      values="-3300; 0"
                      repeatCount="indefinite"
                    />
                  </text>
                </svg>
              </div>
              <div className="hero_animation-lottie-bg"></div>
              <div
                className="hero_animation-lottie"
                data-w-id="20bf92f6-80b9-81b1-e99b-da6a036db0a1"
                data-animation-type="lottie"
                data-src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/683e1e4368e08951ef7080d5_Flow%20header%20animation_toasts_trimmed%20v2.lottie"
                data-loop="1"
                data-direction="1"
                data-autoplay="1"
                data-is-ix2-target="0"
                data-renderer="svg"
                data-default-duration="0"
                data-duration="0"
              ></div>
              <div className="hero_animation is-right w-embed">
                <svg
                  width="100%"
                  height="auto"
                  viewBox="0 0 1024 620"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    id="curve2"
                    d="M2.04309 563.872C111.592 558.268 316.491 554.016 517.963 490.064C703.017 431.323 875.319 444.531 1021.88 453.216"
                    stroke="#1A1A1A"
                    strokeWidth="30"
                  />
                  <text x="-4500">
                    <textPath id="marquee-text-hero2" xlinkHref="#curve2">
                      Hope your week is off to a good start. I was talking to Cheyene earlier, but the reception was really bad. I think they&apos;re going to handle the first part of the project, but I&apos;m not totally sure. I also told the team the new timeline should be ready by Friday â€” although it might slip. There&apos;s been a lot of back and forth, and honestly, the whole thing has been a bit chaotic. It feels like nobody really knows what&apos;s going on. Can you check in with them and see if the notes from yesterday&apos;s meeting were sent out, or if they&apos;re still waiting? I think Cheyene mentioned it, but didn&apos;t confirm â€” and now I&apos;m a little lost!
                    </textPath>
                    <animate
                      id="marquee2-anim"
                      attributeName="x"
                      dur="60s"
                      values="-4500; 0"
                      repeatCount="indefinite"
                    />
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Integrations Section */}
          <div
            data-w-id="9ebabd72-f963-4b5b-90e4-ce5c0c1355ea"
            className="section_integrations-clients"
          >
            <section
              data-w-id="1ec5bcfa-2dd7-75a6-30f7-be48ce0ca1df"
              className="section_app-integrations"
            >
              <div className="padding-global padding-section-xlarge">
                <div className="container-large">
                  <div className="integrations_grid">
                    <div
                      id="w-node-_98716837-3cd9-581b-b37b-7806f8b862df-59ff8fc2"
                      className="integrations_left"
                    >
                      <div
                        data-wf--integrations-light-color--variant="base"
                        className="home_integrations_chips-div"
                      >
                        <div className="home_integrations_chip">
                          <img
                            src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/6832323f127062351dc681c7_apple_symobl.svg"
                            loading="lazy"
                            alt=""
                            className="home_integrations_chip-logo apple"
                          />
                          <div className="text-color-alternate text-weight-bold">iOS</div>
                        </div>
                        <div className="home_integrations_chip">
                          <img
                            src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/6832323f127062351dc681c7_apple_symobl.svg"
                            loading="lazy"
                            alt=""
                            className="home_integrations_chip-logo apple"
                          />
                          <div className="text-color-alternate text-weight-bold">Mac</div>
                        </div>
                        <div className="home_integrations_chip">
                          <img
                            src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/6832323fbe339316d0a134c8_windows_symbol.svg.svg"
                            loading="lazy"
                            alt=""
                            className="home_integrations_chip-logo"
                          />
                          <div className="text-color-alternate text-weight-bold">Windows</div>
                        </div>
                      </div>
                      <div className="spacer-large"></div>
                      <h2 className="text-color-secondary">Write faster in all your apps, on any device</h2>
                      <div className="spacer-large"></div>
                      <div className="max-width-small align-center">
                        <p className="text-size-large">
                          Seamless speech-to-text in every application on your iPhone or computer.
                        </p>
                      </div>
                      <div className="spacer-medium"></div>
                      <a href="#" className="w-inline-block w-lightbox">
                        <div className="button is-secondary"
                             onClick={() => handleCTAClick('homepage', 'watch_in_action', '#')}>
                          <div>Watch in action</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Features Section */}
          <section className="section_features">
            <div className="padding-global">
              <div className="padding-section-large">
                <div className="container-large">
                  <div
                    data-w-id="00b13108-5923-428d-cb56-0f8bf509b42e"
                    className="features_grid-top"
                  >
                    <div className="features_content-left is-relative">
                      <img
                        src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/683c97bbbb11df97317068ad_Frame%2048096292-1.avif"
                        alt=""
                        className="features_content-bg-image is-home"
                      />
                      <div
                        data-is-ix2-target="1"
                        className="features_content-overlay"
                        data-w-id="49fd65dc-613f-a8b7-30e9-dc95b623b6c5"
                        data-animation-type="lottie"
                        data-src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/6840ba040dc28dd9071912c8_Flow%20-%20AI%20auto%20edits_v2.lottie"
                        data-loop="0"
                        data-direction="1"
                        data-autoplay="0"
                        data-renderer="svg"
                        data-default-duration="0"
                        data-duration="15"
                        data-ix2-initial-state="0"
                      ></div>
                    </div>
                    <div
                      id="w-node-e76aff3c-0f3d-329d-a32f-2461a06b2cc1-59ff8fc2"
                      className="features_content-right"
                    >
                      <div className="position-relative">
                        <div className="features_heading-span">
                          <div>
                            <h2 className="features_heading">
                              AI
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="100%"
                                viewBox="0 0 132 117"
                                fill="none"
                                className="features_heading-svg"
                              >
                                <path
                                  d="M71 12L73 4"
                                  stroke="#FFA946"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M91.75 23L99 14.5"
                                  stroke="#FFA946"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M110.545 35.6253L127.458 31.1232"
                                  stroke="#FFA946"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M105 62C108.158 63.3664 111.006 65.0694 114 66.75"
                                  stroke="#FFA946"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M93 94.75L101.25 105"
                                  stroke="#FFA946"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M62 99C62.6012 103.667 63.3333 108.333 64 113"
                                  stroke="#FFA946"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M35 90C32.7477 94.9825 29.7733 99.5866 29 105"
                                  stroke="#FFA946"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M19 68C14.6134 65.3005 9.34297 62 4 62"
                                  stroke="#FFA946"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M32 42C26.5986 39.5448 19.3693 35.054 16 30"
                                  stroke="#FFA946"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                />
                                <path
                                  d="M47 22C44.7667 18.65 43.574 14.6728 42 11"
                                  stroke="#FFA946"
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </h2>
                            <div>
                              <h2 className="features_heading">&nbsp;Auto Edits</h2>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="spacer-large"></div>
                      <p className="text-size-large">
                        Speak naturally and Flow transcribes and edits your voice, instantly. Rambled thoughts become clear,
                        perfectly formatted text, without the filler words or typos.
                      </p>
                      <div className="spacer-large"></div>
                      <div id="hero-button-group" className="button-group">
                        <div>
                          <a
                            href="/demo"
                            className="button is-icon is-secondary w-inline-block"
                            onClick={() => handleCTAClick('ai_auto_edits_section', 'web_demo', '/demo')}
                          >
                            <img
                              src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/68335d5ca4a30e3a678bf92d_mic-icon.svg"
                              loading="lazy"
                              alt=""
                              className="icon-1x1-small"
                            />
                            <div>Try Flow</div>
                          </a>
                        </div>
                        <a
                          href="/get-started"
                          className="button w-inline-block"
                          onClick={() => handleCTAClick('ai_auto_edits_section', 'download', '/get-started')}
                        >
                          <div>Download for free</div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="section_testimonials">
            <div className="padding-global">
              <div className="padding-top padding-section-medium">
                <div className="container-small">
                  <div className="testimonials_header">
                    <h2 className="testimonials_heading">
                      Love letters
                      <br />
                      to Flow
                    </h2>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      viewBox="0 0 785 525"
                      fill="none"
                      className="testimonials_svg"
                    >
                      <path
                        d="M383 2V102"
                        stroke="#034F46"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M546 101C546 75.8565 559.025 53.3813 563 29"
                        stroke="#034F46"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M634 138C644.156 128.056 655.728 119.802 666.185 110.183C669.924 106.743 675.729 103.675 678 99"
                        stroke="#034F46"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M706 253C716.647 253 728.358 246.026 737.807 242C748.683 237.366 759.454 233.08 770.029 227.877C773.23 226.301 781.482 222.987 783 220"
                        stroke="#034F46"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M722 381C742.831 381.982 794.123 420.282 779.376 405.688"
                        stroke="#034F46"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M583 401V458"
                        stroke="#034F46"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M411 418C411 449.023 410.603 479.983 410 511"
                        stroke="#034F46"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M250 438C229.974 458.141 212.54 480.596 192.138 500.5C186.12 506.371 173.245 523 163 523"
                        stroke="#034F46"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M77 386C52.0274 393.096 27.0333 400.106 2 407"
                        stroke="#034F46"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M113 273C88.7129 260.066 68.3931 241.333 45.9359 225.722C35.4663 218.445 24.885 211.318 14.2052 204.344C11.5236 202.594 8.69889 201.52 7 199"
                        stroke="#034F46"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      <path
                        d="M226 128C219.65 120.591 213.451 109.47 210.933 99.8586C210.17 96.9432 210.384 87.264 208 86"
                        stroke="#034F46"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="testimonials_cards-wrap">
              <div className="testimonials_list-wrapper marquee-scroll w-dyn-list">
                <div role="list" className="testimonials_list marquee-track w-dyn-items">
                  {/* Testimonial items */}
                  <div role="listitem" className="testimonials_list-item marquee-item w-dyn-item">
                    <img
                      src="https://cdn.prod.website-files.com/682fa12727f78b943ed45584/682fa36950b4ca6070d31f51_66fa5330efc2ea9ee13c9ce3_tara.avif"
                      loading="lazy"
                      alt=""
                      className="testimonials_dp"
                    />
                    <div className="text-size-large">
                      You&apos;re making texting actually delightful right now! Can see it becoming a can&apos;t live without product fast.
                    </div>
                    <div className="w-embed">
                      <div className="text-size-small">Tara Tan, Founding Partner at Strange Ventures</div>
                    </div>
                  </div>

                  <div role="listitem" className="testimonials_list-item marquee-item w-dyn-item">
                    <img
                      src="https://cdn.prod.website-files.com/682fa12727f78b943ed45584/682fa3689e1efd79fa200095_66fa520f120581ef1e6b05a1_rahul.avif"
                      loading="lazy"
                      alt=""
                      className="testimonials_dp"
                    />
                    <div className="text-size-large">This is the best AI product I&apos;ve used since ChatGPT</div>
                    <div className="w-embed">
                      <div className="text-size-small">Rahul Vohra, CEO, Superhuman</div>
                    </div>
                  </div>

                  <div role="listitem" className="testimonials_list-item marquee-item w-dyn-item">
                    <img
                      src="https://cdn.prod.website-files.com/682fa12727f78b943ed45584/682fa36889069f243f61febe_66fa53159cf55f631403262a_rich.avif"
                      loading="lazy"
                      alt=""
                      className="testimonials_dp"
                    />
                    <div className="text-size-large">
                      I have Parkinson&apos;s, and this app has just made my life so much easier using my Mac. I can&apos;t even explain the change that it has provided for me.
                    </div>
                    <div className="w-embed">
                      <div className="text-size-small">Rich Pankey, Indirect Sourcing Manager</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="spacer-large"></div>
            <div className="padding-global">
              <div className="container-large">
                <div className="use-cases_grid">
                  <a
                    href="/case-study/gaurav-vohra"
                    className="use-cases_card w-inline-block"
                    onClick={() => handleCTAClick('homepage', 'gaurav_cs', '/case-study/gaurav-vohra')}
                  >
                    <div className="use-cases_header-wrapper">
                      <div className="use-cases_header">
                        <div className="heading-style-h3 text-color-tertiary">4x faster responses</div>
                        <img
                          src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/6832f4c0f564096436858bdb_arrow-ne.svg"
                          loading="lazy"
                          alt=""
                          className="use-cases_arrow-icon"
                        />
                      </div>
                      <div className="text-size-large">The &quot;surprisingly fast&quot; advisor.</div>
                    </div>
                    <div className="use-cases_author-wrap">
                      <img
                        src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/68adad7636f0ab1d3b12582e_gaurav-v2%20(1).png"
                        alt=""
                        className="use-cases_author-headshot"
                      />
                      <div>
                        <div>Gaurav Vohra</div>
                        <div className="spacer-xxsmall"></div>
                        <div className="text-style-muted">Startup Advisor & Growth Leader</div>
                      </div>
                    </div>
                  </a>

                  <a
                    href="/case-study/writing-a-book-with-flow"
                    className="use-cases_card w-inline-block"
                    onClick={() => handleCTAClick('homepage', 'greg_cs', '/case-study/writing-a-book-with-flow')}
                  >
                    <div className="use-cases_header-wrapper">
                      <div className="use-cases_header">
                        <div className="heading-style-h3 text-color-tertiary">50+ hours saved</div>
                        <img
                          src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/6832f4c0f564096436858bdb_arrow-ne.svg"
                          loading="lazy"
                          alt=""
                          className="use-cases_arrow-icon"
                        />
                      </div>
                      <div className="text-size-large">
                        Before Flow, writing was a battle. Now, it&apos;s a conversation.
                      </div>
                    </div>
                    <div className="use-cases_author-wrap">
                      <img
                        src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/68adad76cd1cce8916b80878_greg-vx.png"
                        alt=""
                        className="use-cases_author-headshot"
                      />
                      <div>
                        <div>Greg Dickson</div>
                        <div className="spacer-xxsmall"></div>
                        <div className="text-style-muted">Author</div>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
              <div className="padding-bottom padding-section-large"></div>
            </div>
          </section>

          {/* Start Flowing CTA Section */}
          <section data-wf--pre-cta--variant="home" className="section_startflowing w-variant-e6b68f58-d27c-d53d-2623-e79f70a1fa20">
            <img
              src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/684a1953b2e8d8efc7769c8e_d11bc5e1021589f0030c972b07779ca99a1837fa.jpg"
              alt=""
              className="cta_bg"
            />
            <div className="padding-global padding-section-large">
              <div className="cta_content-wrap">
                <div className="cta_content">
                  <div className="text-wrapper">
                    <div className="cta_dot hide"></div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="100%"
                      viewBox="0 0 524 615"
                      fill="none"
                      preserveAspectRatio="none"
                      className="cta_svg"
                    >
                      <path
                        d="M0.391602 319.953C359.892 319.953 412.294 -6.54721 244.392 1.45428C95.409 8.55414 -47.1084 513.452 522.892 612.952C646.17 634.931 943.303 651.895 1145.61 543.915"
                        id="curve-cta"
                      />
                    </svg>
                    <h2 className="heading-style-h1">Start flowing</h2>
                  </div>
                  <div className="spacer-xlarge"></div>
                  <div className="spacer-xlarge"></div>
                  <div className="cta_content-wrap-inside">
                    <p className="text-size-large text-weight-semibold text-wrap-balance">
                      Effortless voice dictation in every application: 4x faster than typing, AI commands and auto-edits.
                    </p>
                    <div className="spacer-medium"></div>
                    <div className="button-group">
                      <a
                        href="/demo"
                        className="button is-icon is-secondary w-inline-block"
                        onClick={() => handleCTAClick('bottom_cta_section', 'try_flow', '/demo')}
                      >
                        <img
                          src="https://cdn.prod.website-files.com/682f84b3838c89f8ff7667db/68335d5ca4a30e3a678bf92d_mic-icon.svg"
                          loading="lazy"
                          alt=""
                          className="icon-1x1-small"
                        />
                        <div>Try Flow</div>
                      </a>
                      <a
                        href="https://wisprflow.onelink.me/PguH/lw5h199m"
                        className="button w-button"
                        onClick={() => handleCTAClick('bottom_cta_section', 'download', 'https://wisprflow.onelink.me/PguH/lw5h199m')}
                      >
                        Download for free
                      </a>
                    </div>
                    <div>
                      <div className="spacer-medium"></div>
                      <div className="text-size-small">Available on Mac, Windows and iPhone</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <div className="section_footer-wrapper">
          <footer className="section_footer">
            <div className="padding-global">
              <div className="footer_flex-links">
                <div className="footer_flex_inner">
                  <div className="footer_nav-links-wrap">
                    <a href="/use-cases" className="footer_link-block w-inline-block">
                      <div>Use cases</div>
                    </a>
                    <a href="/workflows" className="footer_link-block w-inline-block">
                      <div>Workflows</div>
                    </a>
                    <a href="/privacy" className="footer_link-block w-inline-block">
                      <div>Privacy & Security</div>
                    </a>
                    <a href="https://docs.wisprflow.ai/" target="_blank" className="footer_link-block w-inline-block" rel="noopener noreferrer">
                      <div>Help Center</div>
                    </a>
                  </div>
                </div>
                <div className="footer_flex_inner">
                  <div className="footer_nav-links-wrap">
                    <a href="/leaders" className="footer_link-block w-inline-block">
                      <div>Leaders</div>
                    </a>
                    <a href="/students" className="footer_link-block w-inline-block">
                      <div>Students</div>
                    </a>
                    <a href="/developers" className="footer_link-block w-inline-block">
                      <div>Developers</div>
                    </a>
                    <a href="/content-creators" className="footer_link-block w-inline-block">
                      <div>Creators</div>
                    </a>
                  </div>
                </div>
                <div className="footer_flex_inner">
                  <div className="footer_nav-links-wrap">
                    <a href="/blog" className="footer_link-block w-inline-block">
                      <div>Blog</div>
                    </a>
                    <a href="/about" className="footer_link-block w-inline-block">
                      <div>Company</div>
                    </a>
                    <a href="/careers" className="footer_link-block w-inline-block">
                      <div>Careers</div>
                    </a>
                    <a href="mailto:support+hello@wisprflow.ai" className="footer_link-block w-inline-block">
                      <div>Support</div>
                    </a>
                    <a href="/business" className="footer_link-block w-inline-block">
                      <div>Enterprise</div>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer_copyright-div">
              <div className="footer_copyright-content">
                <div className="footer_copyright-links-wrap">
                  <a href="/privacy-policy" className="footer_link-block is-legal w-inline-block">
                    <div>Privacy Policy</div>
                  </a>
                  <a href="/terms-of-service" className="footer_link-block is-legal w-inline-block">
                    <div>Terms of Service</div>
                  </a>
                  <a href="/cookie-policy" className="footer_link-block is-legal w-inline-block">
                    <div>Cookie Policy</div>
                  </a>
                </div>

                <div className="footer_socials-content">
                  <a href="https://x.com/wisprflow" target="_blank" className="footer_social-link w-inline-block" rel="noopener noreferrer">
                    <div className="footer_social-icons w-embed">
                      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
                      </svg>
                    </div>
                  </a>
                  <a href="https://www.linkedin.com/company/wisprflow/" target="_blank" className="footer_social-link w-inline-block" rel="noopener noreferrer">
                    <div className="footer_social-icons w-embed">
                      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/>
                      </svg>
                    </div>
                  </a>
                  <a href="https://www.instagram.com/wisprflow.ai/" target="_blank" className="footer_social-link w-inline-block" rel="noopener noreferrer">
                    <div className="footer_social-icons w-embed">
                      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="currentColor"/>
                      </svg>
                    </div>
                  </a>
                  <a href="https://www.youtube.com/@wisprflowai/" target="_blank" className="footer_social-link w-inline-block" rel="noopener noreferrer">
                    <div className="footer_social-icons w-embed">
                      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
                      </svg>
                    </div>
                  </a>
                  <a href="https://www.tiktok.com/@wisprflow.ai" target="_blank" className="footer_social-link w-inline-block" rel="noopener noreferrer">
                    <div className="footer_social-icons w-embed">
                      <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" fill="currentColor"/>
                      </svg>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}



