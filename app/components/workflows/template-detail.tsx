// ============================================
// TemplateDetail — Main container for workflow template detail view
// ============================================

import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Play, MoreHorizontal, Sparkles, Copy, Archive } from 'lucide-react';
import { findRunThread } from '~/services/workflows';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu';
import { FlowGraph } from '~/components/workflows/flow-graph';
import { NodePopover } from '~/components/workflows/node-popover';
import { OverviewTab } from '~/components/workflows/overview-tab';
import { SchemaTab } from '~/components/workflows/schema-tab';
import { TriggersTab } from '~/components/workflows/triggers-tab';
import { RunsTab } from '~/components/workflows/runs-tab';
import { LessonsTab } from '~/components/workflows/lessons-tab';
import { useWorkflowStore } from '~/stores/workflow-store';
import { useUIStore } from '~/stores/ui-store';
import type { WorkflowTemplate, WorkflowRun, FlowNode } from '~/services/types';
import { cn } from '~/lib/utils';

interface TemplateDetailProps {
  /** The workflow template to display */
  template: WorkflowTemplate;
  /** Optional active run for this template */
  run?: WorkflowRun;
}

/** Capitalizes the first letter of a status string */
function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

/** Maps trigger type to display icon */
function triggerIcon(type: string): string {
  const icons: Record<string, string> = {
    'folder-watch': '📁',
    'manual': '▶',
    'schedule': '🕐',
    'email': '✉',
    'chat-command': '💬',
    'chained': '🔗',
  };
  return icons[type] || '▶';
}

/** Maps trigger type to display label */
function triggerLabel(type: string): string {
  const labels: Record<string, string> = {
    'folder-watch': 'Folder Watch',
    'manual': 'Manual',
    'schedule': 'Schedule',
    'email': 'Email',
    'chat-command': 'Chat Command',
    'chained': 'Chained',
  };
  return labels[type] || type;
}

const TAB_KEYS = ['overview', 'schema', 'triggers', 'runs', 'lessons'] as const;
const TAB_LABELS: Record<string, string> = {
  overview: 'Overview',
  schema: 'Schema',
  triggers: 'Triggers',
  runs: 'Runs',
  lessons: 'Lessons',
};

/**
 * Main container for viewing a workflow template's detail.
 * Two-column layout: flow graph on the left, tabbed info panels on the right.
 * Header row with back navigation, title, status, actions, and run button.
 */
