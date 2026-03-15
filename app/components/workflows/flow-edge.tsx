// ============================================
// FlowEdge — Edge line between two nodes in the flow graph
// ============================================

import type { FlowEdge as FlowEdgeType, FlowNode } from '~/services/types';
import type { FlowGraphConfig } from './flow-node';

interface FlowEdgeProps {
  edge: FlowEdgeType;
  nodes: FlowNode[];
  config: FlowGraphConfig;
}

/**
 * Renders an edge (line with arrowhead) connecting two flow graph nodes.
 * Calculates start from bottom-center of source and end at top-center of target.
 * Branch edges display their condition label at the midpoint.
 */
export function FlowEdgeComponent({ edge, nodes, config }: FlowEdgeProps) {
  const { nodeWidth, nodeHeight, colSpacing, rowSpacing } = config;

  const fromNode = nodes.find((n) => n.id === edge.from);
  const toNode = nodes.find((n) => n.id === edge.to);

  if (!fromNode || !toNode) return null;

  // Bottom center of source node
  const x1 = fromNode.x * colSpacing;
  const y1 = fromNode.y * rowSpacing + nodeHeight / 2;

  // Top center of target node
  const x2 = toNode.x * colSpacing;
  const y2 = toNode.y * rowSpacing - nodeHeight / 2;

  // Midpoint for label
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // If nodes are in the same column, draw a straight line
  // Otherwise draw an L-shaped path via a vertical then horizontal segment
  const isStraight = x1 === x2;

  return (
    <g>
      {isStraight ? (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className="stroke-muted-foreground/50"
          strokeWidth={config.edgeStroke}
          markerEnd="url(#arrowhead)"
        />
      ) : (
        <path
          d={`M ${x1} ${y1} L ${x1} ${my} L ${x2} ${my} L ${x2} ${y2}`}
          fill="none"
          className="stroke-muted-foreground/50"
          strokeWidth={config.edgeStroke}
          markerEnd="url(#arrowhead)"
        />
      )}

      {/* Branch label at midpoint */}
      {edge.label && (
        <>
          <rect
            x={mx - edge.label.length * 3.2}
            y={my - 8}
            width={edge.label.length * 6.4}
            height={14}
            rx={3}
            className="fill-background"
          />
          <text
            x={mx}
            y={my}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'IBM Plex Mono', monospace"
            fontSize={9}
            className="fill-muted-foreground"
          >
            {edge.label}
          </text>
        </>
      )}
    </g>
  );
}
