// ============================================
// OverviewTab — Template overview info
// ============================================

import {
  FolderOpen,
  Terminal,
  Clock,
  Mail,
  MousePointerClick,
  Link2,
  BookOpen,
  Network,
} from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import type { WorkflowTemplate, TriggerType } from '~/services/types';

interface OverviewTabProps {
  template: WorkflowTemplate;
}

/** Icon component for a given trigger type */
function triggerIcon(type: TriggerType) {
  const icons: Record<TriggerType, React.ReactNode> = {
    'folder-watch': <FolderOpen className="size-3.5" />,
    'chat-command': <Terminal className="size-3.5" />,
    schedule: <Clock className="size-3.5" />,
    email: <Mail className="size-3.5" />,
    manual: <MousePointerClick className="size-3.5" />,
    chained: <Link2 className="size-3.5" />,
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

/** Displays template description, metadata, linked entities and lessons */
export function OverviewTab({ template }: OverviewTabProps) {
  return (
    <div className="space-y-5">
      {/* Description */}
      <div>
        <h4 className="mb-1.5 font-mono text-xs font-semibold text-foreground">
          Description
        </h4>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {template.description}
        </p>
      </div>

      {/* Metadata grid */}
      <div>
        <h4 className="mb-2 font-mono text-xs font-semibold text-foreground">
          Details
        </h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Version</span>
            <p className="font-mono text-foreground">v{template.version}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Created by</span>
            <p className="text-foreground">{template.createdBy}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Created</span>
            <p className="text-foreground">{template.createdDate}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Trigger</span>
            <p className="flex items-center gap-1.5 text-foreground">
              {triggerIcon(template.triggerType)}
              {triggerLabel(template.triggerType)}
            </p>
          </div>
        </div>
      </div>

      {/* Linked entities */}
      {template.linkedEntities.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
            <Network className="size-3.5" />
            Linked Entities
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {template.linkedEntities.map((entityId) => (
              <Badge
                key={entityId}
                variant="outline"
                className="font-mono text-xs"
              >
                {entityId}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Linked lessons */}
      {template.linkedLessons.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground">
            <BookOpen className="size-3.5" />
            Linked Lessons
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {template.linkedLessons.map((lessonId) => (
              <Badge
                key={lessonId}
                variant="outline"
                className="font-mono text-xs"
              >
                {lessonId}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
