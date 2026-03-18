import { useState } from 'react';
import { useNavigate } from 'react-router';
import { MoreHorizontal, Pencil, Trash2, User, Building, FileText, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import type { MemoryFact as MemoryFactType, LinkedEntity } from '~/services/types';
import { ConfirmDialog } from '~/components/ui/confirm-dialog';
import { cn } from '~/lib/utils';
import { MEMORY_CATEGORY_STYLES } from '~/lib/brain-constants';

const CATEGORY_BORDER_COLOR: Record<string, string> = {
  preference: 'var(--berry-3)',
  workflow: 'var(--green)',
  contact: 'var(--blue-3)',
  fund: 'var(--violet-3)',
  style: 'var(--amber)',
  context: 'var(--taupe-3)',
};

interface MemoryFactProps {
  fact: MemoryFactType;
  onEntityClick?: (name: string) => void;
}

/** Renders the icon for a linked entity based on its type. */
function EntityIcon({ type }: { type: string }) {
  const cls = 'size-3';
  switch (type) {
    case 'person':
      return <User className={cls} />;
    case 'fund':
      return <Landmark className={cls} />;
    case 'document':
      return <FileText className={cls} />;
    default:
      return <Building className={cls} />;
  }
}

/** A single memory fact card with category badge, entity chips, and edit/delete actions. */
export function MemoryFactCard({ fact, onEntityClick }: MemoryFactProps) {
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) return null;

  const handleEntityClick = (entity: LinkedEntity) => {
    if (onEntityClick) {
      onEntityClick(entity.name);
    }
    navigate(`/brain/graph?entity=${encodeURIComponent(entity.name)}`);
  };

  const handleConfirmDelete = () => {
    setIsDeleted(true);
    toast('Memory deleted');
  };

  return (
    <div
      className="group bg-white border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 border-l-[3px] rounded-r-md px-3.5 py-2.5 transition-colors duration-150 hover:border-t-taupe-3 hover:border-l-taupe-3 hover:border-b-taupe-4 hover:border-r-taupe-4 dark:bg-surface-1 dark:border-taupe-3 dark:hover:border-taupe-4"
      style={{ borderLeftColor: CATEGORY_BORDER_COLOR[fact.category] }}
    >
      {/* Top row: category badge + menu */}
      <div className="flex items-center justify-between mb-1.5 relative">
        <span
          className={cn(
            'font-[family-name:var(--mono)] text-[10px] font-bold uppercase tracking-[0.06em] rounded-[var(--r-md)] px-[7px] py-[2px]',
            MEMORY_CATEGORY_STYLES[fact.category] || MEMORY_CATEGORY_STYLES.context
          )}
        >
          {fact.category}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="mem-fact-menu-btn bg-transparent border-none text-taupe-2 cursor-pointer px-1 py-0.5 transition-colors duration-100 opacity-0 group-hover:opacity-100 group-hover:text-taupe-3 hover:text-taupe-5 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-3 rounded p-1"
            aria-label="Memory menu"
          >
            <MoreHorizontal className="size-4" />
            <span className="a11y-label">Menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom">
            <DropdownMenuItem>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Fact text */}
      <p className="font-sans text-xs leading-relaxed text-taupe-5 mb-1.5">{fact.text}</p>

      {/* Entity chips */}
      {fact.linkedEntities && fact.linkedEntities.length > 0 && (
        <div className="mt-1.5 mb-1.5 flex flex-wrap gap-1">
          {fact.linkedEntities.map((entity) => (
            <button
              key={entity.name}
              type="button"
              onClick={() => handleEntityClick(entity)}
              className="mem-entity-chip inline-flex items-center gap-1 px-[7px] py-0.5 pl-[5px] font-mono text-[0.625rem] text-taupe-4 bg-off-white border border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-r-pill cursor-pointer transition-all duration-100 hover:bg-violet-1 hover:border-violet-2 hover:border-r-violet-3 hover:border-b-violet-3 hover:text-violet-4 active:bg-violet-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1 dark:bg-[rgba(0,0,0,0.15)] dark:border-taupe-3 dark:text-taupe-3 dark:hover:bg-[rgba(var(--violet-3-rgb),0.15)] dark:hover:text-violet-2 dark:hover:border-violet-3"
            >
              <EntityIcon type={entity.type} />
              {entity.name}
            </button>
          ))}
        </div>
      )}

      {/* Meta row: source + date */}
      <div className="flex justify-between items-center">
        {fact.source && (
          <span className="font-mono text-[0.625rem] text-taupe-2">{fact.source}</span>
        )}
        {fact.date && (
          <span className="font-mono text-[0.625rem] text-taupe-2">{fact.date}</span>
        )}
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete this memory?"
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
