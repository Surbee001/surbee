'use client';

import { ChevronUp, Settings, LogOut, HelpCircle, Crown } from 'lucide-react';
import Image from 'next/image';
import type { User } from 'next-auth';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import React, { useEffect, useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';
import { toast } from './toast';
import { LoaderIcon } from './icons';
import { guestRegex } from '@/lib/constants';

export function SidebarUserNav({ user }: { user: User }) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, resolvedTheme } = useTheme();
  const [credits, setCredits] = useState<number>(0);

  useEffect(() => {
    async function fetchUser() {
      if (user?.id) {
        const res = await fetch(`/api/user/${user.id}`);
        if (res.ok) {
          const u = await res.json();
          setCredits(u.credits);
        }
      }
    }
    fetchUser();
  }, [user?.id]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              data-testid="user-nav-button"
              className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-14 flex flex-col items-start gap-0"
            >
              <div className="flex items-center w-full">
                <Image
                  src={`https://avatar.vercel.sh/${user.email}`}
                  alt={user.email ?? 'User Avatar'}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
                <span
                  data-testid="user-email"
                  className="truncate ml-2 font-medium"
                >
                  {user?.email?.split('@')[0]}
                </span>
                <span className="mx-2 text-xs text-zinc-400">|</span>
                <span className="text-xs font-semibold text-white">Pro</span>
              </div>
              <div className="w-full mt-1 flex items-center">
                <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden mr-2">
                  <div
                    className="h-2 bg-white"
                    style={{ width: `${(credits / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white/80">{credits} credits</span>
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            data-testid="user-nav-menu"
            side="top"
            className="w-[--radix-popper-anchor-width] bg-sidebar border border-sidebar-border"
          >
            <DropdownMenuItem disabled>
              <div className="w-full flex flex-col items-start">
                <span className="text-xs text-white/80 mb-1">Credits</span>
                <div className="w-full h-2 bg-white/30 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-2 bg-white"
                    style={{ width: `${(credits / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-white/80">
                  {credits}/5 credits available
                </span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            {/* Settings & Help Section */}
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer text-left flex items-center justify-between"
                onClick={() => {
                  /* TODO: Open settings modal or page */
                }}
              >
                <span>Settings</span>
                <Settings className="size-4" />
              </button>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer text-left flex items-center justify-between"
                onClick={() => {
                  /* TODO: Open help page */
                }}
              >
                <span>Get Help</span>
                <HelpCircle className="size-4" />
              </button>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Upgrade Plan Section */}
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer text-left flex items-center justify-between"
                onClick={() => {
                  /* TODO: Open upgrade plan modal or page */
                }}
              >
                <span>Upgrade Plan</span>
                <Crown className="size-4" />
              </button>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {/* Logout Section */}
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer text-left flex items-center justify-between"
                onClick={() => signOut({ redirectTo: '/' })}
              >
                <span>Logout</span>
                <LogOut className="size-4" />
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
