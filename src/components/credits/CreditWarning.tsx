'use client';

import { useCredits } from '@/hooks/useCredits';
import { AlertTriangle, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface CreditWarningProps {
  className?: string;
  threshold?: number; // Percentage threshold for showing warning
  dismissible?: boolean;
  action?: 'survey' | 'agent' | 'cipher' | 'evaluation';
}

const actionLabels = {
  survey: 'generate surveys',
  agent: 'use Agent Mode',
  cipher: 'run Cipher analysis',
  evaluation: 'run evaluations',
};

export function CreditWarning({
  className,
  threshold = 20,
  dismissible = true,
  action,
}: CreditWarningProps) {
  const { credits, isLow, percentUsed, loading } = useCredits();
  const [dismissed, setDismissed] = useState(false);
  const [storageChecked, setStorageChecked] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this warning recently
    const dismissedAt = localStorage.getItem('creditWarningDismissed');
    if (dismissedAt) {
      const dismissedTime = new Date(dismissedAt).getTime();
      const now = Date.now();
      // Show again after 24 hours
      if (now - dismissedTime < 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }
    setStorageChecked(true);
  }, []);

  if (loading || !storageChecked) return null;
  if (!credits) return null;
  if (dismissed) return null;

  const showWarning = percentUsed >= (100 - threshold) || isLow;
  if (!showWarning) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('creditWarningDismissed', new Date().toISOString());
  };

  const isCritical = credits.creditsRemaining < 20;
  const isZero = credits.creditsRemaining === 0;

  return (
    <div
      className={cn(
        'relative flex items-center gap-3 px-4 py-3 rounded-lg',
        isZero
          ? 'bg-red-100 border border-red-200 dark:bg-red-900/30 dark:border-red-800'
          : isCritical
          ? 'bg-orange-100 border border-orange-200 dark:bg-orange-900/30 dark:border-orange-800'
          : 'bg-yellow-100 border border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800',
        className
      )}
    >
      <AlertTriangle
        className={cn(
          'h-5 w-5 flex-shrink-0',
          isZero
            ? 'text-red-600 dark:text-red-400'
            : isCritical
            ? 'text-orange-600 dark:text-orange-400'
            : 'text-yellow-600 dark:text-yellow-400'
        )}
      />

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-medium',
            isZero
              ? 'text-red-800 dark:text-red-200'
              : isCritical
              ? 'text-orange-800 dark:text-orange-200'
              : 'text-yellow-800 dark:text-yellow-200'
          )}
        >
          {isZero ? (
            <>You&apos;ve run out of credits{action ? ` to ${actionLabels[action]}` : ''}</>
          ) : (
            <>
              You have {credits.creditsRemaining} credits remaining
              {action ? ` to ${actionLabels[action]}` : ''}
            </>
          )}
        </p>
        <p
          className={cn(
            'text-xs mt-0.5',
            isZero
              ? 'text-red-600 dark:text-red-300'
              : isCritical
              ? 'text-orange-600 dark:text-orange-300'
              : 'text-yellow-600 dark:text-yellow-300'
          )}
        >
          {credits.plan === 'free'
            ? 'Upgrade to Pro for 2,000 monthly credits'
            : credits.plan === 'pro'
            ? 'Upgrade to Max for 6,000 monthly credits'
            : `Credits reset on ${new Date(credits.creditsResetAt).toLocaleDateString()}`}
        </p>
      </div>

      <Link href="/home/settings/billing">
        <Button
          size="sm"
          className={cn(
            'gap-1.5',
            isZero || isCritical
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-yellow-600 hover:bg-yellow-700 text-white'
          )}
        >
          <Zap className="h-3.5 w-3.5" />
          Upgrade
        </Button>
      </Link>

      {dismissible && (
        <button
          onClick={handleDismiss}
          className={cn(
            'absolute top-2 right-2 p-1 rounded-full transition-colors',
            isZero
              ? 'text-red-600 hover:bg-red-200 dark:text-red-400 dark:hover:bg-red-800'
              : isCritical
              ? 'text-orange-600 hover:bg-orange-200 dark:text-orange-400 dark:hover:bg-orange-800'
              : 'text-yellow-600 hover:bg-yellow-200 dark:text-yellow-400 dark:hover:bg-yellow-800'
          )}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/**
 * Inline credit warning for specific actions
 */
export function InsufficientCreditsMessage({
  required,
  remaining,
  action,
  className,
}: {
  required: number;
  remaining: number;
  action?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800',
        className
      )}
    >
      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          Insufficient credits{action ? ` for ${action}` : ''}
        </p>
        <p className="text-xs text-red-600 dark:text-red-300">
          This action requires {required} credits, but you have {remaining}.
        </p>
      </div>
      <Link href="/home/settings/billing">
        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5">
          <Zap className="h-3.5 w-3.5" />
          Get Credits
        </Button>
      </Link>
    </div>
  );
}

/**
 * Feature locked message for plan-restricted features
 */
export function FeatureLockedMessage({
  feature,
  requiredPlan = 'Pro',
  className,
}: {
  feature: string;
  requiredPlan?: 'Pro' | 'Max' | 'Enterprise';
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 dark:bg-gray-800 dark:border-gray-700',
        className
      )}
    >
      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
        <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {feature} requires {requiredPlan}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Upgrade your plan to unlock this feature
        </p>
      </div>
      <Link href="/home/settings/billing">
        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
          <Zap className="h-3.5 w-3.5" />
          Upgrade to {requiredPlan}
        </Button>
      </Link>
    </div>
  );
}
