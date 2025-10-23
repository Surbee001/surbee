"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { api } from "@/lib/trpc/react";
import { HelpCircle, Check, ChevronUp, ChevronDown, Gift, X, Copy, ArrowRight, ExternalLink, Settings as SettingsIcon, Sun, Moon, Laptop } from "lucide-react";

const SidebarItem = ({ 
  label, 
  isActive = false, 
  onClick,
  comingSoon = false,
  icon = null
}: {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  comingSoon?: boolean;
  icon?: 'arrow' | 'external' | null;
}) => (
  <div 
    className={`sidebar-item group ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    <span className="sidebar-item-label justify-between">
      <span>{label}</span>
      {comingSoon && (
        <span className="coming-soon-label">Coming Soon</span>
      )}
      {icon === 'arrow' && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />}
      {icon === 'external' && <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity" />}
    </span>
  </div>
);

export default function DashboardSidebar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user, userProfile } = useAuth();

  const displayName = useMemo(() => {
    if (userProfile?.name) return userProfile.name;
    const email = user?.email ?? "";
    return email.split("@")[0] || "User";
  }, [user, userProfile]);

  const initialLetter = useMemo(() => (displayName?.[0]?.toUpperCase() || "U"), [displayName]);

  const { data: credits, isLoading: creditsLoading } = api.user.credits.useQuery(undefined, {
    enabled: Boolean(user),
    retry: 0,
  });

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleProfileAction = (action: string) => {
    setIsProfileOpen(false);
    switch (action) {
      case 'settings':
        handleNavigation('/dashboard/settings');
        break;
      case 'upgrade':
        handleNavigation('/dashboard/upgrade-plan');
        break;
      case 'learn':
        console.log('Open learn more');
        break;
      case 'logout':
        signOut().then(() => {
          router.push('/');
        });
        break;
    }
  };

  const logoSrc = "/logo.svg";

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-container">
        {/* Top Left: Surbee Logo (replaces profile toggle) */}
        <div className="profile-section">
          <div className="flex items-center justify-center w-full">
            <img src={logoSrc} alt="Surbee" style={{ height: 40, width: 'auto', borderRadius: 8, objectFit: 'contain' }} />
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="user-plan-text pro">Max</div>
          <SidebarItem
            label="Home"
            isActive={pathname === '/dashboard'}
            onClick={() => handleNavigation('/dashboard')}
          />
          <SidebarItem
            label="Projects"
            isActive={pathname.startsWith('/dashboard/projects')}
            onClick={() => handleNavigation('/dashboard/projects')}
            icon="arrow"
          />
          {false && (
            <SidebarItem
              label="Knowledge Base"
              isActive={pathname.startsWith('/dashboard/kb')}
              onClick={() => handleNavigation('/dashboard/kb')}
            />
          )}
          <SidebarItem
            label="Community"
            isActive={pathname.startsWith('/dashboard/marketplace')}
            onClick={() => handleNavigation('/dashboard/marketplace')}
            icon="arrow"
          />
          <SidebarItem label="Get Help" onClick={() => {}} icon="external" />
        </nav>

        {/* Bottom account/settings trigger */}
        <div className="sidebar-bottom">
          <div className="sidebar-item" onClick={() => setIsUserMenuOpen((v) => !v)}>
            <span className="sidebar-item-label">
              <span className="flex items-center gap-2">
                <div className="profile-circle" style={{ width: 28, height: 28 }}>{initialLetter}</div>
                <span style={{ fontWeight: 600 }}>{displayName}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="text-xs" style={{ opacity: 0.8 }}>
                  {typeof credits === 'number' ? `${credits} credits` : ''}
                </span>
                {isUserMenuOpen ? <ChevronUp className="h-3 w-3" style={{ opacity: 0.6 }} /> : <ChevronDown className="h-3 w-3" style={{ opacity: 0.6 }} />}
              </span>
            </span>
          </div>

          {/* Overlay to close on outside click; high z-index */}
          {isUserMenuOpen && (
            <div className="user-menu-overlay" onClick={() => setIsUserMenuOpen(false)} />
          )}

          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="user-menu-panel"
                role="menu"
              >
                {/* User info header */}
                <div className="user-menu-header-section">
                  <div className="user-menu-username">{displayName}</div>
                  <div className="user-menu-email">{user?.email || 'you@example.com'}</div>
                </div>

                {/* Set up profile button */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard/settings'); }}
                  className="user-menu-setup-profile"
                >
                  Set up profile
                </button>

                {/* Request app */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); /* handle request app */ }}
                  className="user-menu-item"
                >
                  <div className="flex items-center gap-2">
                    <div className="user-menu-icon-circle">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="16"/>
                        <line x1="8" y1="12" x2="16" y2="12"/>
                      </svg>
                    </div>
                    <span>Request app</span>
                  </div>
                </button>

                {/* Settings */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard/settings'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center gap-2">
                    <div className="user-menu-icon-circle">
                      <SettingsIcon className="h-4 w-4" />
                    </div>
                    <span>Settings</span>
                  </div>
                </button>

                {/* Theme selector */}
                <div className="user-menu-theme-section">
                  <div className="user-menu-theme-label">Theme</div>
                  <div className="user-menu-theme-toggle">
                    <button
                      className={`user-menu-theme-btn ${theme === 'light' ? 'active' : ''}`}
                      onClick={() => setTheme('light')}
                      aria-label="Light theme"
                    >
                      <Sun className="h-4 w-4" />
                    </button>
                    <button
                      className={`user-menu-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                      onClick={() => setTheme('dark')}
                      aria-label="Dark theme"
                    >
                      <Moon className="h-4 w-4" />
                    </button>
                    <button
                      className={`user-menu-theme-btn ${theme === 'system' ? 'active' : ''}`}
                      onClick={() => setTheme('system')}
                      aria-label="System theme"
                    >
                      <Laptop className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Pricing */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/pricing'); }}
                  className="user-menu-item"
                >
                  <span>Pricing</span>
                </button>

                {/* Changelog */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/changelog'); }}
                  className="user-menu-item"
                >
                  <span>Changelog</span>
                </button>

                {/* Blog */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/blog'); }}
                  className="user-menu-item"
                >
                  <span>Blog</span>
                </button>

                {/* Careers */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); window.open('/careers', '_blank'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Careers</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-40" />
                  </div>
                </button>

                {/* Merch */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); window.open('/merch', '_blank'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Merch</span>
                    <span className="user-menu-new-badge">New</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-40" />
                  </div>
                </button>

                {/* Support */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); window.open('/support', '_blank'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Support</span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-40" />
                  </div>
                </button>

                {/* Log out */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleProfileAction('logout'); }}
                  className="user-menu-item"
                >
                  <span>Log out</span>
                </button>

                {/* Footer */}
                <div className="user-menu-footer">
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleNavigation('/privacy'); }}
                    className="user-menu-footer-link"
                  >
                    Privacy
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleNavigation('/terms'); }}
                    className="user-menu-footer-link"
                  >
                    Terms
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); handleNavigation('/copyright'); }}
                    className="user-menu-footer-link"
                  >
                    Copyright
                  </button>
                  <button
                    onClick={() => { setIsUserMenuOpen(false); window.open('https://x.com/surbee', '_blank'); }}
                    className="user-menu-footer-link"
                    aria-label="X (Twitter)"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Invite and Earn Modal */}
          {isInviteModalOpen && (
            <div className="invite-modal-overlay" onClick={() => setIsInviteModalOpen(false)}>
              <div className="invite-modal-content" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="invite-modal-close"
                  onClick={() => setIsInviteModalOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
                
                <div className="invite-modal-layout">
                  <div className="invite-modal-text">
                    <h2 className="invite-modal-title">Inv<em>i</em>te and E<em>a</em>rn</h2>
                    
                    <div className="invite-how-it-works">
                      <h3 className="invite-section-title">How it works:</h3>
                      <div className="invite-steps">
                        <div className="invite-step">• Share your unique invite link with friends</div>
                        <div className="invite-step">• They join Surbee and start creating</div>
                        <div className="invite-step">• You earn 5 credits when they publish their first project</div>
                      </div>
                    </div>
                    
                    <button 
                      className="invite-copy-button"
                      onClick={() => {
                        const inviteLink = `https://surbee.com/invite/${user?.id || 'demo'}`;
                        navigator.clipboard.writeText(inviteLink);
                        // TODO: Add toast notification
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </button>
                    
                    <button 
                      className="invite-terms-link"
                      onClick={() => {
                        setIsInviteModalOpen(false);
                        window.open('/terms', '_blank');
                      }}
                    >
                      View Terms and Conditions
                    </button>
                    
                  </div>
                  
                  <div className="invite-modal-image">
                    <img 
                      src="https://github.com/Surbee001/webimg/blob/main/u7411232448_i_need_a_very_visble_heart_a_2d_heart._--ar_34_--pr_23edf17f-fb22-43b6-b589-c3e3d7c2d068.png?raw=true" 
                      alt="Invite and Earn" 
                      className="invite-heart-image"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
