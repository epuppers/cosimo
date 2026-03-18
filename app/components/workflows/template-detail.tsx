// ============================================
// TemplateDetail — Main container for workflow template detail view
// ============================================

import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Play, MoreHorizontal, Sparkles, Copy, Archive, Maximize2 } from 'lucide-react';
import { findRunThread } from '~/services/workflows';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '~/components/ui/dropdown-menu';
import { FlowGraph, computeFlowViewBox } from '~/components/workflows/flow-graph';
import { CONFIG } from '~/data/config';
import { NodePopover } from '~/components/workflows/node-popover';
import { OverviewTab } from '~/components/workflows/overview-tab';
import { SchemaTab } from '~/components/workflows/schema-tab';
import { TriggersTab } from '~/components/workflows/triggers-tab';
import { RunsTab } from '~/components/workflows/runs-tab';
import { LessonsTab } from '~/components/workflows/lessons-tab';
import { useWorkflowStore } from '~/stores/workflow-store';
import { useUIStore } from '~/stores/ui-store';
import type { WorkflowTemplate, WorkflowRun, FlowNode } from '~/services/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
import { cn } from '~/lib/utils';
import { TRIGGER_CONFIG } from '~/lib/workflow-constants';

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

const STATUS_COLORS: Record<string, string> = {
  active: 'text-green border-green bg-[rgba(var(--green-rgb),0.1)]',
  draft: 'text-amber border-amber bg-[rgba(var(--amber-rgb),0.1)]',
  paused: 'text-taupe-3 border-taupe-3 bg-[rgba(var(--taupe-3-rgb),0.1)]',
  archived: 'text-taupe-3 border-taupe-3 bg-[rgba(var(--taupe-3-rgb),0.06)]',
};

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

  // Compute natural viewBox synchronously so pan/zoom is interactive on first render
  const graphConfig = CONFIG.flowGraph;
  const flowConfig = useMemo(() => ({
    nodeWidth: graphConfig.nodeWidth,
    nodeHeight: graphConfig.nodeHeight,
    colSpacing: graphConfig.colSpacing,
    rowSpacing: graphConfig.rowSpacing,
  }), [graphConfig]);
  const naturalViewBox = useMemo(
    () => computeFlowViewBox(template.nodes, flowConfig),
    [template.nodes, flowConfig],
  );

  // Pan/zoom state for the flow graph — initialized from naturalViewBox immediately
  const [graphViewBox, setGraphViewBox] = useState(naturalViewBox);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vbX: 0, vbY: 0 });

  // Reset viewBox when template changes (naturalViewBox will have new value)
  const prevTemplateId = useRef(template.id);
  if (prevTemplateId.current !== template.id) {
    prevTemplateId.current = template.id;
    setGraphViewBox(naturalViewBox);
  }

  const handleGraphWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    setGraphViewBox((prev) => {
      const newW = prev.w * zoomFactor;
      const newH = prev.h * zoomFactor;
      const dx = (prev.w - newW) / 2;
      const dy = (prev.h - newH) / 2;
      return {
        x: prev.x + dx,
        y: prev.y + dy,
        w: Math.max(200, Math.min(3000, newW)),
        h: Math.max(150, Math.min(2400, newH)),
      };
    });
  }, []);

  const handleGraphMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      // Don't start pan if clicking on a node
      const target = e.target as Element;
      if (target.closest('[role="button"]')) return;
      setIsPanning(true);
      panStart.current = {
        x: e.clientX,
        y: e.clientY,
        vbX: graphViewBox.x,
        vbY: graphViewBox.y,
      };
    },
    [graphViewBox.x, graphViewBox.y]
  );

  const handleGraphMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const container = graphContainerRef.current;
      const svg = container?.querySelector('svg');
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = graphViewBox.w / rect.width;
      const scaleY = graphViewBox.h / rect.height;
      const dx = (e.clientX - panStart.current.x) * scaleX;
      const dy = (e.clientY - panStart.current.y) * scaleY;
      setGraphViewBox((prev) => ({
        ...prev,
        x: panStart.current.vbX - dx,
        y: panStart.current.vbY - dy,
      }));
    },
    [isPanning, graphViewBox.w, graphViewBox.h]
  );

  const handleGraphMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleGraphZoom = useCallback((direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 0.8 : 1.25;
    setGraphViewBox((prev) => {
      const newW = prev.w * factor;
      const newH = prev.h * factor;
      const dx = (prev.w - newW) / 2;
      const dy = (prev.h - newH) / 2;
      return {
        x: prev.x + dx,
        y: prev.y + dy,
        w: Math.max(200, Math.min(3000, newW)),
        h: Math.max(150, Math.min(2400, newH)),
      };
    });
  }, []);

  const handleGraphFit = useCallback(() => {
    setGraphViewBox({ ...naturalViewBox });
  }, [naturalViewBox]);

  const viewBoxOverride = `${graphViewBox.x} ${graphViewBox.y} ${graphViewBox.w} ${graphViewBox.h}`;

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

  const TriggerIcon = TRIGGER_CONFIG[template.triggerType]?.icon;
  const triggerLabelText = TRIGGER_CONFIG[template.triggerType]?.label ?? template.triggerType;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-[14px] bg-white dark:bg-surface-1">
        <div className="flex items-center gap-3 mb-3">
          <button
            className="px-2 py-[3px] font-mono text-[0.6875rem] text-taupe-3 bg-transparent border border-taupe-2 dark:border-taupe-2 cursor-pointer transition-all duration-100 rounded-r-sm hover:text-taupe-5 hover:border-taupe-4 dark:hover:text-taupe-5 dark:hover:border-taupe-3 active:border-t-taupe-4 active:border-l-taupe-4 active:border-b-taupe-1 active:border-r-taupe-1 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
            onClick={handleBack}
          >
            ← Back
          </button>
          <span className="font-pixel text-[1.375rem] text-taupe-5 tracking-[0.5px]">{template.title}</span>
        </div>

        <div className="text-[0.8125rem] text-taupe-3 mb-3 ml-0.5">{template.description}</div>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          {/* Status badge */}
          <span className={cn(
            'font-mono text-[0.625rem] font-semibold px-2 py-[2px] border rounded-r-sm',
            STATUS_COLORS[template.status],
          )}>
            {statusLabel(template.status)}
          </span>

          {/* Version badge */}
          <span className="font-mono text-[0.625rem] font-semibold px-2 py-[2px] border rounded-r-sm text-taupe-3 border-taupe-2 dark:text-taupe-4 dark:border-taupe-3">
            v{template.version}
          </span>

          <div className="w-px h-3.5 bg-taupe-2 dark:bg-surface-3" />

          {/* Trigger chip */}
          <span className="inline-flex items-center gap-1 font-mono text-[0.625rem] text-taupe-3 bg-[rgba(var(--taupe-3-rgb),0.08)] dark:bg-[rgba(var(--taupe-3-rgb),0.12)] px-2 py-[2px] rounded-r-sm">
            {TriggerIcon && <TriggerIcon className="size-3.5" />} {triggerLabelText}
          </span>

          <div className="w-px h-3.5 bg-taupe-2 dark:bg-surface-3" />

          {/* Created by */}
          <span className="font-mono text-[0.625rem] text-taupe-3">
            by {template.createdBy} · {template.createdDate}
          </span>

          {/* Spacer + actions */}
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="font-mono text-[0.6875rem] py-[5px] px-2 text-taupe-3 bg-transparent border border-taupe-2 dark:border-taupe-3 cursor-pointer rounded-r-sm inline-flex items-center transition-all duration-100"
                aria-label="Template actions"
              >
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

            <button
              className="font-mono text-[0.6875rem] font-semibold py-[5px] px-3.5 text-white bg-violet-3 border cursor-pointer rounded-r-sm inline-flex items-center gap-1.5 transition-colors duration-150 border-t-violet-2 border-l-violet-2 border-b-violet-4 border-r-violet-4 dark:border-violet-3"
              onClick={handleRun}
            >
              <Play className="size-3.5" />
              <span>Run</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex-1 flex gap-0 overflow-hidden">
        {/* Left column — Flow graph */}
        <div className="relative flex-[0_0_60%] flex flex-col py-4 pl-4 pr-0" ref={graphContainerRef}>
          <div
            className={cn(
              'flex-1 border-2 border-solid [border-color:var(--taupe-3)_var(--taupe-1)_var(--taupe-1)_var(--taupe-3)] bg-[var(--off-white)] overflow-hidden relative rounded-[var(--r-lg)] dark:[border-color:var(--surface-3)] dark:bg-[var(--surface-1)]',
              isPanning ? 'cursor-grabbing' : 'cursor-grab',
            )}
            onWheel={handleGraphWheel}
            onMouseDown={handleGraphMouseDown}
            onMouseMove={handleGraphMouseMove}
            onMouseUp={handleGraphMouseUp}
            onMouseLeave={handleGraphMouseUp}
          >
            <FlowGraph
              nodes={template.nodes}
              edges={template.edges}
              selectedNodeId={selectedNodeId ?? undefined}
              onNodeSelect={handleNodeSelect}
              nodeStatuses={run?.nodeStatuses}
              viewBoxOverride={viewBoxOverride}
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

            {/* Zoom controls */}
            <div className="absolute bottom-3 right-3 flex flex-col gap-0.5 z-[4]">
              <button
                type="button"
                className="size-7 flex items-center justify-center bg-white dark:bg-surface-2 border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2 rounded-r-md font-mono text-sm font-bold text-taupe-4 cursor-pointer transition-all hover:bg-violet-1 hover:text-violet-3 hover:border-violet-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                onClick={() => handleGraphZoom('in')}
                aria-label="Zoom in"
              >
                +
              </button>
              <button
                type="button"
                className="size-7 flex items-center justify-center bg-white dark:bg-surface-2 border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2 rounded-r-md font-mono text-sm font-bold text-taupe-4 cursor-pointer transition-all hover:bg-violet-1 hover:text-violet-3 hover:border-violet-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                onClick={() => handleGraphZoom('out')}
                aria-label="Zoom out"
              >
                −
              </button>
              <button
                type="button"
                className="size-7 flex items-center justify-center bg-white dark:bg-surface-2 border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2 rounded-r-md font-mono text-sm font-bold text-taupe-4 cursor-pointer transition-all hover:bg-violet-1 hover:text-violet-3 hover:border-violet-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                onClick={handleGraphFit}
                aria-label="Fit to view"
              >
                <Maximize2 className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right column — Tabs */}
        <div className="flex-[0_0_40%] flex flex-col overflow-hidden pt-3.5 px-4 pb-0 border-l border-taupe-1 dark:border-surface-3">
          <Tabs value={activeTab} onValueChange={(val) => setTab(val as typeof activeTab)} className="flex-1 min-h-0">
            <TabsList variant="line" className="flex gap-0 border-b border-taupe-2 dark:border-surface-3 relative shrink-0">
              {TAB_KEYS.map((key) => (
                <TabsTrigger key={key} value={key} className="tab-btn p-[8px_16px] font-mono text-[0.6875rem] font-semibold text-taupe-3 bg-taupe-1 dark:bg-black/25 border border-taupe-2 dark:border-surface-3 border-b-taupe-2 cursor-pointer uppercase tracking-[0.08em] transition-[color,background] duration-150 rounded-t-[var(--r-md)] mb-[-1px] relative z-[1] hover:text-taupe-5 hover:bg-berry-1 dark:hover:text-taupe-5 dark:hover:bg-berry-1 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px] data-active:text-violet-3 data-active:bg-off-white dark:data-active:bg-off-white data-active:border-taupe-2 data-active:border-b-transparent dark:data-active:border-surface-3 dark:data-active:border-b-transparent data-active:z-[2]">
                  {TAB_LABELS[key]}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview" className="flex-1 overflow-y-auto py-3.5"><OverviewTab template={template} /></TabsContent>
            <TabsContent value="schema" className="flex-1 overflow-y-auto py-3.5"><SchemaTab template={template} /></TabsContent>
            <TabsContent value="triggers" className="flex-1 overflow-y-auto py-3.5"><TriggersTab template={template} /></TabsContent>
            <TabsContent value="runs" className="flex-1 overflow-y-auto py-3.5"><RunsTab template={template} /></TabsContent>
            <TabsContent value="lessons" className="flex-1 overflow-y-auto py-3.5"><LessonsTab template={template} /></TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
