// ============================================
// CloudSourceTree — Left rail provider/source navigation
// ============================================
// Renders a grouped tree of cloud sources by provider.
// Used inside the FilePanel cloud tab.

import { cn } from '~/lib/utils';
import type { CloudSource } from '~/services/types';

// ============================================
// PROPS
// ============================================

interface CloudSourceTreeProps {
  /** Cloud sources grouped by provider */
  sources: CloudSource[];
  /** Currently selected source ID */
  activeSourceId: string | null;
  /** Callback when a source is selected */
  onSelectSource: (sourceId: string) => void;
}

// ============================================
// COMPONENT
// ============================================

/** CloudSourceTree — left rail provider/source navigation tree. */
export function CloudSourceTree({ sources, activeSourceId, onSelectSource }: CloudSourceTreeProps) {
  return (
    <nav data-slot="cloud-source-tree" className="py-1.5">
      {sources.map((root) => (
        <div key={root.id} className="mb-2">
          {/* Provider header */}
          <div
            className={cn(
              'px-2.5 py-1 font-[family-name:var(--mono)] text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-taupe-3 dark:text-taupe-3 border-l-[3px]',
              root.provider === 'sharepoint' && 'border-l-violet-3',
              root.provider === 'google-drive' && 'border-l-blue-3'
            )}
          >
            {root.provider === 'sharepoint' ? 'SHAREPOINT' : 'GOOGLE'}
          </div>

          {/* Source items */}
          {root.children?.map((source) => (
            <div key={source.id}>
              {/* Parent source (site / root) */}
              <SourceItem
                source={source}
                isActive={activeSourceId === source.id}
                onSelect={onSelectSource}
                depth={0}
              />

              {/* Nested children (libraries / shared folders) */}
              {source.children?.map((child) => (
                <SourceItem
                  key={child.id}
                  source={child}
                  isActive={activeSourceId === child.id}
                  onSelect={onSelectSource}
                  depth={1}
                />
              ))}
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
}

// ============================================
// SOURCE ITEM
// ============================================

interface SourceItemProps {
  source: CloudSource;
  isActive: boolean;
  onSelect: (sourceId: string) => void;
  depth: number;
}

/** A single clickable source item in the tree. */
function SourceItem({ source, isActive, onSelect, depth }: SourceItemProps) {
  const hasChildren = source.children && source.children.length > 0;

  return (
    <button
      data-slot="cloud-source-item"
      className={cn(
        'w-full text-left px-2.5 py-1 font-[family-name:var(--mono)] text-[0.6875rem] cursor-pointer transition-[color,background] duration-150 flex items-center gap-1.5 border-none bg-transparent',
        'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-[-2px]',
        depth === 0 && 'pl-3.5',
        depth === 1 && 'pl-6',
        isActive && 'bg-berry-1 text-berry-5 dark:bg-[rgba(var(--violet-3-rgb),0.08)] dark:text-violet-3',
        !isActive && 'text-taupe-4 dark:text-taupe-3 hover:bg-off-white hover:text-taupe-5 dark:hover:bg-surface-2 dark:hover:text-taupe-4'
      )}
      onClick={() => onSelect(source.id)}
    >
      {hasChildren && (
        <span className="text-[0.5rem] text-taupe-3 dark:text-taupe-3 shrink-0">●</span>
      )}
      <span className="truncate">{source.label}</span>
    </button>
  );
}
