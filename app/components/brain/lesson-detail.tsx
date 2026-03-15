// ============================================
// LessonDetail — Full lesson view for Brain > Lessons > {id}
// ============================================

import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Pencil, MessageSquare, Workflow } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useUIStore } from '~/stores/ui-store';
import type { Lesson } from '~/services/types';
import { cn } from '~/lib/utils';

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
}

/** Full lesson detail view with content, linked workflows, and edit capabilities. */
export function LessonDetail({ lesson, onBack }: LessonDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const openCosimoPanel = useUIStore((s) => s.openCosimoPanel);

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
    if (!isEditing) {
      // Focus the content area after React re-renders
      requestAnimationFrame(() => {
        contentRef.current?.focus();
      });
    }
  };

  const handleEditWithCosimo = () => {
    openCosimoPanel({ type: 'lesson', text: lesson.title });
  };

  const workflowCount = lesson.linkedWorkflows?.length ?? 0;

  // Split content or preview into paragraphs for rendering
  const contentText = lesson.content ?? lesson.preview;
  const paragraphs = contentText.split('\n').filter((p) => p.trim().length > 0);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 self-start text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
      >
        <ArrowLeft className="size-3.5" />
        Back to Lessons
      </button>

      {/* Title + scope badge */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground leading-tight">
          {lesson.title}
        </h2>
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

      {/* Meta: author + updated */}
      <p className="text-[10px] text-muted-foreground">
        by {lesson.author} &middot; Updated {lesson.updated} &middot; Used{' '}
        {lesson.usage} times &middot; Last used {lesson.lastUsed}
      </p>

      {/* Content area */}
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        className={cn(
          'rounded-md text-sm text-foreground leading-relaxed',
          isEditing && 'border-2 border-dashed border-violet-500/50 p-3 outline-none dark:border-violet-400/50'
        )}
      >
        {paragraphs.map((paragraph, idx) => (
          <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant={isEditing ? 'default' : 'outline'}
          size="sm"
          onClick={handleToggleEdit}
          className="text-xs"
        >
          <Pencil className="size-3.5" />
          {isEditing ? 'Done Editing' : 'Edit'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditWithCosimo}
          className="text-xs"
        >
          <MessageSquare className="size-3.5" />
          Edit with Cosimo
        </Button>
      </div>

      {/* Linked workflows */}
      {workflowCount > 0 && (
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Linked Workflows
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {lesson.linkedWorkflows!.map((wfId) => (
              <Link
                key={wfId}
                to={`/workflows/${wfId}`}
                className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Workflow className="size-3" />
                {wfId}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
