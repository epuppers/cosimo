// ============================================
// FlowNode — Single node in the workflow flow graph
// ============================================

import type { FlowNode as FlowNodeType, FlowNodeType as NodeType, NodeStatus } from '~/services/types';
import { cn } from '~/lib/utils';

/** Configuration for graph layout dimensions */
export interface FlowGraphConfig {
  nodeWidth: number;
  nodeHeight: number;
  colSpacing: number;
  rowSpacing: number;
  edgeStroke: number;
}

interface FlowNodeProps {
  node: FlowNodeType;
  status?: NodeStatus;
  selected?: boolean;
  compact?: boolean;
  config: FlowGraphConfig;
  onClick?: (nodeId: string) => void;
}

/** Color palette per node type: [stroke, fill, darkFill] */
const NODE_COLORS: Record<NodeType, { stroke: string; fill: string; darkStroke: string; darkFill: string }> = {
  input: {
    stroke: '#3b82f6',     // blue-500
    fill: '#eff6ff',       // blue-50
    darkStroke: '#60a5fa',  // blue-400
    darkFill: '#172554',    // blue-950
  },
  action: {
    stroke: '#8b5cf6',     // violet-500
    fill: '#f5f3ff',       // violet-50
    darkStroke: '#a78bfa',  // violet-400
    darkFill: '#2e1065',    // violet-950
  },
  gate: {
    stroke: '#f59e0b',     // amber-500
    fill: 'rgba(245, 158, 11, 0.08)',
    darkStroke: '#fbbf24',  // amber-400
    darkFill: 'rgba(245, 158, 11, 0.12)',
  },
  branch: {
    stroke: '#9ca3af',     // gray-400 (muted)
    fill: '#ffffff',
    darkStroke: '#6b7280',  // gray-500
    darkFill: '#1f2937',    // gray-800
  },
  output: {
    stroke: '#22c55e',     // green-500
    fill: 'rgba(34, 197, 94, 0.08)',
    darkStroke: '#4ade80',  // green-400
    darkFill: 'rgba(34, 197, 94, 0.12)',
  },
};

/** Status override colors */
const STATUS_COLORS: Record<NodeStatus, string> = {
  completed: '#22c55e',   // green-500
  running: '#8b5cf6',     // violet-500
  waiting: '#f59e0b',     // amber-500
  pending: '#d1d5db',     // gray-300
  failed: '#ef4444',      // red-500
  skipped: '#d1d5db',     // gray-300
};

/**
 * Renders a single node in the SVG flow graph.
 * Colors are determined by node type, with optional status overrides.
 */
export function FlowNodeComponent({ node, status, selected, compact, config, onClick }: FlowNodeProps) {
  const { nodeWidth, nodeHeight, colSpacing, rowSpacing } = config;
  const cx = node.x * colSpacing;
  const cy = node.y * rowSpacing;
  const x = cx - nodeWidth / 2;
  const y = cy - nodeHeight / 2;

  const colors = NODE_COLORS[node.type];
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  // Determine fill and stroke
  let fillColor = isDark ? colors.darkFill : colors.fill;
  let strokeColor = isDark ? colors.darkStroke : colors.stroke;

  // Status overrides fill
  if (status) {
    fillColor = status === 'pending' || status === 'skipped'
      ? (isDark ? 'rgba(107, 114, 128, 0.15)' : 'rgba(209, 213, 219, 0.4)')
      : `${STATUS_COLORS[status]}20`;
    strokeColor = STATUS_COLORS[status];
  }

  const isGate = node.type === 'gate';
  const isPending = status === 'pending';
  const isSkipped = status === 'skipped';
  const isRunning = status === 'running';

  const handleClick = () => {
    onClick?.(node.id);
  };

  // Font sizes
  const titleSize = compact ? 9 : 11;
  const descSize = 10;

  return (
    <g
      className={cn(
        'cursor-pointer transition-opacity',
        isPending && 'opacity-40',
        isSkipped && 'opacity-40',
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      aria-label={`${node.type} node: ${node.title}`}
    >
      {/* Selection highlight ring */}
      {selected && (
        <rect
          x={x - 3}
          y={y - 3}
          width={nodeWidth + 6}
          height={nodeHeight + 6}
          rx={9}
          ry={9}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeOpacity={0.4}
        />
      )}

      {/* Node rectangle */}
      <rect
        x={x}
        y={y}
        width={nodeWidth}
        height={nodeHeight}
        rx={6}
        ry={6}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeDasharray={isGate ? '6 3' : undefined}
      />

      {/* Running pulse animation */}
      {isRunning && (
        <rect
          x={x}
          y={y}
          width={nodeWidth}
          height={nodeHeight}
          rx={6}
          ry={6}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          className="animate-wf-pulse"
        />
      )}

      {/* Title text */}
      <text
        x={cx}
        y={compact ? cy + 1 : cy - (nodeHeight > 40 ? 6 : 0)}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'IBM Plex Mono', monospace"
        fontSize={titleSize}
        fontWeight={600}
        fill="currentColor"
        className={cn(
          'fill-foreground',
          isSkipped && 'line-through',
        )}
      >
        {node.title.length > (compact ? 12 : 18)
          ? node.title.slice(0, compact ? 11 : 17) + '…'
          : node.title}
      </text>

      {/* Description text (full mode only) */}
      {!compact && (
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="'DM Sans', sans-serif"
          fontSize={descSize}
          className="fill-muted-foreground"
        >
          {node.description.length > 24
            ? node.description.slice(0, 23) + '…'
            : node.description}
        </text>
      )}
    </g>
  );
}
