// ============================================
// LessonCard — Lesson list card for Brain > Lessons
// ============================================

import { BookOpen, Workflow } from 'lucide-react';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import type { Lesson } from '~/services/types';
import { cn } from '~/lib/utils';

interface LessonCardProps {
  lesson: Lesson;
  onSelect: (id: string) => void;
}

/** A lesson card showing title, scope badge, updated date, preview, and linked workflow count. */
export function LessonCard({ lesson, onSelect }: LessonCardProps) {
  const workflowCount = lesson.linkedWorkflows?.length ?? 0;

  const handleClick = () => {
    onSelect(lesson.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(lesson.id);
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors',
        'hover:bg-accent/50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
      )}
      tabIndex={0}
      role="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-3">
        {/* Header: title + scope badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <BookOpen className="mt-0.5 size-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
            <h4 className="text-xs font-semibold text-foreground leading-tight">
              {lesson.title}
            </h4>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              'shrink-0 text-[10px] capitalize',
              lesson.scope === 'user'
                ? 'bg-violet-500 text-white hover:bg-violet-500 dark:bg-violet-600 dark:hover:bg-violet-600'
                : 'bg-blue-500 text-white hover:bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-600'
            )}
          >
            {lesson.scope}
          </Badge>
        </div>

        {/* Updated date */}
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Updated {lesson.updated}
        </p>

        {/* Preview */}
        <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground leading-relaxed">
          {lesson.preview}
        </p>

        {/* Linked workflows count */}
        {workflowCount > 0 && (
          <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
            <Workflow className="size-3" />
            <span>
              {workflowCount} linked workflow{workflowCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
