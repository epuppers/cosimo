// ============================================
// LessonCard — Lesson list card for Brain > Lessons
// ============================================

import { Workflow } from 'lucide-react';
import type { Lesson } from '~/services/types';
import { ScopeBadge } from '~/components/ui/scope-badge';

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
      className="bg-white border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 border-l-[3px] border-l-violet-3 rounded-r-md px-[14px] py-3 cursor-pointer transition-colors duration-150 hover:border-violet-3 hover:border-r-violet-4 hover:border-b-violet-4 hover:border-l-violet-4 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
      tabIndex={0}
      role="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Top row: scope badge + usage */}
      <div className="flex items-center justify-between mb-1.5">
        <ScopeBadge scope={lesson.scope} />
        {workflowCount > 0 && (
          <span className="flex items-center gap-1 font-[family-name:var(--mono)] text-[10px] text-taupe-2 dark:text-taupe-3">
            <Workflow className="size-3" />
            {workflowCount} workflow{workflowCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="font-[family-name:var(--mono)] text-[13px] font-bold text-taupe-5 mb-1 tracking-[0.01em]">
        {lesson.title}
      </h4>

      {/* Preview */}
      <p className="font-sans text-[11px] text-taupe-3 leading-[1.5] line-clamp-2 mb-2">
        {lesson.preview}
      </p>

      {/* Meta: date + author */}
      <div className="flex items-center gap-2">
        <span className="font-[family-name:var(--mono)] text-[10px] text-taupe-2 dark:text-taupe-3">
          Updated {lesson.updated}
        </span>
        {lesson.author && (
          <>
            <span className="text-[10px] text-taupe-2 dark:text-taupe-3">·</span>
            <span className="font-[family-name:var(--mono)] text-[10px] text-taupe-2 dark:text-taupe-3">
              {lesson.author}
            </span>
          </>
        )}
      </div>
    </div>
  );
}
