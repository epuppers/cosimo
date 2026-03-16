import { useMemo } from 'react';
import type { GraphData } from '~/services/types';

// ============================================
// Graph Layout Engine — computes node positions
// for root, cluster, and entity states
// ============================================

export interface NodeRenderState {
  id: string;
  nodeType: 'you' | 'category' | 'entity';
  category: string | null;
  label: string;
  sub: string;
  innerText?: string;
  x: number;
  y: number;
  radius: number;
  opacity: number;
  delay: number;
  showLabel: boolean;
  showSubLabel: boolean;
  pointerEvents: boolean;
  isSelected: boolean;
}

export interface EdgeRenderState {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  opacity: number;
}

export interface TetherState {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  opacity: number;
}

interface GraphLayout {
  nodes: Map<string, NodeRenderState>;
  edges: EdgeRenderState[];
  tether: TetherState | null;
}

/** Category color hex values for edges and tether */
const CATEGORY_CORE_HEX: Record<string, string> = {
  funds: '#9b6bc2',
  contacts: '#c278c4',
  documents: '#7bb8d9',
  workflows: '#6abf6e',
  systems: '#d4a646',
  entities: '#9e9ca3',
  you: '#b478d8',
};

/** Glow colors for tether line */
const CATEGORY_GLOW: Record<string, string> = {
  funds: 'rgba(155,107,194,0.6)',
  contacts: 'rgba(194,120,196,0.6)',
  documents: 'rgba(123,184,217,0.6)',
  workflows: 'rgba(106,191,110,0.6)',
  systems: 'rgba(212,166,70,0.6)',
  entities: 'rgba(158,156,163,0.4)',
};

/** Compute abbreviation from a label (first letter of each word, max 3 chars) */
function abbrev(label: string): string {
  return label
    .split(' ')
    .map((w) => w[0])
    .join('')
    .substring(0, 3);
}

/** Find which category an entity belongs to */
function findEntityCategory(graphData: GraphData, entityId: string): string | null {
  for (const cat of Object.keys(graphData.nodes)) {
    if (graphData.nodes[cat].some((n) => n.id === entityId)) return cat;
  }
  return null;
}

/**
 * Computes layout positions for all graph nodes based on the current navigation state.
 * Returns node positions, edge data, and tether state for the graph renderer.
 */
