"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, CreditCard, HelpCircle, CheckCircle, Download, Calendar, AlertCircle, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PricingPage from '@/components/PricingPage';
import { SkeletonText, SkeletonCard, SkeletonStatsCard } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

interface Plan {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'annual';
  features: string[];
  popular?: boolean;
  current?: boolean;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  description: string;
}

export default function BillingSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showFade, setShowFade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setShowFade(scrollRef.current.scrollTop > 0);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Only show loading on first visit, not on navigation
  useEffect(() => {
    if (!authLoading) {
      const hasLoaded = sessionStorage.getItem('dashboard_loaded');
      if (hasLoaded) {
        setIsLoading(false);
      } else {
        const timer = setTimeout(() => {
          setIsLoading(false);
          sessionStorage.setItem('dashboard_loaded', 'true');
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [authLoading]);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      billing: 'monthly',
      current: true,
      features: [
        'Up to 3 surveys',
        '100 responses per month',
        'Basic templates',
        'Standard support',
        'Basic analytics'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: billingCycle === 'monthly' ? 29 : 290,
      billing: billingCycle,
      popular: true,
      features: [
        'Unlimited surveys',
        '10,000 responses per month',
        'Advanced templates',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
        'Data export',
        'Team collaboration'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 99 : 990,
      billing: billingCycle,
      features: [
        'Everything in Professional',
        'Unlimited responses',
        'Custom integrations',
        'Dedicated account manager',
        'Advanced security',
        'Custom domains',
        'SLA guarantee',
        'Advanced user management'
      ]
    }
  ];

  const invoices: Invoice[] = [
    {
      id: 'INV-001',
      date: '2024-12-01',
      amount: 29,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      id: 'INV-002',
      date: '2024-11-01',
      amount: 29,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      id: 'INV-003',
      date: '2024-10-01',
      amount: 29,
      status: 'paid',
      description: 'Professional Plan - Monthly'
    },
    {
      id: 'INV-004',
      date: '2024-09-01',
      amount: 29,
      status: 'failed',
      description: 'Professional Plan - Monthly'
    }
  ];

  const handlePlanUpgrade = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPricingModal(true);
  };

  const confirmUpgrade = () => {
    console.log('Upgrading to plan:', selectedPlan);
    setShowPricingModal(false);
    setSelectedPlan(null);
    // TODO: Implement plan upgrade
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surbee-bg-primary)' }}>
        <div className="flex-1 min-h-0">
          <div className="max-w-screen-xl mx-auto px-6 md:px-10 lg:px-16 h-full pt-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full max-w-6xl mx-auto">
              {/* Settings Navigation Skeleton */}
              <div className="lg:col-span-1">
                <div className="space-y-4">
                  <SkeletonText width="120px" height="2rem" className="mb-6" />
                  <div className="space-y-1">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2">
                        <div className="skeleton-circle" style={{ width: '16px', height: '16px' }}></div>
                        <SkeletonText width={`${60 + Math.random() * 40}px`} height="14px" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Billing Content Skeleton */}
              <div className="lg:col-span-3 space-y-6">
                {/* Current Plan Card Skeleton */}
                <div className="skeleton-card" style={{ padding: '24px' }}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="skeleton-circle" style={{ width: '20px', height: '20px' }}></div>
                      <SkeletonText width="120px" height="1.5rem" />
                    </div>
                    <SkeletonText width="250px" height="1rem" className="mb-6" />
                    
                    {/* Current plan display */}
                    <div className="skeleton-base" style={{ height: '5rem', borderRadius: '0.5rem', marginBottom: '1rem' }}></div>
                    
                    {/* Usage stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton-stats-card" style={{ height: '5rem' }}></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Available Plans Card Skeleton */}
                <div className="skeleton-card" style={{ padding: '24px' }}>
                  <div className="space-y-6">
                    <SkeletonText width="140px" height="1.5rem" className="mb-2" />
                    <SkeletonText width="220px" height="1rem" className="mb-6" />
                    
                    {/* Billing toggle */}
                    <div className="flex justify-center mb-6">
                      <div className="skeleton-base" style={{ width: '200px', height: '2.5rem', borderRadius: '0.5rem' }}></div>
                    </div>
                    
                    {/* Plans grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton-base" style={{ height: '20rem', borderRadius: '0.75rem' }}></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Payment Method Card Skeleton */}
                <div className="skeleton-card" style={{ padding: '24px' }}>
                  <div className="space-y-4">
                    <SkeletonText width="140px" height="1.5rem" className="mb-2" />
                    <SkeletonText width="300px" height="1rem" className="mb-6" />
                    
                    {/* Payment method display */}
                    <div className="skeleton-base" style={{ height: '4rem', borderRadius: '0.5rem' }}></div>
                    <div className="skeleton-base" style={{ height: '3rem', borderRadius: '0.5rem' }}></div>
                  </div>
                </div>

                {/* Billing History Card Skeleton */}
                <div className="skeleton-card" style={{ padding: '24px' }}>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="skeleton-circle" style={{ width: '20px', height: '20px' }}></div>
                      <SkeletonText width="140px" height="1.5rem" />
                    </div>
                    <SkeletonText width="250px" height="1rem" className="mb-6" />
                    
                    {/* Invoice list */}
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton-base" style={{ height: '4rem', borderRadius: '0.5rem' }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--surbee-bg-primary)' }}>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0">
        <div className="max-w-screen-xl mx-auto px-6 md:px-10 lg:px-16 h-full pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full max-w-6xl mx-auto">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
            <div className="space-y-4">
              <h1 className="projects-title">
                Settings
              </h1>

              <div className="space-y-1">
                {[
                  { icon: Settings, label: 'General', active: false, href: '/dashboard/settings/general' },
                  { icon: HelpCircle, label: 'Account', active: false, href: '/dashboard/settings/account' },
                  { icon: Shield, label: 'Privacy & Security', active: false, href: '/dashboard/settings/privacy' },
                  { icon: CreditCard, label: 'Billing & Plans', active: true, href: '/dashboard/settings/billing' },
                  { icon: Settings, label: 'Connectors', active: false, href: '/dashboard/settings/connectors' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => router.push(item.href)}
                      className={`
                        relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-150 cursor-pointer mb-0.5
                        ${item.active ? 'text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}
                      `}
                      style={{
                        backgroundColor: item.active 
                          ? 'var(--surbee-sidebar-active)' 
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[14px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

            {/* Billing Content - Only this scrolls */}
            <div className="lg:col-span-3 relative h-full flex flex-col min-h-0">
              {/* Persistent subtle fade at top */}
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[var(--surbee-bg-primary)] to-transparent z-10 pointer-events-none" />
              {/* Fade overlay at top - only show when scrolling */}
              <div className={`absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[var(--surbee-bg-primary)] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                showFade ? 'opacity-100' : 'opacity-0'
              }`} />
              
              {/* Scrollable content - only the cards */}
              <div 
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto pr-4 space-y-6 pb-16" 
                style={{ scrollbarWidth: 'thin' }}
              >
              {/* Current Plan */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                    <Star className="w-5 h-5 text-yellow-500" />
                    Current Plan
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Your current subscription and usage details.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div>
                        <h3 className="text-[18px] font-semibold text-blue-400">Free Plan</h3>
                        <p className="text-[14px] text-blue-300">Perfect for getting started</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[24px] font-bold text-blue-400">$0</div>
                        <div className="text-[12px] text-blue-300">per month</div>
                      </div>
                    </div>

                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-theme-secondary rounded-lg">
                        <div className="text-[20px] font-bold text-theme-primary">2/3</div>
                        <div className="text-[12px] text-theme-muted">Surveys Used</div>
                        <div className="w-full bg-theme-tertiary rounded-full h-1.5 mt-2">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '66%' }} />
                        </div>
                      </div>
                      <div className="p-3 bg-theme-secondary rounded-lg">
                        <div className="text-[20px] font-bold text-theme-primary">47/100</div>
                        <div className="text-[12px] text-theme-muted">Responses This Month</div>
                        <div className="w-full bg-theme-tertiary rounded-full h-1.5 mt-2">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '47%' }} />
                        </div>
                      </div>
                      <div className="p-3 bg-theme-secondary rounded-lg">
                        <div className="text-[20px] font-bold text-theme-primary">12</div>
                        <div className="text-[12px] text-theme-muted">Days Remaining</div>
                        <div className="text-[10px] text-theme-muted">Resets Jan 1, 2025</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Available Plans */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Available Plans
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Choose a plan that fits your needs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center">
                      <div className="flex items-center bg-theme-secondary rounded-lg p-1">
                        <button
                          onClick={() => setBillingCycle('monthly')}
                          className={`px-4 py-2 text-[14px] font-medium rounded-md transition-colors ${
                            billingCycle === 'monthly'
                              ? 'bg-theme-primary text-theme-primary shadow-sm'
                              : 'text-theme-muted hover:text-theme-secondary'
                          }`}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setBillingCycle('annual')}
                          className={`px-4 py-2 text-[14px] font-medium rounded-md transition-colors ${
                            billingCycle === 'annual'
                              ? 'bg-theme-primary text-theme-primary shadow-sm'
                              : 'text-theme-muted hover:text-theme-secondary'
                          }`}
                        >
                          Annual
                          <span className="ml-1 text-[11px] text-green-400">(Save 15%)</span>
                        </button>
                      </div>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {plans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`relative p-6 rounded-xl border transition-all ${
                            plan.current
                              ? 'border-blue-500 bg-blue-500/5'
                              : plan.popular
                              ? 'border-green-500 bg-green-500/5'
                              : 'border-theme-primary bg-theme-secondary'
                          }`}
                        >
                          {plan.popular && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <span className="bg-green-500 text-white text-[12px] px-3 py-1 rounded-full">
                                Most Popular
                              </span>
                            </div>
                          )}
                          
                          {plan.current && (
                            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                              <span className="bg-blue-500 text-white text-[12px] px-3 py-1 rounded-full">
                                Current Plan
                              </span>
                            </div>
                          )}

                          <div className="text-center mb-6">
                            <h3 className="text-[20px] font-semibold text-theme-primary mb-2">
                              {plan.name}
                            </h3>
                            <div className="text-[32px] font-bold text-theme-primary">
                              ${plan.price}
                              <span className="text-[14px] text-theme-muted font-normal">
                                /{plan.billing === 'monthly' ? 'mo' : 'yr'}
                              </span>
                            </div>
                            {billingCycle === 'annual' && plan.price > 0 && (
                              <div className="text-[12px] text-green-400">
                                Save ${Math.round(plan.price * 12 * 0.15)} per year
                              </div>
                            )}
                          </div>

                          <ul className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2 text-[14px]">
                                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                                <span className="text-theme-secondary">{feature}</span>
                              </li>
                            ))}
                          </ul>

                          <button
                            onClick={() => !plan.current && handlePlanUpgrade(plan)}
                            disabled={plan.current}
                            className={`w-full py-3 text-[14px] font-medium rounded-lg transition-colors ${
                              plan.current
                                ? 'bg-theme-tertiary text-theme-muted cursor-not-allowed'
                                : plan.popular
                                ? 'bg-green-600 text-white hover:bg-green-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Payment Method
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Manage your payment methods and billing information.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border border-theme-primary rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-[10px] text-white font-bold">VISA</span>
                          </div>
                          <div>
                            <div className="text-[14px] font-medium text-theme-primary">
                              •••• •••• •••• 4242
                            </div>
                            <div className="text-[12px] text-theme-muted">Expires 12/2027</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-[12px] text-blue-400 hover:text-blue-300">
                            Edit
                          </button>
                          <button className="text-[12px] text-red-400 hover:text-red-300">
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <button className="w-full p-3 border border-dashed border-theme-primary rounded-lg text-[14px] text-theme-muted hover:border-blue-400 hover:text-blue-400 transition-colors">
                      + Add New Payment Method
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing History */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                    <Calendar className="w-5 h-5" />
                    Billing History
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    View and download your past invoices.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 bg-theme-secondary rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className={`w-2 h-2 rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-400' :
                            invoice.status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'
                          }`} />
                          <div>
                            <div className="text-[14px] font-medium text-theme-primary">
                              {invoice.description}
                            </div>
                            <div className="text-[12px] text-theme-muted">
                              {formatDate(invoice.date)} • Invoice #{invoice.id}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-[14px] font-medium text-theme-primary">
                              ${invoice.amount}
                            </div>
                            <div className={`text-[11px] capitalize ${
                              invoice.status === 'paid' ? 'text-green-400' :
                              invoice.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {invoice.status}
                            </div>
                          </div>
                          <button className="p-2 text-theme-muted hover:text-theme-secondary transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Pricing Modal */}
        {showPricingModal && <PricingPage onClose={() => setShowPricingModal(false)} />}
    </div>
  );
}