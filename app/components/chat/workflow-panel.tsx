// ============================================
// WorkflowPanel — Right-side panel for workflow run context
// ============================================
// Shows compact flow graph with node statuses, input/output
// manifests, and exceptions for the active workflow run.

import { useEffect, useState } from 'react';
import { X, FileText, AlertTriangle, FolderOutput, Play } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { ScrollArea } from '~/components/ui/scroll-area';
import { useChatStore } from '~/stores/chat-store';
import { useResizePanel } from '~/hooks/use-resize-panel';
import { getTemplate } from '~/services/workflows';
import { FlowGraph } from '~/components/workflows/flow-graph';
import type { WorkflowRun, WorkflowTemplate } from '~/services/types';
import { cn } from '~/lib/utils';

interface WorkflowPanelProps {
  run: WorkflowRun;
}

/**
 * WorkflowPanel — right-side panel showing workflow run context.
 * Displays compact flow graph with status colors, input/output manifests,
 * and exception list. Controlled by useChatStore.workflowPanelOpen.
 */
export function WorkflowPanel({ run }: WorkflowPanelProps) {
  const isOpen = useChatStore((s) => s.workflowPanelOpen);
  const close = useChatStore((s) => s.closeWorkflowPanel);

  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const { currentWidth, isDragging, handleMouseDown } = useResizePanel({
    initialWidth: 360,
    minWidth: 280,
    maxWidth: 600,
    side: 'right',
  });

  // Load template data for the run
  useEffect(() => {
    let cancelled = false;
    getTemplate(run.templateId).then((t) => {
      if (!cancelled) setTemplate(t);
    });
    return () => { cancelled = true; };
  }, [run.templateId]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'relative flex h-full flex-col border-l border-border bg-background',
        isDragging && 'select-none'
      )}
      style={{ width: currentWidth }}
    >
      {/* Resize handle */}
      <div
        className="absolute left-0 top-0 z-10 h-full w-1 cursor-col-resize hover:bg-primary/20 active:bg-primary/30"
        onMouseDown={handleMouseDown}
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-[var(--font-mono)] text-xs font-semibold text-foreground">
            {template?.title ?? 'Workflow Run'}
          </span>
          <div className="flex items-center gap-2">
            <span className="font-[var(--font-mono)] text-[10px] text-muted-foreground">
              Run {run.runId}
            </span>
            <RunStatusBadge status={run.status} />
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          onClick={close}
          aria-label="Close workflow panel"
        >
          <X className="size-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-0 p-0">
          {/* Compact Flow Graph */}
          {template && (
            <div className="border-b border-border px-3 py-3">
              <SectionLabel icon={<Play className="size-3" />} label="Flow Graph" />
              <div className="mt-2 rounded-[var(--r-md)] border border-border bg-muted/20 p-2">
                <FlowGraph
                  nodes={template.nodes}
                  edges={template.edges}
                  compact
                  nodeStatuses={run.nodeStatuses}
                />
              </div>
            </div>
          )}

          {/* Input Manifest */}
          <div className="border-b border-border px-3 py-3">
            <SectionLabel icon={<FileText className="size-3" />} label="Input Files" />
            <div className="mt-2 flex flex-col gap-1">
              {run.inputManifest.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between rounded-[var(--r-sm)] bg-muted/20 px-2.5 py-1.5"
                >
                  <span className="truncate font-[var(--font-mono)] text-[11px] text-foreground">
                    {file.name}
                  </span>
                  <span className="ml-2 shrink-0 font-[var(--font-mono)] text-[10px] text-muted-foreground">
                    {file.fileCount ? `${file.fileCount} files` : file.size ?? ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Exceptions */}
          {run.exceptions.length > 0 && (
            <div className="border-b border-border px-3 py-3">
              <SectionLabel
                icon={<AlertTriangle className="size-3 text-amber-500 dark:text-amber-400" />}
                label={`Exceptions (${run.exceptions.length})`}
              />
              <div className="mt-2 flex flex-col gap-1.5">
                {run.exceptions.map((exc, i) => (
                  <div
                    key={`${exc.nodeId}-${i}`}
                    className="rounded-[var(--r-sm)] border border-amber-500/20 bg-amber-500/5 px-2.5 py-2 dark:border-amber-500/30 dark:bg-amber-500/10"
                  >
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="h-4 border-amber-500/30 px-1 text-[9px] text-amber-600 dark:border-amber-500/40 dark:text-amber-400"
                      >
                        {exc.type}
                      </Badge>
                      {exc.confidence !== null && (
                        <span className="font-[var(--font-mono)] text-[10px] text-muted-foreground">
                          {exc.confidence}%
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-foreground/80">
                      {exc.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Manifest */}
          {run.outputManifest.length > 0 && (
            <div className="px-3 py-3">
              <SectionLabel icon={<FolderOutput className="size-3" />} label="Output" />
              <div className="mt-2 flex flex-col gap-1">
                {run.outputManifest.map((file) => (
                  <div
                    key={file.name}
                    className="flex items-center justify-between rounded-[var(--r-sm)] bg-muted/20 px-2.5 py-1.5"
                  >
                    <span className="truncate font-[var(--font-mono)] text-[11px] text-foreground">
                      {file.name}
                    </span>
                    <span className="ml-2 shrink-0 font-[var(--font-mono)] text-[10px] text-muted-foreground">
                      {file.size ?? ''}
                    </span>
                  </div>
                ))}
                {run.outputManifest[0]?.path && (
                  <p className="mt-1 font-[var(--font-mono)] text-[10px] text-muted-foreground">
                    {run.outputManifest[0].path}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================
// Helpers
// ============================================

/** Status badge with appropriate color for run status. */
function RunStatusBadge({ status }: { status: WorkflowRun['status'] }) {
  const variants: Record<WorkflowRun['status'], { label: string; className: string }> = {
    completed: {
      label: 'Completed',
      className: 'border-green-500/30 bg-green-500/10 text-green-600 dark:border-green-500/40 dark:bg-green-500/15 dark:text-green-400',
    },
    running: {
      label: 'Running',
      className: 'border-violet-500/30 bg-violet-500/10 text-violet-600 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-400',
    },
    waiting: {
      label: 'Waiting',
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-400',
    },
    failed: {
      label: 'Failed',
      className: 'border-red-500/30 bg-red-500/10 text-red-600 dark:border-red-500/40 dark:bg-red-500/15 dark:text-red-400',
    },
  };

  const v = variants[status];
  return (
    <Badge variant="outline" className={cn('h-4 px-1.5 text-[9px] font-medium', v.className)}>
      {v.label}
    </Badge>
  );
}

/** Small section label with icon. */
function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      {icon}
      <span className="font-[var(--font-mono)] text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}
