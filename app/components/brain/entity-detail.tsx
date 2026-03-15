import { X } from 'lucide-react';
import { Badge } from '~/components/ui/badge';
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

/** Color palette per category (matches entity-graph.tsx) */
const CATEGORY_COLORS: Record<string, string> = {
  funds: '#9b6bc2',
  contacts: '#c278c4',
  documents: '#7bb8d9',
  workflows: '#6abf6e',
  systems: '#d4a646',
  entities: '#9e9ca3',
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
  const color = CATEGORY_COLORS[entityCategory] ?? '#888';

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
    <div className="flex h-full flex-col border-l border-border bg-background">
      {/* Header */}
      <div className="flex items-start gap-3 border-b border-border p-4">
        <div
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: color }}
        >
          <span className="text-sm">&#9670;</span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-foreground">
            {entity.label}
          </h3>
          <p className="text-xs text-muted-foreground">{entity.sub}</p>
          <Badge
            variant="outline"
            className="mt-1 text-[10px]"
            style={{ borderColor: color, color }}
          >
            {CATEGORY_LABELS[entityCategory] ?? entityCategory}
          </Badge>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Facts */}
      <div className="flex-1 overflow-y-auto p-4">
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Facts
        </h4>
        <div className="flex flex-col gap-1.5">
          {entity.facts.map((fact, i) => (
            <div key={i} className="flex gap-2 text-sm leading-relaxed text-foreground">
              <span className="mt-0.5 shrink-0 text-muted-foreground">&bull;</span>
              <span>{fact}</span>
            </div>
          ))}
        </div>

        {/* Related Entities */}
        {relatedNodes.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Related ({relatedNodes.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {relatedNodes.map(({ node, category }) => {
                const relColor = CATEGORY_COLORS[category] ?? '#888';
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => onNavigate(node.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium',
                      'transition-colors hover:bg-muted',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                      'border border-border bg-background text-foreground'
                    )}
                  >
                    <span
                      className="inline-block size-2 rounded-full"
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
