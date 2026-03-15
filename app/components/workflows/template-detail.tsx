// ============================================
// TemplateDetail — Main container for workflow template detail view
// ============================================

import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ChevronLeft, Play, MoreHorizontal, Sparkles, Copy, Archive } from 'lucide-react';
import { findRunThread } from '~/services/workflows';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs';
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

/** Maps template status to badge styling */
function statusBadgeClass(status: WorkflowTemplate['status']): string {
  const classes: Record<WorkflowTemplate['status'], string> = {
    active: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
    draft: 'bg-secondary text-secondary-foreground',
    paused: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    archived: 'bg-secondary text-muted-foreground',
  };
  return classes[status];
}

/** Capitalizes the first letter of a status string */
function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

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
    <div className="flex h-full flex-col">
      {/* Header row */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="gap-1 text-muted-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to Library
        </Button>

        <div className="flex flex-1 items-center gap-2">
          <h2 className="font-mono text-sm font-semibold text-foreground">
            {template.title}
          </h2>
          <Badge
            className={cn(
              'border-transparent text-xs',
              statusBadgeClass(template.status)
            )}
          >
            {statusLabel(template.status)}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="icon-xs" aria-label="Template actions">
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />
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

          <Button size="sm" className="gap-1.5" onClick={handleRun}>
            <Play className="size-3.5" />
            Run
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column — Flow graph */}
        <div
          ref={graphContainerRef}
          className="relative w-[60%] overflow-hidden border-r border-border bg-muted/30 dark:bg-muted/10"
        >
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

        {/* Right column — Tabs */}
        <div className="flex w-[40%] flex-col overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setTab}
            className="flex h-full flex-col"
          >
            <TabsList className="mx-3 mt-3 shrink-0">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schema">Schema</TabsTrigger>
              <TabsTrigger value="triggers">Triggers</TabsTrigger>
              <TabsTrigger value="runs">Runs</TabsTrigger>
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              <TabsContent value="overview">
                <OverviewTab template={template} />
              </TabsContent>
              <TabsContent value="schema">
                <SchemaTab template={template} />
              </TabsContent>
              <TabsContent value="triggers">
                <TriggersTab template={template} />
              </TabsContent>
              <TabsContent value="runs">
                <RunsTab template={template} />
              </TabsContent>
              <TabsContent value="lessons">
                <LessonsTab template={template} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
