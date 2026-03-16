import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { GraphData } from '~/services/types';
import { cn } from '~/lib/utils';
import { useBrainStore } from '~/stores/brain-store';
import { useGraphLayout } from '~/hooks/use-graph-layout';
import { GraphBreadcrumb } from './graph-breadcrumb';
import { GraphTooltip } from './graph-tooltip';
import type { TooltipHandle } from './graph-tooltip';
import type { NodeRenderState } from '~/hooks/use-graph-layout';

// ============================================
// Entity Graph — SVG knowledge graph with
// drill-down navigation (root → cluster → entity)
// ============================================

interface EntityGraphProps {
  graphData: GraphData;
}

/** Category RGB hex values for SVG radialGradient (can't use CSS vars in SVG) */
const CATEGORY_RGB: Record<string, { core: string; mid: string; dim: string }> = {
  funds: { core: '#9b6bc2', mid: '#74418F', dim: '#4D2B5F' },
  contacts: { core: '#c278c4', mid: '#8B4F8D', dim: '#5D355E' },
  documents: { core: '#7bb8d9', mid: '#5a9fc2', dim: '#3a7a9e' },
  workflows: { core: '#6abf6e', mid: '#3D8B40', dim: '#2a6b2c' },
  systems: { core: '#d4a646', mid: '#B8862B', dim: '#8a6518' },
  entities: { core: '#9e9ca3', mid: '#6a6870', dim: '#4a484f' },
  you: { core: '#b478d8', mid: '#8855a8', dim: '#5a3070' },
};

/** Category CSS color vars for legend display */
const CATEGORY_COLORS: Record<string, string> = {
  funds: 'var(--violet-3)',
  contacts: 'var(--berry-3)',
  documents: 'var(--blue-3)',
  workflows: 'var(--green)',
  systems: 'var(--amber)',
  entities: 'var(--taupe-3)',
};

/** Animation constants matching prototype */
const ANIM_DURATION = 500;
const ANIM_EASING = 'cubic-bezier(0.34, 1, 0.64, 1)';

/** Check if reduced motion is active */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const check = () => {
      setReduced(document.documentElement.dataset.a11yMotion === 'reduce');
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-a11y-motion'],
    });
    return () => observer.disconnect();
  }, []);
  return reduced;
}

