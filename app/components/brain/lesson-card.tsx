// ============================================
// LessonCard — Lesson list card for Brain > Lessons
// ============================================

import { Workflow } from 'lucide-react';
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
    <div
      className="brain-lesson-card"
      tabIndex={0}
      role="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Top row: scope badge + usage */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className={cn(
            'brain-scope-badge',
            lesson.scope === 'user' ? 'scope-user' : 'scope-company'
          )}
        >
          {lesson.scope === 'user' ? 'Personal' : 'Company'}
        </span>
        {workflowCount > 0 && (
          <span className="flex items-center gap-1 font-[family-name:var(--mono)] text-[10px] text-[var(--taupe-2)] dark:text-[var(--taupe-3)]">
            <Workflow className="size-3" />
            {workflowCount} workflow{workflowCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-[family-name:var(--mono)] text-[13px] font-bold text-[var(--taupe-5)] mb-1 tracking-[0.01em]">
        {lesson.title}
      </h4>

      {/* Preview */}
      <p className="font-[family-name:var(--mono)] text-[11px] text-[var(--taupe-3)] leading-[1.5] line-clamp-2 mb-2">
        {lesson.preview}
      </p>

      {/* Meta: date + author */}
      <div className="flex items-center gap-2">
        <span className="font-[family-name:var(--mono)] text-[10px] text-[var(--taupe-2)] dark:text-[var(--taupe-3)]">
          Updated {lesson.updated}
        </span>
        {lesson.author && (
          <>
            <span className="text-[10px] text-[var(--taupe-2)] dark:text-[var(--taupe-3)]">·</span>
            <span className="font-[family-name:var(--mono)] text-[10px] text-[var(--taupe-2)] dark:text-[var(--taupe-3)]">
              {lesson.author}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
