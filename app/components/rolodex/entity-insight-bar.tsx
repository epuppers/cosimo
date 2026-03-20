// ============================================
// EntityInsightBar — AI-generated insight alerts
// ============================================

import { Bell, AlertTriangle, Sparkles, AlertCircle, Trophy, X } from 'lucide-react';
import type { EntityInsight } from '~/services/types';
import { INSIGHT_COLORS } from '~/lib/entity-constants';
import { cn } from '~/lib/utils';

interface EntityInsightBarProps {
  /** The insights to display */
  insights: EntityInsight[];
  /** Called when an insight is dismissed */
  onDismiss: (insightId: string) => void;
  /** Optional additional class names */
  className?: string;
}

/** Map insight type to its Lucide icon component */
const INSIGHT_ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  reminder: Bell,
  alert: AlertTriangle,
  opportunity: Sparkles,
  anomaly: AlertCircle,
  milestone: Trophy,
};

/** Displays a vertical list of non-dismissed AI insights with dismiss buttons. */
export function EntityInsightBar({ insights, onDismiss, className }: EntityInsightBarProps) {
  const visibleInsights = insights.filter((i) => !i.dismissed);

  if (visibleInsights.length === 0) return null;

  return (
    <div
      data-slot="entity-insight-bar"
      className={cn(
        'flex flex-col gap-1.5 px-4 py-2 bg-[rgba(var(--amber-rgb),0.04)] border-b border-taupe-1 dark:bg-[rgba(var(--amber-rgb),0.06)] dark:border-taupe-2',
        className,
      )}
    >
      {visibleInsights.map((insight) => {
        const IconComponent = INSIGHT_ICON_COMPONENTS[insight.type];
        const colorClass = INSIGHT_COLORS[insight.type] ?? 'text-taupe-3';

        return (
          <div key={insight.id} className="flex items-start gap-2">
            {IconComponent && (
              <IconComponent className={cn('size-3.5 mt-0.5 shrink-0', colorClass)} />
            )}
            <span className="flex-1 font-mono text-[0.6875rem] text-taupe-5 dark:text-taupe-4 leading-snug">
              {insight.text}
            </span>
            <button
              type="button"
              onClick={() => onDismiss(insight.id)}
              className="shrink-0 text-taupe-2 hover:text-taupe-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
              aria-label={`Dismiss insight: ${insight.text}`}
            >
              <X className="size-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
