// ============================================
// WorkflowCard — Library card for a workflow template
// ============================================

import {
  FolderOpen,
  Play,
  Clock,
  Mail,
  MessageSquare,
  Link,
  Hand,
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import type { WorkflowTemplate, TriggerType } from '~/services/types';

/** Map of trigger type to icon component and display label */
const TRIGGER_META: Record<TriggerType, { icon: React.ReactNode; label: string }> = {
  'folder-watch': { icon: <FolderOpen className="size-3" />, label: 'Folder Watch' },
  manual: { icon: <Hand className="size-3" />, label: 'Manual' },
  schedule: { icon: <Clock className="size-3" />, label: 'Schedule' },
  email: { icon: <Mail className="size-3" />, label: 'Email' },
  'chat-command': { icon: <MessageSquare className="size-3" />, label: 'Chat Command' },
  chained: { icon: <Link className="size-3" />, label: 'Chained' },
};

/** Map of template status to Badge variant */
const STATUS_VARIANT: Record<WorkflowTemplate['status'], 'default' | 'secondary' | 'outline'> = {
  active: 'default',
  draft: 'secondary',
  paused: 'outline',
  archived: 'secondary',
};

interface WorkflowCardProps {
  /** The workflow template to display */
  template: WorkflowTemplate;
  /** Map of lesson IDs to lesson titles for displaying linked lesson chips */
  lessonNames?: Record<string, string>;
  /** Called when the card is clicked to view template detail */
  onSelect: (id: string) => void;
  /** Called when the Run button is clicked */
  onRun: (id: string) => void;
}

/** A library card for a workflow template, showing status, trigger, description, and run stats. */
export function WorkflowCard({ template, lessonNames, onSelect, onRun }: WorkflowCardProps) {
  const trigger = TRIGGER_META[template.triggerType];
  const statusVariant = STATUS_VARIANT[template.status];

  const handleCardClick = () => {
    onSelect(template.id);
  };

  const handleRunClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRun(template.id);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(template.id);
    }
  };

  return (
    <Card
      className="group/wf-card cursor-pointer transition-shadow hover:ring-2 hover:ring-primary/30"
      size="sm"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
    >
      <CardHeader>
        {/* Title + Status badge row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5 min-w-0">
            <span className="font-mono text-sm font-semibold leading-tight truncate">
              {template.title}
            </span>
            {/* Trigger type chip */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
                  'bg-muted text-[10px] font-medium text-muted-foreground'
                )}
              >
                {trigger.icon}
                {trigger.label}
              </span>
            </div>
          </div>
          <Badge variant={statusVariant} className="shrink-0 capitalize text-[10px]">
            {template.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {template.description}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Linked lesson chip */}
          {template.linkedLessons.length > 0 && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 truncate max-w-[140px]',
                'bg-primary/10 text-primary text-[10px] font-medium'
              )}
            >
              <span className="shrink-0">◆</span>
              <span className="truncate">
                {lessonNames?.[template.linkedLessons[0]] ?? template.linkedLessons[0]}
              </span>
            </span>
          )}

          {/* Run stats */}
          {template.runs.total > 0 && (
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              {template.runs.total} runs · {template.runs.successRate}%
            </span>
          )}
        </div>

        {/* Run button — visible on hover */}
        <Button
          variant="outline"
          size="xs"
          className="opacity-0 group-hover/wf-card:opacity-100 transition-opacity shrink-0"
          onClick={handleRunClick}
        >
          <Play className="size-3" />
          Run
        </Button>
      </CardFooter>
    </Card>
  );
}
