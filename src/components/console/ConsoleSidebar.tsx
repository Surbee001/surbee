"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import {
  LayoutDashboard,
  Key,
  BarChart3,
  ScrollText,
  BookOpen,
  Settings as SettingsIcon,
  ChevronUp,
  ChevronDown,
  Sun,
  Moon,
  Laptop,
  ExternalLink
} from "lucide-react";

const SidebarItem = ({
  label,
  isActive = false,
  onClick,
}: {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}) => (
  <div
    className={`sidebar-item group ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    <span className="sidebar-item-label">
      <span>{label}</span>
    </span>
  </div>
);

export default function ConsoleSidebar() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user, userProfile } = useAuth();
  const { theme, setTheme } = useTheme();

  const displayName = useMemo(() => {
    if (userProfile?.name) return userProfile.name;
    const email = user?.email ?? "";
    return email.split("@")[0] || "User";
  }, [user, userProfile]);

  const initialLetter = useMemo(() => (displayName?.[0]?.toUpperCase() || "U"), [displayName]);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleProfileAction = (action: string) => {
    setIsUserMenuOpen(false);
    switch (action) {
      case 'settings':
        handleNavigation('/console/settings');
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
        {/* Top: Empty space where logo was */}
        <div className="profile-section">
          <div className="flex items-center justify-center w-full" style={{ height: 40 }}>
            {/* Logo removed */}
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="user-plan-text pro">Developer Console</div>
          <SidebarItem
            label="Dashboard"
            isActive={pathname === '/console' || pathname === '/console/dashboard'}
            onClick={() => handleNavigation('/console')}
          />
          <SidebarItem
            label="API Keys"
            isActive={pathname.startsWith('/console/api-keys')}
            onClick={() => handleNavigation('/console/api-keys')}
          />
          <SidebarItem
            label="Usage"
            isActive={pathname.startsWith('/console/usage')}
            onClick={() => handleNavigation('/console/usage')}
          />
          <SidebarItem
            label="Logs"
            isActive={pathname.startsWith('/console/logs')}
            onClick={() => handleNavigation('/console/logs')}
          />
          <SidebarItem
            label="Documentation"
            isActive={pathname.startsWith('/console/documentation')}
            onClick={() => handleNavigation('/console/documentation')}
          />

          <div style={{ height: '1px', backgroundColor: 'var(--surbee-sidebar-border)', margin: '12px 0' }} />

          <SidebarItem
            label="Settings"
            isActive={pathname.startsWith('/console/settings')}
            onClick={() => handleNavigation('/console/settings')}
          />
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
                {isUserMenuOpen ? <ChevronUp className="h-3 w-3" style={{ opacity: 0.6 }} /> : <ChevronDown className="h-3 w-3" style={{ opacity: 0.6 }} />}
              </span>
            </span>
          </div>

          {/* Overlay to close on outside click */}
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

                {/* Settings */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/console/settings'); }}
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

                {/* Back to Main Dashboard */}
                <button
                  onClick={() => { setIsUserMenuOpen(false); handleNavigation('/dashboard'); }}
                  className="user-menu-item"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>Main Dashboard</span>
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
        </div>
      </div>
    </div>
  );
}
