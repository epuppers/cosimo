import { useState, useMemo, useCallback, useRef } from 'react';
import type { GraphData, GraphNode } from '~/services/types';
import { cn } from '~/lib/utils';

// ============================================
// Entity Graph — SVG knowledge graph visualization
// ============================================

interface EntityGraphProps {
  graphData: GraphData;
  selectedEntityId?: string | null;
  onSelectEntity: (id: string) => void;
}

/** Category color tokens — uses CSS custom properties via var() */
const CATEGORY_COLORS: Record<string, { core: string; mid: string; dim: string; cssVar: string }> = {
  funds:     { core: 'var(--violet-3)', mid: 'var(--violet-4)', dim: 'var(--violet-4)',  cssVar: '--violet-3' },
  contacts:  { core: 'var(--berry-3)',  mid: 'var(--berry-4)',  dim: 'var(--berry-4)',   cssVar: '--berry-3' },
  documents: { core: 'var(--blue-3)',   mid: 'var(--blue-2)',   dim: 'var(--blue-2)',    cssVar: '--blue-3' },
  workflows: { core: 'var(--green)',    mid: 'var(--green-lo)', dim: 'var(--green-lo)',  cssVar: '--green' },
  systems:   { core: 'var(--amber)',    mid: 'var(--amber)',    dim: 'var(--amber)',     cssVar: '--amber' },
  entities:  { core: 'var(--taupe-3)',  mid: 'var(--taupe-4)',  dim: 'var(--taupe-4)',   cssVar: '--taupe-3' },
};

/** RGB triplets for gradient stops — needed for SVG radialGradient which can't use var() directly */
const CATEGORY_RGB: Record<string, { core: string; mid: string; dim: string }> = {
  funds:     { core: '#9b6bc2', mid: '#74418F', dim: '#4D2B5F' },
  contacts:  { core: '#c278c4', mid: '#8B4F8D', dim: '#5D355E' },
  documents: { core: '#7bb8d9', mid: '#5a9fc2', dim: '#3a7a9e' },
  workflows: { core: '#6abf6e', mid: '#3D8B40', dim: '#2a6b2c' },
  systems:   { core: '#d4a646', mid: '#B8862B', dim: '#8a6518' },
  entities:  { core: '#9e9ca3', mid: '#6a6870', dim: '#4a484f' },
};

interface PositionedNode {
  node: GraphNode;
  category: string;
  x: number;
  y: number;
  radius: number;
}

/** Computes static layout positions for all nodes arranged in category clusters around center. */
function computeLayout(graphData: GraphData): PositionedNode[] {
  const categories = Object.keys(graphData.nodes);
  const centerX = 500;
  const centerY = 400;
  const clusterRadius = 280;
  const result: PositionedNode[] = [];

  categories.forEach((cat, catIndex) => {
    const angle = (catIndex / categories.length) * Math.PI * 2 - Math.PI / 2;
    const clusterCX = centerX + Math.cos(angle) * clusterRadius;
    const clusterCY = centerY + Math.sin(angle) * clusterRadius;
    const nodes = graphData.nodes[cat];
    const itemRadius = Math.min(120, 40 + nodes.length * 8);

    nodes.forEach((node, nodeIndex) => {
      const nodeAngle = (nodeIndex / nodes.length) * Math.PI * 2 - Math.PI / 2;
      const spreadRadius = nodes.length === 1 ? 0 : itemRadius;
      const x = clusterCX + Math.cos(nodeAngle) * spreadRadius;
      const y = clusterCY + Math.sin(nodeAngle) * spreadRadius;
      const radius = 18;

      result.push({ node, category: cat, x, y, radius });
    });
  });

  return result;
}

