'use client';

import { useCredits, CREDIT_COSTS_DISPLAY } from '@/hooks/useCredits';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  FileQuestion,
  Bot,
  Shield,
  BarChart3,
  PieChart,
  TrendingUp,
} from 'lucide-react';

interface UsageChartProps {
  className?: string;
}

const actionIcons: Record<string, React.ElementType> = {
  chat: MessageSquare,
  survey: FileQuestion,
  agent: Bot,
  cipher: Shield,
  evaluation: BarChart3,
  chart: PieChart,
};

const actionLabels: Record<string, string> = {
  chat_haiku: 'Chat (Haiku)',
  chat_gpt5: 'Chat (GPT-5)',
  chat_lema: 'Chat (Lema)',
  survey_simple: 'Simple Survey',
  survey_medium: 'Medium Survey',
  survey_complex: 'Complex Survey',
  agent_quick: 'Quick Agent',
  agent_standard: 'Standard Agent',
  agent_complex: 'Complex Agent',
  cipher_basic: 'Cipher Basic',
  cipher_full: 'Cipher Full',
  cipher_realtime: 'Cipher Realtime',
  evaluation_single: 'Single Eval',
  evaluation_multi: 'Multi Eval',
  chart: 'Chart',
};

const actionColors: Record<string, string> = {
  chat: 'bg-blue-500',
  survey: 'bg-green-500',
  agent: 'bg-purple-500',
  cipher: 'bg-orange-500',
  evaluation: 'bg-pink-500',
  chart: 'bg-cyan-500',
};

function getActionCategory(action: string): string {
  if (action.startsWith('chat')) return 'chat';
  if (action.startsWith('survey')) return 'survey';
  if (action.startsWith('agent')) return 'agent';
  if (action.startsWith('cipher')) return 'cipher';
  if (action.startsWith('evaluation')) return 'evaluation';
  return 'chart';
}

export function UsageChart({ className }: UsageChartProps) {
  const { credits, usage, loading } = useCredits();

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </div>
    );
  }

  if (!credits || !usage) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        No usage data available
      </div>
    );
  }

  const totalUsed = usage.totalUsed || 0;
  const remaining = credits.creditsRemaining;
  const total = credits.monthlyCredits;

  // Group usage by category
  const categoryUsage: Record<string, number> = {};
  Object.entries(usage.byAction || {}).forEach(([action, count]) => {
    const category = getActionCategory(action);
    categoryUsage[category] = (categoryUsage[category] || 0) + count;
  });

  const sortedCategories = Object.entries(categoryUsage)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Ring */}
      <div className="flex items-center justify-center">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={440}
              strokeDashoffset={440 - (440 * (totalUsed / total))}
              strokeLinecap="round"
              className={cn(
                totalUsed / total > 0.8
                  ? 'text-red-500'
                  : totalUsed / total > 0.5
                  ? 'text-yellow-500'
                  : 'text-green-500'
              )}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{remaining}</span>
            <span className="text-sm text-gray-500">credits left</span>
          </div>
        </div>
      </div>

      {/* Usage Breakdown */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Usage Breakdown
        </h4>
        {sortedCategories.length > 0 ? (
          <div className="space-y-2">
            {sortedCategories.map(([category, used]) => {
              const Icon = actionIcons[category] || TrendingUp;
              const percentage = total > 0 ? (used / total) * 100 : 0;
              return (
                <div key={category} className="flex items-center gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center',
                      actionColors[category]?.replace('bg-', 'bg-opacity-20 text-') ||
                        'bg-gray-100 text-gray-500'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium capitalize">{category}</span>
                      <span className="text-gray-500">{used} credits</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', actionColors[category])}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No usage yet this billing period
          </p>
        )}
      </div>

      {/* Recent Activity */}
      {usage.history && usage.history.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Recent Activity
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {usage.history.slice(0, 10).map((item, index) => {
              const category = getActionCategory(item.action);
              const Icon = actionIcons[category] || TrendingUp;
              return (
                <div
                  key={index}
                  className="flex items-center gap-3 py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center text-white',
                      actionColors[category]
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {actionLabels[item.action] || item.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    -{item.credits}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact credit costs display for reference
 */
export function CreditCostsTable({ className }: { className?: string }) {
  const categories = [
    {
      name: 'Chat',
      icon: MessageSquare,
      items: [
        { name: 'Claude Haiku', cost: 3 },
        { name: 'GPT-5', cost: 10, pro: true },
        { name: 'Lema', cost: 5, pro: true },
      ],
    },
    {
      name: 'Survey Generation',
      icon: FileQuestion,
      items: [
        { name: 'Simple (1-5 Q)', cost: 20 },
        { name: 'Medium (6-15 Q)', cost: 35 },
        { name: 'Complex (16+ Q)', cost: 50 },
      ],
    },
    {
      name: 'Agent Mode',
      icon: Bot,
      items: [
        { name: 'Quick Task', cost: 25, pro: true },
        { name: 'Standard', cost: 60, pro: true },
        { name: 'Complex', cost: 120, pro: true },
      ],
    },
    {
      name: 'Cipher',
      icon: Shield,
      items: [
        { name: 'Basic Analysis', cost: 10 },
        { name: 'Full Analysis', cost: 20, max: true },
        { name: 'Real-time', cost: 30, max: true },
      ],
    },
    {
      name: 'Evaluation',
      icon: BarChart3,
      items: [
        { name: 'Single Run', cost: 20, pro: true },
        { name: 'Multi-run', cost: 35, pro: true },
      ],
    },
    {
      name: 'Charts',
      icon: PieChart,
      items: [{ name: 'Generate Chart', cost: 10 }],
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <div key={category.name} className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <Icon className="h-4 w-4" />
              {category.name}
            </div>
            <div className="pl-6 space-y-1">
              {category.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <span className="text-gray-600 dark:text-gray-400">
                    {item.name}
                    {item.pro && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded">
                        Pro+
                      </span>
                    )}
                    {item.max && (
                      <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded">
                        Max
                      </span>
                    )}
                  </span>
                  <span className="font-medium">{item.cost} credits</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
