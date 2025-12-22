"use client";

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UpgradePlanPage() {
  const [selectedPlan, setSelectedPlan] = useState<'personal' | 'business'>('personal');
  const router = useRouter();

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="upgrade-plan-container-fullscreen">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="upgrade-plan-close-btn"
        aria-label="Close upgrade plan"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="upgrade-plan-content">
        {/* Title */}
        <h1 className="upgrade-plan-title">
          Select a plan
        </h1>
        {/* Plan Toggle */}
        <div className="plan-toggle-container" role="radiogroup">
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
                <div className="plan-toggle-text">Personal</div>
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
                <div className="plan-toggle-text">Business</div>
              </div>
            </button>
          </div>
        </div>

        {/* Plans Container */}
        <div className="plans-container">
          <div className="plans-grid">
            {/* Pro Plan */}
            <div className="plan-card pro-plan">
              <div className="plan-content">
                <div className="plan-header">
                  <div className="plan-title-row">
                    <div className="plan-name">Pro</div>
                    <div className="popular-badge">
                      <div className="popular-text">Popular</div>
                    </div>
                  </div>
                  <div className="plan-pricing">
                    <div className="price-row">
                      <div className="price-amount">$20.00</div>
                      <div className="price-period"> / month</div>
                    </div>
                    <div className="annual-price-row">
                      <div className="annual-price">$16.67</div>
                      <div className="annual-text">when billed annually</div>
                    </div>
                  </div>
                </div>
                
                <div className="plan-description">
                  <div className="description-text">
                    Upgrade productivity and learning with additional access.
                  </div>
                </div>

                <div className="plan-button-container">
                  <button className="plan-button pro-button" type="button">
                    <div className="button-content">
                      <div className="button-text">Get Pro</div>
                    </div>
                  </button>
                </div>

                <ul className="features-list">
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">10x as many citations in answers</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Access to Perplexity Labs</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Unlimited file and photo uploads</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Extended access to Perplexity Research</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Extended access to image generation</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Limited access to video generation</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">One subscription for all the latest AI models including GPT-5 and Claude Sonnet 4</div>
                  </li>
                  <li className="feature-item sparkles">
                    <div className="feature-icon">
                      <svg className="sparkles-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z" />
                      </svg>
                    </div>
                    <div className="feature-text">Exclusive access to Pro Perks and more</div>
                  </li>
                </ul>
              </div>
              
              <div className="plan-footer">
                <div className="footer-text">
                  Existing subscriber? See{" "}
                  <a className="footer-link" href="https://www.perplexity.ai/help-center/en/collections/8934800-subscription-billing" target="_blank">
                    billing help
                  </a>
                </div>
              </div>
            </div>

            {/* Max Plan */}
            <div className="plan-card max-plan">
              <div className="plan-content">
                <div className="plan-header">
                  <div className="plan-title-row">
                    <div className="plan-name">Max</div>
                  </div>
                  <div className="plan-pricing">
                    <div className="price-row">
                      <div className="price-amount">$200.00</div>
                      <div className="price-period"> / month</div>
                    </div>
                  </div>
                </div>
                
                <div className="plan-description">
                  <div className="description-text">
                    Unlock Perplexity's full capabilities with early access to new products.
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
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Everything in Pro</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Early access to Comet, the agentic browser</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Unlimited access to Perplexity Labs</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Unlimited access to Perplexity Research</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Use advanced AI models like OpenAI o3-pro and Anthropic Claude Opus 4.1</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Enhanced access to video generation</div>
                  </li>
                  <li className="feature-item">
                    <div className="feature-icon">
                      <svg className="check-icon" height="16" width="16" fill="none" stroke="#8D9191" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12l5 5l10 -10" />
                      </svg>
                    </div>
                    <div className="feature-text">Priority support</div>
                  </li>
                </ul>
              </div>
              
              <div className="plan-footer">
                <div className="footer-text">
                  For personal use only, and subject to our{" "}
                  <a className="footer-link" href="https://www.perplexity.ai/hub/legal/terms-of-service" target="_blank">
                    policies
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}