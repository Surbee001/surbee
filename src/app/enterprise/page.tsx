'use client';

import React from 'react';
import Script from 'next/script';

export default function EnterprisePage() {
  return (
    <div style={{ backgroundColor: '#EEE9E5', minHeight: '100vh', color: '#000', fontFamily: 'sans-serif' }} className="enterprise-page-wrapper">
      <style dangerouslySetInnerHTML={{__html: `
        .enterprise-page-wrapper img, .enterprise-page-wrapper svg {
          display: inline-block;
          vertical-align: middle;
        }
        .enterprise-page-wrapper a {
          color: inherit;
          text-decoration: none;
        }

        /* Kalice Regular Font */
        @font-face {
          font-family: 'Kalice Regular';
          src: url('/fonts/Kalice-Trial-Regular.otf') format('opentype');
        }

        /* Apply Kalice font to all serif titles */
        .enterprise-page-wrapper h1,
        .enterprise-page-wrapper h2,
        .enterprise-page-wrapper h3 {
          font-family: 'Kalice Regular', serif;
        }

        /* Hero Carousel Animation */
        @keyframes slideCarousel {
          0% { transform: translateX(0); }
          20% { transform: translateX(-100%); }
          40% { transform: translateX(-200%); }
          60% { transform: translateX(-300%); }
          80% { transform: translateX(-400%); }
          100% { transform: translateX(-500%); }
        }

        .hero-carousel-container {
          overflow: hidden;
          background: #000;
          border-radius: 16px;
          position: relative;
          height: 500px;
        }

        .hero-carousel-slides {
          display: flex;
          animation: slideCarousel 40s linear infinite;
        }

        .hero-slide {
          min-width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          color: #fff;
          font-weight: bold;
        }

        .slide-1 { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); }
        .slide-2 { background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%); }
        .slide-3 { background: linear-gradient(135deg, #3d3d3d 0%, #1a1a1a 100%); }
        .slide-4 { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); }
        .slide-5 { background: linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%); }

        .enterprise-section {
          padding: 80px 0;
        }

        .enterprise-features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 32px;
          margin-top: 40px;
        }

        .feature-card {
          padding: 32px;
          border: 2px solid #000;
          border-radius: 8px;
          background: #fff;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }

        .feature-icon {
          font-size: 32px;
          margin-bottom: 16px;
        }

        .trust-section {
          background: #000;
          color: #fff;
          padding: 80px 0;
        }

        .trust-logos {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 40px;
          margin-top: 40px;
          place-items: center;
        }

        .trust-logo {
          font-size: 14px;
          opacity: 0.7;
          text-align: center;
        }
      `}} />

      <meta charSet="utf-8"/>
      <title>Enterprise AI Data Solutions - Surbee</title>
      <meta content="Enterprise-grade AI data extraction and intelligence for research institutions, universities, and large-scale operations." name="description"/>

      {/* Navigation */}
      <nav style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
        <a href="/" style={{ fontSize: '20px', fontWeight: 'bold' }}>Surbee</a>
        <div style={{ display: 'flex', gap: '32px' }}>
          <a href="/product">Product</a>
          <a href="/enterprise">Enterprise</a>
          <a href="/security">Security</a>
          <a href="/contact">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main>
        <section className="enterprise-section" style={{ paddingTop: '100px', paddingBottom: '60px' }}>
          <div style={{ maxWidth: '1328px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
            <div style={{ maxWidth: '700px', marginBottom: '60px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Enterprise Solutions
              </div>
              <h1 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '24px', lineHeight: '1.2' }}>
                Intelligence at Scale for Enterprise
              </h1>
              <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6', marginBottom: '32px' }}>
                Deploy Surbee across your organization to extract and analyze data at enterprise scale. Trusted by research institutions, universities, and Fortune 500 companies.
              </p>
              <div style={{ display: 'flex', gap: '16px' }}>
                <button style={{ padding: '12px 32px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  Request Demo
                </button>
                <button style={{ padding: '12px 32px', background: 'transparent', color: '#000', border: '2px solid #000', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  View Security
                </button>
              </div>
            </div>

            {/* Hero Carousel */}
            <div className="hero-carousel-container">
              <div className="hero-carousel-slides">
                <div className="hero-slide slide-1">Enterprise Dashboard</div>
                <div className="hero-slide slide-2">Real-time Analytics</div>
                <div className="hero-slide slide-3">Advanced Permissions</div>
                <div className="hero-slide slide-4">Compliance Ready</div>
                <div className="hero-slide slide-5">API & Integrations</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enterprise Features */}
        <section className="enterprise-section" style={{ maxWidth: '1328px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>Built for Enterprise</h2>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '60px', maxWidth: '600px' }}>
            Everything enterprises need to deploy AI data extraction at scale, securely and reliably.
          </p>

          <div className="enterprise-features-grid">
            <div className="feature-card">
              <div className="feature-icon">🔐</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Enterprise Security</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>SOC 2 Type II, HIPAA-ready, and full SAML integration. Deploy on-premises or in your VPC.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Role-Based Access</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>Granular permission controls. Department-level workspaces. Audit logs for every action.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Scale Without Limits</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>Process millions of data points. Unlimited concurrent users. 99.99% uptime SLA.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔗</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Seamless Integration</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>REST API, webhooks, and native integrations with Salesforce, Tableau, and more.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Advanced Analytics</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>Real-time dashboards, custom reporting, and predictive analytics built in.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛠️</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Dedicated Support</h3>
              <p style={{ color: '#666', lineHeight: '1.6' }}>24/7 enterprise support. Dedicated success manager. Custom SLA terms.</p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="enterprise-section" style={{ maxWidth: '1328px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '60px' }}>Use Cases by Industry</h2>

          <div className="enterprise-features-grid">
            <div style={{ padding: '32px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Research Institutions</h3>
              <p style={{ color: '#666', marginBottom: '16px' }}>Analyze survey responses, research data, and academic feedback at scale with enterprise-grade compliance.</p>
              <ul style={{ color: '#666', paddingLeft: '20px' }}>
                <li>HIPAA-compliant data handling</li>
                <li>Multi-institutional collaboration</li>
                <li>Publication-ready analytics</li>
              </ul>
            </div>

            <div style={{ padding: '32px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Universities & Education</h3>
              <p style={{ color: '#666', marginBottom: '16px' }}>Process student surveys, course feedback, and research questionnaires across departments.</p>
              <ul style={{ color: '#666', paddingLeft: '20px' }}>
                <li>Campus-wide deployment</li>
                <li>Department-level permissions</li>
                <li>Fraud detection for exams</li>
              </ul>
            </div>

            <div style={{ padding: '32px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Market Research</h3>
              <p style={{ color: '#666', marginBottom: '16px' }}>Conduct large-scale consumer research with built-in quality assurance and integrity checks.</p>
              <ul style={{ color: '#666', paddingLeft: '20px' }}>
                <li>Multi-language support</li>
                <li>Geographic filtering</li>
                <li>Real-time insights</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="trust-section">
          <div style={{ maxWidth: '1328px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
            <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center' }}>Trusted by Leading Organizations</h2>
            <div className="trust-logos">
              <div className="trust-logo">Harvard University</div>
              <div className="trust-logo">Stanford Research</div>
              <div className="trust-logo">MIT</div>
              <div className="trust-logo">Oxford</div>
              <div className="trust-logo">Yale</div>
              <div className="trust-logo">Princeton</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ maxWidth: '1328px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px', padding: '100px 20px' }}>
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '32px' }}>Ready to scale your data intelligence?</h2>
            <p style={{ fontSize: '18px', color: '#666', marginBottom: '40px', lineHeight: '1.6' }}>
              Let's discuss how Surbee can transform your organization's ability to extract and analyze data at enterprise scale.
            </p>
            <button style={{ padding: '16px 48px', background: '#000', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
              Schedule Enterprise Demo
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#000', color: '#fff', padding: '60px 40px', marginTop: '80px' }}>
        <div style={{ maxWidth: '1328px', margin: '0 auto' }}>
          <p>&copy; 2025 Surbee. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
