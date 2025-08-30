"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<'personal' | 'business'>('personal');

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="w-full bg-transparent">
        <div className="max-w-7xl mx-auto px-8 py-2 h-[88px] flex items-center">
          <div className="flex justify-between items-center w-full">
            {/* Logo */}
            <div className="flex items-center">
              <img src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg" alt="Surbee" className="h-16" />
            </div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                Home
              </Link>
              <Link href="/about" className="text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                About
              </Link>
              <Link href="/students" className="text-gray-600 hover:text-black hover:bg-gray-100 px-3 py-2 rounded-md transition-all duration-200" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                For Students
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-600 hover:text-black px-4 py-2 rounded-md transition-colors" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                Sign In
              </Link>
              <Link href="/signup" className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-colors" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                Try Surbee Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="upgrade-plan-content">
          {/* Title */}
          <h1 className="upgrade-plan-title !text-black" style={{ color: '#000000 !important' }}>
            Select a plan
          </h1>
          {/* Plan Toggle - Completely Hidden */}
          <div className="plan-toggle-container" style={{ display: 'none' }} role="radiogroup">
            <div className="plan-toggle-background" />
            <div className="plan-toggle-wrapper">
              <button
                className={`plan-toggle-button ${selectedPlan === 'personal' ? 'active' : ''}`}
                type="button"
                value="personal"
                aria-checked={selectedPlan === 'personal'}
                aria-label="Personal"
                role="radio"
                onClick={() => setSelectedPlan('personal')}
              >
                {selectedPlan === 'personal' && <div className="plan-toggle-indicator" />}
                <div className="plan-toggle-content">
                  <div className="plan-toggle-text !text-black" style={{ color: '#000000 !important' }}>Personal</div>
                </div>
              </button>
              <button
                className={`plan-toggle-button ${selectedPlan === 'business' ? 'active' : ''}`}
                type="button"
                value="business"
                aria-checked={selectedPlan === 'business'}
                aria-label="Business"
                role="radio"
                onClick={() => setSelectedPlan('business')}
              >
                {selectedPlan === 'business' && <div className="plan-toggle-indicator" />}
                <div className="plan-toggle-content">
                  <div className="plan-toggle-text !text-black" style={{ color: '#000000 !important' }}>Business</div>
                </div>
              </button>
            </div>
          </div>

          {/* Plans Container */}
          <div className="plans-container">
            <div className="plans-grid">
              {/* Pro Plan */}
              <div className="plan-card pro-plan !border-gray-300" style={{ border: '1px solid #D1D5DB !important', backgroundColor: 'white !important' }}>
                <div className="plan-content">
                  <div className="plan-header">
                    <div className="plan-title-row">
                      <div className="plan-name !text-black" style={{ color: '#000000 !important' }}>Pro</div>
                      <div className="popular-badge" style={{ backgroundColor: '#E5E7EB' }}>
                        <div className="popular-text" style={{ color: '#000000 !important' }}>Popular</div>
                      </div>
                    </div>
                    <div className="plan-pricing">
                      <div className="price-row">
                        <div className="price-amount !text-black" style={{ color: '#000000 !important' }}>$20.00</div>
                        <div className="price-period !text-gray-600" style={{ color: '#6B7280 !important' }}> / month</div>
                      </div>
                      <div className="annual-price-row">
                        <div className="annual-price !text-black" style={{ color: '#000000 !important' }}>$16.67</div>
                        <div className="annual-text !text-gray-600" style={{ color: '#6B7280 !important' }}>when billed annually</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="plan-description">
                    <div className="description-text !text-gray-700" style={{ color: '#374151 !important' }}>
                      Upgrade productivity and learning with additional access.
                    </div>
                  </div>

                  <div className="plan-button-container">
                    <button className="plan-button pro-button" type="button" style={{ backgroundColor: '#000000 !important', color: '#FFFFFF !important' }}>
                      <div className="button-content">
                        <div className="button-text" style={{ color: '#FFFFFF !important' }}>Get Pro</div>
                      </div>
                    </button>
                  </div>

                  <ul className="features-list">
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Unlimited survey responses</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Advanced AI question generation</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Professional analytics dashboard</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Priority email support</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Custom branding options</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Data export in all formats</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Advanced logic and branching</div>
                    </li>
                    <li className="feature-item sparkles">
                      <div className="feature-icon">
                        <svg className="sparkles-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Real-time collaboration</div>
                    </li>
                  </ul>
                </div>
                
                <div className="plan-footer">
                  <div className="footer-text !text-gray-600" style={{ color: '#6B7280 !important' }}>
                    Start building better surveys today
                  </div>
                </div>
              </div>

              {/* Max Plan */}
              <div className="plan-card max-plan !border-gray-300" style={{ border: '1px solid #D1D5DB !important', backgroundColor: 'white !important' }}>
                <div className="plan-content">
                  <div className="plan-header">
                    <div className="plan-title-row">
                      <div className="plan-name !text-black" style={{ color: '#000000 !important' }}>Max</div>
                    </div>
                    <div className="plan-pricing">
                      <div className="price-row">
                        <div className="price-amount !text-black" style={{ color: '#000000 !important' }}>$200.00</div>
                        <div className="price-period !text-gray-600" style={{ color: '#6B7280 !important' }}> / month</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="plan-description">
                    <div className="description-text !text-gray-700" style={{ color: '#374151 !important' }}>
                      Unlock Surbee's full capabilities with enterprise-grade features.
                    </div>
                  </div>

                  <div className="plan-button-container">
                    <button className="plan-button max-button" type="button">
                      <div className="button-content">
                        <div className="button-text">Get Max</div>
                      </div>
                    </button>
                  </div>

                  <ul className="features-list">
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Everything in Pro</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Unlimited team members</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Advanced user permissions</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Custom integrations & API access</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Dedicated account manager</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>Advanced security features</div>
                    </li>
                    <li className="feature-item">
                      <div className="feature-icon">
                        <svg className="check-icon" height="16" width="16" fill="none" stroke="#6B7280" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M5 12l5 5l10 -10" />
                        </svg>
                      </div>
                      <div className="feature-text !text-gray-700" style={{ color: '#374151 !important' }}>24/7 priority support</div>
                    </li>
                  </ul>
                </div>
                
                <div className="plan-footer">
                  <div className="footer-text !text-gray-600" style={{ color: '#6B7280 !important' }}>
                    Contact us for enterprise pricing
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-16">
          {/* Footer Links */}
          <div className="grid grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>Product</h4>
              <ul className="space-y-2" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee Lyra</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee Cipher</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Credit Network</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>Resources</h4>
              <ul className="space-y-2" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee for Education</a></li>
                <li><Link href="/students" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee for Students</Link></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Surbee for Researchers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>Legal</h4>
              <ul className="space-y-2" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                <li><Link href="/privacy" className="text-gray-600 hover:text-gray-900 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-gray-900 transition-colors">Terms of Service</Link></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">GDPR</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>Follow Us</h4>
              <ul className="space-y-2" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">X / Twitter</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Instagram</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">LinkedIn</a></li>
                <li><a href="https://discord.gg/krs577Qxqr" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-900 transition-colors">Discord</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">Reddit</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="https://raw.githubusercontent.com/Surbee001/webimg/d31a230c841bc324c709964f3d9ab01daec67f8d/Surbee%20Logo%20Final.svg" alt="Surbee" className="h-20" />
            </div>
            <p className="text-sm text-gray-500" style={{ fontFamily: 'FK Grotesk, sans-serif' }}>
              © 2025 Surbee. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}