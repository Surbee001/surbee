'use client';

import { useCredits } from '@/hooks/useCredits';
import { Coins, Zap, Crown, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';

interface CreditBadgeProps {
  className?: string;
  showPlan?: boolean;
  compact?: boolean;
}

const planIcons = {
  free: Coins,
  pro: Zap,
  max: Crown,
  enterprise: Building2,
};

const planColors = {
  free: 'text-gray-500',
  pro: 'text-blue-500',
  max: 'text-purple-500',
  enterprise: 'text-amber-500',
};

const planLabels = {
  free: 'Free',
  pro: 'Pro',
  max: 'Max',
  enterprise: 'Enterprise',
};

export function CreditBadge({ className, showPlan = true, compact = false }: CreditBadgeProps) {
  const { credits, loading, isLow, percentUsed } = useCredits();

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2 animate-pulse', className)}>
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (!credits) return null;

  const PlanIcon = planIcons[credits.plan];
  const planColor = planColors[credits.plan];

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/home/settings/billing"
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium transition-colors',
                isLow
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                className
              )}
            >
              <Coins className="h-3.5 w-3.5" />
              <span>{credits.creditsRemaining}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <div className="text-sm">
              <p className="font-medium">{credits.creditsRemaining} / {credits.monthlyCredits} credits</p>
              <p className="text-gray-400">{planLabels[credits.plan]} plan</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href="/home/settings/billing"
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
              'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700',
              className
            )}
          >
            {showPlan && (
              <div className={cn('flex items-center gap-1', planColor)}>
                <PlanIcon className="h-4 w-4" />
                <span className="font-medium">{planLabels[credits.plan]}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Coins className={cn('h-4 w-4', isLow ? 'text-red-500' : 'text-gray-500')} />
              <span className={cn('font-medium', isLow && 'text-red-600 dark:text-red-400')}>
                {credits.creditsRemaining}
              </span>
              <span className="text-gray-400">/ {credits.monthlyCredits}</span>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="w-64">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Credits Used</span>
              <span className="font-medium">{percentUsed}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  percentUsed > 80 ? 'bg-red-500' : percentUsed > 50 ? 'bg-yellow-500' : 'bg-green-500'
                )}
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            {credits.apiCreditsMonthly > 0 && (
              <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span>API Credits</span>
                  <span className="font-medium">
                    ${credits.apiCreditsRemaining.toFixed(2)} / ${credits.apiCreditsMonthly.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400">
              Resets {new Date(credits.creditsResetAt).toLocaleDateString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
