import { useBrainStore } from '~/stores/brain-store';
import type { GraphData } from '~/services/types';

// ============================================
// Graph Breadcrumb — You > Category > Entity
// ============================================

interface GraphBreadcrumbProps {
  graphData: GraphData;
}

/** Breadcrumb navigation for the entity graph drill-down. */
export function GraphBreadcrumb({ graphData }: GraphBreadcrumbProps) {
  const { graphLevel, graphActiveCategory, graphSelectedEntity, navigateGraph } =
    useBrainStore();

  // Resolve category label
  const categoryLabel = graphActiveCategory
    ? graphData.categories.find((c) => c.id === graphActiveCategory)?.label ?? graphActiveCategory
    : null;

  // Resolve entity label
  let entityLabel: string | null = null;
  if (graphSelectedEntity && graphActiveCategory) {
    const nodes = graphData.nodes[graphActiveCategory] ?? [];
    const node = nodes.find((n) => n.id === graphSelectedEntity);
    entityLabel = node?.label ?? graphSelectedEntity;
  }

  return (
    <nav className="graph-breadcrumb" aria-label="Graph navigation">
      <button
        type="button"
        className={`graph-crumb ${graphLevel === 'root' ? 'active' : ''}`}
        onClick={() => navigateGraph('root')}
        data-nav="root"
      >
        You
      </button>

      {(graphLevel === 'cluster' || graphLevel === 'entity') && categoryLabel && (
        <>
          <span className="graph-crumb-sep" aria-hidden="true">
            &rsaquo;
          </span>
          <button
            type="button"
            className={`graph-crumb ${graphLevel === 'cluster' ? 'active' : ''}`}
            onClick={() => navigateGraph(graphActiveCategory!)}
            data-nav={graphActiveCategory}
          >
            {categoryLabel}
          </button>
        </>
      )}

      {graphLevel === 'entity' && entityLabel && (
        <>
          <span className="graph-crumb-sep" aria-hidden="true">
            &rsaquo;
          </span>
          <span className="graph-crumb active">{entityLabel}</span>
        </>
      )}
    </nav>
  );
}
