"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { api } from "@/lib/trpc/react";
import {
  LayoutGrid,
  FolderOpen,
  Users,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Laptop,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Copy,
  Plus,
  Search,
  BookOpen,
  BarChart3,
  Share2,
  Bell,
  X
} from "lucide-react";

interface DropdownSection {
  title?: string;
  items: {
    label: string;
    description?: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
    badge?: string;
    external?: boolean;
  }[];
}

interface NavItem {
  label: string;
  href?: string;
  dropdown?: DropdownSection[];
  onClick?: () => void;
}

export default function ModernNavbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user, userProfile } = useAuth();
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const displayName = userProfile?.name || user?.email?.split("@")[0] || "User";
  const initialLetter = displayName?.[0]?.toUpperCase() || "U";

  const { data: credits } = api.user.credits.useQuery(undefined, {
    enabled: Boolean(user),
    retry: 0,
  });

  // Theme toggle functionality
  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', systemTheme === 'dark');
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
    localStorage.setItem('theme', newTheme);
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      handleThemeChange(savedTheme);
    } else {
      handleThemeChange('system');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      // ESC to close search
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setActiveDropdown(null);
  };

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const navigation: NavItem[] = [
    {
      label: "Projects",
      dropdown: [
        {
          items: [
            {
              label: "All Projects",
              description: "View and manage all your surveys",
              icon: <LayoutGrid className="w-4 h-4" />,
              href: "/dashboard/projects"
            },
            {
              label: "Create New",
              description: "Start building a new survey",
              icon: <Plus className="w-4 h-4" />,
              href: "/dashboard/projects/new"
            },
            {
              label: "Templates",
              description: "Browse pre-built survey templates",
              icon: <BookOpen className="w-4 h-4" />,
              href: "/dashboard/templates",
              badge: "New"
            }
          ]
        },
        {
          title: "Recent",
          items: [
            {
              label: "Customer Feedback Survey",
              description: "Last edited 2 hours ago",
              href: "/project/recent-1"
            },
            {
              label: "Product Research",
              description: "Last edited yesterday",
              href: "/project/recent-2"
            }
          ]
        }
      ]
    },
    {
      label: "Community",
      dropdown: [
        {
          items: [
            {
              label: "Marketplace",
              description: "Discover community templates",
              icon: <Users className="w-4 h-4" />,
              href: "/dashboard/marketplace"
            },
            {
              label: "Share Your Work",
              description: "Publish your surveys to the community",
              icon: <Share2 className="w-4 h-4" />,
              href: "/dashboard/share"
            },
            {
              label: "Analytics",
              description: "Community insights and trends",
              icon: <BarChart3 className="w-4 h-4" />,
              href: "/dashboard/community-analytics"
            }
          ]
        }
      ]
    },
    {
      label: "Resources",
      dropdown: [
        {
          title: "Learn",
          items: [
            {
              label: "Documentation",
              description: "Guides and API references",
              icon: <BookOpen className="w-4 h-4" />,
              href: "/docs",
              external: true
            },
            {
              label: "Video Tutorials",
              description: "Step-by-step video guides",
              icon: <ExternalLink className="w-4 h-4" />,
              href: "/tutorials",
              external: true
            }
          ]
        },
        {
          title: "Support",
          items: [
            {
              label: "Get Help",
              description: "Contact our support team",
              href: "/support",
              external: true
            },
            {
              label: "Changelog",
              description: "See what's new",
              href: "/changelog"
            }
          ]
        }
      ]
    }
  ];

  return (
    <>
      <nav className="modern-navbar">
        <div className="modern-navbar-container">
          {/* Logo */}
          <div className="modern-navbar-logo">
            <img src="/logo.svg" alt="Surbee" className="modern-navbar-logo-img" />
          </div>

          {/* Main Navigation */}
          <div className="modern-navbar-nav">
            <button
              onClick={() => handleNavigation('/dashboard')}
              className={`modern-navbar-link ${pathname === '/dashboard' ? 'active' : ''}`}
            >
              Home
            </button>

            {navigation.map((item) => (
              <div
                key={item.label}
                className="modern-navbar-dropdown-wrapper"
                onMouseEnter={() => item.dropdown && handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className={`modern-navbar-link ${activeDropdown === item.label ? 'active' : ''}`}
                  onClick={() => item.href && handleNavigation(item.href)}
                >
                  {item.label}
                  {item.dropdown && (
                    <ChevronDown className={`modern-navbar-chevron ${activeDropdown === item.label ? 'rotate' : ''}`} />
                  )}
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {item.dropdown && activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="modern-navbar-dropdown"
                    >
                      <div className="modern-navbar-dropdown-content">
                        {item.dropdown.map((section, idx) => (
                          <div key={idx} className="modern-navbar-dropdown-section">
                            {section.title && (
                              <div className="modern-navbar-dropdown-section-title">
                                {section.title}
                              </div>
                            )}
                            {section.items.map((dropdownItem, itemIdx) => (
                              <button
                                key={itemIdx}
                                onClick={() => dropdownItem.href && handleNavigation(dropdownItem.href)}
                                className="modern-navbar-dropdown-item"
                              >
                                {dropdownItem.icon && (
                                  <div className="modern-navbar-dropdown-icon">
                                    {dropdownItem.icon}
                                  </div>
                                )}
                                <div className="modern-navbar-dropdown-item-content">
                                  <div className="modern-navbar-dropdown-item-label">
                                    {dropdownItem.label}
                                    {dropdownItem.badge && (
                                      <span className="modern-navbar-badge">{dropdownItem.badge}</span>
                                    )}
                                    {dropdownItem.external && (
                                      <ExternalLink className="w-3 h-3 ml-1 opacity-40" />
                                    )}
                                  </div>
                                  {dropdownItem.description && (
                                    <div className="modern-navbar-dropdown-item-desc">
                                      {dropdownItem.description}
                                    </div>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="modern-navbar-actions">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="modern-navbar-action-btn"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button className="modern-navbar-action-btn" aria-label="Notifications">
              <Bell className="w-4 h-4" />
            </button>

            {/* Credits Display */}
            {typeof credits === 'number' && (
              <div className="modern-navbar-credits">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{credits}</span>
              </div>
            )}

            {/* User Menu */}
            <div className="modern-navbar-user-wrapper">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="modern-navbar-user-btn"
              >
                <div className="modern-navbar-user-avatar">
                  {initialLetter}
                </div>
                <span className="modern-navbar-user-name">{displayName}</span>
                <ChevronDown className={`modern-navbar-chevron-sm ${isUserMenuOpen ? 'rotate' : ''}`} />
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {isUserMenuOpen && (
                  <>
                    <div
                      className="modern-navbar-overlay"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
                      className="modern-navbar-user-dropdown"
                    >
                      {/* User Info */}
                      <div className="modern-navbar-user-info">
                        <div className="modern-navbar-user-info-name">{displayName}</div>
                        <div className="modern-navbar-user-info-email">{user?.email || 'you@example.com'}</div>
                      </div>

                      {/* Profile Setup */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleNavigation('/dashboard/settings');
                        }}
                        className="modern-navbar-user-setup"
                      >
                        Set up profile
                      </button>

                      <div className="modern-navbar-user-divider" />

                      {/* Settings */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleNavigation('/dashboard/settings');
                        }}
                        className="modern-navbar-user-item"
                      >
                        <SettingsIcon className="w-4 h-4" />
                        <span>Settings</span>
                      </button>

                      {/* Theme Selector */}
                      <div className="modern-navbar-theme-section">
                        <span className="modern-navbar-theme-label">Theme</span>
                        <div className="modern-navbar-theme-toggle">
                          <button
                            className={`modern-navbar-theme-btn ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('light')}
                            aria-label="Light theme"
                          >
                            <Sun className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className={`modern-navbar-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('dark')}
                            aria-label="Dark theme"
                          >
                            <Moon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className={`modern-navbar-theme-btn ${theme === 'system' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('system')}
                            aria-label="System theme"
                          >
                            <Laptop className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="modern-navbar-user-divider" />

                      {/* Quick Links */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleNavigation('/pricing');
                        }}
                        className="modern-navbar-user-item"
                      >
                        Pricing
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleNavigation('/changelog');
                        }}
                        className="modern-navbar-user-item"
                      >
                        Changelog
                      </button>

                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          window.open('/support', '_blank');
                        }}
                        className="modern-navbar-user-item"
                      >
                        Support
                        <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-40" />
                      </button>

                      <div className="modern-navbar-user-divider" />

                      {/* Log Out */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          signOut().then(() => router.push('/'));
                        }}
                        className="modern-navbar-user-item logout"
                      >
                        Log out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modern-navbar-search-overlay"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="modern-navbar-search-modal"
            >
              <div className="modern-navbar-search-header">
                <Search className="w-5 h-5 opacity-40" />
                <input
                  type="text"
                  placeholder="Search projects, templates, and more..."
                  className="modern-navbar-search-input"
                  autoFocus
                />
                <button onClick={() => setSearchOpen(false)} className="modern-navbar-search-close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="modern-navbar-search-shortcuts">
                <kbd>⌘</kbd> <kbd>K</kbd> to open • <kbd>ESC</kbd> to close
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