export function TemplateDetail({ template, run }: TemplateDetailProps) {
  const navigate = useNavigate();
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const popoverOpen = useWorkflowStore((s) => s.popoverOpen);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const openPopover = useWorkflowStore((s) => s.openPopover);
  const closePopover = useWorkflowStore((s) => s.closePopover);
  const activeTab = useWorkflowStore((s) => s.activeTab);
  const setTab = useWorkflowStore((s) => s.setTab);
  const openCosimoPanel = useUIStore((s) => s.openCosimoPanel);

  const graphContainerRef = useRef<HTMLDivElement>(null);
  const [anchorPosition, setAnchorPosition] = useState({ x: 0, y: 0 });

  const handleNodeSelect = useCallback(
    (nodeId: string) => {
      selectNode(nodeId);
      openPopover();

      // Calculate popover anchor position from the SVG node
      if (graphContainerRef.current) {
        const svg = graphContainerRef.current.querySelector('svg');
        if (svg) {
          const node = template.nodes.find((n) => n.id === nodeId);
          if (node) {
            const svgRect = svg.getBoundingClientRect();
            const viewBox = svg.viewBox.baseVal;
            const scaleX = svgRect.width / viewBox.width;
            const scaleY = svgRect.height / viewBox.height;
            const config = { colSpacing: 200, rowSpacing: 100, nodeWidth: 160 };
            const nodeScreenX =
              svgRect.left + (node.x * config.colSpacing - viewBox.x) * scaleX + config.nodeWidth * scaleX * 0.5;
            const nodeScreenY =
              svgRect.top + (node.y * config.rowSpacing - viewBox.y) * scaleY;
            setAnchorPosition({ x: nodeScreenX, y: nodeScreenY });
          }
        }
      }
    },
    [selectNode, openPopover, template.nodes]
  );

  const handleClosePopover = useCallback(() => {
    closePopover();
  }, [closePopover]);

  const handleBack = useCallback(() => {
    navigate('/workflows');
  }, [navigate]);

  const handleRun = useCallback(() => {
    const threadId = findRunThread(template.id);
    if (threadId) {
      navigate(`/chat/${threadId}`);
    } else {
      toast('No mock run available for this workflow');
    }
  }, [navigate, template.id]);

  const selectedNode: FlowNode | undefined = selectedNodeId
    ? template.nodes.find((n) => n.id === selectedNodeId)
    : undefined;

  return (
    <div className="wf-detail">
      {/* Header */}
      <div className="wf-detail-header">
        <div className="wf-detail-top">
          <button className="back-btn" onClick={handleBack}>
            <span className="icon-char">←</span> Back
          </button>
          <span className="wf-detail-name">{template.title}</span>
        </div>

        <div className="wf-detail-desc">{template.description}</div>

        <div className="wf-detail-meta">
          {/* Status badge */}
          <span className={cn('wf-detail-meta-badge', `status-${template.status}`)}>
            {statusLabel(template.status)}
          </span>

          {/* Version badge */}
          <span className="wf-detail-meta-badge wf-detail-meta-badge-muted">
            v{template.version}
          </span>

          <div className="wf-detail-meta-sep" />

          {/* Trigger chip */}
          <span className="wf-detail-meta-chip">
            {triggerIcon(template.triggerType)} {triggerLabel(template.triggerType)}
          </span>

          <div className="wf-detail-meta-sep" />

          {/* Created by */}
          <span className="wf-detail-meta-text">
            by {template.createdBy} · {template.createdDate}
          </span>

          {/* Spacer + actions */}
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="wf-detail-actions-btn" aria-label="Template actions">
                <MoreHorizontal className="size-4" />
                <span className="a11y-label">Actions</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={6}>
                <DropdownMenuItem onClick={() => openCosimoPanel({ type: 'template', text: template.title })}>
                  <Sparkles className="size-4" />
                  Edit with Cosimo
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="size-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="size-4" />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button className="wf-detail-run-btn" onClick={handleRun}>
              <Play className="size-3.5" />
              <span>Run</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="wf-detail-columns">
        {/* Left column — Flow graph */}
        <div className="wf-detail-graph-col" ref={graphContainerRef}>
          <div className="flow-graph-container">
            <FlowGraph
              nodes={template.nodes}
              edges={template.edges}
              selectedNodeId={selectedNodeId ?? undefined}
              onNodeSelect={handleNodeSelect}
              nodeStatuses={run?.nodeStatuses}
            />

            {/* Node popover */}
            {selectedNode && (
              <NodePopover
                node={selectedNode}
                templateId={template.id}
                open={popoverOpen}
                onClose={handleClosePopover}
                anchorPosition={anchorPosition}
              />
            )}
          </div>
        </div>

        {/* Right column — Tabs */}
        <div className="wf-detail-info-col">
          {/* Tab bar */}
          <div className="tab-bar">
            {TAB_KEYS.map((key) => (
              <button
                key={key}
                className={cn('tab-btn', activeTab === key && 'active')}
                onClick={() => setTab(key)}
              >
                {TAB_LABELS[key]}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="tab-content">
            {activeTab === 'overview' && <OverviewTab template={template} />}
            {activeTab === 'schema' && <SchemaTab template={template} />}
            {activeTab === 'triggers' && <TriggersTab template={template} />}
            {activeTab === 'runs' && <RunsTab template={template} />}
            {activeTab === 'lessons' && <LessonsTab template={template} />}
          </div>
        </div>
      </div>
    </div>
  );
}