/** SVG knowledge graph with root/cluster/entity drill-down navigation. */
export function EntityGraph({ graphData }: EntityGraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<TooltipHandle>(null);
  const reducedMotion = useReducedMotion();

  const {
    graphLevel,
    graphActiveCategory,
    graphSelectedEntity,
    navigateGraph,
    openGraphEntity,
  } = useBrainStore();

  // Track container dimensions
  const [dimensions, setDimensions] = useState({ w: 1000, h: 800 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const { width, height } = entry.contentRect;
        if (width > 10 && height > 10) {
          setDimensions({ w: width, h: height });
        }
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // ViewBox for zoom/pan within current state
  const [viewBox, setViewBox] = useState({ x: 0, y: 0, w: 1000, h: 800 });

  // Reset viewBox when dimensions change or navigation changes
  useEffect(() => {
    setViewBox({ x: 0, y: 0, w: dimensions.w, h: dimensions.h });
  }, [dimensions.w, dimensions.h, graphLevel, graphActiveCategory]);

  // Panning state
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, vbX: 0, vbY: 0 });

  // Compute layout
  const layout = useGraphLayout(
    graphData,
    graphLevel,
    graphActiveCategory,
    graphSelectedEntity,
    dimensions
  );

  const anim = reducedMotion ? 0 : ANIM_DURATION;

  // Node click handler
  const handleNodeClick = useCallback(
    (e: React.MouseEvent, node: NodeRenderState) => {
      e.stopPropagation();
      if (node.nodeType === 'you') {
        navigateGraph('root');
      } else if (node.nodeType === 'category') {
        if (graphLevel === 'root') {
          navigateGraph(node.id);
        } else if (graphLevel === 'cluster' || graphLevel === 'entity') {
          // Click the active category does nothing; click another navigates to it
          if (node.id !== graphActiveCategory) {
            navigateGraph(node.id);
          }
        }
      } else if (node.nodeType === 'entity' && node.category) {
        openGraphEntity(node.id, node.category);
      }
    },
    [navigateGraph, openGraphEntity, graphLevel, graphActiveCategory]
  );

  // Background click — back to root from cluster
  const handleBgClick = useCallback(() => {
    if (graphLevel === 'cluster' || graphLevel === 'entity') {
      navigateGraph('root');
    }
  }, [graphLevel, navigateGraph]);

  // Zoom
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

  // Pan
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      // Don't start pan if clicking on a node
      const target = e.target as SVGElement;
      if (target.closest('[data-graph-node]')) return;
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, vbX: viewBox.x, vbY: viewBox.y };
    },
    [viewBox.x, viewBox.y]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [isPanning, viewBox.w, viewBox.h]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

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

  // Legend click — navigate to category
  const handleLegendClick = useCallback(
    (catId: string) => {
      navigateGraph(catId);
    },
    [navigateGraph]
  );

  // Tooltip handlers
  const handleNodeHover = useCallback(
    (node: NodeRenderState) => {
      const text = node.sub ? `${node.label} · ${node.sub}` : node.label;
      tooltipRef.current?.show(text, node.x, node.y - node.radius);
    },
    []
  );

  const handleNodeLeave = useCallback(() => {
    tooltipRef.current?.hide();
  }, []);

  // Convert layout nodes to sorted array for render order (you last so it's on top)
  const sortedNodes = useMemo(() => {
    const arr = Array.from(layout.nodes.values());
    // Render order: entities first, then categories, then YOU (last = on top)
    const order = { entity: 0, category: 1, you: 2 };
    arr.sort((a, b) => (order[a.nodeType] ?? 0) - (order[b.nodeType] ?? 0));
    return arr;
  }, [layout.nodes]);

  return (
    <div ref={containerRef} className="graph-container relative h-full w-full overflow-hidden">
      {/* Breadcrumb */}
      <GraphBreadcrumb graphData={graphData} />

      {/* Tooltip */}
      <GraphTooltip ref={tooltipRef} svgRef={svgRef} viewBox={viewBox} />

      {/* Category legend */}
      <div className="graph-legend">
        {graphData.categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className="graph-legend-item"
            onClick={() => handleLegendClick(cat.id)}
            style={{ cursor: 'pointer' }}
          >
            <span
              className="graph-legend-dot"
              style={{ backgroundColor: CATEGORY_COLORS[cat.id] ?? 'var(--taupe-3)' }}
            />
            <span className="graph-legend-label">{cat.label}</span>
            <span className="graph-legend-count">{cat.count}</span>
          </button>
        ))}
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
          {/* Radial gradients for each category + YOU */}
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

          {/* Glow filters */}
          {Object.entries(CATEGORY_RGB).map(([id, colors]) => (
            <filter key={`glow-${id}`} id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feFlood floodColor={colors.core} floodOpacity="0.3" result="color" />
              <feComposite in="color" in2="blur" operator="in" />
            </filter>
          ))}
        </defs>

        {/* Background click target */}
        <rect
          width={dimensions.w}
          height={dimensions.h}
          fill="transparent"
          onClick={handleBgClick}
          style={{ cursor: graphLevel !== 'root' ? 'pointer' : 'default' }}
        />

        {/* Tether line (YOU → active category in cluster view) */}
        {layout.tether && (
          <line
            x1={layout.tether.x1}
            y1={layout.tether.y1}
            x2={layout.tether.x2}
            y2={layout.tether.y2}
            stroke={layout.tether.color}
            strokeWidth={1.5}
            strokeDasharray="6 4"
            style={{
              opacity: layout.tether.opacity,
              transition: `opacity ${anim}ms ease`,
            }}
          />
        )}

        {/* Edges */}
        <g>
          {layout.edges.map((edge) => {
            // Quadratic Bézier with slight curve (matching prototype)
            const mx = (edge.x1 + edge.x2) / 2;
            const my = (edge.y1 + edge.y2) / 2;
            const dx = edge.x2 - edge.x1;
            const dy = edge.y2 - edge.y1;
            const nx = -dy * 0.08;
            const ny = dx * 0.08;
            const d = `M${edge.x1},${edge.y1} Q${mx + nx},${my + ny} ${edge.x2},${edge.y2}`;

            return (
              <path
                key={edge.key}
                d={d}
                fill="none"
                stroke={edge.color}
                strokeWidth={1}
                style={{
                  opacity: edge.opacity,
                  transition: `opacity ${anim}ms ease`,
                }}
              />
            );
          })}
        </g>

        {/* Nodes */}
        {sortedNodes.map((node) => (
          <GraphNode
            key={node.id}
            node={node}
            anim={anim}
            onClick={handleNodeClick}
            onHover={handleNodeHover}
            onLeave={handleNodeLeave}
            isClusterYou={graphLevel !== 'root' && node.id === 'you'}
          />
        ))}
      </svg>
    </div>
  );
}

