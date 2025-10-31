"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, CreditCard, HelpCircle, Mail, MessageCircle, Phone, ExternalLink, FileText, Bug, Lightbulb, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SkeletonText, SkeletonCard, SkeletonForm } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [supportTicket, setSupportTicket] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    description: ''
  });

  const [showContactModal, setShowContactModal] = useState(false);
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

  const handleSupportSubmit = () => {
    console.log('Submitting support ticket:', supportTicket);
    setSupportTicket({
      subject: '',
      category: 'general',
      priority: 'medium',
      description: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setSupportTicket(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 px-6 md:px-10 lg:px-16 pt-12">
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

            {/* Help Content Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              {/* Contact Support Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="140px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="300px" height="1rem" className="mb-6" />
                  
                  <SkeletonForm fields={4} />
                  
                  <div className="skeleton-base" style={{ width: '140px', height: '2.5rem', borderRadius: '0.5rem' }}></div>
                </div>
              </div>

              {/* Quick Help Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="100px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="220px" height="1rem" className="mb-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="skeleton-base" style={{ height: '4rem', borderRadius: '0.5rem' }}></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Documentation Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="130px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="280px" height="1rem" className="mb-6" />
                  
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="skeleton-circle" style={{ width: '20px', height: '20px' }}></div>
                          <div className="flex-1">
                            <SkeletonText width={`${120 + Math.random() * 80}px`} height="1rem" className="mb-1" />
                            <SkeletonText width={`${200 + Math.random() * 100}px`} height="0.75rem" />
                          </div>
                        </div>
                        <div className="skeleton-circle" style={{ width: '16px', height: '16px' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="160px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="250px" height="1rem" className="mb-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="skeleton-base" style={{ height: '6rem', borderRadius: '0.5rem' }}></div>
                    ))}
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
    <div className="min-h-screen flex flex-col overflow-hidden">

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 px-6 md:px-10 lg:px-16 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full max-w-6xl mx-auto">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h1 className="text-[28px] font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
                Settings
              </h1>
              
              <div className="space-y-1">
                {[
                  { icon: Settings, label: 'General', active: false, href: '/dashboard/settings/general' },
                  { icon: HelpCircle, label: 'Account', active: true, href: '/dashboard/settings/account' },
                  { icon: Shield, label: 'Privacy & Security', active: false, href: '/dashboard/settings/privacy' },
                  { icon: CreditCard, label: 'Billing & Plans', active: false, href: '/dashboard/settings/billing' },
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

            {/* Account Content - Only this scrolls */}
            <div className="lg:col-span-3 relative h-full flex flex-col min-h-0">
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
              {/* Quick Support */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                    <MessageCircle className="w-5 h-5" />
                    Quick Support
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Get help with common questions and issues.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setShowContactModal(true)}
                      className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg hover:bg-blue-500/15 transition-colors text-left"
                    >
                      <MessageCircle className="w-6 h-6 text-blue-400 mb-2" />
                      <h3 className="text-[14px] font-medium text-blue-400 mb-1">Live Chat</h3>
                      <p className="text-[12px] text-blue-300">Chat with our support team</p>
                    </button>
                    
                    <button className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg hover:bg-green-500/15 transition-colors text-left">
                      <Mail className="w-6 h-6 text-green-400 mb-2" />
                      <h3 className="text-[14px] font-medium text-green-400 mb-1">Email Support</h3>
                      <p className="text-[12px] text-green-300">Get help via email</p>
                    </button>
                    
                    <button className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg hover:bg-purple-500/15 transition-colors text-left">
                      <Phone className="w-6 h-6 text-purple-400 mb-2" />
                      <h3 className="text-[14px] font-medium text-purple-400 mb-1">Phone Support</h3>
                      <p className="text-[12px] text-purple-300">Call us directly</p>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Help Resources */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                    <FileText className="w-5 h-5" />
                    Help Resources
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Explore our documentation and guides.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        title: 'Getting Started Guide',
                        description: 'Learn how to create your first survey',
                        link: '#',
                        icon: FileText
                      },
                      {
                        title: 'Advanced Features',
                        description: 'Discover powerful survey customization options',
                        link: '#',
                        icon: Lightbulb
                      },
                      {
                        title: 'API Documentation',
                        description: 'Integrate Surbee with your applications',
                        link: '#',
                        icon: FileText
                      },
                      {
                        title: 'Video Tutorials',
                        description: 'Watch step-by-step video guides',
                        link: '#',
                        icon: FileText
                      },
                      {
                        title: 'Community Forum',
                        description: 'Connect with other Surbee users',
                        link: '#',
                        icon: MessageCircle
                      }
                    ].map((resource, index) => (
                      <button
                        key={index}
                        className="w-full flex items-center justify-between p-3 bg-theme-secondary rounded-lg hover:bg-theme-tertiary transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <resource.icon className="w-5 h-5 text-theme-muted" />
                          <div>
                            <h3 className="text-[14px] font-medium text-theme-primary">
                              {resource.title}
                            </h3>
                            <p className="text-[12px] text-theme-muted">
                              {resource.description}
                            </p>
                          </div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-theme-muted" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Support Ticket */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                    <Bug className="w-5 h-5" />
                    Submit Support Ticket
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Report issues or request help from our support team.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                        Subject
                      </label>
                      <input
                        type="text"
                        value={supportTicket.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder="Brief description of your issue"
                        className="w-full p-3 rounded-lg border text-[14px] theme-input"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                          Category
                        </label>
                        <select
                          value={supportTicket.category}
                          onChange={(e) => handleInputChange('category', e.target.value)}
                          className="w-full p-3 rounded-lg border text-[14px] theme-input"
                        >
                          <option value="general">General Question</option>
                          <option value="bug">Bug Report</option>
                          <option value="feature">Feature Request</option>
                          <option value="billing">Billing Issue</option>
                          <option value="account">Account Problem</option>
                          <option value="integration">Integration Help</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                          Priority
                        </label>
                        <select
                          value={supportTicket.priority}
                          onChange={(e) => handleInputChange('priority', e.target.value)}
                          className="w-full p-3 rounded-lg border text-[14px] theme-input"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                        Description
                      </label>
                      <textarea
                        value={supportTicket.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={6}
                        placeholder="Please provide detailed information about your issue, including steps to reproduce if it's a bug..."
                        className="w-full p-3 rounded-lg border text-[14px] theme-input resize-none"
                      />
                    </div>

                    <button
                      onClick={handleSupportSubmit}
                      disabled={!supportTicket.subject || !supportTicket.description}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg text-[14px] font-medium hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                    >
                      Submit Support Ticket
                    </button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Management */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Account Management
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Manage your account settings and organization details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Organization ID */}
                    <div>
                      <label className="text-[14px] font-medium mb-2 block" style={{ color: 'var(--surbee-fg-primary)' }}>
                        Organization ID
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={user?.uid ? `org_${user.uid.substring(0, 16)}` : 'org_loading...'}
                          readOnly
                          className="flex-1 p-2.5 rounded-lg border text-[14px] font-mono"
                          style={{
                            backgroundColor: 'var(--surbee-bg-secondary)',
                            borderColor: 'var(--surbee-border-accent)',
                            color: 'var(--surbee-fg-primary)'
                          }}
                        />
                        <button
                          onClick={() => {
                            const orgId = user?.uid ? `org_${user.uid.substring(0, 16)}` : '';
                            navigator.clipboard.writeText(orgId);
                          }}
                          className="px-4 py-2.5 rounded-lg border transition-colors text-[14px] font-medium"
                          style={{
                            borderColor: 'var(--surbee-border-accent)',
                            backgroundColor: 'var(--surbee-sidebar-hover)',
                            color: 'var(--surbee-fg-primary)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-active)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                          }}
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-[12px] mt-1.5" style={{ color: 'var(--surbee-fg-muted)' }}>
                        Use this ID for API integrations and support requests
                      </p>
                    </div>

                    <div className="h-px" style={{ backgroundColor: 'var(--surbee-border-primary)' }} />

                    {/* Account Actions */}
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          // Logout logic here
                          console.log('Logging out...');
                        }}
                        className="w-full px-4 py-3 rounded-lg border text-[14px] font-medium transition-colors flex items-center justify-center gap-2"
                        style={{
                          borderColor: 'var(--surbee-border-accent)',
                          backgroundColor: 'var(--surbee-sidebar-hover)',
                          color: 'var(--surbee-fg-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-active)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                        }}
                      >
                        Log Out
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            console.log('Deleting account...');
                          }
                        }}
                        className="w-full px-4 py-3 rounded-lg border border-red-500/30 text-[14px] font-medium transition-colors bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      >
                        Delete Account
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* System Status */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                    <AlertTriangle className="w-5 h-5" />
                    System Status
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Current status of Surbee services.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { service: 'Survey Builder', status: 'operational', uptime: '99.9%' },
                      { service: 'Data Collection', status: 'operational', uptime: '99.8%' },
                      { service: 'Analytics Engine', status: 'operational', uptime: '99.7%' },
                      { service: 'API Services', status: 'degraded', uptime: '97.2%' },
                      { service: 'Email Notifications', status: 'operational', uptime: '99.5%' }
                    ].map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            service.status === 'operational' ? 'bg-green-400' :
                            service.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                          }`} />
                          <span className="text-[14px] text-theme-primary">{service.service}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[12px] text-theme-muted">{service.uptime} uptime</span>
                          <span className={`text-[12px] capitalize ${
                            service.status === 'operational' ? 'text-green-400' :
                            service.status === 'degraded' ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="w-full mt-4 p-3 border border-theme-primary rounded-lg text-[14px] text-theme-muted hover:text-theme-secondary hover:border-blue-400 transition-colors">
                    View Detailed Status Page
                  </button>
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </div>

      {/* Contact Modal */}
      {showContactModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-theme-primary p-6 rounded-xl max-w-md mx-4 border border-theme-primary">
              <h3 className="text-[20px] font-semibold text-theme-primary mb-4">
                Contact Support
              </h3>
              <p className="text-[14px] text-theme-muted mb-6">
                Choose how you'd like to get in touch with our support team.
              </p>
              <div className="space-y-3">
                <button className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    <div>
                      <div className="text-[14px] font-medium">Start Live Chat</div>
                      <div className="text-[12px] opacity-75">Average response: 2 minutes</div>
                    </div>
                  </div>
                </button>
                
                <button className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <div>
                      <div className="text-[14px] font-medium">Send Email</div>
                      <div className="text-[12px] opacity-75">support@surbee.com</div>
                    </div>
                  </div>
                </button>
                
                <button className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" />
                    <div>
                      <div className="text-[14px] font-medium">Call Support</div>
                      <div className="text-[12px] opacity-75">+1 (555) 123-HELP</div>
                    </div>
                  </div>
                </button>
              </div>
              
              <button
                onClick={() => setShowContactModal(false)}
                className="w-full mt-4 px-4 py-2 border border-theme-primary rounded-lg text-[14px] font-medium text-theme-secondary hover:bg-theme-secondary transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
  );
}