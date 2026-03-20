// ============================================
// LinkedTab — Cross-linked items (threads, workflows, lessons, tasks)
// ============================================

import { useNavigate } from 'react-router';
import { MessageSquare, GitBranch, BookOpen, CheckSquare } from 'lucide-react';
import type { Entity } from '~/services/types';
import { useEntityStore } from '~/stores/entity-store';
import { EmptyState } from '~/components/ui/empty-state';
import { cn } from '~/lib/utils';

interface LinkedTabProps {
  /** The entity whose linked items to display */
  entity: Entity;
  /** Optional additional class names */
  className?: string;
}

interface LinkedSection {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ids: string[];
  getPath: (id: string) => string | null;
}

/** LinkedTab — displays chat threads, workflows, lessons, and tasks linked to an entity */
export function LinkedTab({ entity, className }: LinkedTabProps) {
  const navigate = useNavigate();
  const selectEntity = useEntityStore((s) => s.selectEntity);

  const sections: LinkedSection[] = [
    {
      key: 'threads',
      label: 'Chat Threads',
      icon: MessageSquare,
      ids: entity.linkedThreadIds,
      getPath: (id) => `/chat/${id}`,
    },
    {
      key: 'workflows',
      label: 'Workflows',
      icon: GitBranch,
      ids: entity.linkedWorkflowIds,
      getPath: (id) => `/workflows/${id}`,
    },
    {
      key: 'lessons',
      label: 'Lessons',
      icon: BookOpen,
      ids: entity.linkedLessonIds,
      getPath: (id) => `/brain/lessons/${id}`,
    },
    {
      key: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      ids: entity.linkedKanbanCardIds,
      getPath: () => null,
    },
  ];

  const nonEmptySections = sections.filter((s) => s.ids.length > 0);

  if (nonEmptySections.length === 0) {
    return (
      <EmptyState
        title="No linked items"
        description="Linked threads, workflows, lessons, and tasks will appear here."
      />
    );
  }

  const handleItemClick = (section: LinkedSection, id: string) => {
    const path = section.getPath(id);
    if (path) {
      selectEntity(null);
      navigate(path);
    } else {
      console.log(`Navigate to task: ${id}`);
    }
  };

  return (
    <div data-slot="linked-tab" className={cn('flex flex-col', className)}>
      {nonEmptySections.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div key={section.key}>
            {/* Section header */}
            <div className="flex items-center justify-between py-2 border-b border-taupe-1 dark:border-taupe-2">
              <div className="flex items-center gap-1.5">
                <SectionIcon className="size-3 text-taupe-3" />
                <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em] text-taupe-3">
                  {section.label}
                </span>
              </div>
              <span className="font-mono text-[0.625rem] text-taupe-2">
                {section.ids.length}
              </span>
            </div>

            {/* Item rows */}
            {section.ids.map((id) => (
              <div
                key={id}
                role="button"
                tabIndex={0}
                className="flex items-center gap-2 py-2 px-2 rounded-[var(--r-md)] hover:bg-[rgba(var(--violet-3-rgb),0.04)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.08)] cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                onClick={() => handleItemClick(section, id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleItemClick(section, id);
                  }
                }}
              >
                <span className="text-violet-3 font-mono text-[0.8125rem] hover:underline">
                  {id}
                </span>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
