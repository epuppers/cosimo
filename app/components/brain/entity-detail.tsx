import { X } from 'lucide-react';
import type { GraphNode, GraphData } from '~/services/types';
import { cn } from '~/lib/utils';

// ============================================
// Entity Detail — Graph entity info panel
// ============================================

interface EntityDetailProps {
  entity: GraphNode;
  entityCategory: string;
  graphData: GraphData;
  onNavigate: (id: string) => void;
  onClose: () => void;
}

/** Category color tokens for the icon border — uses CSS custom properties */
const CATEGORY_CSS_COLORS: Record<string, string> = {
  funds: 'var(--violet-3)',
  contacts: 'var(--berry-3)',
  documents: 'var(--blue-3)',
  workflows: 'var(--green)',
  systems: 'var(--amber)',
  entities: 'var(--taupe-3)',
};

/** Category labels for badge display */
const CATEGORY_LABELS: Record<string, string> = {
  funds: 'Fund',
  contacts: 'Contact',
  documents: 'Document',
  workflows: 'Workflow',
  systems: 'System',
  entities: 'Entity',
};

/** Detail panel for a selected graph entity — shows name, type, facts, and related entities. */
export function EntityDetail({
  entity,
  entityCategory,
  graphData,
  onNavigate,
  onClose,
}: EntityDetailProps) {
  const color = CATEGORY_CSS_COLORS[entityCategory] ?? 'var(--taupe-3)';

  // Resolve related entities to full node data
  const relatedNodes = entity.related
    .map((relId) => {
      for (const cat of Object.keys(graphData.nodes)) {
        const node = graphData.nodes[cat].find((n) => n.id === relId);
        if (node) return { node, category: cat };
      }
      return null;
    })
    .filter(Boolean) as { node: GraphNode; category: string }[];

  return (
    <div className="graph-detail-pane open">
      {/* Resize handle */}
      <div className="graph-detail-resize" />

      {/* Header */}
      <div className="graph-detail-header">
        <div className="graph-detail-title-row">
          <div
            className="graph-detail-icon"
            style={{ borderColor: color, color }}
          >
            <span>&#9670;</span>
          </div>
          <div>
            <div className="graph-detail-name">{entity.label}</div>
            <div className="graph-detail-type label-mono">
              {CATEGORY_LABELS[entityCategory] ?? entityCategory}
            </div>
          </div>
        </div>
        <div className="graph-detail-actions">
          <button
            type="button"
            onClick={onClose}
            className="header-btn bevel"
            title="Close"
            aria-label="Close entity detail"
          >
            <X className="size-4" />
            <span className="a11y-label">Close</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="graph-detail-body">
        {/* Facts */}
        <div className="graph-detail-facts">
          {entity.facts.map((fact, i) => (
            <div key={i} className="graph-fact-row">
              <span className="graph-fact-bullet">&bull;</span>
              <span className="graph-fact-text">{fact}</span>
            </div>
          ))}
        </div>

        {/* Related Entities */}
        {relatedNodes.length > 0 && (
          <div>
            <div className="graph-detail-related-label">
              Related ({relatedNodes.length})
            </div>
            <div className="graph-detail-related">
              {relatedNodes.map(({ node, category }) => {
                const relColor = CATEGORY_CSS_COLORS[category] ?? 'var(--taupe-3)';
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => onNavigate(node.id)}
                    className="graph-related-pill"
                  >
                    <span
                      className="inline-block size-2 rounded-full mr-1.5"
                      style={{ backgroundColor: relColor }}
                    />
                    {node.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
