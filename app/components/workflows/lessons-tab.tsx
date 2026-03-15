// ============================================
// LessonsTab — Linked lessons list
// ============================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, ExternalLink, Plus } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
import { getLessons } from '~/services/brain';
import type { WorkflowTemplate, Lesson } from '~/services/types';

interface LessonsTabProps {
  template: WorkflowTemplate;
}

/** Finds which nodes in the template reference a given lesson ID */
function nodesReferencingLesson(template: WorkflowTemplate, lessonId: string): string[] {
  return template.nodes
    .filter((n) => n.lesson === lessonId)
    .map((n) => n.title);
}

/** Displays lessons linked to a workflow template */
export function LessonsTab({ template }: LessonsTabProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    let cancelled = false;
    getLessons().then((allLessons) => {
      if (!cancelled) {
        const linked = allLessons.filter((l) =>
          template.linkedLessons.includes(l.id)
        );
        setLessons(linked);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [template.linkedLessons]);

  return (
    <div className="space-y-3">
      <h4 className="mb-2 font-mono text-xs font-semibold text-foreground">
        Linked Lessons
      </h4>

      {lessons.length === 0 && template.linkedLessons.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No lessons linked to this workflow yet.
        </p>
      )}

      {lessons.map((lesson) => {
        const referencingNodes = nodesReferencingLesson(template, lesson.id);

        return (
          <div
            key={lesson.id}
            className="rounded-md border border-border bg-background p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <BookOpen className="mt-0.5 size-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    {lesson.title}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">
                    by {lesson.author} &middot; Updated {lesson.updated}
                  </p>
                </div>
              </div>
              <Link
                to={`/brain/lessons/${lesson.id}`}
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                aria-label={`View ${lesson.title}`}
              >
                <ExternalLink className="size-3.5" />
              </Link>
            </div>

            {referencingNodes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                <span className="text-[10px] text-muted-foreground">Used by:</span>
                {referencingNodes.map((nodeName) => (
                  <Badge
                    key={nodeName}
                    variant="secondary"
                    className="text-[10px]"
                  >
                    {nodeName}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Link Lesson button */}
      <button
        type="button"
        className="flex w-full items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-border p-3 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Plus className="size-3.5" />
        Link Lesson
      </button>
    </div>
  );
}
