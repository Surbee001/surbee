'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function LandingPage123123() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="landing-noir">
      <style jsx global>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@200,300,400,500,600,700&f[]=cabinet-grotesk@100,200,300,400,500,700,800,900&display=swap');

        :root {
          --noir-bg: #0a0a0a;
          --noir-surface: #141414;
          --noir-elevated: #1a1a1a;
          --noir-border: #2a2a2a;
          --coral: #FF6B4A;
          --coral-soft: #FF8A70;
          --coral-glow: rgba(255, 107, 74, 0.15);
          --text-primary: #FAFAFA;
          --text-secondary: #888888;
          --text-tertiary: #555555;
        }

        .landing-noir {
          min-height: 100vh;
          background: var(--noir-bg);
          color: var(--text-primary);
          font-family: 'Cabinet Grotesk', -apple-system, sans-serif;
          overflow-x: hidden;
          cursor: none;
        }

        .landing-noir * {
          cursor: none;
        }

        /* Custom Cursor */
        .custom-cursor {
          position: fixed;
          width: 20px;
          height: 20px;
          border: 2px solid var(--coral);
          border-radius: 50%;
          pointer-events: none;
          z-index: 9999;
          transition: transform 0.15s ease, width 0.2s, height 0.2s, border-color 0.2s;
          mix-blend-mode: difference;
        }

        .custom-cursor-dot {
          position: fixed;
          width: 6px;
          height: 6px;
          background: var(--coral);
          border-radius: 50%;
          pointer-events: none;
          z-index: 10000;
        }

        /* Grain Overlay */
        .grain-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1000;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        /* Navigation */
        .nav-noir {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 24px 48px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(to bottom, rgba(10,10,10,0.9), transparent);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .nav-logo {
          font-family: 'Clash Display', sans-serif;
          font-weight: 600;
          font-size: 24px;
          letter-spacing: -0.02em;
          color: var(--text-primary);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-logo-icon {
          width: 32px;
          height: 32px;
          background: var(--coral);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-links {
          display: flex;
          gap: 40px;
          align-items: center;
        }

        .nav-link {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          letter-spacing: 0.02em;
          text-transform: uppercase;
          transition: color 0.3s ease;
          position: relative;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--coral);
          transition: width 0.3s ease;
        }

        .nav-link:hover {
          color: var(--text-primary);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .nav-cta {
          padding: 12px 28px;
          background: transparent;
          border: 1px solid var(--coral);
          color: var(--coral);
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .nav-cta::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: var(--coral);
          transition: left 0.3s ease;
          z-index: -1;
        }

        .nav-cta:hover {
          color: var(--noir-bg);
        }

        .nav-cta:hover::before {
          left: 0;
        }

        /* Hero Section */
        .hero-noir {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 160px 48px 80px;
          position: relative;
        }

        .hero-bg-element {
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--coral-glow), transparent 70%);
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.5;
          animation: float 20s ease-in-out infinite;
        }

        .hero-bg-element.one {
          top: 10%;
          right: -10%;
        }

        .hero-bg-element.two {
          bottom: 20%;
          left: -20%;
          animation-delay: -10s;
          opacity: 0.3;
        }

        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }

        .hero-content {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          position: relative;
          z-index: 2;
        }

        .hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: var(--noir-surface);
          border: 1px solid var(--noir-border);
          border-radius: 100px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-secondary);
          margin-bottom: 40px;
          animation: fadeSlideUp 0.8s ease forwards;
          opacity: 0;
        }

        .hero-eyebrow-dot {
          width: 8px;
          height: 8px;
          background: var(--coral);
          border-radius: 50%;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
        }

        .hero-title {
          font-family: 'Clash Display', sans-serif;
          font-size: clamp(64px, 12vw, 160px);
          font-weight: 600;
          line-height: 0.9;
          letter-spacing: -0.03em;
          margin: 0 0 40px;
          animation: fadeSlideUp 0.8s ease 0.2s forwards;
          opacity: 0;
        }

        .hero-title-line {
          display: block;
          overflow: hidden;
        }

        .hero-title-gradient {
          background: linear-gradient(135deg, var(--text-primary) 0%, var(--coral) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          max-width: 520px;
          font-size: 18px;
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: 48px;
          animation: fadeSlideUp 0.8s ease 0.4s forwards;
          opacity: 0;
        }

        .hero-actions {
          display: flex;
          gap: 20px;
          animation: fadeSlideUp 0.8s ease 0.6s forwards;
          opacity: 0;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 36px;
          background: var(--coral);
          color: var(--noir-bg);
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn-primary::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.6s ease, height 0.6s ease;
        }

        .btn-primary:hover::before {
          width: 400px;
          height: 400px;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(255, 107, 74, 0.3);
        }

        .btn-primary svg {
          transition: transform 0.3s ease;
        }

        .btn-primary:hover svg {
          transform: translateX(4px);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 36px;
          background: transparent;
          border: 1px solid var(--noir-border);
          color: var(--text-primary);
          font-size: 15px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover {
          border-color: var(--text-tertiary);
          background: var(--noir-surface);
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Floating Stats */
        .hero-stats {
          position: absolute;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          flex-direction: column;
          gap: 24px;
          animation: fadeSlideLeft 0.8s ease 0.8s forwards;
          opacity: 0;
        }

        @keyframes fadeSlideLeft {
          from {
            opacity: 0;
            transform: translate(30px, -50%);
          }
          to {
            opacity: 1;
            transform: translate(0, -50%);
          }
        }

        .hero-stat {
          padding: 24px 32px;
          background: var(--noir-surface);
          border: 1px solid var(--noir-border);
          text-align: right;
          transition: all 0.3s ease;
        }

        .hero-stat:hover {
          border-color: var(--coral);
          transform: translateX(-8px);
        }

        .hero-stat-number {
          font-family: 'Clash Display', sans-serif;
          font-size: 48px;
          font-weight: 600;
          color: var(--coral);
          line-height: 1;
          margin-bottom: 4px;
        }

        .hero-stat-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-tertiary);
        }

        /* Features Section */
        .features-section {
          padding: 160px 48px;
          position: relative;
        }

        .features-header {
          max-width: 1400px;
          margin: 0 auto 100px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: end;
        }

        .features-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--coral);
          margin-bottom: 24px;
        }

        .features-title {
          font-family: 'Clash Display', sans-serif;
          font-size: clamp(40px, 5vw, 72px);
          font-weight: 500;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .features-description {
          font-size: 18px;
          line-height: 1.8;
          color: var(--text-secondary);
          max-width: 480px;
        }

        .features-grid {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .feature-card {
          padding: 48px;
          background: var(--noir-surface);
          border: 1px solid var(--noir-border);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, var(--coral), transparent);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .feature-card:hover {
          border-color: var(--noir-border);
          background: var(--noir-elevated);
          transform: translateY(-8px);
        }

        .feature-card:hover::before {
          transform: scaleX(1);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--coral-glow), transparent);
          border: 1px solid var(--coral);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          color: var(--coral);
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-icon {
          background: var(--coral);
          color: var(--noir-bg);
        }

        .feature-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 24px;
          font-weight: 500;
          margin-bottom: 16px;
          letter-spacing: -0.01em;
        }

        .feature-description {
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        /* Marquee Section */
        .marquee-section {
          padding: 80px 0;
          border-top: 1px solid var(--noir-border);
          border-bottom: 1px solid var(--noir-border);
          overflow: hidden;
        }

        .marquee-track {
          display: flex;
          animation: marquee 30s linear infinite;
        }

        .marquee-item {
          font-family: 'Clash Display', sans-serif;
          font-size: 80px;
          font-weight: 600;
          letter-spacing: -0.02em;
          white-space: nowrap;
          padding: 0 40px;
          color: transparent;
          -webkit-text-stroke: 1px var(--text-tertiary);
          transition: all 0.3s ease;
        }

        .marquee-item:hover {
          color: var(--coral);
          -webkit-text-stroke: 1px var(--coral);
        }

        .marquee-divider {
          color: var(--coral);
          padding: 0 40px;
          font-size: 80px;
        }

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* CTA Section */
        .cta-section {
          padding: 200px 48px;
          position: relative;
          overflow: hidden;
        }

        .cta-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--noir-surface), var(--noir-bg));
        }

        .cta-glow {
          position: absolute;
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, var(--coral-glow), transparent 60%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          filter: blur(60px);
        }

        .cta-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .cta-title {
          font-family: 'Clash Display', sans-serif;
          font-size: clamp(48px, 8vw, 96px);
          font-weight: 600;
          line-height: 1;
          letter-spacing: -0.03em;
          margin-bottom: 32px;
        }

        .cta-description {
          font-size: 20px;
          line-height: 1.7;
          color: var(--text-secondary);
          margin-bottom: 48px;
          max-width: 560px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-form {
          display: flex;
          gap: 16px;
          max-width: 500px;
          margin: 0 auto;
        }

        .cta-input {
          flex: 1;
          padding: 18px 24px;
          background: var(--noir-bg);
          border: 1px solid var(--noir-border);
          color: var(--text-primary);
          font-size: 16px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .cta-input::placeholder {
          color: var(--text-tertiary);
        }

        .cta-input:focus {
          border-color: var(--coral);
        }

        .cta-submit {
          padding: 18px 32px;
          background: var(--coral);
          border: none;
          color: var(--noir-bg);
          font-size: 15px;
          font-weight: 600;
          font-family: inherit;
          cursor: none;
          transition: all 0.3s ease;
        }

        .cta-submit:hover {
          background: var(--coral-soft);
          transform: scale(1.02);
        }

        /* Footer */
        .footer-noir {
          padding: 80px 48px 40px;
          border-top: 1px solid var(--noir-border);
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        .footer-main {
          display: flex;
          justify-content: space-between;
          margin-bottom: 80px;
        }

        .footer-brand {
          max-width: 320px;
        }

        .footer-logo {
          font-family: 'Clash Display', sans-serif;
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .footer-tagline {
          font-size: 15px;
          line-height: 1.7;
          color: var(--text-secondary);
        }

        .footer-links {
          display: flex;
          gap: 80px;
        }

        .footer-column h4 {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--text-tertiary);
          margin-bottom: 24px;
        }

        .footer-column a {
          display: block;
          font-size: 15px;
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: 12px;
          transition: color 0.3s ease;
        }

        .footer-column a:hover {
          color: var(--coral);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 40px;
          border-top: 1px solid var(--noir-border);
        }

        .footer-copyright {
          font-size: 13px;
          color: var(--text-tertiary);
        }

        .footer-social {
          display: flex;
          gap: 20px;
        }

        .footer-social a {
          color: var(--text-tertiary);
          transition: color 0.3s ease;
        }

        .footer-social a:hover {
          color: var(--coral);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-stats {
            display: none;
          }

          .features-header {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .nav-links {
            display: none;
          }

          .footer-main {
            flex-direction: column;
            gap: 60px;
          }

          .footer-links {
            flex-wrap: wrap;
            gap: 40px;
          }
        }

        @media (max-width: 768px) {
          .nav-noir {
            padding: 20px 24px;
          }

          .hero-noir {
            padding: 120px 24px 60px;
          }

          .hero-actions {
            flex-direction: column;
          }

          .features-section {
            padding: 80px 24px;
          }

          .cta-section {
            padding: 100px 24px;
          }

          .cta-form {
            flex-direction: column;
          }

          .footer-noir {
            padding: 60px 24px 30px;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 20px;
            text-align: center;
          }

          .marquee-item {
            font-size: 48px;
          }
        }
      `}</style>

      {/* Custom Cursor */}
      <div
        className="custom-cursor"
        style={{
          left: mousePos.x - 10,
          top: mousePos.y - 10,
        }}
      />
      <div
        className="custom-cursor-dot"
        style={{
          left: mousePos.x - 3,
          top: mousePos.y - 3,
        }}
      />

      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Navigation */}
      <nav className="nav-noir">
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#0a0a0a" />
            </svg>
          </div>
          Surbee
        </Link>
        <div className="nav-links">
          <Link href="/product" className="nav-link">Product</Link>
          <Link href="/enterprise" className="nav-link">Enterprise</Link>
          <Link href="/pricing" className="nav-link">Pricing</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/login" className="nav-cta">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-noir" ref={heroRef}>
        <div className="hero-bg-element one" />
        <div className="hero-bg-element two" />

        <div className="hero-content">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-dot" />
            Now with Cipher Detection
          </div>

          <h1 className="hero-title">
            <span className="hero-title-line">Surveys that</span>
            <span className="hero-title-line hero-title-gradient">understand.</span>
          </h1>

          <p className="hero-description">
            AI-powered survey creation that speaks your language. Generate, deploy, and analyze with unmatched accuracy through our proprietary Cipher fraud detection.
          </p>

          <div className="hero-actions">
            <Link href="/login" className="btn-primary">
              Start Creating
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link href="/enterprise" className="btn-secondary">
              Talk to Sales
            </Link>
          </div>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <div className="hero-stat-number">99.9%</div>
            <div className="hero-stat-label">Fraud Detection</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">10x</div>
            <div className="hero-stat-label">Faster Creation</div>
          </div>
          <div className="hero-stat">
            <div className="hero-stat-number">2M+</div>
            <div className="hero-stat-label">Responses Analyzed</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <div>
            <div className="features-label">Capabilities</div>
            <h2 className="features-title">Intelligence at every step</h2>
          </div>
          <p className="features-description">
            From natural language generation to real-time fraud detection, Surbee transforms how you collect and analyze data.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3 className="feature-title">Natural Language</h3>
            <p className="feature-description">
              Describe your survey in plain English. Our AI understands context, industry jargon, and research methodologies to generate perfect questions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3 className="feature-title">Cipher Detection</h3>
            <p className="feature-description">
              Proprietary fraud detection identifies bots, VPNs, duplicates, and suspicious patterns in real-time with 99.9% accuracy.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <h3 className="feature-title">Instant Analysis</h3>
            <p className="feature-description">
              Extract insights from thousands of responses in seconds. AI-powered analytics surface patterns humans would miss.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M3 9h18M9 21V9" />
              </svg>
            </div>
            <h3 className="feature-title">No-Code Builder</h3>
            <p className="feature-description">
              Drag-and-drop interface for when you want full control. Mix AI-generated and custom questions seamlessly.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="feature-title">Enterprise SDK</h3>
            <p className="feature-description">
              Embed Cipher detection into your own platforms. Perfect for academic research and enterprise data collection.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20V10" />
                <path d="M18 20V4" />
                <path d="M6 20v-4" />
              </svg>
            </div>
            <h3 className="feature-title">Real-time Analytics</h3>
            <p className="feature-description">
              Watch responses flow in with live dashboards. Track completion rates, demographics, and sentiment as they happen.
            </p>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="marquee-section">
        <div className="marquee-track">
          <span className="marquee-item">Natural Language</span>
          <span className="marquee-divider">•</span>
          <span className="marquee-item">Cipher Detection</span>
          <span className="marquee-divider">•</span>
          <span className="marquee-item">Enterprise Ready</span>
          <span className="marquee-divider">•</span>
          <span className="marquee-item">Real-time Analytics</span>
          <span className="marquee-divider">•</span>
          <span className="marquee-item">Natural Language</span>
          <span className="marquee-divider">•</span>
          <span className="marquee-item">Cipher Detection</span>
          <span className="marquee-divider">•</span>
          <span className="marquee-item">Enterprise Ready</span>
          <span className="marquee-divider">•</span>
          <span className="marquee-item">Real-time Analytics</span>
          <span className="marquee-divider">•</span>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-bg" />
        <div className="cta-glow" />
        <div className="cta-content">
          <h2 className="cta-title">Ready to transform your surveys?</h2>
          <p className="cta-description">
            Join thousands of researchers and enterprises using Surbee to collect accurate, actionable data.
          </p>
          <form className="cta-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              className="cta-input"
              placeholder="Enter your email"
              required
            />
            <button type="submit" className="cta-submit">Join Waitlist</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-noir">
        <div className="footer-content">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="nav-logo-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L22 12L12 22L2 12L12 2Z" fill="#0a0a0a" />
                  </svg>
                </div>
                Surbee
              </div>
              <p className="footer-tagline">
                AI-powered surveys that understand your domain and deliver accurate, fraud-free results.
              </p>
            </div>

            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="/product">Features</a>
                <a href="/enterprise">Enterprise</a>
                <a href="/pricing">Pricing</a>
                <a href="/security">Security</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="/about">About</a>
                <a href="/careers">Careers</a>
                <a href="/blog">Blog</a>
                <a href="/contact">Contact</a>
              </div>
              <div className="footer-column">
                <h4>Resources</h4>
                <a href="/docs">Documentation</a>
                <a href="/api">API Reference</a>
                <a href="/support">Support</a>
                <a href="/status">Status</a>
              </div>
              <div className="footer-column">
                <h4>Legal</h4>
                <a href="/privacy">Privacy</a>
                <a href="/terms">Terms</a>
                <a href="/cookies">Cookies</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-copyright">
              © 2024 Surbee. All rights reserved.
            </div>
            <div className="footer-social">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
