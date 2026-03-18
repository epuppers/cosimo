import { X } from 'lucide-react';
import { Button } from '~/components/ui/button';
import type { GraphNode, GraphData } from '~/services/types';
import { GRAPH_CATEGORY_COLORS, GRAPH_CATEGORY_LABELS } from '~/lib/brain-constants';

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

/** Detail panel for a selected graph entity — shows name, type, facts, and related entities. */
export function EntityDetail({
  entity,
  entityCategory,
  graphData,
  onNavigate,
  onClose,
}: EntityDetailProps) {
  const color = GRAPH_CATEGORY_COLORS[entityCategory] ?? 'var(--taupe-3)';

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
    <div className="absolute inset-x-0 bottom-0 h-[35%] min-h-[120px] max-h-[80%] bg-white dark:bg-surface-1 border-t-2 border-violet-3 rounded-tl-r-md rounded-tr-r-md flex flex-col z-[5] shadow-[0_-8px_30px_rgba(var(--black-rgb),0.3)] translate-y-0 transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none">
      {/* Resize handle */}
      <div className="absolute -top-1.5 inset-x-0 h-3 cursor-ns-resize z-[6] flex items-center justify-center after:content-[''] after:w-9 after:h-1 after:rounded-r-xs after:bg-taupe-2 after:transition-colors hover:after:bg-violet-3 dark:after:bg-taupe-3 dark:hover:after:bg-violet-2" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-taupe-1 dark:border-taupe-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div
            className="size-8 rounded-full flex items-center justify-center text-sm shrink-0 border-2 border-solid"
            style={{ borderColor: color, color }}
          >
            <span>&#9670;</span>
          </div>
          <div>
            <div className="font-mono text-[0.8125rem] font-bold text-taupe-5">{entity.label}</div>
            <div className="font-mono text-[0.625rem] uppercase tracking-[0.05em] text-taupe-3">
              {GRAPH_CATEGORY_LABELS[entityCategory] ?? entityCategory}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            className="px-1.5 py-1 flex items-center justify-center text-[0.6875rem] font-semibold text-taupe-4 bg-off-white border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 cursor-pointer rounded-[var(--r-md)] hover:bg-berry-1 hover:text-berry-5 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:border-taupe-2 dark:hover:text-berry-3 dark:hover:bg-berry-1 [&_svg]:block [[data-a11y-labels=show]_&]:w-auto [[data-a11y-labels=show]_&]:h-7 [[data-a11y-labels=show]_&]:px-2"
            onClick={onClose}
            title="Close"
            aria-label="Close entity detail"
          >
            <X className="size-4 [[data-a11y-labels=show]_&]:hidden" />
            <span className="hidden [[data-a11y-labels=show]_&]:inline font-[family-name:var(--mono)] font-semibold text-[0.625rem] tracking-[0.03em] whitespace-nowrap">Close</span>
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Facts */}
        <div className="flex flex-col gap-1 mb-3">
          {entity.facts.map((fact, i) => (
            <div key={i} className="flex items-start gap-2 px-2.5 py-1.5 bg-off-white dark:bg-surface-2 border border-taupe-1 dark:border-taupe-3 rounded-r-md font-sans text-[0.6875rem] text-taupe-4 dark:text-taupe-3 leading-relaxed transition-colors hover:border-taupe-2">
              <span className="text-taupe-2 shrink-0 leading-relaxed">&bull;</span>
              <span className="flex-1">{fact}</span>
            </div>
          ))}
        </div>

        {/* Related Entities */}
        {relatedNodes.length > 0 && (
          <div>
            <div className="font-mono text-[0.625rem] font-bold text-taupe-3 uppercase tracking-wide mb-1.5">
              Related ({relatedNodes.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {relatedNodes.map(({ node, category }) => {
                const relColor = GRAPH_CATEGORY_COLORS[category] ?? 'var(--taupe-3)';
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => onNavigate(node.id)}
                    className="font-mono text-[0.625rem] font-semibold px-2 py-0.5 border border-taupe-2 dark:border-taupe-3 rounded-r-md bg-white dark:bg-surface-2 text-taupe-4 dark:text-taupe-3 cursor-pointer transition-all hover:border-violet-2 hover:text-violet-3 hover:bg-violet-1 dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] dark:hover:border-violet-2 dark:hover:text-violet-2"
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
