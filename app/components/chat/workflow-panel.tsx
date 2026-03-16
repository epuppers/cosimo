// ============================================
// WorkflowPanel — Right-side panel for workflow run context
// ============================================
// Shows compact flow graph with node statuses, input/output
// manifests, and exceptions for the active workflow run.

import { useEffect, useState } from 'react';
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
    <>
      {/* Resize handle */}
      <div
        className={cn('resize-handle resize-handle-wfpanel visible', isDragging && 'dragging')}
        onMouseDown={handleMouseDown}
      />

      <div
        className={cn(
          'workflow-panel open',
          isDragging && 'dragging select-none'
        )}
        style={{ width: currentWidth }}
      >
        {/* Header */}
        <div className="workflow-panel-header">
          <div className="workflow-panel-title-row">
            <span className="workflow-panel-name">
              {template?.title ?? 'Workflow Run'}
            </span>
            <span className="workflow-panel-run-id">
              Run {run.runId}
            </span>
          </div>
          <div className="workflow-panel-header-right">
            <RunStatusBadge status={run.status} />
            <button
              className="workflow-panel-close"
              onClick={close}
              aria-label="Close workflow panel"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="workflow-panel-details">
          {/* Compact Flow Graph */}
          {template && (
            <div className="workflow-panel-graph">
              <FlowGraph
                nodes={template.nodes}
                edges={template.edges}
                compact
                nodeStatuses={run.nodeStatuses}
              />
            </div>
          )}

          {/* Input Manifest */}
          <div className="workflow-panel-section">
            <div className="workflow-panel-section-label">
              <span>📄</span>
              <span>Input Files</span>
            </div>
            <div className="workflow-panel-section-body">
              {run.inputManifest.map((file) => (
                <div key={file.name} className="wf-panel-file-item">
                  <span className="wf-panel-file-icon">
                    {file.fileCount ? '📁' : '📄'}
                  </span>
                  <span className="wf-panel-file-name">{file.name}</span>
                  <span className="wf-panel-file-meta">
                    {file.fileCount ? `${file.fileCount} files` : file.size ?? ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Exceptions */}
          {run.exceptions.length > 0 && (
            <div className="workflow-panel-section">
              <div className="workflow-panel-section-label">
                <span style={{ color: 'var(--amber)' }}>⚠</span>
                <span>Exceptions ({run.exceptions.length})</span>
              </div>
              <div className="workflow-panel-section-body">
                {run.exceptions.map((exc, i) => (
                  <div key={`${exc.nodeId}-${i}`} className="wf-panel-exception">
                    <div className={cn(
                      'wf-panel-exception-dot',
                      `type-${exc.type}`
                    )} />
                    <div className="wf-panel-exception-body">
                      <div className="wf-panel-exception-type">{exc.type.replace(/-/g, ' ')}</div>
                      <div className="wf-panel-exception-desc">{exc.description}</div>
                      {exc.confidence !== null && (
                        <div className="wf-panel-exception-confidence">
                          Confidence: {exc.confidence}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Manifest */}
          {run.outputManifest.length > 0 && (
            <div className="workflow-panel-section">
              <div className="workflow-panel-section-label">
                <span>📦</span>
                <span>Output</span>
              </div>
              <div className="workflow-panel-section-body">
                {run.outputManifest.map((file) => (
                  <div key={file.name} className="wf-panel-file-item">
                    <span className="wf-panel-file-icon">📄</span>
                    <span className="wf-panel-file-name">{file.name}</span>
                    <span className="wf-panel-file-meta">{file.size ?? ''}</span>
                  </div>
                ))}
                {run.outputManifest[0]?.path && (
                  <div className="wf-panel-file-meta mt-1">
                    {run.outputManifest[0].path}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================
// Helpers
// ============================================

/** Status badge with appropriate color for run status. */
function RunStatusBadge({ status }: { status: WorkflowRun['status'] }) {
  const statusClass = `status-${status}`;
  const labels: Record<WorkflowRun['status'], string> = {
    completed: 'Completed',
    running: 'Running',
    waiting: 'Waiting',
    failed: 'Failed',
  };

  return (
    <span className={cn('workflow-panel-status', statusClass)}>
      {labels[status]}
    </span>
  );
}
