// ============================================
// Brain Graph Route — entity knowledge graph
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouteError } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { getGraphData } from '~/services/brain';
import { EntityGraph } from '~/components/brain/entity-graph';
import { EntityDetail } from '~/components/brain/entity-detail';
import type { GraphNode } from '~/services/types';
import type { Route } from './+types/_app.brain.graph';

/** Loads graph data for the entity graph visualization. */
export async function loader() {
  const graphData = await getGraphData();
  return { graphData };
}

/** Brain Graph route — renders entity graph SVG with optional detail panel. */
export default function BrainGraphRoute({ loaderData }: Route.ComponentProps) {
  const { graphData } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const entityParam = searchParams.get('entity');

  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    entityParam
  );

  // Sync URL param to state on mount/change
  useEffect(() => {
    if (entityParam) {
      setSelectedEntityId(entityParam);
    }
  }, [entityParam]);

  // Resolve selected entity node and its category (supports both ID and label lookup)
  const selectedEntity = useMemo<{ node: GraphNode; category: string } | null>(() => {
    if (!selectedEntityId) return null;
    for (const cat of Object.keys(graphData.nodes)) {
      const node = graphData.nodes[cat].find(
        (n) => n.id === selectedEntityId || n.label === selectedEntityId
      );
      if (node) return { node, category: cat };
    }
    return null;
  }, [selectedEntityId, graphData]);

  const handleSelectEntity = (id: string) => {
    setSelectedEntityId(id);
    setSearchParams({ entity: id }, { replace: true });
  };

  const handleNavigateToRelated = (id: string) => {
    handleSelectEntity(id);
  };

  const handleCloseDetail = () => {
    setSelectedEntityId(null);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="flex h-full">
      {/* Graph area */}
      <div className="flex-1 overflow-hidden">
        <EntityGraph
          graphData={graphData}
          selectedEntityId={selectedEntityId}
          onSelectEntity={handleSelectEntity}
        />
      </div>

      {/* Detail panel */}
      {selectedEntity && (
        <div className="w-80 shrink-0 overflow-y-auto">
          <EntityDetail
            entity={selectedEntity.node}
            entityCategory={selectedEntity.category}
            graphData={graphData}
            onNavigate={handleNavigateToRelated}
            onClose={handleCloseDetail}
          />
        </div>
      )}
    </div>
  );
}

/** Error boundary for graph loading errors */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Graph route error:', error);

  return (
    <div className="flex h-full items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          An unexpected error occurred while loading the knowledge graph.
        </AlertDescription>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </Alert>
    </div>
  );
}

/** Loading skeleton — graph area + detail panel */
export function HydrateFallback() {
  return (
    <div className="flex h-full">
      {/* Graph area skeleton */}
      <div className="flex-1 overflow-hidden p-6">
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
      {/* Detail panel skeleton */}
      <div className="w-80 shrink-0 space-y-4 border-l border-border p-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}