// ============================================
// GraphNode — individual SVG node group
// ============================================

interface GraphNodeProps {
  node: NodeRenderState;
  anim: number;
  onClick: (e: React.MouseEvent, node: NodeRenderState) => void;
  onHover: (node: NodeRenderState) => void;
  onLeave: () => void;
  isClusterYou: boolean;
}

function GraphNode({ node, anim, onClick, onHover, onLeave, isClusterYou }: GraphNodeProps) {
  const colorId = node.nodeType === 'you' ? 'you' : node.category ?? 'entities';
  const transitionProp = anim > 0
    ? `transform ${anim}ms ${ANIM_EASING} ${node.delay}ms, opacity ${anim}ms ease ${node.delay}ms`
    : 'none';
  const circleTransition = anim > 0 ? `r ${anim}ms ${ANIM_EASING} ${node.delay}ms` : 'none';
  const innerFontSize = node.nodeType === 'you' ? 11 : Math.max(8, node.radius * 0.45);

  return (
    <g
      data-graph-node={node.id}
      style={{
        cursor: node.pointerEvents ? 'pointer' : 'default',
        pointerEvents: node.pointerEvents ? 'auto' : 'none',
        opacity: node.opacity,
        transition: transitionProp,
      }}
      onClick={(e) => onClick(e, node)}
      onMouseEnter={() => node.pointerEvents && onHover(node)}
      onMouseLeave={onLeave}
    >
      {/* Position wrapper — animated transform */}
      <g
        style={{
          transform: `translate(${node.x}px, ${node.y}px)`,
          transition: anim > 0 ? `transform ${anim}ms ${ANIM_EASING} ${node.delay}ms` : 'none',
        }}
      >
        {/* Glow circle */}
        <circle
          cx={0}
          cy={0}
          fill={`url(#grad-${colorId})`}
          filter={`url(#glow-${colorId})`}
          style={{ r: node.radius, transition: circleTransition }}
        />

        {/* Body circle */}
        <circle
          cx={0}
          cy={0}
          fill={`url(#grad-${colorId})`}
          style={{ r: node.radius, transition: circleTransition }}
        />

        {/* Edge highlight circle */}
        <circle
          cx={0}
          cy={0}
          fill="none"
          stroke={node.isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.12)'}
          strokeWidth={node.isSelected ? 2 : 1}
          style={{ r: node.radius, transition: circleTransition }}
        />

        {/* Selection glow ring */}
        {node.isSelected && (
          <circle
            cx={0}
            cy={0}
            fill="none"
            stroke={CATEGORY_RGB[colorId]?.core ?? '#666'}
            strokeWidth={2}
            opacity={0.5}
            style={{ r: node.radius + 6, transition: circleTransition }}
          />
        )}

        {/* Inner text (count for categories, abbreviation for entities, YOU for you) */}
        {node.innerText && node.radius > 5 && (
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(255,255,255,0.85)"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: innerFontSize,
              fontWeight: 700,
              pointerEvents: 'none',
            }}
          >
            {node.innerText}
          </text>
        )}

        {/* Label below */}
        {node.showLabel && (
          <text
            x={0}
            y={node.radius + 14}
            textAnchor="middle"
            fill="rgba(255,255,255,0.7)"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              pointerEvents: 'none',
              opacity: node.radius < 10 ? 0 : 1,
              transition: `opacity ${anim}ms ease`,
            }}
          >
            {node.label}
          </text>
        )}

        {/* Sub label */}
        {node.showSubLabel && (
          <text
            x={0}
            y={node.radius + 25}
            textAnchor="middle"
            fill="rgba(255,255,255,0.3)"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 9,
              pointerEvents: 'none',
              opacity: node.radius < 18 ? 0 : 1,
              transition: `opacity ${anim}ms ease`,
            }}
          >
            {node.sub}
          </text>
        )}
      </g>

      {/* Pulse class for YOU in cluster mode */}
      {isClusterYou && (
        <circle
          cx={0}
          cy={0}
          fill="none"
          className="graph-you-pulse"
          stroke="rgba(180,120,216,0.4)"
          strokeWidth={1}
          style={{
            transform: `translate(${node.x}px, ${node.y}px)`,
            r: node.radius + 8,
            transition: anim > 0 ? `transform ${anim}ms ${ANIM_EASING}, r ${anim}ms ${ANIM_EASING}` : 'none',
          }}
        />
      )}
    </g>
  );
}
