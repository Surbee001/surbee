'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';

export default function LandNewReact2() {
  // Typing effect logic
  const [typingText, setTypingText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [loopNum, setLoopNum] = React.useState(0);
  const [typingSpeed, setTypingSpeed] = React.useState(150);

  const prompts = React.useMemo(() => [
    "Create a customer satisfaction survey for a B2B SaaS product...",
    "Generate a 10-question market research survey for Gen Z...",
    "Build an employee engagement survey focusing on remote work...",
    "Design a product feedback form for a new mobile banking app."
  ], []);

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % prompts.length;
      const fullText = prompts[i];

      setTypingText(
        isDeleting
          ? fullText.substring(0, typingText.length - 1)
          : fullText.substring(0, typingText.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 50);

      if (!isDeleting && typingText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && typingText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [typingText, isDeleting, loopNum, typingSpeed, prompts]);

  useEffect(() => {
    // Initial html class manipulation
    !function(o: any,c: any){var n=c.documentElement,t=" w-mod-";n.className+=t+"js",("ontouchstart"in o||o.DocumentTouch&&c instanceof DocumentTouch)&&(n.className+=t+"touch")}(window,document);

    // Inline script for carousel logos
    const initCarousel = () => {
      let elements = document.querySelectorAll("a.dj-logo-linked");
      elements.forEach((e: any) => {
        if (e.getAttribute("href") === "#") {
          let parent = e.parentElement;
          let logo = e.firstChild;
          parent.appendChild(logo);
          e.remove();
        } else {
          e.classList.add("dj-link-clickable");
        }
      });
    };

    // Run initializations
    const timer = setTimeout(() => {
        initCarousel();
        document.body.style.backgroundColor = '#EEE9E5';
    }, 500);

    // Fallback: If main-wrapper is still invisible after 3 seconds, force show it
    const fallbackTimer = setTimeout(() => {
      const mainWrapper = document.querySelector('.main-wrapper') as HTMLElement;
      if (mainWrapper && getComputedStyle(mainWrapper).opacity === '0') {
        mainWrapper.style.opacity = '1';
        mainWrapper.style.transition = 'opacity 0.3s ease';
      }
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#EEE9E5', minHeight: '100vh', color: '#000', fontFamily: 'sans-serif' }} className="landnew-page-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        /* Reset Tailwind Preflight conflicts for this page scope */
        .landnew-page-wrapper img, .landnew-page-wrapper svg {
          display: inline-block;
          vertical-align: middle;
        }
        .landnew-page-wrapper a {
          color: inherit;
          text-decoration: none;
        }
        /* Ensure footer links are white in dark background */
        .footer--link.is--white-opacity {
          color: rgba(255, 255, 255, 0.6) !important;
        }
        .footer--link.is--white-opacity:hover {
          color: #fff !important;
        }
        .black--bg {
          background-color: #000;
          color: #fff;
        }
        .black--bg h1, .black--bg h2, .black--bg h3, .black--bg p, .black--bg div {
          color: inherit;
        }

        /* Kalice Regular Font */
        @font-face {
          font-family: 'Kalice Regular';
          src: url('/fonts/Kalice-Trial-Regular.otf') format('opentype');
        }

        /* Apply Kalice font to all serif titles */
        .landnew-page-wrapper h1,
        .landnew-page-wrapper h2,
        .landnew-page-wrapper h3 {
          font-family: 'Kalice Regular', serif;
        }
      `}} />
      <meta charSet="utf-8"/>
      <title>Surbee - The AI That Understands Your Questions</title>
      <meta content="Surbee understands your domain to generate accurate surveys from natural language. Features built-in 'Cipher' fraud detection for unmatched accuracy." name="description"/>
      <meta content="Surbee - The AI That Understands Your Questions" property="og:title"/>
      <meta content="Surbee understands your domain to generate accurate surveys from natural language. Features built-in 'Cipher' fraud detection for unmatched accuracy." property="og:description"/>
      <meta content="cdn.prod.website-files.com/67bdd03200678df04ba07593/67d45178862f7a080de6a4d2_Open%20Graph%20Image%20from%20TinyPNG.jpg" property="og:image"/>
      <meta content="Surbee - The AI That Understands Your Questions" property="twitter:title"/>
      <meta content="Surbee understands your domain to generate accurate surveys from natural language. Features built-in 'Cipher' fraud detection for unmatched accuracy." property="twitter:description"/>
      <meta content="cdn.prod.website-files.com/67bdd03200678df04ba07593/67d45178862f7a080de6a4d2_Open%20Graph%20Image%20from%20TinyPNG.jpg" property="twitter:image"/>
      <meta property="og:type" content="website"/>
      <meta content="summary_large_image" name="twitter:card"/>
      <meta content="width=device-width, initial-scale=1" name="viewport"/>
      
      <link href="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/css/deepjudge-staging.webflow.shared.5147e2e55.min.css" rel="stylesheet" type="text/css"/>
      <link href="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/68010a5ca6760aeae5cf6e74_Profile%20Photo%2001%20-%20Optical%20Adjustmet.png" rel="shortcut icon" type="image/x-icon"/>
      <link href="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/68010a3fcb9742b4b6c2426b_Profile%20Photo%2001%20-%20Optical%20Adjustmet.png" rel="apple-touch-icon"/>
      <link href="https://www.surbee.ai" rel="canonical"/>
      <link href="/landnew/deepjudge-code.netlify.app/style.css" rel="stylesheet" />

      {/* Google Tag Manager */}
      <Script id="gtm" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','GTM-PDQBBX4F');`}
      </Script>

      {/* Global Site Tag (gtag.js) - Google Analytics */}
      <Script async src="https://www.googletagmanager.com/gtag/js?id=G-BC1SHKMZSK" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('set', 'developer_id.dZGVlNj', true);gtag('config', 'G-BC1SHKMZSK');`}
      </Script>

      {/* CookieYes */}
      <Script id="cookieyes" type="text/javascript" src="cdn-cookieyes.com/client_data/10d383752e67728f24835874/script.js" />


      <div className="tag-gtn w-embed w-iframe">
        <noscript>
            <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PDQBBX4F"
                height="0" width="0" style={{display:'none', visibility:'hidden'}}></iframe>
        </noscript>
      </div>

      <div className="embed--typography w-embed">
        <style dangerouslySetInnerHTML={{__html: `
          html {
            font-size: calc(100vw/1440);
          }

          /* body settings */
          body {
            overflow-x:hidden;
            overflow: overlay;
            -webkit-font-smoothing: antialiased;
          }

          @media screen and (min-width: 1440px) {
            html {font-size: 1px;}
          }

          @media screen and (min-width: 768px) and (max-width: 991px) {
            html {font-size: calc(100vw/768);}
          }

          @media screen and (min-width: 480px) and (max-width: 767px) {
            html {font-size: calc(100vw/480);}
          }

          @media screen and (max-width: 479px) {
            html {font-size: calc(100vw/375);}
          }

          [class*="heading-"] {
            margin-top:0px;
            margin-bottom:0px;
          }

          [class*="text-"] {
            margin-top:0px;
            margin-bottom:0px;
          }

          .w-reset.w-editor-bem-EditorApp_Panel span,
          .w-reset.w-editor-bem-EditorApp_Panel h2,
          .w-reset.w-editor-bem-EditorApp_Panel h3,
          .w-reset.w-editor-bem-EditorApp_Panel h4,
          .w-reset.w-editor-bem-EditorApp_Panel h5,
          .w-reset.w-editor-bem-EditorApp_Panel h6
          {
            font-size:14px !important;
          }

          :root {
            --typography-font-size-title-large: 14px;
            --typography-font-size-body-large: 14px;
            --typography-font-size-body-medium: 24px;
            --typography-font-size-body-standard: 16px; 
          }

          .w-editor .main-wrapper {
            opacity:1 !important;
          }
          
          /* Force visibility to fix loading issues */
          .main-wrapper {
            opacity: 1 !important;
            transition: opacity 0.5s ease-in-out;
          }
        `}} />
      </div>

      <div className="embed--items w-embed">
        <style dangerouslySetInnerHTML={{__html: `
          [class*="image-wrapper"] {
            width:100%;
            position:relative;
            overflow:hidden;
          }

          [class*="overlay-"] {
            pointer-events:none;
          }

          [class*="container-"] {
            margin-left:auto;
            margin-right:auto;
            width:100%
          }

          .w-richtext > *:first-child { margin-top: 0; }
          .w-richtext > *:last-child { margin-bottom: 0; }

          @media screen and (max-width:991px) {
            [hidetablet="yes"] {
              display:none;
            }
          }

          @media screen and (min-width:991px) {
              div[data-wf--component-content--variant="big-title"] .richtext h2 {
            font-size: 64rem !important;
          }

          [data-wf--component-columns--variant="2-columns---image-right"] .content {
            max-width: 590rem;
          }

          [data-wf--component-columns--variant="2-columns---image-left"] .content {
            max-width: 590rem;
            order:9;
          }
          }
        `}} />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .blog--list .blog--item:nth-child(3n + 1) {
          background-color: #e6e0db;
          color: #000 !important;
        }

        .blog--list .blog--item:nth-child(3n + 1) .customerstory--img-wrapper {
          background-color: #c6b9ae;
        }

        .blog--list .blog--item:nth-child(3n + 2) {
          background-color: #cbc1f1;
          color: #000 !important;
        }

        .blog--list .blog--item:nth-child(3n + 2) .customerstory--img-wrapper {
          background-color: #9478fc;
        }

        .blog--list .blog--item:nth-child(3n + 3) {
          background-color: #ffffff;
          color: #000 !important;
        }

        .blog--list .blog--item:nth-child(3n + 3) .customerstory--img-wrapper {
          background-color: #ededed;
        }
        
        /* Force dark text in blog cards inside dark section */
        .blog--item h2, .blog--item p, .blog--item div, .blog--item a {
          color: #000 !important;
        }

        /* Ensure dot content fits text */
        .home--collective-start {
          width: auto !important;
          min-width: fit-content !important;
          max-width: 300px !important; /* Ensure it doesn't get too wide but allows growth */
          padding-left: 16px !important;
          padding-right: 16px !important;
        }
        .intranet {
          white-space: nowrap !important;
        }
        /* Footer link color fix for dark background */
        .footer--link {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
        }
        .footer--link:hover {
          color: #fff;
        }
        /* Fix footer logo color (if using SVG mask/fill) or ensure image is visible */
        .looter--logo-img {
          color: #fff;
        }

        /* Reduce spacing between logo and product button */
        .container--navbar {
          gap: 12px !important;
        }

        .navbar--menu {
          margin-left: 4px !important;
        }

        /* Ensure Get Started button stays in navbar */
        .btn--nav-wrapper {
          margin-left: auto !important;
        }
      `}} />

      <div className="bookademobg"></div>


      {/* New Sidestage-style Navbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .nav-new {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          padding: 20px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #EEE9E5;
          font-size: 16px !important;
        }
        .nav-new * {
          font-size: inherit;
        }
        .nav-new .nav-logo {
          height: 32px;
          width: auto;
        }
        .nav-new .nav-links-wrap {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .nav-new .nav-link-block {
          display: flex;
          align-items: center;
          gap: 3px;
          padding: 10px 16px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 14px !important;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: #1a1a1a;
          text-decoration: none;
          position: relative;
          cursor: pointer;
          line-height: 1.2;
        }
        .nav-new .nav-link-block .bracket {
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
          color: #1D402C;
          font-size: 14px !important;
        }
        .nav-new .nav-link-block .bracket-left {
          transform: translateX(8px);
        }
        .nav-new .nav-link-block .bracket-right {
          transform: translateX(-8px);
        }
        .nav-new .nav-link-block:hover .bracket {
          opacity: 1;
          transform: translateX(0);
        }
        .nav-new .nav-link-block .nav-text {
          position: relative;
          overflow: hidden;
          height: 17px;
        }
        .nav-new .nav-link-block .nav-text-main,
        .nav-new .nav-link-block .nav-text-hover {
          display: block;
          font-size: 14px !important;
          line-height: 17px;
        }
        .nav-new .nav-link-block .nav-text-main {
          transition: transform 0.25s ease;
        }
        .nav-new .nav-link-block .nav-text-hover {
          position: absolute;
          top: 0;
          left: 0;
          transform: translateY(100%);
          transition: transform 0.25s ease;
          color: #1D402C;
        }
        .nav-new .nav-link-block:hover .nav-text-main {
          transform: translateY(-100%);
        }
        .nav-new .nav-link-block:hover .nav-text-hover {
          transform: translateY(0);
        }

        /* Dropdown styles */
        .nav-new .nav-dropdown {
          position: relative;
        }
        .nav-new .nav-dropdown-menu {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(8px);
          background: #fff;
          border-radius: 12px;
          padding: 8px;
          min-width: 160px;
          border: 1px solid rgba(0,0,0,0.08);
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
        }
        .nav-new .nav-dropdown:hover .nav-dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(0);
        }
        .nav-new .nav-dropdown-menu a {
          display: block;
          padding: 10px 16px;
          font-size: 14px !important;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1a1a1a;
          text-decoration: none;
          border-radius: 8px;
          transition: background 0.15s ease;
          white-space: nowrap;
        }
        .nav-new .nav-dropdown-menu a:hover {
          background: #f5f3f0;
          color: #1D402C;
        }
        .nav-new .nav-dropdown .dropdown-arrow {
          width: 12px;
          height: 12px;
          margin-left: 4px;
          transition: transform 0.2s ease;
        }
        .nav-new .nav-dropdown:hover .dropdown-arrow {
          transform: rotate(180deg);
        }

        /* Get Started button - matches hero button */
        .nav-new .nav-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: #fff;
          color: #1a1a1a;
          font-family: 'Suisse intl mono', 'SF Mono', monospace;
          font-size: 12px !important;
          font-weight: 500;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          border-radius: 4px;
          text-decoration: none;
          position: relative;
          overflow: hidden;
          min-height: 45px;
          transition: color 0.2s ease;
        }
        .nav-new .nav-cta .hover-bg {
          position: absolute;
          inset: 0;
          background: #1D402C;
          transition: transform 0.2s ease;
        }
        .nav-new .nav-cta .hover-bg {
          top: auto;
          bottom: 0;
          height: 100%;
          transform: translateY(100%);
        }
        .nav-new .nav-cta:hover {
          color: #fff;
        }
        .nav-new .nav-cta:hover .hover-bg {
          transform: translateY(0);
        }
        .nav-new .nav-cta span,
        .nav-new .nav-cta svg {
          position: relative;
          z-index: 1;
        }
        .nav-new .nav-cta svg {
          width: 16px;
          height: 16px;
        }

        /* Mobile menu */
        .nav-new .nav-mobile-trigger {
          display: none;
          flex-direction: column;
          gap: 5px;
          cursor: pointer;
          padding: 8px;
        }
        .nav-new .nav-mobile-trigger span {
          width: 24px;
          height: 2px;
          background: #1a1a1a;
          transition: all 0.3s ease;
        }

        @media screen and (max-width: 991px) {
          .nav-new {
            padding: 16px 24px;
          }
          .nav-new .nav-links-wrap {
            display: none;
          }
          .nav-new .nav-cta {
            display: none;
          }
          .nav-new .nav-mobile-trigger {
            display: flex;
          }
        }
      `}} />

      <nav className="nav-new">
        <a href="/" aria-label="Surbee Home">
          <img src="/logo.svg" alt="Surbee" className="nav-logo" style={{ filter: 'brightness(0)' }} />
        </a>

        <div className="nav-links-wrap">
          <a href="/product" className="nav-link-block">
            <span className="bracket bracket-left">(</span>
            <span className="nav-text">
              <span className="nav-text-main">Product</span>
              <span className="nav-text-hover">Product</span>
            </span>
            <span className="bracket bracket-right">)</span>
          </a>

          <a href="/enterprise" className="nav-link-block">
            <span className="bracket bracket-left">(</span>
            <span className="nav-text">
              <span className="nav-text-main">Enterprise</span>
              <span className="nav-text-hover">Enterprise</span>
            </span>
            <span className="bracket bracket-right">)</span>
          </a>

          <a href="/pricing" className="nav-link-block">
            <span className="bracket bracket-left">(</span>
            <span className="nav-text">
              <span className="nav-text-main">Pricing</span>
              <span className="nav-text-hover">Pricing</span>
            </span>
            <span className="bracket bracket-right">)</span>
          </a>

          <div className="nav-dropdown">
            <div className="nav-link-block">
              <span className="bracket bracket-left">(</span>
              <span className="nav-text">
                <span className="nav-text-main">Company</span>
                <span className="nav-text-hover">Company</span>
              </span>
              <svg className="dropdown-arrow" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="bracket bracket-right">)</span>
            </div>
            <div className="nav-dropdown-menu">
              <a href="/about-us">About</a>
            </div>
          </div>

          <div className="nav-dropdown">
            <div className="nav-link-block">
              <span className="bracket bracket-left">(</span>
              <span className="nav-text">
                <span className="nav-text-main">Resources</span>
                <span className="nav-text-hover">Resources</span>
              </span>
              <svg className="dropdown-arrow" viewBox="0 0 12 12" fill="none">
                <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="bracket bracket-right">)</span>
            </div>
            <div className="nav-dropdown-menu">
              <a href="/news">News</a>
              <a href="/learn">Learn</a>
              <a href="/students">Students</a>
            </div>
          </div>
        </div>

        <Link href="/login" className="nav-cta">
          <div className="hover-bg"></div>
          <span>Get Started</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" fill="none">
            <path d="M0.564451 0.635007C1.00098 0.170908 1.85566 -0.0818191 2.48518 0.0238669C4.314 0.32714 4.02911 2.71656 6.38637 2.98307C7.72352 3.13471 8.40359 2.19732 9.75453 2.74873C10.5816 3.08876 11.0687 3.9756 11.0182 4.85325C10.9952 5.22086 10.816 5.65279 10.8206 6.03418C10.8436 8.13411 13.0676 9.61372 14.878 8.21682C16.3576 7.07725 15.6729 5.37709 16.9596 4.52241C18.9308 3.21742 21.2789 5.6482 19.9417 7.49081C18.8205 9.03474 16.9504 7.80786 15.5397 9.23233C14.6896 10.0916 14.9194 10.9141 14.4966 11.7918C14.1841 12.4351 13.4857 12.8992 12.7643 12.9543C11.3904 13.06 10.9676 11.9296 9.80967 11.5712C7.11238 10.7395 5.38465 13.7079 7.22726 15.8216C7.75109 16.419 8.49549 16.6166 8.61037 17.5677C8.97337 20.6878 4.97109 20.9543 4.43807 18.4775C4.07506 16.7912 5.92227 16.2535 5.16409 14.0295C4.78729 12.9221 3.78098 12.6924 3.45014 11.8929C3.19741 11.2817 3.19281 10.3535 3.56042 9.78373C4.09344 8.95203 4.75053 9.02095 5.50871 8.59821C7.13076 7.69299 7.63162 5.58846 6.0785 4.35699C5.37086 3.79639 4.62187 3.71368 3.73503 3.82856C2.84819 3.94344 2.47599 4.50403 1.37318 4.11805C-0.0604741 3.64016 -0.441862 1.70565 0.564451 0.635007ZM8.69767 6.98076C5.95443 7.38972 7.17671 11.7136 9.77751 10.4638C11.6063 9.58615 10.6827 6.68208 8.69767 6.98076Z" fill="currentColor"/>
          </svg>
        </Link>

        <div className="nav-mobile-trigger">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </nav>

      {/* Spacer for fixed navbar */}
      <div style={{ height: '70px' }}></div>

      <main className="main-wrapper">
        <section className="section is--hero">
          <style dangerouslySetInnerHTML={{__html: `
            .heading--96 {
              overflow: visible !important;
              padding-bottom: 32px;
              line-height: 1.1;
            }
            @media (max-width: 991px) {
              .hero-flex-container {
                flex-direction: column;
              }
              .hero-right {
                margin-top: 32px;
                max-width: 100% !important;
              }
            }
          `}} />
          
                    <div className="hero-flex-container" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      maxWidth: '1328px',
                      margin: '0 auto',
                      padding: '0 24px'
                    }}>
                      <div className="hero-left" style={{ maxWidth: '900px', textAlign: 'left' }}>
                        <h1 animation="loading-split" className="heading--96" style={{ textAlign: 'left' }}>Smart surveys, instantly</h1>
                        <div animation="loading" style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '8px' }}>
                          <Link href="/login" className="btn--book is--white w-inline-block" style={{ padding: '16rem 32rem', fontSize: '14rem', minHeight: '52rem' }}>
                            <div className="hover--bg is--purple"></div>
                            <div className="relative">Get Started</div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 21 21" fill="none" className="icon--20" style={{ width: '18rem', height: '18rem' }}>
                              <path d="M0.564451 0.635007C1.00098 0.170908 1.85566 -0.0818191 2.48518 0.0238669C4.314 0.32714 4.02911 2.71656 6.38637 2.98307C7.72352 3.13471 8.40359 2.19732 9.75453 2.74873C10.5816 3.08876 11.0687 3.9756 11.0182 4.85325C10.9952 5.22086 10.816 5.65279 10.8206 6.03418C10.8436 8.13411 13.0676 9.61372 14.878 8.21682C16.3576 7.07725 15.6729 5.37709 16.9596 4.52241C18.9308 3.21742 21.2789 5.6482 19.9417 7.49081C18.8205 9.03474 16.9504 7.80786 15.5397 9.23233C14.6896 10.0916 14.9194 10.9141 14.4966 11.7918C14.1841 12.4351 13.4857 12.8992 12.7643 12.9543C11.3904 13.06 10.9676 11.9296 9.80967 11.5712C7.11238 10.7395 5.38465 13.7079 7.22726 15.8216C7.75109 16.419 8.49549 16.6166 8.61037 17.5677C8.97337 20.6878 4.97109 20.9543 4.43807 18.4775C4.07506 16.7912 5.92227 16.2535 5.16409 14.0295C4.78729 12.9221 3.78098 12.6924 3.45014 11.8929C3.19741 11.2817 3.19281 10.3535 3.56042 9.78373C4.09344 8.95203 4.75053 9.02095 5.50871 8.59821C7.13076 7.69299 7.63162 5.58846 6.0785 4.35699C5.37086 3.79639 4.62187 3.71368 3.73503 3.82856C2.84819 3.94344 2.47599 4.50403 1.37318 4.11805C-0.0604741 3.64016 -0.441862 1.70565 0.564451 0.635007ZM8.69767 6.98076C5.95443 7.38972 7.17671 11.7136 9.77751 10.4638C11.6063 9.58615 10.6827 6.68208 8.69767 6.98076Z" fill="currentColor"></path>
                            </svg>
                          </Link>
                        </div>
                      </div>
                      <div className="hero-right" style={{ maxWidth: '500px', paddingTop: '16px' }}>
                        <p animation="loading" className="paragraph--16" style={{ textAlign: 'left' }}>Surbee understands your specific domain to generate accurate surveys from natural language. With our built-in "Cipher" accuracy detector, you get the most reliable results free from fraud and spam.</p>
                      </div>
                    </div>
          
                    <div animation="loading" className="container--video" style={{ maxWidth: '1328px', margin: '60px auto 0', padding: '0 24px' }}>
                      <div style={{
                        width: '100%',
                        height: '600px',
                        borderRadius: '32px',
                        overflow: 'hidden',
                        position: 'relative'
            }}>
              <img
                src="https://ik.imagekit.io/on0moldgr/Surbee%20Art/cgihadi_Warm_dusk_meadow_surrounded_by_tall_golden_grass_where__b8e4844a-8e6d-4be8-acfb-d1e2eed2ada2.png"
                alt="Warm dusk meadow"
                style={{ objectFit: 'cover', minWidth: 'calc(100% + 60px)', minHeight: 'calc(100% + 60px)', position: 'absolute', top: '-30px', left: '-30px' }}
              />
            </div>
          </div>

        </section>

        <section className="section is--padding">
          <div className="container--1328 is--56margin-bottom" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ maxWidth: '800px' }}>
              <h2 animation="fade-split" className="h2 is--h3-tablet" style={{ textAlign: 'center' }}>Faster survey creation by AI, refined by intelligence.</h2>
              <div animation="fade" className="max--600" style={{ margin: '20px auto 0', maxWidth: '600px' }}>
                <p className="body--14">Generate surveys using natural language or our intuitive no-code builder. Surbee understands your domain's context to create relevant questions, while Cipher works in the background to ensure every response is authentic and accurate.</p>
              </div>
            </div>
          </div>
          <div className="container--1328 is--search-home">
            <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67c6fe5a7f5f031522f54ae0_Frame%20634264.svg" loading="lazy" animation="fade" alt="" className="img--100 is--home-search"/>
            <div animation="fade" className="search--animation-search is--search">
              <div style={{ color: '#000', fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                {typingText}<span className="cursor">|</span>
              </div>
              <div className="div-block-12"><div>Generate</div></div>
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            .cursor {
              animation: blink 1s step-end infinite;
              color: #000;
            }
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
          `}} />
        </section>

        <section className="section is--yourcollective-home">
          <div className="container--1196 is--home-collective">
            <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67f8fd02743cb36e729e2fce_Surbee%20Group%20(1).avif" loading="lazy" alt="" className="home--collective-img"/>
            <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/68b1a0cec7fff7c6c96aae55_graphic%20website.svg" loading="eager" width="149" alt="" className="max--1140 is--mobile"/>
            <div className="container--647 is--absolute">
              <h2 animation="fade-split" className="h2 is--20margin-bottom is--h3-tablet">Great surveys, scattered data?</h2>
              <p animation="fade" className="body--big is--14tablet">Surbee connects every data point to reveal the complete picture, filtering out noise and finding the truth in the gaps.</p>
            </div>
          </div>
        </section>

        <div className="relative is--home-scrollanimation">
          <div className="div-block-27">
            <div className="container--1196 is--center is--relative">
              <div className="home--collective-dot is--1">
                <div className="home--collective-start">
                  <div className="intranet">Natural Language</div>
                  <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67f8f96866dde7aebec6949e_Surbee%20Frame%20634185.svg" loading="lazy" alt=""/>
                </div>
              </div>
              <div className="home--collective-dot is--2">
                <div className="home--collective-start dj-home-center">
                  <div className="intranet">No-Code Builder</div>
                </div>
              </div>
              <div className="home--collective-dot is--3">
                <div className="home--collective-start">
                  <div className="intranet">Cipher Detection</div>
                  <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67f8fd519a08abfc193a45b1_Surbee%20Frame%20634185%20(1).svg" loading="lazy" alt=""/>
                </div>
                <div className="home--collective-dot-inner"></div>
              </div>
              <div className="home--collective-dot is--4">
                <div className="home--collective-start">
                  <div className="intranet">Deep Extraction</div>
                  <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67f8fe569ae8d17d933a3c60_Surbee%20Frame%20634185%20(2).svg" loading="lazy" alt=""/>
                </div>
                <div className="home--collective-dot-inner">
                  <div className="body--big">Fraud Prevention</div>
                  <p className="_808080--font is--fixed">Identify and block bots, VPNs, proxies, and duplicate responses instantly.</p>
                </div>
              </div>
              <div className="home--collective-dot is--5">
                <div className="home--collective-start">
                  <div className="intranet">Enterprise SDK</div>
                </div>
                <div className="home--collective-dot-inner">
                  <div className="body--big">Minute Details</div>
                  <p className="_808080--font is--fixed">Extract granular data points and patterns that would take humans hours to find.</p>
                </div>
              </div>
              <div className="home--collective-dot is--6">
                <div className="home--collective-start">
                  <div className="intranet">Real-time Analytics</div>
                </div>
                <div className="home--collective-dot-inner"></div>
              </div>
              <div className="home--collective-dot is--0">
                <div className="home--collective-start">
                  <div className="intranet">Domain Intelligence</div>
                  <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67e66c2d46ba7f7e1ae5353a_Frame%20634185.svg" loading="lazy" alt=""/>
                </div>
                <div className="home--collective-dot-inner">
                  <div className="body--big">Context Awareness</div>
                  <p className="_808080--font is--fixed">Surbee understands your specific industry language to generate relevant surveys.</p>
                </div>
                <div className="home--searchtext">
                  <div animation="fade" className="notyping is--search is--not-absolute"><div>Extract deep insights</div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="home--collective-first-trigger"></div>
          <div className="relative is--home-earch">
            <section className="section is--home-search-sticky">
              <div className="container--725 is--center is--search">
                <h2 animation="fade-split" className="h2 is--24margin-bottom is--h3-tablet">Cipher SDK for Enterprise</h2>
                <div className="max--580">
                  <p animation="fade">Implement our industry-leading accuracy detector, Cipher, directly into your own platforms. Perfect for academic research, classrooms, and enterprise data collection where data integrity is paramount. Cipher can even detect computer locations and flag proximity in classrooms to prevent cheating, while extracting minute details that would take humans hours to find.</p>
                  <div className="home--searchbar-wrapper">
                    <div animation="fade" className="notyping is--search is--not-absolute is--home">
                      <div>Extract insights from thousands of responses in seconds...</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <div className="home--search-trigger-1"></div>
            <div className="home--search-trigger-2"></div>
            <div className="home--search-trigger-3"></div>
          </div>
          <div className="home--search-trigger-4"></div>
          <div className="home--search-trigger-last"></div>
        </div>

        <section className="section is--home-search">
          <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67c7021dd19d11a6d26045b4_Vector%2083.svg" loading="lazy" alt="" className="svg--lines"/>
          <div className="container--320 is--relative">
            <p className="body--big">Finding the right information for any given question is the beginning of every workflow</p>
          </div>
          <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67c7021dd19d11a6d26045b4_Vector%2083.svg" loading="lazy" alt="" className="svg--lines"/>
          <div className="container--725 is--center is--relative">
            <h2 animation="fade-split" className="h2 is--24margin-bottom is--h3-tablet">Build, deploy and orchestrate AI agents powered by your data</h2>
            <div className="max--442">
              <p animation="fade">Empower your AI apps and agents with AI Workflows that work like you do and know what your firm knows.</p>
            </div>
          </div>
          <div className="home--builddeploy--screen">
            <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67c70446f7eda3dc1b57e2e6_Group%20634058.svg" loading="lazy" alt="" className="image-transformfinal"/>
            <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67c7021dd19d11a6d26045b4_Vector%2083.svg" loading="lazy" alt="" className="svg--lines is--tablet"/>
            <div animation="fade-stagger" className="div-block-13 is--opacity0">
              <div className="hide--tablet is--left">
                <div animation="fade-item" data-wf--component-home-feature-card--variant="base" className="div-block-14">
                  <p className="body--big is--14tablet"></p>
                  <p className="_808080--font"></p>
                </div>
              </div>
              <div animation="fade-item" data-wf--component-home-feature-card--variant="base" className="div-block-14">
                <p className="body--big is--14tablet">Negotiation Intelligence</p>
                <p className="_808080--font">Search to uncover whether opposing counsel ever agreed to a point in a past negotiation.</p>
              </div>
              <div animation="fade-item" data-wf--component-home-feature-card--variant="opacity-0" className="div-block-14 w-variant-4db52bc1-309e-4c04-e096-55f618178e3f">
                <p className="body--big is--14tablet">Multi-Document Chat</p>
                <p className="_808080--font">Ask questions about a client-matter file folder, or any set of documents, for quick insights and review.</p>
              </div>
              <div animation="fade-item" data-wf--component-home-feature-card--variant="base" className="div-block-14">
                <p className="body--big is--14tablet">Matter &amp; Client Overview</p>
                <p className="_808080--font">Creates an overview and timeline of all the events pertaining to documents of a selected matter, client or folder.</p>
              </div>
              <div animation="fade-item" data-wf--component-home-feature-card--variant="base" className="div-block-14">
                <p className="body--big is--14tablet"></p>
                <p className="_808080--font"></p>
              </div>
            </div>
            <div className="gradient is--hidden"></div>
            <div className="gradient is--right is--hidden"></div>
          </div>
        </section>

        <div className="background">
          <section className="section is--home-automate">
            <style dangerouslySetInnerHTML={{__html: `
              .kalice-heading-wrapper {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 400px;
              }
              .kalice-heading {
                text-align: center;
                max-width: 800px;
              }
            `}} />
            <style dangerouslySetInnerHTML={{__html: `
              .waitlist-form {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 24px;
                max-width: 500px;
                width: 100%;
              }
              .waitlist-input-wrapper {
                display: flex;
                gap: 12px;
                width: 100%;
              }
              .waitlist-input {
                flex: 1;
                padding: 12px 16px;
                border: 2px solid #000;
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                background-color: #fff;
              }
              .waitlist-input:focus {
                outline: none;
                border-color: var(--_colors---orange, #FF6B35);
              }
            `}} />
            <div className="kalice-heading-wrapper">
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 className="h2 kalice-heading" style={{ marginBottom: '32px' }}>Unlock answers to every question</h2>
                <div className="waitlist-form">
                  <div className="waitlist-input-wrapper">
                    <input
                      type="email"
                      className="waitlist-input"
                      placeholder="Enter your email"
                      required
                    />
                    <a href="#" className="btn--book w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a is--white w-inline-block">
                      <div className="hover--bg w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a is--black"></div>
                      <div className="relative">Join waitlist</div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="section is--oneplatform-ai" style={{ display: 'none' }}>
            <div className="container--615 is--center">
              <h2 className="h2">The one platform for your AI strategy</h2>
            </div>
            <div className="container--980 is--relative">
              <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67cef49dcab486f17dc75054_Surbee%20Group%20(2).avif" loading="lazy" alt="" className="img--100 is--aistrategy-desktop"/>
              <img src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67cf19aa05ab4aeea3a309e4_Group%20634056%20(1).avif" loading="lazy" alt="" className="img--100 is--aistrategy-mobile"/>
            </div>
          </section>
          <section className="section is--padding" style={{ display: 'none' }}>
            <div className="container--1328 is--56margin-bottom">
              <div className="max--600">
                <h2 animation="fade-split" className="h3">Surbee by the numbers</h2>
              </div>
            </div>
            <div className="container--1328">
              <style dangerouslySetInnerHTML={{__html: `
                .bento-grid {
                  display: grid;
                  grid-template-columns: repeat(5, 1fr);
                  gap: 20px;
                }
              `}} />
              <div animation="fade-stagger" className="bento-grid">
                <div animation="fade-item" className="bento-item trustedby--card">
                  <div className="trustedby--number-wrapper">
                    <div className="trustedby--number">99.9%</div>
                  </div>
                  <p className="paragraph--14 is--big">Saved per user per year searching</p>
                </div>
                <div animation="fade-item" className="bento-item trustedby--card">
                  <div className="trustedby--number-wrapper">
                    <div className="trustedby--number">95%</div>
                  </div>
                  <p className="paragraph--14 is--big">Survey completion rate</p>
                </div>
                <div animation="fade-item" className="bento-item trustedby--card">
                  <div className="trustedby--number-wrapper">
                    <div className="trustedby--number">10x</div>
                  </div>
                  <p className="paragraph--14 is--big">Faster survey creation</p>
                </div>
                <div animation="fade-item" className="bento-item trustedby--card">
                  <div className="trustedby--number-wrapper">
                    <div className="trustedby--number">500K+</div>
                  </div>
                  <p className="paragraph--14 is--big">Surveys generated</p>
                </div>
                <div animation="fade-item" className="bento-item trustedby--card">
                  <div className="trustedby--number-wrapper">
                    <div className="trustedby--number">2M+</div>
                  </div>
                  <p className="paragraph--14 is--big">Data points extracted</p>
                </div>
              </div>
            </div>
          </section>
          <div className="padding-80bottom" style={{ display: 'none' }}>
            <section className="dj-section">
              <section animation="fade" className="dj-carousel-section">
                <div className="center--text-trustedby">
                  <div className="body--14">Trusted by the world's top legal teams</div>
                </div>
                <div className="dj-carousel-wrapper">
                  <div className="dj-carousel-slider">
                    <div className="dj-carousel-container">
                      <div className="collection-list-wrapper w-dyn-list">
                        <div role="list" className="collection-list w-dyn-items">
                           {/* Logos Part 1 */}
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e3904b54f05f793fbfc9aa_logo_freshfields.webp" loading="eager" animation="fade-item" alt="Freshfields" sizes="100vw" srcSet="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e3904b54f05f793fbfc9aa_logo_freshfields-p-500.webp 500w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e3904b54f05f793fbfc9aa_logo_freshfields-p-800.webp 800w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e3904b54f05f793fbfc9aa_logo_freshfields-p-1080.webp 1080w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e3904b54f05f793fbfc9aa_logo_freshfields.webp 1417w" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e390a3d697cbcde528bb5a_logo_holland_and_knight.webp" loading="eager" animation="fade-item" alt="Holland &amp; Knight" sizes="100vw" srcSet="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e390a3d697cbcde528bb5a_logo_holland_and_knight-p-500.webp 500w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e390a3d697cbcde528bb5a_logo_holland_and_knight-p-800.webp 800w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e390a3d697cbcde528bb5a_logo_holland_and_knight.webp 1000w" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/6909efbcdb55b570b239a54b_logo_cozen_oconnor.avif" loading="eager" animation="fade-item" alt="Cozen O’Connor" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/6909fbe2e9b110223e14dd0a_Unbenannt.avif" loading="eager" animation="fade-item" alt="Arent Fox Schiff" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/6909fcdbb534249b15e7b021_logo_schoenherr.avif" loading="eager" animation="fade-item" alt="Schoenherr" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67f4f5a5bfeec7b974167f78_logo-cms.avif" loading="eager" animation="fade-item" alt="CMS Switzerland" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/6911d3854d70ac44b2f0a58c_logo_gunderson-dettmer.avif" loading="eager" animation="fade-item" alt="Gunderson Dettmer" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/6911d43a023ae25f4d120a1a_logo_homburger.avif" loading="eager" animation="fade-item" alt="Homburger" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67f4f6074413b9e5ecdcd673_logo-lenz.avif" loading="eager" animation="fade-item" alt="Lenz &amp; Staehelin" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67f4f5942c1475ebaffd3b07_logo-lexr.avif" loading="eager" animation="fade-item" alt="LEXR" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67f4f5e1b4dfb4ca48becd71_logo-wenger.avif" loading="eager" animation="fade-item" alt="Wenger Vieli" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67f4f494ed93c6aa8bf3f53b_logo-sbb.avif" loading="eager" animation="fade-item" alt="SBB Legal &amp; Compliance" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68108d8c9007a2fbe83a7118_roth.avif" loading="eager" animation="fade-item" alt="Roth+Partner" className="dj-carousel-logo"/></a></div>
                        </div>
                      </div>
                      <div className="dj-carousel-space"></div>
                      <div className="collection-list-wrapper w-dyn-list">
                        <div role="list" className="collection-list w-dyn-items">
                             {/* Logos Part 2 (duplicate for loop) */}
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e3904b54f05f793fbfc9aa_logo_freshfields.webp" loading="eager" animation="fade-item" alt="Freshfields" sizes="100vw" srcSet="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e3904b54f05f793fbfc9aa_logo_freshfields-p-500.webp 500w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e3904b54f05f793fbfc9aa_logo_freshfields-p-800.webp 800w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e3904b54f05f793fbfc9aa_logo_freshfields-p-1080.webp 1080w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e3904b54f05f793fbfc9aa_logo_freshfields.webp 1417w" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e390a3d697cbcde528bb5a_logo_holland_and_knight.webp" loading="eager" animation="fade-item" alt="Holland &amp; Knight" sizes="100vw" srcSet="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e390a3d697cbcde528bb5a_logo_holland_and_knight-p-500.webp 500w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e390a3d697cbcde528bb5a_logo_holland_and_knight-p-800.webp 800w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68e390a3d697cbcde528bb5a_logo_holland_and_knight.webp 1000w" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/6909efbcdb55b570b239a54b_logo_cozen_oconnor.avif" loading="eager" animation="fade-item" alt="Cozen O’Connor" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/6909fbe2e9b110223e14dd0a_Unbenannt.avif" loading="eager" animation="fade-item" alt="Arent Fox Schiff" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/6909fcdbb534249b15e7b021_logo_schoenherr.avif" loading="eager" animation="fade-item" alt="Schoenherr" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67f4f5a5bfeec7b974167f78_logo-cms.avif" loading="eager" animation="fade-item" alt="CMS Switzerland" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/6911d3854d70ac44b2f0a58c_logo_gunderson-dettmer.avif" loading="eager" animation="fade-item" alt="Gunderson Dettmer" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/6911d43a023ae25f4d120a1a_logo_homburger.avif" loading="eager" animation="fade-item" alt="Homburger" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67f4f6074413b9e5ecdcd673_logo-lenz.avif" loading="eager" animation="fade-item" alt="Lenz &amp; Staehelin" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67f4f5942c1475ebaffd3b07_logo-lexr.avif" loading="eager" animation="fade-item" alt="LEXR" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67f4f5e1b4dfb4ca48becd71_logo-wenger.avif" loading="eager" animation="fade-item" alt="Wenger Vieli" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67f4f494ed93c6aa8bf3f53b_logo-sbb.avif" loading="eager" animation="fade-item" alt="SBB Legal &amp; Compliance" className="dj-carousel-logo"/></a></div>
                          <div role="listitem" className="w-dyn-item"><a href="#" className="dj-logo-linked w-inline-block"><img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/68108d8c9007a2fbe83a7118_roth.avif" loading="eager" animation="fade-item" alt="Roth+Partner" className="dj-carousel-logo"/></a></div>
                        </div>
                      </div>
                      <div className="dj-carousel-space"></div>
                    </div>
                    <div className="w-embed w-script">
                      <style dangerouslySetInnerHTML={{__html: `
                        .dj-carousel-container {
                          animation: moveSlideshow 52s linear infinite;
                        }

                        @keyframes moveSlideshow {
                          0% { 
                            transform: translateX(0%);  
                          }
                          
                          100% { 
                            transform: translateX(-50%);  
                          }
                        }
                      `}} />
                    </div>
                  </div>
                </div>
              </section>
            </section>
          </div>
        </div>
        
        <div className="black--bg is--opacity">
          <section className="section is--sticky-home">
            <div className="container--778 is--sticky">
              <h2 animation="fade-split" className="h1 is--h2-tablet">What people say<br/>about Surbee</h2>
            </div>
            <div className="container--416">
              <div className="w-dyn-list">
                <div role="list" className="customerstories--list w-dyn-items">
                  <div animation="fade" role="listitem" className="w-dyn-item">
                    <div className="customerstory--quote is--home">
                      <h3 className="label is--20margin-bottom">Homburger</h3>
                      <div className="max--376 is--40margin-bottom">
                        <p className="body--font">“The adoption rate has been remarkable, with more than 80% of Homburger’s legal professionals incorporating it into their workflow and a level of engagement that is unparalleled compared with other legal tech tools at the firm.”</p>
                      </div>
                      <div className="div-block-4">
                        <img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67cbf54489836af946e5899e_david-oser.avif" loading="lazy" alt="" className="image--quote"/>
                        <div>
                          <div className="body-small">David Oser</div>
                          <div className="body-small is--grey">Partner in M&amp;A at Homburger</div>
                        </div>
                        <a href="/customers/success-story-homburger-elevates-client-service-and-efficiency-with-ai-powered-knowledge-search" className="icon--slide w-inline-block">
                          <div data-is-ix2-target="1" className="lottie" data-w-id="2279f1e6-f9df-324e-98c5-0ac331212fe7" data-animation-type="lottie" data-src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67d44cf03576770286d3bf09_Surbee%20Frame%2010319903.json" data-loop="0" data-direction="1" data-autoplay="0" data-renderer="svg" data-default-duration="0" data-duration="1" data-ix2-initial-state="0"></div>
                        </a>
                        <div className="icon--slide w-condition-invisible">
                          <div data-is-ix2-target="1" className="lottie" data-w-id="2b1b12a7-c166-77a3-dd4e-60e5ee35f9d9" data-animation-type="lottie" data-src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67d44cf03576770286d3bf09_Surbee%20Frame%2010319903.json" data-loop="0" data-direction="1" data-autoplay="0" data-renderer="svg" data-default-duration="0" data-duration="1" data-ix2-initial-state="0"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div animation="fade" role="listitem" className="w-dyn-item">
                    <div className="customerstory--quote is--home">
                      <h3 className="label is--20margin-bottom">Gunderson Dettmer</h3>
                      <div className="max--376 is--40margin-bottom">
                        <p className="body--font">"Instead of hunting for documents to upload to an AI platform, everything you need is already there. Fast, efficient, and compliant access to the right information is the foundation for AI applications that help us do more with our knowledge base. With Surbee AI Workflows, we can connect LLMs and AI agents to everything we’ve ever worked on—unlocking entirely new possibilities."</p>
                      </div>
                      <div className="div-block-4">
                        <img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67cff7cd3602abad2333f0da_Joe%20Green%20Photo.jpg" loading="lazy" alt="" sizes="100vw" srcSet="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67cff7cd3602abad2333f0da_Joe%20Green%20Photo-p-500.jpg 500w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67cff7cd3602abad2333f0da_Joe%20Green%20Photo-p-800.jpg 800w, /landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/67cff7cd3602abad2333f0da_Joe%20Green%20Photo.jpg 1000w" className="image--quote"/>
                        <div>
                          <div className="body-small">Joe Green</div>
                          <div className="body-small is--grey">Chief Innovation Officer at Gunderson Dettmer</div>
                        </div>
                        <a href="/customers/gunderson-dettmer" className="icon--slide w-inline-block w-condition-invisible">
                          <div data-is-ix2-target="1" className="lottie" data-w-id="2279f1e6-f9df-324e-98c5-0ac331212fe7" data-animation-type="lottie" data-src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67d44cf03576770286d3bf09_Surbee%20Frame%2010319903.json" data-loop="0" data-direction="1" data-autoplay="0" data-renderer="svg" data-default-duration="0" data-duration="1" data-ix2-initial-state="0"></div>
                        </a>
                        <div className="icon--slide w-condition-invisible">
                          <div data-is-ix2-target="1" className="lottie" data-w-id="2b1b12a7-c166-77a3-dd4e-60e5ee35f9d9" data-animation-type="lottie" data-src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67d44cf03576770286d3bf09_Surbee%20Frame%2010319903.json" data-loop="0" data-direction="1" data-autoplay="0" data-renderer="svg" data-default-duration="0" data-duration="1" data-ix2-initial-state="0"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div animation="fade" role="listitem" className="w-dyn-item">
                    <div className="customerstory--quote is--home">
                      <h3 className="label is--20margin-bottom">Freshfields</h3>
                      <div className="max--376 is--40margin-bottom">
                        <p className="body--font">"Innovation at Freshfields is about strengthening how we work and preparing for what’s next. Surbee supports that by enabling responsible, targeted use of proprietary knowledge and powering bespoke AI workflows tailored to our standards. It will enhance our ability to deliver for clients as the legal industry evolves."</p>
                      </div>
                      <div className="div-block-4">
                        <img src="/landnew/cdn.prod.website-files.com/67c05faf7da26257e4f625f4/6911f40beb00b1cefcc16269_profile_gile_perez.avif" loading="lazy" alt="" className="image--quote"/>
                        <div>
                          <div className="body-small">Gil Perez</div>
                          <div className="body-small is--grey">Chief Innovation Officer at Freshfields</div>
                        </div>
                        <a href="/customers/freshfields" className="icon--slide w-inline-block w-condition-invisible">
                          <div data-is-ix2-target="1" className="lottie" data-w-id="2279f1e6-f9df-324e-98c5-0ac331212fe7" data-animation-type="lottie" data-src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67d44cf03576770286d3bf09_Surbee%20Frame%2010319903.json" data-loop="0" data-direction="1" data-autoplay="0" data-renderer="svg" data-default-duration="0" data-duration="1" data-ix2-initial-state="0"></div>
                        </a>
                        <div className="icon--slide w-condition-invisible">
                          <div data-is-ix2-target="1" className="lottie" data-w-id="2b1b12a7-c166-77a3-dd4e-60e5ee35f9d9" data-animation-type="lottie" data-src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/67d44cf03576770286d3bf09_Surbee%20Frame%2010319903.json" data-loop="0" data-direction="1" data-autoplay="0" data-renderer="svg" data-default-duration="0" data-duration="1" data-ix2-initial-state="0"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          <section className="section is--relative" style={{ display: 'none' }}>
            <div className="container--1328">
              <div className="blog--home-age">
                <h2 className="h2">Insights from our blog</h2>
                <a href="/blog" className="btn--book is--ede9e5 w-inline-block">
                  <div className="hover--bg is--purple"></div>
                  <div className="relative">view all</div>
                </a>
              </div>
              <div className="w-dyn-list">
                <div fs-cmsload-mode="pagination" fs-cmsload-element="list" role="list" className="blog--list w-dyn-items">
                  <div role="listitem" className="blog--item w-dyn-item">
                    <a animation="fade" href="/blog/ai-workflow-negotiation-intelligence" className="blog--item-card-wrapper w-inline-block">
                      <div id="w-node-_8c6d9b5b-82ae-3660-2025-d64792d266ab-2f3181c1" className="customerstory--img-wrapper is--blog-item is--highlight">
                        <h2 className="heading--22">Negotiation Intelligence: Strategic Insights from Your Firm’s Past Deals. Instantly.</h2>
                      </div>
                      <div className="customerstory--quote is--card">
                        <div className="max--376">
                          <p className="body--font">Surbee Negotiation Intelligence gives lawyers the power to respond to “we never agree to that” — by creating an instant analysis of opposing counsel’s position from across the full scale of your previously negotiated documents.</p>
                        </div>
                        <div className="div-block-4">
                          <div>
                            <div className="body-small">Surbee Team</div>
                            <div className="body-small is--grey is--balance w-dyn-bind-empty"></div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                  <div role="listitem" className="blog--item w-dyn-item">
                    <a animation="fade" href="/blog/does-your-ai-platform-set-your-firm-apart-from-the-competition" className="blog--item-card-wrapper w-inline-block">
                      <div id="w-node-_8c6d9b5b-82ae-3660-2025-d64792d266ab-2f3181c1" className="customerstory--img-wrapper is--blog-item is--highlight">
                        <h2 className="heading--22">‍Does Your AI Platform Set Your Firm Apart from the Competition?</h2>
                      </div>
                      <div className="customerstory--quote is--card">
                        <div className="max--376">
                          <p className="body--font">This post is the tenth and final one in a series about how to implement legal AI that knows your law firm. In this final post, we turn it back to you. Why are you implementing an AI strategy in the first place?</p>
                        </div>
                        <div className="div-block-4">
                          <div>
                            <div className="body-small">Paulina Grnarova</div>
                            <div className="body-small is--grey is--balance">CEO &amp; Co-Founder at Surbee</div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                  <div role="listitem" className="blog--item w-dyn-item">
                    <a animation="fade" href="/blog/how-search-reveals-counsels-playbook" className="blog--item-card-wrapper w-inline-block">
                      <div id="w-node-_8c6d9b5b-82ae-3660-2025-d64792d266ab-2f3181c1" className="customerstory--img-wrapper is--blog-item is--highlight">
                        <h2 className="heading--22">Anticipating the Next Move: How AI-Powered Search Reveals Counsel’s Playbook</h2>
                      </div>
                      <div className="customerstory--quote is--card">
                        <div className="max--376">
                          <p className="body--font">Negotiations can turn in days–and lawyers often have to anticipate how the other side will respond under extreme time pressure. New AI-powered search enables deal teams to quickly surface how opposing counsel has actually handled similar negotiations in past deals.</p>
                        </div>
                        <div className="div-block-4">
                          <div>
                            <div className="body-small">Ryan Groff</div>
                            <div className="body-small is--grey is--balance">Director of Learning</div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section data-wf--global---cta--color="black-version" className="section is--160padding w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a">
            <div className="container--778 is--knowledge-search">
              <div animation="fade">
                <div className="label is--50">get started</div>
              </div>
              <h2 animation="fade-split" className="h1 is--h2-tablet">Beyond surveys, intelligence.</h2>
              <div animation="fade" className="div-block-7">
                <div>
                  <a href="/product" className="btn--book w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a is--white w-inline-block">
                    <div className="hover--bg w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a is--black"></div>
                    <div className="relative">explore the product</div>
                  </a>
                </div>
                <div className="div-block-6">
                  <a animation="bookademo" href="#" className="btn--book w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a is--purple w-inline-block">
                    <div className="hover--bg w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a is--purple"></div>
                    <div className="relative" style={{ color: '#000' }}>book a demo</div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 21 21" fill="none" className="icon--20 w-variant-2abd1b04-beaa-6c46-80ee-d2134041cf3a">
                      <path d="M0.564451 0.635007C1.00098 0.170908 1.85566 -0.0818191 2.48518 0.0238669C4.314 0.32714 4.02911 2.71656 6.38637 2.98307C7.72352 3.13471 8.40359 2.19732 9.75453 2.74873C10.5816 3.08876 11.0687 3.9756 11.0182 4.85325C10.9952 5.22086 10.816 5.65279 10.8206 6.03418C10.8436 8.13411 13.0676 9.61372 14.878 8.21682C16.3576 7.07725 15.6729 5.37709 16.9596 4.52241C18.9308 3.21742 21.2789 5.6482 19.9417 7.49081C18.8205 9.03474 16.9504 7.80786 15.5397 9.23233C14.6896 10.0916 14.9194 10.9141 14.4966 11.7918C14.1841 12.4351 13.4857 12.8992 12.7643 12.9543C11.3904 13.06 10.9676 11.9296 9.80967 11.5712C7.11238 10.7395 5.38465 13.7079 7.22726 15.8216C7.75109 16.419 8.49549 16.6166 8.61037 17.5677C8.97337 20.6878 4.97109 20.9543 4.43807 18.4775C4.07506 16.7912 5.92227 16.2535 5.16409 14.0295C4.78729 12.9221 3.78098 12.6924 3.45014 11.8929C3.19741 11.2817 3.19281 10.3535 3.56042 9.78373C4.09344 8.95203 4.75053 9.02095 5.50871 8.59821C7.13076 7.69299 7.63162 5.58846 6.0785 4.35699C5.37086 3.79639 4.62187 3.71368 3.73503 3.82856C2.84819 3.94344 2.47599 4.50403 1.37318 4.11805C-0.0604741 3.64016 -0.441862 1.70565 0.564451 0.635007ZM8.69767 6.98076C5.95443 7.38972 7.17671 11.7136 9.77751 10.4638C11.6063 9.58615 10.6827 6.68208 8.69767 6.98076Z" fill="currentColor"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <footer data-wf--global---footer--variant="base" className="section is--footer">
            <div className="footer-content">
              <div animation="fade-stagger" className="footer--row" style={{ paddingLeft: '0' }}>
                <div animation="fade-item" style={{ marginRight: '40px' }}>
                  <a href="/" aria-current="page" className="footer--logo-link w-inline-block w--current">
                    <img src="/logo.svg" alt="Surbee" className="looter--logo-img" style={{ height: '50px', width: 'auto' }} />
                  </a>
                </div>
                <div className="footer-columns">
                  <div animation="fade-item" className="footer--column">
                    <div className="label is--footer">explore</div>
                    <div className="footer-column-inner">
                      <a href="/product" className="footer--link w-inline-block"><div>Product</div><div className="footerlink-line"></div></a>
                      <a href="/customers" className="footer--link w-inline-block"><div>Customers</div><div className="footerlink-line"></div></a>
                      <a href="/security" className="footer--link w-inline-block"><div>Security</div><div className="footerlink-line"></div></a>
                      <a href="/about-us" className="footer--link w-inline-block"><div>About</div><div className="footerlink-line"></div></a>
                    </div>
                  </div>
                  <div animation="fade-item" className="footer--column">
                    <div className="label is--footer">LEARN</div>
                    <div className="footer-column-inner">
                      <a href="/blog" className="footer--link w-inline-block" style={{ display: 'none' }}><div>Blog</div><div className="footerlink-line"></div></a>
                      <a href="/news" className="footer--link w-inline-block"><div>News</div><div className="footerlink-line"></div></a>
                      <a href="/learn" className="footer--link w-inline-block"><div>Learn</div><div className="footerlink-line"></div></a>
                    </div>
                  </div>
                  <div animation="fade-item" className="footer--column">
                    <div className="label is--footer">CONNECT</div>
                    <div className="footer-column-inner">
                      <a href="/subscribe" className="footer--link is--newlink w-inline-block">
                        <div className="div-block-28"><div>Subscribe</div><div className="footerlink-line"></div></div>
                        <div className="footer--new-mention">NEW</div>
                      </a>
                      <a href="/media-kit" className="footer--link w-inline-block"><div>Media Kit</div><div className="footerlink-line"></div></a>
                      <a href="https://www.linkedin.com/company/surbee/" target="_blank" className="footer--link w-inline-block"><div>LinkedIn</div><div className="footerlink-line"></div></a>
                      <a href="https://bsky.app/profile/surbee.bsky.social" target="_blank" className="footer--link w-inline-block"><div>BlueSky</div><div className="footerlink-line"></div></a>
                      <a href="https://x.com/surbeeai" target="_blank" className="footer--link w-inline-block"><div>X</div><div className="footerlink-line"></div></a>
                    </div>
                  </div>
                </div>
                <p animation="fade-item" className="body-small is--50opacity">© 2025 Surbee AG. All rights reserved.</p>
                <div animation="fade-item" className="footer--links">
                  <a href="/terms" className="footer--link is--50opacity">Terms of Service<br/></a>
                  <a href="/privacy-policy" className="footer--link is--50opacity">Privacy Policy<br/></a>
                  <a href="#" className="footer--link is--50opacity cky-banner-element">Cookie Settings<br/></a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>

      {/* Scripts - Core libraries first with afterInteractive to ensure proper loading order */}
      <Script src="/landnew/d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=67bdd03200678df04ba07593" strategy="beforeInteractive" />
      <Script src="/landnew/cdn.jsdelivr.net/npm/split-type@0.3.4" strategy="afterInteractive" />
      <Script src="/landnew/cdnjs.cloudflare.com/ajax/libs/gsap/3.12.3/gsap.min.js" strategy="afterInteractive" />
      <Script src="/landnew/cdnjs.cloudflare.com/ajax/libs/gsap/3.12.3/ScrollTrigger.min.js" strategy="afterInteractive" />
      <Script src="/landnew/cdnjs.cloudflare.com/ajax/libs/gsap/3.12.3/CustomEase.min.js" strategy="afterInteractive" />
      <Script src="/landnew/cdn.jsdelivr.net/npm/gsap@3.12.7/dist/MotionPathPlugin.min.js" strategy="afterInteractive" />
      <Script src="/landnew/cdnjs.cloudflare.com/ajax/libs/bodymovin/5.9.6/lottie.min.js" strategy="afterInteractive" />
      <Script src="/landnew/cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js" strategy="afterInteractive" />

      {/* Webflow chunks */}
      <Script src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/js/webflow.schunk.57d5559d2f0cd9f8.js" strategy="afterInteractive" />
      <Script src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/js/webflow.schunk.b324484631ca48aa.js" strategy="afterInteractive" />
      <Script src="/landnew/cdn.prod.website-files.com/67bdd03200678df04ba07593/js/webflow.ae197c71.7d3d5a39186a7021.js" strategy="afterInteractive" />

      {/* Custom scripts that depend on the libraries above */}
      <Script src='/landnew/deepjudge-code.netlify.app/script.js' strategy="afterInteractive" />
      <Script src='/landnew/deepjudge-code.netlify.app/home.js' strategy="afterInteractive" />
      
      {/* JSON-LD Scripts */}
      <Script id="json-ld-org" type="application/ld+json">
        {`{"@id":"#organization","@context":"https://schema.org","@type":"Organization","url":"","address":{"@type":"PostalAddress","addressCountry":{"@type":"Country","name":"CH"},"addressRegion":"ZH","addressLocality":"Zürich","postalCode":"8004","streetAddress":"Militärstrasse 36"},"name":"Surbee","legalName":"Surbee AG","logo":"cdn.prod.website-files.com/67bdd03200678df04ba07593/67cafffcb1cc5cfcc0d3e69d_Surbee%20Frame%20634282.svg","vatID":"CHE-376.843.268","foundingDate":"2021-01-08","foundingLocation":{"@type":"Place","address":{"@type":"PostalAddress","addressCountry":{"@type":"Country","name":"CH"},"addressRegion":"ZH","addressLocality":"Zürich"}},"hasCertification":{"@type":"Certification","certificationStatus":"CertificationActive","name":"SOC 2 Type 2"},"founder":[{"@id":"#Paulina","@context":"https://schema.org","@type":"Person","name":"Paulina","url":"about"},{"@id":"#Yannic","@context":"https://schema.org","@type":"Person","name":"Yannic","url":"about"},{"@id":"#Kevin","@context":"https://schema.org","@type":"Person","name":"Kevin","url":"about"}],"sameAs":["https://www.linkedin.com/company/surbee/","https://www.youtube.com/@surbeeai","https://bsky.app/profile/surbee.bsky.social","https://x.com/SurbeeAI","https://www.crunchbase.com/organization/surbee","https://github.com/surbee-ai","https://pitchbook.com/profiles/company/458463-25","https://www.legaltechnologyhub.com/vendors/surbee/"]}`}
      </Script>
      <Script id="json-ld-website" type="application/ld+json">
        {`{"@context":"http://schema.org","@id":"#website","@type":"WebSite","url":"","name":"Surbee"}`}
      </Script>
      <Script id="json-ld-webpage" type="application/ld+json">
        {`{"@context":"https://schema.org","@type":"WebPage","@id":"#webpage","name":"Surbee - Precision AI Search for legal teams","description":"Powered by world-class enterprise search that serves up immediate access to all of the institutional knowledge in your firm, Surbee enables you to build entire AI applications, encapsulate multi-step workflows, and implement LLM agents."}`}
      </Script>
    </div>
  );
}

