"use client";

import { forwardRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Settings, HelpCircle, LogOut, ArrowLeft, User } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  className?: string;
  email?: string;
  planLabel?: string;
  onClose?: () => void;
}

const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(
  ({ className = "", email = "you@example.com", planLabel = "Free plan", onClose }, ref) => {
    const { signOut, user } = useAuth();
    const { userPreferences } = useUserPreferences();
    const router = useRouter();

    // Check if profile is set up (has name or profile picture)
    const isProfileComplete = useMemo(() => {
      const hasName = userPreferences?.displayName && userPreferences.displayName.trim() !== '';
      const hasPicture = user?.user_metadata?.picture || user?.user_metadata?.avatar_url;
      return hasName || hasPicture;
    }, [userPreferences?.displayName, user?.user_metadata?.picture, user?.user_metadata?.avatar_url]);

    const handleLogout = async () => {
      try {
        await signOut();
        router.push('/');
        onClose?.();
      } catch (error) {
        console.error('Logout error:', error);
      }
    };
    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className={`w-[240px] rounded-lg border border-zinc-800 bg-[#1b1b1b]/95 backdrop-blur-xl p-1 text-zinc-300 shadow-xl ${className}`}
          role="menu"
          aria-modal="true"
        >
          {/* Email header */}
          <div className="pt-1 px-2 pb-2 text-zinc-500 truncate text-sm">{email}</div>

          {/* Account summary row */}
          <div className="py-1 px-2 rounded-md flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-full bg-zinc-900 text-zinc-300 flex items-center justify-center text-[12px] font-bold">
                H
              </div>
              <div className="flex flex-col min-w-0">
                <span className="truncate text-zinc-100 text-sm">Personal</span>
                <span className="text-[12px] text-zinc-400">{planLabel}</span>
              </div>
            </div>
            <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mx-1 my-1" />

          {/* Back to dashboard */}
          <button
            onClick={() => { try { window.location.href = '/home'; } catch {} onClose?.(); }}
            className="w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-1 px-2 rounded-md hover:bg-white/5 text-left text-sm"
          >
            <span>Back to dashboard</span>
            <ArrowLeft className="h-4 w-4 text-zinc-500" />
          </button>

          {/* Divider */}
          <div className="h-px bg-white/10 mx-1 my-1" />

          {/* Set up profile - only show if profile not complete */}
          {!isProfileComplete && (
            <button
              onClick={() => { router.push('/home/settings/general'); onClose?.(); }}
              className="w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-1.5 px-2 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-left text-sm text-blue-400 mb-1"
            >
              <span>Set up profile</span>
              <User className="h-4 w-4" />
            </button>
          )}

          {/* Settings */}
          <button
            onClick={() => { router.push('/home/settings'); onClose?.(); }}
            className="w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-1 px-2 rounded-md hover:bg-white/5 text-left text-sm"
          >
            <span>Settings</span>
          </button>

          {/* Get help */}
          <button className="w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-1 px-2 rounded-md hover:bg-white/5 text-left text-sm">
            <span>Get help</span>
            <HelpCircle className="h-4 w-4 text-zinc-500" />
          </button>

          {/* Divider */}
          <div className="h-px bg-white/10 mx-1 my-1" />

          {/* Upgrade */}
          <a href="#" className="w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-1 px-2 rounded-md hover:bg-white/5 text-left text-sm">
            <span>Upgrade plan</span>
          </a>

          {/* Divider */}
          <div className="h-px bg-white/10 mx-1 my-1" />

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 py-1 px-2 rounded-md hover:bg-white/5 text-left text-sm"
          >
            <span className="flex items-center">Log out</span>
            <LogOut className="h-4 w-4 text-zinc-500" />
          </button>
        </motion.div>
      </AnimatePresence>
    );
  }
);

UserMenu.displayName = "UserMenu";

export default UserMenu;


