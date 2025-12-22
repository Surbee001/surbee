"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, CreditCard, HelpCircle, Download, Calendar, AlertCircle, CreditCard as CreditCardIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SkeletonText, SkeletonCard, SkeletonStatsCard } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

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
  status: 'paid' | 'pending' | 'failed' | 'overdue';
  description: string;
}

export default function BillingSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'max'>('free');
  const [showFade, setShowFade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset scroll position and fade when component mounts
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
      setShowFade(false);
    }

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

  const invoices: Invoice[] = [
    {
      id: 'INV-001',
      date: '2025-11-28',
      amount: 100,
      status: 'overdue',
      description: 'Max Plan - Monthly'
    },
    {
      id: 'INV-002',
      date: '2025-10-28',
      amount: 83.88,
      status: 'paid',
      description: 'Pro Plan - Monthly'
    },
    {
      id: 'INV-003',
      date: '2025-10-22',
      amount: 20,
      status: 'paid',
      description: 'Add-on Services'
    },
    {
      id: 'INV-004',
      date: '2025-08-15',
      amount: 100,
      status: 'paid',
      description: 'Max Plan - Monthly'
    }
  ];

  const handleUpgrade = () => {
    // TODO: Implement upgrade to Max plan
    toast.info('Redirecting to upgrade page...');
    // router.push('/home/upgrade-plan');
  };

  const handleUpdatePayment = () => {
    // TODO: Implement payment method update
    toast.info('Payment method update feature coming soon');
  };

  const handlePayInvoice = (invoiceId: string) => {
    // TODO: Implement invoice payment
    toast.info(`Processing payment for invoice ${invoiceId}...`);
  };

  const handleViewInvoice = (invoiceId: string) => {
    // TODO: Implement invoice view/download
    toast.info(`Opening invoice ${invoiceId}...`);
  };

  const handleCancelPlan = () => {
    toast.warning('Are you sure you want to cancel your subscription?', {
      duration: 5000,
      action: {
        label: 'Yes, Cancel',
        onClick: () => {
          // TODO: Implement plan cancellation
          toast.error('Plan cancellation initiated. Your subscription will remain active until the end of the billing period.');
        }
      }
    });
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
    <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--surbee-bg-primary)' }}>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 px-6 md:px-10 lg:px-16 pt-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full max-w-6xl mx-auto">
            {/* Settings Navigation - Fixed */}
            <div className="lg:col-span-1 flex flex-col">
            <div className="space-y-4 flex-shrink-0">
              <h1 className="projects-title">
                Settings
              </h1>

              <div className="space-y-1">
                {[
                  { icon: Settings, label: 'General', active: false, href: '/home/settings/general' },
                  { icon: HelpCircle, label: 'Account', active: false, href: '/home/settings/account' },
                  { icon: Shield, label: 'Privacy & Security', active: false, href: '/home/settings/privacy' },
                  { icon: CreditCard, label: 'Billing', active: true, href: '/home/settings/billing' },
                  { icon: Settings, label: 'Connectors', active: false, href: '/home/settings/connectors' },
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
            <div className="lg:col-span-3 relative flex flex-col min-h-0 overflow-hidden">
              {/* Fade overlay at top - only show when scrolling */}
              <div className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[var(--surbee-bg-primary)] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
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
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--surbee-bg-secondary)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: 'var(--surbee-fg-primary)' }}>
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h2 className="text-[24px] font-bold mb-1" style={{ color: 'var(--surbee-fg-primary)' }}>
                          {currentPlan === 'max' ? 'Max plan' : currentPlan === 'pro' ? 'Pro plan' : 'Free plan'}
                        </h2>
                        <p className="text-[14px] mb-4" style={{ color: 'var(--surbee-fg-muted)' }}>
                          {currentPlan === 'max' ? '5x more usage than Pro' : currentPlan === 'pro' ? 'Unlimited surveys and advanced features' : 'Perfect for getting started'}
                        </p>
                        {currentPlan === 'max' && (
                          <p className="text-[14px]" style={{ color: 'var(--surbee-fg-muted)' }}>
                            Your subscription will auto renew on Dec 28, 2025.
                          </p>
                        )}
                        {(currentPlan === 'free' || currentPlan === 'pro') && (
                          <button
                            onClick={handleUpgrade}
                            className="px-6 py-2.5 rounded-lg font-medium text-[14px] transition-all mt-4"
                            style={{
                              backgroundColor: 'var(--surbee-fg-primary)',
                              color: 'var(--surbee-bg-primary)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.opacity = '0.9';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.opacity = '1';
                            }}
                          >
                            Upgrade to Max
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardContent>
                  <div className="space-y-6">
                    <h2 className="text-[24px] font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
                      Payment
                    </h2>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <CreditCardIcon className="w-5 h-5" style={{ color: 'var(--surbee-fg-muted)' }} />
                        <span className="text-[16px]" style={{ color: 'var(--surbee-fg-primary)' }}>
                          Visa •••• 6947
                        </span>
                      </div>
                      <button
                        onClick={handleUpdatePayment}
                        className="px-6 py-2.5 rounded-lg font-medium text-[14px] transition-all"
                        style={{
                          backgroundColor: 'var(--surbee-fg-primary)',
                          color: 'var(--surbee-bg-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        Update
                      </button>
                    </div>
                    {currentPlan === 'max' && invoices.some(inv => inv.status === 'overdue') && (
                      <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', borderWidth: '1px', borderStyle: 'solid' }}>
                        <p className="text-[14px]" style={{ color: 'rgb(239, 68, 68)' }}>
                          Your subscription is past due. Please change your payment method and pay your overdue invoice, or cancel your subscription.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Invoices */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardContent>
                  <div className="space-y-6">
                    <h2 className="text-[24px] font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
                      Invoices
                    </h2>
                    <div className="space-y-0">
                      <div className="grid grid-cols-4 gap-4 pb-3 border-b" style={{ borderColor: 'var(--surbee-border-primary)' }}>
                        <div className="text-[12px] font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>Date</div>
                        <div className="text-[12px] font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>Total</div>
                        <div className="text-[12px] font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>Status</div>
                        <div className="text-[12px] font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>Actions</div>
                      </div>
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="grid grid-cols-4 gap-4 py-4 border-b last:border-b-0" style={{ borderColor: 'var(--surbee-border-primary)' }}>
                          <div className="text-[14px]" style={{ color: 'var(--surbee-fg-primary)' }}>
                            {formatDate(invoice.date)}
                          </div>
                          <div className="text-[14px]" style={{ color: 'var(--surbee-fg-primary)' }}>
                            US${invoice.amount.toFixed(2)}
                          </div>
                          <div className="flex items-center gap-2">
                            {invoice.status === 'overdue' && (
                              <AlertCircle className="w-4 h-4" style={{ color: 'rgb(239, 68, 68)' }} />
                            )}
                            <span className={`text-[14px] capitalize ${
                              invoice.status === 'paid' ? 'text-green-400' :
                              invoice.status === 'overdue' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {invoice.status === 'overdue' ? 'Overdue' : invoice.status}
                            </span>
                          </div>
                          <div>
                            {invoice.status === 'overdue' ? (
                              <button 
                                onClick={() => handlePayInvoice(invoice.id)}
                                className="text-[14px] underline" 
                                style={{ color: 'var(--surbee-fg-primary)' }}
                              >
                                Pay
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleViewInvoice(invoice.id)}
                                className="text-[14px] underline" 
                                style={{ color: 'var(--surbee-fg-primary)' }}
                              >
                                View
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cancellation */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardContent>
                  <div className="space-y-6">
                    <h2 className="text-[24px] font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
                      Cancellation
                    </h2>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[16px]" style={{ color: 'var(--surbee-fg-primary)' }}>
                        Cancel plan
                      </span>
                      <button
                        onClick={handleCancelPlan}
                        className="px-6 py-2.5 rounded-lg font-medium text-[14px] transition-all"
                        style={{
                          backgroundColor: 'rgb(239, 68, 68)',
                          color: 'white'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.opacity = '0.9';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}