'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StudentsPage() {
  const [email, setEmail] = useState('');
  const [isValidEdu, setIsValidEdu] = useState(false);

  useEffect(() => {
    // Check if email ends with .edu
    setIsValidEdu(email.toLowerCase().endsWith('.edu'));
  }, [email]);

  useEffect(() => {
    // Set background color on body
    document.body.style.backgroundColor = '#EEE9E5';
  }, []);

  return (
    <div style={{ backgroundColor: '#EEE9E5', minHeight: '100vh', color: '#000', fontFamily: 'sans-serif' }}>

      <style dangerouslySetInnerHTML={{__html: `
        /* Reset and helper styles */
        img, svg { display: inline-block; vertical-align: middle; }
        a { color: inherit; text-decoration: none; }
        * { box-sizing: border-box; }
        body { margin: 0; }

        @font-face { font-family: 'Kalice Regular'; src: url('/fonts/Kalice-Trial-Regular.otf') format('opentype'); }
        h1, h2, h3 { font-family: 'Kalice Regular', serif; margin: 0; }
        p { margin: 0; }
        button { font-family: inherit; }

        /* Student Page Specific Styles */
        :root {
          --student-orange: #FF6B35;
          --student-orange-soft: #FBD8C6;
          --student-cream: #EEE9E5;
          --student-cream-dark: #E6E0DB;
          --student-black: #000;
          --student-gray: #666;
        }

        /* Animated Badge */
        .student-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          background: linear-gradient(135deg, var(--student-orange) 0%, #FF8A5C 100%);
          color: white;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          animation: badgePulse 3s ease-in-out infinite;
        }

        .student-badge-icon {
          font-size: 16px;
        }

        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(255, 107, 53, 0.3); }
          50% { box-shadow: 0 4px 30px rgba(255, 107, 53, 0.5); }
        }

        /* Feature Cards - Enhanced */
        .student-feature-card {
          background: white;
          border-radius: 16px;
          padding: 40px;
          height: 100%;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(0,0,0,0.05);
          position: relative;
          overflow: hidden;
        }

        .student-feature-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--student-orange), var(--student-orange-soft));
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }

        .student-feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
        }

        .student-feature-card:hover::before {
          transform: scaleX(1);
        }

        .feature-icon-wrapper {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--student-orange-soft), #fff);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          font-size: 28px;
          transition: all 0.3s ease;
        }

        .student-feature-card:hover .feature-icon-wrapper {
          background: var(--student-orange);
          transform: scale(1.05);
        }

        .student-feature-card:hover .feature-icon-wrapper svg {
          color: white;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 64px;
        }

        @media (max-width: 991px) {
          .feature-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 767px) {
          .feature-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Steps Section */
        .steps-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 40px;
          position: relative;
        }

        .steps-container::before {
          content: '';
          position: absolute;
          top: 48px;
          left: 15%;
          right: 15%;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--student-orange), transparent);
          z-index: 0;
        }

        @media (max-width: 991px) {
          .steps-container {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .steps-container::before {
            display: none;
          }
        }

        .step-item {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .step-number {
          width: 96px;
          height: 96px;
          background: white;
          border: 3px solid var(--student-orange);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-family: 'Kalice Regular', serif;
          font-size: 36px;
          color: var(--student-orange);
          transition: all 0.3s ease;
        }

        .step-item:hover .step-number {
          background: var(--student-orange);
          color: white;
          transform: scale(1.1);
        }

        /* Pro Badge */
        .pro-highlight {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: linear-gradient(135deg, #000 0%, #333 100%);
          color: white;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* CTA Section */
        .student-cta-section {
          background: linear-gradient(180deg, var(--student-cream) 0%, white 100%);
          padding: 120px 0;
          position: relative;
          overflow: hidden;
        }

        .student-cta-section::before {
          content: '';
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .cta-card {
          background: white;
          border-radius: 24px;
          padding: 64px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
          max-width: 700px;
          margin: 0 auto;
        }

        .cta-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, var(--student-orange), #FF8A5C, var(--student-orange));
        }

        .email-input-wrapper {
          display: flex;
          gap: 12px;
          margin-top: 32px;
        }

        .email-input {
          flex: 1;
          padding: 18px 24px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          font-size: 16px;
          font-family: inherit;
          transition: all 0.3s ease;
          background: #fafafa;
        }

        .email-input:focus {
          outline: none;
          border-color: var(--student-orange);
          background: white;
          box-shadow: 0 0 0 4px rgba(255, 107, 53, 0.1);
        }

        .email-input.valid {
          border-color: #22c55e;
          background: #f0fdf4;
        }

        .submit-btn {
          padding: 18px 36px;
          background: var(--student-orange);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .submit-btn:hover {
          background: #e55a2b;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        @media (max-width: 600px) {
          .email-input-wrapper {
            flex-direction: column;
          }
          .cta-card {
            padding: 40px 24px;
          }
        }

        /* Testimonial Cards */
        .testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        @media (max-width: 991px) {
          .testimonial-grid {
            grid-template-columns: 1fr;
          }
        }

        .testimonial-card {
          background: white;
          border-radius: 16px;
          padding: 32px;
          position: relative;
        }

        .testimonial-quote {
          font-size: 18px;
          line-height: 1.7;
          color: #333;
          margin-bottom: 24px;
          font-style: italic;
        }

        .testimonial-author {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .testimonial-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--student-orange-soft), var(--student-cream));
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          color: var(--student-orange);
        }

        .testimonial-name {
          font-weight: 600;
          font-size: 14px;
        }

        .testimonial-school {
          font-size: 13px;
          color: #666;
        }

        /* FAQ Section */
        .faq-item {
          background: white;
          border-radius: 12px;
          margin-bottom: 12px;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .faq-question {
          padding: 24px 32px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: background 0.2s ease;
        }

        .faq-question:hover {
          background: #fafafa;
        }

        .faq-answer {
          padding: 0 32px 24px;
          color: #666;
          line-height: 1.7;
        }

        /* Stats Bar */
        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          padding: 48px 0;
          border-top: 1px solid rgba(0,0,0,0.08);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          margin: 80px 0;
        }

        @media (max-width: 767px) {
          .stats-bar {
            grid-template-columns: repeat(2, 1fr);
            gap: 24px;
          }
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-family: 'Kalice Regular', serif;
          font-size: 48px;
          color: var(--student-orange);
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Navigation Fixes */
        .container--navbar { gap: 12px !important; }
        .navbar--menu { margin-left: 4px !important; }
        .btn--nav-wrapper { margin-left: auto !important; }

        /* Animation keyframes */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeInUp 0.8s ease forwards;
        }

        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }
        .delay-4 { animation-delay: 0.4s; }
        .delay-5 { animation-delay: 0.5s; }
        .delay-6 { animation-delay: 0.6s; }

        /* Container fallbacks */
        .container--872, .container--1328, .container--532 {
          max-width: 1328px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 24px;
          padding-right: 24px;
          width: 100%;
        }

        .container--872 {
          max-width: 872px;
        }

        .container--532 {
          max-width: 532px;
        }

        /* Section visibility fix */
        .section {
          display: block;
          position: relative;
        }

        .section.is--hero {
          padding-top: 160px;
        }

        .main-wrapper {
          display: block;
          width: 100%;
        }

        /* Heading visibility */
        .heading--96, .heading--22, .h2 {
          display: block;
          opacity: 1 !important;
          visibility: visible !important;
        }

        .paragraph--16, .body--14 {
          display: block;
          opacity: 1;
        }

        /* Responsive grids */
        @media (max-width: 991px) {
          .whats-included-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .testimonials-grid {
            grid-template-columns: 1fr !important;
          }
          .feature-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .steps-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 767px) {
          .feature-grid {
            grid-template-columns: 1fr !important;
          }
          .stats-bar {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .steps-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}} />

      <title>Surbee for Students - 3 Months Pro Free</title>
      <meta name="description" content="Get 3 months of Surbee Pro free with your .edu email. AI-powered surveys for thesis, dissertations, and research projects." />

      {/* Navigation */}
      <nav style={{ position: 'fixed', top: '0', left: '0', right: '0', zIndex: '1000', background: '#000', padding: '16px 0' }}>
        <div style={{ maxWidth: '1328px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src="/logo.svg" alt="Surbee" style={{ height: '24px', width: 'auto' }}/>
          </a>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="/product" style={{ color: '#fff', fontSize: '14px' }}>Product</a>
              <a href="/enterprise" style={{ color: '#fff', fontSize: '14px' }}>Enterprise</a>
              <a href="/pricing" style={{ color: '#fff', fontSize: '14px' }}>Pricing</a>
              <a href="/students" style={{ color: '#FF6B35', fontSize: '14px' }}>Students</a>
            </div>
            <Link href="/login" style={{ background: '#FF6B35', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ display: 'block', width: '100%' }}>
        {/* Hero Section */}
        <section style={{ minHeight: '85vh', paddingTop: '160px', paddingBottom: '80px', position: 'relative' }}>
          <div style={{ textAlign: 'center', maxWidth: '872px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
            <div style={{ marginBottom: '24px' }}>
              <span className="student-badge">
                <span className="student-badge-icon">🎓</span>
                3 Months Pro Free
              </span>
            </div>

            <h1 style={{ fontFamily: "'Kalice Regular', serif", fontSize: 'clamp(48px, 8vw, 96px)', marginBottom: '24px', lineHeight: '1.05' }}>
              Research smarter,<br/>not harder.
            </h1>

            <div style={{ maxWidth: '532px', margin: '0 auto' }}>
              <p style={{ fontSize: '18px', lineHeight: '1.7', color: '#444' }}>
                The AI-powered survey platform built for academic excellence. Create professional surveys in seconds, collect fraud-free data, and export publication-ready results.
              </p>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="#claim" className="btn--book is--black w-inline-block" style={{ background: '#000', color: '#fff', padding: '16px 32px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <span>Claim Your Free Pro</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
              <a href="#features" className="btn--book w-inline-block" style={{ background: 'transparent', border: '2px solid #000', color: '#000', padding: '14px 32px', borderRadius: '8px' }}>
                See Features
              </a>
            </div>

            <div style={{ marginTop: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                No credit card required
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Instant verification
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                Works with any .edu email
              </div>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section style={{ padding: '0 0 80px' }}>
          <div style={{ maxWidth: '1328px', margin: '0 auto', padding: '0 24px' }}>
            <div className="stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '32px', padding: '48px 0', borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)', margin: '0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Kalice Regular', serif", fontSize: '48px', color: '#FF6B35', lineHeight: '1', marginBottom: '8px' }}>50K+</div>
                <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student Researchers</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Kalice Regular', serif", fontSize: '48px', color: '#FF6B35', lineHeight: '1', marginBottom: '8px' }}>500+</div>
                <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Universities</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Kalice Regular', serif", fontSize: '48px', color: '#FF6B35', lineHeight: '1', marginBottom: '8px' }}>10x</div>
                <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Faster Than Manual</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: "'Kalice Regular', serif", fontSize: '48px', color: '#FF6B35', lineHeight: '1', marginBottom: '8px' }}>99.9%</div>
                <div style={{ fontSize: '14px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data Accuracy</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" style={{ paddingTop: '40px', paddingBottom: '100px' }}>
          <div style={{ maxWidth: '1328px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ justifyContent: 'center', display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '8px' }}>
                <div style={{ width: '8px', height: '8px', background: '#3B82F6', borderRadius: '50%' }}></div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#666' }}>Built for Academia</div>
              </div>
              <h2 style={{ fontFamily: "'Kalice Regular', serif", fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '16px' }}>Everything you need for A+ research</h2>
              <p style={{ maxWidth: '600px', margin: '0 auto', color: '#666', lineHeight: '1.7' }}>
                From thesis surveys to class projects, Surbee gives you professional-grade tools with student-friendly simplicity.
              </p>
            </div>

            <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '64px' }}>
              <div className="student-feature-card" style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #FBD8C6, #fff)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Kalice Regular', serif", fontSize: '22px', marginBottom: '12px' }}>Natural Language Generation</h3>
                <p style={{ color: '#666', lineHeight: '1.7', fontSize: '14px' }}>
                  Describe your research in plain English. Surbee generates methodologically sound survey questions tailored to your field of study.
                </p>
              </div>

              <div className="student-feature-card" style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #FBD8C6, #fff)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Kalice Regular', serif", fontSize: '22px', marginBottom: '12px' }}>Cipher Fraud Detection</h3>
                <p style={{ color: '#666', lineHeight: '1.7', fontSize: '14px' }}>
                  Our proprietary technology blocks bots, VPNs, and duplicate responses. Ensure your p-values are based on authentic human data.
                </p>
              </div>

              <div className="student-feature-card" style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #FBD8C6, #fff)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Kalice Regular', serif", fontSize: '22px', marginBottom: '12px' }}>Thesis-Ready Exports</h3>
                <p style={{ color: '#666', lineHeight: '1.7', fontSize: '14px' }}>
                  Export to SPSS, Excel, or CSV. Generate APA-formatted charts and tables ready to drop into your thesis or dissertation.
                </p>
              </div>

              <div className="student-feature-card" style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #FBD8C6, #fff)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Kalice Regular', serif", fontSize: '22px', marginBottom: '12px' }}>Team Collaboration</h3>
                <p style={{ color: '#666', lineHeight: '1.7', fontSize: '14px' }}>
                  Invite your study group or research team. Work on surveys together, share response data, and collaborate in real-time.
                </p>
              </div>

              <div className="student-feature-card" style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #FBD8C6, #fff)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                    <path d="M12 20V10"/>
                    <path d="M18 20V4"/>
                    <path d="M6 20v-4"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Kalice Regular', serif", fontSize: '22px', marginBottom: '12px' }}>Real-time Analytics</h3>
                <p style={{ color: '#666', lineHeight: '1.7', fontSize: '14px' }}>
                  Watch responses flow in with live dashboards. Track completion rates, analyze demographics, and spot trends instantly.
                </p>
              </div>

              <div className="student-feature-card" style={{ background: 'white', borderRadius: '16px', padding: '40px', border: '1px solid rgba(0,0,0,0.05)' }}>
                <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #FBD8C6, #fff)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <h3 style={{ fontFamily: "'Kalice Regular', serif", fontSize: '22px', marginBottom: '12px' }}>Unlimited Responses</h3>
                <p style={{ color: '#666', lineHeight: '1.7', fontSize: '14px' }}>
                  No caps on survey responses during your Pro trial. Collect as much data as your research requires without worrying about limits.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How to Claim Section */}
        <section style={{ padding: '100px 0', background: '#fff' }}>
          <div style={{ maxWidth: '1328px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{ fontFamily: "'Kalice Regular', serif", fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '16px' }}>Claim your 3 months of Pro</h2>
              <p style={{ color: '#666', maxWidth: '500px', margin: '0 auto' }}>
                Get started in under 60 seconds. No credit card, no strings attached.
              </p>
            </div>

            <div className="steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '96px', height: '96px', background: 'white', border: '3px solid #FF6B35', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontFamily: "'Kalice Regular', serif", fontSize: '36px', color: '#FF6B35' }}>1</div>
                <h3 style={{ fontFamily: "'Kalice Regular', serif", fontSize: '22px', marginBottom: '12px' }}>Sign Up with .edu</h3>
                <p style={{ color: '#666', maxWidth: '280px', margin: '0 auto', fontSize: '14px' }}>
                  Create a free account using your university email address (.edu, .ac.uk, etc.)
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '96px', height: '96px', background: 'white', border: '3px solid #FF6B35', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontFamily: "'Kalice Regular', serif", fontSize: '36px', color: '#FF6B35' }}>2</div>
                <h3 style={{ fontFamily: "'Kalice Regular', serif", fontSize: '22px', marginBottom: '12px' }}>Instant Verification</h3>
                <p style={{ color: '#666', maxWidth: '280px', margin: '0 auto', fontSize: '14px' }}>
                  We automatically verify your student status in real-time. No paperwork needed.
                </p>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '96px', height: '96px', background: 'white', border: '3px solid #FF6B35', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontFamily: "'Kalice Regular', serif", fontSize: '36px', color: '#FF6B35' }}>3</div>
                <h3 style={{ fontFamily: "'Kalice Regular', serif", fontSize: '22px', marginBottom: '12px' }}>Start Researching</h3>
                <p style={{ color: '#666', maxWidth: '280px', margin: '0 auto', fontSize: '14px' }}>
                  Get immediate access to all Pro features. Create unlimited surveys and collect data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What's Included */}
        <section style={{ padding: '100px 0', background: 'linear-gradient(180deg, #fff 0%, #EEE9E5 100%)' }}>
          <div style={{ maxWidth: '1328px', margin: '0 auto', padding: '0 24px' }}>
            <div className="whats-included-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
              <div>
                <div className="pro-highlight" style={{ marginBottom: '24px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Surbee Pro
                </div>
                <h2 style={{ fontFamily: "'Kalice Regular', serif", fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '24px' }}>What's included in your<br/>student Pro plan</h2>
                <p style={{ color: '#666', lineHeight: '1.8', marginBottom: '32px' }}>
                  Everything you need to conduct professional academic research, completely free for 3 months.
                </p>

                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    'Unlimited surveys & responses',
                    'AI-powered question generation',
                    'Cipher fraud detection',
                    'Advanced branching logic',
                    'SPSS, Excel & CSV exports',
                    'Real-time analytics dashboard',
                    'Team collaboration (up to 5 members)',
                    'Priority email support',
                    'Custom branding removal'
                  ].map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '24px', height: '24px', background: 'rgba(255, 107, 53, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                      <span style={{ fontSize: '15px' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: '#000', borderRadius: '24px', padding: '48px', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontFamily: "'Kalice Regular', serif", fontSize: '64px' }}>$0</span>
                  <span style={{ color: '#888' }}>/3 months</span>
                </div>
                <p style={{ color: '#888', marginBottom: '32px' }}>Then $12/mo student rate (65% off)</p>

                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: '#888' }}>Pro Monthly</span>
                    <span style={{ textDecoration: 'line-through', color: '#666' }}>$35/mo</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Student Discount</span>
                    <span style={{ color: '#22c55e' }}>-65%</span>
                  </div>
                </div>

                <a href="#claim" style={{ display: 'block', width: '100%', padding: '16px', background: '#FF6B35', color: '#fff', textAlign: 'center', borderRadius: '12px', fontWeight: '600', textDecoration: 'none' }}>
                  Get 3 Months Free
                </a>
                <p style={{ fontSize: '13px', color: '#666', textAlign: 'center', marginTop: '16px' }}>
                  Cancel anytime. No commitment required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section style={{ padding: '100px 0' }}>
          <div style={{ maxWidth: '1328px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{ fontFamily: "'Kalice Regular', serif", fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '16px' }}>Loved by student researchers</h2>
              <p style={{ color: '#666' }}>Join thousands of students using Surbee for their academic work.</p>
            </div>

            <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
                <p style={{ fontSize: '18px', lineHeight: '1.7', color: '#333', marginBottom: '24px', fontStyle: 'italic' }}>
                  "Surbee saved my thesis. I collected 500 responses in 2 days, and the Cipher feature filtered out 47 bot responses I would have never caught manually."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #FBD8C6, #EEE9E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#FF6B35' }}>SM</div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>Sarah M.</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>Psychology, Stanford</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
                <p style={{ fontSize: '18px', lineHeight: '1.7', color: '#333', marginBottom: '24px', fontStyle: 'italic' }}>
                  "The AI-generated questions understood my marketing research context perfectly. What would have taken me hours took 10 minutes."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #FBD8C6, #EEE9E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#FF6B35' }}>JK</div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>James K.</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>MBA, Wharton</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'white', borderRadius: '16px', padding: '32px' }}>
                <p style={{ fontSize: '18px', lineHeight: '1.7', color: '#333', marginBottom: '24px', fontStyle: 'italic' }}>
                  "Our group project went from chaotic spreadsheets to a beautiful collaborative workspace. The exports were thesis-ready."
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #FBD8C6, #EEE9E5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', color: '#FF6B35' }}>AL</div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>Aisha L.</div>
                    <div style={{ fontSize: '13px', color: '#666' }}>Sociology, Oxford</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section style={{ padding: '100px 0', background: '#fff' }}>
          <div style={{ maxWidth: '872px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 style={{ fontFamily: "'Kalice Regular', serif", fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '16px' }}>Frequently asked questions</h2>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', marginBottom: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '24px 32px', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>What email domains qualify for the student plan?</span>
                <span style={{ color: '#FF6B35' }}>+</span>
              </div>
              <div style={{ padding: '0 32px 24px', color: '#666', lineHeight: '1.7' }}>
                We accept .edu emails (US), .ac.uk (UK), .edu.au (Australia), and most other recognized academic email domains worldwide. If your institution uses a different format, contact us and we'll verify manually.
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', marginBottom: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '24px 32px', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>What happens after the 3-month trial?</span>
                <span style={{ color: '#FF6B35' }}>+</span>
              </div>
              <div style={{ padding: '0 32px 24px', color: '#666', lineHeight: '1.7' }}>
                After your trial, you can continue with our discounted student rate of $12/month (65% off the regular price), or downgrade to our free plan which includes basic features. Your data is never deleted.
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', marginBottom: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '24px 32px', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Can I use Surbee for my thesis or dissertation?</span>
                <span style={{ color: '#FF6B35' }}>+</span>
              </div>
              <div style={{ padding: '0 32px 24px', color: '#666', lineHeight: '1.7' }}>
                Absolutely! Surbee is designed specifically for academic research. Our exports are compatible with SPSS, R, and other statistical software. Charts are generated in APA format.
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', marginBottom: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '24px 32px', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>How does Cipher fraud detection work?</span>
                <span style={{ color: '#FF6B35' }}>+</span>
              </div>
              <div style={{ padding: '0 32px 24px', color: '#666', lineHeight: '1.7' }}>
                Cipher analyzes 50+ signals including IP patterns, response timing, device fingerprints, and behavioral patterns to identify bots, VPN users, and duplicate responses. It works automatically in the background with 99.9% accuracy.
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', marginBottom: '12px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ padding: '24px 32px', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Can my research team use the same account?</span>
                <span style={{ color: '#FF6B35' }}>+</span>
              </div>
              <div style={{ padding: '0 32px 24px', color: '#666', lineHeight: '1.7' }}>
                Yes! The Pro plan includes team collaboration for up to 5 members. Each team member needs their own .edu email to be added to your workspace.
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="claim" style={{ background: 'linear-gradient(180deg, #EEE9E5 0%, white 100%)', padding: '120px 0', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: '872px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '64px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '0', left: '0', right: '0', height: '6px', background: 'linear-gradient(90deg, #FF6B35, #FF8A5C, #FF6B35)' }}></div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '10px 20px', background: 'linear-gradient(135deg, #FF6B35 0%, #FF8A5C 100%)', color: 'white', borderRadius: '100px', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '24px' }}>
                  <span>🎓</span>
                  Limited Time Offer
                </span>
                <h2 style={{ fontFamily: "'Kalice Regular', serif", fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '16px', marginTop: '24px' }}>Ready to ace your research?</h2>
                <p style={{ color: '#666', maxWidth: '420px', margin: '0 auto', lineHeight: '1.7' }}>
                  Enter your .edu email below to claim 3 months of Surbee Pro completely free.
                </p>

                <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                  <input
                    type="email"
                    style={{
                      flex: '1',
                      padding: '18px 24px',
                      border: isValidEdu ? '2px solid #22c55e' : '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: isValidEdu ? '#f0fdf4' : '#fafafa',
                      outline: 'none'
                    }}
                    placeholder="yourname@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    style={{
                      padding: '18px 36px',
                      background: '#FF6B35',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isValidEdu ? 'pointer' : 'not-allowed',
                      opacity: isValidEdu ? 1 : 0.5,
                      whiteSpace: 'nowrap'
                    }}
                    disabled={!isValidEdu}
                  >
                    Get Pro Free
                  </button>
                </div>

                {email && !isValidEdu && (
                  <p style={{ fontSize: '13px', color: '#ef4444', marginTop: '12px' }}>
                    Please enter a valid .edu email address
                  </p>
                )}

                <p style={{ fontSize: '13px', color: '#888', marginTop: '16px' }}>
                  No credit card required. Cancel anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ background: '#000', color: '#fff', padding: '80px 0 40px' }}>
          <div style={{ maxWidth: '1328px', margin: '0 auto', padding: '0 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '80px', marginBottom: '60px' }}>
              <a href="/">
                <img src="/logo.svg" alt="Surbee" style={{ height: '40px', width: 'auto' }} />
              </a>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>Explore</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <a href="/product" style={{ color: '#fff', fontSize: '14px' }}>Product</a>
                    <a href="/enterprise" style={{ color: '#fff', fontSize: '14px' }}>Enterprise</a>
                    <a href="/pricing" style={{ color: '#fff', fontSize: '14px' }}>Pricing</a>
                    <a href="/about-us" style={{ color: '#fff', fontSize: '14px' }}>About</a>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>Learn</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <a href="/news" style={{ color: '#fff', fontSize: '14px' }}>News</a>
                    <a href="/learn" style={{ color: '#fff', fontSize: '14px' }}>Learn</a>
                    <a href="/students" style={{ color: '#FF6B35', fontSize: '14px' }}>Students</a>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#888', marginBottom: '16px' }}>Connect</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <a href="/subscribe" style={{ color: '#fff', fontSize: '14px' }}>Subscribe</a>
                    <a href="/careers" style={{ color: '#fff', fontSize: '14px' }}>Careers</a>
                    <a href="https://www.linkedin.com/company/surbee/" target="_blank" style={{ color: '#fff', fontSize: '14px' }}>LinkedIn</a>
                    <a href="https://x.com/surbeeai" target="_blank" style={{ color: '#fff', fontSize: '14px' }}>X</a>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <p style={{ color: '#666', fontSize: '13px', margin: 0 }}>© 2025 Surbee AG. All rights reserved.</p>
              <div style={{ display: 'flex', gap: '24px' }}>
                <a href="/terms" style={{ color: '#666', fontSize: '13px' }}>Terms of Service</a>
                <a href="/privacy-policy" style={{ color: '#666', fontSize: '13px' }}>Privacy Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </main>

    </div>
  );
}
