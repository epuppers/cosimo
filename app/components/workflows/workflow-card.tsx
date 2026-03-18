// ============================================
// WorkflowCard — Library card for a workflow template
// ============================================

import type { WorkflowTemplate } from '~/services/types';
import { TriggerChip } from './trigger-chip';

/** Map of template status to Tailwind classes */
const STATUS_CLASS: Record<WorkflowTemplate['status'], string> = {
  active: 'text-green border-green bg-[rgba(var(--green-rgb),0.08)] dark:bg-[rgba(var(--green-rgb),0.12)]',
  draft: 'text-amber border-amber bg-[rgba(var(--amber-rgb),0.08)] dark:bg-[rgba(var(--amber-rgb),0.12)]',
  paused: 'text-taupe-3 border-taupe-3 bg-[rgba(var(--taupe-3-rgb),0.08)] dark:bg-[rgba(var(--taupe-3-rgb),0.12)]',
  archived: 'text-taupe-3 border-taupe-2 bg-[rgba(var(--taupe-3-rgb),0.06)]',
};

/** Map of run dot status to Tailwind bg class */
const RUN_DOT_BG: Record<string, string> = {
  green: 'bg-green',
  red: 'bg-red',
  muted: 'bg-taupe-2',
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

  // Determine last run status for the dot indicator
  const lastRun = template.recentRuns[0];
  let runDotColor = 'muted';
  let runLabel = 'No runs';
  if (lastRun) {
    runDotColor = lastRun.status === 'success' ? 'green' : lastRun.status === 'failed' ? 'red' : 'muted';
    runLabel = `${template.runs.total} runs · ${lastRun.time}`;
  }

  return (
    <div
      className="group bg-[var(--white)] border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 mb-2 cursor-pointer transition-colors duration-150 rounded-[var(--r-md)] hover:border-t-violet-2 hover:border-l-violet-2 hover:border-b-violet-4 hover:border-r-violet-4 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:bg-surface-1 dark:border-taupe-2 dark:hover:border-violet-2"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Header: title + status + trigger + run btn */}
      <div className="flex items-center justify-between px-[14px] py-[10px] border-b border-taupe-1 bg-[rgba(0,0,0,0.01)] dark:bg-[rgba(255,255,255,0.02)] dark:border-taupe-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-mono text-[0.8125rem] font-semibold text-taupe-5">{template.title}</span>
          <span className={`font-mono text-[0.625rem] uppercase tracking-[0.05em] font-semibold px-2 py-[3px] border rounded-[var(--r-sm)] whitespace-nowrap ${STATUS_CLASS[template.status]}`}>
            {template.status}
          </span>
          <TriggerChip type={template.triggerType} className="font-mono text-[0.625rem] font-semibold text-taupe-3 bg-[rgba(var(--taupe-3-rgb),0.08)] px-2 py-[2px] rounded-[var(--r-sm)] whitespace-nowrap dark:bg-[rgba(var(--taupe-3-rgb),0.12)]" />
        </div>
        <button
          className="font-mono text-[0.625rem] font-semibold px-2.5 py-[3px] text-violet-3 bg-[var(--white)] border border-violet-2 cursor-pointer opacity-0 transition-[opacity,background,border-color] duration-150 rounded-[var(--r-sm)] whitespace-nowrap group-hover:opacity-100 hover:bg-[rgba(var(--violet-3-rgb),0.08)] hover:border-violet-3 active:border-t-violet-4 active:border-l-violet-4 active:border-b-violet-1 active:border-r-violet-1 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 focus-visible:opacity-100 dark:bg-transparent dark:border-violet-2 dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)]"
          onClick={handleRunClick}
          aria-label={`Run ${template.title}`}
        >
          <span className="[[data-a11y-labels=show]_&]:hidden">▶</span>
          <span className="hidden [[data-a11y-labels=show]_&]:inline">Run</span>
        </button>
      </div>

      {/* Body: description */}
      <div className="px-[14px] py-[10px] flex gap-6">
        <span className="flex-1 font-sans text-[0.8125rem] text-taupe-4 leading-relaxed dark:text-taupe-3">{template.description}</span>
      </div>

      {/* Footer: lesson chip + run status */}
      <div className="flex items-center gap-2.5 px-[14px] pt-1.5 pb-2 border-t border-taupe-1 dark:border-taupe-2">
        {template.linkedLessons.length > 0 && (
          <span className="inline-flex items-center gap-1 font-mono text-[0.625rem] font-semibold text-violet-3 bg-[rgba(var(--violet-3-rgb),0.08)] px-2 py-[2px] rounded-[var(--r-lg)] whitespace-nowrap overflow-hidden text-ellipsis max-w-[220px] dark:bg-[rgba(var(--violet-3-rgb),0.12)]" title={lessonNames?.[template.linkedLessons[0]] ?? template.linkedLessons[0]}>
            ◆ {lessonNames?.[template.linkedLessons[0]] ?? template.linkedLessons[0]}
          </span>
        )}
        <span className="inline-flex items-center gap-[5px] font-mono text-[0.625rem] text-taupe-3 whitespace-nowrap">
          <span className={`size-1.5 rounded-full shrink-0 ${RUN_DOT_BG[runDotColor]}`} />
          {runLabel}
        </span>
      </div>
    </div>
  );
}
