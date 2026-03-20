// ============================================
// Entity Constants — Shared entity visual config
// ============================================

import type { ActivityEventType } from '~/services/types';

/** Entity health status → dot/indicator color class */
export const ENTITY_HEALTH_COLORS: Record<string, string> = {
  healthy: 'bg-green',
  warning: 'bg-amber',
  critical: 'bg-red',
};

/** Entity health status → text color class */
export const ENTITY_HEALTH_TEXT: Record<string, string> = {
  healthy: 'text-green',
  warning: 'text-amber',
  critical: 'text-red',
};

/** Entity health status → alpha-tinted background (light + dark) */
export const ENTITY_HEALTH_BG: Record<string, string> = {
  healthy: 'bg-[rgba(var(--green-rgb),0.08)] dark:bg-[rgba(var(--green-rgb),0.12)]',
  warning: 'bg-[rgba(var(--amber-rgb),0.08)] dark:bg-[rgba(var(--amber-rgb),0.12)]',
  critical: 'bg-[rgba(var(--red-rgb),0.08)] dark:bg-[rgba(var(--red-rgb),0.12)]',
};

/** Activity event type → Lucide icon name */
export const ACTIVITY_EVENT_ICONS: Record<ActivityEventType, string> = {
  'email-sent': 'Send',
  'email-received': 'MailOpen',
  'meeting-scheduled': 'CalendarPlus',
  'meeting-completed': 'CalendarCheck',
  'document-shared': 'FileUp',
  'document-updated': 'FilePen',
  'workflow-triggered': 'Play',
  'workflow-completed': 'CircleCheck',
  'workflow-failed': 'CircleX',
  'note-added': 'StickyNote',
  'property-updated': 'Pencil',
  'entity-created': 'Plus',
  'relationship-added': 'Link',
  'task-created': 'ListTodo',
  'task-completed': 'CheckSquare',
  'milestone-reached': 'Trophy',
  'chat-mention': 'AtSign',
};

/** Activity event type → text color class */
export const ACTIVITY_EVENT_COLORS: Record<ActivityEventType, string> = {
  'email-sent': 'text-blue-3',
  'email-received': 'text-blue-3',
  'meeting-scheduled': 'text-chinese-3',
  'meeting-completed': 'text-chinese-3',
  'document-shared': 'text-taupe-4',
  'document-updated': 'text-taupe-4',
  'workflow-triggered': 'text-violet-3',
  'workflow-completed': 'text-green',
  'workflow-failed': 'text-red',
  'note-added': 'text-berry-3',
  'property-updated': 'text-taupe-4',
  'entity-created': 'text-violet-3',
  'relationship-added': 'text-violet-3',
  'task-created': 'text-amber',
  'task-completed': 'text-green',
  'milestone-reached': 'text-chinese-3',
  'chat-mention': 'text-blue-3',
};

/** Insight type → Lucide icon name */
export const INSIGHT_ICONS: Record<string, string> = {
  reminder: 'Bell',
  alert: 'AlertTriangle',
  opportunity: 'Sparkles',
  anomaly: 'AlertCircle',
  milestone: 'Trophy',
};

/** Insight type → text color class */
export const INSIGHT_COLORS: Record<string, string> = {
  reminder: 'text-blue-3',
  alert: 'text-amber',
  opportunity: 'text-green',
  anomaly: 'text-red',
  milestone: 'text-chinese-3',
};
