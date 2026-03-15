// ============================================
// TriggersTab — Workflow trigger configuration
// ============================================

import {
  FolderOpen,
  Terminal,
  Clock,
  Mail,
  MousePointerClick,
  Link2,
  Plus,
} from 'lucide-react';
import type { WorkflowTemplate, TriggerType } from '~/services/types';

interface TriggersTabProps {
  template: WorkflowTemplate;
}

/** Icon component for a given trigger type */
function triggerIcon(type: TriggerType) {
  const icons: Record<TriggerType, React.ReactNode> = {
    'folder-watch': <FolderOpen className="size-4 text-blue-500 dark:text-blue-400" />,
    'chat-command': <Terminal className="size-4 text-violet-500 dark:text-violet-400" />,
    schedule: <Clock className="size-4 text-amber-500 dark:text-amber-400" />,
    email: <Mail className="size-4 text-green-500 dark:text-green-400" />,
    manual: <MousePointerClick className="size-4 text-muted-foreground" />,
    chained: <Link2 className="size-4 text-muted-foreground" />,
  };
  return icons[type] ?? null;
}

/** Human-readable label for a trigger type */
function triggerLabel(type: TriggerType): string {
  const labels: Record<TriggerType, string> = {
    'folder-watch': 'Folder Watch',
    'chat-command': 'Chat Command',
    schedule: 'Schedule',
    email: 'Email',
    manual: 'Manual',
    chained: 'Chained',
  };
  return labels[type] ?? type;
}

interface TriggerEntry {
  type: TriggerType;
  detail: string;
}

/** Extracts all active triggers from a template's triggerConfig */
function extractTriggers(template: WorkflowTemplate): TriggerEntry[] {
  const triggers: TriggerEntry[] = [];
  const { triggerType, triggerConfig } = template;

  // Primary trigger
  if (triggerType === 'folder-watch' && triggerConfig.watchPath) {
    triggers.push({ type: 'folder-watch', detail: triggerConfig.watchPath });
  } else if (triggerType === 'schedule' && triggerConfig.schedule) {
    triggers.push({ type: 'schedule', detail: triggerConfig.schedule });
  } else if (triggerType === 'email' && triggerConfig.emailAddress) {
    triggers.push({ type: 'email', detail: triggerConfig.emailAddress });
  } else if (triggerType === 'manual') {
    triggers.push({ type: 'manual', detail: 'Manually triggered by user' });
  } else if (triggerType === 'chat-command' && triggerConfig.chatCommand) {
    triggers.push({ type: 'chat-command', detail: triggerConfig.chatCommand });
  } else if (triggerType === 'chained') {
    triggers.push({ type: 'chained', detail: 'Triggered by another workflow' });
  }

  // Secondary: chat command if present and not already the primary
  if (triggerType !== 'chat-command' && triggerConfig.chatCommand) {
    triggers.push({ type: 'chat-command', detail: triggerConfig.chatCommand });
  }

  // Secondary: schedule if present and not already the primary
  if (triggerType !== 'schedule' && triggerConfig.schedule) {
    triggers.push({ type: 'schedule', detail: triggerConfig.schedule });
  }

  return triggers;
}

/** Lists all active triggers for a workflow template */
export function TriggersTab({ template }: TriggersTabProps) {
  const triggers = extractTriggers(template);

  return (
    <div className="space-y-3">
      <h4 className="mb-2 font-mono text-xs font-semibold text-foreground">
        Active Triggers
      </h4>

      {triggers.map((trigger, index) => (
        <div
          key={`${trigger.type}-${index}`}
          className="flex items-start gap-3 rounded-md border border-border bg-background p-3"
        >
          <div className="mt-0.5 shrink-0">
            {triggerIcon(trigger.type)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-foreground">
              {triggerLabel(trigger.type)}
            </p>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
              {trigger.detail}
            </p>
          </div>
        </div>
      ))}

      {triggers.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No triggers configured. This workflow can only be run manually.
        </p>
      )}

      {/* Add Trigger button */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-border p-3 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="size-3.5" />
        Add Trigger
      </button>
    </div>
  );
}