export function useGraphLayout(
  graphData: GraphData,
  level: 'root' | 'cluster' | 'entity',
  activeCategory: string | null,
  selectedEntity: string | null,
  dimensions: { w: number; h: number }
): GraphLayout {
  return useMemo(() => {
    const { w, h } = dimensions;
    const cx = w / 2;
    const cy = h / 2;
    const cats = graphData.categories;
    const nodes = new Map<string, NodeRenderState>();
    const edges: EdgeRenderState[] = [];
    let tether: TetherState | null = null;

    // Pre-compute category orbital positions (root state)
    const rootRadius = Math.min(cx, cy) * 0.52;
    const catPositions: Record<string, { x: number; y: number; r: number }> = {};

    cats.forEach((cat, i) => {
      const angle = (i / cats.length) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * rootRadius;
      const y = cy + Math.sin(angle) * rootRadius;
      const r = 20 + Math.min(cat.count, 20) * 0.6;
      catPositions[cat.id] = { x, y, r };
    });

    // Pre-compute entity target positions (cluster state — orbital rings from center)
    const minDim = Math.min(cx, cy);
    const maxPerRing = 7;
    const baseChildR = minDim * 0.45;
    const ringSpacing = minDim * 0.22;

    const entityTargets: Record<string, { x: number; y: number; r: number }> = {};
    for (const cat of cats) {
      const catNodes = graphData.nodes[cat.id] || [];
      catNodes.forEach((node, j) => {
        const ringIdx = Math.floor(j / maxPerRing);
        const posInRing = j - ringIdx * maxPerRing;
        const nodesInThisRing = Math.min(maxPerRing, catNodes.length - ringIdx * maxPerRing);
        const childRadius = baseChildR + ringIdx * ringSpacing;
        const cAngle =
          (posInRing / nodesInThisRing) * Math.PI * 2 - Math.PI / 2 + ringIdx * 0.35;
        const x = cx + Math.cos(cAngle) * childRadius;
        const y = cy + Math.sin(cAngle) * childRadius;
        const r = ringIdx === 0 ? 16 : 13;
        entityTargets[node.id] = { x, y, r };
      });
    }

    // Periphery positions for inactive categories in cluster state
    const edgeR = Math.min(cx, cy) * 0.85;

    if (level === 'root') {
      // ---- ROOT STATE ----

      // YOU node at center
      nodes.set('you', {
        id: 'you',
        nodeType: 'you',
        category: null,
        label: 'YOU',
        sub: '',
        innerText: 'YOU',
        x: cx,
        y: cy,
        radius: 28,
        opacity: 1,
        delay: 0,
        showLabel: false,
        showSubLabel: false,
        pointerEvents: true,
        isSelected: false,
      });

      // Category nodes in orbit
      cats.forEach((cat, i) => {
        const pos = catPositions[cat.id];
        nodes.set(cat.id, {
          id: cat.id,
          nodeType: 'category',
          category: cat.id,
          label: cat.label,
          sub: cat.count + ' items',
          innerText: String(cat.count),
          x: pos.x,
          y: pos.y,
          radius: pos.r,
          opacity: 1,
          delay: i * 40,
          showLabel: true,
          showSubLabel: true,
          pointerEvents: true,
          isSelected: false,
        });
      });

      // Entity nodes collapsed to parent position
      for (const cat of cats) {
        const catNodes = graphData.nodes[cat.id] || [];
        const parentPos = catPositions[cat.id];
        for (const node of catNodes) {
          nodes.set(node.id, {
            id: node.id,
            nodeType: 'entity',
            category: cat.id,
            label: node.label,
            sub: node.sub,
            innerText: abbrev(node.label),
            x: parentPos.x,
            y: parentPos.y,
            radius: 0,
            opacity: 0,
            delay: 0,
            showLabel: false,
            showSubLabel: false,
            pointerEvents: false,
            isSelected: false,
          });
        }
      }

      // Root edges: center to each category
      cats.forEach((cat) => {
        const pos = catPositions[cat.id];
        edges.push({
          key: `root-${cat.id}`,
          x1: cx,
          y1: cy,
          x2: pos.x,
          y2: pos.y,
          color: CATEGORY_CORE_HEX[cat.id] ?? '#666',
          opacity: 0.2,
        });
      });

      // Cross-category edges
      const crossLinks = [
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 2],
        [1, 3],
        [2, 4],
        [2, 5],
        [3, 4],
        [0, 5],
        [1, 5],
      ];
      crossLinks.forEach(([a, b], i) => {
        if (a < cats.length && b < cats.length) {
          const posA = catPositions[cats[a].id];
          const posB = catPositions[cats[b].id];
          edges.push({
            key: `cross-${i}`,
            x1: posA.x,
            y1: posA.y,
            x2: posB.x,
            y2: posB.y,
            color: 'rgba(255,255,255,0.06)',
            opacity: 0.06,
          });
        }
      });
    } else {
      // ---- CLUSTER / ENTITY STATE ----
      const catId = activeCategory!;

      // YOU node — top-left corner
      nodes.set('you', {
        id: 'you',
        nodeType: 'you',
        category: null,
        label: 'YOU',
        sub: '',
        innerText: 'YOU',
        x: 50,
        y: 50,
        radius: 18,
        opacity: 0.85,
        delay: 0,
        showLabel: true,
        showSubLabel: false,
        pointerEvents: true,
        isSelected: false,
      });

      // Active category at center
      const activeCat = cats.find((c) => c.id === catId);
      if (activeCat) {
        nodes.set(catId, {
          id: catId,
          nodeType: 'category',
          category: catId,
          label: activeCat.label,
          sub: activeCat.count + ' items',
          innerText: String(activeCat.count),
          x: cx,
          y: cy,
          radius: 24,
          opacity: 1,
          delay: 0,
          showLabel: true,
          showSubLabel: false,
          pointerEvents: true,
          isSelected: false,
        });
      }

      // Other categories pushed to periphery
      const otherCats = cats.filter((c) => c.id !== catId);
      otherCats.forEach((cat, i) => {
        const angle = (i / otherCats.length) * Math.PI * 2 - Math.PI * 0.3;
        const ex = cx + Math.cos(angle) * edgeR;
        const ey = cy + Math.sin(angle) * edgeR;
        nodes.set(cat.id, {
          id: cat.id,
          nodeType: 'category',
          category: cat.id,
          label: cat.label,
          sub: cat.count + ' items',
          innerText: String(cat.count),
          x: ex,
          y: ey,
          radius: 8,
          opacity: 0.35,
          delay: 0,
          showLabel: false,
          showSubLabel: false,
          pointerEvents: true,
          isSelected: false,
        });
      });

      // Active category's entity nodes — expanded in orbital rings
      const activeNodes = graphData.nodes[catId] || [];
      activeNodes.forEach((node, i) => {
        const target = entityTargets[node.id];
        if (!target) return;
        nodes.set(node.id, {
          id: node.id,
          nodeType: 'entity',
          category: catId,
          label: node.label,
          sub: node.sub,
          innerText: abbrev(node.label),
          x: target.x,
          y: target.y,
          radius: target.r,
          opacity: 1,
          delay: 80 + i * 35,
          showLabel: true,
          showSubLabel: target.r >= 18,
          pointerEvents: true,
          isSelected: level === 'entity' && selectedEntity === node.id,
        });
      });

      // Other category entity nodes — collapsed to parent
      for (const cat of otherCats) {
        const otherNodes = graphData.nodes[cat.id] || [];
        const parentNode = nodes.get(cat.id);
        const px = parentNode?.x ?? cx;
        const py = parentNode?.y ?? cy;
        for (const node of otherNodes) {
          nodes.set(node.id, {
            id: node.id,
            nodeType: 'entity',
            category: cat.id,
            label: node.label,
            sub: node.sub,
            innerText: abbrev(node.label),
            x: px,
            y: py,
            radius: 0,
            opacity: 0,
            delay: 0,
            showLabel: false,
            showSubLabel: false,
            pointerEvents: false,
            isSelected: false,
          });
        }
      }

      // Child edges: center to active entity nodes
      activeNodes.forEach((node) => {
        const target = entityTargets[node.id];
        if (!target) return;
        edges.push({
          key: `child-${node.id}`,
          x1: cx,
          y1: cy,
          x2: target.x,
          y2: target.y,
          color: CATEGORY_CORE_HEX[catId] ?? '#666',
          opacity: 0.2,
        });
      });

      // Inter-entity edges within active category
      const catChildIds = new Set(activeNodes.map((n) => n.id));
      const seenInterEdges = new Set<string>();
      for (const node of activeNodes) {
        for (const relId of node.related) {
          if (!catChildIds.has(relId)) continue;
          if (node.id >= relId) continue;
          const key = `inter-${node.id}-${relId}`;
          if (seenInterEdges.has(key)) continue;
          seenInterEdges.add(key);
          const fromTarget = entityTargets[node.id];
          const toTarget = entityTargets[relId];
          if (!fromTarget || !toTarget) continue;
          edges.push({
            key,
            x1: fromTarget.x,
            y1: fromTarget.y,
            x2: toTarget.x,
            y2: toTarget.y,
            color: CATEGORY_CORE_HEX[catId] ?? '#666',
            opacity: 0.15,
          });
        }
      }

      // Root edge to active category (dimmer)
      edges.push({
        key: `root-active-${catId}`,
        x1: cx,
        y1: cy,
        x2: cx,
        y2: cy,
        color: CATEGORY_CORE_HEX[catId] ?? '#666',
        opacity: 0.15,
      });

      // Tether from YOU to center
      tether = {
        x1: 50,
        y1: 50,
        x2: cx,
        y2: cy,
        color: CATEGORY_GLOW[catId] ?? 'rgba(180,120,216,0.6)',
        opacity: 1,
      };
    }

    return { nodes, edges, tether };
  }, [graphData, level, activeCategory, selectedEntity, dimensions]);
}
