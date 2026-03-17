// ============================================
// Brain Graph Route — entity knowledge graph
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouteError } from 'react-router';
import { ErrorBoundaryContent } from '~/components/ui/error-boundary-content';
import { getGraphData } from '~/services/brain';
import { EntityGraph } from '~/components/brain/entity-graph';
import { EntityDetail } from '~/components/brain/entity-detail';
import { useBrainStore } from '~/stores/brain-store';
import type { GraphNode } from '~/services/types';
import type { Route } from './+types/_app.brain.graph';

/** Loads graph data for the entity graph visualization. */
export async function clientLoader() {
  const graphData = await getGraphData();
  return { graphData };
}

/** Brain Graph route — renders entity graph SVG with optional detail panel. */
export default function BrainGraphRoute({ loaderData }: Route.ComponentProps) {
  const { graphData } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    graphLevel,
    graphActiveCategory,
    graphSelectedEntity,
    navigateGraph,
    openGraphEntity,
    closeGraphEntity,
  } = useBrainStore();

  // Sync URL params → store on mount
  useEffect(() => {
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const entity = searchParams.get('entity');

    if (entity && category) {
      openGraphEntity(entity, category);
    } else if (category) {
      navigateGraph(category);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync store → URL params
  useEffect(() => {
    const params: Record<string, string> = {};
    if (graphLevel !== 'root') params.level = graphLevel;
    if (graphActiveCategory) params.category = graphActiveCategory;
    if (graphSelectedEntity) params.entity = graphSelectedEntity;
    setSearchParams(params, { replace: true });
  }, [graphLevel, graphActiveCategory, graphSelectedEntity, setSearchParams]);

  // Resolve selected entity for the detail panel
  const selectedEntity = useMemo<{ node: GraphNode; category: string } | null>(() => {
    if (!graphSelectedEntity || !graphActiveCategory) return null;
    const nodes = graphData.nodes[graphActiveCategory] ?? [];
    const node = nodes.find(
      (n) => n.id === graphSelectedEntity || n.label === graphSelectedEntity
    );
    if (node) return { node, category: graphActiveCategory };
    // Fallback: search all categories
    for (const cat of Object.keys(graphData.nodes)) {
      const found = graphData.nodes[cat].find(
        (n) => n.id === graphSelectedEntity || n.label === graphSelectedEntity
      );
      if (found) return { node: found, category: cat };
    }
    return null;
  }, [graphSelectedEntity, graphActiveCategory, graphData]);

  // Navigate to a related entity (may be in a different category)
  const handleNavigateToRelated = (entityId: string) => {
    // Find which category this entity is in
    let targetCat: string | null = null;
    for (const cat of Object.keys(graphData.nodes)) {
      if (graphData.nodes[cat].some((n) => n.id === entityId)) {
        targetCat = cat;
        break;
      }
    }
    if (!targetCat) return;

    if (targetCat === graphActiveCategory) {
      // Same category — just open the entity
      openGraphEntity(entityId, targetCat);
    } else {
      // Different category — navigate to cluster first, then open entity after animation
      navigateGraph(targetCat);
      setTimeout(() => {
        openGraphEntity(entityId, targetCat!);
      }, 520);
    }
  };

  const handleCloseDetail = () => {
    closeGraphEntity();
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Graph area (full) */}
      <EntityGraph graphData={graphData} />

      {/* Detail panel — slides up from bottom inside the graph container */}
      {selectedEntity && (
        <EntityDetail
          entity={selectedEntity.node}
          entityCategory={selectedEntity.category}
          graphData={graphData}
          onNavigate={handleNavigateToRelated}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

/** Error boundary for graph loading errors */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Graph route error:', error);
  return <ErrorBoundaryContent message="An unexpected error occurred while loading the knowledge graph." />;
}
