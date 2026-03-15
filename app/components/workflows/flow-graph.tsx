// ============================================
// FlowGraph — SVG container for the workflow flow graph
// ============================================

import { useMemo } from 'react';
import type { FlowNode, FlowEdge, NodeStatus } from '~/services/types';
import { CONFIG } from '~/data/config';
import { FlowNodeComponent } from './flow-node';
import type { FlowGraphConfig } from './flow-node';
import { FlowEdgeComponent } from './flow-edge';

interface FlowGraphProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  compact?: boolean;
  nodeStatuses?: Record<string, NodeStatus>;
  selectedNodeId?: string;
  onNodeSelect?: (id: string) => void;
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
}: FlowGraphProps) {
  const graphConfig = CONFIG.flowGraph;

  const config: FlowGraphConfig = useMemo(() => ({
    nodeWidth: compact ? graphConfig.compactNodeWidth : graphConfig.nodeWidth,
    nodeHeight: compact ? graphConfig.compactNodeHeight : graphConfig.nodeHeight,
    colSpacing: compact ? 130 : graphConfig.colSpacing,
    rowSpacing: compact ? 65 : graphConfig.rowSpacing,
    edgeStroke: graphConfig.edgeStroke,
  }), [compact, graphConfig]);

  // Calculate viewBox from node positions
  const viewBox = useMemo(() => {
    if (nodes.length === 0) return '0 0 400 300';

    const xs = nodes.map((n) => n.x * config.colSpacing);
    const ys = nodes.map((n) => n.y * config.rowSpacing);

    const minX = Math.min(...xs) - config.nodeWidth / 2 - 40;
    const maxX = Math.max(...xs) + config.nodeWidth / 2 + 40;
    const minY = Math.min(...ys) - config.nodeHeight / 2 - 30;
    const maxY = Math.max(...ys) + config.nodeHeight / 2 + 30;

    return `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;
  }, [nodes, config]);

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full"
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
            className="fill-muted-foreground/50"
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
