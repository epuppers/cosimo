// ============================================
// LessonDetail — Full lesson view for Brain > Lessons > {id}
// ============================================

import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { Pencil, Check, MessageSquare, Workflow, Trash2 } from 'lucide-react';
import { useUIStore } from '~/stores/ui-store';
import type { Lesson, LessonSection } from '~/services/types';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { ScopeBadge } from '~/components/ui/scope-badge';

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
}

/** Renders a single structured content section inside a lesson block. */
function LessonSectionBlock({ section, isEditing }: { section: LessonSection; isEditing?: boolean }) {
  const blockClass = isEditing
    ? 'border border-dashed border-violet-2 rounded-r-md p-3 bg-[rgba(var(--violet-3-rgb),0.02)] dark:bg-[rgba(var(--violet-3-rgb),0.06)]'
    : 'border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-r-md p-3 bg-white';

  return (
    <div className={blockClass}>
      <h3 className="font-pixel text-sm text-taupe-5 tracking-[0.3px] mb-2">{section.heading}</h3>

      {section.type === 'text' && section.body && (
        <p className="font-sans text-xs leading-[1.7] text-taupe-4">{section.body}</p>
      )}

      {section.type === 'table' && section.columns && section.rows && (
        <table className="w-full border-collapse font-mono text-[11px] rounded-r-md overflow-hidden">
          <thead>
            <tr>
              {section.columns.map((col) => (
                <th key={col} className="text-left px-2.5 py-1.5 bg-taupe-1 text-taupe-5 font-bold text-[10px] uppercase tracking-[0.05em] border border-taupe-2">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, ri) => (
              <tr key={ri} className="even:bg-off-white dark:even:bg-surface-0">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2.5 py-[5px] text-taupe-4 border border-taupe-1 leading-normal">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {section.type === 'list' && section.items && (
        section.listStyle === 'ordered' ? (
          <ol className="pl-5 flex flex-col gap-1">
            {section.items.map((item, i) => (
              <li key={i} className="font-sans text-xs leading-[1.7] text-taupe-4">{item}</li>
            ))}
          </ol>
        ) : (
          <ul className="pl-5 flex flex-col gap-1">
            {section.items.map((item, i) => (
              <li key={i} className="font-sans text-xs leading-[1.7] text-taupe-4">{item}</li>
            ))}
          </ul>
        )
      )}

      {section.type === 'colors' && section.swatches && (
        <div className="flex flex-wrap gap-3">
          {section.swatches.map((swatch) => (
            <div key={swatch.label} className="flex flex-col items-center gap-1">
              <div
                className="w-12 h-12 border-2 rounded-[var(--r-md)] border-t-[rgba(var(--white-pure-rgb),0.3)] border-l-[rgba(var(--white-pure-rgb),0.3)] border-r-[rgba(var(--black-rgb),0.15)] border-b-[rgba(var(--black-rgb),0.15)] dark:border-t-[rgba(var(--white-pure-rgb),0.1)] dark:border-l-[rgba(var(--white-pure-rgb),0.1)] dark:border-r-[rgba(var(--black-rgb),0.3)] dark:border-b-[rgba(var(--black-rgb),0.3)]"
                style={{ backgroundColor: swatch.color }}
              />
              <div className="font-mono text-[10px] font-semibold text-taupe-5">{swatch.label}</div>
              <div className="font-mono text-[10px] text-taupe-3">{swatch.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Full lesson detail view with structured content, linked workflows, and edit capabilities. */
export function LessonDetail({ lesson, onBack }: LessonDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const openCosimoPanel = useUIStore((s) => s.openCosimoPanel);

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
    if (!isEditing) {
      requestAnimationFrame(() => {
        contentRef.current?.focus();
      });
    }
  };

  const handleEditWithCosimo = () => {
    openCosimoPanel({ type: 'lesson', text: lesson.title });
  };

  const workflowCount = lesson.linkedWorkflows?.length ?? 0;
  const sections = lesson.sections ?? [];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      {/* Header: back button + title + scope badge + actions */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-1 min-w-0">
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-base text-taupe-3 pr-2 font-mono transition-colors duration-100 hover:text-taupe-5 shrink-0"
            onClick={onBack}
            aria-label="Back to lessons"
          >
            <span className="icon-char">&larr;</span>
            <span className="a11y-label">Back</span>
          </Button>
          <h2 className="font-[family-name:var(--pixel)] text-sm text-taupe-5 leading-tight truncate">
            {lesson.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn(
              'px-1.5 py-1 flex items-center justify-center text-[0.6875rem] font-semibold text-taupe-4 bg-off-white border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 cursor-pointer rounded-[var(--r-md)] hover:bg-berry-1 hover:text-berry-5 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:border-taupe-2 dark:hover:text-berry-3 dark:hover:bg-berry-1 [&_svg]:block font-mono text-[0.625rem] uppercase tracking-[0.05em] text-taupe-3',
              isEditing && 'bg-violet-3 text-white border-t-violet-2 border-l-violet-2 border-b-[var(--violet-5,var(--violet-3))] border-r-[var(--violet-5,var(--violet-3))] hover:bg-[var(--violet-4,var(--violet-3))] dark:text-[var(--text-light,var(--white))]'
            )}
            onClick={handleToggleEdit}
            title={isEditing ? 'Save Changes' : 'Edit Directly'}
            aria-label={isEditing ? 'Save Changes' : 'Edit Directly'}
          >
            {isEditing ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
            <span className="a11y-label">{isEditing ? 'Save' : 'Edit'}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="px-1.5 py-1 flex items-center justify-center text-[0.6875rem] font-semibold text-taupe-4 bg-off-white border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 cursor-pointer rounded-[var(--r-md)] hover:bg-berry-1 hover:text-berry-5 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:border-taupe-2 dark:hover:text-berry-3 dark:hover:bg-berry-1 [&_svg]:block font-mono text-[0.625rem] uppercase tracking-[0.05em] text-taupe-3"
            onClick={handleEditWithCosimo}
            title="Edit with Cosimo"
            aria-label="Edit with Cosimo"
          >
            <MessageSquare className="size-3.5" />
            <span className="a11y-label">Cosimo</span>
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="px-1.5 py-1 flex items-center justify-center text-[0.6875rem] font-semibold text-red bg-off-white border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 cursor-pointer rounded-[var(--r-md)] hover:bg-berry-1 hover:text-berry-5 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:border-taupe-2 dark:hover:text-berry-3 dark:hover:bg-berry-1 [&_svg]:block font-mono text-[0.625rem] uppercase tracking-[0.05em]"
            title="Delete Lesson"
            aria-label="Delete Lesson"
          >
            <Trash2 className="size-3.5" />
            <span className="a11y-label">Delete</span>
          </Button>
        </div>
      </div>

      {/* Meta bar */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2.5 pb-4 border-b border-taupe-1 mb-5">
        <ScopeBadge scope={lesson.scope} />
        <span className="font-mono text-[0.625rem] text-taupe-2">Referenced {lesson.usage} times</span>
        <span className="font-mono text-[0.625rem] text-taupe-2">Last used {lesson.lastUsed}</span>
        <span className="font-mono text-[0.625rem] text-taupe-2">Updated {lesson.updated} by {lesson.author}</span>
      </div>

      {/* Content body */}
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        className={cn(
          'flex flex-col gap-5',
          isEditing && 'outline-none'
        )}
      >
        {sections.length > 0 ? (
          sections.map((section, idx) => (
            <LessonSectionBlock key={idx} section={section} isEditing={isEditing} />
          ))
        ) : (
          /* Fallback for lessons without structured sections */
          <div className={isEditing
            ? 'border border-dashed border-violet-2 rounded-r-md p-3 bg-[rgba(var(--violet-3-rgb),0.02)] dark:bg-[rgba(var(--violet-3-rgb),0.06)]'
            : 'border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-r-md p-3 bg-white'}>
            <p className="font-sans text-xs leading-[1.7] text-taupe-4">{lesson.preview}</p>
          </div>
        )}
      </div>

      {/* Linked workflows */}
      {workflowCount > 0 && (
        <section className="mt-5">
          <h3 className="font-[family-name:var(--pixel)] text-xs text-taupe-3 uppercase tracking-wider mb-3">
            Linked Workflows
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {lesson.linkedWorkflows!.map((wfId) => (
              <Link
                key={wfId}
                to={`/workflows/${wfId}`}
                className="inline-flex items-center gap-1 rounded-[var(--r-md)] bg-off-white dark:bg-surface-2 border border-taupe-2 dark:border-taupe-3 px-2 py-1 font-[family-name:var(--mono)] text-[10px] font-semibold text-violet-3 dark:text-violet-2 transition-colors hover:bg-violet-1 hover:border-violet-2 dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] focus-visible:outline-2 focus-visible:outline-violet-3"
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