/** SVG knowledge graph with static layout, zoom/pan, and click-to-select. */
export function EntityGraph({ graphData, selectedEntityId, onSelectEntity }: EntityGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1000, h: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vbX: 0, vbY: 0 });

  const positionedNodes = useMemo(() => computeLayout(graphData), [graphData]);

  // Build a lookup map for positioned nodes by id
  const nodeMap = useMemo(() => {
    const map = new Map<string, PositionedNode>();
    for (const pn of positionedNodes) {
      map.set(pn.node.id, pn);
    }
    return map;
  }, [positionedNodes]);

  // Compute edges from related links (deduplicated)
  const edges = useMemo(() => {
    const seen = new Set<string>();
    const result: { from: PositionedNode; to: PositionedNode; category: string }[] = [];

    for (const pn of positionedNodes) {
      for (const relId of pn.node.related) {
        const target = nodeMap.get(relId);
        if (!target) continue;
        const key = [pn.node.id, relId].sort().join('::');
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ from: pn, to: target, category: pn.category });
      }
    }
    return result;
  }, [positionedNodes, nodeMap]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    setViewBox((prev) => {
      const newW = prev.w * zoomFactor;
      const newH = prev.h * zoomFactor;
      const dx = (prev.w - newW) / 2;
      const dy = (prev.h - newH) / 2;
      return {
        x: prev.x + dx,
        y: prev.y + dy,
        w: Math.max(200, Math.min(3000, newW)),
        h: Math.max(160, Math.min(2400, newH)),
      };
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX, y: e.clientY, vbX: viewBox.x, vbY: viewBox.y };
  }, [viewBox.x, viewBox.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = viewBox.w / rect.width;
    const scaleY = viewBox.h / rect.height;
    const dx = (e.clientX - panStart.current.x) * scaleX;
    const dy = (e.clientY - panStart.current.y) * scaleY;
    setViewBox((prev) => ({
      ...prev,
      x: panStart.current.vbX - dx,
      y: panStart.current.vbY - dy,
    }));
  }, [isPanning, viewBox.w, viewBox.h]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleNodeClick = useCallback((nodeId: string) => {
    onSelectEntity(nodeId);
  }, [onSelectEntity]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const factor = direction === 'in' ? 0.8 : 1.25;
    setViewBox((prev) => {
      const newW = prev.w * factor;
      const newH = prev.h * factor;
      const dx = (prev.w - newW) / 2;
      const dy = (prev.h - newH) / 2;
      return {
        x: prev.x + dx,
        y: prev.y + dy,
        w: Math.max(200, Math.min(3000, newW)),
        h: Math.max(160, Math.min(2400, newH)),
      };
    });
  }, []);

  return (
    <div className="graph-container relative h-full w-full overflow-hidden">
      {/* Category legend */}
      <div className="graph-legend">
        {graphData.categories.map((cat) => {
          const rgb = CATEGORY_RGB[cat.id];
          return (
            <div key={cat.id} className="graph-legend-item">
              <span
                className="graph-legend-dot"
                style={{ backgroundColor: CATEGORY_COLORS[cat.id]?.core ?? 'var(--taupe-3)' }}
              />
              <span className="graph-legend-label">{cat.label}</span>
              <span className="graph-legend-count">{cat.count}</span>
            </div>
          );
        })}
      </div>

      {/* Zoom controls */}
      <div className="graph-zoom-controls">
        <button
          type="button"
          className="graph-zoom-btn"
          onClick={() => handleZoom('in')}
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="graph-zoom-btn"
          onClick={() => handleZoom('out')}
          aria-label="Zoom out"
        >
          −
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`}
        className={cn('graph-svg', isPanning ? 'cursor-grabbing' : 'cursor-grab')}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          {Object.entries(CATEGORY_RGB).map(([id, colors]) => (
            <radialGradient
              key={id}
              id={`grad-${id}`}
              cx="38%"
              cy="32%"
              r="60%"
              fx="35%"
              fy="28%"
            >
              <stop offset="0%" stopColor="#fff" stopOpacity={0.25} />
              <stop offset="25%" stopColor={colors.core} stopOpacity={1} />
              <stop offset="75%" stopColor={colors.mid} stopOpacity={1} />
              <stop offset="100%" stopColor={colors.dim} stopOpacity={1} />
            </radialGradient>
          ))}
        </defs>

        {/* Edges */}
        <g className="opacity-20 dark:opacity-15">
          {edges.map((edge, i) => {
            const rgb = CATEGORY_RGB[edge.category];
            return (
              <line
                key={i}
                x1={edge.from.x}
                y1={edge.from.y}
                x2={edge.to.x}
                y2={edge.to.y}
                style={{ stroke: CATEGORY_COLORS[edge.category]?.core ?? 'var(--taupe-3)' }}
                strokeWidth={0.8}
              />
            );
          })}
        </g>

        {/* Nodes */}
        {positionedNodes.map((pn) => {
          const isSelected = selectedEntityId === pn.node.id;
          const rgb = CATEGORY_RGB[pn.category];
          const selectedNode = selectedEntityId ? nodeMap.get(selectedEntityId) : null;
          const isRelatedToSelected = selectedNode?.node.related.includes(pn.node.id);
          const dimmed = selectedEntityId && !isSelected && !isRelatedToSelected;

          return (
            <g
              key={pn.node.id}
              transform={`translate(${pn.x}, ${pn.y})`}
              onClick={() => handleNodeClick(pn.node.id)}
              className="cursor-pointer"
              style={{ opacity: dimmed ? 0.25 : 1, transition: 'opacity 0.3s ease' }}
            >
              {/* Glow ring for selected */}
              {isSelected && (
                <circle
                  r={pn.radius + 6}
                  fill="none"
                  style={{ stroke: CATEGORY_COLORS[pn.category]?.core ?? 'var(--taupe-3)' }}
                  strokeWidth={2}
                  opacity={0.5}
                />
              )}
              {/* Main circle */}
              <circle
                r={isSelected ? pn.radius + 2 : pn.radius}
                fill={`url(#grad-${pn.category})`}
                style={{
                  stroke: isSelected ? 'rgba(var(--white-pure-rgb), 0.5)' : 'rgba(var(--white-pure-rgb), 0.12)',
                  transition: 'r 0.2s ease',
                }}
                strokeWidth={isSelected ? 2 : 1}
              />
              {/* Label */}
              <text
                y={pn.radius + 14}
                textAnchor="middle"
                className="text-[9px] font-semibold"
                style={{ fontFamily: 'var(--mono)', fill: 'rgba(var(--white-pure-rgb), 0.85)' }}
              >
                {pn.node.label}
              </text>
              {/* Sub label */}
              <text
                y={pn.radius + 24}
                textAnchor="middle"
                className="text-[7px]"
                style={{ fontFamily: 'var(--sans)', fill: 'rgba(var(--white-pure-rgb), 0.5)' }}
              >
                {pn.node.sub}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
