"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

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

  return (
    <div className="dashboard-sidebar">
      <div className="sidebar-container">
        {/* Profile Section at Top */}
        <div className="profile-section">
          <div 
            className="profile-button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="profile-circle">H</div>
            <motion.div
              className="profile-arrow-container"
              animate={{ rotate: isProfileOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="profile-arrow" />
            </motion.div>
          </div>
          
          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                className="profile-dropdown"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="dropdown-item" onClick={() => handleProfileAction('settings')}>
                  <span className="dropdown-item-label">Settings</span>
                </div>
                <div className="dropdown-item" onClick={() => handleProfileAction('upgrade')}>
                  <span className="dropdown-item-label">Upgrade Plan</span>
                </div>
                <div className="dropdown-item" onClick={() => handleProfileAction('learn')}>
                  <span className="dropdown-item-label">Learn More</span>
                </div>
                <div className="dropdown-item logout" onClick={() => handleProfileAction('logout')}>
                  <span className="dropdown-item-label">Log Out</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            label="Marketplace" 
            isActive={pathname.startsWith('/dashboard/marketplace')}
            onClick={() => handleNavigation('/dashboard/marketplace')}
          />
          <SidebarItem 
            label="Notebook" 
            onClick={() => {}}
            comingSoon={true}
          />
          <SidebarItem 
            label="Get Help" 
            onClick={() => {}}
          />
        </nav>
      </div>
    </div>
  );
}
