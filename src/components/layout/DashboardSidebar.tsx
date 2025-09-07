"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { api } from "@/lib/trpc/react";
import { HelpCircle, Check, ChevronUp, ChevronDown, Gift, X, Copy } from "lucide-react";

const SidebarItem = ({ 
  label, 
  isActive = false, 
  onClick,
  comingSoon = false
}: {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  comingSoon?: boolean;
}) => (
  <div 
    className={`sidebar-item ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    <span className="sidebar-item-label">
      <span>{label}</span>
      {comingSoon && (
        <span className="coming-soon-label">Coming Soon</span>
      )}
    </span>
  </div>
);

export default function DashboardSidebar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
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

  const logoSrc = "https://github.com/Surbee001/webimg/blob/main/White%20Logo.png?raw=true";

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
          />
          <SidebarItem label="Notebook" onClick={() => {}} comingSoon={true} />
          <SidebarItem label="Get Help" onClick={() => {}} />
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
                <div className="user-menu-account">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="user-menu-avatar">{initialLetter}</div>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate user-menu-account-name">{user?.email || 'you@example.com'}</span>
                      <span className="user-menu-account-plan">Max plan</span>
                    </div>
                  </div>
                  <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                </div>

                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard/settings'); }}
                  className="user-menu-item"
                >
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => { setIsUserMenuOpen(false); setIsInviteModalOpen(true); }}
                  className="user-menu-item"
                >
                  <span>Invite and Earn</span>
                  <Gift className="h-4 w-4 text-zinc-500" />
                </button>

                <button
                  onClick={() => { setIsUserMenuOpen(false); /* help action */ }}
                  className="user-menu-item"
                >
                  <span>Get help</span>
                  <HelpCircle className="h-4 w-4 text-zinc-500" />
                </button>

                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard/upgrade-plan'); }}
                  className="user-menu-item"
                >
                  <span>Upgrade plan</span>
                </button>

                <button
                  onClick={() => { setIsUserMenuOpen(false); handleProfileAction('logout'); }}
                  className="user-menu-item"
                >
                  <span className="flex items-center">Log out</span>
                </button>
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
