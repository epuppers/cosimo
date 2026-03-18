// ============================================
// FlowGraph — SVG container for the workflow flow graph
// ============================================

import { useMemo } from 'react';
import type { FlowNode, FlowEdge, NodeStatus } from '~/services/types';
import { CONFIG } from '~/data/config';
import { cn } from '~/lib/utils';
import { FlowNodeComponent } from './flow-node';
import type { FlowGraphConfig } from './flow-node';
import { FlowEdgeComponent } from './flow-edge';

// old CSS: .flow-graph-svg, .flow-graph-compact, .flow-edge-arrow → ported to Tailwind below

export interface FlowViewBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Computes the natural viewBox for a set of flow nodes with minimum dimension enforcement. */
export function computeFlowViewBox(
  nodes: FlowNode[],
  config: { nodeWidth: number; nodeHeight: number; colSpacing: number; rowSpacing: number },
  compact = false,
): FlowViewBox {
  if (nodes.length === 0) return { x: 0, y: 0, w: 600, h: 400 };

  const xs = nodes.map((n) => n.x * config.colSpacing);
  const ys = nodes.map((n) => n.y * config.rowSpacing);

  const contentMinX = Math.min(...xs) - config.nodeWidth / 2 - 40;
  const contentMaxX = Math.max(...xs) + config.nodeWidth / 2 + 40;
  const contentMinY = Math.min(...ys) - config.nodeHeight / 2 - 30;
  const contentMaxY = Math.max(...ys) + config.nodeHeight / 2 + 30;

  let w = contentMaxX - contentMinX;
  let h = contentMaxY - contentMinY;

  const minW = compact ? 300 : 600;
  const minH = compact ? 200 : 400;

  let x = contentMinX;
  let y = contentMinY;
  if (w < minW) {
    const cx = contentMinX + w / 2;
    x = cx - minW / 2;
    w = minW;
  }
  if (h < minH) {
    const cy = contentMinY + h / 2;
    y = cy - minH / 2;
    h = minH;
  }

  return { x, y, w, h };
}

interface FlowGraphProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  compact?: boolean;
  nodeStatuses?: Record<string, NodeStatus>;
  selectedNodeId?: string;
  onNodeSelect?: (id: string) => void;
  /** When provided, overrides the auto-calculated viewBox (for external pan/zoom control) */
  viewBoxOverride?: string;
}

/**
 * Renders the full SVG flow graph for a workflow template.
 * Calculates viewBox from node positions using layout config dimensions.
 * Supports full and compact modes with optional run status overlays.
 */
export function FlowGraph({
  nodes,
  edges,
  compact = false,
  nodeStatuses,
  selectedNodeId,
  onNodeSelect,
  viewBoxOverride,
}: FlowGraphProps) {
  const graphConfig = CONFIG.flowGraph;

  const config: FlowGraphConfig = useMemo(() => ({
    nodeWidth: compact ? graphConfig.compactNodeWidth : graphConfig.nodeWidth,
    nodeHeight: compact ? graphConfig.compactNodeHeight : graphConfig.nodeHeight,
    colSpacing: compact ? 130 : graphConfig.colSpacing,
    rowSpacing: compact ? 65 : graphConfig.rowSpacing,
    edgeStroke: graphConfig.edgeStroke,
  }), [compact, graphConfig]);

  const naturalViewBox = useMemo(() => computeFlowViewBox(nodes, config, compact), [nodes, config, compact]);

  const viewBox = viewBoxOverride ?? `${naturalViewBox.x} ${naturalViewBox.y} ${naturalViewBox.w} ${naturalViewBox.h}`;

  return (
    <svg
      viewBox={viewBox}
      className={cn(
        'block',
        viewBoxOverride ? 'w-full h-full' : 'max-w-full h-auto',
        compact && 'cursor-default',
      )}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Workflow flow graph"
    >
      {/* Arrowhead marker definition */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth={8}
          markerHeight={6}
          refX={7}
          refY={3}
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M 0 0 L 8 3 L 0 6 Z"
            className="[fill:var(--taupe-3)] [stroke:none]"
          />
        </marker>
      </defs>

      {/* Edges (rendered below nodes) */}
      {edges.map((edge) => (
        <FlowEdgeComponent
          key={`${edge.from}-${edge.to}`}
          edge={edge}
          nodes={nodes}
          config={config}
          compact={compact}
        />
      ))}

      {/* Nodes (rendered on top of edges) */}
      {nodes.map((node) => (
        <FlowNodeComponent
          key={node.id}
          node={node}
          status={nodeStatuses?.[node.id]}
          selected={selectedNodeId === node.id}
          compact={compact}
          config={config}
          onClick={onNodeSelect}
        />
      ))}
    </svg>
  );
}
