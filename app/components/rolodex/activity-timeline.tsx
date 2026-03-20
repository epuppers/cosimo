// ============================================
// ActivityTimeline — Chronological activity feed for an entity
// ============================================

import { useState, useEffect } from 'react';
import {
  Send,
  MailOpen,
  CalendarPlus,
  CalendarCheck,
  FileUp,
  FilePen,
  Play,
  CircleCheck,
  CircleX,
  StickyNote,
  Pencil,
  Plus,
  Link,
  ListTodo,
  CheckSquare,
  Trophy,
  AtSign,
  AlertCircle,
} from 'lucide-react';
import type { ActivityEvent, ActivityEventType } from '~/services/types';
import { getEntityTimeline } from '~/services/entities';
import { ACTIVITY_EVENT_ICONS, ACTIVITY_EVENT_COLORS } from '~/lib/entity-constants';
import { EmptyState } from '~/components/ui/empty-state';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

interface ActivityTimelineProps {
  /** The entity ID to load the timeline for */
  entityId: string;
  /** Optional additional class names */
  className?: string;
}

/** Map Lucide icon names to actual components */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Send,
  MailOpen,
  CalendarPlus,
  CalendarCheck,
  FileUp,
  FilePen,
  Play,
  CircleCheck,
  CircleX,
  StickyNote,
  Pencil,
  Plus,
  Link,
  ListTodo,
  CheckSquare,
  Trophy,
  AtSign,
};

/** Ref type label for clickable chips */
const REF_TYPE_LABELS: Record<string, string> = {
  thread: 'View thread',
  'workflow-run': 'View run',
  document: 'View document',
  lesson: 'View lesson',
  'kanban-card': 'View task',
};

/** Formats an ISO timestamp as a relative time string (e.g., "2 hours ago") */
function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) return `${diffWeeks}w ago`;

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

/** ActivityTimeline — chronological feed of entity activity events */
export function ActivityTimeline({ entityId, className }: ActivityTimelineProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await getEntityTimeline(entityId);
        if (!cancelled) setEvents(data);
      } catch {
        if (!cancelled) setError('Failed to load timeline');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [entityId]);

  // Loading skeleton
  if (loading) {
    return (
      <div data-slot="activity-timeline" className={cn('flex flex-col gap-4', className)}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="size-[38px] shrink-0 rounded-full bg-taupe-1 animate-pulse motion-reduce:animate-none" />
            <div className="flex-1 flex flex-col gap-1.5 py-1">
              <div className="h-3 w-3/4 rounded bg-taupe-1 animate-pulse motion-reduce:animate-none" />
              <div className="h-2.5 w-1/2 rounded bg-taupe-1 animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div data-slot="activity-timeline" className={cn('flex flex-col items-center gap-2 py-8', className)}>
        <AlertCircle className="size-5 text-red" />
        <p className="font-mono text-xs text-red">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLoading(true);
            setError(null);
            getEntityTimeline(entityId)
              .then(setEvents)
              .catch(() => setError('Failed to load timeline'))
              .finally(() => setLoading(false));
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Empty state
  if (events.length === 0) {
    return (
      <div data-slot="activity-timeline" className={className}>
        <EmptyState
          title="No activity yet"
          description="Activity will appear here as you interact with this entity."
        />
      </div>
    );
  }

  return (
    <div
      data-slot="activity-timeline"
      role="feed"
      aria-label="Activity timeline"
      className={cn('relative flex flex-col', className)}
    >
      {/* Vertical connector line */}
      <div className="absolute left-[19px] top-0 bottom-0 w-px bg-taupe-1 dark:bg-taupe-2" />

      {events.map((event) => {
        const iconName = ACTIVITY_EVENT_ICONS[event.type];
        const IconComponent = ICON_MAP[iconName];
        const colorClass = ACTIVITY_EVENT_COLORS[event.type];

        return (
          <div key={event.id} className="relative flex gap-3 py-2.5">
            {/* Icon circle */}
            <div className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-white dark:bg-surface-1 border-2 border-taupe-1 dark:border-taupe-2 z-10">
              {IconComponent && <IconComponent className={cn('size-4', colorClass)} />}
            </div>

            {/* Event content */}
            <div className="min-w-0 flex-1 pt-1">
              <p className="font-mono text-[0.8125rem] font-semibold text-taupe-5 dark:text-taupe-4">
                {event.title}
              </p>
              {event.description && (
                <p className="font-sans text-xs text-taupe-3 mt-0.5">
                  {event.description}
                </p>
              )}
              <p className="font-mono text-[0.625rem] text-taupe-2 mt-1">
                {formatRelativeTime(event.timestamp)}
              </p>
              {event.refType && (
                <button
                  type="button"
                  className="text-violet-3 text-[0.625rem] font-mono hover:underline cursor-pointer mt-1 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                  onClick={() => console.log(`Navigate to ${event.refType}: ${event.refId}`)}
                >
                  {REF_TYPE_LABELS[event.refType] ?? 'View'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
