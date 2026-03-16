// ============================================
// LessonDetail — Full lesson view for Brain > Lessons > {id}
// ============================================

import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { Pencil, Check, MessageSquare, Workflow, Trash2 } from 'lucide-react';
import { useUIStore } from '~/stores/ui-store';
import type { Lesson, LessonSection } from '~/services/types';
import { cn } from '~/lib/utils';

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
}

/** Renders a single structured content section inside a lesson block. */
function LessonSectionBlock({ section }: { section: LessonSection }) {
  return (
    <div className="lesson-block">
      <h3>{section.heading}</h3>

      {section.type === 'text' && section.body && (
        <p>{section.body}</p>
      )}

      {section.type === 'table' && section.columns && section.rows && (
        <table className="lesson-table">
          <thead>
            <tr>
              {section.columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {section.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {section.type === 'list' && section.items && (
        section.listStyle === 'ordered' ? (
          <ol>
            {section.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
        ) : (
          <ul>
            {section.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        )
      )}

      {section.type === 'colors' && section.swatches && (
        <div className="lesson-color-grid">
          {section.swatches.map((swatch) => (
            <div key={swatch.label} className="lesson-color-swatch">
              <div
                className="swatch-box"
                style={{ backgroundColor: swatch.color }}
              />
              <div className="swatch-label">{swatch.label}</div>
              <div className="swatch-value">{swatch.value}</div>
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
          <button
            type="button"
            onClick={onBack}
            className="lesson-back-btn shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--violet-3)] rounded-[var(--r-sm)]"
            aria-label="Back to lessons"
          >
            <span className="icon-char">&larr;</span>
            <span className="a11y-label">Back</span>
          </button>
          <h2 className="font-[family-name:var(--pixel)] text-sm text-[var(--taupe-5)] leading-tight truncate">
            {lesson.title}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleEdit}
            title={isEditing ? 'Save Changes' : 'Edit Directly'}
            aria-label={isEditing ? 'Save Changes' : 'Edit Directly'}
            className={cn(
              'header-btn bevel label-mono icon-btn focus-visible:outline-2 focus-visible:outline-[var(--violet-3)]',
              isEditing && 'primary'
            )}
          >
            {isEditing ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
            <span className="a11y-label">{isEditing ? 'Save' : 'Edit'}</span>
          </button>
          <button
            type="button"
            onClick={handleEditWithCosimo}
            title="Edit with Cosimo"
            aria-label="Edit with Cosimo"
            className="header-btn bevel label-mono icon-btn focus-visible:outline-2 focus-visible:outline-[var(--violet-3)]"
          >
            <MessageSquare className="size-3.5" />
            <span className="a11y-label">Cosimo</span>
          </button>
          <button
            type="button"
            title="Delete Lesson"
            aria-label="Delete Lesson"
            className="header-btn bevel label-mono icon-btn text-[var(--red)] focus-visible:outline-2 focus-visible:outline-[var(--violet-3)]"
          >
            <Trash2 className="size-3.5" />
            <span className="a11y-label">Delete</span>
          </button>
        </div>
      </div>

      {/* Meta bar */}
      <div className="lesson-detail-meta">
        <span
          className={cn(
            'brain-scope-badge',
            lesson.scope === 'user' ? 'scope-user' : 'scope-company'
          )}
        >
          {lesson.scope === 'user' ? 'Personal' : 'Company'}
        </span>
        <span className="lesson-detail-stat">Referenced {lesson.usage} times</span>
        <span className="lesson-detail-stat">Last used {lesson.lastUsed}</span>
        <span className="lesson-detail-stat">Updated {lesson.updated} by {lesson.author}</span>
      </div>

      {/* Content body */}
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        className={cn(
          'flex flex-col gap-5',
          isEditing && 'lesson-detail-body-editing outline-none'
        )}
      >
        {sections.length > 0 ? (
          sections.map((section, idx) => (
            <LessonSectionBlock key={idx} section={section} />
          ))
        ) : (
          /* Fallback for lessons without structured sections */
          <div className="lesson-block">
            <p>{lesson.preview}</p>
          </div>
        )}
      </div>

      {/* Linked workflows */}
      {workflowCount > 0 && (
        <section className="mt-5">
          <h3 className="font-[family-name:var(--pixel)] text-xs text-[var(--taupe-3)] uppercase tracking-wider mb-3">
            Linked Workflows
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {lesson.linkedWorkflows!.map((wfId) => (
              <Link
                key={wfId}
                to={`/workflows/${wfId}`}
                className="inline-flex items-center gap-1 rounded-[var(--r-md)] bg-[var(--off-white)] dark:bg-[var(--surface-2)] border border-[var(--taupe-2)] dark:border-[var(--taupe-3)] px-2 py-1 font-[family-name:var(--mono)] text-[10px] font-semibold text-[var(--violet-3)] dark:text-[var(--violet-2)] transition-colors hover:bg-[var(--violet-1)] hover:border-[var(--violet-2)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] focus-visible:outline-2 focus-visible:outline-[var(--violet-3)]"
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
